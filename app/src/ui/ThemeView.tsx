import { Fragment, useEffect, useMemo, useRef } from 'react'
import { content } from '../infrastructure/content/repository'
import type { Tema } from '../domain/types'
import { BlocoQA, Html, idDaSecao, PreTeste, Principal, Sumario, type ItemDeSumario } from './Blocos'
import { renderizarMermaid } from './mermaid'
import { BotaoLido, VereditoRecuperacao } from './Progresso'
import { irPara, linkQuiz, linkTema } from './useRota'

/** Minimo de secoes para o sumario valer a pena: tela curta nao precisa de indice. */
const MIN_ITENS_SUMARIO = 4

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
  const containerRef = useRef<HTMLElement>(null)
  const secoes = useMemo(
    () => (tema?.secoes ?? []).slice().sort((a, b) => a.numero - b.numero),
    [tema],
  )
  const itens: ItemDeSumario[] = secoes.map((s) => ({
    id: idDaSecao(s.numero),
    numero: s.numero,
    texto: s.titulo,
  }))

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [refTema, tema, escuro])

  if (!tema) {
    return (
      <Principal>
        <p>Tema não encontrado: {refTema}</p>
        <button onClick={() => irPara('#/')}>Voltar ao painel</button>
      </Principal>
    )
  }

  const area = content.areas.find((a) => a.areaId === tema.areaId)

  return (
    <Principal refPrincipal={containerRef}>
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
          {/* Mesma forma do botao ao lado: o quiz ja tem escopo por tema
              (`#/quiz/<areaId>/<temaId>`), e este e o caminho de quem acabou de ler o tema. */}
          <a className="botao-secundario" href={linkQuiz(tema.areaId, tema.temaId)}>
            Praticar este tema
          </a>
        </p>
      </header>

      {itens.length >= MIN_ITENS_SUMARIO ? <Sumario itens={itens} /> : null}

      {tema.intro ? <Html key={`intro-${escuro}`} className="intro" html={tema.intro} /> : null}

      {secoes.map((s) => {
        if (s.numero === 3)
          return <PreTeste key={3} refTema={tema.ref} questoes={tema.preTeste} id={idDaSecao(3)} />
        if (s.numero === 10)
          return (
            // `Fragment` com key: as keys internas nao servem de identidade para o
            // fragmento, e o React avisa em desenvolvimento.
            <Fragment key={10}>
              <BlocoQA
                titulo="10. Recuperação ativa"
                pares={tema.recuperacao}
                id={idDaSecao(10)}
              />
              <VereditoRecuperacao refTema={tema.ref} />
            </Fragment>
          )
        return (
          <section key={`${s.numero}-${escuro}`} className="secao">
            <h2 id={idDaSecao(s.numero)} tabIndex={-1}>
              <span className="secao-num">{s.numero}.</span> {s.titulo}
            </h2>
            <Html html={s.html} />
          </section>
        )
      })}

      <Vizinhos tema={tema} />
    </Principal>
  )
}
