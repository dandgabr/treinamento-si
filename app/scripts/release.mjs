#!/usr/bin/env node
/**
 * Release versionada com soma de verificacao.
 *
 * O `npm run distribuir` empacota, mas nao publica nada: o arquivo sai em `instalador/` e
 * quem baixa nao tem como conferir se o que chegou e o que foi empacotado. Este script
 * fecha esse passo — exige a arvore limpa e o `npm run verificar` verde, empacota para o
 * sistema em que esta rodando e grava, ao lado do artefato, um `.sha256` no formato que o
 * `sha256sum -c` le.
 *
 * A versao sai de `package.json` e de lugar nenhum mais. Nome do artefato, arquivo de soma
 * e versao tem de concordar, e o script confere os tres depois de gravar: um release que
 * gera `Roadmap CISO-0.1.0.AppImage` com um checksum apontando para outro nome e pior que
 * nao ter checksum, porque da a confianca de uma conferencia que nao aconteceu.
 *
 * O script prefere recusar a publicar. Arvore suja, portao vermelho e artefato de mesmo
 * nome ja no disco sao recusas com mensagem dizendo o que fazer — empacotar por cima
 * apagaria, em silencio, a unica copia conferivel da release anterior.
 *
 * Uso: npm run release
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const RAIZ = path.resolve(APP, '..')
const SAIDA = path.join(APP, 'instalador')
const PACKAGE = path.join(APP, 'package.json')

/**
 * O que o electron-builder deixa na pasta de saida e nao e entrega: o `builder-debug.yml`
 * (recorte da configuracao usada) e qualquer `.yml` de canal de atualizacao. Ficam fora da
 * conta, senao "todo artefato novo" incluiria um arquivo que nao tem versao no nome.
 */
const EXTENSOES_DE_ENTREGA = [
  '.AppImage',
  '.exe',
  '.dmg',
  '.zip',
  '.deb',
  '.rpm',
  '.snap',
  '.msi',
  '.pkg',
  '.tar.gz',
]

/** Sai com 1 e explica o que fazer. Toda recusa daqui passa por aqui. */
function recusar(titulo, linhas) {
  console.error(`\nrelease recusado: ${titulo}`)
  for (const linha of linhas) console.error(linha ? `  ${linha}` : '')
  console.error('')
  process.exit(1)
}

/** `git` na raiz do repositorio: a arvore limpa e um fato do repositorio, nao de `app/`. */
function git(args) {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8' })
  } catch (erro) {
    recusar('nao foi possivel ler o estado do repositorio', [
      `git ${args.join(' ')} falhou em ${RAIZ}`,
      String(erro.message ?? erro).split('\n')[0],
    ])
  }
}

/** A versao: fonte unica, e o formato e conferido aqui para o nome do artefato ser previsivel. */
function lerVersao() {
  let pkg
  try {
    pkg = JSON.parse(fs.readFileSync(PACKAGE, 'utf8'))
  } catch (erro) {
    recusar('app/package.json nao pode ser lido', [String(erro.message ?? erro)])
  }
  const versao = pkg.version
  if (typeof versao !== 'string' || !/^\d+\.\d+\.\d+$/.test(versao)) {
    recusar('a versao em app/package.json nao esta no formato x.y.z', [
      `valor lido: ${JSON.stringify(versao)}`,
      'O nome do artefato e o arquivo de soma saem deste campo, entao ele precisa ser simples.',
    ])
  }
  return versao
}

/** Linhas de `git status --porcelain`: modificado, encenado ou nao rastreado — qualquer uma conta. */
function pendencias() {
  return git(['status', '--porcelain'])
    .split('\n')
    .filter((linha) => linha.trim() !== '')
}

function conferirArvoreLimpa(momento) {
  const sujas = pendencias()
  if (!sujas.length) return
  const linhas = [
    `A release tem de sair de um commit (${momento}): o artefato nao pode conter alteracao`,
    'que ninguem revisou nem gravou no historico.',
    '',
    'Pendente agora:',
    ...sujas.slice(0, 20),
  ]
  if (sujas.length > 20) linhas.push(`... e mais ${sujas.length - 20} linha(s)`)
  linhas.push('', 'O que fazer: commite (ou guarde fora do repositorio) e rode de novo.')
  recusar('a arvore nao esta limpa', linhas)
}

/**
 * Arquivos que o empacotamento entrega, com o tamanho e a data para a mensagem de recusa.
 *
 * O filtro e "o nome tem a versao", e nao a lista de extensoes de entrega: um `.zsync` ou um
 * `.blockmap` publicado ao lado tambem so existem porque a versao saiu. O que sai da lista e
 * o proprio arquivo de soma — ele tem a versao no nome, mas nao e artefato, e lista-lo fazia
 * a recusa dizer que a soma estava "sem soma ao lado".
 */
function artefatosDaVersao() {
  if (!fs.existsSync(SAIDA)) return []
  return fs
    .readdirSync(SAIDA, { withFileTypes: true })
    .filter(
      (entrada) =>
        entrada.isFile() && entrada.name.includes(versao) && !entrada.name.endsWith('.sha256'),
    )
    .map((entrada) => {
      const caminho = path.join(SAIDA, entrada.name)
      const dados = fs.statSync(caminho)
      return { nome: entrada.name, caminho, tamanho: dados.size, quando: dados.mtime }
    })
    .sort((a, b) => a.nome.localeCompare(b.nome))
}

/**
 * Recusa antes de empacotar: com um artefato da mesma versao no disco, o `distribuir` o
 * substituiria em silencio e a soma publicada antes deixaria de valer para o que esta la.
 */
function conferirArtefatoInexistente() {
  const existentes = artefatosDaVersao()
  if (!existentes.length) return
  const publicados = existentes.filter((a) => fs.existsSync(`${a.caminho}.sha256`))
  const linhas = [`Ja existe nesta pasta artefato da versao ${versao}:`, '']
  for (const artefato of existentes) {
    const publicada = fs.existsSync(`${artefato.caminho}.sha256`)
    linhas.push(
      `${path.relative(RAIZ, artefato.caminho)} — ${artefato.tamanho} bytes, empacotado em ` +
        `${artefato.quando.toISOString()}${publicada ? ' — com soma ao lado (release publicada)' : ' — sem soma ao lado (pacote de teste)'}`,
    )
  }
  linhas.push('', 'O que fazer:')
  if (publicados.length) {
    linhas.push(
      `- a versao ${versao} ja foi publicada: suba a versao em app/package.json. A mesma versao`,
      '  nao se publica duas vezes — o nome do arquivo e o endereco do release.',
    )
  }
  linhas.push(
    '- se o que esta la e pacote de teste, mova para fora de instalador/ (ou apague) e rode de novo;',
    '- o script nao sobrescreve nada em silencio: empacotar por cima apagaria a unica copia',
    '  conferivel que existe da release anterior.',
  )
  recusar('o artefato desta versao ja existe', linhas)
}

/** Marca de cada arquivo da pasta de saida, para descobrir depois o que este run produziu. */
function instantaneo() {
  const marca = new Map()
  if (!fs.existsSync(SAIDA)) return marca
  for (const entrada of fs.readdirSync(SAIDA, { withFileTypes: true })) {
    if (!entrada.isFile()) continue
    const dados = fs.statSync(path.join(SAIDA, entrada.name))
    marca.set(entrada.name, `${dados.size}:${dados.mtimeMs}`)
  }
  return marca
}

/** Novos ou reescritos entre dois instantaneos, so os formatos de entrega. */
function artefatosNovos(antes) {
  const agora = instantaneo()
  return [...agora.entries()]
    .filter(([nome, marcaAtual]) => {
      if (antes.get(nome) === marcaAtual) return false
      return EXTENSOES_DE_ENTREGA.some((extensao) => nome.endsWith(extensao))
    })
    .map(([nome]) => nome)
    .sort()
}

/** SHA-256 lido em blocos: o AppImage passa de 100 MB e nao precisa inteiro na memoria. */
async function somar(caminho) {
  const hash = createHash('sha256')
  for await (const bloco of fs.createReadStream(caminho)) hash.update(bloco)
  return hash.digest('hex')
}

/**
 * Grava a soma no formato do `sha256sum`: `"<hash><dois espacos><nome>"`. A versao e o
 * tamanho vao em linhas de comentario (`#`), que o `sha256sum -c` ignora — o formato nao
 * comporta um terceiro campo: nele, tudo depois dos dois espacos e o nome do arquivo, e uma
 * coluna a mais faz a conferencia procurar um arquivo com o tamanho colado no nome.
 */
function escreverSoma({ caminho, nome, tamanho, hash, quando }) {
  const arquivo = `${caminho}.sha256`
  const texto = [
    `# release ${versao} — Roadmap CISO`,
    `# arquivo: ${nome}`,
    `# tamanho: ${tamanho} bytes`,
    `# gerado em: ${quando}`,
    `# confira com: sha256sum -c "${path.basename(arquivo)}"`,
    `${hash}  ${nome}`,
    '',
  ].join('\n')
  fs.writeFileSync(arquivo, texto, 'utf8')
  return arquivo
}

/** Le de volta o que foi gravado: a conferencia e do resultado, nao da intencao. */
function lerSoma(arquivo) {
  const conteudo = fs.readFileSync(arquivo, 'utf8')
  const linhas = conteudo.split('\n').filter((l) => l.trim() !== '' && !l.startsWith('#'))
  if (linhas.length !== 1) return { erro: `esperava uma linha de soma, achei ${linhas.length}` }
  // O nome pode ter espacos ("Roadmap CISO-0.1.0.AppImage"), entao ele e tudo o que vem
  // depois dos dois espacos que separam o resumo.
  const casa = /^([0-9a-f]{64}) {2}(.+)$/.exec(linhas[0])
  if (!casa) return { erro: `linha de soma fora do formato do sha256sum: ${linhas[0]}` }
  const comentarioTamanho = /^# tamanho: (\d+) bytes$/m.exec(conteudo)
  return {
    hash: casa[1],
    nome: casa[2],
    tamanho: comentarioTamanho ? Number(comentarioTamanho[1]) : null,
  }
}

/**
 * Confere que nome do artefato, arquivo de soma e versao concordam. E o ultimo portao antes
 * de dizer "release pronto": se falhar, o artefato continua no disco mas ninguem foi
 * avisado de que ele esta publicavel — que e o estado seguro.
 */
function conferirConcordancia(artefato, arquivoSoma, hash, tamanho) {
  const lido = lerSoma(arquivoSoma)
  const problemas = []
  if (lido.erro) problemas.push(lido.erro)
  else {
    if (lido.nome !== path.basename(artefato)) {
      problemas.push(`a soma aponta para "${lido.nome}", nao para "${path.basename(artefato)}"`)
    }
    if (lido.hash !== hash) problemas.push(`a soma guardou ${lido.hash}, e o arquivo tem ${hash}`)
    if (lido.tamanho !== tamanho) {
      problemas.push(`a soma diz ${lido.tamanho} bytes, e o arquivo tem ${tamanho}`)
    }
  }
  if (!path.basename(artefato).includes(versao)) {
    problemas.push(`o nome do artefato nao traz a versao ${versao} do package.json`)
  }
  if (!fs.readFileSync(arquivoSoma, 'utf8').includes(versao)) {
    problemas.push(`a soma nao registra a versao ${versao}`)
  }
  if (!problemas.length) return
  recusar('o nome, a soma e a versao nao concordam', [
    `artefato: ${path.relative(RAIZ, artefato)}`,
    `soma: ${path.relative(RAIZ, arquivoSoma)}`,
    '',
    ...problemas,
    '',
    'Nao publique: um checksum que aponta para outro nome da uma conferencia falsa.',
    'Apague o arquivo de soma e investigue o empacotamento antes de tentar de novo.',
  ])
}

/** O portao do dia a dia, com a saida inteira na tela: quem espera ve onde travou. */
function rodarNpm(args, aoFalhar) {
  console.log(`\n$ npm ${args.join(' ')}`)
  try {
    execFileSync('npm', args, { cwd: APP, stdio: 'inherit' })
  } catch {
    recusar(aoFalhar.titulo, aoFalhar.linhas)
  }
}

const versao = lerVersao()

// A ordem dos portoes e do mais barato para o mais caro: recusar em segundos e melhor que
// recusar depois de quase tres minutos de verificacao.
conferirArvoreLimpa('antes de verificar')
conferirArtefatoInexistente()

rodarNpm(['run', 'verificar'], {
  titulo: 'o `npm run verificar` reprovou',
  linhas: [
    'A release nao publica codigo que nao passa no proprio portao.',
    'O que fazer: conserte o que a saida acima aponta e rode de novo.',
  ],
})

// O `verificar` gera conteudo derivado, e o banco de questoes e versionado de proposito (o
// campo `status` carrega a revisao humana). Se ele saiu diferente do que esta commitado, o
// pacote carregaria material que ninguem gravou — e o proximo clone nao reproduziria.
conferirArvoreLimpa('depois de verificar')

const antesDeEmpacotar = instantaneo()

rodarNpm(['run', 'distribuir'], {
  titulo: 'o empacotamento falhou',
  linhas: [
    `O electron-builder nao terminou. A pasta de saida e ${path.relative(RAIZ, SAIDA)}.`,
    'O que fazer: veja o erro acima. Faltando `wine` (para o Windows) ou um Mac (para o',
    '.dmg), o alvo e o limite da maquina, nao do codigo — a secao Publicacao do README',
    'diz o que cada alvo exige.',
  ],
})

const novos = artefatosNovos(antesDeEmpacotar)
if (!novos.length) {
  recusar('o empacotamento nao produziu artefato novo', [
    `Nada de entrega apareceu ou mudou em ${path.relative(RAIZ, SAIDA)},`,
    'entao nao ha o que somar. O que fazer: confira os alvos do electron-builder.yml.',
  ])
}

// Terceira conferencia, e nao repeticao das outras: o `distribuir` recompila a partir de
// `src/`, entao ele empacota codigo que a verificacao anterior nao viu se a arvore mudou no
// meio. Sem esta linha, outro processo editando o repositorio durante a release produziria
// um artefato conferivel — com soma e tudo — feito de codigo que nunca passou no portao.
// A recusa vem antes de existir soma: o pacote fica no disco sem marcador de publicado.
conferirArvoreLimpa('depois de empacotar')

const quando = new Date().toISOString()
const linhas = [`\nrelease ${versao}`]
for (const nome of novos) {
  const caminho = path.join(SAIDA, nome)
  const tamanho = fs.statSync(caminho).size
  const hash = await somar(caminho)
  const arquivoSoma = escreverSoma({ caminho, nome, tamanho, hash, quando })
  conferirConcordancia(caminho, arquivoSoma, hash, tamanho)
  linhas.push(
    `  artefato  ${path.relative(RAIZ, caminho)}`,
    `  tamanho   ${tamanho} bytes (${(tamanho / 1024 / 1024).toFixed(1)} MiB)`,
    `  sha256    ${hash}`,
    `  soma      ${path.relative(RAIZ, arquivoSoma)}`,
    `  confira   sha256sum -c "${path.basename(arquivoSoma)}"  (com o artefato ao lado)`,
  )
}
linhas.push(
  '',
  'O par (artefato, soma) e o que se publica. `app/instalador/` esta no .gitignore: os dois',
  'viajam como anexo da release, e nao como commit — refazer o pacote muda o hash.',
)
console.log(linhas.join('\n'))
