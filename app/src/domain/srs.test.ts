import { describe, expect, it } from 'vitest'
import { estadoFake } from './testes/fixtures'
import {
  criarEstado,
  estaVencido,
  filaDeHoje,
  intervaloInicial,
  proximoIntervalo,
  registrarRevisao,
  SEQUENCIA_DIAS,
} from './srs'

const AGORA = new Date('2026-03-10T12:00:00.000Z')

describe('proximoIntervalo', () => {
  it('usa a sequência declarada no material', () => {
    expect(SEQUENCIA_DIAS).toEqual([1, 7, 30])
    expect(intervaloInicial()).toBe(1)
  })

  it('avança 1 → 7 → 30 no acerto', () => {
    expect(proximoIntervalo(1, true)).toBe(7)
    expect(proximoIntervalo(7, true)).toBe(30)
  })

  it('consolida depois do último intervalo', () => {
    expect(proximoIntervalo(30, true)).toBeNull()
  })

  it('rebaixa pela tabela do material no erro (D+7 no lugar de D+30, D+3 no lugar de D+7)', () => {
    expect(proximoIntervalo(30, false)).toBe(7)
    expect(proximoIntervalo(7, false)).toBe(3)
    expect(proximoIntervalo(1, false)).toBe(1)
  })

  it('cai na metade para intervalo fora da tabela', () => {
    expect(proximoIntervalo(3, false)).toBe(1)
  })

  it('volta para a sequência depois de um intervalo intermediário', () => {
    expect(proximoIntervalo(3, true)).toBe(7)
  })
})

describe('criarEstado', () => {
  it('agenda a primeira revisão para D+1', () => {
    const e = criarEstado('a#TEMA-01', AGORA)
    expect(e.intervaloDias).toBe(1)
    expect(e.proximaRevisao).toBe('2026-03-11T12:00:00.000Z')
    expect(e.passagens).toBe(0)
    expect(e.consolidado).toBe(false)
  })
})

describe('registrarRevisao', () => {
  it('avança e reinicia o prazo no acerto', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 1 }), true, AGORA)
    expect(e.intervaloDias).toBe(7)
    expect(e.proximaRevisao).toBe('2026-03-17T12:00:00.000Z')
    expect(e.passagens).toBe(1)
    expect(e.rebaixamentos).toBe(0)
  })

  it('rebaixa e conta o rebaixamento no erro', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 30 }), false, AGORA)
    expect(e.intervaloDias).toBe(7)
    expect(e.passagens).toBe(1)
    expect(e.rebaixamentos).toBe(1)
  })

  it('consolida ao acertar no último intervalo', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 30 }), true, AGORA)
    expect(e.consolidado).toBe(true)
    expect(e.passagens).toBe(1)
  })

  it('não regride a contagem de passagens', () => {
    let e = criarEstado('a#TEMA-01', AGORA)
    const passagens: number[] = []
    for (const acertou of [true, false, true, true, false]) {
      e = registrarRevisao(e, acertou, AGORA)
      passagens.push(e.passagens)
    }
    expect(passagens).toEqual([1, 2, 3, 4, 5])
  })

  it('mantém a próxima revisão sempre no futuro', () => {
    let e = criarEstado('a#TEMA-01', AGORA)
    for (const acertou of [true, false, true, false, true, true]) {
      e = registrarRevisao(e, acertou, AGORA)
      expect(new Date(e.proximaRevisao).getTime()).toBeGreaterThan(AGORA.getTime())
    }
  })
})

describe('estaVencido', () => {
  it('vence quando o prazo chegou', () => {
    expect(estaVencido(estadoFake({ proximaRevisao: '2026-03-10T12:00:00.000Z' }), AGORA)).toBe(true)
    expect(estaVencido(estadoFake({ proximaRevisao: '2026-03-10T12:00:01.000Z' }), AGORA)).toBe(false)
  })

  it('nunca vence um tema consolidado', () => {
    const e = estadoFake({ consolidado: true, proximaRevisao: '2020-01-01T00:00:00.000Z' })
    expect(estaVencido(e, AGORA)).toBe(false)
  })
})

describe('filaDeHoje', () => {
  it('devolve só os vencidos, do mais atrasado para o mais recente', () => {
    const estados = [
      estadoFake({ ref: 'a#TEMA-02', proximaRevisao: '2026-03-09T12:00:00.000Z' }),
      estadoFake({ ref: 'a#TEMA-03', proximaRevisao: '2026-04-01T12:00:00.000Z' }),
      estadoFake({ ref: 'a#TEMA-01', proximaRevisao: '2026-03-01T12:00:00.000Z' }),
    ]
    expect(filaDeHoje(estados, AGORA).map((e) => e.ref)).toEqual(['a#TEMA-01', 'a#TEMA-02'])
  })
})
