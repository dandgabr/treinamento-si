// Orquestracao de filesystem: varre "conteudo/" e monta o objeto Conteudo.
// Separado do CLI (build-content.ts) para poder ser testado com um diretorio
// temporario, inclusive nos casos de pasta ausente e pasta vazia.
//
// O material e lido UMA vez e alimenta duas coisas: o mapa `caminho -> rota do app`
// (links-material.ts) e o parse de cada documento, que recebe um resolvedor para trocar os links
// relativos por rota na hora de virar HTML. E a unica passagem em que o caminho de origem de cada
// documento e conhecido — depois disso o conteudo e HTML e nao ha mais como saber de onde ele veio.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { Area, Conteudo, Nivel, Pagina, Ref, Tema } from '../../src/domain/types'
import {
  montarMapa,
  novoRelatorio,
  resolverDeLinks,
  type AreaDoDisco,
  type MaterialDoDisco,
  type PaginaDoDisco,
  type RelatorioDeLinks,
} from './links-material'
import { normalizarFontes, parseGuiaDeTexto, parsePaginaDeTexto, parseTemaDeTexto } from './markdown'

// Areas sao as pastas 00..17; 90/91/99 sao catalogos (certificacoes, trilhas, fontes).
const ehArea = (nome: string): boolean => /^\d{2}-/.test(nome) && !/^9\d-/.test(nome)
const ehCatalogo = (nome: string): boolean => /^(90|91|99)-/.test(nome)

/** Caminho do `.md` sem a extensao: e o slug que a pagina recebe no app. */
function slugDe(caminho: string): string {
  return caminho.replace(/\.md$/, '')
}

/**
 * Le o material inteiro do disco, na ordem em que o gerador sempre o percorreu.
 *
 * As pastas de ferramenta (`.commandcode`, `.playwright-mcp`) ficam de fora: elas moram dentro de
 * `conteudo/` e nao sao material — se entrassem no mapa, um link para la passaria por "existe".
 */
function lerMaterial(contentDir: string): MaterialDoDisco {
  const diretorios: string[] = []
  const arquivos: string[] = []
  const percorrer = (relativo: string): void => {
    const absoluto = relativo ? path.join(contentDir, relativo) : contentDir
    for (const entrada of fs.readdirSync(absoluto, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    )) {
      const caminho = relativo ? `${relativo}/${entrada.name}` : entrada.name
      if (entrada.isDirectory()) {
        if (entrada.name.startsWith('.')) continue
        diretorios.push(caminho)
        percorrer(caminho)
      } else if (entrada.name.endsWith('.md')) {
        arquivos.push(caminho)
      }
    }
  }
  percorrer('')

  const pastas = fs
    .readdirSync(contentDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const areas: AreaDoDisco[] = []
  for (const areaId of pastas.filter(ehArea).sort()) {
    const guia = path.join(contentDir, areaId, 'README.md')
    if (!fs.existsSync(guia)) continue
    const temas = fs
      .readdirSync(path.join(contentDir, areaId))
      .filter((f) => f.startsWith('TEMA-') && f.endsWith('.md'))
      .sort()
      .map((f) => ({
        caminho: `${areaId}/${f}`,
        texto: fs.readFileSync(path.join(contentDir, areaId, f), 'utf-8'),
      }))
    areas.push({ areaId, guia: fs.readFileSync(guia, 'utf-8'), temas })
  }

  const paginas: PaginaDoDisco[] = []
  const lerPagina = (caminho: string, grupo: string): void => {
    paginas.push({
      slug: slugDe(caminho),
      caminho,
      grupo,
      texto: fs.readFileSync(path.join(contentDir, caminho), 'utf-8'),
    })
  }
  if (fs.existsSync(path.join(contentDir, 'README.md'))) lerPagina('README.md', 'home')
  for (const nome of ['glossario.md', 'mapa-relacoes.md']) {
    if (fs.existsSync(path.join(contentDir, nome))) lerPagina(nome, 'referencia')
  }
  for (const catId of pastas.filter(ehCatalogo).sort()) {
    for (const f of fs
      .readdirSync(path.join(contentDir, catId))
      .filter((x) => x.endsWith('.md'))
      .sort()) {
      lerPagina(`${catId}/${f}`, catId)
    }
  }

  return { diretorios, arquivos, areas, paginas }
}

/** O conteudo e o que ficou anotado sobre os links que ele consumiu. */
export interface Geracao {
  conteudo: Conteudo
  links: RelatorioDeLinks
}

/** Le o Markdown de `contentDir` e devolve o conteudo estruturado. Nao escreve nada. */
export function gerarConteudo(contentDir: string): Conteudo {
  return gerarComRelatorio(contentDir).conteudo
}

/** `gerarConteudo` mais o relatorio de links, que o portao confere. */
export function gerarComRelatorio(contentDir: string): Geracao {
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Diretorio de conteudo nao encontrado: ${contentDir}`)
  }

  const material = lerMaterial(contentDir)
  const mapa = montarMapa(material)
  const links = novoRelatorio()
  // O resolvedor e por documento: o mesmo `TEMA-01.md` significa arquivos diferentes em areas
  // diferentes, e so o caminho de origem diz contra qual pasta resolver.
  const resolvedorDe = (origem: string) => resolverDeLinks(mapa, origem, links)

  const areas: Area[] = []
  const temas: Record<Ref, Tema> = {}

  for (const area of material.areas) {
    const { data } = matter(area.guia)
    const refs: Ref[] = []
    for (const arquivo of area.temas) {
      const tema = parseTemaDeTexto(arquivo.texto, area.areaId, resolvedorDe(arquivo.caminho))
      temas[tema.ref] = tema
      refs.push(tema.ref)
    }

    areas.push({
      areaId: area.areaId,
      areaNome: String(data.area_nome ?? area.areaId),
      ordemEstudo: Number(data.ordem_estudo ?? 999),
      nivel: (data.nivel as Nivel) ?? 'base',
      ancoragem: Array.isArray(data.ancoragem) ? data.ancoragem.map(String) : [],
      certificacoes: Array.isArray(data.certificacoes) ? data.certificacoes.map(String) : [],
      preRequisitos: Array.isArray(data.pre_requisitos) ? data.pre_requisitos.map(String) : [],
      temas: refs,
      fontes: normalizarFontes(data.fontes),
      statusVerificacao: String(data.status_verificacao ?? 'rascunho'),
      guia: parseGuiaDeTexto(area.guia, area.areaId, resolvedorDe(`${area.areaId}/README.md`)),
    })
  }

  areas.sort((a, b) => a.ordemEstudo - b.ordemEstudo)

  const ordemEstudo: Ref[] = areas.flatMap((a) =>
    [...a.temas].sort((x, y) => x.localeCompare(y, 'pt-BR', { numeric: true })),
  )

  const paginas: Pagina[] = material.paginas.map((p) =>
    parsePaginaDeTexto(p.texto, p.grupo, p.slug, resolvedorDe(p.caminho)),
  )

  return {
    conteudo: {
      meta: {
        geradoEm: new Date().toISOString(),
        totais: { areas: areas.length, temas: Object.keys(temas).length, paginas: paginas.length },
      },
      areas,
      temas,
      ordemEstudo,
      paginas,
    },
    links,
  }
}
