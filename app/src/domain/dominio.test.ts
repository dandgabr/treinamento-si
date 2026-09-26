import { describe, expect, it } from 'vitest'
import { dominio, dominioDaArea, dominioGeral } from './dominio'
import { areaFake, guiaFake, progressoFake, temaFake } from './testes/fixtures'

const REF_A = 'x#TEMA-01'
const REF_B = 'x#TEMA-02'
const AREA = areaFake({ areaId: 'x', areaNome: 'X', temas: [REF_A, REF_B] })

function comCheckpoint(areaId: string, acertos: number, total = 5) {
  return progressoFake({ checkpoints: { [areaId]: { acertos, total } } })
}

describe('dominioDaArea', () => {
  it('é zero sem nenhum tema firme', () => {
    const d = dominioDaArea(AREA, progressoFake({ temas: { [REF_A]: temaFake(REF_A) } }))
    expect(d.totalTemas).toBe(2)
    expect(d.firmes).toBe(0)
    expect(d.percentual).toBe(0)
  })

  it('conta como firme o tema cuja última recuperação foi acertada', () => {
    const p = progressoFake({ temas: { [REF_A]: temaFake(REF_A, { recuperacaoOk: true }) } })
    const d = dominioDaArea(AREA, p)
    expect(d.firmes).toBe(1)
    expect(d.percentual).toBe(0.5)
  })

  it('não conta tema cuja última passagem foi erro', () => {
    const p = progressoFake({ temas: { [REF_A]: temaFake(REF_A, { recuperacaoOk: false }) } })
    expect(dominioDaArea(AREA, p).firmes).toBe(0)
  })

  it('devolve checkpoint nulo quando não houve checkpoint', () => {
    expect(dominioDaArea(AREA, progressoFake()).checkpointAprovado).toBeNull()
  })

  it('usa o critério de fração declarado no guia (4 de 5)', () => {
    expect(dominioDaArea(AREA, comCheckpoint('x', 4)).checkpointAprovado).toBe(true)
    expect(dominioDaArea(AREA, comCheckpoint('x', 3)).checkpointAprovado).toBe(false)
  })

  it('usa o critério percentual quando o guia declara percentual', () => {
    const area = areaFake({ areaId: 'y', temas: [], guia: guiaFake({ criterio: 'acertar 80% ou mais' }) })
    expect(dominioDaArea(area, comCheckpoint('y', 4)).checkpointAprovado).toBe(true)
    expect(dominioDaArea(area, comCheckpoint('y', 3)).checkpointAprovado).toBe(false)
  })

  it('não divide por zero em área sem temas', () => {
    const area = areaFake({ temas: [] })
    expect(dominioDaArea(area, progressoFake()).percentual).toBe(0)
  })

  it('mantém o critério em prosa para exibição', () => {
    expect(dominioDaArea(AREA, progressoFake()).criterio).toBe(AREA.guia.criterio)
  })
})

describe('dominio e dominioGeral', () => {
  it('áreas independentes não se contaminam', () => {
    const a1 = areaFake({ areaId: 'a', areaNome: 'A', temas: ['a#TEMA-01'] })
    const a2 = areaFake({ areaId: 'b', areaNome: 'B', temas: ['b#TEMA-01'] })
    const p = progressoFake({
      temas: { 'a#TEMA-01': temaFake('a#TEMA-01', { recuperacaoOk: true }) },
    })
    const [d1, d2] = dominio([a1, a2], p)
    expect(d1?.percentual).toBe(1)
    expect(d2?.percentual).toBe(0)
  })

  it('faz a média simples entre as áreas', () => {
    const a1 = areaFake({ areaId: 'a', temas: ['a#TEMA-01'] })
    const a2 = areaFake({ areaId: 'b', temas: ['b#TEMA-01'] })
    const p = progressoFake({
      temas: { 'a#TEMA-01': temaFake('a#TEMA-01', { recuperacaoOk: true }) },
    })
    expect(dominioGeral([a1, a2], p)).toBe(0.5)
  })

  it('é zero sem áreas', () => {
    expect(dominioGeral([], progressoFake())).toBe(0)
  })
})
