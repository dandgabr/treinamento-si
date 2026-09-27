import { useEffect, useMemo, useState } from 'react'
import { content } from '../infrastructure/content/repository'

export type Rota =
  | { nome: 'home' }
  | { nome: 'area'; areaId: string }
  | { nome: 'tema'; ref: string }
  // `slug` pode ter mais de um segmento (`91-trilhas/plano-90-dias`); `ancora` e o id de um
  // alvo DENTRO da pagina (o termo do glossario), quando a rota termina nele.
  | { nome: 'pagina'; slug: string; ancora: string | null }
  // `areaId` nulo e o quiz de todas as areas; `areaId` com `temaId` nulo e o da area
  // inteira; com os dois, o de um tema. E a mesma tela nos tres casos, e por isso nao ha uma
  // rota propria para cada escopo.
  | { nome: 'quiz'; areaId: string | null; temaId: string | null }
  | { nome: 'desconhecida' }

/**
 * Separa o slug da pagina do ancora dela.
 *
 * O slug de uma pagina pode ter mais de um segmento (`91-trilhas/plano-90-dias`), entao o
 * ancora nao pode ser simplesmente "o segundo segmento": ele e o ULTIMO, e so quando o que vem
 * antes dele e um slug conhecido. `#/pagina/glossario` e o glossario inteiro;
 * `#/pagina/glossario/termo-tls` e o mesmo glossario aberto no verbete `termo-tls`, que leva o
 * id do elemento na tela. E a mesma ancora como ultimo segmento que o material ja usa para as
 * secoes (`#/area/01-fundamentos/secao-4`), entao o endereco de um termo nao precisou de
 * gramatica nova.
 *
 * O slug exato ganha do prefixo: se um dia existir uma pagina `a/b` e outra `a`, `#/pagina/a/b`
 * e a pagina `a/b`, e nao a `a` com um ancora `b`.
 */
export function separarAncora(
  partes: string[],
  slugs: readonly string[],
): { slug: string; ancora: string | null } {
  const inteiro = partes.join('/')
  if (slugs.includes(inteiro)) return { slug: inteiro, ancora: null }
  // Do prefixo mais longo para o mais curto: `#/pagina/91-trilhas/plano-90-dias/secao-2` tem de
  // casar o slug de dois segmentos, e nao o de um.
  for (let corte = partes.length - 1; corte >= 1; corte--) {
    const prefixo = partes.slice(0, corte).join('/')
    if (!slugs.includes(prefixo)) continue
    const resto = partes.slice(corte)
    // Um segmento so depois do slug. Dois nao formam ancora de nada: nao e rota de pagina, e a
    // tela diz "pagina nao encontrada" como dizia antes de existir ancora.
    if (resto.length === 1 && resto[0]) return { slug: prefixo, ancora: resto[0] }
    break
  }
  return { slug: inteiro, ancora: null }
}

function analisar(hash: string, slugs: readonly string[]): Rota {
  const limpo = hash.replace(/^#\/?/, '')
  // Um "%" solto na URL (por exemplo "#/pagina/100%") faz decodeURIComponent lancar
  // URIError dentro do render e derruba a app inteira. Decodifica por parte, com
  // recuo para o texto cru: a rota vira "desconhecida" em vez de tela branca.
  const partes = limpo
    .split('/')
    .filter(Boolean)
    .map((parte) => {
      try {
        return decodeURIComponent(parte)
      } catch {
        return parte
      }
    })
  if (!partes.length) return { nome: 'home' }
  if (partes[0] === 'area' && partes[1]) return { nome: 'area', areaId: partes[1] }
  if (partes[0] === 'tema' && partes[1] && partes[2]) return { nome: 'tema', ref: `${partes[1]}#${partes[2]}` }
  if (partes[0] === 'pagina' && partes[1]) {
    const { slug, ancora } = separarAncora(partes.slice(1), slugs)
    return { nome: 'pagina', slug, ancora }
  }
  // Sem area, `#/quiz` e o quiz geral; `#/quiz/<areaId>`, o da area; `#/quiz/<areaId>/<temaId>`,
  // o do tema. Nada mais e lido da rota: escopo inexistente e resolvido na tela, que sabe
  // dizer "area nao encontrada" e "tema nao encontrado".
  if (partes[0] === 'quiz') {
    return { nome: 'quiz', areaId: partes[1] ?? null, temaId: partes[2] ?? null }
  }
  return { nome: 'desconhecida' }
}

export function useRota(): Rota {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const aoTrocar = () => setHash(window.location.hash)
    window.addEventListener('hashchange', aoTrocar)
    return () => window.removeEventListener('hashchange', aoTrocar)
  }, [])
  // Estavel entre renders: sem o memo, cada render devolve um objeto novo e efeitos
  // que dependem de `rota` (como o scroll para o topo) disparam a cada tecla, a cada
  // troca de tema e a cada clique — o leitor perde a posicao no meio do texto.
  // Os slugs vem do conteudo ja carregado (`carregar()`, em `main.tsx`, roda antes da primeira
  // renderizacao): e por eles que `#/pagina/glossario/termo-tls` acha a pagina e o ancora.
  return useMemo(() => analisar(hash, content.paginas.map((p) => p.slug)), [hash])
}

export function irPara(hash: string): void {
  window.location.hash = hash
}

/**
 * Leva a rolagem E o foco para um alvo dentro da tela (um cabecalho do material, um verbete do
 * glossario).
 *
 * O alvo fica no `id` do elemento, e nao na URL: o fragmento pertence a rota, e uma ancora
 * de verdade viraria a rota "desconhecida". O foco vai junto porque rolar sem focar deixaria
 * quem usa leitor de tela no ponto antigo, lendo o que ja passou.
 *
 * Devolve se achou o alvo: a rota com ancora (`#/pagina/glossario/termo-tls`) precisa saber se
 * ha para onde levar o foco, e um endereco que nao existe na tela nao pode deixar o foco no
 * link que a pessoa acabou de clicar.
 */
export function irParaSecao(id: string): boolean {
  const alvo = document.getElementById(id)
  if (!alvo) return false
  alvo.focus({ preventScroll: true })
  alvo.scrollIntoView({ block: 'start' })
  return true
}

/**
 * Poe o foco no bloco principal da tela.
 *
 * Dois usos: o "pular para o conteudo" (`rolar`), que precisa levar a pagina junto, e a
 * troca de rota, que so move o foco — o topo ja foi restaurado pelo App. O bloco precisa do
 * `tabIndex={-1}` que o `Principal` poe em todo `main`: focavel, e ainda assim fora da
 * tabulacao normal.
 */
export function focarConteudo(rolar = false): void {
  const principal = document.querySelector('main')
  if (!principal) return
  principal.focus({ preventScroll: !rolar })
  if (rolar) principal.scrollIntoView({ block: 'start' })
}

/**
 * Monta o href de um item a partir do `ref`.
 *
 * O banco tem uma origem só e todo item sai de um tema: `area#TEMA-NN` leva ao tema, e a
 * convenção de `#GUIA` (item de checkpoint) saiu junto com as discursivas — o gerador não a
 * grava mais e o gate não a aceita.
 *
 * O `#` do ref nao pode ir cru para a URL: ele encerraria o fragmento e a rota viraria
 * "desconhecida".
 */
export function linkTema(ref: string): string {
  const [areaId, parte] = ref.split('#')
  return `#/tema/${areaId}/${parte}`
}

/** Monta o href do quiz: com tema, o do tema; com area, o da area; sem, o de todas. */
export function linkQuiz(areaId?: string, temaId?: string): string {
  if (areaId && temaId) return `#/quiz/${areaId}/${temaId}`
  return areaId ? `#/quiz/${areaId}` : '#/quiz'
}

