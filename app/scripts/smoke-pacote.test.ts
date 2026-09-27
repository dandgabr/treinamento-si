// O smoke do pacote media duas coisas erradas, e as duas so aparecem EMPACOTANDO: por isso o
// teste monta um `app/` de mentira — `smoke-pacote.mjs` tira a pasta do projeto da propria
// localizacao — com um `app.asar` de verdade (o mesmo `@electron/asar` que o smoke usa) e roda
// o script contra ele, como `npm run smoke:pacote` roda.
//
// Nenhum cenario aqui abre o Electron: os que interessam param no portao de frescor ou no
// `.desktop`, antes de `abrirApp`. A copia do script e dos `lib/` para o temporario e o symlink
// para o `node_modules` do projeto existem pelo mesmo motivo: o modulo resolve tudo a partir do
// proprio arquivo, entao a copia roda contra o temporario e nao contra o repositorio.

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPackage } from '@electron/asar'
import { afterEach, describe, expect, it } from 'vitest'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const NODE_MODULES = path.join(APP, 'node_modules')

/** Meia-noite de um dia fixo: o portao compara datas, e aqui a data e escolhida, nao esperada. */
const BASE = Date.parse('2026-01-01T00:00:00.000Z')

/** O que entra no asar. `dist/`, `dist/Roadmap-CISO-Interativo/` e `build/` ficam de fora. */
const FONTES_DO_PACOTE = [
  'dist-desktop/index.html',
  'dist-desktop/conteudo.json',
  'dist-electron/main.cjs',
  'package.json',
]

/** Fora do asar: reescritos por outros comandos, e nada dizem sobre o pacote. */
const FORA_DO_PACOTE = [
  'dist/index.html',
  'dist/Roadmap-CISO-Interativo/index.html',
  'build/icone.png',
]

const temporarios: string[] = []

afterEach(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

interface Cenario {
  raiz: string
  saida: string
  asar: string
  logDoAppImage: string
}

/** Data explicita: um `sleep` entre arquivos deixaria o teste lento e dependente do relogio. */
function datar(caminho: string, segundos: number): void {
  const quando = new Date(BASE + segundos * 1000)
  fs.utimesSync(caminho, quando, quando)
}

function escrever(caminho: string, texto: string): void {
  fs.mkdirSync(path.dirname(caminho), { recursive: true })
  fs.writeFileSync(caminho, texto)
}

/** Um `app/` de mentira: o script copiado, as fontes na arvore e o asar no `instalador/`. */
async function novoCenario(): Promise<Cenario> {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-smoke-pacote-'))
  temporarios.push(raiz)

  for (const arquivo of ['smoke-pacote.mjs', 'lib/binario.mjs', 'lib/frescor.mjs', 'lib/app-empacotado.mjs']) {
    const destino = path.join(raiz, 'scripts', arquivo)
    fs.mkdirSync(path.dirname(destino), { recursive: true })
    fs.copyFileSync(path.join(AQUI, arquivo), destino)
  }
  fs.symlinkSync(NODE_MODULES, path.join(raiz, 'node_modules'), 'dir')

  for (const relativo of [...FONTES_DO_PACOTE, ...FORA_DO_PACOTE]) {
    escrever(path.join(raiz, relativo), `conteudo de ${relativo}`)
  }
  escrever(path.join(raiz, 'package.json'), '{"name":"pacote-de-teste","version":"0.1.0"}')

  // O asar, com as mesmas entradas de primeiro nivel do pacote real.
  const fonte = path.join(raiz, 'fonte-do-asar')
  for (const relativo of FONTES_DO_PACOTE) {
    escrever(path.join(fonte, relativo), `copia de ${relativo} dentro do asar`)
  }
  const asar = path.join(raiz, 'instalador/linux-unpacked/resources/app.asar')
  fs.mkdirSync(path.dirname(asar), { recursive: true })
  await createPackage(fonte, asar)

  // O "binario" do pacote: os cenarios daqui param antes de `abrirApp`, entao basta existir,
  // ser o maior executavel da pasta (e esse o criterio do `binarioEm`) e sair na hora.
  fs.writeFileSync(path.join(raiz, 'instalador/linux-unpacked/roadmap-ciso-app'), '#!/bin/sh\nexit 7\n', {
    mode: 0o755,
  })

  return {
    raiz,
    saida: path.join(raiz, 'instalador'),
    asar,
    logDoAppImage: path.join(raiz, 'appimage.log'),
  }
}

interface Execucao {
  status: number
  saida: string
}

/** Roda o script como o `npm run smoke:pacote` roda: `node scripts/smoke-pacote.mjs`, cwd na raiz. */
function rodar(cenario: Cenario): Execucao {
  const r = spawnSync(process.execPath, [path.join(cenario.raiz, 'scripts', 'smoke-pacote.mjs')], {
    cwd: cenario.raiz,
    encoding: 'utf8',
    env: { ...process.env, ROADMAP_LOG_APPIMAGE: cenario.logDoAppImage },
  })
  return { status: r.status ?? -1, saida: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** A linha que o `conferir` do smoke imprime — conferida pelo rotulo, e nao por um trecho. */
function linhaOk(nome: string, valor: unknown): string {
  return `OK    ${nome} = ${JSON.stringify(valor)}`
}

function linhaFalha(nome: string, valor: unknown): string {
  return `FALHA ${nome} = ${JSON.stringify(valor)}`
}

/** Os nomes que o portao de frescor acusou — o que o smoke diz ser mais novo que o pacote. */
function atrasados(saida: string): string[] {
  const rotulo = 'Mais novo que ele, ou faltando na arvore:'
  const linha = saida.split('\n').find((l) => l.startsWith(rotulo)) ?? ''
  return linha
    .replace(rotulo, '')
    .split(',')
    .map((nome) => nome.trim())
    .filter(Boolean)
}

function datarFontes(cenario: Cenario, segundos: number): void {
  for (const relativo of FONTES_DO_PACOTE) {
    datar(path.join(cenario.raiz, relativo), segundos)
  }
}

describe('portao de frescor: a lista de fontes sai do que esta DENTRO do asar', () => {
  it('recusa um pacote mais velho que o dist-desktop/ que ele mesmo carrega', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    datarFontes(c, -600)
    // `dist-desktop/index.html` entra no asar: se ele e mais novo, o app que a pessoa recebe
    // carrega um HTML que o build daqui ja substituiu. A lista antiga nao olhava para ele.
    datar(path.join(c.raiz, 'dist-desktop/index.html'), 600)

    const r = rodar(c)

    expect(r.status).toBe(1)
    expect(atrasados(r.saida)).toEqual(['dist-desktop/index.html'])
  })

  it('nao recusa um pacote em dia so porque dist/ ou build/ ficaram mais novos', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    // Nenhum destes entra no asar. Sao reescritos por outros comandos (`npm run build`,
    // `npm run empacotar`) e acusa-los reprovava, no CI, um pacote perfeitamente atual.
    for (const relativo of FORA_DO_PACOTE) {
      datar(path.join(c.raiz, relativo), 3600)
    }
    datarFontes(c, -600)

    const r = rodar(c)

    expect(r.saida).not.toContain('Artefato desatualizado')
    // E seguiu para as conferencias do pacote: o portao abriu, o resto do smoke rodou.
    expect(r.saida).toContain(linhaOk('app.asar existe', true))
  })

  it('acusa a fonte que o asar carrega e esta arvore nao tem', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    datarFontes(c, -600)
    fs.rmSync(path.join(c.raiz, 'dist-desktop'), { recursive: true })

    const r = rodar(c)

    expect(r.status).toBe(1)
    expect(atrasados(r.saida)).toEqual(['dist-desktop (esta no asar e nao esta na arvore)'])
  })
})

describe('o .desktop do AppImage', () => {
  /**
   * Um AppImage de mentira: o smoke chama `<appimage> --appimage-extract '*.desktop'` e le o
   * `.desktop` de dentro do `squashfs-root/`. Ele anota o proprio nome no log — e por ele que
   * o teste sabe QUAL dos arquivos foi de fato lido.
   */
  function escreverAppImage(cenario: Cenario, nome: string, exec: string, segundos: number): void {
    const caminho = path.join(cenario.saida, nome)
    fs.writeFileSync(
      caminho,
      [
        '#!/bin/sh',
        'printf \'%s\\n\' "$(basename "$0")" >> "$ROADMAP_LOG_APPIMAGE"',
        'mkdir -p squashfs-root',
        'cat > squashfs-root/roadmap-ciso.desktop <<FIM',
        '[Desktop Entry]',
        `Exec=${exec}`,
        'FIM',
        '',
      ].join('\n'),
      { mode: 0o755 },
    )
    datar(caminho, segundos)
  }

  it('le o AppImage mais novo, e nao o primeiro que a listagem do sistema devolve', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    datarFontes(c, -600)

    // Dois AppImages. A ordem da listagem do sistema de arquivos NAO e a da data, entao o
    // cenario se monta A PARTIR dela: o primeiro da listagem fica velho e com um `.desktop`
    // que pede depurador, e o segundo fica novo e correto. Assim "leu o primeiro que apareceu"
    // e "leu o mais novo" dao resultados diferentes — sem isso a conferencia passaria sem
    // provar nada, porque com um AppImage so as duas regras concordam.
    const nomes = ['Roadmap CISO-0.1.0.AppImage', 'Roadmap CISO-0.1.1-teste.AppImage']
    for (const nome of nomes) escreverAppImage(c, nome, 'AppRun %U', 0)
    const ordem = fs.readdirSync(c.saida).filter((nome) => nome.endsWith('.AppImage'))
    const primeiro = ordem[0]
    const segundo = ordem[1]
    if (!primeiro || !segundo) throw new Error(`o cenario precisa de dois AppImages, achou ${ordem.length}`)
    escreverAppImage(c, primeiro, 'AppRun --remote-debugging-port=9222 %U', -600)
    escreverAppImage(c, segundo, 'AppRun %U', 600)

    const r = rodar(c)

    // O log prova qual dos dois o smoke executou; as linhas provam o que ele leu de dentro.
    expect(fs.readFileSync(c.logDoAppImage, 'utf8').trim()).toBe(segundo)
    expect(r.saida).toContain(linhaOk('o AppImage traz um .desktop', true))
    expect(r.saida).toContain(linhaOk('.desktop traz Exec=AppRun', true))
    expect(r.saida).toContain(linhaOk('.desktop sem flag de depurador', false))
  })

  it('reprova quando nao ha AppImage para ler o .desktop', async () => {
    const c = await novoCenario()
    datar(c.asar, 0)
    datarFontes(c, -600)

    const r = rodar(c)

    // As quatro conferencias do `.desktop` moravam dentro de um `if` sem `else`: sem AppImage
    // na pasta — renomeado, apagado, ou um release que so gerou o `linux-unpacked/` — nenhuma
    // delas rodava e o smoke ainda saia dizendo "0 falhas".
    expect(r.status).toBe(1)
    expect(r.saida).toContain(linhaFalha('ha AppImage para ler o .desktop', false))
  })
})
