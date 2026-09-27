// A asserção de diagrama da matriz do smoke, exercitada no jsdom.
//
// O smoke roda no Chrome e depende de `dist/`: um teste aqui nao substitui a matriz, mas fixa a
// leitura que ela faz do DOM — que e onde o defeito deixa de ser visivel. `mermaid.run` roda com
// `suppressErrors: true`, e o Mermaid, quando nao consegue interpretar o texto, desenha uma CAIXA
// DE ERRO: um `svg` com `aria-roledescription="error"` e "Syntax error in text". Contar `.mermaid
// svg` nao distinguia "desenhou o diagrama" de "desenhou o aviso de que nao conseguiu" — a matriz
// ficava verde com a caixa de erro na frente do aluno (medido no Chrome, com um `flowchart TD` de
// rotulo nao fechado). O bloco sem `svg` nenhum (o texto cru) e o outro estado a cobrir. Sem esta
// prova, a asserção poderia "conferir" o numero errado (por exemplo, contar o que o conteudo
// declara e nao o que a tela mostra) e ficar verde com o diagrama quebrado na frente do aluno.

import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import {
  conferirDiagramas,
  contarBlocosMermaid,
  diagramasDoDocumento,
  htmlsDoDocumento,
  SELETOR_DESENHO,
} from './diagramas-do-conteudo.mjs'

/** O `document` de um HTML, como a matriz do smoke o recebe do `--dump-dom`. */
function dom(html: string): Document {
  return new JSDOM(`<body>${html}</body>`).window.document
}

/** Um bloco `.mermaid` como o app o entrega: dentro do quadro, com ou sem o desenho. */
function bloco(desenhado: boolean, dentro = true): string {
  const conteudo = '<span>graph TD</span>'
  const no = `<div class="mermaid">${conteudo}${desenhado ? '<svg role="img"></svg>' : ''}</div>`
  return dentro ? `<div class="diagrama">${no}</div>` : no
}

/**
 * O bloco como ele fica quando o Mermaid NAO consegue interpretar o texto: um `svg` no mesmo lugar,
 * a caixa de erro. E a forma medida na tela (`aria-roledescription="error"` + "Syntax error in
 * text"), e a unica diferenca entre ela e um desenho de verdade e o atributo.
 */
function blocoEmErro(dentro = true): string {
  const no =
    '<div class="mermaid"><span>graph TD</span>' +
    '<svg aria-roledescription="error" role="img" viewBox="0 0 2412 512">' +
    '<text>Syntax error in text</text><text>mermaid version 11.17.2</text></svg></div>'
  return dentro ? `<div class="diagrama">${no}</div>` : no
}

describe('contarBlocosMermaid', () => {
  it('conta o atributo `class="…mermaid…"`, inclusive com outras classes', () => {
    expect(contarBlocosMermaid('<div class="mermaid">a</div>')).toBe(1)
    expect(contarBlocosMermaid('<div class="diagrama"><div class="mermaid">a</div></div>')).toBe(1)
    expect(contarBlocosMermaid('<div class="mermaid destaque">a</div>')).toBe(1)
  })

  it('nao conta a palavra solta nem a aspa escapada, que e prosa e codigo', () => {
    // O material FALA de Mermaid em prosa e em bloco de codigo; ali as aspas vem escapadas
    // (`&quot;`), e isso nao e atributo nenhum — a mesma razao do `temDiagrama` da tela.
    expect(contarBlocosMermaid('<p>o bloco <code>mermaid</code> do material</p>')).toBe(0)
    expect(contarBlocosMermaid('<p>escreva class=&quot;mermaid&quot; para desenhar</p>')).toBe(0)
  })
})

describe('diagramasDoDocumento', () => {
  it('conta intro, secoes e o bloco de diagnostico da trilha', () => {
    const documento = {
      intro: bloco(false, false),
      secoes: [{ html: bloco(false, false) }, { html: '<p>sem diagrama</p>' }],
      trilha: { diagnostico: { introHtml: bloco(false, false), itens: [{ origemHtml: '<p>x</p>' }] } },
    }
    expect(diagramasDoDocumento(documento)).toBe(3)
    // intro + duas secoes + introHtml + origemHtml + notaHtml
    expect(htmlsDoDocumento(documento)).toHaveLength(6)
  })

  it('conta o diagrama do INTRO, que a lista `mermaid` do documento nao registra', () => {
    // O README da raiz tem dois diagramas no intro e `pagina.mermaid` vazio: medir a expectativa
    // pela lista deixaria a matriz exigindo `0/0` enquanto a tela mostra dois diagramas.
    const documento = { intro: `${bloco(false, false)}${bloco(false, false)}`, secoes: [], mermaid: [] }
    expect(diagramasDoDocumento(documento)).toBe(2)
  })

  it('nao explode com documento ausente ou vazio', () => {
    expect(diagramasDoDocumento(null)).toBe(0)
    expect(diagramasDoDocumento({})).toBe(0)
  })
})

describe('conferirDiagramas', () => {
  it('passa quando a tela mostra o numero de diagramas que o conteudo declara, todos desenhados', () => {
    const assercoes = conferirDiagramas(dom(`${bloco(true)}${bloco(true)}`), 2)
    for (const [rotulo, obtido, esperado] of assercoes) expect(obtido, rotulo).toBe(esperado)
  })

  it('reprova o diagrama que nao desenhou (o defeito que `suppressErrors` esconde)', () => {
    // Carga: um diagrama invalido no material. O Mermaid nao deixa `svg` de verdade nem aviso — a
    // asserção tem de acusar, e dizendo QUANTOS desenharam.
    const assercoes = conferirDiagramas(dom(`${bloco(true)}${bloco(false)}`), 2)
    expect(assercoes).toContainEqual(['todo diagrama do conteudo virou svg', '1/2', '2/2'])
    expect(assercoes.some(([, obtido, esperado]) => obtido !== esperado)).toBe(true)
  })

  it('reprova o diagrama que caiu na CAIXA DE ERRO do Mermaid, e nomeia a causa', () => {
    // A carga medida na tela do app: com o texto invalido, o Mermaid desenha um `svg` com
    // `aria-roledescription="error"` e "Syntax error in text". Contar `.mermaid svg` ficava em
    // `2/2` — a matriz passava VERDE com o aluno vendo a caixa de erro no lugar do diagrama.
    const assercoes = conferirDiagramas(dom(`${bloco(true)}${blocoEmErro()}`), 2)
    expect(assercoes).toContainEqual(['todo diagrama do conteudo virou svg', '1/2', '2/2'])
    expect(assercoes).toContainEqual(['diagramas na caixa de erro do Mermaid', 1, 0])
  })

  it('conta como desenhado so o svg que nao e a caixa de erro', () => {
    // A leitura por tras da asserção, isolada: um bloco desenhado, um na caixa de erro e um vazio.
    const d = dom(`${bloco(true)}${blocoEmErro()}${bloco(false)}`)
    expect(d.querySelectorAll('.mermaid svg').length).toBe(2)
    expect(d.querySelectorAll(SELETOR_DESENHO).length).toBe(1)
  })

  it('reprova a pagina que perdeu os blocos, em vez de passar com `0 === 0`', () => {
    const assercoes = conferirDiagramas(dom('<p>a pagina renderizou, mas sem os diagramas</p>'), 2)
    expect(assercoes).toContainEqual(['blocos .mermaid mostrados', 0, 2])
    expect(assercoes).toContainEqual(['todo diagrama do conteudo virou svg', '0/0', '2/2'])
  })

  it('reprova o diagrama que a tela mostra sem o conteudo declarar', () => {
    // O outro lado: um `class="mermaid"` escrito em prosa (ou um bloco que o conteudo perdeu)
    // aparece na tela e nao na expectativa — a contagem pega os dois sentidos.
    const assercoes = conferirDiagramas(dom(`${bloco(true)}${bloco(true)}`), 1)
    expect(assercoes).toContainEqual(['blocos .mermaid mostrados', 2, 1])
  })

  it('exige zero quando o documento nao tem diagrama nenhum', () => {
    const assercoes = conferirDiagramas(dom('<p>uma tela sem diagrama</p>'), 0)
    for (const [rotulo, obtido, esperado] of assercoes) expect(obtido, rotulo).toBe(esperado)
    expect(conferirDiagramas(dom(bloco(true)), 0)).toContainEqual(['blocos .mermaid mostrados', 1, 0])
  })
})
