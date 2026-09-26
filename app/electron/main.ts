// Processo principal do aplicativo desktop.
//
// Tudo o que o renderer pode fazer passa por aqui: ele nao tem Node, nao tem rede e nao
// navega para fora. O conteudo do app e servido por um esquema proprio (`app://`), o que
// permite mandar a CSP como cabecalho — mais forte que a meta tag que o build web usa.

import { app, BrowserWindow, Menu, dialog, ipcMain, protocol, shell } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { apagarProgresso, gravarProgresso, lerProgresso, TETO_BYTES } from './progresso'

const RENDERER = path.join(__dirname, '..', 'dist')
const ESQUEMA = 'app'
const ORIGEM = `${ESQUEMA}://bundle`
const DESENVOLVIMENTO = process.env.ROADMAP_DEV === '1'

// Com bundle dividido da para trocar 'unsafe-inline' por 'self' e apertar mais.
const CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  'img-src data:',
  'font-src data:',
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
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

protocol.registerSchemesAsPrivileged([
  { scheme: ESQUEMA, privileges: { standard: true, secure: true, supportFetchAPI: true } },
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
    const caminho = decodeURIComponent(new URL(pedido.url).pathname).replace(/^\/+/, '')
    const alvo = path.resolve(RENDERER, caminho || 'index.html')
    // Trava de travessia: o arquivo tem de estar dentro do build. E o unico ponto em que
    // um caminho vindo de fora vira leitura de disco, entao a checagem e explicita.
    if (alvo !== RENDERER && !alvo.startsWith(RENDERER + path.sep)) {
      return new Response('nao encontrado', { status: 404 })
    }
    try {
      const corpo = await fs.readFile(alvo)
      return new Response(corpo, {
        headers: {
          'Content-Type': TIPOS[path.extname(alvo)] ?? 'application/octet-stream',
          'Content-Security-Policy': CSP,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'no-store',
        },
      })
    } catch {
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

function registrarCanais(): void {
  ipcMain.handle('app:versao', () => app.getVersion())

  ipcMain.handle('progresso:ler', () => lerProgresso())
  ipcMain.handle('progresso:gravar', async (_evento, valor: unknown) => {
    // O renderer e validado la (normalizador); aqui so se recusa o que nem objeto e.
    if (!valor || typeof valor !== 'object') throw new Error('progresso invalido')
    await gravarProgresso(valor)
  })
  ipcMain.handle('progresso:apagar', () => apagarProgresso())

  ipcMain.handle('progresso:exportar', async (_evento, valor: unknown) => {
    const janela = BrowserWindow.getAllWindows()[0]
    if (!janela) return { cancelado: true }
    const escolha = await dialog.showSaveDialog(janela, {
      title: 'Exportar progresso',
      defaultPath: 'roadmap-progresso.json',
      filters: [{ name: 'Progresso do Roadmap', extensions: ['json'] }],
    })
    if (escolha.canceled || !escolha.filePath) return { cancelado: true }
    await fs.writeFile(escolha.filePath, JSON.stringify(valor, null, 2), 'utf8')
    return { salvo: true, caminho: escolha.filePath }
  })

  ipcMain.handle('progresso:importar', async () => {
    const janela = BrowserWindow.getAllWindows()[0]
    if (!janela) return { cancelado: true }
    const escolha = await dialog.showOpenDialog(janela, {
      title: 'Importar progresso',
      filters: [{ name: 'Progresso do Roadmap', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (escolha.canceled || !escolha.filePaths[0]) return { cancelado: true }
    const caminho = escolha.filePaths[0]
    // Tamanho conferido antes de ler: o corte protege contra arquivo gigante escolhido
    // por engano ou por ma-fe.
    const informacao = await fs.stat(caminho)
    if (informacao.size > TETO_BYTES) return { erro: 'O arquivo passa de 1 MB.' }
    try {
      return { dado: JSON.parse(await fs.readFile(caminho, 'utf8')) as unknown }
    } catch {
      return { erro: 'O arquivo não é um JSON válido.' }
    }
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

  // O app nao usa camera, microfone, localizacao, notificacao nem clipboard.
  app.on('web-contents-created', (_evento, conteudo) => {
    conteudo.session.setPermissionRequestHandler((_c, _p, responder) => responder(false))
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
