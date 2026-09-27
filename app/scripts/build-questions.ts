// Gera o banco de multipla escolha a partir do content.json.
//
// Semente automatica, revisao humana: os itens nascem `rascunho` e so uma pessoa promove
// para `verificado`. O que este script garante e que nada foi inventado — cada item aponta
// para o tema de origem e carrega a fonte herdada dele.

import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Conteudo } from '../src/domain/types'
import { derivarBanco, validarBanco, type Questao } from './lib/questoes'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
// Os caminhos vem de fora quando o teste roda o gerador de verdade num diretorio temporario;
// sem as variaveis, sao os do repositorio, que e o unico caso do uso normal.
const CONTENT_FILE =
  process.env.ROADMAP_CONTENT_FILE ?? path.join(APP, 'src', 'content', 'generated', 'content.json')
const DESTINO = process.env.ROADMAP_QUESTIONS_DIR ?? path.join(APP, 'src', 'content', 'questions')

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
 * Resumo estavel do que a revisao humana aprova: o texto do item, e nao o status.
 *
 * O `status` fica FORA do resumo de proposito — e ele que esta sendo decidido. Entram os
 * quatro campos que a revisao le: enunciado, alternativas, gabarito e justificativa.
 */
function resumoDoConteudo(item: Questao): string {
  const { enunciado, alternativas, correta, justificativa } = item
  return createHash('sha256')
    .update(JSON.stringify([enunciado, alternativas, correta, justificativa]))
    .digest('hex')
}

interface Revisao {
  status: Questao['status']
  /** Resumo do texto que o arquivo traz hoje: e o que a revisao humana teve para ler. */
  resumo: string
}

/**
 * Preserva o que a revisao humana decidiu, com o resumo do texto revisado.
 *
 * O banco e versionado justamente porque o fluxo e `rascunho -> pendente -> verificado`: se
 * o gerador regravasse tudo, cada build apagaria a revisao. O que ele faz e reencontrar os
 * itens pelo `id` (que e estavel enquanto o material nao muda) e trazer o status de volta.
 *
 * O resumo vem junto porque o `id` sozinho NAO diz o que foi revisado: corrigir a linha do
 * material — ou inserir uma linha antes, deslocando os `E03..Enn` — mantem o id e troca o
 * texto. Sem a conferencia, o item regerado ficava marcado `verificado` com texto que
 * ninguem revisou, e o selo passava a mentir em silencio.
 *
 * Ele e calculado do proprio arquivo, e nao gravado num campo novo: o arquivo versionado e o
 * registro do que a pessoa revisou, entao comparar o que esta nele com o derivado agora ja
 * responde "o texto mudou?". Um campo a mais por item seria uma segunda copia do mesmo texto,
 * que pode divergir do que se le — e 955 itens reescritos para guardar um hash que se
 * recalcula em microssegundos.
 */
function revisoesAnteriores(areaId: string): Map<string, Revisao> {
  const caminho = path.join(DESTINO, `${areaId}.json`)
  const anteriores = new Map<string, Revisao>()
  if (!fs.existsSync(caminho)) return anteriores
  try {
    const itens = JSON.parse(fs.readFileSync(caminho, 'utf-8')) as Questao[]
    for (const item of itens) {
      if (item.id && item.status) {
        anteriores.set(item.id, { status: item.status, resumo: resumoDoConteudo(item) })
      }
    }
  } catch {
    // Arquivo ilegivel: o gate reprova depois; aqui nao ha o que preservar.
  }
  return anteriores
}

let gravados = 0
let revisados = 0
const invalidados: string[] = []
for (const [areaId, itens] of Object.entries(banco.porArea)) {
  if (!itens.length) continue
  const anteriores = revisoesAnteriores(areaId)
  for (const item of itens) {
    const anterior = anteriores.get(item.id)
    if (!anterior || anterior.status === 'rascunho') continue
    if (anterior.resumo === resumoDoConteudo(item)) {
      item.status = anterior.status
      revisados += 1
    } else {
      // O texto regerado nao e o que foi revisado: o item volta a `rascunho` (o status que
      // `derivarBanco` deu) para alguem revisar de novo. Perder o selo e o lado certo do
      // erro; mante-lo seria o app afirmando uma revisao que nao aconteceu.
      invalidados.push(item.id)
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

// A revisao que perdeu o selo e barulhenta de proposito: e trabalho humano que se perdeu
// (ou uma mentira que deixou de existir) e alguem precisa saber por que o `verificado` sumiu.
if (invalidados.length) {
  console.log(
    `  revisao invalidada: ${invalidados.length} item(ns) voltaram a rascunho porque o texto mudou` +
      ` (${invalidados.slice(0, 10).join(', ')}${invalidados.length > 10 ? `, +${invalidados.length - 10}` : ''})`,
  )
}

console.log(
  `banco de questoes: ${banco.total} itens em ${gravados} areas ` +
    `(${Object.entries(porOrigem)
      .map(([origem, n]) => `${origem}: ${n}`)
      .join(', ')})` +
    (revisados ? ` — ${revisados} com status de revisao preservado` : ''),
)
