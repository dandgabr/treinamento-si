// O que as trilhas trazem de estruturado, lido no build a partir do HTML do proprio material.
//
// Duas coisas das trilhas hoje so existem como texto na tela: o pre-teste diagnostico (dez itens
// com "Acertei: sim/nao" e a tabela que liga acertos a ponto de entrada) e a tabela de fases com
// os marcos de saida. As duas sao do material, e nenhuma palavra delas e escrita aqui — o que
// esta camada faz e ler a tabela que o `build:content` ja gerou, do mesmo jeito que
// `revisao-espacada.ts` le a secao 11 dos temas.
//
// A extracao NAO toca em `conteudo/`: ela roda depois do parse, sobre o HTML, e e por isso que
// ela consegue aproveitar os links ja resolvidos para rota do app (`#/area/00-guia-basico`) —
// essa informacao nao existe mais no Markdown cru.
//
// A regiao do diagnostico sai do HTML da secao que a continha, porque ela vira bloco interativo:
// manter as duas versoes na tela mostraria os mesmos dez itens duas vezes, um deles sem clique.
// Titulo, abertura e nota em volta das tabelas ficam guardados com o bloco, na ordem do material.

import type {
  DiagnosticoDaTrilha,
  FaixaDoDiagnostico,
  FaseDaTrilha,
  ItemDoDiagnostico,
  Pagina,
  Secao,
  Trilha,
} from '../domain/types'
import { textoDaCelula } from './revisao-espacada'

/** Cabecalho e celulas com a marcacao ainda no lugar — o link da coluna "Area" mora nela. */
interface TabelaCrua {
  /** Onde o `<table>` comeca, no HTML de onde ela veio. */
  inicio: number
  /** Onde ele termina (indice logo depois de `</table>`). */
  fim: number
  cabecalho: string[]
  linhas: string[][]
}

const RE_TABELA = /<table\b[^>]*>[\s\S]*?<\/table>/gi
const RE_LINHA = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
const RE_CELULA = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi
const RE_H3 = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi
const RE_LINK_DE_AREA = /href="#\/area\/([^"#]+)"/gi
/** Codigo de area (`00`, `01`, ..., `17`) solto no texto: nem `TEMA-01` nem `1.1` casam. */
const RE_CODIGO_DE_AREA = /(?<![\w-])(\d{2})(?![\w-])/g

/**
 * Comparacao de cabecalho e de titulo: sem acento, sem maiuscula e sem espaco nas pontas. As
 * tabelas do material escrevem "Areas (ordem_estudo)", "Pre-requisito tecnico" e "Marco de
 * saida"; comparar com acento tornaria a leitura refem de uma revisao de texto.
 */
function chave(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** As tabelas de um HTML, com a posicao de cada uma e as celulas ainda com marcacao. */
export function tabelasCruas(html: string): TabelaCrua[] {
  return [...html.matchAll(RE_TABELA)].flatMap((casado) => {
    const inicio = casado.index ?? 0
    const linhas = [...casado[0].matchAll(RE_LINHA)].map((linha) =>
      [...(linha[1] ?? '').matchAll(RE_CELULA)].map((celula) => celula[1] ?? ''),
    )
    const [cabecalho, ...resto] = linhas
    if (!cabecalho?.length) return []
    const uteis = resto.filter((l) => l.length === cabecalho.length)
    if (!uteis.length) return []
    return [{ inicio, fim: inicio + casado[0].length, cabecalho, linhas: uteis }]
  })
}

/** Indice da coluna pelo cabecalho, na tabela crua. -1 quando o material nao tem a coluna. */
function coluna(tabela: TabelaCrua, casar: (cabecalho: string) => boolean): number {
  return tabela.cabecalho.findIndex((c) => casar(chave(textoDaCelula(c))))
}

/** O numero da linha, lido da coluna "#" do material. Sem ela, vale a posicao. */
function numeroDaLinha(tabela: TabelaCrua, linha: string[], indice: number): string {
  const i = coluna(tabela, (c) => c === '#')
  const bruto = i >= 0 ? textoDaCelula(linha[i] ?? '') : ''
  return bruto || String(indice + 1)
}

/**
 * "0 a 3" vira 0 e 3. O rotulo e do material: o separador e aceito nas formas que ele usa, e
 * qualquer outro rotulo devolve `null` em vez de um limite inventado.
 */
export function limitesDoRotulo(rotulo: string): { de: number; ate: number } | null {
  const casado = /^(\d+)\s*(?:a|à|-|–|—)\s*(\d+)$/i.exec(rotulo.trim())
  if (!casado) return null
  const de = Number(casado[1])
  const ate = Number(casado[2])
  if (!Number.isInteger(de) || !Number.isInteger(ate) || ate < de) return null
  return { de, ate }
}

/**
 * As areas que uma celula da coluna "Areas (ordem_estudo)" lista.
 *
 * Tres formas, as tres do material: o link para a area (`#/area/00-guia-basico`, usado no plano de
 * 90 dias), o codigo solto ("00, 01, 17", usado nos planos de 12 e 24 meses) e a palavra "todas",
 * das duas fases de segunda passagem. A ordem e a de aparicao na celula, que e a ordem de estudo.
 * Celula que nao nomeia area nenhuma (o Bloco F do plano de 24 meses: "revisao dirigida pelas
 * areas da credencial escolhida") devolve lista vazia — a trilha nao liga aquela fase a area, e
 * inventar a ligacao seria escrever o que o material nao escreveu.
 */
export function areasDaCelula(celula: string, areasDoConteudo: readonly string[]): string[] {
  const texto = textoDaCelula(celula)
  // "todas" vale pelas areas do conteudo, na ordem de estudo: e o que o consumidor do marco le
  // (`marcoDaFase` percorre `fase.areas`), entao a expansao mora aqui e nao vira flag a parte.
  if (chave(texto) === 'todas') return [...areasDoConteudo]
  const achadas: string[] = []
  for (const casado of celula.matchAll(RE_LINK_DE_AREA)) {
    const id = casado[1]
    if (id && areasDoConteudo.includes(id)) achadas.push(id)
  }
  for (const casado of texto.matchAll(RE_CODIGO_DE_AREA)) {
    const codigo = casado[1]
    const area = areasDoConteudo.find((a) => a.startsWith(`${codigo}-`))
    if (area) achadas.push(area)
  }
  return [...new Set(achadas)]
}

/** O h3 do diagnostico: o titulo e do material, e e por ele que a regiao e localizada. */
interface H3 {
  inicio: number
  fim: number
  texto: string
}

function h3s(html: string): H3[] {
  return [...html.matchAll(RE_H3)].map((casado) => {
    const inicio = casado.index ?? 0
    return { inicio, fim: inicio + casado[0].length, texto: textoDaCelula(casado[1] ?? '') }
  })
}

/**
 * O pre-teste diagnostico de uma secao, mais a secao sem ele.
 *
 * Devolve `null` quando a secao nao tem o bloco: sem o h3 do diagnostico ou sem a tabela dos
 * itens (a coluna "Origem do item" e o texto que o estudante le, e sem ela nao ha item nenhum).
 * A tabela das faixas pode faltar — o bloco continua valendo com os dez itens e sem ponto de
 * entrada, em vez de sumir inteiro por causa da segunda tabela.
 */
export function lerDiagnostico(secao: Secao): {
  diagnostico: DiagnosticoDaTrilha
  html: string
} | null {
  const titulo = h3s(secao.html).find((h) => chave(h.texto).includes('pre-teste diagnostico'))
  if (!titulo) return null
  const depois = tabelasCruas(secao.html).filter((t) => t.inicio >= titulo.fim)
  const dosItens = depois.find((t) => coluna(t, (c) => c === 'origem do item') >= 0)
  if (!dosItens) return null
  const dasFaixas = depois.find(
    (t) => coluna(t, (c) => c === 'ponto de entrada') >= 0 && coluna(t, (c) => c.includes('acerto')) >= 0,
  )

  const iOrigem = coluna(dosItens, (c) => c === 'origem do item')
  const itens: ItemDoDiagnostico[] = dosItens.linhas.flatMap((linha, i) => {
    const origemHtml = (linha[iOrigem] ?? '').trim()
    if (!origemHtml) return []
    return [{ numero: numeroDaLinha(dosItens, linha, i), origemHtml }]
  })
  if (!itens.length) return null

  const iRotulo = dasFaixas ? coluna(dasFaixas, (c) => c.includes('acerto')) : -1
  const iPonto = dasFaixas ? coluna(dasFaixas, (c) => c === 'ponto de entrada') : -1
  const faixas: FaixaDoDiagnostico[] = (dasFaixas?.linhas ?? []).flatMap((linha) => {
    const rotulo = textoDaCelula(linha[iRotulo] ?? '')
    const limites = limitesDoRotulo(rotulo)
    const pontoDeEntrada = textoDaCelula(linha[iPonto] ?? '')
    if (!limites || !pontoDeEntrada) return []
    return [{ rotulo, ...limites, pontoDeEntrada }]
  })
  const cabecalhoDasFaixas = (dasFaixas?.cabecalho ?? []).map(textoDaCelula)

  const fim = Math.max(dosItens.fim, dasFaixas?.fim ?? 0)
  // A secao perde a regiao inteira, do h3 ao fim do que ele escreve: o bloco interativo a
  // recoloca no mesmo lugar, com o titulo, a abertura, as tabelas e a nota na ordem do material.
  // Nada do que vem depois das tabelas e descartado — vai para `notaHtml` e continua na tela.
  const html = secao.html.slice(0, titulo.inicio)
  return {
    diagnostico: {
      secao: secao.numero,
      titulo: titulo.texto,
      introHtml: secao.html.slice(titulo.fim, dosItens.inicio).trim(),
      itens,
      cabecalhoDasFaixas,
      faixas,
      notaHtml: secao.html.slice(fim).trim(),
    },
    html,
  }
}

/**
 * A tabela de fases da trilha: a que tem, no cabecalho, o rotulo da fase, a coluna de areas e o
 * "Marco de saida". As tres colunas juntas sao o que separa essa tabela das outras do mesmo
 * documento — a de sequencia por fase (secao 3.1) tambem tem "Fase" e "area", e so nao tem o
 * marco; a da carga (secao 2.1) tem "Area" e nenhum dos outros dois.
 *
 * A primeira que casar vale. Nao casar nenhuma nao e erro: a trilha continua legivel como
 * pagina, so sem checklist.
 */
export function tabelaDasFases(secoes: readonly Secao[]): TabelaCrua | null {
  for (const secao of secoes) {
    for (const tabela of tabelasCruas(secao.html)) {
      const temRotulo = coluna(tabela, (c) => /^(fase|bloco)\b/.test(c)) >= 0
      const temAreas = coluna(tabela, (c) => c.includes('area')) >= 0
      const temMarco = coluna(tabela, (c) => c.includes('marco de saida')) >= 0
      if (temRotulo && temAreas && temMarco) return tabela
    }
  }
  return null
}

/**
 * O periodo da fase ("1 a 6", "4 a 6"): a coluna que o material nomeia por semanas ou meses.
 * O texto e do material, entao vale a coluna casada e nao a posicao dela.
 */
function periodoDaLinha(tabela: TabelaCrua, linha: string[]): string {
  const i = coluna(tabela, (c) => c.startsWith('semana') || c.startsWith('mes'))
  return i >= 0 ? textoDaCelula(linha[i] ?? '') : ''
}

function fasesDaTabela(tabela: TabelaCrua, areasDoConteudo: readonly string[]): FaseDaTrilha[] {
  const iRotulo = coluna(tabela, (c) => /^(fase|bloco)\b/.test(c))
  const iAreas = coluna(tabela, (c) => c.includes('area'))
  const iMarco = coluna(tabela, (c) => c.includes('marco de saida'))
  return tabela.linhas.flatMap((linha) => {
    const rotulo = textoDaCelula(linha[iRotulo] ?? '')
    if (!rotulo) return []
    const celulaDasAreas = iAreas >= 0 ? (linha[iAreas] ?? '') : ''
    return [
      {
        rotulo,
        periodo: periodoDaLinha(tabela, linha),
        // "todas" expande para as areas do conteudo aqui dentro: a fase de segunda passagem
        // revisa o marco de todas elas, e quem le o marco percorre `areas`.
        areas: areasDaCelula(celulaDasAreas, areasDoConteudo),
        marco: iMarco >= 0 ? textoDaCelula(linha[iMarco] ?? '') : '',
      },
    ]
  })
}

/** As secoes da pagina, com a regiao do diagnostico retirada e o resto intacto. */
export interface TrilhaExtraida {
  trilha: Trilha
  secoes: Secao[]
}

/**
 * Le o que a trilha traz de estruturado. Devolve `null` para qualquer outra pagina — as 22 do
 * conteudo passam por aqui, e so as tres trilhas tem diagnostico ou fases.
 *
 * `areasDoConteudo` sao os ids das areas que existem (na ordem de estudo), usados para resolver
 * a coluna "Areas (ordem_estudo)" e a palavra "todas".
 */
export function extrairTrilha(
  pagina: Pagina,
  areasDoConteudo: readonly string[],
): TrilhaExtraida | null {
  const secoes: Secao[] = []
  let diagnostico: DiagnosticoDaTrilha | null = null
  for (const secao of pagina.secoes) {
    const lido = lerDiagnostico(secao)
    if (lido && !diagnostico) diagnostico = lido.diagnostico
    secoes.push(lido ? { ...secao, html: lido.html } : secao)
  }
  const tabela = tabelaDasFases(pagina.secoes)
  const fases = tabela ? fasesDaTabela(tabela, areasDoConteudo) : []
  if (!diagnostico && !fases.length) return null
  return { trilha: { diagnostico, fases }, secoes }
}
