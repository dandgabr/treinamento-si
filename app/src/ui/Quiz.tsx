// Tela de quiz de multipla escolha sobre o banco derivado do material.
//
// O banco nao e prosa nova: cada item saiu da tabela de erros comuns ou da recuperacao
// ativa de um tema, e por isso a tela sempre devolve o caminho de volta — justificativa,
// fonte e link do tema de origem. Quase tudo ainda esta `rascunho`, e o item nao revisado
// aparece marcado, sem alarme: o selo diz o que aconteceu, nao que o material errou.
//
// Tres decisoes de mecanica que valem o comentario:
//   - a rodada e montada UMA vez, na montagem (`useState`), e nao a cada render: o
//     progresso muda quando uma resposta e gravada, e reordenar as questoes no meio da
//     rodada trocaria a pergunta debaixo de quem esta respondendo;
//   - a escolha e um `input type=radio` dentro de `fieldset`, e nao botoes com
//     `aria-pressed`: escolha unica em grupo, "1 de 4" e navegacao por seta vem prontos do
//     navegador. Um `role="radiogroup"` feito a mao exigiria roving tabindex e teclado
//     reimplementados — mais codigo e mais jeito de errar;
//   - a troca de questao (e o fim da rodada) move o foco para um titulo com `tabIndex={-1}`.
//     O pai da escolha e um `button` que vira `disabled` ao avancar; sem mover o foco, o
//     Chrome o joga no `body` e os primeiros TABs vao para a navegacao, nao para as
//     alternativas.

import { useEffect, useId, useRef, useState } from 'react'
import {
  registrarQuestao,
  useErroDeCarga,
  useFalhaAoGravar,
  useProgresso,
} from '../application/progresso-store'
import type { Progresso } from '../domain/progresso'
import {
  acertou,
  priorizar,
  questoesDe,
  sortear,
  type Banco,
  type Questao,
} from '../domain/questoes'
import { content } from '../infrastructure/content/repository'
import { irPara, linkQuiz, linkTema } from './useRota'
import { useBanco } from './useBanco'

/**
 * Itens por rodada. A pausa de estudo cabe em 10; uma rodada longa vira maratona e o
 * resultado deixa de medir o que a pessoa reteve.
 */
const POR_RODADA = 10

/**
 * O que a tela marca e a AUSENCIA de revisao humana. `verificado` passou por ela e nao leva
 * selo: marcar todo item apagaria a diferenca entre o revisado e o que nao foi.
 */
function rotuloDeRevisao(status: Questao['status']): string | null {
  if (status === 'verificado') return null
  return status === 'rascunho' ? 'não revisado' : 'em revisão'
}

/** De onde o item saiu, em prosa, para a frase do selo. */
function origemEmProsa(questao: Questao): string {
  return questao.origem === 'erro-comum' ? 'tabela de erros comuns' : 'recuperação ativa'
}

/** A semente da proxima rodada nao pode repetir: ela entra na `key` que remonta a rodada. */
function proximaSemente(atual: number): number {
  return Math.max(Date.now(), atual + 1)
}

/**
 * A rodada de um escopo: sorteia os itens e decide em que ordem eles aparecem.
 *
 * A ordem das duas chamadas nao e detalhe. `sortear` e quem escolhe QUAIS itens entram na
 * rodada, de forma deterministica pela semente; `priorizar` decide a ordem de apresentacao
 * deles — a funcao do dominio declara exatamente isso, e um sorteio depois dela apagaria a
 * ordem (o Fisher-Yates embaralha a lista inteira). Priorizar antes de sortear, portanto,
 * nao teria efeito nenhum.
 */
function montarRodada(
  banco: Banco,
  areaId: string | null,
  progresso: Progresso,
  semente: number,
): Questao[] {
  const daVez = sortear(questoesDe(banco, areaId ?? undefined), POR_RODADA, semente)
  return priorizar(daVez, progresso)
}

export function Quiz({ areaId }: { areaId: string | null }) {
  const { banco, erro, carregando } = useBanco()
  // Sessao cuja leitura do progresso falhou: o store a marca como "nao pode gravar", mas
  // `falhaAoGravar` continua `false` — nao houve falha de gravacao, nada foi gravado. Quem
  // diz que a escrita esta desligada e o erro de carga. Sem ler este valor, a tela promete
  // abaixo que "cada resposta entra no seu progresso" enquanto nada sai da memoria.
  const erroDeCarga = useErroDeCarga()
  // O relogio entra so na abertura da tela e no "outra rodada": dentro da rodada a ordem
  // tem de ficar parada.
  const [semente, setSemente] = useState(() => Date.now())
  const area = areaId ? content.areas.find((a) => a.areaId === areaId) : undefined
  const titulo = area ? `Quiz — ${area.areaNome}` : 'Quiz de múltipla escolha'

  if (areaId && !area) {
    return (
      <main className="conteudo tela-quiz">
        <nav className="migalhas">
          <a href="#/">Painel</a> / <span>Quiz</span>
        </nav>
        <p>Área não encontrada: {areaId}</p>
        <a href="#/">Voltar ao painel</a>
      </main>
    )
  }

  return (
    <main className="conteudo tela-quiz">
      <nav className="migalhas">
        <a href="#/">Painel</a>
        {area ? (
          <>
            {' / '}
            <a href={`#/area/${area.areaId}`}>{area.areaNome}</a>
          </>
        ) : null}
        {' / '}
        <span>Quiz</span>
      </nav>

      <header className="cabecalho-tema">
        <h1>{titulo}</h1>
        <p className="meta">
          <span className="selo">{POR_RODADA} por rodada</span>
          <span className="selo">uma alternativa correta</span>
          {area ? <span className={`selo nivel-${area.nivel}`}>{area.nivel}</span> : null}
        </p>
        <p className="objetivo">
          Responda sem consultar o material. Ao confirmar a alternativa, a tela mostra o acerto ou
          o erro, a justificativa e a fonte, com o link do tema de origem — que é onde o item foi
          escrito. Cada resposta entra no seu progresso por item.
        </p>
      </header>

      {/* O aviso fica colado na frase que ele desmente: e o paragrafo acima que promete o
          registro, e numa sessao que perdeu a leitura do arquivo tudo fica so em memoria. */}
      {erroDeCarga ? (
        <p className="aviso-erro" role="alert">
          {erroDeCarga}
        </p>
      ) : null}

      <Escopo areaId={areaId} />

      {erro ? (
        <section className="secao">
          <p className="aviso-erro" role="alert">
            {erro}
          </p>
          <p className="dica">
            O resto do aplicativo continua funcionando: o banco é lido só nesta tela.
          </p>
          <a href="#/">Voltar ao painel</a>
        </section>
      ) : carregando ? (
        <p className="dica">carregando o banco de questões…</p>
      ) : banco ? (
        // A `key` e o que garante rodada nova quando o escopo muda ou quando se pede outra
        // rodada, sem que a lista se remexa a cada resposta gravada.
        <Rodada
          key={`${areaId ?? 'todas'}-${semente}`}
          banco={banco}
          areaId={areaId}
          semente={semente}
          aoTrocarRodada={() => setSemente(proximaSemente)}
        />
      ) : null}
    </main>
  )
}

/** Escopo da rodada: uma area, ou todas. */
function Escopo({ areaId }: { areaId: string | null }) {
  const id = useId()
  return (
    <p className="escopo">
      <label htmlFor={id}>Escopo da rodada</label>
      <select
        id={id}
        value={areaId ?? ''}
        onChange={(evento) => irPara(linkQuiz(evento.target.value || undefined))}
      >
        <option value="">Todas as áreas</option>
        {content.areas.map((a) => (
          <option key={a.areaId} value={a.areaId}>
            {a.areaNome}
          </option>
        ))}
      </select>
    </p>
  )
}

function Rodada({
  banco,
  areaId,
  semente,
  aoTrocarRodada,
}: {
  banco: Banco
  areaId: string | null
  semente: number
  aoTrocarRodada: () => void
}) {
  const progresso = useProgresso()
  const falhouAoGravar = useFalhaAoGravar()
  const erroDeCarga = useErroDeCarga()
  // `useState` e nao `useMemo`: a lista tem de nascer uma vez e ficar — o progresso muda a
  // cada resposta gravada e um `useMemo` dependente dele remexeria a rodada no meio.
  const [itens] = useState<Questao[]>(() => montarRodada(banco, areaId, progresso, semente))
  const [indice, setIndice] = useState(0)
  // Marcacao e confirmacao sao duas coisas, e nao uma. Num grupo de radios, a seta para baixo
  // MARCA a proxima alternativa enquanto se le as opcoes: se marcar ja respondesse, percorrer
  // as alternativas com o teclado responderia sem querer e travaria a questao no meio da
  // leitura. `escolha` e a marcacao; `resposta` e o veredito, que so a confirmacao registra.
  const [escolha, setEscolha] = useState<number | null>(null)
  const [resposta, setResposta] = useState<boolean | null>(null)
  const [placar, setPlacar] = useState({ acertos: 0, erros: 0 })
  const base = useId()
  const resultadoRef = useRef<HTMLDivElement>(null)
  const perguntaRef = useRef<HTMLHeadingElement>(null)
  // O indice do render anterior e o que diz ao efeito abaixo se houve TROCA de questao: no
  // primeiro render ele ja e o indice atual, entao o foco nao se move (quem abriu a tela
  // escolheu onde estava) — e o duplo disparo do StrictMode reexecuta o efeito com o MESMO
  // indice, sem focar de novo.
  const indiceAnterior = useRef(indice)

  const respondidas = placar.acertos + placar.erros
  const questao = itens[indice]

  useEffect(() => {
    // Depois de responder, o grupo de alternativas fica `disabled` e o foco cairia no
    // `body`: sem isto, quem usa teclado recomeca a tabulacao do topo da pagina a cada
    // questao. O foco no proprio bloco do resultado tambem faz o leitor de tela anunciar
    // o veredito uma vez, e por isso ele nao leva `role="status"` — seriam dois anúncios.
    if (resposta !== null) resultadoRef.current?.focus()
  }, [resposta])

  useEffect(() => {
    if (indiceAnterior.current === indice) return
    indiceAnterior.current = indice
    // Ao avancar, o botao que estava focado vira `disabled` (nao ha resposta marcada na
    // questao nova) e o Chrome manda o foco para o `body`: os primeiros TABs iriam para a
    // navegacao, nao para as alternativas. O foco vem para o titulo da questao nova — que o
    // leitor de tela anuncia — e o proximo TAB cai no primeiro radio.
    perguntaRef.current?.focus()
  }, [indice])

  const resumo = (
    <ResumoDaRodada
      respondidas={respondidas}
      acertos={placar.acertos}
      erros={placar.erros}
      total={itens.length}
      semRevisao={itens.filter((i) => i.status !== 'verificado').length}
      falhouAoGravar={falhouAoGravar}
    />
  )

  if (!itens.length) {
    return (
      <>
        {resumo}
        <section className="secao">
          <h2>Sem itens neste escopo</h2>
          <p className="dica">
            O banco derivado do material não tem item {areaId ? 'nesta área' : 'nenhum'}. Rode
            `npm run build:questions` e recarregue.
          </p>
          <a href="#/">Voltar ao painel</a>
        </section>
      </>
    )
  }

  if (!questao) {
    return (
      <>
        {resumo}
        <FimDaRodada
          acertos={placar.acertos}
          respondidas={respondidas}
          areaId={areaId}
          erroDeCarga={erroDeCarga}
          aoTrocarRodada={aoTrocarRodada}
        />
      </>
    )
  }

  const respondida = resposta !== null
  const ultima = indice + 1 === itens.length
  const ganhou = resposta === true
  const textoCorreto = questao.alternativas[questao.correta]
  const rotulo = rotuloDeRevisao(questao.status)

  // `const` com arrow, e nao `function`: o `questao` que o `if` acima estreitou continua
  // estreitado dentro de uma closure criada depois dele, mas nao dentro de uma funcao
  // declarada — que e icada e pode, por isso, rodar antes do estreitamento.
  const responder = (): void => {
    // A confirmacao e explicita, e a primeira e a que conta: responder depois de ver o
    // gabarito mediria a leitura da resposta, e nao o que a pessoa sabia antes dela.
    if (respondida || escolha === null) return
    const ok = acertou(questao, escolha)
    setResposta(ok)
    setPlacar((atual) => ({
      acertos: atual.acertos + (ok ? 1 : 0),
      erros: atual.erros + (ok ? 0 : 1),
    }))
    registrarQuestao(questao.id, ok)
  }

  const avancar = (): void => {
    setEscolha(null)
    setResposta(null)
    setIndice((atual) => atual + 1)
  }

  return (
    <>
      {resumo}
      <section className="secao bloco-questao">
        <h2 tabIndex={-1} ref={perguntaRef}>
          Questão {indice + 1} de {itens.length}
        </h2>
        {rotulo ? (
          <p className="dica">
            <span className="selo selo-revisao">{rotulo}</span> Item derivado automaticamente da{' '}
            {origemEmProsa(questao)} do tema e ainda sem revisão humana: leia o gabarito como
            indicação e confira contra o material.
          </p>
        ) : null}

        <fieldset className="alternativas" disabled={respondida}>
          <legend className="pergunta">{questao.enunciado}</legend>
          <ul className="lista-alternativas">
            {questao.alternativas.map((texto, i) => {
              const marcada = escolha === i
              const certa = respondida && i === questao.correta
              const errada = respondida && marcada && i !== questao.correta
              const classe = `alternativa${certa ? ' certa' : ''}${errada ? ' errada' : ''}`
              return (
                <li key={i}>
                  <label className={classe}>
                    <input
                      type="radio"
                      name={base}
                      value={i}
                      checked={marcada}
                      onChange={() => setEscolha(i)}
                    />
                    <span className="alternativa-texto">{texto}</span>
                    {/* A marca em texto existe para quem nao enxerga a cor nem o radio — e o
                        leitor de tela le a marca junto do nome da alternativa. */}
                    {certa ? <span className="alternativa-marca">correta</span> : null}
                    {errada ? <span className="alternativa-marca">sua resposta</span> : null}
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>

        {respondida ? (
          <div
            className={ganhou ? 'gabarito' : 'gabarito erro'}
            ref={resultadoRef}
            tabIndex={-1}
          >
            <p className="veredito-questao">
              {ganhou ? (
                <>
                  <strong>Acertou.</strong> A alternativa marcada é a correta.
                </>
              ) : (
                <>
                  <strong>Errou.</strong>{' '}
                  {textoCorreto
                    ? `A alternativa correta é “${textoCorreto}”.`
                    : 'A alternativa correta está marcada acima.'}
                </>
              )}
            </p>
            {/* Item de recuperacao nao tem "porque" derivado: o gerador deixa o campo vazio
                em vez de inventar uma razao, e a tela nao pode exibir um rotulo sem texto. */}
            {questao.justificativa ? (
              <p>
                <strong>Por quê:</strong> {questao.justificativa}
              </p>
            ) : null}
            <p className="fonte-questao">
              <strong>Fonte:</strong>{' '}
              <a href={questao.fonte.url}>{questao.fonte.titulo}</a> ({questao.fonte.tipo})
            </p>
            <p className="volta-ao-tema">
              O item saiu do tema{' '}
              <a href={linkTema(questao.ref)}>{content.temas[questao.ref]?.titulo ?? questao.ref}</a>
              {questao.justificativa
                ? ': é lá que a justificativa está escrita, com o resto do assunto.'
                : ': é lá que a resposta está escrita, com o resto do assunto.'}
            </p>
          </div>
        ) : null}

        <p className="acoes-questao">
          {/* Um botao so, que muda de papel: enquanto nao ha veredito ele confirma a marcacao
              (`disabled` ate existir uma); depois, leva para a proxima questao. Trocar de
              botao remontaria o no e o foco se perderia no meio da transicao. */}
          <button
            className="botao-secundario"
            onClick={respondida ? avancar : responder}
            disabled={!respondida && escolha === null}
          >
            {respondida ? (ultima ? 'Ver o resultado' : 'Próxima questão') : 'Responder'}
          </button>
          {respondida ? null : (
            <span className="dica"> Marque uma alternativa e confirme; depois disso ela trava.</span>
          )}
        </p>
      </section>
    </>
  )
}

/** Desempenho da rodada, cada numero com a regua ao lado — o padrao do resto do app. */
function ResumoDaRodada({
  respondidas,
  acertos,
  erros,
  total,
  semRevisao,
  falhouAoGravar,
}: {
  respondidas: number
  acertos: number
  erros: number
  total: number
  semRevisao: number
  falhouAoGravar: boolean
}) {
  return (
    <section className="resumo">
      <div className="resumo-item">
        <span className="resumo-rotulo">Acertos nesta rodada</span>
        <strong>{respondidas === 0 ? '—' : `${acertos} de ${respondidas}`}</strong>
        <span className="resumo-detalhe">
          acerto é a alternativa certa na primeira marcação; a questão trava depois de respondida.
        </span>
      </div>
      <div className="resumo-item">
        <span className="resumo-rotulo">Erros</span>
        <strong>{respondidas === 0 ? '—' : erros}</strong>
        <span className="resumo-detalhe">
          errar aqui não rebaixa o tema — isso é da recuperação ativa; o que fica guardado é o
          resultado do item.
        </span>
      </div>
      <div className="resumo-item">
        <span className="resumo-rotulo">Sem revisão</span>
        <strong>{semRevisao === 0 ? 'nenhum' : `${semRevisao} de ${total}`}</strong>
        <span className="resumo-detalhe">
          item derivado automaticamente do material; a régua é a revisão declarada item a item, e
          quem promove é uma pessoa.
        </span>
      </div>
      {falhouAoGravar ? (
        <p className="aviso-erro resumo-largo" role="alert">
          Não consegui gravar o progresso nesta sessão: o resultado desta rodada vale só enquanto a
          página estiver aberta. Exporte antes de fechar.
        </p>
      ) : null}
    </section>
  )
}

function FimDaRodada({
  acertos,
  respondidas,
  areaId,
  erroDeCarga,
  aoTrocarRodada,
}: {
  acertos: number
  respondidas: number
  areaId: string | null
  erroDeCarga: string | null
  aoTrocarRodada: () => void
}) {
  const tituloRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // O botao que trouxe ate aqui ("Ver o resultado") sai de cena com a ultima questao e o
    // foco cairia no `body`. O titulo recebe o foco na montagem: o leitor de tela anuncia o
    // fim da rodada e o proximo TAB ja cai no "Outra rodada".
    tituloRef.current?.focus()
  }, [])

  return (
    <section className="secao">
      <h2 tabIndex={-1} ref={tituloRef}>
        Fim da rodada
      </h2>
      <p className="criterio" role="status">
        {respondidas === 0
          ? 'Nenhuma questão respondida nesta rodada.'
          : `Você acertou ${acertos} de ${respondidas}.`}
      </p>
      <p className="dica">
        O resultado de cada item entrou no progresso pelo identificador dele. A fila de revisão
        continua sendo a dos temas: quem reagenda é a recuperação ativa de cada um.
      </p>
      {/* Mesmo aviso do topo da tela, aqui colado na frase que ele desmente: numa sessao que
          perdeu a leitura do arquivo, "entrou no progresso" e so memoria, nao registro. */}
      {erroDeCarga ? (
        <p className="aviso-erro" role="alert">
          {erroDeCarga}
        </p>
      ) : null}
      <div className="veredito-botoes">
        <button className="botao-secundario" onClick={aoTrocarRodada}>
          Outra rodada
        </button>
        {areaId ? (
          <a className="botao-secundario" href={`#/area/${areaId}`}>
            Ver o guia da área
          </a>
        ) : null}
        <a className="botao-secundario" href="#/">
          Voltar ao painel
        </a>
      </div>
    </section>
  )
}
