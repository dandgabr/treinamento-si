// O `medir` e o unico script de artefato que MEDE o pacote, e metade dos numeros dele vem de
// FORA do binario: o O4 sai do `dist-desktop/` da arvore (o `index.html` e os chunks que ele
// declara carregar, o `conteudo.json`) enquanto o O1/O5/O6 saem do aplicativo que ele abriu.
// Sem portao de frescor, o relatorio mede dois builds ao mesmo tempo e anuncia o numero de um
// pacote que ninguem recebeu.
//
// O cenario monta um `app/` de mentira com um `app.asar` de verdade e roda o script — a recusa
// acontece antes de `abrirApp`, entao nenhum Electron abre aqui. Quando o portao abre, o
// processo segue e estoura ao tentar abrir o "binario" (um script que sai na hora): e a
// presenca do marcador dele, e nao a ausencia da mensagem, que prova que o portao abriu.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPackage } from '@electron/asar'
import { afterEach, describe, expect, it } from 'vitest'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const NODE_MODULES = path.join(APP, 'node_modules')

/** O que entra no asar; `dist/` e `build/` ficam de fora e nao entram nesta conferencia. */
const FONTES_DO_PACOTE = [
  'dist-desktop/index.html',
  'dist-desktop/conteudo.json',
  'dist-electron/main.cjs',
  'package.json',
]

/** O que o "binario" de mentira imprime ao ser aberto: a prova de que o `abrirApp` foi tentado. */
const MARCADOR = 'binario-de-mentira-31415'

const temporarios: string[] = []

afterEach(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

interface Cenario {
  raiz: string
  asar: string
}

function datar(caminho: string, segundos: number): void {
  const quando = new Date(Date.parse('2026-01-01T00:00:00.000Z') + segundos * 1000)
  fs.utimesSync(caminho, quando, quando)
}

function escrever(caminho: string, texto: string, modo?: number): void {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, texto, modo === undefined ? {} : { mode: modo })
}

/** Um `app/` de mentira com o pacote pronto e as fontes do build na arvore. */
async function novoCenario(): Promise<Cenario> {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-medir-'))
  temporarios.push(raiz)

  for (const arquivo of ['medir-desktop.mjs', 'lib/binario.mjs', 'lib/frescor.mjs', 'lib/app-empacotado.mjs']) {
    const destino = path.join(raiz, 'scripts', arquivo)
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    fs.copyFileSync(path.join(AQUI, arquivo), destino)
  }
  fs.symlinkSync(NODE_MODULES, path.join(raiz, 'node_modules'), 'dir')

  for (const relativo of FONTES_DO_PACOTE) {
    escrever(path.join(raiz, relativo), `conteudo de ${relativo}`)
  }
  // O `package.json` entra no asar e e o que o Node le para resolver o modulo: aqui ele
  // precisa ser JSON de verdade.
  escrever(path.join(raiz, 'package.json'), `${JSON.stringify({ name: 'pacote-de-teste', version: '0.1.0' })}\n`)

  const fonte = path.join(raiz, 'fonte-do-asar')
  for (const relativo of FONTES_DO_PACOTE) {
    escrever(path.join(fonte, relativo), `copia de ${relativo} dentro do asar`)
  }
  const asar = path.join(raiz, 'instalador/linux-unpacked/resources/app.asar')
  fs.mkdirSync(path.dirname(asar), { recursive: true })
  await createPackage(fonte, asar)

  // O binario do pacote: maior executavel da pasta (criterio do `binarioEm`) e sai na hora,
  // gritando o marcador — e o que o teste observa quando o portao abre.
  escrever(
    path.join(raiz, 'instalador/linux-unpacked/roadmap-ciso-app'),
    `#!/bin/sh\necho ${MARCADOR} >&2\nexit 3\n`,
    0o755,
  )

  return { raiz, asar }
}

interface Execucao {
  status: number
  saida: string
}

function rodar(cenario: Cenario): Execucao {
  const r = spawnSync(process.execPath, [path.join(cenario.raiz, 'scripts', 'medir-desktop.mjs')], {
    cwd: cenario.raiz,
    encoding: 'utf8',
  })
  return { status: r.status ?? -1, saida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

function datarFontes(cenario: Cenario, segundos: number): void {
  for (const relativo of FONTES_DO_PACOTE) {
    datar(path.join(cenario.raiz, relativo), segundos)
  }
}

describe('medir-desktop: recusa medir um pacote que nao e o build desta arvore', () => {
  it('para quando as fontes do pacote sao mais novas que o asar', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    datarFontes(c, -600)
    // O `dist-desktop/index.html` e de onde sai o O4: mais novo que o pacote, o relatorio
    // anunciaria o HTML de um build que ninguem recebeu.
    datar(path.join(c.raiz, 'dist-desktop/index.html'), 600)

    const r = rodar(c)

    expect(r.status).toBe(1)
    expect(r.saida).toContain('Artefato desatualizado')
    expect(r.saida).toContain('dist-desktop/index.html')
    // Duas coisas que nao podem ter acontecido: abrir o aplicativo e anunciar numero.
    expect(r.saida).not.toContain(MARCADOR)
    expect(r.saida).not.toContain('O4  o HTML declara')
  })

  it('mede quando o pacote e o mais novo da arvore', async () => {
    const c = await novoCenario()
    datarFontes(c, 0)
    datar(c.asar, 600)

    const r = rodar(c)

    expect(r.saida).not.toContain('Artefato desatualizado')
    // Passou do portao e foi abrir o binario: o marcador dele esta na saida.
    expect(r.saida).toContain(MARCADOR)
  })
})
