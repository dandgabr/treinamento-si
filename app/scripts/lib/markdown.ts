// Parser do Markdown de "conteudo/" — funcoes puras sobre texto.
//
// Ficam aqui, e nao no orquestrador de filesystem, para poderem ser testadas com
// fixtures pequenos: `parseTemaDeTexto` recebe a string do arquivo, nunca um caminho.

import matter from 'gray-matter'
import MarkdownIt, { type Token } from 'markdown-it'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import type {
  ErroComum,
  Fonte,
  Guia,
  Nivel,
  Pagina,
  ParQA,
  Relacao,
  Relacoes,
  Secao,
  Tabela,
  Tema,
  TipoRelacao,
} from '../../src/domain/types'

const md = new MarkdownIt({ html: true, linkify: false, typographer: false })

/**
 * O que fazer com um link do material ao virar HTML.
 *
 * `markdown.ts` nao sabe de rota: ele so pergunta, para cada link, se ele deve apontar para outro
 * lugar (`trocar`), perder a marca de link (`texto`) ou ficar exatamente como o material escreveu
 * (`manter`). Quem responde e `links-material.ts`, na geracao do content.json. O texto visivel vai
 * junto porque e ele que fica no lugar do link quando a marca sai.
 *
 * Sem resolvedor — o padrao — todo link fica como veio. E o caminho que os testes usam; o gerador
 * sempre passa um resolvedor, e o portao reprova o href relativo que sobrar no HTML.
 */
export type DestinoDeLink =
  | { acao: 'trocar'; href: string }
  | { acao: 'texto' }
  | { acao: 'manter' }

export type ResolverDeLink = (href: string, texto: string) => DestinoDeLink

/**
 * Le a tag `<a …>` a partir do indice logo depois de `<a`, ate o `>` de fechamento.
 *
 * O fim da tag e encontrado respeitando aspas: um valor com `>` dentro (`href="a>b"`, que o HTML5
 * aceita) nao pode terminar a tag antes da hora — senao o href sai truncado e escapa da varredura.
 * Devolve o texto entre `<a` e `>` e o indice desse `>`. `null` quando a tag nao fecha.
 */
function lerTagDeAncora(
  texto: string,
  inicio: number,
): { atributos: string; fimTag: number } | null {
  let i = inicio
  let aspas: string | null = null
  while (i < texto.length) {
    const c = texto[i]
    if (aspas) {
      if (c === aspas) aspas = null
    } else if (c === '"' || c === "'") {
      aspas = c
    } else if (c === '>') {
      return { atributos: texto.slice(inicio, i), fimTag: i }
    }
    i++
  }
  return null
}

/**
 * Valor do atributo `href` de dentro de uma tag `<a …>`, ou `null` quando nao ha `href`.
 *
 * O HTML5 aceita quatro formas — `href="x"`, `href='x'`, `href=x` e o `href` sem valor —, com
 * espaco em volta do `=` e quebra de linha entre atributos, e o navegador as normaliza igual. A
 * varredura que so via href entre aspas deixava `<a href=TEMA-02.md>` passar: era o irmao do
 * defeito que a guarda de HTML cru veio fechar, e continuava aberto no caminho do `npm run dev`.
 * A regra do `(?:^|\s)` evita casar `data-href`/`xhref`; `href` sem `=` devolve o valor vazio.
 */
function hrefDaAncoraCrua(atributos: string): string | null {
  const achado = /(?:^|\s)href\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/i.exec(atributos)
  if (!achado) return null
  return achado[1] ?? achado[2] ?? achado[3] ?? ''
}

/** Indices do corpo e do fim de `</a>` a partir de `inicio`; `null` quando nao ha fechamento. */
function fimDaAncoraCrua(texto: string, inicio: number): { corpoFim: number; proximo: number } | null {
  const re = /<\/a\s*>/gi
  re.lastIndex = inicio
  const achado = re.exec(texto)
  if (!achado) return null
  return { corpoFim: achado.index, proximo: achado.index + achado[0].length }
}

/**
 * Hrefs de ancoras escritas em HTML CRU no trecho (`<a href="…">`), com o texto visivel delas.
 *
 * O renderer de `link_open` so ve link de Markdown: `<a href="//evil.com/pwn">` escrito em HTML
 * atravessa o `md.render` como bloco de HTML e nunca chega ao resolvedor — era assim que o
 * caminho do `npm run dev` (`build:content && vite`, sem `check:content`) deixava um link
 * protocol-relative chegar a tela em silencio. Quem chama esta funcao entrega o href ao MESMO
 * resolvedor, para o defeito nascer no build e nao so na conferencia depois.
 *
 * A varredura le a tag como o HTML5 a permite — aspas duplas, aspas simples, valor sem aspas e
 * `href` sem valor, com espaco ou quebra de linha no meio —, e nao so a forma entre aspas: e a
 * forma que o navegador executa, e `<a href=TEMA-02.md>` e valido e escapava da guarda antiga.
 *
 * Blocos e trechos de codigo ficam de fora: ali um `<a href>` e texto documentado — o markdown-it
 * o entrega escapado, e ele nao vira ancora nenhuma na pagina.
 */
export function hrefsDeAncorasCruas(markdown: string): Array<{ href: string; texto: string }> {
  const semCodigo = markdown
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/`[^`\n]*`/g, '')
  const achados: Array<{ href: string; texto: string }> = []
  const RE_ABRE = /<a\b/gi
  while (RE_ABRE.exec(semCodigo) !== null) {
    const tag = lerTagDeAncora(semCodigo, RE_ABRE.lastIndex)
    if (tag === null) break
    const fim = fimDaAncoraCrua(semCodigo, tag.fimTag + 1)
    if (fim === null) break
    // Retoma depois do `</a>`, para o proximo `<a` nao casar com o corpo desta ancora.
    RE_ABRE.lastIndex = fim.proximo
    const href = hrefDaAncoraCrua(tag.atributos)
    // Ancora sem `href` nao e defeito nenhum: nao ha destino a resolver.
    if (href === null) continue
    achados.push({
      href,
      // O texto do rotulo entra sem marcacao: e por ele que o resolvedor reconhece o link
      // declarado sem rota ("templates/RELACOES-TEMAS.md"), como faz com o link de Markdown.
      texto: semCodigo
        .slice(tag.fimTag + 1, fim.corpoFim)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    })
  }
  return achados
}

/**
 * Caracteres de controle bidirecional (RFC 5893 / Unicode `Bidi_Control`).
 *
 * `<a href="https://evil.example/‮moc.elgoog//:sptth">` desenha `https://google.com` na barra de
 * status e leva o clique ao host do atacante: o U+202E inverte o que vem depois dele, e o texto
 * visivel deixa de ser o endereco real. Os controles de formatacao de direcao nao tem lugar em
 * material de estudo em portugues — nem no `href`, onde o endereco real fica escondido, nem no
 * texto, onde a ordem de leitura muda.
 */
const CONTROLES_BIDI = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/

/** Os pontos de codigo encontrados, em `U+XXXX`: o caractere e invisivel e nao se acha pelo olho. */
function pontosDeBidi(texto: string): string[] {
  const achados = new Set<string>()
  for (const caractere of texto.matchAll(/\p{Cf}|\p{Cc}/gu)) {
    if (!CONTROLES_BIDI.test(caractere[0])) continue
    achados.add(`U+${(caractere[0].codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`)
  }
  return [...achados]
}

interface AmbienteDeLinks {
  resolver?: ResolverDeLink
}

// Pilha de `link_open` abertos: `link_close` nao sabe a que abertura pertence, e link dentro de
// link nao existe no Markdown — um booleano por abertura basta. Zerada a cada render, para um
// erro no meio de um bloco (a sanitizacao lanca) nao desalinhar o proximo.
const desembrulhar: boolean[] = []

/** O texto visivel de um link: os `text` entre a abertura e o fechamento correspondente. */
function textoDoLink(tokens: Token[], abertura: number): string {
  const partes: string[] = []
  let fundo = 0
  for (let i = abertura + 1; i < tokens.length; i++) {
    const token = tokens[i]
    if (!token) break
    if (token.type === 'link_open') fundo++
    else if (token.type === 'link_close') {
      if (fundo === 0) break
      fundo--
    } else if (token.type === 'text' || token.type === 'code_inline') partes.push(token.content)
  }
  return partes.join('')
}

// A troca acontece no token, ANTES da sanitizacao: o DOMPurify continua sendo a ultima fronteira,
// e o que ele recusar continua derrubando o build em vez de limpar em silencio.
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const href = token?.attrGet('href')
  const destino = href
    ? (env as AmbienteDeLinks).resolver?.(href, textoDoLink(tokens, idx))
    : undefined
  if (destino?.acao === 'trocar') token?.attrSet('href', destino.href)
  const semLink = destino?.acao === 'texto'
  desembrulhar.push(semLink)
  return token && !semLink ? self.renderToken(tokens, idx, options) : ''
}

md.renderer.rules.link_close = (tokens, idx, options, _env, self) => {
  return desembrulhar.pop() ? '' : self.renderToken(tokens, idx, options)
}


// O HTML e gerado a partir de Markdown do proprio repositorio, mas o bundle e
// distribuido como arquivo unico e persiste para todo mundo que abrir o app: vale
// tratar o Markdown como fronteira de confianca.
//
// A allowlist e explicita e corresponde exatamente ao que o corpus usa hoje (tags
// conferidas sobre o content.json gerado). Se um tema novo introduzir outra tag, o
// build falha em vez de limpar em silencio — a sanitizacao precisa acusar, nao curar.
// O cast isola a unica conversao insegura (o DOMWindow do jsdom satisfaz o WindowLike
// exigido pelo DOMPurify, mas os tipos nao declaram isso).
type JanelaDOMPurify = Parameters<typeof createDOMPurify>[0]
const JANELA = new JSDOM('')
const DOM_PURIFY = createDOMPurify(JANELA.window as unknown as JanelaDOMPurify)

/**
 * Prefixo de todo `id` que vem do material — e do href de ancora que aponta para ele.
 *
 * O `id` do material sobrevive a sanitizacao, e `document.getElementById` devolve o PRIMEIRO
 * elemento na ordem da arvore. Sem o prefixo, um `id="secao-10"` num `<div>` do material posto
 * antes da secao 10 faz o "Ir para a secao 10" da fila e o item do sumario focarem o TEXTO do
 * material; um `id="checklist-da-trilha"` desvia o indice da trilha. As ancoras do app
 * (`secao-N`, `checklist-da-trilha`, `fase-N`) sao o endereco de alvos DENTRO da tela, e um `id`
 * vindo de fora nao pode toma-las.
 *
 * O mecanismo e reescrever o `id` do material AQUI, no ponto unico por onde todo o HTML do
 * material passa antes de chegar ao DOM (`renderSeguro`), em vez de prefixar os `id` do app: os
 * do app vivem espalhados (`Blocos.tsx`, `Trilha.tsx`) e, pior, sao a gramatica da ROTA — o
 * `secao-N` viaja como ultimo segmento de `#/area/<areaId>/secao-4`, escrita em `links-material.ts`
 * e conferida por `rotas-app.mjs`. Prefixar o material e uma linha e vale para qualquer tag que o
 * material venha a usar.
 *
 * O href de ancora da MESMA pagina anda junto: `[nota](#nota)` aponta para o `id` `nota`, que
 * vira `material-nota`, e o par precisa continuar casando. O href de ROTA (`#/…`) NAO se toca: ele
 * ja e o endereco de uma tela, resolvido na geracao, e reescreve-lo quebraria toda a navegacao
 * interna do app.
 */
export const PREFIXO_ID_MATERIAL = 'material-'

DOM_PURIFY.addHook('afterSanitizeAttributes', (no: Element) => {
  const id = no.getAttribute('id')
  if (id) no.setAttribute('id', `${PREFIXO_ID_MATERIAL}${id}`)
})

/**
 * O href de ancora da MESMA pagina precisa andar junto com o `id` que ele endereça.
 *
 * `[nota](#nota)` aponta para o `id` `nota`, que o hook acima virou `material-nota`: sem religar,
 * a ancora do proprio material pararia de alcancar o alvo. Um href so e reescrito quando o `id`
 * que ele endereça EXISTE — declarado no mesmo bloco (`<p id="nota">alvo</p>` junto do link) ou
 * em qualquer ponto do MESMO documento (`idsDaPagina`, o que o parser recebe): a tela monta o
 * documento inteiro numa pagina so, e um alvo da secao 3 alcancado por um link da secao 1 e o
 * mesmo par id/href. Sem a segunda leitura, um par que atravessa secoes saia pela metade — o
 * `id` ganhava o prefixo e o href nao, e a ancora morria. Um `#4-temas` solto — a grafia de
 * ancora do GitHub, que o material escreve junto do arquivo — nao tem `id` para onde ir e fica
 * como veio: quem o reprova por nao ser rota e o portao, e o defeito tem de continuar visivel
 * para a varredura (o teste de `links-material` fixa exatamente isso). O href de ROTA (`#/…`)
 * nunca se toca — ele ja e o endereco de uma tela, resolvido na geracao, e reescreve-lo quebraria
 * toda a navegacao interna do app.
 */
function religarAncorasDoMaterial(html: string, idsDaPagina: ReadonlySet<string>): string {
  // Sem fragmento de ancora local (o caso do material de hoje, que so usa rota `#/…`), nem parses.
  if (!/href="#[^/"]/.test(html)) return html
  const doc = JANELA.window.document.implementation.createHTMLDocument()
  doc.body.innerHTML = html
  const ids = new Set(Array.from(doc.body.querySelectorAll('[id]')).map((no) => no.id))
  let mudou = false
  for (const link of Array.from(doc.body.querySelectorAll('a[href]'))) {
    const href = link.getAttribute('href') ?? ''
    if (!href.startsWith('#') || href.startsWith('#/')) continue
    const alvo = href.slice(1)
    if (!alvo) continue
    // `material-X` no bloco (o par ja prefixado pelo hook) ou `X` declarado no documento.
    if (!ids.has(`${PREFIXO_ID_MATERIAL}${alvo}`) && !idsDaPagina.has(alvo)) continue
    link.setAttribute('href', `#${PREFIXO_ID_MATERIAL}${alvo}`)
    mudou = true
  }
  return mudou ? doc.body.innerHTML : html
}

/**
 * Os `id` que o documento declara no proprio Markdown (`<div id="nota">`), sem o prefixo que a
 * sanitizacao aplica depois.
 *
 * E com esta lista que o documento sabe que `[nota](#nota)` tem alvo: o parser a entrega ao
 * resolvedor de links (que aceita o fragmento) e a religacao das ancoras (que troca o par pelo
 * prefixo). Um `id` escrito dentro de bloco de codigo nunca vira elemento, e por isso nao entra:
 * seriam ancoras prometendo um alvo que a pagina nao tem.
 */
export function idsDoDocumento(markdown: string): Set<string> {
  const semCodigo = markdown
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/`[^`\n]*`/g, '')
  const ids = new Set<string>()
  for (const m of semCodigo.matchAll(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    const id = m[1] ?? m[2] ?? ''
    if (id) ids.add(id)
  }
  return ids
}

export const TAGS_PERMITIDAS = [
  'a', 'blockquote', 'br', 'code', 'details', 'div', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'li', 'ol', 'p', 'pre',
  'span', 'strong', 'summary', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul',
]
export const ATRIBUTOS_PERMITIDOS = ['class', 'href', 'start', 'id', 'colspan', 'rowspan', 'open', 'title']
export const ATRIBUTOS_PROIBIDOS = ['style', 'action', 'src', 'srcset', 'target', 'formaction']

// Ao sanitizar uma string, o DOMPurify monta um documento e descarta o in-volucro
// (body/html/head) — isso aparece em `removed` e nao e perda de conteudo.
const INVOLUCROS = new Set(['BODY', 'HTML', 'HEAD'])

type Removido = (typeof DOM_PURIFY.removed)[number]

function removidosRelevantes(): Removido[] {
  return DOM_PURIFY.removed.filter((entrada) => {
    // Atributo removido (on*, style, src...) e sempre digno de revisao.
    if ('attribute' in entrada) return true
    return !INVOLUCROS.has(entrada.element.nodeName)
  })
}

function descreverRemovidos(): string {
  return removidosRelevantes()
    .map((entrada) => {
      if ('attribute' in entrada) {
        return `@${entrada.attribute?.name ?? '?'} em <${entrada.from.nodeName.toLowerCase()}>`
      }
      const no = entrada.element as Node & { outerHTML?: string }
      const tag = `<${no.nodeName.toLowerCase()}>`
      return no.outerHTML ? `${tag} ${no.outerHTML.slice(0, 160)}` : tag
    })
    .join(' | ')
}

/** Markdown -> HTML sanitizado. Lanca se a sanitizacao remover qualquer conteudo. */
export function renderSeguro(
  markdown: string,
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): string {
  desembrulhar.length = 0
  recusarAncorasEmHtmlCru(markdown, resolver)
  const bruto = md.render(markdown, { resolver } satisfies AmbienteDeLinks)
  const limpo = DOM_PURIFY.sanitize(bruto, {
    ALLOWED_TAGS: TAGS_PERMITIDAS,
    ALLOWED_ATTR: ATRIBUTOS_PERMITIDOS,
    FORBID_ATTR: ATRIBUTOS_PROIBIDOS,
    ALLOW_DATA_ATTR: false,
  })
  // Ponto cego conhecido: quando o bloco INTEIRO e um elemento proibido, o DOMPurify o
  // descarta sem registra-lo em `removed` — so o in-volucro body aparece. Comparar o
  // texto visivel nao bastava: um bloco que e so `<meta>`, `<base>` ou `<link>` nao tem
  // texto nenhum, entao saia vazio E o build passava. A comparacao e do HTML: se havia
  // markup e nao sobrou nada, o conteudo sumiu.
  // O `id` do material sai prefixado (hook acima) e o href de ancora local e religado antes de
  // devolver — e o que impede um `id="secao-10"` do material de sombrear a secao 10 do app.
  const html = religarAncorasDoMaterial(limpo, idsDaPagina)
  const perdeuTudo = bruto.trim() !== '' && html.trim() === ''
  if (removidosRelevantes().length || perdeuTudo) {
    const detalhe = descreverRemovidos() || 'todo o conteudo do bloco'
    throw new Error(`sanitizacao removeu conteudo; revise o Markdown antes de publicar: ${detalhe}`)
  }
  recusarControlesBidi(html)
  return html
}

/**
 * Ancoras em HTML cru que o resolvedor TROCARIA (rota do app ou texto no lugar do link).
 *
 * Sao justamente as que o app nao consegue seguir: `md.renderer.rules.link_open` so passa pelo
 * resolvedor o link de Markdown, entao um `<a href="TEMA-02.md">` escrito a mao chegaria ao HTML
 * com o caminho relativo, que nao abre em `file://`. Em vez de limpar em silencio, o build recusa
 * e diz o que fazer. O `manter` do resolvedor continua valendo: link externo, rota `#/…` ja
 * pronta e ancora da propria pagina (com o `id` declarado no documento) sao enderecos que o app
 * segue de verdade — e quando o defeito e outro (protocol-relative, caminho absoluto, arquivo que
 * nao existe), o proprio resolvedor ja o registrou no relatorio de links.
 */
function recusarAncorasEmHtmlCru(markdown: string, resolver?: ResolverDeLink): void {
  if (!resolver) return
  for (const { href, texto } of hrefsDeAncorasCruas(markdown)) {
    if (!href) continue
    if (resolver(href, texto).acao === 'manter') continue
    throw new Error(
      `link em HTML cru (${href}): o gerador so troca link de Markdown pelo endereco do app, e ` +
        `uma ancora escrita em HTML chega ao arquivo unico com o href do material — escreva o ` +
        `link como [texto](caminho)`,
    )
  }
}

/**
 * Recusa caractere de controle bidirecional ONDE ELE AGE, e nao em qualquer byte do HTML.
 *
 * O defeito e de exibicao, e por isso nao da para limpar em silencio: um `href` com U+202E mostra
 * um endereco na barra de status e leva o clique a outro host, e o texto visivel passa a ler na
 * ordem que o atacante escolheu. O build para e nomeia os pontos de codigo, que sao invisiveis.
 *
 * A guarda cobre as duas superficies em que o caractere tem efeito — o `href` (atributo, onde o
 * endereco real fica escondido) e o HTML renderizado (texto) — e deixa de fora o que esta dentro
 * de `<pre>`/`<code>`. Ali o caractere e texto documentado: um material de seguranca que ENSINE o
 * Trojan Source precisa escrever o U+202E como exemplo, e o markdown-it entrega o bloco escapado,
 * sem que ele reordene nada na tela. As funcoes vizinhas (`hrefsDeAncorasCruas`, `idsDoDocumento`)
 * ja removem as cercas pela mesma razao: aqui a regua e a mesma, para o mesmo material nao ter duas.
 */
function recusarControlesBidi(html: string): void {
  // Fora do codigo: `<pre>` primeiro (bloco de cerca) e `<code>` depois (trecho inline) — o
  // caractere dentro deles e exemplo lido, nao endereco nem prosa que a tela reordena. A remocao
  // vem ANTES das duas varreduras: uma URL escrita como exemplo dentro da cerca tambem e inerte,
  // e o markdown-it nao escapa as aspas dela, entao a guarda de href a leria como endereco real.
  const semCodigo = html
    .replace(/<pre\b[\s\S]*?<\/pre\s*>/gi, ' ')
    .replace(/<code\b[\s\S]*?<\/code\s*>/gi, ' ')
  for (const m of semCodigo.matchAll(/href\s*=\s*"([^"]*)"/g)) {
    const pontos = pontosDeBidi(m[1] ?? '')
    if (pontos.length) {
      throw new Error(
        `href com caractere de controle bidirecional (${pontos.join(', ')}): a barra de status ` +
          `mostraria um endereco e o clique iria para outro — remova o caractere do endereco`,
      )
    }
  }
  const pontos = pontosDeBidi(semCodigo)
  if (pontos.length) {
    throw new Error(
      `caractere de controle bidirecional no material (${pontos.join(', ')}): ele inverte a ordem ` +
        `de leitura do trecho (e do texto de um link, contra o endereco dele) — remova o caractere`,
    )
  }
}

// ---------------------------------------------------------------- utilitarios

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const RE_MERMAID = /^```mermaid[ \t]*\n([\s\S]*?)^```[ \t]*$/gm

/** Extrai os blocos Mermaid e os substitui por um div que o app hidrata. */
export function extrairMermaid(texto: string): { texto: string; blocos: string[] } {
  const blocos: string[] = []
  const out = texto.replace(RE_MERMAID, (_m, codigo: string) => {
    const src = String(codigo).replace(/\s+$/, '')
    blocos.push(src)
    return `<div class="mermaid">${escapeHtml(src)}</div>`
  })
  return { texto: out, blocos }
}

export interface SecaoCrua {
  numero: number
  titulo: string
  raw: string
}

const RE_SECAO = /^##\s+(\d+)\.\s+(.+)$/gm

/**
 * Ancora de cabecalho como o material e o GitHub a escrevem: minusculas, sem pontuacao, espacos
 * viram `-`. `## 4. Temas` vira `4-temas` — o endereco que o material usa em `README.md#4-temas`.
 */
export function slugDeAncora(cabecalho: string): string {
  return cabecalho
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Ancora do material -> numeros de secao que ela alcanca, num documento.
 *
 * O numero e o `## N.` do proprio cabecalho, que e o que a tela usa como id (`secao-N`): a
 * ancora do GitHub e o id do app sao o mesmo endereco escrito de duas formas, e este mapa e a
 * traducao. Duas secoes com o mesmo texto caem na mesma ancora, e por isso o valor e uma lista:
 * o gate prefere reprovar uma ancora ambigua a escolher uma das duas.
 */
export function ancorasDeSecao(texto: string): Map<string, number[]> {
  const { content } = matter(texto)
  const ancoras = new Map<string, number[]>()
  for (const marca of content.matchAll(RE_SECAO)) {
    const numero = Number(marca[1] ?? 0)
    const slug = slugDeAncora(`${numero}. ${(marca[2] ?? '').trim()}`)
    ancoras.set(slug, [...(ancoras.get(slug) ?? []), numero])
  }
  return ancoras
}

/** Fatia o corpo pelos cabecalhos `## N. Titulo`. */
export function fatiarSecoes(corpo: string): { intro: string; secoes: SecaoCrua[] } {
  const marcas = [...corpo.matchAll(RE_SECAO)]
  const intro = marcas.length ? corpo.slice(0, marcas[0]?.index ?? 0).trim() : corpo.trim()
  const secoes = marcas.map((m, i) => {
    const inicio = (m.index ?? 0) + m[0].length
    const fim = i + 1 < marcas.length ? (marcas[i + 1]?.index ?? corpo.length) : corpo.length
    return { numero: Number(m[1] ?? 0), titulo: (m[2] ?? '').trim(), raw: corpo.slice(inicio, fim).trim() }
  })
  return { intro, secoes }
}

// Um item numerado termina onde comeca o proximo, onde comeca uma linha NAO indentada
// (as continuacoes do material sao indentadas) ou no fim do texto.
//
// A versao anterior era `/^(\d+)\.\s+([\s\S]*?)(?=^\d+\.\s|$)/gm`: com a flag `m`, o `$`
// casa no fim de CADA linha, entao o corpo do item parava na primeira quebra e a frase
// continuada na linha de baixo era descartada. O defeito chegava a tela — 24 pares de
// recuperacao ativa eram exibidos cortados no meio da palavra.
const RE_ITEM = /(?:^|\n)(\d+)\.[ \t]+([\s\S]*?)(?=\n\d+\.[ \t]|\n\S|$)/g

export function itensNumerados(texto: string): string[] {
  const out: string[] = []
  for (const m of texto.matchAll(RE_ITEM)) {
    const item = (m[2] ?? '').replace(/\n{3,}/g, '\n\n').trim()
    if (item) out.push(item)
  }
  return out
}

export function limparConfianca(t: string): string {
  // O marcador de confianca vive em linha propria. Filtrar por linha cobre tambem
  // formatos nao canonicos ("Confiança: 3", "Confiança: (1-5)") que vazariam para
  // a pergunta exibida se o corte dependesse do sublinhado.
  return t
    .split('\n')
    .filter((linha) => !/^\s*Confiança:\s*/.test(linha))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function celulasDaLinha(linha: string): string[] {
  return linha
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
}

/** Converte a primeira tabela Markdown do trecho. */
export function parseTabela(raw: string): Tabela | null {
  const linhas = raw.split('\n').filter((l) => l.trim().startsWith('|'))
  if (linhas.length < 3) return null
  const cabecalho = celulasDaLinha(linhas[0] ?? '')
  const dados = linhas
    .slice(2)
    .map(celulasDaLinha)
    .filter((r) => r.some((c) => c !== ''))
  if (!dados.length) return null
  return { cabecalho, linhas: dados }
}

/** Extrai pares pergunta/resposta de um bloco com `N.` antes e dentro de `<details>`. */
export function extrairQA(raw: string): { pares: ParQA[]; criterio: string } {
  const idx = raw.search(/<details>/)
  const antes = idx >= 0 ? raw.slice(0, idx) : raw
  const detalhe = idx >= 0 ? raw.slice(idx) : ''
  const perguntas = itensNumerados(antes)
  const semTags = detalhe
    .replace(/<\/?details>/g, '')
    .replace(/<summary>[\s\S]*?<\/summary>/g, '')
  const respostas = itensNumerados(semTags)
  const pares = perguntas.map((p, i) => ({ pergunta: p, resposta: respostas[i] ?? '' }))
  // Nos guias o criterio vem rotulado; ancorar na frase evita casar "criterio" solto
  // dentro de uma resposta.
  const m = semTags.match(/Crit[ée]rio para seguir adiante:([\s\S]*)$/i)
  return { pares, criterio: m ? (m[1] ?? '').trim() : '' }
}

function normalizarFonte(f: Record<string, unknown>): Fonte {
  return {
    titulo: String(f.titulo ?? ''),
    url: String(f.url ?? ''),
    tipo: (f.tipo as Fonte['tipo']) ?? 'secundaria',
    acessadoEm: f.acessado_em ? String(f.acessado_em) : undefined,
    confianca: f.confianca as Fonte['confianca'],
  }
}

export function normalizarFontes(v: unknown): Fonte[] {
  if (!Array.isArray(v)) return []
  return v
    .filter((f) => f && typeof f === 'object')
    .map((f) => normalizarFonte(f as Record<string, unknown>))
}

const CHAVES_RELACAO: Record<string, TipoRelacao> = {
  complementa: 'complementa',
  aprofundado_por: 'aprofundadoPor',
  aplicado_em: 'aplicadoEm',
  nao_confundir_com: 'naoConfundirCom',
}

export function normalizarRelacoes(v: unknown): Relacoes {
  const base: Relacoes = {
    complementa: [],
    aprofundadoPor: [],
    aplicadoEm: [],
    naoConfundirCom: [],
  }
  if (!v || typeof v !== 'object') return base
  const obj = v as Record<string, unknown>
  for (const [chaveYaml, chave] of Object.entries(CHAVES_RELACAO)) {
    const lista = obj[chaveYaml]
    if (!Array.isArray(lista)) continue
    base[chave] = lista
      .filter((r) => r && typeof r === 'object')
      .map((r) => {
        const rel = r as Record<string, unknown>
        return {
          alvo: String(rel.alvo ?? ''),
          motivo: String(rel.motivo ?? ''),
          pendente: Boolean(rel.pendente),
        } satisfies Relacao
      })
  }
  return base
}

function render(
  secoesCruas: SecaoCrua[],
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): { secoes: Secao[]; mermaid: string[] } {
  const mermaid: string[] = []
  const secoes: Secao[] = secoesCruas.map((s) => {
    const { texto, blocos } = extrairMermaid(s.raw)
    mermaid.push(...blocos)
    return { numero: s.numero, titulo: s.titulo, html: renderSeguro(texto, resolver, idsDaPagina) }
  })
  return { secoes, mermaid }
}

export function secaoTexto(secoes: SecaoCrua[], numero: number): string {
  return secoes.find((s) => s.numero === numero)?.raw ?? ''
}

/**
 * O intro e tudo o que vem antes do primeiro `## N.`, o que inclui a linha `# Titulo`.
 * O app ja exibe esse titulo a partir do frontmatter, entao o `<h1>` e removido para
 * nao duplicar o cabecalho (e nao dar dois h1 por pagina).
 */
export function renderIntro(
  introCru: string,
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): string {
  const html = renderSeguro(extrairMermaid(introCru).texto, resolver, idsDaPagina)
  return html.replace(/^\s*<h1>[\s\S]*?<\/h1>\s*/, '')
}

// ---------------------------------------------------------------- documentos

/**
 * `idsDaPagina` sao os `id` que o documento declara (`idsDoDocumento`): o parser os repassa ao
 * resolvedor (que aceita o fragmento da propria pagina) e a religacao das ancoras (que troca o
 * par id/href pelo prefixo). Sem eles, `[nota](#nota)` seria recusado por nao ser rota do app.
 */
export function parseTemaDeTexto(
  texto: string,
  areaId: string,
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): Tema {
  const { data, content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas, resolver, idsDaPagina)

  const preTeste = itensNumerados(secaoTexto(cruas, 3)).map((p) => ({
    pergunta: limparConfianca(p),
  }))

  const { pares: recuperacao } = extrairQA(secaoTexto(cruas, 10))

  const tabelaErros = parseTabela(secaoTexto(cruas, 9))
  const errosComuns: ErroComum[] = (tabelaErros?.linhas ?? []).map((r) => ({
    equivoco: r[0] ?? '',
    porque: r[1] ?? '',
    correto: r[2] ?? '',
  }))

  return {
    ref: `${areaId}#${String(data.tema_id)}`,
    areaId,
    temaId: String(data.tema_id ?? ''),
    titulo: String(data.tema ?? ''),
    nivel: (data.nivel as Nivel) ?? 'base',
    tempoEstimado: String(data.tempo_estimado ?? ''),
    objetivo: String(data.objetivo_aprendizagem ?? ''),
    certificacoes: Array.isArray(data.certificacoes) ? data.certificacoes.map(String) : [],
    preRequisitos: Array.isArray(data.pre_requisitos) ? data.pre_requisitos.map(String) : [],
    atendeObjetivo: Array.isArray(data.atende_objetivo) ? data.atende_objetivo.map(Number) : [],
    relacoes: normalizarRelacoes(data.relacoes),
    fontes: normalizarFontes(data.fontes),
    revisaoInicialDias: Array.isArray(data.revisao_inicial_dias)
      ? data.revisao_inicial_dias.map(Number)
      : [],
    proximaRevisao: data.proxima_revisao ? String(data.proxima_revisao) : null,
    statusVerificacao: String(data.status_verificacao ?? 'rascunho'),
    intro: renderIntro(introCru, resolver, idsDaPagina),
    secoes,
    preTeste,
    recuperacao,
    errosComuns,
    mermaid,
  }
}

export function parseGuiaDeTexto(
  texto: string,
  areaId: string,
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): Guia {
  const { content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas, resolver, idsDaPagina)
  const { pares: checkpoint, criterio } = extrairQA(secaoTexto(cruas, 9))
  return {
    areaId,
    intro: renderIntro(introCru, resolver, idsDaPagina),
    secoes,
    checkpoint,
    criterio,
    tabelaTemas: parseTabela(secaoTexto(cruas, 4)),
    objetivos: parseTabela(secaoTexto(cruas, 2)),
    atividades: parseTabela(secaoTexto(cruas, 8)),
    mermaid,
  }
}

export function parsePaginaDeTexto(
  texto: string,
  grupo: string,
  slug: string,
  resolver?: ResolverDeLink,
  idsDaPagina: ReadonlySet<string> = new Set(),
): Pagina {
  const { data, content } = matter(texto)
  const { intro: introCru, secoes: cruas } = fatiarSecoes(content)
  const { secoes, mermaid } = render(cruas, resolver, idsDaPagina)
  const tituloMatch = content.match(/^#\s+(.+)$/m)
  return {
    slug,
    titulo: tituloMatch ? (tituloMatch[1] ?? '').trim() : String(data.escopo ?? slug),
    grupo,
    intro: renderIntro(introCru, resolver, idsDaPagina),
    secoes,
    mermaid,
  }
}
