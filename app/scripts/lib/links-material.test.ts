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
import type { DestinoDeLink } from './markdown'
import { gerarComRelatorio } from './gerar-conteudo'
import {
  DECLARADOS_SEM_ROTA,
  declaracoesMortas,
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

  it('nao muda o link que sai da raiz do material', () => {
    expect(resolverCaminho('01-fundamentos/README.md', '../../fora-do-material.md')).toBeNull()
    expect(resolver('01-fundamentos/README.md', '../../fora-do-material.md').destino).toEqual({
      acao: 'manter',
    })
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

/** O HTML inteiro do conteudo gerado, como o portao o varre. */
function htmlDoConteudo(conteudo: Conteudo): string[] {
  return [
    ...conteudo.areas.flatMap((a) => [a.guia.intro, ...a.guia.secoes.map((s) => s.html)]),
    ...Object.values(conteudo.temas).flatMap((t) => [t.intro, ...t.secoes.map((s) => s.html)]),
    ...conteudo.paginas.flatMap((p) => [p.intro, ...p.secoes.map((s) => s.html)]),
  ]
}

describe('geracao do material em disco', () => {
  it('troca cada link pela rota do alvo e nao deixa href relativo no HTML', () => {
    const { conteudo } = comTema2()
    expect(htmlDoConteudo(conteudo).flatMap(hrefsRelativos)).toEqual([])
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
})
