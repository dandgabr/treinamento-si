// A leitura das trilhas: ponto de entrada do diagnostico, artefatos da secao 8 e marcos.

import { describe, expect, it } from 'vitest'
import { areaFake, guiaFake } from './testes/fixtures'
import { progressoVazio, registrarArtefato, registrarCheckpoint, registrarDiagnostico } from './progresso'
import type { FaixaDoDiagnostico, Tabela, Trilha } from './types'
import {
  atividadesDoGuia,
  chaveDoArtefato,
  marcoDaArea,
  marcoDaFase,
  pontoDeEntrada,
  resumoDoDiagnostico,
  veredictosDoDiagnostico,
} from './trilha'

const AGORA = new Date('2026-03-10T12:00:00.000Z')
const SLUG = '91-trilhas/plano-12-meses'

/** As tres faixas que o material escreve, palavra por palavra. */
const FAIXAS: FaixaDoDiagnostico[] = [
  { rotulo: '0 a 3', de: 0, ate: 3, pontoDeEntrada: 'Fase 1 pelo TEMA-01 de 00, sem pular tema' },
  {
    rotulo: '4 a 7',
    de: 4,
    ate: 7,
    pontoDeEntrada: 'Fase 1 pelo TEMA-01 de 00, com 01 lido como revisao em duas semanas',
  },
  {
    rotulo: '8 a 10',
    de: 8,
    ate: 10,
    pontoDeEntrada: 'Fases 1 e 2 comprimidas, e a semana liberada vai para a Fase 3',
  },
]

function trilhaFake(totalItens = 10): Trilha {
  return {
    diagnostico: {
      secao: 1,
      titulo: '1.1 Pre-teste diagnostico',
      introHtml: '<p>Dez itens, dos checkpoints das areas iniciais.</p>',
      itens: Array.from({ length: totalItens }, (_, i) => ({
        numero: String(i + 1),
        origemHtml: `<a href="#/area/00-guia-basico">00 Guia basico do CISO</a>, checkpoint, item ${i + 1}`,
      })),
      cabecalhoDasFaixas: ['Acertos', 'Ponto de entrada'],
      faixas: FAIXAS,
      notaHtml: '<p>Quem ja percorreu o plano de 90 dias entra na Fase 2.</p>',
    },
    fases: [{ rotulo: '1 Vocabulario e cargo', periodo: '1 a 6', areas: ['01-fundamentos'], marco: 'm' }],
  }
}

/** A tabela da secao 8 de um guia, com as colunas do material. */
function tabelaDeAtividades(linhas: string[][], cabecalho?: string[]): Tabela {
  return {
    cabecalho: cabecalho ?? ['#', 'Atividade', 'O que a prática demonstra', 'Pré-requisito técnico'],
    linhas,
  }
}

describe('pontoDeEntrada', () => {
  it('devolve a faixa que cobre os acertos, com os limites incluídos', () => {
    expect(pontoDeEntrada(FAIXAS, 0)?.rotulo).toBe('0 a 3')
    expect(pontoDeEntrada(FAIXAS, 3)?.rotulo).toBe('0 a 3')
    expect(pontoDeEntrada(FAIXAS, 4)?.rotulo).toBe('4 a 7')
    expect(pontoDeEntrada(FAIXAS, 7)?.rotulo).toBe('4 a 7')
    expect(pontoDeEntrada(FAIXAS, 8)?.rotulo).toBe('8 a 10')
    expect(pontoDeEntrada(FAIXAS, 10)?.rotulo).toBe('8 a 10')
    expect(pontoDeEntrada(FAIXAS, 10)?.pontoDeEntrada).toContain('Fases 1 e 2 comprimidas')
  })

  it('não estende a tabela do material para fora dela', () => {
    // Acertos acima do maior limite não têm ponto de entrada declarado: devolver "a faixa mais
    // próxima" seria o app escrevendo o que o material não escreveu.
    expect(pontoDeEntrada(FAIXAS, 11)).toBeNull()
    expect(pontoDeEntrada([], 5)).toBeNull()
  })
})

describe('resumoDoDiagnostico', () => {
  it('não lê o ponto de entrada enquanto há item não julgado', () => {
    let p = progressoVazio()
    for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      p = registrarDiagnostico(p, SLUG, i, true, AGORA)
    }
    const resumo = resumoDoDiagnostico(trilhaFake(), p, SLUG)
    expect(resumo.veredictos).toHaveLength(10)
    expect(resumo.veredictos[9]).toBeNull()
    expect(resumo.resultado).toBeNull()
    expect(resumo.faixa).toBeNull()
  })

  it('conta os acertos e lê a faixa quando os dez estão julgados', () => {
    let p = progressoVazio()
    // Oito acertos e dois erros: a faixa "8 a 10" do material.
    for (let i = 0; i < 10; i++) p = registrarDiagnostico(p, SLUG, i, i < 8, AGORA)
    const resumo = resumoDoDiagnostico(trilhaFake(), p, SLUG)
    expect(resumo.resultado).toEqual({ acertos: 8, total: 10 })
    expect(resumo.faixa?.rotulo).toBe('8 a 10')
  })

  it('respeita o ÍNDICE do item, e não a ordem em que as respostas foram gravadas', () => {
    // Responder fora de ordem e deixar um buraco: sem o mapa por índice, os quatro `true`
    // gravados contariam como quatro acertos e o item 1 apareceria como respondido.
    let p = progressoVazio()
    for (const i of [4, 2, 9, 0]) p = registrarDiagnostico(p, SLUG, i, true, AGORA)
    expect(veredictosDoDiagnostico(p, SLUG, 10)).toEqual([
      true,
      null,
      true,
      null,
      true,
      null,
      null,
      null,
      null,
      true,
    ])
    expect(resumoDoDiagnostico(trilhaFake(), p, SLUG).resultado).toBeNull()
  })

  it('não mistura o diagnóstico de uma trilha com o de outra', () => {
    let p = progressoVazio()
    for (let i = 0; i < 10; i++) p = registrarDiagnostico(p, SLUG, i, true, AGORA)
    expect(resumoDoDiagnostico(trilhaFake(), p, '91-trilhas/plano-90-dias').resultado).toBeNull()
  })
})

describe('atividadesDoGuia', () => {
  it('lê as atividades com a coluna "Pré-requisito técnico" do material', () => {
    const guia = guiaFake({
      atividades: tabelaDeAtividades([
        ['1', 'Listar os cinco tipos de informação mais sensíveis.', 'demonstra', 'nenhum'],
        ['2', 'Montar inventário de 15 ativos.', 'demonstra', 'planilha eletrônica'],
      ]),
    })
    const atividades = atividadesDoGuia(guia)
    expect(atividades.map((a) => a.numero)).toEqual(['1', '2'])
    expect(atividades[0]?.texto).toContain('cinco tipos de informação')
    expect(atividades[0]?.semPreRequisitoTecnico).toBe(true)
    expect(atividades[1]?.preRequisito).toBe('planilha eletrônica')
    expect(atividades[1]?.semPreRequisitoTecnico).toBe(false)
  })

  it('acha a coluna pelo CABEÇALHO, e não pela posição', () => {
    // A ordem das colunas não é contrato do material: achar "Atividade" e "Pré-requisito" pela
    // posição faria a tela mostrar a frase errada como se fosse a atividade.
    const guia = guiaFake({
      atividades: tabelaDeAtividades(
        [['nenhum', 'demonstra', '1', 'Listar os cinco tipos de informação.']],
        ['Pré-requisito técnico', 'O que a prática demonstra', '#', 'Atividade'],
      ),
    })
    const atividades = atividadesDoGuia(guia)
    expect(atividades[0]?.texto).toBe('Listar os cinco tipos de informação.')
    expect(atividades[0]?.numero).toBe('1')
    expect(atividades[0]?.semPreRequisitoTecnico).toBe(true)
  })

  it('aceita o "Nenhum" com maiúscula e o "Nenhum; ..." com observação', () => {
    // O material escreve as três formas; exigir a palavra exata esconderia dois artefatos que a
    // trilha nomeia como sendo os da área.
    const guia = guiaFake({
      atividades: tabelaDeAtividades([
        ['1', 'a', 'd', 'nenhum'],
        ['2', 'b', 'd', 'Nenhum'],
        ['3', 'c', 'd', 'Nenhum; ata, chamado e mensagem de time bastam'],
        ['4', 'd', 'd', 'Acesso público ao CSV ou à API do EPSS, sem custo'],
      ]),
    })
    expect(atividadesDoGuia(guia).map((a) => a.semPreRequisitoTecnico)).toEqual([
      true,
      true,
      true,
      false,
    ])
  })

  it('devolve lista vazia sem a tabela da seção 8 e sem a coluna "Atividade"', () => {
    expect(atividadesDoGuia(guiaFake())).toEqual([])
    expect(
      atividadesDoGuia(guiaFake({ atividades: tabelaDeAtividades([['1', 'x']], ['#', 'Outra']) })),
    ).toEqual([])
  })
})

describe('marcoDaArea', () => {
  const guia = guiaFake({
    atividades: tabelaDeAtividades([
      ['1', 'Escrever a carta de mandato.', 'd', 'nenhum'],
      ['2', 'Listar as seis últimas decisões.', 'd', 'acesso à ata'],
    ]),
  })
  const area = areaFake({ guia })

  it('só cumpre com o checkpoint aprovado E o artefato produzido', () => {
    const soCheckpoint = registrarCheckpoint(progressoVazio(), '01-fundamentos', 4, 5, AGORA)
    const soArtefato = registrarArtefato(progressoVazio(), chaveDoArtefato('01-fundamentos', '1'), true, AGORA)
    expect(marcoDaArea(area, soCheckpoint).cumprido).toBe(false)
    expect(marcoDaArea(area, soCheckpoint).produzidos).toBe(0)
    expect(marcoDaArea(area, soArtefato).cumprido).toBe(false)
    expect(marcoDaArea(area, soArtefato).checkpointAprovado).toBeNull()

    let osDois = soCheckpoint
    osDois = registrarArtefato(osDois, chaveDoArtefato('01-fundamentos', '2'), true, AGORA)
    const marco = marcoDaArea(area, osDois)
    expect(marco.cumprido).toBe(true)
    expect(marco.produzidos).toBe(1)
    expect(marco.artefatos).toBe(2)
  })

  it('não cumpre com o checkpoint reprovado, mesmo com artefato produzido', () => {
    let p = registrarCheckpoint(progressoVazio(), '01-fundamentos', 3, 5, AGORA)
    p = registrarArtefato(p, chaveDoArtefato('01-fundamentos', '1'), true, AGORA)
    const marco = marcoDaArea(area, p)
    expect(marco.checkpointAprovado).toBe(false)
    expect(marco.cumprido).toBe(false)
  })

  it('lê o critério do guia, sem copiar limiar para a trilha', () => {
    // O critério é do guia: se ele mudar, o marco muda com ele. O teste fixa a leitura, e não
    // o número — o número do fixture é o do guia.
    expect(marcoDaArea(area, progressoVazio()).criterio).toBe(guia.criterio)
  })
})

describe('marcoDaFase', () => {
  const fases = [
    {
      rotulo: '1 Vocabulário e cargo',
      periodo: '1 a 6',
      areas: ['01-fundamentos', '00-guia-basico'],
      marco: 'do material',
    },
  ]

  it('só cumpre quando todas as áreas da fase cumprem', () => {
    const comArtefato = (areaId: string) => {
      let p = registrarCheckpoint(progressoVazio(), areaId, 4, 5, AGORA)
      p = registrarArtefato(p, chaveDoArtefato(areaId, '1'), true, AGORA)
      return p
    }
    const areas = [
      areaFake({
        areaId: '01-fundamentos',
        guia: guiaFake({ atividades: tabelaDeAtividades([['1', 'a', 'd', 'nenhum']]) }),
      }),
      areaFake({
        areaId: '00-guia-basico',
        guia: guiaFake({ atividades: tabelaDeAtividades([['1', 'a', 'd', 'nenhum']]) }),
      }),
    ]
    const umaSo = marcoDaFase(fases[0]!, areas, comArtefato('01-fundamentos'))
    expect(umaSo.marcos).toHaveLength(2)
    expect(umaSo.cumpridas).toBe(1)
    expect(umaSo.cumprido).toBe(false)

    const asDuas = {
      ...comArtefato('01-fundamentos'),
      checkpoints: {
        '01-fundamentos': { acertos: 4, total: 5 },
        '00-guia-basico': { acertos: 4, total: 5 },
      },
      artefatos: {
        [chaveDoArtefato('01-fundamentos', '1')]: { produzido: true, data: '2026-03-10' },
        [chaveDoArtefato('00-guia-basico', '1')]: { produzido: true, data: '2026-03-10' },
      },
    }
    const fase = marcoDaFase(fases[0]!, areas, asDuas)
    expect(fase.cumpridas).toBe(2)
    expect(fase.cumprido).toBe(true)
  })

  it('fase sem área ligada na seção 3 nunca fica cumprida', () => {
    // O Bloco F do plano de 24 meses não nomeia área: o marco dele é o texto do material, e o
    // app não inventa a ligação para poder marcar um "cumprido".
    const semArea = marcoDaFase(fases[0]!, [], progressoVazio())
    expect(semArea.semArea).toBe(true)
    expect(semArea.cumprido).toBe(false)
  })

  it('ignora área da fase que não existe no conteúdo carregado', () => {
    const fase = marcoDaFase(
      { ...fases[0]!, areas: ['01-fundamentos', '99-inexistente'] },
      [areaFake()],
      progressoVazio(),
    )
    expect(fase.marcos.map((m) => m.areaId)).toEqual(['01-fundamentos'])
  })
})
