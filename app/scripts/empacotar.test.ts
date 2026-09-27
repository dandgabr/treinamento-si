// `empacotar.mjs` e o `release.mjs` eram os dois scripts sem teste: o `smoke-pasta` exercita o
// `empacotar` de verdade, mas so depois de um `npm run build` — e o que ele nao alcanca e o que
// este arquivo cobre: a recusa quando falta o build, a limpeza da pasta antes de montar e a
// conversao de fim de linha do `.bat`, que ali passaria por acaso num checkout que ja viesse
// com CRLF.
//
// A pasta do projeto sai da localizacao do proprio script, entao ele roda num `app/` de mentira,
// com um `dist/index.html` e um `launcher/` sinteticos — este ultimo em LF de proposito, que e
// o que o pacote tem de converter.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/** Os atalhos que o launcher entrega, com o conteudo sintetico que cada um precisa ter. */
const LAUNCHER: Record<string, string> = {
  'Iniciar-Linux.sh': '#!/bin/sh\nexec python3 servidor.py\n',
  'Iniciar-macOS.command': '#!/bin/sh\nexec python3 servidor.py\n',
  // O `cmd.exe` le CRLF: no repositorio este arquivo esta em LF (o `.gitattributes` converte
  // no checkout), e quem monta o pacote e quem converte.
  'Iniciar-Windows.bat': '@echo off\npython servidor.py\n',
  'LEIA-ME.txt': 'Abra o atalho Iniciar.\n',
  'servidor.py': 'print("no ar")\n',
}

const ESPERADOS = [...Object.keys(LAUNCHER), 'index.html'].sort()

const temporarios: string[] = []

afterEach(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

interface Cenario {
  raiz: string
  pacote: string
}

function escrever(caminho: string, texto: string): void {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, texto)
}

function novoCenario(comBuild = true): Cenario {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-empacotar-'))
  temporarios.push(raiz)

  escrever(
    path.join(raiz, 'scripts/empacotar.mjs'),
    fs.readFileSync(path.join(AQUI, 'empacotar.mjs'), 'utf8'),
  )
  for (const [nome, conteudo] of Object.entries(LAUNCHER)) {
    escrever(path.join(raiz, 'launcher', nome), conteudo)
  }
  if (comBuild) escrever(path.join(raiz, 'dist/index.html'), '<html>build</html>')

  return { raiz, pacote: path.join(raiz, 'dist/Roadmap-CISO-Interativo') }
}

interface Execucao {
  status: number
  saida: string
}

function rodar(cenario: Cenario): Execucao {
  const r = spawnSync(process.execPath, [path.join(cenario.raiz, 'scripts/empacotar.mjs')], {
    cwd: cenario.raiz,
    encoding: 'utf8',
  })
  return { status: r.status ?? -1, saida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

describe('empacotar: a pasta que vai para quem estuda', () => {
  it('monta a pasta com o build, os cinco arquivos de abertura e os atalhos prontos para uso', () => {
    const c = novoCenario()

    const r = rodar(c)

    expect(r.status).toBe(0)
    expect(r.saida).toContain('pacote montado: dist/Roadmap-CISO-Interativo')
    // O conjunto inteiro, e nao so a existencia de um arquivo: um atalho esquecido no meio do
    // caminho nao pode passar.
    expect(fs.readdirSync(c.pacote).sort()).toEqual(ESPERADOS)
    expect(fs.readFileSync(path.join(c.pacote, 'index.html'), 'utf8')).toBe('<html>build</html>')
  })

  it('entrega o .bat em CRLF e os atalhos de Unix em LF', () => {
    const c = novoCenario()
    expect(rodar(c).status).toBe(0)

    // O `.bat` em LF faz o `cmd.exe` nao reconhecer o `goto :fallback` do atalho. As duas
    // conferencias se completam: o `includes` reprova um arquivo vazio, e a volta para LF
    // (que sozinha passaria por "tem CRLF" num arquivo com as duas quebras) tambem reprova.
    const bat = fs.readFileSync(path.join(c.pacote, 'Iniciar-Windows.bat'), 'utf8')
    expect(bat).toContain('\r\n')
    expect(bat.split('\r\n').join('').includes('\n')).toBe(false)

    // E o contrario nos de Unix: com CRLF o kernel procuraria `/bin/sh^M` e o duplo clique nao
    // abriria nada. Prova que a conversao do `.bat` nao vazou para eles.
    for (const nome of ['Iniciar-Linux.sh', 'Iniciar-macOS.command']) {
      expect(fs.readFileSync(path.join(c.pacote, nome), 'utf8').includes('\r')).toBe(false)
    }
  })

  it('marca os tres executaveis e deixa os outros como estavam', () => {
    const c = novoCenario()
    expect(rodar(c).status).toBe(0)

    // Os dois atalhos de Unix e o servidor sao abertos por duplo clique: sem o bit de execucao
    // eles nao abrem, e esta via depende exatamente disso.
    for (const nome of ['Iniciar-Linux.sh', 'Iniciar-macOS.command', 'servidor.py']) {
      expect(fs.statSync(path.join(c.pacote, nome)).mode & 0o111).not.toBe(0)
    }
    // Texto de leitura nao precisa — e nao deve — ser executavel.
    expect(fs.statSync(path.join(c.pacote, 'LEIA-ME.txt')).mode & 0o111).toBe(0)
  })

  it('recusa sem o build, e diz qual comando rodar', () => {
    const c = novoCenario(false)

    const r = rodar(c)

    expect(r.status).toBe(1)
    expect(r.saida).toContain('Falta dist/index.html. Rode antes: npm run build')
    // Nada foi montado: a pasta so nasce depois da conferencia.
    expect(fs.existsSync(c.pacote)).toBe(false)
  })

  it('limpa a pasta antes de montar, em vez de misturar com o pacote anterior', () => {
    const c = novoCenario()
    // Sobra de um pacote antigo: sem o `rmSync`, ela viajaria junto com o novo.
    escrever(path.join(c.pacote, 'velho.txt'), 'sobra do pacote anterior')
    escrever(path.join(c.pacote, 'index.html'), '<html>build de ontem</html>')

    const r = rodar(c)

    expect(r.status).toBe(0)
    expect(fs.existsSync(path.join(c.pacote, 'velho.txt'))).toBe(false)
    expect(fs.readFileSync(path.join(c.pacote, 'index.html'), 'utf8')).toBe('<html>build</html>')
  })
})
