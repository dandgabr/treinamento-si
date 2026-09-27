// CLI do gate: valida o content.json e reprova o processo quando algo falta ou quando o arquivo
// ja nao e o que o material deriva.
// A validacao de forma vive em scripts/lib/validar-content.ts, para ser testavel.
//
// Uso: npm run check:content
// Variaveis opcionais: ROADMAP_CONTENT_FILE (outro content.json) e ROADMAP_CONTENT_DIR (outro
// diretorio de material, o que o arquivo tem de reproduzir). As duas existem para o gate poder
// ser exercitado num diretorio temporario, sem tocar no material do repositorio.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'
import { gerarComRelatorio } from './lib/gerar-conteudo'
import { declaracoesMortas } from './lib/links-material'
import { validar } from './lib/validar-content'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_FILE =
  process.env.ROADMAP_CONTENT_FILE ??
  path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')
const CONTENT_DIR = process.env.ROADMAP_CONTENT_DIR ?? path.resolve(APP_DIR, '..', 'conteudo')

if (!fs.existsSync(CONTENT_FILE)) {
  throw new Error('content.json ausente. Rode antes: npm run build:content')
}

const conteudo = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) as Conteudo
const erros = validar(conteudo)

/**
 * Serializacao estavel (chaves de objeto ordenadas): o objetivo e comparar significado, e nao a
 * ordem em que as chaves foram gravadas.
 */
function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(',')}]`
  if (valor && typeof valor === 'object') {
    const objeto = valor as Record<string, unknown>
    const corpo = Object.keys(objeto)
      .sort()
      .map((chave) => `${JSON.stringify(chave)}:${canonico(objeto[chave])}`)
      .join(',')
    return `{${corpo}}`
  }
  return JSON.stringify(valor) ?? 'null'
}

// O arquivo tem de ser o que o material deriva AGORA. Validar so o que esta em disco deixava
// passar material editado sem `npm run build:content`: o gate conferia um retrato velho contra
// ele mesmo e dizia "verificado". `geradoEm` fica de fora — e relogio, muda a cada geracao.
const { conteudo: derivadoAgora, links } = gerarComRelatorio(CONTENT_DIR)
const semRelogio = (c: Conteudo): string => canonico({ ...c, meta: { ...c.meta, geradoEm: '' } })
if (semRelogio(derivadoAgora) !== semRelogio(conteudo)) {
  erros.push(
    `content.json desatualizado em relação a ${CONTENT_DIR}: o material mudou depois da última ` +
      `geração — rode \`npm run build:content\` e confira de novo`,
  )
}

// Os links sao conferidos no MATERIAL de agora, e nao no HTML em disco: um link sem rota, um alvo
// que nao existe e uma declaracao sem uso sao defeitos do material, e reprovam mesmo que o
// content.json esteja fresco. O `validar` acima cobra o outro lado — que o HTML gerado nao tenha
// sobrado com href relativo nenhum.
erros.push(...links.erros, ...declaracoesMortas(links))

// O veredito sai depois da conta: anunciar "verificado" antes de olhar os erros
// fazia um build reprovado dizer que estava tudo bem e depois listar falhas.
for (const e of erros) console.log(`ERRO  ${e}`)
if (erros.length) {
  console.log(`\n${erros.length} erro(s) — content.json reprovado`)
  process.exit(1)
}
console.log(
  `verificado: ${conteudo.meta.totais.areas} areas, ${conteudo.meta.totais.temas} temas, ` +
    `${conteudo.meta.totais.paginas} paginas — 0 erro(s)`,
)
console.log(
  `links do material: ${links.paraRota} viraram rota do app, ${links.comoTexto} declarados sem rota ` +
    `(0 href relativo no HTML), ${links.intactos} externos`,
)
