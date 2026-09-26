// Apoio aos testes do dominio: monta Area e Progresso minimos, com override.
// Nao e importado pela aplicacao, entao nao entra no bundle.

import type { Area, Guia, Nivel } from '../types'
import { progressoVazio, temaVazio, type Progresso, type TemaProgresso } from '../progresso'
import type { EstadoRevisao } from '../srs'

const REF = '01-fundamentos#TEMA-01'

export function guiaFake(over: Partial<Guia> = {}): Guia {
  return {
    areaId: '01-fundamentos',
    intro: '',
    secoes: [],
    checkpoint: [
      { pergunta: 'q1', resposta: 'a1' },
      { pergunta: 'q2', resposta: 'a2' },
      { pergunta: 'q3', resposta: 'a3' },
      { pergunta: 'q4', resposta: 'a4' },
      { pergunta: 'q5', resposta: 'a5' },
    ],
    criterio: 'acertar 4 dos 5 itens sem consultar os temas',
    tabelaTemas: null,
    objetivos: null,
    atividades: null,
    mermaid: [],
    ...over,
  }
}

export function areaFake(over: Partial<Area> = {}): Area {
  return {
    areaId: '01-fundamentos',
    areaNome: 'Fundamentos',
    ordemEstudo: 2,
    nivel: 'base' as Nivel,
    ancoragem: [],
    certificacoes: [],
    preRequisitos: [],
    temas: [REF],
    fontes: [],
    statusVerificacao: 'rascunho',
    guia: guiaFake(),
    ...over,
  }
}

export function estadoFake(over: Partial<EstadoRevisao> = {}): EstadoRevisao {
  return {
    ref: REF,
    intervaloDias: 1,
    proximaRevisao: '2026-03-11T12:00:00.000Z',
    rebaixamentos: 0,
    passagens: 0,
    consolidado: false,
    ...over,
  }
}

export function temaFake(ref: string, over: Partial<TemaProgresso> = {}): TemaProgresso {
  const base = temaVazio(ref, new Date('2026-03-10T12:00:00.000Z'))
  return { ...base, ...over }
}

export function progressoFake(over: Partial<Progresso> = {}): Progresso {
  return { ...progressoVazio(), ...over }
}

export const REF_FAKE = REF
