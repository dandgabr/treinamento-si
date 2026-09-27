// @vitest-environment jsdom
//
// A rota com ancora tem de ABRIR no alvo, e não no topo da tela.
//
// O único link ancorado do material é `[01 Fundamentos](../01-fundamentos/README.md#4-temas)`, e
// `links-material` o transforma em `#/area/01-fundamentos/secao-4`. A tela lia os dois primeiros
// segmentos e descartava o resto: a área abria em `scrollY: 0`, com a seção 4 a milhares de pixels
// de distância, e a promessa do link morria no clique. O que se confere aqui é o EFEITO — o foco
// (e a rolagem, que o `scrollIntoView` do jsdom não faz) indo para o `id` que a própria tela monta
// (`idDaSecao`, em `Blocos.tsx`), e não o `href` existir no HTML.
//
// O conteúdo é o de verdade (o mesmo `content.json` da tela) e a rota entra pelo `hash`, que é o
// canal do app: é o caminho de quem abre um link compartilhado. O provedor de persistência é
// trocado para a tela não escrever no armazenamento de quem roda a suíte.
//
// DOIS cuidados que este arquivo aprendeu pagando caro:
//
//   1. asserção por AUSÊNCIA não prova nada. Dois testes daqui afirmavam `activeElement === body`
//      ("nenhum foco em lugar nenhum") — que é exatamente o estado observável de uma âncora que
//      EXISTE e não recebe o foco. Eles passavam com o `secao-3` torto (o `id` no `<section>` e o
//      `tabIndex` no `<h2>` de dentro: `focus()` é no-op em elemento não focável, e `irParaSecao`
//      devolvia `true` — o recuo do `focarConteudo` era pulado). Aqui o que se afirma é onde o foco
//      ESTÁ, e sempre que a rota muda;
//   2. o tema do SISTEMA é um caminho próprio. `escuro` não vem só do botão do topo: no modo
//      "sistema" quem responde é o `matchMedia`, e é a troca dele que remontava o material inteiro
//      (a `key` das seções incluía o tema) — o `activeElement` caía para o `body` a cada anoitecer.
//      O `matchMedia` abaixo é controlado pelo teste justamente para medir esse caminho.

import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Conteudo } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz. O que ele desenha não é medido
// aqui: o que se mede é QUEM o React remonta quando o tema troca (a preparação em si tem teste
// próprio, `mermaid.test.tsx`, com DOM de entrada).
vi.mock('./mermaid', () => ({
  renderizarMermaid: () => Promise.resolve(),
  prepararDiagramas: () => {},
}))

const compartilhado = vi.hoisted(() => ({ provedor: null as Persistencia | null }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  // O store resolve o provedor na IMPORTAÇÃO: o teste arma o provedor de mentira antes de importar
  // (`abrir`, abaixo). Sem ele armado, é melhor estourar aqui do que deixar a suíte escrever no
  // armazenamento de quem roda.
  persistencia: (): Persistencia => {
    if (!compartilhado.provedor) throw new Error('o provedor de teste não foi armado')
    return compartilhado.provedor
  },
}))

/** Provedor de mentira: nada guardado, nada gravado — a rolagem não depende dele. */
function provedorDeTeste(): Persistencia {
  return {
    descricao: 'num provedor de teste',
    carregar: () => Promise.resolve(null),
    gravar: () => Promise.resolve(),
    apagar: () => Promise.resolve(),
    exportar: () => Promise.resolve({ estado: 'ok' }),
    importar: () => Promise.resolve({ estado: 'cancelado' }),
  }
}

/**
 * A preferência de tema do SISTEMA, controlada pelo teste.
 *
 * O jsdom não tem tema de sistema: `matchMedia` é um dublê, e é este objeto que diz o que ele
 * responde e que dispara a troca para os ouvintes que o `App` registrou.
 */
const sistema = vi.hoisted(() => ({
  escuro: false,
  ouvintes: [] as EventListener[],
}))

function instalarMatchMedia(): void {
  window.matchMedia = (consulta: string): MediaQueryList => ({
    matches: consulta.includes('dark') ? sistema.escuro : false,
    media: consulta,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_tipo: string, ouvinte: EventListenerOrEventListenerObject | null) => {
      if (typeof ouvinte === 'function') sistema.ouvintes.push(ouvinte)
    },
    removeEventListener: (_tipo: string, ouvinte: EventListenerOrEventListenerObject | null) => {
      sistema.ouvintes = sistema.ouvintes.filter((registrado) => registrado !== ouvinte)
    },
    dispatchEvent: () => true,
  })
}

/**
 * O sistema troca de tema, como trocaria ao anoitecer: o `matches` vira `true` e os ouvintes do
 * `App` são chamados. Devolve quando o React terminou de re-renderizar.
 */
async function sistemaEscureceu(): Promise<void> {
  await act(async () => {
    sistema.escuro = true
    for (const ouvinte of [...sistema.ouvintes]) {
      ouvinte({ matches: true } as MediaQueryListEvent)
    }
  })
}

/**
 * Monta o app na rota pedida.
 *
 * `vi.resetModules()` porque o store resolve o provedor e dispara a carga UMA vez, na importação;
 * o `hash` é trocado antes da renderização, como quem chega pelo link.
 *
 * `preservarTema` existe para o caminho da ESCOLHA GUARDADA: o app lê `roadmap:tema` na montagem
 * (`temaGuardado`), e a prova de que ele volta com a escolha de quem já usou o app precisa de uma
 * montagem que NÃO limpe o armazenamento.
 */
async function abrir(hash: string, opcoes: { preservarTema?: boolean } = {}): Promise<Conteudo> {
  compartilhado.provedor = provedorDeTeste()
  sistema.escuro = false
  sistema.ouvintes = []
  if (!opcoes.preservarTema) localStorage.clear()
  vi.resetModules()
  window.location.hash = hash
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const { App } = await import('./App')
  render(<App />)
  return repositorio.content
}

/** Navega para outra rota pelo canal do app (o `hashchange`), dentro do `act`. */
async function irParaRota(hash: string): Promise<void> {
  await act(async () => {
    window.location.hash = hash
    window.dispatchEvent(new Event('hashchange'))
  })
}

const AREA = '01-fundamentos'
/** O número da seção 4 do guia: é ele que `README.md#4-temas` endereça. */
const SECAO = 4
/** O tema cujo pré-teste é a seção 3 — a única âncora que existia e não recebia foco. */
const TEMA = '01-fundamentos#TEMA-01'
/** O tema do mesmo guia SEM diagrama nenhum: nele a troca de tema não tem o que redesenhar. */
const TEMA_SEM_DIAGRAMA = '01-fundamentos#TEMA-04'

/** A rota do tema no formato que o app usa (`linkTema`). */
function rotaDoTema(ref: string, ancora?: string): string {
  const [areaId, temaId] = ref.split('#')
  return `#/tema/${areaId}/${temaId}${ancora ? `/${ancora}` : ''}`
}

beforeAll(() => {
  // O jsdom não implementa `scrollIntoView` nem `matchMedia` (que o App lê para o tema do
  // sistema), e o `scrollTo` dele só registra "não implementado". O foco, que é o que este teste
  // mede, o jsdom faz de verdade.
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
  instalarMatchMedia()
})

beforeEach(() => {
  sistema.escuro = false
  sistema.ouvintes = []
})

afterEach(cleanup)

describe('rota com ancora', () => {
  it('abre a área na seção que o endereço pede, e não no topo', async () => {
    const conteudo = await abrir(`#/area/${AREA}/secao-${SECAO}`)
    const alvo = document.getElementById(`secao-${SECAO}`)

    // A seção do material está na tela: o texto é o do guia, e não uma frase do app.
    const secaoDoMaterial = conteudo.areas
      .find((a) => a.areaId === AREA)
      ?.guia.secoes.find((s) => s.numero === SECAO)
    expect(secaoDoMaterial).toBeTruthy()
    expect(alvo?.tagName).toBe('H2')
    expect(alvo?.textContent).toContain(secaoDoMaterial?.titulo)

    // E é ELA que recebeu o foco. Sem ler o último segmento da rota (ou sem o App honrá-lo), o
    // foco fica no `body` e a seção 4 abre a milhares de pixels do topo — este `expect` é a
    // diferença entre o endereço existir e o endereço FUNCIONAR.
    expect(document.activeElement).toBe(alvo)
  })

  it('abre o tema no pré-teste quando o endereço termina em secao-3', async () => {
    // A seção 3 do tema não é material: é o bloco do app (`PreTeste`), e era a única âncora com o
    // `id` no `<section>` e o `tabIndex` no `<h2>` de dentro. O `focus()` num elemento não focável
    // é no-op, `irParaSecao` devolvia `true` e o foco ficava onde estava — a asserção por ausência
    // que existia aqui ("nada foi focado") era indistinguível desse defeito.
    await abrir(rotaDoTema(TEMA, 'secao-3'))
    const alvo = document.getElementById('secao-3')

    expect(alvo?.tagName).toBe('H2')
    expect(alvo?.textContent).toContain('Pré-teste')
    expect(document.activeElement).toBe(alvo)
  })

  it('e o item 3 do sumário leva o foco ao mesmo título', async () => {
    // O caminho do clique: o botão do sumário não tem `href` (o fragmento da URL pertence à rota),
    // então quem move o foco é `irParaSecao` — a mesma função do endereço acima.
    await abrir(rotaDoTema(TEMA))
    const botao = [...document.querySelectorAll<HTMLButtonElement>('.sumario button')].find(
      (b) => b.textContent === '3.Pré-teste',
    )
    expect(botao).toBeTruthy()

    await act(async () => botao?.click())

    const alvo = document.getElementById('secao-3')
    expect(alvo?.tagName).toBe('H2')
    // O foco saiu do botão do sumário e entrou no título: `activeElement` ser o `h2` é o que prova
    // que o alvo EXISTE e é focável — no `<section>` sem `tabindex` ele continuava sendo o botão.
    expect(document.activeElement).toBe(alvo)
  })

  it('não engole o foco do usuário quando a âncora não existe na tela', async () => {
    await abrir(`#/area/${AREA}`)
    // Uma rota COM âncora que não existe na tela: `irParaSecao` devolve `false` e o recuo
    // (`focarConteudo`) leva o foco ao `main` do conteúdo novo. Sem este recuo, quem digitou o
    // endereço errado ficava no cabeçalho da tela anterior — e é o mesmo recuo que o `secao-3`
    // torto pulava, porque a função mentia que tinha achado um alvo focável.
    await irParaRota(`#/area/${AREA}/secao-99`)
    expect(document.activeElement).toBe(document.querySelector('main'))
  })

  it('leva o foco ao conteúdo na troca de rota sem âncora', async () => {
    await abrir('#/')
    // Nenhum alvo pedido: nada é focado na montagem (quem abre o app no meio de um tema escolheu
    // aquela tela). Na TROCA de rota o foco vai para o `main`, senão o primeiro TAB daria a volta
    // pelo cabeçalho da tela anterior. Afirmar o `body` aqui não provaria nada: é o estado inicial.
    await irParaRota(`#/area/${AREA}`)
    const principal = document.querySelector('main')
    expect(principal?.textContent).toContain(
      (await import('../infrastructure/content/repository')).content.areas.find(
        (a) => a.areaId === AREA,
      )?.areaNome ?? '',
    )
    expect(document.activeElement).toBe(principal)
  })
})

describe('troca do tema do sistema', () => {
  /** Os `h2` das seções na tela, na ordem — a identidade de cada nó é o que se compara. */
  function titulosDasSecoes(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>('.secao h2[id^="secao-"]')]
  }

  it('não remonta o material de uma vista sem diagrama nenhum', async () => {
    await abrir(rotaDoTema(TEMA_SEM_DIAGRAMA))
    const antes = titulosDasSecoes()
    // As 14 seções do tema estão na tela (a 3 é o pré-teste e a 10 a recuperação ativa).
    expect(antes).toHaveLength(14)
    // A premissa da restrição, conferida aqui: nesta vista não há diagrama NENHUM para redesenhar.
    // (No material inteiro são 80 das 149 vistas assim — nelas a remontagem só custava o DOM.)
    expect(document.querySelectorAll('.mermaid')).toHaveLength(0)

    // O foco num alvo do material — o estado que o achado descreve caindo para o `body`.
    const alvo = document.getElementById('secao-4')
    expect(alvo).toBeTruthy()
    alvo?.focus()
    expect(document.activeElement).toBe(alvo)

    await sistemaEscureceu()

    // Os MESMOS nós: onde não há diagrama, a troca de tema não tem o que redesenhar, e a `key` da
    // seção passou a não mudar com o tema. Com a `key` antiga (`${numero}-${escuro}`) o React
    // remontava as 14, o foco caía para o `body` e o próximo TAB recomeçava do "Pular para o
    // conteúdo" — a cada troca de tema do sistema.
    const depois = titulosDasSecoes()
    expect(depois).toHaveLength(14)
    for (const [i, no] of depois.entries()) expect(no).toBe(antes[i])
    expect(document.activeElement).toBe(alvo)
  })

  it('remonta a seção do diagrama e preserva as outras — com o foco no lugar', async () => {
    // A seção 5 do TEMA-01 é a única com diagrama; a 4 não tem nenhum.
    await abrir(rotaDoTema(TEMA))
    const secaoComDiagrama = document.getElementById('secao-5')
    const secaoSemDiagrama = document.getElementById('secao-4')
    expect(secaoComDiagrama).toBeTruthy()
    expect(secaoSemDiagrama).toBeTruthy()
    expect(document.querySelectorAll('.mermaid').length).toBeGreaterThan(0)
    // O nó do diagrama da seção 5 (o `id` do alvo vive no `h2`, e o desenho no bloco irmão dele —
    // por isso a busca sai do `h2` para a seção em volta, e é refeita do zero depois da troca).
    const blocoDoDiagrama = (): Element | null =>
      document.getElementById('secao-5')?.parentElement?.querySelector('.mermaid') ?? null
    const desenhoAntes = blocoDoDiagrama()
    expect(desenhoAntes).toBeTruthy()
    secaoSemDiagrama?.focus()

    await sistemaEscureceu()

    // A seção do diagrama é remontada: HTML novo é o que o Mermaid precisa para redesenhar com as
    // cores do tema novo (ele marca os nós com `data-processed` e pula os já processados).
    expect(document.getElementById('secao-5')).not.toBe(secaoComDiagrama)
    // E é o NÓ do diagrama que sai e volta, e não só o título: o texto original do diagrama está lá
    // de novo para o Mermaid processar. É esta a metade que a restrição da `key` não podia quebrar.
    expect(blocoDoDiagrama()).toBeTruthy()
    expect(blocoDoDiagrama()).not.toBe(desenhoAntes)
    // E a seção ao lado é a MESMA — a restrição da `key` vale por trecho, não por vista.
    expect(document.getElementById('secao-4')).toBe(secaoSemDiagrama)
    expect(document.activeElement).toBe(secaoSemDiagrama)
  })
})

/**
 * As rotas que não tinham NENHUM teste pelo `App`: só a de área/tema com âncora era exercitada.
 *
 * O que se mede aqui é a promessa de cada endereço — a tela que abre, o título da janela (que é o
 * que nomeia a aba) e, nos endereços que não existem, o caminho de volta. O `#/pagina/...` é o
 * único lugar onde o app decide entre três desenhos diferentes de página (seções numeradas do
 * material, cabeçalhos do intro, tabela de verbetes do glossário), e essa escolha não tinha prova.
 */
describe('as rotas do app', () => {
  /** O botão do topo que troca o tema, pelo rótulo que ele publica. */
  function botaoDoTema(): HTMLButtonElement {
    return [...document.querySelectorAll('button')].find((b) =>
      b.getAttribute('aria-label')?.startsWith('Tema:'),
    ) as HTMLButtonElement
  }

  it('abre uma página com seções numeradas, com o sumário do material', async () => {
    const conteudo = await abrir('#/pagina/90-certificacoes/01-comptia')
    const pagina = conteudo.paginas.find((p) => p.slug === '90-certificacoes/01-comptia')
    expect(pagina).toBeTruthy()

    // O título e a trilha de navegação são os da página, e o `<title>` da janela é o dela com o
    // nome do app — é isso que evita a lista de abas com 22 títulos repetidos.
    expect(document.querySelector('h1')?.textContent).toBe(pagina?.titulo)
    expect(document.querySelector('.migalhas')?.textContent).toContain(pagina?.titulo ?? '')
    expect(document.title).toBe(`${pagina?.titulo} · Roadmap CISO`)

    // Página com seções numeradas: o sumário sai delas, e a seção 1 existe na tela com o título
    // do material (e não com o texto do app).
    const itensDoSumario = [...document.querySelectorAll('.sumario button')]
    expect(itensDoSumario).toHaveLength(pagina?.secoes.length ?? 0)
    const primeira = pagina?.secoes[0]
    expect(document.getElementById('secao-1')?.textContent).toContain(primeira?.titulo ?? '')
  })

  it('a página sem seções numeradas ganha o sumário dos próprios cabeçalhos do intro', async () => {
    const conteudo = await abrir('#/pagina/mapa-relacoes')
    const pagina = conteudo.paginas.find((p) => p.slug === 'mapa-relacoes')
    expect(pagina).toBeTruthy()

    // O material que cai inteiro no `intro` (mapa de relações) não tem `## N.`: o índice sai dos
    // `h2`/`h3` do próprio HTML, com id `intro-N` — e o `h1` continua sendo o do material.
    expect(pagina?.secoes).toHaveLength(0)
    const cabecalhos = [...document.querySelectorAll('h2[id^="intro-"], h3[id^="intro-"]')]
    expect(cabecalhos.length).toBeGreaterThanOrEqual(2)
    expect([...document.querySelectorAll('.sumario button')]).toHaveLength(cabecalhos.length)
    // O `tabIndex` negativo é o que deixa o cabeçalho receber foco sem virar parada de tabulação:
    // é o alvo do botão do sumário.
    expect(cabecalhos[0]?.getAttribute('tabindex')).toBe('-1')
  })

  it('o glossário vira a tela navegável, e não a tabela crua do material', async () => {
    await abrir('#/pagina/glossario')

    // A busca com rótulo de verdade (e não `placeholder`) é a marca da tela do glossário: a tabela
    // crua do material não tem campo nenhum.
    const busca = document.querySelector<HTMLInputElement>('.busca-glossario input')
    expect(busca).toBeTruthy()
    expect(document.querySelector('label[for="' + busca?.id + '"]')?.textContent).toBe('Buscar termo')

    // E cada verbete ganhou id e endereço próprios: o termo tem `id` que a rota usa como âncora.
    const verbete = document.getElementById('termo-tls')
    expect(verbete?.tagName).toBe('TR')
  })

  it('a página de trilha traz o diagnóstico e o checklist, e o índice alcança os dois', async () => {
    const conteudo = await abrir('#/pagina/91-trilhas/plano-12-meses')
    const pagina = conteudo.paginas.find((p) => p.slug === '91-trilhas/plano-12-meses')
    const diagnostico = pagina?.trilha?.diagnostico
    expect(diagnostico).toBeTruthy()

    // O diagnóstico volta para DENTRO da seção de onde a extração o tirou (a seção 1 do material),
    // e não para o fim da página: o bloco é o IRMÃO seguinte da seção, no mesmo lugar do texto.
    const secaoDoDiagnostico = document.getElementById(`secao-${diagnostico?.secao}`)
    const blocoDoDiagnostico = document.querySelector('.bloco-diagnostico')
    expect(secaoDoDiagnostico).toBeTruthy()
    expect(blocoDoDiagnostico).toBeTruthy()
    expect(secaoDoDiagnostico?.parentElement?.nextElementSibling).toBe(blocoDoDiagnostico)

    // O checklist é bloco do APP, e não seção do material: sem a entrada que o `App` acrescenta ao
    // índice (`itens.push`), ele ficaria no fim da página sem caminho até ele.
    const itemDoChecklist = [...document.querySelectorAll('.sumario button')].find(
      (b) => b.textContent === 'Checklist da trilha',
    )
    expect(itemDoChecklist).toBeTruthy()
    expect(document.getElementById('checklist-da-trilha')?.tagName).toBe('H2')

    // E o clique do índice leva o foco ao checklist — a entrada existe E funciona.
    await act(async () => (itemDoChecklist as HTMLButtonElement).click())
    expect(document.activeElement).toBe(document.getElementById('checklist-da-trilha'))
  })

  it('a rota do quiz abre a rodada do escopo, e o título nomeia o escopo', async () => {
    const conteudo = await abrir('#/quiz')
    // `#/quiz` sem escopo: o título é o genérico, e a rodada é a do banco inteiro (10 por rodada).
    expect(document.querySelector('h1')?.textContent).toBe('Quiz de múltipla escolha')
    expect(document.title).toBe('Quiz de múltipla escolha · Roadmap CISO')
    // A rodada só nasce depois de a leitura do banco voltar (o `useBanco` de verdade, aqui — o
    // `Quiz.test.tsx` o troca por dublê): a espera é pela primeira questão, e não por um tick.
    await waitFor(() =>
      expect(document.querySelector('.bloco-questao h2')?.textContent).toContain('de 10'),
    )

    // Com área e tema na rota, o título é o do TEMA (e não o da área), e a trilha de navegação
    // traz o caminho de volta ao tema e à área.
    const tema = conteudo.temas[`${AREA}#TEMA-01`]
    await irParaRota(`#/quiz/${AREA}/TEMA-01`)
    await waitFor(() =>
      expect(document.querySelector('h1')?.textContent).toBe(`Quiz — ${tema?.titulo}`),
    )
    expect(document.title).toBe(`Quiz — ${tema?.titulo} · Roadmap CISO`)
    expect(
      [...document.querySelectorAll('.migalhas a')].map((a) => a.getAttribute('href')),
    ).toContain(`#/tema/${AREA}/TEMA-01`)
  })

  it('uma rota que não existe diz isso, em vez de abrir a tela em branco', async () => {
    await abrir('#/nao-existe')

    expect(document.querySelector('main')?.textContent).toContain('Rota não reconhecida.')
    expect(
      [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')),
    ).toContain('#/')
    expect(document.title).toBe('Rota não reconhecida · Roadmap CISO')
    // Nenhuma das telas de conteúdo foi montada: o `main` é o do aviso, e não o de uma vista.
    expect(document.querySelector('.tela-quiz')).toBeNull()
    expect(document.querySelector('.cabecalho-tema')).toBeNull()
  })

  it('um endereço que não existe nomeia o que faltou no título e na tela', async () => {
    // Área inexistente: o título diz "Área não encontrada" e a tela diz QUAL endereço foi pedido.
    await abrir('#/area/nao-existe')
    expect(document.title).toBe('Área não encontrada · Roadmap CISO')
    expect(document.querySelector('main')?.textContent).toContain('Área não encontrada: nao-existe')

    // Tema inexistente dentro de uma área que existe: aqui o tema é quem falta.
    await irParaRota(`#/tema/${AREA}/TEMA-99`)
    expect(document.title).toBe('Tema não encontrado · Roadmap CISO')
    expect(document.querySelector('main')?.textContent).toContain(`Tema não encontrado: ${AREA}#TEMA-99`)

    // Página inexistente: o `PaginaView` recusa antes de tentar montar o material.
    await irParaRota('#/pagina/nao-existe')
    expect(document.title).toBe('Página não encontrada · Roadmap CISO')
    expect(document.querySelector('main')?.textContent).toContain('Página não encontrada: nao-existe')
    expect(
      [...document.querySelectorAll('main a')].map((a) => a.getAttribute('href')),
    ).toContain('#/')

    // Quiz de uma área que não existe: sem tema e sem área, o título volta ao genérico (e é a
    // própria tela do quiz que diz que a área não existe).
    await irParaRota('#/quiz/nao-existe')
    expect(document.title).toBe('Quiz de múltipla escolha · Roadmap CISO')
    expect(document.querySelector('main')?.textContent).toContain('Área não encontrada: nao-existe')
  })

  it('o botão de tema cicla sistema → claro → escuro e guarda a escolha', async () => {
    await abrir('#/')
    const botao = botaoDoTema()
    // O ciclo começa no sistema e não grava nada na montagem: `data-theme` fica em "auto" e quem
    // responde é o `prefers-color-scheme` da folha.
    expect(botao.textContent).toBe('Tema: sistema')
    expect(document.documentElement.dataset.theme).toBe('auto')
    expect(localStorage.getItem('roadmap:tema')).toBeNull()

    await act(async () => botao.click())
    expect(botao.textContent).toBe('Tema: claro')
    expect(document.documentElement.dataset.theme).toBe('claro')
    expect(botao.getAttribute('aria-label')).toBe('Tema: claro. Trocar para escuro.')
    // A escolha é GRAVADA, e é ela que o app volta a ler na próxima abertura.
    expect(localStorage.getItem('roadmap:tema')).toBe('claro')

    await act(async () => botao.click())
    expect(botao.textContent).toBe('Tema: escuro')
    expect(document.documentElement.dataset.theme).toBe('escuro')

    await act(async () => botao.click())
    // O ciclo fecha no sistema: a preferência do sistema volta a valer, e é isso que não pode
    // ficar congelado na primeira escolha.
    expect(botao.textContent).toBe('Tema: sistema')
    expect(document.documentElement.dataset.theme).toBe('auto')

    // A montagem seguinte — com o armazenamento PRESERVADO — volta na escolha guardada, e não no
    // sistema: é o caminho `temaGuardado` (o do app reaberto no computador de quem escolheu).
    await act(async () => botaoDoTema().click())
    expect(localStorage.getItem('roadmap:tema')).toBe('claro')
    cleanup()
    await abrir('#/', { preservarTema: true })
    expect(botaoDoTema().textContent).toBe('Tema: claro')
    expect(document.documentElement.dataset.theme).toBe('claro')
  })
})
