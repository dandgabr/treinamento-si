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
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { _electron as electron } from 'playwright'
import { fontesMaisNovas } from './lib/frescor.mjs'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')

const faltando = [
  'dist-desktop/index.html',
  'dist-desktop/conteudo.json',
  'dist-electron/main.cjs',
  'dist-electron/preload.cjs',
].filter((relativo) => !fs.existsSync(path.join(APP, relativo)))
if (faltando.length) {
  console.error(
    `Falta: ${faltando.join(', ')}\nRode antes: npm run build:desktop && npm run build:electron`,
  )
  process.exit(1)
}

// Existir nao basta, e isto ja aconteceu: o smoke do desktop deu verde contra um
// `main.cjs` compilado antes das correcoes de seguranca da casca. Ele testava um codigo
// que nao estava no binario.
// O que entra no `main.cjs`: a casca e o contrato da ponte (import de tipo). `src/` inteiro
// nao serve como raiz aqui — o `conteudo.json` gerado mora la e nao tem nada a ver com o
// processo principal, o que fazia o teste recusar um binario perfeitamente atual.
const fontes = [
  path.join(APP, 'electron'),
  path.join(APP, 'src/infrastructure/storage/ponte.ts'),
  path.join(APP, 'vite.electron.config.ts'),
]
const atrasados = [
  ...fontesMaisNovas(path.join(APP, 'dist-electron', 'main.cjs'), fontes),
  ...fontesMaisNovas(path.join(APP, 'dist-desktop/index.html'), [
    path.join(APP, 'src'),
    path.join(APP, 'index.html'),
    path.join(APP, 'vite.desktop.config.ts'),
  ]),
]
if (atrasados.length) {
  console.error(
    `Artefato desatualizado.\nMais novo que ele: ${[...new Set(atrasados)].join(', ')}\n` +
      'Rode antes: npm run build:desktop && npm run build:electron',
  )
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

/** Espera o painel sair de "carregando o progresso…": ler antes disso daria "0 de 109". */
async function esperarPainel(janela) {
  await janela.waitForFunction(() => {
    const painel = document.querySelector('.acoes-progresso')
    return !!painel && !painel.textContent.includes('carregando')
  })
}

/** O `<strong>` de um item do resumo, pelo rotulo — o numero medido, sem regex sobre o blob. */
function valorDoResumo(janela, rotulo) {
  return janela.evaluate((procurado) => {
    const item = Array.from(document.querySelectorAll('.resumo-item')).find(
      (i) => i.querySelector('.resumo-rotulo')?.textContent === procurado,
    )
    return item?.querySelector('strong')?.textContent ?? null
  }, rotulo)
}

/** O aviso que a tela mostra quando a leitura do arquivo de progresso falha. */
function avisoDeCarga(janela) {
  return janela.evaluate(
    () => document.querySelector('.acoes-progresso .aviso-erro')?.textContent?.trim() ?? null,
  )
}

/**
 * Abre um tema e faz o clique que gravaria, numa sessao que NAO conseguiu ler o arquivo.
 *
 * Devolve o que se pode medir desse clique: se o arquivo guardado mudou, se o clique chegou ao
 * store (a confianca marcada) e se sobrou temporario. A marcacao importa: sem ela, "o arquivo
 * nao mudou" tambem seria verdade se o clique nao tivesse acontecido.
 */
async function cliqueQueNaoPodeGravar(janela, arquivo) {
  const antes = fs.readFileSync(arquivo, 'utf8')
  await janela.evaluate(() => {
    location.hash = '#/tema/01-fundamentos/TEMA-01'
  })
  await janela.waitForSelector('.bloco-pre-teste .nivel')
  await janela.locator('.bloco-pre-teste .nivel').first().click()
  await janela.waitForTimeout(300)
  const medido = {
    arquivoMudou: fs.readFileSync(arquivo, 'utf8') !== antes,
    marcados: await janela.locator('.bloco-pre-teste .nivel[aria-pressed="true"]').count(),
    temporarios: fs.readdirSync(path.dirname(arquivo)).filter((nome) => nome.endsWith('.tmp')),
  }
  // Volta ao painel: o `reload` seguinte carrega a rota do `hash`, e o resto do smoke mede o
  // resumo da tela inicial.
  await janela.evaluate(() => {
    location.hash = '#/'
  })
  await janela.waitForSelector('.acoes-progresso')
  return medido
}

/**
 * Um servidor HTTP local que so conta o que chega — o interceptor de S9.
 *
 * Ele responde com CORS liberado: sem a CSP, um `fetch` do renderer a este endereco
 * completaria. E o `smoke` o alcanca do proprio Node antes, como controle positivo: se o
 * contador nao subisse nem com o controle, a asserção estaria passando por ausencia.
 */
async function subirServidorDeRede() {
  const pedidos = []
  const servidor = http.createServer((_requisicao, resposta) => {
    pedidos.push(1)
    resposta.writeHead(200, {
      'content-type': 'text/plain',
      'access-control-allow-origin': '*',
    })
    resposta.end('ok')
  })
  await new Promise((ok, erro) => servidor.once('error', erro).listen(0, '127.0.0.1', ok))
  const { port } = servidor.address()
  return {
    url: `http://127.0.0.1:${port}/`,
    pedidos,
    fechar: () => new Promise((ok) => servidor.close(ok)),
  }
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

  // S2 — a ponte é uma lista fechada de canais. A superfície exposta tem de ser exatamente a
  // que o preload declara: um canal a mais é superfície a mais no renderer, e um
  // `ipcRenderer` cru daria ao renderer todos os canais do Electron, não só estes.
  conferir(
    'S2 a ponte expõe só a lista de canais',
    await janela.evaluate(() => Object.keys(window.roadmap ?? {}).sort()),
    ['aoEscolherNoMenu', 'progresso', 'versao'],
  )
  conferir(
    'S2 a ponte de progresso expõe só a lista de canais',
    await janela.evaluate(() => Object.keys(window.roadmap?.progresso ?? {}).sort()),
    ['apagar', 'exportar', 'gravar', 'importar', 'ler'],
  )
  conferir(
    'S2 nenhum ipcRenderer/electron cru no renderer',
    await janela.evaluate(() => [
      typeof window.ipcRenderer,
      typeof window.electron,
      typeof window.require,
    ]),
    ['undefined', 'undefined', 'undefined'],
  )

  // S10 — o app não usa câmera, microfone, localização nem notificação. O `main.ts` nega pelas
  // duas checagens: a assíncrona (o pedido) e a síncrona (a consulta). Sem uma delas, a outra
  // responderia sozinha e a permissão poderia vazar.
  conferir(
    'S10 o pedido de notificação é negado',
    await janela.evaluate(() => Notification.requestPermission()),
    'denied',
  )
  conferir(
    'S10 a consulta de permissão responde negada',
    await janela.evaluate(
      async () => (await navigator.permissions.query({ name: 'geolocation' })).state,
    ),
    'denied',
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

  // S6 e S7, no lado da ESCRITA da ponte. O processo principal só recusa o que nem objeto é
  // (a forma é do normalizador do renderer), e corta pelo tamanho ANTES de gravar. O arquivo
  // é restaurado no fim do bloco: a segunda sessão depende dele.
  const arquivoIntacto = fs.readFileSync(arquivo, 'utf8')
  conferir(
    'S6 a ponte recusa valor que não é objeto',
    await janela.evaluate(() =>
      window.roadmap.progresso.gravar('texto').then(() => 'aceitou', () => 'recusou'),
    ),
    'recusou',
  )
  conferir(
    'S6 a ponte deixa passar objeto (a forma é do renderer)',
    await janela.evaluate(() =>
      window.roadmap.progresso.gravar({ versao: 1, temas: {} }).then(() => 'aceitou', () => 'recusou'),
    ),
    'aceitou',
  )
  conferir(
    'S7 a ponte recusa gravar acima do teto',
    await janela.evaluate(() =>
      window.roadmap.progresso
        .gravar({ versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [], x: 'a'.repeat(1_100_000) })
        .then(() => 'gravou', () => 'recusou'),
    ),
    'recusou',
  )

  // S8 — o mesmo teto, medido do outro lado. O `length` conta unidades de codigo e o arquivo
  // ocupa bytes: 600 mil caracteres acentuados passam no `length` e sao 1,2 MB no disco. Era
  // assim que um progresso importado de 600 kB era gravado com 1,8 MB, nao voltava a ser lido no
  // relancamento (o app abria zerado) e o primeiro clique apagava o que a pessoa importou. O
  // payload e conferido aqui nas duas medidas: sem isso, a asserção poderia passar por outro
  // motivo.
  const arquivoAntesDoTeto = fs.readFileSync(arquivo, 'utf8')
  const tetoEmBytes = await janela.evaluate(() =>
    (async () => {
      const valor = {
        versao: 1,
        temas: {},
        checkpoints: {},
        questoes: {},
        diasAtivos: [],
        enchimento: 'á'.repeat(600_000),
      }
      const texto = JSON.stringify(valor)
      return {
        caracteres: texto.length,
        bytes: new TextEncoder().encode(texto).length,
        resultado: await window.roadmap.progresso
          .gravar(valor)
          .then(() => 'gravou', () => 'recusou'),
      }
    })(),
  )
  conferir(
    'S8 a ponte mede o teto em bytes: recusa o acentuado que passa em caracteres',
    [tetoEmBytes.caracteres < 1_048_576, tetoEmBytes.bytes > 1_048_576, tetoEmBytes.resultado],
    [true, true, 'recusou'],
  )
  conferir(
    'S8 a gravação recusada não toca no arquivo nem deixa .tmp para trás',
    [
      fs.readFileSync(arquivo, 'utf8') === arquivoAntesDoTeto,
      fs.readdirSync(pasta).filter((nome) => nome.endsWith('.tmp')),
    ],
    [true, []],
  )

  // Navegacao para fora tem de ser bloqueada; file: nao abre nada no sistema.
  await janela.evaluate(() => {
    location.href = 'file:///etc/passwd'
  })
  conferir('navegacao para file: bloqueada', new URL(janela.url()).protocol, 'app:')
  // Prova viva de que o documento nao foi substituido: se a navegacao tivesse passado, a
  // pagina teria saido e este seletor nao responderia. `.bloco-qa` e da rota do tema, que
  // e onde o teste esta.
  conferir('o documento continua o nosso', await janela.locator('.bloco-qa').count(), 1)

  // S4 — sem janela nova e sem `webview`. O `setWindowOpenHandler` nega (e o `window.open`
  // devolve `null`), o `webviewTag` está desligado e o `will-attach-webview` preventa: a
  // única saída para fora é o `shell.openExternal`, e só para http(s).
  conferir(
    'S4 window.open é negado (devolve null)',
    await janela.evaluate(() => window.open('https://exemplo.invalid/', '_blank') === null),
    true,
  )
  // Tempo para uma janela que porventura abrisse aparecer: sem o handler, ela nasceria.
  await janela.waitForTimeout(300)
  conferir('S4 nenhuma janela nova', app.windows().length, 1)
  conferir('S4 webviewTag desligado', preferencias?.webviewTag, false)

  // A superficie do protocolo, exercitada de dentro do processo principal. Nada disso era
  // testado: a travessia, o host unico e o cabecalho de CSP existiam so por inspecao do
  // codigo. Do renderer nao da para conferir — a propria CSP tem `connect-src 'none'` e
  // bloquearia o fetch antes de o handler ser chamado.
  const protocolo = await app.evaluate(async ({ net }) => {
    const ler = async (url) => {
      try {
        const resposta = await net.fetch(url)
        return {
          status: resposta.status,
          csp: resposta.headers.get('content-security-policy') ?? '',
        }
      } catch (erro) {
        return { status: 0, csp: '', erro: String(erro) }
      }
    }
    return {
      normal: await ler('app://bundle/index.html'),
      // `%2e%2e` codificado: a URL `app://bundle/../../etc/passwd` seria normalizada pelo
      // parser (o host viraria `etc`) e nao chegaria ao handler como travessia.
      travessia: await ler('app://bundle/%2e%2e/%2e%2e/etc/passwd'),
      host: await ler('app://outro/index.html'),
    }
  })
  conferir('protocolo serve o app', protocolo.normal.status, 200)
  conferir(
    'CSP vem como cabecalho',
    protocolo.normal.csp.includes("default-src 'none'"),
    true,
  )
  conferir('protocolo recusa travessia', protocolo.travessia.status, 404)
  conferir('protocolo recusa host estranho', protocolo.host.status, 404)

  // S9 — nenhuma requisição de rede. A prova é ativa e tem controle positivo: um servidor
  // HTTP local conta o que chega. O smoke o alcança do próprio Node (o contador funciona),
  // e o renderer TENTA o mesmo endereço: a CSP `connect-src 'self'` (`app://`) o barra antes
  // do fio, e a contagem fica só com o controle. Sem a CSP, o `fetch` completaria e o número
  // subiria — a asserção reprova.
  const rede = await subirServidorDeRede()
  try {
    const controle = await fetch(rede.url)
    conferir('S9 controle: o servidor de rede responde ao smoke', controle.status, 200)
    conferir('S9 controle: o servidor registrou o acesso', rede.pedidos.length, 1)

    conferir(
      'S9 o renderer recusa requisição fora do app://',
      await janela.evaluate(async (url) => {
        try {
          await fetch(url)
          return 'fez'
        } catch {
          return 'recusou'
        }
      }, rede.url),
      'recusou',
    )
    // Uma requisição que escapasse da CSP chegaria depois: o tempo separa as duas coisas.
    await janela.waitForTimeout(300)
    conferir(
      'S9 nenhuma requisição do renderer chegou ao servidor',
      rede.pedidos.length,
      1,
    )
  } finally {
    await rede.fechar()
  }

  // S13 — a importacao que EFETIVAMENTE grava. O dialogo nativo nao abre num teste, entao este
  // caminho so existia por inspecao: aqui o `showOpenDialog` do processo principal responde com
  // um arquivo de verdade, e a resposta "Progresso importado." so pode sair depois de o arquivo
  // ter sido escrito — a gravacao era enfileirada e nao aguardada, e a resposta saia mesmo quando
  // ela falhava. Fica no fim da sessao porque mexe no arquivo: as conferencias de navegacao acima
  // valem para o estado que o teste construiu antes.
  const importado = {
    versao: 1,
    temas: {
      '02-grc#TEMA-01': {
        ref: '02-grc#TEMA-01',
        lido: true,
        preTeste: [],
        recuperacaoOk: true,
        revisao: { intervaloDias: 7, proximaRevisao: '2026-03-17T12:00:00.000Z' },
      },
    },
    checkpoints: { '02-grc': { acertos: 4, total: 5 } },
    questoes: {},
    diasAtivos: ['2026-03-09'],
  }
  const arquivoDeImportacao = path.join(dados, 'para-importar.json')
  fs.writeFileSync(arquivoDeImportacao, JSON.stringify(importado))
  await app.evaluate(({ dialog }, caminho) => {
    dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [caminho] })
  }, arquivoDeImportacao)
  // O botao Importar mora no painel da tela inicial, e nao na rota do tema.
  await janela.evaluate(() => {
    location.hash = '#/'
  })
  await janela.waitForSelector('.acoes-progresso')
  await janela.getByRole('button', { name: 'Importar progresso' }).click()
  const importouGravando = await ate(() => {
    try {
      return JSON.parse(fs.readFileSync(arquivo, 'utf8'))?.temas?.['02-grc#TEMA-01']?.lido === true
    } catch {
      return false
    }
  })
  conferir('S13 a importação grava o arquivo, e não só a memória', importouGravando, true)
  conferir(
    'S13 a tela confirma a importação depois da gravação',
    (await janela.locator('.acoes-progresso [role="status"]').textContent())?.trim(),
    'Progresso importado.',
  )
  conferir(
    'S13 a importação não deixa .tmp na pasta de dados',
    fs.readdirSync(pasta).filter((nome) => nome.endsWith('.tmp')),
    [],
  )
  // A segunda sessao conta com o progresso que este teste construiu antes: o arquivo volta ao
  // que era.
  fs.writeFileSync(arquivo, arquivoIntacto)

  await app.close()
  return { pasta }
}

async function segundaSessao() {
  // Fecha e reabre com o mesmo diretorio de dados: e o que prova a persistencia.
  const app = await abrir()
  const janela = await app.firstWindow()
  await janela.waitForSelector('.lista-areas li')
  // A leitura do arquivo e assincrona: ler o painel antes dela daria "0 de 109".
  await esperarPainel(janela)
  const painel = ((await janela.locator('.resumo').textContent()) ?? '').replace(/\s+/g, ' ')
  conferir('estado sobreviveu ao fechar e reabrir', /Temas firmes ?1 de 109/.test(painel), true)
  conferir('progresso lido do arquivo', /pasta de dados do aplicativo/.test(painel), true)
  await app.close()
}

/**
 * S6, S7, S8 e S12 no lado da LEITURA da ponte, com o arquivo trocado entre um `reload` e outro.
 *
 * O que atravessa a ponte vem de fora: um arquivo que alguem copiou, editou ou corrompeu. A
 * leitura tem de normalizar campo a campo (S6), cortar pelo tamanho ANTES do `JSON.parse` (S7) —
 * na mesma unidade da gravacao, os bytes (S8) — e tratar arquivo acima do teto ou truncado como
 * ERRO, e nao como "primeira vez": e a diferenca entre a tela avisar e o primeiro clique apagar
 * o progresso importado (S12).
 */
async function terceiraSessao(pasta) {
  const arquivo = path.join(pasta, 'progresso.json')
  const app = await abrir()
  const janela = await app.firstWindow()
  await janela.waitForSelector('.lista-areas li')
  await esperarPainel(janela)

  // S6 na leitura: cada campo invalido e descartado, um a um. `lido: "sim"` nao vira `true`,
  // `recuperacaoOk: "talvez"` nao vira firme, `confianca: 99` sai do pre-teste e o dia de
  // calendario inexistente (`2020-13-99`) nao conta — so o `2026-01-01` sobrevive.
  fs.writeFileSync(
    arquivo,
    JSON.stringify({
      versao: 1,
      temas: {
        '01-fundamentos#TEMA-01': {
          ref: '01-fundamentos#TEMA-01',
          lido: 'sim',
          preTeste: [{ indice: 0, confianca: 99 }],
          recuperacaoOk: 'talvez',
          revisao: { intervaloDias: -3, proximaRevisao: '2020-13-99' },
        },
      },
      checkpoints: { '01-fundamentos': { acertos: 9, total: 2 } },
      diasAtivos: ['2020-13-99', '2026-01-01'],
    }),
  )
  await janela.reload()
  await janela.waitForSelector('.lista-areas li')
  await esperarPainel(janela)
  conferir(
    'S6 o checkpoint com placar impossível é descartado',
    await valorDoResumo(janela, 'Checkpoints'),
    '0 de 18',
  )
  conferir(
    'S6 o dia inexistente é descartado e o válido fica',
    await valorDoResumo(janela, 'Dias com estudo'),
    '1',
  )

  // S7 e S8 na leitura: o teto e medido em BYTES, e o que passa dele e ERRO — nao "comeca vazio".
  // O arquivo abaixo e um progresso VALIDO (daria "1 de 109") com 600 mil caracteres acentuados
  // de enchimento: cabe em unidades de codigo e passa de 1 MB no disco. Antes, o teto era
  // conferido em unidades diferentes na escrita e na leitura; aqui o arquivo era recusado em
  // silencio, a tela dizia "0 de 109" e "Primeira vez aqui?", e o primeiro clique substituia o
  // progresso importado pelo estado vazio mais um clique.
  const arquivoAcentuado = JSON.stringify({
    versao: 1,
    temas: {
      '01-fundamentos#TEMA-01': {
        ref: '01-fundamentos#TEMA-01',
        lido: true,
        preTeste: [],
        recuperacaoOk: true,
        revisao: { intervaloDias: 7, proximaRevisao: '2026-03-17T12:00:00.000Z' },
      },
    },
    checkpoints: {},
    questoes: {},
    diasAtivos: ['2026-03-09'],
    enchimento: 'á'.repeat(600_000),
  })
  fs.writeFileSync(arquivo, arquivoAcentuado)
  await janela.reload()
  await janela.waitForSelector('.lista-areas li')
  await esperarPainel(janela)
  conferir(
    'S7 o teto é o mesmo dos dois lados: o payload valida em caracteres e estoura em bytes',
    [arquivoAcentuado.length < 1_048_576, Buffer.byteLength(arquivoAcentuado, 'utf8') > 1_048_576],
    [true, true],
  )
  conferir(
    'S8 arquivo acima do teto é erro de leitura, não "0 de 109"',
    [
      await valorDoResumo(janela, 'Temas firmes'),
      (await avisoDeCarga(janela))?.startsWith('Não consegui ler o progresso guardado'),
    ],
    ['—', true],
  )
  conferir(
    'S8 o clique que gravaria não sobrescreve o arquivo que não conseguimos ler',
    await cliqueQueNaoPodeGravar(janela, arquivo),
    { arquivoMudou: false, marcados: 1, temporarios: [] },
  )

  // S12 — arquivo ilegivel (truncado, como o de uma copia interrompida). Antes, o `JSON.parse`
  // lancava, o `catch` devolvia `null` e o app abria com `podeGravar=true`: a defesa de "nao
  // comecar vazio e gravar por cima" existia no store, tinha teste, e NUNCA ligava no desktop.
  fs.writeFileSync(
    arquivo,
    '{"versao":1,"temas":{"01-fundamentos#TEMA-01":{"ref":"01-fundamentos#TEMA-01","lido":true',
  )
  await janela.reload()
  await janela.waitForSelector('.lista-areas li')
  await esperarPainel(janela)
  conferir(
    'S12 arquivo truncado vira aviso, em vez de "Primeira vez aqui?"',
    [
      await valorDoResumo(janela, 'Temas firmes'),
      (await avisoDeCarga(janela))?.startsWith('Não consegui ler o progresso guardado'),
    ],
    ['—', true],
  )
  conferir(
    'S12 o clique que gravaria não substitui o arquivo truncado',
    await cliqueQueNaoPodeGravar(janela, arquivo),
    { arquivoMudou: false, marcados: 1, temporarios: [] },
  )

  await app.close()
}

async function main() {
  try {
    const { pasta } = await primeiraSessao()
    await segundaSessao()
    await terceiraSessao(pasta)
  } finally {
    // No `finally`: se um `waitForSelector` estourar no meio, o diretorio de dados ficaria
    // para tras. O do pacote ja limpa assim.
    fs.rmSync(dados, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
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
