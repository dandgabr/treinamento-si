/**
 * Fonte de conteudo da build do DESKTOP.
 *
 * Aqui o conteudo e um arquivo ao lado do HTML, servido pelo esquema `app://`, em vez de
 * vir inline no JavaScript. A diferenca e de arranque: com 3,8 MB de JSON dentro do
 * bundle, o V8 precisa analisar tudo antes de pintar a primeira tela; lido como arquivo,
 * o custo so aparece depois do primeiro render.
 */
export async function lerConteudoBruto(): Promise<unknown> {
  const resposta = await fetch(new URL('conteudo.json', location.href).href)
  if (!resposta.ok) throw new Error(`conteúdo indisponível (${resposta.status})`)
  return await resposta.json()
}
