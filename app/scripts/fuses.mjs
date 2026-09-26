// Endurecimento do binario empacotado, rodado pelo `afterPack` do electron-builder.
//
// O Electron distribui o binario com comodidades de desenvolvimento ligadas: aceitar
// `--inspect`, ler `NODE_OPTIONS` do ambiente e rodar como Node puro. Nada disso serve ao
// aplicativo e todas ampliam a superficie — um atalho no Windows apontando para o nosso
// executavel com `--require` carrega codigo de terceiro dentro do processo.
//
// `EnableEmbeddedAsarIntegrityValidation` so e aplicado onde o Electron suporta (macOS e
// Windows); no Linux a chave fica gravada mas nao ha verificacao. `OnlyLoadAppFromAsar`
// vale em todos: o app nao roda a partir de uma pasta extraida.

import path from 'node:path'
import {
  flipFuses,
  FuseState,
  FuseV1Options,
  FuseVersion,
  getCurrentFuseWire,
} from '@electron/fuses'
import { binarioEm } from './lib/binario.mjs'

const FUSES = {
  [FuseV1Options.RunAsNode]: false,
  [FuseV1Options.EnableCookieEncryption]: true,
  [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
  [FuseV1Options.EnableNodeCliInspectArguments]: false,
  [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
  [FuseV1Options.OnlyLoadAppFromAsar]: true,
  // Vem ligado no Electron e nao serve aqui: o app nunca abre `file://` (a navegacao para
  // fora e bloqueada e o conteudo vem de `app://`). Desligar reduz o estrago se aquela
  // trava regredir algum dia.
  [FuseV1Options.GrantFileProtocolExtraPrivileges]: false,
}

/**
 * O caminho do binario muda por sistema, por formato (no macOS a raiz e um `.app`) e pela
 * versao do electron-builder — no Linux ele usa o `name` do package.json, e nao o
 * productName, entao `roadmap-ciso-app` e nao `roadmap-ciso`. A busca vive em
 * `lib/binario.mjs`, compartilhada com o smoke do pacote.
 */

export default async function afterPack(context) {
  const binario = binarioEm(context.appOutDir, context.electronPlatformName)
  await flipFuses(binario, { version: FuseVersion.V1, ...FUSES })

  // Confere o que foi gravado: uma lista de fuses que nao chegou ao binario e uma
  // promessa vazia no README. O `getCurrentFuseWire` devolve o estado como numero
  // (`FuseState.ENABLE` = 49, `DISABLE` = 48), nao como booleano.
  const gravado = await getCurrentFuseWire(binario)
  const divergentes = Object.entries(FUSES).filter(([chave, valor]) => {
    const esperado = valor ? FuseState.ENABLE : FuseState.DISABLE
    return gravado[chave] !== esperado
  })
  if (divergentes.length) {
    throw new Error(
      `fuses nao aplicados em ${binario}: ` +
        divergentes.map(([chave]) => `${chave}=${gravado[chave]}`).join(', '),
    )
  }
  console.log(`fuses aplicados em ${path.basename(binario)} (${Object.keys(FUSES).length} chaves)`)
}
