---
tema: "Medir comportamento, não cliques"
tema_id: "TEMA-06"
area_id: "15-fatores-humanos"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Substituir um conjunto de métricas de atividade por indicadores com verdade de campo, dono e decisão associada, defendendo diante do comitê o que cada indicador muda na prática e declarando o que a organização ainda não mede"
atende_objetivo: [3, 4]
certificacoes: []
pre_requisitos: ["TEMA-01", "TEMA-03"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-05"
      motivo: "a crítica a indicador de volume e a exigência de dono por métrica valem igual para o indicador do programa de comportamento"
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "o indicador de comportamento entra no mesmo relatório de métricas e reporte que o comitê já recebe, com a mesma exigência de decisão associada"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-50 Rev. 1 — Building a Cybersecurity and Privacy Learning Program, setembro de 2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-50 — Building an Information Technology Security Awareness and Training Program, outubro de 2003, retirada em 12/09/2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA, NSA, FBI e MS-ISAC — Phishing Guidance: Stopping the Attack Cycle at Phase One, outubro de 2023"
    url: "https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Medir comportamento, não cliques

Uma ideia central: um indicador só vale se o dado que o alimenta tem verdade de campo, e a taxa de cliques em simulação não tem — ela mede o desenho da simulação, não a disposição da organização.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir substituir um conjunto de métricas de atividade por indicadores com verdade de campo, dono nomeado e decisão associada, sustentando diante do comitê o que cada um muda na prática e declarando por escrito o que a organização ainda não consegue medir.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-por-que-pessoas-sao-exploradas.md), para o vocabulário de decisão explorada, e [TEMA-03](./TEMA-03-programa-de-conscientizacao.md), que entrega o ciclo de vida do programa. Sem programa declarado, não existe o que avaliar.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual indicador do programa de conscientização você levaria hoje ao comitê, e qual decisão ele muda? Responda de palpite.
   Confiança: ___
2. Se uma pessoa receber uma mensagem suspeita real, quantas horas você acha que passam até a segurança saber? Chute um número.
   Confiança: ___
3. A taxa de cliques em simulação caiu no último ciclo. Você aposta que a disposição da organização melhorou? Sim, não ou não sei.
   Confiança: ___
## 4. Caso real

A NIST declara, para o programa de aprendizagem, que deve incentivar mudança de comportamento como parte da gestão de risco, e registra que a orientação inclui métricas sugeridas e métodos de avaliação para melhorar e atualizar o programa conforme as necessidades mudam
(https://csrc.nist.gov/pubs/sp/800/50/r1/final, acessado em 25/09/2026). A edição de 2003 já colocava a pós-implementação como a quarta etapa do ciclo de vida, e listava métricas entre suas palavras-chave
(https://csrc.nist.gov/pubs/sp/800/50/final, acessado em 25/09/2026).

O guia do CISA descreve uma verificação diferente da taxa de cliques. Ao recomendar programa de treinamento antiphishing para organizações com recursos limitados, ele pede revisão anual do material pelos empregados e, ao final, "a training check that certifies that the employee has retained all the information outlined in the training program". No mesmo documento, o reporte aparece como comportamento a ser ensinado — identificar item suspeito, não interagir e reportar — e como uma das formas mais eficientes de proteger a organização, porque ajuda o provedor de e-mail a identificar campanhas novas ou em curso
(https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf, acessado em 25/09/2026).

A pergunta que o caso deixa aberta: se o material recomendado é verificação de retenção e prática de reporte, de onde vem a taxa de cliques que aparece na maioria dos relatórios?

## 5. Conteúdo

### 5.1 Conceito

Um indicador precisa de cinco elementos para sobreviver à primeira reunião de comitê: unidade de medida, fonte do dado, dono, direção desejada e decisão que ele dispara. Quando falta o quinto, o indicador vira número decorativo, e o tempo gasto em coletá-lo sai do orçamento de trabalho real.

A taxa de cliques em simulação de *phishing* falha em elementos anteriores. O problema central é a ausência de verdade de campo: o clique acontece em uma mensagem que a organização fabricou, então o que ele mede depende do desenho da isca, da plausibilidade do remetente, de a simulação ser esperada e da política de bloqueio do ambiente. Nenhuma dessas variáveis descreve a disposição da organização a entregar credencial a um atacante real.

O segundo problema é o canal. Uma simulação por e-mail mede e-mail. O guia do CISA descreve abordagem por SMS, por aplicativos de mensagem em celular e por chamada com identificação falsificada, e observa que a interface reduzida do celular dificulta avaliar um endereço malicioso na tela. Um indicador de e-mail reporta sobre uma fração dos canais descritos.

O terceiro problema é o efeito sobre o comportamento que se quer medir. Um relatório nominal de quem clicou cria incentivo contra o reporte: quem erra e conta a verdade entra na lista. A recomendação do guia é ensinar a importância de reportar, o que é incompatível com transformar o reporte em peça de acusação.

O quarto problema é a relação com a decisão. A NIST pede métricas e métodos de avaliação que sirvam para melhorar e atualizar o programa. Um número que não muda conteúdo, canal, cadência ou público não atende a esse propósito, independentemente de quão fácil seja de coletar.

### 5.2 Como funciona

A construção de um indicador segue quatro passos.

Primeiro, escolha a decisão. Escreva a decisão antes do número: "se o tempo de reporte passar de X, mudo o canal" ou "se o acesso em massa não terminar em N dias após o desligamento, escalono para o dono do risco". Indicador sem decisão escrita é descartado nesta etapa, e é aqui que a maior parte das métricas de atividade cai.

Segundo, verifique a verdade de campo. A pergunta é se o dado observa o fenômeno que se quer medir, ou um substituto criado pela própria medição. Reporte de mensagem real observa comportamento real. Clique em isca fabricada observa o desenho da isca.

Terceiro, defina dono e periodicidade. O dono da métrica é quem toma a decisão que ela dispara, e não quem coleta o dado.

Quarto, defina o efeito da métrica sobre as pessoas medidas. Indicador que pune o reporte destrói a fonte de dado.

Aplicando os quatro passos, um conjunto enxuto de indicadores de comportamento fica assim.

| Indicador | O que observa | Fonte do dado | Decisão que dispara | Dono |
|---|---|---|---|---|
| Tempo entre entrega e primeiro reporte de mensagem suspeita | Velocidade de reconhecimento e de reporte no canal real | Data da mensagem e do reporte no canal interno | Ajustar canal, formulário e treinamento de reconhecimento | Segurança da informação |
| Volume de reportes por semana, com linha de base | Saúde do canal de reporte, não conformidade | Registro do canal interno | Comunicar de novo, ou reduzir atrito do formulário | Segurança da informação |
| Verificação de retenção ao final do ciclo do programa | O que permaneceu depois do conteúdo | Instrumento de verificação aplicado ao público | Refazer o material do público com pior retenção | Dono do programa de aprendizagem |
| Tipo de MFA e acompanhamento de login negado em conta privilegiada | Comportamento do controle diante de tentativa | Configuração de MFA e log de autenticação | Trocar tipo de fator na classe de conta mais exposta | Dono da identidade |
| Tempo entre aviso de desligamento e fim do acesso em massa | Comportamento da organização, não da pessoa | Registro de desligamento e log de acesso | Automatizar a retirada no aviso, com verificação | Dono do dado |
| Número de exceções concedidas sem critério e sem prazo | Consistência da decisão de risco | Registro de exceção | Escrever o critério e fechar as exceções antigas | Dono do risco |

Três dos seis indicadores medem comportamento da organização e não de pessoas. Isso é intencional: o resultado declarado pela NIST é mudança de comportamento ligada à gestão de risco, e parte dessa mudança se produz em quem escreve o critério, quem aprova o acesso e quem mantém a credencial.

### 5.3 Exemplo resolvido

Situação: o relatório trimestral de segurança traz três números — taxa de cliques em simulação, percentual de conclusão do módulo obrigatório e número de falhas na última campanha — e o comitê pergunta o que eles significam.

Passo 1. Teste cada número contra a verdade de campo.

| Número atual | O que realmente observa | Verdade de campo |
|---|---|---|
| Taxa de cliques na simulação | Desenho da isca, plausibilidade do remetente e expectativa sobre a simulação | Não |
| Percentual de conclusão do módulo | Presença registrada no sistema | Não, para comportamento |
| Falhas na última campanha | Repetição do item anterior, em outro recorte | Não |

Passo 2. Substitua por indicadores com decisão associada. Adote os três primeiros da tabela da seção 5.2, começando pelo tempo de reporte, porque a fonte de dado já existe no canal interno.

Passo 3. Escreva o critério de leitura de cada um. Exemplo para o tempo de reporte: se a mediana piorar dois trimestres seguidos, revisar canal e formulário; se o volume de reportes cair abaixo da linha de base, verificar se houve comunicação que desencorajou o reporte.

Passo 4. Declare o que não se mede. Neste caso, ficam fora a taxa de cliques, os canais que não geram registro e o efeito de longo prazo do programa sobre incidentes, que exigiria série histórica de eventos com decisão humana identificada.

Passo 5. Leve ao comitê o conjunto com a frase de decisão de cada indicador. O comitê decide sobre o que muda; a frase transforma o relatório em pedido de decisão em vez de boletim.

### 5.4 Problema de completar

Situação: a diretoria pede um indicador único de "maturidade de conscientização" para o painel trimestral. Complete as três últimas etapas.

1. Por que um indicador único não atende à exigência de métrica ligada à gestão de risco: _______
2. Indicador que você propõe em primeiro lugar e a fonte de dado dele: _______
3. Decisão que esse indicador dispara e dono: _______
4. Segundo indicador, de comportamento da organização: _______
5. O que você declara como não medido neste ciclo: _______

## 6. Por que isso importa para o CISO

Renovação de verba de conscientização depende de o comitê acreditar que o dinheiro muda risco. Uma taxa de cliques que cai depois de a organização anunciar as simulações produz uma melhora sem mudança de risco, e o efeito dura até a primeira auditoria que perguntar pela metodologia. Quando isso acontece, a credibilidade do programa inteiro é consumida junto.

O indicador de comportamento também muda a conversa sobre responsabilidade. Se o que se mede é o tempo de retirada do acesso em massa no desligamento, a conclusão aponta para um processo da organização e não para uma pessoa. Isso permite discutir correção de processo em vez de escapar para o debate sobre culpa individual.

Há um ganho de economia. Um programa com seis indicadores, sendo três deles já alimentados por log existente, custa menos de manter que um programa com simulações frequentes, relatórios nominais e tratamento de reclamação trabalhista por causa deles. A mesma NIST que pede avaliação pede que ela sirva para atualizar o programa — o que só acontece se o dado chegar a quem decide sobre conteúdo, canal e cadência.

Por fim, o tema se conecta ao reporte que o comitê já recebe. O indicador de comportamento entra no relatório de métricas junto com os indicadores de risco, na mesma linguagem de decisão. Se o relatório de risco já usa indicador de desempenho e de risco para comunicar, o indicador de conscientização entra como mais um item da mesma família.

## 7. Aplicação prática

Escolha o canal interno de reporte de mensagem suspeita e verifique se ele guarda data e hora de envio e de reporte. Com essas duas marcas, calcule o tempo do último mês para os dez últimos reportes e apresente a mediana ao dono do canal, sem nome de pessoa.

Depois escreva, em uma página, os três indicadores que você levará ao comitê no próximo ciclo, cada um com unidade, fonte, dono e decisão disparada, mais a lista do que ficou fora por falta de verdade de campo. Se a lista do que ficou fora estiver vazia, provavelmente algum indicador está medindo a própria medição.

## 8. Autoexplicação

Explique em três frases por que um relatório nominal de quem clicou na simulação reduz a capacidade da organização de detectar um ataque real. Se a explicação não mencionar o incentivo contra o reporte, releia a seção 5.1.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Taxa de cliques mede suscetibilidade" | O clique ocorre em mensagem fabricada pela própria organização, e o número descreve o desenho da isca | Meça tempo e volume de reporte em mensagem real |
| "Anunciar a simulação melhora o indicador" | A melhora vem da expectativa, não do comportamento | Se anunciar, não use o resultado como medida de risco |
| "Relatório individual de quem falhou aumenta a accountability" | Cria incentivo contra o reporte e destrói a única fonte que vê tentativa sem log | Trate reporte como comportamento a ser reforçado, sem exposição individual |
| "Conclusão de 100% é a meta do programa" | A NIST liga o programa a mudança de comportamento como parte da gestão de risco | Declare o comportamento esperado e a verificação de retenção |
| "Sem plataforma é impossível medir" | O recurso recomendado para organizações com poucos recursos é verificação de retenção e canal de reporte, que não exigem plataforma | Use o registro disponível e declare o que não é medido |
| "Métrica boa é métrica que sempre melhora" | Indicador que só melhora não dispara decisão nenhuma | Defina o limiar que muda canal, conteúdo ou dono do risco |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são os cinco elementos que um indicador precisa ter para ser levado a um comitê?
2. Por que a taxa de cliques em simulação não tem verdade de campo, e que variáveis ela acaba medindo?
3. Qual verificação o guia do CISA recomenda ao final de um programa de treinamento, e o que ela mede?
4. O que o guia do CISA diz sobre o valor de reportar atividade suspeita?
5. O que a NIST SP 800-50 Rev. 1 declara sobre o uso de métricas no programa?
6. Por que parte dos indicadores de um programa de comportamento deve medir a organização, e não as pessoas?

<details>
<summary>Conferir respostas</summary>

1. Unidade de medida, fonte do dado, dono, direção desejada e decisão que ele dispara.
2. Porque o clique acontece em mensagem fabricada pela organização. O número descreve o desenho da isca, a plausibilidade do remetente, a expectativa da população sobre a simulação e a política de bloqueio do ambiente, e não a disposição a entregar credencial a um atacante real.
3. Uma verificação de treinamento que certifique que o empregado reteve o conteúdo do programa, ao final do ciclo de revisão anual do material. Ela mede retenção, e não a decisão de clicar.
4. Que reportar atividade suspeita de *phishing* é uma das formas mais eficientes de proteger a organização, porque ajuda o provedor de serviço de e-mail a identificar ataques novos ou em tendência.
5. Que a orientação inclui métricas sugeridas e métodos de avaliação, para melhorar e atualizar o programa conforme as necessidades mudam.
6. Porque o resultado declarado é mudança de comportamento ligada à gestão de risco, e boa parte dessa mudança se produz em quem escreve o critério de exceção, quem aprova o acesso e quem mantém a credencial de longa duração.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem releitura | Rebaixar: repetir em D+1 |
| D+7 | Calcular a mediana do tempo de reporte do último mês e apresentar ao dono do canal | Rebaixar: repetir em D+3 |
| D+30 | Levar ao comitê os três indicadores com decisão associada e a lista do que não é medido | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-06 | o indicador de comportamento entra no mesmo relatório de métricas e reporte que o comitê já recebe, com a mesma exigência de decisão associada |
| aplicado_em | 10-operacoes-soc#TEMA-05 | a crítica a indicador de volume e a exigência de dono por métrica valem igual para o indicador do programa de comportamento |

## 13. Certificações e leitura recomendada

Leitura recomendada: a seção de métricas e avaliação da SP 800-50 Rev. 1, e as seções *Mitigations* e *Reporting* do guia conjunto de *phishing*, que é onde está o comportamento de reporte que este tema propõe medir.
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-50 Rev. 1, setembro de 2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/r1/final | "2026-09-25" | alta |
| 2 | NIST SP 800-50, outubro de 2003, retirada em 12/09/2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/final | "2026-09-25" | alta |
| 3 | CISA, NSA, FBI e MS-ISAC, *Phishing Guidance: Stopping the Attack Cycle at Phase One*, outubro de 2023 | primaria | https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf | "2026-09-25" | alta |
| 4 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | media |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Taxas de cliques em simulação de *phishing* divulgadas por fornecedores e relatórios de mercado: Nenhuma foi lida em fonte primária nesta execução. Números desse tipo circulam em material secundário e não entram neste roadmap. Comparação de eficácia entre programa de simulação e programa de verificação de retenção: Não confirmado; nenhum estudo foi lido nesta execução. Meta numérica de tempo de reporte ou de volume de reportes por pessoa: Não confirmado; os limiares devem ser derivados do dado da própria organização. Efeito do programa de conscientização sobre a redução de incidentes: Não confirmado; exigiria série histórica de eventos com decisão humana identificada.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-insider-threat-e-acesso-privilegiado.md) |
| Home | [README](../README.md) |
