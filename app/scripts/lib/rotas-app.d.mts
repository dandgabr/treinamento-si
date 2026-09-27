// Tipos de `rotas-app.mjs`, o modulo que o portao (TypeScript) e o smoke (Node puro) compartilham.
// Mantidos a mao porque o `.mjs` roda nos dois mundos; o teste do modulo cobre o comportamento.

/** As rotas do app que o conteudo declara. */
export interface RotasDoApp {
  areas: ReadonlySet<string>
  /** Refs no formato `areaId#TEMA-NN`, a mesma chave de `Conteudo.temas`. */
  temas: ReadonlySet<string>
  /** Slugs de pagina, que podem ter mais de um segmento (`91-trilhas/plano-90-dias`). */
  paginas: readonly string[]
}

/** A parte do conteudo de que as rotas saem — vale para o `Conteudo` do build e para o JSON. */
export interface ConteudoParaRotas {
  areas: readonly { areaId: string }[]
  temas: Record<string, unknown>
  paginas: readonly { slug: string }[]
}

export function rotasDoConteudo(conteudo: ConteudoParaRotas): RotasDoApp
export function ehHrefDeRota(href: string, rotas: RotasDoApp): boolean
