import { describe, expect, it } from 'vitest'
import type { Conteudo, Fonte, ParQA, Tema } from '../../src/domain/types'
import { derivarBanco, validarBanco, type Questao } from './questoes'

const REF = '01-fundamentos#TEMA-01'
const AREA = '01-fundamentos'

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

/** O que a área publica no guia: as fontes dela e o checkpoint da seção 9. */
interface DoGuia {
  checkpoint?: ParQA[]
  fontes?: Fonte[]
}

function conteudo(sobre: Partial<Tema> = {}, doGuia: DoGuia = {}): Conteudo {
  const t = tema(sobre)
  // Duas áreas: sem a segunda, "item apontando para tema de outra área" cairia antes em
  // "ref inexistente" e o caso não testaria nada.
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
 * As duas seções discursivas do material: a recuperação ativa do tema e o checkpoint do guia.
 *
 * Elas continuam no material — o tema e o guia as exibem — e não produzem item nenhum. A
 * pergunta delas é aberta, e resposta de pergunta aberta não é alternativa de múltipla
 * escolha. Os fixtures existem para provar isso: sem eles, "não vira item" passaria com as
 * seções vazias, que é o caso fácil.
 */
const RECUPERACAO: ParQA[] = [
  { pergunta: 'Quais modos de falha a definição legal cobre?', resposta: 'Acesso, uso, divulgação, interrupção, modificação e destruição' },
  { pergunta: 'Por que a segurança não é só do time de segurança?', resposta: 'Porque a decisão é do negócio, com apoio técnico' },
  { pergunta: 'Explique a diferença entre os dois escopos.', resposta: 'O escopo é a informação, não o meio' },
]

const CHECKPOINT: ParQA[] = [
  { pergunta: 'Quantas designações a norma exige, e por qual entregável cada uma responde?', resposta: 'Duas: o diretor designado responde pela política; o encarregado, pelos dados pessoais' },
  { pergunta: 'Qual intervalo de revisão se aplica a um tema acertado sem consulta?', resposta: 'D+1, D+7 e D+30, e o erro devolve o item pela metade do prazo' },
  { pergunta: 'Uma conta administrativa sem segundo fator: ameaça, vulnerabilidade ou risco?', resposta: 'Vulnerabilidade, porque é a fraqueza que uma fonte de ameaça exploraria' },
]

/** O conteúdo com as duas seções discursivas cheias. */
function conteudoComDiscursivas(sobre: Partial<Tema> = {}): Conteudo {
  return conteudo({ ...sobre, recuperacao: RECUPERACAO }, { fontes: [FONTE_DA_AREA], checkpoint: CHECKPOINT })
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
    // Os distratores saem do próprio material: as DUAS colunas das linhas do tema — o
    // equívoco e o correto. Antes só o equívoco entrava, e o gabarito ficava sendo a
    // alternativa mais longa na maioria dos itens.
    const doMaterial = new Set((tema().errosComuns ?? []).flatMap((l) => [l.equivoco, l.correto]))
    for (const alternativa of primeiro.alternativas) expect(doMaterial.has(alternativa)).toBe(true)
  })

  it('aproxima o tamanho dos distratores do gabarito', () => {
    // A coluna "o que e correto" e mais longa que a do equivoco no material inteiro, entao
    // so com equivocos no conjunto dava para acertar contando letras: o gabarito era a
    // alternativa mais longa em 79% dos itens.
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
      expect(q.origem).toBe('erro-comum')
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
    // O gabarito de uma linha e o `correto` dela: longa demais, nao vira alternativa, e a
    // linha inteira sai do banco em vez de virar item de prosa.
    const c = conteudo({
      errosComuns: [
        { equivoco: 'eqA', porque: 'p', correto: 'x'.repeat(400) },
        { equivoco: 'eqB', porque: 'p', correto: 'Correção B, curta o bastante para a alternativa' },
        { equivoco: 'eqC', porque: 'p', correto: 'Correção C, curta o bastante para a alternativa' },
        { equivoco: 'eqD', porque: 'p', correto: 'Correção D, curta o bastante para a alternativa' },
      ],
    })
    const itens = derivarBanco(c).porArea['01-fundamentos']!
    expect(itens).toHaveLength(3)
    expect(itens.some((q) => q.id.endsWith('#E01'))).toBe(false)
    for (const q of itens) expect(q.alternativas).not.toContain('x'.repeat(400))
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

  describe('o enunciado', () => {
    /** Quatro linhas do MESMO tema: uma vira gabarito do item e as outras, os distratores. */
    function comEquivocos(equivocos: string[]) {
      return conteudo({
        errosComuns: equivocos.map((equivoco, i) => ({
          equivoco,
          porque: `p${i}`,
          correto: `Correção ${i}, com o detalhe que a explica`,
        })),
      })
    }

    it('nao repete as aspas que a celula ja traz do material', () => {
      // Linha real de `13-ofensiva-pentest#TEMA-01#E01` (frase inteira entre aspas) e de
      // `10-operacoes-soc#TEMA-02#E01` (termo entre aspas no meio da celula): as duas saiam
      // como `""...""` e `..."registrar" com "ter log""`, porque a moldura do enunciado cita.
      const itens = derivarBanco(
        comEquivocos([
          '"Pentest é a forma mais completa de achar vulnerabilidade"',
          'Confundir "registrar" com "ter log"',
          'Supor que log basta',
          'Tratar plantão como detalhe',
        ]),
      ).porArea['01-fundamentos']!

      expect(itens[0]!.enunciado).toContain(
        '"Pentest é a forma mais completa de achar vulnerabilidade". Qual é a correção?',
      )
      expect(itens[1]!.enunciado).toContain('"Confundir registrar com ter log". Qual é a correção?')
      // A citacao da moldura e a unica do enunciado: aspas duplas nao voltam por nenhum dos
      // dois lados, e a celula continua legivel.
      for (const q of itens) {
        expect(q.enunciado).not.toContain('""')
        expect(q.enunciado.match(/"/g) ?? []).toHaveLength(2)
      }
    })

    it('usa moldura neutra quando a celula nao tem sujeito', () => {
      // `10-operacoes-soc#TEMA-06#E01`: `um colega afirma que "Automatizar primeiro a ação mais
      // visível, como isolar máquina"` não é oração — a prescrição não completa "afirma que".
      const itens = derivarBanco(
        comEquivocos([
          'Automatizar primeiro a ação mais visível, como isolar máquina',
          'Tratar automação como projeto de ferramenta',
          'Manter regras e playbooks sem controle de versão',
          'Revisar cobertura uma vez por ano',
        ]),
      ).porArea['01-fundamentos']!

      const primeiro = itens[0]!
      expect(primeiro.enunciado).not.toContain('um colega afirma que')
      expect(primeiro.enunciado).toContain(
        'é comum ouvir o seguinte: "Automatizar primeiro a ação mais visível, como isolar máquina".',
      )
      expect(primeiro.enunciado).toContain('Qual é a correção?')
    })

    it('desconta o adverbio que abre a prescricao negada', () => {
      // `10-operacoes-soc#TEMA-03#E04` é `Não registrar a versão do framework usada`: a mesma
      // prescrição sem sujeito, agora negada. Sem descontar o advérbio, a célula voltava para a
      // moldura de afirmação e o enunciado quebrava. `Não treinamos modelo` continua afirmação.
      const itens = derivarBanco(
        comEquivocos([
          'Não registrar a versão do framework usada',
          'Só bloquear o domínio sem medir o efeito',
          'Backup resolve integridade',
          'Evidência é papelada',
        ]),
      ).porArea['01-fundamentos']!

      expect(itens[0]!.enunciado).toContain(
        'é comum ouvir o seguinte: "Não registrar a versão do framework usada"',
      )
      expect(itens[1]!.enunciado).toContain(
        'é comum ouvir o seguinte: "Só bloquear o domínio sem medir o efeito"',
      )
      // O advérbio não transforma oração em prescrição: quem tem sujeito e verbo fica onde estava.
      expect(itens[2]!.enunciado).toContain('um colega afirma que "Backup resolve integridade"')
    })

    it('mantem a moldura de afirmacao quando a celula tem sujeito', () => {
      // O outro lado da mesma regra: a maioria das linhas do material afirma algo, e nelas o
      // enunciado não pode mudar — mudar derrubaria o selo de revisão sem defeito nenhum.
      const itens = derivarBanco(
        comEquivocos([
          'Antivírus é preventivo ou detectivo',
          'Backup resolve integridade',
          'Controle aprovado é controle operante',
          'Evidência é papelada',
        ]),
      ).porArea['01-fundamentos']!

      expect(itens[0]!.enunciado).toBe(
        'Sobre Segurança da informação: um colega afirma que "Antivírus é preventivo ou detectivo". ' +
          'Qual é a correção?',
      )
    })

    it('troca substantivo por infinitivo: o custo do falso positivo e de tom', () => {
      // `Delegar operação é delegar responsabilidade` tem sujeito — a oração infinitiva — e era
      // gramatical na moldura antiga. Separá-la de `Automatizar primeiro a ação visível` exigiria
      // análise sintática, que o gerador não faz: a regra olha o primeiro token e as duas caem na
      // moldura neutra. Como ali a frase é citada e não afirmada, a frase inteira continua
      // correta; o que se perde é tom. `Cluster`, `tier`, `insider` e `qualquer` são substantivos
      // e ficam de fora da regra.
      const itens = derivarBanco(
        comEquivocos([
          'Delegar operação é delegar responsabilidade',
          'Cluster gerenciado transfere toda a segurança da carga ao provedor',
          'Tier do CSF é nota de maturidade',
          'Qualquer modo do AES entrega autenticação',
        ]),
      ).porArea['01-fundamentos']!

      expect(itens[0]!.enunciado).toContain('é comum ouvir o seguinte: "Delegar operação')
      for (const q of [itens[1]!, itens[2]!, itens[3]!]) {
        expect(q.enunciado).toContain('um colega afirma que')
      }
    })
  })

  // A recuperação ativa e o checkpoint continuam no material e na tela, mas não viram item:
  // a pergunta deles é aberta ("cite...", "explique por que..."), e nenhuma alternativa é "a
  // resposta" — o gabarito só se reconhece pela forma da frase. Decisão do dono.
  describe('as secoes discursivas do material', () => {
    it('nao viram item, nem quando o material esta cheio', () => {
      const c = conteudoComDiscursivas()
      const itens = derivarBanco(c).porArea[AREA]!

      // Quatro itens, um por linha da tabela de erros comuns — e nenhum a mais.
      expect(itens).toHaveLength(4)
      for (const q of itens) {
        expect(q.origem).toBe('erro-comum')
        expect(q.ref).toBe(REF)
        expect(q.id).toMatch(/#E\d+$/)
        // O enunciado é o da tabela de erros comuns; a pergunta aberta do material não entra.
        expect(RECUPERACAO.some((p) => q.enunciado === p.pergunta.trim())).toBe(false)
        expect(CHECKPOINT.some((p) => q.enunciado === p.pergunta.trim())).toBe(false)
      }
      // Nenhum id carrega a letra das duas origens que saíram (#R de recuperação, #C de
      // checkpoint), e nenhum item aponta para o guia da área.
      expect(itens.some((q) => /#[RC]\d+$/.test(q.id))).toBe(false)
      expect(itens.some((q) => q.ref.endsWith('#GUIA'))).toBe(false)

      // E o material com as duas seções intactas continua aprovado pelo gate: elas não
      // deixaram de existir, só não são item de múltipla escolha.
      expect(validarBanco(derivarBanco(c), c)).toEqual([])
    })

    it('nao salvam um tema cuja tabela de erros comuns nao existe', () => {
      // Sem tabela de erros comuns não há par (o que se erra -> o que é correto) e não há
      // item: as duas seções discursivas são exercício, não fonte de alternativa.
      const c = conteudoComDiscursivas({ errosComuns: [] })
      expect(derivarBanco(c).porArea[AREA]).toEqual([])
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
    [
      // O `id` so tem uma letra possivel hoje (`E`, da tabela de erros comuns): a `C` do
      // checkpoint e a `R` da recuperacao nao podem voltar por engano sem o gate ver.
      'acusa id com a letra de uma origem extinta',
      (q) => void (q.id = `${REF}#R01`),
      'id fora do padrao',
    ],
    [
      'acusa id apontando para o guia da area',
      (q) => void (q.id = `${AREA}#GUIA#C01`),
      'id fora do padrao',
    ],
    ['acusa item sem fonte', (q) => void (q.fonte = { titulo: '', url: '', tipo: '' }), 'sem fonte'],
    [
      'acusa fonte com esquema nao permitido',
      (q) => void (q.fonte = { ...q.fonte, url: 'javascript:alert(1)' }),
      'esquema nao permitido',
    ],
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
      'acusa alternativa vazia',
      (q) => void (q.alternativas = ['a', '', 'b']),
      'alternativa vazia',
    ],
    [
      'acusa indice da correta fora da lista',
      (q) => void (q.correta = 9),
      'indice da correta fora da lista',
    ],
    ['acusa item sem justificativa', (q) => void (q.justificativa = ''), 'sem justificativa'],
    [
      'acusa o lexico proibido no texto do item',
      (q) => void (q.enunciado = 'Uma solução abrangente para o tema'),
      'lexico proibido',
    ],
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

    it('acusa origem trocada a mao', () => {
      // Um item de recuperacao na mao — a origem que o dono mandou tirar — nao passa como se
      // fosse do material: a assinatura do item carrega a origem.
      const c = conteudo()
      const banco = derivarBanco(c)
      const alvo = banco.porArea['01-fundamentos']![0]!
      alvo.origem = 'recuperacao' as never

      const problemas = validarBanco(banco, c).join('\n')
      expect(problemas).toContain('banco adulterado')
      expect(problemas).toContain('conteudo diferente do que o material deriva')
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
