// Abrir o aplicativo EMPACOTADO e falar com ele por CDP.
//
// Nao usa `_electron.launch` do Playwright de proposito: ele depende de
// `ELECTRON_RUN_AS_NODE`, que e exatamente o fuse que desligamos no pacote. A conexao por
// CDP abre o aplicativo como qualquer pessoa abriria — o que torna a verificacao mais fiel,
// nao menos. Vive aqui porque o smoke e a medicao precisam do mesmo encanamento.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

async function portaDeDepuracao(pastaDados, proc, saida) {
  const arquivo = path.join(pastaDados, 'DevToolsActivePort')
  const limite = Date.now() + 20_000
  while (Date.now() < limite) {
    if (proc.exitCode !== null) throw new Error(`o aplicativo saiu com codigo ${proc.exitCode}\n${saida()}`)
    if (fs.existsSync(arquivo)) {
      const porta = Number(fs.readFileSync(arquivo, 'utf8').split('\n')[0])
      if (Number.isInteger(porta) && porta > 0) return porta
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`o aplicativo nao abriu a porta de depuracao em 20 s\n${saida()}`)
}

async function paginaDoApp(navegador, saida) {
  for (let i = 0; i < 100; i++) {
    for (const contexto of navegador.contexts()) {
      for (const pagina of contexto.pages()) {
        if (pagina.url().startsWith('app://')) return pagina
      }
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  throw new Error(`nenhuma pagina em app://\n${saida()}`)
}

/** Abre o binario e devolve a janela; `encerrar()` mata a arvore e apaga o perfil. */
export async function abrirApp(binario, argumentos = []) {
  const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-app-'))
  const proc = spawn(
    binario,
    ['--no-sandbox', `--user-data-dir=${dados}`, '--remote-debugging-port=0', ...argumentos],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  )
  let acumulado = ''
  proc.stderr.on('data', (d) => {
    acumulado += String(d)
  })
  const saida = () => acumulado

  const porta = await portaDeDepuracao(dados, proc, saida)
  const navegador = await chromium.connectOverCDP(`http://127.0.0.1:${porta}`)
  const janela = await paginaDoApp(navegador, saida)

  async function encerrar() {
    const terminou = new Promise((resolver) => {
      if (proc.exitCode !== null) resolver()
      else proc.once('exit', resolver)
    })
    try {
      proc.kill('SIGTERM')
    } catch {
      // Ja morreu.
    }
    // Esperar a saida antes de apagar: os filhos (zygote, GPU) ainda escrevem no perfil por
    // alguns milissegundos e recriam a pasta recem-removida.
    await Promise.race([terminou, new Promise((r) => setTimeout(r, 3000))])
    if (proc.exitCode === null) {
      try {
        proc.kill('SIGKILL')
      } catch {
        // Nada mais a fazer.
      }
    }
    fs.rmSync(dados, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }

  return { janela, encerrar, dados }
}
