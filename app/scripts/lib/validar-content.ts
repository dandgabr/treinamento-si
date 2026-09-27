// Gate de qualidade do conteudo extraido. Espelha as invariantes estruturais de
// "conteudo/scripts/verificar-repo.py" sobre o content.json, e acrescenta a validacao
// de forma dos campos que a interface de fato le — o gate antigo conferia `fontes` e
// `relacoes` (que a UI nao usa) e deixava passar um titulo vazio.

import { interpretarCriterio } from '../../src/domain/criterio'
import { SEQUENCIA_DIAS } from '../../src/domain/srs'
import type { Area, Conteudo, Fonte, Guia, Pagina, Secao, Tabela, Tema } from '../../src/domain/types'
import { lerContratoMermaid } from './contrato-mermaid'
import { htmlsDaPagina, htmlsDoGuia, htmlsDoTema } from './htmls-do-conteudo'
import { hrefsDeFragmento, hrefsRelativos } from './links-material'
import { ehHrefDeRota, rotasDoConteudo, type RotasDoApp } from './rotas-app.mjs'

/** Sequencia que o escalonador do app implementa hoje. */
const SEQUENCIA_PADRAO: readonly number[] = SEQUENCIA_DIAS

export const TOTAL_AREAS = 18
export const TOTAL_TEMAS = 109
/** Paginas do curso: glossario, mapa de relacoes e os 20 arquivos de 99-fontes. */
export const TOTAL_PAGINAS = 22

// Mesmo lexico de "conteudo/scripts/verificar-repo.py" (secao 5 do CONTRIBUTING).
export const LEXICO = [
  'mergulhe',
  'robusto',
  'abrangente',
  'no mundo atual',
  'cada vez mais',
  'vale destacar',
  'é importante ressaltar',
  'jornada de aprendizado',
  'jornada de transformação',
  'jornada de conhecimento',
  'no cenário atual',
  'não é apenas',
]

const NIVEIS = new Set(['base', 'intermediario', 'avancado'])

/** Grupos que hoje existem em `paginas`. Um grupo novo tem de entrar aqui de proposito. */
const GRUPOS_DE_PAGINA = new Set(['home', 'referencia', '90-certificacoes', '91-trilhas', '99-fontes'])

// (A lista de caracteres proibidos em rotulo Mermaid nao mora aqui: ela e o contrato da secao 7
// do CONTRIBUTING, lido por `./contrato-mermaid`. `&` nunca esteve proibido — `ATT&CK` e rotulo
// legitimo, e o material o usa.)

/** Formato de data ISO com hora, o que `geradoEm` promete ser. */
const RE_DATA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/

const MARCA_ANCORAGEM = 'Por que isso importa'
const MARCA_RECUPERACAO = 'Recuperação ativa'
const MARCA_FONTES = 'Fontes verificadas'

function semTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

function texto(partes: string[]): string {
  return partes.map(semTags).join(' ')
}

function checarLexico(onde: string, alvo: string, erros: string[]): void {
  for (const termo of LEXICO) {
    // Limite de palavra com lookaround Unicode: `\b` nao funciona com "é", e sem
    // isso "é importante ressaltar" nunca casaria e o termo seria letra morta.
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapado}(?![\\p{L}\\p{N}])`, 'iu')
    if (re.test(alvo)) erros.push(`${onde}: lexico proibido (${JSON.stringify(termo)})`)
  }
}

function checarSecoes(onde: string, secoes: Secao[], erros: string[], exigirUma: boolean): void {
  if (exigirUma && secoes.length < 1) erros.push(`${onde}: sem secoes`)
  const vistos = new Set<number>()
  for (const s of secoes) {
    if (!Number.isFinite(s.numero)) erros.push(`${onde}: secao com numero invalido`)
    // Dois documentos com a mesma numeracao quebram a ancora `#secao-N` e o sumario.
    if (vistos.has(s.numero)) erros.push(`${onde}: numero de secao repetido (${s.numero})`)
    vistos.add(s.numero)
    if (!s.titulo) erros.push(`${onde}: secao ${s.numero} sem titulo`)
    if (typeof s.html !== 'string' || !s.html.trim()) {
      erros.push(`${onde}: secao ${s.numero} sem html`)
    }
  }
}

/**
 * Espelha `checa_mermaid` do verificador do material, lendo as mesmas regras do mesmo lugar que
 * ele: o contrato da secao 7 do CONTRIBUTING. Um rotulo com `<` ou `#` faz o Mermaid interpretar
 * HTML e comer pedaco do texto, e o defeito so aparece na tela.
 */
function checarMermaid(onde: string, diagramas: string[], erros: string[]): void {
  const proibidos = lerContratoMermaid().rotulos_proibidos
  for (const diagrama of diagramas ?? []) {
    for (const rotulo of diagrama.match(/\[[^\]\n]*\]/g) ?? []) {
      for (const proibido of proibidos) {
        if (rotulo.includes(proibido)) {
          erros.push(`${onde}: rotulo Mermaid com caractere proibido (${proibido}) em ${rotulo}`)
        }
      }
    }
  }
}

/** Entidades que o HTML serializado usa no texto de um bloco: `&lt;` esconde o `<` do rotulo. */
const ENTIDADES = new Map([
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&apos;', "'"],
  ['&amp;', '&'],
])

function desescaparHtml(texto: string): string {
  return texto.replace(/&(?:lt|gt|quot|#39|apos|amp);/g, (entidade) => ENTIDADES.get(entidade) ?? entidade)
}

/** O conteudo de cada bloco `.mermaid` de um HTML — a MESMA pergunta que `Blocos.temDiagrama` faz. */
function conteudosMermaid(html: string): string[] {
  const achados: string[] = []
  for (const m of html.matchAll(/class="[^"]*\bmermaid\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g)) {
    achados.push(desescaparHtml(m[1] ?? ''))
  }
  return achados
}

/**
 * O contrato do Mermaid tambem alcanca quem o runtime de fato desenha.
 *
 * `checarMermaid` (acima) so ve os blocos que a cerca ```` ```mermaid ```` produziu — a lista
 * `mermaid` do documento. O runtime, porem, seleciona `.mermaid` no HTML (`mermaid.ts`,
 * `querySelectorAll('.mermaid')`): um `<div class="mermaid">graph TD; A[< e #]</div>` escrito em
 * PROSA atende a mesma selecao e nunca passava pela conferencia, embora o diagrama quebrado chegue
 * ao aluno. Aqui o contrato e cobrado do HTML — a fonte que o app de fato le — e o bloco vindo da
 * cerca fica de fora da segunda passada (o texto dele ja foi conferido na lista).
 */
function checarMermaidDoHtml(onde: string, htmls: string[], jaConferidos: string[], erros: string[]): void {
  const vistos = new Set(jaConferidos)
  for (const html of htmls) {
    const ineditos = conteudosMermaid(html).filter((bloco) => !vistos.has(bloco))
    if (ineditos.length) checarMermaid(onde, ineditos, erros)
  }
}

/** Fonte sem titulo nao e rastreavel: o leitor ve a URL sem saber o que vai encontrar. */
function checarFontes(onde: string, fontes: Fonte[], erros: string[]): void {
  for (const f of fontes) {
    if (!f.titulo) erros.push(`${onde}: fonte sem titulo (${f.url || 'sem url'})`)
    // O esquema da URL e a defesa na fronteira: `javascript:` e `data:text/html` num `href` so
    // nao executam porque o React bloqueia, e essa decisao nao pode morar numa biblioteca. A
    // fonte da questao ja era cobrada assim (`validarBanco`); a do tema e da area nao eram, e a
    // URL podia ser publicada intacta no content.json. So a URL declarada entra: campo vazio e
    // "sem url", nao esquema errado.
    if (f.url && !/^https?:\/\//.test(f.url)) {
      erros.push(
        `${onde}: fonte com esquema nao permitido (${f.url.slice(0, 40)}) — a URL vira href na ` +
          `tela: use http(s)`,
      )
    }
  }
}

/** Chave de comparacao de cabecalho: sem acento, sem maiuscula e sem espaco nas pontas. */
function chaveDeColuna(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function colunaDe(tabela: Tabela, chave: string): number {
  return tabela.cabecalho.findIndex((c) => chaveDeColuna(c) === chave)
}

/**
 * As tres tabelas do guia que a TELA le — e que o portao nao conferia.
 *
 * O portao validava o titulo da secao e o html, mas nao o que a tela le delas: `tabelaTemas` (§4),
 * `objetivos` (§2) e `atividades` (§8). Apagar `## 8. Atividades praticas e laboratorios` de um
 * guia deixava `guia.atividades = null`, e `Trilha.tsx` troca o checklist inteiro de artefatos por
 * uma frase — o aluno perde a lista sem que portao nenhum acuse (o smoke compara com o MESMO
 * content.json, entao `0 === 0`). A §4 entra por inteiro porque e a tabela que o aluno le para
 * saber o que vem e quanto custa: tema sem linha nela desaparece do plano, e a regra do tempo
 * (a que compara com `tempo_estimado`) ficaria sem alvo.
 */
function checarTabelasDoGuia(onde: string, g: Guia, temaIds: string[], erros: string[]): void {
  const temas = g.tabelaTemas
  if (!temas) {
    erros.push(
      `${onde}: guia sem a tabela de temas da §4 — e a tabela que o aluno le para saber o que ` +
        `vem e quanto custa cada tema`,
    )
  } else {
    if (!temas.linhas.length) erros.push(`${onde}: tabela de temas da §4 sem linha nenhuma`)
    const iTema = colunaDe(temas, 'tema_id')
    if (iTema < 0) {
      erros.push(`${onde}: tabela da §4 sem a coluna "tema_id" — nao ha como ligar a linha ao tema`)
    } else {
      const listados = new Set(temas.linhas.map((l) => (l[iTema] ?? '').trim()))
      const faltam = temaIds.filter((id) => !listados.has(id))
      if (faltam.length) {
        erros.push(
          `${onde}: tabela da §4 sem linha para ${faltam.join(', ')} — o tema nao aparece no plano ` +
            `que o aluno le`,
        )
      }
    }
  }

  const obrigatorias = [
    ['objetivos', 2, 'objetivo', 'os objetivos de aprendizagem da area'],
    ['atividades', 8, 'atividade', 'o checklist de artefatos da trilha (Trilha.tsx)'],
  ] as const
  for (const [campo, secao, coluna, paraQue] of obrigatorias) {
    const tabela: Tabela | null = campo === 'objetivos' ? g.objetivos : g.atividades
    const rotulo = `§${secao} (${campo})`
    if (!tabela) {
      erros.push(`${onde}: guia sem a tabela da ${rotulo} — ela e ${paraQue}`)
      continue
    }
    if (!tabela.linhas.length) erros.push(`${onde}: tabela da ${rotulo} sem linha nenhuma`)
    if (colunaDe(tabela, coluna) < 0) {
      erros.push(
        `${onde}: tabela da ${rotulo} sem a coluna "${coluna}" — e por ela que a tela le a ` +
          `tabela; sem isso a lista aparece vazia`,
      )
    }
  }
}

/**
 * Nenhum href do HTML gerado pode apontar para lugar nenhum.
 *
 * Um caminho relativo (`TEMA-02-triade-cia.md`, `../01-fundamentos/README.md`) so abre no disco de
 * quem clonou o repositorio; no arquivo unico aberto por `file://` — que e como o app chega a quem
 * estuda — ele nao leva a lugar nenhum. A troca por rota acontece na geracao, uma vez
 * (`links-material.ts`); esta regra cobra o RESULTADO, e nao a intencao: campo de HTML novo que
 * escape da troca, ou um resolvedor que deixe de ser passado, reprova aqui.
 *
 * Link declarado sem rota tambem nao passa: ele vira texto na geracao, e um href relativo so
 * sobrevive se ninguem o resolveu.
 *
 * O fragmento tem a mesma cobranca, por outro motivo: `#4-temas` (a grafia de ancora do GitHub)
 * nao e rota do app, e a tela inteira cai em "Rota nao reconhecida" no primeiro clique. O
 * conjunto de rotas vem do proprio conteudo, e a gramatica e a mesma que o smoke usa
 * (`rotas-app.mjs`).
 *
 * A ancora da PROPRIA pagina e a excecao legitima: `[nota](#nota)` com `<p id="nota">` vira
 * `#material-nota` na geracao (`religarAncorasDoMaterial`, o prefixo que impede um `id` do material
 * de sombrear as ancoras do app) e alcanca o alvo na mesma tela. O que decide nao e o formato do
 * href, e sim o `id` existir no HTML deste documento — era essa a metade que faltava: o portao
 * reprovava o prefixo que a propria geracao injetou, e o caso legitimo nunca construia.
 *
 * O caractere de controle bidirecional entra aqui porque o defeito e do `href`: com U+202E o
 * endereco real fica escondido atras de outro na barra de status.
 */
function checarLinks(onde: string, htmls: string[], rotas: RotasDoApp, erros: string[]): void {
  // Os `id` que este documento expoe, para reconhecer a ancora intra-pagina.
  const ids = new Set<string>()
  for (const html of htmls) {
    for (const m of html.matchAll(/\bid="([^"]*)"/g)) ids.add(m[1] ?? '')
  }
  for (const html of htmls) {
    for (const href of hrefsRelativos(html)) {
      erros.push(
        `${onde}: href relativo no HTML gerado (${href}) — link do material que nao virou rota do app`,
      )
    }
    for (const href of hrefsDeFragmento(html)) {
      if (ehHrefDeRota(href, rotas)) continue
      // `#material-nota` (religado) ou `#nota` (o alvo declarado no documento): o par id/href da
      // propria pagina. O id vem do material e chega aqui com o prefixo da geracao.
      if (ids.has(href.slice(1))) continue
      erros.push(
        `${onde}: href de fragmento que nao e rota do app (${href}) — a tela responde ` +
          `"Rota nao reconhecida"`,
      )
    }
    for (const m of html.matchAll(/href\s*=\s*"([^"]*)"/g)) {
      const controle = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/.exec(m[1] ?? '')
      if (controle) {
        const ponto = (controle[0].codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')
        erros.push(
          `${onde}: href com caractere de controle bidirecional (U+${ponto}) — a barra de status ` +
            `mostraria um endereco e o clique iria para outro`,
        )
      }
    }
  }
}

function validarTema(
  chave: string,
  t: Tema,
  refs: Set<string>,
  rotas: RotasDoApp,
  erros: string[],
): void {
  const onde = chave
  // O progresso e gravado sob `ref`, e a chave do mapa e o `ref`: divergir faz o usuario
  // marcar "acertei" e o painel mostrar zero firmes, sem erro nenhum na tela.
  if (t.ref !== chave) erros.push(`${onde}: ref divergente da chave do mapa (${t.ref})`)
  if (!t.temaId || !chave.endsWith(`#${t.temaId}`)) {
    erros.push(`${onde}: tema_id divergente do ref (${t.temaId})`)
  }
  if (!t.areaId) erros.push(`${onde}: tema sem area_id`)
  if (!t.titulo) erros.push(`${onde}: titulo vazio`)
  if (!NIVEIS.has(t.nivel)) erros.push(`${onde}: nivel invalido (${t.nivel})`)
  if (!t.tempoEstimado) erros.push(`${onde}: tempo_estimado vazio`)
  if (!t.objetivo) erros.push(`${onde}: objetivo de aprendizagem vazio`)

  const marcadores = t.secoes.map((s) => s.titulo).join(' | ')
  for (const [marca, nome] of [
    [MARCA_ANCORAGEM, 'bloco de ancoragem no cargo'],
    [MARCA_RECUPERACAO, 'itens de recuperacao ativa'],
    [MARCA_FONTES, 'rastreabilidade de fonte'],
  ] as const) {
    if (!marcadores.includes(marca)) erros.push(`${onde}: falta ${nome} (${JSON.stringify(marca)})`)
  }

  checarSecoes(onde, t.secoes, erros, true)
  checarLinks(onde, htmlsDoTema(t), rotas, erros)

  if (t.preTeste.length < 1) erros.push(`${onde}: sem pre-teste`)
  for (const q of t.preTeste) if (!q.pergunta) erros.push(`${onde}: item de pre-teste vazio`)

  if (t.recuperacao.length < 2) {
    erros.push(`${onde}: recuperacao ativa com ${t.recuperacao.length} item(ns)`)
  }
  for (const q of t.recuperacao) {
    if (!q.pergunta) erros.push(`${onde}: item de recuperacao sem pergunta`)
    if (!q.resposta) erros.push(`${onde}: item de recuperacao sem gabarito`)
  }

  if (!t.fontes.length) erros.push(`${onde}: frontmatter sem fontes`)
  else if (!t.fontes.some((f) => f.url && f.tipo)) erros.push(`${onde}: fontes sem url/tipo`)
  checarFontes(onde, t.fontes, erros)
  checarMermaid(onde, t.mermaid, erros)
  // E o contrato cobrado do HTML: um `.mermaid` escrito em prosa nao passa pela cerca, mas o
  // runtime o desenha igual (`querySelectorAll('.mermaid')`).
  checarMermaidDoHtml(onde, htmlsDoTema(t), t.mermaid, erros)

  if (t.errosComuns.length < 1) erros.push(`${onde}: sem tabela de erros comuns`)

  // O SRS do app implementa a sequencia [1, 7, 30]. O campo do tema e o dono declarado
  // desse dado; se um tema divergir, o build precisa acusar para alguem implementar a
  // leitura do campo em vez de o app mentir sobre o intervalo.
  if (
    t.revisaoInicialDias.length &&
    t.revisaoInicialDias.join(',') !== SEQUENCIA_PADRAO.join(',')
  ) {
    erros.push(
      `${onde}: revisao_inicial_dias ${JSON.stringify(t.revisaoInicialDias)} difere da sequencia ` +
        `implementada ${JSON.stringify(SEQUENCIA_PADRAO)}`,
    )
  }

  for (const [tipo, lista] of Object.entries(t.relacoes)) {
    for (const rel of lista) {
      if (!rel.alvo.includes('#')) erros.push(`${onde}: relacao ${tipo} com alvo invalido (${rel.alvo})`)
      else if (!rel.pendente && !refs.has(rel.alvo)) {
        erros.push(`${onde}: relacao ${tipo} aponta para ref inexistente (${rel.alvo})`)
      }
      if (!rel.motivo) erros.push(`${onde}: relacao ${tipo} sem motivo (${rel.alvo})`)
    }
  }
}

function validarArea(a: Area, refs: Set<string>, rotas: RotasDoApp, erros: string[]): void {
  if (!a.areaNome) erros.push(`${a.areaId}: area_nome vazio`)
  if (!Number.isFinite(a.ordemEstudo)) erros.push(`${a.areaId}: ordem_estudo invalida`)
  if (!NIVEIS.has(a.nivel)) erros.push(`${a.areaId}: nivel invalido (${a.nivel})`)
  if (!a.ancoragem?.length) erros.push(`${a.areaId}: area sem ancoragem no cargo`)
  if (!a.temas.length) erros.push(`${a.areaId}: guia sem temas`)
  for (const ref of a.temas) {
    if (!refs.has(ref)) erros.push(`${a.areaId}: guia referencia tema inexistente (${ref})`)
    // O guia so pode listar tema da propria area: o painel conta "firmes" por area, e um
    // tema de fora entraria na conta de duas areas ao mesmo tempo.
    else if (!ref.startsWith(`${a.areaId}#`)) {
      erros.push(`${a.areaId}: guia lista tema de outra area (${ref})`)
    }
  }

  const g: Guia = a.guia
  if (g.areaId !== a.areaId) erros.push(`${a.areaId}: guia com area_id divergente (${g.areaId})`)
  checarFontes(a.areaId, a.fontes, erros)
  checarMermaid(a.areaId, g.mermaid, erros)
  checarMermaidDoHtml(a.areaId, htmlsDoGuia(g), g.mermaid, erros)
  checarSecoes(a.areaId, g.secoes, erros, true)
  checarLinks(a.areaId, htmlsDoGuia(g), rotas, erros)
  checarTabelasDoGuia(
    a.areaId,
    g,
    a.temas.map((ref) => ref.slice(ref.indexOf('#') + 1)),
    erros,
  )
  // O guia tambem e prosa: ficava de fora da varredura de lexico que temas e paginas
  // recebiam, embora o README prometesse o contrario.
  checarLexico(a.areaId, texto(htmlsDoGuia(g)), erros)
  if (g.checkpoint.length < 1) erros.push(`${a.areaId}: guia sem checkpoint`)
  for (const q of g.checkpoint) {
    if (!q.pergunta) erros.push(`${a.areaId}: checkpoint com item sem pergunta`)
    if (!q.resposta) erros.push(`${a.areaId}: checkpoint sem gabarito`)
  }
  if (!g.criterio) erros.push(`${a.areaId}: checkpoint sem criterio declarado`)
  else if (!interpretarCriterio(g.criterio)) {
    // Sem isto, um texto de criterio que o parser nao entende passava como valido e a
    // area ficava com um limiar inventado.
    erros.push(`${a.areaId}: criterio declarado nao interpretavel (${JSON.stringify(g.criterio)})`)
  }
}

function validarPagina(p: Pagina, rotas: RotasDoApp, erros: string[]): void {
  // Sem exigir >= 1 secao: glossario e mapa-relacoes usam `## Titulo` sem numero e
  // caem inteiros no intro.
  if (!p.slug) erros.push(`pagina sem slug`)
  if (!p.titulo) erros.push(`${p.slug}: titulo vazio`)
  // O menu do aluno agrupa por `grupo`; um valor desconhecido some da navegacao.
  if (!GRUPOS_DE_PAGINA.has(p.grupo)) erros.push(`${p.slug}: grupo desconhecido (${p.grupo})`)
  checarMermaid(p.slug, p.mermaid, erros)
  checarMermaidDoHtml(p.slug, htmlsDaPagina(p), p.mermaid, erros)
  checarSecoes(p.slug, p.secoes, erros, false)
  // `htmlsDaPagina` inclui o HTML do bloco de diagnostico da trilha, que sai das secoes na
  // extracao (`extrair-trilha.ts`) e por isso nao esta em `secoes` nenhuma.
  checarLinks(p.slug, htmlsDaPagina(p), rotas, erros)
}

export interface TotaisEsperados {
  areas: number
  temas: number
  /** Ausente, vale `TOTAL_PAGINAS`. */
  paginas?: number
}

/** Devolve a lista de problemas. Vazia significa conteudo aprovado. */
export function validar(
  c: Conteudo,
  esperado: TotaisEsperados = { areas: TOTAL_AREAS, temas: TOTAL_TEMAS },
): string[] {
  const erros: string[] = []

  // Conta os dados que o gate de fato percorre, e so depois confronta com o `meta`.
  // Ler os totais do proprio `meta` deixava passar tema removido do indice e da area.
  const totalAreas = c.areas.length
  const totalTemas = Object.keys(c.temas).length
  const totalPaginas = c.paginas.length

  if (totalAreas !== esperado.areas) {
    erros.push(`totais: ${totalAreas} areas, esperado ${esperado.areas}`)
  }
  if (totalTemas !== esperado.temas) {
    erros.push(`totais: ${totalTemas} temas, esperado ${esperado.temas}`)
  }
  // Sem numero esperado de paginas, apagar um arquivo de `99-fontes/` do diretorio de
  // conteudo passava: o gate comparava `meta.totais.paginas` com a contagem que ele mesmo
  // acabara de fazer, e as duas caiam juntas.
  const paginasEsperadas = esperado.paginas ?? TOTAL_PAGINAS
  if (totalPaginas !== paginasEsperadas) {
    erros.push(`totais: ${totalPaginas} paginas, esperado ${paginasEsperadas}`)
  }
  if (
    c.meta.totais.areas !== totalAreas ||
    c.meta.totais.temas !== totalTemas ||
    c.meta.totais.paginas !== totalPaginas
  ) {
    erros.push(
      `meta.totais divergente dos dados: ${JSON.stringify(c.meta.totais)} ` +
        `versus ${totalAreas}/${totalTemas}/${totalPaginas}`,
    )
  }
  // `geradoEm` nao e decorativo: a data vai para a tela e para o rodape do material.
  if (!RE_DATA_ISO.test(c.meta.geradoEm)) {
    erros.push(`meta.geradoEm nao e data ISO (${JSON.stringify(c.meta.geradoEm)})`)
  }

  const refs = new Set(Object.keys(c.temas))

  // As rotas que ESTE conteudo alcanca, para conferir cada href de fragmento: a mesma leitura do
  // smoke (`scripts/lib/rotas-app.mjs`), agora no build.
  const rotas = rotasDoConteudo(c)

  // A ordem de estudo e a sequencia que a fila de hoje percorre. Ref a mais, a menos ou
  // repetida faz a fila pular tema ou listar o mesmo duas vezes.
  const vistos = new Set<string>()
  for (const ref of c.ordemEstudo) {
    if (!refs.has(ref)) erros.push(`ordem_estudo aponta para ref inexistente (${ref})`)
    if (vistos.has(ref)) erros.push(`ordem_estudo com ref repetido (${ref})`)
    vistos.add(ref)
  }
  for (const ref of refs) {
    if (!vistos.has(ref)) erros.push(`ordem_estudo sem o tema (${ref})`)
  }

  for (const [ref, t] of Object.entries(c.temas)) {
    validarTema(ref, t, refs, rotas, erros)
    checarLexico(ref, texto(htmlsDoTema(t)), erros)
  }

  const areaIds = new Set(c.areas.map((a) => a.areaId))
  for (const [ref, t] of Object.entries(c.temas)) {
    if (t.areaId && !areaIds.has(t.areaId)) {
      erros.push(`${ref}: area_id inexistente (${t.areaId})`)
    }
  }

  for (const a of c.areas) validarArea(a, refs, rotas, erros)

  for (const p of c.paginas) {
    validarPagina(p, rotas, erros)
    // A prosa da trilha tambem passa pelo lexico: enquanto a regiao do diagnostico vivia dentro
    // da secao ela era varrida aqui, e a extracao nao pode ter tirado isso da cobertura.
    checarLexico(p.slug, texto(htmlsDaPagina(p)), erros)
  }

  return erros
}
