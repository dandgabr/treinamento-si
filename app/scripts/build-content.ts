// CLI: le o Markdown de "conteudo/" e escreve src/content/generated/content.json.
// Nada e reescrito: as secoes viram HTML, as questoes ja existentes sao extraidas e os
// blocos Mermaid ficam como texto (renderizados em runtime pelo mermaid.js).
//
// Os links relativos do material viram rota do app AQUI, na geracao: o material continua
// escrevendo caminho de arquivo (quem le no GitHub nao perde a referencia cruzada) e quem le no
// app recebe `#/area/...`, `#/tema/...` ou `#/pagina/...`. Ver scripts/lib/links-material.ts.
//
// Uso: npm run build:content
// Variaveis opcionais: ROADMAP_CONTENT_DIR (aponta para outro diretorio de conteudo) e
// ROADMAP_CONTENT_FILE (outro destino). As duas existem para o gate poder ser exercitado num
// diretorio temporario, sem tocar no material do repositorio.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gerarComRelatorio } from './lib/gerar-conteudo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const APP_DIR = path.resolve(__dirname, '..')
const CONTENT_DIR = process.env.ROADMAP_CONTENT_DIR ?? path.resolve(APP_DIR, '..', 'conteudo')
const OUT_FILE =
  process.env.ROADMAP_CONTENT_FILE ??
  path.resolve(APP_DIR, 'src', 'content', 'generated', 'content.json')

const { conteudo, links } = gerarComRelatorio(CONTENT_DIR)

// Defeito de link PARA o build, e nao so para o `check:content`.
//
// `npm run dev` e `build:content && vite`, sem a conferencia: enquanto o defeito so era impresso
// aqui, o link morto (um `href` protocol-relative em HTML cru, um fragmento que nao e rota)
// chegava a tela de quem rodava o dev. O codigo de saida e o unico sinal que o `&&` do npm le.
if (links.erros.length) {
  for (const defeito of links.erros) console.error(`DEFEITO  ${defeito}`)
  console.error(
    `\n${links.erros.length} defeito(s) de link no material — o content.json NAO foi regravado. ` +
      `O app nao monta href que nao seja rota, ancora da propria pagina ou endereco externo.`,
  )
  process.exit(1)
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(conteudo), 'utf-8')

const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(0)
console.log(
  `content.json gerado: ${conteudo.meta.totais.areas} areas, ` +
    `${conteudo.meta.totais.temas} temas, ${conteudo.meta.totais.paginas} paginas (${kb} KB)`,
)
console.log(
  `links: ${links.paraRota} viraram rota do app, ${links.comoTexto} ficaram declarados sem rota ` +
    `(so o texto), ${links.intactos} externos ou fora do material — ${links.erros.length} defeito(s)`,
)

