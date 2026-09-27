import { describe, expect, it } from 'vitest'
import type {
  Area,
  Conteudo,
  DiagnosticoDaTrilha,
  Guia,
  Nivel,
  Pagina,
  Tema,
  Trilha,
} from '../../src/domain/types'
import { LEXICO, TOTAL_AREAS, TOTAL_PAGINAS, TOTAL_TEMAS, validar } from './validar-content'

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
    // As tres tabelas que a TELA le (§2, §4, §8): o gate as cobra, entao o fixture tem de
    // satisfazer o contrato que ele cobra dos guias.
    tabelaTemas: {
      cabecalho: ['#', 'tema_id', 'Tema', 'Nível', 'Tempo'],
      linhas: [['1', 'TEMA-01', 'Título do tema', 'base', '30 min']],
    },
    objetivos: {
      cabecalho: ['#', 'Objetivo', 'Bloom', 'Temas que o sustentam'],
      linhas: [['1', 'fazer algo observável', 'aplicar', 'TEMA-01']],
    },
    atividades: {
      cabecalho: ['#', 'Atividade', 'O que a prática demonstra', 'Pré-requisito técnico'],
      linhas: [['1', 'listar os escopos', 'a distinção', 'nenhum']],
    },
    mermaid: [],
  }
}

function base(): Conteudo {
  const area: Area = {
    areaId: '01-fundamentos',
    areaNome: 'Fundamentos',
    ordemEstudo: 2,
    nivel: 'base',
    ancoragem: ['responder pelo programa de segurança da informação'],
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

/**
 * Uma trilha de fixture, com o bloco de diagnostico e sem fases.
 *
 * O HTML do bloco mora FORA de `pagina.secoes` (a extracao o tira de la), e por isso e o campo que
 * um gate que so varre `intro` + `secoes` nao visita.
 */
function trilhaFake(diagnostico: Partial<DiagnosticoDaTrilha> = {}): Trilha {
  return {
    diagnostico: {
      secao: 1,
      titulo: '1.1 Pré-teste diagnóstico',
      introHtml: '<p>Dez itens, dos checkpoints das áreas iniciais.</p>',
      itens: [{ numero: '1', origemHtml: '<a href="#/area/01-fundamentos">01</a>, item 1' }],
      cabecalhoDasFaixas: ['Acertos', 'Ponto de entrada'],
      faixas: [{ rotulo: '0 a 3', de: 0, ate: 3, pontoDeEntrada: 'Fase 1 pelo TEMA-01' }],
      notaHtml: '<p>Quem já percorreu o plano entra na Fase 2.</p>',
      ...diagnostico,
    },
    fases: [],
  }
}

type Mutacao = (a: Alvo) => void

/** Aplica a mutação e devolve os problemas, usando totais de fixture. */
function problemas(mutar: Mutacao): string {
  const c = structuredClone(base())
  // Contado antes da mutação: é o número que o gate deve esperar.
  const paginas = c.paginas.length
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
  return validar(c, { areas: 1, temas: 1, paginas }).join('\n')
}

const casos: Array<[string, Mutacao, string]> = [
  ['acusa total de áreas diferente', (a) => void (a.c.areas = []), 'totais: 0 areas'],
  ['acusa total de temas diferente', (a) => void (a.c.temas = {}), 'totais: 0 temas'],
  ['acusa total de páginas diferente', (a) => void (a.c.paginas = []), 'totais: 0 paginas'],
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
  [
    'acusa critério que o parser não entende',
    (a) => void (a.guia.criterio = 'reler o tema antes de avançar'),
    'criterio declarado nao interpretavel',
  ],
  [
    'acusa léxico proibido na prosa do guia',
    (a) => void (a.guia.intro = '<p>um panorama bem abrangente</p>'),
    'lexico proibido',
  ],
  ['acusa guia sem temas', (a) => void (a.area.temas = []), 'guia sem temas'],
  [
    'acusa guia referenciando tema inexistente',
    (a) => void a.area.temas.push('02-grc#TEMA-09'),
    'referencia tema inexistente',
  ],
  ['acusa área sem nome', (a) => void (a.area.areaNome = ''), 'area_nome vazio'],
  ['acusa página sem título', (a) => void (a.pagina.titulo = ''), 'titulo vazio'],

  // A partir daqui: as invariantes que o gate aparentava cobrir e não cobria. Todas foram
  // verificadas por mutação contra o gate antigo, que passava verde em cada uma.
  [
    'acusa ref divergente da chave do mapa',
    // O progresso é gravado sob o ref, e o ref é a chave: divergir faz o usuário marcar
    // "acertei" e o painel mostrar zero firmes.
    (a) => void (a.c.temas[REF]!.ref = 'outra#TEMA-99'),
    'ref divergente da chave do mapa',
  ],
  [
    'acusa tema_id divergente do ref',
    (a) => void (a.tema.temaId = 'TEMA-99'),
    'tema_id divergente do ref',
  ],
  ['acusa area_id inexistente', (a) => void (a.tema.areaId = 'nao-existe'), 'area_id inexistente'],
  ['acusa guia com area_id divergente', (a) => void (a.guia.areaId = '02-outra'), 'area_id divergente'],
  [
    'acusa guia listando tema de outra área',
    (a) => {
      const outra: Area = {
        ...a.area,
        areaId: '02-outra',
        temas: [],
        guia: { ...a.guia, areaId: '02-outra' },
      }
      a.c.areas.push(outra)
      a.c.temas['02-outra#TEMA-09'] = {
        ...a.tema,
        ref: '02-outra#TEMA-09',
        areaId: '02-outra',
        temaId: 'TEMA-09',
      }
      a.area.temas.push('02-outra#TEMA-09')
    },
    'guia lista tema de outra area',
  ],
  ['acusa geradoEm que não é data ISO', (a) => void (a.c.meta.geradoEm = 'ontem'), 'nao e data ISO'],
  [
    'acusa número de seção repetido',
    (a) => void (a.tema.secoes[1]!.numero = 1),
    'numero de secao repetido',
  ],
  [
    'acusa grupo de página desconhecido',
    (a) => void (a.pagina.grupo = 'inventado'),
    'grupo desconhecido',
  ],
  [
    'acusa rótulo Mermaid com caractere proibido',
    (a) => void (a.tema.mermaid = ['flowchart TD\n  A[<script>]']),
    'rotulo Mermaid com caractere proibido',
  ],
  ['acusa área sem ancoragem', (a) => void (a.area.ancoragem = []), 'sem ancoragem'],
  [
    'acusa fonte sem título',
    (a) => void (a.tema.fontes[0]!.titulo = ''),
    'fonte sem titulo',
  ],
  ['acusa ordem_estudo sem o tema', (a) => void (a.c.ordemEstudo = []), 'ordem_estudo sem o tema'],
  [
    'acusa ordem_estudo com ref repetido',
    (a) => void (a.c.ordemEstudo = [REF, REF]),
    'ordem_estudo com ref repetido',
  ],

  // O link relativo e o defeito que a fase dos links veio remover: no arquivo unico servido por
  // `file://` ele nao abre. A troca por rota acontece na geracao, e o gate cobra o RESULTADO —
  // qualquer campo de HTML que escape dela reprova.
  [
    'acusa href relativo de .md sobrando na seção do tema',
    (a) => void (a.tema.secoes[0]!.html = '<p><a href="TEMA-02-triade-cia.md">tema</a></p>'),
    'href relativo no HTML gerado (TEMA-02-triade-cia.md)',
  ],
  [
    'acusa href relativo de .md sobrando no intro do tema',
    (a) => void (a.tema.intro = '<p><a href="../01-fundamentos/README.md">guia</a></p>'),
    'href relativo no HTML gerado',
  ],
  [
    'acusa href relativo de .md sobrando no guia da área',
    (a) => void (a.guia.secoes[0]!.html = '<p><a href="../README.md">home</a></p>'),
    'href relativo no HTML gerado',
  ],
  [
    'acusa href relativo de .md sobrando no intro da página',
    (a) => void (a.pagina.intro = '<p><a href="./templates/RELACOES-TEMAS.md">ficha</a></p>'),
    'href relativo no HTML gerado',
  ],
  [
    'acusa href relativo que não é de .md sobrando no HTML',
    (a) => void (a.tema.secoes[0]!.html = '<p><a href="../91-trilhas/">trilhas</a></p>'),
    'href relativo no HTML gerado',
  ],

  // O HTML do pré-teste diagnóstico da trilha não está em `intro` nem em `secoes` (o
  // `extrairTrilha` tira a região da seção e a guarda no bloco): era o ponto cego em que o link
  // relativo do material sobrevivia à varredura inteira. Um caso por campo, porque são três
  // campos diferentes (`introHtml`, `itens[].origemHtml` e `notaHtml`).
  [
    'acusa href relativo na abertura do pré-teste da trilha',
    (a) => void (a.pagina.trilha = trilhaFake({ introHtml: '<a href="../templates/RELACOES-TEMAS.md">ficha</a>' })),
    'href relativo no HTML gerado (../templates/RELACOES-TEMAS.md)',
  ],
  [
    'acusa href relativo na origem de um item do pré-teste da trilha',
    (a) =>
      void (a.pagina.trilha = trilhaFake({
        itens: [
          { numero: '1', origemHtml: '<a href="../../templates/RELACOES-TEMAS.md">ficha</a>' },
        ],
      })),
    'href relativo no HTML gerado (../../templates/RELACOES-TEMAS.md)',
  ],
  [
    'acusa href relativo na nota do pré-teste da trilha',
    (a) => void (a.pagina.trilha = trilhaFake({ notaHtml: '<a href="./templates/INDICE-TEMAS.md">índice</a>' })),
    'href relativo no HTML gerado (./templates/INDICE-TEMAS.md)',
  ],

  // O fragmento: `#4-temas` é a grafia de âncora do GitHub, que o material escreve junto do
  // arquivo. Sozinha ela não é rota, e a tela inteira responde "Rota não reconhecida".
  [
    'acusa fragmento que não é rota no HTML do tema',
    (a) => void (a.tema.intro = '<p><a href="#4-temas">temas</a></p>'),
    'href de fragmento que nao e rota do app (#4-temas)',
  ],
  [
    'acusa `#` nu, que não abre tela nenhuma',
    (a) => void (a.tema.intro = '<p><a href="#">topo</a></p>'),
    'href de fragmento que nao e rota do app (#)',
  ],
  [
    'acusa fragmento de rota que o app não tem',
    (a) => void (a.pagina.intro = '<p><a href="#/area/99-inexistente">área</a></p>'),
    'href de fragmento que nao e rota do app (#/area/99-inexistente)',
  ],
  [
    'acusa fragmento de rota que o app não tem dentro da trilha',
    (a) =>
      void (a.pagina.trilha = trilhaFake({
        notaHtml: '<p><a href="#/pagina/91-trilhas/plano-sumido">plano</a></p>',
      })),
    'href de fragmento que nao e rota do app (#/pagina/91-trilhas/plano-sumido)',
  ],

  // A prosa da trilha também é prosa do material: quando a região do diagnóstico vivia dentro da
  // seção, o léxico a varria; a extração a tirou de `secoes` e a varredura foi junto.
  [
    'acusa léxico proibido na nota do pré-teste da trilha',
    (a) => void (a.pagina.trilha = trilhaFake({ notaHtml: '<p>Vale destacar o plano.</p>' })),
    'lexico proibido',
  ],

  // O contrato do Mermaid só visitava as cercas: o runtime desenha o que casa
  // `querySelectorAll('.mermaid')`, e um bloco escrito em PROSA num tema com o caractere proibido
  // passava pelo build e pelo gate até chegar ao aluno como diagrama quebrado.
  [
    'acusa rótulo Mermaid proibido num `.mermaid` de prosa',
    (a) =>
      void (a.tema.secoes[0]!.html =
        '<div class="mermaid">graph TD; A["ROTULO com &lt; e # proibidos"]</div>'),
    'rotulo Mermaid com caractere proibido',
  ],
  [
    'acusa rótulo Mermaid proibido num `.mermaid` de prosa no guia',
    (a) => void (a.guia.intro = '<div class="mermaid">graph TD; A[ab#c]</div>'),
    'rotulo Mermaid com caractere proibido',
  ],

  // O esquema da URL é a defesa na fronteira: uma fonte do tema ou da área virava `href` na tela
  // (`Quiz.tsx` monta a fonte da questão, e o tema exibe a tabela do material) sem que nenhum
  // campo de frontmatter passasse por conferência.
  [
    'acusa fonte de tema com esquema `javascript:`',
    (a) => void (a.tema.fontes[0]!.url = 'javascript:alert(document.domain)'),
    'fonte com esquema nao permitido',
  ],
  [
    'acusa fonte de tema com `data:`',
    (a) => void (a.tema.fontes[0]!.url = 'data:text/html,<script>alert(1)</script>'),
    'fonte com esquema nao permitido',
  ],
  [
    'acusa fonte de área com esquema perigoso',
    (a) => void (a.area.fontes[0]!.url = 'javascript:alert(1)'),
    'fonte com esquema nao permitido',
  ],

  // As três tabelas que a tela lê do guia: apagar `## 8.` de um guia zerava o checklist de
  // artefatos da trilha sem que o gate acusasse.
  [
    'acusa guia sem a tabela de temas da §4',
    (a) => void (a.guia.tabelaTemas = null),
    'sem a tabela de temas da §4',
  ],
  [
    'acusa a §4 sem linha para o tema',
    (a) => void (a.guia.tabelaTemas!.linhas = [['1', 'TEMA-09', 'Outro', 'base', '30 min']]),
    'tabela da §4 sem linha para TEMA-01',
  ],
  [
    'acusa a §4 sem a coluna tema_id',
    (a) => void (a.guia.tabelaTemas!.cabecalho = ['#', 'Tema', 'Nível', 'Tempo']),
    'sem a coluna "tema_id"',
  ],
  [
    'acusa guia sem a tabela da §2 (objetivos)',
    (a) => void (a.guia.objetivos = null),
    'sem a tabela da §2',
  ],
  [
    'acusa guia sem a tabela da §8 (atividades)',
    (a) => void (a.guia.atividades = null),
    'sem a tabela da §8',
  ],
  [
    'acusa a §8 sem a coluna Atividade, que é como a tela a lê',
    (a) => void (a.guia.atividades!.cabecalho = ['#', 'Outra']),
    'sem a coluna "atividade"',
  ],

  // O caractere de controle bidirecional esconde o endereço real atrás de outro na barra de
  // status: o defeito é do `href`, e o texto visível continua o que o material escreveu.
  [
    'acusa href com caractere de controle bidirecional',
    (a) =>
      void (a.tema.intro =
        '<p><a href="https://evil.example/\u202Emoc.elgoog//:sptth">nota</a></p>'),
    'href com caractere de controle bidirecional (U+202E)',
  ],

  // Ramos de forma que ficavam de fora: cada campo opcional do frontmatter e cada coluna das
  // tabelas da tela tem o seu caminho de recusa, e sem o caso o `if` nunca era exercitado.
  ['acusa tema sem seções', (a) => void (a.tema.secoes = []), 'sem secoes'],
  ['acusa seção com número que não é finito', (a) => void (a.tema.secoes[0]!.numero = NaN), 'secao com numero invalido'],
  ['acusa seção sem título', (a) => void (a.tema.secoes[0]!.titulo = ''), 'sem titulo'],
  [
    'acusa fonte sem título e sem url',
    (a) => {
      a.tema.fontes[0]!.titulo = ''
      a.tema.fontes[0]!.url = ''
    },
    'fonte sem titulo (sem url)',
  ],
  [
    'acusa fontes sem url (só título)',
    // `TipoFonte` é união fechada: `tipo` sempre vem preenchido no tipo, e é a URL vazia que torna
    // a fonte não rastreável — a mesma checagem `f.url && f.tipo` do gate.
    (a) => void (a.tema.fontes = [{ titulo: 'F', url: '', tipo: 'secundaria' }]),
    'fontes sem url/tipo',
  ],
  ['acusa tema sem area_id', (a) => void (a.tema.areaId = ''), 'tema sem area_id'],
  [
    'acusa item de pré-teste sem pergunta',
    (a) => void (a.tema.preTeste = [{ pergunta: '' }]),
    'item de pre-teste vazio',
  ],
  [
    'acusa item de recuperação sem pergunta',
    (a) => void (a.tema.recuperacao[0]!.pergunta = ''),
    'item de recuperacao sem pergunta',
  ],
  [
    'acusa revisão inicial divergente da sequência implementada',
    // O campo é o dono declarado do SRS; divergir dele faz o app mentir sobre o intervalo.
    (a) => void (a.tema.revisaoInicialDias = [1, 7, 15]),
    'difere da sequencia implementada',
  ],
  ['acusa a tabela de temas da §4 sem linha nenhuma', (a) => void (a.guia.tabelaTemas!.linhas = []), 'tabela de temas da §4 sem linha nenhuma'],
  [
    'acusa a linha da §4 sem a célula do tema_id',
    // Linha mais curta que o cabeçalho: a célula ausente vira vazio e o tema some do plano.
    (a) => void (a.guia.tabelaTemas!.linhas = [['1']]),
    'tabela da §4 sem linha para TEMA-01',
  ],
  ['acusa a tabela da §8 (atividades) sem linha nenhuma', (a) => void (a.guia.atividades!.linhas = []), 'tabela da §8 (atividades) sem linha nenhuma'],
  ['acusa a tabela da §2 (objetivos) sem linha nenhuma', (a) => void (a.guia.objetivos!.linhas = []), 'tabela da §2 (objetivos) sem linha nenhuma'],
  [
    'acusa checkpoint com item sem pergunta',
    (a) => void (a.guia.checkpoint = [{ pergunta: '', resposta: 'a' }]),
    'checkpoint com item sem pergunta',
  ],
  ['acusa área com ordem_estudo inválida', (a) => void (a.area.ordemEstudo = NaN), 'ordem_estudo invalida'],
  [
    'acusa nível inválido na área',
    (a) => void (a.area.nivel = 'expert' as unknown as Nivel),
    'nivel invalido',
  ],
  ['acusa página sem slug', (a) => void (a.pagina.slug = ''), 'pagina sem slug'],
]

describe('validar', () => {
  it('aprova a fixture base', () => {
    expect(problemas(() => {})).toBe('')
  })

  it('usa os totais do projeto como padrão', () => {
    expect(TOTAL_AREAS).toBe(18)
    expect(TOTAL_TEMAS).toBe(109)
    expect(TOTAL_PAGINAS).toBe(22)
  })

  it('cobra o número de páginas do projeto quando não recebe nenhum esperado', () => {
    // É o caminho do `check-content`: sem `esperado.paginas`, a contagem esperada é TOTAL_PAGINAS.
    // Sem essa leitura, apagar um arquivo de `99-fontes/` do material passaria (o gate comparava
    // os totais do `meta` com a contagem que ele mesmo acabara de fazer, e as duas caíam juntas).
    const c = base()
    const erros = validar(c, { areas: 1, temas: 1 })
    expect(erros.join('\n')).toContain(`totais: 1 paginas, esperado ${TOTAL_PAGINAS}`)
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

  it('não acusa a rota do app nem o link externo', () => {
    // A regra é contra o href RELATIVO e contra o fragmento que não é rota: a rota que o app
    // resolve (`#/...`) e o `http(s)` continuam valendo — sem esta prova, uma regra que
    // reprovasse todo link da tela ficaria verde. As rotas são as DESTA fixture, e não de outro
    // conteúdo: elas mesmas passam pela conferência de rota existente.
    const texto = problemas((a) => {
      a.tema.intro =
        '<p><a href="#/tema/01-fundamentos/TEMA-01">tema</a> ' +
        '<a href="#/area/01-fundamentos/secao-4">seção</a> ' +
        '<a href="#/pagina/glossario">glossário</a> ' +
        '<a href="#/">painel</a> ' +
        '<a href="https://exemplo/1">fonte</a> <a href="mailto:alguem@exemplo">contato</a></p>'
    })
    expect(texto).toBe('')
  })

  it('não acusa o fragmento que já é rota dentro do HTML da trilha', () => {
    // O outro lado da cobertura nova: o bloco do pré-teste traz o link do material para a área,
    // e ele é rota — a regra tem de deixá-lo passar.
    const texto = problemas((a) => {
      a.pagina.trilha = trilhaFake({
        introHtml: '<p>Dez itens.</p>',
        itens: [
          { numero: '1', origemHtml: '<a href="#/area/01-fundamentos">01</a>, item 1' },
          { numero: '2', origemHtml: '<a href="#/area/01-fundamentos/secao-4">01, seção 4</a>' },
        ],
        notaHtml: '<p>Veja o <a href="#/pagina/glossario">glossário</a>.</p>',
      })
    })
    expect(texto).toBe('')
  })

  it('aceita a âncora da própria página quando o alvo existe no documento', () => {
    // A contraprova da regra de fragmento: `[nota](#nota)` com `<p id="nota">` é o par que a
    // geracao religa (`religarAncorasDoMaterial`) — o `id` chega prefixado pelo hook da
    // sanitização e o href acompanha (`#material-nota`). Antes, o gate reprovava o href citando o
    // prefixo que a propria geracao injetou, e o caso legitimo nunca construia.
    const texto = problemas((a) => {
      a.tema.secoes[0]!.html =
        '<p id="material-nota">aviso do material</p>' +
        '<p><a href="#material-nota">ir para a nota</a></p>'
    })
    expect(texto).toBe('')
  })

  it('ainda acusa o fragmento sem alvo nenhum no documento', () => {
    // Contraprova da contraprova: aceitar o `id` local não pode afrouxar a regra do fragmento que
    // nao leva a lugar nenhum — nem o `#4-temas` do GitHub, nem o alvo que o documento nao declara.
    // O último caso é o par DESALINHADO: o `id` do material ganha prefixo na geração, então um href
    // que perdeu a religação (`#nota` contra `id="material-nota"`) não alcança nada.
    for (const html of [
      '<p><a href="#4-temas">temas</a></p>',
      '<p><a href="#material-nota">nota</a></p>',
      '<p><a href="#">topo</a></p>',
      '<p id="material-nota">alvo</p><p><a href="#nota">nota</a></p>',
    ]) {
      expect(problemas((a) => void (a.tema.intro = html))).toContain('nao e rota do app')
    }
  })

  it('não acusa o `.mermaid` de prosa sem caractere proibido no rótulo', () => {
    // A regra é do CONTRATO do rótulo, não do `class="mermaid"`: um diagrama escrito em prosa com
    // rótulo limpo desenha igual ao da cerca, e o gate não é um segundo autor do material.
    const texto = problemas((a) => {
      a.tema.secoes[0]!.html = '<div class="mermaid">graph TD; A[rotulo limpo]</div>'
    })
    expect(texto).toBe('')
  })

  it('não acusa o diagrama que não tem rótulo entre colchetes', () => {
    // `String.match(/\[…\]/g)` devolve `null` quando não há rótulo: sem o `?? []` a varredura do
    // contrato estouraria num diagrama que só tem a aresta.
    const texto = problemas((a) => void (a.tema.mermaid = ['flowchart TD\n  A --> B']))
    expect(texto).toBe('')
  })

  it('trata a ausência do campo `mermaid` como "sem diagrama", e não como erro', () => {
    // O campo vem do content.json: ausente, não pode derrubar a varredura nem virar acusação — o
    // contrato é do rótulo, e sem diagrama não há rótulo a conferir.
    const texto = problemas((a) => void (a.pagina.mermaid = undefined as never))
    expect(texto).toBe('')
  })

  it('mantém os 12 termos do léxico', () => {
    expect(LEXICO).toHaveLength(12)
  })
})
