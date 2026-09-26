import conteudo from '../../content/generated/content.json'
import type { Conteudo } from '../../domain/types'

/**
 * Repositorio de conteudo. O JSON e gerado em build a partir do Markdown de
 * "conteudo/" (ver scripts/build-content.ts) e empacotado no bundle, para o app
 * funcionar offline e a partir de file:// sem nenhum fetch.
 *
 * A validacao de fundo pertence ao build (scripts/check-content.ts), que reprova o
 * artefato antes de ele existir. Aqui fica so uma guarda de forma: se alguem editar o
 * JSON a mao, o app mostra um aviso em vez de quebrar numa leitura de propriedade.
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

const bruto: unknown = conteudo
const valido = temFormaDeConteudo(bruto)

export const erroConteudo: string | null = valido
  ? null
  : 'O arquivo de conteúdo não tem a forma esperada. Rode `npm run build:content` e recarregue.'

export const content: Conteudo = valido ? bruto : CONTEUDO_VAZIO
