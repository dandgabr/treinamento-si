#!/usr/bin/env node
/**
 * Mede o que a fase 4.4 promete: arranque, peso carregado, memoria e diagramas por tela.
 *
 * Os numeros saem do aplicativo EMPACOTADO, e nao de um build de desenvolvimento, porque e
 * ele que a pessoa recebe. As checagens O1, O2, O4, O5 e O6 do plano saem daqui — e sem
 * numero medido o plano manda nao contar o item como feito.
 *
 * Uso: npm run build:desktop && npm run smoke:desktop && npm run medir
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { abrirApp } from './lib/app-empacotado.mjs'
import { binarioEm } from './lib/binario.mjs'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const SAIDA = path.join(APP, 'instalador')

function pastaDesempacotada() {
  const porSistema =
    process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux'
  if (!fs.existsSync(SAIDA)) {
    console.error(`Nada empacotado em ${SAIDA}.\nRode antes: npm run distribuir`)
    process.exit(1)
  }
  const candidatas = fs
    .readdirSync(SAIDA, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(porSistema))
    .map((e) => ({
      caminho: path.join(SAIDA, e.name),
      quando: fs.statSync(path.join(SAIDA, e.name)).mtimeMs,
    }))
    .sort((a, b) => b.quando - a.quando)
  if (!candidatas.length) {
    console.error(`Nada empacotado para ${porSistema}.\nRode antes: npm run distribuir`)
    process.exit(1)
  }
  return candidatas[0].caminho
}

/** O que o HTML declara carregar, com o tamanho em disco. */
function declaradoNoHtml() {
  const html = fs.readFileSync(path.join(APP, 'dist-desktop/index.html'), 'utf8')
  return [...html.matchAll(/(?:src|href)="\/?(assets\/[^"]+)"/g)].map((m) => {
    const relativo = m[1]
    const caminho = path.join(APP, 'dist-desktop', relativo)
    return {
      arquivo: relativo.replace('assets/', ''),
      bytes: fs.existsSync(caminho) ? fs.statSync(caminho).size : 0,
    }
  })
}

const TEMA_COM_DIAGRAMA = '#/tema/01-fundamentos/TEMA-01'

async function main() {
  const pasta = pastaDesempacotada()
  const binario = binarioEm(pasta, process.platform)
  const { janela, encerrar } = await abrirApp(binario)

  // O `performance` nao registra recurso de esquema proprio (`app://`), entao a lista de
  // scripts vem dos proprios pedidos do renderer.
  const pedidos = []
  janela.on('request', (requisicao) => {
    const url = requisicao.url()
    if (url.includes('/assets/') && url.endsWith('.js')) pedidos.push(url.split('/assets/')[1])
  })

  try {
    await janela.waitForSelector('.lista-areas li')
    await janela.waitForFunction(() => !document.body.textContent.includes('Carregando o roadmap'))

    const primeiro = await janela.evaluate(() => {
      const navegacao = performance.getEntriesByType('navigation')[0]
      const pintura = performance.getEntriesByType('paint')
      return {
        domContentLoaded: navegacao?.domContentLoadedEventEnd ?? 0,
        load: navegacao?.loadEventEnd ?? 0,
        primeiraPintura: pintura.find((p) => p.name === 'first-contentful-paint')?.startTime ?? 0,
        memoriaMB: (performance.memory?.usedJSHeapSize ?? 0) / 1024 / 1024,
      }
    })
    const declarados = declaradoNoHtml()
    const pedidosAntes = [...new Set(pedidos)]

    await janela.evaluate((rota) => {
      location.hash = rota
    }, TEMA_COM_DIAGRAMA)
    await janela.waitForSelector('.mermaid svg')

    const diagramas = await janela.locator('.mermaid svg').count()
    const novos = [...new Set(pedidos)].filter((p) => !pedidosAntes.includes(p))
    const memoriaDepois = await janela.evaluate(
      () => (performance.memory?.usedJSHeapSize ?? 0) / 1024 / 1024,
    )
    const conteudo = fs.statSync(path.join(APP, 'dist-desktop/conteudo.json')).size

    const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`
    console.log('Medido no aplicativo empacotado\n')
    console.log(
      `O1  arranque: 1ª pintura ${primeiro.primeiraPintura.toFixed(0)} ms, ` +
        `DOMContentLoaded ${primeiro.domContentLoaded.toFixed(0)} ms, load ${primeiro.load.toFixed(0)} ms`,
    )
    console.log(`O2  sem tela branca: o aviso "Carregando o roadmap…" sai quando a carga termina`)
    console.log(
      `O4  o HTML declara: ${declarados.map((d) => `${d.arquivo} (${kb(d.bytes)})`).join(', ')}`,
    )
    console.log(
      `O4  conteudo como arquivo, nao como script: conteudo.json (${kb(conteudo)})`,
    )
    console.log(
      `O4  chunks para desenhar um diagrama: ${novos.length}` +
        (novos.length ? ` — ${novos.join(', ')}` : ' (nenhum alem do ja carregado)'),
    )
    console.log(
      `O5  heap JS: ${primeiro.memoriaMB.toFixed(0)} MB depois da 1ª tela, ` +
        `${memoriaDepois.toFixed(0)} MB depois do diagrama`,
    )
    console.log(`O6  diagramas na tela: ${diagramas}`)
  } finally {
    await encerrar()
  }
}

await main()
