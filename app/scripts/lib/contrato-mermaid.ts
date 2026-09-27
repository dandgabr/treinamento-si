// Le o contrato do Mermaid onde ele e declarado: a secao 7 do CONTRIBUTING do material.
//
// O contrato e a fonte unica das regras de rotulo Mermaid. Antes o gate do app mantinha a propria
// copia — e so a lista de rotulos —, que ficou para tras sem ninguem notar; agora este modulo le
// o mesmo bloco `<!-- contrato-mermaid: {...} -->` que `conteudo/scripts/verificar-repo.py` le, e
// o verificador do material confere que a prosa da secao 7 concorda com ele.
//
// A leitura e preguicosa e memorizada: o diretorio do material so e tocado no primeiro uso.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..', '..')

/** Diretorio do material. Mesma variavel de troca do `build-content.ts`. */
export const DIR_CONTEUDO = process.env.ROADMAP_CONTENT_DIR ?? path.resolve(APP, '..', 'conteudo')

const RE_CONTRATO = /<!--\s*contrato-mermaid:\s*(\{.*?\})\s*-->/s

export interface ContratoMermaid {
  /** Caracteres que nao podem aparecer dentro de `[...]` num rotulo. */
  rotulos_proibidos: string[]
  /** Palavras que nao podem ser id de no. */
  ids_proibidos: string[]
  /** Inicios de diretiva bloqueados pelo GitHub. */
  diretivas_proibidas: string[]
  /** Recursos (clique em no) que o GitHub descarta. */
  recursos_proibidos: string[]
}

const memorizado = new Map<string, ContratoMermaid>()

/**
 * Le o contrato da secao 7 do CONTRIBUTING (uma leitura por diretorio, memorizada).
 *
 * Falha alto quando o arquivo ou o bloco nao existem, em vez de cair num padrao embutido: um
 * padrao local seria a segunda fonte que o contrato acabou de eliminar, e o gate passaria a
 * conferir regra que ninguem escreveu no material.
 */
export function lerContratoMermaid(dirConteudo: string = DIR_CONTEUDO): ContratoMermaid {
  const guardado = memorizado.get(dirConteudo)
  if (guardado) return guardado
  const caminho = path.join(dirConteudo, 'CONTRIBUTING.md')
  if (!fs.existsSync(caminho)) {
    throw new Error(
      `CONTRIBUTING.md nao encontrado em ${caminho}: o contrato do Mermaid mora na secao 7 dele. ` +
        `Aponte ROADMAP_CONTENT_DIR para o diretorio do material.`,
    )
  }
  const achado = RE_CONTRATO.exec(fs.readFileSync(caminho, 'utf-8'))
  if (!achado?.[1]) {
    throw new Error(
      `CONTRIBUTING.md (§7) sem o bloco \`contrato-mermaid: {...}\`: restaure-o no material ` +
        `em vez de manter a lista de regras aqui.`,
    )
  }
  let contrato: ContratoMermaid
  try {
    contrato = JSON.parse(achado[1]) as ContratoMermaid
  } catch (erro) {
    throw new Error(`contrato-mermaid ilegivel no CONTRIBUTING.md: ${String(erro)}`)
  }
  if (!Array.isArray(contrato?.rotulos_proibidos)) {
    throw new Error('contrato-mermaid sem a chave `rotulos_proibidos`')
  }
  memorizado.set(dirConteudo, contrato)
  return contrato
}
