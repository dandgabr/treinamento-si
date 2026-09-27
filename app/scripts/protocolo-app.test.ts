// A superficie do processo principal: a allowlist do esquema `app://`, a guarda de navegacao da
// janela e os canais do IPC.
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
// A guarda de navegacao segue a mesma regra, pelo mesmo motivo: o duble do `webContents` guarda os
// OUVINTES e o teste dispara `will-navigate` como o Electron dispara — senao "o prefixo
// `app://bundle/` inteiro passa" voltaria sem ninguem notar.
//
// O `electron` e trocado por um duble porque este arquivo registra esquema no topo e cria
// janela; aqui nada disso deve acontecer.

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { ConteudoComGuarda, EventoDaGuarda } from '../electron/main'

/**
 * O estado que o corpo dos handlers precisa: os handlers registrados (por canal de IPC), as
 * janelas abertas, o que o dialogo de salvar responde e o que a guarda entregou ao navegador do
 * sistema (`abertos`).
 */
const duble = vi.hoisted(() => ({
  handlers: new Map<string, (evento: unknown, valor?: unknown) => Promise<unknown>>(),
  janelas: [] as unknown[],
  escolhaSalvar: { canceled: true } as { canceled: boolean; filePath?: string },
  /** Quantas vezes o dialogo de salvar foi pedido: o teto tem de recusar ANTES de pedir. */
  salvarPedido: 0,
  /** Os enderecos que o `shell.openExternal` recebeu, na ordem. */
  abertos: [] as string[],
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
  shell: {
    // Guardar, e nao engolir: e por aqui que se prova que o link externo continua saindo para o
    // navegador do sistema (e que o link interno recusado NAO sai).
    openExternal: (url: string) => {
      duble.abertos.push(url)
    },
  },
}))

const { arquivoServivel, navegacaoPermitida, prenderJanelaAoApp, registrarCanais } = await import(
  '../electron/main'
)
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

/**
 * A entrada do app e o unico documento que a janela navega.
 *
 * O defeito que estes casos fecham: `will-navigate` (e a conferencia de origem dos canais)
 * liberavam o PREFIXO `app://bundle/` inteiro, entao `app://bundle/conteudo.json` — que o
 * resolvedor do conteudo classifica como externo e por isso sobrevive ao build — trocava o
 * documento da janela pelo arquivo. Sem execucao (`nosniff` e a CSP seguram), mas fora do app.
 */
describe('a navegação: só a entrada do app é documento', () => {
  const ENTRADAS: string[] = [
    'app://bundle/index.html',
    'app://bundle/',
    'app://bundle//index.html',
    'app://bundle/index.html?v=1',
    // As rotas do app sao fragmento do MESMO documento: aceitar a entrada com hash e aceitar a
    // entrada.
    'app://bundle/index.html#/area/01-fundamentos',
    'app://bundle/index.html#/tema/01-fundamentos/TEMA-01/secao-10',
  ]

  /** O resto do build, o resto do mundo e o que nem URL é. */
  const RECUSADAS: string[] = [
    // O caso da pendência: link que o material pode escrever e que o build mantém.
    'app://bundle/conteudo.json',
    'app://bundle/questoes.json',
    'app://bundle/assets/chunk-5VM5RSS4-ChdBZN4-.js',
    'app://outro/index.html',
    'app://bundle.evil/index.html',
    'file:///etc/passwd',
    'https://csrc.nist.gov/glossary',
    'javascript:alert(1)',
    // URL malformada: estoura no `decodeURIComponent` e a guarda tem de responder, e nao propagar.
    'app://bundle/%',
    'nao-e-url',
  ]

  it.each(ENTRADAS)('aceita %s', (url) => {
    expect(navegacaoPermitida(url)).toBe(true)
  })

  it.each(RECUSADAS)('recusa %s', (url) => {
    expect(navegacaoPermitida(url)).toBe(false)
  })
})

/**
 * Um `webContents` de mentira: guarda os ouvintes que a guarda registra, para o teste chamar os
 * CORPOS de verdade. Guardar importa — um duble que so aceitasse o registro deixaria "a decisao
 * desligada" passar verde, que e o defeito de origem.
 */
class ConteudoDeMentira implements ConteudoComGuarda {
  private navegacao: ((evento: EventoDaGuarda) => void) | null = null
  private webview: ((evento: EventoDaGuarda) => void) | null = null
  private tratador: ((detalhes: { url: string }) => Electron.WindowOpenHandlerResponse) | null = null

  on(
    evento: 'will-navigate' | 'will-attach-webview',
    ouvinte: (evento: EventoDaGuarda) => void,
  ): this {
    if (evento === 'will-navigate') this.navegacao = ouvinte
    else this.webview = ouvinte
    return this
  }

  setWindowOpenHandler(
    tratador: (detalhes: { url: string }) => Electron.WindowOpenHandlerResponse,
  ): this {
    this.tratador = tratador
    return this
  }

  /**
   * Dispara o `will-navigate` como o Electron o dispara, e devolve o que a guarda fez: se a
   * navegacao foi cancelada e o que saiu para o navegador do sistema NO meio disso (o `abertos` do
   * duble e cumulativo, entao a medida e o recorte desta chamada).
   */
  navegar(url: string): { recusada: boolean; abertos: string[] } {
    if (!this.navegacao) throw new Error('a guarda nao registrou will-navigate')
    const antes = duble.abertos.length
    let recusada = false
    this.navegacao({ url, preventDefault: () => (recusada = true) })
    return { recusada, abertos: duble.abertos.slice(antes) }
  }

  /** O que o `window.open` faria: entrega a URL ao tratador e devolve a resposta dele. */
  abrirJanela(url: string): { resposta: Electron.WindowOpenHandlerResponse; abertos: string[] } {
    if (!this.tratador) throw new Error('a guarda nao registrou setWindowOpenHandler')
    const antes = duble.abertos.length
    const resposta = this.tratador({ url })
    return { resposta, abertos: duble.abertos.slice(antes) }
  }

  /** Dispara o `will-attach-webview` e diz se a guarda o cancelou. */
  anexarWebview(): boolean {
    if (!this.webview) throw new Error('a guarda nao registrou will-attach-webview')
    let recusado = false
    // O evento do `webview` nao tem destino: o `url` fica vazio, e a guarda so chama o
    // `preventDefault`.
    this.webview({ url: '', preventDefault: () => (recusado = true) })
    return recusado
  }
}

describe('a guarda de navegação da janela, exercitando o ouvinte de verdade', () => {
  /** Um conteúdo com a guarda registrada, do jeito que `criarJanela` a registra. */
  function janelaProtegida(): ConteudoDeMentira {
    const conteudo = new ConteudoDeMentira()
    prenderJanelaAoApp(conteudo)
    return conteudo
  }

  beforeEach(() => {
    duble.abertos = []
  })

  it('recusa app://bundle/conteudo.json, e não entrega nada ao navegador do sistema', () => {
    // Antes: `url.startsWith('app://bundle/')` deixava passar, e o documento da janela virava o
    // JSON. O `abertos` vazio prova as duas metades: recusou E nao mandou servir no navegador.
    expect(janelaProtegida().navegar('app://bundle/conteudo.json')).toEqual({
      recusada: true,
      abertos: [],
    })
  })

  it('aceita a entrada, inclusive com a rota no fragmento, sem cancelar nada', () => {
    const conteudo = janelaProtegida()
    expect(conteudo.navegar('app://bundle/index.html')).toEqual({ recusada: false, abertos: [] })
    expect(conteudo.navegar('app://bundle/index.html#/area/01-fundamentos')).toEqual({
      recusada: false,
      abertos: [],
    })
  })

  it('manda o link externo para o navegador do sistema', () => {
    // O desenho que ja existia, e que continua: http(s) sai pelo `shell.openExternal`.
    expect(janelaProtegida().navegar('https://csrc.nist.gov/glossary')).toEqual({
      recusada: true,
      abertos: ['https://csrc.nist.gov/glossary'],
    })
  })

  it('bloqueia o esquema que não é http(s) sem entregar ao sistema', () => {
    expect(janelaProtegida().navegar('file:///etc/passwd')).toEqual({ recusada: true, abertos: [] })
  })

  it('nega a janela nova e entrega o endereço http(s) ao navegador do sistema', () => {
    expect(janelaProtegida().abrirJanela('https://exemplo.invalid/')).toEqual({
      resposta: { action: 'deny' },
      abertos: ['https://exemplo.invalid/'],
    })
  })

  it('cancela o webview', () => {
    expect(janelaProtegida().anexarWebview()).toBe(true)
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

  it('aceita o quadro principal depois de a rota entrar no fragmento', async () => {
    // A tela muda de rota o tempo todo (`#/area/…`, `#/tema/…/secao-10`) e continua sendo a
    // entrada: prender a conferencia ao `index.html` sem o fragmento mataria o IPC inteiro no
    // primeiro clique de navegacao.
    await expect(
      handler('app:versao')({
        senderFrame: {
          parent: null,
          url: 'app://bundle/index.html#/tema/01-fundamentos/TEMA-01/secao-10',
        },
      }),
    ).resolves.toBe('0.0.0')
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
    // Mesmo host, outro caminho: o quadro que fala pelo IPC e o da ENTRADA. Um quadro parado no
    // `conteudo.json` — o documento que um link conseguia abrir — nao e a tela do aplicativo.
    [
      'mesmo host, arquivo do build que não é a entrada',
      { senderFrame: { parent: null, url: 'app://bundle/conteudo.json' } },
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
