import mermaid from 'mermaid'

/**
 * Renderiza os blocos `.mermaid` que estao dentro de `raiz`.
 *
 * O Mermaid marca cada no com `data-processed` e pula os ja processados, entao
 * re-renderizar exige HTML novo. Quem garante isso e o React: a `key` dos trechos
 * inclui o tema ONDE HA DIAGRAMA (`chaveDoMaterial`, em `Blocos.tsx`), o que remonta o
 * trecho e reinjeta o texto original do diagrama antes desta funcao rodar.
 */
export async function renderizarMermaid(raiz: HTMLElement, escuro: boolean): Promise<void> {
  const nos = raiz.querySelectorAll<HTMLElement>('.mermaid')
  if (!nos.length) return

  mermaid.initialize({
    startOnLoad: false,
    // 'strict' ja e o default da biblioteca: desabilita click/links, bloqueia
    // javascript: nas URLs e sanitiza os rotulos com DOMPurify internamente.
    // 'antiscript' nao acrescentaria nada, porque nenhum diagrama deste repositorio
    // usa rotulo HTML.
    securityLevel: 'strict',
    theme: escuro ? 'dark' : 'default',
    fontFamily: 'inherit',
    flowchart: {
      // Com useMaxWidth (default), um viewBox de ~3000 px encolhe para a largura da
      // coluna e o texto cai para ~4 px. Sem ele o SVG sai no tamanho natural e o
      // conteiner rola na horizontal: ilegivel vira legivel com scroll.
      useMaxWidth: false,
    },
  })

  try {
    await mermaid.run({ nodes: Array.from(nos), suppressErrors: true })
  } catch (erro) {
    console.error('[mermaid] falha ao renderizar', erro)
  }

  // Depois do desenho: o SVG so existe agora para receber rotulo e o botao de ampliar.
  prepararDiagramas(raiz)
}

/** O quadro ampliado agora. No maximo UM, em toda a aplicacao. */
let ampliadoAgora: HTMLElement | null = null

/** O botao de cada quadro: `definirAmpliado` precisa dele para voltar rotulo e estado. */
const BOTOES = new WeakMap<HTMLElement, HTMLButtonElement>()

/** Como cada quadro se identifica ("4. Temas"): entra nos rotulos do desenho e do botao. */
const NOMES = new WeakMap<HTMLElement, string>()

/** O texto de um cabecalho, normalizado e limitado: nome acessivel nao e prosa. */
function textoDoCabecalho(cabecalho: Element | null | undefined): string {
  return (cabecalho?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
}

/**
 * Como cada diagrama da raiz se identifica para quem nao enxerga o desenho.
 *
 * O Mermaid nao gera nome acessivel sem `accTitle` no diagrama, e o material nao declara nenhum
 * — entao o nome sai do cabecalho mais proximo: o da secao onde o diagrama mora ou, quando ele
 * esta FORA de secao, o cabecalho que vem antes dele na tela. O caso medido do segundo caminho e
 * `#/pagina/README`, cujos dois diagramas ficam no intro: `closest('section')` devolve `null`
 * nos dois, e os dois SVGs saiam como "Diagrama do material", com dois botoes "Ampliar" sem
 * nome proprio.
 *
 * Nome repetido nao identifica ninguem: a secao 5 do TEMA-02 de arquitetura tem DOIS diagramas,
 * e os dois sairiam como "Diagrama: 5. Conteúdo" — dois `role="img"` de mesmo nome e dois botoes
 * indistinguiveis. Nos dois casos o ordinal do diagrama na tela entra no nome. Medido no material
 * de hoje: 71 diagramas, 2 fora de secao (os do README, com cabecalhos distintos) e 2 dividindo
 * o mesmo cabecalho (os do TEMA-02 de arquitetura).
 */
function nomesDosDiagramas(nos: HTMLElement[], raiz: HTMLElement): string[] {
  const bases = nos.map((no, i) => {
    const daSecao = textoDoCabecalho(no.closest('section')?.querySelector('h2, h3'))
    if (daSecao) return daSecao
    const anteriores = [...raiz.querySelectorAll<HTMLElement>('h2, h3')].filter(
      (cabecalho) =>
        (cabecalho.compareDocumentPosition(no) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    )
    const anterior = textoDoCabecalho(anteriores[anteriores.length - 1])
    return anterior || `Diagrama ${i + 1} de ${nos.length}`
  })
  const quantos = new Map<string, number>()
  for (const base of bases) quantos.set(base, (quantos.get(base) ?? 0) + 1)
  return bases.map((base, i) =>
    (quantos.get(base) ?? 0) > 1 ? `${base} (diagrama ${i + 1} de ${nos.length})` : base,
  )
}

/** Da nome ao desenho: sem isto o SVG fica sem nome acessivel nenhum. */
function rotularDiagrama(no: HTMLElement, nome: string): void {
  const svg = no.querySelector('svg')
  if (!svg) return
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', nome ? `Diagrama: ${nome}` : 'Diagrama do material')
}

/**
 * Da nome proprio ao botao que amplia o diagrama.
 *
 * Dois "Ampliar" na mesma tela sao o mesmo nome repetido: quem usa leitor de tela ouve duas vezes
 * o mesmo rotulo e nao sabe qual diagrama cada botao abre. A acao continua no comeco do nome e
 * igual ao texto visivel (WCAG 2.5.3, "rotulo no nome").
 */
function rotularBotao(botao: HTMLButtonElement, nome: string, ampliado: boolean): void {
  const acao = ampliado ? 'Fechar' : 'Ampliar'
  botao.textContent = acao
  botao.setAttribute('aria-expanded', String(ampliado))
  botao.setAttribute('aria-label', `${acao} o diagrama ${nome || 'do material'}`)
}

/** O quadro do diagrama, com o botao dentro — criado na primeira vez que o no e preparado. */
function quadroDoDiagrama(no: HTMLElement): HTMLElement {
  const existente = no.parentElement
  // A secao inteira e remontada na troca de tema; quando o no ja tem quadro, so o rotulo
  // precisa ser refeito (o SVG novo acabou de ser desenhado dentro dele).
  if (existente?.classList.contains('diagrama')) return existente

  const quadro = document.createElement('div')
  quadro.className = 'diagrama'
  no.replaceWith(quadro)

  const acoes = document.createElement('div')
  acoes.className = 'diagrama-acoes'
  const botao = document.createElement('button')
  botao.type = 'button'
  botao.className = 'botao-secundario'
  acoes.append(botao)
  quadro.append(acoes, no)
  // Alvo de foco quando o quadro esta ampliado; fora disso nao entra na tabulacao, e o unico
  // controle do bloco e o proprio botao.
  quadro.tabIndex = -1
  BOTOES.set(quadro, botao)
  botao.addEventListener('click', () => alternarAmpliado(quadro))

  return quadro
}

/**
 * Poe um botao em cada diagrama e da nome a desenho e botao.
 *
 * O fluxograma tem ~3000 px de largura: na coluna de texto ele rola na horizontal e a figura
 * inteira nunca aparece de uma vez. O botao abre o diagrama na janela toda, onde a rolagem e
 * dele. O quadro e um `div` que o React nao reconcilia — ele vive dentro do HTML que veio de
 * `dangerouslySetInnerHTML`, e o React so reescreve esse HTML quando ele muda.
 *
 * Exportada para o teste exercitar a preparacao com DOM de entrada, sem depender de um desenho
 * de verdade: o Mermaid precisa de medicao de layout, que o jsdom nao faz.
 */
export function prepararDiagramas(raiz: HTMLElement): void {
  const nos = [...raiz.querySelectorAll<HTMLElement>('.mermaid')]
  const nomes = nomesDosDiagramas(nos, raiz)
  nos.forEach((no, i) => {
    const nome = nomes[i] ?? ''
    const quadro = quadroDoDiagrama(no)
    NOMES.set(quadro, nome)
    rotularDiagrama(no, nome)
    const botao = BOTOES.get(quadro)
    if (botao) rotularBotao(botao, nome, quadro.classList.contains('ampliado'))
  })
}

/** Os controles que o quadro oferece ao teclado: o botao de ampliar/fechar e, ampliado, o proprio
 * desenho (que ganha `tabindex=0` para deslocar a figura com as setas). */
const SELETOR_FOCAVEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function alternarAmpliado(quadro: HTMLElement): void {
  definirAmpliado(quadro, !quadro.classList.contains('ampliado'))
}

/**
 * Abre ou fecha o quadro.
 *
 * Ampliado ele e um dialogo: cobre a janela, trava a rolagem de tras (pelo `:has` em
 * `styles.css`), recebe o foco (para o Esc chegar nele), prende o TAB dentro dele e marca o
 * resto da pagina como inerte (`marcarRestoInerte`) — as quatro partes da afirmacao de
 * `aria-modal="true"`. Ao fechar, o foco volta para o botao — quem chegou de teclado nao
 * recomeca a tabulacao do topo da pagina.
 *
 * UM quadro por vez: dois dialogos modais abertos ao mesmo tempo seriam dois lugares afirmando
 * que prenderam o foco, e o Esc so fecharia o que estivesse com ele.
 */
function definirAmpliado(quadro: HTMLElement, ampliado: boolean): void {
  if (ampliado && ampliadoAgora && ampliadoAgora !== quadro) definirAmpliado(ampliadoAgora, false)

  const nome = NOMES.get(quadro) ?? ''
  quadro.classList.toggle('ampliado', ampliado)
  const botao = BOTOES.get(quadro)
  if (botao) rotularBotao(botao, nome, ampliado)

  // Ampliado, o desenho e a area que rola (o fluxograma tem ~3000 px, e a rolagem passa a ser
  // dele): com `tabIndex=0` o teclado entra nele e desloca a figura com as setas. Fechado, o
  // atributo sai e o unico controle do bloco volta a ser o botao.
  const desenho = quadro.querySelector<HTMLElement>('.mermaid')
  if (desenho) {
    if (ampliado) desenho.tabIndex = 0
    else desenho.removeAttribute('tabindex')
  }

  if (!ampliado) {
    if (ampliadoAgora === quadro) soltarAmpliado()
    quadro.removeAttribute('role')
    quadro.removeAttribute('aria-modal')
    quadro.removeAttribute('aria-label')
    return
  }

  quadro.setAttribute('role', 'dialog')
  quadro.setAttribute('aria-modal', 'true')
  quadro.setAttribute('aria-label', `Diagrama ampliado: ${nome || 'material'}`)
  ampliadoAgora = quadro
  marcarRestoInerte(quadro)
  observarSaidaDoQuadro(quadro)
  document.addEventListener('keydown', aoTeclarNoAmpliado, true)
  quadro.focus()
}

/**
 * O que o quadro ampliado deixou inerte, com o estado de cada atributo ANTES de marcar.
 *
 * O `inert` e o `aria-hidden` do resto da pagina nao sao nossos: a rotina so desfaz o que ela
 * propria escreveu. Sem esta memoria, um no que ja viesse marcado (ou com um `aria-hidden` que
 * veio do conteudo) sairia daqui sem a marca que tinha.
 */
let inertes: { no: Element; tinhaInert: boolean; ariaAnterior: string | null }[] = []

/**
 * Tira o resto da pagina do alcance: tudo que NAO e ancestral (nem o proprio) do quadro.
 *
 * E o que `aria-modal="true"` afirma e o `inert` cumpre — quem usa leitor de tela ou teclado nao
 * sai do quadro, nem por TAB, nem pela navegacao de leitura. A varredura sobe do quadro ate o
 * `<body>` marcando os IRMAOS de cada nivel: e o caminho que cobre, de uma vez, as outras secoes
 * do material (irmas do quadro dentro do `main`), o `.topo` e o "Pular para o conteudo" (irmas do
 * `main`), e o que mais estiver fora da linha do quadro.
 *
 * `aria-hidden` entra junto de `inert` porque os dois nao cobrem a mesma faixa de navegador: o
 * `inert` (Chromium 102+, o deste app) ja tira da arvore de acessibilidade, e o `aria-hidden` e o
 * que vale onde ele nao chegou. Nos ancestrais do quadro nada e marcado — e por isso o quadro
 * continua sendo anunciado e focado.
 */
function marcarRestoInerte(quadro: HTMLElement): void {
  soltarRestoInerte()
  let no: HTMLElement | null = quadro
  while (no?.parentElement) {
    const pai: HTMLElement = no.parentElement
    for (const irmao of pai.children) {
      if (irmao === no) continue
      inertes.push({
        no: irmao,
        tinhaInert: irmao.hasAttribute('inert'),
        ariaAnterior: irmao.getAttribute('aria-hidden'),
      })
      irmao.setAttribute('inert', '')
      irmao.setAttribute('aria-hidden', 'true')
    }
    if (pai === document.body) break
    no = pai
  }
}

/** Devolve ao resto da pagina o que a marcacao tirou — e so o que ela tirou. */
function soltarRestoInerte(): void {
  for (const { no, tinhaInert, ariaAnterior } of inertes) {
    if (!tinhaInert) no.removeAttribute('inert')
    if (ariaAnterior === null) no.removeAttribute('aria-hidden')
    else no.setAttribute('aria-hidden', ariaAnterior)
  }
  inertes = []
}

/** O observador que percebe o quadro saindo do DOM sem passar pelo fechamento. */
let observador: MutationObserver | null = null

function pararDeObservar(): void {
  observador?.disconnect()
  observador = null
}

/**
 * Vigia a saida do quadro aberto, PORQUE o fechamento nem sempre acontece.
 *
 * Quem remonta o trecho que contem o quadro e o React (troca de tema onde ha diagrama, troca de
 * rota): o no sai do DOM inteiro, com o botao e o quadro dentro, e ninguem chama
 * `definirAmpliado(quadro, false)`. Sem esta saida, o `inert` que o quadro pos nos IRMAOS ficaria
 * na pagina para sempre — a pagina inteira morta, sem teclado e sem clique. O ouvinte de teclado
 * ja se retirava no primeiro Esc ou TAB depois disso; o `inert` nao tinha quem o removesse, e a
 * pagina morria justamente para quem nao aperta tecla nenhuma. O observador e a saida que nao
 * depende de um evento do teclado.
 */
function observarSaidaDoQuadro(quadro: HTMLElement): void {
  pararDeObservar()
  if (typeof MutationObserver === 'undefined') return
  const eu = new MutationObserver(() => {
    // Chamada pendente de um quadro que ja foi encerrado: quem manda agora e outro (ou ninguem).
    if (observador !== eu) return
    if (ampliadoAgora === quadro && quadro.isConnected) return
    soltarAmpliado()
  })
  observador = eu
  eu.observe(document.body, { childList: true, subtree: true })
}

/**
 * Solta tudo o que o quadro ampliado segurava: o resto da pagina volta ao alcance, o ouvinte de
 * teclado sai e o observador para. E o unico encerramento — o fechamento normal e a saida do DOM
 * passam os dois por aqui.
 */
function soltarAmpliado(): void {
  ampliadoAgora = null
  soltarRestoInerte()
  document.removeEventListener('keydown', aoTeclarNoAmpliado, true)
  pararDeObservar()
}

/**
 * Esc e Tab com o quadro ampliado, ouvidos no DOCUMENTO (e na captura).
 *
 * O `aria-modal="true"` afirma que o resto da tela esta inerte: sem prender o foco, o TAB saia
 * para o "Ampliar" do diagrama seguinte — que a tela nem mostra, porque o quadro cobre a janela —
 * e o Esc so fechava o quadro que por acaso estivesse com o foco. Aqui a afirmacao vale: o foco
 * fica dentro do quadro, o Esc fecha, e o foco volta para o botao que abriu. O `inert` do resto da
 * pagina e do `marcarRestoInerte`; este ouvinte cuida do teclado.
 *
 * O quadro pode sair do DOM sem fechamento (troca de tema com o quadro aberto): e o recuo abaixo,
 * que solta tudo pelo mesmo caminho do fechamento normal. O observador de DOM existe para o mesmo
 * caso quando ninguem aperta tecla nenhuma.
 */
function aoTeclarNoAmpliado(evento: KeyboardEvent): void {
  const quadro = ampliadoAgora
  if (!quadro) return
  if (!quadro.isConnected) {
    soltarAmpliado()
    return
  }

  if (evento.key === 'Escape') {
    evento.preventDefault()
    evento.stopPropagation()
    const botao = BOTOES.get(quadro)
    definirAmpliado(quadro, false)
    botao?.focus()
    return
  }

  if (evento.key !== 'Tab') return
  const focaveis = [...quadro.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)]
  if (!focaveis.length) return
  evento.preventDefault()
  const atual = focaveis.findIndex((no) => no === document.activeElement)
  const primeiro = focaveis[0]
  const ultimo = focaveis[focaveis.length - 1]
  const destino =
    atual === -1
      ? evento.shiftKey
        ? ultimo
        : primeiro
      : focaveis[(atual + (evento.shiftKey ? -1 : 1) + focaveis.length) % focaveis.length]
  destino?.focus()
}
