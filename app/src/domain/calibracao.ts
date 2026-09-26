// Calibracao de confianca: cruza o que o usuario declarou saber (1 a 5) com o que ele
// de fato acertou. Serve para mostrar superconfianca — errar com confianca alta e o
// caso que mais importa, e e o que a secao 3 de cada tema pede para registrar.

import type { Confianca, RespostaPreTeste } from './progresso'

export const NIVEIS_CONFIANCA: readonly Confianca[] = [1, 2, 3, 4, 5]

export interface CelulaCalibracao {
  confianca: Confianca
  acertos: number
  total: number
}

export interface Calibracao {
  celulas: CelulaCalibracao[]
  /** Confianca media declarada; null sem amostra. */
  confiancaMedia: number | null
  /** Acerto medio observado; null sem amostra. */
  acertoMedio: number | null
  /** Erros com confianca 4 ou 5. */
  superconfianca: number
  /**
   * Escore de Brier (0 a 1, menor e melhor): media do erro quadratico entre a
   * probabilidade declarada (confianca / 5) e o resultado (1 acerto, 0 erro).
   * null quando nao ha amostra.
   */
  brier: number | null
  amostra: number
}

export function calcularCalibracao(respostas: RespostaPreTeste[]): Calibracao {
  const celulas = NIVEIS_CONFIANCA.map((confianca) => {
    const doNivel = respostas.filter((r) => r.confianca === confianca)
    return {
      confianca,
      acertos: doNivel.filter((r) => r.acertou).length,
      total: doNivel.length,
    }
  })

  const amostra = respostas.length
  if (amostra === 0) {
    return {
      celulas,
      confiancaMedia: null,
      acertoMedio: null,
      superconfianca: 0,
      brier: null,
      amostra: 0,
    }
  }

  const somaConfianca = respostas.reduce((n, r) => n + r.confianca, 0)
  const somaAcertos = respostas.filter((r) => r.acertou).length
  const somaErro = respostas.reduce((n, r) => {
    const declarada = r.confianca / 5
    const observada = r.acertou ? 1 : 0
    return n + (declarada - observada) ** 2
  }, 0)

  return {
    celulas,
    confiancaMedia: somaConfianca / amostra,
    acertoMedio: somaAcertos / amostra,
    superconfianca: respostas.filter((r) => !r.acertou && r.confianca >= 4).length,
    brier: somaErro / amostra,
    amostra,
  }
}

/** Reune as respostas de todos os temas, para a visao global. */
export function respostasDe(progresso: { temas: Record<string, { preTeste: RespostaPreTeste[] }> }): RespostaPreTeste[] {
  return Object.values(progresso.temas).flatMap((t) => t.preTeste)
}
