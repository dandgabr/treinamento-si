// @vitest-environment jsdom
//
// A rota com ancora tem de ABRIR no alvo, e não no topo da tela.
//
// O único link ancorado do material é `[01 Fundamentos](../01-fundamentos/README.md#4-temas)`, e
// `links-material` o transforma em `#/area/01-fundamentos/secao-4`. A tela lia os dois primeiros
// segmentos e descartava o resto: a área abria em `scrollY: 0`, com a seção 4 a milhares de pixels
// de distância, e a promessa do link morria no clique. O que se confere aqui é o EFEITO — o foco
// (e a rolagem, que o `scrollIntoView` do jsdom não faz) indo para o `id` que a própria tela monta
// (`idDaSecao`, em `Blocos.tsx`), e não o `href` existir no HTML.
//
// O conteúdo é o de verdade (o mesmo `content.json` da tela) e a rota entra pelo `hash`, que é o
// canal do app: é o caminho de quem abre um link compartilhado. O provedor de persistência é
// trocado para a tela não escrever no armazenamento de quem roda a suíte.

import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import type { Conteudo } from '../domain/types'
import type { Persistencia } from '../infrastructure/storage/persistencia'

// O Mermaid depende de medição de layout, que o jsdom não faz, e nada aqui passa por um diagrama.
vi.mock('./mermaid', () => ({ renderizarMermaid: () => Promise.resolve() }))

const compartilhado = vi.hoisted(() => ({ provedor: null as unknown as Persistencia }))

vi.mock('../infrastructure/storage/persistencia', () => ({
  persistencia: () => compartilhado.provedor,
}))

/** Provedor de mentira: nada guardado, nada gravado — a rolagem não depende dele. */
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
 * Monta o app na rota pedida.
 *
 * `vi.resetModules()` porque o store resolve o provedor e dispara a carga UMA vez, na importação;
 * o `hash` é trocado antes da renderização, como quem chega pelo link.
 */
async function abrir(hash: string): Promise<Conteudo> {
  compartilhado.provedor = provedorDeTeste()
  vi.resetModules()
  window.location.hash = hash
  const repositorio = await import('../infrastructure/content/repository')
  await repositorio.carregar()
  const { App } = await import('./App')
  render(<App />)
  return repositorio.content
}

const AREA = '01-fundamentos'
/** O número da seção 4 do guia: é ele que `README.md#4-temas` endereça. */
const SECAO = 4

beforeAll(() => {
  // O jsdom não implementa `scrollIntoView` nem `matchMedia` (que o App lê para o tema do
  // sistema), e o `scrollTo` dele só registra "não implementado". O foco, que é o que este teste
  // mede, o jsdom faz de verdade.
  Element.prototype.scrollIntoView = () => {}
  window.scrollTo = () => {}
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
})

afterEach(cleanup)

describe('rota com ancora', () => {
  it('abre a área na seção que o endereço pede, e não no topo', async () => {
    const conteudo = await abrir(`#/area/${AREA}/secao-${SECAO}`)
    const alvo = document.getElementById(`secao-${SECAO}`)

    // A seção do material está na tela: o texto é o do guia, e não uma frase do app.
    const secaoDoMaterial = conteudo.areas
      .find((a) => a.areaId === AREA)
      ?.guia.secoes.find((s) => s.numero === SECAO)
    expect(secaoDoMaterial).toBeTruthy()
    expect(alvo?.tagName).toBe('H2')
    expect(alvo?.textContent).toContain(secaoDoMaterial?.titulo)

    // E é ELA que recebeu o foco. Sem ler o último segmento da rota (ou sem o App honrá-lo), o
    // foco fica no `body` e a seção 4 abre a milhares de pixels do topo — este `expect` é a
    // diferença entre o endereço existir e o endereço FUNCIONAR.
    expect(document.activeElement).toBe(alvo)
  })

  it('não move o foco quando a área é aberta sem âncora', async () => {
    await abrir(`#/area/${AREA}`)
    // Nenhum alvo pedido: a tela abre no topo, que é o comportamento de sempre. Sem esta
    // contraprova, um efeito que focasse sempre a primeira seção passaria no teste de cima.
    expect(document.getElementById(`secao-${SECAO}`)).not.toBeNull()
    expect(document.activeElement).toBe(document.body)
  })

  it('não deixa o foco em lugar nenhum quando a âncora não existe na tela', async () => {
    await abrir(`#/area/${AREA}/secao-99`)
    // `irParaSecao` devolve `false` e nada é focado: quem abriu um endereço que não existe não
    // pode ficar com o foco preso num alvo inventado.
    expect(document.activeElement).toBe(document.body)
  })
})
