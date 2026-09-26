// Gera o banco de multipla escolha a partir do content.json.
//
// Semente automatica, revisao humana: os itens nascem `rascunho` e so uma pessoa promove
// para `verificado`. O que este script garante e que nada foi inventado — cada item aponta
// para o tema de origem e carrega a fonte herdada dele.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'
import { derivarBanco, validarBanco, type Questao } from './lib/questoes'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const CONTENT_FILE = path.join(APP, 'src', 'content', 'generated', 'content.json')
const DESTINO = path.join(APP, 'src', 'content', 'questions')

const conteudo = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')) as Conteudo
const banco = derivarBanco(conteudo)
const problemas = validarBanco(banco, conteudo)

if (problemas.length) {
  console.error(`banco derivado com ${problemas.length} problema(s):`)
  for (const p of problemas.slice(0, 20)) console.error(`  ${p}`)
  process.exit(1)
}

fs.mkdirSync(DESTINO, { recursive: true })

/**
 * Preserva o que a revisao humana decidiu.
 *
 * O banco e versionado justamente porque o fluxo e `rascunho -> pendente -> verificado`: se
 * o gerador regravasse tudo, cada build apagaria a revisao. O que ele faz e reencontrar os
 * itens pelo `id` (que e estavel enquanto o material nao muda) e trazer o status de volta.
 */
function statusAnterior(areaId: string): Map<string, Questao['status']> {
  const caminho = path.join(DESTINO, `${areaId}.json`)
  const anteriores = new Map<string, Questao['status']>()
  if (!fs.existsSync(caminho)) return anteriores
  try {
    const itens = JSON.parse(fs.readFileSync(caminho, 'utf-8')) as Questao[]
    for (const item of itens) if (item.id && item.status) anteriores.set(item.id, item.status)
  } catch {
    // Arquivo ilegivel: o gate reprova depois; aqui nao ha o que preservar.
  }
  return anteriores
}

let gravados = 0
let revisados = 0
for (const [areaId, itens] of Object.entries(banco.porArea)) {
  if (!itens.length) continue
  const anteriores = statusAnterior(areaId)
  for (const item of itens) {
    const status = anteriores.get(item.id)
    if (status && status !== 'rascunho') {
      item.status = status
      revisados += 1
    }
  }
  fs.writeFileSync(path.join(DESTINO, `${areaId}.json`), `${JSON.stringify(itens, null, 2)}\n`)
  gravados += 1
}

// Area que sumiu do material leva o arquivo junto: item de area inexistente nao pode ficar.
const areasVivas = new Set(Object.keys(banco.porArea).filter((a) => banco.porArea[a]!.length))
for (const arquivo of fs.readdirSync(DESTINO)) {
  if (!arquivo.endsWith('.json')) continue
  if (!areasVivas.has(arquivo.replace(/\.json$/, ''))) {
    fs.rmSync(path.join(DESTINO, arquivo))
    console.log(`  removido (area sem itens): ${arquivo}`)
  }
}

const porOrigem = Object.values(banco.porArea)
  .flat()
  .reduce<Record<string, number>>((acc, q) => ({ ...acc, [q.origem]: (acc[q.origem] ?? 0) + 1 }), {})

console.log(
  `banco de questoes: ${banco.total} itens em ${gravados} areas ` +
    `(${Object.entries(porOrigem)
      .map(([origem, n]) => `${origem}: ${n}`)
      .join(', ')})` +
    (revisados ? ` — ${revisados} com status de revisao preservado` : ''),
)
