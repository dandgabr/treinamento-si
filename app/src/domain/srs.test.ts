import { describe, expect, it } from 'vitest'
import { estadoFake } from './testes/fixtures'
import {
  criarEstado,
  DEMOTAO,
  estaVencido,
  FALHAS_PARA_RELEITURA,
  filaDeHoje,
  INTERVALO_ALEM_DIAS,
  intervaloInicial,
  precisaReleituraCompleta,
  proximoIntervalo,
  registrarRevisao,
  SEQUENCIA_DIAS,
  tarefaDoIntervalo,
  ULTIMO_INTERVALO_DIAS,
  ultimaPassagem,
} from './srs'

const AGORA = new Date('2026-03-10T12:00:00.000Z')

describe('proximoIntervalo', () => {
  it('usa a sequência declarada no material', () => {
    expect([...SEQUENCIA_DIAS]).toEqual([1, 7, 30])
    expect(intervaloInicial()).toBe(1)
  })

  it('mantém o D+90 fora da sequência do tema', () => {
    // `SEQUENCIA_DIAS` é o espelho do `revisao_inicial_dias` do frontmatter (`[1, 7, 30]`), e o
    // gate `check:content` compara os dois. O D+90 vem das trilhas, não do tema: ele não pode
    // entrar neste array, mesmo sendo o último degrau da escada.
    expect(INTERVALO_ALEM_DIAS).toBe(90)
    expect(ULTIMO_INTERVALO_DIAS).toBe(INTERVALO_ALEM_DIAS)
    expect(DEMOTAO[INTERVALO_ALEM_DIAS]).toBe(30)
    expect(SEQUENCIA_DIAS.length).toBe(3)
  })

  it('avança 1 → 7 → 30 no acerto', () => {
    expect(proximoIntervalo(1, true)).toBe(7)
    expect(proximoIntervalo(7, true)).toBe(30)
  })

  it('avança 30 → 90: as trilhas revisam todos os temas em D+90 e além', () => {
    // plano-12-meses §6 e plano-24-meses §6. Antes, acertar em D+30 consolidava o tema.
    expect(proximoIntervalo(30, true)).toBe(INTERVALO_ALEM_DIAS)
  })

  it('consolida depois do último intervalo', () => {
    expect(proximoIntervalo(90, true)).toBeNull()
  })

  it('rebaixa pela tabela do material no erro (D+7 no lugar de D+30, D+3 no lugar de D+7)', () => {
    expect(proximoIntervalo(30, false)).toBe(7)
    expect(proximoIntervalo(7, false)).toBe(3)
    expect(proximoIntervalo(1, false)).toBe(1)
  })

  it('rebaixa D+90 para D+30, como manda a tabela de exemplo das trilhas', () => {
    // "D+90 | D+90 | ok / revisar | avançar / repetir em D+30" nos dois planos.
    expect(proximoIntervalo(90, false)).toBe(30)
  })

  it('cai na metade para intervalo fora da tabela', () => {
    expect(proximoIntervalo(3, false)).toBe(1)
  })

  it('volta para a sequência depois de um intervalo intermediário', () => {
    expect(proximoIntervalo(3, true)).toBe(7)
  })
})

describe('criarEstado', () => {
  it('agenda a primeira revisão para D+1', () => {
    const e = criarEstado('a#TEMA-01', AGORA)
    expect(e.intervaloDias).toBe(1)
    expect(e.proximaRevisao).toBe('2026-03-11T12:00:00.000Z')
    expect(e.passagens).toBe(0)
    expect(e.falhasSeguidas).toBe(0)
    expect(e.consolidado).toBe(false)
  })
})

describe('registrarRevisao', () => {
  it('avança e reinicia o prazo no acerto', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 1 }), true, AGORA)
    expect(e.intervaloDias).toBe(7)
    expect(e.proximaRevisao).toBe('2026-03-17T12:00:00.000Z')
    expect(e.passagens).toBe(1)
    expect(e.rebaixamentos).toBe(0)
  })

  it('rebaixa e conta o rebaixamento no erro', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 30 }), false, AGORA)
    expect(e.intervaloDias).toBe(7)
    expect(e.passagens).toBe(1)
    expect(e.rebaixamentos).toBe(1)
  })

  it('consolida ao acertar no último intervalo (D+90)', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 90 }), true, AGORA)
    expect(e.consolidado).toBe(true)
    expect(e.passagens).toBe(1)
  })

  it('não regride a contagem de passagens', () => {
    let e = criarEstado('a#TEMA-01', AGORA)
    const passagens: number[] = []
    for (const acertou of [true, false, true, true, false]) {
      e = registrarRevisao(e, acertou, AGORA)
      passagens.push(e.passagens)
    }
    expect(passagens).toEqual([1, 2, 3, 4, 5])
  })

  it('mantém a próxima revisão sempre no futuro', () => {
    let e = criarEstado('a#TEMA-01', AGORA)
    for (const acertou of [true, false, true, false, true, true]) {
      e = registrarRevisao(e, acertou, AGORA)
      expect(new Date(e.proximaRevisao).getTime()).toBeGreaterThan(AGORA.getTime())
    }
  })

  it('conta as passagens falhas SEGUIDAS, não os rebaixamentos da vida', () => {
    let e = criarEstado('a#TEMA-01', AGORA)
    e = registrarRevisao(e, false, AGORA)
    expect(e.falhasSeguidas).toBe(1)
    e = registrarRevisao(e, false, AGORA)
    expect(e.falhasSeguidas).toBe(2)
    // Um acerto zera a contagem de seguidas, sem apagar o histórico de rebaixamentos.
    e = registrarRevisao(e, true, AGORA)
    expect(e.falhasSeguidas).toBe(0)
    expect(e.rebaixamentos).toBe(2)
    e = registrarRevisao(e, false, AGORA)
    expect(e.falhasSeguidas).toBe(1)
    expect(e.rebaixamentos).toBe(3)
  })

  it('não deixa passagem falha pendente em tema consolidado', () => {
    const e = registrarRevisao(estadoFake({ intervaloDias: 90, falhasSeguidas: 1 }), true, AGORA)
    expect(e.consolidado).toBe(true)
    expect(e.falhasSeguidas).toBe(0)
  })

  it('consolida de novo no acerto da etapa final de um tema que consolidou em D+30', () => {
    // O arquivo antigo guardou o intervalo de quando a escada terminava em D+30: a passagem que
    // chega agora é a etapa final, e o acerto consolida em vez de abrir um D+90 na escada.
    const antigo = estadoFake({
      intervaloDias: 30,
      proximaRevisao: '2026-03-05T12:00:00.000Z',
      consolidado: true,
      passagens: 3,
    })
    const e = registrarRevisao(antigo, true, AGORA)
    expect(e.consolidado).toBe(true)
    expect(e.intervaloDias).toBe(INTERVALO_ALEM_DIAS)
    expect(e.proximaRevisao).toBe('2026-06-08T12:00:00.000Z')
    expect(e.passagens).toBe(4)
    expect(e.rebaixamentos).toBe(0)
  })

  it('rebaixa para D+30 o tema consolidado que erra na etapa final', () => {
    // "D+90 | D+90 | ok / revisar | avançar / repetir em D+30" (seção 6 das trilhas).
    const antigo = estadoFake({ intervaloDias: 30, consolidado: true, passagens: 4 })
    const e = registrarRevisao(antigo, false, AGORA)
    expect(e.consolidado).toBe(false)
    expect(e.intervaloDias).toBe(30)
    expect(e.proximaRevisao).toBe('2026-04-09T12:00:00.000Z')
    expect(e.rebaixamentos).toBe(1)
    expect(e.falhasSeguidas).toBe(1)
  })

  it('não reescreve a data do consolidado que já está no degrau final', () => {
    // O estado que consolidou pelo app novo guarda exatamente a última passagem mais 90: ler de
    // novo não pode empurrar a data para a frente a cada passagem.
    const atual = estadoFake({
      intervaloDias: 90,
      proximaRevisao: '2026-06-08T12:00:00.000Z',
      consolidado: true,
    })
    const e = registrarRevisao(atual, true, AGORA)
    expect(e.proximaRevisao).toBe('2026-06-08T12:00:00.000Z')
  })
})

describe('precisaReleituraCompleta', () => {
  it('pede releitura só a partir de duas passagens falhas seguidas', () => {
    // plano-12-meses §6: "Duas passagens falhas seguidas mandam o tema para releitura completa".
    expect(FALHAS_PARA_RELEITURA).toBe(2)
    expect(precisaReleituraCompleta(estadoFake({ falhasSeguidas: 0 }))).toBe(false)
    expect(precisaReleituraCompleta(estadoFake({ falhasSeguidas: 1 }))).toBe(false)
    expect(precisaReleituraCompleta(estadoFake({ falhasSeguidas: 2 }))).toBe(true)
    expect(precisaReleituraCompleta(estadoFake({ falhasSeguidas: 3 }))).toBe(true)
  })

  it('não confunde rebaixamento antigo com falhas seguidas', () => {
    const comHistorico = estadoFake({ rebaixamentos: 4, falhasSeguidas: 1 })
    expect(precisaReleituraCompleta(comHistorico)).toBe(false)
  })
})

describe('tarefaDoIntervalo', () => {
  const TAREFAS = [
    { intervaloDias: 1, oQueFazer: 'Responder à seção 10 sem reler', seErrar: 'Rebaixar: repetir em D+1' },
    { intervaloDias: 7, oQueFazer: 'Explicar o tema em 3 frases', seErrar: 'Rebaixar: repetir em D+3' },
  ]

  it('devolve a tarefa do intervalo exato', () => {
    expect(tarefaDoIntervalo(TAREFAS, 7)?.oQueFazer).toBe('Explicar o tema em 3 frases')
  })

  it('devolve null para intervalo sem linha na tabela do material', () => {
    // D+3 é rebaixamento, e a seção 11 de nenhum dos 109 temas tabela esse intervalo: escolher
    // "a linha mais próxima" seria inventar a tarefa, e a decisão não é desta camada.
    expect(tarefaDoIntervalo(TAREFAS, 3)).toBeNull()
    expect(tarefaDoIntervalo(TAREFAS, 90)).toBeNull()
    expect(tarefaDoIntervalo([], 1)).toBeNull()
  })
})

describe('estaVencido', () => {
  it('vence quando o prazo chegou', () => {
    expect(estaVencido(estadoFake({ proximaRevisao: '2026-03-10T12:00:00.000Z' }), AGORA)).toBe(true)
    expect(estaVencido(estadoFake({ proximaRevisao: '2026-03-10T12:00:01.000Z' }), AGORA)).toBe(false)
  })

  it('não vence o tema consolidado dentro do prazo do degrau final', () => {
    // Consolidado em 10/03 (a última passagem), com o degrau final vencendo em 08/06: em 10/04
    // ainda não é hora — nem mesmo na data que o arquivo antigo mostraria, e que era o intervalo
    // de 30 dias gravado quando a escada terminava em D+30.
    const doArquivoAntigo = estadoFake({
      intervaloDias: 30,
      proximaRevisao: '2026-04-09T12:00:00.000Z',
      consolidado: true,
    })
    expect(estaVencido(doArquivoAntigo, AGORA)).toBe(false)
    expect(estaVencido(doArquivoAntigo, new Date('2026-04-10T12:00:00.000Z'))).toBe(false)
    expect(estaVencido(doArquivoAntigo, new Date('2026-06-08T12:00:00.000Z'))).toBe(true)
  })

  it('vence o tema consolidado quando o degrau final chega', () => {
    // Fase 6 das trilhas: todos os temas voltam em "D+90 e além". O acerto que consolidou não
    // pode deixar o tema fora da fila para sempre.
    const consolidado = estadoFake({
      intervaloDias: 30,
      proximaRevisao: '2026-03-05T12:00:00.000Z',
      consolidado: true,
    })
    // Última passagem = 03/02 (05/03 menos os 30 dias que o estado guardou); o degrau final vence
    // 90 dias depois, em 04/05.
    expect(ultimaPassagem(consolidado).toISOString()).toBe('2026-02-03T12:00:00.000Z')
    expect(estaVencido(consolidado, new Date('2026-05-03T12:00:00.000Z'))).toBe(false)
    expect(estaVencido(consolidado, new Date('2026-05-04T12:00:00.000Z'))).toBe(true)
  })
})

describe('filaDeHoje', () => {
  it('devolve só os vencidos, do mais atrasado para o mais recente', () => {
    const estados = [
      estadoFake({ ref: 'a#TEMA-02', proximaRevisao: '2026-03-09T12:00:00.000Z' }),
      estadoFake({ ref: 'a#TEMA-03', proximaRevisao: '2026-04-01T12:00:00.000Z' }),
      estadoFake({ ref: 'a#TEMA-01', proximaRevisao: '2026-03-01T12:00:00.000Z' }),
    ]
    expect(filaDeHoje(estados, AGORA).map((e) => e.ref)).toEqual(['a#TEMA-01', 'a#TEMA-02'])
  })
})
