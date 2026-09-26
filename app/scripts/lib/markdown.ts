// Parser do Markdown de "conteudo/" — funcoes puras sobre texto.
//
// Ficam aqui, e nao no orquestrador de filesystem, para poderem ser testadas com
// fixtures pequenos: `parseTemaDeTexto` recebe a string do arquivo, nunca um caminho.

import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import type {
  ErroComum,
  Fonte,
  Guia,
  Nivel,
  Pagina,
  ParQA,
  Relacao,
  Relacoes,
  Secao,
  Tabela,
  Tema,
  TipoRelacao,
} from '../../src/domain/types'

const md = new MarkdownIt({ html: true, linkify: false, typographer: false })

// O HTML e gerado a partir de Markdown do proprio repositorio, mas o bundle e
// distribuido como arquivo unico e persiste para todo mundo que abrir o app: vale
// tratar o Markdown como fronteira de confianca.
//
// A allowlist e explicita e corresponde exatamente ao que o corpus usa hoje (tags
// conferidas sobre o content.json gerado). Se um tema novo introduzir outra tag, o
// build falha em vez de limpar em silencio — a sanitizacao precisa acusar, nao curar.
// O cast isola a unica conversao insegura (o DOMWindow do jsdom satisfaz o WindowLike
// exigido pelo DOMPurify, mas os tipos nao declaram isso).
type JanelaDOMPurify = Parameters<typeof createDOMPurify>[0]
const DOM_PURIFY = createDOMPurify(new JSDOM('').window as unknown as JanelaDOMPurify)

export const TAGS_PERMITIDAS = [
  'a', 'blockquote', 'br', 'code', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'ol', 'p', 'pre',
  'span', 'strong', 'summary', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
]
export const ATRIBUTOS_PERMITIDOS = ['class', 'href', 'start', 'id', 'colspan', 'rowspan', 'open', 'title']
export const ATRIBUTOS_PROIBIDOS = ['style', 'action', 'src', 'srcset', 'target', 'formaction']

// Ao sanitizar uma string, o DOMPurify monta um documento e descarta o in-volucro
// (body/html/head) — isso aparece em `removed` e nao e perda de conteudo.
const INVOLUCROS = new Set(['BODY', 'HTML', 'HEAD'])

type Removido = (typeof DOM_PURIFY.removed)[number]

function removidosRelevantes(): Removido[] {
  return DOM_PURIFY.removed.filter((entrada) => {
    // Atributo removido (on*, style, src...) e sempre digno de revisao.
    if ('attribute' in entrada) return true
    return !INVOLUCROS.has(entrada.element.nodeName)
  })
}

function descreverRemovidos(): string {
  return removidosRelevantes()
    .map((entrada) => {
      if ('attribute' in entrada) {
        return `@${entrada.attribute?.name ?? '?'} em <${entrada.from.nodeName.toLowerCase()}>`
      }
      const no = entrada.element as Node & { outerHTML?: string }
      const tag = `<${no.nodeName.toLowerCase()}>`
      return no.outerHTML ? `${tag} ${no.outerHTML.slice(0, 160)}` : tag
    })
    .join(' | ')
}

function textoVisivel(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

/** Markdown -> HTML sanitizado. Lanca se a sanitizacao remover qualquer conteudo. */
export function renderSeguro(markdown: string): string {
  const bruto = md.render(markdown)
  const limpo = DOM_PURIFY.sanitize(bruto, {
    ALLOWED_TAGS: TAGS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
    FORBID_ATTR: ATRIBUTOS_PROIBIDOS,
    ALLOW_DATA_ATTR: false,
  })
  // Ponto cego conhecido: quando o bloco INTEIRO e um unico elemento proibido
  // (por exemplo um <style> no topo), o DOMPurify o descarta sem registra-lo em
  // `removed` — so o in-volucro body aparece. Sem comparar o texto, o build passaria
  // com o bloco vazio. A sanitizacao precisa acusar, nao curar.
  const perdeuTudo = textoVisivel(bruto).length > 0 && textoVisivel(limpo).length === 0
  if (removidosRelevantes().length || perdeuTudo) {
    const detalhe = descreverRemovidos() || 'todo o conteudo do bloco'
    throw new Error(`sanitizacao removeu conteudo; revise o Markdown antes de publicar: ${detalhe}`)
  }
  return limpo
}

// ---------------------------------------------------------------- utilitarios

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const RE_MERMAID = /^```mermaid[ \t]*\n([\s\S]*?)^```[ \t]*$/gm

/** Extrai os blocos Mermaid e os substitui por um div que o app hidrata. */
export function extrairMermaid(texto: string): { texto: string; blocos: string[] } {
  const blocos: string[] = []
  const out = texto.replace(RE_MERMAID, (_m, codigo: string) => {
    const src = String(codigo).replace(/\s+$/, '')
    blocos.push(src)
    return `<div class="mermaid">${escapeHtml(src)}</div>`
  })
  return { texto: out, blocos }
}

export interface SecaoCrua {
  numero: number
  titulo: string
  raw: string
}

const RE_SECAO = /^##\s+(\d+)\.\s+(.+)$/gm

/** Fatia o corpo pelos cabecalhos `## N. Titulo`. */
export function fatiarSecoes(corpo: string): { intro: string; secoes: SecaoCrua[] } {
  const marcas = [...corpo.matchAll(RE_SECAO)]
  const intro = marcas.length ? corpo.slice(0, marcas[0]?.index ?? 0).trim() : corpo.trim()
  const secoes = marcas.map((m, i) => {
    const inicio = (m.index ?? 0) + m[0].length
    const fim = i + 1 < marcas.length ? (marcas[i + 1]?.index ?? corpo.length) : corpo.length
    return { numero: Number(m[1] ?? 0), titulo: (m[2] ?? '').trim(), raw: corpo.slice(inicio, fim).trim() }
  })
  return { intro, secoes }
}

const RE_ITEM = /^(\d+)\.\s+([\s\S]*?)(?=^\d+\.\s|$)/gm

export function itensNumerados(texto: string): string[] {
  const out: string[] = []
  for (const m of texto.matchAll(RE_ITEM)) {
    const item = (m[2] ?? '').replace(/\n{3,}/g, '\n\n').trim()
    if (item) out.push(item)
  }
  return out
}

export function limparConfianca(t: string): string {
  // O marcador de confianca vive em linha propria. Filtrar por linha cobre tambem
  // formatos nao canonicos ("Confiança: 3", "Confiança: (1-5)") que vazariam para
  // a pergunta exibida se o corte dependesse do sublinhado.
  return t
    .split('\n')
    .filter((linha) => !/^\s*Confiança:\s*/.test(linha))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function celulasDaLinha(linha: string): string[] {
  return linha
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/** Converte a primeira tabela Markdown do trecho. */
export function parseTabela(raw: string): Tabela | null {
  const linhas = raw.split('\n').filter((l) => l.trim().startsWith('|'))
  if (linhas.length < 3) return null
  const cabecalho = celulasDaLinha(linhas[0] ?? '')
  const dados = linhas
    .slice(2)
    .map(celulasDaLinha)
    .filter((r) => r.some((c) => c !== ''))
  if (!dados.length) return null
  return { cabecalho, linhas: dados }
}

/** Extrai pares pergunta/resposta de um bloco com `N.` antes e dentro de `<details>`. */
export function extrairQA(raw: string): { pares: ParQA[]; criterio: string } {
  const idx = raw.search(/<details>/)
  const antes = idx >= 0 ? raw.slice(0, idx) : raw
  const detalhe = idx >= 0 ? raw.slice(idx) : ''
  const perguntas = itensNumerados(antes)
  const semTags = detalhe
    .replace(/<\/?details>/g, '')
    .replace(/<summary>[\s\S]*?<\/summary>/g, '')
  const respostas = itensNumerados(semTags)
  const pares = perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] ?? '' }))
  // Nos guias o criterio vem rotulado; ancorar na frase evita casar "criterio" solto
  // dentro de uma resposta.
  const m = semTags.match(/Crit[ée]rio para seguir adiante:([\s\S]*)$/i)
  return { pares, criterio: m ? (m[1] ?? '').trim() : '' }
}

function normalizarFonte(f: Record<string, unknown>): Fonte {
  return {
    titulo: String(f.titulo ?? ''),
    url: String(f.url ?? ''),
    tipo: (f.tipo as Fonte['tipo']) ?? 'secundaria',
    acessadoEm: f.acessado_em ? String(f.acessado_em) : undefined,
    confianca: f.confianca as Fonte['confianca'],
  }
}

export function normalizarFontes(v: unknown): Fonte[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((f) => f && typeof f === 'object')
    .map((f) => normalizarFonte(f as Record<string, unknown>))
}

const CHAVES_RELACAO: Record<string, TipoRelacao> = {
  complementa: 'complementa',
  aprofundado_por: 'aprofundadoPor',
  aplicado_em: 'aplicadoEm',
  nao_confundir_com: 'naoConfundirCom',
}

export function normalizarRelacoes(v: unknown): Relacoes {
  const base: Relacoes = {
    complementa: [],
    aprofundadoPor: [],
    aplicadoEm: [],
    naoConfundirCom: [],
  }
  if (!v || typeof v !== 'object') return base
  const obj = v as Record<string, unknown>
  for (const [chaveYaml, chave] of Object.entries(CHAVES_RELACAO)) {
    const lista = obj[chaveYaml]
    if (!Array.isArray(lista)) continue
    base[chave] = lista
      .filter((r) => r && typeof r === 'object')
      .map((r) => {
        const rel = r as Record<string, unknown>
        return {
          alvo: String(rel.alvo ?? ''),
          motivo: String(rel.motivo ?? ''),
          pendente: Boolean(rel.pendente),
        } satisfies Relacao
      })
  }
  return base
}

function render(secoesCruas: SecaoCrua[]): { secoes: Secao[]; mermaid: string[] } {
  const mermaid: string[] = []
  const secoes: Secao[] = secoesCruas.map((s) => {
    const { texto, blocos } = extrairMermaid(s.raw)
    mermaid.push(...blocos)
    return { numero: s.numero, titulo: s.titulo, html: renderSeguro(texto) }
  })
  return { secoes, mermaid }
}

export function secaoTexto(secoes: SecaoCrua[], numero: number): string {
  return secoes.find((s) => s.numero === numero)?.raw ?? ''
}

/**
 * O intro e tudo o que vem antes do primeiro `## N.`, o que inclui a linha `# Titulo`.
 * O app ja exibe esse titulo a partir do frontmatter, entao o `<h1>` e removido para
 * nao duplicar o cabecalho (e nao dar dois h1 por pagina).
 */
export function renderIntro(introCru: string): string {
  const html = renderSeguro(extrairMermaid(introCru).texto)
  return html.replace(/^\s*<h1>[\s\S]*?<\/h1>\s*/, '')
}

// ---------------------------------------------------------------- documentos

export function parseTemaDeTexto(texto: string, areaId: string): Tema {
  const { data, content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas)

  const preTeste = itensNumerados(secaoTexto(cruas, 3)).map((p) => ({
    pergunta: limparConfianca(p),
  }))

  const { pares: recuperacao } = extrairQA(secaoTexto(cruas, 10))

  const tabelaErros = parseTabela(secaoTexto(cruas, 9))
  const errosComuns: ErroComum[] = (tabelaErros?.linhas ?? []).map((r) => ({
    equivoco: r[0] ?? '',
    porque: r[1] ?? '',
    correto: r[2] ?? '',
  }))

  return {
    ref: `${areaId}#${String(data.tema_id)}`,
    areaId,
    temaId: String(data.tema_id ?? ''),
    titulo: String(data.tema ?? ''),
    nivel: (data.nivel as Nivel) ?? 'base',
    tempoEstimado: String(data.tempo_estimado ?? ''),
    objetivo: String(data.objetivo_aprendizagem ?? ''),
    certificacoes: Array.isArray(data.certificacoes) ? data.certificacoes.map(String) : [],
    preRequisitos: Array.isArray(data.pre_requisitos) ? data.pre_requisitos.map(String) : [],
    atendeObjetivo: Array.isArray(data.atende_objetivo) ? data.atende_objetivo.map(Number) : [],
    relacoes: normalizarRelacoes(data.relacoes),
    fontes: normalizarFontes(data.fontes),
    revisaoInicialDias: Array.isArray(data.revisao_inicial_dias)
      ? data.revisao_inicial_dias.map(Number)
      : [],
    proximaRevisao: data.proxima_revisao ? String(data.proxima_revisao) : null,
    statusVerificacao: String(data.status_verificacao ?? 'rascunho'),
    intro: renderIntro(introCru),
    secoes,
    preTeste,
    recuperacao,
    errosComuns,
    mermaid,
  }
}

export function parseGuiaDeTexto(texto: string, areaId: string): Guia {
  const { content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas)
  const { pares: checkpoint, criterio } = extrairQA(secaoTexto(cruas, 9))
  return {
    areaId,
    intro: renderIntro(introCru),
    secoes,
    checkpoint,
    criterio,
    tabelaTemas: parseTabela(secaoTexto(cruas, 4)),
    objetivos: parseTabela(secaoTexto(cruas, 2)),
    atividades: parseTabela(secaoTexto(cruas, 8)),
    mermaid,
  }
}

export function parsePaginaDeTexto(texto: string, grupo: string, slug: string): Pagina {
  const { data, content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas)
  const tituloMatch = content.match(/^#\s+(.+)$/m)
  return {
    slug,
    titulo: tituloMatch ? (tituloMatch[1] ?? '').trim() : String(data.escopo ?? slug),
    grupo,
    intro: renderIntro(introCru),
    secoes,
    mermaid,
  }
}
