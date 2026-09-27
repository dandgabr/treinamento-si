#!/usr/bin/env node
/**
 * Smoke test do artefato publicado: abre dist/index.html por file:// num Chrome
 * headless e confere o DOM renderizado.
 *
 * Nao use grep no --dump-dom: o dump carrega o bundle JS inteiro, que contem todo o
 * texto do conteudo, e qualquer busca textual passa mesmo com a tela vazia. Por isso
 * o dump e parseado com jsdom e as assercoes sao sobre seletores.
 *
 * Uso: npm run smoke   (rode `npm run build` antes)
 * Variavel opcional: CHROME_BIN (default: google-chrome-stable)
 */
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { JSDOM } from 'jsdom'
import { chromium } from 'playwright'
import { fontesMaisNovas } from './lib/frescor.mjs'

const execFileAsync = promisify(execFile)

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const ARTEFATO = path.join(APP, 'dist', 'index.html')
const CHROME = process.env.CHROME_BIN ?? 'google-chrome-stable'
const BASE = `file://${ARTEFATO}`

/** Quantos Chrome ao mesmo tempo. Quatro mantem o tempo baixo sem afogar a maquina. */
const LOTE = 4

// Perfil de navegador proprio e descartavel, para o teste nao encostar no do usuario.
// Um por slot de paralelismo: o Chrome trava o `--user-data-dir` e o segundo processo do
// mesmo perfil nem sobe.
const perfis = Array.from({ length: LOTE }, () => fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-smoke-')))
process.on('exit', () => {
  for (const perfil of perfis) {
    try {
      fs.rmSync(perfil, { recursive: true, force: true })
    } catch {
      // Sem permissao para limpar: nao vale falhar o teste por isso.
    }
  }
})

/** @typedef {{ nome: string, rota: string, url: string, checar: (d: Document) => Array<[string, unknown, unknown]> }} Cenario */

/** @type {Cenario[]} */
const cenarios = [
  {
    nome: 'painel',
    rota: '#/',
    url: BASE,
    checar: (d) => [
      ['titulo', d.querySelector('h1')?.textContent, 'Roadmap CISO'],
      ['areas listadas', d.querySelectorAll('.lista-areas li').length, 18],
      ['resumo no heroi', /18 áreas/.test(texto(d, 'main')), true],
      ['resumo do progresso', d.querySelectorAll('.resumo-item').length, 4],
      // O placar saiu por decisao: media cliques, nao aprendizagem.
      ['sem nivel no painel', /Nível \d/.test(texto(d, '.resumo')), false],
      ['sem sequencia de dias', /Sequência/.test(texto(d, '.resumo')), false],
      ['fila vazia no inicio', texto(d, '.resumo').includes('nada vencido'), true],
      ['temas firmes com a regua ao lado', texto(d, '.resumo').includes('firme é o tema'), true],
      ['bloco de acoes de progresso', d.querySelectorAll('.acoes-progresso button').length, 3],
      ['sem aviso de erro na abertura', d.querySelectorAll('.aviso-erro').length, 0],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
      // >= 18 porque `0 invalidos` sozinho passa com zero links: o painel lista as areas,
      // entao menos que isso significa que a lista sumiu.
      ['links internos no painel', d.querySelectorAll('a[href^="#"]').length >= 18, true],
    ],
  },
  {
    nome: 'tema com diagrama',
    rota: '#/tema/01-fundamentos/TEMA-01',
    url: `${BASE}#/tema/01-fundamentos/TEMA-01`,
    checar: (d) => [
      ['titulo do tema', (d.querySelector('h1')?.textContent ?? '').includes('Segurança da informação'), true],
      ['um unico h1', d.querySelectorAll('h1').length, 1],
      ['intro exibido', (d.querySelector('.intro')?.textContent ?? '').includes('Três escopos'), true],
      ['secoes renderizadas', d.querySelectorAll('.secao').length > 5, true],
      ['diagrama mermaid', d.querySelectorAll('.mermaid svg').length >= 1, true],
      ['pre-teste renderizado', d.querySelectorAll('.bloco-pre-teste').length, 1],
      [
        'botoes de confianca por item',
        d.querySelectorAll('.bloco-pre-teste .lista-qa > li').length * 5,
        d.querySelectorAll('.bloco-pre-teste .confianca button').length,
      ],
      // Guarda contra a asserção acima virar `0 === 0` caso o bloco suma: sem este par,
      // ela passaria com o pré-teste inteiro ausente.
      ['niveis de confianca presentes', d.querySelectorAll('.bloco-pre-teste .nivel').length >= 5, true],
      [
        'confianca comeca nao respondida',
        d.querySelectorAll('.bloco-pre-teste .nivel[aria-pressed="false"]').length,
        d.querySelectorAll('.bloco-pre-teste .nivel').length,
      ],
      ['veredito da recuperacao', d.querySelectorAll('.veredito-botoes button').length, 2],
      // Os botoes sao acao de uma passagem, nao toggle: sem `aria-pressed`, repetir o
      // clique nao pode mais avancar a escada do SRS.
      [
        'veredito nao usa estado de toggle',
        d.querySelectorAll('.veredito-botoes button[aria-pressed]').length,
        0,
      ],
      ['botao de leitura', d.querySelectorAll('.acoes-tema button').length, 1],
      // O quiz tem escopo por tema, e o caminho da pagina do tema ate ele e este botao: sem a
      // asserção, o `href` errado (tema da area errada, por exemplo) so apareceria no clique.
      [
        'link para praticar o tema',
        d.querySelector('.acoes-tema a.botao-secundario')?.getAttribute('href'),
        '#/quiz/01-fundamentos/TEMA-01',
      ],
      ['bloco de recuperacao ativa', d.querySelectorAll('.bloco-qa').length, 1],
      ['gabarito comecou escondido', d.querySelector('.bloco-qa .gabarito')?.hasAttribute('hidden'), true],
      [
        'botao do gabarito anuncia estado',
        d.querySelector('.bloco-qa button.botao-secundario')?.getAttribute('aria-expanded'),
        'false',
      ],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
      ['sem erro de rota', textoSemScripts(d).includes('Tema não encontrado'), false],
    ],
  },
  {
    nome: 'tema sem diagrama',
    rota: '#/tema/01-fundamentos/TEMA-04',
    url: `${BASE}#/tema/01-fundamentos/TEMA-04`,
    checar: (d) => [
      ['secoes renderizadas', d.querySelectorAll('.secao').length > 5, true],
      ['nenhum diagrama', d.querySelectorAll('.mermaid svg').length, 0],
      ['sem erro de rota', textoSemScripts(d).includes('Tema não encontrado'), false],
    ],
  },
  {
    nome: 'tema inexistente',
    rota: '#/tema/01-fundamentos/TEMA-99',
    url: `${BASE}#/tema/01-fundamentos/TEMA-99`,
    checar: (d) => [['avisa em vez de tela branca', textoSemScripts(d).includes('Tema não encontrado'), true]],
  },
  {
    nome: 'guia de area',
    rota: '#/area/01-fundamentos',
    url: `${BASE}#/area/01-fundamentos`,
    checar: (d) => [
      ['titulo da area', d.querySelector('h1')?.textContent, 'Fundamentos de segurança da informação'],
      ['temas listados', d.querySelectorAll('.lista-temas li').length, 8],
      ['checkpoint interativo', d.querySelectorAll('.bloco-qa').length, 1],
      [
        'checkpoint com veredito por item',
        d.querySelectorAll('.bloco-qa .veredicto-item').length,
        d.querySelectorAll('.bloco-qa .lista-qa > li').length,
      ],
      ['veredictos por item existem', d.querySelectorAll('.bloco-qa .veredicto-item').length > 0, true],
      ['criterio visivel', texto(d, 'main').includes('Critério para seguir adiante'), true],
      ['diagrama do guia', d.querySelectorAll('.mermaid svg').length >= 1, true],
      [
        'situacao da area com a regua',
        texto(d, '.situacao').includes('firme é o tema cuja última recuperação'),
        true,
      ],
      [
        'criterio do guia visivel',
        texto(d, '.situacao-criterio').includes('Critério do guia'),
        true,
      ],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
    ],
  },
  {
    nome: 'pagina sem secoes numeradas',
    rota: '#/pagina/glossario',
    url: `${BASE}#/pagina/glossario`,
    checar: (d) => [
      ['titulo', d.querySelector('h1')?.textContent, 'Glossário'],
      ['conteudo presente', texto(d, 'main').includes('Termos') && texto(d, 'main').includes('Siglas'), true],
    ],
  },
  {
    nome: 'glossario por termo',
    // O endereco de um termo e a mesma pagina com o id do verbete no fim da rota (`termo-tls` e
    // o `id` da linha de "TLS" na tabela de termos). A tela tem de abrir o glossario inteiro —
    // e nao "Pagina nao encontrada" — com o indice, a busca e aquele verbete no lugar dele.
    rota: '#/pagina/glossario/termo-tls',
    url: `${BASE}#/pagina/glossario/termo-tls`,
    checar: (d) => [
      ['titulo', d.querySelector('h1')?.textContent, 'Glossário'],
      ['o verbete enderecado existe', d.querySelector('#termo-tls') !== null, true],
      [
        'o verbete traz o proprio endereco no link',
        d.querySelector('#termo-tls a[href="#/pagina/glossario/termo-tls"]') !== null,
        true,
      ],
      ['indice por area', d.querySelectorAll('.sumario button').length >= 10, true],
      ['busca com rotulo de verdade', d.querySelector('.busca-glossario label')?.textContent, 'Buscar termo'],
      ['contagem anunciada no aria-live', d.querySelector('.busca-contagem')?.getAttribute('role'), 'status'],
      ['links de termo na pagina', d.querySelectorAll('a[href^="#/pagina/glossario/"]').length >= 40, true],
      // O par acima diz que existem links; este diz que todos eles acham o alvo AQUI — o id do
      // ultimo segmento tem de ser o id de uma linha desta tela. Com zero links ele passaria, e
      // e por isso que os dois andam juntos.
      [
        'todo link de termo acha o verbete',
        [...d.querySelectorAll('a[href^="#/pagina/glossario/"]')].filter(
          (a) => d.getElementById((a.getAttribute('href') ?? '').split('/').pop()) === null,
        ).length,
        0,
      ],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
      ['sem erro de rota', RE_ROTA_VAZIA.test(textoSemScripts(d)), false],
    ],
  },
  {
    nome: 'rota malformada',
    rota: '#/pagina/100%',
    url: `${BASE}#/pagina/100%`,
    // Um "%" solto fazia decodeURIComponent lancar URIError dentro do render e
    // derrubava a aplicacao inteira.
    checar: (d) => [
      ['main existe', d.querySelector('main') !== null, true],
      ['avisa sem quebrar', textoSemScripts(d).includes('Página não encontrada'), true],
    ],
  },
  {
    nome: 'trilha com diagrama',
    rota: '#/pagina/91-trilhas/plano-90-dias',
    url: `${BASE}#/pagina/91-trilhas/plano-90-dias`,
    checar: (d) => [
      ['titulo', d.querySelector('h1')?.textContent, 'Plano de estudo — 90 dias'],
      ['secoes renderizadas', d.querySelectorAll('.secao').length >= 6, true],
      ['diagrama mermaid', d.querySelectorAll('.mermaid svg').length >= 1, true],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
    ],
  },
]

/**
 * Uma rota por area, uma por pagina e um tema por area, tiradas do proprio conteudo.
 * O smoke antigo visitava 7 rotas de ~150: um defeito de render especifico de um tema
 * so aparecia se alguem escolhesse aquela rota a mao.
 */
function rotasDaMatriz() {
  const c = conteudo()
  const rotas = []
  // A rota do quiz entra na matriz: era a unica tela do app que cenario nenhum visitava, e
  // por isso o defeito de foco ao avancar questao (o foco caia no `body`) so apareceu numa
  // revisao manual. Os tres escopos entram: `#/quiz` (todas as areas), `#/quiz/<areaId>` e
  // `#/quiz/<areaId>/<temaId>`.
  rotas.push({ nome: 'quiz', rota: '#/quiz' })
  for (const a of c.areas) {
    rotas.push({ nome: `area ${a.areaId}`, rota: `#/area/${a.areaId}` })
    rotas.push({ nome: `quiz ${a.areaId}`, rota: `#/quiz/${a.areaId}` })
    const primeiro = (a.temas ?? [])[0]
    if (primeiro) {
      const [areaId, temaId] = primeiro.split('#')
      rotas.push({ nome: `tema ${primeiro}`, rota: `#/tema/${areaId}/${temaId}` })
      rotas.push({ nome: `quiz do tema ${primeiro}`, rota: `#/quiz/${areaId}/${temaId}` })
    }
  }
  for (const p of c.paginas) rotas.push({ nome: `pagina ${p.slug}`, rota: `#/pagina/${p.slug}` })
  return rotas
}

// Mensagem exata que a aplicacao escreve ao nao achar a rota; o texto do material pode
// conter "nao encontrado" em prosa (o 404 aparece em varias aulas).
const RE_ROTA_VAZIA = /(Tema|Página|Área) não encontrad/

function texto(d, seletor) {
  return d.querySelector(seletor)?.textContent ?? ''
}

// Chamado depois de remover os <script>, entao reflete so o DOM renderizado.
function textoSemScripts(d) {
  return d.body.textContent ?? ''
}

let conteudoCache = null
function conteudo() {
  if (!conteudoCache) {
    conteudoCache = JSON.parse(
      fs.readFileSync(path.join(APP, 'src', 'content', 'generated', 'content.json'), 'utf8'),
    )
  }
  return conteudoCache
}

function decodificar(parte) {
  try {
    return decodeURIComponent(parte)
  } catch {
    return parte
  }
}

/**
 * O slug de uma pagina a partir da rota inteira, ou `null` quando nao ha nenhuma.
 *
 * O slug pode ter mais de um segmento (`91-trilhas/plano-90-dias`), entao o ancora viaja como
 * ULTIMO segmento e a pagina e o prefixo conhecido mais longo — a mesma leitura de
 * `separarAncora` (`src/ui/useRota.ts`). Sem isto, o endereco de um termo do glossario
 * (`#/pagina/glossario/termo-tls`) seria lido como um slug `glossario/termo-tls`, que nao
 * existe, e o teste reprovaria justamente o link que a fase 6 veio acrescentar.
 */
function slugDePagina(partes, slugs) {
  const inteiro = partes.slice(1).join('/')
  if (slugs.has(inteiro)) return inteiro
  for (let corte = partes.length - 1; corte >= 2; corte--) {
    // So um segmento depois do slug: dois nao formam ancora de nada.
    if (partes.length - corte !== 1) continue
    const prefixo = partes.slice(1, corte).join('/')
    if (slugs.has(prefixo)) return prefixo
  }
  return null
}

/**
 * Confere que todo link interno da pagina aponta para uma rota que existe no
 * conteudo. O smoke navega digitando a URL, entao sem isto um href quebrado em toda
 * a aplicacao passaria batido — foi exatamente o caso do `#` do ref indo cru para a
 * URL, que so apareceu quando alguem clicou.
 */
function hrefsInvalidos(d) {
  const c = conteudo()
  const areas = new Set(c.areas.map((a) => a.areaId))
  const temas = new Set(Object.keys(c.temas))
  const slugs = new Set(c.paginas.map((p) => p.slug))
  const invalidos = []
  for (const ancora of d.querySelectorAll('a[href^="#"]')) {
    const href = ancora.getAttribute('href') ?? ''
    if (href === '#' || href === '#/') continue
    const partes = href.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodificar)
    const ok =
      (partes[0] === 'area' && areas.has(partes[1])) ||
      (partes[0] === 'tema' && temas.has(`${partes[1]}#${partes[2]}`)) ||
      (partes[0] === 'pagina' && slugDePagina(partes, slugs) !== null) ||
      // O quiz tem tres rotas — `#/quiz`, `#/quiz/<areaId>` e `#/quiz/<areaId>/<temaId>` — e
      // as tres sao visitadas pela matriz. Sem esta linha, o link do painel e o botao
      // "Praticar este tema" seriam reprovados por apontarem para rotas que existem.
      (partes[0] === 'quiz' &&
        (partes.length === 1 ||
          (partes.length === 2 && areas.has(partes[1])) ||
          (partes.length === 3 && temas.has(`${partes[1]}#${partes[2]}`))))
    if (!ok) invalidos.push(href)
  }
  return invalidos
}

/**
 * O bundle inteiro vem inline no `index.html` (7,6 MB) e o jsdom retem ~190 MB por
 * documento parseado. Com a matriz de rotas isso estourava o heap do Node antes do fim.
 * Tirar os `<script>` do texto antes de parsear resolve as duas coisas — e deixa o
 * `body.textContent` sem o bundle, que era o motivo de remover os scripts depois.
 */
function semScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
}

/** Rodar o Chrome com a rota e devolver o DOM serializado. */
async function rodarChrome(url, slot = 0) {
  const { stdout } = await execFileAsync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      // Perfil proprio por execucao: sem isso o Chrome usa o perfil real do usuario, e o
      // `localStorage` de file:// e compartilhado entre paginas locais — o progresso de
      // quem estuda por file:// mudaria o estado inicial do teste.
      `--user-data-dir=${perfis[slot % perfis.length]}`,
      // O Mermaid renderiza de forma assincrona; sem o orcamento de tempo virtual
      // o dump sai antes do SVG existir.
      '--virtual-time-budget=15000',
      '--dump-dom',
      url,
    ],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  )
  return stdout
}

/**
 * O contrato da tela do quiz que o `--dump-dom` nao alcanca.
 *
 * O dump fotografa a pagina PARADA: o gabarito, a marca de "correta" e o "Por quê" so existem
 * depois de um clique, e o foco depois de avancar so se observa com a pagina viva. Aqui o
 * Chrome e aberto pelo Playwright e uma rodada e respondida de verdade, pelo caminho do
 * usuario: clicar a alternativa, confirmar, avancar.
 *
 * O banco tem uma origem so — a tabela de erros comuns do tema — e a tela a expoe no
 * `data-origem` do item. A rodada inteira e conferida contra esse contrato: toda questao sai
 * do erro comum e traz a justificativa do material ("Por quê"), que e o unico campo de texto
 * do item que nao vem das alternativas.
 */
async function cenarioDoQuizRespondido() {
  const nome = 'quiz (respondido)'
  const falhas = []
  /** Mesma forma dos cenarios da matriz, para o relatorio final nao ter dois formatos. */
  const conferir = (rotulo, obtido, esperado) => {
    const ok = obtido === esperado
    console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} :: ${rotulo} = ${JSON.stringify(obtido)}`)
    if (!ok) falhas.push([nome, rotulo, `esperado ${JSON.stringify(esperado)}`])
  }

  const navegador = await chromium.launch({
    // `channel` acha o Chrome instalado quando `CHROME` e so o nome do programa, como no
    // default; `executablePath` honra um `CHROME_BIN` com caminho.
    ...(CHROME.includes('/') ? { executablePath: CHROME } : { channel: 'chrome' }),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })

  try {
    const pagina = await navegador.newPage()
    await pagina.goto(`${BASE}#/quiz`)
    await pagina.waitForSelector('.bloco-questao .alternativas input[type=radio]')

    // Uma rodada inteira (10 itens) e o que se quer ver; o teto de 40 so existe para o laco
    // nao girar sem fim se o escopo tiver menos itens que uma rodada e o botao de outra
    // rodada nao aparecer.
    const MAX_ITENS = 40
    let respondidas = 0
    let deErroComum = 0

    for (let n = 0; n < MAX_ITENS && respondidas < 10; n++) {
      if (!(await pagina.locator('.bloco-questao').count())) {
        // Fim da rodada: o titulo recebeu o foco na montagem e o botao abre outra.
        await pagina.getByRole('button', { name: 'Outra rodada' }).click()
        await pagina.waitForSelector('.bloco-questao .alternativas input[type=radio]')
      }

      // A origem vem do PROPRIO item, e nao do texto do aviso: o item promovido a
      // `verificado` nao leva selo, entao ler a origem pelo selo deixava a variavel nula. O
      // selo diz o status; a origem e outro dado.
      const doItem = await pagina.evaluate(() => {
        const questao = document.querySelector('.bloco-questao')
        return {
          origem: questao?.getAttribute('data-origem') ?? '',
          status: questao?.getAttribute('data-status') ?? '',
        }
      })
      conferir('o item diz de onde veio', doItem.origem, 'erro-comum')
      if (doItem.origem === 'erro-comum') deErroComum += 1

      // O selo de revisao so aparece em item ainda nao verificado, e a frase dele aponta a
      // origem: com uma origem so no banco, ela nao pode nomear uma que nao existe mais.
      const selo = pagina.locator('.bloco-questao > .dica')
      const rotulo = (await selo.count()) ? ((await selo.textContent()) ?? '') : ''
      const emRevisao = doItem.status === 'rascunho' || doItem.status === 'pendente'
      conferir('o selo de revisao segue o status do item', !!rotulo, emRevisao)
      if (emRevisao) {
        conferir('o selo diz que o item saiu do erro comum', rotulo.includes('erros comuns'), true)
      }

      const antes = await pagina.evaluate(() => {
        const radios = [...document.querySelectorAll('.alternativas input[type=radio]')]
        return {
          alternativas: document.querySelectorAll('.lista-alternativas > li').length,
          radios: radios.length,
          nomes: [...new Set(radios.map((r) => r.getAttribute('name')))],
          gabaritos: document.querySelectorAll('.bloco-questao .gabarito').length,
        }
      })
      conferir('um radio por alternativa', antes.radios, antes.alternativas)
      conferir('mesmo name nos radios do grupo', antes.nomes.length, 1)
      conferir('o grupo tem name', !!antes.nomes[0], true)
      conferir('gabarito so depois de responder', antes.gabaritos, 0)
      // O contrato de tamanho do banco: gabarito mais dois a tres distratores. Uma rodada
      // inteira fora da faixa seria um gerador quebrado, e o item nao mediria.
      conferir('o item tem de 3 a 4 alternativas', antes.alternativas >= 3 && antes.alternativas <= 4, true)

      await pagina.locator('.bloco-questao .alternativa').first().click()
      conferir(
        'alternativa marcada',
        await pagina.locator('.bloco-questao .alternativas input:checked').count(),
        1,
      )
      await pagina.locator('.acoes-questao button').click()
      await pagina.waitForSelector('.bloco-questao .gabarito')

      const depois = await pagina.evaluate(() => ({
        gabaritos: document.querySelectorAll('.bloco-questao .gabarito').length,
        certas: document.querySelectorAll('.bloco-questao .alternativa.certa').length,
        travados: document.querySelectorAll('.alternativas input[type=radio]:disabled').length,
        texto: document.querySelector('.bloco-questao .gabarito')?.textContent ?? '',
      }))
      conferir('gabarito existe depois de responder', depois.gabaritos, 1)
      conferir('a alternativa correta fica marcada', depois.certas, 1)
      conferir('o grupo trava depois de responder', depois.travados, antes.radios)
      // A justificativa e obrigatoria em item de erro comum: e o `porque` da linha da tabela,
      // a unica coisa do item que explica a correcao. Sem ela, a tela nao tem o que mostrar
      // sob "Por quê" e o item ensina a resposta sem a razao.
      conferir('o item traz a justificativa do material', depois.texto.includes('Por quê'), true)

      await pagina.locator('.acoes-questao button').click()
      respondidas += 1

      // Avancar e o outro momento em que o foco se perderia: o botao clicado vira
      // `disabled` e o Chrome o manda para o `body`. O foco tem de estar no titulo — da
      // questao nova, ou do fim da rodada na ultima.
      await pagina
        .waitForFunction(
          () => /^(Questão \d+ de \d+|Fim da rodada)$/.test((document.activeElement?.textContent ?? '').trim()),
          null,
          { timeout: 5000 },
        )
        .catch(() => {})
      const foco = await pagina.evaluate(() => ({
        tag: document.activeElement?.tagName ?? null,
        texto: (document.activeElement?.textContent ?? '').trim().slice(0, 60),
      }))
      conferir(
        'depois de avancar o foco esta no titulo, nao no body',
        foco.tag === 'H2' && /^(Questão \d+ de \d+|Fim da rodada)$/.test(foco.texto),
        true,
      )
    }

    conferir('a rodada inteira foi respondida', respondidas >= 10, true)
    conferir('todos os itens da rodada sao de erro comum', deErroComum, respondidas)

    // O outro estado da tela: a sessao que NAO pode gravar porque a LEITURA do progresso
    // falhou. Nele `falhaAoGravar` continua `false` (nada foi gravado, e nao houve falha de
    // gravacao) e, sem aviso, a tela contaria acertos e prometeria o registro que nao
    // acontece. Nenhum provedor do app rejeita hoje — a ponte e falsa de proposito, injetada
    // antes do bundle rodar, e e o unico jeito de chegar nesse estado.
    const semLeitura = await navegador.newPage()
    await semLeitura.addInitScript(() => {
      window.roadmap = {
        versao: () => Promise.resolve('0.0.0-smoke'),
        progresso: {
          ler: () => Promise.reject(new Error('EIO')),
          gravar: () => Promise.resolve(),
          apagar: () => Promise.resolve(),
          exportar: () => Promise.resolve({ estado: 'cancelado' }),
          importar: () => Promise.resolve({ estado: 'cancelado' }),
        },
        aoEscolherNoMenu: () => {},
      }
    })
    await semLeitura.goto(`${BASE}#/quiz`)
    await semLeitura.waitForSelector('.bloco-questao .alternativas input[type=radio]')
    const avisos = () =>
      semLeitura.evaluate(() =>
        [...document.querySelectorAll('.aviso-erro')].map((e) => e.getAttribute('role') ?? ''),
      )
    conferir('sessao sem leitura avisa no topo da tela', (await avisos()).join(','), 'alert')
    for (let i = 0; i < 10; i++) {
      await semLeitura.locator('.bloco-questao .alternativa').first().click()
      await semLeitura.locator('.acoes-questao button').click()
      await semLeitura.waitForSelector('.bloco-questao .gabarito')
      await semLeitura.locator('.acoes-questao button').click()
    }
    await semLeitura.waitForSelector('.veredito-botoes')
    // Dois avisos: o do topo e o do fim da rodada, cada um colado na frase que afirma o
    // registro. Na tela real eles sao o mesmo recado do store.
    conferir('sessao sem leitura avisa tambem no fim da rodada', (await avisos()).join(','), 'alert,alert')
  } catch (erro) {
    falhas.push([nome, 'interacao falhou', String(erro).slice(0, 200)])
  } finally {
    await navegador.close()
  }
  return falhas
}

/**
 * O contrato do glossario navegavel por termo.
 *
 * O `--dump-dom` fotografa a pagina parada: o que ele nao alcanca e a busca (que so existe
 * depois de teclar), o foco de quem clica num termo e a rolagem que traz o verbete para a tela.
 * Aqui o Chrome e aberto pelo Playwright e o caminho e feito de verdade: digitar, limpar,
 * clicar no indice, clicar no termo, abrir o endereco de um termo direto.
 *
 * O numero de verbetes vem do proprio DOM, e nao de uma constante: o material pode ganhar
 * termos sem quebrar o teste. O que ele fixa e o contrato — filtrar tira o que nao casa, nao
 * casar avisa, e o endereco de um termo muda a rota e leva o foco e a rolagem ate ele.
 */
async function cenarioDoGlossario() {
  const nome = 'glossario (navegavel por termo)'
  const falhas = []
  /** Mesma forma dos cenarios da matriz, para o relatorio final nao ter dois formatos. */
  const conferir = (rotulo, obtido, esperado) => {
    const ok = obtido === esperado
    console.log(`${ok ? 'OK   ' : 'FALHA'} ${nome} :: ${rotulo} = ${JSON.stringify(obtido)}`)
    if (!ok) falhas.push([nome, rotulo, `esperado ${JSON.stringify(esperado)}`])
  }
  /** Espera o foco chegar num verbete; sem o prazo, um defeito de foco travaria o laco. */
  const esperarFocoNoVerbete = (alvo) =>
    alvo
      .waitForFunction(() => document.activeElement?.classList.contains('verbete'), null, {
        timeout: 5000,
      })
      .catch(() => {})

  const navegador = await chromium.launch({
    ...(CHROME.includes('/') ? { executablePath: CHROME } : { channel: 'chrome' }),
    headless: true,
    args: ['--no-sandbox', '--disable-gpu'],
  })

  try {
    const pagina = await navegador.newPage()
    const busca = pagina.getByLabel('Buscar termo')
    await pagina.goto(`${BASE}#/pagina/glossario`)
    await busca.waitFor()

    const todos = await pagina.locator('.verbete').count()
    conferir('a lista comeca inteira', todos > 40, true)

    // --- busca que acha e some com o resto
    await busca.fill('zero trust')
    const filtrado = await pagina.evaluate(() => ({
      verbetes: document.querySelectorAll('.verbete').length,
      contagem: document.querySelector('.busca-contagem')?.textContent ?? '',
      alvo: document.querySelector('#termo-zero-trust') !== null,
      outro: document.querySelector('#termo-bia') !== null,
      papel: document.querySelector('.busca-contagem')?.getAttribute('role') ?? '',
    }))
    conferir('a busca acha o termo', filtrado.alvo, true)
    conferir('a busca encolhe a lista', filtrado.verbetes > 0 && filtrado.verbetes < todos, true)
    conferir('o que nao casa sai do DOM', filtrado.outro, false)
    const numeros = /^(\d+) de (\d+) termos e siglas$/.exec(filtrado.contagem)
    conferir('a contagem fala do filtro e do total', numeros?.slice(1).join(','), `${filtrado.verbetes},${todos}`)
    // Sem `role="status"` a contagem muda em silencio para quem usa leitor de tela.
    conferir('a contagem e anunciada', filtrado.papel, 'status')

    // --- acento e maiuscula nao mudam a busca (o material e escrito em portugues)
    await busca.fill('TRÍADE')
    conferir('a busca acha com acento e maiuscula', await pagina.locator('#termo-triade-cia').count(), 1)
    await busca.fill('triade')
    conferir('a busca acha sem acento', await pagina.locator('#termo-triade-cia').count(), 1)

    // --- termo que nao existe: a tela diz isso, e a lista some
    await busca.fill('zzz-nao-existe')
    const vazio = await pagina.evaluate(() => ({
      verbetes: document.querySelectorAll('.verbete').length,
      contagem: document.querySelector('.busca-contagem')?.textContent ?? '',
    }))
    conferir('sem resultado, a lista fica vazia', vazio.verbetes, 0)
    conferir(
      'sem resultado, a tela diz isso',
      vazio.contagem.startsWith('Nenhum termo bate com “zzz-nao-existe”'),
      true,
    )

    await pagina.getByRole('button', { name: 'Limpar busca' }).click()
    const limpo = await pagina.evaluate(() => ({
      verbetes: document.querySelectorAll('.verbete').length,
      contagem: document.querySelector('.busca-contagem')?.textContent ?? '',
    }))
    conferir('limpar traz a lista de volta', limpo.verbetes, todos)
    conferir('a contagem volta ao total', limpo.contagem, `${todos} termos e siglas`)

    // --- o indice por area leva a um termo, sem mexer na rota
    const indice = await pagina.evaluate(() => {
      const antes = location.hash
      const alvos = [...document.querySelectorAll('.sumario button')].map((botao) => {
        botao.click()
        return document.activeElement?.id ?? ''
      })
      return { antes, depois: location.hash, alvos }
    })
    conferir('o indice tem uma entrada por area', indice.alvos.length >= 10, true)
    // Item de indice que nao acha o alvo deixa o foco no proprio botao, que nao tem id. A
    // comparacao e pelo texto porque `conferir` compara com `===`, e duas listas nunca sao iguais.
    conferir('todo item do indice acha o alvo', indice.alvos.filter((id) => !id).join(','), '')
    conferir(
      'os itens por area caem num termo',
      indice.alvos.filter((id) => id.startsWith('termo-')).length >= 5,
      true,
    )
    conferir('o indice nao muda a rota', indice.depois, indice.antes)

    // --- clicar num termo muda a rota e leva o foco ate ele
    const primeiro = await pagina.evaluate(() => {
      const link = document.querySelector('.verbete a')
      return { id: link?.closest('tr')?.id ?? '', href: link?.getAttribute('href') ?? '' }
    })
    conferir('o primeiro verbete tem endereco proprio', primeiro.href, `#/pagina/glossario/${primeiro.id}`)
    await pagina.locator('.verbete a').first().click()
    await esperarFocoNoVerbete(pagina)
    const clique = await pagina.evaluate(() => ({
      rota: location.hash,
      foco: document.activeElement?.tagName === 'TR' ? (document.activeElement.id ?? '') : '',
    }))
    conferir('clicar num termo muda a rota', clique.rota, primeiro.href)
    conferir('e o foco vai para o termo, nao para o topo', clique.foco, primeiro.id)

    // --- o endereco de um termo, aberto direto (o link compartilhado), ja chega nele
    const ultimo = await pagina.evaluate(() => {
      const linhas = [...document.querySelectorAll('.verbete')]
      return linhas[linhas.length - 1]?.id ?? ''
    })
    const nova = await navegador.newPage()
    await nova.goto(`${BASE}#/pagina/glossario/${ultimo}`)
    await nova.waitForSelector('.verbete')
    await esperarFocoNoVerbete(nova)
    const direto = await nova.evaluate(() => {
      const foco = document.activeElement
      const caixa = foco?.getBoundingClientRect()
      return {
        foco: foco?.tagName === 'TR' ? (foco.id ?? '') : '',
        topo: Math.round(caixa?.top ?? -1),
        janela: window.innerHeight,
      }
    })
    conferir('o endereco do termo abre no termo', direto.foco, ultimo)
    // O cabecalho do app e fixo e tem 52 px (`--altura-topo`): o verbete tem de aparecer ABAIXO
    // dele. Sem a rolagem, o ultimo verbete de 78 ficaria a milhares de pixels dali.
    conferir(
      'o termo esta a vista, abaixo do cabecalho fixo',
      direto.topo >= 52 && direto.topo < direto.janela,
      true,
    )
    // O titulo da janela e o da pagina, nao o do termo: o endereco muda a posicao, nao a tela.
    conferir('o titulo da janela nomeia a pagina', await nova.title(), 'Glossário · Roadmap CISO')
    await nova.close()

    // --- rota de pagina SEM termo no fim: o foco volta para o conteudo, como sempre foi. Sem
    // esta prova, "melhorar" o foco do endereco de um termo poderia ter matado o foco da troca
    // de rota comum.
    await pagina.evaluate(() => {
      location.hash = '#/pagina/glossario'
    })
    await pagina
      .waitForFunction(() => document.activeElement?.tagName === 'MAIN', null, { timeout: 5000 })
      .catch(() => {})
    conferir(
      'sem termo no endereco, o foco vai para o conteudo',
      await pagina.evaluate(() => document.activeElement?.tagName ?? ''),
      'MAIN',
    )
  } catch (erro) {
    falhas.push([nome, 'interacao falhou', String(erro).slice(0, 200)])
  } finally {
    await navegador.close()
  }
  return falhas
}

// A matriz entra depois das declaracoes: `conteudo()` le `conteudoCache`, declarado
// depois das tabelas, e chamar antes da inicializacao daria ReferenceError.
for (const { nome, rota } of rotasDaMatriz()) {
  cenarios.push({
    nome,
    rota,
    url: `${BASE}${rota}`,
    checar: (d) => [
      // Um positivo generico por rota: sem ele, "sem erro de rota" e "sem aviso" sao
      // verdadeiros por ausencia e uma pagina que nao renderizou nada passaria, desde que
      // houvesse um h1.
      ['conteudo renderizado', (d.querySelector('main')?.textContent ?? '').trim().length > 400, true],
      ['um unico h1', d.querySelectorAll('h1').length, 1],
      ['sem erro de rota', RE_ROTA_VAZIA.test(textoSemScripts(d)), false],
      ['sem aviso de erro', d.querySelectorAll('.aviso-erro').length, 0],
      ['links internos resolvem (invalidos)', hrefsInvalidos(d).length, 0],
    ],
  })
}

async function main() {
  if (!fs.existsSync(ARTEFATO)) {
    console.error(`Artefato ausente: ${ARTEFATO}\nRode antes: npm run build`)
    process.exit(1)
  }
  // Existir nao basta: um `dist` de antes da ultima alteracao faz o teste passar para
  // codigo que nao esta no artefato.
  const desatualizadas = fontesMaisNovas(ARTEFATO, [
    path.join(APP, 'src'),
    path.join(APP, 'index.html'),
    path.join(APP, 'vite.config.ts'),
  ])
  if (desatualizadas.length) {
    console.error(
      `Artefato desatualizado: ${ARTEFATO}\n` +
        `Mais novo que ele: ${desatualizadas.join(', ')}\nRode antes: npm run build`,
    )
    process.exit(1)
  }

  const falhas = []
  // Em lotes: cada rota e um Chrome proprio (~1,8 s) e a matriz passou de 50 rotas, o que
  // levava quase dois minutos em serie. O lote roda os Chrome em paralelo e parseia um de
  // cada vez — o pico de memoria continua o de um documento so.
  for (let i = 0; i < cenarios.length; i += LOTE) {
    const lote = cenarios.slice(i, i + LOTE)
    const dumps = await Promise.all(
      lote.map((c, slot) =>
        rodarChrome(c.url, slot).catch((erro) => new Error(String(erro).slice(0, 120))),
      ),
    )
    for (let j = 0; j < lote.length; j++) {
      const cenario = lote[j]
      const bruto = dumps[j]
      if (bruto instanceof Error) {
        falhas.push([cenario.nome, 'Chrome nao executou', bruto.message])
        continue
      }
      const dom = new JSDOM(semScripts(bruto))
      for (const [rotulo, obtido, esperado] of cenario.checar(dom.window.document)) {
        const ok = obtido === esperado
        console.log(
          `${ok ? 'OK   ' : 'FALHA'} ${cenario.nome} :: ${rotulo} = ${JSON.stringify(obtido)}`,
        )
        if (!ok) falhas.push([cenario.nome, rotulo, `esperado ${JSON.stringify(esperado)}`])
      }
      dom.window.close()
    }
  }

  // Depois dos dumps: a rodada respondida precisa do navegador vivo e de um Chrome so, entao
  // ela roda sozinha, no fim, sem disputar os slots do lote.
  falhas.push(...(await cenarioDoQuizRespondido()))
  falhas.push(...(await cenarioDoGlossario()))

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const [nome, rotulo, detalhe] of falhas) console.error(`  - ${nome} :: ${rotulo} (${detalhe})`)
    console.error(`\nReproduza uma rota com:\n  ${CHROME} --headless=new --virtual-time-budget=15000 --dump-dom "${BASE}#/..."`)
    process.exit(1)
  }
  console.log(
    `\n${cenarios.length} cenarios + quiz respondido e glossario navegavel no navegador, 0 falhas`,
  )
}

await main()
