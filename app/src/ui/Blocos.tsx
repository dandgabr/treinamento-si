import { useEffect, useId, useRef, useState } from 'react'
import type { ParQA, QuestaoPreTeste, Secao } from '../domain/types'
import { registrarConfianca, useProgresso } from '../application/progresso-store'
import { NIVEIS_CONFIANCA } from '../domain/progresso'
import { renderizarMermaid } from './mermaid'

/** Renderiza HTML ja processado em build (conteudo confiavel, local). */
export function Html({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Renderiza uma lista de secoes, exceto as que viram bloco interativo. */
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
            <h2>
              <span className="secao-num">{s.numero}.</span> {s.titulo}
            </h2>
            <Html html={s.html} />
          </section>
        ))}
    </div>
  )
}

/** Recuperacao ativa / checkpoint: pergunta recolhida, gabarito sob demanda. */
export function BlocoQA({
  titulo,
  pares,
  criterio,
  veredictoPorItem,
}: {
  titulo: string
  pares: ParQA[]
  criterio?: string
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
    <section className="secao bloco-qa">
      <h2>{titulo}</h2>
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

/** Pre-teste com calibracao de confianca (1 a 5), gravada no progresso. */
export function PreTeste({ refTema, questoes }: { refTema: string; questoes: QuestaoPreTeste[] }) {
  const progresso = useProgresso()
  const respondidas = new Map(
    (progresso.temas[refTema]?.preTeste ?? []).map((r) => [r.indice, r.confianca]),
  )

  return (
    <section className="secao bloco-pre-teste">
      <h2>
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
            <div className="confianca" role="group" aria-label={`Confiança na questão ${i + 1}`}>
              <span aria-hidden="true">Confiança:</span>
              {NIVEIS_CONFIANCA.map((n) => (
                <button
                  key={n}
                  className={respondidas.get(i) === n ? 'nivel ativo' : 'nivel'}
                  aria-pressed={respondidas.get(i) === n}
                  aria-label={`Nível ${n} de 5`}
                  onClick={() => registrarConfianca(refTema, i, n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
