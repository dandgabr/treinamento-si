// CLI: le o Markdown de "conteudo/" e escreve src/content/generated/content.json.
// Nada e reescrito: as secoes viram HTML, as questoes ja existentes sao extraidas e os
// blocos Mermaid ficam como texto (renderizados em runtime pelo mermaid.js).
//
// Uso: npm run build:content
// Variaveis opcionais: ROADMAP_CONTENT_DIR (aponta para outro diretorio de conteudo) e
// ROADMAP_CONTENT_FILE (outro destino). As duas existem para o gate poder ser exercitado num
// diretorio temporario, sem tocar no material do repositorio.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gerarConteudo } from './lib/gerar-conteudo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_DIR = process.env.ROADMAP_CONTENT_DIR ?? path.resolve(APP_DIR, '..', 'conteudo')
const OUT_FILE =
  process.env.ROADMAP_CONTENT_FILE ??
  path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')

const conteudo = gerarConteudo(CONTENT_DIR)

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(conteudo), 'utf-8')

const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0)
console.log(
  `content.json gerado: ${conteudo.meta.totais.areas} areas, ` +
    `${conteudo.meta.totais.temas} temas, ${conteudo.meta.totais.paginas} paginas (${kb} KB)`,
)
