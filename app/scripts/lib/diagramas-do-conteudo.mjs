// O que a tela deve desenhar de Mermaid, medido do proprio content.json.
//
// A matriz generica do smoke conferia `>400` caracteres em `main`, um `h1` e nenhum aviso de erro
// — nada distinguia "desenhou" de "nao desenhou". E o Mermaid roda com `suppressErrors: true`
// (`src/ui/mermaid.ts`): um diagrama quebrado nao deixa `svg` nenhum E nao avisa nada, o
// `div.mermaid` fica com o texto cru na tela, e o diagrama quebrado chega ao aluno com os dois
// portoes verdes. Tres rotas provavam um `svg`; as outras 70 nao.
//
// A expectativa sai do HTML do documento (intro, secoes e o bloco do diagnostico da trilha), que e
// exatamente o que o `dangerouslySetInnerHTML` injeta — e nao da lista `mermaid` do documento: a
// extracao nao registra o diagrama que mora no INTRO (o README da raiz tem dois), e a lista ficava
// mais curta que a tela.

/**
 * Quantos blocos `.mermaid` um HTML declara.
 *
 * Mesma pergunta de `temDiagrama` (`src/ui/Blocos.tsx`): o ATRIBUTO `class="…mermaid…"`. E o
 * atributo, e nao a palavra solta, porque o material fala de Mermaid em prosa e em bloco de codigo
 * — e ali as aspas vem escapadas (`&quot;`).
 */
export function contarBlocosMermaid(html) {
  return (html.match(/class="[^"]*\bmermaid\b[^"]*"/g) ?? []).length
}

/** Os HTML que a tela injeta de um documento, na mesma lista de `scripts/lib/htmls-do-conteudo.ts`. */
export function htmlsDoDocumento(documento) {
  if (!documento) return []
  const htmls = [documento.intro ?? '', ...(documento.secoes ?? []).map((s) => s.html ?? '')]
  const diagnostico = documento.trilha?.diagnostico
  if (diagnostico) {
    htmls.push(diagnostico.introHtml ?? '')
    for (const item of diagnostico.itens ?? []) htmls.push(item.origemHtml ?? '')
    htmls.push(diagnostico.notaHtml ?? '')
  }
  return htmls
}

/** Quantos diagramas Mermaid uma pagina daquele documento tem de mostrar. */
export function diagramasDoDocumento(documento) {
  return htmlsDoDocumento(documento).reduce((soma, html) => soma + contarBlocosMermaid(html), 0)
}

/**
 * O seletor de um diagrama DESENHADO de verdade.
 *
 * O Mermaid, quando nao consegue interpretar o texto, nao deixa o bloco vazio: ele desenha uma
 * CAIXA DE ERRO — um `svg` no mesmo lugar, com `aria-roledescription="error"` e a frase
 * "Syntax error in text". Contar `.mermaid svg` nao distingue "desenhou o diagrama" de "desenhou o
 * aviso de que nao conseguiu", e foi assim que a matriz ficou VERDE com o aluno vendo a caixa de
 * erro: medido com um `flowchart TD` de rotulo nao fechado injetado num tema desta copia
 * (`blocos .mermaid=1 desenhados(svg)=1`), com `build` e `check` em 0. O seletor e um so para a
 * matriz e para os cenarios fixos, que fazem exatamente esta pergunta.
 */
export const SELETOR_DESENHO = '.mermaid svg:not([aria-roledescription="error"])'

/** O svg da caixa de erro do Mermaid, para a asserção poder nomear a causa. */
const SELETOR_CAIXA_DE_ERRO = '.mermaid svg[aria-roledescription="error"]'

/**
 * As assercoes de diagrama de uma rota, na forma dos cenarios do smoke: `[rotulo, obtido, esperado]`.
 *
 * Tres leituras do DOM, de proposito:
 *   - quantos `.mermaid` a tela mostra comparado com o que o conteudo declara — pega o bloco que
 *     sumiu (ou que nasceu sem o conteudo saber: um `class="mermaid"` escrito em prosa);
 *   - quantos desses blocos tem `svg` DESENHADO — pega o diagrama que nao desenhou, que e o defeito
 *     invisivel (`suppressErrors` engole o erro, e o que sobra e a caixa de erro do Mermaid);
 *   - quantos caíram nessa caixa de erro — a causa do `0` acima, nomeada: sem esta linha o
 *     relatorio diz "0/1" e nao diz que o Mermaid desenhou o proprio erro.
 *
 * O valor obtido e uma contagem e o esperado e o numero que o conteudo promete: uma pagina sem
 * diagrama nenhum exige `/0` dos dois lados, entao a asserção nao passa por ausencia de nada.
 */
export function conferirDiagramas(documentoDoDom, esperados) {
  const blocos = documentoDoDom.querySelectorAll('.mermaid').length
  const desenhados = documentoDoDom.querySelectorAll(SELETOR_DESENHO).length
  const caixasDeErro = documentoDoDom.querySelectorAll(SELETOR_CAIXA_DE_ERRO).length
  return [
    ['blocos .mermaid mostrados', blocos, esperados],
    ['todo diagrama do conteudo virou svg', `${desenhados}/${blocos}`, `${esperados}/${esperados}`],
    ['diagramas na caixa de erro do Mermaid', caixasDeErro, 0],
  ]
}
