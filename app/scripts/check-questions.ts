// Gate do banco de questoes ja gravado em `src/content/questions/`.
//
// Roda depois do build do banco e antes do Vite, como o `check:content`: se um item perder
// a fonte, ficar sem alternativa ou apontar para tema inexistente, o build para. E se o banco
// deixou de ser o que o material deriva agora (material editado sem `npm run build:questions`),
// tambem: a conferencia item a item contra a derivacao vive no `validarBanco`.
//
// Uso: npm run check:questions
// Variaveis opcionais (as mesmas do `build-questions`): ROADMAP_CONTENT_FILE e
// ROADMAP_QUESTIONS_DIR, para o gate ser exercitado num diretorio temporario.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'
import { validarBanco, type Questao } from './lib/questoes'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const CONTENT_FILE =
  process.env.ROADMAP_CONTENT_FILE ?? path.join(APP, 'src', 'content', 'generated', 'content.json')
const BANCO = process.env.ROADMAP_QUESTIONS_DIR ?? path.join(APP, 'src', 'content', 'questions')

const conteudo = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) as Conteudo

if (!fs.existsSync(BANCO)) {
  console.error(`Banco ausente: ${BANCO}\nRode antes: npm run build:questions`)
  process.exit(1)
}

const porArea: Record<string, Questao[]> = {}
for (const arquivo of fs.readdirSync(BANCO)) {
  if (!arquivo.endsWith('.json')) continue
  const areaId = arquivo.replace(/\.json$/, '')
  porArea[areaId] = JSON.parse(fs.readFileSync(path.join(BANCO, arquivo), 'utf-8')) as Questao[]
}

const banco = {
  porArea,
  total: Object.values(porArea).reduce((n, lista) => n + lista.length, 0),
}
const erros = validarBanco(banco, conteudo)

for (const e of erros) console.log(`ERRO  ${e}`)
if (erros.length) {
  console.log(`\n${erros.length} erro(s) — banco de questoes reprovado`)
  process.exit(1)
}
console.log(`verificado: ${banco.total} itens em ${Object.keys(porArea).length} areas — 0 erro(s)`)
