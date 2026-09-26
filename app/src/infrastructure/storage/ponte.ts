// Ponte exposta pelo processo principal do aplicativo desktop.
//
// O preload publica uma lista fechada de canais; quando ela nao existe, o app esta
// rodando num navegador e a persistencia cai no armazenamento local.

export interface ResultadoDeExportacao {
  estado: 'cancelado' | 'ok' | 'erro'
  /** Caminho escolhido, quando deu certo. */
  caminho?: string
  mensagem?: string
}

export type ResultadoDeImportacao =
  | { estado: 'cancelado' }
  | { estado: 'ok'; dado: unknown }
  | { estado: 'erro'; mensagem: string }

export interface PonteDoApp {
  versao(): Promise<string>
  progresso: {
    ler(): Promise<unknown | null>
    gravar(valor: unknown): Promise<void>
    apagar(): Promise<void>
    importar(): Promise<ResultadoDeImportacao>
    exportar(valor: unknown): Promise<ResultadoDeExportacao>
  }
  aoEscolherNoMenu(ouvinte: (acao: string) => void): void
}

declare global {
  interface Window {
    roadmap?: PonteDoApp
  }
}

export function ponte(): PonteDoApp | null {
  return typeof window !== 'undefined' && window.roadmap ? window.roadmap : null
}
