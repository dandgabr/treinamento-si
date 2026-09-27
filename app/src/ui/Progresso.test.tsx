// @vitest-environment jsdom
//
// Teste de componente de `AcoesDeProgresso`: os dois caminhos que só tinham teste de domínio
// — exportar e importar. O provedor de persistência é trocado para o teste capturar o objeto
// exportado e devolver o arquivo escolhido; o componente, o store e a forma do progresso são
// os de verdade. Nada aqui muda o formato do progresso: ele está congelado e tem migração.
//
// O store resolve o provedor e dispara a carga UMA vez, na importação. Por isso cada teste
// reseta os módulos e reimporta o componente e o store, com o provedor já no lugar.
//
// O bloco final cobre a FILA DE HOJE e a tarefa da passagem, que vivem no mesmo arquivo
// (`ResumoProgresso`, `TarefaDaPassagem`). Ali o conteúdo é o de verdade — o mesmo
// `content.json` que a tela lê, carregado por `carregar()` —, porque a fila mostra a coluna
// "O que fazer" da seção 11 de cada tema: sem o material carregado não há tarefa para cobrar.

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { tarefaDoTema, tarefasDaRevisao } from '../application/revisao-espacada'
import type { Conteudo } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz — e nada de exportar/importar
// passa por ele. O mock evita carregar a biblioteca inteira num teste que não a exercita.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown as Persistencia }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

const AGORA = new Date('2026-03-10T12:00:00.000Z')

/** Um estado como o do disco: um tema já estudado e um dia registrado. */
function estadoDoDisco(): unknown {
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
  compartilhado.provedor = provedor
  vi.resetModules()
  const store = await import('../application/progresso-store')
  const { AcoesDeProgresso } = await import('./Progresso')
  await store.quandoCarregado()
  return { store, AcoesDeProgresso }
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
  conteudo: Conteudo
}

/**
 * O store de verdade, com o provedor trocado e o conteúdo de verdade carregado: a fila lê a
 * coluna "O que fazer" da seção 11 do material, e sem ele nenhum tema teria tarefa.
 */
async function montarPainel(): Promise<Painel> {
  compartilhado.provedor = provedorDeTeste(novoRegistro())
  vi.resetModules()
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const store = await import('../application/progresso-store')
  await store.quandoCarregado()
  const { TarefaDaPassagem, ResumoProgresso } = await import('./Progresso')
  return { store, TarefaDaPassagem, ResumoProgresso, conteudo: repositorio.content }
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
