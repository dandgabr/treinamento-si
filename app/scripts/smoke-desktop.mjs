#!/usr/bin/env node
/**
 * Smoke do aplicativo desktop. Abre a janela de verdade e confere o que so a casca pode
 * provar: carregamento pelo esquema proprio, preferencias endurecidas, ausencia de Node
 * no renderer, progresso em arquivo e bloqueio de navegacao.
 *
 * Uso: npm run smoke:desktop   (rode `npm run desktop` uma vez, ou `npm run build` e
 * `npm run build:electron` antes)
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')

const faltando = ['dist/index.html', 'dist-electron/main.cjs', 'dist-electron/preload.cjs'].filter(
  (relativo) => !fs.existsSync(path.join(APP, relativo)),
)
if (faltando.length) {
  console.error(`Falta: ${faltando.join(', ')}\nRode antes: npm run build && npm run build:electron`)
  process.exit(1)
}

// Diretorio de dados proprio: o teste nao encosta no progresso de quem usa o app.
const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-desktop-'))
const falhas = []

function conferir(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} = ${JSON.stringify(obtido)}`)
  if (!ok) falhas.push(`${nome}: esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(obtido)}`)
}

async function abrir() {
  return electron.launch({
    args: [APP, `--user-data-dir=${dados}`, '--no-sandbox'],
    cwd: APP,
  })
}

/** Espera uma condicao virar verdadeira, em vez de dormir um tempo fixo. */
async function ate(condicao, timeoutMs = 5000) {
  const limite = Date.now() + timeoutMs
  while (Date.now() < limite) {
    if (await condicao()) return true
    await new Promise((resolver) => setTimeout(resolver, 50))
  }
  return false
}

async function primeiraSessao() {
  const app = await abrir()
  const janela = await app.firstWindow()
  janela.on('console', (mensagem) => {
    if (mensagem.type() === 'error') console.log('[renderer]', mensagem.text())
  })
  janela.on('pageerror', (erro) => console.log('[renderer:erro]', erro.message))
  await janela.waitForSelector('.lista-areas li')

  conferir('janela unica', app.windows().length, 1)
  conferir('origem servida pelo esquema proprio', new URL(janela.url()).protocol, 'app:')

  const preferencias = await app.evaluate(({ BrowserWindow }) =>
    BrowserWindow.getAllWindows()[0]?.webContents.getLastWebPreferences(),
  )
  conferir('contextIsolation', preferencias?.contextIsolation, true)
  conferir('sandbox', preferencias?.sandbox, true)
  conferir('nodeIntegration', preferencias?.nodeIntegration, false)
  conferir('webSecurity', preferencias?.webSecurity, true)

  conferir(
    'sem Node no renderer',
    await janela.evaluate(() => [typeof window.require, typeof window.process]),
    ['undefined', 'undefined'],
  )
  conferir(
    'ponte exposta',
    await janela.evaluate(async () => typeof (await window.roadmap?.versao())),
    'string',
  )

  conferir('areas listadas', await janela.locator('.lista-areas li').count(), 18)

  await janela.evaluate(() => {
    location.hash = '#/tema/01-fundamentos/TEMA-01'
  })
  await janela.waitForSelector('.bloco-qa')
  conferir('diagrama renderizado', (await janela.locator('.mermaid svg').count()) >= 1, true)

  await janela.locator('.bloco-pre-teste .nivel').first().click()
  await janela.locator('.veredito-botoes button').first().click()

  const pasta = await app.evaluate(({ app: aplicacao }) => aplicacao.getPath('userData'))
  const arquivo = path.join(pasta, 'progresso.json')

  // Espera a condicao, nao um tempo fixo: com o disco lento, 300 ms davam falso vermelho.
  const gravou = await ate(() => {
    if (!fs.existsSync(arquivo)) return false
    try {
      return JSON.parse(fs.readFileSync(arquivo, 'utf8'))?.temas?.['01-fundamentos#TEMA-01']
        ?.recuperacaoOk === true
    } catch {
      return false
    }
  })
  conferir('arquivo de progresso criado', gravou, true)

  // Se o estado mudou, os botoes do veredito dao lugar a "Registrar nova passagem".
  conferir(
    'veredito registrado na tela',
    (await janela.locator('.veredito button').first().textContent())?.trim(),
    'Registrar nova passagem',
  )
  conferir(
    'confianca marcada',
    await janela.locator('.bloco-pre-teste .nivel[aria-pressed="true"]').count(),
    1,
  )
  conferir(
    'nao usou o armazenamento do navegador',
    await janela.evaluate(() => window.localStorage.getItem('roadmap:progresso')),
    null,
  )

  // A conferencia do arquivo vem antes da tentativa de navegacao, para isolar as duas
  // coisas: a navegacao bloqueada nao pode contaminar a leitura do progresso.
  const guardado = fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : null
  conferir('tema com veredito no arquivo', guardado?.temas?.['01-fundamentos#TEMA-01']?.recuperacaoOk, true)

  // Navegacao para fora tem de ser bloqueada; file: nao abre nada no sistema.
  await janela.evaluate(() => {
    location.href = 'file:///etc/passwd'
  })
  conferir('navegacao para file: bloqueada', new URL(janela.url()).protocol, 'app:')
  // Prova viva de que o documento nao foi substituido: se a navegacao tivesse passado, a
  // pagina teria saido e este seletor nao responderia. `.bloco-qa` e da rota do tema, que
  // e onde o teste esta.
  conferir('o documento continua o nosso', await janela.locator('.bloco-qa').count(), 1)

  await app.close()
  return { pasta }
}

async function segundaSessao() {
  // Fecha e reabre com o mesmo diretorio de dados: e o que prova a persistencia.
  const app = await abrir()
  const janela = await app.firstWindow()
  await janela.waitForSelector('.lista-areas li')
  // A leitura do arquivo e assincrona: ler o painel antes dela daria "0 de 109".
  await janela.waitForFunction(() => {
    const painel = document.querySelector('.acoes-progresso')
    return !!painel && !painel.textContent.includes('carregando')
  })
  const painel = ((await janela.locator('.resumo').textContent()) ?? '').replace(/\s+/g, ' ')
  conferir('estado sobreviveu ao fechar e reabrir', /Temas firmes ?1 de 109/.test(painel), true)
  conferir('progresso lido do arquivo', /pasta de dados do aplicativo/.test(painel), true)
  await app.close()
}

async function main() {
  await primeiraSessao()
  await segundaSessao()

  fs.rmSync(dados, { recursive: true, force: true })

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const falha of falhas) console.error(`  - ${falha}`)
    process.exit(1)
  }
  console.log('\n0 falhas')
}

main().catch((erro) => {
  console.error('smoke do desktop falhou ao executar:', erro)
  process.exit(1)
})
