// Escalonador de revisao espacada.
//
// A regra nao e inventada aqui: ela esta declarada no proprio material, em
// conteudo/00-guia-basico/TEMA-05 e na secao 11 de cada tema — intervalos D+1, D+7 e
// D+30; acerto mantem o intervalo; erro rebaixa e o item volta pela metade do prazo
// (D+7 no lugar de D+30, D+3 no lugar de D+7, D+1 no lugar de D+1).
//
// Depois do D+30 existe um degrau a mais, e ele NAO vem do tema: as trilhas mandam a Fase 6
// (`conteudo/91-trilhas/plano-12-meses.md`, secao 6) e o Bloco G (`plano-24-meses.md`, secao 6)
// revisarem todos os temas em "D+90 e além", com erro voltando a D+30 — a tabela de exemplo
// das duas diz "D+90 | ok / revisar | avançar / repetir em D+30".
//
// O D+90 fica fora de `SEQUENCIA_DIAS` de proposito. Aquele array e o espelho do
// `revisao_inicial_dias` do frontmatter de cada tema (`[1, 7, 30]` nos 109), e o gate
// (`scripts/lib/validar-content.ts`) compara os dois: mexer no array reprova o build. O tema
// declara os intervalos que sugere; o calendario completo e das trilhas.

/** Sequencia declarada no frontmatter de cada tema (`revisao_inicial_dias`). */
export const SEQUENCIA_DIAS = [1, 7, 30] as const

/** Degrau das trilhas, depois do ultimo intervalo do tema. */
export const INTERVALO_ALEM_DIAS = 90

/** Ultimo intervalo da escada, nomeado para nao indexar o array. Acerto aqui consolida. */
export const ULTIMO_INTERVALO_DIAS = INTERVALO_ALEM_DIAS

/** Rebaixamento por erro. O valor fora da tabela cai na metade do intervalo. */
export const DEMOTAO: Record<number, number> = { 1: 1, 7: 3, 30: 7, [INTERVALO_ALEM_DIAS]: 30 }

/**
 * Passagens falhas seguidas que mandam o tema para releitura completa
 * (`plano-12-meses.md`, secao 6: "Duas passagens falhas seguidas mandam o tema para releitura
 * completa, contada na conta da seção 3.3").
 */
export const FALHAS_PARA_RELEITURA = 2

const DIA_MS = 24 * 60 * 60 * 1000

export interface EstadoRevisao {
  ref: string
  /** Intervalo agendado, em dias. Comeca em 1. */
  intervaloDias: number
  /** Data ISO da proxima revisao. */
  proximaRevisao: string
  /** Quantas vezes o item foi rebaixado por erro, na vida toda. */
  rebaixamentos: number
  /** Passagens concluidas, com ou sem erro. */
  passagens: number
  /**
   * Passagens falhas CONSECUTIVAS desde o ultimo acerto. Nao e o mesmo que `rebaixamentos`:
   * aquele conta a vida toda, e duas falhas separadas por um acerto nao mandam o tema para
   * releitura completa.
   */
  falhasSeguidas: number
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
    if (seguinte !== undefined) return seguinte
    // Passado o ultimo degrau do tema entra o das trilhas, e ele e o ultimo: no D+90 o
    // material manda "avançar", e nao ha intervalo declarado depois dele.
    return intervaloAtual < INTERVALO_ALEM_DIAS ? INTERVALO_ALEM_DIAS : null
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
    falhasSeguidas: 0,
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
  const falhasSeguidas = acertou ? 0 : estado.falhasSeguidas + 1

  if (intervalo === null) {
    return {
      ...estado,
      intervaloDias: ULTIMO_INTERVALO_DIAS,
      proximaRevisao: somarDias(agora, ULTIMO_INTERVALO_DIAS).toISOString(),
      passagens,
      falhasSeguidas,
      consolidado: true,
    }
  }

  return {
    ref: estado.ref,
    intervaloDias: intervalo,
    proximaRevisao: somarDias(agora, intervalo).toISOString(),
    rebaixamentos: estado.rebaixamentos + (acertou ? 0 : 1),
    passagens,
    falhasSeguidas,
    consolidado: false,
  }
}

/**
 * Duas passagens falhas seguidas mandam o tema para releitura completa
 * (`plano-12-meses.md`, secao 6). O estado diz que a releitura esta devida; o que o app faz
 * com isso — reiniciar a escada, exigir uma marca de releitura antes da proxima passagem —
 * nao esta dito no material, e por isso nao e decidido aqui.
 */
export function precisaReleituraCompleta(estado: EstadoRevisao): boolean {
  return estado.falhasSeguidas >= FALHAS_PARA_RELEITURA
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

// ------------------------------------------------------------------- tarefa do intervalo
// A secao 11 de cada tema nao diz so quando revisar: ela diz o que fazer em cada intervalo
// ("Responder a secao 10 sem reler" em D+1, "Explicar o tema em 3 frases" em D+7). Quem le a
// tabela do material e a camada de aplicacao (`application/revisao-espacada.ts`); aqui fica
// so a escolha da tarefa para o intervalo devido.

/** Uma linha da tabela da secao 11: o que fazer no intervalo e o que fazer se errar. */
export interface TarefaDoIntervalo {
  intervaloDias: number
  oQueFazer: string
  seErrar: string
}

/**
 * A tarefa declarada para o intervalo que o tema esta devendo, pelo intervalo EXATO.
 *
 * Devolve `null` para os intervalos que nao tem linha na secao 11 de nenhum dos 109 temas: os
 * rebaixados (D+3, e D+1 depois de um rebaixamento) e o degrau das trilhas (D+90). A secao 11
 * tabela D+1, D+7 e D+30; mostrar "a linha mais proxima" ali seria inventar a tarefa do
 * material, e a decisao nao e desta camada.
 */
export function tarefaDoIntervalo(
  tarefas: readonly TarefaDoIntervalo[],
  intervaloDias: number,
): TarefaDoIntervalo | null {
  return tarefas.find((t) => t.intervaloDias === intervaloDias) ?? null
}
