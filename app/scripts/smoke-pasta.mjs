#!/usr/bin/env node
/**
 * Smoke da PASTA com atalho — a terceira via de entrega, e a unica que nao tinha portao.
 *
 * O smoke do navegador abre `dist/index.html` por `file://` e o do pacote abre o Electron; a
 * pasta de `npm run empacotar` nao passava por teste nenhum, e e ela que carrega o
 * `servidor.py` — o unico componente do produto que fala HTTP. Sem este teste, um defeito no
 * handler (uma travessia servida, um `Host` qualquer aceito, um metodo que responde 200) so
 * apareceria na maquina de quem estuda.
 *
 * O que ele faz: monta a pasta (`empacotar.mjs`), sobe o `servidor.py` numa porta livre — a
 * de producao e fixa, e um teste nao pode ocupar a 4173 de quem estuda nem disputar com outro
 * processo — e confere o contrato do servidor pelo fio, com `node:http`, sem navegador no
 * meio. O processo e encerrado no `finally`, e a porta e conferida livre depois disso.
 *
 * Uso: npm run smoke:pasta   (rode `npm run build` antes; a pasta e montada aqui)
 * Variavel opcional: PYTHON_BIN (default: python3)
 */
import { execFile, spawn } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { fontesMaisNovas } from './lib/frescor.mjs'

const execFileAsync = promisify(execFile)

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const HTML_DA_BUILD = path.join(APP, 'dist', 'index.html')
const PASTA = path.join(APP, 'dist', 'Roadmap-CISO-Interativo')
const SERVIDOR = path.join(PASTA, 'servidor.py')
const PYTHON = process.env.PYTHON_BIN ?? 'python3'

/** Os arquivos que `empacotar.mjs` promete entregar, com o unico que o servidor le. */
const ESPERADOS = [
  'index.html',
  'servidor.py',
  'LEIA-ME.txt',
  'Iniciar-Linux.sh',
  'Iniciar-macOS.command',
  'Iniciar-Windows.bat',
]

const falhas = []

function conferir(nome, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} = ${JSON.stringify(obtido)}`)
  // A lista do fim repete o obtido, como nos outros dois smokes: quem le o relatorio
  // vermelho no CI nao tem a linha do `OK`/`FALHA` a mao.
  if (!ok) falhas.push(`${nome}: esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(obtido)}`)
}

/**
 * Uma porta livre de verdade: o kernel escolhe (porta 0) e a soltamos em seguida.
 *
 * Existe uma janela entre soltar e o Python pegar, e ela e assumida: a alternativa seria
 * deixar a 4173 fixa, que e pior — o teste ocuparia a porta do estudo de quem roda isto.
 */
async function portaLivre() {
  const sonda = net.createServer()
  await new Promise((ok, erro) => sonda.once('error', erro).listen(0, '127.0.0.1', ok))
  const { port } = sonda.address()
  await new Promise((ok) => sonda.close(ok))
  return port
}

/** Uma requisicao crua, com `Host` sob controle: e ele que o servidor confere. */
function pedir(porta, caminho, { metodo = 'GET', host } = {}) {
  return new Promise((ok, erro) => {
    const requisicao = http.request(
      {
        host: '127.0.0.1',
        port: porta,
        path: caminho,
        method: metodo,
        headers: { Host: host ?? `127.0.0.1:${porta}` },
      },
      (resposta) => {
        const partes = []
        resposta.on('data', (pedaco) => partes.push(pedaco))
        resposta.on('end', () =>
          ok({
            status: resposta.statusCode,
            cabecalhos: resposta.headers,
            corpo: Buffer.concat(partes),
          }),
        )
      },
    )
    requisicao.on('error', erro)
    requisicao.end()
  })
}

/** Diz se algo atende na porta: e o que prova que ela ficou livre no fim. */
function atendeNaPorta(porta) {
  return new Promise((ok) => {
    const sonda = net.connect({ host: '127.0.0.1', port: porta })
    const encerrar = (resposta) => {
      sonda.destroy()
      ok(resposta)
    }
    sonda.setTimeout(1000)
    sonda.once('connect', () => encerrar(true))
    sonda.once('timeout', () => encerrar(false))
    sonda.once('error', () => encerrar(false))
  })
}

/**
 * Sobe o `servidor.py` e espera ele atender.
 *
 * `BROWSER=true` e deliberado: em producao o servidor abre o navegador da pessoa, e num teste
 * isso abriria uma janela na cara de quem roda. O `webbrowser` do Python respeita a variavel,
 * entao o comando dele vira um processo inofensivo.
 */
async function subirServidor(porta) {
  const filho = spawn(PYTHON, [SERVIDOR], {
    cwd: PASTA,
    env: { ...process.env, ROADMAP_PORTA: String(porta), BROWSER: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const saida = []
  const erros = []
  filho.stdout.on('data', (pedaco) => saida.push(String(pedaco)))
  filho.stderr.on('data', (pedaco) => erros.push(String(pedaco)))

  const limite = Date.now() + 15_000
  for (;;) {
    try {
      await pedir(porta, '/')
      return { filho, saida, erros }
    } catch {
      if (filho.exitCode !== null || filho.signalCode !== null) {
        throw new Error(
          `o servidor encerrou antes de atender (codigo ${filho.exitCode}, sinal ${filho.signalCode})\n` +
            `${erros.join('').trim()}`,
        )
      }
      if (Date.now() > limite) {
        throw new Error(`o servidor nao atendeu em 15 s\n${erros.join('').trim()}`)
      }
      await new Promise((ok) => setTimeout(ok, 100))
    }
  }
}

/** Encerra o processo e espera ele sair: sem isto o teste deixa a porta ocupada. */
async function encerrar(filho) {
  if (filho.exitCode !== null || filho.signalCode !== null) return
  const saiu = new Promise((ok) => filho.once('exit', ok))
  filho.kill('SIGTERM')
  const prazo = new Promise((ok) => setTimeout(() => ok('prazo'), 5000))
  if ((await Promise.race([saiu.then(() => 'saiu'), prazo])) === 'prazo') {
    // Nao deveria acontecer: o Python trata SIGTERM. Se acontecer, a porta nao pode ficar
    // presa a um processo que o teste perdeu de vista.
    filho.kill('SIGKILL')
    await saiu
  }
}

async function main() {
  // Existir nao basta em nenhum dos dois casos abaixo, e a mensagem diz o comando certo:
  // `empacotar.mjs` sozinho falharia com "Falta dist/index.html", que esconde o "rode o build".
  if (!fs.existsSync(HTML_DA_BUILD)) {
    console.error(`Falta o build: ${HTML_DA_BUILD}\nRode antes: npm run build`)
    process.exit(1)
  }
  const atrasadas = fontesMaisNovas(HTML_DA_BUILD, [
    path.join(APP, 'src'),
    path.join(APP, 'index.html'),
    path.join(APP, 'vite.config.ts'),
  ])
  if (atrasadas.length) {
    console.error(
      `Artefato desatualizado: ${HTML_DA_BUILD}\n` +
        `Mais novo que ele: ${atrasadas.join(', ')}\nRode antes: npm run build`,
    )
    process.exit(1)
  }

  // A pasta e montada aqui, e nao exigida pronta: um teste que sobe um `servidor.py` de
  // ontem mede um pacote que ninguem vai receber.
  try {
    const { stdout } = await execFileAsync(process.execPath, [path.join(AQUI, 'empacotar.mjs')], {
      cwd: APP,
      encoding: 'utf8',
    })
    process.stdout.write(stdout)
  } catch (erro) {
    console.error(`Nao consegui montar a pasta:\n${erro.stdout ?? ''}${erro.stderr ?? erro}`)
    process.exit(1)
  }

  console.log(`\nPasta: ${path.relative(APP, PASTA)}\n`)

  const faltando = ESPERADOS.filter((nome) => !fs.existsSync(path.join(PASTA, nome)))
  conferir('a pasta tem os arquivos que ela promete', faltando, [])

  // Existir nao basta: um `.sh` sem bit de execucao, ou um `.bat` em LF, abre quebrado no
  // duplo clique — que e a unica forma de abrir esta via. O `empacotar.mjs` faz as duas
  // coisas de proposito (chmod nos tres executaveis e conversao de LF para CRLF no `.bat`),
  // e ate agora nada cobrava isso: qualquer um dos dois podia sumir sem teste vermelho.
  //
  // As conferencias abaixo leem arquivo, entao ficam atras do `faltando`: um `statSync`
  // num arquivo ausente sai com ENOENT e stack trace, engolindo a mensagem que diz o que
  // falta. O `smoke-pacote.mjs` confere a existencia antes de listar pelo mesmo motivo.
  if (!faltando.length) {
    const atalhosUnix = ['Iniciar-Linux.sh', 'Iniciar-macOS.command']

    if (process.platform === 'win32') {
      // No Windows o `chmod` do Node so mexe no bit de somente-leitura e o `stat` nao
      // devolve os bits POSIX: exigir `0o111` ali reprovaria um pacote correto.
      console.log('----  bit de execucao dos atalhos: nao se aplica (Windows nao tem bit POSIX)')
    } else {
      const semExecucao = atalhosUnix.filter(
        (nome) => (fs.statSync(path.join(PASTA, nome)).mode & 0o111) === 0o0,
      )
      conferir('os dois atalhos de Unix tem bit de execucao', semExecucao, [])
    }

    // O `.bat` e o unico arquivo que o repositorio guarda em LF e o pacote entrega em CRLF,
    // e e a conversao que faz o `cmd.exe` reconhecer o `goto :fallback` do atalho. As duas
    // assercoes se completam: o `includes('\r\n')` reprova um arquivo vazio ou substituido,
    // e o `LF cru` reprova a volta para LF — que sozinho passaria por "tem CRLF" num
    // arquivo com as duas quebras misturadas.
    const bat = fs.readFileSync(path.join(PASTA, 'Iniciar-Windows.bat'), 'utf8')
    conferir('Iniciar-Windows.bat tem CRLF', bat.includes('\r\n'), true)
    conferir('Iniciar-Windows.bat sem LF cru', bat.split('\r\n').join('').includes('\n'), false)

    // Os atalhos de Unix sao o contrario: com CRLF o kernel procuraria `/bin/sh^M` e o
    // duplo clique nao abriria nada. Prova que a conversao do `.bat` nao vazou para eles.
    const comCR = atalhosUnix.filter((nome) =>
      fs.readFileSync(path.join(PASTA, nome), 'utf8').includes('\r'),
    )
    conferir('os atalhos de Unix ficam em LF', comCR, [])

    // Igualdade com o build, e nao so entre pasta e resposta: o teste do servidor compara o
    // corpo com o `index.html` da pasta, o que passaria com qualquer arquivo copiado para
    // esse nome. Esta linha e que amarra a pasta ao artefato que `npm run build` produz — e
    // cuja data o portao de frescor la em cima ja cobrou.
    conferir(
      'o index.html da pasta e o build',
      fs.readFileSync(path.join(PASTA, 'index.html')).equals(fs.readFileSync(HTML_DA_BUILD)),
      true,
    )
  }

  try {
    await execFileAsync(PYTHON, ['--version'], { encoding: 'utf8' })
  } catch {
    console.error(
      `Sem ${PYTHON} no PATH: e ele que sobe o servidor desta via.\n` +
        'Instale o Python 3 ou aponte PYTHON_BIN para o interpretador.',
    )
    process.exit(1)
  }
  if (faltando.length) process.exit(1)

  const porta = await portaLivre()
  console.log(`servidor.py na porta ${porta} (a de producao e a 4173, fixa)\n`)

  let servidor = null
  try {
    servidor = await subirServidor(porta)
    const naRaiz = await pedir(porta, '/')
    const doDisco = fs.readFileSync(path.join(PASTA, 'index.html'))

    conferir('GET / responde 200', naRaiz.status, 200)
    conferir(
      'GET / responde o HTML da pasta, byte a byte',
      naRaiz.corpo.equals(doDisco),
      true,
    )
    conferir('GET / diz que e HTML', naRaiz.cabecalhos['content-type'], 'text/html; charset=utf-8')
    conferir('GET / nao deixa o navegador adivinhar o tipo', naRaiz.cabecalhos['x-content-type-options'], 'nosniff')
    conferir('GET / nao guarda cache', naRaiz.cabecalhos['cache-control'], 'no-store')
    // A CSP vem como cabecalho, e nao so como `<meta>`: e o que diferencia esta via do
    // arquivo aberto por `file://`, onde o cabecalho nao existe.
    conferir(
      'GET / manda a CSP no cabecalho',
      (naRaiz.cabecalhos['content-security-policy'] ?? '').includes("default-src 'none'"),
      true,
    )
    conferir('o banner anuncia a porta em uso', servidor.saida.join('').includes(`no ar em http://127.0.0.1:${porta}/`), true)

    // O `index.html` e aceito como o `/`: os atalhos abrem o endereco sem o caminho, mas o
    // servidor declara os dois, e o teste segue a declaracao em vez de supo-la.
    conferir('GET /index.html responde 200', (await pedir(porta, '/index.html')).status, 200)
    conferir(
      'GET /?x=1 (a query e cortada antes da comparacao) responde 200',
      (await pedir(porta, '/?x=1')).status,
      200,
    )

    // Um arquivo so, e nenhum diretorio: e o que o servidor promete no cabecalho do arquivo
    // dele. Travessia entra na lista porque ela e o caminho obvio para sair do `index.html`.
    const outrosCaminhos = [
      ['/qualquer-coisa', 'caminho inexistente'],
      ['/LEIA-ME.txt', 'outro arquivo que esta na pasta'],
      // `/index.html` e servido, mas um caminho que apenas COMECA com ele nao pode ser: um
      // servidor que comparasse por prefixo (em vez de igualdade) devolveria o app em 200
      // para qualquer sufixo, e o teste antigo nao via isso.
      ['/index.html/extra', 'prefixo do caminho aceito, e nao o caminho'],
      ['/../etc/passwd', 'travessia para fora da pasta'],
      ['/../servidor.py', 'travessia para o proprio servidor'],
      ['/%2e%2e/servidor.py', 'travessia codificada'],
    ]
    for (const [caminho, motivo] of outrosCaminhos) {
      conferir(`GET ${caminho} (${motivo}) responde 404`, (await pedir(porta, caminho)).status, 404)
    }

    conferir('POST / responde 501 (o servidor so le)', (await pedir(porta, '/', { metodo: 'POST' })).status, 501)
    conferir('Host estranho responde 421', (await pedir(porta, '/', { host: 'evil.example' })).status, 421)
    conferir(
      'Host de outra porta responde 421',
      (await pedir(porta, '/', { host: '127.0.0.1:9999' })).status,
      421,
    )

    // Os cabecalhos de seguranca tambem nas respostas de ERRO.
    //
    // O 404 e o 421 sao as respostas que qualquer origem de fora consegue provocar, e eram
    // justamente as unicas sem politica nenhuma: `send_error` do `BaseHTTPRequestHandler` so manda
    // `Content-Type` e `Connection`, entao o corpo da pagina de erro do proprio servidor era
    // exibido sob nenhuma travas. Assercao sobre os CABECALHOS (o `status` ja tem a dele acima), e
    // a CSP e a mesma do 200: se o caminho de erro voltar a responder por `send_error`, estas
    // linhas reprovam.
    const respostasDeErro = [
      ['404 (caminho inexistente)', await pedir(porta, '/qualquer-coisa')],
      ['421 (Host de fora)', await pedir(porta, '/', { host: 'evil.example' })],
    ]
    for (const [rotulo, resposta] of respostasDeErro) {
      conferir(
        `GET ${rotulo} manda a CSP no cabecalho`,
        (resposta.cabecalhos['content-security-policy'] ?? '').includes("default-src 'none'"),
        true,
      )
      conferir(
        `GET ${rotulo} nao deixa o navegador adivinhar o tipo`,
        resposta.cabecalhos['x-content-type-options'],
        'nosniff',
      )
      conferir(`GET ${rotulo} nao guarda cache`, resposta.cabecalhos['cache-control'], 'no-store')
      conferir(
        `GET ${rotulo} nao vaza o endereco de origem`,
        resposta.cabecalhos['referrer-policy'],
        'no-referrer',
      )
    }
  } catch (erro) {
    falhas.push(`servidor: ${String(erro).slice(0, 300)}`)
  } finally {
    // A limpeza e no `finally` porque uma assercao que estoura no meio nao pode deixar o
    // processo no ar: a porta ficaria ocupada para o proximo teste e para quem estuda.
    if (servidor) await encerrar(servidor.filho)
  }

  const ocupada = await atendeNaPorta(porta)
  conferir('a porta volta a ficar livre no fim', ocupada, false)

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s) — a via da pasta esta reprovada:`)
    for (const falha of falhas) console.error(`  - ${falha}`)
    process.exit(1)
  }
  console.log('\npasta montada, servidor conferido pelo fio e encerrado: 0 falhas')
}

await main()
