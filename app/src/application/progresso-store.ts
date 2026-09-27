// Store do progresso: guarda o estado, persiste pelo provedor escolhido e avisa quem
// observa.
//
// A regra de transicao nao mora aqui — ela esta em src/domain/progresso.ts, como funcao
// pura. Este modulo so encadeia: aplica o redutor, grava e notifica.
//
// A carga e assincrona (no desktop ela atravessa o IPC) e a gravacao e serializada. Duas
// decisoes que nao sao obvias:
//   - acao que chega antes da carga NAO grava e NAO e descartada: ela e reaplicada sobre
//     o que veio do disco. Gravar antes de ler substituiria o arquivo inteiro pelo estado
//     vazio mais um clique — perda de tudo, nao do ultimo clique;
//   - uma gravacao por vez. Duas em voo disputariam o mesmo arquivo temporario.

import { useSyncExternalStore } from 'react'
import {
  abrirPassagem as aplicarAbertura,
  marcarLido as aplicarLido,
  normalizarProgresso,
  pareceProgresso,
  progressoVazio,
  registrarArtefato as aplicarArtefato,
  registrarCheckpoint as aplicarCheckpoint,
  registrarConfianca as aplicarConfianca,
  registrarDiagnostico as aplicarDiagnostico,
  registrarQuestao as aplicarQuestao,
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

type Redutor = (p: Progresso) => Progresso

let estado: Progresso = progressoVazio()
let carregado = false
let podeGravar = true
let erroDeCarga: string | null = null
let falhaAoGravar = false
/** Intencoes chegadas antes da carga, para reaplicar sobre o estado do disco. */
const pendentes: Redutor[] = []
let fila: Promise<void> = Promise.resolve()

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
 * Uma gravacao por vez: evita duas disputando o mesmo arquivo temporario.
 *
 * Devolve o fim da fila — a promessa da gravacao que acabou de ser enfileirada. Ela nunca
 * rejeita: a falha vira aviso na tela (`falhaAoGravar`) e quem espera confere o aviso. E e isso
 * que permite a acao que RESPONDE algo ao usuario (a importacao) so responder "ok" depois de o
 * arquivo existir.
 */
function agendarGravacao(valor: Progresso): Promise<void> {
  fila = fila.then(() => onde().gravar(valor)).then(
    () => marcarFalha(false),
    (erro: unknown) => {
      console.error('[progresso] falha ao gravar', erro)
      marcarFalha(true)
    },
  )
  return fila
}

const carga: Promise<void> = onde().carregar().then(
  (bruto) => {
    const doDisco = normalizarProgresso(bruto, new Date())
    estado = pendentes.reduce((p, redutor) => redutor(p), doDisco)
    const houveIntencao = pendentes.length > 0
    pendentes.length = 0
    carregado = true
    if (houveIntencao && podeGravar) agendarGravacao(estado)
    notificar()
  },
  (erro: unknown) => {
    // Falha de leitura nao pode virar "comeca vazio" em silencio, e muito menos deixar o
    // proximo clique gravar por cima de um arquivo que nao conseguimos ler. A sessao
    // segue funcionando em memoria, exporta normalmente e nao escreve no disco.
    console.error('[progresso] falha ao carregar', erro)
    erroDeCarga =
      'Não consegui ler o progresso guardado neste computador. Esta sessão não vai gravar por cima: exporte o que fizer aqui antes de fechar.'
    podeGravar = false
    carregado = true
    notificar()
  },
)

/** Para os testes e para quem precisa do estado da sessao anterior antes de agir. */
export function quandoCarregado(): Promise<void> {
  return carga
}

/** Ultima gravacao enfileirada. Serve ao teste e ao desligamento do aplicativo. */
export function aguardarGravacoes(): Promise<void> {
  return fila
}

/**
 * Aplica o redutor e agenda a gravacao.
 *
 * Devolve o fim da gravacao agendada, ou `null` quando nao houve gravacao nenhuma (nada mudou,
 * a carga ainda nao chegou, ou a sessao nao pode escrever). Quem so quer reagir a mudanca ignora
 * o retorno; quem precisa responder "gravei" a espera.
 */
function publicar(redutor: Redutor): Promise<void> | null {
  const novo = redutor(estado)
  // Os redutores devolvem a mesma referencia quando nada muda; sem esta guarda, cada
  // clique gravaria e re-renderizaria os consumidores a toa.
  if (Object.is(novo, estado)) return null
  estado = novo
  if (!carregado) {
    // A carga ainda nao chegou: gravar agora substituiria o arquivo pelo estado vazio mais
    // um clique. A intencao fica retida e e reaplicada sobre o que veio do disco.
    pendentes.push(redutor)
    notificar()
    return null
  }
  if (!podeGravar) {
    // A leitura falhou: a sessao segue em memoria e nao escreve por cima do que nao
    // conseguimos ler. Nao entra em `pendentes` — depois da carga ninguem drenaria a fila,
    // e a intencao ficaria retida para sempre, dando a impressao de estar guardada.
    notificar()
    return null
  }
  const gravacao = agendarGravacao(novo)
  notificar()
  return gravacao
}

/**
 * Fotografia do store, para teste e depuracao. Os hooks leem exatamente estes valores;
 * fora do React nao ha como chamar hook.
 */
export function instantaneo(): {
  estado: Progresso
  carregado: boolean
  erroDeCarga: string | null
  falhaAoGravar: boolean
} {
  return { estado, carregado, erroDeCarga, falhaAoGravar }
}

export function useProgresso(): Progresso {
  return useSyncExternalStore(inscrever, ler)
}

export function useFalhaAoGravar(): boolean {
  return useSyncExternalStore(inscreverFalha, lerFalha)
}

export function useCarregado(): boolean {
  return useSyncExternalStore(inscrever, lerCarregado)
}

export function useErroDeCarga(): string | null {
  return useSyncExternalStore(inscrever, lerErroDeCarga)
}

function inscrever(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte)
  return () => {
    ouvintes.delete(ouvinte)
  }
}

function inscreverFalha(ouvinte: () => void): () => void {
  ouvintesDeFalha.add(ouvinte)
  return () => {
    ouvintesDeFalha.delete(ouvinte)
  }
}

function ler(): Progresso {
  return estado
}

function lerFalha(): boolean {
  return falhaAoGravar
}

function lerCarregado(): boolean {
  return carregado
}

function lerErroDeCarga(): string | null {
  return erroDeCarga
}

export function ondeFicaOProgresso(): string {
  return onde().descricao
}

export function marcarLido(ref: string, agora: Date = new Date()): void {
  publicar((p) => aplicarLido(p, ref, agora))
}

export function registrarConfianca(
  ref: string,
  indice: number,
  confianca: Confianca,
  agora: Date = new Date(),
): void {
  publicar((p) => aplicarConfianca(p, ref, indice, confianca, agora))
}

export function registrarRecuperacao(
  ref: string,
  acertou: boolean,
  agora: Date = new Date(),
): void {
  publicar((p) => aplicarRecuperacao(p, ref, acertou, agora))
}

export function registrarCheckpoint(
  areaId: string,
  acertos: number,
  total: number,
  agora: Date = new Date(),
): void {
  publicar((p) => aplicarCheckpoint(p, areaId, acertos, total, agora))
}

/** Resposta de um item do quiz: acumula o placar do item e marca o dia do estudo. */
export function registrarQuestao(id: string, acertou: boolean, agora: Date = new Date()): void {
  publicar((p) => aplicarQuestao(p, id, acertou, agora))
}

/** Veredito de um item do pre-teste diagnostico de uma trilha (slug da pagina). */
export function registrarDiagnostico(
  slug: string,
  indice: number,
  acertou: boolean,
  agora: Date = new Date(),
): void {
  publicar((p) => aplicarDiagnostico(p, slug, indice, acertou, agora))
}

/** Marca (ou desmarca) o artefato da secao 8 de um guia, pelo id da area e o numero da atividade. */
export function registrarArtefato(
  chave: string,
  produzido: boolean,
  agora: Date = new Date(),
): void {
  publicar((p) => aplicarArtefato(p, chave, produzido, agora))
}

/** Abre a proxima passagem de recuperacao de um tema. */
export function abrirPassagem(ref: string, agora: Date = new Date()): void {
  publicar((p) => aplicarAbertura(p, ref, agora))
}

/**
 * Substitui o estado inteiro (recomecar, importar). Passa pelo normalizador: e fronteira
 * de confianca mesmo quando a origem e o proprio usuario. Devolve o aviso de falha, ou
 * null quando aplicou — substituir em memoria numa sessao que nao grava daria a impressao
 * de que o arquivo foi salvo.
 */
export function definirProgresso(novo: unknown, agora: Date = new Date()): Aviso {
  if (!podeGravar) return { tipo: 'erro', texto: SEM_ESCRITA }
  publicar(() => normalizarProgresso(novo, agora))
  return null
}

/**
 * Substitui o estado inteiro e ESPERA a gravacao: `null` quando o arquivo foi escrito, o aviso
 * de erro quando nao foi.
 *
 * A importacao responde "Progresso importado." ao usuario. Com a gravacao so enfileirada, essa
 * resposta saia mesmo quando ela lancava (teto, ENOSPC, disco cheio) e o arquivo continuava o
 * antigo: a pessoa fechava o app confiando numa importacao que nunca existiu, e so o banner de
 * falha (que aparece por outro caminho) desmentia.
 */
async function substituirEAgravar(novo: unknown, agora: Date): Promise<Aviso> {
  if (!podeGravar) return { tipo: 'erro', texto: SEM_ESCRITA }
  const gravacao = publicar(() => normalizarProgresso(novo, agora))
  if (!gravacao) return NAO_GRAVOU
  await gravacao
  return falhaAoGravar ? NAO_GRAVOU : null
}

/** Apaga o que esta guardado e volta ao zero. */
export async function recomecar(): Promise<Aviso> {
  await carga
  if (!podeGravar) return { tipo: 'erro', texto: SEM_ESCRITA }
  // A remocao entra na mesma fila das gravacoes. Fora de ordem, a sequencia possivel e
  // gravar o temporario, apagar o alvo e so entao renomear — o arquivo volta com o estado
  // antigo enquanto a tela mostra zero.
  fila = fila.then(() => onde().apagar())
  await fila
  estado = progressoVazio()
  notificar()
  return null
}

export async function recomecarComConfirmacao(): Promise<Aviso> {
  const confirmado = window.confirm(
    'Apagar todo o progresso de estudo? Esta ação não pode ser desfeita.',
  )
  return confirmado ? await recomecar() : null
}

/** Recado das acoes de progresso: sucesso se mostra neutro, falha se mostra como aviso. */
export type Aviso = { tipo: 'ok' | 'erro'; texto: string } | null

/** O que dizer quando a sessao nao pode escrever porque a leitura do arquivo falhou. */
const SEM_ESCRITA =
  'Esta sessão não pode gravar: o progresso guardado não pôde ser lido. Exporte o que fez aqui e reimporte depois de reiniciar o aplicativo.'

/**
 * O que dizer quando a substituicao do estado nao chegou ao disco. Sem este aviso, a importacao
 * responderia "Progresso importado." com o arquivo antigo intacto.
 */
const NAO_GRAVOU: { tipo: 'erro'; texto: string } = {
  tipo: 'erro',
  texto:
    'Não consegui gravar o progresso importado: o arquivo guardado continua como estava. Exporte o que já estudou antes de fechar o aplicativo.',
}

/** Devolve null quando foi cancelado. */
export async function exportar(): Promise<Aviso> {
  // Sem esperar a carga, o arquivo sairia com o estado vazio.
  await carga
  const resultado = await onde().exportar(estado)
  if (resultado.estado === 'erro') return { tipo: 'erro', texto: resultado.mensagem ?? 'Não consegui exportar.' }
  if (resultado.estado === 'ok') {
    return { tipo: 'ok', texto: resultado.caminho ? `Exportado para ${resultado.caminho}.` : 'Progresso exportado.' }
  }
  return null
}

/** Devolve null quando foi cancelado. */
export async function importar(): Promise<Aviso> {
  await carga
  const resultado = await onde().importar()
  if (resultado.estado === 'cancelado') return null
  if (resultado.estado === 'erro') return { tipo: 'erro', texto: resultado.mensagem }
  // Forma conferida antes de substituir: um JSON valido que nao e um progresso do app
  // zeraria o estudo existente e ainda diria que deu certo.
  if (!pareceProgresso(resultado.dado)) {
    return { tipo: 'erro', texto: 'O arquivo não é um progresso do Roadmap CISO.' }
  }
  const falha = await substituirEAgravar(resultado.dado, new Date())
  if (falha) return falha
  return { tipo: 'ok', texto: 'Progresso importado.' }
}

/**
 * Liga os itens de menu do aplicativo desktop as mesmas acoes dos botoes. Chamado uma
 * vez, fora do React, para o StrictMode nao inscrever duas vezes.
 */
export function ligarMenuDoApp(): void {
  const api = ponte()
  if (!api) return
  api.aoEscolherNoMenu((acao) => {
    void (async () => {
      try {
        if (acao === 'exportar') await exportar()
        else if (acao === 'importar') await importar()
        else if (acao === 'apagar') await recomecarComConfirmacao()
      } catch (erro) {
        console.error('[progresso] falha na acao do menu', erro)
      }
    })()
  })
}
