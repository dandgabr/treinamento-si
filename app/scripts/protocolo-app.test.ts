// A allowlist do esquema `app://`: o handler serve o que o build emite, e mais nada.
//
// O que se prova aqui e a decisao (URL -> caminho -> allowlist), que e a parte pura. O
// caminho completo — handler registrado, arquivo lido, symlink recusado com o Electron de
// verdade — e da sonda e do `npm run smoke:desktop`, que falam com o `app://` de dentro do
// processo principal.
//
// O `electron` e trocado por um duble porque este arquivo registra esquema no topo e cria
// janela; aqui nada disso deve acontecer.

import { describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  app: {
    requestSingleInstanceLock: () => true,
    // Nunca resolve: `whenReady().then(...)` registraria protocolo e abriria janela.
    whenReady: () => new Promise(() => {}),
    on: () => {},
    quit: () => {},
    getVersion: () => '0.0.0',
  },
  BrowserWindow: class {},
  Menu: { setApplicationMenu: () => {}, buildFromTemplate: () => ({}) },
  dialog: {},
  ipcMain: { handle: () => {} },
  protocol: { registerSchemesAsPrivileged: () => {}, handle: () => {} },
  shell: { openExternal: () => {} },
}))

const { arquivoServivel } = await import('../electron/main')

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
