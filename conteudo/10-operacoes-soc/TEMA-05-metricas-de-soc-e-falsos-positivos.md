---
tema: "Métricas de SOC e o problema dos falsos positivos"
tema_id: "TEMA-05"
area_id: "10-operacoes-soc"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Avaliar um painel de métricas de SOC, separando o que mede detecção, o que mede resposta e o que mede apenas volume, com a decisão que cada número sustenta"
atende_objetivo: [5]
certificacoes: ["CySA+", "GCIH", "CISM"]
pre_requisitos: ["TEMA-04"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-06"
      motivo: "a maturidade do programa de segurança aparece nas métricas do SOC, que são o número auditável do plano"
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "a métrica do SOC é o insumo numérico do reporte ao board e da evidência de auditoria"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-137 — Information Security Continuous Monitoring (ISCM) for Federal Information Systems and Organizations, setembro de 2011"
    url: "https://csrc.nist.gov/pubs/sp/800/137/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "SigmaHQ — Sigma Rules Specification, versão 2.1.0, de 02 de agosto de 2025, campos level, status e falsepositives"
    url: "https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "MITRE ATT&CK — Version History, cadência de versões do catálogo"
    url: "https://attack.mitre.org/resources/versions/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Métricas de SOC e o problema dos falsos positivos

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir olhar um painel de operação e dizer, para cada número, qual decisão ele sustenta e qual seria a consequência de otimizá-lo sozinho; e deve conseguir explicar o falso positivo como efeito aritmético de volume e de especificidade, não como falha moral do analista.

## 2. Pré-requisitos

[TEMA-04](./TEMA-04-triagem-severidade-e-escalonamento.md): sem critério de severidade escrito, a contagem de incidentes mistura alarme falso com incidente confirmado e a métrica nasce inútil.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual é o tempo mediano, no seu ambiente, entre o alerta e a primeira decisão humana?
   Confiança: ___
2. Quantos alertas por dia a sua operação recebe e quantos viram caso?
   Confiança: ___
3. Se a diretoria pedir "quanto estamos melhores que no ano passado", qual número você mostraria?
   Confiança: ___
4. O que é um falso negativo e por que ele quase nunca aparece no painel?
   Confiança: ___

## 4. Caso real

O playbook do CISA fecha o ciclo de resposta com verificação e validação: a autoridade central confere se o incidente ou a vulnerabilidade foram tratados e, para todo incidente que usou o playbook, a organização precisa entregar a lista de verificação preenchida e o relatório final para encerrar o chamado. Quem não consegue preencher a lista confere com a autoridade para garantir que a ação foi tomada. Há também prazo de atualização posterior ao incidente, de sete dias contados da resolução.

Do outro lado da mesma operação, o documento registra que o time deve ajustar as ferramentas para retardar o avanço do adversário e reduzir o tempo de permanência, introduzindo modificações de maior fidelidade e focalizando as táticas que o adversário é obrigado a usar, como execução, acesso a credencial e movimento lateral. Ajustar significa remover o que casa sem indicar ataque.

A pergunta que o caso deixa aberta: como provar que o ajuste reduziu ruído sem reduzir detecção — e como a organização evita que a redução de ruído esconda o falso negativo?

## 5. Conteúdo

### 5.1 Conceito

Métrica de operação só tem função se estiver presa a uma decisão. O objetivo declarado do monitoramento contínuo, no NIST SP 800-137, é dar visibilidade sobre ativos, ameaças, vulnerabilidades e efetividade dos controles implantados, alinhada à tolerância ao risco e capaz de sustentar resposta em tempo hábil. Cada número do painel deveria responder a uma dessas quatro visibilidades ou à capacidade de responder a tempo.

A revisão do guia de tratamento de incidente, o SP 800-61 Rev. 3, publicado em abril de 2025 em substituição à edição de 2012, tem como propósito declarado melhorar a eficiência e a efetividade das atividades de detecção, resposta e recuperação. Eficiência e efetividade são coisas diferentes: eficiência é custo por unidade tratada, efetividade é o que se consegue provar sobre o ataque. Painel que só mede eficiência otimiza a operação para não incomodar ninguém.

Os nomes que circulam no mercado para medir tempo — tempo médio para detectar, para reconhecer, para conter, para remediar — NAO CONFIRMADO em fonte oficial: nenhuma definição normativa foi confirmada nesta execução. Sem definição escrita, o número varia conforme quem preenche o campo, e o comparativo ano contra ano deixa de ser confiável. A recomendação prática é definir o intervalo exato, o evento de início e o evento de fim, e congelar isso por escrito.

O falso positivo é consequência de dois fatores, não de desleixo. O primeiro é o volume de eventos benignos: o número de alertas falsos por dia é o produto da quantidade de eventos benignos pela taxa de falso positivo da regra — a mesma grandeza que o poder de discriminação da regra mede pelo avesso, porque quanto maior a discriminação, menor a taxa. O segundo é a especificidade da condição: uma regra que casa em campo genérico, sem contexto de ativo, turno ou identidade, converte grande volume legítimo em alerta.

### 5.2 Como funciona

Três famílias de indicador cobrem a operação sem inflar o painel. A primeira mede detecção: cobertura de tática com regra em produção, regra com falso positivo declarado, regra cuja fonte de telemetria existe de fato. A segunda mede resposta: tempo entre alerta e primeira decisão, tempo entre decisão e ação, casos reabertos, percentual de casos encerrados com o relatório preenchido. A terceira mede volume e ruído: alerta por caso real, automação por alerta e hora de triagem por caso real.

A fórmula do ruído é aritmética simples, e você deve preencher com os próprios números. Alertas falsos por dia é igual a eventos benignos por dia multiplicado pela taxa de falso positivo da regra. Hora de triagem por caso real é igual ao total de horas dedicadas à triagem no período dividido pelo número de casos reais do período. A segunda é a métrica que muda comportamento, porque liga o ruído ao recurso escasso, que é atenção.

O ciclo de vida da regra é parte da métrica. A especificação Sigma prevê o campo de falsos positivos conhecidos e um campo de status com os valores estável, teste, experimental, obsoleto e não suportado, além do nível informativo, que pela própria definição não deve abrir caso nem alerta. Regra em estado experimental é esperadamente ruidosa; regra que continua em experimental depois de dois anos indica ausência de dono.

A cobertura envelhece. O catálogo ATT&CK usa versão maior e menor, com a v19.2 vigente desde 28 de abril de 2026 e a v18.1 entre 28 de outubro de 2025 e 27 de abril de 2026. Tática nova ou renomeada altera o mapa de cobertura e obriga revisão; uma avaliação de cobertura sem a data e sem a versão não é auditável.

O falso negativo é o indicador que falta. Ele quase nunca aparece porque só se manifesta quando algo escapa e depois é descoberto por outro caminho: auditoria, cliente, imprensa ou adversário. O playbook do CISA trata essa lacuna na fase posterior ao incidente, ao mandar identificar pontos cegos e acrescentar detecção de amplitude empresarial para as técnicas que passaram. Em painel maduro, a origem da descoberta de cada incidente entra como campo: se toda descoberta vem de fora, a detecção interna está cega.

### 5.3 Exemplo resolvido

Painel proposto para uma operação com quatro analistas e cobertura de doze horas por dia útil, com dois mil alertas por semana.

| Métrica | Definição operacional | Fonte | Decisão que sustenta | Como é enganada |
|---|---|---|---|---|
| Cobertura de tática | táticas de empresa com ao menos uma regra em produção, ativa, com dono | repositório de regras com etiqueta de técnica | onde investir engenharia de detecção no trimestre | contar regra desligada ou duplicada |
| Saúde de telemetria | fontes necessárias por tática que existem, chegam centralizadas e retêm pelo prazo aprovado | inventário de fontes | comprar retenção ou ligar registro antes de comprar ferramenta | contar fonte que existe e não é consultada |
| Alerta por caso real | alertas abertos no período dividido por casos confirmados no período | sistema de ticket | quanto esforço a operação gasta por confirmação | fechar caso cedo para melhorar o número |
| Hora de triagem por caso real | horas de análise no período dividido por casos reais | apontamento de horas | justificar contratação, automação ou terceirização | não apontar hora, que faz o número cair sem trabalho cair |
| Tempo até a primeira decisão | da abertura do alerta até o registro de decisão, com início e fim definidos por escrito | registro de triagem | horário de cobertura e regra de escalonamento | decidir por padrão sem investigar |
| Origem da descoberta | canal que revelou cada incidente confirmado | registro de caso | avaliar falso negativo estrutural | nenhuma, desde que o campo seja preenchido com honestidade |

Leitura do painel, passo a passo.

1. Comece pela cobertura e pela saúde de telemetria. Se a fonte não existe, nenhuma das outras métricas melhora com treinamento.
2. Ordene as regras pela razão entre alertas gerados e casos confirmados. As primeiras da lista são as candidatas a ajuste ou desligamento.
3. Verifique o status. Regra experimental há mais de dois ciclos de revisão entra na fila de revisão com prazo, e o dono é nomeado.
4. Fixe o tempo até a primeira decisão e observe a distribuição por hora do dia. Concentração de decisão no início da manhã mostra que a cobertura noturna é nominal.
5. Acompanhe a origem da descoberta. Aumento de incidente descoberto por terceiro com queda de alerta é sinal de que o ajuste de ruído passou do ponto.
6. Leve ao executivo no máximo três números com a decisão embutida, cada um com o efeito que ele mede.

### 5.4 Problema de completar

A diretoria pergunta: "no ano passado aprovamos verba para segurança. O que melhorou?" Você tem quatro candidatos a resposta e precisa escolher dois.

1. Número de alertas por semana, que caiu depois do ajuste das regras.
2. Cobertura de táticas com regra ativa e fonte de telemetria disponível, por trimestre.
3. Horas gastas em triagem por caso confirmado, mês a mês.
4. Percentual de incidentes descobertos por fonte externa, mês a mês.
5. Escolha dois: ___
6. Justifique a exclusão de cada um dos outros dois: ___
7. Que definição você precisa registrar antes de apresentar o número escolhido: ___

## 6. Por que isso importa para o CISO

A conversa de renovação de orçamento depende de mostrar melhora em algo que não seja a fatura. Cobertura de táticas com telemetria disponível e custo de atenção por caso confirmado são números que sobrevivem a questionamento de auditoria e que ligam verba a capacidade. Queda no número de alertas, apresentada sozinha, é o número mais perigoso do painel: pode significar ajuste competente ou cegueira adquirida, e a diferença entre as duas aparece na origem da descoberta dos incidentes, não na contagem de alertas.

## 7. Aplicação prática

Pegue os alertas do último mês e some quantos foram gerados por regra. Ordene a lista de forma decrescente e cruze com a quantidade de casos confirmados por regra. As três regras do topo da lista são a sua próxima tarefa de engenharia. Escreva, para cada uma, o que a regra deveria estar detectando e o que ela está detectando de fato.

## 8. Autoexplicação

Explique em três frases por que reduzir alerta sem declarar o que se abre mão não é melhoria. Ligue a algo que você faz hoje: o relatório de incidentes que você envia à diretoria cita origem da descoberta ou apenas descreve o ataque?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Apresentar volume de alertas como resultado | volume não informa capacidade nem cegueira | apresentar cobertura, custo de atenção por caso e origem da descoberta |
| Comparar tempo médio sem definição de início e de fim | o número muda de significado a cada trimestre e deixa de ser comparável | congelar a definição por escrito, com o evento de início e o de fim |
| Tratar falso positivo como problema de postura do analista | o volume de evento benigno e a especificidade da regra determinam o resultado | ajustar regra e nível, e declarar o falso positivo esperado no próprio arquivo da regra |
| Otimizar eficiência e ignorar efetividade | uma operação pode ficar rápida fechando caso sem investigar | acompanhar em par a hora por caso real e a origem da descoberta |
| Avaliar cobertura sem registrar a versão do framework | táticas são renomeadas e criadas entre versões do catálogo | gravar versão e data em cada avaliação de cobertura |

## 10. Recuperação ativa

1. Por que a hora de triagem por caso real muda mais comportamento que a contagem de alertas?
2. A operação cortou pela metade o número de alertas semanais depois de desligar dez regras. Que outro número você consulta antes de aceitar isso como melhoria?
3. Um analista diz que "o tempo médio para detectar caiu 40 por cento". Qual é a primeira pergunta?
4. O que o valor informativo do campo de nível de uma regra diz sobre abrir caso?

<details>
<summary>Conferir respostas</summary>

1. Porque liga o ruído ao recurso escasso. Alerta é barato de gerar e caro de ler; a hora por caso real revela o custo de atenção que a operação paga para confirmar um único incidente.
2. A cobertura de táticas com regra ativa e fonte de telemetria disponível, e a origem da descoberta dos incidentes confirmados. Sem elas, a queda de alerta pode ser cegueira adquirida.
3. Qual é a definição exata de início e de fim, e quem a registrou. Sem isso, o número não é comparável e o percentual não significa nada.
4. Que a regra é destinada a enriquecimento e que, pela definição da especificação, não deve abrir caso nem disparar alerta, porque se espera grande volume de eventos casando.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Calcular a hora de triagem por caso real do seu ambiente e escrever a definição | Rebaixar: repetir em D+3 |
| D+30 | Revisar a lista de regras com maior razão alerta por caso e propor ajuste | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-06 | a métrica do SOC é o insumo numérico do reporte ao board e da evidência de auditoria |
| aplicado_em | 17-lideranca-ciso#TEMA-06 | a maturidade do programa de segurança aparece nas métricas do SOC, que são o número auditável do plano |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CySA+ | Análise de segurança e medição da detecção | SigmaHQ — Sigma Rules Specification, v2.1.0 | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md |
| GCIH | Tratamento de incidente e calibração do alerta | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final |
| CISM | Governança da operação e comunicação de métrica ao executivo | NIST SP 800-137 — Information Security Continuous Monitoring (ISCM), setembro de 2011 | primaria | https://csrc.nist.gov/pubs/sp/800/137/final |

Leitura recomendada: [CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021](https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-137, setembro de 2011, DOI 10.6028/NIST.SP.800-137 | primaria | https://csrc.nist.gov/pubs/sp/800/137/final | "2026-09-25" | alta |
| 2 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |
| 3 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 4 | SigmaHQ — Sigma Rules Specification, v2.1.0, campos level, status e falsepositives | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md | "2026-09-25" | alta |
| 5 | MITRE ATT&CK — Version History | primaria | https://attack.mitre.org/resources/versions/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-triagem-severidade-e-escalonamento.md) |
| Próximo tema | [TEMA-06](TEMA-06-soar-automacao-e-o-futuro-do-soc.md) |
| Home | [README](../README.md) |
