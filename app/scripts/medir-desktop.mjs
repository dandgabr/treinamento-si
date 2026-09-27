#!/usr/bin/env node
/**
 * Mede o que a fase 4.4 promete: arranque, peso carregado, memoria e diagramas por tela.
 *
 * Os numeros saem do aplicativo EMPACOTADO, e nao de um build de desenvolvimento, porque e
 * ele que a pessoa recebe. As checagens O1, O2, O4, O5 e O6 do plano saem daqui — e sem
 * numero medido o plano manda nao contar o item como feito.
 *
 * Uso: npm run distribuir && npm run medir   (o `medir` exige o pacote em `instalador/` e
 * recusa medir quando as fontes da arvore sao mais novas que ele)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { listPackage } from '@electron/asar'
import { abrirApp } from './lib/app-empacotado.mjs'
import { binarioEm } from './lib/binario.mjs'
import { fontesMaisNovas } from './lib/frescor.mjs'

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

/**
 * As fontes que o pacote carrega de verdade: as entradas de primeiro nivel da listagem do
 * proprio `app.asar` (`/dist-desktop/...`, `/dist-electron/...`, `/package.json`).
 *
 * `dist/` e `build/` NAO entram no asar — compara-los recusava um pacote atual — e
 * `dist-desktop/`, que entra, tem de entrar na comparacao: e dele que saem o `index.html`,
 * o `conteudo.json` e os chunks que o O4 anuncia. A lista sai do proprio asar para nao
 * envelhecer junto com o `electron-builder.yml`.
 */
function fontesDoPacote(entradas, app) {
  const nomes = new Set()
  for (const caminho of entradas) {
    const primeiro = caminho.split('/')[1]
    if (primeiro) nomes.add(primeiro)
  }
  return [...nomes].map((nome) => ({ nome, caminho: path.join(app, nome) }))
}

/**
 * O que esta errado no pacote, em uma lista — vazia com ele em dia:
 *
 * - fonte que entra no asar e nao esta nesta arvore (o pacote saiu de um checkout que nao e
 *   este, e nao ha o que comparar);
 * - fonte do asar mais nova que o proprio asar (o pacote medido nao e o build daqui).
 */
function fontesAtrasadas(asar, app) {
  let entradas
  try {
    entradas = listPackage(asar)
  } catch (erro) {
    return [`nao consegui ler o asar: ${String(erro.message ?? erro).split('\n')[0]}`]
  }
  const fontes = fontesDoPacote(entradas, app)
  const ausentes = fontes
    .filter((fonte) => !fs.existsSync(fonte.caminho))
    .map((fonte) => `${fonte.nome} (esta no asar e nao esta na arvore)`)
  const presentes = fontes.filter((fonte) => fs.existsSync(fonte.caminho)).map((f) => f.caminho)
  return [...ausentes, ...fontesMaisNovas(asar, presentes)]
}

const TEMA_COM_DIAGRAMA = '#/tema/01-fundamentos/TEMA-01'

async function main() {
  const pasta = pastaDesempacotada()
  const binario = binarioEm(pasta, process.platform)

  // Esta medicao tem DUAS origens, e e isso que o portao protege: o O1/O5/O6 saem do binario
  // empacotado que acabou de abrir, e o O4 sai do `dist-desktop/` da ARVORE (o HTML que ele
  // declara carregar, o `conteudo.json`). Com as fontes mais novas que o asar, o relatorio
  // mede dois builds ao mesmo tempo e anuncia o numero de um pacote que ninguem recebeu —
  // exatamente o que aconteceu com um `dist-desktop` mais novo que o asar ai dentro. Recusa,
  // como os outros scripts de artefato fazem.
  const asar = path.join(pasta, 'resources', 'app.asar')
  const atrasadas = fontesAtrasadas(asar, APP)
  if (atrasadas.length) {
    console.error(
      `Artefato desatualizado.\n` +
        `O pacote em ${path.relative(APP, pasta)} e mais velho que, ou a arvore nao tem:\n` +
        atrasadas.map((fonte) => `  - ${fonte}`).join('\n') +
        '\n\nO O4 sai do dist-desktop/ da arvore e o O1/O5/O6 do binario: medir agora misturaria\n' +
        'dois builds. Rode antes: npm run distribuir',
    )
    process.exit(1)
  }

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

/**
 * So roda quando este arquivo e o processo. Importar o modulo (um teste, por exemplo) nao
 * pode listar o `instalador/`, sair com 1 nem abrir o aplicativo.
 */
const ehPontoDeEntrada =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href

if (ehPontoDeEntrada) await main()
