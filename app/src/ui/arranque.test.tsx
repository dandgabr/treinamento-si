// @vitest-environment jsdom
//
// Teste do ARRANQUE (`src/main.tsx`) e das duas guardas do repositório de conteúdo
// (`carregar()`, em `src/infrastructure/content/repository.ts`) — os únicos caminhos do app que
// rodam ANTES de existir tela, e que nenhum teste de componente alcança.
//
// O que se mede, e por que não é espelho da implementação:
//
//   1. o app só é montado DEPOIS de o conteúdo chegar. `main.tsx` faz `await carregar()` antes do
//      `createRoot(...)`, e os componentes leem `content` na renderização. A prova é temporal: a
//      raiz fica VAZIA enquanto a leitura não volta e só passa a ter o app quando ela volta — se o
//      `await` sumisse, o marcador apareceria com a leitura ainda pendente;
//   2. sem `#root`, o arranque falha com a mensagem que diz o que faltou, em vez de estourar num
//      `createRoot(null)` ilegível (ou, pior, montar em lugar nenhum e deixar a página branca);
//   3. `carregar()` não troca conteúdo bom por lixo: um JSON editado à mão que não tem a forma
//      esperada vira AVISO com `content` vazio, e uma fonte que lança também — o app abre e diz o
//      comando do build, em vez de quebrar numa leitura de propriedade.
//
// A fonte (`@fonte`) é dublê: `lerConteudoBruto` é a fronteira entre as duas builds (inline no
// navegador, arquivo no desktop), e é o único ponto por onde os dois casos de falha entram.
// `./App` também é dublê no arranque — o que se mede lá é a ORDEM (conteúdo antes da montagem), e
// não a tela, que tem teste próprio.

import { describe, expect, it, vi } from 'vitest'

const fonte = vi.hoisted(() => ({
  /** Quantas vezes a leitura da fonte foi pedida. */
  leituras: 0,
  /** O que a leitura devolve — armado pelo teste, para controlar o tempo. */
  ler: null as null | (() => Promise<unknown>),
}))

vi.mock('@fonte', () => ({
  lerConteudoBruto: (): Promise<unknown> => {
    fonte.leituras += 1
    if (!fonte.ler) throw new Error('o teste não armou a fonte')
    return fonte.ler()
  },
}))

vi.mock('./App', () => ({
  // Marcador no lugar da tela inteira: o que o arranque promete é a MONTAGEM, e o `<p>` diz se ela
  // aconteceu sem arrastar o app (e o conteúdo de 3,8 MB) para dentro deste arquivo.
  App: () => <p id="app-montado">app montado</p>,
}))

/** Uma promessa cuja resolução é do teste: é ela que diz quando o conteúdo "chega". */
function pendente(): { promessa: Promise<unknown>; resolver: (v: unknown) => void } {
  let resolver!: (v: unknown) => void
  const promessa = new Promise<unknown>((r) => {
    resolver = r
  })
  return { promessa, resolver }
}

/** Um conteúdo na forma que `temFormaDeConteudo` aceita — o mínimo, e não o material inteiro. */
function conteudoValido(): unknown {
  return {
    meta: { geradoEm: '', totais: { areas: 0, temas: 0, paginas: 0 } },
    areas: [],
    temas: {},
    ordemEstudo: [],
    paginas: [],
  }
}

/** Monta a raiz que o `index.html` traz — ou tira a dela, para o caminho sem `#root`. */
function armarRaiz(): HTMLElement {
  document.body.innerHTML = '<div id="root"></div>'
  return document.getElementById('root') as HTMLElement
}

describe('o arranque monta o app depois do conteúdo, e falha claro sem #root', () => {
  it('não monta nada enquanto o conteúdo não chega, e monta quando ele chega', async () => {
    const raiz = armarRaiz()
    const { promessa, resolver } = pendente()
    fonte.ler = () => promessa
    fonte.leituras = 0
    vi.resetModules()

    const arranque = import('../main')

    // A importação de `main.tsx` fica pendurada no `await carregar()`: é exatamente onde o app
    // está no primeiro instante do arranque. A espera é pela LEITURA pedida (e não pelo tempo):
    // quando ela aparece, o arranque já passou do `ligarMenuDoApp` e está parado no `await`.
    await vi.waitFor(() => expect(fonte.leituras).toBe(1))

    // Nada montado, e a leitura já pendente: sem o `await`, o React teria montado sobre um
    // conteúdo que ainda não existe (os componentes leem `content` na renderização).
    expect(raiz.innerHTML).toBe('')

    resolver(conteudoValido())
    await arranque

    // A raiz recebe o app: o `createRoot` do React 19 pinta de forma assíncrona, então a espera é
    // pela PINTURA (e não por um tick do teste).
    await vi.waitFor(() =>
      expect(raiz.querySelector('#app-montado')?.textContent).toBe('app montado'),
    )
  })

  it('sem o #root no documento, diz o que faltou em vez de montar no vazio', async () => {
    document.body.innerHTML = ''
    fonte.ler = () => Promise.resolve(conteudoValido())
    vi.resetModules()

    await expect(import('../main')).rejects.toThrow('#root ausente no index.html')
  })
})

describe('carregar() — a guarda de forma do conteúdo', () => {
  it('um conteúdo que não tem a forma esperada vira aviso, e o app segue com o conteúdo vazio', async () => {
    vi.resetModules()
    fonte.ler = () => Promise.resolve({ versao: 3, areas: 'nada' })
    const repo = await import('../infrastructure/content/repository')

    await repo.carregar()

    // O aviso diz o COMANDO que regenera o arquivo, como o da leitura que falhou: quem editou o
    // JSON à mão precisa saber por onde voltar.
    expect(repo.erroConteudo).toBe(
      'O arquivo de conteúdo não tem a forma esperada. Rode `npm run build:content` e recarregue.',
    )
    // E nada do arquivo torto entrou: `areas` continua vazio, e não o `'nada'` do objeto recusado.
    expect(repo.content.areas).toEqual([])
    expect(repo.content.temas).toEqual({})
  })

  it('a fonte que lança vira o outro aviso, e o conteúdo continua vazio', async () => {
    vi.resetModules()
    const erro = new Error('EIO')
    fonte.ler = () => Promise.reject(erro)
    const reprovado = vi.spyOn(console, 'error').mockImplementation(() => {})
    const repo = await import('../infrastructure/content/repository')

    await repo.carregar()

    expect(repo.erroConteudo).toBe(
      'Não consegui carregar o conteúdo. Rode `npm run build:content` e recarregue.',
    )
    // A causa fica no console: o aviso da tela é para quem usa; o console, para quem depura.
    expect(reprovado).toHaveBeenCalledWith('[conteudo] falha ao carregar', erro)
    expect(repo.content.areas).toEqual([])
    reprovado.mockRestore()
  })

  it('um valor que nem é objeto é recusado pela guarda (e não por um throw mais adiante)', async () => {
    vi.resetModules()
    fonte.ler = () => Promise.resolve('conteúdo de mentira')
    const repo = await import('../infrastructure/content/repository')

    await repo.carregar()

    expect(repo.erroConteudo).toBe(
      'O arquivo de conteúdo não tem a forma esperada. Rode `npm run build:content` e recarregue.',
    )
  })
})
