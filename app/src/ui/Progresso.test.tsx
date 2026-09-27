// @vitest-environment jsdom
//
// Teste de componente de `AcoesDeProgresso` e do `CheckpointArea`: os caminhos que só tinham teste
// de domínio — exportar e importar (inclusive PELO NAVEGADOR: o `Blob` do exportar, o
// `<input type=file>` do importar e o cancelamento do seletor) e o veredito por item do checkpoint,
// que vive no progresso e não em `useState`. O componente, o store e a forma do progresso são os de
// verdade; o formato segue congelado na v1 e o campo por item é aditivo, com o placar derivado dele.
//
// Dois provedores de persistência, e a escolha é do teste: o duble (que captura o objeto exportado
// e devolve o arquivo escolhido) para os caminhos da tela, e o provedor DE VERDADE do navegador
// (`noNavegador`) quando o que se prova é o arquivo, o armazenamento local e a recarga.
//
// O store resolve o provedor e dispara a carga UMA vez, na importação. Por isso cada teste
// reseta os módulos e reimporta o componente e o store, com o provedor já no lugar.
//
// O bloco final cobre a FILA DE HOJE e a tarefa da passagem, que vivem no mesmo arquivo
// (`ResumoProgresso`, `TarefaDaPassagem`). Ali o conteúdo é o de verdade — o mesmo
// `content.json` que a tela lê, carregado por `carregar()` —, porque a fila mostra a coluna
// "O que fazer" da seção 11 de cada tema: sem o material carregado não há tarefa para cobrar.

import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { tarefaDoTema, tarefasDaRevisao } from '../application/revisao-espacada'
import { areaFake, guiaFake } from '../domain/testes/fixtures'
import type { Conteudo } from '../domain/types'
import { CHAVE, type Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz — e nada de exportar/importar
// passa por ele. O mock evita carregar a biblioteca inteira num teste que não a exercita.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

// `Element.prototype.scrollIntoView` não existe no jsdom (ele não implementa layout/rolagem),
// então o `irParaSecao` que o botão "Ir para a seção 10" chama estourava com
// "alvo.scrollIntoView is not a function" — ausência do AMBIENTE, não do navegador: `alvo` vem de
// `getElementById`, que no navegador devolve sempre um `Element` com o método. O stub não afrouxa
// asserção nenhuma: o que os testes conferem é o FOCO (`document.activeElement`), que o jsdom faz
// de verdade. O alvo de `irParaSecao` é um `HTMLElement` (nunca "um valor sem o método"), então
// não há defeito de produção a corrigir aqui.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})

const compartilhado = vi.hoisted(() => ({
  provedor: null as unknown as Persistencia,
  /** true quando o teste quer o provedor DE VERDADE do navegador (`noNavegador`). */
  noNavegador: false,
}))

// O duble é o padrão; `noNavegador` devolve o provedor de verdade do módulo, que é o que cria o
// `Blob` do exportar e o `<input type="file">` do importar. Sem esta saída, o caminho do navegador
// seria inalcançável de um teste de componente.
vi.mock('../infrastructure/storage/persistencia', async (importOriginal) => {
  const real = await importOriginal<typeof import('../infrastructure/storage/persistencia')>()
  return {
    ...real,
    persistencia: () => (compartilhado.noNavegador ? real.persistencia() : compartilhado.provedor),
  }
})

const AGORA = new Date('2026-03-10T12:00:00.000Z')

/** Um estado como o do disco: um tema já estudado e um dia registrado. */
function estadoDoDisco(): Record<string, unknown> {
  return {
    versao: 1,
    temas: {
      '01-fundamentos#TEMA-01': {
        ref: '01-fundamentos#TEMA-01',
        lido: true,
        preTeste: [],
        recuperacaoOk: true,
        revisao: { intervaloDias: 7, proximaRevisao: '2026-03-17T12:00:00.000Z' },
      },
    },
    checkpoints: {},
    questoes: {},
    diasAtivos: ['2026-03-09'],
  }
}

interface Registro {
  exportados: unknown[]
  gravados: unknown[]
}

function novoRegistro(): Registro {
  return { exportados: [], gravados: [] }
}

/**
 * Provedor de mentira: o teste vê o objeto que a tela mandou exportar e o que ela gravou.
 * `importar` começa cancelado e cada teste o troca pelo arquivo que o diálogo devolveria.
 */
function provedorDeTeste(
  registro: Registro,
  opcoes: { leitura?: () => Promise<unknown | null> } = {},
): Persistencia {
  return {
    descricao: 'num provedor de teste',
    carregar: opcoes.leitura ?? (() => Promise.resolve(null)),
    gravar: (valor) => {
      registro.gravados.push(valor)
      return Promise.resolve()
    },
    apagar: () => Promise.resolve(),
    exportar: (valor) => {
      registro.exportados.push(valor)
      return Promise.resolve({ estado: 'ok', caminho: '/tmp/progresso.json' })
    },
    importar: () => Promise.resolve({ estado: 'cancelado' }),
  }
}

async function montar(provedor: Persistencia) {
  compartilhado.noNavegador = false
  compartilhado.provedor = provedor
  vi.resetModules()
  const store = await import('../application/progresso-store')
  const { AcoesDeProgresso } = await import('./Progresso')
  await store.quandoCarregado()
  return { store, AcoesDeProgresso }
}

interface AppNoNavegador {
  store: typeof import('../application/progresso-store')
  AcoesDeProgresso: typeof import('./Progresso').AcoesDeProgresso
  CheckpointArea: typeof import('./Progresso').CheckpointArea
}

/**
 * O app com o provedor DE VERDADE do navegador (`noNavegador`): o armazenamento local, o `Blob` do
 * exportar e o `<input type="file">` do importar. `vi.resetModules()` é a recarga — a instância
 * nova do store lê de novo o que ficou guardado, em vez de reaproveitar o estado em memória.
 */
async function montarNoNavegador(): Promise<AppNoNavegador> {
  compartilhado.noNavegador = true
  vi.resetModules()
  const store = await import('../application/progresso-store')
  await store.quandoCarregado()
  const { AcoesDeProgresso, CheckpointArea } = await import('./Progresso')
  return { store, AcoesDeProgresso, CheckpointArea }
}

/** O que está guardado no armazenamento do navegador, já analisado. */
function guardado(): unknown {
  return JSON.parse(localStorage.getItem(CHAVE) ?? 'null') as unknown
}

/** O tema cuja seção 11 tabela D+1, D+7 e D+30 — o caso com tarefa declarada. */
const TEMA = '01-fundamentos#TEMA-01'

/**
 * Uma data de passagem bem no passado: a cobrança seguinte já nasceu vencida e o tema entra na
 * fila de hoje sem depender do relógio da máquina.
 */
const PASSADO = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)

interface Painel {
  store: typeof import('../application/progresso-store')
  TarefaDaPassagem: typeof import('./Progresso').TarefaDaPassagem
  ResumoProgresso: typeof import('./Progresso').ResumoProgresso
  VereditoRecuperacao: typeof import('./Progresso').VereditoRecuperacao
  BotaoLido: typeof import('./Progresso').BotaoLido
  AcoesDeProgresso: typeof import('./Progresso').AcoesDeProgresso
  SituacaoDaArea: typeof import('./Progresso').SituacaoDaArea
  CheckpointArea: typeof import('./Progresso').CheckpointArea
  conteudo: Conteudo
}

/**
 * O store de verdade, com o provedor trocado e o conteúdo de verdade carregado: a fila lê a
 * coluna "O que fazer" da seção 11 do material, e sem ele nenhum tema teria tarefa.
 */
async function montarPainel(): Promise<Painel> {
  compartilhado.noNavegador = false
  compartilhado.provedor = provedorDeTeste(novoRegistro())
  vi.resetModules()
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const store = await import('../application/progresso-store')
  await store.quandoCarregado()
  const Progresso = await import('./Progresso')
  return { store, ...Progresso, conteudo: repositorio.content }
}

/**
 * O painel com a leitura do progresso PENDENTE: é o estado do primeiro render do app, antes de o
 * arquivo voltar. `quandoCarregado` não é esperado — esperar por ele é esperar para sempre, e é
 * justamente esse instante que se mede.
 */
async function montarPainelLendo(): Promise<Painel> {
  compartilhado.noNavegador = false
  compartilhado.provedor = provedorDeTeste(novoRegistro(), {
    leitura: () => new Promise<unknown | null>(() => {}),
  })
  vi.resetModules()
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const store = await import('../application/progresso-store')
  const Progresso = await import('./Progresso')
  return { store, ...Progresso, conteudo: repositorio.content }
}

/** A única linha da fila de hoje. */
function linhaDaFila(container: HTMLElement): HTMLElement {
  const linhas = container.querySelectorAll<HTMLElement>('.resumo-fila li')
  expect(linhas).toHaveLength(1)
  return linhas[0]!
}

afterEach(() => {
  cleanup()
})

describe('AcoesDeProgresso — exportar', () => {
  it('exporta o estado carregado, com a forma esperada', async () => {
    const registro = novoRegistro()
    const provedor = provedorDeTeste(registro, { leitura: () => Promise.resolve(estadoDoDisco()) })
    const { AcoesDeProgresso } = await montar(provedor)

    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Exportar progresso' }))

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Exportado para /tmp/progresso.json.',
      ),
    )
    expect(registro.exportados).toHaveLength(1)
    const exportado = registro.exportados[0] as Record<string, unknown>
    // A forma é a do progresso desta versão, e não um recorte do que a tela mostra. `diagnosticos`
    // e `artefatos` são campos aditivos desta fase: entram no arquivo exportado (e por isso
    // aparecem aqui), e um arquivo gravado antes deles carrega igual, com os dois vazios.
    expect(Object.keys(exportado).sort()).toEqual([
      'artefatos',
      'checkpoints',
      'diagnosticos',
      'diasAtivos',
      'questoes',
      'temas',
      'versao',
    ])
    expect(exportado.versao).toBe(1)
    expect(exportado.diagnosticos).toEqual({})
    expect(exportado.artefatos).toEqual({})
    expect(exportado.temas).toMatchObject({
      '01-fundamentos#TEMA-01': { recuperacaoOk: true },
    })
    expect(exportado.diasAtivos).toEqual(['2026-03-09'])
  })

  it('o que foi exportado reimporta e devolve o mesmo estado', async () => {
    const registro = novoRegistro()
    const provedor = provedorDeTeste(registro, { leitura: () => Promise.resolve(estadoDoDisco()) })
    const { store, AcoesDeProgresso } = await montar(provedor)
    // Uma resposta de quiz entra no estado: o arquivo exportado tem de carregar isso junto.
    store.registrarQuestao('01-fundamentos#TEMA-01#E01', true, AGORA)
    await store.aguardarGravacoes()
    const antes = store.instantaneo().estado

    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Exportar progresso' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Exportado para'))
    const exportado = registro.exportados[0]

    // O zapata: o estado atual é esvaziado e o arquivo exportado é o que o traz de volta — é
    // exatamente o caminho do "leve o progresso para outra máquina".
    store.definirProgresso({ versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [] })
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual([])

    provedor.importar = () => Promise.resolve({ estado: 'ok', dado: exportado })
    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Progresso importado.'),
    )
    expect(store.instantaneo().estado).toEqual(antes)
  })
})

describe('AcoesDeProgresso — importar', () => {
  it('importa um arquivo válido e o estado passa a ser o do arquivo', async () => {
    const registro = novoRegistro()
    const arquivo = {
      versao: 1,
      temas: { '02-grc#TEMA-01': { ref: '02-grc#TEMA-01', lido: true, preTeste: [] } },
      checkpoints: {},
      questoes: {},
      diasAtivos: ['2026-03-11'],
    }
    const provedor = provedorDeTeste(registro, { leitura: () => Promise.resolve(estadoDoDisco()) })
    provedor.importar = () => Promise.resolve({ estado: 'ok', dado: arquivo })
    const { store, AcoesDeProgresso } = await montar(provedor)

    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Progresso importado.'),
    )
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['02-grc#TEMA-01'])
    expect(store.instantaneo().estado.diasAtivos).toEqual(['2026-03-11'])
  })

  it('recusa um arquivo que não é um progresso, sem sobrescrever o que existe', async () => {
    const registro = novoRegistro()
    const provedor = provedorDeTeste(registro, { leitura: () => Promise.resolve(estadoDoDisco()) })
    // JSON válido, mas não um progresso do app: sem a validação de forma antes de substituir,
    // isso zeraria o estudo existente e ainda diria que deu certo.
    provedor.importar = () =>
      Promise.resolve({ estado: 'ok', dado: { versao: 3, temas: 'nada' } })
    const { store, AcoesDeProgresso } = await montar(provedor)

    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'O arquivo não é um progresso do Roadmap CISO.',
      ),
    )
    // O que existia continua no lugar, campo a campo.
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['01-fundamentos#TEMA-01'])
    expect(store.instantaneo().estado.temas['01-fundamentos#TEMA-01']?.recuperacaoOk).toBe(true)
    // E nada foi gravado por cima do progresso de quem estuda.
    expect(registro.gravados).toHaveLength(0)
  })

  it('não finge importar numa sessão que não pode gravar', async () => {
    // A leitura do arquivo falhou: a sessão segue em memória e não escreve. Substituir e
    // dizer "importado" daria a impressão de que o arquivo foi salvo.
    const registro = novoRegistro()
    const provedor = provedorDeTeste(registro, {
      leitura: () => Promise.reject(new Error('EIO')),
    })
    provedor.importar = () =>
      Promise.resolve({
        estado: 'ok',
        dado: {
          versao: 1,
          temas: { '02-grc#TEMA-01': { ref: '02-grc#TEMA-01', lido: true, preTeste: [] } },
          checkpoints: {},
          diasAtivos: [],
        },
      })
    const { store, AcoesDeProgresso } = await montar(provedor)

    render(<AcoesDeProgresso />)
    // A tela deixa claro que a leitura falhou, e o botão de importar fica desabilitado.
    const botao = screen.getByRole('button', { name: 'Importar progresso' })
    expect((botao as HTMLButtonElement).disabled).toBe(true)
    // O caminho programático continua recusando, e não mexe no estado.
    const aviso = await store.importar()
    expect(aviso?.tipo).toBe('erro')
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual([])
    expect(registro.gravados).toHaveLength(0)
  })
})

/**
 * O caminho do NAVEGADOR, com o provedor de verdade: o `Blob` que o exportar cria, a âncora do
 * download, o `<input type="file">` do importar e o cancelamento do seletor. O duble acima cobre a
 * tela; aqui o que se prova é o arquivo e o armazenamento local, byte a byte.
 *
 * O jsdom (25) não implementa três coisas que ESTE caminho usa — `Blob.text()` (que o `File` herda),
 * `URL.createObjectURL` e `URL.revokeObjectURL` —, nem abre seletor de arquivo nenhum. As três
 * entram no `beforeAll` com o que o navegador faria, e o `click()` do input e da âncora é observado
 * em vez de executado: é assim que o teste entrega o arquivo escolhido e confere o nome do download.
 */
describe('no navegador — o arquivo exportado e o seletor de arquivos', () => {
  /** O `<input type="file">` de cada importação e a âncora de cada download. */
  const entradas: HTMLInputElement[] = []
  const ancoras: HTMLAnchorElement[] = []
  const baixados: Blob[] = []
  const revogados: string[] = []

  /** O `Blob.text()` que o jsdom não tem: lê o conteúdo com o `FileReader`, que ele tem. */
  function lerTextoDesteBlob(this: Blob): Promise<string> {
    return new Promise<string>((resolver, rejeitar) => {
      const leitor = new FileReader()
      leitor.onerror = () => rejeitar(leitor.error)
      leitor.onload = () => resolver(String(leitor.result))
      leitor.readAsText(this)
    })
  }

  beforeAll(() => {
    Object.defineProperty(Blob.prototype, 'text', {
      configurable: true,
      writable: true,
      value: lerTextoDesteBlob,
    })
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: (arquivo: Blob) => {
        baixados.push(arquivo)
        return `blob:${baixados.length}`
      },
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: (endereco: string) => {
        revogados.push(endereco)
      },
    })
    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
      this: HTMLInputElement,
    ) {
      entradas.push(this)
    })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      ancoras.push(this)
    })
  })

  afterAll(() => {
    vi.restoreAllMocks()
    delete (Blob.prototype as Partial<Blob>).text
    delete (URL as unknown as Record<string, unknown>)['createObjectURL']
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL']
  })

  beforeEach(() => {
    localStorage.clear()
    entradas.length = 0
    ancoras.length = 0
    baixados.length = 0
    revogados.length = 0
  })

  /** O seletor devolveu este arquivo — ou nenhum, quando a janela é fechada. */
  function escolher(entrada: HTMLInputElement, arquivo: File | null): void {
    Object.defineProperty(entrada, 'files', { configurable: true, value: arquivo ? [arquivo] : [] })
    entrada.dispatchEvent(new Event('change'))
  }

  /** A entrada que o app criou e abriu — espera em vez de supor a ordem dos microtasks. */
  async function esperarEntrada(): Promise<HTMLInputElement> {
    await waitFor(() => expect(entradas.length).toBeGreaterThan(0))
    return entradas[entradas.length - 1]!
  }

  it('o arquivo exportado reimporta com o mesmo estado', async () => {
    localStorage.setItem(CHAVE, JSON.stringify(estadoDoDisco()))
    const { store, AcoesDeProgresso } = await montarNoNavegador()
    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)

    await usuario.click(screen.getByRole('button', { name: 'Exportar progresso' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Progresso exportado.'),
    )

    // O arquivo é o `Blob` que a tela criou, e o link é o do download: o mesmo
    // `roadmap-progresso.json` que o navegador baixaria. Nada aqui é montado pelo teste.
    expect(ancoras).toHaveLength(1)
    expect(ancoras[0]?.download).toBe('roadmap-progresso.json')
    expect(baixados).toHaveLength(1)
    // O endereço do Blob é devolvido depois do clique, e não fica pendurado.
    expect(revogados).toEqual(['blob:1'])
    const arquivo = JSON.parse(await baixados[0]!.text()) as unknown
    expect(arquivo).toEqual(store.instantaneo().estado)
    expect(arquivo).toMatchObject({
      versao: 1,
      temas: { '01-fundamentos#TEMA-01': { recuperacaoOk: true } },
    })

    // A outra máquina: o estado daqui é zerado (e gravado assim), e o arquivo é o que o traz de
    // volta — pelo caminho do navegador, com o `<input type="file">` e o `change` do seletor.
    store.definirProgresso({ versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [] })
    await store.aguardarGravacoes()
    expect(guardado()).toMatchObject({ temas: {} })

    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    const entrada = await esperarEntrada()
    expect(entrada.type).toBe('file')
    expect(entrada.accept).toBe('application/json,.json')
    escolher(
      entrada,
      new File([JSON.stringify(arquivo)], 'roadmap-progresso.json', { type: 'application/json' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Progresso importado.'),
    )

    // O estado voltou igual, e o que ficou guardado é o arquivo: a importação grava, não só
    // substitui em memória.
    expect(store.instantaneo().estado).toEqual(arquivo)
    expect(guardado()).toEqual(arquivo)
  })

  it('recusa um arquivo que não é um progresso, sem sobrescrever o que está guardado', async () => {
    localStorage.setItem(CHAVE, JSON.stringify(estadoDoDisco()))
    const { store, AcoesDeProgresso } = await montarNoNavegador()
    const antes = guardado()
    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)

    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    // JSON válido, mas não um progresso do app: sem a validação de forma antes de substituir,
    // isto zeraria o estudo existente e ainda diria que deu certo.
    escolher(
      await esperarEntrada(),
      new File(['{"versao":3,"temas":"nada"}'], 'outro.json', { type: 'application/json' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'O arquivo não é um progresso do Roadmap CISO.',
      ),
    )

    // O que existia continua no lugar, campo a campo — e o que está guardado não mudou.
    expect(guardado()).toEqual(antes)
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['01-fundamentos#TEMA-01'])
    expect(store.instantaneo().estado.temas['01-fundamentos#TEMA-01']?.recuperacaoOk).toBe(true)
  })

  it('recusa o arquivo que não é JSON e o que passa de 1 MB, sem trocar o guardado', async () => {
    localStorage.setItem(CHAVE, JSON.stringify(estadoDoDisco()))
    const { AcoesDeProgresso } = await montarNoNavegador()
    const antes = guardado()
    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)

    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    escolher(
      await esperarEntrada(),
      new File(['{isto não é json'], 'quebrado.json', { type: 'application/json' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('O arquivo não é um JSON válido.'),
    )

    // O teto é conferido no arquivo ESCOLHIDO, antes de o conteúdo ser lido: o gigante nem chega a
    // ser analisado.
    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    escolher(
      await esperarEntrada(),
      new File(['a'.repeat(1024 * 1024 + 1)], 'gigante.json', { type: 'application/json' }),
    )
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('O arquivo passa de 1 MB.'),
    )

    expect(guardado()).toEqual(antes)
  })

  it('cancelar o seletor resolve a importação sem gravar nada', async () => {
    localStorage.setItem(CHAVE, JSON.stringify(estadoDoDisco()))
    const { store, AcoesDeProgresso } = await montarNoNavegador()
    const antes = guardado()
    const usuario = userEvent.setup()
    render(<AcoesDeProgresso />)

    // O caminho do botão: o seletor abre e volta SEM arquivo — o cancelamento que o `onchange`
    // recebe. A tela tem de continuar respondendo depois dele.
    await usuario.click(screen.getByRole('button', { name: 'Importar progresso' }))
    escolher(await esperarEntrada(), null)
    await usuario.click(screen.getByRole('button', { name: 'Exportar progresso' }))
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain('Progresso exportado.'),
    )

    // O retorno do cancelamento é declarado: `null` (nenhum aviso), e não "importado". A promessa
    // resolvida é o que prova que a tela não fica esperando o seletor para sempre.
    const cancelada = store.importar()
    escolher(await esperarEntrada(), null)
    await expect(cancelada).resolves.toBeNull()

    // E nada foi trocado — nem em memória, nem no que está guardado.
    expect(guardado()).toEqual(antes)
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['01-fundamentos#TEMA-01'])
  })
})

/**
 * O checkpoint da área: o veredito por item vive no PROGRESSO, e não em `useState`.
 *
 * É a promessa que a tela fazia e não cumpria: ao recarregar, ela dizia "último resultado gravado" e
 * mostrava os botões em branco. A recarga aqui é de verdade — `vi.resetModules()` e a instância
 * nova do store lendo o armazenamento local —, e o que se confere é a marca de cada botão, não a
 * ausência de marca nenhuma.
 */
describe('checkpoint da área — o veredito por item no progresso', () => {
  const area = areaFake()
  const total = area.guia.checkpoint.length

  beforeEach(() => {
    localStorage.clear()
  })

  /** O estado dos dois botões de um item, pelo `aria-pressed` que a tela publica. */
  function marcasDoItem(indice: number): { acertei: boolean; errei: boolean } {
    const grupo = screen.getByRole('group', { name: `Resultado da questão ${indice}` })
    const botao = (nome: string) => within(grupo).getByRole('button', { name: nome })
    return {
      acertei: botao('Acertei').getAttribute('aria-pressed') === 'true',
      errei: botao('Errei').getAttribute('aria-pressed') === 'true',
    }
  }

  /** O botão do veredito de um item, pelo número dele na tela. */
  function botaoDoItem(indice: number, nome: string): HTMLElement {
    return within(screen.getByRole('group', { name: `Resultado da questão ${indice}` })).getByRole(
      'button',
      { name: nome },
    )
  }

  it('grava o veredito de cada item, e a marca volta com a página recarregada', async () => {
    const primeira = await montarNoNavegador()
    const usuario = userEvent.setup()
    const { unmount } = render(<primeira.CheckpointArea areaId={area.areaId} area={area} />)

    // O julgamento inteiro, clicando de verdade: quatro acertos e um erro — o critério do guia é
    // 4 de 5.
    for (let i = 1; i <= total; i++) {
      await usuario.click(botaoDoItem(i, i <= 4 ? 'Acertei' : 'Errei'))
    }
    expect(screen.getByRole('status').textContent).toContain(
      `Último resultado gravado: 4 de ${total} — aprovado no critério declarado.`,
    )
    // O que ficou gravado é o veredito de cada item; o placar não é uma segunda cópia dele.
    expect(primeira.store.instantaneo().estado.checkpoints[area.areaId]).toEqual({
      itens: [
        { indice: 0, acertou: true },
        { indice: 1, acertou: true },
        { indice: 2, acertou: true },
        { indice: 3, acertou: true },
        { indice: 4, acertou: false },
      ],
      placarAntigo: null,
    })

    // A recarga: a tela sai, os módulos são esquecidos e o app lê de novo o armazenamento.
    unmount()
    const recarregada = await montarNoNavegador()
    render(<recarregada.CheckpointArea areaId={area.areaId} area={area} />)

    // A marca de cada item voltou, uma a uma — é o que a tela prometia com "resultado gravado".
    expect(marcasDoItem(1)).toEqual({ acertei: true, errei: false })
    expect(marcasDoItem(4)).toEqual({ acertei: true, errei: false })
    expect(marcasDoItem(5)).toEqual({ acertei: false, errei: true })
    expect(screen.getByRole('status').textContent).toContain(
      `Último resultado gravado: 4 de ${total} — aprovado no critério declarado.`,
    )
  })

  it('o julgamento pela metade sobrevive à recarga e ainda não é placar', async () => {
    const primeira = await montarNoNavegador()
    const usuario = userEvent.setup()
    const { unmount } = render(<primeira.CheckpointArea areaId={area.areaId} area={area} />)

    await usuario.click(botaoDoItem(1, 'Acertei'))
    await usuario.click(botaoDoItem(2, 'Errei'))
    // Dois itens julgados não fazem resultado: um parcial seria lido como reprovação pelo critério,
    // e a tela diz quantos faltam em vez de mostrar um placar que não existe.
    expect(screen.getByRole('status').textContent).toContain(
      'Nenhum checkpoint registrado nesta área.',
    )
    expect(
      screen.getByText(`2 de ${total} itens julgados. Julgar os ${total} registra o resultado.`),
    ).toBeTruthy()

    unmount()
    const recarregada = await montarNoNavegador()
    render(<recarregada.CheckpointArea areaId={area.areaId} area={area} />)

    // O que já foi julgado volta marcado: a passagem pela metade não se perde ao reabrir.
    expect(marcasDoItem(1)).toEqual({ acertei: true, errei: false })
    expect(marcasDoItem(2)).toEqual({ acertei: false, errei: true })
    expect(marcasDoItem(3)).toEqual({ acertei: false, errei: false })
    expect(
      screen.getByText(`2 de ${total} itens julgados. Julgar os ${total} registra o resultado.`),
    ).toBeTruthy()
    expect(recarregada.store.instantaneo().estado.checkpoints[area.areaId]?.itens).toEqual([
      { indice: 0, acertou: true },
      { indice: 1, acertou: false },
    ])
  })

  it('o placar do arquivo antigo aparece, e a tela diz por que os botões vêm em branco', async () => {
    // O arquivo gravado antes do campo por item: só o placar. Aqui os botões vêm em branco de
    // verdade, e é o único caso em que isso acontece — a tela diz isso em vez de prometer a marca.
    localStorage.setItem(
      CHAVE,
      JSON.stringify({ ...estadoDoDisco(), checkpoints: { [area.areaId]: { acertos: 4, total } } }),
    )
    const { store, CheckpointArea } = await montarNoNavegador()
    const usuario = userEvent.setup()
    render(<CheckpointArea areaId={area.areaId} area={area} />)

    expect(screen.getByRole('status').textContent).toContain(
      `Último resultado gravado: 4 de ${total} — aprovado no critério declarado.`,
    )
    expect(marcasDoItem(1)).toEqual({ acertei: false, errei: false })
    expect(screen.getByText(/gravado antes de o app guardar a marca de cada item/)).toBeTruthy()

    // E julgar um item não apaga o resultado registrado: um julgamento pela metade não revoga a
    // aprovação de quem já tinha fechado o checkpoint.
    await usuario.click(botaoDoItem(1, 'Errei'))
    expect(store.instantaneo().estado.checkpoints[area.areaId]).toEqual({
      itens: [{ indice: 0, acertou: false }],
      placarAntigo: { acertos: 4, total },
    })
    expect(screen.getByRole('status').textContent).toContain(
      `Último resultado gravado: 4 de ${total} — aprovado no critério declarado.`,
    )
  })
})

describe('TarefaDaPassagem — o que fazer do intervalo', () => {
  it('mostra na tela o "o que fazer" e o "se errar" que a seção 11 do tema declara', async () => {
    const { store, TarefaDaPassagem, conteudo } = await montarPainel()
    // Uma passagem errada em D+1: o D+1 continua D+1 (a tabela não o rebaixa) e a passagem
    // seguinte já venceu — é ela que a tela está cobrando.
    store.registrarRecuperacao(TEMA, false, PASSADO)
    const tarefa = tarefaDoTema(conteudo.temas[TEMA]!, 1)
    expect(tarefa).toBeTruthy()
    expect(tarefa!.oQueFazer).toBeTruthy()
    expect(tarefa!.seErrar).toBeTruthy()

    const { container } = render(<TarefaDaPassagem refTema={TEMA} />)

    // A asserção é sobre o TEXTO do material, e não sobre a classe do parágrafo: o corpo do
    // componente pode virar `return null` sem que classe nenhuma deixe de existir.
    expect(screen.getByText('O que fazer nesta passagem (D+1):')).toBeTruthy()
    expect(container.textContent).toContain(tarefa!.oQueFazer)
    expect(container.textContent).toContain(tarefa!.seErrar)
  })
})

describe('fila de hoje — intervalo com tarefa tabelada', () => {
  it('mostra a tarefa que a seção 11 do tema declara, e não só a data', async () => {
    const { store, ResumoProgresso, conteudo } = await montarPainel()
    // Uma falha em D+1 mantém o intervalo em D+1, que a seção 11 tabela.
    store.registrarRecuperacao(TEMA, false, PASSADO)

    const { container } = render(<ResumoProgresso />)
    const linha = linhaDaFila(container)
    expect(linha.querySelector('.resumo-intervalo')!.textContent).toBe('D+1')
    expect(linha.textContent).toContain(conteudo.temas[TEMA]!.titulo)
    const tarefa = tarefaDoTema(conteudo.temas[TEMA]!, 1)!
    expect(tarefa.oQueFazer).toBeTruthy()
    // O exercício da passagem está na fila; a data sozinha esconderia o que fazer.
    expect(linha.textContent).toContain(tarefa.oQueFazer)
  })
})

describe('fila de hoje — intervalo sem linha na seção 11', () => {
  it('diz que não há tarefa para este intervalo e leva de volta à seção 10, sem emprestar tarefa', async () => {
    const { store, ResumoProgresso, conteudo } = await montarPainel()
    const tema = conteudo.temas[TEMA]!
    // Acerto leva a D+7; o erro seguinte rebaixa para D+3, que a seção 11 de nenhum tema tabela
    // (e é a mesma decisão que o degrau final D+90 cobra).
    store.registrarRecuperacao(TEMA, true, PASSADO)
    store.abrirPassagem(TEMA)
    store.registrarRecuperacao(TEMA, false, PASSADO)

    const { container } = render(<ResumoProgresso />)
    const linha = linhaDaFila(container)
    expect(linha.querySelector('.resumo-intervalo')!.textContent).toBe('D+3')
    expect(linha.textContent).toContain('Sem tarefa tabelada para este intervalo')
    // O caminho de volta é a recuperação ativa do PRÓPRIO tema.
    const volta = linha.querySelector('a[href="#/tema/01-fundamentos/TEMA-01/secao-10"]')
    expect(volta).toBeTruthy()
    expect(volta!.textContent).toContain('Voltar à seção 10 do tema')

    // E não empresta a tarefa de outro intervalo do tema: nenhuma das linhas da seção 11
    // (D+1, D+7, D+30) aparece nesta linha da fila.
    const outras = tarefasDaRevisao(tema).filter((t) => t.intervaloDias !== 3)
    expect(outras.length).toBeGreaterThan(0)
    for (const outra of outras) {
      expect(linha.textContent).not.toContain(outra.oQueFazer)
    }
  })
})

describe('fila de hoje — data-releitura', () => {
  it('marca a releitura completa depois de duas passagens falhas seguidas', async () => {
    const { store, ResumoProgresso } = await montarPainel()
    store.registrarRecuperacao(TEMA, true, PASSADO)
    store.abrirPassagem(TEMA)
    store.registrarRecuperacao(TEMA, false, PASSADO)
    store.abrirPassagem(TEMA)
    store.registrarRecuperacao(TEMA, false, PASSADO)
    expect(store.instantaneo().estado.temas[TEMA]!.revisao.falhasSeguidas).toBe(2)

    const { container } = render(<ResumoProgresso />)
    const linha = linhaDaFila(container)
    // O atributo é o que a folha de estilo e o teste leem: sem ele a marca da releitura
    // completa some da linha sem que nada mais mude.
    expect(linha.getAttribute('data-releitura')).toBe('true')
  })

  it('não marca a releitura completa com uma falha só', async () => {
    const { store, ResumoProgresso } = await montarPainel()
    store.registrarRecuperacao(TEMA, false, PASSADO)
    expect(store.instantaneo().estado.temas[TEMA]!.revisao.falhasSeguidas).toBe(1)

    const { container } = render(<ResumoProgresso />)
    const linha = linhaDaFila(container)
    // Um tema vencido e sem releitura devida: o atributo diz isso, e não fica só ausente.
    expect(linha.getAttribute('data-releitura')).toBe('false')
  })
})

describe('fila de hoje — a frase dos intervalos', () => {
  it('lista o D+90 entre os intervalos cobertos quando não há nada vencido', async () => {
    // Nenhum tema no progresso: a fila está vazia e a tela declara quais intervalos ela cobre.
    const { ResumoProgresso } = await montarPainel()
    render(<ResumoProgresso />)

    expect(screen.getByText('nada vencido em D+1, D+7, D+30 ou D+90.')).toBeTruthy()
  })
})

/**
 * Os caminhos do painel que só existem em estado: sem leitura, com a leitura falhada, com fila
 * maior que a lista visível e com tema consolidado. São eles que decidem o que a tela AFIRMA —
 * "0 de 109" e "nada vencido" seriam mentira antes de a leitura voltar, e um tema no degrau final
 * das trilhas não é um vencido qualquer.
 */
describe('painel — o que a tela afirma antes e depois da leitura', () => {
  it('sem a leitura, não afirma nada: diz que está carregando e põe "—" em cada número', async () => {
    const { ResumoProgresso } = await montarPainelLendo()
    const { container } = render(<ResumoProgresso />)

    // O aviso é do estado, não um erro: a leitura ainda não voltou. Ele aparece nas DUAS metades
    // do painel (o resumo e as ações, que vivem dentro dele), porque as duas dependem da leitura.
    expect(screen.getAllByText('carregando o progresso…')).toHaveLength(2)
    // Nenhum número é afirmado: os quatro resumos ficam "—", e não "0 de 109".
    expect(container.querySelectorAll('.resumo-item strong').length).toBeGreaterThanOrEqual(3)
    for (const strong of container.querySelectorAll('.resumo-item strong')) {
      expect(strong.textContent).toBe('—')
    }
    expect(container.querySelector('.resumo-fila')).toBeNull()
    // A frase dos intervalos cobertos NÃO aparece: com os dados pendentes, ela diria que a fila
    // está vazia — e "vazia" e "não lida" são indistinguíveis neste instante.
    expect(container.textContent).not.toContain('nada vencido em D+1')
    // E o convite de "primeira vez aqui" espera a carga: antes dela, vazio e "não lido" são
    // indistinguíveis, e o painel diria "primeira vez" a quem tem 100 temas estudados.
    expect(container.textContent).not.toContain('Primeira vez aqui?')
  })

  it('com a leitura falhada, diz que não leu, desabilita o que escreve e não inventa zeros', async () => {
    compartilhado.noNavegador = false
    compartilhado.provedor = provedorDeTeste(novoRegistro(), {
      leitura: () => Promise.reject(new Error('EIO')),
    })
    vi.resetModules()
    const repositorio = await import('../infrastructure/content/repository')
    await repositorio.carregar()
    const store = await import('../application/progresso-store')
    await store.quandoCarregado()
    const { ResumoProgresso } = await import('./Progresso')

    const { container } = render(<ResumoProgresso />)
    const mensagem = store.instantaneo().erroDeCarga
    expect(mensagem).toBeTruthy()

    // O painel diz que não conseguiu LER — e não que não há nada. A faixa de erro fica junto do
    // resumo, e os números continuam "—".
    expect(container.querySelector('.aviso-erro')?.textContent).toBe(mensagem)
    for (const strong of container.querySelectorAll('.resumo-item strong')) {
      expect(strong.textContent).toBe('—')
    }
    // Importar e recomeçar escrevem: numa sessão que não leu o arquivo, as duas seriam destrutivas
    // (recomeçar apagaria um arquivo que não lemos) — por isso ficam desabilitadas.
    expect((screen.getByRole('button', { name: 'Importar progresso' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Recomeçar' }) as HTMLButtonElement).disabled).toBe(true)
    // Exportar continua valendo: é o que salva o estudo feito nesta sessão antes de fechar.
    expect((screen.getByRole('button', { name: 'Exportar progresso' }) as HTMLButtonElement).disabled).toBe(false)
    // E a tela não conta checkpoint nenhum: sem os domínios lidos, a frase volta ao critério
    // declarado em vez de afirmar "0 respondido(s)".
    expect(container.textContent).toContain(
      'nenhum checkpoint respondido ainda; o critério é o que cada guia declara.',
    )
    expect(container.textContent).not.toContain('respondido(s), no critério declarado')
  })

  it('a fila maior que a lista visível se abre e se fecha pelo botão, que diz o tamanho real', async () => {
    const usuario = userEvent.setup()
    const { store, ResumoProgresso, conteudo } = await montarPainel()
    // Seis temas vencidos (D+1, com a cobrança no passado): a lista visível corta em cinco, e o
    // botão mostra o tamanho REAL da fila em vez de esconder que ela continua.
    const seis = conteudo.ordemEstudo.slice(0, 6)
    for (const ref of seis) store.registrarRecuperacao(ref, false, PASSADO)

    const { container } = render(<ResumoProgresso />)
    expect(container.querySelectorAll('.resumo-fila li')).toHaveLength(5)

    await usuario.click(screen.getByRole('button', { name: 'Ver os 6 vencidos' }))
    expect(container.querySelectorAll('.resumo-fila li')).toHaveLength(6)
    // O `aria-expanded` acompanha a lista: quem usa leitor de tela ouve o estado, e não só o texto
    // do botão. O `aria-controls` aponta para a lista que ele abre.
    const botao = screen.getByRole('button', { name: 'Mostrar só os 5 primeiros' })
    expect(botao.getAttribute('aria-expanded')).toBe('true')
    expect(botao.getAttribute('aria-controls')).toBe(container.querySelector('.resumo-fila')?.id)

    await usuario.click(botao)
    expect(container.querySelectorAll('.resumo-fila li')).toHaveLength(5)
    expect(screen.getByRole('button', { name: 'Ver os 6 vencidos' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('o tema consolidado aparece como a etapa final do D+90, sem tarefa emprestada', async () => {
    const { store, ResumoProgresso } = await montarPainel()
    // A escada inteira (D+1 → D+7 → D+30 → D+90), com a última passagem há mais de 90 dias: o
    // acerto no último degrau CONSOLIDA, e a cobrança da etapa final já venceu — o consolidado não
    // sai da fila, ele volta pelo D+90 (seção 6 das trilhas).
    const ANTIGO = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
    for (let i = 0; i < 4; i++) {
      if (i > 0) store.abrirPassagem(TEMA)
      store.registrarRecuperacao(TEMA, true, ANTIGO)
    }
    const revisao = store.instantaneo().estado.temas[TEMA]?.revisao
    expect(revisao?.consolidado).toBe(true)
    expect(revisao?.intervaloDias).toBe(90)

    const { container } = render(<ResumoProgresso />)
    const linha = linhaDaFila(container)
    expect(linha.querySelector('.resumo-intervalo')?.textContent).toBe('D+90')
    expect(linha.textContent).toContain('etapa final da trilha')
    // Nenhuma seção 11 tabela D+90: a tela NÃO empresta a tarefa de outro intervalo — diz que não
    // há tarefa para este intervalo e devolve o caminho da recuperação ativa.
    expect(linha.textContent).toContain('Sem tarefa tabelada para este intervalo')
    expect(linha.querySelector('a[href$="/secao-10"]')?.getAttribute('href')).toBe('#/tema/01-fundamentos/TEMA-01/secao-10')
  })

  it('conta os checkpoints respondidos quando um guia já foi julgado', async () => {
    const { store, ResumoProgresso, conteudo } = await montarPainel()
    const area = conteudo.areas.find((a) => a.guia.checkpoint.length > 0)!
    const total = area.guia.checkpoint.length
    // Um guia com o checkpoint fechado: o painel para de dizer "nenhum checkpoint respondido" e
    // passa a contar — a frase de estado vazio e a contagem são ramos distintos do mesmo trecho.
    for (let i = 0; i < total; i++) store.registrarVeredictoDeCheckpoint(area.areaId, i, true, total)

    const { container } = render(<ResumoProgresso />)
    expect(container.textContent).toContain('1 respondido(s), no critério declarado em cada guia.')
    expect(container.textContent).not.toContain('nenhum checkpoint respondido ainda')
  })
})

/**
 * A recuperação ativa: é o veredito que reagenda a revisão, e ele é registrado UMA vez por
 * passagem. Repetir o mesmo clique avançava a escada do SRS a cada toque e consolidava o tema sem
 * o usuário ter retido — o caminho de "registrar nova passagem" existe para separar as duas coisas.
 */
describe('recuperação ativa — o veredito que reagenda', () => {
  it('oferece os dois vereditos, mostra o registrado e só reabre com "nova passagem"', async () => {
    const usuario = userEvent.setup()
    const { store, VereditoRecuperacao } = await montarPainel()
    // O tema entra no progresso por um caminho que NÃO registra passagem (marcar como lido): é o
    // estado em que a tela pergunta "como foi nesta passagem?" com a escada ainda intacta — sem
    // passagens nem rebaixamentos, e sem veredito. Um tema já veredictado mostraria o resultado, e
    // não os botões: é a distinção que este teste prende.
    store.marcarLido(TEMA)
    const { container } = render(<VereditoRecuperacao refTema={TEMA} />)

    // A tarefa da passagem é lida da seção 11 do PRÓPRIO tema, com o "se errar" declarado, e o
    // rodapé diz a próxima revisão D+1 — sem contar passagens nem rebaixamentos, que são zero.
    expect(screen.getByText(/O que fazer nesta passagem \(D\+1\):/)).toBeTruthy()
    // O rodapé é o único `role="status"` antes do veredito (o bloco do resultado ainda não existe).
    const rodape = container.querySelector('.proxima-revisao')
    expect(rodape?.textContent).toContain('Próxima revisão em D+1')
    expect(rodape?.textContent).not.toContain('Passagens:')
    expect(rodape?.textContent).not.toContain('Rebaixamentos:')

    // Antes do veredito: os dois botões, e a régua do rebaixamento ao lado.
    expect(screen.getByText(/Errar rebaixa o intervalo/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Acertei sem consultar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Errei ou consultei' })).toBeTruthy()

    await usuario.click(screen.getByRole('button', { name: 'Acertei sem consultar' }))

    // Registrado: os botões somem e o veredito fica dito — junto do próximo intervalo e do número
    // de passagens, que é a régua do SRS.
    // Dois anúncios distintos agora: o do veredito (que substitui os botões) e o do rodapé — a
    // asserção é sobre os dois textos, e não sobre um deles.
    const textos = container.textContent ?? ''
    expect(textos).toContain('Passagem registrada como acerto')
    expect(screen.getByRole('button', { name: 'Registrar nova passagem' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Acertei sem consultar' })).toBeNull()
    expect(store.instantaneo().estado.temas[TEMA]?.revisao.intervaloDias).toBe(7)
    expect(textos).toContain('Próxima revisão em D+7')
    expect(textos).toContain('Passagens: 1.')
    expect(textos).not.toContain('Rebaixamentos:')

    // "Nova passagem" reabre o veredito sem mexer no agendamento: a próxima passagem só muda
    // quando um veredito novo for dado.
    await usuario.click(screen.getByRole('button', { name: 'Registrar nova passagem' }))
    expect(screen.getByRole('button', { name: 'Acertei sem consultar' })).toBeTruthy()
    expect(store.instantaneo().estado.temas[TEMA]?.revisao.intervaloDias).toBe(7)

    await usuario.click(screen.getByRole('button', { name: 'Errei ou consultei' }))
    expect(container.textContent).toContain('Passagem registrada como erro')
    // O erro rebaixa o intervalo e o rebaixamento fica contado: sem a marca, a escada voltaria a
    // subir como se o erro não tivesse acontecido.
    expect(container.textContent).toContain('Próxima revisão em D+3')
    expect(container.textContent).toContain('Rebaixamentos: 1.')
    // E no intervalo D+3 não há linha na seção 11: a tela diz isso e leva à recuperação ativa.
    expect(screen.getByText(/Não há tarefa tabelada para este intervalo \(D\+3\)/)).toBeTruthy()
  })

  it('o botão da seção 10 leva o foco ao bloco da recuperação ativa', async () => {
    const usuario = userEvent.setup()
    const { store, VereditoRecuperacao } = await montarPainel()
    store.registrarRecuperacao(TEMA, true, PASSADO)
    store.abrirPassagem(TEMA)
    store.registrarRecuperacao(TEMA, false, PASSADO)

    // O alvo de verdade da tela do tema (o `BlocoQA` da seção 10 põe esse id no `h2`).
    const alvo = document.createElement('h2')
    alvo.id = 'secao-10'
    alvo.tabIndex = -1
    document.body.append(alvo)

    render(<VereditoRecuperacao refTema={TEMA} />)
    await usuario.click(screen.getByRole('button', { name: 'Ir para a seção 10' }))

    // Rolar sem focar deixaria quem usa leitor de tela no ponto antigo, lendo o que já passou.
    expect(document.activeElement).toBe(alvo)
    alvo.remove()
  })

  it('com o tema fora do conteúdo, não promete agendamento nenhum', async () => {
    const { VereditoRecuperacao } = await montarPainel()
    const { container } = render(<VereditoRecuperacao refTema="99-nao-existe#TEMA-99" />)

    // Sem o tema no progresso e sem o tema no conteúdo: nada de "próxima revisão" (não há
    // agendamento) e nenhuma tarefa — a tela não inventa nem uma coisa nem outra.
    expect(container.textContent).not.toContain('Próxima revisão')
    expect(container.textContent).toContain('Não há tarefa tabelada para este intervalo (D+1)')
    expect(screen.getByRole('button', { name: 'Acertei sem consultar' })).toBeTruthy()
  })

  it('uma passagem já registrada mostra o veredito, e não os botões', async () => {
    const { store, VereditoRecuperacao } = await montarPainel()
    // A passagem registrada como ela fica NO PROGRESSO (acerto em D+1): quem reabre a tela encontra
    // o veredito GRAVADO. Mostrar os botões aqui prometeria perguntar de novo o que já foi
    // respondido — e é por isso que "Registrar nova passagem" é o caminho explícito para reabrir.
    store.registrarRecuperacao(TEMA, true, PASSADO)
    await store.aguardarGravacoes()

    const { container } = render(<VereditoRecuperacao refTema={TEMA} />)
    const textos = container.textContent ?? ''

    expect(textos).toContain('Passagem registrada como acerto')
    expect(textos).toContain('Próxima revisão em D+7')
    expect(textos).toContain('Passagens: 1.')
    // Os dois botões do veredito NÃO estão na tela; só o de reabrir a passagem.
    expect(screen.queryByRole('button', { name: 'Acertei sem consultar' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Errei ou consultei' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Registrar nova passagem' })).toBeTruthy()
  })

  it('o veredito de erro registrado volta como erro, com o rebaixamento contado', async () => {
    const { store, VereditoRecuperacao } = await montarPainel()
    // Um erro em D+1 mantém o intervalo em D+1 e SOMA um rebaixamento: o rodapé tem de dizê-lo,
    // senão a escada voltaria a subir como se o erro não tivesse acontecido.
    store.registrarRecuperacao(TEMA, false, PASSADO)
    await store.aguardarGravacoes()

    const { container } = render(<VereditoRecuperacao refTema={TEMA} />)
    const textos = container.textContent ?? ''

    expect(textos).toContain('Passagem registrada como erro')
    expect(textos).toContain('Rebaixamentos: 1.')
    expect(screen.queryByRole('button', { name: 'Acertei sem consultar' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Registrar nova passagem' })).toBeTruthy()
  })

  it('o tema consolidado diz que a passagem é a etapa final do D+90, sem reabrir os botões', async () => {
    const { store, VereditoRecuperacao } = await montarPainel()
    // A escada inteira (D+1 → D+7 → D+30 → D+90): o acerto no último degrau CONSOLIDA, e o acerto
    // já está registrado — a tela mostra o veredito e a volta pela etapa final, e não os botões.
    const ANTIGO = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
    for (let i = 0; i < 4; i++) {
      if (i > 0) store.abrirPassagem(TEMA)
      store.registrarRecuperacao(TEMA, true, ANTIGO)
    }
    expect(store.instantaneo().estado.temas[TEMA]?.revisao.consolidado).toBe(true)

    const { container } = render(<VereditoRecuperacao refTema={TEMA} />)
    const textos = container.textContent ?? ''

    expect(textos).toContain('Passagem registrada como acerto')
    expect(textos).toContain(
      'Tema consolidado: a escada está cumprida e a próxima passagem é a etapa final, em D+90',
    )
    expect(screen.queryByRole('button', { name: 'Acertei sem consultar' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Registrar nova passagem' })).toBeTruthy()
  })
})

describe('BotaoLido — a leitura é explícita, e não navegação', () => {
  it('marca e desmarca o tema como lido, no progresso', async () => {
    const usuario = userEvent.setup()
    const { store, BotaoLido } = await montarPainel()
    render(<BotaoLido refTema={TEMA} />)

    const botao = screen.getByRole('button', { name: 'Marcar como lido' })
    expect(botao.getAttribute('aria-pressed')).toBe('false')
    expect(botao.className).toBe('botao-secundario')

    await usuario.click(botao)

    const lido = screen.getByRole('button', { name: 'Lido' })
    expect(lido.getAttribute('aria-pressed')).toBe('true')
    // A classe `ativo` é o estado VISÍVEL do botão, e o `aria-pressed` é o anunciado: os dois
    // andam juntos.
    expect(lido.className).toBe('botao-secundario ativo')
    expect(store.instantaneo().estado.temas[TEMA]?.lido).toBe(true)
  })
})

describe('situação da área — o checkpoint no critério do guia', () => {
  const area = areaFake()
  const total = area.guia.checkpoint.length

  /** Julga o checkpoint inteiro: `acertos` primeiros itens certos, o resto errado. */
  function julgar(store: Painel['store'], acertos: number): void {
    for (let i = 0; i < total; i++) {
      store.registrarVeredictoDeCheckpoint(area.areaId, i, i < acertos, total)
    }
  }

  it('diz o checkpoint como ainda não respondido, aprovado ou reprovado', async () => {
    const primeiro = await montarPainel()
    const { unmount } = render(<primeiro.SituacaoDaArea area={area} />)
    // Sem veredito nenhum, a tela não escolhe entre aprovado e reprovado: diz que não foi
    // respondido — o estado vazio não é uma reprovação.
    expect(screen.getByText(/ainda não respondido\./)).toBeTruthy()
    unmount()

    // Quatro acertos de cinco: aprovado no critério que o PRÓPRIO guia declara ("acertar 4 dos 5").
    julgar(primeiro.store, 4)
    const segundo = render(<primeiro.SituacaoDaArea area={area} />)
    expect(segundo.container.textContent).toContain('aprovado no critério declarado.')
    expect(segundo.container.textContent).toContain(`Critério do guia: ${area.guia.criterio}`)
    segundo.unmount()

    // Abaixo do critério: reprovado — e não "ainda não respondido".
    const terceiro = await montarPainel()
    julgar(terceiro.store, 1)
    const { container } = render(<terceiro.SituacaoDaArea area={area} />)
    expect(container.textContent).toContain('reprovado no critério declarado.')
    expect(container.textContent).not.toContain('ainda não respondido')
  })

  it('sem critério legível no guia, o placar aparece sem veredito de aprovação', async () => {
    const { store, CheckpointArea } = await montarPainel()
    // Um guia cujo critério não declara fração nem percentual: o alvo é `null`, e "aprovado" seria
    // uma conclusão que o material não autoriza. O placar aparece; o veredito, não.
    const semAlvo = areaFake({ guia: guiaFake({ criterio: 'leia o tema e decida' }) })
    const totalSemAlvo = semAlvo.guia.checkpoint.length
    for (let i = 0; i < totalSemAlvo; i++) {
      store.registrarVeredictoDeCheckpoint(semAlvo.areaId, i, true, totalSemAlvo)
    }

    const { container } = render(
      <CheckpointArea areaId={semAlvo.areaId} area={semAlvo} id="secao-9" />,
    )

    const placar = container.querySelector('.dominio-checkpoint')?.textContent
    expect(placar).toBe(`Último resultado gravado: ${totalSemAlvo} de ${totalSemAlvo}.`)
    expect(placar).not.toContain('aprovado')
    expect(placar).not.toContain('reprovado')
  })
})

describe('ações de progresso — o caminho que falha e o botão de recomeçar', () => {
  it('a ação que estoura vira aviso na tela, em vez de promessa vazia', async () => {
    const usuario = userEvent.setup()
    const registro = novoRegistro()
    const provedor = provedorDeTeste(registro)
    provedor.exportar = () => Promise.reject(new Error('EIO'))
    const reclamado = vi.spyOn(console, 'error').mockImplementation(() => {})
    compartilhado.noNavegador = false
    compartilhado.provedor = provedor
    vi.resetModules()
    const store = await import('../application/progresso-store')
    await store.quandoCarregado()
    const { AcoesDeProgresso } = await import('./Progresso')

    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Exportar progresso' }))

    // A falha da ação não pode deixar a tela em silêncio: o aviso diz que não deu, e a causa fica
    // no console para quem depura.
    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toBe('Não consegui concluir a ação.'),
    )
    expect(reclamado).toHaveBeenCalledWith('[progresso] falha na acao', expect.any(Error))
    reclamado.mockRestore()
  })

  it('a gravação que falha vira aviso na tela, em vez de silêncio', async () => {
    const provedor = provedorDeTeste(novoRegistro())
    // A gravação rejeita (disco cheio, permissão): o store sinaliza a falha e o painel AVISA, em
    // vez de deixar a impressão de que o progresso foi guardado.
    provedor.gravar = () => Promise.reject(new Error('ENOSPC'))
    const reclamado = vi.spyOn(console, 'error').mockImplementation(() => {})
    compartilhado.noNavegador = false
    compartilhado.provedor = provedor
    vi.resetModules()
    const store = await import('../application/progresso-store')
    await store.quandoCarregado()
    const { AcoesDeProgresso } = await import('./Progresso')

    render(<AcoesDeProgresso />)
    // Um clique que grava: a falha da gravação tem de aparecer, e não sumir num `catch` mudo.
    store.marcarLido(TEMA)
    await store.aguardarGravacoes()

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain(
        'Não consegui gravar o progresso nesta sessão.',
      ),
    )
    expect(reclamado).toHaveBeenCalledWith('[progresso] falha ao gravar', expect.any(Error))
    reclamado.mockRestore()
  })

  it('recomeçar só apaga com a confirmação, e o cancelamento não apaga nada', async () => {
    const usuario = userEvent.setup()
    const { store, AcoesDeProgresso } = await montarPainel()
    store.registrarRecuperacao(TEMA, true, PASSADO)
    await store.aguardarGravacoes()
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual([TEMA])

    // Cancelar (o seletor volta sem confirmação) deixa tudo como estava.
    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<AcoesDeProgresso />)
    await usuario.click(screen.getByRole('button', { name: 'Recomeçar' }))
    expect(confirmar).toHaveBeenCalledWith(
      'Apagar todo o progresso de estudo? Esta ação não pode ser desfeita.',
    )
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual([TEMA])

    // Confirmar apaga o estado — e é o mesmo botão, com a mesma pergunta.
    confirmar.mockReturnValue(true)
    await usuario.click(screen.getByRole('button', { name: 'Recomeçar' }))
    await waitFor(() => expect(Object.keys(store.instantaneo().estado.temas)).toEqual([]))
    confirmar.mockRestore()
  })

  it('na casca desktop, o painel mostra a versão do aplicativo', async () => {
    const { store, AcoesDeProgresso } = await montarPainel()
    expect(store.instantaneo().carregado).toBe(true)
    // A ponte é o que existe na casca desktop e não existe no navegador: com ela, a versão do
    // aplicativo aparece no fim do painel; sem ela, nada é dito (o caminho do navegador).
    const ponte = {
      versao: () => Promise.resolve('1.2.3'),
      progresso: {
        ler: () => Promise.resolve(null),
        gravar: () => Promise.resolve(),
        apagar: () => Promise.resolve(),
        importar: () => Promise.resolve({ estado: 'cancelado' as const }),
        exportar: () => Promise.resolve({ estado: 'ok' as const }),
      },
      aoEscolherNoMenu: () => {},
    }
    ;(window as unknown as { roadmap?: unknown }).roadmap = ponte
    try {
      render(<AcoesDeProgresso />)
      expect(await screen.findByText('Aplicativo desktop, versão 1.2.3.')).toBeTruthy()
    } finally {
      delete (window as unknown as { roadmap?: unknown }).roadmap
    }
  })
})
