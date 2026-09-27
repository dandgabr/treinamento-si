// Leitura das trilhas: o ponto de entrada do pre-teste diagnostico, os artefatos da secao 8 de
// cada guia e o marco de cada fase.
//
// O texto nao e escrito aqui. O diagnostico traz os itens e as faixas do proprio material
// (extraidos em build por `application/extrair-trilha.ts`), os artefatos sao a tabela da secao 8
// de cada guia (`guia.atividades`) e o marco de cada fase e uma linha da secao 3 da trilha. O
// que esta camada decide e so como LER isso:

import { resultadoDoCheckpoint, type Progresso, type ResultadoCheckpoint } from './progresso'
import { dominioDaArea } from './dominio'
import type { Area, FaixaDoDiagnostico, FaseDaTrilha, Guia, Trilha } from './types'

// ------------------------------------------------------------------- diagnostico

/**
 * Os vereditos do diagnostico de uma trilha, um por item do material, na ordem dele.
 *
 * Item nao julgado vale `null` — e nao `false`: o estudante que nao respondeu nao errou o item, e
 * as duas coisas nao podem virar o mesmo estado. A resposta guardada e procurada pelo indice do
 * material, entao item novo numa revisao da trilha aparece como nao julgado em vez de deslocar
 * os outros.
 */
export function veredictosDoDiagnostico(
  progresso: Progresso,
  slug: string,
  totalItens: number,
): (boolean | null)[] {
  const respostas = progresso.diagnosticos[slug] ?? []
  const porIndice = new Map(respostas.map((r) => [r.indice, r.acertou]))
  return Array.from({ length: totalItens }, (_, i) => porIndice.get(i) ?? null)
}

export interface ResumoDoDiagnostico {
  /** Um veredito por item do material: `null` enquanto nao respondido. */
  veredictos: (boolean | null)[]
  /** Acertos, e so quando os itens estao TODOS julgados — a mesma regra do checkpoint. */
  resultado: ResultadoCheckpoint | null
  /** A linha do material que os acertos alcancam, quando ha resultado. */
  faixa: FaixaDoDiagnostico | null
}

/**
 * A linha da tabela "Acertos | Ponto de entrada" que os acertos alcancam.
 *
 * A faixa e comparada pelos limites que o material escreve ("0 a 3", "4 a 7", "8 a 10"); nenhuma
 * faixa cobre o valor e o resultado e `null`, em vez de "a mais proxima" — o ponto de entrada e
 * uma afirmacao do material, e o app nao a estende.
 */
export function pontoDeEntrada(
  faixas: readonly FaixaDoDiagnostico[],
  acertos: number,
): FaixaDoDiagnostico | null {
  return faixas.find((f) => acertos >= f.de && acertos <= f.ate) ?? null
}

/**
 * O resultado do diagnostico de uma trilha.
 *
 * Sem todos os itens julgados nao ha leitura: com metade das respostas o numero de acertos
 * descreveria uma prova que ninguem terminou, e o ponto de entrada sairia errado. A regra de
 * "todos julgados" e a mesma do checkpoint, e por isso a funcao e a mesma (`resultadoDoCheckpoint`).
 */
export function resumoDoDiagnostico(
  trilha: Trilha,
  progresso: Progresso,
  slug: string,
): ResumoDoDiagnostico {
  const itens = trilha.diagnostico?.itens ?? []
  const veredictos = veredictosDoDiagnostico(progresso, slug, itens.length)
  const resultado = resultadoDoCheckpoint(veredictos)
  return {
    veredictos,
    resultado,
    faixa: resultado ? pontoDeEntrada(trilha.diagnostico?.faixas ?? [], resultado.acertos) : null,
  }
}

// ------------------------------------------------------------------- artefatos da secao 8

/**
 * Uma atividade da secao 8 do guia, na forma que o checklist usa. `numero` e a chave estavel do
 * artefato no estado (`areaId#numero`): a tabela do material numera as atividades, e o numero
 * sobrevive a reescrita do texto.
 */
export interface Atividade {
  numero: string
  texto: string
  /** A coluna "Pre-requisito tecnico", texto do material. */
  preRequisito: string
  /** true quando o material declara "nenhum": o artefato que a secao 3.2 da trilha nomeia. */
  semPreRequisitoTecnico: boolean
}

/** Comparacao de cabecalho sem acento, sem maiuscula e sem espaco nas pontas. */
function chave(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** O prerrequisito declarado como inexistente: "nenhum", "Nenhum", "Nenhum; ata e chamado bastam". */
function semPreRequisito(valor: string): boolean {
  return chave(valor).startsWith('nenhum')
}

/**
 * A tabela da secao 8 do guia ("Atividades e laboratorios") na forma de atividades.
 *
 * As colunas sao achadas pelo cabecalho, e nao pela posicao: a tabela do material tem quatro
 * colunas hoje, e a ordem nao e contrato. Guia sem a tabela devolve lista vazia — sem ela nao ha
 * artefato a marcar, e inventar um seria escrever o que o guia nao escreveu.
 */
export function atividadesDoGuia(guia: Guia): Atividade[] {
  const tabela = guia.atividades
  if (!tabela) return []
  const iNumero = tabela.cabecalho.findIndex((c) => chave(c) === '#')
  const iTexto = tabela.cabecalho.findIndex((c) => chave(c) === 'atividade')
  const iPre = tabela.cabecalho.findIndex((c) => chave(c).startsWith('pre-requisito'))
  if (iTexto < 0) return []
  return tabela.linhas.flatMap((linha, i) => {
    const texto = (linha[iTexto] ?? '').trim()
    if (!texto) return []
    const preRequisito = iPre >= 0 ? (linha[iPre] ?? '').trim() : ''
    return [
      {
        numero: (iNumero >= 0 ? (linha[iNumero] ?? '') : '').trim() || String(i + 1),
        texto,
        preRequisito,
        semPreRequisitoTecnico: semPreRequisito(preRequisito),
      },
    ]
  })
}

/** A chave do artefato no estado: a area mais o numero da atividade no guia dela. */
export function chaveDoArtefato(areaId: string, numero: string): string {
  return `${areaId}#${numero}`
}

// --------------------------------------------- onde mora o checklist de artefatos

/**
 * Em que fase da secao 3 mora o checklist de artefatos de cada area: a PRIMEIRA que a liga a ela,
 * na ordem do material. A chave do mapa e o `areaId`; o valor, o indice da fase.
 *
 * A mesma area pode ser ligada a mais de uma fase — o plano de 90 dias abre 00 na fase 0 e volta a
 * ela na fase 1, e a segunda passagem dos planos de 12 e 24 meses religa as dezoito areas. O
 * estado do artefato, porem, e UM so (`chaveDoArtefato`: a area mais o numero da atividade), entao
 * a caixa e uma so: a lista da secao 8 fica na fase que ESTUDA a area, e a fase que a retoma
 * mostra o estado do marco — as duas condicoes que ela precisa para fechar — e o caminho de volta
 * para a lista, em vez de repetir a mesma caixa com o mesmo nome acessivel.
 *
 * Fase que a secao 3 nao liga a area nenhuma nao entra no mapa (o Bloco F do plano de 24 meses): o
 * marco dela e o texto do material, e nao ha checklist para pendurar nela.
 */
export function faseDeEstudoDasAreas(fases: readonly FaseDaTrilha[]): Map<string, number> {
  const primeira = new Map<string, number>()
  fases.forEach((fase, indice) => {
    for (const areaId of fase.areas) if (!primeira.has(areaId)) primeira.set(areaId, indice)
  })
  return primeira
}

// ------------------------------------------------------------------- marcos

/**
 * O marco de uma area, como a secao 3.2 da trilha o descreve: o checkpoint da secao 9 no
 * criterio declarado pelo proprio guia E o artefato da secao 8 produzido.
 *
 * O criterio nao e copiado: quem responde por ele e `dominioDaArea`, que le o guia. O artefato e
 * "produzido" quando ha ao menos um marcado — o material fala do artefato no singular ("o
 * artefato da area produzido"), e as atividades extras que o time aceitar conduzir nao
 * transformam o marco num placar de quantas foram feitas.
 */
export interface MarcoDaArea {
  areaId: string
  areaNome: string
  /** `null` quando o checkpoint ainda nao foi respondido. */
  checkpointAprovado: boolean | null
  criterio: string
  artefatos: number
  produzidos: number
  cumprido: boolean
}

export function marcoDaArea(area: Area, progresso: Progresso): MarcoDaArea {
  const dominio = dominioDaArea(area, progresso)
  const atividades = atividadesDoGuia(area.guia)
  const produzidos = atividades.filter(
    (a) => progresso.artefatos[chaveDoArtefato(area.areaId, a.numero)]?.produzido === true,
  ).length
  return {
    areaId: area.areaId,
    areaNome: area.areaNome,
    checkpointAprovado: dominio.checkpointAprovado,
    criterio: dominio.criterio,
    artefatos: atividades.length,
    produzidos,
    cumprido: dominio.checkpointAprovado === true && produzidos > 0,
  }
}

export interface MarcoDaFase {
  rotulo: string
  marcos: MarcoDaArea[]
  /** Areas que a secao 3 nao associa a fase: o marco dela nao e verificavel por area. */
  semArea: boolean
  /** true quando TODAS as areas da fase cumpriram o marco. Fase sem area nunca fica cumprida. */
  cumprido: boolean
  cumpridas: number
}

export function marcoDaFase(
  fase: FaseDaTrilha,
  areas: readonly Area[],
  progresso: Progresso,
): MarcoDaFase {
  const porId = new Map(areas.map((a) => [a.areaId, a]))
  const marcos = fase.areas.flatMap((id) => {
    const area = porId.get(id)
    return area ? [marcoDaArea(area, progresso)] : []
  })
  const cumpridas = marcos.filter((m) => m.cumprido).length
  return {
    rotulo: fase.rotulo,
    marcos,
    semArea: marcos.length === 0,
    cumprido: marcos.length > 0 && cumpridas === marcos.length,
    cumpridas,
  }
}
