// @vitest-environment jsdom
//
// O ambiente do store: os hooks (a única ponte entre o estado do módulo e o React) e as ações que
// dependem do DOM — o diálogo de confirmação do "recomeçar" e os itens de menu do desktop.
//
// Os hooks existem para a tela reagir: eles INSCREVEM e desinscrevem no conjunto de ouvintes, e é
// essa assinatura que re-renderiza quando o estado muda. Sem render, `notificar()` percorreria um
// conjunto vazio e nada seria provado.
//
// O provedor é trocado antes da importação do módulo, como em `progresso-store.test.ts`: o store
// resolve o provedor uma vez, no topo do arquivo, e já dispara a carga ali.

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PonteDoApp } from '../infrastructure/storage/ponte'
import type { Persistencia } from '../infrastructure/storage/persistencia'

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

const AGORA = new Date('2026-03-10T12:00:00.000Z')

interface Registro {
  gravados: unknown[]
  apagou: number
  exportou: number
  importou: number
}

function provedorDeTeste(
  opcoes: {
    leitura?: () => Promise<unknown | null>
    gravacao?: () => Promise<void>
    exportacao?: () => Promise<unknown>
  } = {},
) {
  const registro: Registro = { gravados: [], apagou: 0, exportou: 0, importou: 0 }
  const provedor: Persistencia = {
    descricao: 'num arquivo de teste',
    carregar: opcoes.leitura ?? (() => Promise.resolve(null)),
    gravar: async (valor) => {
      if (opcoes.gravacao) await opcoes.gravacao()
      else registro.gravados.push(valor)
    },
    apagar: async () => {
      registro.apagou += 1
    },
    exportar: async () => {
      registro.exportou += 1
      return (opcoes.exportacao ? await opcoes.exportacao() : { estado: 'ok' }) as never
    },
    importar: async () => {
      registro.importou += 1
      return { estado: 'cancelado' } as const
    },
  }
  return { provedor, registro }
}

async function carregarStore(provedor: Persistencia) {
  compartilhado.provedor = provedor
  vi.resetModules()
  return await import('./progresso-store')
}

/** A ponte do desktop falsa, com o ouvinte de menu capturado para o teste acionar. */
function ponteFalsa(): { ponte: PonteDoApp; acionar: (acao: string) => void } {
  let ouvinte: ((acao: string) => void) | null = null
  const ponte: PonteDoApp = {
    versao: () => Promise.resolve('0.1.0'),
    progresso: {
      ler: () => Promise.resolve(null),
      gravar: () => Promise.resolve(),
      apagar: () => Promise.resolve(),
      importar: () => Promise.resolve({ estado: 'cancelado' }),
      exportar: () => Promise.resolve({ estado: 'ok' }),
    },
    aoEscolherNoMenu: (o) => {
      ouvinte = o
    },
  }
  return {
    ponte,
    acionar: (acao) => {
      if (!ouvinte) throw new Error('ligarMenuDoApp não registrou o ouvinte')
      ouvinte(acao)
    },
  }
}

/** Um macrotique basta para a ação do menu (assíncrona) chegar ao fim. */
const deixarRodar = () => new Promise((resolver) => setImmediate(resolver))

beforeEach(() => {
  delete window.roadmap
})

afterEach(() => cleanup())

describe('hooks do store', () => {
  it('o hook de progresso acompanha a mudança do estado', async () => {
    const { provedor } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const { result } = renderHook(() => store.useProgresso())
    expect(Object.keys(result.current.temas)).toEqual([])

    act(() => {
      store.marcarLido('a#TEMA-01', AGORA)
    })
    expect(Object.keys(result.current.temas)).toEqual(['a#TEMA-01'])
  })

  it('os hooks de carga leem o estado da sessão', async () => {
    const { provedor } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    expect(renderHook(() => store.useCarregado()).result.current).toBe(true)
    expect(renderHook(() => store.useErroDeCarga()).result.current).toBeNull()
  })

  it('o hook de falha acompanha a gravação que falhou', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const { provedor } = provedorDeTeste({ gravacao: () => Promise.reject(new Error('ENOSPC')) })
      const store = await carregarStore(provedor)
      await store.quandoCarregado()

      const { result } = renderHook(() => store.useFalhaAoGravar())
      expect(result.current).toBe(false)

      await act(async () => {
        store.marcarLido('a#TEMA-01', AGORA)
        await store.aguardarGravacoes()
      })
      expect(result.current).toBe(true)
    } finally {
      log.mockRestore()
    }
  })

  it('ondeFicaOProgresso entrega a descrição do provedor escolhido', async () => {
    const { provedor } = provedorDeTeste()
    const store = await carregarStore(provedor)
    expect(store.ondeFicaOProgresso()).toBe('num arquivo de teste')
  })
})

describe('ações que dependem do DOM', () => {
  it('recomeçar com confirmação apaga só quando o diálogo confirma', async () => {
    const { provedor, registro } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    try {
      await expect(store.recomecarComConfirmacao()).resolves.toBeNull()
      expect(registro.apagou).toBe(0)

      confirmar.mockReturnValue(true)
      await expect(store.recomecarComConfirmacao()).resolves.toBeNull()
      expect(registro.apagou).toBe(1)
    } finally {
      confirmar.mockRestore()
    }
  })

  it('definirProgresso substitui pelo estado normalizado e agenda a gravação', async () => {
    const { provedor, registro } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    const aviso = store.definirProgresso(
      { versao: 1, temas: { 'b#TEMA-01': { lido: true } }, checkpoints: {}, diasAtivos: [] },
      AGORA,
    )
    expect(aviso).toBeNull()
    await store.aguardarGravacoes()
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['b#TEMA-01'])
    expect(registro.gravados).toHaveLength(1)
  })

  it('definirProgresso recusa numa sessão que não pode escrever', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const { provedor, registro } = provedorDeTeste({ leitura: () => Promise.reject(new Error('EIO')) })
      const store = await carregarStore(provedor)
      await store.quandoCarregado()

      // Substituir em memória numa sessão que não grava daria a impressão de que o arquivo foi
      // salvo — no dia seguinte não estaria lá.
      const aviso = store.definirProgresso(
        { versao: 1, temas: {}, checkpoints: {}, diasAtivos: [] },
        AGORA,
      )
      expect(aviso?.tipo).toBe('erro')
      expect(registro.gravados).toHaveLength(0)
    } finally {
      log.mockRestore()
    }
  })

  it('liga os itens de menu às mesmas ações dos botões', async () => {
    const { provedor, registro } = provedorDeTeste()
    const store = await carregarStore(provedor)
    await store.quandoCarregado()

    // Sem a ponte do desktop não há menu a ligar: a chamada não pode estourar.
    store.ligarMenuDoApp()

    const { ponte, acionar } = ponteFalsa()
    window.roadmap = ponte
    store.ligarMenuDoApp()

    const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(false)
    try {
      acionar('exportar')
      await deixarRodar()
      expect(registro.exportou).toBe(1)

      acionar('importar')
      await deixarRodar()
      expect(registro.importou).toBe(1)

      // `apagar` passa pelo diálogo: com a resposta negativa, nada é apagado.
      acionar('apagar')
      await deixarRodar()
      expect(registro.apagou).toBe(0)
    } finally {
      confirmar.mockRestore()
    }
  })

  it('a ação de menu que falha fica no console, sem derrubar o app', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const { provedor } = provedorDeTeste({ exportacao: () => Promise.reject(new Error('EIO')) })
      const store = await carregarStore(provedor)
      await store.quandoCarregado()

      const { ponte, acionar } = ponteFalsa()
      window.roadmap = ponte
      store.ligarMenuDoApp()

      acionar('exportar')
      await deixarRodar()
      expect(log).toHaveBeenCalled()
    } finally {
      log.mockRestore()
    }
  })
})
