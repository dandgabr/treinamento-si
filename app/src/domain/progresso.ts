// Estado do estudo. E o que o app vai persistir na fase 7 (localStorage + arquivo);
// aqui ficam so o formato e as operacoes puras sobre ele.

import { criarEstado, somarDias, type EstadoRevisao } from './srs'

export type Confianca = 1 | 2 | 3 | 4 | 5

export interface RespostaPreTeste {
  indice: number
  confianca: Confianca
  acertou: boolean
}

export interface TemaProgresso {
  ref: string
  lido: boolean
  preTeste: RespostaPreTeste[]
  /** Resultado da ultima passagem de recuperacao ativa. null = ainda nao respondeu. */
  recuperacaoOk: boolean | null
  revisao: EstadoRevisao
}

export interface ResultadoCheckpoint {
  acertos: number
  total: number
}

export interface Progresso {
  versao: typeof VERSAO_PROGRESSO
  temas: Record<string, TemaProgresso>
  checkpoints: Record<string, ResultadoCheckpoint>
  /** Dias (AAAA-MM-DD) com ao menos uma atividade. Base do streak. */
  diasAtivos: string[]
}

export const VERSAO_PROGRESSO = 1

export function progressoVazio(): Progresso {
  return { versao: VERSAO_PROGRESSO, temas: {}, checkpoints: {}, diasAtivos: [] }
}

export function temaVazio(ref: string, agora: Date): TemaProgresso {
  return { ref, lido: false, preTeste: [], recuperacaoOk: null, revisao: criarEstado(ref, agora) }
}

export function diaIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Marca o dia como ativo, sem duplicar. */
export function registrarDiaAtivo(p: Progresso, agora: Date): Progresso {
  const dia = diaIso(agora)
  if (p.diasAtivos.includes(dia)) return p
  return { ...p, diasAtivos: [...p.diasAtivos, dia].sort() }
}

/**
 * Dias consecutivos com atividade. Se hoje ainda nao houve atividade, a contagem
 * comeca ontem — o dia corrente so quebra a sequencia quando termina.
 */
export function streak(p: Progresso, agora: Date): number {
  const dias = new Set(p.diasAtivos)
  let cursor = new Date(agora)
  if (!dias.has(diaIso(cursor))) cursor = somarDias(cursor, -1)
  let total = 0
  while (dias.has(diaIso(cursor))) {
    total += 1
    cursor = somarDias(cursor, -1)
  }
  return total
}
