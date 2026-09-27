import { useId, useState, type ReactElement } from 'react'
import { content } from '../infrastructure/content/repository'
import { Html, Sumario, type ItemDeSumario } from './Blocos'

/**
 * Glossario navegavel por termo.
 *
 * O material do glossario chega inteiro no `intro` da pagina, como HTML: duas tabelas de
 * verbetes (termos e siglas) com a prosa em volta. Aqui as duas tabelas viram React — cada
 * verbete ganha id, o id vira endereco proprio (`#/pagina/glossario/termo-tls`) e a lista
 * responde a busca — e a prosa em volta continua HTML, no mesmo lugar da pagina.
 *
 * A deteccao e estrutural (a tabela cujo primeiro cabecalho comeca com "Termo" ou "Sigla"), e
 * nao pelo slug da pagina: uma pagina nova com tabela de verbetes entra por aqui sem codigo
 * novo, e a que nao tiver tabela assim segue renderizada como sempre foi.
 */

/**
 * Compara texto sem acento, sem maiuscula e sem espaco repetido.
 *
 * O material desta pagina e escrito em portugues e cita termos em ingles: quem procura
 * "seguranca" tem de achar "segurança", e quem digita "TRÍADE" tem de achar "tríade CIA". O
 * `NFD` separa a letra do sinal e o intervalo `U+0300`-`U+036F` e o bloco dos acentos.
 */
export function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Colunas que dizem de ONDE o verbete veio, e nao o que ele significa: ficam fora da busca. */
const COLUNAS_DE_PROCEDENCIA = ['area', 'fonte', 'observacao', 'verificado em']

type Singular = 'termo' | 'sigla'

/** Como o endereco de um verbete se anuncia. */
const ROTULO_DO_LINK: Record<Singular, string> = {
  termo: 'Endereço do termo',
  sigla: 'Endereço da sigla',
}

export interface Celula {
  /** O texto da celula, ja sem espacos nas pontas: e por ele que a busca compara. */
  texto: string
  /** O HTML original, que pode trazer link: a tela nao inventa conteudo, so o reaproveita. */
  html: string
  /**
   * A celula ja traz um `<a>` do material — o que decide o desenho da PRIMEIRA coluna.
   * Dois `<a>` aninhados nao existem em HTML, entao a celula que ja tem link nao pode receber
   * o envoltorio do endereco do verbete (ver `Tabela`).
   */
  temLink: boolean
}

export interface Verbete {
  /** O id do elemento E o ultimo segmento do endereco dele. */
  id: string
  /** A primeira coluna: como o verbete e chamado. */
  termo: string
  celulas: Celula[]
  /** Texto normalizado das colunas de significado, para a busca. */
  busca: string
  /** Id da area de origem, quando a tabela tem a coluna; `null` quando nao tem. */
  area: string | null
}

export interface TabelaDeVerbetes {
  tipo: 'verbetes'
  singular: Singular
  chave: string
  /** O cabecalho que nomeia a tabela ("Termos", "Siglas"), quando ele existe na pagina. */
  titulo: string | null
  tituloId: string | null
  colunas: string[]
  verbetes: Verbete[]
}

export interface TrechoDeMaterial {
  tipo: 'material'
  chave: string
  html: string
  /** Os cabecalhos que sobraram neste trecho: sao itens do sumario da pagina. */
  cabecalhos: ItemDeSumario[]
}

export type BlocoDoGlossario = TrechoDeMaterial | TabelaDeVerbetes

export interface GlossarioLido {
  slug: string
  blocos: BlocoDoGlossario[]
}

/** A tabela que o app sabe transformar em lista navegavel, pelo primeiro cabecalho dela. */
function singularDaTabela(colunas: string[]): Singular | null {
  const primeira = semAcento(colunas[0] ?? '')
  if (primeira.startsWith('termo')) return 'termo'
  if (primeira.startsWith('sigla')) return 'sigla'
  return null
}

function ehProcedencia(coluna: string): boolean {
  return COLUNAS_DE_PROCEDENCIA.includes(semAcento(coluna))
}

/**
 * O id do verbete: o termo em minuscula, sem acento e com hifen no lugar do que nao e letra.
 * "tríade CIA" vira `termo-triade-cia`. Duas linhas com o mesmo texto (a mesma sigla em duas
 * tabelas, por exemplo) nao colidem: o prefixo separa `termo-tls` de `sigla-tls`, e o resto
 * ganha sufixo.
 */
function idDoVerbete(singular: Singular, termo: string, usados: Set<string>): string {
  const corpo = semAcento(termo)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const base = `${singular}-${corpo || 'sem-nome'}`
  let id = base
  for (let n = 2; usados.has(id); n++) id = `${base}-${n}`
  usados.add(id)
  return id
}

/**
 * Le uma tabela de verbetes. Devolve `null` — e a tabela fica no HTML, como sempre esteve —
 * quando ela nao e de verbetes ou esta fora da forma conhecida (celula a mais, celula a menos,
 * linha sem termo): o app prefere mostrar o material cru a mostrar uma lista pela metade.
 */
function lerTabela(tabela: Element, chave: string, usados: Set<string>): TabelaDeVerbetes | null {
  const colunas = Array.from(tabela.querySelectorAll('thead th')).map((c) =>
    (c.textContent ?? '').trim(),
  )
  const singular = singularDaTabela(colunas)
  if (!singular) return null
  const linhas = Array.from(tabela.querySelectorAll('tbody tr'))
  if (!linhas.length) return null

  const deBusca = colunas.map((c, i) => (ehProcedencia(c) ? -1 : i)).filter((i) => i >= 0)
  const iArea = colunas.findIndex((c) => semAcento(c) === 'area')
  const verbetes: Verbete[] = []
  for (const linha of linhas) {
    const celulas = Array.from(linha.querySelectorAll('td')).map((td) => ({
      texto: (td.textContent ?? '').trim(),
      html: td.innerHTML,
      // Pelo elemento, e nao pelo HTML em texto: e a leitura do DOM que diz se a celula ja tem
      // link, sem uma varredura de HTML que erra em comentario, atributo ou tag maiuscula.
      temLink: td.querySelector('a') !== null,
    }))
    if (celulas.length !== colunas.length) return null
    const termo = celulas[0]?.texto ?? ''
    if (!termo) return null
    verbetes.push({
      id: idDoVerbete(singular, termo, usados),
      termo,
      celulas,
      busca: deBusca.map((i) => semAcento(celulas[i]?.texto ?? '')).join(' · '),
      area: iArea >= 0 ? (celulas[iArea]?.texto ?? '') : null,
    })
  }
  return { tipo: 'verbetes', singular, chave, titulo: null, tituloId: null, colunas, verbetes }
}

/**
 * Quebra o HTML da pagina em blocos: a prosa fica HTML, as tabelas de verbetes viram dados.
 *
 * O cabecalho que nomeia uma tabela ("Termos", "Siglas") anda com ela: filtrada a tabela
 * inteira, um titulo sem nada embaixo seria um buraco sem explicacao no meio da pagina.
 *
 * Devolve `null` quando nao ha nenhuma tabela de verbetes — e a pagina inteira segue o caminho
 * de sempre (`Html`), sem passar por aqui.
 */
export function lerGlossario(html: string, slug: string): GlossarioLido | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const usados = new Set<string>()
  const blocos: BlocoDoGlossario[] = []
  const filhos = Array.from(doc.body.children)
  let trecho: Element[] = []
  let cabecalhos: ItemDeSumario[] = []
  let trechos = 0
  let tabelas = 0
  let achou = false

  function fecharTrecho(): void {
    if (!trecho.length) return
    trechos += 1
    blocos.push({
      tipo: 'material',
      chave: `trecho-${trechos}`,
      html: trecho.map((e) => e.outerHTML).join('\n'),
      cabecalhos,
    })
    trecho = []
    cabecalhos = []
  }

  filhos.forEach((filho, i) => {
    const tabela =
      filho.tagName === 'TABLE' ? lerTabela(filho, `tabela-${tabelas + 1}`, usados) : null
    if (!tabela) {
      trecho.push(filho)
      if ((filho.tagName === 'H2' || filho.tagName === 'H3') && filho.id) {
        cabecalhos.push({ id: filho.id, texto: (filho.textContent ?? '').trim() })
      }
      return
    }
    const anterior = filhos[i - 1]
    if (
      anterior !== undefined &&
      (anterior.tagName === 'H2' || anterior.tagName === 'H3') &&
      trecho[trecho.length - 1] === anterior &&
      semAcento(anterior.textContent ?? '').startsWith(tabela.singular)
    ) {
      trecho.pop()
      cabecalhos = cabecalhos.filter((c) => c.id !== anterior.id)
      tabela.titulo = (anterior.textContent ?? '').trim()
      tabela.tituloId = anterior.id || null
    }
    fecharTrecho()
    tabelas += 1
    blocos.push(tabela)
    achou = true
  })
  fecharTrecho()
  return achou ? { slug, blocos } : null
}

function contarVerbetes(blocos: BlocoDoGlossario[]): number {
  return blocos.reduce((n, b) => n + (b.tipo === 'verbetes' ? b.verbetes.length : 0), 0)
}

/** Todas as palavras digitadas tem de aparecer no verbete: "trust zero" acha "zero trust". */
function combina(busca: string, palavras: string[]): boolean {
  return palavras.every((palavra) => busca.includes(palavra))
}

function filtrar(blocos: BlocoDoGlossario[], palavras: string[]): BlocoDoGlossario[] {
  if (!palavras.length) return blocos
  return blocos.map((bloco) =>
    bloco.tipo === 'material'
      ? bloco
      : { ...bloco, verbetes: bloco.verbetes.filter((v) => combina(v.busca, palavras)) },
  )
}

function nomeDaArea(areaId: string): string {
  return content.areas.find((a) => a.areaId === areaId)?.areaNome ?? areaId
}

function contagemDeTermos(n: number): string {
  return n === 1 ? '1 termo' : `${n} termos`
}

/**
 * O sumario da pagina: uma entrada por area de origem, e nao por letra inicial.
 *
 * A tabela de termos NAO esta em ordem alfabetica — ela segue a ordem do material, que agrupa
 * os verbetes por tema (a triade CIA abre a lista, os planos de continuidade andam juntos). Um
 * indice por letra mandaria "S" para o primeiro verbete do arquivo a comecar com S, que e
 * "seguranca da informacao", e nao para "sigilo": seria um indice que engana. A coluna "Area" e
 * a classificacao que o material tem, entao e por ela que se anda.
 *
 * A tabela de siglas nao tem coluna de area; a entrada dela e a propria tabela. O alvo e sempre
 * o primeiro verbete do grupo, para a entrada cair num termo e nao num titulo.
 */
function itensDoSumario(blocos: BlocoDoGlossario[]): ItemDeSumario[] {
  const itens: ItemDeSumario[] = []
  for (const bloco of blocos) {
    if (bloco.tipo === 'material') {
      itens.push(...bloco.cabecalhos)
      continue
    }
    const grupos = new Map<string, Verbete[]>()
    for (const verbete of bloco.verbetes) {
      if (verbete.area === null) continue
      const grupo = grupos.get(verbete.area)
      if (grupo) grupo.push(verbete)
      else grupos.set(verbete.area, [verbete])
    }
    if (!grupos.size) {
      const primeiro = bloco.verbetes[0]
      const titulo = bloco.titulo ?? (bloco.singular === 'termo' ? 'Termos' : 'Siglas')
      if (primeiro) itens.push({ id: primeiro.id, texto: `${titulo} (${bloco.verbetes.length})` })
      continue
    }
    for (const [area, lista] of grupos) {
      const primeiro = lista[0]
      if (!primeiro) continue
      const nome = area ? nomeDaArea(area) : 'Sem área declarada'
      itens.push({ id: primeiro.id, texto: `${nome} (${contagemDeTermos(lista.length)})` })
    }
  }
  return itens
}

/**
 * Uma tabela de verbetes.
 *
 * A primeira celula e o link do proprio termo: e por ele que o endereco de cada verbete fica a
 * mao e viaja junto do texto copiado. O `aria-label` diz o que o clique faz (leva ao endereco
 * daquele termo) e desempata os nomes repetidos entre as duas tabelas — "TLS" e o termo e a
 * sigla. O `id` da linha e o ultimo segmento da rota, que e o que faz o endereco ficar
 * compartilhavel.
 *
 * A excecao e a celula que JA traz um link do material. Dois `<a>` aninhados nao existem em HTML,
 * e desfazer esse no tem dois caminhos, os dois medidos no jsdom: o `innerHTML` que o React usa no
 * `<a>` de fora — o parser de fragmento comeca com a lista de elementos de formatacao VAZIA, e o
 * algoritmo de adocao nao roda — deixa o `<a>` de dentro DENTRO do de fora, e a celula fica com
 * dois links de mesmo texto, com o clique caindo no mais interno (o do material): o endereco do
 * termo perde o clique. E o mesmo markup re-parseado como documento fecha o de fora antes de abrir
 * o de dentro (`<a href="…"></a><a href="…">README</a>`), e ai o endereco do termo fica VAZIO.
 *
 * Nos dois casos o envoltorio nao entra: a celula vai crua, o destino que o material escreveu e o
 * que fica (a tela nao apaga conteudo do material) e o endereco do verbete continua valendo pelo
 * `id` da linha — que e o alvo de `#/pagina/<slug>/<id>` e o que `irParaSecao` foca. O material de
 * hoje nao tem tabela de verbete com link na primeira coluna; a decisao existe para o dia em que
 * tiver.
 */
function Tabela({ tabela, slug }: { tabela: TabelaDeVerbetes; slug: string }): ReactElement | null {
  if (!tabela.verbetes.length) return null
  return (
    // A classe `intro` e a mesma regiao de conteudo que o HTML do material ocupa nesta pagina:
    // e dela que vem o tratamento de tabela do `styles.css` (borda, zebra, cabecalho fixo e os
    // 44 px do link que e o conteudo inteiro da celula).
    <div className="intro">
      {tabela.titulo ? (
        <h2 id={tabela.tituloId ?? undefined} tabIndex={-1}>
          {tabela.titulo}
        </h2>
      ) : null}
      <table>
        <thead>
          <tr>
            {tabela.colunas.map((coluna, i) => (
              <th key={i} scope="col">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabela.verbetes.map((verbete) => (
            <tr className="verbete" id={verbete.id} key={verbete.id} tabIndex={-1}>
              {verbete.celulas.map((celula, i) => {
                if (i !== 0)
                  return <td key={i} dangerouslySetInnerHTML={{ __html: celula.html }} />
                // Celula com link do material: sem envoltorio (dois `<a>` aninhados se desfazem
                // no parse, e o endereco do verbete ficaria vazio). O HTML entra direto no `<td>`,
                // e nao dentro de um `<span>`: o 44 px de alvo de toque do `styles.css` vale para
                // `td > a:only-child`, e um elemento no meio quebraria a regra.
                if (celula.temLink)
                  return <td key={i} dangerouslySetInnerHTML={{ __html: celula.html }} />
                return (
                  <td key={i}>
                    <a
                      href={`#/pagina/${slug}/${verbete.id}`}
                      aria-label={`${ROTULO_DO_LINK[tabela.singular]} ${verbete.termo}`}
                      dangerouslySetInnerHTML={{ __html: celula.html }}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Glossario({ estrutura, escuro }: { estrutura: GlossarioLido; escuro: boolean }) {
  const [busca, setBusca] = useState('')
  const idBusca = useId()
  const palavras = semAcento(busca).split(' ').filter(Boolean)
  const blocos = filtrar(estrutura.blocos, palavras)
  const total = contarVerbetes(estrutura.blocos)
  const achados = contarVerbetes(blocos)
  const itens = itensDoSumario(blocos)
  /**
   * Ha filtro quando ha PALAVRA, e nao quando ha texto no campo: so espaco e o campo
   * "preenchido" sem consulta nenhuma. Com `busca` como regua, a tela se partia em duas — o
   * botao de limpar dizia "filtro ativo" enquanto a contagem anunciava o total, e o leitor de
   * tela ouvia a contradicao. Uma regua so (`palavras`) mantem as duas metades de acordo.
   */
  const filtrando = palavras.length > 0
  const vazio = filtrando && achados === 0

  return (
    <>
      {/* Sem item nao ha sumario: um quadro vazio no topo da pagina nao diz nada. */}
      {itens.length ? <Sumario itens={itens} /> : null}

      <div className="busca-glossario">
        <label htmlFor={idBusca}>Buscar termo</label>
        <input
          id={idBusca}
          type="search"
          value={busca}
          autoComplete="off"
          onChange={(evento) => setBusca(evento.target.value)}
        />
        {filtrando ? (
          <button type="button" className="botao-secundario" onClick={() => setBusca('')}>
            Limpar busca
          </button>
        ) : null}
        {/* `role="status"` e o canal de `aria-live` que o app ja usa (progresso, veredito):
            a contagem muda a cada tecla, e sem isto quem usa leitor de tela nao sabe se a
            lista encolheu, cresceu ou ficou vazia. */}
        <p className={vazio ? 'busca-contagem busca-vazia' : 'busca-contagem'} role="status">
          {!filtrando
            ? `${total} termos e siglas`
            : vazio
              ? `Nenhum termo bate com “${busca.trim()}”. O acento e a maiúscula não mudam a busca.`
              : `${achados} de ${total} termos e siglas`}
        </p>
      </div>

      {blocos.map((bloco) =>
        bloco.tipo === 'material' ? (
          // Key com o tema: ao trocar claro/escuro o React remonta o trecho, reinjeta o HTML
          // original e o Mermaid volta a ter material para desenhar (mesma razao das secoes).
          <Html key={`${bloco.chave}-${escuro}`} className="intro" html={bloco.html} />
        ) : (
          <Tabela key={bloco.chave} tabela={bloco} slug={estrutura.slug} />
        ),
      )}
    </>
  )
}
