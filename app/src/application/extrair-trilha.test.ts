// A extracao do diagnostico e das fases das trilhas, a partir do HTML que o build gera.
//
// O HTML de apoio e o que o `build:content` produziu para o `### 1.1 Pre-teste diagnostico` e para
// a secao 3 do `plano-12-meses` — copiado do `content.json`, com os links ja resolvidos, e nao
// escrito a mao: e o contrato entre o parser do build e este leitor.
//
// O segundo bloco confere o CONTEUDO GERADO: as tres trilhas do material precisam sair da extracao
// com dez itens e as faixas que o proprio material escreve. Sem ele, uma revisao do material que
// mudasse a forma da secao 1.1 deixaria a tela sem diagnostico em silencio.

import { beforeAll, describe, expect, it } from 'vitest'
import { carregar, content } from '../infrastructure/content/repository'
import type { Pagina, Secao } from '../domain/types'
import { areasDaCelula, extrairTrilha, lerDiagnostico, limitesDoRotulo, tabelaDasFases, tabelasCruas } from './extrair-trilha'

const AREAS = ['00-guia-basico', '01-fundamentos', '17-lideranca-ciso', '02-governanca-risco-compliance']

/** O bloco `1.1` como o build o produz (recorte do content.json do plano de 12 meses). */
const SECAO_COM_DIAGNOSTICO = `<table>
<thead>
<tr>
<th>Item</th>
<th>Valor</th>
</tr>
</thead>
<tbody>
<tr>
<td>Cargo atual</td>
<td>CISO</td>
</tr>
</tbody>
</table>
<h3>1.1 Pré-teste diagnóstico</h3>
<p>Dez itens, dos checkpoints das áreas iniciais.</p>
<table>
<thead>
<tr>
<th>#</th>
<th>Origem do item</th>
<th>Acertei</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td><a href="#/area/00-guia-basico">00 Guia básico do CISO</a>, checkpoint, item 3</td>
<td>sim/não</td>
</tr>
<tr>
<td>2</td>
<td><a href="#/area/01-fundamentos">01 Fundamentos</a>, checkpoint, item 2</td>
<td>sim/não</td>
</tr>
</tbody>
</table>
<table>
<thead>
<tr>
<th>Acertos</th>
<th>Ponto de entrada</th>
</tr>
</thead>
<tbody>
<tr>
<td>0 a 3</td>
<td>Fase 1 pelo TEMA-01 de 00, sem pular tema</td>
</tr>
<tr>
<td>4 a 7</td>
<td>Fase 1 pelo TEMA-01 de 00, com 01 lido como revisão em duas semanas</td>
</tr>
<tr>
<td>8 a 10</td>
<td>Fases 1 e 2 comprimidas, e a semana liberada vai para a Fase 3</td>
</tr>
</tbody>
</table>
<p>Quem já percorreu o <a href="#/pagina/91-trilhas/plano-90-dias">plano de 90 dias</a> entra na Fase 2.</p>`

/** A tabela de fases (secao 3) do plano de 12 meses, com as colunas do material. */
const SECAO_DAS_FASES = `<table>
<thead>
<tr>
<th>Fase</th>
<th>Semanas</th>
<th>Áreas (ordem_estudo)</th>
<th>Carga</th>
<th>Marco de saída</th>
</tr>
</thead>
<tbody>
<tr>
<td>1 Vocabulário e cargo</td>
<td>1 a 6</td>
<td>00, 01, 17</td>
<td>24,9–28,0 h</td>
<td>Checkpoint de 00 com 4 em 5 e o de 17 com 80%</td>
</tr>
<tr>
<td>6 Segunda passagem</td>
<td>43 a 52</td>
<td>todas</td>
<td>54,5 h</td>
<td>Checkpoint intercalado de cada área</td>
</tr>
</tbody>
</table>
<table>
<thead>
<tr>
<th>Fase</th>
<th>Sequência</th>
<th>Duas semanas por área, exceto onde anotado</th>
</tr>
</thead>
<tbody>
<tr>
<td>1</td>
<td>00 (1 semana) → 01 (2 semanas)</td>
<td>6 semanas</td>
</tr>
</tbody>
</table>`

function pagina(secoes: Secao[]): Pagina {
  return { slug: '91-trilhas/plano-12-meses', titulo: 'Plano', grupo: '91-trilhas', intro: '', secoes, mermaid: [] }
}

describe('limitesDoRotulo', () => {
  it('lê os limites da forma como o material escreve', () => {
    expect(limitesDoRotulo('0 a 3')).toEqual({ de: 0, ate: 3 })
    expect(limitesDoRotulo('8 a 10')).toEqual({ de: 8, ate: 10 })
    expect(limitesDoRotulo('4-7')).toEqual({ de: 4, ate: 7 })
  })

  it('não inventa limite para rótulo que não é uma faixa', () => {
    expect(limitesDoRotulo('8 ou mais')).toBeNull()
    expect(limitesDoRotulo('0 a 3 acertos')).toBeNull()
    expect(limitesDoRotulo('7 a 4')).toBeNull()
  })
})

describe('areasDaCelula', () => {
  it('resolve o código solto na ordem em que o material lista', () => {
    expect(areasDaCelula('00, 01, 17', AREAS)).toEqual(['00-guia-basico', '01-fundamentos', '17-lideranca-ciso'])
  })

  it('resolve o link para a área, que é a forma do plano de 90 dias', () => {
    expect(
      areasDaCelula('<a href="#/area/01-fundamentos">01 Fundamentos</a>, 8 temas', AREAS),
    ).toEqual(['01-fundamentos'])
  })

  it('não lê "TEMA-01" como a área 01', () => {
    // "02 GRC, TEMA-01, TEMA-02 e TEMA-03" é a célula do plano de 90 dias: sem a guarda, a fase
    // de 02 apareceria com a área 01 pendurada nela.
    expect(
      areasDaCelula('<a href="#/area/02-governanca-risco-compliance">02 GRC</a>, TEMA-01 e TEMA-03', AREAS),
    ).toEqual(['02-governanca-risco-compliance'])
  })

  it('não lê a contagem de temas ("17 temas") como a área 17', () => {
    // A célula do plano lista a área e a contagem de temas depois dela. Casar dois dígitos em
    // qualquer lugar do texto fazia o "17" (o número de temas) virar a área 17, e a fase ganhava
    // uma área a mais.
    expect(
      areasDaCelula('<a href="#/area/01-fundamentos">01 Fundamentos</a>, 17 temas', AREAS),
    ).toEqual(['01-fundamentos'])
    // E sem o link, "17 temas" não nomeia área nenhuma: o código tem de ser o item inteiro.
    expect(areasDaCelula('01 Fundamentos, 17 temas', AREAS)).toEqual([])
  })

  it('lê a célula real da fase do plano de 90 dias', () => {
    // Fase 1: o link da área mais a contagem de temas ("5 temas"). O número não inventa área.
    expect(
      areasDaCelula('<a href="#/area/00-guia-basico">00 Guia básico do CISO</a>, 5 temas', AREAS),
    ).toEqual(['00-guia-basico'])
  })

  it('lê a lista de códigos separada por "e"', () => {
    // A forma dos planos de 12 e 24 meses usa vírgula; a conjunção "e" é o mesmo item de lista.
    expect(areasDaCelula('00 e 01', AREAS)).toEqual(['00-guia-basico', '01-fundamentos'])
  })

  it('"todas" vale pelas áreas do conteúdo', () => {
    expect(areasDaCelula('todas', AREAS)).toEqual(AREAS)
  })

  it('célula que não nomeia área devolve lista vazia', () => {
    expect(areasDaCelula('revisão dirigida pelas áreas da credencial escolhida', AREAS)).toEqual([])
  })
})

describe('lerDiagnostico', () => {
  it('lê o título, os itens e as faixas do material', () => {
    const lido = lerDiagnostico({ numero: 1, titulo: 'Perfil', html: SECAO_COM_DIAGNOSTICO })
    expect(lido).not.toBeNull()
    const d = lido!.diagnostico
    expect(d.secao).toBe(1)
    expect(d.titulo).toBe('1.1 Pré-teste diagnóstico')
    expect(d.itens).toHaveLength(2)
    expect(d.itens[0]?.numero).toBe('1')
    expect(d.itens[0]?.origemHtml).toContain('#/area/00-guia-basico')
    expect(d.cabecalhoDasFaixas).toEqual(['Acertos', 'Ponto de entrada'])
    expect(d.faixas.map((f) => [f.rotulo, f.de, f.ate])).toEqual([
      ['0 a 3', 0, 3],
      ['4 a 7', 4, 7],
      ['8 a 10', 8, 10],
    ])
    expect(d.introHtml).toContain('Dez itens')
    expect(d.notaHtml).toContain('plano de 90 dias')
  })

  it('tira a região do HTML da seção, mantendo o que vem antes', () => {
    const lido = lerDiagnostico({ numero: 1, titulo: 'Perfil', html: SECAO_COM_DIAGNOSTICO })!
    expect(lido.html).toContain('Cargo atual')
    expect(lido.html).not.toContain('Pré-teste diagnóstico')
    // O que o material escreve em volta das tabelas não fica em dois lugares: a abertura e a
    // nota viajam com o bloco, e não sobraram no HTML da seção.
    expect(lido.html).not.toContain('plano de 90 dias')
    expect(lido.html.trim().endsWith('</table>')).toBe(true)
  })

  it('devolve null quando falta o bloco ou a tabela dos itens', () => {
    expect(lerDiagnostico({ numero: 1, titulo: 's', html: '<p>só prosa</p>' })).toBeNull()
    // O h3 sem a tabela dos itens: sem a coluna "Origem do item" não há o que o estudante leia.
    expect(
      lerDiagnostico({ numero: 1, titulo: 's', html: '<h3>1.1 Pré-teste diagnóstico</h3><p>sem tabela</p>' }),
    ).toBeNull()
  })

  it('vale sem a tabela das faixas, com os itens e sem ponto de entrada', () => {
    const semFaixas = SECAO_COM_DIAGNOSTICO.slice(0, SECAO_COM_DIAGNOSTICO.indexOf('<table>\n<thead>\n<tr>\n<th>Acertos'))
    const lido = lerDiagnostico({ numero: 1, titulo: 'Perfil', html: semFaixas })
    expect(lido?.diagnostico.itens).toHaveLength(2)
    expect(lido?.diagnostico.faixas).toEqual([])
  })
})

describe('tabelaDasFases', () => {
  it('escolhe a tabela de fases e não a de sequência', () => {
    const tabela = tabelaDasFases([{ numero: 3, titulo: 'Fases e marcos', html: SECAO_DAS_FASES }])
    expect(tabela).not.toBeNull()
    expect(tabela!.cabecalho).toContain('Marco de saída')
    expect(tabela!.linhas).toHaveLength(2)
  })

  it('devolve null quando nenhuma tabela tem as três colunas', () => {
    const soSequencia = SECAO_DAS_FASES.slice(SECAO_DAS_FASES.lastIndexOf('<table>'))
    expect(tabelaDasFases([{ numero: 3, titulo: 's', html: soSequencia }])).toBeNull()
  })
})

describe('extrairTrilha', () => {
  const secoes = [
    { numero: 1, titulo: 'Perfil e ponto de partida', html: SECAO_COM_DIAGNOSTICO },
    { numero: 3, titulo: 'Fases e marcos', html: SECAO_DAS_FASES },
  ]

  it('devolve o diagnóstico e as fases, com as seções sem a região do diagnóstico', () => {
    const extraida = extrairTrilha(pagina(secoes), AREAS)!
    expect(extraida.trilha.diagnostico?.itens).toHaveLength(2)
    expect(extraida.trilha.fases).toHaveLength(2)
    expect(extraida.trilha.fases[0]).toEqual({
      rotulo: '1 Vocabulário e cargo',
      periodo: '1 a 6',
      areas: ['00-guia-basico', '01-fundamentos', '17-lideranca-ciso'],
      marco: 'Checkpoint de 00 com 4 em 5 e o de 17 com 80%',
    })
    expect(extraida.trilha.fases[1]?.areas).toEqual(AREAS)
    expect(extraida.secoes[0]?.html).not.toContain('Pré-teste diagnóstico')
    // A seção das fases fica intacta: a tabela de fases continua na tela do material.
    expect(extraida.secoes[1]?.html).toContain('Marco de saída')
  })

  it('devolve null para página que não é trilha', () => {
    expect(extrairTrilha(pagina([{ numero: 1, titulo: 's', html: '<p>nada</p>' }]), AREAS)).toBeNull()
  })

  it('aceita trilha com fases e sem diagnóstico', () => {
    const extraida = extrairTrilha(pagina([{ numero: 3, titulo: 'Fases', html: SECAO_DAS_FASES }]), AREAS)!
    expect(extraida.trilha.diagnostico).toBeNull()
    expect(extraida.trilha.fases).toHaveLength(2)
  })

  it('fica com o PRIMEIRO bloco de pré-teste quando a página traz dois', () => {
    // Uma revisão do material pode deixar duas regiões de pré-teste na mesma página (uma seção
    // repetida por engano, ou o bloco de uma trilha anterior que ninguém removeu). O ponto de
    // entrada é UM só, e é o da primeira seção — `if (lido && !diagnostico)` é o que garante
    // isso: sem o `!diagnostico`, o segundo bloco sobrescreveria o primeiro, e a página passaria a
    // mostrar os dez itens da seção de baixo mantendo o título da seção de cima.
    const segundaRegiao = SECAO_COM_DIAGNOSTICO.replace(
      '<h3>1.1 Pré-teste diagnóstico</h3>',
      '<h3>1.2 Pré-teste diagnóstico</h3>',
    ).replace('<p>Dez itens, dos checkpoints das áreas iniciais.</p>', '<p>Cópia da região.</p>')

    const extraida = extrairTrilha(
      pagina([
        { numero: 1, titulo: 'Perfil e ponto de partida', html: SECAO_COM_DIAGNOSTICO },
        { numero: 2, titulo: 'Perfil repetido', html: segundaRegiao },
        { numero: 3, titulo: 'Fases e marcos', html: SECAO_DAS_FASES },
      ]),
      AREAS,
    )!

    expect(extraida.trilha.diagnostico?.secao).toBe(1)
    expect(extraida.trilha.diagnostico?.titulo).toBe('1.1 Pré-teste diagnóstico')
    expect(extraida.trilha.diagnostico?.introHtml).toContain('Dez itens')
    expect(extraida.trilha.diagnostico?.itens).toHaveLength(2)
    expect(extraida.trilha.diagnostico?.notaHtml).toContain('plano de 90 dias')
    // A tabela de fases continua sendo lida junto do diagnóstico, e não em vez dele.
    expect(extraida.trilha.fases).toHaveLength(2)
    // As duas regiões saem das seções: nenhuma delas fica na tela como HTML tratado, e os itens
    // não aparecem duas vezes (nem com clique, nem sem).
    expect(extraida.secoes[0]?.html).not.toContain('Pré-teste diagnóstico')
    expect(extraida.secoes[1]?.html).not.toContain('Pré-teste diagnóstico')
    expect(extraida.secoes[2]?.html).toContain('Marco de saída')
  })
})

describe('o conteúdo gerado das três trilhas', () => {
  beforeAll(async () => {
    await carregar()
  })

  const SLUGS = ['91-trilhas/plano-90-dias', '91-trilhas/plano-12-meses', '91-trilhas/plano-24-meses']

  it('traz as três trilhas com dez itens e três faixas cada', () => {
    for (const slug of SLUGS) {
      const p = content.paginas.find((x) => x.slug === slug)
      const d = p?.trilha?.diagnostico
      expect(d, slug).toBeTruthy()
      expect(d!.itens, slug).toHaveLength(10)
      expect(d!.faixas, slug).toHaveLength(3)
      // As faixas do material: 0 a 3, 4 a 7, 8 a 10 — os mesmos limites nos três planos.
      expect(d!.faixas.map((f) => f.rotulo), slug).toEqual(['0 a 3', '4 a 7', '8 a 10'])
      expect(d!.faixas.every((f) => f.pontoDeEntrada.length > 10), slug).toBe(true)
      expect(d!.cabecalhoDasFaixas, slug).toEqual(['Acertos', 'Ponto de entrada'])
      // O item traz o link do material para a área, já resolvido para a rota do app.
      expect(d!.itens[0]?.origemHtml, slug).toContain('href="#/area/')
      // A região não ficou no HTML da seção: o material não se repete na tela.
      const secao1 = p!.secoes.find((s) => s.numero === d!.secao)
      expect(secao1?.html, slug).not.toContain('Pré-teste diagnóstico')
    }
  })

  it('traz as fases de cada trilha ligadas às áreas que existem', () => {
    const ids = new Set(content.areas.map((a) => a.areaId))
    for (const slug of SLUGS) {
      const p = content.paginas.find((x) => x.slug === slug)
      const fases = p?.trilha?.fases ?? []
      expect(fases.length, slug).toBeGreaterThanOrEqual(5)
      for (const fase of fases) {
        expect(fase.rotulo, slug).not.toBe('')
        expect(fase.marco, slug).not.toBe('')
        for (const area of fase.areas) expect(ids.has(area), `${slug}: ${area}`).toBe(true)
      }
      // Cada trilha liga as suas áreas a alguma fase: sem isso o checklist sairia vazio.
      expect(new Set(fases.flatMap((f) => f.areas)).size, slug).toBeGreaterThanOrEqual(4)
    }
  })

  it('não dá trilha às páginas que não são trilha', () => {
    for (const p of content.paginas) {
      if (SLUGS.includes(p.slug)) continue
      expect(p.trilha ?? null, p.slug).toBeNull()
    }
  })
})

// ------------------------------------------------------------------ tabelas cruas

describe('tabelasCruas', () => {
  it('deixa de fora a tabela sem cabeçalho e a que não tem nenhuma linha inteira', () => {
    // `<table>` sem `<tr>`, ou com um `<tr>` sem célula nenhuma, não tem cabeçalho: sem coluna não
    // há registro. E a linha cujo número de células não fecha com o cabeçalho é descartada — sem
    // nenhuma linha inteira, a tabela sai em vez de virar registro torto.
    expect(tabelasCruas('<table></table>')).toEqual([])
    expect(tabelasCruas('<table><tr></tr><tr><td>1</td></tr></table>')).toEqual([])
    expect(tabelasCruas('<table><tr><th>a</th><th>b</th></tr><tr><td>1</td></tr></table>')).toEqual([])
  })

  it('preserva a marcação das células e a posição de cada tabela', () => {
    // O link da coluna "Área" mora na célula: a leitura do HTML não pode tê-lo removido, senão a
    // fase perde a ligação com a área.
    const tabelas = tabelasCruas('texto<table><tr><th>#</th></tr><tr><td><a href="#/x">1</a></td></tr></table>')
    expect(tabelas).toHaveLength(1)
    expect(tabelas[0]?.linhas).toEqual([['<a href="#/x">1</a>']])
    expect(tabelas[0]?.inicio).toBe(5)
  })
})

describe('ramos de tabela incompleta do material', () => {
  it('numera o item pela posição quando a tabela não tem a coluna "#"', () => {
    // A coluna "#" é do material e pode faltar numa revisão: sem ela, a posição da linha é o
    // número do item — o que não pode acontecer é o item ficar sem número.
    const semNumero = `<h3>1.1 Pré-teste diagnóstico</h3>
<p>Dez itens.</p>
<table>
<thead><tr><th>Origem do item</th><th>Acertei</th></tr></thead>
<tbody>
<tr><td><a href="#/area/00-guia-basico">00</a>, item 1</td><td>sim/não</td></tr>
<tr><td><a href="#/area/01-fundamentos">01</a>, item 2</td><td>sim/não</td></tr>
</tbody>
</table>`
    const lido = lerDiagnostico({ numero: 1, titulo: 'Perfil', html: semNumero })
    expect(lido?.diagnostico.itens.map((i) => i.numero)).toEqual(['1', '2'])
  })

  it('devolve null quando todas as linhas de item são vazias', () => {
    // Sem a coluna "Origem do item" preenchida não há o texto que o estudante lê: o bloco inteiro
    // sai, em vez de virar um diagnóstico de itens em branco.
    const html = `<h3>1.1 Pré-teste diagnóstico</h3>
<table>
<thead><tr><th>#</th><th>Origem do item</th></tr></thead>
<tbody><tr><td>1</td><td></td></tr></tbody>
</table>`
    expect(lerDiagnostico({ numero: 1, titulo: 'Perfil', html })).toBeNull()
  })

  it('descarta a faixa cujo rótulo não é intervalo ou cujo ponto de entrada está vazio', () => {
    // O rótulo é do material: "8 ou mais" não é uma faixa (o parser não inventa limite) e, sem o
    // texto do ponto de entrada, a linha não diz aonde os acertos levam.
    const html = `<h3>1.1 Pré-teste diagnóstico</h3>
<table>
<thead><tr><th>#</th><th>Origem do item</th></tr></thead>
<tbody><tr><td>1</td><td><a href="#/area/00-guia-basico">00</a>, item 1</td></tr></tbody>
</table>
<table>
<thead><tr><th>Acertos</th><th>Ponto de entrada</th></tr></thead>
<tbody>
<tr><td>8 ou mais</td><td>Fase 1</td></tr>
<tr><td>0 a 3</td><td></td></tr>
<tr><td>4 a 7</td><td>Fase 1 pelo TEMA-01</td></tr>
</tbody>
</table>`
    const lido = lerDiagnostico({ numero: 1, titulo: 'Perfil', html })
    expect(lido?.diagnostico.faixas.map((f) => f.rotulo)).toEqual(['4 a 7'])
    expect(lido?.diagnostico.cabecalhoDasFaixas).toEqual(['Acertos', 'Ponto de entrada'])
  })

  it('devolve período vazio quando a tabela de fases não tem a coluna de semanas ou meses', () => {
    // O período é uma coluna do material: sem ela ("Semanas"/"Meses"), a fase continua legível e
    // só o período sai vazio — o campo não pode pegar o texto da vizinha.
    const html = `<table>
<thead><tr><th>Fase</th><th>Áreas (ordem_estudo)</th><th>Marco de saída</th></tr></thead>
<tbody><tr><td>1 Vocabulário</td><td>00, 01</td><td>checkpoint de 00</td></tr></tbody>
</table>`
    const extraida = extrairTrilha(pagina([{ numero: 3, titulo: 'Fases', html }]), AREAS)
    expect(extraida?.trilha.fases).toEqual([
      {
        rotulo: '1 Vocabulário',
        periodo: '',
        areas: ['00-guia-basico', '01-fundamentos'],
        marco: 'checkpoint de 00',
      },
    ])
  })

  it('descarta a linha da tabela de fases sem rótulo', () => {
    // A fase sem rótulo não tem nome para a tela: a linha sai em vez de aparecer em branco.
    const html = `<table>
<thead><tr><th>Fase</th><th>Semanas</th><th>Áreas (ordem_estudo)</th><th>Marco de saída</th></tr></thead>
<tbody>
<tr><td></td><td>1 a 6</td><td>00</td><td>m</td></tr>
<tr><td>1 Vocabulário</td><td>1 a 6</td><td>00</td><td>m</td></tr>
</tbody>
</table>`
    const extraida = extrairTrilha(pagina([{ numero: 3, titulo: 'Fases', html }]), AREAS)
    expect(extraida?.trilha.fases.map((f) => f.rotulo)).toEqual(['1 Vocabulário'])
  })
})
