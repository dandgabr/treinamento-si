// Tipos de `diagramas-do-conteudo.mjs`, o modulo que a matriz do smoke (Node puro) e o teste
// (TypeScript) compartilham. Mantidos a mao porque o `.mjs` roda nos dois mundos; o teste do
// modulo cobre o comportamento.

/** O trecho de HTML que carrega diagrama, como o `content.json` o guarda. */
export interface HtmlDoDocumento {
  intro?: string
  secoes?: readonly { html?: string }[]
  trilha?: {
    diagnostico?: {
      introHtml?: string
      itens?: readonly { origemHtml?: string }[]
      notaHtml?: string
    } | null
  } | null
}

/** Conta os blocos `.mermaid` declarados num HTML (o mesmo casamento de `Blocos.temDiagrama`). */
export function contarBlocosMermaid(html: string): number

/** Os HTML que a tela injeta de um documento: intro, secoes e o bloco do diagnostico da trilha. */
export function htmlsDoDocumento(documento: HtmlDoDocumento | null | undefined): string[]

/** Quantos diagramas Mermaid o documento tem de mostrar. */
export function diagramasDoDocumento(documento: HtmlDoDocumento | null | undefined): number

/** Uma asserção no formato dos cenarios do smoke: `[rotulo, obtido, esperado]`. */
export type AssercaoDeDiagrama = [string, unknown, unknown]

/**
 * O seletor de um diagrama DESENHADO: `.mermaid svg` sem a caixa de erro do Mermaid (o `svg` com
 * `aria-roledescription="error"` que a biblioteca desenha quando o texto nao interpreta).
 */
export const SELETOR_DESENHO: string

/** As asserções de diagrama de uma rota, a partir do documento renderizado. */
export function conferirDiagramas(
  documentoDoDom: { querySelectorAll(seletor: string): { length: number } },
  esperados: number,
): AssercaoDeDiagrama[]
