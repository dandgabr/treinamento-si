import mermaid from 'mermaid'

/**
 * Renderiza os blocos `.mermaid` que estao dentro de `raiz`.
 *
 * O Mermaid marca cada no com `data-processed` e pula os ja processados, entao
 * re-renderizar exige HTML novo. Quem garante isso e o React: a `key` das secoes
 * inclui o tema, o que remonta o bloco e reinjeta o texto original do diagrama
 * antes desta funcao rodar.
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

/** Cabecalho mais proximo do diagrama, para o rotulo do SVG. */
function tituloDaSecao(no: HTMLElement): string {
  const cabecalho = no.closest('section')?.querySelector('h2, h3')
  return (cabecalho?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
}

/**
 * Da nome ao desenho para quem nao enxerga o quadro.
 *
 * O Mermaid nao gera nome acessivel sem `accTitle` no diagrama, e o material nao declara
 * nenhum — entao o `aria-label` sai do cabecalho da secao onde o diagrama mora.
 */
function rotularDiagrama(no: HTMLElement): void {
  const svg = no.querySelector('svg')
  if (!svg) return
  const titulo = tituloDaSecao(no)
  svg.setAttribute('role', 'img')
  svg.setAttribute('aria-label', titulo ? `Diagrama: ${titulo}` : 'Diagrama do material')
}

/**
 * Poe um botao em cada diagrama.
 *
 * O fluxograma tem ~3000 px de largura: na coluna de texto ele rola na horizontal e a figura
 * inteira nunca aparece de uma vez. O botao abre o diagrama na janela toda, onde a rolagem e
 * dele. O quadro e um `div` que o React nao reconcilia — ele vive dentro do HTML que veio de
 * `dangerouslySetInnerHTML`, e o React so reescreve esse HTML quando ele muda.
 */
function prepararDiagramas(raiz: HTMLElement): void {
  for (const no of raiz.querySelectorAll<HTMLElement>('.mermaid')) {
    // A secao inteira e remontada na troca de tema; quando o no ja tem quadro, so o rotulo
    // precisa ser refeito (o SVG novo acabou de ser desenhado dentro dele).
    if (no.parentElement?.classList.contains('diagrama')) {
      rotularDiagrama(no)
      continue
    }

    const quadro = document.createElement('div')
    quadro.className = 'diagrama'
    no.replaceWith(quadro)

    const acoes = document.createElement('div')
    acoes.className = 'diagrama-acoes'
    const botao = document.createElement('button')
    botao.type = 'button'
    botao.className = 'botao-secundario'
    botao.textContent = 'Ampliar'
    botao.setAttribute('aria-expanded', 'false')
    acoes.append(botao)

    quadro.append(acoes, no)
    // Alvo de foco quando o quadro esta ampliado (Esc fecha); fora disso nao entra na
    // tabulacao, e o unico controle do bloco e o proprio botao.
    quadro.tabIndex = -1

    botao.addEventListener('click', () => alternarAmpliado(quadro, botao))
    quadro.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape' || !quadro.classList.contains('ampliado')) return
      evento.stopPropagation()
      definirAmpliado(quadro, botao, false)
      botao.focus()
    })

    rotularDiagrama(no)
  }
}

function alternarAmpliado(quadro: HTMLElement, botao: HTMLButtonElement): void {
  definirAmpliado(quadro, botao, !quadro.classList.contains('ampliado'))
}

/**
 * Abre ou fecha o quadro.
 *
 * Ampliado ele e um dialogo: cobre a janela, trava a rolagem de tras (pelo `:has` em
 * `styles.css`) e recebe o foco, para o Esc chegar nele. Ao fechar, o foco volta para o
 * botao — quem chegou de teclado nao recomeca a tabulacao do topo da pagina.
 */
function definirAmpliado(quadro: HTMLElement, botao: HTMLButtonElement, ampliado: boolean): void {
  quadro.classList.toggle('ampliado', ampliado)
  botao.textContent = ampliado ? 'Fechar' : 'Ampliar'
  botao.setAttribute('aria-expanded', String(ampliado))
  if (ampliado) {
    quadro.setAttribute('role', 'dialog')
    quadro.setAttribute('aria-modal', 'true')
    quadro.setAttribute('aria-label', 'Diagrama ampliado')
    quadro.focus()
    return
  }
  quadro.removeAttribute('role')
  quadro.removeAttribute('aria-modal')
  quadro.removeAttribute('aria-label')
}
