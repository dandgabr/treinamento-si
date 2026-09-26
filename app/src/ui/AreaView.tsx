import { useEffect, useRef } from 'react'
import { content } from '../infrastructure/content/repository'
import { BlocoQA, Html } from './Blocos'
import { renderizarMermaid } from './mermaid'
import { linkTema } from './useRota'

export function AreaView({ areaId, escuro }: { areaId: string; escuro: boolean }) {
  const area = content.areas.find((a) => a.areaId === areaId)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [areaId, area, escuro])

  if (!area) {
    return (
      <main className="conteudo">
        <p>Área não encontrada: {areaId}</p>
        <a href="#/">Voltar ao painel</a>
      </main>
    )
  }

  return (
    <main className="conteudo" ref={containerRef}>
      <nav className="migalhas">
        <a href="#/">Painel</a> / <span>{area.areaNome}</span>
      </nav>

      <header className="cabecalho-tema">
        <h1>{area.areaNome}</h1>
        <p className="meta">
          <span className="selo">ordem {area.ordemEstudo}</span>
          <span className={`selo nivel-${area.nivel}`}>{area.nivel}</span>
          {area.certificacoes.length ? <span>{area.certificacoes.join(' · ')}</span> : null}
        </p>
      </header>

      {area.guia.intro ? (
        <Html key={`intro-${escuro}`} className="intro" html={area.guia.intro} />
      ) : null}

      <section className="secao">
        <h2>Temas</h2>
        <ol className="lista-temas">
          {area.temas.map((ref, i) => {
            const t = content.temas[ref]
            return (
              <li key={ref}>
                <a href={linkTema(ref)}>
                  <span className="indice">{String(i + 1).padStart(2, '0')}</span>
                  <span className="nome">{t?.titulo ?? ref}</span>
                  <span className="tempo">{t?.tempoEstimado}</span>
                </a>
              </li>
            )
          })}
        </ol>
      </section>

      {area.guia.secoes
        .slice()
        .sort((a, b) => a.numero - b.numero)
        .map((s) => {
          if (s.numero === 9)
            return (
              <BlocoQA
                key={9}
                titulo="9. Checkpoint da área"
                pares={area.guia.checkpoint}
                criterio={area.guia.criterio}
              />
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
    </main>
  )
}
