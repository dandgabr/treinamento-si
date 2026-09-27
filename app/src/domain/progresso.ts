// Estado do estudo: o formato que o app persiste — no armazenamento do navegador ou num
// arquivo, conforme a via — e as operacoes puras sobre ele.

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

/**
 * Respostas dadas em um item do quiz de multipla escolha. `ultima` e a data ISO da resposta
 * mais recente — fica guardada para a tela poder dizer quando o item foi visto, e nao entra
 * no calculo de prioridade, que olha so o placar.
 */
export interface RegistroDeQuestao {
  acertos: number
  erros: number
  ultima: string
}

export interface Progresso {
  versao: typeof VERSAO_PROGRESSO
  temas: Record<string, TemaProgresso>
  checkpoints: Record<string, ResultadoCheckpoint>
  /** Id do item do banco de questoes -> respostas dadas nele. */
  questoes: Record<string, RegistroDeQuestao>
  /** Dias (AAAA-MM-DD) com ao menos uma atividade. Base do streak. */
  diasAtivos: string[]
}

/**
 * Versao do formato gravado.
 *
 * O campo novo desta fase (`temas[ref].revisao.falhasSeguidas`, a contagem de passagens falhas
 * seguidas que decide a releitura completa) entra SEM mudar a versao, e o precedente e do
 * proprio arquivo: foi assim que `questoes` entrou na v1 (ver `pareceProgresso`). A regra que
 * sustenta isso e que o campo e aditivo — um arquivo gravado antes dele continua legivel, e o
 * normalizador preenche o que falta com o valor neutro (zero falhas seguidas). Uma versao nova
 * aqui teria dois custos: `normalizarProgresso` DESCARTA versao desconhecida, entao todo
 * arquivo em disco precisaria de migracao (e o app que ainda nao migrasse perderia o estudo), e
 * a versao faz parte do que se exporta — quem revisou o formato da exportacao precisa saber
 * disso antes de o numero mudar.
 */
export const VERSAO_PROGRESSO = 1

export function progressoVazio(): Progresso {
  return { versao: VERSAO_PROGRESSO, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [] }
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

/**
 * Registra a resposta de um item do quiz: um acerto ou um erro, e o dia do estudo.
 *
 * Id vazio e chave perigosa nao viram campo do estado. Nao e so cuidado com o objeto: o
 * normalizador recusa as duas ao carregar, entao registra-las criaria dado que o proximo
 * carregamento joga fora — a tela mostraria uma contagem que some ao reabrir o app. E o
 * mesmo caminho em que o redutor devolve a MESMA referencia, de que o store depende para
 * nao gravar e nao re-renderizar a toa.
 */
export function registrarQuestao(
  p: Progresso,
  id: string,
  acertou: boolean,
  agora: Date,
): Progresso {
  if (!id || CHAVES_RECUSADAS.has(id)) return p
  const atual = p.questoes[id]
  const proximo: RegistroDeQuestao = {
    acertos: (atual?.acertos ?? 0) + (acertou ? 1 : 0),
    erros: (atual?.erros ?? 0) + (acertou ? 0 : 1),
    ultima: agora.toISOString(),
  }
  return registrarDiaAtivo({ ...p, questoes: { ...p.questoes, [id]: proximo } }, agora)
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

/**
 * Data do calendario, nao so a forma: `2020-13-99` casa com a expressao e nao existe.
 * Como `diasComEstudo` conta o tamanho da lista, data inventada inflaria a contagem.
 */
function ehDataIso(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [ano, mes, dia] = v.split('-').map(Number)
  if (ano === undefined || mes === undefined || dia === undefined) return false
  const data = new Date(Date.UTC(ano, mes - 1, dia))
  return (
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
  )
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
  // Ausente (arquivo da v1) vale zero, e nao um palpite tirado de `rebaixamentos`: aquele
  // conta a vida toda, e inferir dali inventaria duas falhas seguidas que talvez nao existam.
  const brutoFalhasSeguidas = r.falhasSeguidas
  return {
    ref,
    intervaloDias: intervalo,
    proximaRevisao: quando,
    rebaixamentos: numeroFinito(brutoRebaixamentos) ? Math.floor(brutoRebaixamentos) : 0,
    passagens: numeroFinito(brutoPassagens) ? Math.floor(brutoPassagens) : 0,
    falhasSeguidas: numeroFinito(brutoFalhasSeguidas) ? Math.floor(brutoFalhasSeguidas) : 0,
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

function normalizarQuestoes(valor: unknown): Record<string, RegistroDeQuestao> {
  const out: Record<string, RegistroDeQuestao> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [id, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!id || CHAVES_RECUSADAS.has(id) || !bruto || typeof bruto !== 'object') continue
    const r = bruto as Record<string, unknown>
    // Contador nao finito (`1e999` vira Infinity no JSON), fracionario ou negativo nao
    // descreve resposta nenhuma: vale zero, e o registro so fica se o outro contador tiver
    // alguma coisa — entrada com dois zeros nao carrega informacao, e um arquivo que
    // acumulou sobras nao pode virar dado de estudo.
    const acertos = numeroFinito(r.acertos) && Number.isInteger(r.acertos) ? r.acertos : 0
    const erros = numeroFinito(r.erros) && Number.isInteger(r.erros) ? r.erros : 0
    if (acertos === 0 && erros === 0) continue
    // Sem data legivel, fica vazio: a tela mostra "sem registro" em vez de uma data que o
    // `Date` nao consegue nem interpretar.
    const ultima =
      typeof r.ultima === 'string' && !Number.isNaN(Date.parse(r.ultima)) ? r.ultima : ''
    out[id] = { acertos, erros, ultima }
  }
  return out
}

/**
 * Diz se o valor tem a forma de um progresso desta versao, sem normalizar. Serve para a
 * importacao recusar um arquivo estranho ANTES de substituir o que existe: o
 * normalizador descarta versao desconhecida, o que e certo para ler dado velho e errado
 * como politica de substituicao.
 */
export function pareceProgresso(valor: unknown): boolean {
  if (!valor || typeof valor !== 'object') return false
  const bruto = valor as Record<string, unknown>
  // `questoes` nao entra na conferencia de proposito: um arquivo exportado antes do quiz nao
  // tem o campo e continua sendo um progresso desta versao — o normalizador o preenche vazio.
  // Exigir o campo recusaria o backup de quem estudou ate ontem. `revisao.falhasSeguidas`
  // segue a mesma regra, um nivel abaixo.
  return (
    bruto.versao === VERSAO_PROGRESSO &&
    !!bruto.temas &&
    typeof bruto.temas === 'object' &&
    !Array.isArray(bruto.temas)
  )
}

/**
 * Versao desconhecida e descartada em vez de migrada as cegas.
 *
 * Nao ha passo de migracao porque nao ha versao nova: o unico campo que esta fase acrescentou
 * (`revisao.falhasSeguidas`) e aditivo, e um arquivo gravado antes dele carrega igual — o
 * normalizador poe zero no que falta. A escolha do valor neutro e declarada: a v1 nao guarda o
 * resultado de cada passagem, entao nao ha como saber se as duas ultimas falharam, e supor
 * "sim" faria o app exigir releitura completa de um tema que talvez tenha acabado de acertar.
 * O efeito colateral e o mesmo de antes do campo: um tema que ja tinha duas falhas seguidas so
 * entra em releitura completa apos a proxima falha.
 */
export function normalizarProgresso(valor: unknown, agora: Date): Progresso {
  const vazio = progressoVazio()
  if (!valor || typeof valor !== 'object') return vazio
  const bruto = valor as Record<string, unknown>
  if (bruto.versao !== VERSAO_PROGRESSO) return vazio
  return {
    versao: VERSAO_PROGRESSO,
    temas: normalizarTemas(bruto.temas, agora),
    checkpoints: normalizarCheckpoints(bruto.checkpoints),
    questoes: normalizarQuestoes(bruto.questoes),
    diasAtivos: Array.isArray(bruto.diasAtivos)
      ? [...new Set(bruto.diasAtivos.filter(ehDataIso))].sort()
      : [],
  }
}
