// @vitest-environment jsdom
//
// As duas telas das trilhas: o pré-teste diagnóstico (dez itens, veredito "sim/não" por item e a
// leitura do ponto de entrada) e o checklist das fases (artefato da seção 8 de cada guia e o marco
// da área com as condições que a seção 7 da trilha declara).
//
// O material é o de verdade — as três trilhas do `content.json` da tela —, e o store é o de
// verdade, com o provedor de persistência trocado. O teste não fixa o texto de nenhum item: o que
// ele fixa é que todo item mostrado vem do material (número, link do material, texto do guia) e que
// o ponto de entrada sai da tabela do próprio material.
//
// O store resolve o provedor e dispara a carga UMA vez, na importação. Por isso cada teste reseta
// os módulos e reimporta o repositório de conteúdo, o store e o componente — o conteúdo tem de ser
// carregado de novo na instância nova, senão a tela trabalha com o conteúdo vazio.
//
// O último bloco (`tarefa da passagem` e `fila de hoje`) não é uma tela da trilha: os dois blocos
// vivem em `Progresso.tsx`. Eles estão aqui porque é o mesmo harness — o store de verdade com o
// provedor trocado —, e porque sem eles o corpo da `TarefaDaPassagem` e o ramo "sem tarefa
// tabelada" da fila podiam ser apagados sem quebrar teste nenhum.

import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { tarefaDoTema } from '../application/revisao-espacada'
import { atividadesDoGuia } from '../domain/trilha'
import type { Conteudo } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz, e nada aqui passa por ele.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown as Persistencia }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

const SLUG = '91-trilhas/plano-12-meses'
/** O plano de 90 dias liga UMA área a cada fase — o caso em que o estado da FASE é verificável. */
const SLUG_90 = '91-trilhas/plano-90-dias'
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

/**
 * Fecha o checkpoint de uma área com todos os itens acertados — o veredito é por item, e o placar
 * do critério sai dele.
 */
function aprovarCheckpoint(
  store: typeof import('../application/progresso-store'),
  areaId: string,
  total: number,
): void {
  for (let i = 0; i < total; i++) store.registrarVeredictoDeCheckpoint(areaId, i, true, total)
}

interface Ambiente {
  store: typeof import('../application/progresso-store')
  BlocoDiagnostico: typeof import('./Trilha').BlocoDiagnostico
  ChecklistDaTrilha: typeof import('./Trilha').ChecklistDaTrilha
  TarefaDaPassagem: typeof import('./Progresso').TarefaDaPassagem
  ResumoProgresso: typeof import('./Progresso').ResumoProgresso
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
  const { TarefaDaPassagem, ResumoProgresso } = await import('./Progresso')
  return {
    store,
    BlocoDiagnostico,
    ChecklistDaTrilha,
    TarefaDaPassagem,
    ResumoProgresso,
    conteudo: repositorio.content,
  }
}

/** A trilha do material, com o diagnóstico e as fases que o build extraiu. */
function trilhaDaPagina(
  conteudo: Conteudo,
  slug = SLUG,
): NonNullable<Conteudo['paginas'][number]['trilha']> {
  const pagina = conteudo.paginas.find((p) => p.slug === slug)
  const trilha = pagina?.trilha
  if (!trilha?.diagnostico) throw new Error(`o content.json desta execucao nao tem a trilha ${slug}`)
  return trilha
}

/** O texto do material entra numa expressão regular: os símbolos dele têm de ser literais. */
function escapar(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

afterEach(cleanup)

// O `jsdom` não implementa `scrollIntoView`, e o caminho de volta da retomada (`irParaSecao`) rola
// até a fase que estuda a área. O stub não afrouxa nada: o que o teste verifica é o FOCO, que o
// `jsdom` faz de verdade — o alvo do foco é o id da fase, e é ele que diz se o caminho está certo.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {}
})

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
    // A fase pendente se declara, e não fica só "não cumprida" pela ausência do atributo.
    expect(container.querySelectorAll('.fase[data-cumprida="false"]')).toHaveLength(trilha.fases.length)
    // O mesmo vale para o artefato: nenhum produzido, e todos os que existem dizem isso.
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(0)
    expect(container.querySelectorAll('.artefato[data-produzido="false"]').length).toBeGreaterThan(0)
    // O estado que a linha existe para mostrar não pode ser o mesmo nas duas pontas.
    expect(container.querySelectorAll('.selo-cumprido')).toHaveLength(0)
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
    // O atributo por artefato segue o clique, e o selo do marco ainda é o neutro — "pendente".
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(1)
    expect(marcoDaArea.querySelector('.selo-cumprido')).toBeNull()
    // A data da produção aparece ao lado do artefato (dia local, como o registro da trilha).
    expect(screen.getAllByText(/Produzido em \d{4}-\d{2}-\d{2}/).length).toBeGreaterThan(0)

    // Agora o checkpoint da área, no critério do guia: as condições estão satisfeitas.
    const total = area.guia.checkpoint.length
    aprovarCheckpoint(store, AREA, total)
    await screen.findByText(/marco cumprido/)
    expect(container.querySelector('.area-marco')!.getAttribute('data-cumprido')).toBe('true')
    // O selo mudou de estado, e não só de texto: é a classe que a folha pinta.
    expect(container.querySelector('.area-marco .selo-cumprido')!.textContent).toBe('marco cumprido')
    expect(container.querySelector('.fase[data-cumprida="true"]')).toBeNull()
  })

  it('desmarcar o artefato tira a data e desfaz o marco da área', async () => {
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const { container } = render(<ChecklistDaTrilha trilha={trilhaDaPagina(conteudo)} />)
    const usuario = userEvent.setup()

    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const total = area.guia.checkpoint.length
    aprovarCheckpoint(store, AREA, total)
    const primeira = area.guia.atividades!.linhas[0]!
    const caixa = screen.getByRole('checkbox', { name: new RegExp(escapar(primeira[1]!)) })

    await usuario.click(caixa)
    await screen.findByText(/marco cumprido/)
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(1)
    await usuario.click(caixa)
    expect(container.querySelector('.area-marco')!.getAttribute('data-cumprido')).toBe('false')
    // O artefato desmarcado deixa de se declarar produzido.
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(0)
    expect(screen.queryByText(/Produzido em/)).toBeNull()
  })

  it('fecha a fase com o checkpoint aprovado E o artefato produzido, e não com um só', async () => {
    // O plano de 90 dias liga UMA área a cada fase: é onde o estado da fase (todas as áreas
    // dela cumpridas) é verificável sem montar a segunda passagem com as dezoito.
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo, SLUG_90)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)
    const usuario = userEvent.setup()

    const fase = (i: number) => container.querySelectorAll('.fase')[i]!
    expect(container.querySelectorAll('.fase[data-cumprida="true"]')).toHaveLength(0)

    // Só o checkpoint: o artefato falta, e o marco da fase não fecha.
    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const total = area.guia.checkpoint.length
    aprovarCheckpoint(store, area.areaId, total)
    // A área já aparece com o checkpoint aprovado — é o sinal de que a tela re-renderizou.
    await waitFor(() =>
      expect(container.querySelector('.area-marco-condicao')!.textContent).toContain(
        'aprovado no critério declarado',
      ),
    )
    expect(fase(0).getAttribute('data-cumprida')).toBe('false')
    expect(fase(0).querySelector('.fase-estado')!.textContent).toContain('0 de 1')
    expect(container.querySelector('.area-marco .selo-cumprido')).toBeNull()

    // Agora o artefato: as condições ficam satisfeitas, e as duas fases que ligam a área fecham.
    const primeira = atividadesDoGuia(area.guia)[0]!
    await usuario.click(screen.getByRole('checkbox', { name: new RegExp(escapar(primeira.texto)) }))
    await waitFor(() =>
      expect(container.querySelectorAll('.fase[data-cumprida="true"]')).toHaveLength(2),
    )
    expect(fase(0).getAttribute('data-cumprida')).toBe('true')
    expect(fase(0).querySelector('.fase-estado')!.textContent).toContain('Marco da fase cumprido')
    expect(container.querySelectorAll('.fase[data-cumprida="false"]')).toHaveLength(
      trilha.fases.length - 2,
    )
    // O selo do marco aparece uma vez: só a fase que ESTUDA a área lista os artefatos e o selo.
    expect(container.querySelectorAll('.selo-cumprido')).toHaveLength(1)
  })

  it('só cumpre a fase quando TODAS as áreas dela têm o checkpoint e o artefato', async () => {
    // O plano de 12 meses liga MAIS DE UMA área por fase da primeira passagem — é onde o marco da
    // fase se prova como o de todas elas, e não o da primeira que fecha. As duas condições são por
    // área: falta uma de cada vez, a fase continua pendente.
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)
    const usuario = userEvent.setup()

    const areas = trilha.fases[0]!.areas.map((id) => conteudo.areas.find((a) => a.areaId === id)!)
    expect(areas.length).toBeGreaterThan(1)
    const fase0 = container.querySelectorAll('.fase')[0]!
    expect(fase0.querySelectorAll('.area-marco')).toHaveLength(areas.length)
    expect(fase0.getAttribute('data-cumprida')).toBe('false')
    expect(fase0.querySelector('.fase-estado')!.textContent).toContain(`0 de ${areas.length}`)

    // Só o checkpoint das áreas, sem artefato nenhum: uma condição de cada duas, e a fase não fecha.
    for (const area of areas) {
      const total = area.guia.checkpoint.length
      aprovarCheckpoint(store, area.areaId, total)
    }
    await waitFor(() =>
      expect(fase0.querySelector('.area-marco-condicao')!.textContent).toContain(
        'aprovado no critério declarado',
      ),
    )
    expect(fase0.getAttribute('data-cumprida')).toBe('false')
    expect(fase0.querySelectorAll('.area-marco[data-cumprido="true"]')).toHaveLength(0)
    expect(fase0.querySelector('.fase-estado')!.textContent).toContain(`0 de ${areas.length}`)

    // O artefato de cada área: as duas condições valem por área, e a fase fecha com a última.
    for (const area of areas) {
      const primeira = atividadesDoGuia(area.guia)[0]!
      await usuario.click(screen.getByRole('checkbox', { name: new RegExp(escapar(primeira.texto)) }))
    }
    await waitFor(() => expect(fase0.getAttribute('data-cumprida')).toBe('true'))
    expect(fase0.querySelectorAll('.area-marco[data-cumprido="true"]')).toHaveLength(areas.length)
    expect(fase0.querySelector('.fase-estado')!.textContent).toContain('Marco da fase cumprido')
    // A fase cumprida é UMA: a segunda passagem retoma as mesmas áreas, mas o marco dela é das 18.
    expect(container.querySelectorAll('.fase[data-cumprida="true"]')).toHaveLength(1)
    expect(container.querySelectorAll('.fase[data-cumprida="false"]')).toHaveLength(trilha.fases.length - 1)

    // Desmarcar o artefato de UMA área reabre a fase: o marco da fase é o de todas elas.
    const ultima = atividadesDoGuia(areas[areas.length - 1]!.guia)[0]!
    await usuario.click(screen.getByRole('checkbox', { name: new RegExp(escapar(ultima.texto)) }))
    await waitFor(() => expect(fase0.getAttribute('data-cumprida')).toBe('false'))
    expect(fase0.querySelectorAll('.area-marco[data-cumprido="true"]')).toHaveLength(areas.length - 1)
    expect(fase0.querySelector('.fase-estado')!.textContent).toContain(
      `${areas.length - 1} de ${areas.length}`,
    )
  })

  it('não cumpre a fase só com os artefatos: sem o checkpoint de cada área o marco não fecha', async () => {
    // A outra metade da regra: com o artefato produzido e o checkpoint ainda não respondido,
    // NENHUMA área cumpriu — o artefato sozinho não é o marco, nem da área nem da fase.
    const { ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)
    const usuario = userEvent.setup()

    const areas = trilha.fases[0]!.areas.map((id) => conteudo.areas.find((a) => a.areaId === id)!)
    for (const area of areas) {
      const primeira = atividadesDoGuia(area.guia)[0]!
      await usuario.click(screen.getByRole('checkbox', { name: new RegExp(escapar(primeira.texto)) }))
    }
    const fase0 = container.querySelectorAll('.fase')[0]!
    await waitFor(() =>
      expect(fase0.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(areas.length),
    )
    expect(fase0.getAttribute('data-cumprida')).toBe('false')
    expect(fase0.querySelectorAll('.area-marco[data-cumprido="true"]')).toHaveLength(0)
    for (const marco of fase0.querySelectorAll('.area-marco')) {
      expect(marco.querySelector('.selo-cumprido')).toBeNull()
      expect(marco.querySelector('.area-marco-condicao')!.textContent).toContain(
        'Checkpoint: ainda não respondido',
      )
    }
    expect(fase0.querySelector('.fase-estado')!.textContent).toContain(`0 de ${areas.length}`)
  })

  it('a fase que retoma traz o estado do marco e o caminho de volta, sem repetir as caixas', async () => {
    // O plano de 12 meses religa as dezoito áreas na última fase. Ali ninguém ESTUDA: a retomada
    // traz o estado do marco — as duas condições que a fase precisa ver — e o caminho de volta para
    // a fase que estuda a área, onde ficam as caixas. O estado do artefato é um só (`área#número`),
    // então repetir a lista faria a mesma pergunta duas vezes, com o mesmo nome acessível.
    const { ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)
    const usuario = userEvent.setup()

    const areas = [...new Set(trilha.fases.flatMap((f) => f.areas))]
    const dona = new Map<string, number>()
    trilha.fases.forEach((fase, i) => {
      for (const id of fase.areas) if (!dona.has(id)) dona.set(id, i)
    })
    const artefatos = (id: string) =>
      atividadesDoGuia(conteudo.areas.find((a) => a.areaId === id)!.guia)

    const ultima = container.querySelectorAll('.fase')[trilha.fases.length - 1]!
    const retomadas = [...ultima.querySelectorAll('.area-retomada')]
    expect(retomadas).toHaveLength(areas.length)
    expect(ultima.querySelectorAll('.area-marco')).toHaveLength(0)
    expect(ultima.querySelectorAll('input[type=checkbox]')).toHaveLength(0)

    // Uma caixa por artefato, todas na fase que estuda a área: nenhuma pergunta repetida.
    const caixas = [...container.querySelectorAll<HTMLInputElement>('input[type=checkbox]')]
    const esperado = areas.reduce((soma, id) => soma + artefatos(id).length, 0)
    expect(caixas).toHaveLength(esperado)
    expect(new Set(caixas.map((c) => c.closest('label')!.textContent)).size).toBe(esperado)
    for (const retomada of retomadas) {
      expect(within(retomada as HTMLElement).queryAllByRole('checkbox')).toHaveLength(0)
      expect(retomada.querySelector('.lista-artefatos')).toBeNull()
      expect(retomada.querySelector('.artefato')).toBeNull()
    }

    // Duas áreas de fases de estudo diferentes, para o caminho não passar por um id fixo.
    for (const id of [AREA, '02-governanca-risco-compliance']) {
      const retomada = retomadas.find((r) => r.querySelector(`a[href="#/area/${id}"]`)) as HTMLElement
      if (!retomada) throw new Error(`a segunda passagem não retoma ${id}`)
      const i = dona.get(id)!
      expect(i).toBeLessThan(trilha.fases.length - 1)
      const estudante = container.querySelectorAll('.fase')[i]!
      // O estado do marco é o MESMO dos dois lados: a frase do estado tem um dono só.
      const bloco = estudante.querySelector(`.area-marco a[href="#/area/${id}"]`)!.closest('.area-marco')!
      expect(retomada.querySelector('.area-retomada-condicao')!.textContent).toBe(
        bloco.querySelector('.area-marco-condicao')!.textContent,
      )
      expect(retomada.querySelector('.area-retomada-condicao')!.textContent).toContain(
        `Artefatos produzidos: 0 de ${artefatos(id).length}`,
      )
      // O botão nomeia a fase que estuda a área, e leva o FOCO até ela — a fase que traz as caixas.
      const botao = within(retomada).getByRole('button')
      expect(botao.textContent).toBe(`Checklist da fase ${trilha.fases[i]!.rotulo}`)
      await usuario.click(botao)
      const alvo = (document.activeElement as HTMLElement).closest('.fase')!
      expect(alvo.querySelector('.fase-rotulo')!.textContent).toBe(trilha.fases[i]!.rotulo)
      expect(alvo.querySelector(`.area-marco a[href="#/area/${id}"]`)).toBeTruthy()
      expect(within(alvo as HTMLElement).queryAllByRole('checkbox').length).toBeGreaterThan(0)
    }
  })

  it('o marco retomado cumpre com as duas condições e volta a pendente ao desmarcar', async () => {
    const { store, ChecklistDaTrilha, conteudo } = await montar()
    const trilha = trilhaDaPagina(conteudo)
    const { container } = render(<ChecklistDaTrilha trilha={trilha} />)
    const usuario = userEvent.setup()

    const area = conteudo.areas.find((a) => a.areaId === AREA)!
    const primeira = atividadesDoGuia(area.guia)[0]!
    const estudante = container.querySelectorAll('.fase')[trilha.fases.findIndex((f) => f.areas.includes(AREA))]!
    const retomada = [...container.querySelectorAll('.area-retomada')].find((r) =>
      r.querySelector(`a[href="#/area/${AREA}"]`),
    ) as HTMLElement

    const caixa = screen.getByRole('checkbox', { name: new RegExp(escapar(primeira.texto)) }) as HTMLInputElement
    // Desmarcado: o artefato se declara assim, e o marco retomado também.
    expect(caixa.checked).toBe(false)
    expect(estudante.querySelector('.artefato[data-produzido="false"]')).toBeTruthy()
    expect(retomada.getAttribute('data-cumprido')).toBe('false')

    // Só o artefato produzido: uma condição de duas, e o marco retomado continua pendente.
    await usuario.click(caixa)
    await waitFor(() =>
      expect(retomada.querySelector('.area-retomada-condicao')!.textContent).toContain(
        `Artefatos produzidos: 1 de ${atividadesDoGuia(area.guia).length}`,
      ),
    )
    expect(retomada.querySelector('.area-retomada-condicao')!.textContent).toContain(
      'Checkpoint: ainda não respondido',
    )
    expect(retomada.getAttribute('data-cumprido')).toBe('false')
    // Marcado uma vez só: a retomada não repete a caixa nem a data de produção.
    expect(estudante.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(1)
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(1)
    expect(retomada.textContent).not.toContain('Produzido em')

    // O checkpoint da área, no critério do próprio guia: as duas condições, e o marco fecha.
    const total = area.guia.checkpoint.length
    aprovarCheckpoint(store, AREA, total)
    await waitFor(() => expect(retomada.getAttribute('data-cumprido')).toBe('true'))
    expect(retomada.querySelector('.area-retomada-condicao')!.textContent).toContain(
      'Checkpoint: aprovado no critério declarado',
    )

    // Desmarcar tira a condição e o marco retomado volta a pendente.
    await usuario.click(caixa)
    await waitFor(() => expect(retomada.getAttribute('data-cumprido')).toBe('false'))
    expect(estudante.querySelector('.artefato[data-produzido="false"]')).toBeTruthy()
    expect(container.querySelectorAll('.artefato[data-produzido="true"]')).toHaveLength(0)
  })
})

/** Uma data de passagem bem no passado, para a cobrança seguinte já estar vencida. */
const PASSADO = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)

describe('tarefa da passagem', () => {
  it('mostra a tarefa que a seção 11 do tema declara para o intervalo devido', async () => {
    const { store, TarefaDaPassagem, conteudo } = await montar()
    const ref = '01-fundamentos#TEMA-01'
    // Uma passagem errada em D+1: o tema volta a ser cobrado em D+1, e já venceu.
    store.registrarRecuperacao(ref, false, PASSADO)
    const { container } = render(<TarefaDaPassagem refTema={ref} />)

    const tarefa = tarefaDoTema(conteudo.temas[ref]!, 1)
    expect(tarefa).toBeTruthy()
    const paragrafo = container.querySelector('p.tarefa-da-passagem')!
    expect(paragrafo.className).not.toContain('sem-tarefa')
    expect(paragrafo.textContent).toContain('(D+1)')
    // O texto é o da tabela do material, no mesmo elemento — não uma frase do app.
    expect(paragrafo.textContent).toContain(tarefa!.oQueFazer)
  })

  it('diz que não há tarefa tabelada no intervalo rebaixado (D+3) e leva à seção 10', async () => {
    const { store, TarefaDaPassagem, conteudo } = await montar()
    const ref = '01-fundamentos#TEMA-01'
    // Acerto leva a D+7; o erro seguinte rebaixa para D+3, que a seção 11 de nenhum tema tabela.
    store.registrarRecuperacao(ref, true, PASSADO)
    store.abrirPassagem(ref)
    store.registrarRecuperacao(ref, false, PASSADO)
    const { container } = render(<TarefaDaPassagem refTema={ref} />)

    expect(tarefaDoTema(conteudo.temas[ref]!, 3)).toBeNull()
    const paragrafo = container.querySelector('p.tarefa-da-passagem.sem-tarefa')!
    expect(paragrafo.textContent).toContain('Não há tarefa tabelada para este intervalo (D+3)')
    expect(screen.getByRole('button', { name: 'Ir para a seção 10' })).toBeTruthy()
  })
})

describe('fila de hoje', () => {
  it('mostra a tarefa do intervalo, o selo da releitura completa e a volta à seção 10', async () => {
    const { store, ResumoProgresso, conteudo } = await montar()
    // Dois temas vencidos, um em cada estado que a fila precisa saber dizer.
    const comTarefa = '01-fundamentos#TEMA-01'
    const semTarefa = '01-fundamentos#TEMA-02'

    // Tema 1: duas passagens falhas seguidas — a fila anuncia a releitura completa, e o
    // intervalo devido (D+1) tem linha na seção 11.
    store.registrarRecuperacao(comTarefa, true, PASSADO)
    store.abrirPassagem(comTarefa)
    store.registrarRecuperacao(comTarefa, false, PASSADO)
    store.abrirPassagem(comTarefa)
    store.registrarRecuperacao(comTarefa, false, PASSADO)
    // Tema 2: uma falha depois de D+7 rebaixa para D+3, intervalo que nenhum tema tabela.
    store.registrarRecuperacao(semTarefa, true, PASSADO)
    store.abrirPassagem(semTarefa)
    store.registrarRecuperacao(semTarefa, false, PASSADO)

    const { container } = render(<ResumoProgresso />)
    const linhas = container.querySelectorAll('.resumo-fila li')
    expect(linhas).toHaveLength(2)

    const linhaComTarefa = container.querySelector('.resumo-fila li[data-releitura="true"]')!
    expect(linhaComTarefa).toBeTruthy()
    expect(linhaComTarefa.querySelector('a')!.textContent).toBe(conteudo.temas[comTarefa]!.titulo)
    expect(linhaComTarefa.querySelector('.resumo-intervalo')!.textContent).toBe('D+1')
    // O selo da releitura completa, e não a data sozinha.
    expect(linhaComTarefa.querySelector('.selo-releitura')).toBeTruthy()
    const tarefa = tarefaDoTema(conteudo.temas[comTarefa]!, 1)!
    const spanTarefa = linhaComTarefa.querySelector('.resumo-tarefa')!
    expect(spanTarefa.className).not.toContain('sem-tarefa')
    expect(spanTarefa.textContent).toContain(tarefa.oQueFazer)

    const linhaSemTarefa = container.querySelector('.resumo-fila li[data-releitura="false"]')!
    expect(linhaSemTarefa).toBeTruthy()
    expect(linhaSemTarefa.querySelector('.resumo-intervalo')!.textContent).toBe('D+3')
    const spanSemTarefa = linhaSemTarefa.querySelector('.resumo-tarefa.sem-tarefa')!
    expect(spanSemTarefa.textContent).toContain('Sem tarefa tabelada para este intervalo')
    // Sem tarefa emprestada de outro intervalo: o caminho é a seção 10 do próprio tema.
    expect(
      spanSemTarefa.querySelector('a[href="#/tema/01-fundamentos/TEMA-02/secao-10"]'),
    ).toBeTruthy()
  })
})
