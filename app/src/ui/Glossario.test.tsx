// @vitest-environment jsdom
//
// Teste da tela do glossário: o HTML do material vira lista navegável por termo. O material é
// o de verdade (o mesmo `content.json` da tela); as asserções não fixam nomes de verbetes,
// justamente para o teste continuar valendo quando o material ganhar um termo novo — o que ele
// fixa é a FORMA: id único por verbete, endereço próprio, índice que acha o alvo, busca que
// ignora acento e maiúscula, e o aviso quando nada casa.

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
})

describe('a tela', () => {
  it('dá a cada termo um endereço próprio, com o id da rota no href', () => {
    render(<Glossario estrutura={ler()} escuro={false} />)
    const primeiro = verbetes(ler())[0]
    const link = screen.getByRole('link', { name: `Endereço do termo ${primeiro?.termo}` })
    expect(link.getAttribute('href')).toBe(`#/pagina/glossario/${primeiro?.id}`)
    expect(link.closest('tr')?.id).toBe(primeiro?.id)
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
})
