// A tarefa de cada intervalo da revisão espaçada, lida do material.
//
// A seção 11 de cada tema não diz só quando revisar: ela diz o que fazer em cada intervalo —
// "Responder à seção 10 sem reler" em D+1, "Explicar o tema em 3 frases" em D+7, "Aplicar a
// categorização a um sistema real" em D+30. É essa tabela que a fila de hoje precisa mostrar
// junto do tema vencido; sem ela, a fila diz a data e esconde o exercício.
//
// O texto não é escrito aqui: sai da tabela do próprio tema, que o `build:content` já converteu
// em HTML e que o gate exige em cada tema (`check:content` reprova o tema sem a seção 11). A
// única decisão desta camada é de onde ler — o parser do build monta tabelas estruturadas para
// o guia (`tabelaTemas`, `objetivos`, `atividades`) e nenhuma para o tema, e o parser está fora
// do escopo desta fase. Por isso a leitura do HTML acontece aqui, e não lá.
//
// Nada aqui inventa intervalo: a linha cujo rótulo não é `D+<n>` é descartada, e o intervalo
// sem linha na tabela devolve `null` em vez de "a linha mais próxima".

import { filaDoProgresso, type Progresso } from '../domain/progresso'
import {
  intervaloDaCobranca,
  precisaReleituraCompleta,
  proximaCobranca,
  tarefaDoIntervalo,
  type TarefaDoIntervalo,
} from '../domain/srs'
import type { Ref, Tabela, Tema } from '../domain/types'

/** A seção 11 é "Revisão espaçada" nos 109 temas — o número é o contrato do material. */
export const SECAO_REVISAO_ESPACADA = 11

/** Global: `matchAll` devolve o corpo de cada tabela, na ordem do HTML. */
const RE_TABELA_GLOBAL = /<table\b[^>]*>([\s\S]*?)<\/table>/gi
const RE_LINHA = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
const RE_CELULA = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi
const RE_ENTIDADE = /&(#[0-9]+|[a-zA-Z]+);/g

const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/**
 * O texto de uma célula: sem marcação, com as entidades de volta ao caractere e com os espaços
 * internos colapsados (o Markdown do material quebra a linha no meio da célula).
 */
export function textoDaCelula(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(RE_ENTIDADE, (todo, codigo: string) => {
      if (codigo.startsWith('#')) {
        const ponto = Number(codigo.slice(1))
        return Number.isFinite(ponto) ? String.fromCodePoint(ponto) : todo
      }
      return ENTIDADES[codigo] ?? todo
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Todas as tabelas utilizáveis de um HTML, na ordem em que aparecem.
 *
 * A primeira linha de cada tabela é o cabeçalho, e linha cujo número de células não fecha com
 * ele é descartada em vez de virar registro torto. Tabela sem nenhuma linha utilizável fica
 * fora: devolver a casca vazia só empurraria a checagem para quem chama.
 */
export function tabelas(html: string): Tabela[] {
  return [...html.matchAll(RE_TABELA_GLOBAL)].flatMap((casado) => {
    const linhas = [...(casado[1] ?? '').matchAll(RE_LINHA)].map((linha) =>
      [...(linha[1] ?? '').matchAll(RE_CELULA)].map((celula) => textoDaCelula(celula[1] ?? '')),
    )
    const [cabecalho, ...resto] = linhas
    if (!cabecalho?.length) return []
    const uteis = resto.filter((l) => l.length === cabecalho.length)
    return uteis.length ? [{ cabecalho, linhas: uteis }] : []
  })
}

/** A primeira tabela de um HTML, na forma que o resto do app já usa (`Tabela`). */
export function primeiraTabela(html: string): Tabela | null {
  return tabelas(html)[0] ?? null
}

/** "D+7" vira 7. Qualquer outro rótulo (e "D+0") não vira intervalo. */
export function diasDoRotulo(rotulo: string): number | null {
  const casado = /^D\+\s*(\d+)$/i.exec(rotulo.trim())
  if (!casado) return null
  const dias = Number(casado[1] ?? '')
  return Number.isInteger(dias) && dias > 0 ? dias : null
}

/** As tarefas que o material declara para o tema, na ordem da seção 11. */
export function tarefasDaRevisao(tema: Tema): TarefaDoIntervalo[] {
  const secao = tema.secoes.find((s) => s.numero === SECAO_REVISAO_ESPACADA)
  if (!secao) return []
  const tabela = primeiraTabela(secao.html)
  if (!tabela) return []
  return tabela.linhas.flatMap((linha) => {
    const [rotulo, oQueFazer, seErrar] = linha
    const intervaloDias = diasDoRotulo(rotulo ?? '')
    if (intervaloDias === null || !oQueFazer) return []
    return [{ intervaloDias, oQueFazer, seErrar: seErrar ?? '' }]
  })
}

/**
 * A tarefa do intervalo em que o tema está. `null` quando o intervalo não está tabelado — o
 * caso dos rebaixados (D+3) e do degrau das trilhas (D+90).
 */
export function tarefaDoTema(tema: Tema, intervaloDias: number): TarefaDoIntervalo | null {
  return tarefaDoIntervalo(tarefasDaRevisao(tema), intervaloDias)
}

/** Um item da fila de hoje, com a tarefa do material e o estado da releitura ao lado. */
export interface ItemDaFila {
  ref: Ref
  titulo: string
  /** O intervalo que esta passagem cobra. No consolidado é o degrau final (D+90). */
  intervaloDias: number
  /** A data da cobrança, que é a data que a tela mostra. */
  cobranca: string
  passagens: number
  rebaixamentos: number
  falhasSeguidas: number
  /** Duas passagens falhas seguidas: o material manda o tema para releitura completa. */
  releituraCompleta: boolean
  /** true quando o item entrou na fila pela etapa final, depois de cumprir a escada. */
  consolidado: boolean
  /** O que fazer neste intervalo, pela seção 11 do tema. `null` quando não há linha para ele. */
  tarefa: TarefaDoIntervalo | null
}

/**
 * Fila de hoje com a tarefa de cada intervalo, do mais atrasado para o mais recente.
 *
 * `temas` vem de fora (a tela passa `content.temas`) para esta camada não depender do
 * repositório de conteúdo e poder ser testada com um tema pequeno.
 */
export function filaComTarefas(
  progresso: Progresso,
  temas: Record<Ref, Tema>,
  agora: Date,
): ItemDaFila[] {
  return filaDoProgresso(progresso, agora).map((estado) => {
    const tema = temas[estado.ref]
    // O intervalo que a passagem cobra, e não o que o arquivo guardou: um tema que consolidou
    // quando a escada terminava em D+30 tem de aparecer como a passagem de D+90 que ele é.
    const intervaloDias = intervaloDaCobranca(estado)
    return {
      ref: estado.ref,
      titulo: tema?.titulo ?? estado.ref,
      intervaloDias,
      cobranca: proximaCobranca(estado).toISOString(),
      passagens: estado.passagens,
      rebaixamentos: estado.rebaixamentos,
      falhasSeguidas: estado.falhasSeguidas,
      releituraCompleta: precisaReleituraCompleta(estado),
      consolidado: estado.consolidado,
      tarefa: tema ? tarefaDoTema(tema, intervaloDias) : null,
    }
  })
}
