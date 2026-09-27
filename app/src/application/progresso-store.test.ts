// O store e o unico modulo que pode destruir dado do usuario: ele le, aplica e grava por
// cima. Estes testes cobrem os caminhos em que a ordem das operacoes importa — acao antes
// da carga, falha de leitura, falha de gravacao, gravacoes sobrepostas.
//
// O provedor e trocado antes da importacao do modulo, porque o store resolve o provedor
// uma vez, no topo do arquivo, e ja dispara a carga ali.

import { describe, expect, it, vi } from 'vitest'
import type { Persistencia } from '../infrastructure/storage/persistencia'

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

const AGORA = new Date('2026-03-10T12:00:00.000Z')

/**
 * Um estado como o que estaria no disco: um tema já estudado, com uma revisão agendada de
 * verdade, e um dia registrado.
 *
 * A revisão vem no lugar certo — dentro de `revisao`, e não solta no nível do tema. Fora do
 * objeto, o normalizador a descarta (`normalizarRevisao` recebe `undefined` e devolve o estado
 * inicial), e o teste passaria sem provar que uma revisão real sobrevive à carga.
 */
function estadoDoDisco(): unknown {
  return {
    versao: 1,
    temas: {
      'a#TEMA-01': {
        ref: 'a#TEMA-01',
        lido: true,
        preTeste: {},
        recuperacaoOk: true,
        revisao: {
          ref: 'a#TEMA-01',
          intervaloDias: 7,
          proximaRevisao: '2026-03-17T12:00:00.000Z',
          rebaixamentos: 1,
          passagens: 2,
          falhasSeguidas: 0,
          consolidado: false,
        },
      },
    },
    checkpoints: {},
    diasAtivos: ['2026-03-09'],
  }
}

interface Registro {
  gravados: unknown[]
  apagou: number
  /** Maior numero de gravacoes simultaneas observado. */
  pico: number
}

function provedorDeTeste(opcoes: {
  leitura?: () => Promise<unknown | null>
  gravacao?: (valor: unknown) => Promise<void>
  importacao?: () => Promise<unknown>
} = {}) {
  const registro: Registro = { gravados: [], apagou: 0, pico: 0 }
  let emVoo = 0
  const provedor: Persistencia = {
    descricao: 'num arquivo de teste',
    carregar: opcoes.leitura ?? (() => Promise.resolve(null)),
    gravar: async (valor) => {
      emVoo += 1
      registro.pico = Math.max(registro.pico, emVoo)
      try {
        if (opcoes.gravacao) await opcoes.gravacao(valor)
        else registro.gravados.push(valor)
      } finally {
        emVoo -= 1
      }
    },
    apagar: async () => {
      registro.apagou += 1
    },
    exportar: async () => ({ estado: 'ok' as const, caminho: '/tmp/progresso.json' }),
    importar: async () =>
      opcoes.importacao ? (opcoes.importacao() as never) : ({ estado: 'cancelado' } as never),
  }
  return { provedor, registro }
}

async function carregarStore(provedor: Persistencia) {
  compartilhado.provedor = provedor
  vi.resetModules()
  return await import('./progresso-store')
}

describe('progresso-store', () => {
  it('não descarta a ação que chega antes da carga, e não grava por cima', async () => {
    let liberar: (valor: unknown | null) => void = () => undefined
    const leitura = new Promise<unknown | null>((resolver) => {
      liberar = resolver
    })
    const { provedor, registro } = provedorDeTeste({ leitura: () => leitura })
    const store = await carregarStore(provedor)

    // O clique acontece antes de a leitura voltar — no desktop ela atravessa o IPC.
    store.marcarLido('a#TEMA-02', AGORA)

    // Nada foi para o disco: gravar agora substituiria o arquivo pelo vazio mais um clique.
    expect(registro.gravados).toHaveLength(0)
    expect(store.instantaneo().carregado).toBe(false)

    liberar(estadoDoDisco())
    await store.quandoCarregado()
    await store.aguardarGravacoes()

    // O estado final tem o que veio do disco E o clique: a intenção foi reaplicada. O dia
    // de 10 entra porque a leitura também marca o dia do estudo.
    const { estado } = store.instantaneo()
    expect(Object.keys(estado.temas).sort()).toEqual(['a#TEMA-01', 'a#TEMA-02'])
    expect(estado.temas['a#TEMA-01']?.recuperacaoOk).toBe(true)
    // E a revisão do disco sobreviveu à carga — o fixture a traz dentro de `revisao`, e não solta
    // no nível do tema: sem isso o normalizador a descartaria e esta asserção não provaria nada.
    expect(estado.temas['a#TEMA-01']?.revisao).toMatchObject({
      intervaloDias: 7,
      proximaRevisao: '2026-03-17T12:00:00.000Z',
      rebaixamentos: 1,
      passagens: 2,
    })
    expect(estado.diasAtivos).toEqual(['2026-03-09', '2026-03-10'])
    // E a gravação única já contém o histórico inteiro.
    expect(registro.gravados).toHaveLength(1)
  })

  it('não grava nada quando a leitura falha, e explica na tela', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.reject(new Error('EIO')),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    // A falha aparece: "começa vazio" em silêncio é o que consolida a perda.
    const erro = store.instantaneo().erroDeCarga
    expect(erro).toContain('não vai gravar por cima')
    expect(store.instantaneo().carregado).toBe(true)

    // E o clique seguinte não escreve por cima do que não conseguimos ler.
    store.marcarLido('a#TEMA-01', AGORA)
    await store.aguardarGravacoes()
    expect(registro.gravados).toHaveLength(0)
    // A sessão continua utilizável em memória.
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['a#TEMA-01'])
  })

  it('avisa quando a gravação falha e limpa o aviso na gravação seguinte', async () => {
    let falhar = true
    const { provedor } = provedorDeTeste({
      gravacao: () => (falhar ? Promise.reject(new Error('ENOSPC')) : Promise.resolve()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    store.marcarLido('a#TEMA-01', AGORA)
    await store.aguardarGravacoes()
    expect(store.instantaneo().falhaAoGravar).toBe(true)

    falhar = false
    store.marcarLido('a#TEMA-02', AGORA)
    await store.aguardarGravacoes()
    expect(store.instantaneo().falhaAoGravar).toBe(false)
  })

  it('enfileira as gravações em vez de sobrepor duas', async () => {
    const { provedor, registro } = provedorDeTeste({
      gravacao: () => new Promise((resolver) => setTimeout(resolver, 1)),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    store.marcarLido('a#TEMA-01', AGORA)
    store.marcarLido('a#TEMA-02', AGORA)
    store.marcarLido('a#TEMA-03', AGORA)
    await store.aguardarGravacoes()

    // Duas gravações em voo disputariam o mesmo arquivo temporário (ENOENT no rename).
    expect(registro.pico).toBe(1)
  })

  it('exporta o estado carregado, nunca o vazio', async () => {
    let liberar: (valor: unknown | null) => void = () => undefined
    const leitura = new Promise<unknown | null>((resolver) => {
      liberar = resolver
    })
    const exportados: unknown[] = []
    const { provedor } = provedorDeTeste({ leitura: () => leitura })
    provedor.exportar = async (valor) => {
      exportados.push(valor)
      return { estado: 'ok', caminho: '/tmp/x.json' }
    }
    const store = await carregarStore(provedor)

    // Exportar sem esperar a carga produziria um arquivo com o estudo de ninguém.
    const pendente = store.exportar()
    liberar(estadoDoDisco())
    const aviso = await pendente

    expect(exportados).toHaveLength(1)
    expect(exportados[0]).toMatchObject({ temas: { 'a#TEMA-01': expect.anything() } })
    expect(aviso).toEqual({ tipo: 'ok', texto: expect.stringContaining('/tmp/x.json') })
  })

  it('recusa arquivo que não é um progresso, sem tocar no que existe', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
      importacao: () => Promise.resolve({ estado: 'ok', dado: { foo: 1 } }),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const aviso = await store.importar()

    expect(aviso).toEqual({ tipo: 'erro', texto: expect.stringContaining('não é um progresso') })
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['a#TEMA-01'])
    expect(registro.gravados).toHaveLength(0)
  })

  it('importa um arquivo com a forma certa', async () => {
    const importado = {
      versao: 1,
      temas: { 'b#TEMA-01': { ref: 'b#TEMA-01', lido: true, preTeste: {} } },
      checkpoints: {},
      diasAtivos: [],
    }
    const { provedor } = provedorDeTeste({
      importacao: () => Promise.resolve({ estado: 'ok', dado: importado }),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    await expect(store.importar()).resolves.toEqual({ tipo: 'ok', texto: 'Progresso importado.' })
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['b#TEMA-01'])
  })

  it('não responde "importado" quando a gravação do import falha', async () => {
    // A gravação era só enfileirada: a resposta "Progresso importado." saía mesmo quando ela
    // lançava (teto, ENOSPC) e o arquivo continuava o antigo. A pessoa fechava o app confiando
    // numa importação que nunca existiu.
    const importado = {
      versao: 1,
      temas: { 'b#TEMA-01': { ref: 'b#TEMA-01', lido: true, preTeste: {} } },
      checkpoints: {},
      diasAtivos: [],
    }
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
      gravacao: () => Promise.reject(new Error('ENOSPC')),
      importacao: () => Promise.resolve({ estado: 'ok', dado: importado }),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const aviso = await store.importar()

    expect(aviso?.tipo).toBe('erro')
    expect(aviso?.texto).toContain('Não consegui gravar o progresso importado')
    // Nada chegou ao provedor: a importação não virou arquivo.
    expect(registro.gravados).toHaveLength(0)
  })

  it('espera a gravação terminar antes de responder "importado"', async () => {
    let liberar: () => void = () => undefined
    const emVoo = new Promise<void>((resolver) => {
      liberar = resolver
    })
    let gravacoes = 0
    const importado = {
      versao: 1,
      temas: { 'b#TEMA-01': { ref: 'b#TEMA-01', lido: true, preTeste: {} } },
      checkpoints: {},
      diasAtivos: [],
    }
    const { provedor } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
      gravacao: () => {
        gravacoes += 1
        return emVoo
      },
      importacao: () => Promise.resolve({ estado: 'ok', dado: importado }),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const promessa = store.importar()
    let respondido = false
    void promessa.then(() => {
      respondido = true
    })
    // Um macrotique basta para a importação chegar à gravação e parar nela. Sem `setImmediate`
    // isto mediria a ordem dos microtiques, e não se a resposta esperou o disco.
    await new Promise((resolver) => setImmediate(resolver))
    expect([gravacoes, respondido]).toEqual([1, false])

    liberar()
    await expect(promessa).resolves.toEqual({ tipo: 'ok', texto: 'Progresso importado.' })
  })

  it('recomeçar apaga o arquivo e zera o estado', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()
    expect(Object.keys(store.instantaneo().estado.temas)).toHaveLength(1)

    await store.recomecar()

    expect(registro.apagou).toBe(1)
    expect(store.instantaneo().estado).toMatchObject({ temas: {}, diasAtivos: [] })
  })

  it('não finge importar quando a sessão não pode gravar', async () => {
    // Com a leitura falhando, `podeGravar` fica falso. Substituir em memória e dizer
    // "importado" daria a impressão de que o arquivo foi salvo — no dia seguinte não
    // estaria lá.
    const importado = {
      versao: 1,
      temas: { 'b#TEMA-01': { ref: 'b#TEMA-01', lido: true, preTeste: {} } },
      checkpoints: {},
      diasAtivos: [],
    }
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.reject(new Error('EIO')),
      importacao: () => Promise.resolve({ estado: 'ok', dado: importado }),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const aviso = await store.importar()

    expect(aviso?.tipo).toBe('erro')
    expect(aviso?.texto).toContain('não pode gravar')
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual([])
    expect(registro.gravados).toHaveLength(0)
  })

  it('recomeçar não apaga o arquivo quando a leitura falhou', async () => {
    // A ação mais destrutiva do app não pode rodar numa sessão que não conseguiu ler: ela
    // apagaria justamente o que não conseguimos abrir.
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.reject(new Error('EIO')),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const aviso = await store.recomecar()

    expect(aviso?.tipo).toBe('erro')
    expect(registro.apagou).toBe(0)
  })

  it('recomeçar entra na fila das gravações', async () => {
    // Fora de ordem, a sequência possível é gravar o temporário, apagar o alvo e só então
    // renomear: o arquivo volta com o estado antigo enquanto a tela mostra zero. O registro
    // precisa do FIM da gravação, e não do começo: só "gravacao, apagar" também aconteceria
    // com o `apagar` fora da fila, porque a primeira etapa da gravação já teria rodado.
    const ordem: string[] = []
    const { provedor } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
      gravacao: async () => {
        ordem.push('gravacao-inicio')
        await new Promise((r) => setTimeout(r, 5))
        ordem.push('gravacao-fim')
      },
    })
    provedor.apagar = async () => {
      ordem.push('apagar')
    }
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    store.marcarLido('a#TEMA-02', AGORA)
    await store.recomecar()

    expect(ordem).toEqual(['gravacao-inicio', 'gravacao-fim', 'apagar'])
  })

  it('não passa pela gravação quando o redutor não muda nada', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    // O tema já está lido: o redutor devolve a mesma referência e nada é gravado.
    store.marcarLido('a#TEMA-01', AGORA)
    await store.aguardarGravacoes()
    expect(registro.gravados).toHaveLength(0)
  })

  it('grava o placar do item do quiz e o dia em que ele foi respondido', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    store.registrarQuestao('a#TEMA-01#E01', false, AGORA)
    store.registrarQuestao('a#TEMA-01#E01', true, AGORA)
    await store.aguardarGravacoes()

    const { estado } = store.instantaneo()
    expect(estado.questoes['a#TEMA-01#E01']).toMatchObject({ acertos: 1, erros: 1 })
    expect(estado.diasAtivos).toContain('2026-03-10')
    // Cada resposta é uma gravação, com o acumulado até ali: no disco o placar não fica
    // esperando o fim do quiz.
    expect(registro.gravados).toHaveLength(2)
    expect(registro.gravados[1]).toMatchObject({
      questoes: { 'a#TEMA-01#E01': { acertos: 1, erros: 1 } },
    })
  })

  it('não grava a resposta sem id, porque o redutor devolve a mesma referência', async () => {
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    store.registrarQuestao('', true, AGORA)
    await store.aguardarGravacoes()

    expect(registro.gravados).toHaveLength(0)
    expect(Object.keys(store.instantaneo().estado.questoes)).toEqual([])
  })

  it('expõe as ações do estudo: cada uma encadeia o redutor do domínio', async () => {
    // A fiação entre a tela e o domínio: um nome trocado aqui passaria por todos os testes de
    // `src/domain/progresso.ts`, que exercitam o redutor direto e não a ponte.
    const { provedor, registro } = provedorDeTeste({
      leitura: () => Promise.resolve(estadoDoDisco()),
    })
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    // A abertura zera o veredito da passagem anterior; o registro seguinte grava o novo. A ordem
    // importa: `registrarRecuperacao` é no-op enquanto houver veredito em aberto.
    store.abrirPassagem('a#TEMA-01', AGORA)
    store.registrarRecuperacao('a#TEMA-01', false, AGORA)
    store.registrarConfianca('a#TEMA-01', 0, 4, AGORA)
    store.registrarVeredictoDeCheckpoint('01-fundamentos', 0, true, 5, AGORA)
    store.registrarDiagnostico('91-trilhas/plano-12-meses', 0, true, AGORA)
    store.registrarArtefato('01-fundamentos#1', true, AGORA)
    await store.aguardarGravacoes()

    const { estado } = store.instantaneo()
    expect(estado.temas['a#TEMA-01']?.preTeste).toEqual([{ indice: 0, confianca: 4 }])
    expect(estado.temas['a#TEMA-01']?.recuperacaoOk).toBe(false)
    expect(estado.checkpoints['01-fundamentos']?.itens).toEqual([{ indice: 0, acertou: true }])
    expect(estado.diagnosticos['91-trilhas/plano-12-meses']).toEqual([{ indice: 0, acertou: true }])
    expect(estado.artefatos['01-fundamentos#1']?.produzido).toBe(true)
    // Cada ação é uma gravação: no disco o estado não fica esperando o fim da sessão.
    expect(registro.gravados).toHaveLength(6)
  })

  it('traduz o resultado do provedor ao exportar: erro sem mensagem, ok sem caminho e cancelado', async () => {
    const { provedor } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    // `erro` sem mensagem usa o texto padrão — nunca "undefined" na tela.
    provedor.exportar = async () => ({ estado: 'erro' })
    await expect(store.exportar()).resolves.toEqual({ tipo: 'erro', texto: 'Não consegui exportar.' })

    // No navegador não há caminho escolhido: a resposta é neutra, não um erro.
    provedor.exportar = async () => ({ estado: 'ok' })
    await expect(store.exportar()).resolves.toEqual({ tipo: 'ok', texto: 'Progresso exportado.' })

    // Cancelar o diálogo não é erro nem sucesso: a tela não mostra aviso nenhum.
    provedor.exportar = async () => ({ estado: 'cancelado' })
    await expect(store.exportar()).resolves.toBeNull()
  })

  it('traduz o resultado do provedor ao importar: cancelado e erro', async () => {
    const { provedor, registro } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    provedor.importar = async () => ({ estado: 'cancelado' })
    await expect(store.importar()).resolves.toBeNull()

    provedor.importar = async () => ({ estado: 'erro', mensagem: 'O arquivo passa de 1 MB.' })
    await expect(store.importar()).resolves.toEqual({
      tipo: 'erro',
      texto: 'O arquivo passa de 1 MB.',
    })
    // Nem cancelar nem recusar o arquivo tocam no que está guardado.
    expect(registro.gravados).toHaveLength(0)
  })
})
