// Dominio por area. Usa o criterio que cada guia ja declara, em vez de inventar um
// limiar proprio.

import type { Area } from './types'
import { aprovouNoCriterio, interpretarCriterio } from './criterio'
import { resultadoRegistradoDoCheckpoint, type Progresso } from './progresso'

export interface DominioArea {
  areaId: string
  areaNome: string
  totalTemas: number
  /** Temas cuja ultima recuperacao ativa foi respondida sem consulta. */
  firmes: number
  /** null quando o checkpoint ainda nao foi respondido. */
  checkpointAprovado: boolean | null
  /** Criterio declarado no guia, em prosa. */
  criterio: string
}

/** Um tema entra como "firme" quando a ultima recuperacao ativa foi acertada. */
function temaFirme(progresso: Progresso, ref: string): boolean {
  return progresso.temas[ref]?.recuperacaoOk === true
}

export function dominioDaArea(area: Area, progresso: Progresso): DominioArea {
  const totalTemas = area.temas.length
  const firmes = area.temas.filter((ref) => temaFirme(progresso, ref)).length
  const totalItens = area.guia.checkpoint.length
  // O resultado vem do veredito por item quando ele fecha o checkpoint; o placar do arquivo
  // antigo so responde quando nao ha veredito (ver `resultadoRegistradoDoCheckpoint`).
  const resultado = resultadoRegistradoDoCheckpoint(progresso, area.areaId, totalItens)
  const alvo = interpretarCriterio(area.guia.criterio)

  return {
    areaId: area.areaId,
    areaNome: area.areaNome,
    totalTemas,
    firmes,
    checkpointAprovado: resultado
      ? aprovouNoCriterio(alvo, resultado.acertos, totalItens || resultado.total)
      : null,
    criterio: area.guia.criterio,
  }
}
