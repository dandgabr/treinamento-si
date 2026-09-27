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
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { FuseState, FuseV1Options, getCurrentFuseWire } from '@electron/fuses'
import { listPackage } from '@electron/asar'
import { binarioEm } from './lib/binario.mjs'
import { abrirApp } from './lib/app-empacotado.mjs'
import { fontesMaisNovas } from './lib/frescor.mjs'

const execFileAsync = promisify(execFile)

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const SAIDA = path.join(APP, 'instalador')

/** Pasta que o electron-builder deixa desempacotada, antes de virar instalador. */
function pastaDesempacotada() {
  const porSistema =
    process.platform === 'darwin' ? 'mac' : process.platform === 'win32' ? 'win' : 'linux'
  // Conferido antes de listar: `readdirSync` numa pasta que nao existe sai com ENOENT e
  // stack trace, engolindo a mensagem que explica o que rodar.
  if (!fs.existsSync(SAIDA)) {
    console.error(`Nada empacotado em ${SAIDA}.\nRode antes: npm run distribuir`)
    process.exit(1)
  }
  const candidatas = fs
    .readdirSync(SAIDA, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(porSistema))
    .map((e) => ({ caminho: path.join(SAIDA, e.name), quando: fs.statSync(path.join(SAIDA, e.name)).mtimeMs }))
    // `instalador/` acumula builds: pegar a primeira entrada da listagem podia medir uma
    // pasta antiga so porque o nome vem antes no alfabeto.
    .sort((a, b) => b.quando - a.quando)
  if (!candidatas.length) {
    console.error(`Nada empacotado para ${porSistema} em ${SAIDA}.\nRode antes: npm run distribuir`)
    process.exit(1)
  }
  return candidatas[0].caminho
}

/**
 * As fontes que o pacote carrega de verdade: as entradas de primeiro nivel da listagem do
 * proprio `app.asar` (`/dist-desktop/...`, `/dist-electron/...`, `/package.json`).
 *
 * `dist/` (a build do navegador, que se abre por `file://`) e `build/` (icones, lidos na
 * hora de empacotar) ficam FORA do asar: compara-los acusava de velho um pacote que nao
 * deveria nada a eles. E o pior era a omissao — sem `dist-desktop/`, que entra e leva o
 * `index.html` que o app abre, um asar mais velho que o build que ele contem passava. A
 * lista sai da propria listagem para nao envelhecer junto com o `electron-builder.yml`.
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

/**
 * O AppImage mais novo de `instalador/`, ou null.
 *
 * Antes era `readdirSync(SAIDA).find(nome => nome.endsWith('.AppImage'))`: a PRIMEIRA entrada
 * na ordem do sistema de arquivos, que nao e a mais nova — com dois AppImages na pasta, as
 * conferencias do `.desktop` podiam sair de um pacote de teste, ou de um release antigo. A
 * escolha e pela data, como a `pastaDesempacotada()` faz logo acima.
 */
function appImageMaisNovo(saida) {
  if (!fs.existsSync(saida)) return null
  const candidatos = fs
    .readdirSync(saida, { withFileTypes: true })
    .filter((entrada) => entrada.isFile() && entrada.name.endsWith('.AppImage'))
    .map((entrada) => {
      const caminho = path.join(saida, entrada.name)
      return { caminho, quando: fs.statSync(caminho).mtimeMs }
    })
    .sort((a, b) => b.quando - a.quando)
  return candidatos.length ? candidatos[0].caminho : null
}

const falhas = []

function conferir(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} = ${JSON.stringify(obtido)}`)
  if (!ok) falhas.push(`${nome}: esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(obtido)}`)
}

async function main() {
  const pasta = pastaDesempacotada()
  const binario = binarioEm(pasta, process.platform)
  console.log(`Pacote: ${path.relative(APP, binario)}\n`)

  // Os outros dois smokes conferem frescor e este nao conferia: o asar ficou tres horas
  // mais velho que o `dist/index.html` e o teste abriria, feliz, um build antigo. O
  // `app.asar` tem data de empacotamento, entao a comparacao de data funciona.
  //
  // A lista de fontes sai do proprio asar (veja `fontesAtrasadas`): comparar contra `dist/`
  // e `build/` — que nao entram no arquivo — acusava um pacote atual, e nao olhar
  // `dist-desktop/`, que entra, deixava passar um pacote mais velho que o build que ele
  // carrega.
  const asar = path.join(pasta, 'resources', 'app.asar')
  const atrasados = fontesAtrasadas(asar, APP)
  if (atrasados.length) {
    console.error(
      `Artefato desatualizado.\n` +
        `Mais novo que ele, ou faltando na arvore: ${atrasados.join(', ')}\n` +
        'Rode antes: npm run distribuir',
    )
    process.exit(1)
  }


  // O asar substitui a arvore de arquivos: se o empacotamento errar o alvo, o app abre em
  // branco. Conferir existencia e tamanho e mais barato que descobrir na tela.
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
    // A lista exata quebraria a cada atualizacao do mermaid (os hashes mudam). O que
    // interessa e a forma: o chunk do flowchart presente, os de outros diagramas fora, e
    // o conteudo como arquivo ao lado do HTML.
    conferir(
      'app.asar traz o chunk do flowchart',
      arquivos.some((caminho) => /\/flowDiagram-/.test(caminho)),
      true,
    )
    conferir(
      'app.asar sem chunks de outros diagramas',
      arquivos.filter((caminho) => /Diagram-|-definition-/.test(caminho) && !/flowDiagram-/.test(caminho))
        .length,
      0,
    )
    conferir(
      'app.asar com o conteudo como arquivo',
      arquivos.includes('/dist-desktop/conteudo.json'),
      true,
    )
  }

  // O `.desktop` que o AppImage distribui é o que o menu de aplicativos usa depois de
  // integrar. Ele não pode pedir depurador: o fuse bloqueia `--inspect`, mas
  // `--remote-debugging-port` não tem fuse nenhum e passaria. (Sobre o `--no-sandbox` que
  // o electron-builder põe por padrão e que o menu herda, veja o README.)
  //
  // Esta conferencia vem ANTES da dos fuses de proposito: `getCurrentFuseWire` lança quando o
  // binario nao e um Electron de verdade, e um throw no meio do `main` aborta tudo o que vem
  // depois. O que le o pacote fica antes do passo que pode estourar, para uma falha de leitura
  // de fuses nao esconder o resto do relatorio.
  const appImage = appImageMaisNovo(SAIDA)
  if (!appImage) {
    // Sem AppImage nao ha `.desktop` para ler, e sem esta linha as conferencias de baixo
    // simplesmente nao rodavam: bastava renomear o AppImage para o smoke sair com 0 falhas.
    // No Linux o alvo do electron-builder e so o AppImage, entao a ausencia reprova. Nas
    // outras plataformas o `.desktop` nao existe por natureza: o relatorio diz o que NAO foi
    // conferido, em vez de deixar a ausencia ambigua.
    if (process.platform === 'linux') {
      conferir('ha AppImage para ler o .desktop', appImage !== null, true)
    } else {
      console.log('----  .desktop do AppImage: nao se aplica fora do Linux, nao conferido')
    }
  } else {
    const extraido = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-appimage-'))
    try {
      await execFileAsync(appImage, ['--appimage-extract', '*.desktop'], {
        cwd: extraido,
      })
      const raiz = path.join(extraido, 'squashfs-root')
      const nome = fs.existsSync(raiz) ? fs.readdirSync(raiz).find((n) => n.endsWith('.desktop')) : null
      // Explicito, e nao implicito no resultado: sem esta linha, `linha` vazia passaria nas
      // duas conferencias de baixo (nao tem `Exec=AppRun` nem flag de depurador) e o teste
      // diria OK para um `.desktop` que nem foi extraido.
      conferir('o AppImage traz um .desktop', Boolean(nome), true)
      const linha = nome
        ? (fs.readFileSync(path.join(raiz, nome), 'utf8').split('\n').find((l) => l.startsWith('Exec=')) ?? '')
        : ''
      conferir('.desktop traz Exec=AppRun', linha.startsWith('Exec=AppRun'), true)
      conferir('.desktop sem flag de depurador', /--inspect|--remote-debugging-port/.test(linha), false)
    } finally {
      fs.rmSync(extraido, { recursive: true, force: true })
    }
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
  // Os dois que faltavam: a integridade do asar e o unico no-op no Linux (e o mais util de
  // ver registrado) e o cofre do Chromium vem desligado de fabrica.
  conferir(
    'fuse integridade do asar ligado',
    fuses[FuseV1Options.EnableEmbeddedAsarIntegrityValidation],
    FuseState.ENABLE,
  )
  conferir(
    'fuse cofre do Chromium ligado',
    fuses[FuseV1Options.EnableCookieEncryption],
    FuseState.ENABLE,
  )

  // Abre como qualquer usuario abriria, com a porta de depuracao para podermos olhar.
  const { janela, encerrar, dados } = await abrirApp(binario)
  encerrarApp = encerrar
  await janela.waitForSelector('.lista-areas li')

  conferir('abriu pelo esquema proprio', new URL(janela.url()).protocol, 'app:')
  conferir('areas listadas', await janela.locator('.lista-areas li').count(), 18)
  conferir(
    'sem Node no renderer',
    await janela.evaluate(() => [typeof window.require, typeof window.process]),
    ['undefined', 'undefined'],
  )
  // O nome prometia conferir o rotulo da versao, e a asserção olhava so a existencia do
  // container — que o `ResumoProgresso` renderiza sempre, com ou sem a ponte. Agora olha o
  // texto, o que exercita o canal `app:versao` depois do empacotamento.
  conferir(
    'versao lida pela ponte',
    /versão \d+\.\d+\.\d+/.test((await janela.locator('.acoes-progresso').textContent()) ?? ''),
    true,
  )

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

/** Fechado pelo `abrirApp`; guardado aqui para o `finally` la de baixo alcancar. */
let encerrarApp = () => Promise.resolve()

/**
 * So roda quando este arquivo e o processo. Importar o modulo (um teste, por exemplo) nao
 * pode listar o `instalador/`, sair com 1 nem abrir o aplicativo: o smoke inteiro e efeito
 * colateral, e ele so vale quando alguem pediu para rodar.
 */
const ehPontoDeEntrada =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href

if (ehPontoDeEntrada) {
  try {
    await main()
  } catch (erro) {
    falhas.push(String(erro).split('\n')[0])
  } finally {
    await encerrarApp()
  }

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const f of falhas) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log('\n0 falhas')
}
