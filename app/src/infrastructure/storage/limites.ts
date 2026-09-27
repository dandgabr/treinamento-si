// O teto do progresso e a mensagem de recusa, num lugar SO.
//
// As duas vias gravam o mesmo progresso — o processo principal num arquivo
// (`electron/progresso.ts`) e o navegador no `localStorage` (`persistencia.ts`) — e o arquivo
// exportado por uma e o unico caminho para a outra. Enquanto cada lado guardou a sua copia da
// regua, o navegador escrevia sem teto nenhum: o desktop recusava ler o que ele guardava e o
// `importar` de qualquer das duas recusava o arquivo que ele mesmo acabara de exportar (o
// "backup que nao volta", no irmao do defeito do exportar sem teto).
//
// Por isso os dois numeros moram aqui, e nenhum dos lados tem a sua copia: um teto e um texto
// com duas copias e um teto que vai divergir — foi o que ja aconteceu com a medida do tamanho,
// feita em unidades de codigo num lado e em bytes no outro.
//
// O limite e o mesmo para as duas vias de proposito, e quem decide nao e o espaco do navegador:
// o `localStorage` de uma origem aguenta ~5 MB (em unidades UTF-16) e o download nao tem limite
// nenhum, entao o que aperta e a INTERCAMBIO — o exportado de um lado tem de voltar pelo outro, e
// as duas importacoes recusam acima de 1 MB. Um teto maior no navegador produziria exatamente o
// arquivo que nenhuma das duas aceita de volta.
//
// Nao importa nada: e o unico modulo que o processo principal e o renderer precisam dividir.

/** Teto generoso: o estado cheio passa longe disso, e o arquivo vem de fora. */
export const TETO_BYTES = 1024 * 1024

/** O texto da recusa, o mesmo em quem grava, em quem exporta e nos dois lados. */
export const MENSAGEM_GRANDE = 'progresso grande demais para gravar'
