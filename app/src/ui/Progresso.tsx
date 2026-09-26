import { useEffect, useState } from 'react'
import { content } from '../infrastructure/content/repository'
import { aprovouNoCriterio, interpretarCriterio } from '../domain/criterio'
import { dominioDaArea } from '../domain/dominio'
import { diasComEstudo, filaDoProgresso, resultadoDoCheckpoint } from '../domain/progresso'
import type { Area } from '../domain/types'
import {
  abrirPassagem,
  exportar,
  importar,
  marcarLido,
  ondeFicaOProgresso,
  recomecarComConfirmacao,
  registrarCheckpoint,
  registrarRecuperacao,
  useFalhaAoGravar,
  useProgresso,
} from '../application/progresso-store'
import { BlocoQA } from './Blocos'
import { linkTema } from './useRota'

const FORMATO_DATA = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

function dataCurta(iso: string): string {
  return FORMATO_DATA.format(new Date(iso))
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

  return (
    <section className="secao veredito">
      <h3>Como foi nesta passagem?</h3>
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
            ? 'Tema consolidado: sai da fila de revisão.'
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
 * Resumo do topo do painel.
 *
 * Sem XP, sem nivel, sem sequencia de dias: tudo isso mediria cliques do proprio
 * usuario, e a secao 8 do CONTRIBUTING pede marcos e autoavaliacao, sem gamificacao
 * artificial. Ficam as tres coisas acionaveis ou verificaveis, cada uma com a regua
 * ao lado: a fila (com link), os temas firmes e os checkpoints no criterio do guia.
 */
export function ResumoProgresso() {
  const progresso = useProgresso()
  const agora = new Date()
  const fila = filaDoProgresso(progresso, agora)
  const dominios = content.areas.map((a) => dominioDaArea(a, progresso))
  const totalTemas = content.meta.totais.temas
  const firmes = dominios.reduce((n, d) => n + d.firmes, 0)
  const aprovados = dominios.filter((d) => d.checkpointAprovado === true).length
  const respondidos = dominios.filter((d) => d.checkpointAprovado !== null).length
  return (
    <section className="resumo">
      <div className="resumo-item resumo-largo">
        <span className="resumo-rotulo">Fila de hoje</span>
        <strong>{fila.length === 0 ? 'nada vencido' : `${fila.length} tema(s)`}</strong>
        {fila.length ? (
          <ul className="resumo-fila">
            {fila.slice(0, 5).map((e) => (
              <li key={e.ref}>
                <a href={linkTema(e.ref)}>{content.temas[e.ref]?.titulo ?? e.ref}</a>
                <span className="resumo-data">{dataCurta(e.proximaRevisao)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="resumo-detalhe">nada vencido em D+1, D+7 ou D+30.</span>
        )}
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Temas firmes</span>
        <strong>
          {firmes} de {totalTemas}
        </strong>
        <span className="resumo-detalhe">
          firme é o tema cuja última recuperação ativa foi acertada sem consulta.
        </span>
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Checkpoints</span>
        <strong>
          {aprovados} de {dominios.length}
        </strong>
        <span className="resumo-detalhe">
          {respondidos === 0
            ? 'nenhum checkpoint respondido ainda; o critério é o que cada guia declara.'
            : `${respondidos} respondido(s), no critério declarado em cada guia.`}
        </span>
      </div>

      <div className="resumo-item">
        <span className="resumo-rotulo">Dias com estudo</span>
        <strong>{diasComEstudo(progresso)}</strong>
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
  const [mensagem, setMensagem] = useState<string | null>(null)

  async function agir(acao: () => Promise<string | null>): Promise<void> {
    setMensagem(await acao())
  }

  return (
    <div className="acoes-progresso">
      <p className="resumo-detalhe">
        Progresso guardado {ondeFicaOProgresso()}. Leve o arquivo exportado se trocar de máquina.
      </p>
      {falhou ? (
        <p className="aviso-erro" role="alert">
          Não consegui gravar o progresso nesta sessão. Exporte para não perder o que já estudou.
        </p>
      ) : null}
      {mensagem ? (
        <p className="aviso-erro" role="alert">
          {mensagem}
        </p>
      ) : null}
      <div className="veredito-botoes">
        <button className="botao-secundario" onClick={() => void agir(exportar)}>
          Exportar progresso
        </button>
        <button className="botao-secundario" onClick={() => void agir(importar)}>
          Importar progresso
        </button>
        <button className="botao-secundario" onClick={() => void recomecarComConfirmacao()}>
          Recomeçar
        </button>
      </div>
    </div>
  )
}

/** Checkpoint da area: veredito por item, e o total e o que conta para o criterio. */
export function CheckpointArea({ areaId, area }: { areaId: string; area: Area }) {
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

  return (
    <>
      <BlocoQA
        titulo="9. Checkpoint da área"
        pares={area.guia.checkpoint}
        criterio={area.guia.criterio}
        veredictoPorItem={{
          obter: (i) => veredictos[i] ?? null,
          definir: (i, acertou) =>
            setVeredictos((atual) => atual.map((v, j) => (j === i ? acertou : v))),
        }}
      />
      <p className="dominio-checkpoint" role="status">
        {guardado
          ? `Último resultado registrado: ${guardado.acertos} de ${guardado.total}${
              aprovado === null
                ? '.'
                : aprovado
                  ? ' — aprovado no critério declarado.'
                  : ' — reprovado no critério declarado.'
            }`
          : 'Nenhum checkpoint registrado nesta área.'}
      </p>
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
