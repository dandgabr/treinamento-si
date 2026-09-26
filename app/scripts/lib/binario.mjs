// Localizar o binario dentro do que o electron-builder empacotou.
//
// Nao repetir a regra de nomenclatura: ela varia por sistema (no macOS a raiz e um `.app`)
// e por versao do electron-builder — no Linux ele usa o `name` do package.json, e nao o
// `productName`. O maior executavel da pasta e o proprio Electron (186 MB contra ~2 MB dos
// ajudantes), entao o tamanho identifica o alvo sem depender de convencao.

import fs from 'node:fs'
import path from 'node:path'

export function binarioEm(appOutDir, plataforma = process.platform) {
  if (plataforma === 'darwin' || plataforma === 'darwin-arm64') {
    const bundle = fs.readdirSync(appOutDir).find((nome) => nome.endsWith('.app'))
    if (!bundle) throw new Error(`sem .app em ${appOutDir}`)
    const dentro = path.join(appOutDir, bundle, 'Contents', 'MacOS')
    const executaveis = fs.readdirSync(dentro)
    if (!executaveis.length) throw new Error(`sem binario em ${dentro}`)
    return path.join(dentro, executaveis[0])
  }

  const candidatos = fs
    .readdirSync(appOutDir, { withFileTypes: true })
    .filter((e) => e.isFile() && (plataforma !== 'win32' || e.name.endsWith('.exe')))
    .map((e) => path.join(appOutDir, e.name))
    .flatMap((caminho) => {
      try {
        fs.accessSync(caminho, fs.constants.X_OK)
        return [{ caminho, tamanho: fs.statSync(caminho).size }]
      } catch {
        return []
      }
    })
    .sort((a, b) => b.tamanho - a.tamanho)

  if (!candidatos.length) throw new Error(`sem executavel em ${appOutDir}`)
  return candidatos[0].caminho
}
