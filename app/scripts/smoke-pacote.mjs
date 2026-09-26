#!/usr/bin/env node
/**
 * Smoke do aplicativo EMPACOTADO.
 *
 * O smoke do desktop testa `dist-electron/`; este testa o que sai do empacotamento, que e
 * um objeto diferente: o codigo esta dentro de um `app.asar`, o binario teve os fuses
 * alterados e a arvore de arquivos nao e mais a do repositorio. Empacotar sem abrir o
 * resultado e confiar na configuracao — e a configuracao e justamente onde o caminho do
 * `index.html` deixa de ser o mesmo.
 *
 * Nao usa `_electron.launch` do Playwright de proposito: ele depende de
 * `ELECTRON_RUN_AS_NODE`, que e exatamente o fuse que desligamos. A conexao e por CDP, do
 * mesmo jeito que qualquer um abriria o aplicativo — o que torna o teste mais fiel, nao
 * menos.
 *
 * Uso: npm run distribuir && npm run smoke:pacote
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FuseState, FuseV1Options, getCurrentFuseWire } from '@electron/fuses'
import { listPackage } from '@electron/asar'
import { chromium } from 'playwright'
import { binarioEm } from './lib/binario.mjs'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const SAIDA = path.join(APP, 'instalador')

/** Pasta que o electron-builder deixa desempacotada, antes de virar instalador. */
function pastaDesempacotada() {
  const porSistema =
    process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux'
  const candidatas = fs
    .readdirSync(SAIDA, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(porSistema))
    .map((e) => path.join(SAIDA, e.name))
  if (!candidatas.length) {
    console.error(`Nada empacotado em ${SAIDA}.\nRode antes: npm run distribuir`)
    process.exit(1)
  }
  return candidatas[0]
}

async function portaDeDepuracao(pastaDados, proc) {
  const arquivo = path.join(pastaDados, 'DevToolsActivePort')
  const limite = Date.now() + 20_000
  while (Date.now() < limite) {
    if (proc.exitCode !== null) throw new Error(`o aplicativo saiu com codigo ${proc.exitCode}`)
    if (fs.existsSync(arquivo)) {
      const porta = Number(fs.readFileSync(arquivo, 'utf8').split('\n')[0])
      if (Number.isInteger(porta) && porta > 0) return porta
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error('o aplicativo nao abriu a porta de depuracao em 20 s')
}

const pasta = pastaDesempacotada()
const binario = binarioEm(pasta, process.platform)
const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-pacote-'))
const falhas = []
let proc

function conferir(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} = ${JSON.stringify(obtido)}`)
  if (!ok) falhas.push(`${nome}: esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(obtido)}`)
}

async function main() {
  console.log(`Pacote: ${path.relative(APP, binario)}\n`)

  // O asar substitui a arvore de arquivos: se o empacotamento errar o alvo, o app abre em
  // branco. Conferir existencia e tamanho e mais barato que descobrir na tela.
  const asar = path.join(pasta, 'resources', 'app.asar')
  conferir('app.asar existe', fs.existsSync(asar), true)
  if (fs.existsSync(asar)) {
    conferir('app.asar tem conteudo', fs.statSync(asar).size > 1_000_000, true)
    // O caminho textual nao serve aqui: o cabecalho do asar guarda as pastas aninhadas,
    // entao `node_modules/react/package.json` nunca aparece como string e a asserção
    // passaria com o pacote inteiro dentro. A lista vem da API do asar.
    const arquivos = listPackage(asar)
    conferir(
      'app.asar sem node_modules',
      arquivos.some((caminho) => caminho.startsWith('/node_modules')),
      false,
    )
    conferir('app.asar enxuto', arquivos.length < 100, true)
  }

  // Os fuses sao o endurecimento prometido no README. `getCurrentFuseWire` devolve o
  // estado como numero (`FuseState.ENABLE` = 49, `DISABLE` = 48).
  const fuses = await getCurrentFuseWire(binario)
  conferir('fuse RunAsNode desligado', fuses[FuseV1Options.RunAsNode], FuseState.DISABLE)
  conferir(
    'fuse NODE_OPTIONS desligado',
    fuses[FuseV1Options.EnableNodeOptionsEnvironmentVariable],
    FuseState.DISABLE,
  )
  conferir(
    'fuse --inspect desligado',
    fuses[FuseV1Options.EnableNodeCliInspectArguments],
    FuseState.DISABLE,
  )
  conferir(
    'fuse OnlyLoadAppFromAsar ligado',
    fuses[FuseV1Options.OnlyLoadAppFromAsar],
    FuseState.ENABLE,
  )
  conferir(
    'fuse file: sem privilegio extra',
    fuses[FuseV1Options.GrantFileProtocolExtraPrivileges],
    FuseState.DISABLE,
  )

  // Abre como qualquer usuario abriria, com a porta de depuracao para podermos olhar.
  proc = spawn(
    binario,
    ['--no-sandbox', `--user-data-dir=${dados}`, '--remote-debugging-port=0'],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let saida = ''
  proc.stderr.on('data', (d) => {
    saida += String(d)
  })

  const porta = await portaDeDepuracao(dados, proc)
  const navegador = await chromium.connectOverCDP(`http://127.0.0.1:${porta}`)

  const procurarPagina = async () => {
    for (let i = 0; i < 100; i++) {
      for (const contexto of navegador.contexts()) {
        for (const pagina of contexto.pages()) {
          if (pagina.url().startsWith('app://')) return pagina
        }
      }
      await new Promise((r) => setTimeout(r, 100))
    }
    throw new Error(`nenhuma pagina em app://\n${saida}`)
  }
  const janela = await procurarPagina()
  await janela.waitForSelector('.lista-areas li')

  conferir('abriu pelo esquema proprio', new URL(janela.url()).protocol, 'app:')
  conferir('areas listadas', await janela.locator('.lista-areas li').count(), 18)
  conferir(
    'sem Node no renderer',
    await janela.evaluate(() => [typeof window.require, typeof window.process]),
    ['undefined', 'undefined'],
  )
  // O `app.asar` responde pelo esquema proprio: se o caminho interno tivesse mudado, o
  // conteudo nao chegaria e a lista acima estaria vazia.
  conferir('rotulo da versao presente', await janela.locator('.acoes-progresso').count(), 1)

  // Escrever prova duas coisas de uma vez: o IPC atravessa o pacote e o arquivo vai para
  // a pasta de dados do usuario, fora da pasta de instalacao.
  await janela.evaluate(() => {
    location.hash = '#/tema/01-fundamentos/TEMA-01'
  })
  await janela.waitForSelector('.bloco-qa')
  await janela.locator('.veredito-botoes button').first().click()

  const arquivo = path.join(dados, 'progresso.json')
  const limite = Date.now() + 5000
  let gravou = false
  while (Date.now() < limite && !gravou) {
    if (fs.existsSync(arquivo)) {
      try {
        gravou =
          JSON.parse(fs.readFileSync(arquivo, 'utf8'))?.temas?.['01-fundamentos#TEMA-01']
            ?.recuperacaoOk === true
      } catch {
        gravou = false
      }
    }
    if (!gravou) await new Promise((r) => setTimeout(r, 50))
  }
  conferir('progresso gravado pelo pacote', gravou, true)
}

async function encerrar() {
  try {
    proc?.kill('SIGTERM')
  } catch {
    // Ja morreu.
  }
  fs.rmSync(dados, { recursive: true, force: true })
}

try {
  await main()
} catch (erro) {
  falhas.push(String(erro).split('\n')[0])
} finally {
  await encerrar()
}

if (falhas.length) {
  console.error(`\n${falhas.length} falha(s):`)
  for (const f of falhas) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('\n0 falhas')
