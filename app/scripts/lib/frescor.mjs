// Frescor dos artefatos.
//
// Motivo de existir: o smoke do desktop rodou verde contra um `main.cjs` compilado antes
// das correcoes de seguranca da casca. Ele so checava se o arquivo existia. Uma asserção
// que passa para codigo que nao esta no binario e pior que asserção nenhuma, porque da
// confianca. Aqui a comparacao e de data: se qualquer fonte for mais nova que o artefato,
// o teste falha e diz o que rodar.

import fs from 'node:fs'
import path from 'node:path'

/** Extensoes que entram no bundle. Teste nao entra: editar teste nao muda o artefato. */
function ehFonte(nome) {
  return /\.(ts|tsx|css|html)$/.test(nome) && !/\.test\.tsx?$/.test(nome)
}

function percorrer(raiz, encontrados) {
  let itens
  try {
    itens = fs.readdirSync(raiz, { withFileTypes: true })
  } catch {
    return
  }
  for (const item of itens) {
    const completo = path.join(raiz, item.name)
    if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name.startsWith('.')) continue
      percorrer(completo, encontrados)
    } else if (ehFonte(item.name)) {
      encontrados.push(completo)
    }
  }
}

/**
 * Devolve as fontes mais novas que o artefato (no maximo 5, para a mensagem), ou lista
 * vazia quando o artefato esta atual. Arquivo ausente tambem conta como problema.
 */
export function fontesMaisNovas(artefato, raizes) {
  if (!fs.existsSync(artefato)) return [`artefato ausente: ${artefato}`]
  const quando = fs.statSync(artefato).mtimeMs

  const fontes = []
  for (const raiz of raizes) {
    if (fs.statSync(raiz).isDirectory()) percorrer(raiz, fontes)
    else fontes.push(raiz)
  }

  return fontes
    .filter((f) => fs.statSync(f).mtimeMs > quando)
    .slice(0, 5)
    .map((f) => path.relative(process.cwd(), f))
}
