// @vitest-environment jsdom
//
// Prova de ponta a ponta do caminho do WEB, com o provedor DE VERDADE (`noNavegador`, sem duble).
//
// O store so desliga a gravacao (`podeGravar = false`) quando `carregar()` REJEITA. No build web a
// leitura colapsava "ausente / JSON corrompido / storage negado" em `null` e nunca rejeitava: o
// store abria zerado com a escrita ligada e o primeiro clique substituia o progresso inteiro pelo
// estado vazio mais um clique. Aqui o `localStorage` tem JSON invalido antes da importacao do
// store, e o que se prova e que ele NAO e sobrescrito e que o motivo chega a tela (`erroDeCarga`).

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE } from '../infrastructure/storage/persistencia'

const AGORA = new Date('2026-03-10T12:00:00.000Z')

/** O que esta guardado no armazenamento do navegador, cru. */
function guardadoCru(): string | null {
  return window.localStorage.getItem(CHAVE)
}

/** Reimporta o store — a carga roda de novo, lendo o armazenamento. */
async function carregarStore() {
  vi.resetModules()
  return await import('./progresso-store')
}

beforeEach(() => {
  window.localStorage.clear()
  delete window.roadmap
})

describe('progresso-store no navegador', () => {
  it('não sobrescreve um progresso que existe e não abre, e explica na tela', async () => {
    const corrompido = '{"versao":1,"temas":{"a#TEMA-01":'
    window.localStorage.setItem(CHAVE, corrompido)
    // A falha de leitura loga em `console.error`; o teste nao precisa do ruido no relatorio.
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const store = await carregarStore()
    await store.quandoCarregado()
    log.mockRestore()

    // O motivo chega a tela: o painel mostra `erroDeCarga`.
    expect(store.instantaneo().erroDeCarga).toContain('não vai gravar por cima')
    expect(store.instantaneo().carregado).toBe(true)

    // E o clique seguinte NAO escreve por cima do que nao conseguimos ler.
    store.marcarLido('a#TEMA-01', AGORA)
    await store.aguardarGravacoes()
    expect(guardadoCru()).toBe(corrompido)

    // A sessao continua utilizavel em memoria.
    expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['a#TEMA-01'])
  })

  it('grava normalmente quando é a primeira vez, sem nada guardado', async () => {
    const store = await carregarStore()
    await store.quandoCarregado()

    expect(store.instantaneo().erroDeCarga).toBeNull()
    store.marcarLido('a#TEMA-01', AGORA)
    await store.aguardarGravacoes()

    const gravado = JSON.parse(guardadoCru() ?? 'null') as { temas: Record<string, unknown> }
    expect(Object.keys(gravado.temas)).toEqual(['a#TEMA-01'])
  })

  it('não sobrescreve quando o armazenamento nega a leitura', async () => {
    // A chave existe e o navegador recusa a leitura (janela privada, politica de origem). Com a
    // leitura devolvendo `null`, isto virava "primeira vez" e liberava a gravacao por cima.
    window.localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, temas: {}, diasAtivos: [] }))
    const leituras = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const gravacoes = vi.spyOn(Storage.prototype, 'setItem')
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const store = await carregarStore()
      await store.quandoCarregado()

      // A leitura negada nao vira "primeira vez": a sessao entra em modo sem escrita e a tela
      // explica. O aviso e o que separa este caso do "comeca vazio".
      expect(store.instantaneo().erroDeCarga).not.toBeNull()

      // E o clique seguinte nao tenta gravar: nenhuma escrita chega ao armazenamento.
      store.marcarLido('a#TEMA-01', AGORA)
      await store.aguardarGravacoes()
      expect(gravacoes).not.toHaveBeenCalled()
      // A sessao segue utilizavel em memoria.
      expect(Object.keys(store.instantaneo().estado.temas)).toEqual(['a#TEMA-01'])
    } finally {
      log.mockRestore()
      leituras.mockRestore()
      gravacoes.mockRestore()
    }
  })
})
