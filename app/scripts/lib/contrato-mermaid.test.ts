import { describe, expect, it } from 'vitest'
import { lerContratoMermaid } from './contrato-mermaid'

// O gate do app passou a ler o contrato da secao 7 do CONTRIBUTING em vez de manter a propria
// copia. Este teste guarda as duas pontas disso: o contrato existe e tem as chaves que o
// `checarMermaid` le, e um diretorio de material sem CONTRIBUTING falha alto (em vez de cair num
// padrao embutido, que seria a segunda fonte que a mudanca eliminou).
describe('contrato do Mermaid', () => {
  it('le as regras do CONTRIBUTING do material', () => {
    const contrato = lerContratoMermaid()
    expect(contrato.rotulos_proibidos.length).toBeGreaterThan(0)
    expect(contrato.rotulos_proibidos).toContain('<')
    expect(contrato.rotulos_proibidos).toContain('#')
    // `&` nunca foi proibido: `ATT&CK` e rotulo legitimo no material.
    expect(contrato.rotulos_proibidos).not.toContain('&')
    expect(contrato.ids_proibidos).toContain('end')
    expect(contrato.diretivas_proibidas.length).toBeGreaterThan(0)
    expect(contrato.recursos_proibidos).toContain('click')
  })

  it('falha alto quando o material nao esta onde o gate procura', () => {
    expect(() => lerContratoMermaid('/diretorio/que/nao/existe')).toThrow(
      /CONTRIBUTING\.md nao encontrado/,
    )
  })
})
