// Ponte entre a interface e o sistema. Expoe uma lista fechada de canais: nada de
// `ipcRenderer` cru, nada de Node no renderer.
//
// Com `sandbox: true` este arquivo e CommonJS e so pode usar um subconjunto do Node —
// por isso o build sai em .cjs.

import { contextBridge, ipcRenderer } from 'electron'
import type { PonteDoApp } from '../src/infrastructure/storage/ponte'

const CANAIS = {
  versao: 'app:versao',
  ler: 'progresso:ler',
  gravar: 'progresso:gravar',
  apagar: 'progresso:apagar',
  importar: 'progresso:importar',
  exportar: 'progresso:exportar',
  acaoDeMenu: 'menu:acao',
} as const

// `satisfies` faz o compilador conferir esta superficie contra o contrato que o renderer
// consome. Sem isso, acrescentar um canal aqui ou trocar o formato de retorno no processo
// principal passava batido: `ipcRenderer.invoke` devolve `any`.
const ponte = {
  versao: () => ipcRenderer.invoke(CANAIS.versao) as Promise<string>,
  progresso: {
    ler: () => ipcRenderer.invoke(CANAIS.ler) as Promise<unknown | null>,
    gravar: (valor: unknown) => ipcRenderer.invoke(CANAIS.gravar, valor) as Promise<void>,
    apagar: () => ipcRenderer.invoke(CANAIS.apagar) as Promise<void>,
    /** Abre o dialogo do sistema e devolve o arquivo escolhido, ja parseado. */
    importar: () => ipcRenderer.invoke(CANAIS.importar) as ReturnType<PonteDoApp['progresso']['importar']>,
    /** Abre o dialogo do sistema e grava o estado atual no arquivo escolhido. */
    exportar: (valor: unknown) =>
      ipcRenderer.invoke(CANAIS.exportar, valor) as ReturnType<PonteDoApp['progresso']['exportar']>,
  },
  aoEscolherNoMenu: (ouvinte: (acao: string) => void) => {
    ipcRenderer.on(CANAIS.acaoDeMenu, (_evento, acao: unknown) => {
      if (typeof acao === 'string') ouvinte(acao)
    })
  },
} satisfies PonteDoApp

contextBridge.exposeInMainWorld('roadmap', ponte)
