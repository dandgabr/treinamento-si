import { describe, expect, it } from 'vitest'
import type { Conteudo, Fonte, ParQA, Tema } from '../../src/domain/types'
import { derivarBanco, validarBanco, type Questao } from './questoes'

const REF = '01-fundamentos#TEMA-01'
const AREA = '01-fundamentos'
/** O `ref` que o item de checkpoint usa: o guia da area, e nao um tema. */
const REF_DO_GUIA = `${AREA}#GUIA`

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

/** O que a area publica e o item de guia herda: as fontes dela e o checkpoint da secao 9. */
interface DoGuia {
  checkpoint?: ParQA[]
  fontes?: Fonte[]
}

function conteudo(sobre: Partial<Tema> = {}, doGuia: DoGuia = {}): Conteudo {
  const t = tema(sobre)
  // Duas areas: sem a segunda, "item apontando para tema de outra area" cairia antes em
  // "ref inexistente" e o caso nao testaria nada.
  const segunda = { ...tema(), ref: '02-grc#TEMA-01', areaId: '02-grc', temaId: 'TEMA-01' }
  return {
    meta: { geradoEm: '2026-01-01T00:00:00.000Z', totais: { areas: 2, temas: 2, paginas: 0 } },
    areas: [
      {
        areaId: AREA,
        areaNome: 'Fundamentos',
        ordemEstudo: 1,
        nivel: 'base',
        ancoragem: ['responder pelo programa'],
        certificacoes: [],
        preRequisitos: [],
        temas: [REF],
        fontes: doGuia.fontes ?? [],
        statusVerificacao: 'verificado',
        guia: {
          areaId: AREA,
          intro: '',
          secoes: [],
          checkpoint: doGuia.checkpoint ?? [],
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

const FONTE_DA_AREA: Fonte = {
  titulo: 'Guia da área — NIST CSF 2.0',
  url: 'https://exemplo/guia',
  tipo: 'primaria',
}

/**
 * Quatro pares de checkpoint do guia. As respostas cabem numa alternativa e nao repetem
 * nenhuma linha da tabela de erros comuns do tema — que tambem entra no conjunto de
 * distratores, e uma repeticao seria descartada em silencio.
 */
const CHECKPOINT: ParQA[] = [
  {
    pergunta: 'Quantas designações a norma exige, e por qual entregável cada uma responde?',
    resposta: 'Duas: o diretor designado responde pela política; o encarregado, pelos dados pessoais',
  },
  {
    pergunta: 'Qual intervalo de revisão se aplica a um tema acertado sem consulta?',
    resposta: 'D+1, D+7 e D+30, e o erro devolve o item pela metade do prazo',
  },
  {
    pergunta: 'Uma conta administrativa sem segundo fator: ameaça, vulnerabilidade ou risco?',
    resposta: 'Vulnerabilidade, porque é a fraqueza que uma fonte de ameaça exploraria',
  },
  {
    pergunta: 'Quais modos de falha a definição legal de segurança da informação cobre?',
    resposta: 'Acesso, uso, divulgação, interrupção, modificação e destruição',
  },
]

/** O conteudo com o guia preenchido, que e o que produz os itens de checkpoint. */
function conteudoComGuia(doGuia: DoGuia = {}): Conteudo {
  return conteudo({}, { fontes: [FONTE_DA_AREA], checkpoint: CHECKPOINT, ...doGuia })
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
    // Os distratores saem do proprio material: as DUAS colunas das linhas do tema — o
    // equivoco e o correto. Antes so o equivoco entrava, e o gabarito ficava sendo a
    // alternativa mais longa na maioria dos itens.
    const doMaterial = new Set((tema().errosComuns ?? []).flatMap((l) => [l.equivoco, l.correto]))
    for (const alternativa of primeiro.alternativas) expect(doMaterial.has(alternativa)).toBe(true)
  })

  it('aproxima o tamanho dos distratores do gabarito', () => {
    // A coluna "o que e correto" e mais longa que a do equivoco no material inteiro, entao
    // so com equivocos no conjunto dava para acertar contando letras: o gabarito era a
    // alternativa mais longa em 79% dos itens de erro comum e em 100% dos de recuperacao.
    const c = conteudo({
      errosComuns: ['A', 'B', 'C', 'D'].map((letra) => ({
        equivoco: `eq${letra}`,
        porque: 'p',
        correto: `Correção ${letra}, com o detalhe que a explica`,
      })),
    })
    const itens = derivarBanco(c).porArea['01-fundamentos']!
    const gabarito = itens[0]!.alternativas[itens[0]!.correta]!
    for (const [i, alternativa] of itens[0]!.alternativas.entries()) {
      if (i === itens[0]!.correta) continue
      // Veio da coluna do correto (comprida), nao do equivoco curto, e do tamanho do
      // gabarito — nao da para escolher pelo comprimento.
      expect(alternativa.length).toBeGreaterThan(20)
      expect(Math.abs(alternativa.length - gabarito.length)).toBeLessThanOrEqual(8)
    }
  })

  it('nao usa o proprio equivoco como distrator', () => {
    const linhas = tema().errosComuns ?? []
    const itens = derivarBanco(conteudo()).porArea['01-fundamentos']!
    for (const q of itens) {
      if (q.origem !== 'erro-comum') continue
      const linha = linhas[Number(q.id.slice(-2)) - 1]!
      // A alternativa nao pode carregar a afirmacao que o proprio enunciado pede para
      // corrigir: responder com ela seria dizer que o equivoco e o equivoco.
      expect(q.alternativas).not.toContain(linha.equivoco)
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

  // O checkpoint mora no guia da AREA, e nao num tema: sem uma convencao de `ref` os 102
  // itens dos guias ficavam de fora do banco, embora a §7 do plano os liste como fonte.
  describe('checkpoint do guia da area', () => {
    function itensDoGuia(c: Conteudo = conteudoComGuia()): Questao[] {
      return derivarBanco(c).porArea[AREA]!.filter((q) => q.origem === 'checkpoint')
    }

    it('deriva um item por par do checkpoint, com a resposta como gabarito', () => {
      const itens = itensDoGuia()
      expect(itens).toHaveLength(CHECKPOINT.length)

      const primeiro = itens[0]!
      expect(primeiro.id).toBe(`${REF_DO_GUIA}#C01`)
      expect(primeiro.ref).toBe(REF_DO_GUIA)
      expect(primeiro.status).toBe('rascunho')
      expect(primeiro.enunciado).toBe(CHECKPOINT[0]!.pergunta)
      expect(primeiro.alternativas[primeiro.correta]).toBe(CHECKPOINT[0]!.resposta)
      // Nada de justificativa inventada: o checkpoint nao tem coluna de "por que isto esta
      // errado", e a resposta do material ja e o gabarito.
      expect(primeiro.justificativa).toBe('')
    })

    it('herda a fonte da area: o item de guia nao tem tema de onde herdar', () => {
      for (const q of itensDoGuia()) {
        expect(q.fonte.url).toBe(FONTE_DA_AREA.url)
        expect(q.fonte.tipo).toBe(FONTE_DA_AREA.tipo)
      }
    })

    it('tira o distrator do guia e da area, nunca de fora do material', () => {
      // Os candidatos sao as respostas dos outros pares do MESMO guia e o material dos temas
      // da area — as duas colunas de cada tabela de erros comuns e as respostas de recuperacao.
      const doMaterial = new Set([
        ...CHECKPOINT.map((p) => p.resposta),
        ...(tema().errosComuns ?? []).flatMap((linha) => [linha.equivoco, linha.correto]),
      ])
      for (const q of itensDoGuia()) {
        for (const alternativa of q.alternativas) expect(doMaterial.has(alternativa)).toBe(true)
        // A resposta do proprio par nao pode aparecer duas vezes, nem virar distrator.
        expect(new Set(q.alternativas).size).toBe(q.alternativas.length)
      }
    })

    it('descarta a resposta longa demais para ser alternativa', () => {
      const c = conteudoComGuia({
        checkpoint: [
          ...CHECKPOINT,
          { pergunta: 'Descreva o processo inteiro', resposta: 'x'.repeat(400) },
        ],
      })
      expect(itensDoGuia(c)).toHaveLength(CHECKPOINT.length)
      expect(itensDoGuia(c).some((q) => q.id.endsWith('#C05'))).toBe(false)
    })

    it('nao deriva item de checkpoint quando falta distrator', () => {
      // Um par so, e nenhuma linha de erro comum no tema: nao ha de onde tirar alternativa.
      const c = conteudo({ errosComuns: [] }, { fontes: [FONTE_DA_AREA], checkpoint: [CHECKPOINT[0]!] })
      expect(itensDoGuia(c)).toHaveLength(0)
    })

    it('entra depois dos itens dos temas, na ordem de leitura da area', () => {
      const itens = derivarBanco(conteudoComGuia()).porArea[AREA]!
      const origens = itens.map((q) => q.origem)
      expect(origens.indexOf('checkpoint')).toBeGreaterThan(origens.lastIndexOf('recuperacao'))
    })

    it('o banco com itens de guia passa no gate', () => {
      const c = conteudoComGuia()
      expect(validarBanco(derivarBanco(c), c)).toEqual([])
    })
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
      'material de outra area',
    ],
    // Os dois lados da convencao de `ref`: checkpoint existe so no guia da area, e item de
    // tema so aponta para um tema. Trocados, a procedencia do item deixa de ser legivel.
    [
      'acusa item de checkpoint apontando para um tema',
      (q) => void (q.origem = 'checkpoint'),
      'item de checkpoint aponta para 01-fundamentos#GUIA',
    ],
    [
      'acusa item de tema apontando para o guia',
      (q) => {
        q.ref = REF_DO_GUIA
        q.id = `${REF_DO_GUIA}#C01`
      },
      'item de tema, para 01-fundamentos#TEMA-NN',
    ],
    [
      'acusa ref de guia de area inexistente',
      (q) => {
        q.ref = '99-futuro#GUIA'
        q.id = '99-futuro#GUIA#C01'
        q.origem = 'checkpoint'
      },
      'ref inexistente',
    ],
    ['acusa item sem fonte', (q) => void (q.fonte = { titulo: '', url: '', tipo: '' }), 'sem fonte'],
    ['acusa enunciado vazio', (q) => void (q.enunciado = ''), 'enunciado vazio'],
    [
      'acusa id fora do padrao',
      (q) => void (q.id = `${REF}#E`),
      'id fora do padrao',
    ],
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

  // A revisao humana escreve o `status`; todo o resto tem de vir do material. Sem esta
  // conferencia, um item com o gabarito trocado a mao passava por todas as checagens acima
  // (forma, fonte, indice valido) e o `build:desktop` o embarcava.
  describe('fidelidade ao material', () => {
    it('aceita o banco derivado com o status trocado a mao', () => {
      const c = conteudo()
      const banco = derivarBanco(c)
      banco.porArea['01-fundamentos']![0]!.status = 'verificado'
      expect(validarBanco(banco, c)).toEqual([])
    })

    it('acusa item com o gabarito trocado a mao', () => {
      const c = conteudo()
      const banco = derivarBanco(c)
      const alvo = banco.porArea['01-fundamentos']![0]!
      alvo.correta = (alvo.correta + 1) % alvo.alternativas.length

      const problemas = validarBanco(banco, c)
      // Um erro so: o item continua com a forma valida, e a troca do gabarito nao aparece
      // em nenhuma outra checagem.
      expect(problemas).toHaveLength(1)
      expect(problemas[0]).toContain('banco adulterado: 1 item')
      expect(problemas[0]).toContain('conteudo diferente do que o material deriva')
      expect(problemas[0]).toContain(alvo.id)
    })

    it('acusa item que nao vem do material', () => {
      const c = conteudo()
      const banco = derivarBanco(c)
      const intruso = item({ id: `${REF}#E99`, justificativa: 'texto escrito a mao' })
      banco.porArea['01-fundamentos']!.push(intruso)

      const problemas = validarBanco(banco, c).join('\n')
      expect(problemas).toContain('banco adulterado')
      expect(problemas).toContain(`${REF}#E99: nao vem do material`)
    })

    it('acusa item derivado que sumiu do banco', () => {
      const c = conteudo()
      const banco = derivarBanco(c)
      const area = banco.porArea['01-fundamentos']!
      const removido = area[area.length - 1]!
      banco.porArea['01-fundamentos'] = area.filter((q) => q.id !== removido.id)

      const problemas = validarBanco(banco, c).join('\n')
      expect(problemas).toContain('banco adulterado')
      expect(problemas).toContain(`${removido.id}: o material deriva este item e o banco nao o tem`)
    })
  })
})
