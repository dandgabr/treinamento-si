import { describe, expect, it } from 'vitest'
import type { Conteudo, Tema } from '../../src/domain/types'
import { derivarBanco, validarBanco, type Questao } from './questoes'

const REF = '01-fundamentos#TEMA-01'

function tema(over: Partial<Tema> = {}): Tema {
  return {
    ref: REF,
    areaId: '01-fundamentos',
    temaId: 'TEMA-01',
    titulo: 'Segurança da informação',
    nivel: 'base',
    tempoEstimado: '30 min',
    objetivo: 'fazer algo observável',
    certificacoes: [],
    preRequisitos: [],
    atendeObjetivo: [1],
    relacoes: { complementa: [], aprofundadoPor: [], aplicadoEm: [], naoConfundirCom: [] },
    fontes: [{ titulo: 'CSEC2017', url: 'https://exemplo/1', tipo: 'primaria' }],
    revisaoInicialDias: [1, 7, 30],
    proximaRevisao: null,
    statusVerificacao: 'verificado',
    intro: '<p>abertura</p>',
    secoes: [],
    preTeste: [{ pergunta: 'o que é?' }],
    recuperacao: [],
    errosComuns: [
      { equivoco: 'Achar que é sinônimo de TI', porque: 'o escopo é a informação', correto: 'O escopo é a informação, não o meio' },
      { equivoco: 'Deixar só para o time de segurança', porque: 'a decisão é do negócio', correto: 'A decisão é do negócio, com apoio técnico' },
      { equivoco: 'Confundir com privacidade', porque: 'privacidade trata de dado pessoal', correto: 'Privacidade trata de dado pessoal; segurança, de todo dado' },
      { equivoco: 'Ignorar o jurídico', porque: 'há obrigação legal', correto: 'Há obrigação legal, e ela entra na conta' },
    ],
    mermaid: [],
    ...over,
  }
}

function conteudo(sobre: Partial<Tema> = {}): Conteudo {
  const t = tema(sobre)
  // Duas areas: sem a segunda, "item apontando para tema de outra area" cairia antes em
  // "ref inexistente" e o caso nao testaria nada.
  const segunda = { ...tema(), ref: '02-grc#TEMA-01', areaId: '02-grc', temaId: 'TEMA-01' }
  return {
    meta: { geradoEm: '2026-01-01T00:00:00.000Z', totais: { areas: 2, temas: 2, paginas: 0 } },
    areas: [
      {
        areaId: '01-fundamentos',
        areaNome: 'Fundamentos',
        ordemEstudo: 1,
        nivel: 'base',
        ancoragem: ['responder pelo programa'],
        certificacoes: [],
        preRequisitos: [],
        temas: [REF],
        fontes: [],
        statusVerificacao: 'verificado',
        guia: {
          areaId: '01-fundamentos',
          intro: '',
          secoes: [],
          checkpoint: [],
          criterio: 'acertar 4 dos 5 itens sem consultar os temas',
          tabelaTemas: null,
          objetivos: null,
          atividades: null,
          mermaid: [],
        },
      },
      {
        areaId: '02-grc',
        areaNome: 'Governança',
        ordemEstudo: 2,
        nivel: 'base',
        ancoragem: ['responder pelo programa'],
        certificacoes: [],
        preRequisitos: [],
        temas: [segunda.ref],
        fontes: [],
        statusVerificacao: 'verificado',
        guia: {
          areaId: '02-grc',
          intro: '',
          secoes: [],
          checkpoint: [],
          criterio: 'acertar 4 dos 5 itens sem consultar os temas',
          tabelaTemas: null,
          objetivos: null,
          atividades: null,
          mermaid: [],
        },
      },
    ],
    temas: { [REF]: t, [segunda.ref]: segunda },
    ordemEstudo: [REF, segunda.ref],
    paginas: [],
  }
}

/** Um item válido, com o campo indicado quebrado — mutação mínima por caso. */
function item(over: Partial<Questao> = {}): Questao {
  return {
    id: `${REF}#E01`,
    ref: REF,
    origem: 'erro-comum',
    fonte: { titulo: 'CSEC2017', url: 'https://exemplo/1', tipo: 'primaria' },
    status: 'rascunho',
    enunciado: 'Sobre o tema: um colega afirma que X. Qual é a correção?',
    alternativas: ['certa', 'errada 1', 'errada 2'],
    correta: 0,
    justificativa: 'porque o escopo é a informação',
    ...over,
  }
}

function bancoCom(itens: Questao[]) {
  return { porArea: { '01-fundamentos': itens }, total: itens.length }
}

describe('derivarBanco', () => {
  it('deriva um item por linha de erro comum, com o correto como gabarito', () => {
    const c = conteudo()
    const banco = derivarBanco(c)
    const itens = banco.porArea['01-fundamentos']!
    expect(itens).toHaveLength(4)

    const primeiro = itens[0]!
    expect(primeiro.origem).toBe('erro-comum')
    expect(primeiro.status).toBe('rascunho')
    expect(primeiro.alternativas[primeiro.correta]).toBe('O escopo é a informação, não o meio')
    expect(primeiro.justificativa).toBe('o escopo é a informação')
    // Os distratores saem do proprio material: sao os equivocos das outras linhas.
    expect(primeiro.alternativas).toContain('Confundir com privacidade')
  })

  it('nao usa o proprio equivoco como distrator', () => {
    const itens = derivarBanco(conteudo()).porArea['01-fundamentos']!
    for (const q of itens) {
      const gabarito = q.alternativas[q.correta]
      expect(gabarito).not.toBe(q.enunciado)
      // Cada alternativa aparece uma vez so.
      expect(new Set(q.alternativas).size).toBe(q.alternativas.length)
    }
  })

  it('herda a fonte do tema: nada entra sem procedencia', () => {
    const itens = derivarBanco(conteudo()).porArea['01-fundamentos']!
    for (const q of itens) {
      expect(q.fonte.url).toBe('https://exemplo/1')
      expect(q.fonte.tipo).toBe('primaria')
    }
  })

  it('descarta resposta longa demais para ser alternativa', () => {
    const c = conteudo({
      recuperacao: [
        { pergunta: 'Q1', resposta: 'x'.repeat(400) },
        { pergunta: 'Q2', resposta: 'curta 1' },
        { pergunta: 'Q3', resposta: 'curta 2' },
        { pergunta: 'Q4', resposta: 'curta 3' },
      ],
    })
    const itens = derivarBanco(c).porArea['01-fundamentos']!
    expect(itens.filter((q) => q.origem === 'recuperacao')).toHaveLength(3)
    expect(itens.some((q) => q.id.endsWith('#R01'))).toBe(false)
  })

  it('nao deriva item quando falta distrator', () => {
    // Uma linha so: nao ha de onde tirar alternativa errada, e item de duas opcoes nao mede.
    const c = conteudo({ errosComuns: [{ equivoco: 'E', porque: 'P', correto: 'C' }] })
    expect(derivarBanco(c).porArea['01-fundamentos']).toHaveLength(0)
  })

  it('espalha o gabarito em vez de deixar sempre na primeira posicao', () => {
    const itens = derivarBanco(conteudo()).porArea['01-fundamentos']!
    const posicoes = new Set(itens.map((q) => q.correta))
    expect(posicoes.size).toBeGreaterThan(1)
  })

  it('e reproduzivel: duas derivacoes dao o mesmo resultado', () => {
    const a = JSON.stringify(derivarBanco(conteudo()))
    const b = JSON.stringify(derivarBanco(conteudo()))
    expect(a).toBe(b)
  })
})

describe('validarBanco', () => {
  it('aprova o banco derivado do proprio conteudo', () => {
    const c = conteudo()
    expect(validarBanco(derivarBanco(c), c)).toEqual([])
  })

  const casos: Array<[string, (q: Questao) => void, string]> = [
    ['acusa ref inexistente', (q) => void (q.ref = '99-futuro#TEMA-01'), 'ref inexistente'],
    [
      'acusa item de area apontando para outra area',
      (q) => void (q.ref = '02-grc#TEMA-01'),
      'tema de outra area',
    ],
    ['acusa item sem fonte', (q) => void (q.fonte = { titulo: '', url: '', tipo: '' }), 'sem fonte'],
    ['acusa enunciado vazio', (q) => void (q.enunciado = ''), 'enunciado vazio'],
    [
      'acusa menos de tres alternativas',
      (q) => void (q.alternativas = ['a', 'b']),
      '2 alternativa(s)',
    ],
    [
      'acusa alternativa repetida',
      (q) => void (q.alternativas = ['a', 'a', 'b']),
      'alternativa repetida',
    ],
    [
      'acusa indice da correta fora da lista',
      (q) => void (q.correta = 9),
      'indice da correta fora da lista',
    ],
    ['acusa item sem justificativa', (q) => void (q.justificativa = ''), 'sem justificativa'],
    ['acusa status invalido', (q) => void (q.status = 'aprovado' as never), 'status invalido'],
    ['acusa id repetido', () => {}, 'id repetido'],
  ]

  it.each(casos)('%s', (_nome, mutar, esperado) => {
    const c = conteudo()
    const alvo = item()
    mutar(alvo)
    // `id repetido` precisa de dois itens iguais; os demais, de um só.
    const itens = esperado === 'id repetido' ? [item(), item()] : [alvo]
    const problemas = validarBanco(bancoCom(itens), c).join('\n')
    expect(problemas).toContain(esperado)
  })

  it('acusa area sem nenhum item', () => {
    const c = conteudo()
    const problemas = validarBanco({ porArea: { '01-fundamentos': [] }, total: 0 }, c)
    expect(problemas.join('\n')).toContain('area sem nenhum item derivado')
  })

  it('acusa arquivo de area que nao existe no conteudo', () => {
    const c = conteudo()
    const problemas = validarBanco({ porArea: { '99-fantasma': [item()] }, total: 1 }, c)
    expect(problemas.join('\n')).toContain('area inexistente')
  })

  it('acusa gabarito concentrado numa posicao', () => {
    // 30 itens com a correta sempre na primeira: acertar deixaria de medir algo.
    const c = conteudo()
    const itens = Array.from({ length: 30 }, (_, i) => item({ id: `${REF}#E${i}`, correta: 0 }))
    expect(validarBanco(bancoCom(itens), c).join('\n')).toContain('gabarito concentrado')
  })
})
