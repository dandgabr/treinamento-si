// CLI do gate: valida o content.json gerado e reprova o processo quando algo falta.
// A validacao em si vive em scripts/lib/validar-content.ts, para ser testavel.
//
// Uso: npm run check:content

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'
import { validar } from './lib/validar-content'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_FILE = path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')

if (!fs.existsSync(CONTENT_FILE)) {
  throw new Error('content.json ausente. Rode antes: npm run build:content')
}

const conteudo = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) as Conteudo
const erros = validar(conteudo)

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
