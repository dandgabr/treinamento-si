import { useEffect, useMemo, useState } from 'react'

export type Rota =
  | { nome: 'home' }
  | { nome: 'area'; areaId: string }
  | { nome: 'tema'; ref: string }
  | { nome: 'pagina'; slug: string }
  | { nome: 'desconhecida' }

function analisar(hash: string): Rota {
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
  if (partes[0] === 'pagina' && partes[1]) return { nome: 'pagina', slug: partes.slice(1).join('/') }
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
  return useMemo(() => analisar(hash), [hash])
}

export function irPara(hash: string): void {
  window.location.hash = hash
}

/**
 * Monta o href de um tema a partir do `ref` ("area_id#TEMA-NN").
 * O `#` do ref nao pode ir cru para a URL: ele encerraria o fragmento e a rota
 * viraria "desconhecida".
 */
export function linkTema(ref: string): string {
  const [areaId, temaId] = ref.split('#')
  return `#/tema/${areaId}/${temaId}`
}
