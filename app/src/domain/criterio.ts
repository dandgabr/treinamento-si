// Interpreta o criterio de aprovacao que cada guia de area ja publica em prosa.
// Exemplos reais: "acertar 4 dos 5 itens sem consultar os temas",
// "acertar 80% ou mais sem consultar os temas", "acertar 5 das 6 sem consultar os temas".
// O numero nao e decidido aqui — e lido do material.

export interface AlvoCheckpoint {
  tipo: 'fracao' | 'percentual'
  /** Acertos necessarios. */
  acertos: number
  /** Total de itens, quando o criterio e uma fracao. */
  total: number
  /** Percentual necessario, derivado ou declarado. */
  percentual: number
}

const RE_FRACAO = /(\d+)\s*(?:dos|de|das)\s*(\d+)/i
const RE_PERCENTUAL = /(\d+)\s*%/i

export function interpretarCriterio(texto: string): AlvoCheckpoint | null {
  if (!texto) return null

  const fracao = texto.match(RE_FRACAO)
  if (fracao) {
    const acertos = Number(fracao[1])
    const total = Number(fracao[2])
    if (total > 0 && acertos > 0 && acertos <= total) {
      return {
        tipo: 'fracao',
        acertos,
        total,
        percentual: Math.round((acertos / total) * 100),
      }
    }
  }

  const percentual = texto.match(RE_PERCENTUAL)
  if (percentual) {
    const valor = Number(percentual[1])
    if (valor > 0 && valor <= 100) {
      return { tipo: 'percentual', acertos: 0, total: 0, percentual: valor }
    }
  }

  return null
}

/** Acertos necessarios dado o total de itens do checkpoint. */
export function acertosMinimos(alvo: AlvoCheckpoint, totalItens: number): number {
  if (alvo.tipo === 'fracao') {
    // A fracao do material costuma descrever o proprio checkpoint; se o total divergir,
    // vale a proporcao declarada.
    if (alvo.total === totalItens) return alvo.acertos
    return Math.ceil((alvo.acertos / alvo.total) * totalItens)
  }
  return Math.ceil((alvo.percentual / 100) * totalItens)
}

export function aprovouNoCriterio(
  alvo: AlvoCheckpoint | null,
  acertos: number,
  totalItens: number,
): boolean | null {
  if (!alvo || totalItens <= 0) return null
  return acertos >= acertosMinimos(alvo, totalItens)
}
