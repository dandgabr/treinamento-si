// A gramatica do href de rota, que o portao do build e o smoke compartilham.
//
// O modulo e `.mjs` (os dois mundos o importam) e nao tinha teste proprio: era exercitado so
// atraves do resolvedor de links e do smoke. A primeira versao da regra reprovava `#/quiz` — a
// unica rota sem segundo segmento — e quem pegou foi o smoke, na rota do painel. O caso esta aqui
// agora, junto dos outros escopos do quiz.

import { describe, expect, it } from 'vitest'
import { ehHrefDeRota, rotasDoConteudo } from './rotas-app.mjs'

const CONTEUDO = {
  areas: [{ areaId: '01-fundamentos' }, { areaId: '02-governanca-risco-compliance' }],
  temas: { '01-fundamentos#TEMA-01': {}, '02-governanca-risco-compliance#TEMA-01': {} } as Record<
    string,
    unknown
  >,
  paginas: [{ slug: 'glossario' }, { slug: '91-trilhas/plano-90-dias' }],
}

const ROTAS = rotasDoConteudo(CONTEUDO)
const valido = (href: string): boolean => ehHrefDeRota(href, ROTAS)

describe('rotasDoConteudo', () => {
  it('lê as três listas do conteúdo', () => {
    expect([...ROTAS.areas]).toEqual(['01-fundamentos', '02-governanca-risco-compliance'])
    expect([...ROTAS.temas]).toEqual(['01-fundamentos#TEMA-01', '02-governanca-risco-compliance#TEMA-01'])
    expect([...ROTAS.paginas]).toEqual(['glossario', '91-trilhas/plano-90-dias'])
  })
})

describe('ehHrefDeRota', () => {
  it('aceita as rotas que o app resolve', () => {
    for (const href of [
      '#/', // o painel
      '#/area/01-fundamentos',
      '#/area/01-fundamentos/secao-4', // a âncora viaja como último segmento
      '#/tema/01-fundamentos/TEMA-01',
      '#/tema/01-fundamentos/TEMA-01/secao-10',
      '#/pagina/glossario',
      '#/pagina/glossario/termo-tls', // o verbete é o último segmento
      '#/pagina/91-trilhas/plano-90-dias', // slug de dois segmentos
      '#/pagina/91-trilhas/plano-90-dias/secao-2',
      // Os três escopos do quiz: `#/quiz` não tem segundo segmento, e é o caso que a primeira
      // versão da regra reprovava.
      '#/quiz',
      '#/quiz/01-fundamentos',
      '#/quiz/01-fundamentos/TEMA-01',
    ]) {
      expect(valido(href), href).toBe(true)
    }
  })

  it('reprova o fragmento de âncora do material, que não é rota', () => {
    // `README.md#4-temas` é a grafia canônica; sozinha, a âncora derruba a tela inteira.
    expect(valido('#4-temas')).toBe(false)
    expect(valido('#secao-4')).toBe(false)
    // `#` nu também não abre tela nenhuma.
    expect(valido('#')).toBe(false)
    expect(valido('')).toBe(false)
  })

  it('reprova a rota que o app não tem', () => {
    expect(valido('#/area/99-inexistente')).toBe(false)
    expect(valido('#/area')).toBe(false)
    expect(valido('#/tema/01-fundamentos')).toBe(false) // tema sem o TEMA-NN
    expect(valido('#/tema/01-fundamentos/TEMA-99')).toBe(false)
    expect(valido('#/tema/99-outra/TEMA-01')).toBe(false)
    expect(valido('#/pagina/sumiu')).toBe(false)
    expect(valido('#/pagina')).toBe(false)
    expect(valido('#/quiz/99-inexistente')).toBe(false)
    expect(valido('#/quiz/01-fundamentos/TEMA-99')).toBe(false)
    expect(valido('#/quiz/01-fundamentos/TEMA-01/x/y')).toBe(false)
    expect(valido('#/rota-nova')).toBe(false)
  })

  it('não deixa um `%` solto derrubar a leitura', () => {
    // `decodeURIComponent` lançaria URIError dentro do render; a rota vira "desconhecida" e o
    // href é reprovado, em vez de estourar.
    expect(valido('#/pagina/100%')).toBe(false)
    expect(valido('#/area/100%')).toBe(false)
  })
})
