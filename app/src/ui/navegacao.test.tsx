// O rastro da navegação (`navegacao.ts`) — a única parte da barra do topo que dá para provar sem
// navegador de verdade.
//
// O problema que ele resolve não tem resposta no navegador: `history.length` conta as outras
// páginas da aba e não distingue "há para onde avançar" de "não há". A resposta é do app, que
// compara o hash que chegou com o rastro que ele mesmo empilhou — e é essa comparação que está
// aqui, como função PURA: recebe o rastro e o hash novo, devolve rastro e ponteiro novos. Nada de
// `window.history` no caminho, e o teste mede a decisão inteira.
//
// (O sufixo `.tsx` não é por JSX: o projeto `ui` do `vitest.config.ts` só recolhe
// `src/ui/**/*.test.tsx`, e este arquivo mora ao lado do módulo que ele prova.)

import { describe, expect, it } from 'vitest'
import {
  HASH_DO_MENU,
  atualizarRastro,
  estaNoMenu,
  iniciarRastro,
  podeAvancar,
  podeVoltar,
} from './navegacao'

const MENU = '#/'
const AREA = '#/area/01-fundamentos'
const TEMA = '#/tema/01-fundamentos/TEMA-01'
const QUIZ = '#/quiz/01-fundamentos/TEMA-01'

/** O rastro de quem abriu no menu e foi até o tema: os três itens, ponteiro no fim. */
function noTema(): ReturnType<typeof iniciarRastro> {
  return atualizarRastro(atualizarRastro(iniciarRastro(MENU), AREA), TEMA)
}

/** O mesmo rastro, com mais uma tela na frente: é a sobra do futuro que o "avançar" precisa. */
function ateOQuiz(): ReturnType<typeof iniciarRastro> {
  return atualizarRastro(noTema(), QUIZ)
}

describe('o rastro da navegação', () => {
  it('começa com a rota da montagem, e nela não há para onde ir', () => {
    // Quem abre um link compartilhado cai no MEIO do app (um tema, uma página), e o rastro tem um
    // item só: não há "voltar" dentro do app, por mais páginas que o navegador tenha antes. E não
    // há "avançar" tampouco — quem acabou de chegar não deixou nada atrás de si.
    const rastro = iniciarRastro(TEMA)
    expect(rastro.hashes).toEqual([TEMA])
    expect(rastro.ponteiro).toBe(0)
    expect(podeVoltar(rastro)).toBe(false)
    expect(podeAvancar(rastro)).toBe(false)
  })

  it('a tela nova empurra o rastro e habilita o voltar', () => {
    const rastro = noTema()
    expect(rastro.hashes).toEqual([MENU, AREA, TEMA])
    expect(rastro.ponteiro).toBe(2)
    expect(podeVoltar(rastro)).toBe(true)
    expect(podeAvancar(rastro)).toBe(false)
  })

  it('voltar anda o ponteiro sem perder o que ficou à frente', () => {
    const voltado = atualizarRastro(noTema(), AREA)
    expect(voltado.ponteiro).toBe(1)
    expect(podeVoltar(voltado)).toBe(true)
    // O item seguinte continua no rastro — é ELE que dá sentido ao botão "Avançar". Se o "voltar"
    // apagasse o futuro, o ponteiro andaria para trás e o avançar nasceria morto.
    expect(podeAvancar(voltado)).toBe(true)
    expect(voltado.hashes).toEqual([MENU, AREA, TEMA])
  })

  it('avançar devolve o ponteiro ao item seguinte', () => {
    const avancado = atualizarRastro(atualizarRastro(noTema(), AREA), TEMA)
    expect(avancado.ponteiro).toBe(2)
    expect(avancado.hashes).toEqual([MENU, AREA, TEMA])
    // Chegou de novo ao fim: não há mais para onde avançar.
    expect(podeAvancar(avancado)).toBe(false)
    expect(podeVoltar(avancado)).toBe(true)
  })

  it('voltar dois itens e avançar um não perde o resto do futuro', () => {
    // O caso que separa "avançar o ponteiro" de "empilhar de novo": com dois passos para trás, o
    // que sobrou à frente são DUAS telas. Reconhecendo o item seguinte, o rastro fica inteiro e o
    // segundo "avançar" continua tendo para onde ir; empilhando, o primeiro "avançar" já apagaria
    // o resto — e o botão seguinte nasceria morto.
    const comDoisParaFrente = ateOQuiz()
    const doisParaTras = atualizarRastro(atualizarRastro(comDoisParaFrente, TEMA), AREA)
    expect(doisParaTras.ponteiro).toBe(1)

    const umParaFrente = atualizarRastro(doisParaTras, TEMA)
    expect(umParaFrente.ponteiro).toBe(2)
    expect(umParaFrente.hashes).toEqual([MENU, AREA, TEMA, QUIZ])
    expect(podeAvancar(umParaFrente)).toBe(true)

    const fim = atualizarRastro(umParaFrente, QUIZ)
    expect(fim.ponteiro).toBe(3)
    expect(fim.hashes).toEqual([MENU, AREA, TEMA, QUIZ])
    expect(podeAvancar(fim)).toBe(false)
    expect(podeVoltar(fim)).toBe(true)
  })

  it('navegação nova depois de voltar descarta o futuro', () => {
    // O caso clássico: voltar e clicar num link. O navegador joga fora o que estava à frente, e o
    // rastro tem de jogar junto — guardando o futuro, o botão "Avançar" prometeria uma tela que o
    // `history.forward()` não alcança mais.
    const cheio = noTema()
    const voltado = atualizarRastro(cheio, AREA)
    const novo = atualizarRastro(voltado, QUIZ)

    expect(novo.hashes).toEqual([MENU, AREA, QUIZ])
    expect(novo.ponteiro).toBe(2)
    expect(podeAvancar(novo)).toBe(false)
    expect(novo.hashes).not.toContain(TEMA)

    // E o rastro de antes continua intacto: a função devolve um rastro novo, não mexe no que
    // recebeu (é o que deixa o React comparar estados e não re-renderizar à toa).
    expect(cheio.hashes).toEqual([MENU, AREA, TEMA])
    expect(voltado.ponteiro).toBe(1)
    expect(voltado.hashes).toEqual([MENU, AREA, TEMA])
  })

  it('o hashchange repetido não infla o rastro', () => {
    // Um aviso a mais com o hash que já estava na tela não é navegação nenhuma. Sem esta guarda,
    // o rastro ganharia um item repetido e o "Voltar" passaria a levar para a mesma tela.
    const rastro = iniciarRastro(MENU)
    const mesmo = atualizarRastro(rastro, MENU)
    expect(mesmo.hashes).toEqual([MENU])
    expect(mesmo.ponteiro).toBe(0)
    expect(podeVoltar(mesmo)).toBe(false)

    // E não só no primeiro item: repetir o hash do MEIO do rastro também não move nada.
    const noMeio = atualizarRastro(noTema(), AREA)
    const repetido = atualizarRastro(noMeio, AREA)
    expect(repetido.hashes).toEqual([MENU, AREA, TEMA])
    expect(repetido.ponteiro).toBe(1)
  })

  it('o menu é a home, em qualquer das escritas do endereço', () => {
    // A home tem três escritas: `''` (o app aberto pelo arquivo, sem hash), `#` e `#/`. Nas três o
    // botão "Menu" não tem para onde levar; fora delas, tem.
    expect(HASH_DO_MENU).toBe(MENU)
    expect(estaNoMenu('')).toBe(true)
    expect(estaNoMenu('#')).toBe(true)
    expect(estaNoMenu(MENU)).toBe(true)
    expect(estaNoMenu(TEMA)).toBe(false)
    expect(estaNoMenu(AREA)).toBe(false)
    expect(estaNoMenu('#/quiz')).toBe(false)
  })
})
