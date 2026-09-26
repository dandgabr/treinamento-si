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
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const ARTEFATO = path.join(APP, 'dist', 'index.html')
const CHROME = process.env.CHROME_BIN ?? 'google-chrome-stable'
const BASE = `file://${ARTEFATO}`

// Perfil de navegador proprio e descartavel, para o teste nao encostar no do usuario.
const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-smoke-'))
process.on('exit', () => {
  try {
    fs.rmSync(perfil, { recursive: true, force: true })
  } catch {
    // Sem permissao para limpar: nao vale falhar o teste por isso.
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
      (partes[0] === 'pagina' && slugs.has(partes.slice(1).join('/')))
    if (!ok) invalidos.push(href)
  }
  return invalidos
}

function rodarChrome(url) {
  return execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      // Perfil proprio por execucao: sem isso o Chrome usa o perfil real do usuario, e o
      // `localStorage` de file:// e compartilhado entre paginas locais — o progresso de
      // quem estuda por file:// mudaria o estado inicial do teste.
      `--user-data-dir=${perfil}`,
      // O Mermaid renderiza de forma assincrona; sem o orcamento de tempo virtual
      // o dump sai antes do SVG existir.
      '--virtual-time-budget=15000',
      '--dump-dom',
      url,
    ],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] },
  )
}

function main() {
  if (!fs.existsSync(ARTEFATO)) {
    console.error(`Artefato ausente: ${ARTEFATO}\nRode antes: npm run build`)
    process.exit(1)
  }

  const falhas = []
  for (const cenario of cenarios) {
    let dom
    try {
      dom = new JSDOM(rodarChrome(cenario.url))
    } catch (erro) {
      falhas.push([cenario.nome, 'Chrome nao executou', String(erro).slice(0, 120)])
      continue
    }
    // Sem isto, `body.textContent` inclui o bundle inline e toda busca textual acha
    // o que procura mesmo sem nada renderizado.
    dom.window.document.querySelectorAll('script').forEach((s) => s.remove())
    for (const [rotulo, obtido, esperado] of cenario.checar(dom.window.document)) {
      const ok = obtido === esperado
      console.log(`${ok ? 'OK   ' : 'FALHA'} ${cenario.nome} :: ${rotulo} = ${JSON.stringify(obtido)}`)
      if (!ok) falhas.push([cenario.nome, rotulo, `esperado ${JSON.stringify(esperado)}`])
    }
  }

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):`)
    for (const [nome, rotulo, detalhe] of falhas) console.error(`  - ${nome} :: ${rotulo} (${detalhe})`)
    console.error(`\nReproduza uma rota com:\n  ${CHROME} --headless=new --virtual-time-budget=15000 --dump-dom "${BASE}#/..."`)
    process.exit(1)
  }
  console.log(`\n${cenarios.length} cenarios, 0 falhas`)
}

main()
