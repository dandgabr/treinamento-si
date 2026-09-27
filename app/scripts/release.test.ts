// Os guardas do `release.mjs` so rodavam na vida real: arvore suja, `npm run verificar`
// vermelho e artefato da versao ja no disco eram caminhos sem teste nenhum, e tres deles
// dependiam de estado do repositorio (commits, versao publicada) ou de quase tres minutos de
// empacotamento.
//
// Aqui eles sao provocados com um `git` e um `npm` FALSOS no PATH: nada e empacotado, o
// repositorio nao e tocado, e o script e copiado para um `app/` de mentira — ele tira a pasta
// do projeto da propria localizacao, entao roda inteiro contra o temporario.
//
// O `npm` falso tambem cria o artefato do `distribuir`, e com isso o caminho de sucesso fica
// coberto: o par (artefato, `.sha256`) que o release publica e conferido no fim como qualquer
// um conferiria, fora do script.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

const VERSION = '0.1.0'
const ARTEFATO = `Roadmap CISO-${VERSION}.AppImage`

/**
 * `git` de mentira: o release so le `status --porcelain`, e quem responde e o ambiente. Com
 * `RELEASE_GIT_STATUS` vazio nao ha pendencia nenhuma, que e a arvore limpa que os portoes
 * exigem para chegar adiante.
 */
const GIT_FALSO = [
  '#!/bin/sh',
  'echo "git $*" >> "$RELEASE_LOG"',
  'printf \'%s\' "$RELEASE_GIT_STATUS"',
  '',
].join('\n')

/** `npm` de mentira: registra a chamada, (des)aprova o `verificar` e cria o artefato do `distribuir`. */
const NPM_FALSO = [
  '#!/bin/sh',
  'echo "npm $*" >> "$RELEASE_LOG"',
  'case "$1 $2" in',
  '  "run verificar") exit "${RELEASE_VERIFICAR:-0}" ;;',
  '  "run distribuir")',
  '    if [ -n "$RELEASE_ARTEFATO" ]; then',
  '      printf \'%s\' "appimage de mentira" > "$PWD/instalador/$RELEASE_ARTEFATO"',
  '    fi',
  '    exit "${RELEASE_DISTRIBUIR:-0}" ;;',
  'esac',
  'exit 0',
  '',
].join('\n')

/**
 * A mutacao do ultimo teste, injetada por `--import`: ela grava um byte A MAIS no artefato no
 * instante em que o `.sha256` e escrito — o que outro processo faria entre a soma e a
 * conferencia. Sem reler o artefato, o release fecha o par com o resumo que tinha na memoria e
 * anuncia "publicado" para um arquivo que ja nao e aquele.
 */
const MUTACAO = [
  "import fs from 'node:fs'",
  'const escrever = fs.writeFileSync.bind(fs)',
  'fs.writeFileSync = function (destino, ...resto) {',
  '  const resultado = escrever(destino, ...resto)',
  "  if (typeof destino === 'string' && destino.endsWith('.sha256')) {",
  "    escrever(destino.slice(0, -'.sha256'.length), 'byte-a-mais', { flag: 'a' })",
  '  }',
  '  return resultado',
  '}',
  '',
].join('\n')

const temporarios: string[] = []

afterEach(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

interface Cenario {
  raiz: string
  instalador: string
  log: string
}

function escrever(caminho: string, texto: string, modo?: number): void {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, texto, modo === undefined ? {} : { mode: modo })
}

function novoCenario(): Cenario {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-release-'))
  temporarios.push(raiz)

  escrever(
    path.join(raiz, 'scripts/release.mjs'),
    fs.readFileSync(path.join(AQUI, 'release.mjs'), 'utf8'),
  )
  escrever(path.join(raiz, 'package.json'), `${JSON.stringify({ name: 'pacote-de-teste', version: VERSION })}\n`)
  fs.mkdirSync(path.join(raiz, 'instalador'), { recursive: true })
  escrever(path.join(raiz, 'bin/git'), GIT_FALSO, 0o755)
  escrever(path.join(raiz, 'bin/npm'), NPM_FALSO, 0o755)

  return { raiz, instalador: path.join(raiz, 'instalador'), log: path.join(raiz, 'chamadas.log') }
}

interface Execucao {
  status: number
  saida: string
}

/** Roda o release com os dois falsos na frente do PATH; o resto do ambiente fica intacto. */
function rodar(cenario: Cenario, env: Record<string, string> = {}, argsAntes: string[] = []): Execucao {
  const r = spawnSync(process.execPath, [...argsAntes, path.join(cenario.raiz, 'scripts/release.mjs')], {
    cwd: cenario.raiz,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: `${path.join(cenario.raiz, 'bin')}:${process.env.PATH ?? ''}`,
      RELEASE_LOG: cenario.log,
      RELEASE_GIT_STATUS: '',
      RELEASE_VERIFICAR: '0',
      ...env,
    },
  })
  return { status: r.status ?? -1, saida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** O que o release pediu ao `git` e ao `npm`, na ordem — o que prova em que ponto ele parou. */
function chamadas(cenario: Cenario): string[] {
  if (!fs.existsSync(cenario.log)) return []
  return fs
    .readFileSync(cenario.log, 'utf8')
    .split('\n')
    .filter((linha) => linha.trim() !== '')
}

describe('release: os guardas que recusam antes de publicar', () => {
  it('recusa a arvore suja antes de verificar, e nao chama o npm', () => {
    const c = novoCenario()

    const r = rodar(c, { RELEASE_GIT_STATUS: ' M app/src/application/extrair-trilha.ts\n?? app/src/novo.ts\n' })

    expect(r.status).toBe(1)
    expect(r.saida).toContain('release recusado: a arvore nao esta limpa')
    expect(r.saida).toContain(' M app/src/application/extrair-trilha.ts')
    expect(chamadas(c)).toEqual(['git status --porcelain'])
  })

  it('recusa quando o verificar reprova, dizendo que o portao e do dia a dia', () => {
    const c = novoCenario()

    const r = rodar(c, { RELEASE_VERIFICAR: '1' })

    expect(r.status).toBe(1)
    expect(r.saida).toContain('release recusado: o `npm run verificar` reprovou')
    expect(r.saida).toContain('A release nao publica codigo que nao passa no proprio portao.')
    // A arvore foi conferida e o portao rodou: a recusa veio do `verificar`, e nao de outro
    // guarda antes dele.
    expect(chamadas(c)).toEqual(['git status --porcelain', 'npm run verificar'])
  })

  it('recusa pacote de teste e release publicada, com o caminho do que esta no disco', () => {
    const teste = novoCenario()
    escrever(path.join(teste.instalador, ARTEFATO), 'pacote de teste')

    const semSoma = rodar(teste)

    expect(semSoma.status).toBe(1)
    expect(semSoma.saida).toContain('release recusado: o artefato desta versao ja existe')
    expect(semSoma.saida).toContain(`instalador/${ARTEFATO}`)
    expect(semSoma.saida).toContain('sem soma ao lado (pacote de teste)')
    expect(semSoma.saida).toContain('mova para fora de instalador/')
    expect(chamadas(teste)).toEqual(['git status --porcelain'])

    // O caso que a mensagem separa: a soma ao lado diz que aquela versao ja foi publicada, e
    // a saida e subir a versao — a mesma versao nao se publica duas vezes.
    const publicada = novoCenario()
    escrever(path.join(publicada.instalador, ARTEFATO), 'release anterior')
    escrever(path.join(publicada.instalador, `${ARTEFATO}.sha256`), 'resumo da release anterior\n')

    const comSoma = rodar(publicada)

    expect(comSoma.status).toBe(1)
    expect(comSoma.saida).toContain(`a versao ${VERSION} ja foi publicada`)
    expect(comSoma.saida).toContain('com soma ao lado (release publicada)')
  })

  it('recusa quando o empacotamento nao produz artefato novo', () => {
    const c = novoCenario()

    // O `npm` falso roda o `distribuir` e nao cria nada: sem artefato novo nao ha o que somar.
    const r = rodar(c)

    expect(r.status).toBe(1)
    expect(r.saida).toContain('release recusado: o empacotamento nao produziu artefato novo')
    // O terceiro `git` nao aconteceu: a recusa do artefato vem antes dele.
    expect(chamadas(c)).toEqual([
      'git status --porcelain',
      'npm run verificar',
      'git status --porcelain',
      'npm run distribuir',
    ])
  })
})

describe('release: o par (artefato, soma) que sai publicado', () => {
  it('grava a soma no formato do sha256sum e ela fecha com o arquivo', () => {
    const c = novoCenario()

    const r = rodar(c, { RELEASE_ARTEFATO: ARTEFATO })

    expect(r.status).toBe(0)
    expect(r.saida).toContain(`release ${VERSION}`)
    expect(r.saida).toContain(`sha256sum -c "${ARTEFATO}.sha256"`)
    const artefato = path.join(c.instalador, ARTEFATO)
    const texto = fs.readFileSync(`${artefato}.sha256`, 'utf8')
    const linha = texto.split('\n').find((l) => l !== '' && !l.startsWith('#')) ?? ''
    // O formato do `sha256sum`: 64 hexadecimais, dois espacos e o nome — com espaco no nome,
    // que e o que impede o comentario de virar um terceiro campo.
    expect(linha).toMatch(/^[0-9a-f]{64} {2}Roadmap CISO-0\.1\.0\.AppImage$/)
    expect(linha.startsWith(createHash('sha256').update(fs.readFileSync(artefato)).digest('hex'))).toBe(true)
    // E o relatorio anuncia o que esta no disco, nao o que o processo somou de memoria.
    expect(r.saida).toContain(`tamanho   ${fs.statSync(artefato).size} bytes`)
  })

  it.skipIf(!fs.existsSync('/usr/bin/sha256sum'))(
    'a soma passa na conferencia do proprio sha256sum',
    () => {
      const c = novoCenario()
      expect(rodar(c, { RELEASE_ARTEFATO: ARTEFATO }).status).toBe(0)

      // O comando que o relatorio manda a pessoa rodar, rodado de verdade: e ele que le o
      // arquivo com o artefato ao lado.
      const r = spawnSync('sha256sum', ['-c', `${ARTEFATO}.sha256`], { cwd: c.instalador, encoding: 'utf8' })

      expect(r.status).toBe(0)
      // O rotulo final muda com o idioma do `sha256sum` ("OK" ou "SUCESSO"); o que importa e
      // ele ter conferido ESTE arquivo, pelo nome.
      expect(r.stdout).toMatch(new RegExp(`^${ARTEFATO.replace('.', '\\.')}: `, 'm'))
    },
  )

  it('recusa quando o artefato muda entre a soma e a releitura', () => {
    const c = novoCenario()
    const mutacao = path.join(c.raiz, 'mutacao.mjs')
    escrever(mutacao, MUTACAO)

    const r = rodar(c, { RELEASE_ARTEFATO: ARTEFATO }, ['--import', mutacao])

    expect(r.status).toBe(1)
    expect(r.saida).toContain('release recusado: o nome, a soma e a versao nao concordam')
    // Os dois lados do par, medidos: o resumo guardou o tamanho de antes, e o arquivo no disco
    // tem um byte a mais. Com a conferencia feita so em memoria, o par fecharia e o release
    // anunciaria "publicado" para um arquivo que ja nao e o somado.
    const artefato = path.join(c.instalador, ARTEFATO)
    const guardado = /^# tamanho: (\d+) bytes$/m.exec(fs.readFileSync(`${artefato}.sha256`, 'utf8'))?.[1]
    if (guardado === undefined) throw new Error('a soma nao registrou o tamanho do artefato')
    expect(fs.statSync(artefato).size - Number(guardado)).toBe(Buffer.byteLength('byte-a-mais'))
    // E nada de relatorio de publicacao: o `artefato  <caminho>` so sai depois da conferencia.
    expect(r.saida).not.toContain('artefato  ')
  })
})
