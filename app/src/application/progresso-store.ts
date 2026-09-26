// Store do progresso: guarda o estado, persiste no navegador e avisa quem observa.
//
// A regra de transicao nao mora aqui — ela esta em src/domain/progresso.ts, como funcao
// pura. Este modulo so encadeia: aplica o redutor, grava e notifica.

import { useSyncExternalStore } from 'react'
import {
  abrirPassagem as aplicarAbertura,
  marcarLido as aplicarLido,
  normalizarProgresso,
  registrarCheckpoint as aplicarCheckpoint,
  registrarConfianca as aplicarConfianca,
  registrarRecuperacao as aplicarRecuperacao,
  type Confianca,
  type Progresso,
} from '../domain/progresso'
import { gravarTexto, lerTexto } from '../infrastructure/storage/local'

const CHAVE = 'roadmap:progresso'

function carregar(): Progresso {
  const bruto = lerTexto(CHAVE)
  if (!bruto) return normalizarProgresso(null, new Date())
  try {
    return normalizarProgresso(JSON.parse(bruto), new Date())
  } catch {
    // Conteudo corrompido nao pode derrubar a aplicacao.
    return normalizarProgresso(null, new Date())
  }
}

let estado: Progresso = carregar()
const ouvintes = new Set<() => void>()

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function ler(): Progresso {
  return estado
}

function publicar(novo: Progresso): void {
  // Os redutores devolvem a mesma referencia quando nada muda; sem esta guarda, cada
  // clique gravava no armazenamento e re-renderizava os consumidores a toa.
  if (Object.is(novo, estado)) return
  estado = novo
  gravarTexto(CHAVE, JSON.stringify(novo))
  for (const ouvinte of ouvintes) ouvinte()
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(inscrever, ler, ler)
}

export function marcarLido(ref: string, agora: Date = new Date()): void {
  publicar(aplicarLido(estado, ref, agora))
}

export function registrarConfianca(
  ref: string,
  indice: number,
  confianca: Confianca,
  agora: Date = new Date(),
): void {
  publicar(aplicarConfianca(estado, ref, indice, confianca, agora))
}

export function registrarRecuperacao(
  ref: string,
  acertou: boolean,
  agora: Date = new Date(),
): void {
  publicar(aplicarRecuperacao(estado, ref, acertou, agora))
}

export function registrarCheckpoint(
  areaId: string,
  acertos: number,
  total: number,
  agora: Date = new Date(),
): void {
  publicar(aplicarCheckpoint(estado, areaId, acertos, total, agora))
}

/** Abre a proxima passagem de recuperacao de um tema. */
export function abrirPassagem(ref: string, agora: Date = new Date()): void {
  publicar(aplicarAbertura(estado, ref, agora))
}

/**
 * Substitui o estado inteiro (recomecar, e mais adiante importar arquivo). Passa pelo
 * normalizador: e fronteira de confianca, mesmo quando a origem e o proprio usuario.
 */
export function definirProgresso(novo: unknown, agora: Date = new Date()): void {
  publicar(normalizarProgresso(novo, agora))
}
