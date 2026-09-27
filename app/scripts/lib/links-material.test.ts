// O mapa `caminho do material -> rota do app` e a resolucao de cada link.
//
// Os dois primeiros blocos usam fixtures em memoria (o mapa e o resolvedor nao tocam no disco); o
// ultimo escreve um material pequeno em diretorio temporario e confere o HTML gerado de ponta a
// ponta, porque e no HTML que o leitor esbarra.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import type { Conteudo } from '../../src/domain/types'
import { htmlsDoConteudo } from './htmls-do-conteudo'
import type { DestinoDeLink } from './markdown'
import { gerarComRelatorio } from './gerar-conteudo'
import {
  DECLARADOS_SEM_ROTA,
  declaracoesMortas,
  hrefsDeFragmento,
  hrefsRelativos,
  montarMapa,
  novoRelatorio,
  resolverCaminho,
  resolverDeLinks,
  type MaterialDoDisco,
  type RelatorioDeLinks,
} from './links-material'

// ---------------------------------------------------------------- fixtures em memoria

const FRONTMATTER = (temaId: string): string => `---
tema: "Tema ${temaId}"
tema_id: "${temaId}"
area_id: "01-fundamentos"
nivel: base
tempo_estimado: "30 min"
objetivo_aprendizagem: "fazer X"
---`

/** Guia com as secoes numeradas que a ancora do material endereca (`## 4. Temas` -> `4-temas`). */
const GUIA = `# Guia

## 1. Introdução
Texto.

## 4. Temas
Texto.

## 5. Pré-requisitos
Texto.`

function material(): MaterialDoDisco {
  return {
    diretorios: ['01-fundamentos', '02-outra', '99-fontes', 'templates'],
    arquivos: [
      'README.md',
      'glossario.md',
      'CONTRIBUTING.md',
      '01-fundamentos/README.md',
      '01-fundamentos/TEMA-01-um.md',
      '01-fundamentos/TEMA-02-dois.md',
      '01-fundamentos/anexos/nota.md',
      '02-outra/README.md',
      '02-outra/TEMA-01-tres.md',
      '99-fontes/indice-fontes.md',
      'templates/RELACOES-TEMAS.md',
    ],
    areas: [
      {
        areaId: '01-fundamentos',
        guia: GUIA,
        temas: [
          { caminho: '01-fundamentos/TEMA-01-um.md', texto: FRONTMATTER('TEMA-01') },
          { caminho: '01-fundamentos/TEMA-02-dois.md', texto: FRONTMATTER('TEMA-02') },
        ],
      },
      {
        areaId: '02-outra',
        guia: GUIA,
        temas: [{ caminho: '02-outra/TEMA-01-tres.md', texto: FRONTMATTER('TEMA-01') }],
      },
    ],
    paginas: [
      { slug: 'README', caminho: 'README.md', grupo: 'home', texto: '# Home' },
      { slug: 'glossario', caminho: 'glossario.md', grupo: 'referencia', texto: '# Glossário' },
      {
        slug: '99-fontes/indice-fontes',
        caminho: '99-fontes/indice-fontes.md',
        grupo: '99-fontes',
        texto: '# Índice',
      },
    ],
  }
}

const MAPA = montarMapa(material())

/** Resolve um href como se ele estivesse em `origem`, e devolve o destino com o relatorio. */
function resolver(
  origem: string,
  href: string,
  texto: string = href,
): { destino: DestinoDeLink; r: RelatorioDeLinks } {
  const r = novoRelatorio()
  return { destino: resolverDeLinks(MAPA, origem, r)(href, texto), r }
}

describe('montarMapa', () => {
  it('mapeia o guia da area, o tema e a pagina', () => {
    expect(MAPA.rotas.get('01-fundamentos/README.md')).toBe('#/area/01-fundamentos')
    expect(MAPA.rotas.get('01-fundamentos/TEMA-01-um.md')).toBe('#/tema/01-fundamentos/TEMA-01')
    expect(MAPA.rotas.get('99-fontes/indice-fontes.md')).toBe('#/pagina/99-fontes/indice-fontes')
  })

  it('usa o tema_id do frontmatter, e nao o nome do arquivo', () => {
    // O arquivo e o dono do texto; o frontmatter e o dono do id. Um arquivo renomeado continua
    // levando ao mesmo tema.
    const reescrito = material()
    const area = reescrito.areas[0]
    expect(area).toBeDefined()
    const mapa = montarMapa({
      ...reescrito,
      areas: [
        {
          areaId: '01-fundamentos',
          guia: GUIA,
          temas: [{ caminho: '01-fundamentos/TEMA-01-um.md', texto: FRONTMATTER('TEMA-07') }],
        },
        ...reescrito.areas.slice(1),
      ],
    })
    expect(mapa.rotas.get('01-fundamentos/TEMA-01-um.md')).toBe('#/tema/01-fundamentos/TEMA-07')
  })

  it('deixa o tema sem rota quando o frontmatter nao traz tema_id', () => {
    const reescrito = material()
    const mapa = montarMapa({
      ...reescrito,
      areas: [
        {
          areaId: '01-fundamentos',
          guia: GUIA,
          temas: [{ caminho: '01-fundamentos/TEMA-01-um.md', texto: '# sem frontmatter' }],
        },
      ],
    })
    expect(mapa.rotas.has('01-fundamentos/TEMA-01-um.md')).toBe(false)
  })

  it('da ao diretorio a rota do README que mora nele', () => {
    // `[91-trilhas/](../91-trilhas/)` e como o material cita a pasta: o destino real e o guia.
    expect(MAPA.rotas.get('01-fundamentos')).toBe('#/area/01-fundamentos')
  })

  it('conhece pastas e arquivos que existem, e nao so o que vira tela', () => {
    expect(MAPA.existentes.has('01-fundamentos/anexos/nota.md')).toBe(true)
    expect(MAPA.existentes.has('templates/RELACOES-TEMAS.md')).toBe(true)
    expect(MAPA.existentes.has('01-fundamentos/sumiu.md')).toBe(false)
  })

  it('traduz a ancora do cabecalho para a secao do app', () => {
    expect(MAPA.ancoras.get('01-fundamentos/README.md')?.get('4-temas')).toEqual([4])
    // Documento sem `## N.` nao expoe secao: nao ha ancora que chegue la.
    expect(MAPA.ancoras.get('01-fundamentos/TEMA-01-um.md')?.size).toBe(0)
  })
})

describe('resolverDeLinks', () => {
  it('leva o tema do mesmo diretorio para a rota dele', () => {
    const { destino } = resolver('01-fundamentos/TEMA-01-um.md', 'TEMA-02-dois.md')
    expect(destino).toEqual({ acao: 'trocar', href: '#/tema/01-fundamentos/TEMA-02' })
  })

  it('da a MESMA rota para as duas grafias do mesmo tema', () => {
    // As duas formas aparecem no material, e quem escreveu uma nao tinha como saber com que outra
    // o mesmo arquivo ja era citado em outro ponto.
    const mesmoDiretorio = resolver('01-fundamentos/TEMA-01-um.md', './TEMA-02-dois.md')
    const pelaArea = resolver('01-fundamentos/TEMA-01-um.md', '../01-fundamentos/TEMA-02-dois.md')
    expect(mesmoDiretorio.destino).toEqual({
      acao: 'trocar',
      href: '#/tema/01-fundamentos/TEMA-02',
    })
    expect(pelaArea.destino).toEqual(mesmoDiretorio.destino)
  })

  it('leva o README da propria area e o de outra area para a rota da area', () => {
    expect(resolver('01-fundamentos/TEMA-01-um.md', 'README.md').destino).toEqual({
      acao: 'trocar',
      href: '#/area/01-fundamentos',
    })
    expect(resolver('01-fundamentos/TEMA-01-um.md', '../02-outra/README.md').destino).toEqual({
      acao: 'trocar',
      href: '#/area/02-outra',
    })
  })

  it('leva o tema de outra area, com `../`, pela rota dele', () => {
    expect(resolver('01-fundamentos/TEMA-01-um.md', '../02-outra/TEMA-01-tres.md').destino).toEqual({
      acao: 'trocar',
      href: '#/tema/02-outra/TEMA-01',
    })
  })

  it('resolve dois niveis de `../` contra a pasta do documento', () => {
    // Nenhum documento do material mora tao fundo hoje, mas o mapa anda contra a pasta de origem
    // e nao contra o formato do caminho: quem escrever de dentro de uma subpasta acerta igual.
    expect(resolver('01-fundamentos/anexos/nota.md', '../../glossario.md').destino).toEqual({
      acao: 'trocar',
      href: '#/pagina/glossario',
    })
    expect(resolver('01-fundamentos/anexos/nota.md', '../../templates/RELACOES-TEMAS.md').destino).toEqual(
      { acao: 'texto' },
    )
  })

  it('preserva a ancora: o slug do material vira a secao do app', () => {
    const { destino } = resolver('01-fundamentos/TEMA-01-um.md', 'README.md#4-temas')
    // O fragmento pertence a ROTA (`#/area/...`), entao a secao viaja como ultimo segmento: e a
    // gramatica que `useRota.analisar` e o `hrefsInvalidos` do smoke ja aceitam.
    expect(destino).toEqual({ acao: 'trocar', href: '#/area/01-fundamentos/secao-4' })
  })

  it('reprova a ancora que nao existe no alvo', () => {
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', 'README.md#secao-que-nao-existe')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao e o slug de nenhuma secao')
    expect(r.paraRota).toBe(0)
  })

  it('reprova a ancora em documento que nao expoe secao numerada', () => {
    const { r } = resolver('01-fundamentos/TEMA-01-um.md', '../99-fontes/indice-fontes.md#qualquer')
    expect(r.erros.join('\n')).toContain('nao tem secao numerada')
  })

  it('tira a marca de link do caminho declarado sem rota, e conta o uso', () => {
    const { destino, r } = resolver(
      '01-fundamentos/TEMA-01-um.md',
      '../templates/RELACOES-TEMAS.md',
      'templates/RELACOES-TEMAS.md',
    )
    expect(destino).toEqual({ acao: 'texto' })
    expect(r.comoTexto).toBe(1)
    expect(r.declaradosUsados.get('templates/RELACOES-TEMAS.md')).toBe(1)
    expect(r.erros).toEqual([])
  })

  it('reprova o link declarado cujo texto nao nomeia o destino', () => {
    // Sem href, o texto do link e a unica pista do destino: um rotulo que nao nomeia o arquivo
    // deixaria o leitor do app sem saber para onde a referencia apontava.
    const { destino, r } = resolver(
      '01-fundamentos/TEMA-01-um.md',
      '../templates/RELACOES-TEMAS.md',
      'a ficha de relacoes',
    )
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao nomeia o arquivo')
    expect(r.comoTexto).toBe(0)
  })

  it('reprova o arquivo que nao existe no material', () => {
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', 'TEMA-99-sumiu.md')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao existe no material')
  })

  it('reprova o link para documento que existe, mas nao tem rota e nao esta declarado', () => {
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', 'anexos/nota.md')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao tem rota no app e nao esta declarado')
    expect(r.erros.join('\n')).toContain('DECLARADOS_SEM_ROTA')
  })

  it('nao muda o link externo nem o absoluto, e conta os dois como intactos', () => {
    const r = novoRelatorio()
    const resolverCom = resolverDeLinks(MAPA, '01-fundamentos/TEMA-01-um.md', r)
    expect(resolverCom('https://exemplo/1', 'https://exemplo/1')).toEqual({ acao: 'manter' })
    expect(resolverCom('mailto:alguem@exemplo', 'alguem@exemplo')).toEqual({ acao: 'manter' })
    expect(r.intactos).toBe(2)
    expect(r.erros).toEqual([])
  })

  it('aceita o fragmento que ja e rota do app, sem mexer nele', () => {
    // Contraprova da regra seguinte: o fragmento legitimo (a rota que o app resolve) continua
    // passando — sem ela, uma guarda que reprovasse TODO `#…` ficaria verde.
    for (const href of [
      '#/area/01-fundamentos',
      '#/area/01-fundamentos/secao-4',
      '#/tema/02-outra/TEMA-01',
      '#/pagina/glossario',
      '#/',
    ]) {
      const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', href)
      expect(destino, href).toEqual({ acao: 'manter' })
      expect(r.erros, href).toEqual([])
      expect(r.intactos, href).toBe(1)
    }
  })

  it('reprova o fragmento puro, que nao e rota do app', () => {
    // `#4-temas` e a grafia de ancora do GitHub — o material a escreve junto do arquivo
    // (`README.md#4-temas`), e sozinha ela nao leva a lugar nenhum: `analisar` a le como rota
    // "desconhecida" e a tela inteira cai em "Rota nao reconhecida".
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', '#4-temas')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao e rota do app')
    // `#` nu tambem nao abre tela nenhuma.
    expect(resolver('01-fundamentos/TEMA-01-um.md', '#').r.erros.join('\n')).toContain(
      'nao e rota do app',
    )
  })

  it('aceita a ancora da propria pagina quando o documento declara o `id`', () => {
    // `[nota](#nota)` com `<p id="nota">`: o alvo e um `id` DESTE documento, e a religacao
    // (`religarAncorasDoMaterial`) troca os dois pelo mesmo prefixo. Sem esta leitura, o resolvedor
    // reprovava o par e a religacao o aceitava — a contradicao em que o caso legitimo nunca
    // construia.
    const r = novoRelatorio()
    const destino = resolverDeLinks(MAPA, '01-fundamentos/TEMA-01-um.md', r, new Set(['nota']))(
      '#nota',
      'ir para a nota',
    )
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros).toEqual([])
    expect(r.intactos).toBe(1)
    // E so o alvo declarado: outro `#…` continua reprovando, com o mesmo relatorio.
    const outro = resolverDeLinks(MAPA, '01-fundamentos/TEMA-01-um.md', r, new Set(['nota']))(
      '#sumiu',
      'outro',
    )
    expect(outro).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('nao e rota do app')
  })

  it('reprova o fragmento de rota que o app nao tem', () => {
    // A rota existe na forma (`#/area/…`), mas a area nao: sem esta conferencia, o build aceitaria
    // um link que so o smoke de uma tela especifica pegaria.
    const { r } = resolver('01-fundamentos/TEMA-01-um.md', '#/area/99-inexistente')
    expect(r.erros.join('\n')).toContain('nao e rota do app')
    expect(resolver('01-fundamentos/TEMA-01-um.md', '#/pagina/sumiu').r.erros.join('\n')).toContain(
      'nao e rota do app',
    )
  })

  it('reprova a ancora ambigua quando duas secoes tem o mesmo cabecalho', () => {
    // Dois `## 4. Temas` no mesmo documento caem na MESMA ancora do GitHub, e nao ha como saber
    // para qual das duas o material apontava: escolher uma mandaria o leitor para a secao errada
    // metade das vezes.
    const repetido = material()
    const mapa = montarMapa({
      ...repetido,
      areas: [
        { areaId: '01-fundamentos', guia: `${GUIA}\n\n## 4. Temas\nTexto repetido.`, temas: [] },
      ],
    })
    const r = novoRelatorio()
    const destino = resolverDeLinks(mapa, '01-fundamentos/TEMA-01-um.md', r)(
      'README.md#4-temas',
      'temas',
    )
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('alcanca as secoes 4 e 4')
    expect(r.paraRota).toBe(0)
  })

  it('acusa o link que sai da raiz do material, sem trocar o href', () => {
    // Subir acima do material nao tem rota e nao e link externo — e defeito. O href fica como o
    // material escreveu (nao ha para onde trocar) e o relatorio acusa: sem isto o ramo contava o
    // link como "intacto" e so o portao (`hrefsRelativos`, que o `build:content` do `dev` nao
    // roda) o pegava.
    expect(resolverCaminho('01-fundamentos/README.md', '../../fora-do-material.md')).toBeNull()
    const { destino, r } = resolver('01-fundamentos/README.md', '../../fora-do-material.md')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('sai da raiz do material')
    expect(r.intactos).toBe(0)
  })

  it('acusa o link de caminho absoluto, que nao e caminho do material', () => {
    // `/x.md` nao e relativo a nada: fora do material ele e a raiz de onde o app foi aberto, onde
    // o arquivo nao existe. Nao muda de acao (nao ha rota) e nao passa mais em silencio.
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', '/fora/x.md')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('caminho absoluto')
    expect(r.intactos).toBe(0)
  })

  it('acusa o link protocol-relative, que leva a requisicao para outro host', () => {
    // `//host/x.md` comeca com `/`, mas nao e um caminho: o navegador o resolve contra o ESQUEMA
    // da pagina e busca em `host`, que nao e o app. E o mais perigoso dos tres, e o unico que
    // `hrefsRelativos` tambem pega — o relatorio precisa acusar os dois do mesmo jeito.
    const { destino, r } = resolver('01-fundamentos/TEMA-01-um.md', '//evil.example/x.md')
    expect(destino).toEqual({ acao: 'manter' })
    expect(r.erros.join('\n')).toContain('protocol-relative')
    expect(r.intactos).toBe(0)
  })

  it('acusa a declaracao que ninguem mais linka, e so ela', () => {
    const r = novoRelatorio()
    resolverDeLinks(MAPA, '01-fundamentos/TEMA-01-um.md', r)(
      '../templates/RELACOES-TEMAS.md',
      'templates/RELACOES-TEMAS.md',
    )
    const mortas = declaracoesMortas(r).join('\n')
    expect(mortas).toContain('declaracao sem uso')
    // A usada nao entra na lista — senao a lista viraria deposito.
    expect(mortas).not.toContain('"templates/RELACOES-TEMAS.md"')
    expect(DECLARADOS_SEM_ROTA.length).toBeGreaterThan(1)
  })

  it('acusa toda declaracao quando nenhum link usa nenhuma', () => {
    expect(declaracoesMortas(novoRelatorio())).toHaveLength(DECLARADOS_SEM_ROTA.length)
  })
})

describe('hrefsRelativos', () => {
  it('encontra o relativo e ignora rota, ancora e externo', () => {
    const html =
      '<a href="TEMA-02-dois.md">a</a> <a href="#/tema/01-fundamentos/TEMA-02">b</a> ' +
      '<a href="https://exemplo/1">c</a> <a href="../templates/RELACOES-TEMAS.md">d</a>'
    expect(hrefsRelativos(html)).toEqual(['TEMA-02-dois.md', '../templates/RELACOES-TEMAS.md'])
  })

  it('nao acusa HTML sem href relativo nenhum', () => {
    expect(hrefsRelativos('<p>texto</p><a href="#/pagina/glossario">g</a>')).toEqual([])
  })
})

describe('hrefsDeFragmento', () => {
  it('lista todo href com #, inclusive o que nao e rota', () => {
    const html =
      '<a href="#/tema/01-fundamentos/TEMA-02">b</a> <a href="#4-temas">c</a> ' +
      '<a href="TEMA-02-dois.md">a</a> <a href="https://exemplo/1">d</a>'
    expect(hrefsDeFragmento(html)).toEqual(['#/tema/01-fundamentos/TEMA-02', '#4-temas'])
  })
})

// ---------------------------------------------------------------- material em disco

const RAIZ = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-links-'))
afterAll(() => fs.rmSync(RAIZ, { recursive: true, force: true }))

function escrever(caminho: string, texto: string): void {
  const destino = path.join(RAIZ, caminho)
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, texto, 'utf-8')
}

/**
 * O tema que fecha o material do disco. Ele cita o guia, o tema irmao (das duas grafias), um tema
 * de outra area, uma pagina de catalogo, uma ficha de autoria e um link externo.
 *
 * Cada teste reescreve este arquivo e regera o material: a geracao e a unidade, e um caso nao
 * pode herdar o material do caso anterior.
 */
const TEMA2 = `${FRONTMATTER('TEMA-02')}\n\n# Tema dois`

function comTema2(tema2: string = TEMA2): { conteudo: Conteudo; links: RelatorioDeLinks } {
  escrever('01-fundamentos/TEMA-02-dois.md', tema2)
  return gerarComRelatorio(RAIZ)
}

escrever(
  '01-fundamentos/README.md',
  `# Fundamentos

## 1. Introdução
Texto.

## 4. Temas
Texto.`,
)
escrever(
  '01-fundamentos/TEMA-01-um.md',
  `${FRONTMATTER('TEMA-01')}

# Tema um

[irmão](./TEMA-02-dois.md) · [pela área](../01-fundamentos/TEMA-02-dois.md) ·
[guia](README.md) · [outra área](../02-outra/README.md) ·
[outro tema](../02-outra/TEMA-01-tres.md) ·
[índice](../99-fontes/indice-fontes.md) ·
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md) ·
[fora](https://exemplo/1) · [âncora](README.md#4-temas)`,
)
escrever('02-outra/README.md', '# Outra\n\n## 1. Introdução\nTexto.')
escrever('02-outra/TEMA-01-tres.md', `${FRONTMATTER('TEMA-01')}\n\n# Tema três`)
escrever('99-fontes/indice-fontes.md', '# Índice de fontes')
escrever('templates/RELACOES-TEMAS.md', '# Formato das relações')
escrever('README.md', '# Home\n\n[guia](./01-fundamentos/README.md)')
escrever('glossario.md', '# Glossário')
escrever('CONTRIBUTING.md', '# Como contribuir')

describe('geracao do material em disco', () => {
  it('troca cada link pela rota do alvo e nao deixa href relativo no HTML', () => {
    const { conteudo } = comTema2()
    // A lista de campos e a mesma do portao (`htmls-do-conteudo.ts`), trilha incluida.
    expect(htmlsDoConteudo(conteudo).flatMap(hrefsRelativos)).toEqual([])
  })

  it('respeita o destino de cada link: rota, texto ou intacto', () => {
    const { conteudo, links } = comTema2()
    const tema = conteudo.temas['01-fundamentos#TEMA-01']
    expect(tema).toBeDefined()
    const html = [tema?.intro, ...(tema?.secoes.map((s) => s.html) ?? [])].join('\n')

    // Rota, nas quatro formas que o material usa: tema do mesmo diretorio, tema da propria area
    // pela outra grafia, guia, area vizinha, pagina de catalogo e ancora.
    expect(html).toContain('href="#/tema/01-fundamentos/TEMA-02"')
    expect(html).toContain('href="#/area/01-fundamentos"')
    expect(html).toContain('href="#/area/02-outra"')
    expect(html).toContain('href="#/tema/02-outra/TEMA-01"')
    expect(html).toContain('href="#/pagina/99-fontes/indice-fontes"')
    expect(html).toContain('href="#/area/01-fundamentos/secao-4"')
    // Externo: nao muda.
    expect(html).toContain('href="https://exemplo/1"')

    expect(links.erros).toEqual([])
    expect(links.paraRota).toBe(8)
    expect(links.comoTexto).toBe(1)
    expect(links.intactos).toBe(1)
  })

  it('tira a marca de link do caminho declarado sem rota, sem apagar a referencia', () => {
    const { conteudo } = comTema2()
    const tema = conteudo.temas['01-fundamentos#TEMA-01']
    const html = [tema?.intro, ...(tema?.secoes.map((s) => s.html) ?? [])].join('\n')
    expect(html).toContain('templates/RELACOES-TEMAS.md')
    expect(html).not.toContain('../templates/RELACOES-TEMAS.md')
  })

  it('acusa a declaracao que o material deixa de linkar', () => {
    // A ficha e a unica declaracao que o material deste fixture linka; as outras tres nascem
    // sem uso, e e assim que a lista e cobrada.
    const { links } = comTema2()
    const mortas = declaracoesMortas(links).join('\n')
    expect(mortas).toContain('"CONTRIBUTING.md"')
    expect(mortas).not.toContain('"templates/RELACOES-TEMAS.md"')
  })

  it('reprova o link para arquivo que nao existe, e deixa o defeito visivel no HTML', () => {
    // A mutacao e no material, e nao no codigo: o gerador recusa inventar rota, o href relativo
    // continua no HTML e o portao tem por onde reprovar.
    const { conteudo, links } = comTema2(`${TEMA2}\n\n[sumiu](./TEMA-99-sumiu.md)`)
    expect(links.erros.join('\n')).toContain('nao existe no material')
    expect(hrefsRelativos(conteudo.temas['01-fundamentos#TEMA-02']?.intro ?? '')).toEqual([
      './TEMA-99-sumiu.md',
    ])
  })

  it('reprova o link novo para documento sem rota e sem declaracao', () => {
    escrever('01-fundamentos/anexos/nota.md', '# Nota')
    const { conteudo, links } = comTema2(`${TEMA2}\n\n[nota](./anexos/nota.md)`)
    expect(links.erros.join('\n')).toContain('nao tem rota no app e nao esta declarado')
    expect(hrefsRelativos(conteudo.temas['01-fundamentos#TEMA-02']?.intro ?? '')).toEqual([
      './anexos/nota.md',
    ])
  })

  it('acusa o link que sai do material e o protocol-relative, e deixa os dois visiveis no HTML', () => {
    // A mutacao e no MATERIAL: `../../../etc/passwd` sobe acima da raiz e `//evil.example/x.md`
    // nem e caminho do material. Nenhum dos dois tem rota para onde trocar, entao os dois ficam
    // como escritos e os dois entram no relatorio. Sem essa acusacao, `npm run build:content`
    // (o caminho do `dev`) terminava sem erro nenhum, e quem reprovava era so o portao do
    // `check:content`, pelo href que sobra no HTML.
    const { conteudo, links } = comTema2(
      `${TEMA2}\n\n[fora](../../../etc/passwd) · [host](//evil.example/x.md)`,
    )
    const erros = links.erros.join('\n')
    expect(erros).toContain('sai da raiz do material')
    expect(erros).toContain('protocol-relative')

    const html = conteudo.temas['01-fundamentos#TEMA-02']?.intro ?? ''
    expect(html).toContain('href="../../../etc/passwd"')
    expect(html).toContain('href="//evil.example/x.md"')
    // E o portao continua com por onde reprovar: os dois sobreviveram fora de qualquer rota.
    expect(hrefsRelativos(html)).toEqual(['../../../etc/passwd', '//evil.example/x.md'])
  })

  it('reprova o fragmento puro escrito no material, e deixa o defeito visivel no HTML', () => {
    // A mutacao e no MATERIAL, e nao no codigo: `#4-temas` sozinho e a forma curta da ancora que o
    // material escreve junto do arquivo. O resolvedor o mantem (nao ha rota para onde trocar), o
    // href continua no HTML, e o relatorio acusa — e e essa acusacao que o portao faz build falhar.
    const { conteudo, links } = comTema2(`${TEMA2}\n\n[temas](#4-temas)`)
    expect(links.erros.join('\n')).toContain('nao e rota do app')
    const html = conteudo.temas['01-fundamentos#TEMA-02']?.intro ?? ''
    expect(hrefsDeFragmento(html)).toEqual(['#4-temas'])
    // O href nao virou caminho relativo: sao duas regras, e cada uma acusa o seu defeito.
    expect(hrefsRelativos(html)).toEqual([])
  })

  it('constroi a ancora da propria pagina, com o alvo em outra secao', () => {
    // O caso que o portao e a religacao se contradiziam: `[nota](#nota)` com `<p id="nota">`. O
    // link esta no intro e o alvo na secao 2 — a tela monta os dois na MESMA pagina, entao o par
    // tem de sair alinhado (id e href com o mesmo prefixo) e sem defeito no relatorio.
    const comSecoes =
      `${TEMA2}\n\n## 1. Objetivo\n\n[ir para a nota](#nota)\n\n## 2. Nota\n\n<p id="nota">aviso do material</p>`
    const { conteudo, links } = comTema2(comSecoes)

    expect(links.erros).toEqual([])
    const tema = conteudo.temas['01-fundamentos#TEMA-02']
    const html = [tema?.intro, ...(tema?.secoes.map((s) => s.html) ?? [])].join('\n')
    expect(html).toContain('href="#material-nota"')
    expect(html).toContain('id="material-nota"')
    // E o `id` do material nao sobrevive sem o prefixo — e ele que o mantem fora do caminho das
    // ancoras do app (`secao-N`, `checklist-da-trilha`).
    expect(html).not.toContain('id="nota"')
    expect(htmlsDoConteudo(conteudo).flatMap(hrefsRelativos)).toEqual([])
  })
})
