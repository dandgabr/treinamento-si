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

/**
 * Leitura que DISTINGUE "nao ha nada guardado" de "nao consegui ler".
 *
 * `lerTexto` colapsa as duas em `null`, e e o certo para uma preferencia de rascunho (o tema
 * claro/escuro de `App.tsx`): qualquer falha vira "sem valor". O progresso do estudo nao pode ser
 * lido assim — `null` e o que AUTORIZA a proxima gravacao, e gravar por cima de um dado que existe
 * e nao abrimos apaga o estudo. Aqui a chave ausente devolve `{ estado: 'ok', texto: null }` (a
 * primeira vez, em que gravar nao destroi nada) e o armazenamento recusado devolve
 * `{ estado: 'negado' }`, que quem chama trata como falha de leitura. O conteudo que existe e nao
 * abre como JSON e reconhecido depois, na analise, e tambem vira falha — nenhum dos dois pode
 * autorizar gravacao por cima.
 */
export type LeituraDeTexto = { estado: 'ok'; texto: string | null } | { estado: 'negado' }

export function lerTextoOuNegado(chave: string): LeituraDeTexto {
  try {
    return { estado: 'ok', texto: window.localStorage.getItem(chave) }
  } catch {
    return { estado: 'negado' }
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
