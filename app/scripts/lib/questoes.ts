// Banco de multipla escolha: derivacao e validacao.
//
// O repositorio proibe afirmacao sem fonte (CONTRIBUTING §4), entao o banco NAO e escrito
// livremente: ele e derivado de material ja verificado, e cada item declara de onde veio.
//
//   - a tabela de erros comuns de um tema ja e um par (o que se erra -> o que e correto):
//     o `correto` vira o gabarito e os `equivoco` de outros itens do MESMO tema viram
//     distratores, porque sao erros que o proprio material documenta;
//   - os pares de recuperacao ativa viram itens quando a resposta e curta o bastante para
//     caber numa alternativa; resposta longa nao serve como opcao de multipla escolha.
//
// Todo item nasce `rascunho`. A promocao para `verificado` e revisao humana, e o app marca
// na tela o que ainda nao passou por ela.

import { LEXICO } from './validar-content'
import type { Conteudo, Tema } from '../../src/domain/types'

/**
 * O mesmo lexico proibido do material (secao 5 do CONTRIBUTING), aplicado ao texto dos itens.
 * Faltava: um item editado a mao com "robusto" ou "abrangente" passava pelo gate, embora a
 * secao 7 do plano peça exatamente esta checagem.
 */
function temLexicoProibido(textos: string[]): boolean {
  const alvo = textos.join(' \n ')
  return LEXICO.some((termo) => {
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?<![\\p{L}\\p{N}])${escapado}(?![\\p{L}\\p{N}])`, 'iu').test(alvo)
  })
}

export type OrigemDaQuestao = 'erro-comum' | 'recuperacao'
export type StatusDaQuestao = 'rascunho' | 'pendente' | 'verificado'

export interface Questao {
  id: string
  /** Tema de origem: e o que liga a questao ao material e ao progresso. */
  ref: string
  origem: OrigemDaQuestao
  /** Herdada do tema: sem fonte nao ha item. */
  fonte: { titulo: string; url: string; tipo: string }
  status: StatusDaQuestao
  enunciado: string
  alternativas: string[]
  /** Indice da unica alternativa correta. */
  correta: number
  justificativa: string
}

/** Resposta longa demais nao funciona como alternativa de multipla escolha. */
const TETO_DA_ALTERNATIVA = 220
/** Menos que isto nao da para montar item: precisa de gabarito e de ao menos 2 distratores. */
const MINIMO_DE_ALTERNATIVAS = 3
/**
 * Ordem deterministica a partir do id: o build tem de ser reproduzivel, e o gabarito nao
 * pode ficar sempre na primeira posicao.
 */
function posicaoCorreta(id: string, total: number): number {
  let soma = 0
  for (const letra of id) soma = (soma * 31 + letra.charCodeAt(0)) % 100_000
  return soma % total
}

/** Embaralha as alternativas de forma reproduzivel, mantendo o gabarito no lugar certo. */
function ordenar(id: string, correta: string, distratores: string[]): { alternativas: string[]; correta: number } {
  const total = distratores.length + 1
  const indice = posicaoCorreta(id, total)
  const alternativas = [...distratores]
  alternativas.splice(indice, 0, correta)
  return { alternativas, correta: indice }
}

function fonteDoTema(tema: Tema): Questao['fonte'] {
  const principal = tema.fontes.find((f) => f.url && f.tipo) ?? tema.fontes[0]
  return { titulo: principal?.titulo ?? '', url: principal?.url ?? '', tipo: principal?.tipo ?? '' }
}

/**
 * Escolhe os distratores mais proximos do gabarito em comprimento.
 *
 * Sem isto, a correta era a mais longa em 81% dos itens (media de +24 caracteres): dava para
 * acertar sem saber, so contando letras. Aproximar o tamanho nao resolve o item, mas tira o
 * tell mais barato — e o gate vigia o resto.
 */
function distratoresMaisProximos(correta: string, candidatos: string[], quantos: number): string[] {
  const vistos = new Set([correta.trim()])
  return candidatos
    .filter((texto) => {
      const limpo = texto.trim()
      if (!limpo || limpo.length > TETO_DA_ALTERNATIVA || vistos.has(limpo)) return false
      vistos.add(limpo)
      return true
    })
    .sort((a, b) => Math.abs(a.trim().length - correta.length) - Math.abs(b.trim().length - correta.length))
    .slice(0, quantos)
}

/** Itens vindos da tabela de erros comuns: um por linha, com o gabarito sendo o `correto`. */
function daTabelaDeErros(tema: Tema): Questao[] {
  const linhas = tema.errosComuns ?? []
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  linhas.forEach((linha, indice) => {
    // Distratores: os equivocos das OUTRAS linhas do mesmo tema — erros que o proprio
    // material documenta.
    const candidatos = linhas.filter((_, i) => i !== indice).map((outra) => outra.equivoco)
    const gabarito = linha.correto.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    const distratores = distratoresMaisProximos(gabarito, candidatos, 3)
    if (distratores.length + 1 < MINIMO_DE_ALTERNATIVAS) return

    const id = `${tema.ref}#E${String(indice + 1).padStart(2, '0')}`
    const { alternativas, correta } = ordenar(id, gabarito, distratores)
    itens.push({
      id,
      ref: tema.ref,
      origem: 'erro-comum',
      fonte,
      status: 'rascunho',
      enunciado: `Sobre ${tema.titulo}: um colega afirma que "${linha.equivoco}". Qual é a correção?`,
      alternativas,
      correta,
      justificativa: linha.porque,
    })
  })
  return itens
}

/**
 * Itens vindos dos pares de recuperacao ativa.
 *
 * Duas coisas que este gerador NAO faz, porque fazer seria mentir:
 *
 *  - **nao inventa justificativa.** A versao anterior usava o primeiro equivoco do tema como
 *    "porque", o que punha um enunciado FALSO sob "Por quê" em 296 itens — o app ensinando
 *    errado. A resposta correta ja e a propria resposta do material; o que a tela mostra e o
 *    link para o tema, que e a conferencia de verdade;
 *  - **nao usa a resposta de outra pergunta como distrator**, porque nenhuma delas e falsa
 *    pelo tema e a correta ficava reconhecivel por ser a unica que trata do que foi
 *    perguntado — item que mede eliminacao, nao memoria. Os distratores sao os equivocos da
 *    tabela do tema, como pede a secao 7 do plano.
 */
function daRecuperacao(tema: Tema): Questao[] {
  const pares = tema.recuperacao ?? []
  const candidatos = (tema.errosComuns ?? []).map((e) => e.equivoco)
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  pares.forEach((par, indice) => {
    const gabarito = par.resposta.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    const distratores = distratoresMaisProximos(gabarito, candidatos, 3)
    if (distratores.length + 1 < MINIMO_DE_ALTERNATIVAS) return

    const id = `${tema.ref}#R${String(indice + 1).padStart(2, '0')}`
    const { alternativas, correta } = ordenar(id, gabarito, distratores)
    itens.push({
      id,
      ref: tema.ref,
      origem: 'recuperacao',
      fonte,
      status: 'rascunho',
      enunciado: par.pergunta.trim(),
      alternativas,
      correta,
      // Vazia de proposito: ver o comentario acima.
      justificativa: '',
    })
  })
  return itens
}

export interface Banco {
  /** areaId -> itens, na ordem de estudo. */
  porArea: Record<string, Questao[]>
  total: number
}

/** Deriva o banco inteiro. A ordem segue `ordemEstudo`, para o build ser reproduzivel. */
export function derivarBanco(conteudo: Conteudo): Banco {
  const porArea: Record<string, Questao[]> = {}
  for (const area of conteudo.areas) porArea[area.areaId] = []

  const areaDoTema = (ref: string): string | undefined =>
    conteudo.areas.find((a) => a.temas.includes(ref))?.areaId

  for (const ref of conteudo.ordemEstudo) {
    const tema = conteudo.temas[ref]
    const areaId = areaDoTema(ref)
    if (!tema || !areaId) continue
    porArea[areaId]!.push(...daTabelaDeErros(tema), ...daRecuperacao(tema))
  }

  const total = Object.values(porArea).reduce((n, lista) => n + lista.length, 0)
  return { porArea, total }
}

/** Devolve a lista de problemas. Vazia significa banco aprovado. */
export function validarBanco(banco: Banco, conteudo: Conteudo): string[] {
  const erros: string[] = []
  const refs = new Set(Object.keys(conteudo.temas))
  const idsVistos = new Set<string>()

  for (const [areaId, itens] of Object.entries(banco.porArea)) {
    if (!conteudo.areas.some((a) => a.areaId === areaId)) {
      erros.push(`${areaId}: arquivo de questoes de area inexistente`)
    }
    if (!itens.length) {
      erros.push(`${areaId}: area sem nenhum item derivado`)
      continue
    }
    for (const q of itens) {
      const onde = q.id
      if (!/^[a-z0-9-]+#(TEMA-\d+|Q-\d+)/.test(q.id)) erros.push(`${onde}: id fora do padrao`)
      if (idsVistos.has(q.id)) erros.push(`${onde}: id repetido`)
      idsVistos.add(q.id)

      // O item tem de apontar para material que existe: e o que liga o banco ao estudo.
      if (!refs.has(q.ref)) erros.push(`${onde}: ref inexistente (${q.ref})`)
      else if (!q.ref.startsWith(`${areaId}#`)) {
        erros.push(`${onde}: item de ${areaId} apontando para tema de outra area (${q.ref})`)
      }

      if (!q.fonte?.url || !q.fonte.tipo) erros.push(`${onde}: sem fonte`)
      // `javascript:`/`data:` num `href` so nao executa porque o React bloqueia; a decisao
      // nao pode morar numa biblioteca. As 904 fontes reais sao `https`.
      else if (!/^https?:\/\//.test(q.fonte.url)) {
        erros.push(`${onde}: fonte com esquema nao permitido (${q.fonte.url.slice(0, 40)})`)
      }
      if (!q.enunciado) erros.push(`${onde}: enunciado vazio`)
      // A justificativa e obrigatoria onde ela existe (o `porque` do material). Em item de
      // recuperacao ela e vazia de proposito: inventar uma seria ensinar errado, e foi o
      // defeito que esta versao corrigiu.
      if (!q.justificativa && q.origem === 'erro-comum') {
        erros.push(`${onde}: item de erro comum sem justificativa`)
      }
      if (temLexicoProibido([q.enunciado, q.justificativa, ...q.alternativas])) {
        erros.push(`${onde}: lexico proibido no texto do item`)
      }
      if (q.alternativas.length < MINIMO_DE_ALTERNATIVAS) {
        erros.push(`${onde}: ${q.alternativas.length} alternativa(s)`)
      }
      const distintas = new Set(q.alternativas.map((a) => a.trim()))
      if (distintas.size !== q.alternativas.length) erros.push(`${onde}: alternativa repetida`)
      if (q.alternativas.some((a) => !a.trim())) erros.push(`${onde}: alternativa vazia`)
      if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta >= q.alternativas.length) {
        erros.push(`${onde}: indice da correta fora da lista (${q.correta})`)
      }
      if (!['rascunho', 'pendente', 'verificado'].includes(q.status)) {
        erros.push(`${onde}: status invalido (${q.status})`)
      }
    }
  }

  // A distribuicao do gabarito nao pode ser previsivel: se a correta ficasse sempre na
  // primeira posicao, acertar nao mediria nada.
  const itens = Object.values(banco.porArea).flat()
  if (itens.length > 20) {
    const naPrimeira = itens.filter((q) => q.correta === 0).length
    const fracao = naPrimeira / itens.length
    if (fracao > 0.45 || fracao < 0.15) {
      erros.push(
        `gabarito concentrado na primeira alternativa (${(fracao * 100).toFixed(0)}% dos ${itens.length} itens)`,
      )
    }
  }

  return erros
}
