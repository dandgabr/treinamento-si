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

/**
 * O banco de multipla escolha, num arquivo so.
 *
 * O navegador escreve os 18 `import` a mao porque `file://` nao carrega nada externo; aqui
 * nao existe essa restricao, e o `vite.desktop.config.ts` junta os 18 arquivos num objeto
 * `{areaId: itens[]}`. Uma leitura em vez de dezoito: o banco e aberto quando a tela do quiz
 * e montada, e nao vale dezoito idas ao `app://` para montar uma coisa so.
 */
export async function lerBancoBruto(): Promise<unknown> {
  const resposta = await fetch(new URL('questoes.json', location.href).href)
  if (!resposta.ok) throw new Error(`banco de questões indisponível (${resposta.status})`)
  return await resposta.json()
}
