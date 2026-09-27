import { JSDOM } from 'jsdom'
import { describe, expect, it } from 'vitest'
import {
  ancorasDeSecao,
  extrairMermaid,
  extrairQA,
  fatiarSecoes,
  hrefsDeAncorasCruas,
  idsDoDocumento,
  itensNumerados,
  limparConfianca,
  normalizarFontes,
  normalizarRelacoes,
  parsePaginaDeTexto,
  parseTabela,
  parseTemaDeTexto,
  PREFIXO_ID_MATERIAL,
  renderSeguro,
  slugDeAncora,
  type DestinoDeLink,
  type ResolverDeLink,
} from './markdown'

const FRONTMATTER = (temaId: string) => `---
tema: "Título do tema"
tema_id: "${temaId}"
area_id: "01-fundamentos"
nivel: base
tempo_estimado: "30 min"
objetivo_aprendizagem: "fazer X"
certificacoes: []
pre_requisitos: []
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com: []
fontes:
  - titulo: "Fonte"
    url: "https://exemplo/1"
    tipo: primaria
    acessado_em: "2026-01-01"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-01-01"
revisar_ate: "2027-01-01"
status_verificacao: rascunho
---`

function tema(opcoes: { temaId?: string; preTeste?: string; secao9?: string; secao10?: string; mermaid?: string } = {}): string {
  return `${FRONTMATTER(opcoes.temaId ?? 'TEMA-01')}

# Título do tema

Abertura do tema.

## 1. Objetivo de aprendizagem
Ao final: fazer X.

## 2. Pré-requisitos
Nada.

## 3. Pré-teste
${opcoes.preTeste ?? '1. Primeira pergunta.\n   Confiança: ___\n2. Segunda pergunta.\n   Confiança: ___'}

## 4. Caso real
Um caso.

## 5. Conteúdo
Texto.

## 6. Por que isso importa para o CISO
Importa por causa do orçamento.

## 7. Aplicação prática
Faça.

## 8. Autoexplicação
Explique.

## 9. Erros comuns e equívocos
${opcoes.secao9 ?? '| Equívoco | Por que está errado | O que é correto |\n|---|---|---|\n| A | B | C |'}

## 10. Recuperação ativa
${opcoes.secao10 ?? '1. Pergunta um.\n2. Pergunta dois.\n\n<details>\n<summary>Conferir respostas</summary>\n\n1. Resposta um.\n2. Resposta dois.\n</details>'}

## 11. Revisão espaçada
| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | responder | repetir |

## 12. Conexões com outros temas
Texto.

## 13. Certificações e leitura recomendada
Texto.

## 14. Fontes verificadas
| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Fonte | primaria | https://exemplo/1 | "2026-01-01" | alta |
${opcoes.mermaid ?? ''}`
}

describe('fatiarSecoes', () => {
  it('separa intro e seções numeradas', () => {
    const { intro, secoes } = fatiarSecoes(tema())
    expect(secoes).toHaveLength(14)
    expect(secoes[0]).toMatchObject({ numero: 1, titulo: 'Objetivo de aprendizagem' })
    expect(intro).toContain('# Título do tema')
    expect(intro).not.toContain('## 1.')
  })

  it('devolve intro integral quando não há cabeçalho numerado', () => {
    // É o caso de glossario.md e mapa-relacoes.md, que usam "## Termos" sem número.
    const corpo = '# Glossário\n\n## Termos\n\n| a | b |\n|---|---|\n| 1 | 2 |'
    const { intro, secoes } = fatiarSecoes(corpo)
    expect(secoes).toHaveLength(0)
    expect(intro).toContain('## Termos')
  })
})

describe('itensNumerados', () => {
  it('ignora marcadores que não são de lista numerada', () => {
    const itens = itensNumerados('- foo\n- bar\n\n1. um\n2. dois')
    expect(itens).toEqual(['um', 'dois'])
  })
})

describe('limparConfianca', () => {
  it('remove a linha canônica', () => {
    const limpo = limparConfianca('Pergunta?\n   Confiança: ___')
    expect(limpo).toBe('Pergunta?')
  })

  it('preserva o texto quando não há linha de confiança', () => {
    expect(limparConfianca('Pergunta sem marcador?')).toBe('Pergunta sem marcador?')
  })

  it('remove formatos não canônicos que vazariam para a pergunta', () => {
    expect(limparConfianca('Pergunta?\nConfiança: 3')).toBe('Pergunta?')
    expect(limparConfianca('Pergunta?\nConfiança: (1-5)')).toBe('Pergunta?')
  })
})

describe('parseTabela', () => {
  it('converte cabeçalho e linhas', () => {
    const t = parseTabela('| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |')
    expect(t?.cabecalho).toEqual(['A', 'B', 'C'])
    expect(t?.linhas).toEqual([['1', '2', '3']])
  })

  it('devolve null quando só existe o cabeçalho', () => {
    expect(parseTabela('| A | B |\n|---|---|')).toBeNull()
  })

  it('preenche célula faltante com string vazia', () => {
    const t = parseTabela('| A | B | C |\n|---|---|---|\n| 1 | 2 |')
    expect(t?.linhas[0]).toEqual(['1', '2'])
    expect(t?.linhas[0]?.[2]).toBeUndefined()
  })
})

describe('extrairQA', () => {
  it('pareia perguntas numeradas com as respostas do details', () => {
    const { pares } = extrairQA(
      '1. Um?\n2. Dois?\n\n<details>\n<summary>Conferir</summary>\n\n1. R1.\n2. R2.\n</details>',
    )
    expect(pares).toEqual([
      { pergunta: 'Um?', resposta: 'R1.' },
      { pergunta: 'Dois?', resposta: 'R2.' },
    ])
  })

  it('devolve respostas vazias quando não há details', () => {
    const { pares } = extrairQA('1. Um?\n2. Dois?')
    expect(pares.map((p) => p.resposta)).toEqual(['', ''])
  })

  it('não inventa índice quando faltam respostas', () => {
    const { pares } = extrairQA(
      '1. Um?\n2. Dois?\n3. Três?\n\n<details>\n<summary>x</summary>\n\n1. R1.\n2. R2.\n</details>',
    )
    expect(pares[2]?.resposta).toBe('')
  })

  it('não confunde "critério" solto dentro de uma resposta com o rótulo do critério', () => {
    const { criterio } = extrairQA(
      '1. Um?\n\n<details>\n<summary>x</summary>\n\n1. O critério de aceitação foi aplicado.\n</details>',
    )
    expect(criterio).toBe('')
  })

  it('lê o critério rotulado do guia, do rótulo até o fim do bloco', () => {
    // Nos guias a §9 fecha com "Critério para seguir adiante: 4 de 5". É esse texto que a trilha
    // exibe como critério do checkpoint — sem ler a frase, o guia perde o critério declarado.
    const { criterio } = extrairQA(
      '1. Um?\n\n<details>\n<summary>x</summary>\n\n1. R1.\n\nCritério para seguir adiante: acertar 4 dos 5 itens.\n</details>',
    )
    expect(criterio).toBe('acertar 4 dos 5 itens.')
  })
})

describe('extrairMermaid', () => {
  it('substitui o bloco por um div e preserva a fonte', () => {
    const { texto, blocos } = extrairMermaid('antes\n\n```mermaid\nflowchart TD\n  A --> B\n```\n\ndepois')
    expect(blocos).toEqual(['flowchart TD\n  A --> B'])
    expect(texto).toContain('<div class="mermaid">')
    expect(texto).not.toContain('```mermaid')
  })

  it('escapa os caracteres perigosos da fonte do diagrama', () => {
    const { blocos } = extrairMermaid('```mermaid\nflowchart TD\n  A[a & b]\n```')
    expect(blocos[0]).toContain('a & b')
    const { texto } = extrairMermaid('```mermaid\nflowchart TD\n  A[a & b]\n```')
    expect(texto).toContain('&amp;')
  })

  it('aceita fence com espaço à direita', () => {
    const { blocos } = extrairMermaid('```mermaid  \nflowchart TD\n  A --> B\n```')
    expect(blocos).toHaveLength(1)
  })
})

describe('renderSeguro', () => {
  it('acusa, em vez de limpar em silêncio, quando o bloco traz script ou handler inline', () => {
    // O contrato e falhar alto: conteudo perigoso no Markdown exige revisao humana,
    // nao uma limpeza silenciosa que ninguem percebe.
    expect(() => renderSeguro('<p>ok</p>\n<script>alert(1)</script>')).toThrow(/removeu conteudo/)
    expect(() => renderSeguro('<img src=x onerror=alert(1)>')).toThrow(/removeu conteudo/)
  })

  it('devolve o HTML sanitizado sem alterar o conteúdo permitido', () => {
    const html = renderSeguro('# Título\n\n| A | B |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<h1>Título</h1>')
    expect(html).toContain('<table>')
  })

  it('acusa quando removeria todo o conteúdo do bloco', () => {
    // O DOMPurify descarta um elemento proibido único no topo sem registrá-lo em
    // `removed`; sem comparar o HTML o build passaria com o bloco vazio.
    expect(() => renderSeguro('<style>body{display:none}</style>')).toThrow(/removeu conteudo/)
  })

  it('acusa também quando o bloco é um elemento proibido sem texto', () => {
    // Comparar o texto visível não bastava: `<meta>`, `<base>` e `<link>` não têm texto,
    // então saíam vazios e o build passava em silêncio.
    expect(() => renderSeguro('<meta http-equiv="refresh" content="0;url=https://exemplo/">')).toThrow(
      /removeu conteudo/,
    )
    expect(() => renderSeguro('<base href="https://exemplo/">')).toThrow(/removeu conteudo/)
  })

  it('preserva details e summary', () => {
    const html = renderSeguro('<details><summary>Ver</summary>\n\nresposta\n\n</details>')
    expect(html).toContain('<details>')
    expect(html).toContain('<summary>')
  })
})

// O `id` do material sobrevive a sanitizacao e `document.getElementById` devolve o PRIMEIRO
// elemento na ordem da arvore. Sem o prefixo, um `id="secao-10"` num `<div>` do material posto
// antes da secao 10 faz o "Ir para a secao 10" da fila focar o TEXTO do material. Estes testes
// montam o documento na mesma ordem da tela (material antes do alvo do app) e perguntam ao DOM,
// nao a string: e a ordem da arvore que decide quem `getElementById` devolve.
describe('ancoras: o id do material não sombreia as do app', () => {
  it('prefixa o id do material, para a seção do app continuar sendo o alvo', () => {
    const material = renderSeguro('<div id="secao-10">texto do material</div>')
    const dom = new JSDOM(
      `<body>${material}<h2 id="secao-10" tabindex="-1">10. Recuperação ativa</h2></body>`,
    )
    const alvo = dom.window.document.getElementById('secao-10')
    expect(alvo?.tagName).toBe('H2')
    expect(alvo?.textContent).toContain('Recuperação ativa')
    // O id do material continua no documento — só que fora do caminho do app.
    expect(
      dom.window.document.getElementById(`${PREFIXO_ID_MATERIAL}secao-10`)?.textContent,
    ).toBe('texto do material')
  })

  it('não deixa o material desviar o índice do checklist da trilha', () => {
    const material = renderSeguro('<div id="checklist-da-trilha">isca do material</div>')
    const dom = new JSDOM(
      `<body>${material}<h2 id="checklist-da-trilha" tabindex="-1">Checklist da trilha</h2></body>`,
    )
    const alvo = dom.window.document.getElementById('checklist-da-trilha')
    expect(alvo?.tagName).toBe('H2')
    expect(alvo?.textContent).toBe('Checklist da trilha')
  })

  it('mantém o id legítimo do material alcançável pela âncora da própria página', () => {
    // O par `href="#nota"` / `id="nota"` anda junto: os dois ganham o MESMO prefixo, então o
    // link de âncora dentro da mesma página continua levando ao alvo do material.
    const html = renderSeguro('<div id="nota">aviso do material</div>\n\n[ir para a nota](#nota)')
    expect(html).toContain(`id="${PREFIXO_ID_MATERIAL}nota"`)
    expect(html).toContain(`href="#${PREFIXO_ID_MATERIAL}nota"`)

    const dom = new JSDOM(`<body>${html}</body>`)
    const href = dom.window.document.querySelector('a')?.getAttribute('href') ?? ''
    expect(dom.window.document.getElementById(href.slice(1))?.textContent).toBe('aviso do material')
  })

  it('não toca no href de rota do app, que já é o endereço de uma tela', () => {
    // Contraprova: prefixar TODO `#…` quebraria a navegação inteira do app — a rota resolvida na
    // geração (`#/area/…`) tem de ficar exatamente como veio.
    const html = renderSeguro('[seção 4](README.md#4-temas)', () => ({
      acao: 'trocar',
      href: '#/area/01-fundamentos/secao-4',
    }))
    expect(html).toContain('href="#/area/01-fundamentos/secao-4"')
    expect(html).not.toContain(`href="#${PREFIXO_ID_MATERIAL}`)
  })
})

// `markdown.ts` nao conhece rota: ele pergunta o que fazer com cada link e obedece. Quem
// responde e `links-material.ts`, na geracao. Estes testes fixam a fronteira entre os dois — a
// parte que, se quebrar, faz o portao reprovar o HTML (e nao o mapa).
describe('resolver de links', () => {
  const rota = (href: string): DestinoDeLink => ({ acao: 'trocar', href })

  it('sem resolvedor, o link fica como o material escreveu', () => {
    // E o comportamento antigo, e o que os testes de parse abaixo usam: sem resolvedor, nada muda.
    expect(renderSeguro('[tema](TEMA-02-dois.md)')).toContain('href="TEMA-02-dois.md"')
  })

  it('troca o href pelo destino que o resolvedor devolve, sem tocar no resto do link', () => {
    const html = renderSeguro('[tema](TEMA-02-dois.md)', (href) =>
      href === 'TEMA-02-dois.md' ? rota('#/tema/01-fundamentos/TEMA-02') : { acao: 'manter' },
    )
    expect(html).toContain('href="#/tema/01-fundamentos/TEMA-02"')
    expect(html).not.toContain('href="TEMA-02-dois.md"')
    expect(html).toContain('<a href="#/tema/01-fundamentos/TEMA-02">tema</a>')
  })

  it('com `manter`, o link continua relativo — e o portao tem por onde reprovar', () => {
    // O gerador sempre passa um resolvedor; o `manter` dele e o que deixa o href relativo no HTML
    // e dispara a regra do `validar`. Sem este caminho, um alvo sem rota sumiria em silencio.
    const html = renderSeguro('[sumiu](./TEMA-99-sumiu.md)', () => ({ acao: 'manter' }))
    expect(html).toContain('href="./TEMA-99-sumiu.md"')
  })

  it('com `texto`, tira a marca de link e preserva o texto — que e a unica pista do destino', () => {
    const html = renderSeguro(
      '[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md)',
      () => ({ acao: 'texto' }),
    )
    expect(html).toContain('templates/RELACOES-TEMAS.md')
    expect(html).not.toContain('<a')
    expect(html).not.toContain('../templates/RELACOES-TEMAS.md')
  })

  it('preserva a marcacao interna do link que vira texto', () => {
    // O href sai; o que estava dentro do `<a>` fica. Apagar o conteudo seria perder a referencia.
    const html = renderSeguro('[**Regras** de autoria](CONTRIBUTING.md)', () => ({ acao: 'texto' }))
    expect(html).toContain('<strong>Regras</strong> de autoria')
  })

  it('entrega href e texto visivel ao resolvedor', () => {
    const vistos: Array<[string, string]> = []
    const resolver: ResolverDeLink = (href, texto) => {
      vistos.push([href, texto])
      return { acao: 'manter' }
    }
    renderSeguro(
      '[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md) e [`x.md`](x.md)',
      resolver,
    )
    // O texto do `code_inline` entra: e assim que o material cita um caminho dentro do rotulo.
    expect(vistos).toEqual([
      ['../templates/RELACOES-TEMAS.md', 'templates/RELACOES-TEMAS.md'],
      ['x.md', 'x.md'],
    ])
  })

  it('nao desalinha a pilha de links entre links do mesmo bloco', () => {
    // A pilha do renderer e por abertura/fechamento: o primeiro link vira texto (sem `<a>`) e o
    // segundo vira rota. Se um `link_close` casasse com a abertura errada, o segundo sumiria.
    const html = renderSeguro(
      '[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md) e [tema](TEMA-02.md)',
      (href) =>
        href.endsWith('RELACOES-TEMAS.md') ? { acao: 'texto' } : rota('#/tema/01-fundamentos/TEMA-02'),
    )
    expect(html).toContain('templates/RELACOES-TEMAS.md e')
    expect(html.match(/<a /g)).toHaveLength(1)
    expect(html).toContain('href="#/tema/01-fundamentos/TEMA-02"')
  })

  it('nao desalinha a pilha entre renders: um bloco com link nao contamina o proximo', () => {
    renderSeguro('[ficha](../templates/RELACOES-TEMAS.md)', () => ({ acao: 'texto' }))
    const depois = renderSeguro('[tema](TEMA-02.md)', () => rota('#/tema/01-fundamentos/TEMA-02'))
    expect(depois).toContain('<a href="#/tema/01-fundamentos/TEMA-02">tema</a>')
  })

  it('a troca acontece antes da sanitizacao: o DOMPurify continua sendo a ultima fronteira', () => {
    // O href e escrito pelo resolvedor, e nao pelo material: se ele trouxer esquema ativo, o
    // build tem de cair aqui, e nao publicar um link executavel.
    expect(() =>
      renderSeguro('[tema](TEMA-02.md)', () => rota('javascript:alert(1)')),
    ).toThrow(/removeu conteudo/)
  })

  it('link externo nao passa pelo resolvedor quando ele responde `manter`', () => {
    const html = renderSeguro('[fonte](https://exemplo/1)', () => ({ acao: 'manter' }))
    expect(html).toContain('href="https://exemplo/1"')
  })
})

// ---------------------------------------------------------------- HTML cru e controles invisiveis

// O renderer de `link_open` so ve link de Markdown: uma ancora escrita em HTML cru atravessa o
// `md.render` como bloco de HTML e nunca chegava ao resolvedor. Era assim que o caminho do
// `npm run dev` (`build:content && vite`, sem `check:content`) deixava um link protocol-relative
// chegar a tela em silencio — o defeito so aparecia no gate, que o dev nao roda.
describe('ancoras em HTML cru', () => {
  it('lista os hrefs das ancoras escritas em HTML', () => {
    const achados = hrefsDeAncorasCruas('antes\n\n<a href="//evil.example/pwn">clique</a>\n\ndepois')
    expect(achados).toEqual([{ href: '//evil.example/pwn', texto: 'clique' }])
  })

  it('aceita as duas formas de aspas e o espaço antes do `=`', () => {
    expect(hrefsDeAncorasCruas("<a href ='x.md'>x</a><a HREF=\"y.md\">y</a>")).toEqual([
      { href: 'x.md', texto: 'x' },
      { href: 'y.md', texto: 'y' },
    ])
  })

  it('le o href sem aspas, que o HTML5 aceita e escapava da varredura', () => {
    // `<a href=TEMA-02.md>` e HTML5 valido e o navegador o executa: a varredura que so via href
    // entre aspas deixava passar o irmao do defeito que a guarda veio fechar.
    expect(hrefsDeAncorasCruas('<a href=TEMA-02.md>x</a>')).toEqual([
      { href: 'TEMA-02.md', texto: 'x' },
    ])
  })

  it('le o href sem valor, com espaço em volta do `=` e com quebra de linha', () => {
    // HTML5 normaliza as quatro formas — `href="x"`, `href='x'`, `href=x` e `href` sem valor —,
    // com espaço em volta do `=` e quebra de linha entre atributos. A guarda tem de ver todas.
    expect(hrefsDeAncorasCruas('<a href>x</a>')).toEqual([{ href: '', texto: 'x' }])
    expect(hrefsDeAncorasCruas('<a href = TEMA-02.md >x</a>')).toEqual([
      { href: 'TEMA-02.md', texto: 'x' },
    ])
    expect(hrefsDeAncorasCruas('<a\n  href=TEMA-02.md\n>x</a>')).toEqual([
      { href: 'TEMA-02.md', texto: 'x' },
    ])
  })

  it('nao confunde `data-href` com `href`', () => {
    // A regra do `(?:^|\s)` exige atributo proprio: `data-href` nao e o destino da ancora.
    expect(hrefsDeAncorasCruas('<a data-href=x.md>x</a>')).toEqual([])
  })

  it('recusa o href relativo sem aspas, que o dev deixava passar', () => {
    // O irmao do defeito fechado pela guarda: sem aspas, o caminho relativo chegava ao app com o
    // href do material, que em `file://` nao abre em lugar nenhum.
    expect(() =>
      renderSeguro('<a href=TEMA-02.md>tema</a>', () => ({
        acao: 'trocar',
        href: '#/tema/01-fundamentos/TEMA-02',
      })),
    ).toThrow(/link em HTML cru/)
  })

  it('nao le ancora dentro de bloco nem de trecho de codigo', () => {
    // Ali o `<a href>` e texto documentado: o markdown-it o entrega escapado, e ele nao e ancora
    // nenhuma na pagina. Sem isto, documentar a propria regra reprovaria o material.
    expect(hrefsDeAncorasCruas('```html\n<a href="x.md">x</a>\n```')).toEqual([])
    expect(hrefsDeAncorasCruas('use `<a href="x.md">x</a>` no lugar')).toEqual([])
  })

  it('recusa o link relativo escrito em HTML, e diz o que fazer', () => {
    // O caminho relativo que o gerador trocaria por rota nao passa por esta porta: o texto fica no
    // arquivo unico com o href do material, que em `file://` nao abre em lugar nenhum.
    expect(() => renderSeguro('<a href="TEMA-02-dois.md">tema</a>', () => ({ acao: 'trocar', href: '#/tema/01-fundamentos/TEMA-02' }))).toThrow(
      /link em HTML cru/,
    )
  })

  it('deixa passar o link externo, que o material pode escrever em HTML', () => {
    const html = renderSeguro('<a href="https://exemplo/1">fonte</a>', (href) =>
      href.startsWith('http') ? { acao: 'manter' } : { acao: 'trocar', href: '#/x' },
    )
    expect(html).toContain('href="https://exemplo/1"')
  })

  it('registra o defeito do HTML cru pelo mesmo caminho do link de Markdown', () => {
    // O href protocol-relative nao e trocavel nem externo: o resolvedor o mantem e ACUSA. O
    // defeito nasce no build (que agora sai com erro) e continua visivel no HTML para o gate.
    const vistos: string[] = []
    const html = renderSeguro(
      '<a href="//evil.example/pwn">clique</a>',
      (href) => {
        vistos.push(href)
        return { acao: 'manter' }
      },
    )
    expect(vistos).toEqual(['//evil.example/pwn'])
    expect(html).toContain('href="//evil.example/pwn"')
  })
})

describe('caracteres de controle bidirecional', () => {
  it('recusa o U+202E no href, que esconde o endereco real na barra de status', () => {
    // O clique iria para o host do atacante enquanto a barra de status desenha outro endereco.
    expect(() =>
      renderSeguro('<a href="https://evil.example/\u202Emoc.elgoog//:sptth">nota</a>'),
    ).toThrow(/controle bidirecional \(U\+202E\)/)
  })

  it('recusa o controle no texto, que muda a ordem de leitura do trecho', () => {
    expect(() => renderSeguro('<p>texto \u202E invertido</p>')).toThrow(
      /controle bidirecional no material \(U\+202E\)/,
    )
    expect(() => renderSeguro('<p>marca \u200F invisivel</p>')).toThrow(/U\+200F/)
  })

  it('nao recusa o texto normal, com acento e pontuacao', () => {
    expect(renderSeguro('<p>Fonte: “ISO/IEC 27001” — ver §4.</p>')).toContain('ISO/IEC 27001')
  })

  it('recusa o controle no texto visivel de um link, onde ele troca a ordem contra o endereco', () => {
    expect(() => renderSeguro('[clique\u202E aqui](https://exemplo/1)')).toThrow(
      /controle bidirecional no material \(U\+202E\)/,
    )
  })

  it('recusa o controle num atributo renderizado (title), que a tela mostra no tooltip', () => {
    // O caractere age no `title` que o navegador exibe; a regua e o HTML renderizado fora do codigo.
    expect(() => renderSeguro('<p title="a\u202Eb">x</p>')).toThrow(
      /controle bidirecional no material \(U\+202E\)/,
    )
  })

  it('deixa passar o controle DENTRO de cerca de codigo, onde ele e exemplo lido', () => {
    // Um material de seguranca que DOCUMENTE o Trojan Source precisa escrever o U+202E como
    // exemplo. Dentro da cerca o markdown-it entrega o texto escapado e o caractere nao reordena
    // nada na tela — barrar aqui proibia a propria fonte de ensinar o ataque.
    const html = renderSeguro('```\n<a href="https://evil.example/\u202Emoc.elgoog//:sptth">x</a>\n```')
    expect(html).toContain('<pre>')
    expect(html).toContain('\u202E')
  })

  it('deixa passar o controle dentro de trecho de codigo inline', () => {
    expect(renderSeguro('use `\u202E` como exemplo de controle bidi')).toContain('<code>\u202E</code>')
  })
})

// `id` do material e href de ancora andam em par. A religacao sozinha so cobria o par que mora no
// MESMO bloco: o `id` da secao 3 alcancado por um link da secao 1 saia pela metade (o `id` ganhava
// prefixo, o href nao), e o portao — que recusa fragmento sem rota — reprovava o caso legitimo.
describe('ancoras da propria pagina', () => {
  it('le os `id` declarados no documento, e nao os que estao dentro de codigo', () => {
    const ids = idsDoDocumento('<p id="nota">a</p>\n<div id=\'outro\'>b</div>\n\n`<p id="falso">`')
    expect([...ids].sort()).toEqual(['nota', 'outro'])
  })

  it('religa o par que atravessa secoes, com os `id` do documento', () => {
    const ids = idsDoDocumento('<p id="nota">alvo</p>')
    const html = renderSeguro('[ir para a nota](#nota)', undefined, ids)
    expect(html).toContain('href="#material-nota"')
    // O outro lado do par: o `id` do alvo recebe o mesmo prefixo na sanitizacao.
    const comAlvo = renderSeguro('<p id="nota">alvo</p>\n\n[nota](#nota)', undefined, ids)
    expect(comAlvo).toContain('id="material-nota"')
    expect(comAlvo).toContain('href="#material-nota"')
  })

  it('nao religa o fragmento que nao tem alvo declarado', () => {
    // `#4-temas` e a grafia de ancora do GitHub: sem `id` para onde ir, o href fica como veio e o
    // portao o reprova. Sem esta guarda, tudo que comeca com `#` viraria prefixo.
    const html = renderSeguro('[temas](#4-temas)', undefined, idsDoDocumento('# Titulo'))
    expect(html).toContain('href="#4-temas"')
  })
})

describe('slugDeAncora e ancorasDeSecao', () => {
  it('monta o slug do cabecalho como o material e o GitHub o escrevem', () => {
    // `README.md#4-temas` e o endereco que o material usa; o cabecalho e `## 4. Temas`.
    expect(slugDeAncora('4. Temas')).toBe('4-temas')
    expect(slugDeAncora('5. Pré-requisitos')).toBe('5-pré-requisitos')
    expect(slugDeAncora('1. Introdução')).toBe('1-introdução')
    expect(slugDeAncora('2. O que é e o que não é')).toBe('2-o-que-é-e-o-que-não-é')
  })

  it('traduz cada `## N.` para a ancora e guarda o numero da secao do app', () => {
    const ancoras = ancorasDeSecao('## 1. Introdução\nTexto.\n\n## 4. Temas\nTexto.\n\n## 9. Perguntas')
    expect(ancoras.get('1-introdução')).toEqual([1])
    expect(ancoras.get('4-temas')).toEqual([4])
    // A sessao do app e `secao-N`, com o N do proprio cabecalho.
    expect(ancoras.get('9-perguntas')).toEqual([9])
  })

  it('ignora o cabecalho que nao tem numero de secao', () => {
    const ancoras = ancorasDeSecao('# Titulo\n\n## Sem numero\n\n### 4. Fundo demais')
    expect(ancoras.size).toBe(0)
  })

  it('nao le cabecalho de dentro do frontmatter', () => {
    const ancoras = ancorasDeSecao('---\ntitulo: "x"\n---\n\n## 4. Temas\nTexto.')
    expect([...ancoras.keys()]).toEqual(['4-temas'])
  })

  it('duas secoes com o mesmo cabecalho caem na mesma ancora, e a lista denuncia', () => {
    // O valor e uma lista justamente para isto: o portao prefere reprovar uma ancora ambigua a
    // escolher uma das duas secoes.
    const ancoras = ancorasDeSecao('## 4. Temas\nA.\n\n## 4. Temas\nB.')
    expect(ancoras.get('4-temas')).toEqual([4, 4])
  })
})

describe('parseTemaDeTexto', () => {
  it('monta o ref como areaId#tema_id', () => {
    expect(parseTemaDeTexto(tema(), '01-fundamentos').ref).toBe('01-fundamentos#TEMA-01')
  })

  it('gera refs distintas para o mesmo TEMA-01 em áreas diferentes', () => {
    const a = parseTemaDeTexto(tema({ temaId: 'TEMA-01' }), '01-fundamentos')
    const b = parseTemaDeTexto(tema({ temaId: 'TEMA-01' }), '14-dados-privacidade')
    expect(a.ref).toBe('01-fundamentos#TEMA-01')
    expect(b.ref).toBe('14-dados-privacidade#TEMA-01')
    expect(a.ref).not.toBe(b.ref)
  })

  it('extrai pré-teste, recuperação e erros comuns', () => {
    const t = parseTemaDeTexto(tema(), '01-fundamentos')
    expect(t.preTeste.map((q) => q.pergunta)).toEqual([
      'Primeira pergunta.',
      'Segunda pergunta.',
    ])
    expect(t.recuperacao).toHaveLength(2)
    expect(t.errosComuns[0]).toEqual({ equivoco: 'A', porque: 'B', correto: 'C' })
  })

  it('não lança quando uma seção está ausente', () => {
    const semSecoes = tema().replace(/## 9\.[\s\S]*?## 10\./, '## 10.').replace(/## 10\.[\s\S]*?## 11\./, '## 11.')
    const t = parseTemaDeTexto(semSecoes, '01-fundamentos')
    expect(t.errosComuns).toEqual([])
    expect(t.recuperacao).toEqual([])
  })

  it('devolve erros comuns vazio quando a tabela só tem cabeçalho', () => {
    const t = parseTemaDeTexto(tema({ secao9: '| A | B | C |\n|---|---|---|' }), '01-fundamentos')
    expect(t.errosComuns).toEqual([])
  })

  it('remove o h1 do intro, que já vem do frontmatter', () => {
    const t = parseTemaDeTexto(tema(), '01-fundamentos')
    expect(t.intro).not.toContain('<h1>')
    expect(t.intro).toContain('Abertura do tema.')
  })

  it('preenche os campos ausentes do frontmatter com o valor neutro', () => {
    // O frontmatter é do material e a interface lê cada campo: sem o neutro, um tema que esqueça
    // `nivel` chegaria à tela com `undefined` no lugar da etiqueta.
    const t = parseTemaDeTexto('---\nfoo: 1\n---\n\n# T\n\n## 1. Um\ncorpo', '01-fundamentos')
    expect(t.temaId).toBe('')
    expect(t.titulo).toBe('')
    expect(t.nivel).toBe('base')
    expect(t.tempoEstimado).toBe('')
    expect(t.objetivo).toBe('')
    expect(t.proximaRevisao).toBeNull()
  })

  it('converte para string a próxima revisão declarada no frontmatter', () => {
    // `proxima_revisao` é data do material: declarada, vira string; ausente, é `null` (e não a
    // string "null").
    const comData = tema().replace('proxima_revisao: null', 'proxima_revisao: "2026-05-01"')
    expect(parseTemaDeTexto(comData, '01-fundamentos').proximaRevisao).toBe('2026-05-01')
    expect(parseTemaDeTexto(tema(), '01-fundamentos').proximaRevisao).toBeNull()
  })

  it('lê as listas declaradas no frontmatter, e deixa vazio o que não foi declarado', () => {
    // Certificações, pré-requisitos e objetivos atendidos são listas opcionais: declaradas, cada
    // item vira string/número; ausentes, viram lista vazia em vez de `undefined` na tela.
    const comListas = tema()
      .replace('certificacoes: []', 'certificacoes: ["Security+"]')
      .replace('pre_requisitos: []', 'pre_requisitos: ["TEMA-00"]')
      .replace('relacoes:', 'atende_objetivo: [1, 2]\nrelacoes:')
    const t = parseTemaDeTexto(comListas, '01-fundamentos')
    expect(t.certificacoes).toEqual(['Security+'])
    expect(t.preRequisitos).toEqual(['TEMA-00'])
    expect(t.atendeObjetivo).toEqual([1, 2])
  })

  it('preenche com vazio a célula que falta na linha da tabela de erros comuns', () => {
    // A linha da §9 pode declarar só o equívoco: o que falta vira string vazia em vez de a
    // leitura estourar ou o campo chegar `undefined` à tela.
    const t = parseTemaDeTexto(
      tema({ secao9: '| Equívoco | Por que | O que é correto |\n|---|---|---|\n| Só o equívoco |' }),
      '01-fundamentos',
    )
    expect(t.errosComuns).toEqual([{ equivoco: 'Só o equívoco', porque: '', correto: '' }])
  })
})

describe('parseTabela: linhas sem conteúdo', () => {
  it('devolve null quando nenhuma linha de dados tem conteúdo', () => {
    // Cabeçalho e separador existem, mas todas as linhas são vazias: não há tabela nenhuma.
    expect(parseTabela('| A | B |\n|---|---|\n|  |  |')).toBeNull()
    // E as linhas vazias somem, deixando só as que trazem dado.
    expect(parseTabela('| A | B |\n|---|---|\n| 1 | 2 |\n|  |  |')?.linhas).toEqual([['1', '2']])
  })
})

describe('normalizarFontes', () => {
  it('preenche o campo ausente com o valor neutro, em vez de deixar undefined', () => {
    // A fonte do frontmatter pode vir só com o título: o app não pode receber `undefined` e
    // desenhar "undefined" no lugar da URL.
    expect(normalizarFontes([{ titulo: 'CSEC2017' }])).toEqual([
      { titulo: 'CSEC2017', url: '', tipo: 'secundaria', acessadoEm: undefined, confianca: undefined },
    ])
    // `acessado_em` presente vira string; ausente fica `undefined` (não a string "undefined").
    expect(normalizarFontes([{ acessado_em: '2026-01-01' }])[0]?.acessadoEm).toBe('2026-01-01')
  })

  it('recusa o que não é lista, e descarta o item que não é objeto', () => {
    expect(normalizarFontes('nada')).toEqual([])
    expect(normalizarFontes(null)).toEqual([])
    expect(normalizarFontes([null, 'x', { titulo: 'ok' }])).toHaveLength(1)
  })
})

describe('normalizarRelacoes', () => {
  it('preenche alvo e motivo ausentes com string vazia', () => {
    // `relacoes` é do material e cada item pode declarar só o alvo: o motivo ausente não pode
    // chegar como `undefined` ao portão (que o confere como string).
    expect(normalizarRelacoes({ complementa: [{}] }).complementa).toEqual([
      { alvo: '', motivo: '', pendente: false },
    ])
  })

  it('devolve as quatro listas vazias para a entrada que não é objeto de listas', () => {
    const vazio = { complementa: [], aprofundadoPor: [], aplicadoEm: [], naoConfundirCom: [] }
    expect(normalizarRelacoes(null)).toEqual(vazio)
    expect(normalizarRelacoes({ complementa: 'x' })).toEqual(vazio)
    // A lista que não é lista fica vazia; a válida é lida.
    expect(normalizarRelacoes({ complementa: 'x', aplicado_em: [{ alvo: 'a#TEMA-01' }] }).aplicadoEm).toEqual([
      { alvo: 'a#TEMA-01', motivo: '', pendente: false },
    ])
  })
})

describe('parsePaginaDeTexto', () => {
  it('tira o título do primeiro h1 do corpo', () => {
    const p = parsePaginaDeTexto('---\nescopo: "outro"\n---\n\n# Glossário\n\ntexto', 'referencia', 'glossario')
    expect(p.titulo).toBe('Glossário')
    expect(p.grupo).toBe('referencia')
    expect(p.slug).toBe('glossario')
  })

  it('cai no escopo declarado quando não há h1, e no slug quando não há escopo', () => {
    // Glossário e mapa de relações usam `##` sem número e podem não ter h1: o título é o `escopo`
    // do frontmatter e, na falta dele, o próprio slug — nunca vazio.
    const comEscopo = parsePaginaDeTexto('---\nescopo: "Termos do curso"\n---\n\n## Termos\n\na', 'referencia', 'glossario')
    expect(comEscopo.titulo).toBe('Termos do curso')
    const semEscopo = parsePaginaDeTexto('---\nfoo: 1\n---\n\n## Termos\n\na', 'referencia', 'mapa-relacoes')
    expect(semEscopo.titulo).toBe('mapa-relacoes')
  })
})

// --------------------------------------------------------- leitura tolerante do material

describe('hrefsDeAncorasCruas: rótulo com marcação', () => {
  it('tira a marcação interna do rótulo e colapsa os espaços', () => {
    // O texto do rótulo vai ao resolvedor (é por ele que o link declarado sem rota é
    // reconhecido): marcação interna e quebra de linha têm de chegar como texto simples.
    expect(hrefsDeAncorasCruas('<a href="x.md">veja\n   o <strong>doc</strong></a>')).toEqual([
      { href: 'x.md', texto: 'veja o doc' },
    ])
  })

  it('lê o href também na forma com aspas simples', () => {
    expect(hrefsDeAncorasCruas("<a href='x.md'>x</a>")).toEqual([{ href: 'x.md', texto: 'x' }])
  })
})

describe('renderSeguro: link sem destino', () => {
  it('não entrega ao resolvedor o link cujo href é vazio', () => {
    // `[vazio]()` vira `<a href="">`: não há destino a resolver, e chamar o resolvedor com o href
    // vazio faria o gerador acusar um link que não existe no material.
    const vistos: string[] = []
    const html = renderSeguro('[vazio]()', (href) => {
      vistos.push(href)
      return { acao: 'trocar', href: '#/x' }
    })
    expect(vistos).toEqual([])
    expect(html).toContain('<a href="">')
  })
})

describe('renderSeguro: atributo removido na sanitização', () => {
  it('nomeia o ATRIBUTO removido, e não só a tag', () => {
    // `<p style="…">` mantém o elemento e perde o atributo: o defeito é o atributo, e a mensagem
    // tem de dizê-lo (`@style em <p>`) para a revisão saber o que tirar do Markdown.
    expect(() => renderSeguro('<p style="color:red">ok</p>')).toThrow(/@style em <p>/)
  })
})

describe('âncoras em HTML cru: âncora sem endereço', () => {
  it('não recusa a âncora em HTML cru sem href', () => {
    // `<a href="">` não leva a lugar nenhum: não é o defeito que a regra persegue (link relativo
    // que o gerador deixaria intacto no arquivo único). Sem a guarda, um href vazio derrubaria o
    // build.
    expect(() => renderSeguro('<a href="">texto</a>', () => ({ acao: 'manter' }))).not.toThrow()
  })
})

describe('religação das âncoras: fragmento vazio e rota', () => {
  it('ignora o fragmento vazio e nunca toca no href de rota', () => {
    // Um documento com o par `#nota`/`id` (o que autoriza a releitura) MAIS um `#` nu e uma rota:
    // o `#` nu não tem alvo e fica como veio; a rota `#/…` já é o endereço de uma tela.
    const html = renderSeguro(
      '<p id="nota">alvo</p>\n\n[nota](#nota)\n\n[topo](#)\n\n[mapa](#/pagina/glossario)',
    )
    expect(html).toContain('href="#material-nota"')
    expect(html).toContain('href="#"')
    expect(html).toContain('href="#/pagina/glossario"')
    expect(html).not.toContain('href="#material-pagina')
  })
})
