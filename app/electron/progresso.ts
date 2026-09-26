// Guarda o progresso num arquivo na pasta de dados do aplicativo.
//
// E o motivo principal de existir a versao desktop: o estado sai do armazenamento do
// navegador (por origem, compartilhado no file:// do Chromium, apagavel junto com os
// dados de navegacao) e vira um arquivo que a pessoa pode copiar, restaurar e ler.

import { app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

const NOME = 'progresso.json'
/** Teto generoso: o estado cheio passa longe disso, e o arquivo vem de fora. */
export const TETO_BYTES = 1024 * 1024

export function caminhoDoProgresso(): string {
  return path.join(app.getPath('userData'), NOME)
}

export async function lerProgresso(): Promise<unknown | null> {
  const caminho = caminhoDoProgresso()
  try {
    const informacao = await fs.stat(caminho)
    if (informacao.size > TETO_BYTES) return null
    return JSON.parse(await fs.readFile(caminho, 'utf8'))
  } catch {
    // Arquivo ausente, ilegivel ou JSON quebrado: comeca vazio, sem derrubar o app.
    return null
  }
}

export async function gravarProgresso(valor: unknown): Promise<void> {
  const texto = JSON.stringify(valor)
  if (texto.length > TETO_BYTES) throw new Error('progresso grande demais para gravar')
  const caminho = caminhoDoProgresso()
  const temporario = `${caminho}.tmp`
  await fs.mkdir(path.dirname(caminho), { recursive: true })
  await fs.writeFile(temporario, texto, 'utf8')
  // Renomear e atomico: nunca fica um arquivo pela metade se o app fechar no meio.
  await fs.rename(temporario, caminho)
}

export async function apagarProgresso(): Promise<void> {
  await fs.rm(caminhoDoProgresso(), { force: true })
}
