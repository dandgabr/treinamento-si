// Escalonador de revisao espacada.
//
// A regra nao e inventada aqui: ela esta declarada no proprio material, em
// conteudo/00-guia-basico/TEMA-05 e na secao 11 de cada tema — intervalos D+1, D+7 e
// D+30; acerto mantem o intervalo; erro rebaixa e o item volta pela metade do prazo
// (D+7 no lugar de D+30, D+3 no lugar de D+7, D+1 no lugar de D+1).

/** Ultimo intervalo da sequencia, nomeado para nao indexar o array. */
export const ULTIMO_INTERVALO_DIAS = 30

export const SEQUENCIA_DIAS = [1, 7, ULTIMO_INTERVALO_DIAS] as const

/** Rebaixamento por erro. O valor fora da tabela cai na metade do intervalo. */
export const DEMOTAO: Record<number, number> = { 1: 1, 7: 3, 30: 7 }

const DIA_MS = 24 * 60 * 60 * 1000

export interface EstadoRevisao {
  ref: string
  /** Intervalo agendado, em dias. Comeca em 1. */
  intervaloDias: number
  /** Data ISO da proxima revisao. */
  proximaRevisao: string
  /** Quantas vezes o item foi rebaixado por erro. */
  rebaixamentos: number
  /** Passagens concluidas, com ou sem erro. */
  passagens: number
  /** true quando passou pelo ultimo intervalo sem errar. Sai da fila ativa. */
  consolidado: boolean
}

export function intervaloInicial(): number {
  return SEQUENCIA_DIAS[0]
}

/**
 * Proximo intervalo em dias, ou `null` quando o tema sai da fila por ter passado pelo
 * ultimo intervalo sem erro.
 */
export function proximoIntervalo(intervaloAtual: number, acertou: boolean): number | null {
  if (acertou) {
    const seguinte = SEQUENCIA_DIAS.find((d) => d > intervaloAtual)
    return seguinte ?? null
  }
  const tabelado = DEMOTAO[intervaloAtual]
  if (tabelado !== undefined) return tabelado
  return Math.max(1, Math.floor(intervaloAtual / 2))
}

export function somarDias(base: Date, dias: number): Date {
  return new Date(base.getTime() + dias * DIA_MS)
}

export function criarEstado(ref: string, agora: Date, intervaloDias = intervaloInicial()): EstadoRevisao {
  return {
    ref,
    intervaloDias,
    proximaRevisao: somarDias(agora, intervaloDias).toISOString(),
    rebaixamentos: 0,
    passagens: 0,
    consolidado: false,
  }
}

/** Aplica o resultado de uma passagem e devolve o estado seguinte. */
export function registrarRevisao(
  estado: EstadoRevisao,
  acertou: boolean,
  agora: Date,
): EstadoRevisao {
  const intervalo = proximoIntervalo(estado.intervaloDias, acertou)
  const passagens = estado.passagens + 1

  if (intervalo === null) {
    return {
      ...estado,
      intervaloDias: ULTIMO_INTERVALO_DIAS,
      proximaRevisao: somarDias(agora, ULTIMO_INTERVALO_DIAS).toISOString(),
      passagens,
      consolidado: true,
    }
  }

  return {
    ref: estado.ref,
    intervaloDias: intervalo,
    proximaRevisao: somarDias(agora, intervalo).toISOString(),
    rebaixamentos: estado.rebaixamentos + (acertou ? 0 : 1),
    passagens,
    consolidado: false,
  }
}

export function estaVencido(estado: EstadoRevisao, agora: Date): boolean {
  if (estado.consolidado) return false
  return new Date(estado.proximaRevisao).getTime() <= agora.getTime()
}

/** Fila de hoje: vencidos, do mais atrasado para o mais recente. */
export function filaDeHoje(estados: EstadoRevisao[], agora: Date): EstadoRevisao[] {
  return estados
    .filter((e) => estaVencido(e, agora))
    .sort((a, b) => new Date(a.proximaRevisao).getTime() - new Date(b.proximaRevisao).getTime())
}
