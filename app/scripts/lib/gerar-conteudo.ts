// Orquestracao de filesystem: varre "conteudo/" e monta o objeto Conteudo.
// Separado do CLI (build-content.ts) para poder ser testado com um diretorio
// temporario, inclusive nos casos de pasta ausente e pasta vazia.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { Area, Conteudo, Nivel, Pagina, Ref, Tema } from '../../src/domain/types'
import { normalizarFontes, parseGuiaDeTexto, parsePaginaDeTexto, parseTemaDeTexto } from './markdown'

// Areas sao as pastas 00..17; 90/91/99 sao catalogos (certificacoes, trilhas, fontes).
const ehArea = (nome: string): boolean => /^\d{2}-/.test(nome) && !/^9\d-/.test(nome)
const ehCatalogo = (nome: string): boolean => /^(90|91|99)-/.test(nome)

function slugDe(arquivo: string, contentDir: string): string {
  return path
    .relative(contentDir, arquivo)
    .replace(/\.md$/, '')
    .split(path.sep)
    .join('/')
}

/** Le o Markdown de `contentDir` e devolve o conteudo estruturado. Nao escreve nada. */
export function gerarConteudo(contentDir: string): Conteudo {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Diretorio de conteudo nao encontrado: ${contentDir}`)
  }

  const dirs = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const areaIds = dirs.filter(ehArea).sort()
  const catalogoIds = dirs.filter(ehCatalogo).sort()

  const areas: Area[] = []
  const temas: Record<Ref, Tema> = {}

  for (const areaId of areaIds) {
    const dir = path.join(contentDir, areaId)
    const guiaPath = path.join(dir, 'README.md')
    if (!fs.existsSync(guiaPath)) continue
    const { data } = matter(fs.readFileSync(guiaPath, 'utf-8'))

    const refs: Ref[] = []
    const arquivosTema = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith('TEMA-') && f.endsWith('.md'))
      .sort()
    for (const f of arquivosTema) {
      const tema = parseTemaDeTexto(fs.readFileSync(path.join(dir, f), 'utf-8'), areaId)
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
      guia: parseGuiaDeTexto(fs.readFileSync(guiaPath, 'utf-8'), areaId),
    })
  }

  areas.sort((a, b) => a.ordemEstudo - b.ordemEstudo)

  const ordemEstudo: Ref[] = areas.flatMap((a) =>
    [...a.temas].sort((x, y) => x.localeCompare(y, 'pt-BR', { numeric: true })),
  )

  const paginas: Pagina[] = []
  const lerPagina = (arquivo: string, grupo: string): Pagina =>
    parsePaginaDeTexto(fs.readFileSync(arquivo, 'utf-8'), grupo, slugDe(arquivo, contentDir))

  const raizHome = path.join(contentDir, 'README.md')
  if (fs.existsSync(raizHome)) paginas.push(lerPagina(raizHome, 'home'))
  for (const nome of ['glossario.md', 'mapa-relacoes.md']) {
    const p = path.join(contentDir, nome)
    if (fs.existsSync(p)) paginas.push(lerPagina(p, 'referencia'))
  }
  for (const catId of catalogoIds) {
    const dir = path.join(contentDir, catId)
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
      paginas.push(lerPagina(path.join(dir, f), catId))
    }
  }

  return {
    meta: {
      geradoEm: new Date().toISOString(),
      totais: { areas: areas.length, temas: Object.keys(temas).length, paginas: paginas.length },
    },
    areas,
    temas,
    ordemEstudo,
    paginas,
  }
}
