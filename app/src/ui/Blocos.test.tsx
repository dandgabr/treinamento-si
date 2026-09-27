// @vitest-environment jsdom
//
// Teste dos blocos do app que só tinham teste de DOM parado: o "Revelar resposta" do `BlocoQA`, a
// escala de confiança do pré-teste (`EscalaConfianca`, dentro de `PreTeste`) e a `key` que decide
// quando o material é remontado na troca de tema.
//
// O que estava medido e o que este arquivo passa a medir:
//
//   - o smoke lia `hidden` e `aria-expanded` do gabarito SEM NUNCA CLICAR: o botão podia estar
//     ligado a nada que a suíte não via. Aqui o clique é de verdade (`userEvent`) e o que se
//     confere é o efeito — o gabarito sai do `hidden`, o `aria-expanded` vira `true`, o
//     `aria-controls` aponta para o gabarito DAQUELE item e o vizinho fica fechado;
//   - as setas, Home e End da escala (e o `registrarConfianca` que elas chamam) não tinham teste
//     nenhum: nem unidade, nem smoke. Aqui cada tecla é apertada no botão focado e o que se
//     confere é o nível marcado, o foco (o "roving tabindex") e o que ficou GRAVADO no progresso —
//     o store de verdade, com o provedor trocado, como em `Progresso.test.tsx`.
//
// O `PreTeste` (e não a escala sozinha) é montado porque a escala não é exportada: o que a tela
// oferece é o bloco do pré-teste, e é por ele que o registro sai.

import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { QuestaoPreTeste } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

const compartilhado = vi.hoisted(() => ({ provedor: null as Persistencia | null }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  // O store resolve o provedor na IMPORTAÇÃO: o teste arma o provedor de mentira antes de importar
  // (`carregarBlocos`, abaixo). Sem ele armado, é melhor estourar aqui do que deixar a suíte
  // escrever no armazenamento de quem roda.
  persistencia: (): Persistencia => {
    if (!compartilhado.provedor) throw new Error('o provedor de teste não foi armado')
    return compartilhado.provedor
  },
}))

/** Provedor de mentira: nada guardado, nada gravado — o que se lê é o estado em memória. */
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
 * O store e os blocos, com os módulos recarregados.
 *
 * O store resolve o provedor e dispara a carga UMA vez, na importação: sem `vi.resetModules()` o
 * provedor de teste chegaria tarde e o teste escreveria no armazenamento de quem roda a suíte. Por
 * isso os módulos vêm por `import()` e não no topo do arquivo.
 */
async function carregarBlocos(): Promise<{
  blocos: typeof import('./Blocos')
  store: typeof import('../application/progresso-store')
}> {
  compartilhado.provedor = provedorDeTeste()
  vi.resetModules()
  const store = await import('../application/progresso-store')
  const blocos = await import('./Blocos')
  await store.quandoCarregado()
  return { blocos, store }
}

const PARES_QA = [
  { pergunta: 'Primeira pergunta', resposta: 'Primeira resposta' },
  { pergunta: 'Segunda pergunta', resposta: 'Segunda resposta' },
]

afterEach(cleanup)

describe('BlocoQA — o gabarito sob demanda', () => {
  it('revela a resposta do item clicado e deixa o outro fechado', async () => {
    const usuario = userEvent.setup()
    const { blocos } = await carregarBlocos()
    const { container } = render(
      <blocos.BlocoQA titulo="10. Recuperação ativa" pares={PARES_QA} />,
    )

    const gabaritos = [...container.querySelectorAll<HTMLElement>('.gabarito')]
    expect(gabaritos).toHaveLength(2)
    expect(gabaritos.map((g) => g.hidden)).toEqual([true, true])

    const revelar = screen.getByRole('button', { name: 'Revelar a resposta da questão 1' })
    // O `aria-controls` é a ligação botão↔gabarito, e é ela que o leitor de tela segue: aponta
    // para o gabarito DESTE item, e não para o do vizinho.
    expect(document.getElementById(revelar.getAttribute('aria-controls') ?? '')).toBe(gabaritos[0])
    expect(revelar.getAttribute('aria-expanded')).toBe('false')

    await usuario.click(revelar)

    // O efeito do clique: o gabarito do item 1 sai do `hidden` e o do item 2 continua fechado —
    // o estado é por item, e não um "aberto" global.
    expect(gabaritos.map((g) => (g.hidden ? 'escondido' : 'visivel'))).toEqual([
      'visivel',
      'escondido',
    ])
    expect(gabaritos[0]?.textContent).toContain('Primeira resposta')
    // E o botão passa a anunciar o estado novo (o texto e o nome acessível andam juntos).
    const ocultar = screen.getByRole('button', { name: 'Ocultar a resposta da questão 1' })
    expect(ocultar.getAttribute('aria-expanded')).toBe('true')
    expect(ocultar.textContent).toBe('Ocultar resposta')

    await usuario.click(ocultar)

    expect(gabaritos.map((g) => g.hidden)).toEqual([true, true])
    expect(
      screen
        .getByRole('button', { name: 'Revelar a resposta da questão 1' })
        .getAttribute('aria-expanded'),
    ).toBe('false')
  })
})

describe('PreTeste — a escala de confiança', () => {
  const REF = '01-fundamentos#TEMA-01'
  const QUESTOES: QuestaoPreTeste[] = [
    { pergunta: 'O que é risco?' },
    { pergunta: 'O que é controle?' },
  ]

  /** Os cinco botões do grupo de uma questão, pelo número do nível. */
  function niveis(indice: number): HTMLButtonElement[] {
    const grupo = screen.getByRole('group', { name: `Confiança na questão ${indice}` })
    return [1, 2, 3, 4, 5].map(
      (n) =>
        within(grupo).getByRole('button', {
          name: new RegExp(`Nível ${n} de 5`),
        }) as HTMLButtonElement,
    )
  }

  /** O nível marcado agora, pelo `aria-pressed` que a tela publica. */
  function marcado(botoes: HTMLButtonElement[]): number[] {
    return botoes
      .map((botao, i) => (botao.getAttribute('aria-pressed') === 'true' ? i + 1 : 0))
      .filter((n) => n > 0)
  }

  /** O que ficou GRAVADO no progresso para o tema, item a item. */
  function gravado(store: typeof import('../application/progresso-store')): unknown {
    return store.instantaneo().estado.temas[REF]?.preTeste ?? []
  }

  it('anda com as setas, Home e End, marca o nível e grava a confiança', async () => {
    const usuario = userEvent.setup()
    const { blocos, store } = await carregarBlocos()
    render(<blocos.PreTeste refTema={REF} questoes={QUESTOES} id="secao-3" />)

    const doItem = niveis(1)
    // Uma parada de tabulação para a escala inteira: o nível 1 é o ponto de entrada da tabulação
    // enquanto nada foi escolhido (e é ele que recebe o foco na troca de `tabIndex`), mas nenhum
    // nível está MARCADO — `aria-pressed` só é `true` depois de uma escolha.
    expect(doItem.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1, -1])
    expect(marcado(doItem)).toEqual([])

    doItem[0]?.focus()
    await usuario.keyboard('{ArrowRight}')

    // A seta marca o próximo nível E leva o foco com ele (o nível marcado é a parada de tabulação).
    expect(marcado(doItem)).toEqual([2])
    expect(document.activeElement).toBe(doItem[1])
    expect(doItem.map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1, -1])
    expect(gravado(store)).toEqual([{ indice: 0, confianca: 2 }])

    await usuario.keyboard('{End}')
    expect(marcado(doItem)).toEqual([5])
    expect(document.activeElement).toBe(doItem[4])
    expect(gravado(store)).toEqual([{ indice: 0, confianca: 5 }])

    // No extremo, a seta não sai da escala: 5 continua 5.
    await usuario.keyboard('{ArrowRight}')
    expect(marcado(doItem)).toEqual([5])
    expect(gravado(store)).toEqual([{ indice: 0, confianca: 5 }])

    await usuario.keyboard('{Home}')
    expect(marcado(doItem)).toEqual([1])
    expect(document.activeElement).toBe(doItem[0])
    expect(gravado(store)).toEqual([{ indice: 0, confianca: 1 }])

    await usuario.keyboard('{ArrowLeft}')
    expect(marcado(doItem)).toEqual([1])

    await usuario.keyboard('{ArrowDown}')
    expect(marcado(doItem)).toEqual([2])
    await usuario.keyboard('{ArrowUp}')
    expect(marcado(doItem)).toEqual([1])
  })

  it('cada questão tem a própria escala e o próprio índice no progresso', async () => {
    const usuario = userEvent.setup()
    const { blocos, store } = await carregarBlocos()
    render(<blocos.PreTeste refTema={REF} questoes={QUESTOES} id="secao-3" />)

    const primeira = niveis(1)
    const segunda = niveis(2)

    primeira[2]?.focus()
    await usuario.keyboard('{ArrowRight}')
    segunda[0]?.focus()
    await usuario.keyboard('{ArrowRight}')

    // O nível 4 fica na primeira escala e o 2 na segunda: o estado é por item, e o `indice` gravado
    // é o da questão do grupo em que se teclou.
    expect(marcado(primeira)).toEqual([4])
    expect(marcado(segunda)).toEqual([2])
    expect(gravado(store)).toEqual([
      { indice: 0, confianca: 4 },
      { indice: 1, confianca: 2 },
    ])

    // Regravar o mesmo índice o substitui, em vez de duplicar o item do progresso.
    primeira[0]?.focus()
    await usuario.keyboard('{ArrowRight}')
    expect(gravado(store)).toEqual([
      { indice: 0, confianca: 2 },
      { indice: 1, confianca: 2 },
    ])
  })

  it('o pré-teste recebe o foco pelo `h2`, como as seções do material', async () => {
    const { blocos } = await carregarBlocos()
    const { container } = render(
      <blocos.PreTeste refTema={REF} questoes={QUESTOES} id="secao-3" />,
    )

    // `id` e `tabIndex` no MESMO nó: com o `id` no `<section>` e o `tabIndex` no `<h2>` de dentro,
    // `irParaSecao` achava o section, o `focus()` era no-op em elemento não focável e a função
    // devolvia `true` — a âncora existia e não levava o foco a lugar nenhum.
    const titulo = container.querySelector('h2')
    expect(titulo?.id).toBe('secao-3')
    expect(titulo?.tabIndex).toBe(-1)
    expect(titulo?.textContent).toContain('Pré-teste')

    titulo?.focus()
    expect(document.activeElement).toBe(titulo)
  })
})

describe('chaveDoMaterial — quando o material é remontado', () => {
  it('leva o tema na chave só quando o trecho tem diagrama', async () => {
    const { blocos } = await carregarBlocos()

    const comDiagrama = '<p>antes</p>\n<div class="mermaid">flowchart TD\n A --> B</div>'
    const semDiagrama = '<p>Sobre o Mermaid: o diagrama abaixo explica o fluxo.</p>'

    expect(blocos.temDiagrama(comDiagrama)).toBe(true)
    expect(blocos.temDiagrama(semDiagrama)).toBe(false)
    // Com diagrama, a chave muda com o tema: é isso que faz o React remontar o trecho e o Mermaid
    // redesenhar com as cores novas.
    expect(blocos.chaveDoMaterial('5', comDiagrama, false)).toBe('5-false')
    expect(blocos.chaveDoMaterial('5', comDiagrama, true)).toBe('5-true')
    // Sem diagrama, a chave é a MESMA nos dois temas: o nó (e o foco que está nele) sobrevive.
    expect(blocos.chaveDoMaterial('4', semDiagrama, false)).toBe('4')
    expect(blocos.chaveDoMaterial('4', semDiagrama, true)).toBe('4')
  })
})
