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
  })

  try {
    await mermaid.run({ nodes: Array.from(nos), suppressErrors: true })
  } catch (erro) {
    console.error('[mermaid] falha ao renderizar', erro)
  }
}
