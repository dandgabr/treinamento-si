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
  // O arrasto fica ligado desde aqui e so responde ampliado: o quadro tem vida longa (a troca de
  // tema remonta o trecho, mas o `innerHTML` tambem volta com ele no ar), e religar os ouvintes a
  // cada abertura seria trabalho para desfazer no fechamento.
  ligarArrasto(quadro)

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

/* --------------------------------------------------------- zoom e deslocamento do quadro */

/**
 * Os limites e o passo do zoom.
 *
 * O piso de 0,2 existe porque abaixo dele o rotulo do fluxograma nao e legivel em tela nenhuma:
 * a figura inteira nao acrescenta informacao ao que o texto ao lado ja diz. O teto de 4 e o outro
 * lado da mesma moeda: e onde ampliar mais nao revela detalhe, so borra. O passo de 1,25 e
 * MULTIPLICATIVO ("+25% do que esta a vista"), e nao aditivo — 100% -> 125% -> 156% e o
 * comportamento de zoom que o navegador ensinou a quem usa.
 */
const ESCALA_MINIMA = 0.2
const ESCALA_MAXIMA = 4
const PASSO_DE_ZOOM = 1.25

/** Diferenca tolerada entre a escala aplicada e a do encaixe ao decidir se o usuario ja deu zoom. */
const TOLERANCIA = 1e-6

/** Traz a escala para o intervalo dos controles: e o unico lugar que decide o que e zoom valido. */
function limitarEscala(escala: number): number {
  return Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, escala))
}

/**
 * A escala que faz o desenho INTEIRO caber na janela — a conta do encaixe, sem DOM nenhum.
 *
 * `min(largura/larguraNatural, altura/alturaNatural, 1)`: o menor dos dois ajustes, e NUNCA acima
 * de 1 — uma figura pequena nao pode ser esticada so porque ha espaco (borra a borda do vetor e
 * mente sobre o tamanho do diagrama). O piso e o mesmo do zoom: senao o encaixe cairia num nivel
 * que o `+` de 1,25 nao alcanca de volta, e `Caber` e `+` discordariam sobre o que e um nivel
 * possivel.
 *
 * Sem medida (o jsdom nao calcula layout, e o conteiner pode ainda nao ter tamanho no primeiro
 * quadro depois de abrir) devolve 1: encolher por um numero que nao existe seria pior do que nao
 * encaixar — o desenho fica no tamanho natural e o proximo redimensionamento reencaixa.
 *
 * Exportada por isto: o jsdom nao mede, e a conta e o que a prova injeta com numeros.
 */
export function escalaParaCaber(
  larguraNatural: number,
  alturaNatural: number,
  larguraJanela: number,
  alturaJanela: number,
): number {
  const medidas = [larguraNatural, alturaNatural, larguraJanela, alturaJanela]
  if (!medidas.every((medida) => Number.isFinite(medida) && medida > 0)) return 1
  return limitarEscala(Math.min(larguraJanela / larguraNatural, alturaJanela / alturaNatural, 1))
}

/** O que o quadro ampliado precisa lembrar entre um clique e outro. */
type EstadoDoZoom = {
  /** A escala aplicada agora. */
  escala: number
  /** A escala que o ultimo encaixe calculou: e com ela que o redimensionamento se compara. */
  encaixe: number
  /** O tamanho natural do desenho, que nao muda com o zoom. */
  natural: { largura: number; altura: number }
  /** O `width`/`height` que o Mermaid deixou no SVG, para devolver o atributo como estava. */
  atributos: { largura: string | null; altura: string | null }
}

/**
 * O zoom de cada quadro, enquanto ele esta ampliado.
 *
 * Fraco de proposito: fechado, o quadro nao tem estado nenhum — e isso que garante que escala e
 * deslocamento nao vazem para o proximo quadro nem para a visao inline (que fica no tamanho
 * natural, onde a legibilidade da coluna de texto depende disso).
 */
const ZOOM = new WeakMap<HTMLElement, EstadoDoZoom>()

/** O conteiner que rola dentro do quadro: e ele que o zoom redimensiona e o arrasto desloca. */
function desenhoDoQuadro(quadro: HTMLElement): HTMLElement | null {
  return quadro.querySelector<HTMLElement>('.mermaid')
}

/** O desenho do Mermaid, que so existe depois que ele desenhou. */
function svgDoQuadro(quadro: HTMLElement): SVGSVGElement | null {
  return quadro.querySelector<SVGSVGElement>('.mermaid svg')
}

/** Uma medida em pixels, se o texto do atributo for um numero positivo. */
function numeroPositivo(valor: string | null): number | null {
  if (valor === null) return null
  const numero = Number.parseFloat(valor)
  return Number.isFinite(numero) && numero > 0 ? numero : null
}

/**
 * O tamanho NATURAL do desenho, em pixels — a medida que o zoom multiplica.
 *
 * O Mermaid escreve `width`/`height` no SVG (com `useMaxWidth: false`, o tamanho natural, ~3000 px
 * no fluxograma) e o `viewBox` traz a mesma medida como coordenada. O atributo vem primeiro porque
 * e ele que o navegador usa; o `viewBox` e o recuo para o desenho que so trouxer as coordenadas.
 * Guardar tambem o texto original dos atributos e o que permite devolve-los ao que eram: quem so
 * tinha `viewBox` nao pode ficar com um `width` nosso depois de fechar.
 */
function medidaNatural(svg: SVGSVGElement): {
  natural: { largura: number; altura: number }
  atributos: { largura: string | null; altura: string | null }
} {
  const larguraAtributo = svg.getAttribute('width')
  const alturaAtributo = svg.getAttribute('height')
  // `viewBox="0 0 3000 1200"`: as duas ultimas medidas sao a largura e a altura das coordenadas.
  const coordenadas = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
  const daCaixa = (indice: number): number => {
    const valor = coordenadas[indice]
    return typeof valor === 'number' && Number.isFinite(valor) && valor > 0 ? valor : 0
  }
  return {
    natural: {
      largura: numeroPositivo(larguraAtributo) ?? daCaixa(2),
      altura: numeroPositivo(alturaAtributo) ?? daCaixa(3),
    },
    atributos: { largura: larguraAtributo, altura: alturaAtributo },
  }
}

/**
 * O espaco onde o desenho tem de caber, em pixels.
 *
 * O tamanho do proprio conteiner vem primeiro: a faixa de controles e o respiro do quadro sao
 * espaco que a figura NAO tem, e encaixar na janela inteira deixaria o desenho por baixo deles.
 * Sem medida (`jsdom`, ou um conteiner que ainda nao tem layout), a janela e o recuo.
 */
function tamanhoDoQuadro(desenho: HTMLElement): { largura: number; altura: number } {
  return {
    largura: desenho.clientWidth || window.innerWidth,
    altura: desenho.clientHeight || window.innerHeight,
  }
}

/** O nivel como TEXTO visivel: 0,3125 e "31%", e nao uma fracao — quem le o nivel quer o numero. */
function textoDoNivel(escala: number): string {
  return `${Math.round(escala * 100)}%`
}

/**
 * Mantem o CENTRO do que esta visivel no lugar quando a escala muda.
 *
 * Sem isto, dar zoom joga a figura para o canto superior esquerdo e desfaz o ajuste que o usuario
 * acabou de fazer com o arrasto — o pior momento possivel para perder a referencia visual. Sem
 * medida de conteiner (jsdom), a conta vira o deslocamento multiplicado pelo fator, que continua valendo.
 */
function ancorarNoCentro(quadro: HTMLElement, escalaAnterior: number, escala: number): void {
  const desenho = desenhoDoQuadro(quadro)
  if (!desenho || escalaAnterior <= 0 || escala === escalaAnterior) return
  const fator = escala / escalaAnterior
  const centroX = desenho.scrollLeft + desenho.clientWidth / 2
  const centroY = desenho.scrollTop + desenho.clientHeight / 2
  desenho.scrollLeft = centroX * fator - desenho.clientWidth / 2
  desenho.scrollTop = centroY * fator - desenho.clientHeight / 2
}

/**
 * Aplica a escala ao desenho: a LARGURA e a ALTURA do SVG em pixels, multiplicadas pelo fator.
 *
 * E `width`/`height`, e nao `transform: scale`, por dois motivos que se somam. Com `transform` a
 * area de rolagem nao cresce (o layout continua no tamanho de antes, e o que passa do canto e
 * simplesmente pintado por cima dele); e o deslocamento — que e `scrollLeft`/`scrollTop`, o MESMO
 * que o teclado e o arrasto movem — nao teria como alcancar o resto da figura. Em pixels, o
 * desenho ocupa o espaco que ele mostra e a rolagem e de verdade.
 *
 * O nivel entra na mesma passada: quem ve o desenho e quem ouve a regiao viva leem o MESMO numero.
 */
function aplicarEscala(quadro: HTMLElement, escalaBruta: number): void {
  const estado = ZOOM.get(quadro)
  const svg = svgDoQuadro(quadro)
  if (!estado || !svg) return
  const escala = limitarEscala(escalaBruta)
  const anterior = estado.escala
  svg.setAttribute('width', String(estado.natural.largura * escala))
  svg.setAttribute('height', String(estado.natural.altura * escala))
  estado.escala = escala
  ancorarNoCentro(quadro, anterior, escala)
  const nivel = quadro.querySelector<HTMLElement>('.zoom-nivel')
  if (nivel) nivel.textContent = textoDoNivel(escala)
}

/**
 * O encaixe: a figura inteira a vista, com o deslocamento no inicio da rolagem.
 *
 * E o estado inicial do quadro e o que o `Caber` refaz. O deslocamento voltar ao inicio importa:
 * depois de um arrasto, "caber" com a rolagem onde estava deixaria a figura fora do campo de visao
 * que o encaixe acabou de calcular.
 */
function encaixar(quadro: HTMLElement): void {
  const estado = ZOOM.get(quadro)
  const desenho = desenhoDoQuadro(quadro)
  if (!estado || !desenho) return
  const { largura, altura } = tamanhoDoQuadro(desenho)
  estado.encaixe = escalaParaCaber(estado.natural.largura, estado.natural.altura, largura, altura)
  aplicarEscala(quadro, estado.encaixe)
  desenho.scrollLeft = 0
  desenho.scrollTop = 0
}

/** O zoom de um passo, para cima ou para baixo, a partir de onde o usuario esta. */
function ajustarZoom(quadro: HTMLElement, fator: number): void {
  const estado = ZOOM.get(quadro)
  if (!estado) return
  aplicarEscala(quadro, estado.escala * fator)
}

/**
 * Reencaixa a figura quando a janela muda de tamanho COM o quadro aberto.
 *
 * So reencaixa quem ainda esta no encaixe (a escala atual e a que o ultimo encaixe calculou): se o
 * usuario deu zoom, ampliar foi uma escolha dele, e um redimensionamento de janela nao pode desfaze-la
 * — quem aproximou para ler um rotulo perderia a leitura a cada mexida no tamanho da janela. A
 * regra e a mais simples e previsivel das duas ("sempre" e "so enquanto ninguem deu zoom"), e o
 * quadro volta a seguir a janela no primeiro `Caber`.
 */
function aoRedimensionar(): void {
  const quadro = ampliadoAgora
  const estado = quadro ? ZOOM.get(quadro) : undefined
  if (!quadro || !estado) return
  if (Math.abs(estado.escala - estado.encaixe) > TOLERANCIA) return
  encaixar(quadro)
}

/** Um controle do zoom: botao secundario, com o texto visivel e nome proprio para quem nao o ve. */
function botaoDeZoom(texto: string, rotulo: string, aoClicar: () => void): HTMLButtonElement {
  const botao = document.createElement('button')
  botao.type = 'button'
  botao.className = 'botao-secundario'
  botao.textContent = texto
  // O nome contem o texto visivel (WCAG 2.5.3, "rotulo no nome"): "−" e "+" sao glifos, e o nome
  // que so trouxesse a acao deixaria quem usa controle por voz sem o que dizer.
  botao.setAttribute('aria-label', rotulo)
  botao.addEventListener('click', aoClicar)
  return botao
}

/**
 * Os controles do zoom, criados SO enquanto o quadro esta ampliado.
 *
 * Fora do ampliado eles nao existem no DOM — e nao apenas escondidos — porque o zoom nao tem
 * sentido na visao inline (que fica no tamanho natural, por legibilidade) e porque o unico
 * controle do bloco continua sendo o botao de ampliar. Criados aqui dentro, entram naturalmente
 * no laco de foco do `SELETOR_FOCAVEL` (sao `button`) e saem junto com o fechamento.
 */
function montarControlesDeZoom(quadro: HTMLElement): void {
  const acoes = quadro.querySelector<HTMLElement>('.diagrama-acoes')
  if (!acoes || acoes.querySelector('.diagrama-zoom')) return

  const grupo = document.createElement('div')
  grupo.className = 'diagrama-zoom'

  const nivel = document.createElement('span')
  nivel.className = 'zoom-nivel'
  // `role=status` + `aria-live=polite`: o nivel MUDA por clique, e um estado que so existe no
  // texto visivel nao chega a quem usa leitor de tela. `polite` (e nao `assertive`) porque o nivel
  // e informacao de contexto, nao um alarme; `aria-atomic` faz ler o nivel inteiro a cada
  // mudanca, e nao o pedaco que mudou de um texto que ja estava na tela.
  nivel.setAttribute('role', 'status')
  nivel.setAttribute('aria-live', 'polite')
  nivel.setAttribute('aria-atomic', 'true')

  grupo.append(
    botaoDeZoom('−', '− Diminuir o zoom', () => ajustarZoom(quadro, 1 / PASSO_DE_ZOOM)),
    botaoDeZoom('+', '+ Aumentar o zoom', () => ajustarZoom(quadro, PASSO_DE_ZOOM)),
    botaoDeZoom('Caber', 'Caber na janela', () => encaixar(quadro)),
    nivel,
  )
  // ANTES do botao de ampliar/fechar que ja estava em `.diagrama-acoes`: o quadro e que fecha, o
  // zoom so vale dentro dele.
  acoes.prepend(grupo)
}

/**
 * Prepara o zoom do quadro que acabou de abrir: controles, medida natural e o encaixe.
 *
 * A medida e a DO ABRIR (o tamanho natural nao muda com o zoom), e o encaixe fica guardado porque
 * e a unica escala que o redimensionamento da janela pode recalcular sozinho.
 */
function montarZoom(quadro: HTMLElement): void {
  const desenho = desenhoDoQuadro(quadro)
  const svg = svgDoQuadro(quadro)
  // Sem desenho (o Mermaid falhou e deixou o texto cru no no, sem `svg`), nao ha o que ampliar: o
  // quadro abre com o botao de fechar e nada de zoom.
  if (!desenho || !svg) return

  const medida = medidaNatural(svg)
  // Sem tamanho natural (um SVG que nao trouxe `width`/`height` NEM `viewBox`) nao ha escala que
  // signifique alguma coisa, e escrever `width="0"` apagaria o desenho da tela: melhor abrir sem
  // zoom, com a figura como ela veio.
  if (!medida.natural.largura || !medida.natural.altura) return

  const { largura, altura } = tamanhoDoQuadro(desenho)
  const encaixe = escalaParaCaber(medida.natural.largura, medida.natural.altura, largura, altura)
  ZOOM.set(quadro, {
    escala: encaixe,
    encaixe,
    natural: medida.natural,
    atributos: medida.atributos,
  })
  montarControlesDeZoom(quadro)
  // A classe do conteiner que rola ampliado: e por ela que a folha poe o cursor de "pegar" e o
  // `touch-action` que entrega o gesto ao arrasto em vez de a pagina.
  desenho.classList.add('diagrama-pan')
  aplicarEscala(quadro, encaixe)
  window.addEventListener('resize', aoRedimensionar)
}

/**
 * Devolve o quadro ao estado de antes de abrir — o unico encerramento do zoom.
 *
 * O tamanho do SVG volta a ser o que o Mermaid escreveu (o atributo volta EXATAMENTE como estava:
 * os `width`/`height` do tamanho natural, ou nenhum deles quando o desenho so trouxe o `viewBox`),
 * o deslocamento volta ao inicio e a classe do arrasto sai. E o que garante que a escala nao vaze
 * para a visao inline — que depende do tamanho natural para a legibilidade na coluna de texto — nem
 * para o proximo quadro, que comeca do proprio encaixe.
 *
 * Idempotente de proposito: o fechamento normal e a saida do DOM (o quadro que o React remonta)
 * passam os dois por aqui, e o segundo deles nao pode encontrar nada para desfazer.
 */
function desmontarZoom(quadro: HTMLElement): void {
  const estado = ZOOM.get(quadro)
  const desenho = desenhoDoQuadro(quadro)
  const svg = svgDoQuadro(quadro)
  window.removeEventListener('resize', aoRedimensionar)
  quadro.querySelector('.diagrama-zoom')?.remove()
  if (desenho) {
    desenho.classList.remove('diagrama-pan', 'arrastando')
    desenho.scrollLeft = 0
    desenho.scrollTop = 0
  }
  if (svg && estado) {
    const { largura, altura } = estado.atributos
    if (largura === null) svg.removeAttribute('width')
    else svg.setAttribute('width', largura)
    if (altura === null) svg.removeAttribute('height')
    else svg.setAttribute('height', altura)
  }
  ZOOM.delete(quadro)
}

/**
 * O arrasto com o ponteiro: pegar o desenho e puxar.
 *
 * O que se move e o `scrollLeft`/`scrollTop` do proprio conteiner que rola, e nao uma
 * transformacao: e o MESMO deslocamento que as setas do teclado movem, entao arrasto, teclado e
 * barra de rolagem nunca discordam sobre onde a figura esta.
 *
 * Os ouvintes ficam ligados desde que o quadro e criado e so respondem quando ele esta ampliado: na
 * visao inline a rolagem e a da coluna de texto, e o ponteiro continua servindo para selecionar
 * codigo e texto em volta do desenho.
 *
 * O `preventDefault` do `pointerdown` fica de FORA de proposito: e ele que mantem o desenho
 * focavel ao clique (o `tabindex=0` do ampliado), o que faz as setas continuarem deslocando a
 * figura depois de um arrasto. A captura do ponteiro e o que mantem o gesto vivo quando ele sai do
 * conteiner; onde ela nao existe (`jsdom`, navegador antigo) o arrasto vale para os eventos que
 * ainda chegam ao no, e nao ha erro nenhum a tratar.
 */
function ligarArrasto(quadro: HTMLElement): void {
  const desenho = desenhoDoQuadro(quadro)
  if (!desenho) return

  let partida: { x: number; y: number; rolagemX: number; rolagemY: number } | null = null

  const soltar = (): void => {
    if (!partida) return
    partida = null
    desenho.classList.remove('arrastando')
  }

  desenho.addEventListener('pointerdown', (evento) => {
    if (!quadro.classList.contains('ampliado')) return
    // So o botao principal: o direito abre o menu do navegador, e o do meio cola/rola.
    if (evento.button !== 0) return
    partida = {
      x: evento.clientX,
      y: evento.clientY,
      rolagemX: desenho.scrollLeft,
      rolagemY: desenho.scrollTop,
    }
    desenho.classList.add('arrastando')
    if ('setPointerCapture' in desenho) desenho.setPointerCapture(evento.pointerId)
  })

  desenho.addEventListener('pointermove', (evento) => {
    if (!partida) return
    // Puxar para a esquerda/cima mostra o que esta a direita/abaixo: o dedo "pega" o desenho e o
    // leva junto, entao a rolagem anda ao CONTRARIO do ponteiro.
    desenho.scrollLeft = partida.rolagemX - (evento.clientX - partida.x)
    desenho.scrollTop = partida.rolagemY - (evento.clientY - partida.y)
  })

  // `pointerup` e a solta do dedo; `pointercancel` e o gesto que o sistema roubou para si (o
  // navegador ja solta a captura sozinho nos dois casos). Sem os dois, a classe `arrastando`
  // ficaria no quadro e o cursor de "pegar" nunca voltaria ao normal.
  desenho.addEventListener('pointerup', soltar)
  desenho.addEventListener('pointercancel', soltar)
}

/** Os controles que o quadro oferece ao teclado: os botoes do zoom, o de ampliar/fechar e, ampliado,
 * o proprio desenho (que ganha `tabindex=0` para deslocar a figura com as setas). */
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
  // dele): com `tabIndex=0` o teclado entra nele e desloca a figura com as SETAS. Nao ha ouvinte
  // de seta nenhum aqui, e nao deve haver: um conteiner focavel com rolagem rola por comportamento
  // nativo do navegador, e e o mesmo `scrollLeft`/`scrollTop` que o arrasto move — teclado, dedo e
  // barra de rolagem falam do mesmo lugar. Fechado, o atributo sai e o unico controle do bloco
  // volta a ser o botao.
  const desenho = quadro.querySelector<HTMLElement>('.mermaid')
  if (desenho) {
    if (ampliado) desenho.tabIndex = 0
    else desenho.removeAttribute('tabindex')
  }

  if (!ampliado) {
    // O zoom e do quadro que fecha e sai com ele. Pela saida normal quem cuida disso e o
    // `soltarAmpliado`; no fechamento de um quadro que ja nao e o `ampliadoAgora` (a chamada
    // defensiva do laco de cima), e daqui. `desmontarZoom` nao se importa de rodar duas vezes.
    if (ampliadoAgora === quadro) soltarAmpliado()
    else desmontarZoom(quadro)
    quadro.removeAttribute('role')
    quadro.removeAttribute('aria-modal')
    quadro.removeAttribute('aria-label')
    return
  }

  quadro.setAttribute('role', 'dialog')
  quadro.setAttribute('aria-modal', 'true')
  quadro.setAttribute('aria-label', `Diagrama ampliado: ${nome || 'material'}`)
  ampliadoAgora = quadro
  // Antes do foco: o quadro abre ENCAIXADO, e os controles do zoom existem a partir daqui (e
  // entram no laco de foco do TAB junto com o botao e o desenho).
  montarZoom(quadro)
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
 * teclado sai, o observador para e o zoom do quadro e desfeito. E o unico encerramento — o
 * fechamento normal e a saida do DOM passam os dois por aqui.
 */
function soltarAmpliado(): void {
  const quadro = ampliadoAgora
  ampliadoAgora = null
  soltarRestoInerte()
  document.removeEventListener('keydown', aoTeclarNoAmpliado, true)
  pararDeObservar()
  // Por ULTIMO, e depois de o observador parar: retirar os controles e mexer no tamanho do SVG sao
  // mutacoes no DOM, e o observador nao tem nada que opinar sobre elas.
  if (quadro) desmontarZoom(quadro)
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
