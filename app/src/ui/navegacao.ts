import { useEffect, useState } from 'react'
import { irPara } from './useRota'

/**
 * Navegacao de dentro do app: o rastro de para onde ainda da para ir.
 *
 * O historico do NAVEGADOR ja guarda a navegacao do app — toda tela e um hash, cada troca empurra
 * uma entrada, e `history.back()`/`history.forward()` andam de verdade. O que ele nao responde e a
 * pergunta que os botoes fazem: HA para onde voltar? HA para onde avancar? `history.length` conta
 * as OUTRAS paginas da aba (nao diz nada sobre o app) e nem distingue voltar de avancar. Quem sabe
 * a resposta e a propria aplicacao, que passa a manter o rastro do que empilhou: a cada
 * `hashchange` ela compara o hash novo com o rastro e sabe se foi voltar, avancar ou navegacao
 * nova.
 *
 * O rastro e o historico do APP, e nao o do navegador. Os dois andam juntos porque toda navegacao
 * daqui e uma troca de hash (o canal do app), e e o rastro que da para consultar.
 */
export interface Rastro {
  /** Os hashes por onde o app passou, na ordem em que foram empilhados. */
  readonly hashes: readonly string[]
  /** Onde o app esta nesse caminho. */
  readonly ponteiro: number
}

/** O hash do menu (a home). */
export const HASH_DO_MENU = '#/'

/**
 * O rastro da montagem: so a rota que o endereco pediu.
 *
 * O app pode abrir no MEIO (link compartilhado para um tema): ali nao ha para onde voltar dentro
 * do app, e o rastro comecando com um item so e o que diz isso. O historico do navegador pode ter
 * dezenas de paginas antes, e voltar para elas nao e o que o botao "Voltar" promete.
 */
export function iniciarRastro(hash: string): Rastro {
  return { hashes: [hash], ponteiro: 0 }
}

/** Ha tela anterior DENTRO do app? */
export function podeVoltar(rastro: Rastro): boolean {
  return rastro.ponteiro > 0
}

/** Ha tela seguinte DENTRO do app (a que um "voltar" deixou atras)? */
export function podeAvancar(rastro: Rastro): boolean {
  return rastro.ponteiro < rastro.hashes.length - 1
}

/**
 * O rastro depois de um `hashchange` — a funcao pura que o teste exercita sem navegador.
 *
 * Recebe o rastro e o hash novo, devolve rastro e ponteiro novos (nada e mutado: o estado antigo
 * continua valido, o que deixa o `useState` do React comparar). Os tres casos, na ordem:
 */
export function atualizarRastro(rastro: Rastro, hash: string): Rastro {
  // 1. O hash atual de novo: nada aconteceu de verdade. Sem esta guarda, um evento a mais inflaria
  //    o rastro com um item repetido e o "voltar" passaria a apontar para a mesma tela. A travessia
  //    do historico chega a disparar `hashchange` com o hash que ja estava la antes de mudar — o
  //    `hashchange` conta cada entrada visitada, e nao so o destino.
  if (hash === rastro.hashes[rastro.ponteiro]) return rastro
  // 2. Igual ao item ANTERIOR: foi um "voltar". O navegador andou para tras em vez de empilhar, e
  //    so o ponteiro anda — o rastro continua inteiro, e e ele que sustenta o "avancar".
  if (rastro.ponteiro > 0 && rastro.hashes[rastro.ponteiro - 1] === hash) {
    return { hashes: rastro.hashes, ponteiro: rastro.ponteiro - 1 }
  }
  // 3. Igual ao item SEGUINTE: foi um "avancar".
  if (rastro.hashes[rastro.ponteiro + 1] === hash) {
    return { hashes: rastro.hashes, ponteiro: rastro.ponteiro + 1 }
  }
  // 4. Navegacao nova: o que estava a frente do ponteiro e DESCARTADO. Nao e escolha do app — e o
  //    que o navegador acabou de fazer com o historico dele ao empilhar uma entrada nova. Guardando
  //    o futuro, o "avancar" prometeria uma tela que o `history.forward()` nao alcanca mais.
  return {
    hashes: [...rastro.hashes.slice(0, rastro.ponteiro + 1), hash],
    ponteiro: rastro.ponteiro + 1,
  }
}

/**
 * O hash ja e o do menu? (A home, que tem mais de uma escrita: `''` no app aberto pelo arquivo,
 * `#` e `#/` — as tres que `analisar` le como a rota `home`.)
 */
export function estaNoMenu(hash: string): boolean {
  return hash === '' || hash === '#' || hash === HASH_DO_MENU
}

export interface Navegacao {
  /** Nomes de estado do botao: `voltar()`/`avancar()` so andam quando ha para onde. */
  podeVoltar: boolean
  podeAvancar: boolean
  /** Ja esta no menu? */
  podeIrParaMenu: boolean
  voltar: () => void
  avancar: () => void
  irParaMenu: () => void
}

/**
 * Os dois "ha para onde" da barra do topo e o que os botoes fazem.
 *
 * `voltar()`/`avancar()` usam o historico do NAVEGADOR, e nao a reatribuicao do hash: `irPara()`
 * empurraria uma entrada nova a cada clique (o "voltar" inflaria o historico e o "avancar" nunca
 * teria para onde ir). Quem anda de fato e o navegador; o rastro so diz se pode — e um
 * `hashchange` traz de volta o rastro atualizado, que e o mesmo caminho de qualquer clique em
 * link.
 */
export function useNavegacao(): Navegacao {
  const [rastro, setRastro] = useState(() => iniciarRastro(window.location.hash))

  useEffect(() => {
    const aoTrocar = (): void => setRastro((atual) => atualizarRastro(atual, window.location.hash))
    window.addEventListener('hashchange', aoTrocar)
    return () => window.removeEventListener('hashchange', aoTrocar)
  }, [])

  // O hash onde o rastro diz que o app esta: e ele que responde pelo menu. (Nao se le a barra de
  // enderecos aqui: com o rastro, esta resposta e a mesma coisa que a tela mostra.)
  const hashAtual = rastro.hashes[rastro.ponteiro] ?? window.location.hash

  function voltar(): void {
    if (!podeVoltar(rastro)) return
    window.history.back()
  }

  function avancar(): void {
    if (!podeAvancar(rastro)) return
    window.history.forward()
  }

  function irParaMenu(): void {
    if (estaNoMenu(hashAtual)) return
    irPara(HASH_DO_MENU)
  }

  return {
    podeVoltar: podeVoltar(rastro),
    podeAvancar: podeAvancar(rastro),
    podeIrParaMenu: !estaNoMenu(hashAtual),
    voltar,
    avancar,
    irParaMenu,
  }
}
