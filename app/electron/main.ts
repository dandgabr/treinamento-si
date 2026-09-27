// Processo principal do aplicativo desktop.
//
// Tudo o que o renderer pode fazer passa por aqui: ele nao tem Node, nao tem rede e nao
// navega para fora. O conteudo do app e servido por um esquema proprio (`app://`), o que
// permite mandar a CSP como cabecalho — mais forte que a meta tag que o build web usa.

import { app, BrowserWindow, Menu, dialog, ipcMain, protocol, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  apagarProgresso,
  FLAGS_LEITURA,
  gravarProgresso,
  lerImportado,
  lerProgresso,
  MENSAGEM_GRANDE,
  serializarConferido,
} from './progresso'

// O desktop usa o build proprio (`vite.desktop.config.ts`), com arquivos separados: o
// conteudo e um JSON ao lado do HTML e os diagramas sao chunks. O build do navegador
// (`dist/`) continua em arquivo unico, para o duplo clique por `file://`.
const RENDERER = path.join(__dirname, '..', 'dist-desktop')
const ESQUEMA = 'app'
const ORIGEM = `${ESQUEMA}://bundle`
// Desenvolvimento exige DUAS coisas: a variavel de ambiente E nao estar empacotado.
//
// So a variavel — que era o caso — deixava o item de menu "Ferramentas de desenvolvedor"
// aparecer no binario de PRODUCAO: uma variavel de ambiente comum, que fuse nenhum protege,
// reabria a superficie que os fuses fecham (o DevTools le e escreve tudo o que a janela tem, e
// da acesso ao `require` do processo de renderizacao quando ele nao esta em sandbox). `app.isPackaged`
// e o que o empacotamento controla, e nao o ambiente de quem abre o aplicativo.
const DESENVOLVIMENTO = process.env.ROADMAP_DEV === '1' && !app.isPackaged

// O bundle dividido liberou o aperto que o arquivo unico impedia: sem script inline nao ha
// por que aceitar 'unsafe-inline', e `connect-src 'self'` basta para o `conteudo.json` —
// continua sem rede, porque 'self' aqui e o esquema `app://`.
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  'img-src data:',
  'font-src data:',
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ')

const TIPOS: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.map': 'application/json; charset=utf-8',
}

// O que o handler pode servir, e nada mais: o HTML, os dois JSON que o build emite ao lado
// dele e os chunks em `assets/`.
//
// A lista e fechada porque a trava de travessia, sozinha, e lexical: `path.resolve` monta o
// caminho sem consultar o disco, entao um symlink dentro do build passava por ela como se
// fosse um arquivo do build — `dist-desktop/atalho -> /etc/passwd` era servido com 200.
//
// Ela decide o NOME, e o nome nao basta: um symlink com nome permitido
// (`assets/chunk-x.js -> /etc/passwd`) passaria. Por isso o handler tambem resolve o caminho
// real antes de ler (ver `registrarProtocolo`). As duas travas juntas: o que nao for um dos
// nomes do build nem um arquivo de verdade dentro dele nao e servido.
//
// Os nomes de `assets/` sao hashes do Vite (letras, digitos, ponto, hifen, sublinhado). O
// primeiro caractere de cada segmento nao pode ser ponto, entao `..` — em qualquer
// codificacao, porque a conferencia e sobre o caminho ja decodificado — nao casa, e uma
// barra invertida (o separador do Windows) tambem nao.
const SERVIVEIS: readonly RegExp[] = [
  /^index\.html$/,
  /^conteudo\.json$/,
  /^questoes\.json$/,
  /^assets\/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*\/)*[A-Za-z0-9_-][A-Za-z0-9._-]*$/,
]

/** Diz se o caminho pedido e um arquivo que o build emite. Exportada para o teste. */
export function arquivoServivel(caminho: string): boolean {
  return SERVIVEIS.some((permitido) => permitido.test(caminho))
}

// `corsEnabled: true` e obrigatorio junto de `supportFetchAPI`: sem ele, uma pagina de
// origem remota carregada neste renderer conseguiria ler os recursos de `app://`
// (padrao do CVE-2026-70604 / GHSA-v3j7-r9gq-3gjw). Hoje nao existe pagina remota aqui,
// mas a privilegiacao nao pode depender disso.
protocol.registerSchemesAsPrivileged([
  {
    scheme: ESQUEMA,
    privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
  },
])

/** Abre no navegador do sistema, e so para http(s): nada de file:, smb: ou esquema proprio. */
function abrirFora(url: string): void {
  try {
    const alvo = new URL(url)
    if (alvo.protocol === 'https:' || alvo.protocol === 'http:') void shell.openExternal(url)
  } catch {
    // URL invalida: ignora.
  }
}

function registrarProtocolo(): void {
  protocol.handle(ESQUEMA, async (pedido) => {
    try {
      const url = new URL(pedido.url)
      // Um host so. O handler ignorava o host, entao `app://qualquercoisa/...` era
      // servido igual.
      if (url.host !== 'bundle') return new Response('nao encontrado', { status: 404 })
      const caminho = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html'
      // Allowlist do que o build emite, decidida sobre o caminho ja decodificado: o que nao
      // casa nao chega a virar caminho de disco. E o que recusa o symlink de nome estranho,
      // que a conferencia de prefixo logo abaixo sozinha aprovaria (ela compara texto, nao o
      // arquivo que o texto aponta).
      if (!arquivoServivel(caminho)) return new Response('nao encontrado', { status: 404 })
      const alvo = path.resolve(RENDERER, caminho)
      // Segunda trava, e a unica que olha o disco: a allowlist acima decide o NOME, e um
      // symlink com nome permitido passaria por ela. Resolver o caminho real e conferir o
      // prefixo de novo fecha a classe — o que for servido e um arquivo que existe mesmo
      // dentro do build. A raiz tambem e resolvida: o proprio diretorio do build pode estar
      // sob um caminho com symlink. Isto substitui a conferencia lexical que havia aqui: ela
      // so pegava `..` no texto, e o prefixo sobre o caminho real pega isso e o symlink.
      //
      // Fica no lugar de ler o caminho real uma vez e guardar: `fs.realpath` funciona dentro
      // do `app.asar` (conferido na versao empacotada) e nao ha o que otimizar — sao poucos
      // pedidos por sessao.
      const raiz = await fs.realpath(RENDERER)
      const real = await fs.realpath(alvo)
      if (real !== raiz && !real.startsWith(raiz + path.sep)) {
        return new Response('nao encontrado', { status: 404 })
      }
      // Abrir e LER pelo mesmo descritor, conferindo o que ele e antes de ler.
      //
      // `fs.readFile(real)` sobre um FIFO com nome permitido dentro do build
      // (`dist-desktop/assets/tubo.js`, por exemplo) NUNCA resolve: a requisição fica pendurada
      // para sempre e o handler sem resposta — medido. Com `O_NONBLOCK` a abertura responde, e o
      // `fstat` no descritor diz que não é um arquivo comum: 404, e o pedido termina.
      //
      // A conferência é no descritor, e não no caminho, pelo mesmo motivo do `lerImportado`: o
      // caminho pode ser trocado por symlink entre uma consulta e outra.
      const arquivo = await fs.open(real, FLAGS_LEITURA)
      try {
        if (!(await arquivo.stat()).isFile()) {
          return new Response('nao encontrado', { status: 404 })
        }
        const corpo = await arquivo.readFile()
        return new Response(corpo, {
          headers: {
            // O tipo vem do caminho REAL: se um nome do build for um symlink para outro arquivo
            // do build, o que se serve e o alvo, e o `nosniff` abaixo nao perdoa o rotulo errado.
            'Content-Type': TIPOS[path.extname(real)] ?? 'application/octet-stream',
            'Content-Security-Policy': CSP,
            'X-Content-Type-Options': 'nosniff',
            'Cache-Control': 'no-store',
          },
        })
      } finally {
        await arquivo.close()
      }
    } catch {
      // URL malformada (`app://bundle/%` dispara URIError no decode) e arquivo ausente
      // caem aqui, em vez de rejeitar a promise do handler.
      return new Response('nao encontrado', { status: 404 })
    }
  })
}

function avisarInterface(acao: 'exportar' | 'importar' | 'apagar'): void {
  BrowserWindow.getAllWindows()[0]?.webContents.send('menu:acao', acao)
}

function montarMenu(): void {
  const modelo: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Roadmap',
      submenu: [
        { role: 'about', label: 'Sobre o Roadmap CISO' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar' },
        { role: 'hideOthers', label: 'Ocultar os outros' },
        { role: 'unhide', label: 'Mostrar todos' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    },
    {
      label: 'Progresso',
      submenu: [
        { label: 'Exportar…', accelerator: 'CmdOrCtrl+E', click: () => avisarInterface('exportar') },
        { label: 'Importar…', accelerator: 'CmdOrCtrl+I', click: () => avisarInterface('importar') },
        { type: 'separator' },
        { label: 'Recomeçar', click: () => avisarInterface('apagar') },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar tudo' },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Tamanho normal' },
        { role: 'zoomIn', label: 'Aumentar' },
        { role: 'zoomOut', label: 'Diminuir' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tela cheia' },
        ...(DESENVOLVIMENTO
          ? [{ role: 'toggleDevTools' as const, label: 'Ferramentas de desenvolvedor' }]
          : []),
      ],
    },
  ]
  // No macOS o primeiro menu e o do aplicativo; o resto e igual.
  Menu.setApplicationMenu(Menu.buildFromTemplate(modelo))
}

function criarJanela(): BrowserWindow {
  const janela = new BrowserWindow({
    width: 1180,
    height: 840,
    minWidth: 720,
    minHeight: 560,
    // Sem `show` na criacao: a janela so aparece pintada, o que evita o piscar branco
    // que o bundle grande provoca.
    show: false,
    backgroundColor: '#fbfaf7',
    title: 'Roadmap CISO',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      webviewTag: false,
      spellcheck: false,
      devTools: DESENVOLVIMENTO,
    },
  })

  janela.once('ready-to-show', () => janela.show())

  // Nenhuma navegacao sai do app: link do material abre no navegador do sistema.
  janela.webContents.on('will-navigate', (evento, url) => {
    if (!url.startsWith(`${ORIGEM}/`)) {
      evento.preventDefault()
      abrirFora(url)
    }
  })
  janela.webContents.setWindowOpenHandler(({ url }) => {
    abrirFora(url)
    return { action: 'deny' }
  })
  janela.webContents.on('will-attach-webview', (evento) => evento.preventDefault())

  void janela.loadURL(`${ORIGEM}/index.html`)
  return janela
}

/**
 * Diz se quem mandou a mensagem e o quadro principal da NOSSA janela, servido pelo `app://bundle`.
 *
 * Sem esta conferencia, qualquer `webContents` que um dia exista neste processo fala com todos os
 * canais: hoje ha uma janela e nenhum conteudo remoto, mas a superficie nasce no dia em que houver
 * um segundo `webContents` (uma janela nova, um `webview` que alguem religue, um iframe de
 * conteudo de terceiro). Quem confere a origem pelo lado de QUEM RECEBE nao depende de todas as
 * outras travas continuarem certas.
 *
 * `senderFrame` (e nao `sender`): o `sender` e o `webContents` inteiro, e um quadro dentro dele
 * passaria por qualquer conferencia feita sobre o `webContents`. `parent === null` exige o quadro
 * principal — um iframe tambem esta dentro do nosso `webContents`, e nao e a tela do aplicativo.
 */
function origemAutorizada(evento: Electron.IpcMainInvokeEvent): boolean {
  try {
    const quadro = evento.senderFrame
    // `null` quando o quadro ja foi destruido. O acesso a `senderFrame` de um quadro destruido
    // estoura em vez de devolver `null`, e por isso a leitura esta dentro do `try`.
    if (!quadro || quadro.parent !== null) return false
    const url = new URL(quadro.url)
    // A mesma origem que o `loadURL` usa e que a CSP nomeia: `app://bundle`. O caminho e o hash
    // da rota mudam; a origem, nao.
    return url.protocol === `${ESQUEMA}:` && url.host === 'bundle'
  } catch {
    return false
  }
}

/** A conferencia minima de forma, a MESMA para gravar e para exportar. */
function conferirFormaDoProgresso(valor: unknown): void {
  // O renderer normaliza campo a campo antes de mandar (`src/domain/progresso.ts`); aqui so se
  // recusa o que nem objeto e.
  if (!valor || typeof valor !== 'object') throw new Error('progresso invalido')
}

/**
 * Registra um canal do IPC passando pela conferencia do remetente.
 *
 * Todos os canais entram por aqui, e nao por `ipcMain.handle` direto: a conferencia de origem
 * deixa de ser uma linha que cada handler novo precisa lembrar de escrever — um canal registrado
 * sem ela seria indistinguivel dos outros na leitura.
 */
function canal(
  nome: string,
  acao: (evento: Electron.IpcMainInvokeEvent, valor?: unknown) => unknown,
): void {
  ipcMain.handle(nome, async (evento, valor?: unknown) => {
    if (!origemAutorizada(evento)) throw new Error('origem nao autorizada')
    return await acao(evento, valor)
  })
}

/**
 * Registra os canais do IPC no `ipcMain`.
 *
 * Exportada para o teste (`scripts/protocolo-app.test.ts`): enquanto ela era privada, o duble do
 * `ipcMain.handle` engolia a funcao registrada e o CORPO de cada handler — a conferencia de origem
 * e o teto do exportar — nunca rodava em teste nenhum. Com a exportacao, o teste chama o handler
 * de verdade, com o `senderFrame` que monta. Nada mais muda: quem chama continua sendo o
 * `app.whenReady()`.
 */
export function registrarCanais(): void {
  canal('app:versao', () => app.getVersion())

  canal('progresso:ler', () => lerProgresso())
  canal('progresso:gravar', async (_evento, valor) => {
    conferirFormaDoProgresso(valor)
    await gravarProgresso(valor)
  })
  canal('progresso:apagar', () => apagarProgresso())

  canal('progresso:exportar', async (_evento, valor) => {
    // A mesma conferencia minima de forma do `gravar`: aqui o valor vai direto para o disco, sem
    // passar por normalizador nenhum (o do renderer fica la). Antes esta porta escrevia o que
    // recebesse — inclusive o que nao e um progresso.
    conferirFormaDoProgresso(valor)
    // O teto e conferido ANTES do dialogo, e sobre o texto indentado que vai ser escrito: nao
    // adianta pedir um caminho para, no fim, recusar o conteudo — e o arquivo exportado acima do
    // teto e um arquivo que o `importar` recusa (importar e gravar tem o mesmo teto). Mesmo teto
    // e mesma mensagem do `gravar`, pela mesma funcao.
    let texto: string
    try {
      texto = serializarConferido(valor, 2)
    } catch (erro) {
      return {
        estado: 'erro',
        mensagem: erro instanceof Error ? erro.message : MENSAGEM_GRANDE,
      } as const
    }
    const janela = BrowserWindow.getAllWindows()[0]
    if (!janela) return { estado: 'cancelado' } as const
    const escolha = await dialog.showSaveDialog(janela, {
      title: 'Exportar progresso',
      defaultPath: 'roadmap-progresso.json',
      filters: [{ name: 'Progresso do Roadmap', extensions: ['json'] }],
    })
    if (escolha.canceled || !escolha.filePath) return { estado: 'cancelado' } as const
    try {
      await fs.writeFile(escolha.filePath, texto, 'utf8')
      return { estado: 'ok', caminho: escolha.filePath } as const
    } catch {
      return { estado: 'erro', mensagem: 'Não consegui gravar nesse arquivo.' } as const
    }
  })

  canal('progresso:importar', async () => {
    const janela = BrowserWindow.getAllWindows()[0]
    if (!janela) return { estado: 'cancelado' } as const
    const escolha = await dialog.showOpenDialog(janela, {
      title: 'Importar progresso',
      filters: [{ name: 'Progresso do Roadmap', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (escolha.canceled || !escolha.filePaths[0]) return { estado: 'cancelado' } as const
    // O teto e a leitura saem do MESMO descritor (ver `lerImportado`). Com `stat` sobre o
    // caminho antes do `readFile`, o tamanho conferido podia ser de outro arquivo — e um FIFO
    // (`size === 0`) passava pelo teto e deixava o handler pendurado, sem resposta para a tela.
    return await lerImportado(escolha.filePaths[0])
  })
}

// Uma janela so: duas instancias escreveriam no mesmo arquivo de progresso.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const janela = BrowserWindow.getAllWindows()[0]
    if (janela) {
      if (janela.isMinimized()) janela.restore()
      janela.focus()
    }
  })

  // O app nao usa camera, microfone, localizacao, notificacao nem clipboard. As duas
  // checagens: a assincrona pede permissao, a sincrona responde na hora.
  app.on('web-contents-created', (_evento, conteudo) => {
    conteudo.session.setPermissionRequestHandler((_c, _p, responder) => responder(false))
    conteudo.session.setPermissionCheckHandler(() => false)
  })

  void app.whenReady().then(() => {
    registrarProtocolo()
    registrarCanais()
    montarMenu()
    criarJanela()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) criarJanela()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
