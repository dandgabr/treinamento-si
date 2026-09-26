import { describe, expect, it } from 'vitest'
import { acertosMinimos, aprovouNoCriterio, interpretarCriterio } from './criterio'

describe('interpretarCriterio', () => {
  it('lê a fração usada pela maioria dos guias', () => {
    // Texto real do guia 00-guia-basico.
    const alvo = interpretarCriterio('acertar 4 dos 5 itens sem consultar os temas. Errar o item 2...')
    expect(alvo).toEqual({ tipo: 'fracao', acertos: 4, total: 5, percentual: 80 })
  })

  it('lê a variante "N das M"', () => {
    const alvo = interpretarCriterio('acertar 5 das 6 sem consultar os temas.')
    expect(alvo).toEqual({ tipo: 'fracao', acertos: 5, total: 6, percentual: 83 })
  })

  it('lê percentual declarado', () => {
    // Texto real do guia 01-fundamentos.
    expect(interpretarCriterio('acertar 80% ou mais sem consultar os temas.')).toEqual({
      tipo: 'percentual',
      acertos: 0,
      total: 0,
      percentual: 80,
    })
  })

  it('lê "80% de acerto"', () => {
    expect(interpretarCriterio('80% de acerto sem consultar os temas.')?.percentual).toBe(80)
  })

  it('devolve null sem número utilizável', () => {
    expect(interpretarCriterio('')).toBeNull()
    expect(interpretarCriterio('reler o tema antes de avançar')).toBeNull()
  })

  it('lê o critério real da área 14, que cita "TEMA-04 de 11" no texto', () => {
    // Texto real: "acertar 80% ou mais ... releia o TEMA-04 desta área e o
    // [TEMA-04 de 11 Resposta e forense](...)". Sem ancorar a fração no verbo e sem
    // tirar os links, isso virava "4 de 11" = 36% e o guia passava a exigir 2 acertos.
    const alvo = interpretarCriterio(
      'acertar 80% ou mais sem consultar os temas. Erro no item 2 significa que forense e ' +
        'privacidade ainda estão fundidos; releia o TEMA-04 desta área e o ' +
        '[TEMA-04 de 11 Resposta e forense](../11-resposta-forense/TEMA-04-x.md).',
    )
    expect(alvo).toEqual({ tipo: 'percentual', acertos: 0, total: 0, percentual: 80 })
    expect(acertosMinimos(alvo!, 5)).toBe(4)
  })

  it('não confunde a menção a um item com uma fração', () => {
    // "Erro no item 2 ou no item 4 significa que..." não tem "acertar N de M".
    expect(interpretarCriterio('Erro no item 2 ou no item 4 significa reler.')).toBeNull()
  })

  it('recusa fração impossível', () => {
    expect(interpretarCriterio('acertar 7 dos 5 itens')).toBeNull()
  })
})

describe('acertosMinimos', () => {
  it('usa o acerto declarado quando o total confere', () => {
    const alvo = interpretarCriterio('acertar 4 dos 5 itens')!
    expect(acertosMinimos(alvo, 5)).toBe(4)
  })

  it('mantém a proporção quando o total diverge', () => {
    const alvo = interpretarCriterio('acertar 5 das 6 sem consultar')!
    expect(acertosMinimos(alvo, 6)).toBe(5)
    expect(acertosMinimos(alvo, 12)).toBe(10)
  })

  it('arredonda para cima no percentual', () => {
    const alvo = interpretarCriterio('acertar 80% ou mais')!
    expect(acertosMinimos(alvo, 5)).toBe(4)
    expect(acertosMinimos(alvo, 7)).toBe(6)
  })
})

describe('aprovouNoCriterio', () => {
  it('aprova no limite exato', () => {
    const alvo = interpretarCriterio('acertar 4 dos 5 itens')!
    expect(aprovouNoCriterio(alvo, 4, 5)).toBe(true)
    expect(aprovouNoCriterio(alvo, 3, 5)).toBe(false)
  })

  it('devolve null sem critério ou sem itens', () => {
    expect(aprovouNoCriterio(null, 5, 5)).toBeNull()
    expect(aprovouNoCriterio(interpretarCriterio('80%')!, 0, 0)).toBeNull()
  })
})
