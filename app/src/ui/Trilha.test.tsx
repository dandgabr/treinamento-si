// @vitest-environment jsdom
//
// As duas telas das trilhas: o pré-teste diagnóstico (dez itens, veredito "sim/não" por item e a
// leitura do ponto de entrada) e o checklist das fases (artefato da seção 8 de cada guia e o marco
// da área com as duas condições).
//
// O material é o de verdade — as três trilhas do `content.json` da tela —, e o store é o de
// verdade, com o provedor de persistência trocado. O teste não fixa o texto de nenhum item: o que
// ele fixa é que todo item mostrado vem do material (número, link do material, texto do guia) e que
// o ponto de entrada sai da tabela do próprio material.
//
// O store resolve o provedor e dispara a carga UMA vez, na importação. Por isso cada teste reseta
// os módulos e reimporta o repositório de conteúdo, o store e o componente — o conteúdo tem de ser
// carregado de novo na instância nova, senão a tela trabalha com o conteúdo vazio.

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Conteudo } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz, e nada aqui passa por ele.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown as Persistencia }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

const SLUG = '91-trilhas/plano-12-meses'
const AREA = '00-guia-basico'

/** Provedor de mentira: nenhum progresso guardado, e nada é escrito de verdade. */
function provedorDeTeste(): Persistencia {
  return {
    descricao: 'num provedor de teste',
    carregar: () => Promise.resolve(null),
    gravar: () => Promise.resolve(),
    apagar: () => Promise.resolve(),
    exportar: () => Promise.resolve({ estado: 'ok' }),
    importar: () => Promise.resolve({ estado: 'cancelado' }),
  }
}

interface Ambiente {
  store: typeof import('../application/progresso-store')
  BlocoDiagnostico: typeof import('./Trilha').BlocoDiagnostico
  ChecklistDaTrilha: typeof import('./Trilha').ChecklistDaTrilha
  conteudo: Conteudo
}

async function montar(): Promise<Ambiente> {
  compartilhado.provedor = provedorDeTeste()
  vi.resetModules()
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const store = await import('../application/progresso-store')
  await store.quandoCarregado()
  const { BlocoDiagnostico, ChecklistDaTrilha } = await import('./Trilha')
  return { store, BlocoDiagnostico, ChecklistDaTrilha, conteudo: repositorio.content }
}

/** A trilha do material, com o diagnóstico e as fases que o build extraiu. */
function trilhaDaPagina(conteudo: Conteudo): NonNullable<Conteudo['paginas'][number]['trilha']> {
  const pagina = conteudo.paginas.find((p) => p.slug === SLUG)
  const trilha = pagina?.trilha
  if (!trilha?.diagnostico) throw new Error(`o content.json desta execucao nao tem a trilha ${SLUG}`)
  return trilha
}

/** O texto do material entra numa expressão regular: os símbolos dele têm de ser literais. */
function escapar(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

afterEach(cleanup)

describe('diagnóstico da trilha', () => {
  it('mostra os dez itens do material, com "Acertei: sim/não" em cada um', async () => {
    const { BlocoDiagnostico, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    render(<BlocoDiagnostico slug={SLUG} trilha={trilha} />)

    const itens = screen.getAllByRole('listitem')
    expect(itens).toHaveLength(trilha.diagnostico!.itens.length)
    expect(itens).toHaveLength(10)
    // O rótulo é o da coluna do material.
    expect(screen.getAllByText('Acertei:')).toHaveLength(10)
    for (const item of itens) {
      expect(within(item).getByRole('button', { name: /: sim$/ })).toBeTruthy()
      expect(within(item).getByRole('button', { name: /: não$/ })).toBeTruthy()
    }
    // O item traz o link do material para a área do checkpoint de origem.
    expect(screen.getByRole('link', { name: /Guia básico do CISO/ }).getAttribute('href')).toBe(
      '#/area/00-guia-basico',
    )
  })

  it('não lê o ponto de entrada antes dos dez vereditos', async () => {
    const { BlocoDiagnostico, conteudo } = await montar()
    render(<BlocoDiagnostico slug={SLUG} trilha={trilhaDaPagina(conteudo)} />)
    expect(screen.getByRole('status').textContent).toContain('0 de 10 itens julgados')

    const usuario = userEvent.setup()
    await usuario.click(screen.getByRole('button', { name: 'Acertei o item 1: sim' }))
    expect(screen.getByRole('status').textContent).toContain('1 de 10 itens julgados')
  })

  it('lê o ponto de entrada do material quando os dez são julgados', async () => {
    const { BlocoDiagnostico, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    render(<BlocoDiagnostico slug={SLUG} trilha={trilha} />)

    const usuario = userEvent.setup()
    // Oito acertos e dois erros, clicando de verdade: é o caminho do estudante.
    for (const item of trilha.diagnostico!.itens) {
      const n = Number(item.numero)
      await usuario.click(
        screen.getByRole('button', { name: `Acertei o item ${n}: ${n <= 8 ? 'sim' : 'não'}` }),
      )
    }
    const status = screen.getByRole('status').textContent ?? ''
    expect(status).toContain('8 de 10 acertos')
    // O texto do ponto de entrada é o da tabela do material, e não uma frase do app.
    const daFaixa = trilha.diagnostico!.faixas.find((f) => f.rotulo === '8 a 10')
    expect(daFaixa).toBeTruthy()
    expect(status).toContain(daFaixa!.pontoDeEntrada)

    // A tabela do material continua na tela, com a faixa alcançada marcada.
    const tabela = screen.getByRole('table')
    expect(within(tabela).getAllByRole('row')).toHaveLength(4)
    expect(tabela.querySelector('tr.alcancada')?.textContent).toContain('8 a 10')
  })
})

describe('checklist da trilha', () => {
  it('mostra uma fase por linha da seção 3, com o marco do material e as áreas ligadas', async () => {
    const { ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)

    const fases = container.querySelectorAll('.fase')
    expect(fases).toHaveLength(trilha.fases.length)
    for (let i = 0; i < trilha.fases.length; i++) {
      const fase = fases[i]!
      expect(fase.textContent).toContain(trilha.fases[i]!.rotulo)
      // O "Marco de saída" exibido é o do material.
      expect(fase.textContent).toContain(trilha.fases[i]!.marco)
    }
    // Nenhuma área cumpriu nada ainda: o estado da fase diz isso, e não "cumprido".
    expect(container.querySelectorAll('.fase[data-cumprida="true"]')).toHaveLength(0)
    expect(container.querySelector('.area-marco')?.getAttribute('data-cumprido')).toBe('false')
  })

  it('lista as atividades da seção 8 do guia, com o pré-requisito técnico do material', async () => {
    const { ChecklistDaTrilha, conteudo } = await montar()
    render(<ChecklistDaTrilha trilha={trilhaDaPagina(conteudo)} />)

    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const atividades = area.guia.atividades!.linhas.map((l) => l[1]!)
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(atividades.length)
    for (const texto of atividades) {
      expect(screen.getByText(texto)).toBeTruthy()
    }
    // O pré-requisito técnico vem do material, coluna por coluna.
    expect(screen.getAllByText(/Pré-requisito técnico: nenhum/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pré-requisito técnico: planilha eletrônica/).length).toBeGreaterThan(
      0,
    )
  })

  it('marca o artefato com a data e só cumpre o marco com o checkpoint aprovado', async () => {
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const { container } = render(<ChecklistDaTrilha trilha={trilhaDaPagina(conteudo)} />)
    const usuario = userEvent.setup()

    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const primeira = area.guia.atividades!.linhas[0]!
    await usuario.click(screen.getByRole('checkbox', { name: new RegExp(escapar(primeira[1]!)) }))

    const marcoDaArea = container.querySelector('.area-marco')!
    // Só o artefato, sem checkpoint: o marco da área continua pendente.
    expect(marcoDaArea.textContent).toContain('Checkpoint: ainda não respondido')
    expect(marcoDaArea.textContent).toMatch(/Artefatos produzidos: 1 de \d+/)
    expect(marcoDaArea.getAttribute('data-cumprido')).toBe('false')
    // A data da produção aparece ao lado do artefato (dia local, como o registro da trilha).
    expect(screen.getAllByText(/Produzido em \d{4}-\d{2}-\d{2}/).length).toBeGreaterThan(0)

    // Agora o checkpoint da área, no critério do guia: as duas condições estão satisfeitas.
    const total = area.guia.checkpoint.length
    store.registrarCheckpoint(AREA, total, total)
    await screen.findByText(/marco cumprido/)
    expect(container.querySelector('.area-marco')!.getAttribute('data-cumprido')).toBe('true')
    expect(container.querySelector('.fase[data-cumprida="true"]')).toBeNull()
  })

  it('desmarcar o artefato tira a data e desfaz o marco da área', async () => {
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const { container } = render(<ChecklistDaTrilha trilha={trilhaDaPagina(conteudo)} />)
    const usuario = userEvent.setup()

    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const total = area.guia.checkpoint.length
    store.registrarCheckpoint(AREA, total, total)
    const primeira = area.guia.atividades!.linhas[0]!
    const caixa = screen.getByRole('checkbox', { name: new RegExp(escapar(primeira[1]!)) })

    await usuario.click(caixa)
    await screen.findByText(/marco cumprido/)
    await usuario.click(caixa)
    expect(container.querySelector('.area-marco')!.getAttribute('data-cumprido')).toBe('false')
    expect(screen.queryByText(/Produzido em/)).toBeNull()
  })
})
