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
