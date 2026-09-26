/**
 * Acesso tolerante a `localStorage`.
 *
 * Abrindo o app por `file://`, ou em janela privada, o navegador pode negar o
 * acesso e o getter lanca. Sem esta guarda, a leitura dentro do inicializador de
 * estado do React derrubaria a aplicacao inteira.
 */

export function lerTexto(chave: string): string | null {
  try {
    return window.localStorage.getItem(chave)
  } catch {
    return null
  }
}

export function gravarTexto(chave: string, valor: string): void {
  try {
    window.localStorage.setItem(chave, valor)
  } catch {
    // Armazenamento indisponivel: a sessao funciona, mas nao persiste.
  }
}

export function removerTexto(chave: string): void {
  try {
    window.localStorage.removeItem(chave)
  } catch {
    // Idem: nada a fazer se o armazenamento esta negado.
  }
}
