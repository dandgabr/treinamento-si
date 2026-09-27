// Onde o progresso mora. Dois provedores com o mesmo contrato: o aplicativo desktop
// grava num arquivo, e o navegador cai no armazenamento local.
//
// A escolha e feita pela presenca da ponte, entao o mesmo codigo de interface serve aos
// dois — e o teste de navegador continua valendo para o renderer.

import { MENSAGEM_GRANDE, TETO_BYTES } from './limites'
import { gravarTexto, lerTextoOuNegado, removerTexto } from './local'
import { ponte, type ResultadoDeExportacao, type ResultadoDeImportacao } from './ponte'

export const CHAVE = 'roadmap:progresso'

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

/**
 * A leitura do progresso GUARDADO: ausente devolve `null`, ilegivel LANCA.
 *
 * O `null` de `analisar` serve a importacao — um arquivo que veio de fora: "nao e JSON valido" e
 * mensagem de erro na tela, nao falha de sessao. A carga do estudo precisa da distincao oposta:
 * `null` la autoriza a proxima gravacao, entao so a chave AUSENTE pode devolver `null` — a
 * primeira vez, em que gravar por cima nao destroi nada. Conteudo que existe e nao abre como JSON
 * e lancado, e o store trata o lancamento como "nao consegui ler": sessao em memoria, sem gravar
 * por cima. E o mesmo contrato do desktop (`electron/progresso.ts`, `lerProgresso`), que ja lanca
 * para arquivo corrompido; no navegador as tres situacoes colapsavam em `null`.
 */
function analisarGuardado(texto: string | null): unknown | null {
  if (texto === null) return null
  try {
    return JSON.parse(texto) as unknown
  } catch {
    throw new Error('o progresso guardado no navegador não é um JSON válido')
  }
}

const ARQUIVO_BAIXADO = 'roadmap-progresso.json'

/**
 * O texto que vai para o disco, com o teto conferido nos BYTES dele — a MESMA regua do processo
 * principal (`electron/progresso.ts`, `serializarConferido`), sobre o mesmo texto e com a mesma
 * mensagem.
 *
 * As duas portas que ESCREVEM um progresso no navegador passam por aqui. Antes nenhuma das duas
 * conferia nada: o `gravar` guardava no `localStorage` o que o desktop recusa ler (> 1 MB) e o
 * `exportar` gerava um arquivo que o proprio `importar` daqui recusava com "O arquivo passa de
 * 1 MB." — o "backup que nao volta", no irmao do defeito que o teto do desktop ja fechou.
 *
 * O `espaco` separa as duas portas como no desktop: o arquivo guardado sai compacto e o exportado
 * sai indentado, porque o exportado e para uma pessoa ler. A conferencia e sobre o texto que
 * REALMENTE vai para o disco — medir o compacto e gravar o indentado deixaria sair um arquivo
 * acima do teto, o mesmo defeito um passo adiante.
 *
 * O tamanho em bytes vem do `Blob` porque no renderer nao ha `Buffer.byteLength`: o `Blob` conta
 * os bytes da codificacao UTF-8, a mesma unidade da conferencia do desktop (e a mesma do `size` do
 * `File` conferido na importacao abaixo). O `length` da string conta unidades de codigo: 600 mil
 * caracteres acentuados tem 600 mil unidades e 1,2 MB.
 */
function serializarConferido(valor: unknown, espaco?: number): string {
  const texto = JSON.stringify(valor, null, espaco)
  if (typeof texto !== 'string') throw new Error('progresso invalido')
  if (new Blob([texto]).size > TETO_BYTES) throw new Error(MENSAGEM_GRANDE)
  return texto
}

const noNavegador: Persistencia = {
  descricao: 'no armazenamento deste navegador',
  // Leitura que distingue as tres situacoes: chave ausente (primeira vez, devolve `null`),
  // armazenamento negado e JSON corrompido (as duas LANÇAM). Antes as tres viravam `null`, e o
  // store — que so desliga a gravacao quando a carga rejeita — gravava por cima do arquivo
  // corrompido no primeiro clique, perdendo o progresso inteiro.
  carregar: async () => {
    const leitura = lerTextoOuNegado(CHAVE)
    if (leitura.estado === 'negado') {
      throw new Error('o armazenamento deste navegador negou o acesso ao progresso guardado')
    }
    return analisarGuardado(leitura.texto)
  },
  gravar: async (valor) => {
    // Mesma regua do desktop, e pelo mesmo motivo: o que passa do teto nao entra no
    // armazenamento. Guardar 1,2 MB aqui e gravar um progresso que nem esta via nem a do arquivo
    // consegue abrir de volta. O `async` e o que faz a recusa chegar como rejeicao (o store trata
    // a falha de gravacao), e nao como lancamento de uma funcao que promete uma promessa.
    gravarTexto(CHAVE, serializarConferido(valor))
  },
  apagar: () => {
    removerTexto(CHAVE)
    return Promise.resolve()
  },
  exportar: (valor) => {
    // O teto e conferido ANTES do arquivo existir, e sobre o texto indentado que vai para ele: nao
    // adianta baixar um progresso que a importacao (a daqui e a do processo principal) recusa —
    // mesmo teto e mesma mensagem do `gravar`, pela mesma funcao.
    let texto: string
    try {
      texto = serializarConferido(valor, 2)
    } catch (erro) {
      return Promise.resolve({
        estado: 'erro' as const,
        mensagem: erro instanceof Error ? erro.message : MENSAGEM_GRANDE,
      })
    }
    const tipo = 'application/json'
    const arquivo = new Blob([texto], { type: tipo })
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
