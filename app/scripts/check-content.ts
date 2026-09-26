// Gate de qualidade do conteudo extraido. Espelha as invariantes estruturais de
// "conteudo/scripts/verificar-repo.py" sobre o content.json, para o app nunca ser
// construido sobre conteudo faltando ou fora do padrao.
//
// Uso: npm run check:content

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_FILE = path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')

const TOTAL_AREAS = 18
const TOTAL_TEMAS = 109

// Mesmo lexico de "conteudo/scripts/verificar-repo.py" (secao 5 do CONTRIBUTING).
const LEXICO = [
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

const MARCA_ANCORAGEM = 'Por que isso importa'
const MARCA_RECUPERACAO = 'Recuperação ativa'
const MARCA_FONTES = 'Fontes verificadas'

const erros: string[] = []

function semTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

function checarLexico(onde: string, textos: string[]): void {
  const alvo = textos.map(semTags).join(' ')
  for (const termo of LEXICO) {
    // Limite de palavra com lookaround Unicode: `\b` nao funciona com "é", e sem
    // isso "é importante ressaltar" nunca casaria e o termo seria letra morta.
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapado}(?![\\p{L}\\p{N}])`, 'iu')
    if (re.test(alvo)) erros.push(`${onde}: lexico proibido (${JSON.stringify(termo)})`)
  }
}

function main(): void {
  if (!fs.existsSync(CONTENT_FILE)) {
    throw new Error(`content.json ausente. Rode antes: npm run build:content`)
  }
  const c = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) as Conteudo

  // Conta os dados que o gate de fato percorre, e so depois confronta com o `meta`.
  // Ler os totais do proprio `meta` deixava passar tema removido do indice e da area:
  // o gate imprimia "109 temas" com o valor que o build tinha escrito.
  const totalAreas = c.areas.length
  const totalTemas = Object.keys(c.temas).length
  const totalPaginas = c.paginas.length

  if (totalAreas !== TOTAL_AREAS) {
    erros.push(`totais: ${totalAreas} areas, esperado ${TOTAL_AREAS}`)
  }
  if (totalTemas !== TOTAL_TEMAS) {
    erros.push(`totais: ${totalTemas} temas, esperado ${TOTAL_TEMAS}`)
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
    const marcadores = t.secoes.map((s) => s.titulo).join(' | ')
    for (const [marca, nome] of [
      [MARCA_ANCORAGEM, 'bloco de ancoragem no cargo'],
      [MARCA_RECUPERACAO, 'itens de recuperacao ativa'],
      [MARCA_FONTES, 'rastreabilidade de fonte'],
    ] as const) {
      if (!marcadores.includes(marca)) erros.push(`${ref}: falta ${nome} (${JSON.stringify(marca)})`)
    }
    if (t.preTeste.length < 1) erros.push(`${ref}: sem pre-teste`)
    if (t.recuperacao.length < 2) erros.push(`${ref}: recuperacao ativa com ${t.recuperacao.length} item(ns)`)
    if (t.recuperacao.some((q) => !q.resposta)) erros.push(`${ref}: recuperacao sem gabarito`)
    if (!t.fontes.length) erros.push(`${ref}: frontmatter sem fontes`)
    if (t.errosComuns.length < 1) erros.push(`${ref}: sem tabela de erros comuns`)

    for (const [tipo, lista] of Object.entries(t.relacoes)) {
      for (const rel of lista) {
        if (!rel.alvo.includes('#')) erros.push(`${ref}: relacao ${tipo} com alvo invalido (${rel.alvo})`)
        else if (!rel.pendente && !refs.has(rel.alvo)) {
          erros.push(`${ref}: relacao ${tipo} aponta para ref inexistente (${rel.alvo})`)
        }
        if (!rel.motivo) erros.push(`${ref}: relacao ${tipo} sem motivo (${rel.alvo})`)
      }
    }

    checarLexico(ref, [t.intro, ...t.secoes.map((s) => s.html)])
  }

  for (const a of c.areas) {
    if (a.guia.checkpoint.length < 1) erros.push(`${a.areaId}: guia sem checkpoint`)
    if (a.guia.checkpoint.some((q) => !q.resposta)) {
      erros.push(`${a.areaId}: checkpoint sem gabarito`)
    }
    if (!a.guia.criterio) erros.push(`${a.areaId}: checkpoint sem criterio declarado`)
    if (!a.temas.length) erros.push(`${a.areaId}: guia sem temas`)
    for (const ref of a.temas) {
      if (!refs.has(ref)) erros.push(`${a.areaId}: guia referencia tema inexistente (${ref})`)
    }
  }

  for (const p of c.paginas) checarLexico(p.slug, [p.intro, ...p.secoes.map((s) => s.html)])

  console.log(
    `verificado: ${c.meta.totais.areas} areas, ${c.meta.totais.temas} temas, ` +
      `${c.meta.totais.paginas} paginas`,
  )
  for (const e of erros) console.log(`ERRO  ${e}`)
  console.log(`\n${erros.length} erro(s)`)
  if (erros.length) process.exit(1)
}

main()
