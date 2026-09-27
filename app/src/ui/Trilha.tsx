import { content } from '../infrastructure/content/repository'
import { registrarArtefato, registrarDiagnostico, useProgresso } from '../application/progresso-store'
import {
  atividadesDoGuia,
  chaveDoArtefato,
  faseDeEstudoDasAreas,
  marcoDaArea,
  marcoDaFase,
  resumoDoDiagnostico,
  type MarcoDaArea,
} from '../domain/trilha'
import type { Area, DiagnosticoDaTrilha, Trilha } from '../domain/types'
import { Html } from './Blocos'
import { irParaSecao } from './useRota'

/**
 * Pre-teste diagnostico de uma trilha: os dez itens do material, com "Acertei: sim/nao" por item.
 *
 * O item, a abertura, a tabela de acertos e a nota em volta sao do material — esta tela so os
 * torna clicaveis. A leitura do ponto de entrada sai da tabela do proprio material ("0 a 3",
 * "4 a 7", "8 a 10") e so aparece com os dez itens julgados: com metade das respostas, o numero de
 * acertos descreveria uma prova que ninguem terminou.
 */
export function BlocoDiagnostico({
  slug,
  trilha,
}: {
  slug: string
  trilha: Trilha
}) {
  const diagnostico: DiagnosticoDaTrilha | null = trilha.diagnostico
  const progresso = useProgresso()
  if (!diagnostico) return null
  const resumo = resumoDoDiagnostico(trilha, progresso, slug)
  const julgados = resumo.veredictos.filter((v) => v !== null).length
  const total = diagnostico.itens.length

  return (
    <section className="secao bloco-diagnostico">
      <h3>{diagnostico.titulo}</h3>
      {diagnostico.introHtml ? <Html html={diagnostico.introHtml} /> : null}
      <ol className="lista-diagnostico">
        {diagnostico.itens.map((item, i) => {
          const veredito = resumo.veredictos[i] ?? null
          return (
            <li key={`${item.numero}-${i}`}>
              {/* `div`, e nao `p`: o texto do material vem com marcacao propria (`Html`), e um
                  `div` dentro de `p` e HTML invalido — o React avisa e o navegador separa os
                  dois, desmontando o item de quem le. O `.pergunta` e do CSS, nao da tag. */}
              <div className="pergunta">
                <span className="indice">{item.numero}</span>{' '}
                <Html html={item.origemHtml} />
              </div>
              <div
                className="veredicto-item"
                role="group"
                aria-label={`Acertei o item ${item.numero}`}
              >
                {/* O rótulo visível é o do material: a coluna da tabela se chama "Acertei". */}
                <span className="veredicto-rotulo" aria-hidden="true">
                  Acertei:
                </span>
                <button
                  type="button"
                  className={veredito === true ? 'botao-secundario ativo' : 'botao-secundario'}
                  aria-pressed={veredito === true}
                  aria-label={`Acertei o item ${item.numero}: sim`}
                  onClick={() => registrarDiagnostico(slug, i, true)}
                >
                  sim
                </button>
                <button
                  type="button"
                  className={veredito === false ? 'botao-secundario ativo' : 'botao-secundario'}
                  aria-pressed={veredito === false}
                  aria-label={`Acertei o item ${item.numero}: não`}
                  onClick={() => registrarDiagnostico(slug, i, false)}
                >
                  não
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="diagnostico-resultado">
        {resumo.resultado === null ? (
          <p className="resumo-detalhe" role="status">
            {julgados} de {total} itens julgados. A tabela abaixo é a do material; a faixa
            alcançada só é lida e destacada com os {total} julgados.
          </p>
        ) : (
          <p className="ponto-de-entrada" role="status">
            <strong>
              {resumo.resultado.acertos} de {resumo.resultado.total} acertos.
            </strong>{' '}
            {resumo.faixa
              ? `Ponto de entrada: ${resumo.faixa.pontoDeEntrada}`
              : 'Nenhuma faixa do material cobre este total de acertos.'}
          </p>
        )}
        {diagnostico.faixas.length ? (
          <table className="tabela-diagnostico">
            <thead>
              <tr>
                {diagnostico.cabecalhoDasFaixas.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {diagnostico.faixas.map((faixa) => (
                <tr
                  key={faixa.rotulo}
                  className={resumo.faixa === faixa ? 'alcancada' : undefined}
                >
                  <th scope="row">{faixa.rotulo}</th>
                  <td>{faixa.pontoDeEntrada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>

      {diagnostico.notaHtml ? <Html html={diagnostico.notaHtml} /> : null}
    </section>
  )
}

/** O id do cabecalho de uma fase: o alvo do "checklist da fase X" das fases de retomada. */
function idDaFase(indice: number): string {
  return `fase-${indice + 1}`
}

/**
 * A frase do marco, a mesma no bloco da area e na linha de retomada.
 *
 * Sem contagem de condicoes: a secao 7 das trilhas declara mais de uma, e um numero escrito aqui
 * envelheceria se a trilha (ou o app) passar a exigir a terceira. A frase nomeia as condicoes sem
 * dizer quantas sao.
 *
 * O checkpoint e o criterio vem de `marcoDaArea`, que os le do guia da area: a trilha nao copia
 * limiar nenhum, e as duas telas que mostram o marco dizem a mesma coisa.
 */
function estadoDoMarco(marco: MarcoDaArea): string {
  const checkpoint =
    marco.checkpointAprovado === null
      ? 'ainda não respondido'
      : marco.checkpointAprovado
        ? 'aprovado no critério declarado'
        : 'reprovado no critério declarado'
  return `Checkpoint: ${checkpoint}. Artefatos produzidos: ${marco.produzidos} de ${marco.artefatos}.`
}

/**
 * A lista da secao 8 do guia de uma area: uma caixa por artefato, com o pre-requisito tecnico do
 * material ao lado e a data da producao quando ha.
 *
 * A lista e a do material, inteira — a secao 3.2 da trilha diz que o artefato da area e "a
 * atividade sem pre-requisito tecnico, mais as que o time aceitar conduzir com voce", e as duas
 * coisas so ficam visiveis se a lista mostrar as duas. Guia sem a tabela nao inventa atividade: a
 * tela diz que o material nao a traz.
 */
function ListaDeArtefatos({ area }: { area: Area }) {
  const progresso = useProgresso()
  const atividades = atividadesDoGuia(area.guia)
  if (!atividades.length) {
    return <p className="resumo-detalhe">O guia desta área não traz a tabela de atividades da seção 8.</p>
  }
  return (
    <ul className="lista-artefatos">
      {atividades.map((atividade) => {
        const chave = chaveDoArtefato(area.areaId, atividade.numero)
        const registro = progresso.artefatos[chave]
        return (
          <li key={chave} className="artefato" data-produzido={registro?.produzido === true}>
            <label>
              <input
                type="checkbox"
                checked={registro?.produzido === true}
                onChange={(evento) => registrarArtefato(chave, evento.currentTarget.checked)}
              />
              <span className="artefato-texto">{atividade.texto}</span>
            </label>
            <span className="artefato-pre-requisito">
              Pré-requisito técnico: {atividade.preRequisito || 'não declarado'}
              {atividade.semPreRequisitoTecnico
                ? ' — a atividade que a trilha toma como artefato'
                : ''}
            </span>
            {registro?.produzido === true && registro.data ? (
              <span className="artefato-data">Produzido em {registro.data}</span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

/**
 * O bloco de uma area dentro de uma fase.
 *
 * Na fase que ESTUDA a area — a primeira que a secao 3 liga a ela (`faseDeEstudoDasAreas`) — vem o
 * bloco inteiro: o nome, o estado do marco e a lista de artefatos da secao 8 do guia. Nas fases
 * que a retomam vem a linha de retomada: o nome, o MESMO estado do marco e o caminho ate o
 * checklist.
 *
 * A separacao nao e estetica. O estado do artefato e um so (`areaId#numero`), entao a caixa e uma
 * so: repetir a lista faria a mesma pergunta duas vezes, com o mesmo nome acessivel e o mesmo
 * estado por tras — quem marca numa ve a outra mudar sem tocar nela, e a mesma data de producao
 * apareceria duas vezes na tela.
 */
function AreaDoChecklist({
  area,
  checklistEm,
}: {
  area: Area
  /** A fase que tem a lista de artefatos da area — `null` quando a lista e DESTA fase. */
  checklistEm: { id: string; rotulo: string } | null
}) {
  const progresso = useProgresso()
  const marco = marcoDaArea(area, progresso)

  if (!checklistEm) {
    return (
      <li className="area-marco" data-cumprido={marco.cumprido}>
        <p className="area-marco-nome">
          <a href={`#/area/${area.areaId}`}>{area.areaNome}</a>{' '}
          <span className={marco.cumprido ? 'selo selo-cumprido' : 'selo'}>
            {marco.cumprido ? 'marco cumprido' : 'marco pendente'}
          </span>
        </p>
        <p className="area-marco-condicao">{estadoDoMarco(marco)}</p>
        <ListaDeArtefatos area={area} />
      </li>
    )
  }

  return (
    <li className="area-retomada" data-cumprido={marco.cumprido}>
      <p className="area-retomada-nome">
        <a href={`#/area/${area.areaId}`}>{area.areaNome}</a>{' '}
        <span className="area-retomada-condicao">{estadoDoMarco(marco)}</span>
      </p>
      <p className="area-retomada-onde">
        {/* A mesma forma dos outros botoes de acao do app: sem classe o navegador desenharia o
            botao padrao dele, que no tema escuro destoa da tela inteira. */}
        <button
          type="button"
          className="botao-secundario"
          onClick={() => irParaSecao(checklistEm.id)}
        >
          Checklist da fase {checklistEm.rotulo}
        </button>
        {': a fase que estuda a área, onde ficam as caixas dos artefatos dela.'}
      </p>
    </li>
  )
}

/**
 * Checklist da trilha: as fases da secao 3, com o marco de cada area.
 *
 * O marco so fecha com as condicoes que a secao 7 da trilha declara: o checkpoint da area no
 * criterio que o proprio guia declara e o artefato da secao 8 produzido. O criterio nao e copiado
 * para ca — quem responde por ele e o guia, pela mesma leitura que a tela da area usa.
 *
 * Toda fase mostra as areas que a secao 3 liga a ela e o estado do marco de cada uma; a lista de
 * artefatos (com as caixas) aparece uma unica vez por area, na fase que a estuda — a mesma area
 * pode estar em duas fases, e o estado do artefato e um so.
 */
export function ChecklistDaTrilha({ trilha }: { trilha: Trilha }) {
  const progresso = useProgresso()
  const porId = new Map(content.areas.map((a) => [a.areaId, a]))
  // Uma area pode ser ligada a mais de uma fase (a segunda passagem religa as dezoito). O
  // checklist dela — e as caixas — mora na fase que a estuda, e as que a retomam apontam para la.
  const checklistEm = faseDeEstudoDasAreas(trilha.fases)

  return (
    <section className="secao checklist-trilha">
      <h2 id="checklist-da-trilha" tabIndex={-1}>
        Checklist da trilha
      </h2>
      <p className="dica">
        O marco de cada área fecha com as condições que a seção 7 desta trilha declara: o checkpoint
        no critério do próprio guia e o artefato da seção 8 produzido. As atividades listadas são as
        do guia da área, com o pré-requisito técnico que o material declara.
      </p>
      {trilha.fases.map((fase, indice) => {
        const marco = marcoDaFase(fase, content.areas, progresso)
        const areas = fase.areas.flatMap((id) => {
          const area = porId.get(id)
          return area ? [area] : []
        })
        return (
          <div className="fase" key={fase.rotulo} data-cumprida={marco.cumprido}>
            <h3 id={idDaFase(indice)} tabIndex={-1}>
              <span className="fase-rotulo">{fase.rotulo}</span>
              {fase.periodo ? <span className="selo">{fase.periodo}</span> : null}
            </h3>
            {fase.marco ? (
              <p className="fase-marco">
                <strong>Marco de saída:</strong> {fase.marco}
              </p>
            ) : null}
            <p className="fase-estado" role="status">
              {marco.semArea
                ? 'Esta fase não é ligada a uma área na seção 3 da trilha: o marco é o que o material declara ao lado.'
                : marco.cumprido
                  ? `Marco da fase cumprido: as ${marco.marcos.length} áreas com checkpoint aprovado e artefato produzido.`
                  : `Marco da fase pendente: ${marco.cumpridas} de ${marco.marcos.length} áreas cumpriram as condições.`}
            </p>
            {areas.length ? (
              <ul className="lista-areas-fase">
                {areas.map((area) => {
                  const dona = checklistEm.get(area.areaId) ?? indice
                  return (
                    <AreaDoChecklist
                      key={area.areaId}
                      area={area}
                      checklistEm={
                        dona === indice
                          ? null
                          : { id: idDaFase(dona), rotulo: trilha.fases[dona]?.rotulo ?? '' }
                      }
                    />
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}
    </section>
  )
}
