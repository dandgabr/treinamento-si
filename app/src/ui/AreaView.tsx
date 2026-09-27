import { useEffect, useRef } from 'react'
import { content } from '../infrastructure/content/repository'
import { Html, idDaSecao, Principal, Sumario, type ItemDeSumario } from './Blocos'
import { renderizarMermaid } from './mermaid'
import { CheckpointArea, SituacaoDaArea } from './Progresso'
import { linkTema } from './useRota'

/** Minimo de secoes para o sumario valer a pena: tela curta nao precisa de indice. */
const MIN_ITENS_SUMARIO = 4

export function AreaView({ areaId, escuro }: { areaId: string; escuro: boolean }) {
  const area = content.areas.find((a) => a.areaId === areaId)
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [areaId, area, escuro])

  if (!area) {
    return (
      <Principal>
        <p>Área não encontrada: {areaId}</p>
        <a href="#/">Voltar ao painel</a>
      </Principal>
    )
  }

  const secoes = area.guia.secoes.slice().sort((a, b) => a.numero - b.numero)
  const itens: ItemDeSumario[] = secoes.map((s) => ({
    id: idDaSecao(s.numero),
    numero: s.numero,
    texto: s.titulo,
  }))

  return (
    <Principal refPrincipal={containerRef}>
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

      <SituacaoDaArea area={area} />

      {itens.length >= MIN_ITENS_SUMARIO ? <Sumario itens={itens} /> : null}

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

      {secoes.map((s) => {
        // A key inclui a area: sem isso o React reaproveita o componente ao trocar de
        // area e os veredictos da anterior passam a valer para a nova, gravando um
        // checkpoint que ninguem respondeu.
        if (s.numero === 9)
          return <CheckpointArea key={area.areaId} areaId={area.areaId} area={area} id={idDaSecao(9)} />
        return (
          <section key={`${s.numero}-${escuro}`} className="secao">
            <h2 id={idDaSecao(s.numero)} tabIndex={-1}>
              <span className="secao-num">{s.numero}.</span> {s.titulo}
            </h2>
            <Html html={s.html} />
          </section>
        )
      })}
    </Principal>
  )
}

