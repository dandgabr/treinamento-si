import conteudo from '../../content/generated/content.json'

/**
 * Fonte de conteudo da build de NAVEGADOR.
 *
 * O JSON entra inline no JavaScript de proposito: este build e um arquivo unico, aberto por
 * duplo clique, e `file://` nao carrega nada externo — nem chunk, nem `fetch`. Trocar esta
 * fonte e a unica diferenca entre o build web e o do desktop (ver `fonte-desktop.ts`).
 */
export function lerConteudoBruto(): Promise<unknown> {
  return Promise.resolve(conteudo as unknown)
}
