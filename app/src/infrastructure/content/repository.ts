import { lerConteudoBruto } from '@fonte'
import type { Conteudo } from '../../domain/types'

/**
 * Repositorio de conteudo. O JSON e gerado em build a partir do Markdown de "conteudo/"
 * (ver scripts/build-content.ts).
 *
 * De ONDE ele vem depende da build, e a diferenca esta isolada em `@fonte`:
 *   - navegador: inline no bundle, porque o artefato e um arquivo unico aberto por `file://`;
 *   - desktop: um arquivo ao lado do HTML, carregado por `app://`, para o arranque nao pagar
 *     a analise de 3,8 MB de JSON antes do primeiro render.
 *
 * A validacao de fundo pertence ao build (scripts/check-content.ts), que reprova o artefato
 * antes de ele existir. Aqui fica so uma guarda de forma: se alguem editar o JSON a mao, o
 * app mostra um aviso em vez de quebrar numa leitura de propriedade.
 */

function temFormaDeConteudo(valor: unknown): valor is Conteudo {
  if (!valor || typeof valor !== 'object') return false
  const candidato = valor as Partial<Conteudo>
  return (
    Array.isArray(candidato.areas) &&
    Array.isArray(candidato.paginas) &&
    typeof candidato.temas === 'object' &&
    candidato.temas !== null
  )
}

const CONTEUDO_VAZIO: Conteudo = {
  meta: { geradoEm: '', totais: { areas: 0, temas: 0, paginas: 0 } },
  areas: [],
  temas: {},
  ordemEstudo: [],
  paginas: [],
}

/**
 * Preenchido por `carregar()`, que roda antes da primeira renderizacao. A ligacao do
 * modulo e viva: quem importa `content` le o valor atual, nao o da importacao.
 */
export let content: Conteudo = CONTEUDO_VAZIO
export let erroConteudo: string | null = null

/** Le o conteudo da fonte desta build. Chamado uma vez, no arranque. */
export async function carregar(): Promise<void> {
  try {
    const bruto = await lerConteudoBruto()
    if (!temFormaDeConteudo(bruto)) {
      erroConteudo =
        'O arquivo de conteúdo não tem a forma esperada. Rode `npm run build:content` e recarregue.'
      return
    }
    content = bruto
  } catch (erro) {
    console.error('[conteudo] falha ao carregar', erro)
    erroConteudo = 'Não consegui carregar o conteúdo. Rode `npm run build:content` e recarregue.'
  }
}
