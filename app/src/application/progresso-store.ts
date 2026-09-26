// Store do progresso: guarda o estado, persiste pelo provedor escolhido e avisa quem
// observa.
//
// A regra de transicao nao mora aqui — ela esta em src/domain/progresso.ts, como funcao
// pura. Este modulo so encadeia: aplica o redutor, grava e notifica. A gravacao e
// assincrona porque no aplicativo desktop ela atravessa o IPC ate o arquivo.

import { useSyncExternalStore } from 'react'
import {
  abrirPassagem as aplicarAbertura,
  marcarLido as aplicarLido,
  normalizarProgresso,
  progressoVazio,
  registrarCheckpoint as aplicarCheckpoint,
  registrarConfianca as aplicarConfianca,
  registrarRecuperacao as aplicarRecuperacao,
  type Confianca,
  type Progresso,
} from '../domain/progresso'
import { persistencia, type Persistencia } from '../infrastructure/storage/persistencia'
import { ponte } from '../infrastructure/storage/ponte'

let provedor: Persistencia | null = null
function onde(): Persistencia {
  if (!provedor) provedor = persistencia()
  return provedor
}

let estado: Progresso = progressoVazio()
let mutado = false
let falhaAoGravar = false
const ouvintes = new Set<() => void>()
const ouvintesDeFalha = new Set<() => void>()

function notificar(): void {
  for (const ouvinte of ouvintes) ouvinte()
}

function marcarFalha(falhou: boolean): void {
  if (falhaAoGravar === falhou) return
  falhaAoGravar = falhou
  for (const ouvinte of ouvintesDeFalha) ouvinte()
}

/**
 * Carga inicial. A interface ja pode ser usada antes de terminar, e se alguma acao
 * acontecer nesse intervalo ela prevalece: a carga nao sobrescreve o que o usuario
 * acabou de registrar.
 */
const carga: Promise<void> = onde()
  .carregar()
  .then((bruto) => {
    if (mutado) return
    estado = normalizarProgresso(bruto, new Date())
    notificar()
  })
  .catch(() => {
    // Sem estado guardado: comeca vazio, e a interface segue.
  })

/** Para os testes e para quem precisa esperar o estado da sessao anterior. */
export function quandoCarregado(): Promise<void> {
  return carga
}

function publicar(novo: Progresso): void {
  // Os redutores devolvem a mesma referencia quando nada muda; sem esta guarda, cada
  // clique gravava e re-renderizava os consumidores a toa.
  if (Object.is(novo, estado)) return
  estado = novo
  mutado = true
  void onde()
    .gravar(novo)
    .then(
      () => marcarFalha(false),
      (erro: unknown) => {
        console.error('[progresso] falha ao gravar', erro)
        marcarFalha(true)
      },
    )
  notificar()
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(inscrever, ler)
}

export function useFalhaAoGravar(): boolean {
  return useSyncExternalStore(inscreverFalha, lerFalha)
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

function inscreverFalha(ouvinte: () => void): () => void {
  ouvintesDeFalha.add(ouvinte)
  return () => ouvintesDeFalha.delete(ouvinte)
}

function ler(): Progresso {
  return estado
}

function lerFalha(): boolean {
  return falhaAoGravar
}

export function ondeFicaOProgresso(): string {
  return onde().descricao
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
 * Substitui o estado inteiro (recomecar, importar). Passa pelo normalizador: e fronteira
 * de confianca mesmo quando a origem e o proprio usuario.
 */
export function definirProgresso(novo: unknown, agora: Date = new Date()): void {
  publicar(normalizarProgresso(novo, agora))
}

/** Apaga o que esta guardado e volta ao zero. */
export async function recomecar(): Promise<void> {
  await onde().apagar()
  estado = progressoVazio()
  mutado = true
  notificar()
}

export async function recomecarComConfirmacao(): Promise<void> {
  const confirmado = window.confirm(
    'Apagar todo o progresso de estudo? Esta ação não pode ser desfeita.',
  )
  if (confirmado) await recomecar()
}

/** Devolve a mensagem de erro, ou null quando deu certo ou foi cancelado. */
export async function exportar(): Promise<string | null> {
  const resultado = await onde().exportar(estado)
  return resultado.estado === 'erro' ? (resultado.mensagem ?? 'Não consegui exportar.') : null
}

/** Devolve a mensagem de erro, ou null quando deu certo ou foi cancelado. */
export async function importar(): Promise<string | null> {
  const resultado = await onde().importar()
  if (resultado.estado === 'cancelado') return null
  if (resultado.estado === 'erro') return resultado.mensagem
  definirProgresso(resultado.dado)
  return null
}

/**
 * Liga os itens de menu do aplicativo desktop as mesmas acoes dos botoes. Chamado uma
 * vez, fora do React, para o StrictMode nao inscrever duas vezes.
 */
export function ligarMenuDoApp(): void {
  const api = ponte()
  if (!api) return
  api.aoEscolherNoMenu((acao) => {
    if (acao === 'exportar') void exportar()
    else if (acao === 'importar') void importar()
    else if (acao === 'apagar') void recomecarComConfirmacao()
  })
}
