// Estado do estudo: o formato que o app persiste — no armazenamento do navegador ou num
// arquivo, conforme a via — e as operacoes puras sobre ele.

import {
  criarEstado,
  filaDeHoje,
  registrarRevisao,
  ULTIMO_INTERVALO_DIAS,
  type EstadoRevisao,
} from './srs'

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

/**
 * Placar de um checkpoint: quantos itens foram julgados e quantos desses foram acertados. E o que
 * o criterio do guia le — e ele e DERIVADO dos vereditos por item (`resultadoDoCheckpoint`), nao
 * um dado guardado ao lado deles. A unica copia gravada esta em `CheckpointDaArea.placarAntigo`,
 * e so existe em arquivo anterior ao veredito por item.
 */
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

/**
 * Veredito de um item julgado, na ordem do material. Item nao julgado nao entra na lista: "nao
 * respondi" e "errei" sao estados diferentes. A mesma forma serve ao pre-teste diagnostico de uma
 * trilha (`diagnosticos`) e ao checkpoint da secao 9 de um guia (`checkpoints`) — nos dois o indice
 * e o do material, e quem le procura por ele.
 */
export interface RespostaDeItem {
  indice: number
  acertou: boolean
}

/**
 * O checkpoint da secao 9 do guia de uma area.
 *
 * O que se grava e o veredito de cada item julgado (`itens`), e o placar e DERIVADO dele
 * (`resultadoRegistradoDoCheckpoint`): guardar o total junto seria manter duas verdades para o
 * mesmo dado, como no diagnostico das trilhas.
 *
 * `placarAntigo` e a excecao que o arquivo ANTIGO obriga: a v1 gravava so o placar, item a item
 * nao existia, e descarta-lo ao carregar apagaria a aprovacao de quem ja fechou o checkpoint —
 * nao ha veredito de onde tirar esse resultado de volta. Ele nao concorre com `itens`: existe
 * enquanto o julgamento por item NAO fecha, e sai do registro na mesma escrita que o fecha.
 */
export interface CheckpointDaArea {
  itens: RespostaDeItem[]
  placarAntigo: ResultadoCheckpoint | null
}

/**
 * O artefato da secao 8 de um guia. A trilha pede o estado por artefato — produzido e a data
 * (secao 8 do plano de 12 meses tem a coluna "Artefato produzido", e a secao 3.2, o artefato da
 * area). `data` e o dia local em que a producao foi marcada, e fica vazio quando o artefato foi
 * marcado como nao produzido.
 */
export interface RegistroArtefato {
  produzido: boolean
  data: string
}

export interface Progresso {
  versao: typeof VERSAO_PROGRESSO
  temas: Record<string, TemaProgresso>
  /** Area id -> checkpoint da secao 9 do guia dela, com o veredito por item. */
  checkpoints: Record<string, CheckpointDaArea>
  /** Id do item do banco de questoes -> respostas dadas nele. */
  questoes: Record<string, RegistroDeQuestao>
  /** Dias (AAAA-MM-DD) com ao menos uma atividade. Base do streak. */
  diasAtivos: string[]
  /** Slug da trilha -> vereditos do pre-teste diagnostico dela. */
  diagnosticos: Record<string, RespostaDeItem[]>
  /** Chave `areaId#N` (N da secao 8 do guia da area) -> artefato produzido e quando. */
  artefatos: Record<string, RegistroArtefato>
}

/**
 * Versao do formato gravado.
 *
 * Os campos que esta fase acrescentou (`temas[ref].revisao.falhasSeguidas`, o veredito por item
 * do diagnostico das trilhas, o artefato da secao 8 dos guias e o veredito por item do checkpoint
 * das areas) entram SEM mudar a versao, e o precedente e do proprio arquivo: foi assim que
 * `questoes` entrou na v1 (ver `pareceProgresso`). A regra que sustenta isso e que o campo e
 * aditivo — um arquivo gravado antes dele continua legivel, e o normalizador preenche o que falta
 * com o valor neutro (zero falhas seguidas, mapa vazio de diagnosticos e de artefatos, nenhum
 * veredito por item). O que nao pode e o valor neutro INVENTAR dado: o checkpoint que veio do
 * arquivo antigo so tem o placar, entao e ele que fica (`placarAntigo`) em vez de um veredito por
 * item que ninguem julgou. Uma versao nova aqui teria dois custos:
 * `normalizarProgresso` DESCARTA versao desconhecida, entao todo arquivo em disco precisaria de
 * migracao (e o app que ainda nao migrasse perderia o estudo), e a versao faz parte do que se
 * exporta — quem revisou o formato da exportacao precisa saber disso antes de o numero mudar.
 */
export const VERSAO_PROGRESSO = 1

export function progressoVazio(): Progresso {
  return {
    versao: VERSAO_PROGRESSO,
    temas: {},
    checkpoints: {},
    questoes: {},
    diasAtivos: [],
    diagnosticos: {},
    artefatos: {},
  }
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

/**
 * Registra o veredito de um item do checkpoint da secao 9 de um guia.
 *
 * Mesma idempotencia de `registrarDiagnostico`: repetir o mesmo veredito nao cria estado novo (o
 * store depende disso para nao gravar e nao re-renderizar a toa), e indice que nao descreve item do
 * guia — negativo, fracionario ou alem dos `totalItens` — e recusado.
 *
 * `totalItens` e quantos itens o guia tem hoje — e ele que diz se o julgamento FECHOU, e fechar e
 * o que tira `placarAntigo` do registro: dali em diante o placar e derivado dos vereditos, e
 * manter os dois seria duas verdades para o mesmo resultado. Com o julgamento em CURSO o placar
 * antigo fica: um julgamento pela metade nao pode revogar a aprovacao de quem ja tinha fechado o
 * checkpoint (ela some da tela, da contagem por area e do marco da trilha ate o fecho).
 */
export function registrarRespostaDeCheckpoint(
  p: Progresso,
  areaId: string,
  indice: number,
  acertou: boolean,
  totalItens: number,
  agora: Date,
): Progresso {
  if (
    !areaId ||
    CHAVES_RECUSADAS.has(areaId) ||
    !Number.isInteger(indice) ||
    indice < 0 ||
    indice >= totalItens
  ) {
    return p
  }
  const atual = p.checkpoints[areaId]
  const itens = atual?.itens ?? []
  if (itens.find((r) => r.indice === indice)?.acertou === acertou) return p
  const outros = itens.filter((r) => r.indice !== indice)
  const proximos = [...outros, { indice, acertou }].sort((a, b) => a.indice - b.indice)
  // "Fechado" e o que `veredictosDoCheckpoint` le como todos julgados: um veredito por indice do
  // guia, sem buraco. Contar vereditos nao serve — um indice fora do guia, que so um arquivo de
  // fora traz, faria a conta fechar com item do material por julgar e jogaria fora o placar antigo.
  const julgados = new Set(proximos.filter((r) => r.indice < totalItens).map((r) => r.indice))
  const fechou = totalItens > 0 && julgados.size >= totalItens
  return registrarDiaAtivo(
    {
      ...p,
      checkpoints: {
        ...p.checkpoints,
        [areaId]: { itens: proximos, placarAntigo: fechou ? null : (atual?.placarAntigo ?? null) },
      },
    },
    agora,
  )
}

/**
 * Registra o veredito de um item do pre-teste diagnostico de uma trilha.
 *
 * Mesma idempotencia de `registrarConfianca`: repetir o mesmo veredito nao cria estado novo (o
 * store depende disso para nao gravar e nao re-renderizar a toa). Indice negativo nao descreve
 * item nenhum e e recusado, como o id vazio em `registrarQuestao`.
 */
export function registrarDiagnostico(
  p: Progresso,
  slug: string,
  indice: number,
  acertou: boolean,
  agora: Date,
): Progresso {
  if (!slug || CHAVES_RECUSADAS.has(slug) || !Number.isInteger(indice) || indice < 0) return p
  const atual = p.diagnosticos[slug] ?? []
  if (atual.find((r) => r.indice === indice)?.acertou === acertou) return p
  const outros = atual.filter((r) => r.indice !== indice)
  const respostas = [...outros, { indice, acertou }].sort((a, b) => a.indice - b.indice)
  return registrarDiaAtivo({ ...p, diagnosticos: { ...p.diagnosticos, [slug]: respostas } }, agora)
}

/**
 * Marca o artefato da secao 8 de um guia como produzido (ou desmarca).
 *
 * A data e o dia local da marcacao, e nao a ultima vez que o estado foi tocado: desmarcar limpa
 * a data, para o registro nao dizer que um artefato foi produzido no dia em que alguem percebeu
 * que ele nao existe. Chave vazia nao vira campo do estado — o normalizador a recusaria, e
 * gravar dado que o proximo carregamento joga fora faz a tela mostrar o que some ao reabrir.
 */
export function registrarArtefato(
  p: Progresso,
  chave: string,
  produzido: boolean,
  agora: Date,
): Progresso {
  if (!chave || CHAVES_RECUSADAS.has(chave)) return p
  if (p.artefatos[chave]?.produzido === produzido) return p
  const registro: RegistroArtefato = { produzido, data: produzido ? diaIso(agora) : '' }
  return registrarDiaAtivo({ ...p, artefatos: { ...p.artefatos, [chave]: registro } }, agora)
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

/**
 * Os vereditos do checkpoint de uma area, um por item do guia, na ordem dele.
 *
 * Mesmo contrato do diagnostico das trilhas (`veredictosDoDiagnostico`): item nao julgado vale
 * `null` — "nao julguei" e "errei" nao podem virar o mesmo estado — e a resposta guardada e
 * procurada pelo indice do material, entao item novo num guia revisado aparece como nao julgado em
 * vez de deslocar os outros.
 */
export function veredictosDoCheckpoint(
  progresso: Progresso,
  areaId: string,
  totalItens: number,
): (boolean | null)[] {
  const itens = progresso.checkpoints[areaId]?.itens ?? []
  const porIndice = new Map(itens.map((r) => [r.indice, r.acertou]))
  return Array.from({ length: totalItens }, (_, i) => porIndice.get(i) ?? null)
}

/**
 * O resultado REGISTRADO do checkpoint de uma area.
 *
 * Com o veredito por item, o placar e derivado dele — e so existe quando todos os itens do guia
 * foram julgados, como no diagnostico das trilhas. `placarAntigo` responde so quando nao ha
 * veredito de onde derivar: e o placar do arquivo gravado antes deste campo, a unica copia que
 * existe daquele resultado. Os dois nao concorrem — o redutor limpa o placar antigo na escrita que
 * fecha o julgamento —, entao ha um valor so para ler.
 */
export function resultadoRegistradoDoCheckpoint(
  progresso: Progresso,
  areaId: string,
  totalItens: number,
): ResultadoCheckpoint | null {
  const registro = progresso.checkpoints[areaId]
  if (!registro) return null
  return (
    resultadoDoCheckpoint(veredictosDoCheckpoint(progresso, areaId, totalItens)) ??
    registro.placarAntigo
  )
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

/**
 * Teto de sanidade do intervalo agendado: o ultimo degrau da escada (`ULTIMO_INTERVALO_DIAS`).
 *
 * Nao e um numero solto de "dez anos": a escada do app so agenda 1, 7, 30 e 90 — o acerto sobe
 * por esses degraus, o erro so rebaixa e o consolidado para em 90 —, entao um intervalo maior
 * nao descreve estudo nenhum. O D+3000 vinha de arquivo de fora e esconderia o tema da fila por
 * oito anos; o teto o recusa como recusa o intervalo negativo ou nao finito.
 */
const TETO_DIAS = ULTIMO_INTERVALO_DIAS

/**
 * Folga da janela de sanidade da data agendada, em dias em volta de "agora".
 *
 * `Date.parse` aceita qualquer coisa ate ±8,64e15 ms — uns 275 mil anos. Uma data dessas vinha
 * de um arquivo de fora (exportado, editado a mao, ou de uma maquina com o relogio errado) e
 * nao descrevia estudo nenhum; pior: `reagendarDegrauFinal` (srs.ts) soma D+90 sobre ela e
 * chama `toISOString()`, que lanca `RangeError: Invalid time value` no clique de "Acertei sem
 * consultar". A janela e larga de proposito — dez anos para cada lado — e so recusa o que nao
 * pode ser uma data de estudo: um tema parado ha anos continua vencido, e nao descartado.
 */
const JANELA_DIAS = 3650

/** A data agendada e legivel E plausivel: dentro da janela de sanidade em volta de `agora`. */
function dataPlausivel(quando: unknown, agora: Date): quando is string {
  if (typeof quando !== 'string') return false
  const ms = Date.parse(quando)
  if (Number.isNaN(ms)) return false
  const folga = JANELA_DIAS * 24 * 60 * 60 * 1000
  return ms >= agora.getTime() - folga && ms <= agora.getTime() + folga
}

function normalizarRevisao(valor: unknown, ref: string, agora: Date): EstadoRevisao {
  const padrao = criarEstado(ref, agora)
  if (!valor || typeof valor !== 'object') return padrao
  const r = valor as Record<string, unknown>
  const brutoIntervalo = r.intervaloDias
  // Mesma regua dos contadores vizinhos (`rebaixamentos`, `passagens`, `falhasSeguidas`): so
  // inteiro. Antes bastava finito e positivo, e um `1e-300` de arquivo de fora passava e virava
  // "Próxima revisão em D+1e-300" na tela; `1.5` tambem. O `> 0` continua barrando o zero, e o
  // teto (`ULTIMO_INTERVALO_DIAS`) barra o D+3000 — valores que o escalonador nunca produz, e
  // por isso recusados em vez de adivinhados: o tema volta ao estado inicial.
  const intervalo =
    numeroFinito(brutoIntervalo, TETO_DIAS) &&
    Number.isInteger(brutoIntervalo) &&
    brutoIntervalo > 0
      ? brutoIntervalo
      : null
  const quando = dataPlausivel(r.proximaRevisao, agora) ? r.proximaRevisao : null
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

/**
 * O checkpoint da secao 9 de uma area, campo a campo.
 *
 * O veredito por item manda: achado ele, o placar que viesse junto nao entra — sobra de arquivo
 * gravado por uma versao que guardava os dois, ou editado a mao, e ficaria dizendo outra coisa que
 * nao a soma dos vereditos, que e o que a tela e o criterio leem. Sem veredito, o que resta e o
 * placar do arquivo antigo (o mesmo saneamento de numero de antes: fracionario, nao finito,
 * negativo ou com acertos > total nao descreve resultado nenhum).
 */
function normalizarCheckpoints(valor: unknown): Record<string, CheckpointDaArea> {
  const out: Record<string, CheckpointDaArea> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [areaId, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!areaId || CHAVES_RECUSADAS.has(areaId) || !bruto || typeof bruto !== 'object') continue
    const r = bruto as Record<string, unknown>
    const itens = normalizarRespostas(r.itens)
    if (itens.length) {
      out[areaId] = { itens, placarAntigo: null }
      continue
    }
    const acertos = r.acertos
    const total = r.total
    if (!numeroFinito(acertos) || !numeroFinito(total)) continue
    if (!Number.isInteger(acertos) || !Number.isInteger(total)) continue
    if (total <= 0 || acertos > total) continue
    out[areaId] = { itens: [], placarAntigo: { acertos, total } }
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
 * Uma lista de vereditos por item vinda de fora, na forma que o estado usa.
 *
 * Indice inteiro nao negativo e veredito booleano: item repetido fica com o ultimo valor lido, em
 * vez de a lista ficar com dois vereditos para o mesmo item — quem conta acertos contaria o mesmo
 * item duas vezes. A mesma leitura serve ao diagnostico das trilhas e ao checkpoint das areas: a
 * forma e uma so.
 */
function normalizarRespostas(valor: unknown): RespostaDeItem[] {
  if (!Array.isArray(valor)) return []
  const porIndice = new Map<number, boolean>()
  for (const item of valor) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    if (typeof r.acertou !== 'boolean') continue
    if (!numeroFinito(r.indice) || !Number.isInteger(r.indice)) continue
    porIndice.set(r.indice, r.acertou)
  }
  return [...porIndice]
    .map(([indice, acertou]) => ({ indice, acertou }))
    .sort((a, b) => a.indice - b.indice)
}

/** Vereditos do diagnostico das trilhas: slug -> itens julgados, na ordem do material. */
function normalizarDiagnosticos(valor: unknown): Record<string, RespostaDeItem[]> {
  const out: Record<string, RespostaDeItem[]> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [slug, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!slug || CHAVES_RECUSADAS.has(slug) || !Array.isArray(bruto)) continue
    const respostas = normalizarRespostas(bruto)
    if (!respostas.length) continue
    out[slug] = respostas
  }
  return out
}

/**
 * Artefatos da secao 8 dos guias. `produzido` tem de ser booleano, e a data, um dia de calendario
 * — a mesma guarda dos dias ativos, porque a tela mostra essa data ao lado do artefato. Entrada
 * sem informacao nenhuma (`produzido: false`, sem data) fica: e a marca de "nao produzido", que e
 * uma resposta do estudante e nao sobra.
 */
function normalizarArtefatos(valor: unknown): Record<string, RegistroArtefato> {
  const out: Record<string, RegistroArtefato> = {}
  if (!valor || typeof valor !== 'object') return out
  for (const [chave, bruto] of Object.entries(valor as Record<string, unknown>)) {
    if (!chave || CHAVES_RECUSADAS.has(chave) || !bruto || typeof bruto !== 'object') continue
    const r = bruto as Record<string, unknown>
    if (typeof r.produzido !== 'boolean') continue
    // Data so faz sentido com o artefato produzido: guardada solta, ela diria que algo foi
    // produzido num registro que afirma o contrario.
    const data = r.produzido === true && ehDataIso(r.data) ? r.data : ''
    out[chave] = { produzido: r.produzido, data }
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
  // Exigir o campo recusaria o backup de quem estudou ate ontem. `revisao.falhasSeguidas`,
  // `diagnosticos`, `artefatos` e o veredito por item do checkpoint seguem a mesma regra, um
  // nivel abaixo ou ao lado.
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
 * Nao ha passo de migracao porque nao ha versao nova: os campos que estas fases acrescentaram
 * (`revisao.falhasSeguidas`, `diagnosticos`, `artefatos`, o veredito por item do checkpoint) sao
 * aditivos, e um arquivo gravado antes deles carrega igual — o normalizador poe o valor neutro no
 * que falta (zero falhas seguidas, mapas vazios, nenhum veredito). A escolha do valor neutro e
 * declarada: a v1 nao guarda o resultado de cada passagem, entao nao ha como saber se as duas
 * ultimas falharam, e supor "sim" faria o app exigir
 * releitura completa de um tema que talvez tenha acabado de acertar. O efeito colateral e o mesmo
 * de antes do campo: um tema que ja tinha duas falhas seguidas so entra em releitura completa
 * apos a proxima falha. O diagnostico e o artefato seguem a mesma politica: vazio quer dizer
 * "ainda nao respondido", que e exatamente o que o app mostra para quem nunca abriu a trilha. E o
 * checkpoint do arquivo antigo nao tem veredito nenhum, entao o normalizador nao inventa marca:
 * fica com o placar que estava la (`placarAntigo`), que e a unica copia daquele resultado.
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
    diagnosticos: normalizarDiagnosticos(bruto.diagnosticos),
    artefatos: normalizarArtefatos(bruto.artefatos),
  }
}
