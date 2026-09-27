// @vitest-environment jsdom
//
// A escolha do provedor e o caminho da migracao sao a parte nova e arriscada: se o
// desktop cair no armazenamento do navegador, o progresso volta a ficar fragil sem
// ninguem perceber.
//
// O teto do navegador e a outra: ele e a MESMA regua do processo principal, e o que se prova aqui
// e que as duas portas que escrevem (o `gravar` no armazenamento e o `exportar` no arquivo) a
// aplicam — sobre o texto que vai para o disco, na mesma unidade (bytes) e com a mesma mensagem.
// O `exportar` gerava um arquivo que o `importar` daqui recusava: o "backup que nao volta".

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHAVE, persistencia } from './persistencia'
import { MENSAGEM_GRANDE, TETO_BYTES } from './limites'
import type { PonteDoApp, ResultadoDeExportacao, ResultadoDeImportacao } from './ponte'

const ESTADO = { versao: 1, temas: {}, checkpoints: {}, diasAtivos: [] }

function ponteFalsa(opcoes: { ler?: () => Promise<unknown | null> } = {}) {
  const registro = { gravacoes: [] as unknown[], apagou: 0 }
  const ponte: PonteDoApp = {
    versao: () => Promise.resolve('0.1.0'),
    progresso: {
      ler: opcoes.ler ?? (() => Promise.resolve(null)),
      gravar: (valor) => {
        registro.gravacoes.push(valor)
        return Promise.resolve()
      },
      apagar: () => {
        registro.apagou += 1
        return Promise.resolve()
      },
      importar: (): Promise<ResultadoDeImportacao> => Promise.resolve({ estado: 'cancelado' }),
      exportar: (): Promise<ResultadoDeExportacao> => Promise.resolve({ estado: 'cancelado' }),
    },
    aoEscolherNoMenu: () => {},
  }
  return { ponte, registro }
}

beforeEach(() => {
  window.localStorage.clear()
  delete window.roadmap
})

describe('sem a ponte (navegador)', () => {
  it('grava e le do armazenamento local', async () => {
    const p = persistencia()
    expect(p.descricao).toContain('navegador')
    await p.gravar(ESTADO)
    expect(window.localStorage.getItem(CHAVE)).toBe(JSON.stringify(ESTADO))
    expect(await p.carregar()).toEqual(ESTADO)
  })

  it('apaga sem deixar resto', async () => {
    const p = persistencia()
    await p.gravar(ESTADO)
    await p.apagar()
    expect(window.localStorage.getItem(CHAVE)).toBeNull()
    expect(await p.carregar()).toBeNull()
  })

  it('lança quando o que está guardado não é JSON válido, em vez de devolver null', async () => {
    // `null` aqui autorizaria a próxima gravação: o primeiro clique substituiria o progresso
    // inteiro pelo estado vazio mais um clique, por cima de um dado que existe e não abrimos. A
    // carga tem de FALHAR para o store desligar a escrita desta sessão.
    window.localStorage.setItem(CHAVE, '{quebrado')
    await expect(persistencia().carregar()).rejects.toThrow('JSON')
  })

  it('lança quando o armazenamento nega a leitura, em vez de dizer que não há nada', async () => {
    // Janela privada ou `file://`: o getter de `localStorage` pode lançar. Devolver `null` aqui
    // dizia "primeira vez" e liberava a gravação sobre o que talvez esteja guardado.
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    try {
      await expect(persistencia().carregar()).rejects.toThrow('negou o acesso')
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original)
      else Reflect.deleteProperty(window, 'localStorage')
    }
  })
})

describe('com a ponte (aplicativo desktop)', () => {
  it('grava pelo processo principal, não no navegador', async () => {
    const { ponte, registro } = ponteFalsa()
    window.roadmap = ponte
    const p = persistencia()
    expect(p.descricao).toContain('pasta de dados do aplicativo')
    await p.gravar(ESTADO)
    expect(registro.gravacoes).toEqual([ESTADO])
    expect(window.localStorage.getItem(CHAVE)).toBeNull()
  })

  it('apaga pelo processo principal', async () => {
    const { ponte, registro } = ponteFalsa()
    window.roadmap = ponte
    await persistencia().apagar()
    expect(registro.apagou).toBe(1)
  })

  it('lê do arquivo quando existe', async () => {
    const { ponte } = ponteFalsa({ ler: () => Promise.resolve(ESTADO) })
    window.roadmap = ponte
    expect(await persistencia().carregar()).toEqual(ESTADO)
  })

  it('não migra o navegador: a origem do desktop tem armazenamento próprio', async () => {
    // O `localStorage` do renderer no desktop é o da origem `app://bundle`, sempre vazio.
    // Ler dali nunca acharia o estudo feito em `file://` — por isso não há esse caminho, e
    // o arquivo exportado é a ponte entre as duas vias.
    window.localStorage.setItem(CHAVE, JSON.stringify(ESTADO))
    const { ponte } = ponteFalsa({ ler: () => Promise.resolve(null) })
    window.roadmap = ponte
    expect(await persistencia().carregar()).toBeNull()
  })

  it('prefere o arquivo quando ele existe', async () => {
    const doArquivo = { versao: 1, temas: { 'a#TEMA-01': { lido: true } }, checkpoints: {}, diasAtivos: [] }
    window.localStorage.setItem(CHAVE, JSON.stringify(ESTADO))
    const { ponte } = ponteFalsa({ ler: () => Promise.resolve(doArquivo) })
    window.roadmap = ponte
    expect(await persistencia().carregar()).toEqual(doArquivo)
  })
})

describe('o teto de 1 MB, no navegador — a mesma régua do desktop', () => {
  /**
   * 600 mil caracteres acentuados: 600 mil unidades de código (cabe no `length`) e 1,2 MB no
   * disco (não cabe nos bytes). É o payload que separa as duas medidas — na unidade errada, os
   * casos abaixo passariam sem provar nada.
   */
  const ACENTUADO = {
    versao: 1,
    temas: {},
    checkpoints: {},
    questoes: {},
    diasAtivos: [],
    enchimento: 'á'.repeat(600_000),
  }

  /**
   * Um vetor de strings curtas: o compacto tem 700 kB e o indentado (2 espaços) tem 1,5 MB, porque
   * cada item ganha linha nova e recuo. É o payload que separa as duas PORTAS — o `gravar` escreve
   * o compacto e o `exportar` escreve o indentado, e conferir uma medida pela outra deixaria sair
   * um arquivo acima do teto.
   */
  const CABE_COMPACTO = {
    versao: 1,
    temas: {},
    checkpoints: {},
    questoes: {},
    diasAtivos: [],
    itens: Array.from({ length: 175_000 }, () => 'a'),
  }

  /** Os `Blob` que o `exportar` mandou baixar e as âncoras que ele clicou. */
  const baixados: Blob[] = []
  const ancoras: HTMLAnchorElement[] = []

  // O jsdom (25) não implementa `URL.createObjectURL`, `URL.revokeObjectURL` nem o `Blob.text()`, e
  // o `click()` da âncora tentaria uma navegação que ele também não faz. Os três entram com o que o
  // navegador faria, e o `Blob` de cada download fica guardado: ele é o arquivo que o teste lê.
  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: (arquivo: Blob) => {
        baixados.push(arquivo)
        return `blob:${baixados.length}`
      },
    })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: () => {} })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      ancoras.push(this)
    })
  })

  afterAll(() => {
    vi.restoreAllMocks()
    delete (URL as unknown as Record<string, unknown>)['createObjectURL']
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL']
  })

  beforeEach(() => {
    baixados.length = 0
    ancoras.length = 0
  })

  /** O conteúdo do `Blob` pelo `FileReader`, que o jsdom tem (o `Blob.text()` não). */
  function lerBlob(arquivo: Blob): Promise<string> {
    return new Promise<string>((resolver, rejeitar) => {
      const leitor = new FileReader()
      leitor.onerror = () => rejeitar(new Error('não consegui ler o arquivo do download'))
      leitor.onload = () => resolver(String(leitor.result))
      leitor.readAsText(arquivo)
    })
  }

  it('mede em bytes, e não em unidades de código, como o processo principal', () => {
    const texto = 'á'.repeat(1000)
    expect(texto.length).toBe(1000)
    // O `Blob` conta os bytes da codificação UTF-8 — a mesma unidade do `Buffer.byteLength` do
    // desktop e do `size` do `File` que a importação confere.
    expect(new Blob([texto]).size).toBe(Buffer.byteLength(texto, 'utf8'))
    expect(new Blob([texto]).size).toBe(2000)
  })

  it('recusa gravar acima do teto, com a mensagem do desktop, sem tocar no que estava guardado', async () => {
    const texto = JSON.stringify(ACENTUADO)
    expect(texto.length).toBeLessThan(TETO_BYTES)
    expect(Buffer.byteLength(texto, 'utf8')).toBeGreaterThan(TETO_BYTES)

    window.localStorage.setItem(CHAVE, JSON.stringify(ESTADO))
    await expect(persistencia().gravar(ACENTUADO)).rejects.toThrow(MENSAGEM_GRANDE)
    // A recusa não deixa resto: o guardado é o de antes, e não um pedaço do que foi recusado.
    expect(window.localStorage.getItem(CHAVE)).toBe(JSON.stringify(ESTADO))
  })

  it('recusa exportar acima do teto, com a mensagem do desktop, antes de criar o arquivo', async () => {
    const resultado = await persistencia().exportar(ACENTUADO)

    expect(resultado).toEqual({ estado: 'erro', mensagem: MENSAGEM_GRANDE })
    // Nada foi baixado: a recusa vem antes do arquivo existir, e não depois de a pessoa já tê-lo.
    expect(baixados).toHaveLength(0)
    expect(ancoras).toHaveLength(0)
  })

  it('recusa o que cabe compacto e não cabe indentado: a medida é sobre o texto que vai ao disco', async () => {
    const compacto = JSON.stringify(CABE_COMPACTO)
    const indentado = JSON.stringify(CABE_COMPACTO, null, 2)
    expect(Buffer.byteLength(compacto, 'utf8')).toBeLessThan(TETO_BYTES)
    expect(Buffer.byteLength(indentado, 'utf8')).toBeGreaterThan(TETO_BYTES)

    // O `gravar` escreve o compacto: cabe, e é ele que vai para o armazenamento.
    await persistencia().gravar(CABE_COMPACTO)
    expect(window.localStorage.getItem(CHAVE)).toBe(compacto)

    // O `exportar` escreve o indentado: não cabe. Se a conferência medisse o compacto (o mesmo
    // dado, outro texto), este arquivo sairia com 1,5 MB — e a importação recusaria o arquivo que
    // o próprio aplicativo acabou de gerar.
    await expect(persistencia().exportar(CABE_COMPACTO)).resolves.toEqual({
      estado: 'erro',
      mensagem: MENSAGEM_GRANDE,
    })
    expect(baixados).toHaveLength(0)
  })

  it('exporta o que cabe, e o arquivo é o texto indentado que a importação aceita de volta', async () => {
    const resultado = await persistencia().exportar(ESTADO)

    expect(resultado).toEqual({ estado: 'ok' })
    expect(ancoras).toHaveLength(1)
    expect(ancoras[0]?.download).toBe('roadmap-progresso.json')
    expect(baixados).toHaveLength(1)
    const arquivo = baixados[0]!
    expect(arquivo.size).toBeLessThanOrEqual(TETO_BYTES)
    expect(await lerBlob(arquivo)).toBe(JSON.stringify(ESTADO, null, 2))
  })
})
