import { describe, expect, it } from 'vitest'
import { FAIXAS, nivel, PONTOS, xp } from './gamificacao'
import { progressoFake, areaFake, estadoFake, temaFake } from './testes/fixtures'

const A = '01-fundamentos#TEMA-01'
const AREA = areaFake({ temas: [A] })

describe('xp', () => {
  it('é zero sem atividade', () => {
    expect(xp(progressoFake(), [AREA])).toBe(0)
  })

  it('soma cada componente concluído', () => {
    const p = progressoFake({
      temas: {
        [A]: temaFake(A, {
          lido: true,
          preTeste: [{ indice: 0, confianca: 3, acertou: true }],
          recuperacaoOk: true,
          revisao: estadoFake({ passagens: 1 }),
        }),
      },
    })
    expect(xp(p, [AREA])).toBe(
      PONTOS.temaLido + PONTOS.preTesteRespondido + PONTOS.recuperacaoOk + PONTOS.passagemDeRevisao,
    )
  })

  it('não soma componente ausente', () => {
    const p = progressoFake({ temas: { [A]: temaFake(A, { lido: true }) } })
    expect(xp(p, [AREA])).toBe(PONTOS.temaLido)
  })

  it('soma checkpoint aprovado conforme o critério declarado no guia', () => {
    // O guia da fixture exige 4 dos 5 itens.
    const p = progressoFake({ checkpoints: { '01-fundamentos': { acertos: 4, total: 5 } } })
    expect(xp(p, [AREA])).toBe(PONTOS.checkpointAprovado)
  })

  it('não soma checkpoint reprovado', () => {
    const p = progressoFake({ checkpoints: { '01-fundamentos': { acertos: 3, total: 5 } } })
    expect(xp(p, [AREA])).toBe(0)
  })

  it('soma uma vez por passagem de revisão', () => {
    const p = progressoFake({ temas: { [A]: temaFake(A, { revisao: estadoFake({ passagens: 3 }) }) } })
    expect(xp(p, [AREA])).toBe(3 * PONTOS.passagemDeRevisao)
  })

  it('é derivado: o mesmo estado devolve o mesmo XP', () => {
    const p = progressoFake({
      temas: { [A]: temaFake(A, { lido: true, recuperacaoOk: true, revisao: estadoFake({ passagens: 2 }) }) },
    })
    expect(xp(p, [AREA])).toBe(xp(p, [AREA]))
  })

  it('não regride quando o estado cresce', () => {
    const antes = progressoFake({ temas: { [A]: temaFake(A, { lido: true }) } })
    const depois = progressoFake({
      temas: { [A]: temaFake(A, { lido: true, recuperacaoOk: true }) },
    })
    expect(xp(depois, [AREA])).toBeGreaterThan(xp(antes, [AREA]))
  })
})

describe('nivel', () => {
  it('começa no nível 1', () => {
    const n = nivel(0)
    expect(n.nivel).toBe(1)
    expect(n.titulo).toBe('Primeiros passos')
    expect(n.xpNoNivel).toBe(0)
    expect(n.proximoMinimo).toBe(200)
  })

  it('troca de faixa no limite exato', () => {
    expect(nivel(199).nivel).toBe(1)
    expect(nivel(200).nivel).toBe(2)
    expect(nivel(1199).nivel).toBe(3)
    expect(nivel(1200).nivel).toBe(4)
    expect(nivel(1200).titulo).toBe('Analista')
  })

  it('calcula o progresso dentro da faixa', () => {
    const n = nivel(1400)
    expect(n.nivel).toBe(4)
    expect(n.xpNoNivel).toBe(200)
    expect(n.xpDoNivel).toBe(800)
  })

  it('na última faixa não há próximo nível', () => {
    const n = nivel(99999)
    expect(n.nivel).toBe(6)
    expect(n.proximoMinimo).toBeNull()
    expect(n.xpDoNivel).toBe(0)
  })

  it('as faixas são estritamente crescentes', () => {
    for (let i = 1; i < FAIXAS.length; i += 1) {
      const anterior = FAIXAS[i - 1]!
      const atual = FAIXAS[i]!
      expect(atual.minimo).toBeGreaterThan(anterior.minimo)
      expect(atual.nivel).toBe(anterior.nivel + 1)
    }
  })
})
