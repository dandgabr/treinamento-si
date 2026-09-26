// Ponte entre a interface e o sistema. Expoe uma lista fechada de canais: nada de
// `ipcRenderer` cru, nada de Node no renderer.
//
// Com `sandbox: true` este arquivo e CommonJS e so pode usar um subconjunto do Node —
// por isso o build sai em .cjs.

import { contextBridge, ipcRenderer } from 'electron'

const CANAIS = {
  versao: 'app:versao',
  ler: 'progresso:ler',
  gravar: 'progresso:gravar',
  apagar: 'progresso:apagar',
  importar: 'progresso:importar',
  exportar: 'progresso:exportar',
  acaoDeMenu: 'menu:acao',
} as const

contextBridge.exposeInMainWorld('roadmap', {
  versao: () => ipcRenderer.invoke(CANAIS.versao),
  progresso: {
    ler: () => ipcRenderer.invoke(CANAIS.ler),
    gravar: (valor: unknown) => ipcRenderer.invoke(CANAIS.gravar, valor),
    apagar: () => ipcRenderer.invoke(CANAIS.apagar),
    /** Abre o dialogo do sistema e devolve o arquivo escolhido, ja parseado. */
    importar: () => ipcRenderer.invoke(CANAIS.importar),
    /** Abre o dialogo do sistema e grava o estado atual no arquivo escolhido. */
    exportar: (valor: unknown) => ipcRenderer.invoke(CANAIS.exportar, valor),
  },
  aoEscolherNoMenu: (ouvinte: (acao: string) => void) => {
    ipcRenderer.on(CANAIS.acaoDeMenu, (_evento, acao: unknown) => {
      if (typeof acao === 'string') ouvinte(acao)
    })
  },
})
