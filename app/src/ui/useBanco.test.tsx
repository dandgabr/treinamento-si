// @vitest-environment jsdom
//
// Teste do ADAPTER (`useBanco`) com o domínio trocado por um dublê — não do domínio.
//
// O `Quiz.test.tsx` mocka `./useBanco` inteiro para escolher o estado da tela, e por isso o
// adapter nunca era executado: 0% das funções. O que este arquivo mede é o contrato que só ele
// cumpre, e que os testes de tela não podiam provar:
//
//   1. UMA leitura por sessão. O módulo guarda o `Promise` (e não o resultado): `StrictMode` monta
//      o efeito duas vezes em desenvolvimento, e a tela do quiz pode ser aberta e fechada várias
//      vezes sem sair do aplicativo. O que se conta aqui é quantas vezes `carregarBanco` foi
//      chamado — a asserção é sobre o número, e não sobre a identidade do objeto;
//   2. a FALHA também fica guardada. Reabrir a tela na mesma sessão não vai encontrar de novo o
//      arquivo que faltou: repetir a leitura a cada montagem faria a tela piscar "erro" e "sem
//      itens" alternadamente, e ainda pagaria a leitura de 3,8 MB por reabertura;
//   3. `carregando` é um estado distinto de "sem banco". Enquanto a leitura não volta, a tela não
//      pode afirmar nem que o banco veio nem que falhou — o mesmo cuidado do painel com o
//      progresso;
//   4. desmontar antes da leitura não escreve em componente morto (o `vivo` do efeito).
//
// `Banco` é `Record<areaId, Questao[]>`; os itens aqui são só a forma, porque o que se mede é a
// contagem de leituras, não o conteúdo de cada questão.

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Banco } from '../domain/questoes'

const dominio = vi.hoisted(() => ({
  /** Quantas vezes o adapter pediu a leitura do banco ao domínio. */
  leituras: 0,
  /** O que a próxima leitura devolve — uma promessa que o teste controla. */
  resposta: null as Promise<Banco | null> | null,
}))

vi.mock('../domain/questoes', async (importOriginal) => {
  const real = await importOriginal<typeof import('../domain/questoes')>()
  return {
    ...real,
    // O dublê conta e devolve a promessa ARMADA pelo teste: sem controle do tempo, "uma leitura
    // por sessão" e "carregando antes de a leitura voltar" não seriam observáveis.
    carregarBanco: (): Promise<Banco | null> => {
      dominio.leituras += 1
      if (!dominio.resposta) throw new Error('o teste não armou a resposta de carregarBanco')
      return dominio.resposta
    },
  }
})

/** Uma promessa cuja resolução (ou falha) é do teste. */
function pendente(): { promessa: Promise<Banco | null>; resolver: (b: Banco | null) => void } {
  let resolver!: (b: Banco | null) => void
  const promessa = new Promise<Banco | null>((r) => {
    resolver = r
  })
  return { promessa, resolver }
}

const BANCO: Banco = {
  '01-fundamentos': [],
  '02-governanca-risco-compliance': [],
}

/**
 * O adapter montado num componente mínimo.
 *
 * O estado é publicado em TEXTO porque é por ele que os quatro caminhos se distinguem: o
 * `carregando` de antes da leitura, o banco que chegou, o erro da leitura que falhou.
 */
function Sonda(): ReactElement {
  const { banco, erro, carregando } = useBanco()
  const estado = carregando ? 'carregando' : erro ? `erro:${erro}` : `banco:${banco ? Object.keys(banco).length : 'nulo'}`
  return <p role="status">{estado}</p>
}

let useBanco: typeof import('./useBanco').useBanco

/** Módulo NOVO por teste: o `Promise` guardado é do módulo, e um cache de outro teste vazaria. */
beforeEach(async () => {
  dominio.leituras = 0
  dominio.resposta = null
  vi.resetModules()
  useBanco = (await import('./useBanco')).useBanco
})

afterEach(cleanup)

describe('useBanco — o estado da leitura', () => {
  it('enquanto lê, diz que está carregando; depois entrega o banco', async () => {
    const { promessa, resolver } = pendente()
    dominio.resposta = promessa

    render(<Sonda />)

    // O que a tela diz ANTES de a leitura voltar: nada sobre o banco foi afirmado ainda — nem
    // "veio", nem "falhou". Sem esta metade, um `banco: nulo` aqui seria indistinguível de falha.
    expect(screen.getByRole('status').textContent).toBe('carregando')

    resolver(BANCO)
    // O `then` do efeito roda num microtask; a asserção espera o React publicar o estado novo.
    expect(await screen.findByText('banco:2')).toBeTruthy()
    expect(screen.getByRole('status').textContent).toBe('banco:2')
  })

  it('a leitura que não trouxe banco vira erro, e não um banco vazio', async () => {
    const { promessa, resolver } = pendente()
    dominio.resposta = promessa

    render(<Sonda />)
    resolver(null)

    const aviso = await screen.findByRole('status')
    // A mensagem diz o COMANDO que gera o banco, como a do conteúdo: é o caminho de quem roda o
    // app a partir do fonte sem ter rodado o build das questões.
    expect(aviso.textContent).toBe(
      'erro:Não consegui carregar o banco de questões. Rode `npm run build:questions` e recarregue.',
    )
  })

  it('lê uma vez só, mesmo com a tela montada duas vezes', async () => {
    const { promessa, resolver } = pendente()
    dominio.resposta = promessa

    const primeira = render(<Sonda />)
    const segunda = render(<Sonda />)

    // Duas montagens, uma leitura: é o `??=` do módulo. Com uma leitura por componente, o
    // `StrictMode` (que monta o efeito duas vezes) faria duas por abertura de tela.
    expect(dominio.leituras).toBe(1)
    expect(screen.getAllByRole('status').map((p) => p.textContent)).toEqual([
      'carregando',
      'carregando',
    ])

    resolver(BANCO)

    // As duas telas recebem o MESMO resultado, sem uma segunda leitura: é o `Promise` do módulo
    // que atende as duas. (`findAllByText` resolve na primeira ocorrência; o `waitFor` espera a
    // segunda publicação, que é a que prova que a mesma promessa atendeu as duas montagens.)
    await waitFor(() => expect(screen.getAllByText('banco:2')).toHaveLength(2))
    expect(dominio.leituras).toBe(1)
    primeira.unmount()
    segunda.unmount()
  })

  it('a falha fica guardada: reabrir a tela não tenta ler o arquivo de novo', async () => {
    const { promessa, resolver } = pendente()
    dominio.resposta = promessa

    const primeira = render(<Sonda />)
    resolver(null)
    expect(await screen.findByText(/^erro:/)).toBeTruthy()
    primeira.unmount()

    // A tela reaberta: o `Promise` guardado é o mesmo, já resolvido em `null` — o erro chega sem
    // uma segunda leitura. O contador é a prova de que a reabertura não volta ao arquivo.
    render(<Sonda />)
    expect(await screen.findByText(/^erro:/)).toBeTruthy()
    expect(dominio.leituras).toBe(1)
  })

  it('a leitura guardada sobrevive à tela que saiu no meio dela', async () => {
    const { promessa, resolver } = pendente()
    dominio.resposta = promessa

    const primeira = render(<Sonda />)
    // A tela sai ANTES de a leitura voltar — é o caso do `StrictMode` e o de quem fecha o quiz
    // enquanto o arquivo ainda está sendo analisado.
    primeira.unmount()
    resolver(BANCO)
    await promessa

    // A tela reaberta recebe o MESMO `Promise`, já resolvido: o banco chega sem uma segunda
    // leitura dos 3,8 MB. Sem o `??=` do módulo, a reabertura voltaria ao domínio (leituras 2).
    render(<Sonda />)
    expect(await screen.findByText('banco:2')).toBeTruthy()
    expect(dominio.leituras).toBe(1)
  })
})
