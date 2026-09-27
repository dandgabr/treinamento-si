// Banco de multipla escolha: derivacao e validacao.
//
// O repositorio proibe afirmacao sem fonte (CONTRIBUTING §4), entao o banco NAO e escrito
// livremente: ele e derivado de material ja verificado, e cada item declara de onde veio.
//
//   - a tabela de erros comuns de um tema ja e um par (o que se erra -> o que e correto):
//     o `correto` vira o gabarito e os `equivoco` de outros itens do MESMO tema viram
//     distratores, porque sao erros que o proprio material documenta;
//   - os pares de recuperacao ativa viram itens quando a resposta e curta o bastante para
//     caber numa alternativa; resposta longa nao serve como opcao de multipla escolha;
//   - os itens de checkpoint do guia da AREA viram itens pela mesma regra, com o escopo do
//     distrator subindo de tema para area — e o unico material de onde o item saiu.
//
// Todo item nasce `rascunho`. A promocao para `verificado` e revisao humana, e o app marca
// na tela o que ainda nao passou por ela.

import { LEXICO } from './validar-content'
import type { Area, Conteudo, Tema } from '../../src/domain/types'

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

export type OrigemDaQuestao = 'erro-comum' | 'recuperacao' | 'checkpoint'
export type StatusDaQuestao = 'rascunho' | 'pendente' | 'verificado'

export interface Questao {
  id: string
  /**
   * Material de onde o item saiu, e o que liga a questao ao estudo: `area#TEMA-NN` para os
   * itens de tema e `area#GUIA` para os de checkpoint, que nao pertencem a tema nenhum.
   */
  ref: string
  origem: OrigemDaQuestao
  /** Herdada do tema (ou da area, no item de guia): sem fonte nao ha item. */
  fonte: { titulo: string; url: string; tipo: string }
  status: StatusDaQuestao
  enunciado: string
  alternativas: string[]
  /** Indice da unica alternativa correta. */
  correta: number
  justificativa: string
}

/**
 * O rotulo do guia da area no `ref`.
 *
 * O checkpoint de uma area mora no GUIA dela, e nao dentro de um tema: `area#TEMA-NN` nao
 * serve de referencia para ele, e `area#GUIA` e a forma que sobra. Quem traduz essa
 * referencia de volta para a tela e o `linkTema`, que leva ao guia da area.
 */
export const GUIA = 'GUIA'

/** Referencia do guia de uma area: a que os itens de checkpoint apontam. */
export function refDoGuia(areaId: string): string {
  return `${areaId}#${GUIA}`
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
 * Sem isto, a correta era a mais longa em 4 de 5 itens de erro comum e em TODOS os de
 * recuperacao: dava para acertar sem saber, so contando letras. Aproximar o tamanho nao
 * resolve o item, mas tira o tell mais barato — e o gate vigia o resto.
 */
function distratoresMaisProximos(correta: string, candidatos: string[], quantos: number): string[] {
  const alvo = correta.trim()
  const vistos = new Set([alvo])
  return candidatos
    .filter((texto) => {
      const limpo = texto.trim()
      if (!limpo || limpo.length > TETO_DA_ALTERNATIVA || vistos.has(limpo)) return false
      vistos.add(limpo)
      return true
    })
    .sort((a, b) => Math.abs(a.trim().length - alvo.length) - Math.abs(b.trim().length - alvo.length))
    .slice(0, quantos)
}

/**
 * As duas colunas de uma tabela de erros comuns, menos a linha `exceto`: o `equivoco` que o
 * material documenta e o `correto` que o corrige.
 *
 * As duas entram na escolha do distrator de proposito. So o equivoco entrava, e como a coluna
 * "o que e correto" e sempre mais longa que a do equivoco, o gabarito — que e um `correto` —
 * acabava sendo a alternativa mais longa na maioria dos itens: dava para acertar contando
 * letras. Com o `correto` das outras linhas no conjunto, os tres mais proximos passam a ter
 * tamanho comparavel ao do gabarito.
 */
function textosDaTabela(tema: Tema, exceto = -1): string[] {
  return (tema.errosComuns ?? [])
    .filter((_, i) => i !== exceto)
    .flatMap((linha) => [linha.equivoco, linha.correto])
}

/** Itens vindos da tabela de erros comuns: um por linha, com o gabarito sendo o `correto`. */
function daTabelaDeErros(tema: Tema): Questao[] {
  const linhas = tema.errosComuns ?? []
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  linhas.forEach((linha, indice) => {
    // Distratores: as duas colunas das OUTRAS linhas do mesmo tema — erros que o proprio
    // material documenta, e as correcoes deles.
    const candidatos = textosDaTabela(tema, indice)
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
 *  - **nao usa texto de fora do material** como distrator: a secao 7 do plano pede que o
 *    distrator seja texto do proprio tema, e e o que os candidatos sao — as duas colunas da
 *    tabela de erros comuns e as respostas dos outros pares.
 *
 * A resposta de recuperacao e uma frase inteira, e so com os equivocos da tabela (curtos) o
 * gabarito era a alternativa mais longa em 100% dos itens: acertar nao media nada, bastava
 * contar letras. Por isso as respostas dos OUTROS pares tambem entram no conjunto: entre
 * frases do mesmo tipo, os tres distratores mais proximos ficam com tamanho comparavel ao do
 * gabarito.
 */
function daRecuperacao(tema: Tema): Questao[] {
  const pares = tema.recuperacao ?? []
  const fonte = fonteDoTema(tema)
  const itens: Questao[] = []
  pares.forEach((par, indice) => {
    const gabarito = par.resposta.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    const candidatos = [
      ...textosDaTabela(tema),
      ...pares.filter((_, i) => i !== indice).map((outro) => outro.resposta),
    ]
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

/**
 * A fonte herdada por um item de guia: a da AREA, que e quem publica o checkpoint.
 *
 * Mesma regra do tema (`fonteDoTema`), aplicada um nivel acima: o item de guia nao tem tema
 * de onde herdar, e a area e o material de onde ele saiu.
 */
function fonteDaArea(area: Area): Questao['fonte'] {
  const principal = area.fontes.find((f) => f.url && f.tipo) ?? area.fontes[0]
  return { titulo: principal?.titulo ?? '', url: principal?.url ?? '', tipo: principal?.tipo ?? '' }
}

/**
 * Todo o material de resposta curta da AREA: as duas colunas de cada tabela de erros comuns
 * e as respostas de recuperacao de todos os temas dela.
 *
 * E o conjunto de onde sai o distrator de um item de checkpoint. O item de recuperacao busca
 * distrator no proprio tema; o checkpoint nao tem tema, entao o escopo sobe para a area — que
 * continua sendo material do repositorio, e nada de fora dele entra no conjunto.
 */
function materialDaArea(area: Area, conteudo: Conteudo): string[] {
  return area.temas.flatMap((ref) => {
    const tema = conteudo.temas[ref]
    if (!tema) return []
    return [...textosDaTabela(tema), ...(tema.recuperacao ?? []).map((par) => par.resposta)]
  })
}

/**
 * Itens vindos do checkpoint do guia da area (secao 9 de cada guia).
 *
 * As duas decisoes dos itens de recuperacao valem aqui pelo mesmo motivo:
 *
 *  - **nao inventa justificativa.** O checkpoint e um par pergunta/resposta dentro de um
 *    `<details>`, sem coluna de "por que isto esta errado" — conferido no material. A
 *    resposta E o gabarito, e a conferencia de verdade e o guia, para onde a tela leva;
 *  - **nao usa texto de fora do material** como distrator: os candidatos sao as respostas
 *    dos outros itens do MESMO guia e o material dos temas da area (as duas colunas das
 *    tabelas de erros comuns e as respostas de recuperacao).
 *
 * A resposta longa demais para caber numa alternativa e descartada, como na recuperacao: um
 * checkpoint de 500 caracteres vira prosa, nao opcao de multipla escolha. Por isso o guia
 * nem sempre entrega um item por pergunta, e o numero real esta no build.
 */
function doCheckpoint(area: Area, conteudo: Conteudo): Questao[] {
  const pares = area.guia.checkpoint ?? []
  const fonte = fonteDaArea(area)
  const ref = refDoGuia(area.areaId)
  const daArea = materialDaArea(area, conteudo)
  const itens: Questao[] = []
  pares.forEach((par, indice) => {
    const gabarito = par.resposta.trim()
    if (!gabarito || gabarito.length > TETO_DA_ALTERNATIVA) return
    const candidatos = [
      ...pares.filter((_, i) => i !== indice).map((outro) => outro.resposta),
      ...daArea,
    ]
    const distratores = distratoresMaisProximos(gabarito, candidatos, 3)
    if (distratores.length + 1 < MINIMO_DE_ALTERNATIVAS) return

    const id = `${ref}#C${String(indice + 1).padStart(2, '0')}`
    const { alternativas, correta } = ordenar(id, gabarito, distratores)
    itens.push({
      id,
      ref,
      origem: 'checkpoint',
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

  // O checkpoint e do GUIA da area, e nao de um tema: entra depois dos itens dos temas, na
  // ordem em que a area aparece no material — a mesma ordem de leitura que o resto do banco.
  for (const area of conteudo.areas) porArea[area.areaId]!.push(...doCheckpoint(area, conteudo))

  const total = Object.values(porArea).reduce((n, lista) => n + lista.length, 0)
  return { porArea, total }
}

/** Devolve a lista de problemas. Vazia significa banco aprovado. */
export function validarBanco(banco: Banco, conteudo: Conteudo): string[] {
  const erros: string[] = []
  const refs = new Set(Object.keys(conteudo.temas))
  // O item de checkpoint nao aponta para tema nenhum: a referencia dele e o guia da area, e
  // sem esta segunda lista um `ref` legitimo cairia em "ref inexistente".
  const guias = new Set(conteudo.areas.map((a) => refDoGuia(a.areaId)))
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
      if (!/^[a-z0-9-]+#(TEMA-\d+|GUIA)#[A-Z]\d+$/.test(q.id)) erros.push(`${onde}: id fora do padrao`)
      if (idsVistos.has(q.id)) erros.push(`${onde}: id repetido`)
      idsVistos.add(q.id)

      // O item tem de apontar para material que existe: e o que liga o banco ao estudo.
      if (!refs.has(q.ref) && !guias.has(q.ref)) erros.push(`${onde}: ref inexistente (${q.ref})`)
      else if (!q.ref.startsWith(`${areaId}#`)) {
        erros.push(`${onde}: item de ${areaId} apontando para material de outra area (${q.ref})`)
      } else if ((q.origem === 'checkpoint') !== (q.ref === refDoGuia(areaId))) {
        // Item de checkpoint aponta para o guia da area; item de tema, para `area#TEMA-NN`.
        // Trocar um pelo outro confundiria a procedencia do item e o caminho de volta.
        erros.push(
          `${onde}: origem ${q.origem} em ref ${q.ref} — item de checkpoint aponta para ` +
            `${refDoGuia(areaId)}; item de tema, para ${areaId}#TEMA-NN`,
        )
      }

      if (!q.fonte?.url || !q.fonte.tipo) erros.push(`${onde}: sem fonte`)
      // `javascript:`/`data:` num `href` so nao executa porque o React bloqueia; a decisao
      // nao pode morar numa biblioteca. As 904 fontes reais sao `https`.
      else if (!/^https?:\/\//.test(q.fonte.url)) {
        erros.push(`${onde}: fonte com esquema nao permitido (${q.fonte.url.slice(0, 40)})`)
      }
      if (!q.enunciado) erros.push(`${onde}: enunciado vazio`)
      // A justificativa e obrigatoria onde ela existe (o `porque` do material). No item de
      // recuperacao e no de checkpoint ela e vazia de proposito: o material nao tem, para
      // esses pares, coluna de "por que isto esta errado", e inventar uma seria ensinar
      // errado — foi o defeito que a versao anterior do gerador tinha.
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

  // O banco tem de ser o que o material deriva AGORA, e nao uma versao editada dele.
  //
  // As conferencias acima sao de forma: um gabarito trocado a mao continua com quatro
  // alternativas, indice valido e fonte boa, e passava por todas elas — quem roda o gate
  // sobre o arquivo em disco (`check-questions`) embarcava a troca. Aqui o banco recebido e
  // comparado com a derivacao do mesmo conteudo, item por item, MENOS o `status`: o status e
  // a unica coisa que a revisao humana escreve, e todo o resto sai do material.
  //
  // A derivacao extra e barata (e a mesma que o `build-questions` acabou de rodar) e a
  // assinatura nao muda: o `check-questions`, que le o arquivo em disco, ganha a conferencia
  // sem uma linha a mais la.
  const derivado = derivarBanco(conteudo)
  const assinatura = (q: Questao): string =>
    JSON.stringify([
      q.id,
      q.ref,
      q.origem,
      q.fonte?.titulo ?? null,
      q.fonte?.url ?? null,
      q.fonte?.tipo ?? null,
      q.enunciado,
      q.alternativas ?? null,
      q.correta,
      q.justificativa,
    ])
  const adulterados: string[] = []
  for (const [areaId, esperados] of Object.entries(derivado.porArea)) {
    // `Object.hasOwn` e nao `banco.porArea[areaId]`: chave herdada do prototipo nao e arquivo
    // de area nenhum, e um `constructor` cairia numa funcao em vez de numa lista.
    const doArquivo = Object.hasOwn(banco.porArea, areaId) ? (banco.porArea[areaId] ?? []) : []
    const emDisco = new Map(doArquivo.map((q) => [q.id, q]))
    for (const esperado of esperados) {
      const achado = emDisco.get(esperado.id)
      if (!achado) {
        adulterados.push(`${esperado.id}: o material deriva este item e o banco nao o tem`)
        continue
      }
      emDisco.delete(esperado.id)
      if (assinatura(esperado) !== assinatura(achado)) {
        adulterados.push(`${esperado.id}: conteudo diferente do que o material deriva`)
      }
    }
    for (const id of emDisco.keys()) adulterados.push(`${id}: nao vem do material`)
  }
  if (adulterados.length) {
    erros.push(
      `banco adulterado: ${adulterados.length} item(ns) fora do derivado do material ` +
        `(${adulterados.slice(0, 5).join('; ')}${adulterados.length > 5 ? '; ...' : ''})`,
    )
  }

  return erros
}
