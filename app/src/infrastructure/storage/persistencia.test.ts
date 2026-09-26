// @vitest-environment jsdom
//
// A escolha do provedor e o caminho da migracao sao a parte nova e arriscada: se o
// desktop cair no armazenamento do navegador, o progresso volta a ficar fragil sem
// ninguem perceber.

import { beforeEach, describe, expect, it } from 'vitest'
import { CHAVE, persistencia } from './persistencia'
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

  it('devolve null quando o que está guardado não é JSON válido', async () => {
    window.localStorage.setItem(CHAVE, '{quebrado')
    expect(await persistencia().carregar()).toBeNull()
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
