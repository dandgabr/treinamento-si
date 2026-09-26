import { describe, expect, it } from 'vitest'
import {
  extrairMermaid,
  extrairQA,
  fatiarSecoes,
  itensNumerados,
  limparConfianca,
  parseTabela,
  parseTemaDeTexto,
  renderSeguro,
} from './markdown'

const FRONTMATTER = (temaId: string) => `---
tema: "Título do tema"
tema_id: "${temaId}"
area_id: "01-fundamentos"
nivel: base
tempo_estimado: "30 min"
objetivo_aprendizagem: "fazer X"
certificacoes: []
pre_requisitos: []
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com: []
fontes:
  - titulo: "Fonte"
    url: "https://exemplo/1"
    tipo: primaria
    acessado_em: "2026-01-01"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-01-01"
revisar_ate: "2027-01-01"
status_verificacao: rascunho
---`

function tema(opcoes: { temaId?: string; preTeste?: string; secao9?: string; secao10?: string; mermaid?: string } = {}): string {
  return `${FRONTMATTER(opcoes.temaId ?? 'TEMA-01')}

# Título do tema

Abertura do tema.

## 1. Objetivo de aprendizagem
Ao final: fazer X.

## 2. Pré-requisitos
Nada.

## 3. Pré-teste
${opcoes.preTeste ?? '1. Primeira pergunta.\n   Confiança: ___\n2. Segunda pergunta.\n   Confiança: ___'}

## 4. Caso real
Um caso.

## 5. Conteúdo
Texto.

## 6. Por que isso importa para o CISO
Importa por causa do orçamento.

## 7. Aplicação prática
Faça.

## 8. Autoexplicação
Explique.

## 9. Erros comuns e equívocos
${opcoes.secao9 ?? '| Equívoco | Por que está errado | O que é correto |\n|---|---|---|\n| A | B | C |'}

## 10. Recuperação ativa
${opcoes.secao10 ?? '1. Pergunta um.\n2. Pergunta dois.\n\n<details>\n<summary>Conferir respostas</summary>\n\n1. Resposta um.\n2. Resposta dois.\n</details>'}

## 11. Revisão espaçada
| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | responder | repetir |

## 12. Conexões com outros temas
Texto.

## 13. Certificações e leitura recomendada
Texto.

## 14. Fontes verificadas
| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Fonte | primaria | https://exemplo/1 | "2026-01-01" | alta |
${opcoes.mermaid ?? ''}`
}

describe('fatiarSecoes', () => {
  it('separa intro e seções numeradas', () => {
    const { intro, secoes } = fatiarSecoes(tema())
    expect(secoes).toHaveLength(14)
    expect(secoes[0]).toMatchObject({ numero: 1, titulo: 'Objetivo de aprendizagem' })
    expect(intro).toContain('# Título do tema')
    expect(intro).not.toContain('## 1.')
  })

  it('devolve intro integral quando não há cabeçalho numerado', () => {
    // É o caso de glossario.md e mapa-relacoes.md, que usam "## Termos" sem número.
    const corpo = '# Glossário\n\n## Termos\n\n| a | b |\n|---|---|\n| 1 | 2 |'
    const { intro, secoes } = fatiarSecoes(corpo)
    expect(secoes).toHaveLength(0)
    expect(intro).toContain('## Termos')
  })
})

describe('itensNumerados', () => {
  it('ignora marcadores que não são de lista numerada', () => {
    const itens = itensNumerados('- foo\n- bar\n\n1. um\n2. dois')
    expect(itens).toEqual(['um', 'dois'])
  })
})

describe('limparConfianca', () => {
  it('remove a linha canônica', () => {
    const limpo = limparConfianca('Pergunta?\n   Confiança: ___')
    expect(limpo).toBe('Pergunta?')
  })

  it('preserva o texto quando não há linha de confiança', () => {
    expect(limparConfianca('Pergunta sem marcador?')).toBe('Pergunta sem marcador?')
  })

  it('remove formatos não canônicos que vazariam para a pergunta', () => {
    expect(limparConfianca('Pergunta?\nConfiança: 3')).toBe('Pergunta?')
    expect(limparConfianca('Pergunta?\nConfiança: (1-5)')).toBe('Pergunta?')
  })
})

describe('parseTabela', () => {
  it('converte cabeçalho e linhas', () => {
    const t = parseTabela('| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |')
    expect(t?.cabecalho).toEqual(['A', 'B', 'C'])
    expect(t?.linhas).toEqual([['1', '2', '3']])
  })

  it('devolve null quando só existe o cabeçalho', () => {
    expect(parseTabela('| A | B |\n|---|---|')).toBeNull()
  })

  it('preenche célula faltante com string vazia', () => {
    const t = parseTabela('| A | B | C |\n|---|---|---|\n| 1 | 2 |')
    expect(t?.linhas[0]).toEqual(['1', '2'])
    expect(t?.linhas[0]?.[2]).toBeUndefined()
  })
})

describe('extrairQA', () => {
  it('pareia perguntas numeradas com as respostas do details', () => {
    const { pares } = extrairQA(
      '1. Um?\n2. Dois?\n\n<details>\n<summary>Conferir</summary>\n\n1. R1.\n2. R2.\n</details>',
    )
    expect(pares).toEqual([
      { pergunta: 'Um?', resposta: 'R1.' },
      { pergunta: 'Dois?', resposta: 'R2.' },
    ])
  })

  it('devolve respostas vazias quando não há details', () => {
    const { pares } = extrairQA('1. Um?\n2. Dois?')
    expect(pares.map((p) => p.resposta)).toEqual(['', ''])
  })

  it('não inventa índice quando faltam respostas', () => {
    const { pares } = extrairQA(
      '1. Um?\n2. Dois?\n3. Três?\n\n<details>\n<summary>x</summary>\n\n1. R1.\n2. R2.\n</details>',
    )
    expect(pares[2]?.resposta).toBe('')
  })

  it('não confunde "critério" solto dentro de uma resposta com o rótulo do critério', () => {
    const { criterio } = extrairQA(
      '1. Um?\n\n<details>\n<summary>x</summary>\n\n1. O critério de aceitação foi aplicado.\n</details>',
    )
    expect(criterio).toBe('')
  })
})

describe('extrairMermaid', () => {
  it('substitui o bloco por um div e preserva a fonte', () => {
    const { texto, blocos } = extrairMermaid('antes\n\n```mermaid\nflowchart TD\n  A --> B\n```\n\ndepois')
    expect(blocos).toEqual(['flowchart TD\n  A --> B'])
    expect(texto).toContain('<div class="mermaid">')
    expect(texto).not.toContain('```mermaid')
  })

  it('escapa os caracteres perigosos da fonte do diagrama', () => {
    const { blocos } = extrairMermaid('```mermaid\nflowchart TD\n  A[a & b]\n```')
    expect(blocos[0]).toContain('a & b')
    const { texto } = extrairMermaid('```mermaid\nflowchart TD\n  A[a & b]\n```')
    expect(texto).toContain('&amp;')
  })

  it('aceita fence com espaço à direita', () => {
    const { blocos } = extrairMermaid('```mermaid  \nflowchart TD\n  A --> B\n```')
    expect(blocos).toHaveLength(1)
  })
})

describe('renderSeguro', () => {
  it('acusa, em vez de limpar em silêncio, quando o bloco traz script ou handler inline', () => {
    // O contrato e falhar alto: conteudo perigoso no Markdown exige revisao humana,
    // nao uma limpeza silenciosa que ninguem percebe.
    expect(() => renderSeguro('<p>ok</p>\n<script>alert(1)</script>')).toThrow(/removeu conteudo/)
    expect(() => renderSeguro('<img src=x onerror=alert(1)>')).toThrow(/removeu conteudo/)
  })

  it('devolve o HTML sanitizado sem alterar o conteúdo permitido', () => {
    const html = renderSeguro('# Título\n\n| A | B |\n|---|---|\n| 1 | 2 |')
    expect(html).toContain('<h1>Título</h1>')
    expect(html).toContain('<table>')
  })

  it('acusa quando removeria todo o conteúdo do bloco', () => {
    // O DOMPurify descarta um elemento proibido único no topo sem registrá-lo em
    // `removed`; sem a comparação de texto o build passaria com o bloco vazio.
    expect(() => renderSeguro('<style>body{display:none}</style>')).toThrow(/removeu conteudo/)
  })

  it('preserva details e summary', () => {
    const html = renderSeguro('<details><summary>Ver</summary>\n\nresposta\n\n</details>')
    expect(html).toContain('<details>')
    expect(html).toContain('<summary>')
  })
})

describe('parseTemaDeTexto', () => {
  it('monta o ref como areaId#tema_id', () => {
    expect(parseTemaDeTexto(tema(), '01-fundamentos').ref).toBe('01-fundamentos#TEMA-01')
  })

  it('gera refs distintas para o mesmo TEMA-01 em áreas diferentes', () => {
    const a = parseTemaDeTexto(tema({ temaId: 'TEMA-01' }), '01-fundamentos')
    const b = parseTemaDeTexto(tema({ temaId: 'TEMA-01' }), '14-dados-privacidade')
    expect(a.ref).toBe('01-fundamentos#TEMA-01')
    expect(b.ref).toBe('14-dados-privacidade#TEMA-01')
    expect(a.ref).not.toBe(b.ref)
  })

  it('extrai pré-teste, recuperação e erros comuns', () => {
    const t = parseTemaDeTexto(tema(), '01-fundamentos')
    expect(t.preTeste.map((q) => q.pergunta)).toEqual([
      'Primeira pergunta.',
      'Segunda pergunta.',
    ])
    expect(t.recuperacao).toHaveLength(2)
    expect(t.errosComuns[0]).toEqual({ equivoco: 'A', porque: 'B', correto: 'C' })
  })

  it('não lança quando uma seção está ausente', () => {
    const semSecoes = tema().replace(/## 9\.[\s\S]*?## 10\./, '## 10.').replace(/## 10\.[\s\S]*?## 11\./, '## 11.')
    const t = parseTemaDeTexto(semSecoes, '01-fundamentos')
    expect(t.errosComuns).toEqual([])
    expect(t.recuperacao).toEqual([])
  })

  it('devolve erros comuns vazio quando a tabela só tem cabeçalho', () => {
    const t = parseTemaDeTexto(tema({ secao9: '| A | B | C |\n|---|---|---|' }), '01-fundamentos')
    expect(t.errosComuns).toEqual([])
  })

  it('remove o h1 do intro, que já vem do frontmatter', () => {
    const t = parseTemaDeTexto(tema(), '01-fundamentos')
    expect(t.intro).not.toContain('<h1>')
    expect(t.intro).toContain('Abertura do tema.')
  })
})
