// O gerador de questoes rodando de verdade, contra um material de mentira.
//
// O que se prova aqui e o que o teste de unidade nao alcanca: o arquivo versionado e a
// revisao humana que mora nele. Um `status` marcado a mao sobrevive a regeracao enquanto o
// texto do item for o mesmo, e cai para `rascunho` quando a linha do material muda — de
// texto ou de lugar, que e o caso em que o `id` continua igual e o item e outro.
//
// O gerador e executado como processo (`tsx`), e nao importado: o modulo roda no topo, e um
// `process.exit(1)` do gate derrubaria a suite inteira. O material e o destino vem por
// variavel de ambiente, entao nada disto encosta no banco versionado.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import type { ParQA } from '../src/domain/types'
import type { Questao } from './lib/questoes'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const GERADOR = path.join(AQUI, 'build-questions.ts')
const TSX = path.join(APP, 'node_modules', 'tsx', 'dist', 'cli.mjs')

const AREA = '01-fundamentos'
const REF = `${AREA}#TEMA-01`
const E01 = `${REF}#E01`
const E02 = `${REF}#E02`
const E03 = `${REF}#E03`

interface Linha {
  equivoco: string
  porque: string
  correto: string
}

/** Quatro linhas de erro comum: uma vira o gabarito do item e as outras, os distratores. */
const LINHAS: Linha[] = [
  {
    equivoco: 'Achar que o escopo é o meio',
    porque: 'o escopo é a informação',
    correto: 'O escopo é a informação, não o meio',
  },
  {
    equivoco: 'Deixar só para o time de segurança',
    porque: 'a decisão é do negócio',
    correto: 'A decisão é do negócio, com apoio técnico',
  },
  {
    equivoco: 'Confundir com privacidade',
    porque: 'privacidade trata de dado pessoal',
    correto: 'Privacidade trata de dado pessoal; segurança, de todo dado',
  },
  {
    equivoco: 'Ignorar o jurídico',
    porque: 'há obrigação legal',
    correto: 'Há obrigação legal, e ela entra na conta',
  },
]

/**
 * As seções discursivas do material: a recuperação ativa do tema e o checkpoint do guia.
 *
 * Elas continuam no material e não viram item — a pergunta delas é aberta, e resposta de
 * pergunta aberta não é alternativa de múltipla escolha (decisão do dono). Os fixtures
 * existem para o gerador ser exercitado com o material cheio: com as seções vazias, "não
 * virou item" passaria sem provar nada.
 */
const RECUPERACAO: ParQA[] = [
  {
    pergunta: 'Quais modos de falha a definição legal de segurança da informação cobre?',
    resposta: 'Acesso, uso, divulgação, interrupção, modificação e destruição',
  },
  {
    pergunta: 'Por que a segurança da informação não é só do time de segurança?',
    resposta: 'Porque a decisão é do negócio, com apoio técnico',
  },
]

const CHECKPOINT: ParQA[] = [
  {
    pergunta: 'Quantas designações a norma exige, e por qual entregável cada uma responde?',
    resposta: 'Duas: o diretor designado responde pela política; o encarregado, pelos dados pessoais',
  },
  {
    pergunta: 'Qual intervalo de revisão se aplica a um tema acertado sem consulta?',
    resposta: 'D+1, D+7 e D+30, e o erro devolve o item pela metade do prazo',
  },
]

const LINHA_NOVA: Linha = {
  equivoco: 'Tratar risco como problema',
  porque: 'risco é o que ainda pode acontecer',
  correto: 'Risco é o que ainda pode acontecer; problema é o que já aconteceu',
}

/** O que o material publica além da tabela de erros comuns, que é a única fonte do banco. */
interface Discursivas {
  recuperacao?: ParQA[]
  checkpoint?: ParQA[]
}

/** O minimo que `derivarBanco` e `validarBanco` leem, com uma area e um tema. */
function material(errosComuns: Linha[], discursivas: Discursivas = {}): unknown {
  return {
    meta: { geradoEm: '2026-01-01T00:00:00.000Z', totais: { areas: 1, temas: 1, paginas: 0 } },
    areas: [
      {
        areaId: AREA,
        areaNome: 'Fundamentos',
        ordemEstudo: 1,
        nivel: 'base',
        ancoragem: [],
        certificacoes: [],
        preRequisitos: [],
        temas: [REF],
        fontes: [{ titulo: 'CSEC2017', url: 'https://exemplo/area', tipo: 'primaria' }],
        statusVerificacao: 'verificado',
        guia: {
          areaId: AREA,
          intro: '',
          secoes: [],
          checkpoint: discursivas.checkpoint ?? [],
          criterio: 'acertar 4 dos 5 itens sem consultar os temas',
          tabelaTemas: null,
          objetivos: null,
          atividades: null,
          mermaid: [],
        },
      },
    ],
    temas: {
      [REF]: {
        ref: REF,
        areaId: AREA,
        temaId: 'TEMA-01',
        titulo: 'Segurança da informação',
        nivel: 'base',
        tempoEstimado: '30 min',
        objetivo: 'explicar a diferença entre os dois escopos',
        certificacoes: [],
        preRequisitos: [],
        atendeObjetivo: [1],
        relacoes: { complementa: [], aprofundadoPor: [], aplicadoEm: [], naoConfundirCom: [] },
        fontes: [{ titulo: 'CSEC2017', url: 'https://exemplo/1', tipo: 'primaria' }],
        revisaoInicialDias: [1, 7, 30],
        proximaRevisao: null,
        statusVerificacao: 'verificado',
        intro: '<p>abertura</p>',
        secoes: [],
        preTeste: [],
        recuperacao: discursivas.recuperacao ?? [],
        errosComuns,
        mermaid: [],
      },
    },
    ordemEstudo: [REF],
    paginas: [],
  }
}

interface Cenario {
  conteudo: string
  questoes: string
  arquivo: string
}

const temporarios: string[] = []

afterEach(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

function novoCenario(errosComuns: Linha[], discursivas: Discursivas = {}): Cenario {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-questoes-'))
  temporarios.push(raiz)
  const conteudo = path.join(raiz, 'content.json')
  const questoes = path.join(raiz, 'questoes')
  fs.writeFileSync(conteudo, JSON.stringify(material(errosComuns, discursivas)))
  return { conteudo, questoes, arquivo: path.join(questoes, `${AREA}.json`) }
}

/** Roda o gerador de verdade, apontado para o material e o destino do cenario. */
function gerar(c: Cenario): string {
  return execFileSync(process.execPath, [TSX, GERADOR], {
    cwd: APP,
    env: { ...process.env, ROADMAP_CONTENT_FILE: c.conteudo, ROADMAP_QUESTIONS_DIR: c.questoes },
    encoding: 'utf8',
  })
}

function escreverMaterial(c: Cenario, errosComuns: Linha[], discursivas: Discursivas = {}): void {
  fs.writeFileSync(c.conteudo, JSON.stringify(material(errosComuns, discursivas)))
}

function itens(c: Cenario): Questao[] {
  return JSON.parse(fs.readFileSync(c.arquivo, 'utf8')) as Questao[]
}

function statusDe(c: Cenario, id: string): Questao['status'] {
  const item = itens(c).find((q) => q.id === id)
  if (!item) throw new Error(`o banco gerado nao tem o item ${id}`)
  return item.status
}

/** Marca o status como a revisao humana faz a mao: so esse campo muda. */
function marcar(c: Cenario, id: string, novo: Questao['status']): void {
  const banco = itens(c).map((q) => (q.id === id ? { ...q, status: novo } : q))
  fs.writeFileSync(c.arquivo, `${JSON.stringify(banco, null, 2)}\n`)
}

describe('build-questions: o que a revisao humana decidiu', () => {
  it('preserva o status enquanto o texto regerado for o mesmo', () => {
    const c = novoCenario(LINHAS)
    gerar(c)
    marcar(c, E01, 'verificado')
    const antes = fs.readFileSync(c.arquivo, 'utf8')

    const saida = gerar(c)

    expect(statusDe(c, E01)).toBe('verificado')
    // E so ele: status de um item nao vale para os vizinhos.
    expect(itens(c).filter((q) => q.status !== 'rascunho')).toHaveLength(1)
    expect(saida).toContain('1 com status de revisao preservado')
    // Nada mudou: regerar sem mexer no material nao pode churnar o arquivo versionado.
    expect(fs.readFileSync(c.arquivo, 'utf8')).toBe(antes)
  })

  it('rebaixa para rascunho quando a linha do material muda', () => {
    const c = novoCenario(LINHAS)
    gerar(c)
    marcar(c, E01, 'verificado')
    marcar(c, E02, 'pendente')
    // A coluna `porque` da primeira linha alimenta só a justificativa do `#E01`: o vizinho
    // fica exatamente igual, e é o que separa "invalidou porque mudou" de "invalidou tudo".
    escreverMaterial(
      c,
      LINHAS.map((linha, i) => (i === 0 ? { ...linha, porque: 'o escopo é o dado, não a máquina' } : linha)),
    )

    const saida = gerar(c)

    // O item regerado tem texto novo: o selo que ele carregava nao vale mais.
    expect(statusDe(c, E01)).toBe('rascunho')
    expect(saida).toContain('revisao invalidada')
    expect(saida).toContain(E01)
    // O vizinho, cujo texto nao mudou, continua marcado.
    expect(statusDe(c, E02)).toBe('pendente')
    const regerado = itens(c).find((q) => q.id === E01)!
    expect(regerado.justificativa).toBe('o escopo é o dado, não a máquina')
  })

  it('rebaixa quando uma linha entra antes e desloca os ids seguintes', () => {
    const c = novoCenario(LINHAS)
    gerar(c)
    marcar(c, E03, 'verificado')

    escreverMaterial(c, [LINHA_NOVA, ...LINHAS])
    const saida = gerar(c)

    // `#E03` continua sendo o terceiro item, mas agora e outra linha do material: o id
    // sozinho nao identifica mais o texto que foi revisado.
    expect(statusDe(c, E03)).toBe('rascunho')
    expect(saida).toContain('revisao invalidada')
    expect(saida).toContain(E03)
  })
})

// A recuperacao ativa e o checkpoint do guia continuam no material — o tema e o guia os
// exibem — e nao aparecem no arquivo que o app le: a pergunta deles e aberta e nenhuma
// alternativa seria "a resposta". O gerador roda contra o material cheio e nao os ve.
describe('build-questions: as secoes discursivas do material', () => {
  it('nao grava item de recuperacao nem de checkpoint', () => {
    const c = novoCenario(LINHAS, { recuperacao: RECUPERACAO, checkpoint: CHECKPOINT })
    gerar(c)
    const gravados = itens(c)

    // Um item por linha da tabela de erros comuns, e so.
    expect(gravados).toHaveLength(LINHAS.length)
    expect(gravados.map((q) => q.origem)).toEqual(LINHAS.map(() => 'erro-comum'))
    expect(gravados.every((q) => /#E\d+$/.test(q.id))).toBe(true)
    // Nenhum eco do material que ficou de fora: a pergunta aberta nao vira enunciado e a
    // resposta dela nao entra como alternativa — os distratores sao as colunas da tabela.
    for (const par of [...RECUPERACAO, ...CHECKPOINT]) {
      expect(gravados.some((q) => q.enunciado === par.pergunta)).toBe(false)
      expect(gravados.some((q) => q.alternativas.includes(par.resposta))).toBe(false)
    }
  })

  it('nao desloca os ids dos itens de tema quando as secoes discursivas mudam', () => {
    // Elas não numeram item nenhum: os `#Exx` seguem apontando para a mesma linha da tabela,
    // e a revisão deles não pode cair por causa de uma seção que não gera item.
    const c = novoCenario(LINHAS)
    gerar(c)
    marcar(c, E01, 'verificado')

    escreverMaterial(c, LINHAS, {
      recuperacao: RECUPERACAO,
      checkpoint: [{ pergunta: 'Par novo?', resposta: 'Resposta nova, curta e propria' }, ...CHECKPOINT],
    })
    const saida = gerar(c)

    expect(statusDe(c, E01)).toBe('verificado')
    expect(saida).not.toContain('revisao invalidada')
  })
})

