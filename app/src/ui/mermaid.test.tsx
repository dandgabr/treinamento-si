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

import { afterEach, describe, expect, it, vi } from 'vitest'
import { carregar, content } from '../infrastructure/content/repository'
import { ancorarCabecalhos } from './Blocos'
import { prepararDiagramas } from './mermaid'

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

/** O nó `.mermaid` como o Mermaid o deixa depois de desenhar: o próprio div com um `<svg>` dentro. */
function diagramaDesenhado(): HTMLElement {
  const no = document.createElement('div')
  no.className = 'mermaid'
  no.append(svgDesenhado())
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

/** O botão de ampliar de um quadro. */
function botaoDe(quadro: HTMLElement): HTMLButtonElement {
  const botao = quadro.querySelector('button')
  if (!botao) throw new Error('o quadro do diagrama ficou sem botão')
  return botao
}

/** O nome acessível do desenho. */
function rotuloDoSvg(quadro: HTMLElement): string {
  return quadro.querySelector('svg')?.getAttribute('aria-label') ?? ''
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
    expect(primeiro!.querySelector('svg')?.getAttribute('role')).toBe('img')
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
    const desenho = primeiro!.querySelector<HTMLElement>('.mermaid')
    expect(desenho).toBeTruthy()

    // O estado medido: com o foco fora do quadro (o "Ampliar" do diagrama seguinte), o TAB levava
    // o leitor para um controle que a tela nem mostra, e o Esc deixava de fechar o quadro aberto.
    botaoDoSegundo.focus()
    const comTab = teclar('Tab')

    expect(comTab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(botao)
    expect(primeiro!.classList.contains('ampliado')).toBe(true)

    // Dentro do quadro o TAB cicla entre o botão e o desenho (que ampliado é a área que rola, e por
    // isso ganha `tabindex=0`: o teclado desloca a figura com as setas), e dá a volta.
    teclar('Tab')
    expect(document.activeElement).toBe(desenho)
    teclar('Tab')
    expect(document.activeElement).toBe(botao)
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
    expect(desenho?.hasAttribute('tabindex')).toBe(false)
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
