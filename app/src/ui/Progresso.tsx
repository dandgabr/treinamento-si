import { useEffect, useId, useState } from 'react'
import { content } from '../infrastructure/content/repository'
import { ponte } from '../infrastructure/storage/ponte'
import { aprovouNoCriterio, interpretarCriterio } from '../domain/criterio'
import { dominioDaArea } from '../domain/dominio'
import { diasComEstudo, resultadoDoCheckpoint } from '../domain/progresso'
import { intervaloDaCobranca, intervaloInicial } from '../domain/srs'
import type { Area } from '../domain/types'
import { filaComTarefas, tarefaDoTema } from '../application/revisao-espacada'
import {
  abrirPassagem,
  exportar,
  importar,
  marcarLido,
  ondeFicaOProgresso,
  recomecarComConfirmacao,
  registrarCheckpoint,
  registrarRecuperacao,
  useCarregado,
  useErroDeCarga,
  useFalhaAoGravar,
  useProgresso,
  type Aviso,
} from '../application/progresso-store'
import { BlocoQA, idDaSecao } from './Blocos'
import { irParaSecao, linkTema } from './useRota'

const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function dataCurta(iso: string): string {
  return FORMATO_DATA.format(new Date(iso))
}

/**
 * O que fazer nesta passagem, pela seção 11 do próprio tema.
 *
 * O intervalo sem linha na tabela devolve `null` — o caso dos rebaixados (D+3) e do degrau final
 * das trilhas (D+90), que a seção 11 de nenhum dos 109 temas tabela. Nesse caso o app NÃO
 * empresta a tarefa de outro intervalo: mostra que não há tarefa para este intervalo e devolve o
 * caminho da seção 10, que é a recuperação ativa do tema.
 */
export function TarefaDaPassagem({ refTema }: { refTema: string }) {
  const progresso = useProgresso()
  const tema = content.temas[refTema]
  const revisao = progresso.temas[refTema]?.revisao
  const intervaloDias = revisao ? intervaloDaCobranca(revisao) : intervaloInicial()
  const tarefa = tema ? tarefaDoTema(tema, intervaloDias) : null

  return (
    <p className={tarefa ? 'tarefa-da-passagem' : 'tarefa-da-passagem sem-tarefa'}>
      {tarefa ? (
        <>
          <strong>O que fazer nesta passagem (D+{tarefa.intervaloDias}):</strong> {tarefa.oQueFazer}
          {tarefa.seErrar ? ` Se errar: ${tarefa.seErrar}.` : ''}
        </>
      ) : (
        <>
          Não há tarefa tabelada para este intervalo (D+{intervaloDias}): a seção 11 do tema tabela
          D+1, D+7 e D+30. A passagem aqui é a recuperação ativa.{' '}
          <button
            type="button"
            className="botao-secundario"
            onClick={() => irParaSecao(idDaSecao(10))}
          >
            Ir para a seção 10
          </button>
        </>
      )}
    </p>
  )
}

/**
 * Veredito da recuperacao ativa: e ele que reagenda a revisao.
 *
 * O veredito e registrado uma vez por passagem. Depois disso os botoes somem e aparece
 * "Registrar nova passagem" — antes, repetir o mesmo clique avancava a escada do SRS a
 * cada toque e consolidava o tema sem o usuario ter retido.
 */
export function VereditoRecuperacao({ refTema }: { refTema: string }) {
  const progresso = useProgresso()
  const tema = progresso.temas[refTema]
  const registrado = tema?.recuperacaoOk ?? null
  const intervaloDias = tema ? intervaloDaCobranca(tema.revisao) : intervaloInicial()

  return (
    <section className="secao veredito">
      <h3>Como foi nesta passagem?</h3>
      <TarefaDaPassagem refTema={refTema} />
      {registrado === null ? (
        <>
          <p className="dica">
            Responda sem consultar o texto. Errar rebaixa o intervalo: o tema volta pela metade do
            prazo.
          </p>
          <div className="veredito-botoes">
            <button className="botao-secundario" onClick={() => registrarRecuperacao(refTema, true)}>
              Acertei sem consultar
            </button>
            <button className="botao-secundario" onClick={() => registrarRecuperacao(refTema, false)}>
              Errei ou consultei
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="proxima-revisao" role="status">
            Passagem registrada como <strong>{registrado ? 'acerto' : 'erro'}</strong>.
          </p>
          <button className="botao-secundario" onClick={() => abrirPassagem(refTema)}>
            Registrar nova passagem
          </button>
        </>
      )}
      {tema ? (
        <p className="proxima-revisao" role="status">
          {tema.revisao.consolidado
            ? // O consolidado não sai da fila para sempre: ele volta pela etapa final em D+90,
              // contada da passagem que acabou de consolidar (seção 6 das trilhas).
              `Tema consolidado: a escada está cumprida e a próxima passagem é a etapa final, em D+${intervaloDias} — ${dataCurta(tema.revisao.proximaRevisao)}.`
            : `Próxima revisão em D+${tema.revisao.intervaloDias} — ${dataCurta(tema.revisao.proximaRevisao)}.`}
          {tema.revisao.passagens > 0 ? ` Passagens: ${tema.revisao.passagens}.` : ''}
          {tema.revisao.rebaixamentos > 0 ? ` Rebaixamentos: ${tema.revisao.rebaixamentos}.` : ''}
        </p>
      ) : null}
    </section>
  )
}

/** Botao de leitura. Explicito de proposito: navegar nao devia contar como estudo. */
export function BotaoLido({ refTema }: { refTema: string }) {
  const progresso = useProgresso()
  const lido = progresso.temas[refTema]?.lido === true
  return (
    <button
      className={lido ? 'botao-secundario ativo' : 'botao-secundario'}
      aria-pressed={lido}
      onClick={() => marcarLido(refTema)}
    >
      {lido ? 'Lido' : 'Marcar como lido'}
    </button>
  )
}

/**
 * Quantos temas da fila aparecem antes do botao que abre o resto.
 *
 * A fila e um atalho para o que vence hoje, e nao um painel de acompanhamento: cinco itens
 * cabem no resumo sem empurrar o resto do painel para baixo, e o botao mostra o tamanho
 * real da fila em vez de esconder que ela continua.
 */
const FILA_VISIVEL = 5

/**
 * Resumo do topo do painel.
 *
 * Sem XP, sem nivel, sem sequencia de dias: tudo isso mediria cliques do proprio
 * usuario, e a secao 8 do CONTRIBUTING pede marcos e autoavaliacao, sem gamificacao
 * artificial. Ficam as tres coisas acionaveis ou verificaveis, cada uma com a regua
 * ao lado: a fila (com link), os temas firmes e os checkpoints no criterio do guia.
 */
export function ResumoProgresso() {
  const progresso = useProgresso()
  const carregado = useCarregado()
  const erroDeCarga = useErroDeCarga()
  const [filaToda, setFilaToda] = useState(false)
  const idFila = useId()
  const agora = new Date()
  // Enquanto a leitura nao volta, "0 de 109" e "nada vencido" seriam afirmacoes falsas: o
  // estado vazio e o nao lido sao indistinguiveis. Com a leitura falhando e pior — os zeros
  // diriam que nao ha nada quando o que ha e um arquivo que nao conseguimos abrir.
  const semDados = !carregado || erroDeCarga !== null
  // A fila traz a TAREFA de cada intervalo, lida da secao 11 do proprio tema: dizer a data e
  // esconder o exercicio, e o exercicio e o que a passagem pede.
  const fila = semDados ? [] : filaComTarefas(progresso, content.temas, agora)
  const dominios = semDados ? [] : content.areas.map((a) => dominioDaArea(a, progresso))
  const totalTemas = content.meta.totais.temas
  const firmes = dominios.reduce((n, d) => n + d.firmes, 0)
  const aprovados = dominios.filter((d) => d.checkpointAprovado === true).length
  const respondidos = dominios.filter((d) => d.checkpointAprovado !== null).length
  const visiveis = filaToda ? fila : fila.slice(0, FILA_VISIVEL)
  return (
    <section className="resumo">
      {semDados ? (
        <p className="resumo-detalhe resumo-largo">
          {carregado ? 'Não consegui ler o progresso guardado.' : 'carregando o progresso…'}
        </p>
      ) : null}
      <div className="resumo-item resumo-largo">
        <span className="resumo-rotulo">Fila de hoje</span>
        <strong>{semDados ? '—' : fila.length === 0 ? 'nada vencido' : `${fila.length} tema(s)`}</strong>
        {!semDados && fila.length ? (
          <ul className="resumo-fila" id={idFila}>
            {visiveis.map((item) => (
              <li key={item.ref} data-releitura={item.releituraCompleta}>
                <a href={linkTema(item.ref)}>{item.titulo}</a>
                <span className="resumo-intervalo">D+{item.intervaloDias}</span>
                <span className="resumo-data">{dataCurta(item.cobranca)}</span>
                {/* Duas passagens falhas seguidas mandam o tema para releitura completa antes
                    desta passagem: dizer isso aqui e o que evita a fila virar um lembrete de
                    data. */}
                {item.releituraCompleta ? (
                  <span className="selo selo-releitura">releitura completa antes desta passagem</span>
                ) : null}
                {item.consolidado ? (
                  <span className="selo selo-etapa-final">etapa final da trilha</span>
                ) : null}
                {item.tarefa ? (
                  <span className="resumo-tarefa">{item.tarefa.oQueFazer}</span>
                ) : (
                  // Intervalo sem linha na secao 11 do tema (os rebaixados e o D+90): o app nao
                  // empresta a tarefa de outro intervalo — diz que nao ha tarefa e leva de volta
                  // a secao 10, que e a recuperacao ativa do tema.
                  <span className="resumo-tarefa sem-tarefa">
                    Sem tarefa tabelada para este intervalo: a seção 11 do tema tabela D+1, D+7 e
                    D+30.{' '}
                    <a href={linkTema(item.ref, idDaSecao(10))}>Voltar à seção 10 do tema</a>
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : semDados ? null : (
          <span className="resumo-detalhe">nada vencido em D+1, D+7, D+30 ou D+90.</span>
        )}
        {/* O botao so existe quando ha o que abrir: com cinco ou menos, a lista ja e inteira. */}
        {fila.length > FILA_VISIVEL ? (
          <button
            type="button"
            className="botao-secundario resumo-ver-todos"
            aria-expanded={filaToda}
            aria-controls={idFila}
            onClick={() => setFilaToda((v) => !v)}
          >
            {filaToda ? `Mostrar só os ${FILA_VISIVEL} primeiros` : `Ver os ${fila.length} vencidos`}
          </button>
        ) : null}
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Temas firmes</span>
        <strong>{semDados ? '—' : `${firmes} de ${totalTemas}`}</strong>
        <span className="resumo-detalhe">
          firme é o tema cuja última recuperação ativa foi acertada sem consulta.
        </span>
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Checkpoints</span>
        <strong>{semDados ? '—' : `${aprovados} de ${dominios.length}`}</strong>
        <span className="resumo-detalhe">
          {semDados || respondidos === 0
            ? 'nenhum checkpoint respondido ainda; o critério é o que cada guia declara.'
            : `${respondidos} respondido(s), no critério declarado em cada guia.`}
        </span>
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Dias com estudo</span>
        <strong>{semDados ? '—' : diasComEstudo(progresso)}</strong>
        <span className="resumo-detalhe">
          um dia conta quando há leitura, pré-teste, recuperação ou checkpoint.
        </span>
      </div>

      <AcoesDeProgresso />
    </section>
  )
}

/** Exportar, importar e recomeçar — as mesmas ações do menu do aplicativo desktop. */
export function AcoesDeProgresso() {
  const falhou = useFalhaAoGravar()
  const progresso = useProgresso()
  const carregado = useCarregado()
  const erroDeCarga = useErroDeCarga()
  const [aviso, setAviso] = useState<Aviso>(null)
  // O aviso de "primeira vez" so vale depois da carga: antes dela, vazio e "nao lido" sao
  // indistinguiveis, e o painel diria "primeira vez aqui" a quem tem 100 temas.
  const nadaEstudado = carregado && Object.keys(progresso.temas).length === 0

  async function agir(acao: () => Promise<Aviso>): Promise<void> {
    try {
      setAviso(await acao())
    } catch (erro) {
      console.error('[progresso] falha na acao', erro)
      setAviso({ tipo: 'erro', texto: 'Não consegui concluir a ação.' })
    }
  }

  return (
    <div className="acoes-progresso">
      <p className="resumo-detalhe">
        Progresso guardado {ondeFicaOProgresso()}. Leve o arquivo exportado se trocar de máquina.
      </p>
      {!carregado ? <p className="resumo-detalhe">carregando o progresso…</p> : null}
      {erroDeCarga ? (
        <p className="aviso-erro" role="alert">
          {erroDeCarga}
        </p>
      ) : null}
      {nadaEstudado ? (
        <p className="resumo-detalhe">
          Primeira vez aqui? Se você já estudava pela versão de navegador, use{' '}
          <strong>Importar progresso</strong> com o arquivo que exportou de lá.
        </p>
      ) : null}
      {falhou ? (
        <p className="aviso-erro" role="alert">
          Não consegui gravar o progresso nesta sessão. Exporte para não perder o que já estudou.
        </p>
      ) : null}
      {aviso ? (
        <p className={aviso.tipo === 'erro' ? 'aviso-erro' : 'resumo-detalhe'} role="status">
          {aviso.texto}
        </p>
      ) : null}
      <div className="veredito-botoes">
        <button className="botao-secundario" onClick={() => void agir(exportar)}>
          Exportar progresso
        </button>
        {/* Importar e recomeçar escrevem. Numa sessão que não conseguiu ler o arquivo, as
            duas seriam destrutivas: recomeçar apagaria um arquivo que não lemos, e importar
            trocaria em memória sem gravar. */}
        <button
          className="botao-secundario"
          disabled={!!erroDeCarga}
          onClick={() => void agir(importar)}
        >
          Importar progresso
        </button>
        <button
          className="botao-secundario"
          disabled={!!erroDeCarga}
          onClick={() =>
            void agir(async () => {
              return await recomecarComConfirmacao()
            })
          }
        >
          Recomeçar
        </button>
      </div>
      <Versao />
    </div>
  )
}

/** Versao do aplicativo, quando ele roda na casca desktop. */
function Versao() {
  const [versao, setVersao] = useState<string | null>(null)
  useEffect(() => {
    const api = ponte()
    if (!api) return
    void api.versao().then(setVersao, () => setVersao(null))
  }, [])
  if (!versao) return null
  return <p className="resumo-detalhe">Aplicativo desktop, versão {versao}.</p>
}

/**
 * Checkpoint da area: veredito por item, e o total e o que conta para o criterio.
 *
 * O que o progresso guarda e o PLACAR (acertos e total); a marca de cada item e da passagem
 * que esta na tela. Por isso o texto abaixo separa as duas coisas: sem isso, quem recarrega
 * a pagina ve os botoes em branco logo depois de ler "resultado gravado" e conclui que o app
 * perdeu o que ele respondeu. Nada muda no formato do progresso — o campo por item nao
 * existe no estado, e um formato paralelo so criaria duas verdades para o mesmo dado.
 */
export function CheckpointArea({
  areaId,
  area,
  id,
}: {
  areaId: string
  area: Area
  /** Ancora do sumario, quando o bloco e uma das secoes numeradas da tela. */
  id?: string
}) {
  const progresso = useProgresso()
  const [veredictos, setVeredictos] = useState<(boolean | null)[]>(() =>
    area.guia.checkpoint.map(() => null),
  )
  const resultado = resultadoDoCheckpoint(veredictos)
  const acertos = resultado?.acertos ?? null
  const total = resultado?.total ?? null

  useEffect(() => {
    // Grava so quando todos os itens foram julgados: um parcial seria lido como
    // reprovacao pelo criterio. Depende de valores primitivos, entao nao redispara.
    if (acertos !== null && total !== null) registrarCheckpoint(areaId, acertos, total)
  }, [areaId, acertos, total])

  const guardado = progresso.checkpoints[areaId]
  const alvo = interpretarCriterio(area.guia.criterio)
  const aprovado = guardado
    ? aprovouNoCriterio(alvo, guardado.acertos, area.guia.checkpoint.length || guardado.total)
    : null
  const julgados = veredictos.filter((v) => v !== null).length

  return (
    <>
      <BlocoQA
        titulo="9. Checkpoint da área"
        pares={area.guia.checkpoint}
        criterio={area.guia.criterio}
        id={id}
        veredictoPorItem={{
          obter: (i) => veredictos[i] ?? null,
          definir: (i, acertou) =>
            setVeredictos((atual) => atual.map((v, j) => (j === i ? acertou : v))),
        }}
      />
      <p className="dominio-checkpoint" role="status">
        {guardado
          ? `Último resultado gravado: ${guardado.acertos} de ${guardado.total}${
              aprovado === null
                ? '.'
                : aprovado
                  ? ' — aprovado no critério declarado.'
                  : ' — reprovado no critério declarado.'
            }`
          : 'Nenhum checkpoint registrado nesta área.'}
      </p>
      {/* Só faz sentido dizer isto no caso em que a tela contradiz o dado guardado: placar
          registrado e nenhuma marca na tela. */}
      {guardado && julgados === 0 ? (
        <p className="dominio-checkpoint">
          Fica guardado o placar, e não a marca de cada item: por isso os botões voltam em branco
          ao reabrir. Julgar os itens de novo regrava o resultado.
        </p>
      ) : null}
    </>
  )
}

/** Situacao de uma area no guia, sempre com a regua ao lado do numero. */
export function SituacaoDaArea({ area }: { area: Area }) {
  const progresso = useProgresso()
  const d = dominioDaArea(area, progresso)

  return (
    <div className="situacao">
      <p role="status">
        <strong>
          {d.firmes} de {d.totalTemas}
        </strong>{' '}
        tema(s) firme(s) — firme é o tema cuja última recuperação ativa foi acertada sem consulta.
      </p>
      <p>
        Checkpoint:{' '}
        {d.checkpointAprovado === null
          ? 'ainda não respondido.'
          : d.checkpointAprovado
            ? 'aprovado no critério declarado.'
            : 'reprovado no critério declarado.'}
      </p>
      <p className="situacao-criterio">Critério do guia: {d.criterio}</p>
    </div>
  )
}
