// @vitest-environment jsdom
//
// Teste da tela do glossário: o HTML do material vira lista navegável por termo. O material é
// o de verdade (o mesmo `content.json` da tela); as asserções não fixam nomes de verbetes,
// justamente para o teste continuar valendo quando o material ganhar um termo novo — o que ele
// fixa é a FORMA: id único por verbete, endereço próprio, índice que acha o alvo, busca que
// ignora acento e maiúscula, e o aviso quando nada casa.
//
// Os testes de busca usam o material REAL para escolher as palavras, e as fixam literalmente
// ("zero", "seguranca", "TRÍADE"): derivar a consulta de `semAcento` deixaria o teste cego
// justamente para o defeito de acentuação que ele tem de pegar. Fixado o dado, a consulta é a
// que quem digita digita. O único caso fora do material é o desempate de id, que os 78 verbetes
// reais não exercitam (nenhum termo se repete dentro da mesma tabela): ele usa a menor fixture
// que passa pela função (`TABELA_COM_SIGLA_REPETIDA`).

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { carregar, content } from '../infrastructure/content/repository'
import { Glossario, lerGlossario, semAcento, type GlossarioLido } from './Glossario'
import { ancorarCabecalhos } from './Blocos'

function paginaDoGlossario(): string {
  const pagina = content.paginas.find((p) => p.slug === 'glossario')
  if (!pagina) throw new Error('o content.json desta execucao nao tem a pagina do glossario')
  return ancorarCabecalhos(pagina.intro, 'intro').html
}

function ler(): GlossarioLido {
  const lido = lerGlossario(paginaDoGlossario(), 'glossario')
  if (!lido) throw new Error('o glossario do material nao trouxe tabela de verbetes')
  return lido
}

function verbetes(lido: GlossarioLido) {
  return lido.blocos.flatMap((b) => (b.tipo === 'verbetes' ? b.verbetes : []))
}

function tabela(lido: GlossarioLido, singular: 'termo' | 'sigla') {
  const bloco = lido.blocos.find((b) => b.tipo === 'verbetes' && b.singular === singular)
  if (!bloco || bloco.tipo !== 'verbetes') throw new Error(`sem tabela de ${singular}`)
  return bloco
}

/** A contagem que a tela anuncia, que é o que o leitor de tela ouve a cada tecla. */
function contagem(): string {
  return screen.getByRole('status').textContent ?? ''
}

beforeAll(async () => {
  await carregar()
  // O jsdom não implementa rolagem: sem este substituto, o clique no índice (que rola até o
  // verbete) quebra o teste em vez de mover o foco, que é o que ele confere.
  Element.prototype.scrollIntoView = () => {}
})

// O projeto do Vitest não liga `globals`, então a limpeza automática do testing-library não
// roda: sem isto, o DOM de um teste fica no outro e as contagens somam.
afterEach(cleanup)

/**
 * A menor fixture que exercita o desempate do id: uma tabela de siglas com a MESMA sigla em
 * duas linhas — a mesma situação que `idDoVerbete` documenta (a mesma sigla listada dentro de
 * uma tabela de novo). Os 78 verbetes do material não têm colisão natural, então sem esta
 * fixture nenhum teste encostaria no desempate.
 */
const TABELA_COM_SIGLA_REPETIDA = `
<table>
  <thead>
    <tr><th>Sigla</th><th>Expansão (en)</th><th>Uso em português</th></tr>
  </thead>
  <tbody>
    <tr><td>TLS</td><td>Transport Layer Security</td><td>protocolo de cifra do transporte</td></tr>
    <tr><td>TLS</td><td>Transport Layer Security</td><td>a mesma sigla listada de novo</td></tr>
  </tbody>
</table>`

/**
 * A tabela de verbete cuja PRIMEIRA coluna já traz um link do material.
 *
 * É o caso que os 78 verbetes de hoje não exercitam (a única célula com link do material não é
 * tabela de verbete), e é onde o endereço do termo se desmonta: o `<a>` do endereço envolveria
 * outro `<a>`, e o termo passaria a ter DOIS links com o mesmo texto — o `innerHTML` que o React
 * usa deixa o de dentro dentro do de fora, e o clique cai no mais interno (o do material). Se o
 * mesmo markup fosse re-parseado como documento, o algoritmo de adoção fecharia o de fora antes de
 * abrir o de dentro e o endereço do verbete sairia VAZIO.
 */
const TABELA_COM_LINK_NO_TERMO = `
<table>
  <thead>
    <tr><th>Termo</th><th>Definição</th></tr>
  </thead>
  <tbody>
    <tr><td><a href="#/pagina/README">README</a></td><td>arquivo de abertura do material</td></tr>
  </tbody>
</table>`

describe('leitura do material', () => {
  it('vira duas tabelas de verbetes, termos e siglas', () => {
    const lido = ler()
    expect(tabela(lido, 'termo').verbetes.length).toBeGreaterThan(40)
    expect(tabela(lido, 'sigla').verbetes.length).toBeGreaterThan(10)
    // A prosa em volta continua material: nao pode ter sido engolida pela tabela.
    expect(lido.blocos.some((b) => b.tipo === 'material' && b.html.includes('<h2'))).toBe(true)
  })

  it('dá a cada verbete um id único, sem acento e sem espaço', () => {
    const ids = verbetes(ler()).map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^(termo|sigla)-[a-z0-9-]+$/)
  })

  it('separa a sigla do termo quando os dois têm o mesmo texto', () => {
    // "TLS" e "CVSS" aparecem nas duas tabelas: os ids nao podem colidir, ou o segundo
    // endereco do glossario levaria ao primeiro verbete.
    const lido = ler()
    expect(tabela(lido, 'termo').verbetes.some((v) => v.id === 'termo-tls')).toBe(true)
    expect(tabela(lido, 'sigla').verbetes.some((v) => v.id === 'sigla-tls')).toBe(true)
  })

  it('guarda a área de origem de cada termo e nenhuma nas siglas', () => {
    const lido = ler()
    expect(tabela(lido, 'termo').verbetes.every((v) => v.area)).toBe(true)
    expect(tabela(lido, 'sigla').verbetes.every((v) => v.area === null)).toBe(true)
  })

  it('desempata o id de dois verbetes que gerariam o mesmo endereço', () => {
    const lido = lerGlossario(TABELA_COM_SIGLA_REPETIDA, 'glossario')
    if (!lido) throw new Error('a fixture de sigla repetida nao virou tabela de verbetes')
    // Sem o desempate as duas linhas ficariam com `sigla-tls`: o segundo verbete teria o
    // endereço do primeiro, e um dos dois ficaria sem link próprio.
    expect(verbetes(lido).map((v) => v.id)).toEqual(['sigla-tls', 'sigla-tls-2'])

    render(<Glossario estrutura={lido} escuro={false} />)
    // Um elemento por id: dois `#sigla-tls` na tela fazem `getElementById` devolver o primeiro
    // e o endereço do segundo verbete levar ao errado.
    expect(document.querySelectorAll('[id="sigla-tls"]').length).toBe(1)
    expect(
      screen.getAllByRole('link').map((a) => a.getAttribute('href')),
    ).toEqual(['#/pagina/glossario/sigla-tls', '#/pagina/glossario/sigla-tls-2'])
  })
})

describe('a tela', () => {
  it('dá a cada termo um endereço próprio, com o id da rota no href', () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const primeiro = verbetes(ler())[0]
    const link = screen.getByRole('link', { name: `Endereço do termo ${primeiro?.termo}` })
    expect(link.getAttribute('href')).toBe(`#/pagina/glossario/${primeiro?.id}`)
    expect(link.closest('tr')?.id).toBe(primeiro?.id)
  })

  it('não envolve no endereço do verbete a célula do termo que já tem um link do material', () => {
    const lido = lerGlossario(TABELA_COM_LINK_NO_TERMO, 'glossario')
    if (!lido) throw new Error('a fixture de termo com link nao virou tabela de verbetes')
    const { container } = render(<Glossario estrutura={lido} escuro={false} />)

    const linha = container.querySelector('tr.verbete')
    expect(linha).not.toBeNull()
    // O endereço do verbete continua de pé pelo id da linha — é ele que `#/pagina/glossario/
    // termo-readme` alcança e que `irParaSecao` foca. O que sai é só o invólucro, que com um
    // `<a>` dentro se desfaz no parse do navegador.
    expect(linha?.id).toBe('termo-readme')
    expect(document.getElementById('termo-readme')).toBe(linha)

    // UM link na célula do termo: o do material, com o texto e o destino dele. Com o invólucro
    // ficam DOIS — o de fora com o mesmo texto (o `innerHTML` do React aninha os dois `<a>`) ou
    // vazio (o markup re-parseado como documento, quando o algoritmo de adoção fecha o de fora).
    // Nas duas formas o endereço do termo deixa de ser o que o clique do termo alcança.
    const naCelula = [...(linha?.querySelector('td')?.querySelectorAll('a') ?? [])]
    expect(naCelula.map((a) => [a.getAttribute('href'), a.textContent])).toEqual([
      ['#/pagina/README', 'README'],
    ])
    // E a causa por trás da contagem: nenhum `<a>` dentro de outro nesta tabela.
    expect(container.querySelectorAll('a a').length).toBe(0)
  })

  it('tem rótulo de verdade na busca, e não placeholder', () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const campo = screen.getByLabelText('Buscar termo')
    expect(campo.getAttribute('placeholder')).toBeNull()
    expect(campo.getAttribute('type')).toBe('search')
  })

  it('o índice por área leva a um verbete que existe na tela', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const botoes = screen.getAllByRole('button').filter((b) => b.closest('.sumario') !== null)
    expect(botoes.length).toBeGreaterThan(5)
    const alvos: (Element | null)[] = []
    for (const botao of botoes) {
      await userEvent.click(botao)
      alvos.push(document.activeElement)
    }
    // Todo item do índice aponta para um alvo que está na tela: sem isso o clique não faz
    // nada, e o foco continuaria no próprio botão — que não tem id.
    expect(alvos.filter((a) => !a?.id)).toEqual([])
    // E os itens por área caem num verbete, não num título: é o que faz o índice ser
    // navegação por termo, e não um segundo sumário de seções.
    const porArea = alvos.filter((a) => a?.id.startsWith('termo-'))
    expect(porArea.length).toBeGreaterThanOrEqual(5)
    for (const alvo of alvos.filter((a) => !a?.id.startsWith('termo-'))) {
      // O que sobra são os três títulos do material e a tabela de siglas.
      expect(/^(H2|H3)$/.test(alvo?.tagName ?? '') || alvo?.id.startsWith('sigla-')).toBe(true)
    }
  })

  it('a busca ignora acento e maiúscula', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const comAcento = verbetes(ler()).find((v) => semAcento(v.termo) !== v.termo.toLowerCase())
    if (!comAcento) throw new Error('nenhum verbete com acento para o teste')
    const semAcentoNoTermo = semAcento(comAcento.termo)

    await userEvent.type(screen.getByLabelText('Buscar termo'), semAcentoNoTermo.toUpperCase())
    expect(document.getElementById(comAcento.id)).not.toBeNull()
    expect(contagem()).toMatch(/^\d+ de \d+ termos e siglas$/)

    const quantos = document.querySelectorAll('.verbete').length
    await userEvent.clear(screen.getByLabelText('Buscar termo'))
    await userEvent.type(screen.getByLabelText('Buscar termo'), comAcento.termo)
    expect(document.querySelectorAll('.verbete').length).toBe(quantos)
  })

  it('acha o termo acentuado digitando sem acento, e o acentuado em maiúscula', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const campo = screen.getByLabelText('Buscar termo')

    // "seguranca", sem cedilha e sem til, é o que a mão digita: tem de achar o verbete escrito
    // "segurança da informação". A consulta é literal de propósito — se ela viesse de
    // `semAcento`, o teste passaria mesmo com a normalização do lado da tela removida.
    await userEvent.type(campo, 'seguranca')
    expect(
      screen.getByRole('link', { name: 'Endereço do termo segurança da informação' }),
    ).toBeTruthy()

    // E o sentido contrário: acento e maiúscula digitados ("TRÍADE") acham "tríade CIA".
    await userEvent.clear(campo)
    await userEvent.type(campo, 'TRÍADE')
    expect(screen.getByRole('link', { name: 'Endereço do termo tríade CIA' })).toBeTruthy()
  })

  it('exige todas as palavras digitadas: quem casa só uma delas fica de fora', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const campo = screen.getByLabelText('Buscar termo')

    // "zero" sozinho acha o verbete "zero trust": a palavra existe no material.
    await userEvent.type(campo, 'zero')
    expect(screen.getByRole('link', { name: 'Endereço do termo zero trust' })).toBeTruthy()

    // "confidencialidade" sozinho acha outros verbetes, e o de "zero trust" sai da lista.
    await userEvent.clear(campo)
    await userEvent.type(campo, 'confidencialidade')
    expect(document.querySelectorAll('.verbete').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: 'Endereço do termo zero trust' })).toBeNull()

    // As duas palavras juntas não aparecem em verbete nenhum do material: "zero trust" casa só
    // "zero", a família da confidencialidade casa só "confidencialidade". Com `some` no lugar do
    // `every`, as duas listas voltariam (11 verbetes) e a de "zero trust" estaria de volta aqui.
    await userEvent.clear(campo)
    await userEvent.type(campo, 'zero confidencialidade')
    expect(document.querySelectorAll('.verbete').length).toBe(0)
    expect(contagem()).toContain('Nenhum termo bate com “zero confidencialidade”')
  })

  it('a contagem anunciada acompanha o filtro, a cada tecla', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const campo = screen.getByLabelText('Buscar termo')
    const total = document.querySelectorAll('.verbete').length
    expect(contagem()).toBe(`${total} termos e siglas`)

    // O número anunciado é o da lista que está na tela, e não o total do material: com o
    // contador congelado em `estrutura.blocos`, os três casos abaixo diriam "78 de 78".
    for (const termo of ['zero', 'zero trust', 'seguranca']) {
      await userEvent.clear(campo)
      await userEvent.type(campo, termo)
      const naTela = document.querySelectorAll('.verbete').length
      expect(naTela).toBeGreaterThan(0)
      expect(naTela).toBeLessThan(total)
      expect(contagem()).toBe(`${naTela} de ${total} termos e siglas`)
    }
  })

  it('quando nada casa, avisa em vez de mostrar uma lista vazia em silêncio', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const total = document.querySelectorAll('.verbete').length

    await userEvent.type(screen.getByLabelText('Buscar termo'), 'inventei-este-termo')
    expect(document.querySelectorAll('.verbete').length).toBe(0)
    // O texto inteiro é o aviso: sem o ramo do vazio a tela diria "0 de 78 termos e siglas", que
    // é a lista vazia silenciosa — o leitor de tela ouviria um número, não uma explicação.
    const anuncio = screen.getByRole('status')
    expect(anuncio.textContent).toBe(
      'Nenhum termo bate com “inventei-este-termo”. O acento e a maiúscula não mudam a busca.',
    )
    // O aviso carrega a classe própria do estado vazio; é ela que o estilo usa para destacá-lo.
    expect(anuncio.className.split(' ')).toContain('busca-vazia')
    expect(total).toBeGreaterThan(0)
  })

  it('some com o que não casa e diz quando nada casa', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const todos = document.querySelectorAll('.verbete').length

    await userEvent.type(screen.getByLabelText('Buscar termo'), 'zero trust')
    const filtrados = document.querySelectorAll('.verbete').length
    expect(filtrados).toBeGreaterThan(0)
    expect(filtrados).toBeLessThan(todos)

    await userEvent.clear(screen.getByLabelText('Buscar termo'))
    await userEvent.type(screen.getByLabelText('Buscar termo'), 'zzz-nao-existe')
    expect(document.querySelectorAll('.verbete').length).toBe(0)
    expect(contagem()).toContain('Nenhum termo bate com “zzz-nao-existe”')
    // A contagem é o canal de `aria-live`, e é um só: duas regiões anunciariam a mesma coisa
    // duas vezes a cada tecla.
    expect(screen.getAllByRole('status').length).toBe(1)

    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }))
    expect(document.querySelectorAll('.verbete').length).toBe(todos)
  })

  it('só espaço no campo não é filtro: sem botão de limpar e sem contagem filtrada', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const campo = screen.getByLabelText('Buscar termo')
    const total = document.querySelectorAll('.verbete').length
    expect(total).toBeGreaterThan(0)
    expect(contagem()).toBe(`${total} termos e siglas`)

    // Só espaço deixa `palavras` vazio: não há consulta. Julgada pelo texto do campo (`busca`),
    // a tela se partia — o botão de limpar dizia "filtro ativo" e a contagem dizia o total. A
    // régua é uma só, e é `palavras`; com o botão de volta, este teste reprova.
    await userEvent.type(campo, '   ')

    expect(document.querySelectorAll('.verbete').length).toBe(total)
    expect(screen.queryByRole('button', { name: 'Limpar busca' })).toBeNull()
    expect(contagem()).toBe(`${total} termos e siglas`)
  })

  it('acha por pedaço de palavra: "confid" traz a confidencialidade', async () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const total = document.querySelectorAll('.verbete').length

    // O casamento é por `includes` DE PROPÓSITO: é ele que faz a digitação parcial funcionar
    // enquanto se digita ("confid" antes de "confidencialidade"), e o material real tem o
    // verbete para provar. Trocar por fronteira de palavra — exigir o termo inteiro — faria
    // esta consulta cair em "Nenhum termo bate": é regressão de uso, não conserto de bug, e
    // este teste existe para barrá-la.
    await userEvent.type(screen.getByLabelText('Buscar termo'), 'confid')

    expect(
      screen.getByRole('link', { name: 'Endereço do termo confidencialidade' }),
    ).toBeTruthy()
    const filtrados = document.querySelectorAll('.verbete').length
    expect(filtrados).toBeGreaterThan(0)
    expect(filtrados).toBeLessThan(total)
    expect(contagem()).toBe(`${filtrados} de ${total} termos e siglas`)
  })
})
