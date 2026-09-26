#!/usr/bin/env node
/**
 * Monta a pasta que vai para as maos de quem estuda: o app num arquivo, os tres
 * atalhos de abertura e as instrucoes. Rode `npm run build` antes.
 *
 * Uso: npm run empacotar
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const DIST = path.join(APP, 'dist')
const ORIGEM_HTML = path.join(DIST, 'index.html')
const LAUNCHER = path.join(APP, 'launcher')
const PACOTE = path.join(DIST, 'Roadmap-CISO-Interativo')
const EXECUTAVEIS = new Set(['Iniciar-Linux.sh', 'Iniciar-macOS.command', 'servidor.py'])

if (!fs.existsSync(ORIGEM_HTML)) {
  console.error('Falta dist/index.html. Rode antes: npm run build')
  process.exit(1)
}

fs.rmSync(PACOTE, { recursive: true, force: true })
fs.mkdirSync(PACOTE, { recursive: true })
fs.copyFileSync(ORIGEM_HTML, path.join(PACOTE, 'index.html'))

const arquivos = fs.readdirSync(LAUNCHER).sort()
for (const nome of arquivos) {
  const destino = path.join(PACOTE, nome)
  if (nome.endsWith('.bat')) {
    // O cmd.exe espera CRLF. O repositorio guarda LF e o .gitattributes converte no
    // checkout, mas este pacote e montado aqui e nao passa pelo git.
    const texto = fs.readFileSync(path.join(LAUNCHER, nome), 'utf8').replace(/\r?\n/g, '\r\n')
    fs.writeFileSync(destino, texto, 'utf8')
  } else {
    fs.copyFileSync(path.join(LAUNCHER, nome), destino)
  }
  if (EXECUTAVEIS.has(nome)) fs.chmodSync(destino, 0o755)
}

const mb = (fs.statSync(ORIGEM_HTML).size / 1024 / 1024).toFixed(1)
console.log(`pacote montado: ${path.relative(APP, PACOTE)}`)
console.log(`  index.html (${mb} MB), ${arquivos.length} arquivos de abertura`)
console.log('  entrega assim: a pasta inteira, e a pessoa clica em Iniciar')
