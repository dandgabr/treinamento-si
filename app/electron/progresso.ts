// Guarda o progresso num arquivo na pasta de dados do aplicativo.
//
// E o motivo principal de existir a versao desktop: o estado sai do armazenamento do
// navegador (por origem, compartilhado no file:// do Chromium, apagavel junto com os
// dados de navegacao) e vira um arquivo que a pessoa pode copiar, restaurar e ler.

import { app } from 'electron'
import { constants, closeSync, fsyncSync, openSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import fs from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { MENSAGEM_GRANDE, TETO_BYTES } from '../src/infrastructure/storage/limites'

const NOME = 'progresso.json'

/**
 * O teto e um so, com um texto so: quem grava, quem exporta e quem importa recusam o mesmo
 * tamanho dizendo a mesma coisa. Antes o exportar nao conferia nada e gravava um arquivo que o
 * importar (esse sim, com teto) recusava — um "backup" que nao volta nao e um backup.
 *
 * Os dois numeros vem do modulo compartilhado (`src/infrastructure/storage/limites.ts`), e nao de
 * uma copia daqui: era essa copia que deixava o NAVEGADOR para tras — ele exportava e guardava
 * sem teto nenhum, e o arquivo que ele gerava nao voltava nem por ele nem por aqui. O `export`
 * logo abaixo mantem a superficie publica deste modulo (quem ja importava daqui continua igual).
 */
export { MENSAGEM_GRANDE, TETO_BYTES }

/**
 * Abrir um caminho que veio de fora (ou que pode ter sido trocado por outra pessoa) SEM
 * bloquear.
 *
 * `fs.open(caminho, 'r')` num FIFO espera um escritor — e num FIFO sem escritor isto e esperar
 * para sempre. Foi o que a medicao mostrou: `<userData>/progresso.json` como FIFO sem escritor
 * deixava o processo principal parado no `anon_pipe_read`, o painel em "carregando o progresso"
 * e o `app.close()` sem voltar (processo vivo aos 625 s, so morto com `kill -9`).
 *
 * `O_NONBLOCK` faz a abertura de um FIFO responder na hora; o `fstat` no descritor, logo depois,
 * e quem decide se o caminho e um arquivo comum. A flag nao muda nada para arquivo comum — o que
 * e o caso normal aqui. `O_RDONLY` e 0; o `?? 0` cobre os sistemas onde a constante nao existe.
 *
 * Quem serve um arquivo pelo `app://` usa as MESMAS flags: aquele caminho tambem vem de fora do
 * processo (um FIFO com nome permitido dentro do build pendurava a requisicao para sempre).
 */
const O_NONBLOCK = constants.O_NONBLOCK ?? 0
export const FLAGS_LEITURA = constants.O_RDONLY | O_NONBLOCK

/**
 * As flags do arquivo temporario: criar EXCLUSIVAMENTE (`O_EXCL`), nunca seguir symlink
 * (`O_NOFOLLOW`) e escrever so.
 *
 * Com `openSync(temporario, 'w', 0o600)` o nome previsivel (`<caminho>.<pid>.tmp`) era um alvo
 * pronto: um symlink plantado nesse caminho era SEGUIDO e a gravacao truncava o alvo apontado —
 * um arquivo qualquer do usuario, com o nosso conteudo dentro. `O_EXCL` recusa (EEXIST) tanto o
 * symlink quanto o arquivo que ja existe, e `O_NOFOLLOW` fecha o caso pela outra ponta.
 */
const FLAGS_TEMPORARIO =
  constants.O_WRONLY |
  constants.O_CREAT |
  constants.O_EXCL |
  (constants.O_NOFOLLOW ?? 0)

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
    // `FLAGS_LEITURA` em vez de `'r'`: o FIFO sem escritor travava aqui, para sempre (ver o
    // comentario das flags). A abertura responde na hora e o `fstat` abaixo diz o que e.
    arquivo = await fs.open(caminho, FLAGS_LEITURA)
  } catch (erro) {
    // Ausente e "primeira vez". As demais falhas de abertura (permissao, E/S, pasta no lugar
    // do arquivo) sao erro: nao da para dizer que nao havia nada guardado.
    if (codigoDe(erro) === 'ENOENT') return null
    throw new Error(`não consegui abrir o progresso guardado (${codigoDe(erro) ?? 'erro de leitura'})`)
  }
  try {
    const informacao = await arquivo.stat()
    // O progresso guardado e um arquivo comum. Um FIFO (ou um dispositivo, ou uma pasta) nao e:
    // ler um FIFO sem escritor bloquearia a leitura para sempre, e um diretorio estoura no
    // `read`. A recusa e o aviso honesto na tela — o `store` ve o lancamento, para de dizer
    // "carregando o progresso" e passa a nao gravar por cima do que nao conseguimos ler.
    if (!informacao.isFile()) {
      throw new Error('não consegui ler o progresso guardado (o caminho não é um arquivo comum)')
    }
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

/**
 * O texto que vai para o disco, com o teto conferido nos BYTES dele.
 *
 * As duas portas que ESCREVEM um progresso (guardar e exportar) passam por aqui, e por isso as
 * duas recusam o mesmo tamanho com a mesma mensagem. O `espaco` e o que separa as duas: o
 * arquivo guardado sai compacto e o exportado sai indentado, porque o exportado e para uma pessoa
 * ler e para importar em qualquer das duas vias (o navegador tambem exporta indentado).
 *
 * A conferencia e sobre o texto que REALMENTE vai para o disco, e nao sobre uma versao compacta
 * dele: o indentado e maior, entao medir o compacto deixaria sair um arquivo acima do teto — o
 * mesmo defeito, um passo adiante.
 */
export function serializarConferido(valor: unknown, espaco?: number): string {
  const texto = JSON.stringify(valor, null, espaco)
  if (typeof texto !== 'string') throw new Error('progresso invalido')
  if (Buffer.byteLength(texto, 'utf8') > TETO_BYTES) throw new Error(MENSAGEM_GRANDE)
  return texto
}

/**
 * Abre um temporario NOVO para esta gravacao, ao lado do alvo (o `rename` tem de ser no mesmo
 * sistema de arquivos), com nome imprevisivel.
 *
 * Duas travas no nome: o sufixo aleatorio tira o alvo previsivel que um symlink plantado usaria,
 * e as flags de `FLAGS_TEMPORARIO` fazem a criacao falhar em vez de seguir o que estiver la. Se
 * ainda assim houver colisao (EEXIST — ou um arquivo nosso de uma queda anterior), tenta de novo
 * com outro nome: o erro de um nome nao pode virar "nao consegui gravar o progresso".
 */
function abrirTemporario(caminho: string): { descritor: number; temporario: string } {
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    const temporario = `${caminho}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`
    try {
      return { descritor: openSync(temporario, FLAGS_TEMPORARIO, 0o600), temporario }
    } catch (erro) {
      if (codigoDe(erro) !== 'EEXIST') throw erro
    }
  }
  throw new Error('não consegui abrir um arquivo temporário para gravar o progresso')
}

export async function gravarProgresso(valor: unknown): Promise<void> {
  // Mesmo teto e mesma mensagem do exportar (ver `serializarConferido`).
  const texto = serializarConferido(valor)
  const caminho = caminhoDoProgresso()
  await fs.mkdir(path.dirname(caminho), { recursive: true })
  // Um temporario por gravacao, com nome imprevisivel: duas gravacoes sobrepostas nao disputam
  // o mesmo, e um symlink plantado com o nome esperado nao e seguido.
  const { descritor, temporario } = abrirTemporario(caminho)
  try {
    // A gravar e sincrona de proposito. O arquivo tem no maximo 1 MB, e a versao
    // assincrona deixava a ultima acao em risco se a janela fechasse logo depois do clique.
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
 *
 * A abertura leva `O_NONBLOCK` pelo mesmo motivo da leitura do progresso guardado: e o `open` de
 * um FIFO sem escritor que pendura, e ele acontecia ANTES do `fstat` que recusa FIFO. O `fstat`
 * so podia recusar o que a abertura tivesse deixado passar.
 */
export async function lerImportado(caminho: string): Promise<ResultadoDeLeitura> {
  let arquivo: fs.FileHandle
  try {
    arquivo = await fs.open(caminho, FLAGS_LEITURA)
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
