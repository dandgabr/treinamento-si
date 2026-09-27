// Banco de múltipla escolha: os tipos do que o gerador grava em `src/content/questions/` e
// as operações sobre ele.
//
// Nada aqui decide se um item presta — isso é do gate de build (`scripts/check-questions.ts`),
// que reprova o banco antes de o artefato existir. Este módulo escolhe, ordena e julga
// respostas sem relógio, sem disco e sem `Math.random`: o resultado tem de ser o mesmo no
// teste, no navegador e no desktop, e um item não pode mudar embaixo do dedo de quem responde.
//
// A única leitura fica no fim do arquivo, em `carregarBanco`: as fontes de conteúdo (`@fonte`)
// entregam o bruto de cada build e a forma é conferida aqui, para a tela ter um lugar só
// por onde pedir o banco.

import { lerBancoBruto } from '@fonte'
import type { Progresso } from './progresso'

export type OrigemDaQuestao = 'erro-comum' | 'recuperacao' | 'checkpoint'
export type StatusDaQuestao = 'rascunho' | 'pendente' | 'verificado'

export interface Questao {
  id: string
  /**
   * Material de origem: é o que liga o item ao material e ao progresso. `area#TEMA-NN` para os
   * itens de tema e `area#GUIA` para os de checkpoint, que saem do guia da área e não de um tema.
   */
  ref: string
  origem: OrigemDaQuestao
  fonte: { titulo: string; url: string; tipo: string }
  status: StatusDaQuestao
  enunciado: string
  alternativas: string[]
  /** Índice da única alternativa correta. */
  correta: number
  justificativa: string
}

/** areaId -> itens */
export type Banco = Record<string, Questao[]>

/** Listas fechadas do gerador. O guard as usa em vez de repetir a união. */
const ORIGENS: readonly OrigemDaQuestao[] = ['erro-comum', 'recuperacao', 'checkpoint']
const STATUS: readonly StatusDaQuestao[] = ['rascunho', 'pendente', 'verificado']

function ehFonte(valor: unknown): boolean {
  if (!valor || typeof valor !== 'object') return false
  const f = valor as Record<string, unknown>
  return typeof f.titulo === 'string' && typeof f.url === 'string' && typeof f.tipo === 'string'
}

function ehQuestao(valor: unknown): valor is Questao {
  if (!valor || typeof valor !== 'object') return false
  const q = valor as Record<string, unknown>
  if (typeof q.id !== 'string' || typeof q.ref !== 'string') return false
  if (typeof q.origem !== 'string' || !(ORIGENS as readonly string[]).includes(q.origem)) {
    return false
  }
  if (typeof q.status !== 'string' || !(STATUS as readonly string[]).includes(q.status)) {
    return false
  }
  if (!ehFonte(q.fonte)) return false
  if (typeof q.enunciado !== 'string' || typeof q.justificativa !== 'string') return false

  const alternativas = q.alternativas
  if (!Array.isArray(alternativas)) return false
  if (!alternativas.every((a) => typeof a === 'string')) return false

  // O índice dentro da lista é parte da forma, e não detalhe de conteúdo: fora dela,
  // `acertou` nunca acertaria e a tela mostraria "undefined" como gabarito.
  return (
    typeof q.correta === 'number' &&
    Number.isInteger(q.correta) &&
    q.correta >= 0 &&
    q.correta < alternativas.length
  )
}

/**
 * Diz se o valor tem a forma de um banco, item a item.
 *
 * O predicado promete o tipo inteiro: conferir só a casca deixaria a promessa mentirosa e a
 * tela leria `alternativas.length` de um valor que não é lista. O que é semântico — item sem
 * fonte, alternativa repetida, gabarito concentrado — continua sendo do gate de build.
 */
export function pareceBanco(valor: unknown): valor is Banco {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
  const areas = Object.entries(valor as Record<string, unknown>)
  // Banco sem nenhuma área não é banco: é o arquivo que não veio. Recusar aqui faz a tela
  // dizer "não consegui carregar" em vez de abrir o quiz vazio, que é o que consola a perda.
  if (!areas.length) return false
  return areas.every(([, itens]) => Array.isArray(itens) && itens.every(ehQuestao))
}

/**
 * Itens de uma área, ou de todas quando `areaId` é undefined.
 *
 * A ordem das áreas é a alfabética, e não a de leitura dos arquivos: no navegador o banco vem
 * de imports (a ordem é a do arquivo) e no desktop, de um JSON montado pelo build. Ordenar as
 * chaves deixa "todas as áreas" igual nos dois artefatos — e os ids das áreas começam com
 * número justamente para a ordem alfabética ser a ordem de estudo.
 *
 * A lista devolvida é nova: quem chama não mexe por engano no banco carregado.
 *
 * A chave tem de ser própria do banco: `banco[areaId]` também acha o que vem do protótipo, e
 * `'__proto__'` devolvia o próprio `Object.prototype` — o espalhamento estourava
 * `TypeError: ... is not iterable`. Hoje nenhum chamador passa um desses nomes, mas o banco
 * vem de JSON externo e o próximo chamador não tem como saber disso.
 */
export function questoesDe(banco: Banco, areaId?: string): Questao[] {
  if (areaId !== undefined) {
    return Object.hasOwn(banco, areaId) ? [...(banco[areaId] ?? [])] : []
  }
  return Object.keys(banco)
    .sort()
    .flatMap((id) => banco[id] ?? [])
}

/**
 * Gerador determinístico de 32 bits (mulberry32). Não guarda segredo nem precisa de qualidade
 * criptográfica: só de repetir a mesma sequência em qualquer máquina. `Math.imul` mantém as
 * multiplicações dentro dos 32 bits — em ponto flutuante a sequência sairia diferente.
 */
function sorteador(semente: number): () => number {
  // Semente fracionária, negativa ou NaN cai num inteiro de 32 bits: o contrato é o
  // determinismo, não a distribuição.
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Sorteio reproduzível: a mesma semente devolve a mesma ordem, em qualquer máquina.
 *
 * A semente vem de fora porque as duas pontas precisam dela — o teste, para provar que o
 * sorteio repete, e a tela, que guarda a semente da rodada para os itens não mudarem de lugar
 * a cada renderização. `Math.random` não serve: sortearia diferente a cada vez, e o item
 * mudaria embaixo do dedo de quem responde.
 *
 * O embaralhamento acontece sobre a lista inteira e o corte vem no fim, e não sobre um
 * subconjunto: assim aumentar a quantidade de itens mantém a ordem dos que já apareceram, em
 * vez de reapresentar tudo trocado a cada mudança de tamanho da rodada.
 */
export function sortear(itens: Questao[], quantas: number, semente: number): Questao[] {
  // 0, negativo e NaN caem aqui; `Infinity` passa e é limitado pelo tamanho da lista.
  if (!(quantas > 0)) return []
  const copia = [...itens]
  const aleatorio = sorteador(semente)
  // Fisher-Yates de trás para frente: cada posição recebe um item do trecho ainda não
  // embaralhado, e nenhuma permutação fica mais provável que outra.
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1))
    const trocado = copia[i]!
    copia[i] = copia[j]!
    copia[j] = trocado
  }
  return copia.slice(0, Math.min(Math.floor(quantas), copia.length))
}

/** Acertos e erros já registrados naquele item, do progresso. */
export function desempenho(progresso: Progresso, id: string): { acertos: number; erros: number } {
  const registro = progresso.questoes[id]
  // Objeto novo, e não o guardado: quem lê não altera o estado do estudo sem passar pelo store.
  return { acertos: registro?.acertos ?? 0, erros: registro?.erros ?? 0 }
}

/**
 * Ordem de apresentação: primeiro o que nunca foi respondido, depois o que mais errou.
 *
 * O tamanho não muda — é reordenação, não filtro: quem estuda decide quantos itens quer, e a
 * tela não pode perder item por causa da ordenação. Os empates ficam na ordem do banco (a
 * ordem de estudo do material), porque `sort` é estável desde a ES2019.
 *
 * A chave de cada item é calculada uma vez: o comparador roda O(n log n) vezes e não pode
 * pagar uma leitura de estado a cada chamada.
 */
export function priorizar(itens: Questao[], progresso: Progresso): Questao[] {
  return itens
    .map((questao) => ({ questao, d: desempenho(progresso, questao.id) }))
    .sort((a, b) => {
      const respondeuA = a.d.acertos + a.d.erros > 0 ? 1 : 0
      const respondeuB = b.d.acertos + b.d.erros > 0 ? 1 : 0
      if (respondeuA !== respondeuB) return respondeuA - respondeuB
      return b.d.erros - a.d.erros
    })
    .map((par) => par.questao)
}

/** A escolha é o índice marcado na tela; qualquer outro valor não acerta. */
export function acertou(questao: Questao, escolhida: number): boolean {
  return escolhida === questao.correta
}

// ------------------------------------------------------------------- carga

/**
 * Porta única de leitura do banco: a fonte desta build entrega o bruto (inline no navegador,
 * arquivo no desktop) e a forma é conferida antes de a tela usar.
 *
 * Devolve null quando não veio banco — arquivo ausente, JSON quebrado ou forma inesperada — e
 * deixa o erro no console. Devolver null em vez de lançar dá à tela um caminho só para dizer
 * que o quiz não está disponível, sem derrubar a aplicação inteira por causa de um enfeite.
 */
export async function carregarBanco(): Promise<Banco | null> {
  try {
    const bruto = await lerBancoBruto()
    return pareceBanco(bruto) ? bruto : null
  } catch (erro) {
    console.error('[questoes] falha ao ler o banco', erro)
    return null
  }
}
