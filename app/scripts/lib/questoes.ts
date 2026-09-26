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

import type { Conteudo, Tema } from '../../src/domain/types'

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

/** Itens vindos da tabela de erros comuns: um por linha, com o gabarito sendo o `correto`. */
function daTabelaDeErros(tema: Tema): Questao[] {
  const linhas = tema.errosComuns ?? []
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  linhas.forEach((linha, indice) => {
    // Distratores: os equivocos das OUTRAS linhas do mesmo tema.
    const distratores = linhas
      .filter((_, i) => i !== indice)
      .map((outra) => outra.equivoco.trim())
      .filter((texto) => texto && texto.length <= TETO_DA_ALTERNATIVA)
    const gabarito = linha.correto.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    if (distratores.length + 1 < MINIMO_DE_ALTERNATIVAS) return

    const id = `${tema.ref}#E${String(indice + 1).padStart(2, '0')}`
    const { alternativas, correta } = ordenar(id, gabarito, distratores.slice(0, 3))
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

/** Itens vindos dos pares de recuperacao ativa, quando a resposta cabe numa alternativa. */
function daRecuperacao(tema: Tema): Questao[] {
  const pares = tema.recuperacao ?? []
  const erros = (tema.errosComuns ?? []).map((e) => e.equivoco.trim()).filter(Boolean)
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  pares.forEach((par, indice) => {
    const gabarito = par.resposta.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    const distratores = pares
      .filter((_, i) => i !== indice)
      .map((outro) => outro.resposta.trim())
      .filter((texto) => texto && texto !== gabarito && texto.length <= TETO_DA_ALTERNATIVA)
    if (distratores.length + 1 < MINIMO_DE_ALTERNATIVAS) return

    const id = `${tema.ref}#R${String(indice + 1).padStart(2, '0')}`
    const { alternativas, correta } = ordenar(id, gabarito, distratores.slice(0, 3))
    itens.push({
      id,
      ref: tema.ref,
      origem: 'recuperacao',
      fonte,
      status: 'rascunho',
      enunciado: par.pergunta.trim(),
      alternativas,
      correta,
      justificativa: erros[0] ?? 'Resposta declarada na seção de recuperação ativa do tema.',
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
      if (!q.enunciado) erros.push(`${onde}: enunciado vazio`)
      if (q.alternativas.length < MINIMO_DE_ALTERNATIVAS) {
        erros.push(`${onde}: ${q.alternativas.length} alternativa(s)`)
      }
      const distintas = new Set(q.alternativas.map((a) => a.trim()))
      if (distintas.size !== q.alternativas.length) erros.push(`${onde}: alternativa repetida`)
      if (q.alternativas.some((a) => !a.trim())) erros.push(`${onde}: alternativa vazia`)
      if (!Number.isInteger(q.correta) || q.correta < 0 || q.correta >= q.alternativas.length) {
        erros.push(`${onde}: indice da correta fora da lista (${q.correta})`)
      }
      if (!q.justificativa) erros.push(`${onde}: sem justificativa`)
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
