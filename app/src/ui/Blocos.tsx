import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react'
import type { ParQA, QuestaoPreTeste, Secao } from '../domain/types'
import { registrarConfianca, useProgresso } from '../application/progresso-store'
import { NIVEIS_CONFIANCA, type Confianca } from '../domain/progresso'
import { renderizarMermaid } from './mermaid'
import { irParaSecao } from './useRota'

/**
 * Bloco principal de uma tela.
 *
 * O `tabIndex={-1}` e o que deixa o foco entrar aqui sem virar parada de tabulacao: este e o
 * destino do "pular para o conteudo" e da troca de rota (o App move o foco depois de montar
 * a tela nova). Sem ele, quem usa leitor de tela continuaria no cabecalho antigo, e os
 * primeiros TABs dariam a volta pela navegacao.
 */
export function Principal({
  children,
  className = 'conteudo',
  refPrincipal,
}: {
  children: ReactNode
  className?: string
  refPrincipal?: Ref<HTMLElement>
}) {
  return (
    <main className={className} tabIndex={-1} ref={refPrincipal}>
      {children}
    </main>
  )
}

/** Renderiza HTML ja processado em build (conteudo confiavel, local). */
export function Html({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Id da secao numerada de um tema, de um guia ou de uma pagina. */
export function idDaSecao(numero: number): string {
  return `secao-${numero}`
}

/**
 * Renderiza uma lista de secoes, exceto as que viram bloco interativo.
 *
 * O `id` e o `tabIndex` do titulo existem para o sumario: o botao de la move o foco e a
 * rolagem para este `h2`.
 */
export function Secoes({
  secoes,
  excluir = [],
  escuro,
}: {
  secoes: Secao[]
  excluir?: number[]
  escuro: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) void renderizarMermaid(ref.current, escuro)
  }, [secoes, escuro])

  return (
    <div ref={ref}>
      {secoes
        .filter((s) => !excluir.includes(s.numero))
        .map((s) => (
          // A key inclui o tema: ao trocar claro/escuro o React remonta a secao,
          // reinjeta o HTML original e o Mermaid volta a ter material para renderizar.
          // Sem isso ele pula o no (ja marcado com data-processed) e o diagrama
          // mantem as cores do tema anterior.
          <section key={`${s.numero}-${escuro}`} className="secao">
            <h2 id={idDaSecao(s.numero)} tabIndex={-1}>
              <span className="secao-num">{s.numero}.</span> {s.titulo}
            </h2>
            <Html html={s.html} />
          </section>
        ))}
    </div>
  )
}

/** Um item do sumario: o cabecalho que ja existe no material, com o id que o foco usa. */
export interface ItemDeSumario {
  id: string
  texto: string
  numero?: number
}

/**
 * Sumario das telas longas: um botao por cabecalho, sem secao nova.
 *
 * Sao botoes, e nao `<a href="#...">`, porque o fragmento da URL pertence a rota: uma ancora
 * de verdade viraria a rota "desconhecida" e a tela inteira cairia.
 */
export function Sumario({ itens }: { itens: ItemDeSumario[] }) {
  return (
    <nav className="sumario" aria-label="Sumário da página">
      <p className="sumario-rotulo">Nesta página</p>
      <ul>
        {itens.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => irParaSecao(item.id)}>
              {item.numero === undefined ? null : (
                <span className="sumario-num">{item.numero}.</span>
              )}
              {item.texto}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Extrai os cabecalhos `h2`/`h3` de um HTML e devolve o MESMO HTML com `id` em cada um.
 *
 * E o caso do material que cai inteiro no `intro`, sem `## N.` (glossario, mapa de
 * relacoes): a unica estrutura que existe sao esses cabecalhos, e o sumario sai deles em vez
 * de uma estrutura inventada. O id vem da posicao, e nao do texto: dois titulos iguais
 * ficariam com o mesmo id.
 */
export function ancorarCabecalhos(
  html: string,
  prefixo: string,
): { html: string; itens: ItemDeSumario[] } {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const itens: ItemDeSumario[] = []
  for (const cabecalho of doc.body.querySelectorAll('h2, h3')) {
    const id = `${prefixo}-${itens.length + 1}`
    cabecalho.id = id
    // Alvo de foco do sumario: `tabindex` negativo nao entra na tabulacao normal.
    cabecalho.setAttribute('tabindex', '-1')
    itens.push({ id, texto: (cabecalho.textContent ?? '').trim() })
  }
  return { html: doc.body.innerHTML, itens }
}

/** Recuperacao ativa / checkpoint: pergunta recolhida, gabarito sob demanda. */
export function BlocoQA({
  titulo,
  pares,
  criterio,
  id,
  veredictoPorItem,
}: {
  titulo: string
  pares: ParQA[]
  criterio?: string
  /** Ancora do sumario, quando o bloco e uma das secoes numeradas da tela. */
  id?: string
  /** Quando presente, cada item ganha "Acertei/Errei" — e o caso do checkpoint. */
  veredictoPorItem?: {
    obter: (indice: number) => boolean | null
    definir: (indice: number, acertou: boolean) => void
  }
}) {
  const [abertos, setAbertos] = useState<Set<number>>(new Set())
  const base = useId()

  function alternar(i: number) {
    setAbertos((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(i)) proximo.delete(i)
      else proximo.add(i)
      return proximo
    })
  }

  return (
    <section className="secao bloco-qa" id={id}>
      <h2 tabIndex={id === undefined ? undefined : -1}>{titulo}</h2>
      <p className="dica">Responda antes de revelar o gabarito.</p>
      <ol className="lista-qa">
        {pares.map((par, i) => {
          const idResposta = `${base}-resposta-${i}`
          const aberto = abertos.has(i)
          return (
            <li key={i}>
              <p className="pergunta">{par.pergunta}</p>
              <button
                className="botao-secundario"
                aria-expanded={aberto}
                aria-controls={idResposta}
                aria-label={`${aberto ? 'Ocultar' : 'Revelar'} a resposta da questão ${i + 1}`}
                onClick={() => alternar(i)}
              >
                {aberto ? 'Ocultar resposta' : 'Revelar resposta'}
              </button>
              {/* Sem `role`: cada item viraria um marco de navegacao (5 por bloco) e
                  poluiria a lista de landmarks de quem usa leitor de tela. */}
              <div className="gabarito" id={idResposta} hidden={!aberto}>
                <p>{par.resposta}</p>
              </div>
              {veredictoPorItem ? (
                <div
                  className="veredicto-item"
                  role="group"
                  aria-label={`Resultado da questão ${i + 1}`}
                >
                  <button
                    className={
                      veredictoPorItem.obter(i) === true ? 'botao-secundario ativo' : 'botao-secundario'
                    }
                    aria-pressed={veredictoPorItem.obter(i) === true}
                    onClick={() => veredictoPorItem.definir(i, true)}
                  >
                    Acertei
                  </button>
                  <button
                    className={
                      veredictoPorItem.obter(i) === false ? 'botao-secundario ativo' : 'botao-secundario'
                    }
                    aria-pressed={veredictoPorItem.obter(i) === false}
                    onClick={() => veredictoPorItem.definir(i, false)}
                  >
                    Errei
                  </button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ol>
      {criterio ? (
        <p className="criterio">
          <strong>Critério para seguir adiante:</strong> {criterio}
        </p>
      ) : null}
    </section>
  )
}

/** O que e 1 e o que e 5 na escala. O rotulo das pontas fica visivel sob os botoes. */
const PONTA_CONFIANCA: Record<Confianca, string | null> = {
  1: 'chutei',
  2: null,
  3: null,
  4: null,
  5: 'certeza',
}

/**
 * Escala de confianca de um item (1 a 5).
 *
 * Uma parada de tabulacao para a escala inteira, e nao cinco: o `tabIndex` fica em 0 so no
 * nivel marcado (no primeiro, enquanto nada foi marcado) e as setas andam e marcam dentro
 * dela — o padrao de um grupo de alternancia. No pre-teste de 5 itens as paradas caem de 25
 * para 5, e o valor gravado no progresso continua sendo o mesmo numero.
 */
function EscalaConfianca({
  indice,
  valor,
  aoEscolher,
}: {
  indice: number
  valor: Confianca | null
  aoEscolher: (nivel: Confianca) => void
}) {
  const botoes = useRef<(HTMLButtonElement | null)[]>([])
  const marcado: Confianca = valor ?? NIVEIS_CONFIANCA[0]

  function escolher(nivel: Confianca, comFoco: boolean): void {
    aoEscolher(nivel)
    if (comFoco) botoes.current[nivel - 1]?.focus()
  }

  function aoTeclar(evento: KeyboardEvent<HTMLButtonElement>, atual: Confianca): void {
    const i = NIVEIS_CONFIANCA.indexOf(atual)
    const ultimo = NIVEIS_CONFIANCA.length - 1
    const passo =
      evento.key === 'ArrowRight' || evento.key === 'ArrowDown'
        ? 1
        : evento.key === 'ArrowLeft' || evento.key === 'ArrowUp'
          ? -1
          : evento.key === 'Home'
            ? -i
            : evento.key === 'End'
              ? ultimo - i
              : 0
    if (passo === 0) return
    evento.preventDefault()
    const destino = NIVEIS_CONFIANCA[Math.min(Math.max(i + passo, 0), ultimo)]
    if (destino !== undefined) escolher(destino, true)
  }

  return (
    <div className="confianca" role="group" aria-label={`Confiança na questão ${indice + 1}`}>
      {/* O nome do grupo ja diz de que escala se trata; o rotulo visivel repete isso para
          quem enxerga a tela. */}
      <span className="confianca-rotulo" aria-hidden="true">
        Confiança:
      </span>
      <div className="escala">
        <div className="escala-botoes">
          {NIVEIS_CONFIANCA.map((n) => {
            const ponta = PONTA_CONFIANCA[n]
            return (
              <button
                key={n}
                type="button"
                ref={(no) => {
                  botoes.current[n - 1] = no
                }}
                className={valor === n ? 'nivel ativo' : 'nivel'}
                aria-pressed={valor === n}
                aria-label={ponta === null ? `Nível ${n} de 5` : `Nível ${n} de 5: ${ponta}`}
                tabIndex={n === marcado ? 0 : -1}
                onClick={() => escolher(n, false)}
                onKeyDown={(evento) => aoTeclar(evento, n)}
              >
                {n}
              </button>
            )
          })}
        </div>
        <div className="escala-pontas">
          <span>chutei</span>
          <span>certeza</span>
        </div>
      </div>
    </div>
  )
}

/** Pre-teste com calibracao de confianca (1 a 5), gravada no progresso. */
export function PreTeste({
  refTema,
  questoes,
  id,
}: {
  refTema: string
  questoes: QuestaoPreTeste[]
  /** Ancora do sumario, quando o bloco e uma das secoes numeradas da tela. */
  id?: string
}) {
  const progresso = useProgresso()
  const respondidas = new Map(
    (progresso.temas[refTema]?.preTeste ?? []).map((r) => [r.indice, r.confianca]),
  )

  return (
    <section className="secao bloco-pre-teste" id={id}>
      <h2 tabIndex={id === undefined ? undefined : -1}>
        <span className="secao-num">3.</span> Pré-teste
      </h2>
      <p className="dica">
        Responda de palpite, antes de ler o resto, e marque a confiança. Errar com confiança baixa
        informa mais do que acertar por sorte.
      </p>
      <ol className="lista-qa">
        {questoes.map((q, i) => (
          <li key={i}>
            <p className="pergunta">{q.pergunta}</p>
            <EscalaConfianca
              indice={i}
              valor={respondidas.get(i) ?? null}
              aoEscolher={(nivel) => registrarConfianca(refTema, i, nivel)}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}

/** Cabecalhos de um HTML memoizados: o parse so roda quando o material muda. */
export function useCabecalhos(html: string, prefixo: string): {
  html: string
  itens: ItemDeSumario[]
} {
  return useMemo(() => ancorarCabecalhos(html, prefixo), [html, prefixo])
}
