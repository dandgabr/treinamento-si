import { useEffect, useRef, useState } from 'react'
import { content, erroConteudo } from '../infrastructure/content/repository'
import { gravarTexto, lerTexto } from '../infrastructure/storage/local'
import { AreaView } from './AreaView'
import { Html, Secoes } from './Blocos'
import { renderizarMermaid } from './mermaid'
import { ResumoProgresso } from './Progresso'
import { ThemeView } from './ThemeView'
import { useRota } from './useRota'

const CHAVE_TEMA = 'roadmap:tema'

function Home() {
  const referencias = content.paginas.filter((p) => p.grupo === 'referencia')
  const catalogos = content.paginas.filter((p) => /^(90|91|99)-/.test(p.grupo))

  return (
    <main className="conteudo">
      <header className="hero">
        <h1>Roadmap CISO</h1>
        <p>
          {content.meta.totais.areas} áreas · {content.meta.totais.temas} temas ·{' '}
          {content.areas.reduce((n, a) => n + a.guia.checkpoint.length, 0)} itens de checkpoint
        </p>
      </header>

      <ResumoProgresso />

      <section className="secao">
        <h2>Ordem de estudo sugerida</h2>
        <ol className="lista-areas">
          {content.areas.map((a) => (
            <li key={a.areaId}>
              <a href={`#/area/${a.areaId}`}>
                <span className="indice">{String(a.ordemEstudo).padStart(2, '0')}</span>
                <span className="nome">{a.areaNome}</span>
                <span className={`selo nivel-${a.nivel}`}>{a.nivel}</span>
                <span className="contagem">{a.temas.length} temas</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {referencias.length ? (
        <section className="secao">
          <h2>Referência</h2>
          <ul className="lista-paginas">
            {referencias.map((p) => (
              <li key={p.slug}>
                <a href={`#/pagina/${p.slug}`}>{p.titulo}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {catalogos.length ? (
        <section className="secao">
          <h2>Trilhas, certificações e fontes</h2>
          <ul className="lista-paginas">
            {catalogos.map((p) => (
              <li key={p.slug}>
                <a href={`#/pagina/${p.slug}`}>{p.titulo}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

function PaginaView({ slug, escuro }: { slug: string; escuro: boolean }) {
  const pagina = content.paginas.find((p) => p.slug === slug)
  // O intro de uma pagina pode conter diagrama (o mapa de relacoes tem), entao este
  // container tambem precisa disparar a renderizacao do Mermaid.
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [slug, pagina, escuro])

  if (!pagina) {
    return (
      <main className="conteudo">
        <p>Página não encontrada: {slug}</p>
        <a href="#/">Voltar ao painel</a>
      </main>
    )
  }
  return (
    <main className="conteudo" ref={containerRef}>
      <nav className="migalhas">
        <a href="#/">Painel</a> / <span>{pagina.titulo}</span>
      </nav>
      <header className="cabecalho-tema">
        <h1>{pagina.titulo}</h1>
      </header>
      <Html key={`intro-${escuro}`} className="intro" html={pagina.intro} />
      <Secoes secoes={pagina.secoes} escuro={escuro} />
    </main>
  )
}

export function App() {
  const rota = useRota()
  const [escuro, setEscuro] = useState(() => lerTexto(CHAVE_TEMA) === 'escuro')

  useEffect(() => {
    document.documentElement.dataset.theme = escuro ? 'dark' : 'light'
    gravarTexto(CHAVE_TEMA, escuro ? 'escuro' : 'claro')
  }, [escuro])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [rota])

  return (
    <div className="app">
      <header className="topo">
        <a className="marca" href="#/">
          Roadmap CISO
        </a>
        <div className="topo-acoes">
          <button
            className="botao-secundario"
            onClick={() => setEscuro((v) => !v)}
            aria-label="Alternar tema claro e escuro"
          >
            {escuro ? 'Claro' : 'Escuro'}
          </button>
        </div>
      </header>

      {erroConteudo ? <p className="aviso-erro">{erroConteudo}</p> : null}

      {rota.nome === 'home' ? <Home /> : null}
      {rota.nome === 'area' ? <AreaView areaId={rota.areaId} escuro={escuro} /> : null}
      {rota.nome === 'tema' ? <ThemeView key={rota.ref} refTema={rota.ref} escuro={escuro} /> : null}
      {rota.nome === 'pagina' ? <PaginaView slug={rota.slug} escuro={escuro} /> : null}
      {rota.nome === 'desconhecida' ? (
        <main className="conteudo">
          <p>Rota não reconhecida.</p>
          <a href="#/">Voltar ao painel</a>
        </main>
      ) : null}
    </div>
  )
}
