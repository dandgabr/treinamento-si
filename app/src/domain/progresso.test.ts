import { describe, expect, it } from 'vitest'
import { diaIso, progressoVazio, registrarDiaAtivo, streak, temaVazio } from './progresso'

const HOJE = new Date('2026-03-10T12:00:00.000Z')

function comDias(dias: string[]) {
  return { ...progressoVazio(), diasAtivos: dias }
}

describe('diaIso', () => {
  it('formata como AAAA-MM-DD', () => {
    expect(diaIso(HOJE)).toBe('2026-03-10')
  })
})

describe('registrarDiaAtivo', () => {
  it('adiciona o dia e mantém a lista ordenada', () => {
    const p = registrarDiaAtivo(comDias(['2026-03-08']), HOJE)
    expect(p.diasAtivos).toEqual(['2026-03-08', '2026-03-10'])
  })

  it('não duplica o mesmo dia', () => {
    const uma = registrarDiaAtivo(progressoVazio(), HOJE)
    const duas = registrarDiaAtivo(uma, HOJE)
    expect(duas.diasAtivos).toEqual(['2026-03-10'])
    expect(duas).toBe(uma)
  })
})

describe('streak', () => {
  it('conta dias consecutivos terminando hoje', () => {
    expect(streak(comDias(['2026-03-08', '2026-03-09', '2026-03-10']), HOJE)).toBe(3)
  })

  it('conta a partir de ontem quando hoje ainda não houve atividade', () => {
    expect(streak(comDias(['2026-03-08', '2026-03-09']), HOJE)).toBe(2)
  })

  it('zera quando o dia anterior também está vazio', () => {
    expect(streak(comDias(['2026-03-08']), HOJE)).toBe(0)
  })

  it('zera sem nenhum dia', () => {
    expect(streak(progressoVazio(), HOJE)).toBe(0)
  })

  it('para na primeira lacuna', () => {
    expect(streak(comDias(['2026-03-05', '2026-03-09', '2026-03-10']), HOJE)).toBe(2)
  })
})

describe('temaVazio', () => {
  it('começa não lido, sem pré-teste e com a revisão agendada em D+1', () => {
    const t = temaVazio('a#TEMA-01', HOJE)
    expect(t.lido).toBe(false)
    expect(t.preTeste).toEqual([])
    expect(t.recuperacaoOk).toBeNull()
    expect(t.revisao.intervaloDias).toBe(1)
    expect(t.revisao.proximaRevisao).toBe('2026-03-11T12:00:00.000Z')
  })
})
