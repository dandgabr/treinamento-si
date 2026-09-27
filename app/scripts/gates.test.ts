// Os portoes rodando de verdade, contra uma copia com defeito plantado.
//
// Os ramos de REPROVACAO dos dois portoes nao tinham teste nenhum: nenhum arquivo `.test.*` citava
// `build-content`, `check-content` ou `check-questions`, e uma regressao que fizesse o portao sair
// 0 num erro atravessava a suite verde. Aqui o material real e copiado para um diretorio
// temporario, o defeito entra na COPIA (o repositorio nao e tocado) e os CLIs rodam como processo:
// o `status` e o veredito que o `npm run build` le, e a mensagem e a que o autor ve.
//
// O material real e usado, e nao um fixture pequeno, porque o portao cobra os totais do projeto
// (18/109/22): com um material menor, TODO caso reprovaria pelos totais e o defeito plantado nao
// seria medido.
//
// CUSTO — o que fazia a suite sair 1 sem falha de assercao:
//
// Cada portao le o material inteiro (markdown + DOMPurify), ~6 s de CPU nesta maquina, e o arquivo
// roda uns 17 deles. Enquanto o processo era esperado com `execFileSync`, o `describe.concurrent`
// nao valia nada: o laco de eventos do worker ficava bloqueado durante cada espera, entao os casos
// rodavam UM DE CADA VEZ e o RPC `onTaskUpdate` do worker estourava o proprio prazo (o worker nao
// respondia a chamada) — `9 passed` com `Errors 1` e `exit 1`. Aqui o processo e criado com `spawn`
// e a espera e assincrona: o worker fica livre, os casos paralelizam de verdade (16 nucleos; medido:
// 8 leituras do material em 9,8 s em paralelo contra ~50 s em serie) e o RPC responde sempre.
//
// As leituras tambem cairam para o minimo: a copia intacta serve para o caso de controle (os dois
// portoes rodam uma vez so, no `beforeAll`, e o caso assere o resultado deles) e para o
// `content.json` de linha de base — o artefato que a varredura de ARTEFATO confere em cada caso.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const APP = path.resolve(AQUI, '..')
const TSX = path.join(APP, 'node_modules', 'tsx', 'dist', 'cli.mjs')
/** O material do repositorio: e o dono dos 18/109/22 que o portao exige. */
const MATERIAL = path.resolve(APP, '..', 'conteudo')
/** O banco de questoes versionado, para o caso da fonte com esquema proibido. */
const QUESTOES = path.join(APP, 'src', 'content', 'questions')
/** Um tema qualquer: o caso planta o defeito no fim do arquivo, dentro da ultima secao. */
const TEMA = '01-fundamentos/TEMA-01-seguranca-informacao-cibernetica-privacidade.md'
/** A pagina de catalogo que o caso da contagem acrescenta (nome novo, sem link para ela). */
const PAGINA_NOVA = '99-fontes/catalogo-inventado.md'
/** A espera de cada caso: um portao passa dos 5 s da maquina parada, e ha varios em paralelo. */
const SOBRA = 120_000

const temporarios: string[] = []

afterAll(() => {
  for (const raiz of temporarios.splice(0)) {
    fs.rmSync(raiz, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
})

interface Caso {
  /** Diretorio do material (a copia). */
  material: string
  /** O content.json que os portoes leem e escrevem. */
  conteudo: string
}

/** Uma copia do material inteiro, com o content.json FORA dela (como no repositorio). */
function caso(): Caso {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'roadmap-portao-'))
  temporarios.push(raiz)
  const material = path.join(raiz, 'conteudo')
  // `dereference: true` e a guarda que impede a "copia" de ser o proprio material: o `cpSync`
  // preserva link por padrao, entao um `conteudo` que seja link (o que acontece quando outra
  // copia do app roda este arquivo de dentro de um diretorio onde `../conteudo` aponta para o
  // material) virava link na copia — e o defeito plantado era escrito ATRAVES dele, no material
  // do repositorio. Copia de verdade ou o caso nao vale nada.
  fs.cpSync(MATERIAL, material, { recursive: true, dereference: true })
  return { material, conteudo: path.join(raiz, 'content.json') }
}

function envDoCaso(c: Caso): Record<string, string> {
  return { ROADMAP_CONTENT_DIR: c.material, ROADMAP_CONTENT_FILE: c.conteudo }
}

interface Resultado {
  status: number
  saida: string
}

/**
 * Roda um CLI dos portoes e devolve o codigo de saida com as duas saidas juntas.
 *
 * `spawn` + promessa, e nao `execFileSync`: o processo filho roda enquanto o worker dorme, entao
 * os casos deste arquivo (que sao concorrentes) paralelizam e o worker continua respondendo ao
 * `onTaskUpdate`. As duas saidas vao para o mesmo texto porque a assercao de cada caso e sobre o
 * que o autor ve — e o relatorio do portao sai por `stdout` e por `stderr` conforme o ramo.
 */
function rodar(script: string, env: Record<string, string>): Promise<Resultado> {
  return new Promise((resolver) => {
    const filho = spawn(process.execPath, [TSX, path.join(AQUI, script)], {
      cwd: APP,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let saida = ''
    filho.stdout.on('data', (pedaco: Buffer) => {
      saida += pedaco.toString('utf8')
    })
    filho.stderr.on('data', (pedaco: Buffer) => {
      saida += pedaco.toString('utf8')
    })
    // `error` (o processo nao subiu) e `close` (o processo terminou) podem chegar os dois: a
    // promessa resolve uma vez so, e o segundo resolve e ignorado.
    filho.on('error', (erro) => resolver({ status: -1, saida: `${saida}${String(erro)}` }))
    filho.on('close', (codigo) => resolver({ status: codigo ?? -1, saida }))
  })
}

const NAO_RODOU: Resultado = { status: -1, saida: 'o portao nao chegou a rodar' }

/** O content.json do material INTACTO: e o artefato que o `check:content` confere em cada caso. */
let linhaDeBase = ''
/** Os dois portoes na copia intacta — o controle do arquivo, rodado UMA vez aqui. */
let intacto: { build: Resultado; check: Resultado } = { build: NAO_RODOU, check: NAO_RODOU }

// O material e gerado UMA vez, e serve para o controle e para a linha de base. O prazo e explicito
// porque o padrao de hook e o `testTimeout` (30 s), que a geracao do material inteiro passa quando a
// maquina esta carregada — e um `beforeAll` que estoura derruba o arquivo inteiro, dizendo "o
// defeito nao reprovou" em vez de "a maquina estava ocupada". Nada e asserido aqui: o resultado vai
// para o caso de controle, que e quem diz o que ele prova.
beforeAll(async () => {
  const c = caso()
  const build = await rodar('build-content.ts', envDoCaso(c))
  const check = await rodar('check-content.ts', envDoCaso(c))
  intacto = { build, check }
  // Sem build nao ha artefato: o caso de controle reprova pelo `status` e a linha de base vazia e
  // acusada em `comArtefato`, com a causa ao lado, em vez de estourar no `readFileSync`.
  if (fs.existsSync(c.conteudo)) linhaDeBase = fs.readFileSync(c.conteudo, 'utf8')
}, SOBRA)

/** Copia o artefato do material intacto para o caso: o defeito plantado fica so no material. */
function comArtefato(c: Caso): void {
  if (!linhaDeBase) {
    throw new Error(
      'linha de base ausente: o build do material intacto reprovou (o caso de controle diz por que)',
    )
  }
  fs.writeFileSync(c.conteudo, linhaDeBase)
}

/** Acrescenta texto ao fim de um documento do material (dentro da ultima secao dele). */
function acrescentar(c: Caso, relativo: string, texto: string): void {
  fs.appendFileSync(path.join(c.material, relativo), `\n\n${texto}\n`)
}

describe.concurrent('os portoes reprovam o defeito plantado na copia', () => {
  it(
    'o material sem defeito passa nos dois',
    () => {
      // O controle: sem ele, "o portao sai diferente de zero" passaria por qualquer motivo —
      // inclusive por um material que nao gera. Os dois portoes, com as duas contagens. As duas
      // leituras do material sairam do `beforeAll` (uma vez so); o que este caso prova e o
      // veredito delas na copia intacta.
      expect(intacto.build.status, intacto.build.saida).toBe(0)
      expect(intacto.build.saida).toContain('content.json gerado: 18 areas, 109 temas, 22 paginas')
      expect(intacto.check.status, intacto.check.saida).toBe(0)
      expect(intacto.check.saida).toContain('0 erro(s)')
    },
    SOBRA,
  )

  it(
    'link relativo para arquivo que nao existe',
    async () => {
      const c = caso()
      comArtefato(c)
      acrescentar(c, TEMA, '[tema que sumiu](./TEMA-99-nao-existe.md)')
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('nao existe no material')
      expect(check.saida).toContain('TEMA-99-nao-existe.md')
    },
    SOBRA,
  )

  it(
    'href de fragmento que nao e rota do app',
    async () => {
      const c = caso()
      comArtefato(c)
      // O defeito no MATERIAL: quem o acusa e o resolvedor de links, na geracao (o `build:content`
      // sai 1 e nao regrava o content.json) e de novo no `check:content`, porque o arquivo em
      // disco deixou de ser o que o material deriva. A mensagem e a do resolvedor — a expectativa
      // anterior deste caso cobrava a frase da varredura do ARTEFATO (`checarLinks`) de um defeito
      // que so existia no material, e por isso nao a encontrava; as duas defesas continuam
      // cobradas, cada uma onde ela de fato mora (a segunda, logo abaixo).
      acrescentar(c, TEMA, '[temas](#4-temas)')
      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).not.toBe(0)
      expect(build.saida).toContain('"#4-temas" e um fragmento que nao e rota do app')
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('"#4-temas" e um fragmento que nao e rota do app')

      // O defeito no ARTEFATO: um content.json que ja tenha o fragmento reprova pela varredura do
      // HTML gerado, sem depender do material — a defesa de quem recebeu o href pronto.
      const conteudo = JSON.parse(linhaDeBase) as { temas: Record<string, { intro: string }> }
      const tema = conteudo.temas['01-fundamentos#TEMA-01']
      expect(tema).toBeDefined()
      tema!.intro = '<p><a href="#4-temas">temas</a></p>'
      fs.writeFileSync(c.conteudo, JSON.stringify(conteudo))
      const checkDoArtefato = await rodar('check-content.ts', envDoCaso(c))
      expect(checkDoArtefato.status, checkDoArtefato.saida).not.toBe(0)
      expect(checkDoArtefato.saida).toContain('fragmento que nao e rota do app (#4-temas)')
    },
    SOBRA,
  )

  it(
    'a ancora intra-pagina legitima constroi (contraprova da regra do fragmento)',
    async () => {
      // O outro lado da MESMA regra, no caminho inteiro: `[nota](#nota)` com `<p id="nota">` no
      // documento e uma ancora de verdade — o alvo esta na mesma tela. A sanitizacao prefixa o
      // `id` do material (`material-nota`, para um `id` de fora nao sombrear as ancoras do app) e
      // a religacao leva o href junto; o portao reprovava o prefixo que a propria geracao
      // injetou, e o caso legitimo nunca construia. Aqui o material inteiro e gerado e conferido
      // com o par no lugar: os dois portoes tem de sair 0.
      const c = caso()
      acrescentar(c, TEMA, '[ir para a nota](#nota)\n\n<p id="nota">alvo de teste, na mesma pagina</p>')

      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).toBe(0)
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).toBe(0)
      expect(check.saida).toContain('0 erro(s)')

      // E o HTML gerado tem o par ALINHADO: o `id` e o href com o mesmo prefixo, nenhum href
      // solto. Sem isto, "os dois portoes sairam 0" nao diria nada sobre a ancora ter alvo.
      const gerado = JSON.parse(fs.readFileSync(c.conteudo, 'utf8')) as {
        temas: Record<string, { intro: string; secoes: { html: string }[] }>
      }
      const tema = gerado.temas['01-fundamentos#TEMA-01']
      expect(tema).toBeDefined()
      const html = [tema!.intro, ...tema!.secoes.map((s) => s.html)].join('\n')
      expect(html).toContain('href="#material-nota"')
      expect(html).toContain('id="material-nota"')
      expect(html).not.toContain('href="#nota"')
    },
    SOBRA,
  )

  it(
    'pagina a mais no material (a contagem de paginas)',
    async () => {
      const c = caso()
      fs.writeFileSync(
        path.join(c.material, PAGINA_NOVA),
        '# Catalogo inventado\n\nPagina nova, sem link nenhum apontando para ela.\n',
      )
      // A geracao passa (o arquivo novo nao e defeito de link); quem reprova e o portao do
      // content.json, e o defeito e a CONTAGEM — o app perde a pagina sem aviso nenhum na tela.
      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).toBe(0)
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('totais: 23 paginas, esperado 22')
    },
    SOBRA,
  )

  it(
    '`.mermaid` escrito em prosa, fora da cerca, com rotulo proibido',
    async () => {
      const c = caso()
      // A carga do achado: o `querySelectorAll('.mermaid')` do runtime pega este div, entao o
      // diagrama quebrado chega ao aluno — mas so a cerca passava pelo contrato do Mermaid.
      acrescentar(c, TEMA, '<div class="mermaid">graph TD; A["ROTULO com &lt; e # proibidos"]</div>')
      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).toBe(0)
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('rotulo Mermaid com caractere proibido')
    },
    SOBRA,
  )

  it(
    'link protocol-relative escrito em HTML cru',
    async () => {
      const c = caso()
      comArtefato(c)
      // O defeito que só o `check:content` pegava: a ancora em HTML cru nao passa pelo renderer de
      // link do markdown, entao o resolvedor nunca a via e o `build:content` saia 0 — no
      // `npm run dev` (que nao roda o check) o link chegava a tela.
      acrescentar(c, TEMA, '<a href="//evil.example/pwn">clique</a>')
      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).not.toBe(0)
      expect(build.saida).toContain('protocol-relative')
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('protocol-relative')
    },
    SOBRA,
  )

  it(
    'caractere de controle bidirecional no href',
    async () => {
      const c = caso()
      comArtefato(c)
      // `<a href="https://evil.example/‮moc.elgoog//:sptth">`: a barra de status desenha
      // `https://google.com` e o clique vai para o host do atacante. A geracao recusa o bloco.
      acrescentar(c, TEMA, '<a href="https://evil.example/\u202Emoc.elgoog//:sptth">nota</a>')
      const build = await rodar('build-content.ts', envDoCaso(c))
      expect(build.status, build.saida).not.toBe(0)
      expect(build.saida).toContain('controle bidirecional (U+202E)')

      // E o portao reprova um artefato que JA tenha o href: a defesa nao esta so na geracao.
      const conteudo = JSON.parse(linhaDeBase) as { temas: Record<string, { intro: string }> }
      const tema = conteudo.temas['01-fundamentos#TEMA-01']
      expect(tema).toBeDefined()
      tema!.intro = '<p><a href="https://evil.example/\u202Emoc.elgoog//:sptth">nota</a></p>'
      fs.writeFileSync(c.conteudo, JSON.stringify(conteudo))
      const check = await rodar('check-content.ts', envDoCaso(c))
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('href com caractere de controle bidirecional (U+202E)')
    },
    SOBRA,
  )

  it(
    'item do banco de questoes com fonte de esquema proibido',
    async () => {
      const c = caso()
      comArtefato(c)
      // O banco e copiado e UMA fonte perde o esquema: `Quiz.tsx` monta `questao.fonte.url` como
      // `href`, e `data:text/html` ali e execucao no clique.
      const banco = path.join(path.dirname(c.conteudo), 'questoes')
      fs.cpSync(QUESTOES, banco, { recursive: true })
      const arquivo = path.join(banco, '01-fundamentos.json')
      const itens = JSON.parse(fs.readFileSync(arquivo, 'utf8')) as Array<{ fonte: { url: string } }>
      expect(itens.length).toBeGreaterThan(0)
      itens[0]!.fonte.url = 'data:text/html,<script>alert(1)</script>'
      fs.writeFileSync(arquivo, JSON.stringify(itens))

      const check = await rodar('check-questions.ts', {
        ROADMAP_CONTENT_FILE: c.conteudo,
        ROADMAP_QUESTIONS_DIR: banco,
      })
      expect(check.status, check.saida).not.toBe(0)
      expect(check.saida).toContain('fonte com esquema nao permitido')
    },
    SOBRA,
  )
})
