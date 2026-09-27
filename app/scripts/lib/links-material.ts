// Links do material -> rotas do app.
//
// O material escreve caminho de arquivo (`TEMA-02-triade-cia.md`,
// `../01-fundamentos/README.md`), e isso e decisao editorial: quem le no GitHub ou no disco nao
// pode perder a referencia cruzada. O app serve UM arquivo por `file://`, onde caminho relativo
// nao existe — entao a troca acontece aqui, na GERACAO do content.json, uma vez, e o portao
// confere o resultado. O app nao carrega a regra.
//
// O mapa e derivado do mesmo material que o parser le: `caminho relativo -> rota do app`. O
// caminho do link e normalizado contra a pasta do documento de origem, entao
// `TEMA-02-triade-cia.md` e `../00-guia-basico/TEMA-02-triade-cia.md` dao a MESMA rota.
//
// Este modulo nao conhece `fs`: ele recebe o material ja lido (`MaterialDoDisco`) e trabalha
// sobre caminhos relativos a raiz do material, sempre com "/" — inclusive no Windows, onde
// `path.sep` nao vale para o texto que vem do Markdown.

import matter from 'gray-matter'
import { ancorasDeSecao, type DestinoDeLink, type ResolverDeLink } from './markdown'

/** Separador do fragmento de ancora na rota do app (`#/area/01-fundamentos/secao-4`). */
export function idDaSecao(numero: number): string {
  return `secao-${numero}`
}

/**
 * Caminhos que o material linka e que NAO viram rota.
 *
 * E a lista inteira do que o material cita e o app nao tem onde abrir — oito fichas de autoria
 * em `templates/` e o proprio `CONTRIBUTING.md`, nada disso e leitura de quem estuda. Cada
 * entrada precisa continuar sendo linkada: o portao reprova declaracao morta, senao a lista vira
 * deposito. O que o app TEM tela nao entra aqui, mesmo quando o destino e uma pagina de QA do
 * mantenedor (`99-fontes/`): la existe rota, e declarar seria esconder uma tela que existe.
 *
 * O que acontece com um link declarado: o texto fica e a marca de link sai. Um `href` relativo
 * nao abre em lugar nenhum fora do disco do repositorio — manter o `<a>` seria manter o defeito
 * que esta fase veio remover, e a referencia continua legivel na frase, porque e o texto do link
 * que nomeia o arquivo. Um link declarado com rotulo que nao nomeia o destino reprova: sem href,
 * o leitor perderia para onde a referencia aponta.
 */
export interface Declaracao {
  /** Caminho relativo a raiz do material (pasta sem barra final). */
  caminho: string
  /** Por que este caminho nao tem tela no app. */
  motivo: string
}

export const DECLARADOS_SEM_ROTA: readonly Declaracao[] = [
  {
    caminho: 'CONTRIBUTING.md',
    motivo: 'regra de autoria do material; nao e leitura de quem estuda',
  },
  {
    caminho: 'templates',
    motivo: 'pasta de fichas de autoria (FRONTMATTER, TEMPLATE-*), citada como pasta',
  },
  {
    caminho: 'templates/RELACOES-TEMAS.md',
    motivo: 'formato do bloco de relacoes, citado em 129 pontos do material',
  },
  {
    caminho: 'templates/INDICE-TEMAS.md',
    motivo: 'numeracao canonica dos temas, citada por quem confere a sequencia',
  },
]

// ------------------------------------------------------------------ o material ja lido

/** Uma area do material: o guia (`README.md`) e os arquivos `TEMA-*.md`. */
export interface AreaDoDisco {
  areaId: string
  /** Texto do `README.md` da area. */
  guia: string
  temas: readonly { caminho: string; texto: string }[]
}

/** Uma pagina do material: `README.md` da raiz, glossario, mapa de relacoes e os catalogos. */
export interface PaginaDoDisco {
  /** Caminho sem `.md`, que e o slug da pagina no app. */
  slug: string
  caminho: string
  grupo: string
  texto: string
}

/**
 * O material lido do disco, uma vez so: a mesma leitura alimenta o mapa de rotas e o parse.
 * `diretorios` e `arquivos` sao TUDO o que existe no material, e nao so o que vira tela — e o
 * que permite acusar um link para arquivo que nao existe.
 */
export interface MaterialDoDisco {
  diretorios: readonly string[]
  arquivos: readonly string[]
  areas: readonly AreaDoDisco[]
  paginas: readonly PaginaDoDisco[]
}

// ------------------------------------------------------------------ o mapa

export interface MapaDoMaterial {
  /** Caminho relativo -> rota do app. Inclui a pasta que tem `README.md` (`../91-trilhas/`). */
  rotas: Map<string, string>
  /** Caminho relativo -> (ancora do material -> numeros de secao que ela alcanca). */
  ancoras: Map<string, Map<string, number[]>>
  /** Tudo o que existe no material: pastas e arquivos `.md`. */
  existentes: Set<string>
}

const declarado = new Set(DECLARADOS_SEM_ROTA.map((d) => d.caminho))

export function ehDeclarado(caminho: string): boolean {
  return declarado.has(caminho)
}

/**
 * Monta `caminho -> rota` a partir do material lido.
 *
 * A rota de cada documento ja existe no modelo de conteudo e a mesma que a tela usa: o guia da
 * area e `#/area/<areaId>`; o tema e `#/tema/<areaId>/<temaId>`, com o `tema_id` do frontmatter
 * (e nao o nome do arquivo: o arquivo e o dono do texto, o frontmatter e o dono do id); qualquer
 * outro documento do modelo e `#/pagina/<slug>`, com o slug que o proprio gerador grava.
 *
 * Uma pasta que tem `README.md` herda a rota dele: `[91-trilhas/](../91-trilhas/)` e o jeito
 * como o material cita a pasta, e o destino real e o guia de dentro dela.
 */
export function montarMapa(material: MaterialDoDisco): MapaDoMaterial {
  const rotas = new Map<string, string>()
  const ancoras = new Map<string, Map<string, number[]>>()
  const existentes = new Set<string>([...material.diretorios, ...material.arquivos])

  for (const area of material.areas) {
    const guia = `${area.areaId}/README.md`
    rotas.set(guia, `#/area/${area.areaId}`)
    ancoras.set(guia, ancorasDeSecao(area.guia))
    for (const tema of area.temas) {
      // Sem `tema_id` legivel nao ha rota: o tema fica sem destino e o portao reprova o link que
      // apontar para ele — melhor do que inventar `#/tema/<area>/<nome-do-arquivo>` e mandar o
      // leitor para "tema nao encontrado".
      const temaId = String(matter(tema.texto).data.tema_id ?? '')
      if (temaId) {
        rotas.set(tema.caminho, `#/tema/${area.areaId}/${temaId}`)
        ancoras.set(tema.caminho, ancorasDeSecao(tema.texto))
      }
    }
  }
  for (const pagina of material.paginas) {
    rotas.set(pagina.caminho, `#/pagina/${pagina.slug}`)
  }
  for (const diretorio of material.diretorios) {
    const rota = rotas.get(`${diretorio}/README.md`)
    if (rota) rotas.set(diretorio, rota)
  }

  return { rotas, ancoras, existentes }
}

// ------------------------------------------------------------------ resolucao do link

export interface RelatorioDeLinks {
  /** Links que viraram rota do app. */
  paraRota: number
  /** Links declarados: o texto fica, a marca de link sai. */
  comoTexto: number
  /** Links externos (`http(s)`, `mailto:`) e para fora do material: nao mudam. */
  intactos: number
  /** Caminho declarado -> quantos links apontaram para ele. */
  declaradosUsados: Map<string, number>
  /** Defeitos do material, na ordem em que aparecem. */
  erros: string[]
}

export function novoRelatorio(): RelatorioDeLinks {
  return { paraRota: 0, comoTexto: 0, intactos: 0, declaradosUsados: new Map(), erros: [] }
}

/**
 * Monta o resolvedor de um documento.
 *
 * O caminho relativo e resolvido contra a pasta do documento de origem e so depois comparado com
 * o mapa: e o que faz duas grafias do mesmo alvo darem a mesma rota. Onde nao ha resolucao, o
 * link fica como o material escreveu e o defeito entra no relatorio — o portao reprova o href
 * relativo que sobrar no HTML, entao nada passa em silencio.
 */
export function resolverDeLinks(
  mapa: MapaDoMaterial,
  origem: string,
  relatorio: RelatorioDeLinks,
): ResolverDeLink {
  return (href: string, texto: string): DestinoDeLink => {
    const corte = href.indexOf('#')
    const caminhoBruto = corte >= 0 ? href.slice(0, corte) : href
    const ancoraBruta = corte >= 0 ? href.slice(corte + 1) : ''

    // Ancora pura (`#secao-3`), absoluto (`/x.md`) e externo (`https://`, `mailto:`): o material
    // nao usa os dois primeiros, e o terceiro e decisao de quem escreve — nao passam por aqui.
    if (!caminhoBruto || caminhoBruto.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(caminhoBruto)) {
      relatorio.intactos++
      return { acao: 'manter' }
    }

    const caminho = resolverCaminho(origem, decodificar(caminhoBruto).replace(/\/+$/, ''))
    if (caminho === null) {
      // Sai da raiz do material: nao ha rota possivel, e o app nao alcanca o arquivo de fora.
      relatorio.intactos++
      return { acao: 'manter' }
    }

    const rota = mapa.rotas.get(caminho)
    if (rota) {
      if (!ancoraBruta) {
        relatorio.paraRota++
        return { acao: 'trocar', href: rota }
      }
      return comAncora(mapa, origem, href, caminho, rota, ancoraBruta, relatorio)
    }

    if (ehDeclarado(caminho)) {
      // Sem href, o que sobra e o texto do link: e por ele que o leitor sabe para onde a
      // referencia apontava. No material de hoje todos os links declarados ja escrevem o caminho
      // no texto (`[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md)`); um rotulo
      // novo ("a ficha de relacoes") perderia o destino no app, e por isso reprova em vez de
      // passar despercebido.
      const arquivo = caminho.slice(caminho.lastIndexOf('/') + 1)
      if (!texto.includes(arquivo)) {
        relatorio.erros.push(
          `${origem}: o link "${href}" aponta para "${caminho}", que nao tem rota, e o texto ` +
            `"${texto}" nao nomeia o arquivo — sem href, o leitor do app perderia o destino; ` +
            `escreva o caminho no texto do link`,
        )
        return { acao: 'manter' }
      }
      relatorio.comoTexto++
      relatorio.declaradosUsados.set(caminho, (relatorio.declaradosUsados.get(caminho) ?? 0) + 1)
      return { acao: 'texto' }
    }

    if (!mapa.existentes.has(caminho)) {
      relatorio.erros.push(
        `${origem}: o link "${href}" aponta para "${caminho}", que nao existe no material`,
      )
    } else {
      relatorio.erros.push(
        `${origem}: o link "${href}" aponta para "${caminho}", que nao tem rota no app e nao esta ` +
          `declarado em DECLARADOS_SEM_ROTA (link de material que nasceu novo ou alvo que saiu do modelo)`,
      )
    }
    return { acao: 'manter' }
  }
}

/**
 * A ancora do material vira a secao do app.
 *
 * O material escreve `README.md#4-temas` (o slug do cabecalho, como o GitHub o monta); o app
 * endereca secao por `idDaSecao(numero)` — `secao-4` em `Blocos.tsx`. Como o fragmento da URL
 * pertence a ROTA (`#/area/<areaId>`), a ancora viaja como ultimo segmento dela:
 * `#/area/01-fundamentos/secao-4`. E a gramatica que `useRota.analisar` e o `hrefsInvalidos` do
 * smoke ja aceitam — os dois leem os dois primeiros segmentos e ignoram o resto. Um `#` a mais
 * nao serve: ele nao e delimitador de segmento, e `#/area/x#secao-4` viraria areaId
 * `x#secao-4`, ou seja, "area nao encontrada".
 *
 * Pagina (`glossario`, `mapa-relacoes`, catalogos) nao entra: elas nao expoem secao numerada, e
 * uma ancora para la nao tem destino — reprova em vez de prometer o que a tela nao faz.
 */
function comAncora(
  mapa: MapaDoMaterial,
  origem: string,
  href: string,
  caminho: string,
  rota: string,
  ancoraBruta: string,
  relatorio: RelatorioDeLinks,
): DestinoDeLink {
  const ancora = decodificar(ancoraBruta)
  const numeros = mapa.ancoras.get(caminho)?.get(ancora)
  const erro = (motivo: string): DestinoDeLink => {
    relatorio.erros.push(`${origem}: o link "${href}" ${motivo}`)
    return { acao: 'manter' }
  }
  if (!numeros || numeros.length === 0) {
    if (!mapa.ancoras.has(caminho)) {
      return erro(`ancora "#${ancora}", mas "${caminho}" nao tem secao numerada para receber o leitor`)
    }
    return erro(`ancora "#${ancora}", que nao e o slug de nenhuma secao de "${caminho}" (o cabecalho mudou de nome ou de numero?)`)
  }
  if (numeros.length > 1) {
    return erro(`ancora "#${ancora}", que alcanca as secoes ${numeros.join(' e ')} de "${caminho}"`)
  }
  const numero = numeros[0] ?? 0
  relatorio.paraRota++
  return { acao: 'trocar', href: `${rota}/${idDaSecao(numero)}` }
}

/**
 * Resolve `alvo` contra a pasta de `origem`, os dois relativos a raiz do material.
 * Devolve `null` quando o caminho sai do material — nao ha rota para fora dele.
 */
export function resolverCaminho(origem: string, alvo: string): string | null {
  const corte = origem.lastIndexOf('/')
  const partes = corte >= 0 ? origem.slice(0, corte).split('/') : []
  for (const segmento of alvo.split('/')) {
    if (segmento === '' || segmento === '.') continue
    if (segmento === '..') {
      if (!partes.length) return null
      partes.pop()
      continue
    }
    partes.push(segmento)
  }
  return partes.join('/')
}

/** `decodeURIComponent` com recuo para o texto cru: um `%` solto nao pode derrubar o build. */
function decodificar(texto: string): string {
  try {
    return decodeURIComponent(texto)
  } catch {
    return texto
  }
}

/** Declaracoes que ninguem mais linka: a lista nao pode virar deposito. */
export function declaracoesMortas(relatorio: RelatorioDeLinks): string[] {
  return DECLARADOS_SEM_ROTA.filter((d) => !relatorio.declaradosUsados.has(d.caminho)).map(
    (d) => `declaracao sem uso em DECLARADOS_SEM_ROTA: "${d.caminho}" — nenhum link do material aponta para la (${d.motivo})`,
  )
}

// ------------------------------------------------------------------ conferencia do HTML

const RE_HREF = /href="([^"]*)"/g

/**
 * Hrefs relativos que sobraram no HTML gerado.
 *
 * Um `href` relativo so abre no disco de quem clonou o repositorio: no arquivo unico (`file://`)
 * e no app empacotado ele nao leva a lugar nenhum. Depois da troca nao deve sobrar nenhum, e o
 * portao cobra isso do HTML — e nao do mapa, que ja disse o que pretendia fazer.
 */
export function hrefsRelativos(html: string): string[] {
  const achados: string[] = []
  for (const match of html.matchAll(RE_HREF)) {
    const href = match[1] ?? ''
    if (!href || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue
    achados.push(href)
  }
  return achados
}
