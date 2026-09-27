// @vitest-environment jsdom
//
// Teste da preparação em volta do desenho do Mermaid: rótulo de cada diagrama, botão de ampliar e
// a modalidade do quadro ampliado.
//
// O DESENHO em si não é exercitado — `mermaid.run` precisa de medição de layout, que o jsdom não
// faz, e por isso o pacote `mermaid` é substituído por um dublê. O que se exercita é o que
// `renderizarMermaid` faz DEPOIS do desenho (`prepararDiagramas`), com DOM de entrada: é ali que
// estavam os defeitos medidos, e é ali que a lógica tem de ser provada — a suíte inteira mockava
// `./mermaid` e o smoke só contava `.mermaid svg`, então nenhum destes caminhos tinha teste.
//
// Os dois defeitos medidos que este arquivo passa a barrar:
//
//   1. nome acessível genérico e duplicado. `tituloDaSecao` exigia um `<section>` ancestral; na
//      única vista cujos diagramas ficam fora de seção (`#/pagina/README`, 2 diagramas no intro,
//      página alcançável por 140 links) os dois SVGs saíam como "Diagrama do material" e os dois
//      botões ficavam "Ampliar", sem nome próprio. E na seção 5 do TEMA-02 de arquitetura DOIS
//      diagramas dividem o mesmo cabeçalho: dois nomes iguais de novo;
//   2. `aria-modal="true"` sem modalidade: o TAB saía para o "Ampliar" do diagrama seguinte, dois
//      overlays podiam ficar abertos ao mesmo tempo, o Esc só fechava o que estivesse com o foco, e
//      o resto da página continuava na árvore de acessibilidade — a afirmação era uma frase só. As
//      quatro partes da afirmação (foco preso, Esc, foco de volta, resto inerte) estão aqui, e a
//      saída do quadro que o React remonta tem prova própria: o `inert` não pode ficar na página.
//
//   3. o quadro ampliado abria num CANTO da figura, com barra de rolagem: `definirAmpliado` só dava
//      `flex: 1; overflow: auto` ao `.mermaid`, e o SVG ficava no tamanho natural (~3000 px de
//      largura, porque `useMaxWidth: false` é deliberado na coluna de texto, onde a legibilidade
//      ganha). Ampliado, isso é abrir nos primeiros 25% do desenho com uma barra embaixo. O encaixe,
//      os controles de zoom (com o nível anunciado), o arrasto com o ponteiro e o deslocamento pelo
//      teclado têm prova aqui — e a conta do encaixe é função pura (`escalaParaCaber`) justamente
//      porque o jsdom não mede layout: os números entram injetados (`medir`), não desenhados.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { carregar, content } from '../infrastructure/content/repository'
import { ancorarCabecalhos } from './Blocos'
import { escalaParaCaber, prepararDiagramas } from './mermaid'

// O pacote de verdade não é carregado: quem desenha não é o que este teste mede, e a biblioteca
// inteira num teste que não a exercita é custo sem prova.
vi.mock('mermaid', () => ({
  default: { initialize: () => {}, run: () => Promise.resolve() },
}))

/** O desenho que o Mermaid deixa no nó: o `<svg>` que recebe `role` e `aria-label`. */
function svgDesenhado(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 10 10')
  return svg
}

/**
 * O desenho do fluxograma de verdade: `viewBox` de ~3000 px de largura, como o Mermaid o deixa com
 * `useMaxWidth: false` (e SEM atributo `width`/`height` — é o caso em que o tamanho natural sai só
 * das coordenadas, que o fechamento tem de devolver como estava).
 */
function svgDoFluxograma(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 3000 1200')
  return svg
}

/** O nó `.mermaid` como o Mermaid o deixa depois de desenhar: o próprio div com um `<svg>` dentro. */
function diagramaDesenhado(svg: SVGSVGElement = svgDesenhado()): HTMLElement {
  const no = document.createElement('div')
  no.className = 'mermaid'
  no.append(svg)
  return no
}

/** Um cabeçalho do material, como o `Html` o entrega. */
function cabecalho(tag: 'h2' | 'h3', texto: string): HTMLElement {
  const no = document.createElement(tag)
  no.textContent = texto
  return no
}

/** Uma seção do material, como o React a monta: o título e o HTML do trecho dentro dela. */
function secao(titulo: string, ...conteudo: Node[]): HTMLElement {
  const no = document.createElement('section')
  no.className = 'secao'
  no.append(cabecalho('h2', titulo), ...conteudo)
  return no
}

/**
 * A raiz da tela (o `main`), com os trechos na ordem.
 *
 * Entra no `document.body` porque o foco é o que se mede aqui: um nó fora do documento não recebe
 * foco nenhum, e o `activeElement` ficaria no `body` mesmo com a preparação certa.
 */
function raiz(...conteudo: Node[]): HTMLElement {
  const no = document.createElement('main')
  no.append(...conteudo)
  document.body.append(no)
  return no
}

afterEach(() => {
  document.body.innerHTML = ''
})

/** Os diagramas preparados na ordem da tela. */
function quadros(no: HTMLElement): HTMLElement[] {
  return [...no.querySelectorAll<HTMLElement>('.diagrama')]
}

/** O botão de ampliar/fechar de um quadro — o único `button` FILHO de `.diagrama-acoes`: os do
 * zoom moram no grupo `.diagrama-zoom`, que só existe enquanto o quadro está ampliado. */
function botaoDe(quadro: HTMLElement): HTMLButtonElement {
  const botao = quadro.querySelector<HTMLButtonElement>(':scope > .diagrama-acoes > button')
  if (!botao) throw new Error('o quadro do diagrama ficou sem botão')
  return botao
}

/** O contêiner que rola do quadro: é ele que ganha `diagrama-pan` e que o arrasto desloca. */
function desenhoDe(quadro: HTMLElement): HTMLElement {
  const desenho = quadro.querySelector<HTMLElement>('.mermaid')
  if (!desenho) throw new Error('o quadro do diagrama ficou sem o contêiner que rola')
  return desenho
}

/**
 * Os nomes dos controles do zoom, na ordem da tela — e não os textos visíveis, que saíram: cada
 * controle é um ícone agora, e o rótulo inteiro vive no `aria-label` (e no `title`, que é o mesmo
 * texto). Os glifos `−`, `+` e a palavra "Caber" continuam DENTRO do nome: é por eles que quem usa
 * controle por voz diz o que quer.
 */
const MENOS = '− Diminuir o zoom'
const MAIS = '+ Aumentar o zoom'
const CABER = 'Caber na janela'

/** Os três controles do zoom, na ordem em que estão na faixa de ações. */
function controlesDeZoom(quadro: HTMLElement): HTMLButtonElement[] {
  return [...quadro.querySelectorAll<HTMLButtonElement>('.diagrama-zoom button')]
}

/** Um controle do zoom pelo nome acessível, que agora carrega a ação inteira. */
function zoomDe(quadro: HTMLElement, rotulo: string): HTMLButtonElement {
  const botao = controlesDeZoom(quadro).find(
    (candidato) => candidato.getAttribute('aria-label') === rotulo,
  )
  if (!botao) throw new Error(`o quadro ampliado ficou sem o controle de zoom "${rotulo}"`)
  return botao
}

/** O ícone de um controle: o SVG é o único conteúdo do botão, e é por isso que ele não tem texto. */
function iconeDe(botao: HTMLButtonElement): SVGSVGElement {
  const icone = botao.querySelector('svg')
  if (!icone) throw new Error('o controle do zoom ficou sem ícone')
  return icone
}

/**
 * O desenho de um ícone, forma por forma: o `circle` com o centro e o raio, e o `path` com o `d`.
 *
 * Lê as coordenadas dos atributos em vez de comparar o `innerHTML`: a serialização do fragmento é
 * detalhe do ambiente (o jsdom, por exemplo, fecha cada forma com `</circle>` em vez de `/>`), e o
 * que importa aqui é QUAL desenho está no botão — é ele que separa a lupa do "menos" da do "mais"
 * e dos cantos do encaixe.
 */
function desenhoDoIcone(icone: SVGSVGElement): string[] {
  return Array.from(icone.children).map((forma) =>
    forma.tagName === 'circle'
      ? `circle: ${forma.getAttribute('cx')} ${forma.getAttribute('cy')} ${forma.getAttribute('r')}`
      : `path: ${forma.getAttribute('d')}`,
  )
}

/**
 * Confere um controle do zoom inteiro: o nome (e a dica do ponteiro, que é o MESMO texto), o
 * desenho que ele mostra e o que garante que esse desenho não entre no nome acessível.
 */
function conferirControle(botao: HTMLButtonElement, rotulo: string, desenho: string[]): void {
  // O texto visível saiu: o botão não tem mais conteúdo de texto nenhum, e o nome que sobra é a
  // ação. Sem o `aria-label` ele seria um botão redondo e mudo.
  expect(botao.getAttribute('aria-label')).toBe(rotulo)
  expect(botao.title).toBe(rotulo)
  expect(botao.textContent).toBe('')
  // A forma redonda é da folha; o que é nosso é ligá-la nos três controles de ícone, em cima da
  // forma base dos botões secundários.
  expect(botao.classList.contains('botao-redondo')).toBe(true)
  expect(botao.classList.contains('botao-secundario')).toBe(true)

  const icone = iconeDe(botao)
  // O ícone é decoração: `aria-hidden` o tira do nome acessível, e `focusable="false"` o tira da
  // tabulação nos navegadores que tabulam SVG por padrão.
  expect(icone.getAttribute('aria-hidden')).toBe('true')
  expect(icone.getAttribute('focusable')).toBe('false')
  // A convenção do ícone, no próprio desenho: caixa de 24, traço (e não preenchimento) na cor do
  // texto, ponta e junta arredondadas, 1,15 rem de lado.
  expect(icone.getAttribute('viewBox')).toBe('0 0 24 24')
  expect(icone.getAttribute('fill')).toBe('none')
  expect(icone.getAttribute('stroke')).toBe('currentColor')
  expect(icone.getAttribute('stroke-width')).toBe('2')
  expect(icone.getAttribute('stroke-linecap')).toBe('round')
  expect(icone.getAttribute('stroke-linejoin')).toBe('round')
  expect(icone.getAttribute('width')).toBe('1.15rem')
  expect(icone.getAttribute('height')).toBe('1.15rem')
  // E é SVG de verdade: um `<svg>` que o analisador criasse no namespace de HTML não desenharia
  // nada, por mais certos que os atributos estivessem.
  expect(icone.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(desenhoDoIcone(icone)).toEqual(desenho)
}

/** O nível do zoom como texto. Um quadro ampliado SEM nível é defeito, e não ausência a tolerar. */
function nivelDe(quadro: HTMLElement): HTMLElement {
  const nivel = quadro.querySelector<HTMLElement>('.zoom-nivel')
  if (!nivel) throw new Error('o quadro ampliado ficou sem o nível do zoom')
  return nivel
}

/**
 * O tamanho que o quadro deu ao DESENHO, em pixels — é por ele que o zoom é aplicado.
 *
 * O seletor é `.mermaid svg`, e não `svg` nenhum do quadro: ampliado, o quadro tem mais SVG dentro
 * dele (o ícone de cada controle do zoom, com `width="1.15rem"`), e o primeiro `svg` da árvore
 * passou a ser um deles. Ler o atributo do ícone devolveria `NaN` — e um `NaN` que, num teste
 * menos explícito, passaria por acerto.
 */
function tamanhoAplicado(quadro: HTMLElement): { largura: number; altura: number } {
  const svg = quadro.querySelector('.mermaid svg')
  if (!svg) throw new Error('o quadro ampliado ficou sem o desenho')
  return {
    largura: Number(svg.getAttribute('width')),
    altura: Number(svg.getAttribute('height')),
  }
}

/**
 * Dá medida ao contêiner que rola, que o jsdom não calcula (tudo ali mede 0).
 *
 * É o que permite injetar os números do encaixe sem layout de verdade: sem isto a conta cai na
 * janela do jsdom (1024×768), e um `viewBox` de 10 px encaixaria em 100% por acidente.
 */
function medir(desenho: HTMLElement, largura: number, altura: number): void {
  Object.defineProperty(desenho, 'clientWidth', { value: largura, configurable: true })
  Object.defineProperty(desenho, 'clientHeight', { value: altura, configurable: true })
}

/** Um arrasto como o navegador o entrega ao contêiner: `pointerdown`, `pointermove` e `pointerup`. */
function arrastar(desenho: HTMLElement, de: { x: number; y: number }, ate: { x: number; y: number }): void {
  desenho.dispatchEvent(
    new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: de.x, clientY: de.y }),
  )
  desenho.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: ate.x, clientY: ate.y }))
  desenho.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
}

/**
 * O nome acessível do DESENHO (e não o de um ícone de controle, que é decorativo e não tem nome).
 */
function rotuloDoSvg(quadro: HTMLElement): string {
  return quadro.querySelector('.mermaid svg')?.getAttribute('aria-label') ?? ''
}

/** Aperta uma tecla como o navegador faria: no elemento focado, subindo para o documento. */
function teclar(tecla: string, opcoes: { shift?: boolean } = {}): KeyboardEvent {
  const evento = new KeyboardEvent('keydown', {
    key: tecla,
    shiftKey: opcoes.shift ?? false,
    bubbles: true,
    cancelable: true,
  })
  document.activeElement?.dispatchEvent(evento)
  return evento
}

describe('prepararDiagramas — nome de cada diagrama', () => {
  it('nomeia fora de seção pelo cabeçalho anterior — o caso da página README', () => {
    // A vista medida (`#/pagina/README`): dois diagramas no intro, nenhum dentro de `<section>`.
    const container = raiz(
      cabecalho('h2', 'Mapa geral'),
      diagramaDesenhado(),
      cabecalho('h2', 'Sequência sugerida'),
      diagramaDesenhado(),
    )

    prepararDiagramas(container)

    const [primeiro, segundo] = quadros(container)
    expect(primeiro).toBeTruthy()
    expect(segundo).toBeTruthy()
    // Sem `<section>` ancestral, o nome saía "Diagrama do material" nos DOIS: dois `role="img"`
    // de mesmo nome na mesma página, e nenhum jeito de saber qual é qual.
    expect(rotuloDoSvg(primeiro!)).toBe('Diagrama: Mapa geral')
    expect(rotuloDoSvg(segundo!)).toBe('Diagrama: Sequência sugerida')
    expect(primeiro!.querySelector('.mermaid svg')?.getAttribute('role')).toBe('img')
    // O botão também: dois "Ampliar" iguais não dizem o que cada um amplia.
    expect(botaoDe(primeiro!).textContent).toBe('Ampliar')
    expect(botaoDe(primeiro!).getAttribute('aria-label')).toBe('Ampliar o diagrama Mapa geral')
    expect(botaoDe(segundo!).getAttribute('aria-label')).toBe(
      'Ampliar o diagrama Sequência sugerida',
    )
  })

  it('desempata com o ordinal quando dois diagramas dividem o mesmo cabeçalho', () => {
    // O caso medido: a seção 5 do TEMA-02 de arquitetura tem dois diagramas, e o cabeçalho é um só.
    const container = raiz(secao('5. Conteúdo', diagramaDesenhado(), diagramaDesenhado()))

    prepararDiagramas(container)

    const [primeiro, segundo] = quadros(container)
    expect(rotuloDoSvg(primeiro!)).toBe('Diagrama: 5. Conteúdo (diagrama 1 de 2)')
    expect(rotuloDoSvg(segundo!)).toBe('Diagrama: 5. Conteúdo (diagrama 2 de 2)')
    expect(botaoDe(primeiro!).getAttribute('aria-label')).toBe(
      'Ampliar o diagrama 5. Conteúdo (diagrama 1 de 2)',
    )
    expect(botaoDe(segundo!).getAttribute('aria-label')).not.toBe(
      botaoDe(primeiro!).getAttribute('aria-label'),
    )
  })

  it('nomeia dentro de seção pelo título dela, e não remexe o que já foi preparado', () => {
    const container = raiz(secao('4. Temas', diagramaDesenhado()))
    prepararDiagramas(container)

    const quadro = quadros(container)[0]!
    expect(rotuloDoSvg(quadro)).toBe('Diagrama: 4. Temas')

    // A segunda passada é a troca de tema: o nó já tem quadro, e o que se refaz é só o rótulo (o
    // SVG novo acabou de ser desenhado dentro dele). Um envelope por cima do outro seria um quadro
    // dentro de quadro.
    prepararDiagramas(container)
    expect(quadros(container)).toHaveLength(1)
    expect(rotuloDoSvg(quadro)).toBe('Diagrama: 4. Temas')
  })

  it('dá nome próprio aos dois diagramas do intro da página README de verdade', async () => {
    // A vista medida, com o material de verdade: a página alcançável por 140 links, cujos diagramas
    // ficam no `intro` — sem `<section>` ancestral, `tituloDaSecao` devolvia vazio e os dois SVGs
    // saíam como "Diagrama do material", com dois botões "Ampliar" idênticos.
    await carregar()
    const pagina = content.paginas.find((p) => p.slug === 'README')
    if (!pagina) throw new Error('o content.json desta execução não tem a página README')

    // O mesmo HTML que a tela mostra: o intro da página com os cabeçalhos ancorados.
    const container = raiz()
    container.innerHTML = ancorarCabecalhos(pagina.intro, 'intro').html

    const nos = [...container.querySelectorAll<HTMLElement>('.mermaid')]
    expect(nos).toHaveLength(2)
    // A medição do achado: nenhum dos dois está dentro de uma seção.
    expect(nos.map((no) => no.closest('section'))).toEqual([null, null])

    // O que o Mermaid faria: o texto do diagrama vira desenho dentro do próprio nó.
    for (const no of nos) {
      no.textContent = ''
      no.append(svgDesenhado())
    }

    prepararDiagramas(container)

    // Cada um recebe o nome do trecho que o antecede na página.
    expect([...container.querySelectorAll('svg')].map((svg) => svg.getAttribute('aria-label'))).toEqual(
      ['Diagrama: Mapa geral', 'Diagrama: Sequência sugerida'],
    )
    expect([...container.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'))).toEqual(
      ['Ampliar o diagrama Mapa geral', 'Ampliar o diagrama Sequência sugerida'],
    )
  })
})

describe('prepararDiagramas — o quadro ampliado', () => {
  /** Uma tela com dois diagramas, cada um na sua seção. */
  function telaComDois(): HTMLElement {
    const container = raiz(
      secao('4. Temas', diagramaDesenhado()),
      secao('5. Conteúdo', diagramaDesenhado()),
    )
    prepararDiagramas(container)
    return container
  }

  /**
   * A tela do app de verdade: `body > .app > (pular, .topo, main)`, com os dois diagramas dentro
   * do `main`. É o formato que mostra se a marca de inerte sai do quadro na direção certa — o
   * `.topo` e o "Pular para o conteúdo" são IRMÃOS do `main`, e não da seção do quadro.
   */
  function telaComoOApp(): { container: HTMLElement; topo: HTMLElement; pular: HTMLElement } {
    const app = document.createElement('div')
    app.className = 'app'
    const pular = document.createElement('button')
    pular.className = 'pular'
    pular.textContent = 'Pular para o conteúdo'
    const topo = document.createElement('header')
    topo.className = 'topo'
    const container = document.createElement('main')
    container.append(
      secao('4. Temas', diagramaDesenhado()),
      secao('5. Conteúdo', diagramaDesenhado()),
    )
    app.append(pular, topo, container)
    document.body.append(app)
    prepararDiagramas(container)
    return { container, topo, pular }
  }

  it('amplia, declara o diálogo e devolve o foco ao fechar', () => {
    const container = telaComDois()
    const [primeiro] = quadros(container)
    expect(primeiro).toBeTruthy()
    const botao = botaoDe(primeiro!)

    botao.click()

    // O quadro cobre a janela: é um diálogo, e o nome dele diz QUAL diagrama está ampliado.
    expect(primeiro!.classList.contains('ampliado')).toBe(true)
    expect(primeiro!.getAttribute('role')).toBe('dialog')
    expect(primeiro!.getAttribute('aria-modal')).toBe('true')
    expect(primeiro!.getAttribute('aria-label')).toBe('Diagrama ampliado: 4. Temas')
    // O foco entra nele: é o que faz o Esc chegar (e o leitor de tela anunciar o diálogo).
    expect(document.activeElement).toBe(primeiro)
    expect(botao.textContent).toBe('Fechar')
    expect(botao.getAttribute('aria-expanded')).toBe('true')
    expect(botao.getAttribute('aria-label')).toBe('Fechar o diagrama 4. Temas')

    teclar('Escape')

    expect(primeiro!.classList.contains('ampliado')).toBe(false)
    expect(primeiro!.hasAttribute('role')).toBe(false)
    expect(primeiro!.hasAttribute('aria-modal')).toBe(false)
    expect(primeiro!.hasAttribute('aria-label')).toBe(false)
    // O foco volta para o botão que abriu: quem chegou de teclado não recomeça a tabulação do topo.
    expect(document.activeElement).toBe(botao)
    expect(botao.textContent).toBe('Ampliar')
    expect(botao.getAttribute('aria-expanded')).toBe('false')
  })

  it('prende o foco dentro do quadro: o TAB não sai para o diagrama seguinte', () => {
    const container = telaComDois()
    const [primeiro, segundo] = quadros(container)
    const botaoDoSegundo = botaoDe(segundo!)
    botaoDe(primeiro!).click()

    const botao = botaoDe(primeiro!)
    const desenho = desenhoDe(primeiro!)
    // Os três controles do zoom, na ordem da tela — conferidos pelo NOME, que é o rótulo inteiro
    // desde que o texto visível saiu em favor do ícone. A ordem importa: é o primeiro deles que o
    // laço de foco toma como entrada.
    const controles = controlesDeZoom(primeiro!)
    expect(controles.map((controle) => controle.getAttribute('aria-label'))).toEqual([
      MENOS,
      MAIS,
      CABER,
    ])

    // O estado medido: com o foco fora do quadro (o "Ampliar" do diagrama seguinte), o TAB levava
    // o leitor para um controle que a tela nem mostra, e o Esc deixava de fechar o quadro aberto.
    botaoDoSegundo.focus()
    const comTab = teclar('Tab')

    expect(comTab.defaultPrevented).toBe(true)
    // O foco volta para o quadro — e para o PRIMEIRO controle dele na ordem da tela, que é o "−"
    // do zoom: o laço entra pela faixa de ações, como qualquer leitura de cima para baixo.
    expect(document.activeElement).toBe(controles[0])
    expect(primeiro!.classList.contains('ampliado')).toBe(true)

    // Dentro do quadro o TAB cicla entre TODOS os controles dele — os três do zoom, o de fechar e o
    // desenho (que ampliado é a área que rola, e por isso ganha `tabindex=0`: um contêiner focável
    // com rolagem rola com as setas por comportamento nativo do navegador, e é o MESMO
    // `scrollLeft`/`scrollTop` que o arrasto move) — e dá a volta nos dois sentidos.
    const naOrdem = [...controles, botao, desenho]
    for (const destino of naOrdem.slice(1)) {
      teclar('Tab')
      expect(document.activeElement).toBe(destino)
    }
    teclar('Tab')
    expect(document.activeElement).toBe(controles[0])
    const comShiftTab = teclar('Tab', { shift: true })
    expect(comShiftTab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(desenho)

    // E o Esc fecha mesmo com o foco em outro lugar, devolvendo-o ao botão que abriu.
    botaoDoSegundo.focus()
    const comEsc = teclar('Escape')
    expect(comEsc.defaultPrevented).toBe(true)
    expect(primeiro!.classList.contains('ampliado')).toBe(false)
    expect(document.activeElement).toBe(botao)
    // Fechado, o desenho deixa de ser parada de tabulação.
    expect(desenho.hasAttribute('tabindex')).toBe(false)
  })

  it('deixa um quadro ampliado por vez, cada um com o próprio nome', () => {
    const container = telaComDois()
    const [primeiro, segundo] = quadros(container)
    const botaoDoPrimeiro = botaoDe(primeiro!)

    botaoDoPrimeiro.click()
    botaoDe(segundo!).click()

    // Dois diálogos modais abertos ao mesmo tempo seriam dois lugares afirmando que prenderam o
    // foco; abrir o segundo fecha o primeiro, com o rótulo dele de volta ao que era.
    expect(primeiro!.classList.contains('ampliado')).toBe(false)
    expect(primeiro!.hasAttribute('role')).toBe(false)
    expect(botaoDoPrimeiro.textContent).toBe('Ampliar')
    expect(botaoDoPrimeiro.getAttribute('aria-expanded')).toBe('false')
    expect(segundo!.classList.contains('ampliado')).toBe(true)
    expect(segundo!.getAttribute('aria-label')).toBe('Diagrama ampliado: 5. Conteúdo')
    expect(document.activeElement).toBe(segundo)
  })

  it('solta o foco quando o quadro sai do DOM com a seção remontada', () => {
    const container = telaComDois()
    const [primeiro, segundo] = quadros(container)
    botaoDe(primeiro!).click()
    expect(primeiro!.classList.contains('ampliado')).toBe(true)

    // É o que a troca de tema faz: a seção inteira é remontada e o quadro que estava aberto sai do
    // DOM. Sem esta saída, o ouvinte de teclado continuaria de guarda prendendo o foco num nó
    // desligado — e o TAB nunca mais chegaria a controle nenhum da página.
    primeiro!.remove()
    const botaoDoSegundo = botaoDe(segundo!)
    botaoDoSegundo.focus()
    const comTab = teclar('Tab')

    expect(comTab.defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(botaoDoSegundo)
    // E o outro diagrama continua utilizável: abre e fecha normalmente.
    botaoDoSegundo.click()
    expect(segundo!.classList.contains('ampliado')).toBe(true)
    teclar('Escape')
    expect(segundo!.classList.contains('ampliado')).toBe(false)
  })

  it('tira o resto da página do alcance enquanto o quadro está ampliado — e devolve ao fechar', () => {
    const { container, topo, pular } = telaComoOApp()
    const [primeiro, segundo] = quadros(container)
    expect(primeiro).toBeTruthy()
    expect(segundo).toBeTruthy()
    const botaoDoSegundo = botaoDe(segundo!)

    botaoDoSegundo.focus()
    botaoDe(primeiro!).click()

    // `aria-modal="true"` afirma que o resto da tela está inerte. Sem o `inert`, a afirmação era
    // só uma frase: a árvore de acessibilidade continuava com a página inteira dentro dela.
    expect(topo.hasAttribute('inert')).toBe(true)
    expect(topo.getAttribute('aria-hidden')).toBe('true')
    expect(pular.hasAttribute('inert')).toBe(true)
    // A outra seção do material é IRMÃ do quadro dentro do `main` — o caminho que a varredura cobre
    // subindo nível a nível, e não só o que está fora do `main`. A marca vai no bloco do nível, e
    // não em cada controle: o "Ampliar" do segundo diagrama fica inerte por estar dentro dela.
    const secaoDoSegundo = segundo!.closest('section')
    expect(secaoDoSegundo).toBeTruthy()
    expect(secaoDoSegundo?.hasAttribute('inert')).toBe(true)
    // E o caminho do quadro (ele e os ancestrais dele) fica de fora: é por ele que a leitura
    // continua, e o `aria-hidden` num ancestral do elemento focado seria o defeito oposto.
    expect(primeiro!.hasAttribute('inert')).toBe(false)
    expect(container.hasAttribute('inert')).toBe(false)
    expect(container.parentElement?.hasAttribute('inert')).toBe(false)
    expect(document.activeElement).toBe(primeiro)

    teclar('Escape')

    // O fechamento devolve tudo: página viva, e nada do que a marcação escreveu fica para trás.
    expect(topo.hasAttribute('inert')).toBe(false)
    expect(topo.hasAttribute('aria-hidden')).toBe(false)
    expect(pular.hasAttribute('inert')).toBe(false)
    expect(segundo!.hasAttribute('inert')).toBe(false)
    expect(document.activeElement).toBe(botaoDe(primeiro!))
  })

  it('não deixa a página inerte quando o quadro sai do DOM com o overlay aberto', async () => {
    const { container, topo } = telaComoOApp()
    const [primeiro] = quadros(container)
    expect(primeiro).toBeTruthy()
    botaoDe(primeiro!).click()
    expect(topo.hasAttribute('inert')).toBe(true)

    // O caso da troca de tema com o quadro aberto: o React remonta o trecho, o quadro e o botão
    // saem do DOM e NINGUÉM chama o fechamento. Sem o observador, o `inert` ficaria nos irmãos do
    // quadro para sempre — a página inteira morta, para quem não aperta tecla nenhuma.
    primeiro!.remove()
    await new Promise((resolver) => setTimeout(resolver, 0))

    expect(topo.hasAttribute('inert')).toBe(false)
    expect(topo.hasAttribute('aria-hidden')).toBe(false)
    // E o outro diagrama volta a funcionar (o estado do quadro aberto foi solto junto).
    const outro = [...container.querySelectorAll<HTMLElement>('.diagrama')][0]
    expect(outro).toBeTruthy()
    botaoDe(outro!).click()
    expect(outro!.classList.contains('ampliado')).toBe(true)
    teclar('Escape')
    expect(outro!.classList.contains('ampliado')).toBe(false)
  })
})

describe('escalaParaCaber — a conta do encaixe, com números injetados', () => {
  it('limita pela largura quando é a largura que aperta', () => {
    // 3000 px de desenho numa caixa de 750: o ajuste pela largura (0,25) é o menor dos dois.
    expect(escalaParaCaber(3000, 1200, 750, 800)).toBe(0.25)
  })

  it('limita pela altura quando é a altura que aperta', () => {
    expect(escalaParaCaber(1000, 2000, 900, 500)).toBe(0.25)
  })

  it('não amplia acima de 1: figura pequena não vira borrão só porque há espaço', () => {
    expect(escalaParaCaber(200, 100, 4000, 3000)).toBe(1)
  })

  it('respeita o piso do zoom: encaixe abaixo de 0,2 não é um nível que o "+" alcance', () => {
    // 3000 px numa caixa de 300 pediriam 0,1 — abaixo do piso dos controles. O encaixe para em
    // 0,2, e o que não couber continua sendo rolagem, como era antes de existir zoom.
    expect(escalaParaCaber(3000, 1200, 300, 300)).toBe(0.2)
  })

  it('sem medida de layout devolve 1 — encolher por um número que não existe seria pior', () => {
    // É o caso do jsdom, e o do contêiner que ainda não tem layout no primeiro quadro depois de
    // abrir: 1 e não 0 (um desenho de tamanho zero seria invisível), e não 0,2 (um encolhimento
    // decidido por medida nenhuma).
    expect(escalaParaCaber(3000, 1200, 0, 0)).toBe(1)
  })
})

describe('prepararDiagramas — zoom e deslocamento do quadro ampliado', () => {
  /** Uma tela com um diagrama do tamanho do fluxograma de verdade, dentro de uma seção. */
  function telaDoFluxograma(): { quadro: HTMLElement; desenho: HTMLElement } {
    const container = raiz(secao('5. Conteúdo', diagramaDesenhado(svgDoFluxograma())))
    prepararDiagramas(container)
    const quadro = quadros(container)[0]!
    return { quadro, desenho: desenhoDe(quadro) }
  }

  it('abre ENCAIXADO: a figura inteira na janela, e não num canto', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)

    botaoDe(quadro).click()

    // O estado medido: com o SVG no tamanho natural (~3000 px) dentro de um quadro que rola, o que
    // aparecia era o canto superior esquerdo com barra de rolagem. Encaixado, o desenho ocupa 0,25
    // do natural — os 750 px da caixa — e a rolagem não tem para onde ir.
    expect(tamanhoAplicado(quadro)).toEqual({ largura: 750, altura: 300 })
    expect(nivelDe(quadro).textContent).toBe('25%')
    // O contêiner que rola passa a ser o do arrasto (a folha põe nele o cursor e o `touch-action`).
    expect(desenho.classList.contains('diagrama-pan')).toBe(true)
    expect(desenho.scrollLeft).toBe(0)
    expect(desenho.scrollTop).toBe(0)
  })

  it('dá zoom no passo de 1,25 e mostra o nível — nos dois sentidos', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()

    // A escala entra pela largura/altura do SVG em PIXELS (3000 × 0,3125), e não por
    // `transform: scale`: é isso que faz a área de rolagem crescer de verdade.
    zoomDe(quadro, MAIS).click()
    expect(tamanhoAplicado(quadro)).toEqual({ largura: 937.5, altura: 375 })
    expect(nivelDe(quadro).textContent).toBe('31%')

    zoomDe(quadro, MENOS).click()
    expect(tamanhoAplicado(quadro)).toEqual({ largura: 750, altura: 300 })
    expect(nivelDe(quadro).textContent).toBe('25%')

    // Os três controles com nome próprio: o texto visível saiu (um glifo não é lido por ninguém),
    // e o nome que sobra é a AÇÃO inteira — três botões de ícone sem nome seriam três botões mudos.
    const controles = controlesDeZoom(quadro)
    expect(controles.map((controle) => controle.getAttribute('aria-label'))).toEqual([
      '− Diminuir o zoom',
      '+ Aumentar o zoom',
      'Caber na janela',
    ])
  })

  it('mostra ícone no lugar do texto: o nome acessível é a ação, e o desenho é decorativo', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()

    const [menos, mais, caber] = controlesDeZoom(quadro)
    expect(menos).toBeTruthy()
    expect(mais).toBeTruthy()
    expect(caber).toBeTruthy()

    // Cada controle com o SEU desenho: a lupa com o cabo (o "menos"), a lupa com o `+` a mais no
    // cabo (o "mais") e os quatro cantos do encaixe (o "Caber"). Ícone trocado é controle que mente
    // sobre o que faz — a forma de conferir é o desenho, e não a presença de um `<svg>` qualquer.
    conferirControle(menos!, MENOS, ['circle: 11 11 7', 'path: M8 11h6M20 20l-4.6-4.6'])
    conferirControle(mais!, MAIS, ['circle: 11 11 7', 'path: M8 11h6M11 8v6M20 20l-4.6-4.6'])
    conferirControle(caber!, CABER, [
      'path: M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4',
    ])

    // E os três desenhos são distintos entre si: dois controles com o MESMO ícone voltariam a ser
    // dois botões indistinguíveis na tela — o que o nome próprio por diagrama já corrigiu uma vez.
    const desenhos = [menos!, mais!, caber!].map((controle) =>
      JSON.stringify(desenhoDoIcone(iconeDe(controle))),
    )
    expect(new Set(desenhos).size).toBe(3)

    // O nível continua sendo INFORMAÇÃO, e não botão: ele ficou como estava, com o texto visível e
    // o `role=status`, e é o único conteúdo de texto da faixa além do rótulo do botão de fechar.
    expect(nivelDe(quadro).textContent).toBe('25%')
    expect(quadro.querySelectorAll('.diagrama-zoom svg')).toHaveLength(3)
  })

  it('o zoom para no teto de 4 e no piso de 0,2', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()

    // O teto: 4× o natural. O botão continua clicável e para de mexer na escala — e o nível diz
    // isso a quem clica, em vez de deixar o clique parecer quebrado.
    for (let i = 0; i < 20; i += 1) zoomDe(quadro, MAIS).click()
    expect(nivelDe(quadro).textContent).toBe('400%')
    expect(tamanhoAplicado(quadro)).toEqual({ largura: 12000, altura: 4800 })

    // O piso: 0,2×, onde o rótulo do fluxograma ainda é legível.
    for (let i = 0; i < 20; i += 1) zoomDe(quadro, MENOS).click()
    expect(nivelDe(quadro).textContent).toBe('20%')
    expect(tamanhoAplicado(quadro).largura).toBe(600)
    // Dois cliques no piso não mudam nada: o limite é um ponto de parada, e não um valor que a
    // escala continua atravessando por baixo.
    zoomDe(quadro, MENOS).click()
    expect(nivelDe(quadro).textContent).toBe('20%')
  })

  it('anuncia o nível: o texto do zoom é estado, e vive numa região viva', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()

    const nivel = nivelDe(quadro)
    // A mudança que ninguém vê: quem usa leitor de tela não recebe o texto que apareceu na tela.
    // `role=status` (leitura educada, não interruptiva) + `aria-atomic`: o nível inteiro é lido a
    // cada mudança, e não o pedaço que mudou de um texto que já estava lá.
    expect(nivel.getAttribute('role')).toBe('status')
    expect(nivel.getAttribute('aria-live')).toBe('polite')
    expect(nivel.getAttribute('aria-atomic')).toBe('true')
    expect(nivel.textContent).toBe('25%')

    zoomDe(quadro, MAIS).click()

    // O MESMO nó, com o texto novo: é a mudança de texto de uma região viva que o leitor anuncia.
    expect(nivelDe(quadro)).toBe(nivel)
    expect(nivel.textContent).toBe('31%')
  })

  it('Caber volta ao encaixe — inclusive depois de arrastar', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()
    zoomDe(quadro, MAIS).click()
    zoomDe(quadro, MAIS).click()
    // O zoom ancora no CENTRO do que está visível, então a rolagem não está em 0 depois de
    // ampliar: o arrasto anda a partir dali, e o que se mede é o que ele acrescentou.
    const antesDoArrasto = desenho.scrollLeft
    expect(antesDoArrasto).toBeGreaterThan(0)
    arrastar(desenho, { x: 300, y: 200 }, { x: 120, y: 60 })
    expect(desenho.scrollLeft).toBe(antesDoArrasto + 180)

    zoomDe(quadro, CABER).click()

    expect(tamanhoAplicado(quadro)).toEqual({ largura: 750, altura: 300 })
    expect(nivelDe(quadro).textContent).toBe('25%')
    // O deslocamento volta ao início junto: "caber" com a rolagem onde o arrasto a deixou deixaria
    // a figura fora do campo de visão que o encaixe acabou de calcular.
    expect(desenho.scrollLeft).toBe(0)
    expect(desenho.scrollTop).toBe(0)
  })

  it('move pelo diagrama: o arrasto desloca a rolagem, e a solta devolve o cursor', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()

    desenho.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 50 }),
    )
    // O cursor de "pegar" é da folha, pela classe; o arrasto em curso é este estado.
    expect(desenho.classList.contains('arrastando')).toBe(true)

    desenho.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 60, clientY: 30 }))
    // Puxar para a esquerda/cima mostra o que está à direita/abaixo: o dedo "pega" o desenho e o
    // leva junto, então a rolagem anda ao CONTRÁRIO do ponteiro.
    expect(desenho.scrollLeft).toBe(40)
    expect(desenho.scrollTop).toBe(20)

    desenho.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    expect(desenho.classList.contains('arrastando')).toBe(false)
    // Soltar a mão não devolve a figura ao início, e o ponteiro solto não desloca mais nada.
    expect(desenho.scrollLeft).toBe(40)
    desenho.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 10, clientY: 10 }))
    expect(desenho.scrollLeft).toBe(40)
    expect(desenho.scrollTop).toBe(20)
  })

  it('o botão direito e a visão inline não arrastam nem mostram os controles', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)

    // Inline, a rolagem é a da coluna de texto e o ponteiro continua servindo para selecionar
    // texto: nada de arrasto, nada de escala, nada de controles, nenhum atributo nosso no SVG.
    desenho.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 100, clientY: 50 }),
    )
    desenho.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 60, clientY: 30 }))
    expect(desenho.classList.contains('arrastando')).toBe(false)
    expect(desenho.scrollLeft).toBe(0)
    expect(desenho.classList.contains('diagrama-pan')).toBe(false)
    expect(quadro.querySelector('.diagrama-zoom')).toBeNull()
    expect(quadro.querySelector('.mermaid svg')?.hasAttribute('width')).toBe(false)
    // O único controle do bloco segue sendo o de ampliar.
    expect([...quadro.querySelectorAll('button')].map((botao) => botao.textContent)).toEqual([
      'Ampliar',
    ])

    botaoDe(quadro).click()

    // Ampliado, o botão direito abre o menu do navegador e o do meio cola/rola: nenhum dos dois é
    // um arrasto, e nenhum deles pode deixar o cursor de "pegar" preso no quadro.
    desenho.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, button: 2, clientX: 100, clientY: 50 }),
    )
    desenho.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 60, clientY: 30 }))
    expect(desenho.classList.contains('arrastando')).toBe(false)
    expect(desenho.scrollLeft).toBe(0)
  })

  it('reencaixa quando a janela muda de tamanho — e só enquanto não houve zoom', () => {
    const { quadro, desenho } = telaDoFluxograma()
    medir(desenho, 750, 800)
    botaoDe(quadro).click()
    expect(nivelDe(quadro).textContent).toBe('25%')

    // A janela cresce (rotação de tela, janela arrastada, o painel do celular que sai da frente): a
    // figura inteira continua à vista, no encaixe novo.
    medir(desenho, 1500, 1200)
    window.dispatchEvent(new Event('resize'))
    expect(nivelDe(quadro).textContent).toBe('50%')
    expect(tamanhoAplicado(quadro).largura).toBe(1500)

    // Com o usuário no comando do zoom, o redimensionamento NÃO desfaz a escolha dele: quem
    // ampliou para ler um rótulo perderia a leitura a cada mexida no tamanho da janela.
    zoomDe(quadro, MAIS).click()
    expect(nivelDe(quadro).textContent).toBe('63%')
    medir(desenho, 3000, 2000)
    window.dispatchEvent(new Event('resize'))
    expect(nivelDe(quadro).textContent).toBe('63%')
    expect(tamanhoAplicado(quadro).largura).toBe(1875)

    // E o `Caber` volta a seguir a janela: é ele que devolve o quadro ao encaixe.
    zoomDe(quadro, CABER).click()
    expect(nivelDe(quadro).textContent).toBe('100%')
    expect(tamanhoAplicado(quadro).largura).toBe(3000)

    // Fechado, o redimensionamento não pode mais mexer em quadro nenhum.
    teclar('Escape')
    medir(desenho, 375, 400)
    window.dispatchEvent(new Event('resize'))
    expect(quadro.querySelector('.mermaid svg')?.hasAttribute('width')).toBe(false)
  })

  it('não escala um desenho SEM tamanho natural: abriria com `width="0"`', () => {
    // Um SVG sem `width`/`height` e sem `viewBox` não tem tamanho natural nenhum. Medir 0 e
    // multiplicar por 1 escreveria `width="0" height="0"` — a figura sumiria da tela, que é pior do
    // que não ter zoom. O quadro abre com o botão de fechar e o desenho como veio.
    const semMedida = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const container = raiz(secao('5. Conteúdo', diagramaDesenhado(semMedida)))
    prepararDiagramas(container)
    const quadro = quadros(container)[0]!

    botaoDe(quadro).click()

    expect(quadro.classList.contains('ampliado')).toBe(true)
    expect(semMedida.hasAttribute('width')).toBe(false)
    expect(semMedida.hasAttribute('height')).toBe(false)
    expect(quadro.querySelector('.diagrama-zoom')).toBeNull()
    expect(desenhoDe(quadro).classList.contains('diagrama-pan')).toBe(false)
  })

  it('fecha limpo: nada da escala nem do arrasto sobra para a visão inline nem para o próximo quadro', () => {
    // Dois diagramas do tamanho real, um em cada seção, como o material tem de verdade.
    const container = raiz(
      secao('4. Temas', diagramaDesenhado(svgDoFluxograma())),
      secao('5. Conteúdo', diagramaDesenhado(svgDoFluxograma())),
    )
    prepararDiagramas(container)
    const [primeiro, segundo] = quadros(container)
    const desenhoDoPrimeiro = desenhoDe(primeiro!)
    medir(desenhoDoPrimeiro, 750, 800)

    botaoDe(primeiro!).click()
    zoomDe(primeiro!, MAIS).click()
    const antesDoArrasto = desenhoDoPrimeiro.scrollLeft
    arrastar(desenhoDoPrimeiro, { x: 300, y: 200 }, { x: 120, y: 60 })
    // O estado de partida, medido: com o quadro aberto, tudo isso está lá.
    expect(tamanhoAplicado(primeiro!).largura).toBe(937.5)
    expect(desenhoDoPrimeiro.scrollLeft).toBe(antesDoArrasto + 180)
    expect(desenhoDoPrimeiro.classList.contains('diagrama-pan')).toBe(true)

    teclar('Escape')

    // A visão inline depende do tamanho NATURAL (é a legibilidade da coluna de texto que dita o
    // `useMaxWidth: false`): o `width`/`height` que o zoom escreveu sai, e o SVG volta a não ter
    // atributo nenhum — exatamente como o Mermaid o deixou.
    expect(primeiro!.querySelector('.mermaid svg')?.hasAttribute('width')).toBe(false)
    expect(primeiro!.querySelector('.mermaid svg')?.hasAttribute('height')).toBe(false)
    expect(desenhoDoPrimeiro.classList.contains('diagrama-pan')).toBe(false)
    expect(desenhoDoPrimeiro.classList.contains('arrastando')).toBe(false)
    expect(desenhoDoPrimeiro.scrollLeft).toBe(0)
    expect(desenhoDoPrimeiro.scrollTop).toBe(0)
    expect(primeiro!.querySelector('.diagrama-zoom')).toBeNull()
    expect(primeiro!.querySelector('.zoom-nivel')).toBeNull()

    // O próximo quadro começa do encaixe DELE, e não do zoom do anterior: escala e deslocamento
    // vivem no quadro que os pediu, e não numa variável de módulo.
    medir(desenhoDe(segundo!), 750, 800)
    botaoDe(segundo!).click()
    expect(nivelDe(segundo!).textContent).toBe('25%')
    expect(tamanhoAplicado(segundo!).largura).toBe(750)
    teclar('Escape')

    // E reabrir o primeiro recomeça do encaixe dele.
    botaoDe(primeiro!).click()
    expect(nivelDe(primeiro!).textContent).toBe('25%')
    expect(desenhoDoPrimeiro.scrollLeft).toBe(0)
  })
})
