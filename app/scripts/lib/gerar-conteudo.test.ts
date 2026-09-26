import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { gerarConteudo } from './gerar-conteudo'
import { validar } from './validar-content'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const MATERIAL = path.resolve(AQUI, '..', '..', '..', 'conteudo')

describe('gerarConteudo', () => {
  it('lança quando o diretório não existe', () => {
    expect(() => gerarConteudo('/caminho/que/nao/existe')).toThrow(/nao encontrado/)
  })

  it('devolve conteúdo vazio, sem lançar, para um diretório sem pastas de área', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-vazio-'))
    try {
      const c = gerarConteudo(tmp)
      expect(c.meta.totais).toEqual({ areas: 0, temas: 0, paginas: 0 })
      expect(c.areas).toEqual([])
      expect(validar(c, { areas: 0, temas: 0, paginas: 0 })).toEqual([])
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true })
    }
  })
})

describe.skipIf(!fs.existsSync(MATERIAL))('contrato com o material real', () => {
  it('parseia e valida os 18/109/22 sem erro', () => {
    const conteudo = gerarConteudo(MATERIAL)
    expect(validar(conteudo)).toEqual([])
    expect(conteudo.meta.totais).toEqual({ areas: 18, temas: 109, paginas: 22 })
  })
})
