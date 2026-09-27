// Modelo de conteudo derivado de "conteudo/".
// O Markdown do repositorio e a fonte unica da verdade; estes tipos sao o que o
// parse de build produz e o que o app consome em runtime.

export type Nivel = 'base' | 'intermediario' | 'avancado'

/** Chave canonica de um tema: "area_id#TEMA-NN". */
export type Ref = string

export type TipoFonte = 'primaria' | 'academica' | 'secundaria'
export type Confianca = 'alta' | 'media' | 'baixa'

export interface Fonte {
  titulo: string
  url: string
  tipo: TipoFonte
  acessadoEm?: string
  confianca?: Confianca
}

export type TipoRelacao =
  | 'complementa'
  | 'aprofundadoPor'
  | 'aplicadoEm'
  | 'naoConfundirCom'

export interface Relacao {
  alvo: Ref
  motivo: string
  pendente: boolean
}

export type Relacoes = Record<TipoRelacao, Relacao[]>

export interface Secao {
  numero: number
  titulo: string
  html: string
}

export interface ParQA {
  pergunta: string
  resposta: string
}

export interface QuestaoPreTeste {
  pergunta: string
}

export interface ErroComum {
  equivoco: string
  porque: string
  correto: string
}

export interface Tabela {
  cabecalho: string[]
  linhas: string[][]
}

export interface Tema {
  ref: Ref
  areaId: string
  temaId: string
  titulo: string
  nivel: Nivel
  tempoEstimado: string
  objetivo: string
  certificacoes: string[]
  preRequisitos: string[]
  atendeObjetivo: number[]
  relacoes: Relacoes
  fontes: Fonte[]
  revisaoInicialDias: number[]
  proximaRevisao: string | null
  statusVerificacao: string
  intro: string
  secoes: Secao[]
  preTeste: QuestaoPreTeste[]
  recuperacao: ParQA[]
  errosComuns: ErroComum[]
  mermaid: string[]
}

export interface Guia {
  areaId: string
  intro: string
  secoes: Secao[]
  checkpoint: ParQA[]
  criterio: string
  tabelaTemas: Tabela | null
  objetivos: Tabela | null
  atividades: Tabela | null
  mermaid: string[]
}

export interface Area {
  areaId: string
  areaNome: string
  ordemEstudo: number
  nivel: Nivel
  ancoragem: string[]
  certificacoes: string[]
  preRequisitos: string[]
  temas: Ref[]
  fontes: Fonte[]
  statusVerificacao: string
  guia: Guia
}

/** Documento que nao e area nem tema: glossario, trilhas, certificacoes, fontes, home. */
export interface Pagina {
  slug: string
  titulo: string
  grupo: string
  intro: string
  secoes: Secao[]
  mermaid: string[]
  /**
   * O que a pagina traz de estruturado para o app, quando ela e uma trilha de estudo.
   *
   * Opcional porque quem monta `Pagina` do Markdown (o parser de build) nao a conhece: quem
   * preenche e `extrairTrilha`, chamada pelo gerador depois do parse. Fora das tres trilhas,
   * vale `null`.
   */
  trilha?: Trilha | null
}

/**
 * Um item do pre-teste diagnostico da trilha: a coluna "Origem do item" do material, com o
 * link ja resolvido para a rota do app. O texto do item e o do material — o app nao escreve
 * item nenhum.
 */
export interface ItemDoDiagnostico {
  /** A numeracao da coluna "#", como o material escreve. */
  numero: string
  /** A celula "Origem do item", com a marcacao do material (o link para a area). */
  origemHtml: string
}

/** Uma linha da tabela "Acertos | Ponto de entrada" do material. */
export interface FaixaDoDiagnostico {
  /** A celula "Acertos" como o material escreve ("0 a 3", "4 a 7", "8 a 10"). */
  rotulo: string
  /** Limite inferior de acertos, lido do rotulo ("0 a 3"). */
  de: number
  /** Limite superior de acertos, lido do rotulo ("0 a 3"). */
  ate: number
  /** A coluna "Ponto de entrada", texto do material. */
  pontoDeEntrada: string
}

/**
 * O `### 1.1 Pre-teste diagnostico` da trilha, estruturado.
 *
 * A regiao sai do HTML da secao e vira bloco interativo: `titulo`, `introHtml` e `notaHtml` sao
 * pedacos do proprio material, guardados na ordem em que aparecem, para a tela nao repetir nem
 * perder nada do que ele escreve em volta das duas tabelas.
 */
export interface DiagnosticoDaTrilha {
  /** Secao do material onde o bloco estava, para a tela recoloca-lo no lugar dele. */
  secao: number
  /** O titulo que o material da ao bloco ("1.1 Pre-teste diagnostico"). */
  titulo: string
  /** O que o material escreve entre o titulo e a tabela dos itens. */
  introHtml: string
  itens: ItemDoDiagnostico[]
  /** O cabecalho da tabela das faixas, como o material o escreve. */
  cabecalhoDasFaixas: string[]
  faixas: FaixaDoDiagnostico[]
  /** O que o material escreve depois das duas tabelas. */
  notaHtml: string
}

/**
 * Uma fase da trilha, da tabela "Fases e marcos" da secao 3 ("Bloco", nos planos de 24 meses).
 * O rotulo, o periodo e o marco sao do material; `areas` sai da coluna "Areas (ordem_estudo)",
 * resolvida contra as areas que existem no conteudo — inclusive a celula "todas", que expande
 * para todas elas.
 */
export interface FaseDaTrilha {
  rotulo: string
  periodo: string
  areas: string[]
  marco: string
}

/** O que uma trilha traz de estruturado: o diagnostico de entrada e as fases com seus marcos. */
export interface Trilha {
  diagnostico: DiagnosticoDaTrilha | null
  fases: FaseDaTrilha[]
}

export interface Conteudo {
  meta: {
    geradoEm: string
    totais: { areas: number; temas: number; paginas: number }
  }
  areas: Area[]
  /** Todos os temas indexados por `Ref`. */
  temas: Record<Ref, Tema>
  /** Refs na ordem de estudo sugerida (ordem_estudo da area, depois tema_id). */
  ordemEstudo: Ref[]
  paginas: Pagina[]
}
