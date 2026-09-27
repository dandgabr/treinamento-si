import { describe, expect, it } from 'vitest'
import {
  abrirPassagem,
  diaIso,
  diasComEstudo,
  filaDoProgresso,
  marcarLido,
  normalizarProgresso,
  pareceProgresso,
  progressoVazio,
  registrarCheckpoint,
  registrarConfianca,
  registrarDiaAtivo,
  registrarQuestao,
  registrarRecuperacao,
  resultadoDoCheckpoint,
  temaVazio,
} from './progresso'

const HOJE = new Date('2026-03-10T12:00:00.000Z')
const REF = 'a#TEMA-01'
const ITEM = 'a#TEMA-01#E01'

function comDias(dias: string[]) {
  return { ...progressoVazio(), diasAtivos: dias }
}

describe('diaIso', () => {
  it('formata como AAAA-MM-DD', () => {
    expect(diaIso(HOJE)).toBe('2026-03-10')
  })
})

describe('registrarDiaAtivo', () => {
  it('adiciona o dia e mantém a lista ordenada', () => {
    const p = registrarDiaAtivo(comDias(['2026-03-08']), HOJE)
    expect(p.diasAtivos).toEqual(['2026-03-08', '2026-03-10'])
  })

  it('não duplica o mesmo dia', () => {
    const uma = registrarDiaAtivo(progressoVazio(), HOJE)
    const duas = registrarDiaAtivo(uma, HOJE)
    expect(duas.diasAtivos).toEqual(['2026-03-10'])
    expect(duas).toBe(uma)
  })
})

describe('diasComEstudo', () => {
  it('conta os dias registrados, não uma sequência', () => {
    // Dias soltos continuam contando: o que interessa é a coluna "Data" do registro de
    // progresso das trilhas, não um contador de hábito.
    expect(diasComEstudo(comDias(['2026-03-08', '2026-03-10']))).toBe(2)
  })

  it('zera sem nenhum dia', () => {
    expect(diasComEstudo(progressoVazio())).toBe(0)
  })

  it('não repete o mesmo dia', () => {
    const uma = registrarDiaAtivo(progressoVazio(), HOJE)
    const duas = registrarDiaAtivo(uma, HOJE)
    expect(diasComEstudo(duas)).toBe(1)
  })
})

describe('temaVazio', () => {
  it('começa não lido, sem pré-teste e com a revisão agendada em D+1', () => {
    const t = temaVazio(REF, HOJE)
    expect(t.lido).toBe(false)
    expect(t.preTeste).toEqual([])
    expect(t.recuperacaoOk).toBeNull()
    expect(t.revisao.intervaloDias).toBe(1)
    expect(t.revisao.proximaRevisao).toBe('2026-03-11T12:00:00.000Z')
  })
})

describe('redutores', () => {
  it('marcarLido cria o tema e registra o dia', () => {
    const p = marcarLido(progressoVazio(), REF, HOJE)
    expect(p.temas[REF]?.lido).toBe(true)
    expect(p.diasAtivos).toEqual(['2026-03-10'])
  })

  it('registrarConfianca não duplica o índice e mantém a ordem', () => {
    let p = registrarConfianca(progressoVazio(), REF, 2, 3, HOJE)
    p = registrarConfianca(p, REF, 0, 5, HOJE)
    p = registrarConfianca(p, REF, 2, 1, HOJE)
    expect(p.temas[REF]?.preTeste).toEqual([
      { indice: 0, confianca: 5 },
      { indice: 2, confianca: 1 },
    ])
  })

  it('registrarRecuperacao grava o veredito, marca lido e avança a revisão', () => {
    const p = registrarRecuperacao(progressoVazio(), REF, true, HOJE)
    const t = p.temas[REF]
    expect(t?.recuperacaoOk).toBe(true)
    expect(t?.lido).toBe(true)
    expect(t?.revisao.intervaloDias).toBe(7)
    expect(t?.revisao.passagens).toBe(1)
  })

  it('registrarRecuperacao no erro rebaixa o intervalo', () => {
    let p = registrarRecuperacao(progressoVazio(), REF, true, HOJE)
    // Cada nova passagem se abre explicitamente; repetir o veredito nao avanca nada.
    p = abrirPassagem(p, REF, HOJE)
    p = registrarRecuperacao(p, REF, true, HOJE)
    expect(p.temas[REF]?.revisao.intervaloDias).toBe(30)
    p = abrirPassagem(p, REF, HOJE)
    p = registrarRecuperacao(p, REF, false, HOJE)
    expect(p.temas[REF]?.revisao.intervaloDias).toBe(7)
    expect(p.temas[REF]?.revisao.rebaixamentos).toBe(1)
  })

  it('registrarCheckpoint sobrescreve o resultado da área', () => {
    let p = registrarCheckpoint(progressoVazio(), '01-fundamentos', 3, 5, HOJE)
    expect(p.checkpoints['01-fundamentos']).toEqual({ acertos: 3, total: 5 })
    p = registrarCheckpoint(p, '01-fundamentos', 5, 5, HOJE)
    expect(p.checkpoints['01-fundamentos']).toEqual({ acertos: 5, total: 5 })
  })

  it('registrarQuestao acumula o placar do item e marca o dia', () => {
    let p = registrarQuestao(progressoVazio(), ITEM, true, HOJE)
    p = registrarQuestao(p, ITEM, false, HOJE)
    p = registrarQuestao(p, ITEM, true, new Date('2026-03-11T09:00:00.000Z'))
    expect(p.questoes[ITEM]).toEqual({
      acertos: 2,
      erros: 1,
      ultima: '2026-03-11T09:00:00.000Z',
    })
    // Sem o dia registrado, responder o quiz não contaria no registro de progresso das trilhas.
    expect(p.diasAtivos).toEqual(['2026-03-10', '2026-03-11'])
  })

  it('registrarQuestao não mexe no placar dos outros itens', () => {
    let p = registrarQuestao(progressoVazio(), ITEM, true, HOJE)
    const doPrimeiro = p.questoes[ITEM]
    p = registrarQuestao(p, 'a#TEMA-02#E01', false, HOJE)
    expect(p.questoes[ITEM]).toBe(doPrimeiro)
    expect(Object.keys(p.questoes).sort()).toEqual(['a#TEMA-01#E01', 'a#TEMA-02#E01'])
  })

  it('registrarQuestao recusa id vazio e chave perigosa, sem criar estado novo', () => {
    // `out['__proto__'] = x` trocaria o protótipo em vez de criar propriedade; o
    // normalizador recusa as duas chaves, então registrá-las seria gravar dado que o
    // próximo carregamento joga fora.
    const base = progressoVazio()
    expect(registrarQuestao(base, '', true, HOJE)).toBe(base)
    expect(registrarQuestao(base, '__proto__', true, HOJE)).toBe(base)
    expect(registrarQuestao(base, 'constructor', true, HOJE)).toBe(base)
    expect(registrarQuestao(base, 'prototype', true, HOJE)).toBe(base)
    expect(Object.keys(base.questoes)).toEqual([])
  })

  it('filaDoProgresso devolve só os vencidos', () => {
    const p = registrarRecuperacao(progressoVazio(), REF, false, HOJE)
    // Rebaixado para D+1, vence em 11/03.
    expect(filaDoProgresso(p, HOJE)).toHaveLength(0)
    expect(filaDoProgresso(p, new Date('2026-03-11T12:00:00.000Z'))).toHaveLength(1)
  })

  it('registrarRecuperacao é idempotente: repetir não avança a revisão', () => {
    // Antes, três cliques no mesmo botão levavam D+1 → D+7 → consolidado e davam XP
    // por uma única leitura.
    let p = registrarRecuperacao(progressoVazio(), REF, true, HOJE)
    const depoisDoPrimeiro = p
    p = registrarRecuperacao(p, REF, true, HOJE)
    expect(p).toBe(depoisDoPrimeiro)
    expect(p.temas[REF]?.revisao.passagens).toBe(1)

    p = registrarRecuperacao(p, REF, false, HOJE)
    expect(p).toBe(depoisDoPrimeiro)
  })

  it('abrirPassagem libera o veredito para a próxima passagem', () => {
    let p = registrarRecuperacao(progressoVazio(), REF, true, HOJE)
    p = abrirPassagem(p, REF, HOJE)
    expect(p.temas[REF]?.recuperacaoOk).toBeNull()
    expect(p.temas[REF]?.revisao.intervaloDias).toBe(7)
    p = registrarRecuperacao(p, REF, false, HOJE)
    expect(p.temas[REF]?.recuperacaoOk).toBe(false)
    expect(p.temas[REF]?.revisao.passagens).toBe(2)
  })

  it('não cria estado novo quando nada muda', () => {
    const base = marcarLido(progressoVazio(), REF, HOJE)
    expect(marcarLido(base, REF, HOJE)).toBe(base)
    const comConfianca = registrarConfianca(base, REF, 0, 3, HOJE)
    expect(registrarConfianca(comConfianca, REF, 0, 3, HOJE)).toBe(comConfianca)
    const comCheckpoint = registrarCheckpoint(base, 'a', 4, 5, HOJE)
    expect(registrarCheckpoint(comCheckpoint, 'a', 4, 5, HOJE)).toBe(comCheckpoint)
    // Registrar é sempre mudança (o placar anda); o mesmo-referência vale para o id recusado.
    expect(registrarQuestao(base, '', true, HOJE)).toBe(base)
  })
})

describe('resultadoDoCheckpoint', () => {
  it('devolve null sem itens ou com item não julgado', () => {
    expect(resultadoDoCheckpoint([])).toBeNull()
    expect(resultadoDoCheckpoint([true, null])).toBeNull()
  })

  it('conta os acertos quando todos foram julgados', () => {
    expect(resultadoDoCheckpoint([true, false, true])).toEqual({ acertos: 2, total: 3 })
    expect(resultadoDoCheckpoint([false, false])).toEqual({ acertos: 0, total: 2 })
  })
})

describe('dia local', () => {
  it('não usa UTC: 23h local ainda é o mesmo dia', () => {
    // Com toISOString, 23h de 10/03 em UTC-3 já seria 11/03, e dois dias locais
    // consecutivos de estudo colapsavam em um.
    expect(diaIso(new Date(2026, 2, 10, 23, 0, 0))).toBe('2026-03-10')
    expect(diaIso(new Date(2026, 2, 11, 20, 0, 0))).toBe('2026-03-11')
  })

  it('registra dois dias locais consecutivos estudados à noite', () => {
    const noite1 = new Date(2026, 2, 10, 23, 0, 0)
    const noite2 = new Date(2026, 2, 11, 20, 0, 0)
    const p = registrarDiaAtivo(registrarDiaAtivo(progressoVazio(), noite1), noite2)
    expect(p.diasAtivos).toEqual(['2026-03-10', '2026-03-11'])
    expect(diasComEstudo(p)).toBe(2)
  })
})

describe('normalizarProgresso', () => {
  it('devolve vazio para entrada ausente', () => {
    expect(normalizarProgresso(null, HOJE)).toEqual(progressoVazio())
    expect(normalizarProgresso(undefined, HOJE)).toEqual(progressoVazio())
    expect(normalizarProgresso('texto', HOJE)).toEqual(progressoVazio())
  })

  it('descarta versão desconhecida em vez de migrar às cegas', () => {
    expect(normalizarProgresso({ versao: 99, temas: { [REF]: { lido: true } } }, HOJE)).toEqual(
      progressoVazio(),
    )
  })

  it('preserva um estado válido, ida e volta pelo JSON', () => {
    let p = registrarConfianca(progressoVazio(), REF, 0, 4, HOJE)
    p = registrarRecuperacao(p, REF, true, HOJE)
    p = registrarCheckpoint(p, '01-fundamentos', 4, 5, HOJE)
    p = registrarQuestao(p, ITEM, false, HOJE)
    const volta = normalizarProgresso(JSON.parse(JSON.stringify(p)), HOJE)
    expect(volta).toEqual(p)
  })

  it('aceita arquivo da versão 1 gravado antes do quiz, sem o campo de questões', () => {
    // O campo entrou na v1, então o backup de ontem continua sendo um progresso válido — e a
    // importação não pode recusá-lo por causa de um campo que ainda não existia.
    const antigo: unknown = { versao: 1, temas: { [REF]: { lido: true } }, checkpoints: {}, diasAtivos: [] }
    expect(pareceProgresso(antigo)).toBe(true)
    const p = normalizarProgresso(antigo, HOJE)
    expect(p.questoes).toEqual({})
    expect(p.temas[REF]?.lido).toBe(true)
  })

  it('saneia o registro de questões, descartando o que não descreve resposta', () => {
    // `1e999` vira Infinity no JSON; contador fracionário ou negativo não existe; um registro
    // sem nenhuma resposta é sobra de arquivo, não dado de estudo.
    const entrada: unknown = JSON.parse(
      '{"versao":1,"temas":{},"checkpoints":{},"diasAtivos":[],"questoes":{' +
        '"infinidade":{"acertos":1e999,"erros":2},' +
        '"fracionario":{"acertos":1.5,"erros":-1},' +
        '"":"sem id",' +
        '"__proto__":{"acertos":9,"erros":9},' +
        '"zerado":{"acertos":0,"erros":0},' +
        '"semdata":{"acertos":3,"erros":1,"ultima":"ontem"},' +
        '"inteiro":{"acertos":0,"erros":4,"ultima":"2026-03-10T12:00:00.000Z"}}}',
    )
    const p = normalizarProgresso(entrada, HOJE)
    expect(Object.keys(p.questoes).sort()).toEqual(['infinidade', 'inteiro', 'semdata'])
    expect(p.questoes['infinidade']).toEqual({ acertos: 0, erros: 2, ultima: '' })
    expect(p.questoes['semdata']).toEqual({ acertos: 3, erros: 1, ultima: '' })
    expect(p.questoes['inteiro']).toEqual({
      acertos: 0,
      erros: 4,
      ultima: '2026-03-10T12:00:00.000Z',
    })
    expect(Object.getPrototypeOf(p.questoes)).toBe(Object.prototype)
  })

  it('descarta item de pré-teste com confiança fora de 1..5', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: { [REF]: { preTeste: [{ indice: 0, confianca: 9 }, { indice: 1, confianca: 3 }] } }, checkpoints: {}, diasAtivos: [] },
      HOJE,
    )
    expect(p.temas[REF]?.preTeste).toEqual([{ indice: 1, confianca: 3 }])
  })

  it('descarta tema sem a forma esperada, mantendo os válidos', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: { ruim: 'nada', [REF]: { lido: true } }, checkpoints: {}, diasAtivos: [] },
      HOJE,
    )
    expect(Object.keys(p.temas)).toEqual([REF])
    expect(p.temas[REF]?.lido).toBe(true)
  })

  it('reconstrói a revisão quando ela vem malformada', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: { [REF]: { revisao: { intervaloDias: -1, proximaRevisao: 'ontem' } } }, checkpoints: {}, diasAtivos: [] },
      HOJE,
    )
    expect(p.temas[REF]?.revisao.intervaloDias).toBe(1)
    expect(p.temas[REF]?.revisao.proximaRevisao).toBe('2026-03-11T12:00:00.000Z')
  })

  it('descarta dias em formato inválido', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: {}, checkpoints: {}, diasAtivos: ['2026-03-10', 'ontem', 42] },
      HOJE,
    )
    expect(p.diasAtivos).toEqual(['2026-03-10'])
  })

  it('descarta data com forma válida e calendário impossível', () => {
    // `2020-13-99` e `2021-02-30` casam com a expressão e não existem. `2024-02-29`
    // existe, porque 2024 é bissexto — 2026 não é, e por isso não serve de exemplo.
    const p = normalizarProgresso(
      { versao: 1, temas: {}, checkpoints: {}, diasAtivos: ['2020-13-99', '2021-02-30', '2024-02-29'] },
      HOJE,
    )
    expect(p.diasAtivos).toEqual(['2024-02-29'])
  })

  it('recusa chaves perigosas sem tocar no protótipo', () => {
    // `out['__proto__'] = x` trocaria o prototipo do objeto em vez de criar propriedade.
    const entrada: unknown = JSON.parse(
      '{"versao":1,"temas":{"__proto__":{"lido":true}},"checkpoints":{"__proto__":{"acertos":9,"total":9}},"diasAtivos":[]}',
    )
    const p = normalizarProgresso(entrada, HOJE)
    expect(Object.getPrototypeOf(p.temas)).toBe(Object.prototype)
    expect(Object.getPrototypeOf(p.checkpoints)).toBe(Object.prototype)
    expect(Object.keys(p.temas)).toEqual([])
    expect(Object.keys(p.checkpoints)).toEqual([])
    expect(({} as Record<string, unknown>).lido).toBeUndefined()
  })

  it('ignora checkpoint sem números', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: {}, checkpoints: { '01-fundamentos': { acertos: 'x' } }, diasAtivos: [] },
      HOJE,
    )
    expect(p.checkpoints).toEqual({})
  })

  it('recusa número não finito: 1e999 vira Infinity no JSON', () => {
    // Sem isso, clicar "Errei" num tema com intervalo Infinity lançava
    // `RangeError: Invalid time value` ao formatar a data.
    const entrada: unknown = JSON.parse(
      '{"versao":1,"temas":{"a#TEMA-01":{"revisao":{"intervaloDias":1e999,"proximaRevisao":"2026-03-11T12:00:00.000Z","passagens":1e999}}},"checkpoints":{"x":{"acertos":1e999,"total":1e999}},"diasAtivos":[]}',
    )
    const p = normalizarProgresso(entrada, HOJE)
    expect(p.temas['a#TEMA-01']?.revisao.intervaloDias).toBe(1)
    expect(p.temas['a#TEMA-01']?.revisao.passagens).toBe(0)
    expect(p.checkpoints).toEqual({})
  })

  it('recusa checkpoint com acertos maior que o total ou fracionário', () => {
    const p = normalizarProgresso(
      {
        versao: 1,
        temas: {},
        checkpoints: {
          a: { acertos: 9, total: 5 },
          b: { acertos: 1.5, total: 5 },
          c: { acertos: -1, total: 5 },
          d: { acertos: 2, total: 0 },
          e: { acertos: 4, total: 5 },
        },
        diasAtivos: [],
      },
      HOJE,
    )
    expect(Object.keys(p.checkpoints)).toEqual(['e'])
  })

  it('deduplica e ordena os dias ativos', () => {
    const p = normalizarProgresso(
      { versao: 1, temas: {}, checkpoints: {}, diasAtivos: ['2026-03-11', '2026-03-10', '2026-03-11'] },
      HOJE,
    )
    expect(p.diasAtivos).toEqual(['2026-03-10', '2026-03-11'])
  })
})
