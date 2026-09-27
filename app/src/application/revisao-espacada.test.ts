// A leitura da seção 11 e a fila com a tarefa de cada intervalo.
//
// O HTML de apoio abaixo é o que o `build:content` gera para a seção 11 do TEMA-01 de
// 00-guia-basico — copiado do `content.json`, e não escrito à mão: é o contrato entre o parser
// e este leitor.

import { describe, expect, it } from 'vitest'
import { temaFake as temaDeProgressoFake, estadoFake } from '../domain/testes/fixtures'
import type { Progresso } from '../domain/progresso'
import { progressoVazio } from '../domain/progresso'
import type { EstadoRevisao } from '../domain/srs'
import type { Tema } from '../domain/types'
import {
  diasDoRotulo,
  filaComTarefas,
  primeiraTabela,
  tarefasDaRevisao,
  tarefaDoTema,
  textoDaCelula,
} from './revisao-espacada'

const AGORA = new Date('2026-03-10T12:00:00.000Z')
const REF = '00-guia-basico#TEMA-01'
const REF_2 = '00-guia-basico#TEMA-02'

/** Seção 11 real do TEMA-01 de 00-guia-basico. */
const SECAO_11 = `<p>Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo em <a href="#/pagina/91-trilhas/README">91-trilhas/</a>, dono de <code>proxima_revisao</code>.</p>
<table>
<thead>
<tr>
<th>Intervalo</th>
<th>O que fazer</th>
<th>Se errar</th>
</tr>
</thead>
<tbody>
<tr>
<td>D+1</td>
<td>Responder à seção 10 sem reler</td>
<td>Rebaixar: repetir em D+1</td>
</tr>
<tr>
<td>D+7</td>
<td>Explicar o tema em 3 frases e listar três tipos de informação próprios</td>
<td>Rebaixar: repetir em D+3</td>
</tr>
<tr>
<td>D+30</td>
<td>Aplicar a categorização a um sistema real e comparar com o que a área técnica já pensava</td>
<td>Rebaixar: repetir em D+7</td>
</tr>
</tbody>
</table>`

function temaDeConteudo(over: Partial<Tema> = {}): Tema {
  return {
    ref: REF,
    areaId: '00-guia-basico',
    temaId: 'TEMA-01',
    titulo: 'O que é segurança da informação',
    nivel: 'base',
    tempoEstimado: '30-40 min',
    objetivo: '',
    certificacoes: [],
    preRequisitos: [],
    atendeObjetivo: [],
    relacoes: { complementa: [], aprofundadoPor: [], aplicadoEm: [], naoConfundirCom: [] },
    fontes: [],
    revisaoInicialDias: [1, 7, 30],
    proximaRevisao: null,
    statusVerificacao: 'pendente',
    intro: '',
    secoes: [{ numero: 11, titulo: 'Revisão espaçada', html: SECAO_11 }],
    preTeste: [],
    recuperacao: [],
    errosComuns: [],
    mermaid: [],
    ...over,
  }
}

/**
 * Progresso com um tema vencido, com a revisão que o teste quiser.
 *
 * O `ref` vai também dentro do estado: é o `revisao.ref` que a fila do domínio devolve, e na
 * produção os dois são iguais (o normalizador grava o `ref` da chave, e `criarEstado` recebe o
 * mesmo valor). Um fixture que divergisse testaria um estado que o app não sabe carregar.
 */
function comTema(ref: string, revisao: Partial<EstadoRevisao>): Progresso {
  const base = progressoVazio()
  const estado = { ...estadoFake({ ref }), ...revisao }
  return { ...base, temas: { [ref]: temaDeProgressoFake(ref, { revisao: estado }) } }
}

describe('textoDaCelula', () => {
  it('tira a marcação e devolve o texto da célula', () => {
    expect(textoDaCelula('Responder à <code>seção 10</code> sem <a href="#/x">reler</a>')).toBe(
      'Responder à seção 10 sem reler',
    )
  })

  it('devolve as entidades ao caractere e colapsa os espaços', () => {
    expect(textoDaCelula('CIS &amp; NIST')).toBe('CIS & NIST')
    expect(textoDaCelula('aspas &quot;retas&quot; e &#39;simples&#39;')).toBe(
      'aspas "retas" e \'simples\'',
    )
    expect(textoDaCelula('linha\n   quebrada')).toBe('linha quebrada')
    expect(textoDaCelula('&#xZZ;')).toBe('&#xZZ;')
  })
})

describe('primeiraTabela', () => {
  it('lê cabeçalho e linhas da primeira tabela', () => {
    const tabela = primeiraTabela(SECAO_11)
    expect(tabela?.cabecalho).toEqual(['Intervalo', 'O que fazer', 'Se errar'])
    expect(tabela?.linhas).toHaveLength(3)
    expect(tabela?.linhas[0]).toEqual(['D+1', 'Responder à seção 10 sem reler', 'Rebaixar: repetir em D+1'])
  })

  it('usa a primeira das duas tabelas do HTML', () => {
    const html = '<table><tr><th>a</th></tr><tr><td>1</td></tr></table><table><tr><th>b</th></tr><tr><td>2</td></tr></table>'
    expect(primeiraTabela(html)?.cabecalho).toEqual(['a'])
  })

  it('devolve null sem tabela, só com cabeçalho ou com linha torta', () => {
    expect(primeiraTabela('<p>sem tabela</p>')).toBeNull()
    expect(primeiraTabela('<table><tr><th>Intervalo</th></tr></table>')).toBeNull()
    // Linha com número de células diferente do cabeçalho é descartada, e sem nenhuma linha
    // válida não há tabela.
    expect(primeiraTabela('<table><tr><th>a</th><th>b</th></tr><tr><td>1</td></tr></table>')).toBeNull()
  })
})

describe('diasDoRotulo', () => {
  it('lê o rótulo do material', () => {
    expect(diasDoRotulo('D+1')).toBe(1)
    expect(diasDoRotulo(' D+30 ')).toBe(30)
    expect(diasDoRotulo('d+7')).toBe(7)
  })

  it('não inventa intervalo para rótulo que não é D+n', () => {
    expect(diasDoRotulo('7')).toBeNull()
    expect(diasDoRotulo('D+')).toBeNull()
    expect(diasDoRotulo('D+0')).toBeNull()
    expect(diasDoRotulo('semana 1')).toBeNull()
    expect(diasDoRotulo('D+1 e D+7')).toBeNull()
  })
})

describe('tarefasDaRevisao', () => {
  it('lê as três linhas da seção 11 do tema', () => {
    const tarefas = tarefasDaRevisao(temaDeConteudo())
    expect(tarefas.map((t) => t.intervaloDias)).toEqual([1, 7, 30])
    expect(tarefas[1]?.oQueFazer).toBe(
      'Explicar o tema em 3 frases e listar três tipos de informação próprios',
    )
    expect(tarefas[1]?.seErrar).toBe('Rebaixar: repetir em D+3')
  })

  it('devolve lista vazia quando o tema não tem a seção 11 ou ela não tem tabela', () => {
    expect(tarefasDaRevisao(temaDeConteudo({ secoes: [] }))).toEqual([])
    expect(
      tarefasDaRevisao(
        temaDeConteudo({ secoes: [{ numero: 11, titulo: 'Revisão espaçada', html: '<p>só prosa</p>' }] }),
      ),
    ).toEqual([])
  })

  it('descarta a linha cujo intervalo não é D+n', () => {
    const html =
      '<table><tr><th>Intervalo</th><th>O que fazer</th><th>Se errar</th></tr>' +
      '<tr><td>D+1</td><td>Responder</td><td>Rebaixar: D+1</td></tr>' +
      '<tr><td>Em algum momento</td><td>Inventar</td><td>—</td></tr></table>'
    const tarefas = tarefasDaRevisao(
      temaDeConteudo({ secoes: [{ numero: 11, titulo: 'Revisão espaçada', html }] }),
    )
    expect(tarefas.map((t) => t.intervaloDias)).toEqual([1])
  })
})

describe('tarefaDoTema', () => {
  it('devolve a tarefa do intervalo devido', () => {
    expect(tarefaDoTema(temaDeConteudo(), 30)?.oQueFazer).toContain('Aplicar a categorização')
  })

  it('não devolve tarefa para intervalo fora da tabela do material', () => {
    // D+3 é o intervalo rebaixado e D+90 é o degrau das trilhas: nenhum dos dois tem linha na
    // seção 11 de qualquer um dos 109 temas.
    expect(tarefaDoTema(temaDeConteudo(), 3)).toBeNull()
    expect(tarefaDoTema(temaDeConteudo(), 90)).toBeNull()
  })
})

describe('filaComTarefas', () => {
  const TEMAS = { [REF]: temaDeConteudo(), [REF_2]: temaDeConteudo({ ref: REF_2, temaId: 'TEMA-02' }) }

  it('traz a tarefa do intervalo devido junto do tema vencido', () => {
    const fila = filaComTarefas(
      comTema(REF, { intervaloDias: 7, proximaRevisao: '2026-03-09T12:00:00.000Z' }),
      TEMAS,
      AGORA,
    )
    expect(fila).toHaveLength(1)
    expect(fila[0]?.titulo).toBe('O que é segurança da informação')
    expect(fila[0]?.tarefa?.oQueFazer).toContain('Explicar o tema em 3 frases')
  })

  it('não lista tema que ainda não venceu', () => {
    const fila = filaComTarefas(
      comTema(REF, { proximaRevisao: '2026-03-11T12:00:00.000Z' }),
      TEMAS,
      AGORA,
    )
    expect(fila).toEqual([])
  })

  it('marca a releitura completa depois de duas passagens falhas seguidas', () => {
    const fila = filaComTarefas(
      comTema(REF, {
        intervaloDias: 3,
        falhasSeguidas: 2,
        rebaixamentos: 2,
        proximaRevisao: '2026-03-10T11:00:00.000Z',
      }),
      TEMAS,
      AGORA,
    )
    expect(fila[0]?.releituraCompleta).toBe(true)
    expect(fila[0]?.falhasSeguidas).toBe(2)
    // O intervalo rebaixado (D+3) não tem tarefa tabelada: o item continua na fila, sem
    // exercício declarado.
    expect(fila[0]?.tarefa).toBeNull()
  })

  it('não marca releitura completa com uma falha só', () => {
    const fila = filaComTarefas(
      comTema(REF, { intervaloDias: 1, falhasSeguidas: 1, proximaRevisao: '2026-03-10T11:00:00.000Z' }),
      TEMAS,
      AGORA,
    )
    expect(fila[0]?.releituraCompleta).toBe(false)
  })

  it('ordena do mais atrasado para o mais recente', () => {
    const progresso = comTema(REF, { proximaRevisao: '2026-03-05T12:00:00.000Z' })
    const dois = {
      ...progresso,
      temas: {
        ...progresso.temas,
        [REF_2]: temaDeProgressoFake(REF_2, {
          revisao: estadoFake({ ref: REF_2, proximaRevisao: '2026-03-09T12:00:00.000Z' }),
        }),
      },
    }
    expect(filaComTarefas(dois, TEMAS, AGORA).map((i) => i.ref)).toEqual([REF, REF_2])
  })

  it('aguenta tema vencido que não está no conteúdo carregado', () => {
    const fila = filaComTarefas(
      comTema('a#TEMA-09', { proximaRevisao: '2026-03-01T12:00:00.000Z' }),
      TEMAS,
      AGORA,
    )
    expect(fila[0]?.titulo).toBe('a#TEMA-09')
    expect(fila[0]?.tarefa).toBeNull()
  })
})
