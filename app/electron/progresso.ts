// Guarda o progresso num arquivo na pasta de dados do aplicativo.
//
// E o motivo principal de existir a versao desktop: o estado sai do armazenamento do
// navegador (por origem, compartilhado no file:// do Chromium, apagavel junto com os
// dados de navegacao) e vira um arquivo que a pessoa pode copiar, restaurar e ler.

import { app } from 'electron'
import { closeSync, fsyncSync, openSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

const NOME = 'progresso.json'
/** Teto generoso: o estado cheio passa longe disso, e o arquivo vem de fora. */
export const TETO_BYTES = 1024 * 1024

export function caminhoDoProgresso(): string {
  return path.join(app.getPath('userData'), NOME)
}

/** Resultado de ler um arquivo que veio de fora, para a importacao. */
export type ResultadoDeLeitura =
  | { estado: 'ok'; dado: unknown }
  | { estado: 'erro'; mensagem: string }

/** Codigo do erro do sistema (`ENOENT`, `EACCES`...), sem `any` e sem cast amplo. */
function codigoDe(erro: unknown): string | undefined {
  if (erro && typeof erro === 'object' && 'code' in erro) {
    const codigo: unknown = (erro as { code?: unknown }).code
    return typeof codigo === 'string' ? codigo : undefined
  }
  return undefined
}

/**
 * Le do descritor no maximo `limite` bytes. Devolve `null` quando o arquivo passa disso.
 *
 * A leitura e limitada de proposito, e nao "le tudo e confere depois": o teto existe para
 * nao analisar (nem carregar na memoria) um arquivo gigante escolhido por engano ou por ma-fe,
 * e `readFile` sozinho ja teria lido os gigabytes antes de qualquer conferencia.
 */
async function lerNoMaximo(arquivo: fs.FileHandle, limite: number): Promise<string | null> {
  const bloco = Buffer.alloc(limite + 1)
  let lidos = 0
  while (lidos < bloco.length) {
    const { bytesRead } = await arquivo.read(bloco, lidos, bloco.length - lidos, lidos)
    if (bytesRead === 0) break
    lidos += bytesRead
  }
  if (lidos > limite) return null
  return bloco.toString('utf8', 0, lidos)
}

/**
 * Le o progresso guardado.
 *
 * Devolve `null` SO quando o arquivo nao existe — a primeira vez, em que gravar por cima nao
 * destroi nada. Qualquer outra falha (arquivo ilegivel, truncado, JSON quebrado ou acima do
 * teto) LANCA. Antes as tres situacoes colapsavam em `null`, e o aplicativo abria zerado com
 * `podeGravar=true`: o primeiro clique substituia o arquivo inteiro pelo estado vazio mais um
 * clique, e o progresso importado sumia sem aviso. Quem chama (`application/progresso-store`)
 * trata o lancamento como "nao consegui ler" e passa a nao gravar nesta sessao.
 */
export async function lerProgresso(): Promise<unknown | null> {
  const caminho = caminhoDoProgresso()
  let arquivo: fs.FileHandle
  try {
    arquivo = await fs.open(caminho, 'r')
  } catch (erro) {
    // Ausente e "primeira vez". As demais falhas de abertura (permissao, E/S, pasta no lugar
    // do arquivo) sao erro: nao da para dizer que nao havia nada guardado.
    if (codigoDe(erro) === 'ENOENT') return null
    throw new Error(`não consegui abrir o progresso guardado (${codigoDe(erro) ?? 'erro de leitura'})`)
  }
  try {
    const informacao = await arquivo.stat()
    // O teto e medido em BYTES — a mesma unidade da gravacao. Enquanto a gravacao media
    // `texto.length` (unidades de codigo) e a leitura media `stat.size` (bytes), o mesmo dado
    // valia dois numeros diferentes: um estado de 600 mil caracteres acentuados passava no
    // teto da gravacao, saia com 1,8 MB e era recusado na leitura seguinte.
    if (informacao.size > TETO_BYTES) throw new Error('o progresso guardado passa de 1 MB')
    // O tamanho veio do descritor, mas o conteudo ainda pode ter mudado desde o `fstat`; a
    // leitura limitada confere o que veio de fato.
    let texto: string | null
    try {
      texto = await lerNoMaximo(arquivo, TETO_BYTES)
    } catch (erro) {
      // Descritor que nao aceita leitura: um diretorio no lugar do arquivo, por exemplo.
      throw new Error(`não consegui ler o progresso guardado (${codigoDe(erro) ?? 'erro de leitura'})`)
    }
    if (texto === null) throw new Error('o progresso guardado passa de 1 MB')
    try {
      return JSON.parse(texto) as unknown
    } catch {
      throw new Error('o progresso guardado não é um JSON válido')
    }
  } finally {
    await arquivo.close()
  }
}

export async function gravarProgresso(valor: unknown): Promise<void> {
  const texto = JSON.stringify(valor)
  // Bytes, e nao unidades de codigo: e o mesmo numero que a leitura compara com o teto.
  if (Buffer.byteLength(texto, 'utf8') > TETO_BYTES) {
    throw new Error('progresso grande demais para gravar')
  }
  const caminho = caminhoDoProgresso()
  await fs.mkdir(path.dirname(caminho), { recursive: true })
  // Nome unico por processo: duas gravacoes sobrepostas nao disputam o mesmo temporario.
  const temporario = `${caminho}.${process.pid}.tmp`
  try {
    // A gravar e sincrona de proposito. O arquivo tem no maximo 1 MB, e a versao
    // assincrona deixava a ultima acao em risco se a janela fechasse logo depois do clique.
    const descritor = openSync(temporario, 'w', 0o600)
    try {
      writeFileSync(descritor, texto, 'utf8')
      // `fsync` antes do `rename`: o rename e atomico para o NOME, nao para o conteudo. Sem
      // sincronizar, uma queda entre os dois deixa o nome novo apontando para um arquivo ainda
      // vazio no disco, e o app volta zerado — que e o mesmo estrago da gravacao parcial.
      fsyncSync(descritor)
    } finally {
      closeSync(descritor)
    }
    // Renomear e atomico: nunca fica um arquivo pela metade se o app fechar no meio.
    renameSync(temporario, caminho)
  } catch (erro) {
    // O temporario nao pode ficar para tras: uma falha de disco repetida encheria a pasta de
    // dados de `.tmp` orfaos, cada um com uma copia do progresso.
    rmSync(temporario, { force: true })
    throw erro
  }
}

/**
 * Le o arquivo escolhido para importar, com o teto conferido no MESMO descritor que e lido.
 *
 * `fs.stat(caminho)` seguido de `fs.readFile(caminho)` sao duas consultas ao CAMINHO, e nao
 * uma ao arquivo: entre as duas o alvo pode ser trocado por symlink. E o tamanho mentia nos
 * dois sentidos — um FIFO tem `size === 0`, passava pelo teto e deixava o `readFile` pendente
 * para sempre (o handler do IPC ficava sem resposta, e a tela sem retorno nenhum). Abrir uma
 * vez e conferir `fstat` + leitura limitada fecha os dois: o que foi conferido e o que foi lido
 * e o mesmo descritor.
 */
export async function lerImportado(caminho: string): Promise<ResultadoDeLeitura> {
  let arquivo: fs.FileHandle
  try {
    arquivo = await fs.open(caminho, 'r')
  } catch {
    return { estado: 'erro', mensagem: 'Não consegui abrir o arquivo.' }
  }
  try {
    const informacao = await arquivo.stat()
    // Um progresso exportado e um arquivo comum. Diretorio, FIFO e dispositivo nao sao — e os
    // dois ultimos nem tamanho tem para conferir contra o teto.
    if (!informacao.isFile()) {
      return { estado: 'erro', mensagem: 'O arquivo não é um arquivo comum.' }
    }
    if (informacao.size > TETO_BYTES) {
      return { estado: 'erro', mensagem: 'O arquivo passa de 1 MB.' }
    }
    const texto = await lerNoMaximo(arquivo, TETO_BYTES)
    if (texto === null) return { estado: 'erro', mensagem: 'O arquivo passa de 1 MB.' }
    try {
      return { estado: 'ok', dado: JSON.parse(texto) as unknown }
    } catch {
      return { estado: 'erro', mensagem: 'O arquivo não é um JSON válido.' }
    }
  } catch {
    return { estado: 'erro', mensagem: 'Não consegui ler o arquivo.' }
  } finally {
    await arquivo.close()
  }
}

export async function apagarProgresso(): Promise<void> {
  await fs.rm(caminhoDoProgresso(), { force: true })
}
