// Estado do estudo: o formato que o app persiste (localStorage agora, arquivo na fase
// de exportacao) e as operacoes puras sobre ele.

import { criarEstado, filaDeHoje, registrarRevisao, type EstadoRevisao } from './srs'

/** Escala de confianca do pre-teste. Fonte unica: o tipo e derivado dela. */
export const NIVEIS_CONFIANCA = [1, 2, 3, 4, 5] as const

export type Confianca = (typeof NIVEIS_CONFIANCA)[number]

/**
 * A confianca e declarada antes de ler; o desfecho vem depois, quando o tema e
 * respondido na recuperacao ativa. Por isso a resposta guarda so a confianca, e o
 * cruzamento com o acerto e feito na calibracao.
 */
export interface RespostaPreTeste {
  indice: number
  confianca: Confianca
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

/** Dia local, nao UTC: as 21h de 10/03 (UTC-3) e dia 10, nao 11. */
export function diaIso(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** Marca o dia como ativo, sem duplicar. */
export function registrarDiaAtivo(p: Progresso, agora: Date): Progresso {
  const dia = diaIso(agora)
  if (p.diasAtivos.includes(dia)) return p
  return { ...p, diasAtivos: [...p.diasAtivos, dia].sort() }
}

/**
 * Dias com atividade registrada. E o insumo da coluna "Data" do Registro de progresso
 * que as trilhas definem — nao um contador de sequencia: transformar isso em "N dias
 * seguidos" seria placar sobre habito, e a secao 8 do CONTRIBUTING pede marcos e
 * autoavaliacao, sem gamificacao artificial.
 */
export function diasComEstudo(p: Progresso): number {
  return p.diasAtivos.length
}

// ------------------------------------------------------------------- redutores
// Funcoes puras: devolvem um Progresso novo. O store so guarda o resultado, o que
// deixa toda a regra de transicao testavel sem navegador.

/**
 * Aplica a alteracao ao tema. Se ela devolver o proprio objeto, nada mudou: devolve o
 * estado anterior intacto. Sem isso, todo clique gerava objeto novo, gravava no
 * armazenamento e re-renderizava os consumidores mesmo sem mudanca visivel.
 */
function comTema(
  p: Progresso,
  ref: string,
  agora: Date,
  alterar: (t: TemaProgresso) => TemaProgresso,
): Progresso {
  const existente = p.temas[ref]
  const atual = existente ?? temaVazio(ref, agora)
  const proximo = alterar(atual)
  if (proximo === atual && existente) return p
  return registrarDiaAtivo({ ...p, temas: { ...p.temas, [ref]: proximo } }, agora)
}

export function marcarLido(p: Progresso, ref: string, agora: Date): Progresso {
  return comTema(p, ref, agora, (t) => (t.lido ? t : { ...t, lido: true }))
}

/** Guarda a confiança declarada para um item do pré-teste, sem duplicar o índice. */
export function registrarConfianca(
  p: Progresso,
  ref: string,
  indice: number,
  confianca: Confianca,
  agora: Date,
): Progresso {
  return comTema(p, ref, agora, (t) => {
    if (t.preTeste.find((r) => r.indice === indice)?.confianca === confianca) return t
    const outros = t.preTeste.filter((r) => r.indice !== indice)
    return {
      ...t,
      preTeste: [...outros, { indice, confianca }].sort((a, b) => a.indice - b.indice),
    }
  })
}

/**
 * Registra o veredito da passagem atual e reagenda a revisao.
 *
 * Idempotente de proposito: se a passagem ja tem veredito, nao faz nada. Sem isso,
 * tres cliques no mesmo botao avancavam D+1 -> D+7 -> consolidado e davam XP a cada
 * clique, por uma unica leitura — e o tema saia da fila sem o usuario ter retido.
 * A proxima passagem se abre de forma explicita, com `abrirPassagem`.
 */
export function registrarRecuperacao(
  p: Progresso,
  ref: string,
  acertou: boolean,
  agora: Date,
): Progresso {
  return comTema(p, ref, agora, (t) => {
    if (t.recuperacaoOk !== null) return t
    return {
      ...t,
      lido: true,
      recuperacaoOk: acertou,
      revisao: registrarRevisao(t.revisao, acertou, agora),
    }
  })
}

/** Abre a proxima passagem: limpa o veredito e mantem a revisao ja agendada. */
export function abrirPassagem(p: Progresso, ref: string, agora: Date): Progresso {
  return comTema(p, ref, agora, (t) => (t.recuperacaoOk === null ? t : { ...t, recuperacaoOk: null }))
}

export function registrarCheckpoint(
  p: Progresso,
  areaId: string,
  acertos: number,
  total: number,
  agora: Date,
): Progresso {
  const atual = p.checkpoints[areaId]
  if (atual && atual.acertos === acertos && atual.total === total) return p
  return registrarDiaAtivo(
    { ...p, checkpoints: { ...p.checkpoints, [areaId]: { acertos, total } } },
    agora,
  )
}

/** Decisao pura do checkpoint: so ha resultado quando todos os itens foram julgados. */
export function resultadoDoCheckpoint(
  veredictos: readonly (boolean | null)[],
): ResultadoCheckpoint | null {
  if (!veredictos.length) return null
  if (veredictos.some((v) => v === null)) return null
  return { acertos: veredictos.filter((v) => v === true).length, total: veredictos.length }
}

/** Temas vencidos, do mais atrasado para o mais recente. */
export function filaDoProgresso(p: Progresso, agora: Date): EstadoRevisao[] {
  return filaDeHoje(
    Object.values(p.temas).map((t) => t.revisao),
    agora,
  )
}

// ------------------------------------------------------------------- carga
// O dado vem do localStorage (e, mais adiante, de um arquivo importado), ou seja, de
// fora. Ele e reconstruido campo a campo, nunca espalhado sobre o estado: alem de
// descartar o que nao tem a forma esperada, isso impede que chaves como `__proto__`
// cheguem ao objeto.

function ehConfianca(v: unknown): v is Confianca {
  return typeof v === 'number' && (NIVEIS_CONFIANCA as readonly number[]).includes(v)
}

/** Aceita so numero finito nao negativo: `1e999` vira `Infinity` no JSON. */
function numeroFinito(v: unknown, max = Number.MAX_SAFE_INTEGER): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max
}

// `out['__proto__'] = x` nao cria propriedade: troca o prototipo do objeto. Como as
// chaves vem de fora, elas sao recusadas antes de qualquer atribuicao.
const CHAVES_RECUSADAS = new Set(['__proto__', 'constructor', 'prototype'])

/** Teto de sanidade para o intervalo agendado. */
const TETO_DIAS = 3650

function normalizarRevisao(valor: unknown, ref: string, agora: Date): EstadoRevisao {
  const padrao = criarEstado(ref, agora)
  if (!valor || typeof valor !== 'object') return padrao
  const r = valor as Record<string, unknown>
  const brutoIntervalo = r.intervaloDias
  const intervalo =
    numeroFinito(brutoIntervalo, TETO_DIAS) && brutoIntervalo > 0 ? brutoIntervalo : null
  const quando =
    typeof r.proximaRevisao === 'string' && !Number.isNaN(Date.parse(r.proximaRevisao))
      ? r.proximaRevisao
      : null
  if (intervalo === null || quando === null) return padrao
  const brutoRebaixamentos = r.rebaixamentos
  const brutoPassagens = r.passagens
  return {
    ref,
    intervaloDias: intervalo,
    proximaRevisao: quando,
    rebaixamentos: numeroFinito(brutoRebaixamentos) ? Math.floor(brutoRebaixamentos) : 0,
    passagens: numeroFinito(brutoPassagens) ? Math.floor(brutoPassagens) : 0,
    consolidado: r.consolidado === true,
  }
}

function normalizarTemas(valor: unknown, agora: Date): Record<string, TemaProgresso> {
  const out: Record<string, TemaProgresso> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [ref, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!ref || CHAVES_RECUSADAS.has(ref) || !bruto || typeof bruto !== 'object') continue
    const t = bruto as Record<string, unknown>
    const preTeste: RespostaPreTeste[] = Array.isArray(t.preTeste)
      ? t.preTeste
          .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
          .flatMap((r) =>
            ehConfianca(r.confianca) && typeof r.indice === 'number' && Number.isInteger(r.indice)
              ? [{ indice: r.indice, confianca: r.confianca }]
              : [],
          )
      : []
    out[ref] = {
      ref,
      lido: t.lido === true,
      preTeste,
      recuperacaoOk: typeof t.recuperacaoOk === 'boolean' ? t.recuperacaoOk : null,
      revisao: normalizarRevisao(t.revisao, ref, agora),
    }
  }
  return out
}

function normalizarCheckpoints(valor: unknown): Record<string, ResultadoCheckpoint> {
  const out: Record<string, ResultadoCheckpoint> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [areaId, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!areaId || CHAVES_RECUSADAS.has(areaId) || !bruto || typeof bruto !== 'object') continue
    const r = bruto as Record<string, unknown>
    const acertos = r.acertos
    const total = r.total
    // Resultado sem sentido (fracionario, negativo, acertos > total) concederia XP e
    // selo de aprovacao por um dado que nao existe.
    if (!numeroFinito(acertos) || !numeroFinito(total)) continue
    if (!Number.isInteger(acertos) || !Number.isInteger(total)) continue
    if (total <= 0 || acertos > total) continue
    out[areaId] = { acertos, total }
  }
  return out
}

/** Versao desconhecida e descartada em vez de migrada as cegas. */
export function normalizarProgresso(valor: unknown, agora: Date): Progresso {
  const vazio = progressoVazio()
  if (!valor || typeof valor !== 'object') return vazio
  const bruto = valor as Record<string, unknown>
  if (bruto.versao !== VERSAO_PROGRESSO) return vazio
  return {
    versao: VERSAO_PROGRESSO,
    temas: normalizarTemas(bruto.temas, agora),
    checkpoints: normalizarCheckpoints(bruto.checkpoints),
    diasAtivos: Array.isArray(bruto.diasAtivos)
      ? [
          ...new Set(
            bruto.diasAtivos.filter(
              (d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d),
            ),
          ),
        ].sort()
      : [],
  }
}
