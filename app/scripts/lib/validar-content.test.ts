import { describe, expect, it } from 'vitest'
import type { Area, Conteudo, Guia, Nivel, Pagina, Tema } from '../../src/domain/types'
import { LEXICO, TOTAL_AREAS, TOTAL_TEMAS, validar } from './validar-content'

const REF = '01-fundamentos#TEMA-01'

function tema(): Tema {
  return {
    ref: REF,
    areaId: '01-fundamentos',
    temaId: 'TEMA-01',
    titulo: 'Título do tema',
    nivel: 'base',
    tempoEstimado: '30 min',
    objetivo: 'fazer algo observável',
    certificacoes: [],
    preRequisitos: [],
    atendeObjetivo: [1],
    relacoes: { complementa: [], aprofundadoPor: [], aplicadoEm: [], naoConfundirCom: [] },
    fontes: [{ titulo: 'F', url: 'https://exemplo/1', tipo: 'primaria' }],
    revisaoInicialDias: [1, 7, 30],
    proximaRevisao: null,
    statusVerificacao: 'rascunho',
    intro: '<p>abertura</p>',
    secoes: [
      { numero: 1, titulo: 'Objetivo de aprendizagem', html: '<p>a</p>' },
      { numero: 6, titulo: 'Por que isso importa para o CISO', html: '<p>b</p>' },
      { numero: 10, titulo: 'Recuperação ativa', html: '<p>c</p>' },
      { numero: 14, titulo: 'Fontes verificadas', html: '<p>d</p>' },
    ],
    preTeste: [{ pergunta: 'pergunta' }],
    recuperacao: [
      { pergunta: 'p1', resposta: 'r1' },
      { pergunta: 'p2', resposta: 'r2' },
    ],
    errosComuns: [{ equivoco: 'e', porque: 'p', correto: 'c' }],
    mermaid: [],
  }
}

function guia(): Guia {
  return {
    areaId: '01-fundamentos',
    intro: '<p>abertura do guia</p>',
    secoes: [{ numero: 1, titulo: 'Introdução', html: '<p>x</p>' }],
    checkpoint: [{ pergunta: 'q1', resposta: 'a1' }],
    criterio: 'acertar 4 dos 5 itens sem consultar os temas',
    tabelaTemas: null,
    objetivos: null,
    atividades: null,
    mermaid: [],
  }
}

function base(): Conteudo {
  const area: Area = {
    areaId: '01-fundamentos',
    areaNome: 'Fundamentos',
    ordemEstudo: 2,
    nivel: 'base',
    ancoragem: [],
    certificacoes: ['Security+'],
    preRequisitos: [],
    temas: [REF],
    fontes: [{ titulo: 'F', url: 'https://exemplo/1', tipo: 'primaria' }],
    statusVerificacao: 'rascunho',
    guia: guia(),
  }
  return {
    meta: { geradoEm: '2026-01-01T00:00:00.000Z', totais: { areas: 1, temas: 1, paginas: 1 } },
    areas: [area],
    temas: { [REF]: tema() },
    ordemEstudo: [REF],
    paginas: [
      {
        slug: 'glossario',
        titulo: 'Glossário',
        grupo: 'referencia',
        intro: '<p>g</p>',
        secoes: [],
        mermaid: [],
      },
    ],
  }
}

/** Referencias ja resolvidas, para a mutacao nao repetir indice a cada caso. */
interface Alvo {
  c: Conteudo
  tema: Tema
  area: Area
  guia: Guia
  pagina: Pagina
}

type Mutacao = (a: Alvo) => void

/** Aplica a mutação e devolve os problemas, usando totais de fixture. */
function problemas(mutar: Mutacao): string {
  const c = structuredClone(base())
  // A fixture garante estes elementos — a asserção de presença fica concentrada aqui.
  const area = c.areas[0]!
  const alvo: Alvo = {
    c,
    tema: c.temas[REF]!,
    area,
    guia: area.guia,
    pagina: c.paginas[0]!,
  }
  mutar(alvo)
  return validar(c, { areas: 1, temas: 1 }).join('\n')
}

const casos: Array<[string, Mutacao, string]> = [
  ['acusa total de áreas diferente', (a) => void (a.c.areas = []), 'totais: 0 areas'],
  ['acusa total de temas diferente', (a) => void (a.c.temas = {}), 'totais: 0 temas'],
  ['acusa meta divergente dos dados', (a) => void (a.c.meta.totais.temas = 99), 'meta.totais divergente'],
  ['acusa título vazio', (a) => void (a.tema.titulo = ''), 'titulo vazio'],
  ['acusa nível inválido', (a) => void (a.tema.nivel = 'expert' as unknown as Nivel), 'nivel invalido'],
  ['acusa tempo_estimado vazio', (a) => void (a.tema.tempoEstimado = ''), 'tempo_estimado vazio'],
  ['acusa objetivo vazio', (a) => void (a.tema.objetivo = ''), 'objetivo de aprendizagem vazio'],
  [
    'acusa ausência do bloco de ancoragem',
    (a) => void (a.tema.secoes = a.tema.secoes.filter((s) => s.numero !== 6)),
    'falta bloco de ancoragem',
  ],
  [
    'acusa ausência de recuperação ativa',
    (a) => void (a.tema.secoes = a.tema.secoes.filter((s) => s.numero !== 10)),
    'falta itens de recuperacao ativa',
  ],
  ['acusa seção sem html', (a) => void (a.tema.secoes[0]!.html = ''), 'sem html'],
  ['acusa tema sem pré-teste', (a) => void (a.tema.preTeste = []), 'sem pre-teste'],
  [
    'acusa tema com um único item de recuperação',
    (a) => void (a.tema.recuperacao = [{ pergunta: 'x', resposta: 'y' }]),
    'recuperacao ativa com 1 item',
  ],
  [
    'acusa item de recuperação sem gabarito',
    (a) => void (a.tema.recuperacao[1]!.resposta = ''),
    'item de recuperacao sem gabarito',
  ],
  ['acusa tema sem fontes', (a) => void (a.tema.fontes = []), 'frontmatter sem fontes'],
  ['acusa tema sem erros comuns', (a) => void (a.tema.errosComuns = []), 'sem tabela de erros comuns'],
  [
    'acusa relação com alvo sem #',
    (a) => void a.tema.relacoes.complementa.push({ alvo: 'TEMA-02', motivo: 'm', pendente: false }),
    'alvo invalido',
  ],
  [
    'acusa relação apontando para ref inexistente',
    (a) =>
      void a.tema.relacoes.complementa.push({
        alvo: '02-grc#TEMA-01',
        motivo: 'm',
        pendente: false,
      }),
    'aponta para ref inexistente',
  ],
  [
    'acusa relação sem motivo',
    (a) => void a.tema.relacoes.complementa.push({ alvo: REF, motivo: '', pendente: false }),
    'relacao complementa sem motivo',
  ],
  ['acusa léxico na intro', (a) => void (a.tema.intro = '<p>um texto bem robusto</p>'), 'lexico proibido'],
  [
    'acusa léxico com acento (limite de palavra Unicode)',
    (a) => void (a.tema.intro = '<p>É importante ressaltar isso</p>'),
    '"é importante ressaltar"',
  ],
  ['acusa guia sem checkpoint', (a) => void (a.guia.checkpoint = []), 'guia sem checkpoint'],
  [
    'acusa checkpoint sem gabarito',
    (a) => void (a.guia.checkpoint[0]!.resposta = ''),
    'checkpoint sem gabarito',
  ],
  ['acusa guia sem critério', (a) => void (a.guia.criterio = ''), 'sem criterio declarado'],
  ['acusa guia sem temas', (a) => void (a.area.temas = []), 'guia sem temas'],
  [
    'acusa guia referenciando tema inexistente',
    (a) => void a.area.temas.push('02-grc#TEMA-09'),
    'referencia tema inexistente',
  ],
  ['acusa área sem nome', (a) => void (a.area.areaNome = ''), 'area_nome vazio'],
  ['acusa página sem título', (a) => void (a.pagina.titulo = ''), 'titulo vazio'],
]

describe('validar', () => {
  it('aprova a fixture base', () => {
    expect(problemas(() => {})).toBe('')
  })

  it('usa os totais do projeto como padrão', () => {
    expect(TOTAL_AREAS).toBe(18)
    expect(TOTAL_TEMAS).toBe(109)
  })

  it.each(casos)('%s', (_nome, mutar, esperado) => {
    expect(problemas(mutar)).toContain(esperado)
  })

  it('não acusa relação pendente cujo alvo ainda não existe', () => {
    const texto = problemas((a) => {
      a.tema.relacoes.aprofundadoPor.push({
        alvo: '99-futuro#TEMA-01',
        motivo: 'destino planejado',
        pendente: true,
      })
    })
    expect(texto).toBe('')
  })

  it('não acusa léxico quando a palavra aparece dentro de uma tag HTML', () => {
    // A tag não conta como prosa: sem remover as tags, um termo dentro de um atributo
    // geraria falso positivo.
    const texto = problemas((a) => {
      a.tema.intro = '<p class="vale destacar">texto limpo</p>'
    })
    expect(texto).toBe('')
  })

  it('mantém os 12 termos do léxico', () => {
    expect(LEXICO).toHaveLength(12)
  })
})
