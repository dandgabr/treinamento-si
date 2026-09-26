// Build-time: le o Markdown de "conteudo/" e produz src/content/generated/content.json.
// Nada e reescrito: as secoes viram HTML, as questoes ja existentes sao extraidas e os
// blocos Mermaid ficam como texto (renderizados em runtime pelo mermaid.js).
//
// Uso: npm run build:content

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import type {
  Area,
  Conteudo,
  ErroComum,
  Fonte,
  Guia,
  Nivel,
  Pagina,
  ParQA,
  Ref,
  Relacao,
  Relacoes,
  Secao,
  Tabela,
  Tema,
  TipoRelacao,
} from '../src/domain/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_DIR = path.resolve(APP_DIR, '..', 'conteudo')
const OUT_FILE = path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')

// Areas sao as pastas 00..17; 90/91/99 sao catalogos (certificacoes, trilhas, fontes).
const ehArea = (nome: string): boolean => /^\d{2}-/.test(nome) && !/^9\d-/.test(nome)
const ehCatalogo = (nome: string): boolean => /^(90|91|99)-/.test(nome)

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

const TAGS_PERMITIDAS = [
  'a', 'blockquote', 'br', 'code', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'ol', 'p', 'pre',
  'span', 'strong', 'summary', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
]
const ATRIBUTOS_PERMITIDOS = ['class', 'href', 'start', 'id', 'colspan', 'rowspan', 'open', 'title']
const ATRIBUTOS_PROIBIDOS = ['style', 'action', 'src', 'srcset', 'target', 'formaction']

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

function renderSeguro(markdown: string): string {
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const RE_MERMAID = /^```mermaid[ \t]*\n([\s\S]*?)^```[ \t]*$/gm

/** Extrai os blocos Mermaid e os substitui por um div que o app hidrata. */
function extrairMermaid(texto: string): { texto: string; blocos: string[] } {
  const blocos: string[] = []
  const out = texto.replace(RE_MERMAID, (_m, codigo: string) => {
    const src = String(codigo).replace(/\s+$/, '')
    blocos.push(src)
    return `<div class="mermaid">${escapeHtml(src)}</div>`
  })
  return { texto: out, blocos }
}

const RE_SECAO = /^##\s+(\d+)\.\s+(.+)$/gm

interface SecaoCrua {
  numero: number
  titulo: string
  raw: string
}

/** Fatia o corpo pelos cabecalhos `## N. Titulo`. */
function fatiarSecoes(corpo: string): { intro: string; secoes: SecaoCrua[] } {
  const marcas = [...corpo.matchAll(RE_SECAO)]
  const intro = marcas.length ? corpo.slice(0, marcas[0].index).trim() : corpo.trim()
  const secoes = marcas.map((m, i) => {
    const inicio = (m.index ?? 0) + m[0].length
    const fim = i + 1 < marcas.length ? (marcas[i + 1].index ?? corpo.length) : corpo.length
    return { numero: Number(m[1]), titulo: m[2].trim(), raw: corpo.slice(inicio, fim).trim() }
  })
  return { intro, secoes }
}

const RE_ITEM = /^(\d+)\.\s+([\s\S]*?)(?=^\d+\.\s|$)/gm

function itensNumerados(texto: string): string[] {
  const out: string[] = []
  for (const m of texto.matchAll(RE_ITEM)) {
    const item = m[2].replace(/\n{3,}/g, '\n\n').trim()
    if (item) out.push(item)
  }
  return out
}

function limparConfianca(t: string): string {
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

function celulasDaLinha(linha: string): string[] {
  return linha
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/** Converte a primeira tabela Markdown do trecho. */
function parseTabela(raw: string): Tabela | null {
  const linhas = raw.split('\n').filter((l) => l.trim().startsWith('|'))
  if (linhas.length < 3) return null
  const cabecalho = celulasDaLinha(linhas[0])
  const dados = linhas
    .slice(2)
    .map(celulasDaLinha)
    .filter((r) => r.some((c) => c !== ''))
  if (!dados.length) return null
  return { cabecalho, linhas: dados }
}

/** Extrai pares pergunta/resposta de um bloco com `N.` antes e dentro de `<details>`. */
function extrairQA(raw: string): { pares: ParQA[]; criterio: string } {
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
  return { pares, criterio: m ? m[1].trim() : '' }
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

function normalizarFontes(v: unknown): Fonte[] {
  if (!Array.isArray(v)) return []
  return v.filter((f) => f && typeof f === 'object').map((f) => normalizarFonte(f as Record<string, unknown>))
}

const CHAVES_RELACAO: Record<string, TipoRelacao> = {
  complementa: 'complementa',
  aprofundado_por: 'aprofundadoPor',
  aplicado_em: 'aplicadoEm',
  nao_confundir_com: 'naoConfundirCom',
}

function normalizarRelacoes(v: unknown): Relacoes {
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

function secaoTexto(secoes: SecaoCrua[], numero: number): string {
  return secoes.find((s) => s.numero === numero)?.raw ?? ''
}

/**
 * O intro e tudo o que vem antes do primeiro `## N.`, o que inclui a linha `# Titulo`.
 * O app ja exibe esse titulo a partir do frontmatter, entao o `<h1>` e removido para
 * nao duplicar o cabecalho (e nao dar dois h1 por pagina).
 */
function renderIntro(introCru: string): string {
  const html = renderSeguro(extrairMermaid(introCru).texto)
  return html.replace(/^\s*<h1>[\s\S]*?<\/h1>\s*/, '')
}

// --------------------------------------------------------------------- tema

function parseTema(arquivo: string, areaId: string): Tema {
  const { data, content } = matter(fs.readFileSync(arquivo, 'utf-8'))
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas)
  const intro = renderIntro(introCru)

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
    intro,
    secoes,
    preTeste,
    recuperacao,
    errosComuns,
    mermaid,
  }
}

// ---------------------------------------------------------------- guia/home

function parseGuia(arquivo: string, areaId: string): Guia {
  const { content } = matter(fs.readFileSync(arquivo, 'utf-8'))
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

function parsePagina(arquivo: string, grupo: string): Pagina {
  const { data, content } = matter(fs.readFileSync(arquivo, 'utf-8'))
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas)
  const tituloMatch = content.match(/^#\s+(.+)$/m)
  const slug = path
    .relative(CONTENT_DIR, arquivo)
    .replace(/\.md$/, '')
    .split(path.sep)
    .join('/')
  return {
    slug,
    titulo: tituloMatch ? tituloMatch[1].trim() : String(data.escopo ?? slug),
    grupo,
    intro: renderIntro(introCru),
    secoes,
    mermaid,
  }
}

// --------------------------------------------------------------------- main

function main(): void {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Diretorio de conteudo nao encontrado: ${CONTENT_DIR}`)
  }

  const dirs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const areaIds = dirs.filter(ehArea).sort()
  const catalogoIds = dirs.filter(ehCatalogo).sort()

  const areas: Area[] = []
  const temas: Record<Ref, Tema> = {}

  for (const areaId of areaIds) {
    const dir = path.join(CONTENT_DIR, areaId)
    const guiaPath = path.join(dir, 'README.md')
    if (!fs.existsSync(guiaPath)) continue
    const { data } = matter(fs.readFileSync(guiaPath, 'utf-8'))

    const refs: Ref[] = []
    const arquivosTema = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith('TEMA-') && f.endsWith('.md'))
      .sort()
    for (const f of arquivosTema) {
      const tema = parseTema(path.join(dir, f), areaId)
      temas[tema.ref] = tema
      refs.push(tema.ref)
    }

    areas.push({
      areaId,
      areaNome: String(data.area_nome ?? areaId),
      ordemEstudo: Number(data.ordem_estudo ?? 999),
      nivel: (data.nivel as Nivel) ?? 'base',
      ancoragem: Array.isArray(data.ancoragem) ? data.ancoragem.map(String) : [],
      certificacoes: Array.isArray(data.certificacoes) ? data.certificacoes.map(String) : [],
      preRequisitos: Array.isArray(data.pre_requisitos) ? data.pre_requisitos.map(String) : [],
      temas: refs,
      fontes: normalizarFontes(data.fontes),
      statusVerificacao: String(data.status_verificacao ?? 'rascunho'),
      guia: parseGuia(guiaPath, areaId),
    })
  }

  areas.sort((a, b) => a.ordemEstudo - b.ordemEstudo)

  const ordemEstudo: Ref[] = areas.flatMap((a) =>
    [...a.temas].sort((x, y) => x.localeCompare(y, 'pt-BR', { numeric: true })),
  )

  const paginas: Pagina[] = []
  const raizHome = path.join(CONTENT_DIR, 'README.md')
  if (fs.existsSync(raizHome)) paginas.push(parsePagina(raizHome, 'home'))
  for (const nome of ['glossario.md', 'mapa-relacoes.md']) {
    const p = path.join(CONTENT_DIR, nome)
    if (fs.existsSync(p)) paginas.push(parsePagina(p, 'referencia'))
  }
  for (const catId of catalogoIds) {
    const dir = path.join(CONTENT_DIR, catId)
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
      paginas.push(parsePagina(path.join(dir, f), catId))
    }
  }

  const conteudo: Conteudo = {
    meta: {
      geradoEm: new Date().toISOString(),
      totais: { areas: areas.length, temas: Object.keys(temas).length, paginas: paginas.length },
    },
    areas,
    temas,
    ordemEstudo,
    paginas,
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(conteudo), 'utf-8')

  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0)
  console.log(
    `content.json gerado: ${conteudo.meta.totais.areas} areas, ` +
      `${conteudo.meta.totais.temas} temas, ${conteudo.meta.totais.paginas} paginas (${kb} KB)`,
  )
}

main()
