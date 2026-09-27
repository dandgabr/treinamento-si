// @vitest-environment jsdom
//
// `local.ts` é a única fronteira com o `localStorage`, e existe pela guarda: abrindo o app por
// `file://` ou em janela privada, o navegador pode NEGAR o acesso e o getter lança. Sem a guarda, a
// leitura dentro do inicializador de estado do React derrubaria a aplicação inteira — e a gravação,
// dentro de um clique, também.
//
// `lerTexto` colapsa "não há nada" e "não consegui ler" em `null`, que é o certo para preferência
// (o tema claro/escuro). `lerTextoOuNegado` distingue as duas, porque no progresso `null` AUTORIZA
// a próxima gravação: gravar por cima de um dado que existe e não abrimos apaga o estudo.

import { beforeEach, describe, expect, it } from 'vitest'
import { gravarTexto, lerTexto, lerTextoOuNegado, removerTexto } from './local'

/** Torna o acesso a `window.localStorage` uma exceção, como a janela privada faz. */
function negarArmazenamento(): () => void {
  const original = Object.getOwnPropertyDescriptor(window, 'localStorage')
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('SecurityError')
    },
  })
  return () => {
    if (original) Object.defineProperty(window, 'localStorage', original)
    else Reflect.deleteProperty(window, 'localStorage')
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('lerTexto', () => {
  it('devolve o que está guardado, e null quando a chave não existe', () => {
    window.localStorage.setItem('k', 'v')
    expect(lerTexto('k')).toBe('v')
    expect(lerTexto('outra')).toBeNull()
  })

  it('devolve null, em vez de lançar, quando o armazenamento é negado', () => {
    // É uma preferência: qualquer falha vira "sem valor" e a tela abre com o padrão.
    const restaurar = negarArmazenamento()
    try {
      expect(lerTexto('k')).toBeNull()
    } finally {
      restaurar()
    }
  })
})

describe('lerTextoOuNegado', () => {
  it('distingue a chave ausente (ok) da leitura negada (negado)', () => {
    expect(lerTextoOuNegado('k')).toEqual({ estado: 'ok', texto: null })
    window.localStorage.setItem('k', 'v')
    expect(lerTextoOuNegado('k')).toEqual({ estado: 'ok', texto: 'v' })

    const restaurar = negarArmazenamento()
    try {
      // A leitura negada NÃO pode virar "primeira vez": a carga do store a trata como falha.
      expect(lerTextoOuNegado('k')).toEqual({ estado: 'negado' })
    } finally {
      restaurar()
    }
  })
})

describe('gravarTexto e removerTexto', () => {
  it('gravam e removem quando o armazenamento responde', () => {
    gravarTexto('k', 'v')
    expect(window.localStorage.getItem('k')).toBe('v')
    removerTexto('k')
    expect(window.localStorage.getItem('k')).toBeNull()
  })

  it('não derrubam o clique quando o armazenamento é negado', () => {
    // A sessão continua funcionando, só não persiste: lançar aqui mataria a interação inteira.
    const restaurar = negarArmazenamento()
    try {
      expect(() => gravarTexto('k', 'v')).not.toThrow()
      expect(() => removerTexto('k')).not.toThrow()
    } finally {
      restaurar()
    }
  })
})
