import { describe, expect, it } from 'vitest'
import { calcularCalibracao, respostasDe } from './calibracao'
import type { RespostaPreTeste } from './progresso'
import { progressoFake, temaFake } from './testes/fixtures'

const r = (confianca: RespostaPreTeste['confianca'], acertou: boolean, indice = 0): RespostaPreTeste => ({
  indice,
  confianca,
  acertou,
})

describe('calcularCalibracao', () => {
  it('sem amostra devolve null em vez de NaN', () => {
    const c = calcularCalibracao([])
    expect(c.brier).toBeNull()
    expect(c.confiancaMedia).toBeNull()
    expect(c.acertoMedio).toBeNull()
    expect(c.amostra).toBe(0)
    expect(c.celulas).toHaveLength(5)
  })

  it('preenche a matriz por nível de confiança, mesmo vazia', () => {
    const c = calcularCalibracao([r(1, false), r(3, true, 1), r(3, false, 2), r(5, true, 3)])
    expect(c.celulas).toEqual([
      { confianca: 1, acertos: 0, total: 1 },
      { confianca: 2, acertos: 0, total: 0 },
      { confianca: 3, acertos: 1, total: 2 },
      { confianca: 4, acertos: 0, total: 0 },
      { confianca: 5, acertos: 1, total: 1 },
    ])
  })

  it('calcula o Brier com valor conferido à mão', () => {
    // (0,2-0)² + (0,6-1)² + (0,6-0)² + (1-1)² = 0,04 + 0,16 + 0,36 + 0 = 0,56 ; /4 = 0,14
    const c = calcularCalibracao([r(1, false), r(3, true, 1), r(3, false, 2), r(5, true, 3)])
    expect(c.brier).toBeCloseTo(0.14, 10)
    expect(c.confiancaMedia).toBe(3)
    expect(c.acertoMedio).toBe(0.5)
    expect(c.amostra).toBe(4)
  })

  it('penaliza o erro com confiança máxima', () => {
    // (1-0)² = 1
    const c = calcularCalibracao([r(5, false)])
    expect(c.brier).toBeCloseTo(1, 10)
    expect(c.superconfianca).toBe(1)
  })

  it('recompensa o erro com confiança baixa', () => {
    // (0,2-0)² = 0,04
    const c = calcularCalibracao([r(1, false)])
    expect(c.brier).toBeCloseTo(0.04, 10)
    expect(c.superconfianca).toBe(0)
  })

  it('conta superconfiança só a partir da confiança 4', () => {
    const c = calcularCalibracao([r(3, false), r(4, false, 1), r(5, false, 2), r(5, true, 3)])
    expect(c.superconfianca).toBe(2)
  })

  it('nunca produz escore fora de 0 a 1', () => {
    const c = calcularCalibracao([r(1, true), r(5, false), r(3, true, 2)])
    expect(c.brier).toBeGreaterThanOrEqual(0)
    expect(c.brier).toBeLessThanOrEqual(1)
  })
})

describe('respostasDe', () => {
  it('agrega as respostas de todos os temas', () => {
    const p = progressoFake({
      temas: {
        a: temaFake('a', { preTeste: [r(2, true)] }),
        b: temaFake('b', { preTeste: [r(4, false), r(5, true, 1)] }),
      },
    })
    expect(respostasDe(p)).toHaveLength(3)
  })

  it('devolve vazio sem temas', () => {
    expect(respostasDe(progressoFake())).toEqual([])
  })
})
