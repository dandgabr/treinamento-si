// @vitest-environment jsdom
//
// O app aberto SEM conteúdo — o caminho do build que não rodou (`npm run build:content`) ou do
// arquivo que não veio.
//
// É o único caminho em que `erroConteudo` tem valor, e sem esta prova a faixa de aviso do `App`
// podia desaparecer (ou aparecer sempre) sem que nada mais mudasse. Junto com ela, o mesmo cenário
// mede a outra metade das seções do painel: com zero páginas de referência e zero catálogos, as
// listas "Referência" e "Trilhas, certificações e fontes" têm de SUMIR — um título com uma lista
// vazia embaixo é um buraco sem explicação, e o inverso (o `: null` que esconde as duas) é o que
// este teste prende.
//
// O `main.tsx` não entra aqui: o arranque tem teste próprio (`arranque.test.tsx`), onde a tela é
// dublê porque o que se mede lá é a ordem entre a leitura e a montagem.

import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Persistencia } from '../infrastructure/storage/persistencia'

vi.mock('@fonte', () => ({
  // A fonte desta build é a única coisa que sabe se o conteúdo veio: o resto do módulo do
  // repositório (a guarda de forma) roda de verdade.
  lerConteudoBruto: () => Promise.reject(new Error('sem content.json')),
}))

// O Mermaid depende de medição de layout, que o jsdom não faz — e nada aqui passa por ele.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  // O store resolve o provedor na importação; um provedor de mentira evita escrever no
  // armazenamento de quem roda a suíte.
  persistencia: (): Persistencia => ({
    descricao: 'num provedor de teste',
    carregar: () => Promise.resolve(null),
    gravar: () => Promise.resolve(),
    apagar: () => Promise.resolve(),
    exportar: () => Promise.resolve({ estado: 'ok' }),
    importar: () => Promise.resolve({ estado: 'cancelado' }),
  }),
}))

afterEach(cleanup)

beforeAll(() => {
  // O jsdom não implementa `matchMedia` (que o App lê para o tema do sistema) nem
  // `scrollIntoView`. A preferência responde "claro" e nada observa a troca: aqui o tema não é o
  // que se mede.
  window.matchMedia = (consulta: string): MediaQueryList => ({
    matches: false,
    media: consulta,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  })
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
})

describe('o app quando o conteúdo não veio', () => {
  it('abre o painel, diz o comando do build — e não mostra as listas que dependem do material', async () => {
    const reclamado = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.resetModules()
    window.location.hash = '#/'
    const repositorio = await import('../infrastructure/content/repository')
    await repositorio.carregar()
    const { App } = await import('./App')
    render(<App />)

    // A faixa de aviso existe, e é a mensagem do repositório — não uma frase escrita na tela.
    expect(document.querySelector('.aviso-erro')?.textContent).toBe(repositorio.erroConteudo)
    expect(repositorio.erroConteudo).toContain('npm run build:content')

    // O painel continua de pé: é o que a faixa promete ("o app abre e diz o que fazer").
    expect(document.querySelector('h1')?.textContent).toBe('Roadmap CISO')
    expect(document.querySelector('.hero p')?.textContent).toContain('0 áreas · 0 temas')

    // As duas listas de páginas somem em vez de aparecerem vazias: os títulos "Referência" e
    // "Trilhas, certificações e fontes" não estão na tela, e não há `<li>` de página nenhum.
    const titulos = [...document.querySelectorAll('.secao h2')].map((h) => h.textContent)
    expect(titulos).toContain('Praticar')
    expect(titulos).not.toContain('Referência')
    expect(titulos).not.toContain('Trilhas, certificações e fontes')
    expect(document.querySelectorAll('.lista-paginas li')).toHaveLength(0)
    expect(document.querySelectorAll('.lista-areas li')).toHaveLength(0)

    reclamado.mockRestore()
  })
})
