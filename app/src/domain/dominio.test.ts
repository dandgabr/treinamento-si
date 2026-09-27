import { describe, expect, it } from 'vitest'
import { dominioDaArea } from './dominio'
import { progressoVazio, registrarRespostaDeCheckpoint, type Progresso } from './progresso'
import { areaFake, guiaFake, progressoFake, temaFake } from './testes/fixtures'

const REF_A = 'x#TEMA-01'
const REF_B = 'x#TEMA-02'
const AREA = areaFake({ areaId: 'x', areaNome: 'X', temas: [REF_A, REF_B] })
const HOJE = new Date('2026-03-10T12:00:00.000Z')

/** O checkpoint da área fechado com `acertos` dos 5 itens do guia, item a item. */
function comCheckpoint(areaId: string, acertos: number, total = 5): Progresso {
  let p = progressoVazio()
  for (let i = 0; i < total; i++) {
    p = registrarRespostaDeCheckpoint(p, areaId, i, i < acertos, total, HOJE)
  }
  return p
}

/** O placar do arquivo antigo, sem veredito por item: o caminho de quem já respondia antes. */
function comPlacarAntigo(areaId: string, acertos: number, total = 5): Progresso {
  return progressoFake({
    checkpoints: { [areaId]: { itens: [], placarAntigo: { acertos, total } } },
  })
}

describe('dominioDaArea', () => {
  it('é zero sem nenhum tema firme', () => {
    const d = dominioDaArea(AREA, progressoFake({ temas: { [REF_A]: temaFake(REF_A) } }))
    expect(d.totalTemas).toBe(2)
    expect(d.firmes).toBe(0)
  })

  it('conta como firme o tema cuja última recuperação foi acertada', () => {
    const p = progressoFake({ temas: { [REF_A]: temaFake(REF_A, { recuperacaoOk: true }) } })
    const d = dominioDaArea(AREA, p)
    expect(d.firmes).toBe(1)
    expect(d.totalTemas).toBe(2)
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

  it('não quebra em área sem temas', () => {
    const area = areaFake({ temas: [] })
    expect(dominioDaArea(area, progressoFake()).totalTemas).toBe(0)
  })

  it('o placar do arquivo antigo (sem veredito por item) continua valendo', () => {
    expect(dominioDaArea(AREA, comPlacarAntigo('x', 4)).checkpointAprovado).toBe(true)
    expect(dominioDaArea(AREA, comPlacarAntigo('x', 3)).checkpointAprovado).toBe(false)
  })

  it('usa o total do próprio placar quando o guia não tem itens de checkpoint', () => {
    // `guia.checkpoint.length` é 0 e o resultado vem do placar do arquivo antigo: é o total do
    // PRÓPRIO placar que o critério lê — "0 de 0" não descreveria resultado nenhum.
    const area = areaFake({ areaId: 'x', temas: [], guia: guiaFake({ checkpoint: [] }) })
    expect(dominioDaArea(area, comPlacarAntigo('x', 4)).checkpointAprovado).toBe(true)
    expect(dominioDaArea(area, comPlacarAntigo('x', 3)).checkpointAprovado).toBe(false)
  })

  it('um julgamento pela metade não revoga a aprovação já registrada', () => {
    // O placar antigo fica enquanto o julgamento por item não fecha: um clique não pode tirar a
    // aprovação da área (e o marco da trilha com ela).
    const parcial = registrarRespostaDeCheckpoint(comPlacarAntigo('x', 4), 'x', 0, false, 5, HOJE)
    expect(dominioDaArea(AREA, parcial).checkpointAprovado).toBe(true)
  })

  it('não mistura áreas diferentes', () => {
    const a1 = areaFake({ areaId: 'a', temas: ['a#TEMA-01'] })
    const a2 = areaFake({ areaId: 'b', temas: ['b#TEMA-01'] })
    const p = progressoFake({
      temas: { 'a#TEMA-01': temaFake('a#TEMA-01', { recuperacaoOk: true }) },
    })
    expect(dominioDaArea(a1, p).firmes).toBe(1)
    expect(dominioDaArea(a2, p).firmes).toBe(0)
  })

  it('mantém o critério em prosa para exibição', () => {
    expect(dominioDaArea(AREA, progressoFake()).criterio).toBe(AREA.guia.criterio)
  })
})
