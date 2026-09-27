import { useEffect, useMemo, useRef, useState } from 'react'
import { content, erroConteudo } from '../infrastructure/content/repository'
import { gravarTexto, lerTexto } from '../infrastructure/storage/local'
import type { Pagina } from '../domain/types'
import { AreaView } from './AreaView'
import {
  Html,
  idDaSecao,
  Principal,
  Secoes,
  Sumario,
  useCabecalhos,
  type ItemDeSumario,
} from './Blocos'
import { Glossario, lerGlossario } from './Glossario'
import { renderizarMermaid } from './mermaid'
import { ResumoProgresso } from './Progresso'
import { Quiz } from './Quiz'
import { ThemeView } from './ThemeView'
import { BlocoDiagnostico, ChecklistDaTrilha } from './Trilha'
import { focarConteudo, irParaSecao, linkQuiz, useRota, type Rota } from './useRota'

const CHAVE_TEMA = 'roadmap:tema'
const NOME_DO_APP = 'Roadmap CISO'

/**
 * De onde vem o tema da tela: do sistema ou de uma escolha de quem usa o app.
 *
 * "sistema" e o estado inicial de todo mundo e o unico que nao grava nada: o `data-theme`
 * fica em "auto" e quem responde ao `prefers-color-scheme` e o `styles.css`. Gravar a
 * preferencia na primeira abertura congelaria o sistema (numa maquina que troca de tema ao
 * anoitecer, o app ficaria no tema da primeira visita).
 */
type ModoTema = 'sistema' | 'claro' | 'escuro'

const ROTULO_DO_TEMA: Record<ModoTema, string> = {
  sistema: 'sistema',
  claro: 'claro',
  escuro: 'escuro',
}

/** O ciclo do botao: sistema -> claro -> escuro -> sistema. */
const PROXIMO_TEMA: Record<ModoTema, ModoTema> = {
  sistema: 'claro',
  claro: 'escuro',
  escuro: 'sistema',
}

function temaGuardado(): ModoTema {
  const salvo = lerTexto(CHAVE_TEMA)
  return salvo === 'claro' || salvo === 'escuro' ? salvo : 'sistema'
}

/**
 * Titulo da janela, por rota.
 *
 * O `<title>` do `index.html` vale para a primeira pintura, antes do bundle; deixado como
 * estava, ele nomeava as ~150 telas do app e a lista de abas virava uma repeticao. O nome do
 * app entra como sufixo, e o mesmo titulo que a tela mostra no `h1` vem primeiro.
 */
function tituloDaRota(rota: Rota): string {
  const titulo = (nome: string): string => `${nome} · ${NOME_DO_APP}`
  if (rota.nome === 'area') {
    return titulo(content.areas.find((a) => a.areaId === rota.areaId)?.areaNome ?? 'Área não encontrada')
  }
  if (rota.nome === 'tema') {
    return titulo(content.temas[rota.ref]?.titulo ?? 'Tema não encontrado')
  }
  if (rota.nome === 'pagina') {
    return titulo(content.paginas.find((p) => p.slug === rota.slug)?.titulo ?? 'Página não encontrada')
  }
  if (rota.nome === 'quiz') {
    const tema = rota.areaId && rota.temaId ? content.temas[`${rota.areaId}#${rota.temaId}`] : undefined
    if (tema) return titulo(`Quiz — ${tema.titulo}`)
    const area = rota.areaId ? content.areas.find((a) => a.areaId === rota.areaId) : undefined
    return titulo(area ? `Quiz — ${area.areaNome}` : 'Quiz de múltipla escolha')
  }
  if (rota.nome === 'desconhecida') return titulo('Rota não reconhecida')
  return titulo('Painel')
}

/** Minimo de cabecalhos para o sumario valer a pena numa pagina de referencia. */
const MIN_ITENS_SUMARIO_PAGINA = 2

function Home() {
  const referencias = content.paginas.filter((p) => p.grupo === 'referencia')
  const catalogos = content.paginas.filter((p) => /^(90|91|99)-/.test(p.grupo))

  return (
    <Principal>
      <header className="hero">
        <h1>Roadmap CISO</h1>
        <p>
          {content.meta.totais.areas} áreas · {content.meta.totais.temas} temas ·{' '}
          {content.areas.reduce((n, a) => n + a.guia.checkpoint.length, 0)} itens de checkpoint
        </p>
      </header>

      <ResumoProgresso />

      <section className="secao">
        <h2>Praticar</h2>
        <p className="dica">
          Múltipla escolha derivada das tabelas de erros comuns dos temas: uma questão por vez, com
          acerto ou erro, justificativa, fonte e o caminho de volta ao material de origem. A
          recuperação ativa dos temas e o checkpoint dos guias não entram aqui — os dois seguem no
          material e na tela, com o gabarito sob demanda. O item que ainda não passou por revisão
          humana aparece marcado.
        </p>
        <p className="acoes-tema">
          <a className="botao-secundario" href={linkQuiz()}>
            Quiz de múltipla escolha
          </a>
        </p>
        <p className="dica">
          A rodada se restringe a uma área ou a um tema só no seletor do topo do quiz — e o botão
          "Praticar este tema", no fim de cada tema, já abre a rodada dele.
        </p>
      </section>

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
    </Principal>
  )
}

function PaginaView({ slug, escuro }: { slug: string; escuro: boolean }) {
  const pagina = content.paginas.find((p) => p.slug === slug)

  if (!pagina) {
    return (
      <Principal>
        <p>Página não encontrada: {slug}</p>
        <a href="#/">Voltar ao painel</a>
      </Principal>
    )
  }
  // `key` pelo slug: pagina nova e container novo, que e o que o Mermaid precisa para
  // redesenhar (ele marca os nos que ja processou e pula os demais).
  return <PaginaConteudo key={pagina.slug} pagina={pagina} escuro={escuro} />
}

function PaginaConteudo({ pagina, escuro }: { pagina: Pagina; escuro: boolean }) {
  // O intro de uma pagina pode conter diagrama (o mapa de relacoes tem), entao este
  // container tambem precisa disparar a renderizacao do Mermaid.
  const containerRef = useRef<HTMLElement>(null)
  // O material sem `## N.` (glossario, mapa de relacoes) cai inteiro no `intro`: os
  // cabecalhos de la dentro sao o sumario e as ancoras que a tela tem.
  const cabecalhos = useCabecalhos(pagina.intro, 'intro')
  const porSecao = pagina.secoes.length > 0
  // As trilhas trazem o diagnostico e as fases de forma estruturada (`extrairTrilha`, no build).
  const trilha = pagina.trilha ?? null
  const itens: ItemDeSumario[] = porSecao
    ? pagina.secoes.map((s) => ({ id: idDaSecao(s.numero), numero: s.numero, texto: s.titulo }))
    : cabecalhos.itens
  // O checklist da trilha e bloco do app, e nao secao do material: sem uma entrada no indice ele
  // ficaria no fim da pagina sem caminho ate ele.
  if (trilha?.fases.length) itens.push({ id: 'checklist-da-trilha', texto: 'Checklist da trilha' })
  // Pagina de referencia com tabela de verbetes (o glossario): ela ganha indice por area,
  // busca e um endereco por termo. As outras seguem no HTML tratado, como sempre.
  const glossario = useMemo(
    () => (porSecao ? null : lerGlossario(cabecalhos.html, pagina.slug)),
    [porSecao, cabecalhos.html, pagina.slug],
  )

  useEffect(() => {
    if (containerRef.current) void renderizarMermaid(containerRef.current, escuro)
  }, [pagina, escuro])

  return (
    <Principal refPrincipal={containerRef}>
      <nav className="migalhas">
        <a href="#/">Painel</a> / <span>{pagina.titulo}</span>
      </nav>
      <header className="cabecalho-tema">
        <h1>{pagina.titulo}</h1>
      </header>
      {glossario ? (
        <Glossario estrutura={glossario} escuro={escuro} />
      ) : (
        <>
          {itens.length >= MIN_ITENS_SUMARIO_PAGINA ? <Sumario itens={itens} /> : null}
          <Html key={`intro-${escuro}`} className="intro" html={porSecao ? pagina.intro : cabecalhos.html} />
          <Secoes
            secoes={pagina.secoes}
            escuro={escuro}
            depoisDaSecao={
              trilha?.diagnostico
                ? {
                    numero: trilha.diagnostico.secao,
                    conteudo: <BlocoDiagnostico slug={pagina.slug} trilha={trilha} />,
                  }
                : undefined
            }
          />
          {trilha?.fases.length ? <ChecklistDaTrilha trilha={trilha} /> : null}
        </>
      )}
    </Principal>
  )
}

export function App() {
  const rota = useRota()
  const [tema, setTema] = useState<ModoTema>(temaGuardado)
  const sistemaEscuro = useSistemaEscuro()
  // O Mermaid escolhe o tema do diagrama em JavaScript, e nao pela folha: ele precisa do
  // valor ja resolvido. No modo "sistema", quem responde e o `matchMedia` abaixo.
  const escuro = tema === 'escuro' || (tema === 'sistema' && sistemaEscuro)
  // A rota da montagem: o foco so se move quando a rota MUDA. Quem abre o app no meio de um
  // tema escolheu aquela tela, e nao pediu para pular para o conteudo.
  const rotaInicial = useRef(rota)

  // A escolha mora no `data-theme`; "sistema" vira "auto" e quem decide e o
  // `prefers-color-scheme` do `styles.css`. Nada e gravado na montagem: o efeito depende do
  // estado, entao a preferencia do sistema continua valendo enquanto ninguem escolher.
  useEffect(() => {
    document.documentElement.dataset.theme = tema === 'sistema' ? 'auto' : tema
  }, [tema])

  useEffect(() => {
    document.title = tituloDaRota(rota)
  }, [rota])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [rota])

  // Troca de rota: o foco vai para o conteudo novo. Sem isto quem usa leitor de tela
  // continua no cabecalho da tela anterior, e o primeiro TAB da a volta pela navegacao.
  useEffect(() => {
    const mudou = rotaInicial.current !== rota
    rotaInicial.current = rota
    // Rota que termina num alvo (`#/area/01-fundamentos/secao-4`, `#/tema/<area>/<tema>/secao-10`,
    // `#/pagina/glossario/termo-tls`): o foco e a rolagem sao do alvo, e nao do topo da tela —
    // quem abre o endereco da secao 4 do guia quer a secao 4, e quem vem da fila de hoje quer a
    // secao 10 do tema. Vale tambem na montagem, que e o caso do link compartilhado aberto
    // direto. A area entra com o guia dela: e dele que sai a ancora do material
    // (`README.md#4-temas` -> `#/area/01-fundamentos/secao-4`).
    const ancora =
      rota.nome === 'area' || rota.nome === 'tema' || rota.nome === 'pagina' ? rota.ancora : null
    if (ancora !== null && irParaSecao(ancora)) return
    if (mudou) focarConteudo()
  }, [rota])

  function trocarTema(): void {
    const proximo = PROXIMO_TEMA[tema]
    setTema(proximo)
    gravarTexto(CHAVE_TEMA, proximo)
  }

  const proximo = PROXIMO_TEMA[tema]

  return (
    <div className="app">
      {/* Primeiro alvo de tabulacao da tela: quem chega pelo teclado pula o cabecalho sem
          passar por cada link dele. */}
      <button type="button" className="pular" onClick={() => focarConteudo(true)}>
        Pular para o conteúdo
      </button>

      <header className="topo">
        <a className="marca" href="#/">
          Roadmap CISO
        </a>
        <div className="topo-acoes">
          <button
            className="botao-secundario"
            onClick={trocarTema}
            aria-label={`Tema: ${ROTULO_DO_TEMA[tema]}. Trocar para ${ROTULO_DO_TEMA[proximo]}.`}
          >
            Tema: {ROTULO_DO_TEMA[tema]}
          </button>
        </div>
      </header>

      {erroConteudo ? <p className="aviso-erro">{erroConteudo}</p> : null}

      {rota.nome === 'home' ? <Home /> : null}
      {rota.nome === 'area' ? <AreaView areaId={rota.areaId} escuro={escuro} /> : null}
      {rota.nome === 'tema' ? <ThemeView key={rota.ref} refTema={rota.ref} escuro={escuro} /> : null}
      {rota.nome === 'pagina' ? <PaginaView slug={rota.slug} escuro={escuro} /> : null}
      {rota.nome === 'quiz' ? <Quiz areaId={rota.areaId} temaId={rota.temaId} /> : null}
      {rota.nome === 'desconhecida' ? (
        <Principal>
          <p>Rota não reconhecida.</p>
          <a href="#/">Voltar ao painel</a>
        </Principal>
      ) : null}
    </div>
  )
}

/**
 * A preferencia de tema do sistema, viva.
 *
 * O Mermaid nao le a folha de estilo: ele desenha com o tema que recebe em JavaScript, e sem
 * este observador um diagrama aberto no modo "sistema" ficaria com as cores da preferencia
 * antiga depois que o sistema trocasse de tema ao anoitecer.
 */
function useSistemaEscuro(): boolean {
  const [escuro, setEscuro] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const consulta = window.matchMedia('(prefers-color-scheme: dark)')
    const aoTrocar = (evento: MediaQueryListEvent) => setEscuro(evento.matches)
    consulta.addEventListener('change', aoTrocar)
    return () => consulta.removeEventListener('change', aoTrocar)
  }, [])
  return escuro
}
