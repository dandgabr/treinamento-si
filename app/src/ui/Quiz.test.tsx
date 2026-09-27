// @vitest-environment jsdom
//
// Teste da tela do quiz — o módulo não tinha NENHUM teste de unidade, e os ramos que só existiam no
// código ficavam sem prova:
//
//   - a área que não existe e o tema que não existe dentro de uma área que existe (o endereço
//     `#/quiz/<areaId>/<temaId>` aceita qualquer par, e quem confere é a tela);
//   - a leitura do banco que falhou: ela não pode virar "escopo sem itens" — escopo vazio é uma
//     afirmação, e uma leitura que falhou não autoriza ninguém a afirmá-la;
//   - o escopo sem item no banco (rodada vazia);
//   - o fim da rodada, depois da última questão;
//   - e a fonte do item: `fonte.url` vinha CRUA no `href`. Medido no React 19.3, o `javascript:` é
//     neutralizado pelo próprio React, mas `data:text/html,…` passa inteiro para o atributo — o
//     navegador bloqueia navegação de topo para `data:`, então hoje é link morto, e não execução. A
//     porta passou a ser do render: só `http(s)` vira link.
//
// O banco é fixture (nenhum `teste` depende do conteúdo gerado para as questões) e o `useBanco` é
// trocado: a leitura do arquivo de questões não é o que se mede aqui. O CONTEÚDO é o de verdade —
// a tela lê `content.temas`/`content.areas` para nomear o escopo e a volta ao tema.

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Banco, OrigemDaQuestao, Questao } from '../domain/questoes'
import type { Persistencia } from '../infrastructure/storage/persistencia'

const compartilhado = vi.hoisted(() => ({
  provedor: null as Persistencia | null,
  banco: null as Banco | null,
  erro: null as string | null,
  carregando: false,
}))

vi.mock('../infrastructure/storage/persistencia', () => ({
  // O store resolve o provedor na IMPORTAÇÃO: o teste arma o provedor de mentira antes de importar
  // (`montarQuiz`, abaixo). Sem ele armado, é melhor estourar aqui do que deixar a suíte escrever
  // no armazenamento de quem roda.
  persistencia: (): Persistencia => {
    if (!compartilhado.provedor) throw new Error('o provedor de teste não foi armado')
    return compartilhado.provedor
  },
}))

vi.mock('./useBanco', () => ({
  useBanco: () => ({
    banco: compartilhado.banco,
    erro: compartilhado.erro,
    carregando: compartilhado.carregando,
  }),
}))

/** Provedor de mentira: nada guardado, nada gravado — o que se lê é o estado em memória. */
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

/** Área e tema do material de verdade: a tela nomeia o escopo por eles. */
const AREA = '01-fundamentos'
const TEMA = '01-fundamentos#TEMA-01'

function questao(alteracoes: Partial<Questao> = {}): Questao {
  return {
    id: `${TEMA}#E01`,
    ref: TEMA,
    origem: 'erro-comum',
    fonte: {
      titulo: 'NIST CSRC Glossary',
      url: 'https://csrc.nist.gov/glossary',
      tipo: 'primaria',
    },
    status: 'verificado',
    enunciado: 'Qual é a correção?',
    alternativas: ['A primeira alternativa', 'A segunda alternativa'],
    correta: 1,
    justificativa: 'O material escreve isso na seção 5.',
    ...alteracoes,
  }
}

/**
 * O quiz montado, com os módulos recarregados e o conteúdo de verdade carregado.
 *
 * O store resolve o provedor e dispara a carga UMA vez, na importação: sem `vi.resetModules()` o
 * provedor de teste chegaria tarde e o teste escreveria no armazenamento de quem roda a suíte.
 *
 * `leituraFalha` e `gravarFalha` montam os dois estados de sessão que a tela precisa saber
 * distinguir: a leitura perdida (nada grava, e a tela não pode prometer o registro) e a gravação
 * que falhou (o resultado vale só enquanto a página estiver aberta).
 */
async function montarQuiz(opcoes: {
  banco?: Banco | null
  erro?: string | null
  carregando?: boolean
  leituraFalha?: boolean
  gravarFalha?: boolean
}): Promise<{ Quiz: typeof import('./Quiz').Quiz; store: typeof import('../application/progresso-store') }> {
  compartilhado.provedor = provedorDeTeste()
  if (opcoes.leituraFalha) {
    compartilhado.provedor.carregar = () => Promise.reject(new Error('EIO'))
  }
  if (opcoes.gravarFalha) {
    compartilhado.provedor.gravar = () => Promise.reject(new Error('EIO'))
  }
  compartilhado.banco = opcoes.banco ?? null
  compartilhado.erro = opcoes.erro ?? null
  compartilhado.carregando = opcoes.carregando ?? false
  vi.resetModules()
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const store = await import('../application/progresso-store')
  await store.quandoCarregado()
  const { Quiz } = await import('./Quiz')
  return { Quiz, store }
}

/** Responde a questão na tela: marca a alternativa e confirma. */
async function responder(
  usuario: ReturnType<typeof userEvent.setup>,
  textoDaAlternativa: string,
): Promise<void> {
  await usuario.click(screen.getByRole('radio', { name: textoDaAlternativa }))
  await usuario.click(screen.getByRole('button', { name: 'Responder' }))
}

afterEach(cleanup)

describe('Quiz — escopo que não existe', () => {
  it('diz que a área não existe, em vez de abrir uma rodada vazia', async () => {
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    render(<Quiz areaId="nao-existe" temaId={null} />)

    expect(screen.getByText('Área não encontrada: nao-existe')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao painel' }).getAttribute('href')).toBe('#/')
    // O caminho de volta é de quem digitou o endereço errado, e não um quiz sem escopo.
    expect(screen.queryByRole('button', { name: 'Responder' })).toBeNull()
  })

  it('diz que o tema não existe, dentro de uma área que existe', async () => {
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    render(<Quiz areaId={AREA} temaId="TEMA-99" />)

    expect(screen.getByText('Tema não encontrado: 01-fundamentos#TEMA-99')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao guia da área' }).getAttribute('href')).toBe(
      `#/area/${AREA}`,
    )
    // A área existe e é nomeada na trilha de navegação: o erro é do tema, e a tela diz de onde ele
    // deveria ter vindo.
    const daArea = within(screen.getByRole('navigation')).getByRole('link', {
      name: 'Fundamentos de segurança da informação',
    })
    expect(daArea.getAttribute('href')).toBe(`#/area/${AREA}`)
  })
})

describe('Quiz — leitura do banco', () => {
  it('quando a leitura falha, diz isso e não afirma que o escopo está vazio', async () => {
    const { Quiz } = await montarQuiz({
      erro: 'Não consegui carregar o banco de questões. Rode `npm run build:questions` e recarregue.',
    })
    render(<Quiz areaId={null} temaId={null} />)

    const aviso = screen.getByRole('alert')
    expect(aviso.textContent).toBe(
      'Não consegui carregar o banco de questões. Rode `npm run build:questions` e recarregue.',
    )
    expect(screen.getByText('O resto do aplicativo continua funcionando: o banco é lido só nesta tela.')).toBeTruthy()
    // "Sem itens neste escopo" seria uma afirmação sobre o escopo — e a leitura que falhou não
    // autoriza ninguém a fazê-la.
    expect(screen.queryByRole('heading', { name: 'Sem itens neste escopo' })).toBeNull()
  })

  it('escopo sem item no banco diz que não há item, e não abre uma rodada vazia', async () => {
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [] } })
    render(<Quiz areaId={AREA} temaId={null} />)

    expect(screen.getByRole('heading', { name: 'Sem itens neste escopo' })).toBeTruthy()
    expect(
      screen.getByText(/não tem item desta área\. Rode\s+`npm run build:questions` e recarregue\./),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao guia da área' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Responder' })).toBeNull()
  })
})

describe('Quiz — a rodada de ponta a ponta', () => {
  it('responde, mostra o veredito, grava o item e fecha a rodada', async () => {
    const usuario = userEvent.setup()
    const { Quiz, store } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    expect(screen.getByRole('heading', { name: /Questão 1 de 1/ })).toBeTruthy()
    // Escopo menor que uma rodada: o número está dito, e não escondido.
    expect(screen.getByText(/Este escopo tem 1 item\(ns\) no banco/)).toBeTruthy()

    await responder(usuario, 'A segunda alternativa')

    // O veredito aparece com o acerto e a justificativa do item.
    expect(container.querySelector('.veredito-questao')?.textContent).toContain('Acertou.')
    expect(screen.getByText('O material escreve isso na seção 5.')).toBeTruthy()
    // E o resultado entrou no progresso pelo identificador do item.
    expect(store.instantaneo().estado.questoes[`${TEMA}#E01`]).toMatchObject({
      acertos: 1,
      erros: 0,
    })

    await usuario.click(screen.getByRole('button', { name: 'Ver o resultado' }))

    const titulo = screen.getByRole('heading', { name: 'Fim da rodada' })
    // O título do fim da rodada recebe o foco: o botão que trouxe até aqui sai de cena, e sem isto o
    // foco cairia no `body` e os primeiros TABs iriam para a navegação.
    expect(document.activeElement).toBe(titulo)
    expect(screen.getByRole('status').textContent).toBe('Você acertou 1 de 1.')
    expect(screen.getByRole('button', { name: 'Outra rodada' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver o guia da área' }).getAttribute('href')).toBe(
      `#/area/${AREA}`,
    )
  })
})

describe('Quiz — a fonte do item', () => {
  it('só vira link quando o endereço é http(s); o resto vira texto', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })

    // Os três endereços que NÃO são fonte de material: um `data:` (que o React deixa passar inteiro
    // para o `href`), um `javascript:` (que ele neutraliza sozinho — a tela não pode depender disso)
    // e um caminho relativo. Nas três, o que sobra é o TÍTULO em texto.
    for (const url of [
      'data:text/html,<script>alert(1)</script>',
      'javascript:alert(1)',
      'fonte-do-material.html',
    ]) {
      compartilhado.banco = {
        [AREA]: [questao({ fonte: { titulo: 'Dados locais', url, tipo: 'B' } })],
      }
      const { container, unmount } = render(<Quiz areaId={AREA} temaId={null} />)

      await responder(usuario, 'A segunda alternativa')

      const fonte = container.querySelector('.fonte-questao')
      expect(fonte?.textContent).toBe('Fonte: Dados locais (B)')
      expect(fonte?.querySelector('span')?.textContent).toBe('Dados locais')
      expect(fonte?.querySelector('a')).toBeNull()
      unmount()
    }
  })

  it('e o endereço https continua link, com o endereço do material', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    await responder(usuario, 'A segunda alternativa')

    const fonte = container.querySelector('.fonte-questao')
    const link = fonte?.querySelector('a')
    expect(fonte?.textContent).toBe('Fonte: NIST CSRC Glossary (primaria)')
    expect(link?.textContent).toBe('NIST CSRC Glossary')
    expect(link?.getAttribute('href')).toBe('https://csrc.nist.gov/glossary')
  })
})

/**
 * O escopo de TEMA e o de TODAS as áreas — os dois que a rota aceita (`#/quiz/<area>/<tema>` e
 * `#/quiz`) e que a tela do quiz não distinguia: o escopo por tema nomeia o tema na trilha, no
 * selo e nas frases, e o seletor do topo grava a escolha no ENDEREÇO (`irPara`), que é o canal do
 * app. O fim da rodada muda com o escopo: com tema há "Ver o tema"; sem área, só o painel.
 */
describe('Quiz — o escopo por tema e o de todas as áreas', () => {
  it('o escopo por tema nomeia o tema no título, na trilha e no selo', async () => {
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    const { container } = render(<Quiz areaId={AREA} temaId="TEMA-01" />)

    // O título é o do TEMA, e a navegação traz os dois níveis: o link do tema (com o ref na rota) e
    // o da área. Sem o link do tema, o caminho de volta some justo na tela que ele mais serve.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Quiz — Segurança da informação, segurança cibernética e privacidade',
    )
    const hrefs = [...container.querySelectorAll('.migalhas a')].map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['#/', `#/area/${AREA}`, `#/tema/${AREA}/TEMA-01`])
    // O selo do nível é o do tema (o da área não aparece junto): os dois marcariam a mesma coisa.
    const selos = [...container.querySelectorAll('.meta .selo')].map((s) => s.textContent)
    expect(selos).toEqual(['10 por rodada', 'uma alternativa correta', 'base'])
  })

  it('o seletor do topo grava o escopo escolhido no endereço, que é o canal do app', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    render(<Quiz areaId={AREA} temaId="TEMA-01" />)

    // O seletor de tema só existe com uma área escolhida, e as opções saem do material (o `ref` do
    // tema vira o `temaId`, e o texto é o título do tema — nunca a chave crua).
    const seletorDeTema = screen.getByLabelText('Tema') as HTMLSelectElement
    expect([...seletorDeTema.options].map((o) => o.textContent)).toContain(
      'Segurança da informação, segurança cibernética e privacidade',
    )
    expect(seletorDeTema.value).toBe('TEMA-01')

    // "A área inteira": o tema sai do endereço e a área fica — é a decisão de escopo em dois níveis,
    // e quem a guarda é a rota (o `irPara`), não um estado local que a próxima tela não leria.
    await usuario.selectOptions(seletorDeTema, '')
    expect(window.location.hash).toBe(`#/quiz/${AREA}`)

    // E o seletor de área, voltando para "Todas as áreas", deixa a rota sem escopo nenhum.
    await usuario.selectOptions(screen.getByLabelText('Escopo da rodada'), '')
    expect(window.location.hash).toBe('#/quiz')
  })

  it('escopo sem item, num tema, diz "deste tema" e volta para o guia da área', async () => {
    // O banco tem item da área, mas de OUTRO tema: o filtro por `ref` é o que distingue "a área
    // tem itens" de "este tema tem itens".
    const { Quiz } = await montarQuiz({
      banco: { [AREA]: [questao({ ref: `${AREA}#TEMA-02` })] },
    })
    render(<Quiz areaId={AREA} temaId="TEMA-01" />)

    expect(screen.getByRole('heading', { name: 'Sem itens neste escopo' })).toBeTruthy()
    expect(
      screen.getByText(/não tem item deste tema\./),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao guia da área' }).getAttribute('href')).toBe(
      `#/area/${AREA}`,
    )
  })

  it('sem área nenhuma, o escopo é "de nenhuma área" e o fim volta só para o painel', async () => {
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [] } })
    render(<Quiz areaId={null} temaId={null} />)

    // O título cai no genérico (nem tema, nem área), e a trilha de navegação não inventa nível: só
    // o painel e o nome da tela.
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Quiz de múltipla escolha')
    expect(
      [...document.querySelectorAll('.migalhas a')].map((a) => a.getAttribute('href')),
    ).toEqual(['#/'])

    // Escopo vazio global: a frase nomeia o escopo ("de nenhuma área") e o caminho de volta é o
    // painel — o teste da área acima cobria só a metade com `areaId`.
    expect(screen.getByText(/não tem item de nenhuma área\./)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Voltar ao painel' }).getAttribute('href')).toBe('#/')

    // O seletor de TEMA não existe sem uma área escolhida: o segundo nível só aparece com o
    // primeiro resolvido — e é o que impede escolher um tema de outra área.
    expect(screen.queryByLabelText('Tema')).toBeNull()

    // A rodada vazia não é "carregando" nem erro: o resumo da rodada fica de pé, com os zeros ditos
    // como "—", ao lado da explicação.
    expect(screen.getByRole('heading', { name: 'Sem itens neste escopo' })).toBeTruthy()
    expect(
      [...document.querySelectorAll('.resumo-item strong')].map((s) => s.textContent),
    ).toEqual(['—', '—', 'nenhum'])
    expect(screen.queryByRole('button', { name: 'Responder' })).toBeNull()
  })

  it('o fim da rodada de um tema oferece o tema, e o de um escopo sem área não oferece guia', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] } })
    render(<Quiz areaId={AREA} temaId="TEMA-01" />)

    await responder(usuario, 'A segunda alternativa')
    await usuario.click(screen.getByRole('button', { name: 'Ver o resultado' }))

    const botoes = [...document.querySelectorAll('.veredito-botoes a')].map((a) => ({
      texto: a.textContent,
      href: a.getAttribute('href'),
    }))
    // Com tema e área, os três caminhos: o tema (onde a justificativa está escrita), o guia da área
    // e o painel. "Ver o guia da área" sozinho perdia o tema de onde o item saiu.
    expect(botoes).toEqual([
      { texto: 'Ver o tema', href: `#/tema/${AREA}/TEMA-01` },
      { texto: 'Ver o guia da área', href: `#/area/${AREA}` },
      { texto: 'Voltar ao painel', href: '#/' },
    ])
  })
})

/**
 * A rodada de mais de uma questão: o caminho que os testes de uma questão só não alcançam — a
 * troca de questão (com o foco indo para o título novo), o botão que muda de nome na última, o
 * erro com o gabarito na tela e o placar do fim. Tudo com o enunciado de cada item localizado no
 * DOM (a ordem da rodada é sorteada, e amarrar o teste à ordem mediria o sorteio).
 */
describe('Quiz — a rodada de duas questões', () => {
  const Q1 = questao({
    id: `${TEMA}#E01`,
    enunciado: 'Primeira pergunta?',
    alternativas: ['Errada da primeira', 'Certa da primeira'],
    correta: 1,
  })
  const Q2 = questao({
    id: `${TEMA}#E02`,
    enunciado: 'Segunda pergunta?',
    alternativas: ['Certa da segunda', 'Errada da segunda'],
    correta: 0,
  })
  /** O texto da alternativa certa e o da errada, por enunciado — a rodada sorteia a ordem. */
  const RESPOSTAS: Record<string, { certa: string; errada: string }> = {
    'Primeira pergunta?': { certa: 'Certa da primeira', errada: 'Errada da primeira' },
    'Segunda pergunta?': { certa: 'Certa da segunda', errada: 'Errada da segunda' },
  }

  /** O enunciado da questão na tela — a `legend` do grupo de alternativas. */
  function enunciado(): string {
    return document.querySelector('fieldset legend')?.textContent ?? ''
  }

  it('erra a primeira, avança (com o foco no título) e fecha a rodada com o placar', async () => {
    const usuario = userEvent.setup()
    const { Quiz, store } = await montarQuiz({ banco: { [AREA]: [Q1, Q2] } })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    const primeiro = enunciado()
    expect(screen.getByRole('heading', { name: 'Questão 1 de 2' })).toBeTruthy()
    // Escopo menor que uma rodada: o número está dito, e a rodada traz todos os itens do escopo.
    expect(screen.getByText(/Este escopo tem 2 item\(ns\) no banco/)).toBeTruthy()
    // Os dois itens são `verificado` na fixture: nenhum leva selo, e o resumo diz "nenhum" — a
    // régua é a revisão declarada item a item, e marcar todo item apagaria a diferença.
    expect(container.querySelector('.selo-revisao')).toBeNull()
    expect(container.textContent).toContain('nenhum')

    await responder(usuario, RESPOSTAS[primeiro]!.errada)

    // O veredito do ERRO: a classe do bloco, a frase com o texto da alternativa certa e as duas
    // marcas em texto (a cor sozinha não serve para quem não enxerga).
    expect(container.querySelector('.gabarito')?.className).toBe('gabarito erro')
    expect(container.querySelector('.veredito-questao')?.textContent).toBe(
      `Errou. A alternativa correta é “${RESPOSTAS[primeiro]!.certa}”.`,
    )
    // A marca em TEXTO acompanha cada alternativa: a certa e a que foi marcada, cada uma na sua.
    // Sem a marca, quem não enxerga a cor (ou não usa o radio) não sabe qual era a correta.
    const marcas = [...container.querySelectorAll('label.alternativa')].map((l) => ({
      texto: l.querySelector('.alternativa-texto')?.textContent,
      marca: l.querySelector('.alternativa-marca')?.textContent ?? null,
    }))
    expect(marcas).toContainEqual({ texto: RESPOSTAS[primeiro]!.certa, marca: 'correta' })
    expect(marcas).toContainEqual({ texto: RESPOSTAS[primeiro]!.errada, marca: 'sua resposta' })
    // O grupo trava depois do veredito: responder de novo mediria a leitura do gabarito.
    expect((container.querySelector('fieldset') as HTMLFieldSetElement).disabled).toBe(true)
    const primeiroId = primeiro === Q1.enunciado ? Q1.id : Q2.id
    expect(store.instantaneo().estado.questoes[primeiroId]).toMatchObject({ acertos: 0, erros: 1 })

    // Não é a última: o botão diz "Próxima questão", e o clique troca a pergunta e leva o FOCO ao
    // título novo (sem isso o foco cairia no `body` quando o botão vira `disabled`).
    const botao = screen.getByRole('button', { name: 'Próxima questão' })
    await usuario.click(botao)

    const segundo = enunciado()
    expect(segundo).not.toBe(primeiro)
    expect(screen.getByRole('heading', { name: 'Questão 2 de 2' })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Questão 2 de 2' }))

    // Na última, o mesmo botão passa a levar para o resultado.
    await responder(usuario, RESPOSTAS[segundo]!.certa)
    expect(container.querySelector('.veredito-questao')?.textContent).toBe(
      'Acertou. A alternativa marcada é a correta.',
    )
    await usuario.click(screen.getByRole('button', { name: 'Ver o resultado' }))

    // O fim da rodada: o placar é o da rodada (1 de 2), e o resultado de CADA item entrou no
    // progresso pelo identificador dele.
    expect(screen.getByRole('heading', { name: 'Fim da rodada' })).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('Você acertou 1 de 2.')
    const segundoId = segundo === Q1.enunciado ? Q1.id : Q2.id
    expect(store.instantaneo().estado.questoes[segundoId]).toMatchObject({ acertos: 1, erros: 0 })

    // "Outra rodada" remonta a rodada (a `key` muda com a semente nova) e o placar volta ao começo:
    // a rodada anterior inteira é descartada, sem herdar o índice nem o veredito.
    await usuario.click(screen.getByRole('button', { name: 'Outra rodada' }))
    expect(screen.getByRole('heading', { name: 'Questão 1 de 2' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Fim da rodada' })).toBeNull()
    expect(
      [...document.querySelectorAll('.resumo-item strong')].map((s) => s.textContent),
    ).toEqual(['—', '—', 'nenhum'])
    // E as alternativas voltam destravadas: a resposta da rodada anterior não vale na nova.
    expect((document.querySelector('fieldset') as HTMLFieldSetElement).disabled).toBe(false)
    expect((screen.getByRole('button', { name: 'Responder' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
  })

  it('item sem justificativa não exibe rótulo vazio, e a volta ao tema muda a frase', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({
      banco: { [AREA]: [questao({ justificativa: '' })] },
    })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    await responder(usuario, 'A segunda alternativa')

    // O gate exige justificativa em todo item do banco, mas um JSON editado à mão pode chegar sem:
    // o rótulo "Por quê:" só existe com texto — um rótulo sem frase é pior que nenhum.
    expect(container.textContent).not.toContain('Por quê:')
    // E a frase de volta ao material muda com ele: sem justificativa, o que está escrito lá é a
    // RESPOSTA, e não a justificativa.
    expect(container.querySelector('.volta-ao-tema')?.textContent).toContain(
      ': é lá que a resposta está escrita, com o resto do assunto.',
    )
  })

  it('o item de um tema fora do conteúdo volta pelo endereço do próprio ref', async () => {
    const usuario = userEvent.setup()
    // Um JSON editado à mão: o `ref` não existe no conteúdo, e a tela não pode ficar sem nome nem
    // sem link por causa disso — o endereço sai do ref, e o rótulo do que houver.
    const { Quiz } = await montarQuiz({
      banco: { [AREA]: [questao({ ref: '99-nao-existe#TEMA-99' })] },
    })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    await responder(usuario, 'A segunda alternativa')

    const volta = container.querySelector('.volta-ao-tema')
    expect(volta?.querySelector('a')?.getAttribute('href')).toBe('#/tema/99-nao-existe/TEMA-99')
    expect(volta?.querySelector('a')?.textContent).toBe('99-nao-existe#TEMA-99')
  })

  it('a rodada cheia de dez itens não mostra a frase de escopo curto', async () => {
    // Dez itens no escopo: a frase "menos que os 10 de uma rodada cheia" só existe abaixo do teto —
    // sem este caso, ela apareceria (ou sumiria) sempre, e ninguém veria.
    const dez = Array.from({ length: 10 }, (_, i) =>
      questao({
        id: `${TEMA}#E${String(i + 1).padStart(2, '0')}`,
        enunciado: `Pergunta ${i + 1}?`,
        status: 'verificado',
      }),
    )
    const { Quiz } = await montarQuiz({ banco: { [AREA]: dez } })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    expect(screen.getByRole('heading', { name: 'Questão 1 de 10' })).toBeTruthy()
    expect(container.textContent).not.toContain('menos que os 10 de uma rodada cheia')
    // Nenhum item sem revisão: o resumo mostra "nenhum", e não "0 de 10" — a régua é a revisão
    // declarada item a item, e o zero não é um número que se leia como estado.
    expect(
      [...container.querySelectorAll('.resumo-item strong')].map((s) => s.textContent),
    ).toEqual(['—', '—', 'nenhum'])
  })
})

/**
 * Os dois estados de sessão que a tela precisa saber distinguir do "sem itens": a leitura do
 * progresso que falhou (nada grava nesta sessão, e a tela NÃO pode prometer o registro) e a
 * gravação que falhou (o resultado vale só enquanto a página estiver aberta).
 */
describe('Quiz — a sessão que não grava', () => {
  it('a leitura do progresso que falhou vira aviso, no topo e no fim da rodada', async () => {
    const usuario = userEvent.setup()
    const { Quiz, store } = await montarQuiz({
      banco: { [AREA]: [questao()] },
      leituraFalha: true,
    })
    render(<Quiz areaId={AREA} temaId={null} />)

    const mensagem = store.instantaneo().erroDeCarga
    expect(mensagem).toBeTruthy()
    // O aviso fica colado na frase que ele desmente ("cada resposta entra no seu progresso"):
    // é no cabeçalho, antes do escopo, que a promessa é feita.
    const doTopo = [...document.querySelectorAll('.aviso-erro')].map((p) => p.textContent)
    expect(doTopo).toEqual([mensagem])

    await responder(usuario, 'A segunda alternativa')
    await usuario.click(screen.getByRole('button', { name: 'Ver o resultado' }))

    // E de novo no fim, onde a tela diz "o resultado de cada item entrou no progresso": numa sessão
    // que perdeu a leitura, isso é só memória, e não registro.
    const avisos = [...document.querySelectorAll('.aviso-erro')].map((p) => p.textContent)
    expect(avisos).toContain(mensagem)
    expect(avisos).toHaveLength(2)
  })

  it('a gravação que falhou avisa que o resultado vale só nesta página', async () => {
    const usuario = userEvent.setup()
    const { Quiz } = await montarQuiz({ banco: { [AREA]: [questao()] }, gravarFalha: true })
    render(<Quiz areaId={AREA} temaId={null} />)

    await responder(usuario, 'A segunda alternativa')

    // O aviso do resumo é o do `falhouAoGravar`, e não o do erro de carga: são duas causas
    // diferentes, e a tela diz qual foi.
    const aviso = screen.getByRole('alert')
    expect(aviso.textContent).toContain('Não consegui gravar o progresso nesta sessão')
    expect(aviso.textContent).toContain('Exporte antes de fechar.')
  })

  it('enquanto o banco não voltou, diz que está carregando; sem banco e sem erro, não diz nada', async () => {
    const { Quiz } = await montarQuiz({ banco: null, carregando: true })
    const { unmount, container } = render(<Quiz areaId={AREA} temaId={null} />)
    expect(screen.getByText('carregando o banco de questões…')).toBeTruthy()
    expect(container.querySelector('.bloco-questao')).toBeNull()
    unmount()

    // Nem carregando, nem erro, nem banco: a tela fica só com o cabeçalho e o escopo. É o estado
    // momentâneo depois da leitura que voltou nula e antes de o erro ser publicado — e não pode nem
    // afirmar "sem itens" (o `Rodada` não existe) nem inventar um carregamento que acabou.
    const semNada = await montarQuiz({ banco: null, erro: null, carregando: false })
    const segunda = render(<semNada.Quiz areaId={AREA} temaId={null} />)
    expect(segunda.container.querySelector('.bloco-questao')).toBeNull()
    expect(segunda.container.querySelector('.resumo')).toBeNull()
    expect(segunda.container.textContent).not.toContain('carregando o banco')
    expect(segunda.container.textContent).not.toContain('Sem itens neste escopo')
    // O seletor de escopo continua na tela: é por ele que se sai do escopo vazio.
    expect(screen.getByLabelText('Escopo da rodada')).toBeTruthy()
  })
})

/**
 * O estado de revisão do item na tela: o selo só marca a AUSÊNCIA de revisão humana, e a frase diz
 * de onde o item saiu. É o que separa "derivado do material e revisado" de "derivado e não
 * revisado" — a diferença que o material promete e que o selo apagaria se marcasse todo item.
 */
describe('Quiz — o selo de revisão', () => {
  it('item pendente leva "em revisão", e rascunho leva "não revisado"', async () => {
    const { Quiz } = await montarQuiz({
      banco: { [AREA]: [questao({ status: 'pendente' })] },
    })
    const { container, unmount } = render(<Quiz areaId={AREA} temaId={null} />)

    // Estado pendente: o item está na fila de revisão, e não "não revisado" — o texto do selo diz
    // qual dos dois é o caso.
    expect(container.querySelector('.selo-revisao')?.textContent).toBe('em revisão')
    expect(container.textContent).toContain(
      'Item derivado automaticamente da tabela de erros comuns do tema e ainda sem revisão humana',
    )
    // E o resumo conta o item como sem revisão: a régua é a revisão declarada, não o selo.
    expect(container.textContent).toContain('1 de 1')
    unmount()

    const rascunho = await montarQuiz({ banco: { [AREA]: [questao({ status: 'rascunho' })] } })
    const segunda = render(<rascunho.Quiz areaId={AREA} temaId={null} />)
    expect(segunda.container.querySelector('.selo-revisao')?.textContent).toBe('não revisado')
  })

  it('a origem desconhecida cai na frase genérica do material', async () => {
    // Origem que o tipo não declara mas um JSON editado à mão pode trazer: o `default` de
    // `origemEmProsa` existe para ela, e devolve a origem genérica em vez de nomear uma tabela de
    // onde o item não saiu. O cast é do teste, e existe só para alcançar esse caminho.
    const { Quiz } = await montarQuiz({
      banco: { [AREA]: [questao({ status: 'rascunho', origem: 'outra' as OrigemDaQuestao })] },
    })
    const { container } = render(<Quiz areaId={AREA} temaId={null} />)

    expect(container.textContent).toContain(
      'Item derivado automaticamente do material e ainda sem revisão humana',
    )
  })
})
