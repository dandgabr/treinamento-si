// Onde o progresso mora. Dois provedores com o mesmo contrato: o aplicativo desktop
// grava num arquivo, e o navegador cai no armazenamento local.
//
// A escolha e feita pela presenca da ponte, entao o mesmo codigo de interface serve aos
// dois — e o teste de navegador continua valendo para o renderer.

import { lerTexto, gravarTexto, removerTexto } from './local'
import { ponte, type ResultadoDeExportacao, type ResultadoDeImportacao } from './ponte'

export const CHAVE = 'roadmap:progresso'
/** Mesmo teto do lado do processo principal, para o navegador recusar igual. */
const TETO_BYTES = 1024 * 1024

export interface Persistencia {
  descricao: string
  carregar(): Promise<unknown | null>
  gravar(valor: unknown): Promise<void>
  apagar(): Promise<void>
  exportar(valor: unknown): Promise<ResultadoDeExportacao>
  importar(): Promise<ResultadoDeImportacao>
}

function analisar(texto: string | null): unknown | null {
  if (!texto) return null
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return null
  }
}

const ARQUIVO_BAIXADO = 'roadmap-progresso.json'

const noNavegador: Persistencia = {
  descricao: 'no armazenamento deste navegador',
  carregar: () => Promise.resolve(analisar(lerTexto(CHAVE))),
  gravar: (valor) => {
    gravarTexto(CHAVE, JSON.stringify(valor))
    return Promise.resolve()
  },
  apagar: () => {
    removerTexto(CHAVE)
    return Promise.resolve()
  },
  exportar: (valor) => {
    const tipo = 'application/json'
    const arquivo = new Blob([JSON.stringify(valor, null, 2)], { type: tipo })
    const endereco = URL.createObjectURL(arquivo)
    const ligacao = document.createElement('a')
    ligacao.href = endereco
    ligacao.download = ARQUIVO_BAIXADO
    ligacao.click()
    URL.revokeObjectURL(endereco)
    return Promise.resolve({ estado: 'ok' } as const)
  },
  importar: () =>
    new Promise<ResultadoDeImportacao>((resolver) => {
      const entrada = document.createElement('input')
      entrada.type = 'file'
      entrada.accept = 'application/json,.json'
      entrada.onchange = () => {
        const arquivo = entrada.files?.[0]
        if (!arquivo) {
          resolver({ estado: 'cancelado' })
          return
        }
        if (arquivo.size > TETO_BYTES) {
          resolver({ estado: 'erro', mensagem: 'O arquivo passa de 1 MB.' })
          return
        }
        void arquivo.text().then(
          (texto) => {
            const dado = analisar(texto)
            resolver(dado === null ? { estado: 'erro', mensagem: 'O arquivo não é um JSON válido.' } : { estado: 'ok', dado })
          },
          () => resolver({ estado: 'erro', mensagem: 'Não consegui ler o arquivo.' }),
        )
      }
      entrada.click()
    }),
}

function criarNoApp(): Persistencia {
  const api = ponte()
  if (!api) throw new Error('ponte ausente')
  return {
    descricao: 'num arquivo na pasta de dados do aplicativo',
    // Sem migracao automatica do navegador: o armazenamento local vive na origem em que
    // o app esta rodando, e a do desktop e `app://bundle` — um balde proprio e vazio.
    // Ler `localStorage` daqui nunca acharia o estudo feito em `file://` ou em
    // `127.0.0.1`. O arquivo exportado e a ponte entre as duas vias.
    carregar: () => api.progresso.ler(),
    gravar: (valor) => api.progresso.gravar(valor),
    apagar: () => api.progresso.apagar(),
    exportar: (valor) => api.progresso.exportar(valor),
    importar: () => api.progresso.importar(),
  }
}

export function persistencia(): Persistencia {
  return ponte() ? criarNoApp() : noNavegador
}
