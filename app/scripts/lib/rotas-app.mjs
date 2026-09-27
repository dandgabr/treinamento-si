// O que conta como rota que o app resolve, a partir do proprio conteudo.
//
// Mora em `.mjs` (com tipos em `rotas-app.d.mts`) porque dois consumidores de mundos diferentes
// fazem a MESMA pergunta: o portao do build (`validar-content.ts`, TypeScript) e o smoke
// (`smoke.mjs`, Node puro). Enquanto a gramatica da rota vive em dois lugares, o primeiro ajuste
// em um deles passa a reprovar o que o outro aceita — e a divergencia so aparece na tela.
//
// A gramatica e a de `analisar`/`separarAncora` (`src/ui/useRota.ts`): os dois primeiros segmentos
// identificam a tela, e o ultimo pode ser o id de um alvo DENTRO dela (a secao de um guia, o
// verbete do glossario), que e o jeito com que a ancora do material viaja na rota.

/**
 * As rotas que o conteudo declara: uma area por `areaId`, um tema por `ref`, uma pagina por slug.
 *
 * Recebe tanto o `Conteudo` do build quanto o `content.json` ja parseado — e a mesma forma.
 */
export function rotasDoConteudo(conteudo) {
  return {
    areas: new Set(conteudo.areas.map((a) => a.areaId)),
    temas: new Set(Object.keys(conteudo.temas)),
    paginas: conteudo.paginas.map((p) => p.slug),
  }
}

/** `decodeURIComponent` com recuo: um `%` solto na rota nao pode derrubar o teste nem o build. */
function decodificar(parte) {
  try {
    return decodeURIComponent(parte)
  } catch {
    return parte
  }
}

/**
 * O slug da pagina a partir das partes depois de `pagina`, ou `null` quando nenhum slug conhecido
 * casa. O slug exato ganha do prefixo; um unico segmento depois do slug e o alvo dentro da tela
 * (`#/pagina/glossario/termo-tls`), e dois nao formam ancora de nada.
 */
function slugDePagina(partes, slugs) {
  const inteiro = partes.join('/')
  if (slugs.includes(inteiro)) return inteiro
  for (let corte = partes.length - 1; corte >= 1; corte--) {
    if (partes.length - corte !== 1) continue
    const prefixo = partes.slice(0, corte).join('/')
    if (slugs.includes(prefixo)) return prefixo
  }
  return null
}

/**
 * O href aponta para uma rota que o app resolve?
 *
 * Todo href que comeca com `#` tem de ser `#/` ou uma rota conhecida. Um fragmento puro
 * (`#4-temas`, a grafia de ancora do GitHub que o material escreve como `README.md#4-temas`) nao
 * e rota: `analisar` o le como rota `desconhecida` e a tela inteira cai em "Rota nao reconhecida"
 * — o defeito que o smoke pegava em 21 rotas de 109, e que agora reprova no build.
 *
 * `#` nu tambem reprova: ele nao leva a lugar nenhum de proposito, e "nao quebra" nao e o mesmo
 * que "abre a tela".
 */
export function ehHrefDeRota(href, rotas) {
  if (!href.startsWith('#/')) return false
  const partes = href
    .slice(2)
    .split('/')
    .filter(Boolean)
    .map(decodificar)
  // `#/` e a rota do painel.
  if (!partes.length) return true
  const [tipo, segundo, terceiro] = partes
  // `#/quiz` e a unica rota sem segundo segmento: o quiz de todas as areas.
  if (tipo === 'quiz') {
    return (
      partes.length === 1 ||
      (partes.length === 2 && rotas.areas.has(segundo)) ||
      (partes.length === 3 && Boolean(terceiro) && rotas.temas.has(`${segundo}#${terceiro}`))
    )
  }
  if (!segundo) return false
  if (tipo === 'area') return rotas.areas.has(segundo)
  if (tipo === 'tema') return Boolean(terceiro) && rotas.temas.has(`${segundo}#${terceiro}`)
  if (tipo === 'pagina') return slugDePagina(partes.slice(1), rotas.paginas) !== null
  return false
}
