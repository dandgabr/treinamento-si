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
  // revisao manual. `#/quiz` e o quiz de todas as areas; `#/quiz/<areaId>`, o da area.
  rotas.push({ nome: 'quiz', rota: '#/quiz' })
  for (const a of c.areas) {
    rotas.push({ nome: `area ${a.areaId}`, rota: `#/area/${a.areaId}` })
    rotas.push({ nome: `quiz ${a.areaId}`, rota: `#/quiz/${a.areaId}` })
    const primeiro = (a.temas ?? [])[0]
    if (primeiro) {
      const [areaId, temaId] = primeiro.split('#')
      rotas.push({ nome: `tema ${primeiro}`, rota: `#/tema/${areaId}/${temaId}` })
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
      (partes[0] === 'pagina' && slugs.has(partes.slice(1).join('/'))) ||
      // O quiz tem duas rotas — `#/quiz`, de todas as areas, e `#/quiz/<areaId>` — e as duas
      // sao visitadas pela matriz. Sem esta linha, o link do painel para o quiz seria
      // reprovado por apontar para uma rota que existe.
      (partes[0] === 'quiz' &&
        (partes.length === 1 || (partes.length === 2 && areas.has(partes[1]))))
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
 * Os dois tipos de item sao distinguidos pelo proprio aviso de revisao da tela, que diz de
 * onde o item saiu ("tabela de erros comuns" ou "recuperação ativa") — e o que permite exigir
 * o "Por quê" de um e a ausencia dele no outro.
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

    // 4 rodadas de 10 itens no maximo: a rodada e um sorteio e o que se quer ver sao os dois
    // tipos de item. Com ~36% do banco em recuperacao, passar 40 itens sem um deles seria
    // azar de 1e-8 — e o laco para assim que ambos aparecem, o que acontece na primeira
    // rodada na quase totalidade das execucoes.
    const MAX_ITENS = 40
    let erroComum = 0
    let recuperacao = 0
    let respondidas = 0

    // O piso de 10 percorre uma rodada inteira mesmo quando os dois tipos saem logo nos
    // primeiros itens: e o que exercita dez trocas de questao com o foco.
    for (let n = 0; n < MAX_ITENS && (respondidas < 10 || !erroComum || !recuperacao); n++) {
      if (!(await pagina.locator('.bloco-questao').count())) {
        // Fim da rodada: o titulo recebeu o foco na montagem e o botao abre outra.
        await pagina.getByRole('button', { name: 'Outra rodada' }).click()
        await pagina.waitForSelector('.bloco-questao .alternativas input[type=radio]')
      }

      const aviso = pagina.locator('.bloco-questao > .dica')
      const rotulo = (await aviso.count()) ? ((await aviso.textContent()) ?? '') : ''
      const origem = rotulo.includes('recuperação ativa')
        ? 'recuperação ativa'
        : rotulo.includes('tabela de erros comuns')
          ? 'tabela de erros comuns'
          : null

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

      const temPorque = depois.texto.includes('Por quê')
      if (origem === 'recuperação ativa') {
        recuperacao += 1
        // Item de recuperacao nao tem justificativa derivada: o rotulo nao pode aparecer
        // sozinho, sem texto.
        conferir('item de recuperacao sem "Por quê"', temPorque, false)
      } else if (origem === 'tabela de erros comuns') {
        erroComum += 1
        conferir('item de erro comum com "Por quê"', temPorque, true)
      }

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
    conferir('o sorteio trouxe item de erro comum', erroComum > 0, true)
    conferir('o sorteio trouxe item de recuperacao', recuperacao > 0, true)

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

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const [nome, rotulo, detalhe] of falhas) console.error(`  - ${nome} :: ${rotulo} (${detalhe})`)
    console.error(`\nReproduza uma rota com:\n  ${CHROME} --headless=new --virtual-time-budget=15000 --dump-dom "${BASE}#/..."`)
    process.exit(1)
  }
  console.log(`\n${cenarios.length} cenarios + rodadas respondidas no navegador, 0 falhas`)
}

await main()
