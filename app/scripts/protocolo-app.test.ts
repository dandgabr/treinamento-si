// A superficie do processo principal: a allowlist do esquema `app://` e os canais do IPC.
//
// O que se prova da allowlist e a decisao (URL -> caminho -> allowlist), que e a parte pura. O
// caminho completo — handler registrado, arquivo lido, symlink recusado com o Electron de
// verdade — e da sonda e do `npm run smoke:desktop`, que falam com o `app://` de dentro do
// processo principal.
//
// Do IPC o que se prova e o CORPO de cada handler, e nao a existencia do canal. O duble antigo do
// `ipcMain.handle` era `() => {}`: ele engolia a funcao registrada, entao a conferencia de origem
// (`origemAutorizada`) e o teto do `exportar` — os dois nascidos sem teste — nao rodavam em
// nenhum. Medido: `url.host === 'NUNCA'` (recusando TODO o IPC) e o teto desligado deixavam a
// suite inteira verde. Aqui o duble GUARDA os handlers (por canal) e o teste chama o handler de
// verdade, com o `senderFrame` que monta.
//
// O `electron` e trocado por um duble porque este arquivo registra esquema no topo e cria
// janela; aqui nada disso deve acontecer.

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * O estado que o corpo dos handlers precisa: os handlers registrados (por canal de IPC), as
 * janelas abertas e o que o dialogo de salvar responde. Tudo mutavel, e o teste e quem decide.
 */
const duble = vi.hoisted(() => ({
  handlers: new Map<string, (evento: unknown, valor?: unknown) => Promise<unknown>>(),
  janelas: [] as unknown[],
  escolhaSalvar: { canceled: true } as { canceled: boolean; filePath?: string },
  /** Quantas vezes o dialogo de salvar foi pedido: o teto tem de recusar ANTES de pedir. */
  salvarPedido: 0,
}))

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: () => true,
    // Nunca resolve: `whenReady().then(...)` registraria protocolo, abriria janela e registraria
    // os canais sozinho. Aqui os canais sao registrados pelo proprio teste.
    whenReady: () => new Promise(() => {}),
    on: () => {},
    quit: () => {},
    getVersion: () => '0.0.0',
  },
  BrowserWindow: class {
    static getAllWindows() {
      return duble.janelas
    }
  },
  Menu: { setApplicationMenu: () => {}, buildFromTemplate: () => ({}) },
  dialog: {
    showSaveDialog: () => {
      duble.salvarPedido += 1
      return Promise.resolve(duble.escolhaSalvar)
    },
    showOpenDialog: () => Promise.resolve({ canceled: true, filePaths: [] }),
  },
  ipcMain: {
    // Guardar, e nao engolir: e o unico jeito de o teste chamar o handler que o aplicativo chama.
    handle: (nome: string, acao: (evento: unknown, valor?: unknown) => Promise<unknown>) => {
      duble.handlers.set(nome, acao)
    },
  },
  protocol: { registerSchemesAsPrivileged: () => {}, handle: () => {} },
  shell: { openExternal: () => {} },
}))

const { arquivoServivel, registrarCanais } = await import('../electron/main')
const { MENSAGEM_GRANDE, TETO_BYTES } = await import('../electron/progresso')

// O mesmo registro que o `app.whenReady().then(...)` faz no aplicativo — sem ele o duble nao tem
// handler nenhum, e um canal ausente o teste acusa (ver `handler`).
registrarCanais()

/** As pastas temporarias do teste (o destino do exportar), removidas no fim. */
const temporarios: string[] = []

afterAll(() => {
  for (const pasta of temporarios.splice(0)) fs.rmSync(pasta, { recursive: true, force: true })
})

/** A decisao do handler, na mesma ordem: host, caminho decodificado, allowlist. */
function servir(url: string): string | null {
  try {
    const alvo = new URL(url)
    if (alvo.host !== 'bundle') return null
    const caminho = decodeURIComponent(alvo.pathname).replace(/^\/+/, '') || 'index.html'
    return arquivoServivel(caminho) ? caminho : null
  } catch {
    // URL malformada (`app://bundle/%` estoura no decode): o handler tambem responde 404.
    return null
  }
}

const SERVIVEIS: Array<[string, string]> = [
  ['app://bundle/index.html', 'index.html'],
  ['app://bundle/', 'index.html'],
  ['app://bundle//index.html', 'index.html'],
  ['app://bundle/index.html?v=1', 'index.html'],
  ['app://bundle/conteudo.json', 'conteudo.json'],
  ['app://bundle/questoes.json', 'questoes.json'],
  ['app://bundle/assets/index-B0Rdna_q.css', 'assets/index-B0Rdna_q.css'],
  ['app://bundle/assets/chunk-5VM5RSS4-ChdBZN4-.js', 'assets/chunk-5VM5RSS4-ChdBZN4-.js'],
]

const RECUSADOS = [
  // O caso que motivou a lista: nome fora do build, que aponta para qualquer coisa por
  // symlink. O `path.resolve` aprovava, porque ele compara texto.
  'app://bundle/atalho',
  // Arquivos do projeto que ficam fora da pasta do build.
  'app://bundle/package.json',
  'app://bundle/dist-electron/main.cjs',
  // Travessia em varias codificacoes: nenhuma destas formas esta na lista. Umas chegam ao
  // handler com o `..` no caminho; outras o parser resolveu antes — `%2e%2e` conta como `..`,
  // e `atalho/../index.html` vira `/index.html`, que e arquivo legitimo do build.
  'app://bundle/..%2f..%2fetc/passwd',
  'app://bundle/%2e%2e/%2e%2e/etc/passwd',
  'app://bundle/assets/..%2f..%2f..%2fetc/passwd',
  'app://bundle/assets%2f..%2f..%2fetc%2fpasswd',
  'app://bundle/assets/.../../../etc/passwd',
  'app://bundle/%252e%252e/etc/passwd',
  // Barra invertida: separador no Windows, e `path.resolve` a trataria como pasta.
  'app://bundle/assets%5C..%5C..%5Cetc%5Cpasswd',
  // Nome que o build nao emite, mesmo sem travessia nenhuma.
  'app://bundle/.index.html',
  'app://bundle/INDEX.HTML',
  'app://bundle/assets/.hidden',
  'app://bundle/assets/',
  'app://bundle/assets',
  'app://bundle/index.html%00.png',
  // Byte de NUL e URL malformada chegam ao `catch` do handler.
  'app://bundle/%',
  // Host unico.
  'app://outro/index.html',
]

describe('allowlist do esquema app://', () => {
  it.each(SERVIVEIS)('serve %s', (url, caminho) => {
    expect(servir(url)).toBe(caminho)
  })

  it.each(RECUSADOS)('recusa %s', (url) => {
    expect(servir(url)).toBeNull()
  })
})

/** O corpo do handler registrado para o canal. Canal ausente é erro, e não um teste que passa. */
function handler(nome: string): (evento: unknown, valor?: unknown) => Promise<unknown> {
  const acao = duble.handlers.get(nome)
  if (!acao) throw new Error(`canal ${nome} nao foi registrado`)
  return acao
}

/** Como o Electron entrega a mensagem legitima: o quadro principal da janela do `app://bundle`. */
const QUADRO_LEGITIMO = { senderFrame: { parent: null, url: 'app://bundle/index.html' } }

describe('a conferência de origem dos canais, exercitando o handler de verdade', () => {
  it('aceita o quadro principal servido pelo app://bundle', async () => {
    // Sem esta aceitacao, "todo o IPC e recusado" (`url.host === 'NUNCA'`) passaria por
    // conferencia de origem — e o aplicativo nao funcionaria.
    await expect(handler('app:versao')(QUADRO_LEGITIMO)).resolves.toBe('0.0.0')
  })

  const EVENTOS_RECUSADOS: Array<[string, unknown]> = [
    // `senderFrame` nulo: o quadro foi destruido entre o envio e o recebimento.
    ['senderFrame nulo', { senderFrame: null }],
    // Um iframe dentro da NOSSA janela: `parent` nao e nulo, e nao e a tela do aplicativo.
    [
      'quadro que não é o principal (iframe)',
      { senderFrame: { parent: {}, url: 'app://bundle/index.html' } },
    ],
    // O acesso a `senderFrame` de um quadro destruido ESTOURA, em vez de devolver `null`: a
    // leitura tem de estar dentro do `try` da conferencia.
    [
      'quadro destruído (o acesso estoura)',
      {
        get senderFrame(): never {
          throw new Error('frame was destroyed')
        },
      },
    ],
    // Outras origens: arquivo local, web, host do mesmo esquema e URL que nem e URL.
    ['file:', { senderFrame: { parent: null, url: 'file:///etc/passwd' } }],
    ['https:', { senderFrame: { parent: null, url: 'https://evil.example/index.html' } }],
    ['outro host do mesmo esquema', { senderFrame: { parent: null, url: 'app://outro/index.html' } }],
    [
      'host que só começa com bundle',
      { senderFrame: { parent: null, url: 'app://bundle.evil/index.html' } },
    ],
    ['URL invalida', { senderFrame: { parent: null, url: 'nao-e-url' } }],
  ]

  it.each(EVENTOS_RECUSADOS)('recusa %s', async (_nome, evento) => {
    await expect(handler('app:versao')(evento)).rejects.toThrow('origem nao autorizada')
  })
})

describe('o teto do exportar, exercitando o handler de verdade', () => {
  /** Cabe em unidades de codigo e passa do teto em bytes: o payload que separa as duas medidas. */
  const GRANDE = {
    versao: 1,
    temas: {},
    checkpoints: {},
    questoes: {},
    diasAtivos: [],
    enchimento: 'á'.repeat(600_000),
  }
  const PEQUENO = { versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [] }

  beforeEach(() => {
    // Nenhuma janela e nenhum dialogo por padrao: o caso do teto nao pode passar por o `exportar`
    // ter sido cancelado antes.
    duble.janelas = []
    duble.escolhaSalvar = { canceled: true }
    duble.salvarPedido = 0
  })

  /** Uma pasta temporaria do teste, para o `exportar` ter para onde escrever. */
  function pastaTemporaria(): string {
    const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'exportar-app-'))
    temporarios.push(pasta)
    return path.join(pasta, 'roadmap-progresso.json')
  }

  /** A mensagem com que o canal do `gravar` recusa este valor. */
  async function mensagemDoGravar(valor: unknown): Promise<string> {
    return await handler('progresso:gravar')(QUADRO_LEGITIMO, valor).then(
      () => 'gravou',
      (erro: unknown) => (erro instanceof Error ? erro.message : String(erro)),
    )
  }

  it('recusa o que o gravar recusaria, com a MESMA mensagem, antes de pedir um caminho', async () => {
    const texto = JSON.stringify(GRANDE)
    expect(texto.length).toBeLessThan(TETO_BYTES)
    expect(Buffer.byteLength(texto, 'utf8')).toBeGreaterThan(TETO_BYTES)

    // A mensagem comparada vem do outro canal, colhida agora: os dois tem de dizer a mesma coisa,
    // e nao duas frases parecidas escritas em dois lugares.
    const mensagem = await mensagemDoGravar(GRANDE)
    expect(mensagem).toBe(MENSAGEM_GRANDE)

    // A janela e o caminho existem: se o teto nao cortasse aqui, o `exportar` pediria o caminho e
    // escreveria os 1,2 MB — entao "nao escreveu nada" e o que prova que a recusa aconteceu ANTES
    // de o arquivo existir (e nao por o dialogo ter sido cancelado).
    const destino = pastaTemporaria()
    duble.janelas = [{}]
    duble.escolhaSalvar = { canceled: false, filePath: destino }

    const resultado = await handler('progresso:exportar')(QUADRO_LEGITIMO, GRANDE)

    expect(resultado).toEqual({ estado: 'erro', mensagem })
    expect(duble.salvarPedido).toBe(0)
    expect(fs.existsSync(destino)).toBe(false)
  })

  it('aceita o que cabe, e o arquivo é o texto indentado medido contra o teto', async () => {
    const destino = pastaTemporaria()
    duble.janelas = [{}]
    duble.escolhaSalvar = { canceled: false, filePath: destino }

    const resultado = await handler('progresso:exportar')(QUADRO_LEGITIMO, PEQUENO)

    expect(resultado).toEqual({ estado: 'ok', caminho: destino })
    expect(duble.salvarPedido).toBe(1)
    // O texto que o teto mediu é o que foi ao disco, e é o indentado (o mesmo que o `importar`
    // aceita de volta), e não o compacto que o `gravar` escreve.
    const escrito = fs.readFileSync(destino, 'utf8')
    expect(escrito).toBe(JSON.stringify(PEQUENO, null, 2))
    expect(Buffer.byteLength(escrito, 'utf8')).toBeLessThanOrEqual(TETO_BYTES)
  })
})
