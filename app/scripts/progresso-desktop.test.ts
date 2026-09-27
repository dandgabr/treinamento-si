// O arquivo de progresso e a fronteira de confianca do aplicativo desktop: ele vem de fora
// (importado, copiado, editado a mao) e e o unico lugar onde o estudo da pessoa existe. Estes
// testes cobrem a decisao que faltava nessa fronteira — o que e recusado, o que e "primeira vez"
// e o que e erro — e a medida do teto, que era feita em duas unidades diferentes.
//
// O `electron` e trocado por um duble porque `app.getPath('userData')` so existe dentro do
// aplicativo; a pasta de dados e um temporario proprio deste teste.
//
// O arquivo importado e testado aqui, e nao pelo smoke: o dialogo nativo (`showOpenDialog`) nao
// abre num teste, entao a leitura do caminho escolhido so e alcancavel por chamada direta.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const compartilhado = vi.hoisted(() => ({ pasta: '' }))

vi.mock('electron', () => ({
  app: { getPath: () => compartilhado.pasta },
}))

const { TETO_BYTES, caminhoDoProgresso, gravarProgresso, lerImportado, lerProgresso } = await import(
  '../electron/progresso'
)

let raiz = ''

beforeEach(() => {
  raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'progresso-desktop-'))
  compartilhado.pasta = raiz
})

afterEach(() => {
  fs.rmSync(raiz, { recursive: true, force: true })
})

/** Um progresso com `repeticoes` caracteres acentuados de enchimento. */
function comEnchimento(enchimento: string): Record<string, unknown> {
  return { versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [], enchimento }
}

/** Falha em vez de pendurar: a leitura que nunca responde e o defeito que o teto fecha. */
function comPrazo<T>(promessa: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<never>((_, rejeitar) => {
      setTimeout(() => rejeitar(new Error('a leitura não respondeu')), ms).unref()
    }),
  ])
}

describe('teto de 1 MB', () => {
  // 600 mil caracteres acentuados: o `length` passa (600 mil unidades de codigo) e o tamanho em
  // bytes nao (1,2 MB). E o payload que separa as duas medidas; se ele nao fosse assim, os
  // testes abaixo passariam por outro motivo.
  const CARACTERES = 600_000

  it('recusa gravar o payload que passa em unidades de código e estoura em bytes', async () => {
    const texto = JSON.stringify(comEnchimento('á'.repeat(CARACTERES)))
    expect(texto.length).toBeLessThan(TETO_BYTES)
    expect(Buffer.byteLength(texto, 'utf8')).toBeGreaterThan(TETO_BYTES)

    await expect(gravarProgresso(comEnchimento('á'.repeat(CARACTERES)))).rejects.toThrow(
      'grande demais',
    )
    // O recusado nao chega a virar arquivo — nem um `.tmp` orfao.
    expect(fs.readdirSync(raiz)).toEqual([])
  })

  it('aceita o mesmo payload em ASCII, com a mesma contagem de caracteres', async () => {
    const valor = comEnchimento('a'.repeat(CARACTERES))
    expect(JSON.stringify(valor).length).toBeLessThan(TETO_BYTES)

    await gravarProgresso(valor)

    // Sobrou so o arquivo do progresso: o temporario foi renomeado, e nao deixado para tras.
    expect(fs.readdirSync(raiz)).toEqual(['progresso.json'])
    expect(await lerProgresso()).toEqual(valor)
  })

  it('recusa ler um arquivo acima do teto mesmo sendo JSON válido', async () => {
    // Antes, a leitura media `stat.size` (bytes) e a gravacao media `texto.length`: o mesmo
    // estado era aprovado na escrita e recusado na leitura seguinte.
    fs.writeFileSync(caminhoDoProgresso(), JSON.stringify(comEnchimento('á'.repeat(CARACTERES))))

    await expect(lerProgresso()).rejects.toThrow('passa de 1 MB')
  })
})

describe('lerProgresso: ausente é "primeira vez", o resto é erro', () => {
  it('devolve null quando o arquivo não existe', async () => {
    expect(await lerProgresso()).toBeNull()
  })

  it('lança para JSON truncado, em vez de fingir que não havia nada guardado', async () => {
    // A leitura devolvia `null` para arquivo ausente, JSON quebrado e arquivo acima do teto. O
    // app abria com `podeGravar=true` e o primeiro clique substituia o arquivo inteiro pelo
    // estado vazio mais um clique — a perda silenciosa que este caminho precisa impedir.
    fs.writeFileSync(caminhoDoProgresso(), '{"versao":1,"temas":{"a#TEMA-01":')

    await expect(lerProgresso()).rejects.toThrow('não é um JSON válido')
  })

  it('lança quando o caminho é um diretório', async () => {
    fs.mkdirSync(caminhoDoProgresso())

    await expect(lerProgresso()).rejects.toThrow('não consegui ler o progresso guardado')
  })

  it('devolve o dado quando o arquivo está são', async () => {
    const valor = { versao: 1, temas: {}, checkpoints: {}, questoes: {}, diasAtivos: [] }
    fs.writeFileSync(caminhoDoProgresso(), JSON.stringify(valor))

    expect(await lerProgresso()).toEqual(valor)
  })
})

describe('lerImportado', () => {
  const VALIDO = '{"versao":1,"temas":{}}'

  it('lê um progresso exportado', async () => {
    const caminho = path.join(raiz, 'exportado.json')
    fs.writeFileSync(caminho, VALIDO)

    expect(await lerImportado(caminho)).toEqual({ estado: 'ok', dado: { versao: 1, temas: {} } })
  })

  it('recusa acima do teto ANTES de analisar, e o gigante nem é JSON', async () => {
    const caminho = path.join(raiz, 'gigante.json')
    fs.writeFileSync(caminho, 'a'.repeat(TETO_BYTES + 1))

    // Se o corte viesse depois do `JSON.parse`, a resposta seria "não é um JSON válido" — e o
    // arquivo gigante ja teria sido lido inteiro para memoria.
    expect(await lerImportado(caminho)).toEqual({
      estado: 'erro',
      mensagem: 'O arquivo passa de 1 MB.',
    })
  })

  it('recusa arquivo que não é comum, em vez de pendurar a leitura', async () => {
    // Diretorio, FIFO e dispositivo nao sao um progresso exportado, e os dois ultimos nem
    // tamanho tem para conferir contra o teto.
    const pasta = fs.mkdtempSync(path.join(raiz, 'pasta-'))

    expect(await comPrazo(lerImportado(pasta), 3000)).toEqual({
      estado: 'erro',
      mensagem: 'O arquivo não é um arquivo comum.',
    })
  })

  it.skipIf(!fs.existsSync('/dev/zero'))(
    'não lê um dispositivo de tamanho zero antes de conferir o que ele é',
    async () => {
      // `/dev/zero` informa `size === 0`: pelo `stat` sobre o caminho ele passava pelo teto, e o
      // `readFile` seguinte lia ate estourar o limite de string do V8 (~512 MB) para responder
      // "não é um JSON válido" — num FIFO, ele bloquearia para sempre e o handler do IPC ficaria
      // sem resposta, com a tela sem retorno nenhum. O `fstat` no descritor responde sem ler nada.
      expect(await comPrazo(lerImportado('/dev/zero'), 3000)).toEqual({
        estado: 'erro',
        mensagem: 'O arquivo não é um arquivo comum.',
      })
    },
  )

  it('recusa caminho inexistente e JSON inválido, com a mensagem de cada caso', async () => {
    const quebrado = path.join(raiz, 'quebrado.json')
    fs.writeFileSync(quebrado, '{nao}')

    expect(await lerImportado(path.join(raiz, 'nao-existe.json'))).toEqual({
      estado: 'erro',
      mensagem: 'Não consegui abrir o arquivo.',
    })
    expect(await lerImportado(quebrado)).toEqual({
      estado: 'erro',
      mensagem: 'O arquivo não é um JSON válido.',
    })
  })
})
