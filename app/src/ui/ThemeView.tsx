import { useEffect, useRef } from 'react'
import { content } from '../infrastructure/content/repository'
import type { Tema } from '../domain/types'
import { BlocoQA, Html, PreTeste } from './Blocos'
import { renderizarMermaid } from './mermaid'
import { BotaoLido, VereditoRecuperacao } from './Progresso'
import { irPara, linkTema } from './useRota'

function Vizinhos({ tema }: { tema: Tema }) {
  const area = content.areas.find((a) => a.areaId === tema.areaId)
  if (!area) return null
  const i = area.temas.indexOf(tema.ref)
  const anterior = i > 0 ? area.temas[i - 1] : null
  const proximo = i >= 0 && i < area.temas.length - 1 ? area.temas[i + 1] : null
  return (
    <nav className="vizinhos">
      {anterior ? (
        <a href={linkTema(anterior)}>← {content.temas[anterior]?.temaId}</a>
      ) : (
        <span />
      )}
      {proximo ? (
        <a href={linkTema(proximo)}>{content.temas[proximo]?.temaId} →</a>
      ) : (
        <span />
      )}
    </nav>
  )
}

export function ThemeView({ refTema, escuro }: { refTema: string; escuro: boolean }) {
  const tema = content.temas[refTema]
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [refTema, tema, escuro])

  if (!tema) {
    return (
      <main className="conteudo">
        <p>Tema não encontrado: {refTema}</p>
        <button onClick={() => irPara('#/')}>Voltar ao painel</button>
      </main>
    )
  }

  const area = content.areas.find((a) => a.areaId === tema.areaId)

  return (
    <main className="conteudo" ref={containerRef}>
      <nav className="migalhas">
        <a href="#/">Painel</a> / <a href={`#/area/${tema.areaId}`}>{area?.areaNome ?? tema.areaId}</a> /{' '}
        <span>{tema.temaId}</span>
      </nav>

      <header className="cabecalho-tema">
        <h1>{tema.titulo}</h1>
        <p className="meta">
          <span className={`selo nivel-${tema.nivel}`}>{tema.nivel}</span>
          <span>{tema.tempoEstimado}</span>
          {tema.certificacoes.length ? <span>{tema.certificacoes.join(' · ')}</span> : null}
        </p>
        {tema.objetivo ? (
          <p className="objetivo">
            <strong>Ao final:</strong> {tema.objetivo}
          </p>
        ) : null}
        <p className="acoes-tema">
          <BotaoLido refTema={tema.ref} />
        </p>
      </header>

      {tema.intro ? <Html key={`intro-${escuro}`} className="intro" html={tema.intro} /> : null}

      {tema.secoes
        .slice()
        .sort((a, b) => a.numero - b.numero)
        .map((s) => {
          if (s.numero === 3)
            return <PreTeste key={3} refTema={tema.ref} questoes={tema.preTeste} />
          if (s.numero === 10)
            return (
              <>
                <BlocoQA key={10} titulo="10. Recuperação ativa" pares={tema.recuperacao} />
                <VereditoRecuperacao key="veredito" refTema={tema.ref} />
              </>
            )
          return (
            <section key={`${s.numero}-${escuro}`} className="secao">
              <h2>
                <span className="secao-num">{s.numero}.</span> {s.titulo}
              </h2>
              <Html html={s.html} />
            </section>
          )
        })}

      <Vizinhos tema={tema} />
    </main>
  )
}
