// Gamificacao ancorada em aprendizagem: XP e derivado do estado, nunca acumulado a
// parte. A mesma funcao sobre o mesmo estado devolve sempre o mesmo numero, e o XP
// nao pode regredir enquanto nada for apagado — e o que permite recalcular a partir de
// um progresso importado sem confiar num contador.

import type { Area } from './types'
import { interpretarCriterio, aprovouNoCriterio } from './criterio'
import type { Progresso } from './progresso'

export const PONTOS = {
  temaLido: 10,
  preTesteRespondido: 5,
  recuperacaoOk: 20,
  /** Por passagem de revisao concluida. */
  passagemDeRevisao: 10,
  checkpointAprovado: 50,
} as const

export interface Faixa {
  nivel: number
  titulo: string
  /** XP minimo para entrar na faixa. */
  minimo: number
}

export const FAIXA_INICIAL: Faixa = { nivel: 1, titulo: 'Primeiros passos', minimo: 0 }

export const FAIXAS: readonly Faixa[] = [
  FAIXA_INICIAL,
  { nivel: 2, titulo: 'Vocabulário', minimo: 200 },
  { nivel: 3, titulo: 'Fundamentos', minimo: 600 },
  { nivel: 4, titulo: 'Analista', minimo: 1200 },
  { nivel: 5, titulo: 'Gestor', minimo: 2000 },
  { nivel: 6, titulo: 'CISO', minimo: 3200 },
]

export function xp(progresso: Progresso, areas: Area[]): number {
  let total = 0
  for (const tema of Object.values(progresso.temas)) {
    if (tema.lido) total += PONTOS.temaLido
    if (tema.preTeste.length) total += PONTOS.preTesteRespondido
    if (tema.recuperacaoOk) total += PONTOS.recuperacaoOk
    total += tema.revisao.passagens * PONTOS.passagemDeRevisao
  }
  for (const area of areas) {
    const resultado = progresso.checkpoints[area.areaId]
    if (!resultado) continue
    const alvo = interpretarCriterio(area.guia.criterio)
    // O total de itens do guia e a fonte; o total gravado so serve de reserva.
    const totalItens = area.guia.checkpoint.length || resultado.total
    if (aprovouNoCriterio(alvo, resultado.acertos, totalItens)) total += PONTOS.checkpointAprovado
  }
  return total
}

export interface PosicaoNivel {
  nivel: number
  titulo: string
  minimo: number
  /** XP necessario para o proximo nivel; null no ultimo. */
  proximoMinimo: number | null
  xpNoNivel: number
  xpDoNivel: number
}

export function nivel(valorXp: number): PosicaoNivel {
  let atual: Faixa = FAIXA_INICIAL
  for (const faixa of FAIXAS) {
    if (valorXp >= faixa.minimo) atual = faixa
  }
  const indice = FAIXAS.indexOf(atual)
  const proxima = FAIXAS[indice + 1] ?? null
  return {
    nivel: atual.nivel,
    titulo: atual.titulo,
    minimo: atual.minimo,
    proximoMinimo: proxima ? proxima.minimo : null,
    xpNoNivel: valorXp - atual.minimo,
    xpDoNivel: proxima ? proxima.minimo - atual.minimo : 0,
  }
}
