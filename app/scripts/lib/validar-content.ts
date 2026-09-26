// Gate de qualidade do conteudo extraido. Espelha as invariantes estruturais de
// "conteudo/scripts/verificar-repo.py" sobre o content.json, e acrescenta a validacao
// de forma dos campos que a interface de fato le — o gate antigo conferia `fontes` e
// `relacoes` (que a UI nao usa) e deixava passar um titulo vazio.

import { interpretarCriterio } from '../../src/domain/criterio'
import { SEQUENCIA_DIAS } from '../../src/domain/srs'
import type { Area, Conteudo, Guia, Pagina, Secao, Tema } from '../../src/domain/types'

/** Sequencia que o escalonador do app implementa hoje. */
const SEQUENCIA_PADRAO: readonly number[] = SEQUENCIA_DIAS

export const TOTAL_AREAS = 18
export const TOTAL_TEMAS = 109
/** Paginas do curso: glossario, mapa de relacoes e os 20 arquivos de 99-fontes. */
export const TOTAL_PAGINAS = 22

// Mesmo lexico de "conteudo/scripts/verificar-repo.py" (secao 5 do CONTRIBUTING).
export const LEXICO = [
  'mergulhe',
  'robusto',
  'abrangente',
  'no mundo atual',
  'cada vez mais',
  'vale destacar',
  'é importante ressaltar',
  'jornada de aprendizado',
  'jornada de transformação',
  'jornada de conhecimento',
  'no cenário atual',
  'não é apenas',
]

const NIVEIS = new Set(['base', 'intermediario', 'avancado'])

const MARCA_ANCORAGEM = 'Por que isso importa'
const MARCA_RECUPERACAO = 'Recuperação ativa'
const MARCA_FONTES = 'Fontes verificadas'

function semTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

function texto(partes: string[]): string {
  return partes.map(semTags).join(' ')
}

function checarLexico(onde: string, alvo: string, erros: string[]): void {
  for (const termo of LEXICO) {
    // Limite de palavra com lookaround Unicode: `\b` nao funciona com "é", e sem
    // isso "é importante ressaltar" nunca casaria e o termo seria letra morta.
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapado}(?![\\p{L}\\p{N}])`, 'iu')
    if (re.test(alvo)) erros.push(`${onde}: lexico proibido (${JSON.stringify(termo)})`)
  }
}

function checarSecoes(onde: string, secoes: Secao[], erros: string[], exigirUma: boolean): void {
  if (exigirUma && secoes.length < 1) erros.push(`${onde}: sem secoes`)
  for (const s of secoes) {
    if (!Number.isFinite(s.numero)) erros.push(`${onde}: secao com numero invalido`)
    if (!s.titulo) erros.push(`${onde}: secao ${s.numero} sem titulo`)
    if (typeof s.html !== 'string' || !s.html.trim()) {
      erros.push(`${onde}: secao ${s.numero} sem html`)
    }
  }
}

function validarTema(t: Tema, refs: Set<string>, erros: string[]): void {
  const onde = t.ref
  if (!t.titulo) erros.push(`${onde}: titulo vazio`)
  if (!NIVEIS.has(t.nivel)) erros.push(`${onde}: nivel invalido (${t.nivel})`)
  if (!t.tempoEstimado) erros.push(`${onde}: tempo_estimado vazio`)
  if (!t.objetivo) erros.push(`${onde}: objetivo de aprendizagem vazio`)

  const marcadores = t.secoes.map((s) => s.titulo).join(' | ')
  for (const [marca, nome] of [
    [MARCA_ANCORAGEM, 'bloco de ancoragem no cargo'],
    [MARCA_RECUPERACAO, 'itens de recuperacao ativa'],
    [MARCA_FONTES, 'rastreabilidade de fonte'],
  ] as const) {
    if (!marcadores.includes(marca)) erros.push(`${onde}: falta ${nome} (${JSON.stringify(marca)})`)
  }

  checarSecoes(onde, t.secoes, erros, true)

  if (t.preTeste.length < 1) erros.push(`${onde}: sem pre-teste`)
  for (const q of t.preTeste) if (!q.pergunta) erros.push(`${onde}: item de pre-teste vazio`)

  if (t.recuperacao.length < 2) {
    erros.push(`${onde}: recuperacao ativa com ${t.recuperacao.length} item(ns)`)
  }
  for (const q of t.recuperacao) {
    if (!q.pergunta) erros.push(`${onde}: item de recuperacao sem pergunta`)
    if (!q.resposta) erros.push(`${onde}: item de recuperacao sem gabarito`)
  }

  if (!t.fontes.length) erros.push(`${onde}: frontmatter sem fontes`)
  else if (!t.fontes.some((f) => f.url && f.tipo)) erros.push(`${onde}: fontes sem url/tipo`)

  if (t.errosComuns.length < 1) erros.push(`${onde}: sem tabela de erros comuns`)

  // O SRS do app implementa a sequencia [1, 7, 30]. O campo do tema e o dono declarado
  // desse dado; se um tema divergir, o build precisa acusar para alguem implementar a
  // leitura do campo em vez de o app mentir sobre o intervalo.
  if (
    t.revisaoInicialDias.length &&
    t.revisaoInicialDias.join(',') !== SEQUENCIA_PADRAO.join(',')
  ) {
    erros.push(
      `${onde}: revisao_inicial_dias ${JSON.stringify(t.revisaoInicialDias)} difere da sequencia ` +
        `implementada ${JSON.stringify(SEQUENCIA_PADRAO)}`,
    )
  }

  for (const [tipo, lista] of Object.entries(t.relacoes)) {
    for (const rel of lista) {
      if (!rel.alvo.includes('#')) erros.push(`${onde}: relacao ${tipo} com alvo invalido (${rel.alvo})`)
      else if (!rel.pendente && !refs.has(rel.alvo)) {
        erros.push(`${onde}: relacao ${tipo} aponta para ref inexistente (${rel.alvo})`)
      }
      if (!rel.motivo) erros.push(`${onde}: relacao ${tipo} sem motivo (${rel.alvo})`)
    }
  }
}

function validarArea(a: Area, refs: Set<string>, erros: string[]): void {
  if (!a.areaNome) erros.push(`${a.areaId}: area_nome vazio`)
  if (!Number.isFinite(a.ordemEstudo)) erros.push(`${a.areaId}: ordem_estudo invalida`)
  if (!NIVEIS.has(a.nivel)) erros.push(`${a.areaId}: nivel invalido (${a.nivel})`)
  if (!a.temas.length) erros.push(`${a.areaId}: guia sem temas`)
  for (const ref of a.temas) {
    if (!refs.has(ref)) erros.push(`${a.areaId}: guia referencia tema inexistente (${ref})`)
  }

  const g: Guia = a.guia
  checarSecoes(a.areaId, g.secoes, erros, true)
  // O guia tambem e prosa: ficava de fora da varredura de lexico que temas e paginas
  // recebiam, embora o README prometesse o contrario.
  checarLexico(a.areaId, texto([g.intro, ...g.secoes.map((s) => s.html)]), erros)
  if (g.checkpoint.length < 1) erros.push(`${a.areaId}: guia sem checkpoint`)
  for (const q of g.checkpoint) {
    if (!q.pergunta) erros.push(`${a.areaId}: checkpoint com item sem pergunta`)
    if (!q.resposta) erros.push(`${a.areaId}: checkpoint sem gabarito`)
  }
  if (!g.criterio) erros.push(`${a.areaId}: checkpoint sem criterio declarado`)
  else if (!interpretarCriterio(g.criterio)) {
    // Sem isto, um texto de criterio que o parser nao entende passava como valido e a
    // area ficava com um limiar inventado.
    erros.push(`${a.areaId}: criterio declarado nao interpretavel (${JSON.stringify(g.criterio)})`)
  }
}

function validarPagina(p: Pagina, erros: string[]): void {
  // Sem exigir >= 1 secao: glossario e mapa-relacoes usam `## Titulo` sem numero e
  // caem inteiros no intro.
  if (!p.slug) erros.push(`pagina sem slug`)
  if (!p.titulo) erros.push(`${p.slug}: titulo vazio`)
  checarSecoes(p.slug, p.secoes, erros, false)
}

export interface TotaisEsperados {
  areas: number
  temas: number
  /** Ausente, vale `TOTAL_PAGINAS`. */
  paginas?: number
}

/** Devolve a lista de problemas. Vazia significa conteudo aprovado. */
export function validar(
  c: Conteudo,
  esperado: TotaisEsperados = { areas: TOTAL_AREAS, temas: TOTAL_TEMAS },
): string[] {
  const erros: string[] = []

  // Conta os dados que o gate de fato percorre, e so depois confronta com o `meta`.
  // Ler os totais do proprio `meta` deixava passar tema removido do indice e da area.
  const totalAreas = c.areas.length
  const totalTemas = Object.keys(c.temas).length
  const totalPaginas = c.paginas.length

  if (totalAreas !== esperado.areas) {
    erros.push(`totais: ${totalAreas} areas, esperado ${esperado.areas}`)
  }
  if (totalTemas !== esperado.temas) {
    erros.push(`totais: ${totalTemas} temas, esperado ${esperado.temas}`)
  }
  // Sem numero esperado de paginas, apagar um arquivo de `99-fontes/` do diretorio de
  // conteudo passava: o gate comparava `meta.totais.paginas` com a contagem que ele mesmo
  // acabara de fazer, e as duas caiam juntas.
  const paginasEsperadas = esperado.paginas ?? TOTAL_PAGINAS
  if (totalPaginas !== paginasEsperadas) {
    erros.push(`totais: ${totalPaginas} paginas, esperado ${paginasEsperadas}`)
  }
  if (
    c.meta.totais.areas !== totalAreas ||
    c.meta.totais.temas !== totalTemas ||
    c.meta.totais.paginas !== totalPaginas
  ) {
    erros.push(
      `meta.totais divergente dos dados: ${JSON.stringify(c.meta.totais)} ` +
        `versus ${totalAreas}/${totalTemas}/${totalPaginas}`,
    )
  }

  const refs = new Set(Object.keys(c.temas))

  for (const [ref, t] of Object.entries(c.temas)) {
    validarTema(t, refs, erros)
    checarLexico(ref, texto([t.intro, ...t.secoes.map((s) => s.html)]), erros)
  }

  for (const a of c.areas) validarArea(a, refs, erros)

  for (const p of c.paginas) {
    validarPagina(p, erros)
    checarLexico(p.slug, texto([p.intro, ...p.secoes.map((s) => s.html)]), erros)
  }

  return erros
}
