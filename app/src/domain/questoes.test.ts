// Banco de múltipla escolha: o que estes testes protegem é a reprodutibilidade (mesma
// semente, mesma ordem; mesma entrada, mesma saída) e a recusa do que não tem a forma
// esperada. A ordenação muda o que a pessoa vê, então ela também é testada — inclusive o
// empate, que não pode depender de detalhe de implementação do `sort`.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  acertou,
  carregarBanco,
  desempenho,
  pareceBanco,
  priorizar,
  questoesDe,
  sortear,
  type Banco,
  type Questao,
} from './questoes'
import { progressoVazio, type Progresso, type RegistroDeQuestao } from './progresso'

// A fonte desta build (`@fonte`) é trocável para o teste poder exercitar a recusa; sem
// troca, ela é a de verdade (fonte-web, com os 18 JSONs do banco).
const fonte = vi.hoisted(() => ({ ler: null as null | (() => Promise<unknown>) }))

vi.mock('@fonte', async (importarOriginal) => {
  const real = await importarOriginal<typeof import('@fonte')>()
  return { lerBancoBruto: () => fonte.ler?.() ?? real.lerBancoBruto() }
})

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const PASTA_DO_BANCO = path.resolve(AQUI, '..', 'content', 'questions')

const AREA_A = '01-fundamentos'
const AREA_B = '02-grc'
const REF_A = `${AREA_A}#TEMA-01`
const REF_B = `${AREA_B}#TEMA-01`
const ITEM = `${REF_A}#E01`

function questao(over: Partial<Questao> = {}): Questao {
  return {
    id: ITEM,
    ref: REF_A,
    origem: 'erro-comum',
    fonte: { titulo: 'CSEC2017', url: 'https://exemplo/1', tipo: 'primaria' },
    status: 'rascunho',
    enunciado: 'Sobre o tema: um colega afirma algo errado. Qual é a correção?',
    alternativas: ['certa', 'errada 1', 'errada 2'],
    correta: 0,
    justificativa: 'porque o escopo é a informação',
    ...over,
  }
}

/** Itens distintos, para os testes de sorteio e de ordem. */
function lote(quantos: number, ref = REF_A): Questao[] {
  return Array.from({ length: quantos }, (_, i) =>
    questao({ id: `${ref}#E${String(i + 1).padStart(2, '0')}` }),
  )
}

function ids(itens: Questao[]): string[] {
  return itens.map((q) => q.id)
}

/** Duas áreas, com a chave de `02-grc` ANTES da de `01-fundamentos` de propósito. */
function banco(): Banco {
  return {
    [AREA_B]: [questao({ id: `${REF_B}#E01`, ref: REF_B })],
    [AREA_A]: [questao({ id: `${REF_A}#E01` }), questao({ id: `${REF_A}#E02` })],
  }
}

function comPlacar(placares: Record<string, { acertos: number; erros: number }>): Progresso {
  const questoes: Record<string, RegistroDeQuestao> = {}
  for (const [id, placar] of Object.entries(placares)) {
    questoes[id] = { ...placar, ultima: '2026-03-10T12:00:00.000Z' }
  }
  return { ...progressoVazio(), questoes }
}

describe('pareceBanco', () => {
  it('aceita um banco com a forma que o gerador grava', () => {
    expect(pareceBanco(banco())).toBe(true)
  })

  it('recusa o que não é banco', () => {
    expect(pareceBanco(null)).toBe(false)
    expect(pareceBanco(undefined)).toBe(false)
    expect(pareceBanco('nada')).toBe(false)
    expect(pareceBanco([])).toBe(false)
    // Sem nenhuma área é o arquivo que não veio, não um banco vazio.
    expect(pareceBanco({})).toBe(false)
    expect(pareceBanco({ [AREA_A]: 'nada' })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [{}] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao(), 'texto'] })).toBe(false)
  })

  it('recusa item cujo gabarito aponta para fora da lista', () => {
    // Fora da faixa, `acertou` nunca acertaria e a tela mostraria "undefined" no lugar do
    // gabarito.
    expect(pareceBanco({ [AREA_A]: [questao({ correta: 3 })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ correta: -1 })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ correta: 1.5 })] })).toBe(false)
  })

  it('recusa item com campo fora do tipo', () => {
    // `as never` é como o teste escreve o item que o tipo não deixa existir: é exatamente o
    // que um JSON editado à mão traria.
    expect(pareceBanco({ [AREA_A]: [questao({ status: 'aprovado' as never })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ origem: 'inventada' as never })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ alternativas: ['certa', 7] as never })] })).toBe(
      false,
    )
    expect(pareceBanco({ [AREA_A]: [questao({ fonte: { titulo: 't' } as never })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ enunciado: 42 as never })] })).toBe(false)
  })

  it('recusa as origens que saíram do banco', () => {
    // `recuperacao` e `checkpoint` eram valores válidos e deixaram de ser quando as
    // discursivas saíram. Um banco velho, ou editado à mão, tem de ser recusado — não
    // aceito com uma origem que o gerador não grava mais.
    for (const origem of ['recuperacao', 'checkpoint']) {
      expect(pareceBanco({ [AREA_A]: [questao({ origem: origem as never })] })).toBe(false)
    }
  })

  it('recusa item cuja fonte não é objeto', () => {
    // O banco vem de JSON externo: `fonte` como texto ou nulo não tem título, url nem tipo para
    // ler, e a tela não pode desenhar `undefined` como procedência.
    expect(pareceBanco({ [AREA_A]: [questao({ fonte: 'x' as never })] })).toBe(false)
    expect(pareceBanco({ [AREA_A]: [questao({ fonte: null as never })] })).toBe(false)
  })

  it('recusa item cujas alternativas não são lista', () => {
    // Fora de lista, `alternativas.length` e o índice do gabarito não descrevem nada.
    expect(pareceBanco({ [AREA_A]: [questao({ alternativas: 'nada' as never })] })).toBe(false)
  })
})

describe('questoesDe', () => {
  it('devolve só os itens da área, numa lista nova', () => {
    const b = banco()
    const daArea = questoesDe(b, AREA_A)
    expect(ids(daArea)).toEqual([`${REF_A}#E01`, `${REF_A}#E02`])
    // Lista nova: quem chama não mexe por engano no banco carregado.
    expect(daArea).not.toBe(b[AREA_A])
  })

  it('devolve lista vazia para área que não existe', () => {
    expect(questoesDe(banco(), '99-inexistente')).toEqual([])
  })

  it('não lê chave herdada do protótipo', () => {
    // `banco[areaId]` também acha o que vem do protótipo: `'__proto__'` devolvia o próprio
    // `Object.prototype` e o espalhamento estourava `TypeError: ... is not iterable`. A tela
    // valida a área antes, mas o próximo chamador não tem como saber disso.
    for (const nome of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      expect(() => questoesDe(banco(), nome)).not.toThrow()
      expect(questoesDe(banco(), nome)).toEqual([])
    }
  })

  it('devolve os itens quando o nome do protótipo é uma área de verdade', () => {
    // A recusa é por chave própria, e não por uma lista de nomes proibidos: um banco que
    // tem `constructor` como área continua funcionando.
    const b = { constructor: [questao()] } as unknown as Banco
    expect(ids(questoesDe(b, 'constructor'))).toEqual([ITEM])
  })

  it('devolve todas as áreas na ordem alfabética, e não na de leitura', () => {
    // A chave de `02-grc` está declarada primeiro no banco de propósito: sem ordenar, o
    // resultado do desktop (JSON montado pelo build) divergiria do navegador.
    expect(ids(questoesDe(banco()))).toEqual([
      `${REF_A}#E01`,
      `${REF_A}#E02`,
      `${REF_B}#E01`,
    ])
  })

  it('não estoura com a chave própria que não guarda lista', () => {
    // O banco vem de JSON externo: `Object.hasOwn` acha a chave, mas o valor pode não ser lista.
    // Melhor devolver lista vazia do que um `TypeError` na tela.
    const b = { a: undefined, b: [questao()] } as unknown as Banco
    expect(questoesDe(b, 'a')).toEqual([])
    // E "todas as áreas" ignora a chave sem lista em vez de estourar no espalhamento.
    expect(ids(questoesDe(b))).toEqual([ITEM])
  })
})

describe('sortear', () => {
  it('repete a ordem com a mesma semente, e embaralha com outra', () => {
    const itens = lote(20)
    const primeira = ids(sortear(itens, 20, 7))

    expect(ids(sortear(itens, 20, 7))).toEqual(primeira)
    // Nenhum item fica de fora e nenhum se repete: é permutação, não amostra.
    expect(new Set(primeira).size).toBe(20)
    expect([...primeira].sort()).toEqual(ids(itens).sort())
    // Sementes diferentes têm de dar ordens diferentes, senão o parâmetro seria enfeite.
    expect(ids(sortear(itens, 20, 8))).not.toEqual(primeira)
  })

  it('não mexe na lista recebida', () => {
    const itens = lote(20)
    const antes = ids(itens)
    sortear(itens, 5, 3)
    expect(ids(itens)).toEqual(antes)
  })

  it('devolve só os primeiros itens sorteados, sem repetir', () => {
    const itens = lote(20)
    const escolhidos = sortear(itens, 5, 11)
    expect(escolhidos).toHaveLength(5)
    expect(new Set(ids(escolhidos)).size).toBe(5)
    const doLote = new Set(ids(itens))
    for (const item of escolhidos) expect(doLote.has(item.id)).toBe(true)
    // A ordem dos itens já mostrados não muda quando a quantidade cresce: é o mesmo
    // embaralhamento, cortado em outro ponto.
    expect(ids(escolhidos)).toEqual(ids(sortear(itens, 20, 11)).slice(0, 5))
  })

  it('limita ao tamanho do lote e devolve nada para quantidade não positiva', () => {
    const itens = lote(4)
    expect(sortear(itens, 99, 1)).toHaveLength(4)
    expect(sortear(itens, Infinity, 1)).toHaveLength(4)
    expect(sortear(itens, 2.9, 1)).toHaveLength(2)
    expect(sortear(itens, 0, 1)).toEqual([])
    expect(sortear(itens, -3, 1)).toEqual([])
    expect(sortear(itens, NaN, 1)).toEqual([])
    expect(sortear([], 3, 1)).toEqual([])
  })

  it('aceita semente fracionária, negativa ou NaN sem perder o determinismo', () => {
    const itens = lote(10)
    expect(ids(sortear(itens, 4, -1.5))).toEqual(ids(sortear(itens, 4, -1.5)))
    expect(ids(sortear(itens, 4, NaN))).toEqual(ids(sortear(itens, 4, NaN)))
  })
})

describe('desempenho', () => {
  it('zera o placar do item que nunca foi respondido', () => {
    expect(desempenho(progressoVazio(), ITEM)).toEqual({ acertos: 0, erros: 0 })
  })

  it('devolve o placar registrado, em objeto novo', () => {
    const p = comPlacar({ [ITEM]: { acertos: 3, erros: 1 } })
    expect(desempenho(p, ITEM)).toEqual({ acertos: 3, erros: 1 })
    // Objeto novo: quem lê não altera o estado do estudo sem passar pelo store.
    expect(desempenho(p, ITEM)).not.toBe(p.questoes[ITEM])
  })
})

describe('priorizar', () => {
  it('põe na frente o que nunca foi respondido', () => {
    const itens = [`${REF_A}#E01`, `${REF_A}#E02`, `${REF_A}#E03`]
    const p = comPlacar({
      [itens[0]!]: { acertos: 0, erros: 4 },
      [itens[1]!]: { acertos: 3, erros: 0 },
    })
    // O item nunca visto vem primeiro, mesmo tendo o vizinho errado quatro vezes.
    expect(ids(priorizar(lote(3), p))).toEqual([itens[2]!, itens[0]!, itens[1]!])
  })

  it('entre os já respondidos, o que mais errou vem primeiro', () => {
    const itens = lote(2)
    const p = comPlacar({
      [itens[0]!.id]: { acertos: 2, erros: 1 },
      [itens[1]!.id]: { acertos: 0, erros: 5 },
    })
    expect(ids(priorizar(itens, p))).toEqual([itens[1]!.id, itens[0]!.id])
  })

  it('não muda o tamanho nem o conteúdo da lista, e não mexe na entrada', () => {
    const itens = lote(5)
    const antes = ids(itens)
    const ordenados = priorizar(itens, comPlacar({ [itens[4]!.id]: { acertos: 1, erros: 1 } }))

    expect(ordenados).toHaveLength(itens.length)
    expect([...ids(ordenados)].sort()).toEqual([...antes].sort())
    expect(ordenados).not.toBe(itens)
    expect(ids(itens)).toEqual(antes)
  })

  it('mantém a ordem do banco quando o placar empata', () => {
    // Mesmo placar nos dois primeiros: a ordem de estudo do material decide.
    const itens = lote(3)
    const p = comPlacar({
      [itens[0]!.id]: { acertos: 1, erros: 2 },
      [itens[1]!.id]: { acertos: 1, erros: 2 },
    })
    expect(ids(priorizar(itens, p))).toEqual([itens[2]!.id, itens[0]!.id, itens[1]!.id])
    // E sem nenhum placar a ordem é a que veio.
    expect(ids(priorizar(itens, progressoVazio()))).toEqual(ids(itens))
  })
})

describe('acertou', () => {
  it('acerta só no índice do gabarito', () => {
    const item = questao({ alternativas: ['a', 'b', 'c'], correta: 2 })
    expect(acertou(item, 2)).toBe(true)
    expect(acertou(item, 0)).toBe(false)
    // Fora da lista não acerta nem lança: a tela pode passar um índice que não existe.
    expect(acertou(item, 3)).toBe(false)
    expect(acertou(item, -1)).toBe(false)
  })
})

describe('carregarBanco', () => {
  afterEach(() => {
    fonte.ler = null
  })

  it('entrega o banco da fonte real desta build, área por área', async () => {
    const doBuild = await carregarBanco()
    if (!doBuild) throw new Error('a fonte desta build não entregou o banco')

    // A fonte do navegador lista os arquivos à mão: comparar com o disco pega um import
    // esquecido, que nenhum tipo pegaria — a área sumiria do quiz em silêncio.
    const emDisco = fs
      .readdirSync(PASTA_DO_BANCO)
      .filter((arquivo) => arquivo.endsWith('.json'))
      .map((arquivo) => arquivo.replace(/\.json$/, ''))
      .sort()
    expect(Object.keys(doBuild).sort()).toEqual(emDisco)

    // Cada item aponta para um tema da própria área: um `areaId` trocado na hora de montar o
    // objeto faria o item aparecer no quiz de outra área.
    for (const areaId of emDisco) {
      const itens = doBuild[areaId] ?? []
      expect(itens.length).toBeGreaterThan(0)
      for (const item of itens) expect(item.ref.startsWith(`${areaId}#`)).toBe(true)
    }
  })

  it('recusa a forma inesperada em vez de entregar pela metade', async () => {
    fonte.ler = () => Promise.resolve({ [AREA_A]: 'nada' })
    await expect(carregarBanco()).resolves.toBeNull()

    fonte.ler = () => Promise.resolve({ [AREA_A]: [questao({ correta: 9 })] })
    await expect(carregarBanco()).resolves.toBeNull()
  })

  it('não deixa a falha de leitura virar exceção na tela', async () => {
    const erro = vi.spyOn(console, 'error').mockImplementation(() => {})
    fonte.ler = () => Promise.reject(new Error('ENOENT'))
    await expect(carregarBanco()).resolves.toBeNull()
    // A falha aparece no console: engolir em silêncio é o que faz o quiz parecer vazio por
    // culpa do conteúdo.
    expect(erro).toHaveBeenCalled()
    erro.mockRestore()
  })
})
