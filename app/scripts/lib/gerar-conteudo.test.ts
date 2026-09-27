import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { Tema } from '../../src/domain/types'
import { gerarComRelatorio, gerarConteudo } from './gerar-conteudo'
import { htmlsDoConteudo, htmlsDoTema } from './htmls-do-conteudo'
import { declaracoesMortas, hrefsRelativos } from './links-material'
import { validar } from './validar-content'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const MATERIAL = path.resolve(AQUI, '..', '..', '..', 'conteudo')

/** O HTML inteiro de um tema, na ordem em que a tela o mostra. */
function htmlDoTema(tema: Tema | undefined): string {
  return tema ? htmlsDoTema(tema).join('\n') : ''
}

describe('gerarConteudo', () => {
  it('lança quando o diretório não existe', () => {
    expect(() => gerarConteudo('/caminho/que/nao/existe')).toThrow(/nao encontrado/)
  })

  it('devolve conteúdo vazio, sem lançar, para um diretório sem pastas de área', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-vazio-'))
    try {
      const c = gerarConteudo(tmp)
      expect(c.meta.totais).toEqual({ areas: 0, temas: 0, paginas: 0 })
      expect(c.areas).toEqual([])
      expect(validar(c, { areas: 0, temas: 0, paginas: 0 })).toEqual([])
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})

describe.skipIf(!fs.existsSync(MATERIAL))('contrato com o material real', () => {
  // A geracao inteira do material custa segundos: uma vez para o bloco todo.
  let cache: ReturnType<typeof gerarComRelatorio> | null = null
  const gerado = (): ReturnType<typeof gerarComRelatorio> => (cache ??= gerarComRelatorio(MATERIAL))

  it('parseia e valida os 18/109/22 sem erro', () => {
    expect(validar(gerado().conteudo)).toEqual([])
    expect(gerado().conteudo.meta.totais).toEqual({ areas: 18, temas: 109, paginas: 22 })
  })

  it('resolve todo link do material: nenhum defeito e nenhuma declaração morta', () => {
    const { links } = gerado()
    expect(links.erros).toEqual([])
    expect(declaracoesMortas(links)).toEqual([])
    // O material escreve 1328 links relativos; os declarados sem rota sao uma minoria contada.
    expect(links.paraRota).toBe(1196)
    expect(links.comoTexto).toBe(132)
    expect(links.intactos).toBe(586)
  })

  it('não deixa nenhum href relativo no HTML gerado', () => {
    // A conta que a fase 6 veio fechar: 1328 hrefs relativos viravam link morto no arquivo unico.
    // A varredura e a MESMA lista de campos que o portao usa (`htmls-do-conteudo.ts`), o que
    // inclui o HTML do pre-teste diagnostico das trilhas — fora de `intro`/`secoes`.
    expect(htmlsDoConteudo(gerado().conteudo).flatMap(hrefsRelativos)).toEqual([])
    expect(htmlsDoConteudo(gerado().conteudo).length).toBeGreaterThan(200)
  })

  it('troca as duas grafias do mesmo tema pela mesma rota', () => {
    // O guia de `01-fundamentos` cita o tema por `TEMA-06-....md`; o TEMA-01 de
    // `02-governanca` cita o MESMO arquivo por `../01-fundamentos/TEMA-06-....md`. Quem le nao
    // pode perceber a diferenca: as duas citacoes tem de abrir a mesma tela.
    const conteudo = gerado().conteudo
    const guia = conteudo.areas.find((a) => a.areaId === '01-fundamentos')?.guia
    const peloNome = guia?.secoes.map((s) => s.html).join('\n') ?? ''
    const peloRelativo = htmlDoTema(conteudo.temas['02-governanca-risco-compliance#TEMA-01'])
    expect(peloNome).toContain('href="#/tema/01-fundamentos/TEMA-06"')
    expect(peloRelativo).toContain('href="#/tema/01-fundamentos/TEMA-06"')
    // E o nome do arquivo nao sobrevive em href nenhum dos dois.
    expect(peloNome).not.toContain('.md"')
    expect(peloRelativo).not.toContain('.md"')
  })

  it('preserva a âncora do material como a seção do app', () => {
    // `15-fatores-humanos/TEMA-01` cita `../01-fundamentos/README.md#4-temas`; `4-temas` e o slug
    // do cabecalho `## 4. Temas` do guia, e a secao 4 e `secao-4` na tela da area.
    const html = htmlDoTema(gerado().conteudo.temas['15-fatores-humanos#TEMA-01'])
    expect(html).toContain('href="#/area/01-fundamentos/secao-4"')
  })

  it('só produz rota que o app sabe resolver, com a seção como último segmento', () => {
    // Espelha `hrefsInvalidos` (scripts/smoke.mjs) e `analisar` (src/ui/useRota.ts): os dois leem
    // os dois primeiros segmentos e ignoram o que vem depois — e e por isso que a ancora viaja
    // como segmento, e nao como um segundo `#` (que cairia dentro do areaId e viraria "area nao
    // encontrada"). Sem esta prova, a rota nova poderia passar no gate e morrer no clique.
    const conteudo = gerado().conteudo
    const rotas = new Set<string>()
    for (const area of conteudo.areas) rotas.add(`/area/${area.areaId}`)
    for (const ref of Object.keys(conteudo.temas)) {
      const [areaId, temaId] = ref.split('#')
      rotas.add(`/tema/${areaId}/${temaId}`)
    }
    for (const pagina of conteudo.paginas) rotas.add(`/pagina/${pagina.slug}`)

    const geradas = new Set<string>()
    const invalidas: string[] = []
    const colher = (html: string): void => {
      for (const match of html.matchAll(/href="(#\/[^"]*)"/g)) {
        const href = match[1] ?? ''
        const partes = href.replace(/^#\/?/, '').split('/')
        // Com ancora, o ultimo segmento e a secao (`secao-N`); sem, a rota termina no alvo.
        const semSecao = partes[partes.length - 1]?.startsWith('secao-') ? partes.slice(0, -1) : partes
        if (!rotas.has(`/${semSecao.join('/')}`)) invalidas.push(href)
        geradas.add(href)
      }
    }
    // A mesma lista de campos que o portao varre: guia, tema, pagina e o bloco de diagnostico da
    // trilha — que e onde os links do material para a area de origem aparecem.
    for (const html of htmlsDoConteudo(conteudo)) colher(html)
    // A varredura de fato visita o HTML da trilha: sem esta prova, uma lista de campos que
    // perdesse `trilha.diagnostico.itens[].origemHtml` continuaria verde aqui.
    const daTrilha = conteudo.paginas.find((p) => p.slug === '91-trilhas/plano-90-dias')?.trilha
    expect(htmlsDoConteudo(conteudo)).toContain(daTrilha?.diagnostico?.itens[0]?.origemHtml)
    expect(invalidas).toEqual([])
    expect(geradas.size).toBeGreaterThan(100)
    // A forma com `#` nao e rota que o app resolva: fica registrado aqui, e nao so na prosa.
    expect(
      conteudo.temas['01-fundamentos#TEMA-01']?.secoes.some((s) => s.html.includes('#/area/01-fundamentos#')),
    ).toBe(false)
  })

  it('declara sem rota só o que o material cita e o app não tem onde abrir', () => {
    const { links } = gerado()
    expect([...links.declaradosUsados.keys()].sort()).toEqual([
      'CONTRIBUTING.md',
      'templates',
      'templates/INDICE-TEMAS.md',
      'templates/RELACOES-TEMAS.md',
    ])
  })
})

/** O `idDaSecao` do app: a ancora gerada tem de continuar falando a lingua da tela. */
describe.skipIf(!fs.existsSync(path.join(AQUI, '..', '..', 'src', 'ui', 'Blocos.tsx')))(
  'contrato com a tela',
  () => {
    it('a seção da rota é o mesmo id que a tela usa', () => {
      const fonte = fs.readFileSync(
        path.resolve(AQUI, '..', '..', 'src', 'ui', 'Blocos.tsx'),
        'utf-8',
      )
      // `Blocos.idDaSecao` devolve `secao-N`, e `links-material.idDaSecao` escreve o mesmo nome.
      // Se a tela mudar o formato, este teste cai antes de o leitor cair num link que nao rola.
      expect(fonte).toContain('return `secao-${numero}`')
    })
  },
)
