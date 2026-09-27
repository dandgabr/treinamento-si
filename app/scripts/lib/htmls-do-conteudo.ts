// Os campos de HTML de um `Conteudo`, na ordem em que a tela os renderiza.
//
// Este modulo existe porque a lista de campos que carregam HTML cresceu em duas fases e cada
// lugar que precisava dela escrevia a sua propria versao: o portao (que cobra o resultado da
// troca de links) e os dois testes de contrato do material. A fase do pre-teste diagnostico
// acrescentou tres campos fora de `intro`/`secoes` (`trilha.diagnostico.introHtml`, `.notaHtml` e
// `.itens[].origemHtml`) e nenhuma das tres copias os visitava — um `href` relativo ali dentro
// passava pela varredura inteira. Uma lista so, usada pelos tres, nao tem como divergir de novo.
//
// Nao ha aqui o que interpretar: o que entra na lista e exatamente o que chega ao DOM por
// `dangerouslySetInnerHTML` (o `Html` de `src/ui/Blocos.tsx`).

import type { Conteudo, Guia, Pagina, Tema, Trilha } from '../../src/domain/types'

/**
 * O HTML do bloco de diagnostico de uma trilha.
 *
 * A regiao do diagnostico sai das secoes na extracao (ela vira bloco interativo), entao o HTML
 * dela nao esta em `secoes` nenhuma: sem esta funcao, os dez itens do material — que trazem o
 * link para a area de origem — ficariam fora de qualquer varredura.
 */
export function htmlsDaTrilha(trilha: Trilha | null | undefined): string[] {
  const diagnostico = trilha?.diagnostico
  if (!diagnostico) return []
  return [diagnostico.introHtml, ...diagnostico.itens.map((i) => i.origemHtml), diagnostico.notaHtml]
}

export function htmlsDoGuia(guia: Guia): string[] {
  return [guia.intro, ...guia.secoes.map((s) => s.html)]
}

export function htmlsDoTema(tema: Tema): string[] {
  return [tema.intro, ...tema.secoes.map((s) => s.html)]
}

export function htmlsDaPagina(pagina: Pagina): string[] {
  return [pagina.intro, ...pagina.secoes.map((s) => s.html), ...htmlsDaTrilha(pagina.trilha)]
}

/** Todo o HTML do conteudo gerado, que e o que o portao varre. */
export function htmlsDoConteudo(c: Conteudo): string[] {
  return [
    ...c.areas.flatMap((a) => htmlsDoGuia(a.guia)),
    ...Object.values(c.temas).flatMap(htmlsDoTema),
    ...c.paginas.flatMap(htmlsDaPagina),
  ]
}
