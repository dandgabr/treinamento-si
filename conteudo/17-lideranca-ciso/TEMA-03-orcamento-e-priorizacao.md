---
tema: "Orçamento, priorização e retorno de segurança"
tema_id: "TEMA-03"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Justificar um pedido de verba apresentando risco quantificado, duas opções comparadas e a métrica que indicará se o gasto funcionou, em um documento de até três páginas."
atende_objetivo: [3]
certificacoes: ["CCISO", "CISM"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "orçamento e reporte usam as mesmas métricas"
    - alvo: "17-lideranca-ciso#TEMA-06"
      motivo: "o plano de maturidade define a fila de investimento que o orçamento financia"
  nao_confundir_com:
    - alvo: "02-governanca-risco-compliance#TEMA-03"
      motivo: "apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado"
fontes:
  - titulo: "EC-Council CCISO Blueprint v3"
    url: "https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST IR 8286 — Integrating Cybersecurity and Enterprise Risk Management (ERM), edição de 2020, retirada em 18/12/2025"
    url: "https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "U.S. Department of Energy — Cybersecurity Capability Maturity Model (C2M2)"
    url: "https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — NIS2 Directive: securing network and information systems"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Orçamento, priorização e retorno de segurança

Priorizar é dizer o que fica sem verba. Um orçamento de segurança não é um teto de gasto: é uma fila
de riscos com preço ao lado, ordenada por um critério que os outros diretores possam auditar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: justificar um pedido de verba apresentando risco
quantificado, duas opções comparadas e a métrica que indicará se o gasto funcionou, em um documento
de até três páginas.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-papel-e-mandato.md). O pedido de recurso só se sustenta sobre um mandato
declarado.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual critério ordena a sua fila de investimentos hoje: risco reduzido, conformidade ou pedido de área? Aposte antes de ler.
   Confiança: ___
2. Quanto do seu orçamento você acha que reduz risco, e quanto mantém conformidade? Chute dois percentuais.
   Confiança: ___
3. A ferramenta comprada no ano passado sobreviveria a uma revisão de retorno hoje? Aposte sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Em 20 de janeiro de 2026, a Comissão Europeia propôs alterações pontuais à NIS2 com o objetivo de
aumentar a clareza jurídica e simplificar a conformidade: a estimativa publicada é de alívio para
28.700 empresas, incluindo 6.200 micro e pequenas
(https://digital-strategy.ec.europa.eu/en/policies/nis2-directive, acessado em 25/09/2026).

O número é útil para quem monta orçamento por um motivo específico: ele mostra que custo de
conformidade é matéria de política pública, medida e revista. Quem apresenta pedido de verba com
estimativa de custo de conformidade em uma linha consegue conversar com um orçamento que já está
sendo contado em outro lugar. A pergunta que o caso deixa aberta é como separar, no próprio
orçamento, o gasto que reduz risco do gasto que apenas compra evidência de conformidade.

## 5. Conteúdo

### 5.1 Conceito

Três números governam a decisão: exposição, custo do tratamento e risco residual depois do
tratamento. Exposição é o produto entre probabilidade e impacto — o texto do NIST IR 8286 usa o
termo "exposure" para essa combinação e descreve o registro de riscos como o instrumento que
documenta avaliação, resposta e monitoramento (edição de outubro de 2020, página 16 do PDF;
https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf, acessado em 25/09/2026). A edição de
2020 foi retirada em 18 de dezembro de 2025 e substituída integralmente pelo NIST IR 8286r1, de
18/12/2025, DOI 10.6028/NIST.IR.8286r1, conforme o aviso de retirada publicado no próprio PDF.
Dois conceitos do mesmo documento entram na conversa de orçamento: apetite de risco é a quantidade
de risco que a organização aceita para perseguir seus objetivos; tolerância é o desvio aceitável em
relação ao objetivo. Apetite declara; tolerância mede.

O erro mais caro na mesa de orçamento é tratar risco como argumento qualitativo. O próprio NIST
registra que a quantificação de risco cibernético em valores monetários e a agregação de riscos são
feitas de forma ad hoc e sem o rigor aplicado a outras classes de risco. Quem chega com "risco alto"
compete com quem chega com "risco de R$ X milhões em uma janela de 12 meses, com duas opções de
tratamento". Perde o primeiro.

Orçamento também tem componente de capacidade, não apenas de compra. Contratar uma ferramenta sem
contratar quem a opera transforma licença em dívida operacional. O CSF 2.0 trata disso em `GV.RR-03`,
que exige alocação de recursos proporcional à estratégia de risco, aos papéis e às políticas, e em
`GV.RM-06`, que exige um método padronizado para calcular, documentar, categorizar e priorizar
riscos.

### 5.2 Como funciona

O mecanismo prático tem cinco passos, e o CSF 2.0 dá o gabarito de cada um. `GV.RM-02` exige que as
declarações de apetite e tolerância sejam estabelecidas, comunicadas e mantidas. `GV.RM-04` exige
direção estratégica descrevendo as opções de resposta a risco aceitáveis. `GV.RM-06` exige o método
padronizado de cálculo. `ID.RA-05` usa ameaças, vulnerabilidades, probabilidade e impacto para
entender o risco inerente e informar a priorização das respostas; `ID.RA-06` estabelece que as
respostas a risco sejam escolhidas, priorizadas, planejadas, acompanhadas e comunicadas
(https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf, acessado em 25/09/2026, páginas 16 e 19).

Passo a passo: (1) escreva a opção de não fazer nada, com a exposição anual estimada; (2) descreva
duas ou três opções de tratamento com custo total — licença, implementação, pessoas e manutenção;
(3) estime a exposição residual de cada opção; (4) declare a métrica que mostrará se o tratamento
funcionou e o valor atual dela; (5) registre dono e data no registro de riscos.

A área de certificação trata o assunto como competência explícita do cargo. O CCISO dedica o
Domínio 5, com 11% do exame, a "Strategic Planning, Finance, Procurement, and Third-Party
Management", incluindo "analisar, prever e desenvolver o orçamento operacional do departamento de
segurança", "monitorar e supervisionar a gestão de custos de projetos de segurança da informação e
o retorno sobre o investimento (ROI) das principais aquisições" e "balancear o portfólio de
investimentos em segurança de TI" — além de "Funding Request Justification and ROI Promotion" no
Domínio 2, com 16% (https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em
25/09/2026, páginas 4, 9 e 10). O CISM inclui "Strategic Planning (Budgets, Resources, Business
Case)" no Domínio 1 e, entre as tarefas de apoio, "desenvolver casos de negócio para sustentar
investimentos em segurança da informação" e "definir e monitorar métricas gerenciais e
operacionais para o programa"
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026).

Sobre proporções de orçamento: não há fonte primária que fixe um percentual do orçamento de TI ou
da receita que deva ser gasto em segurança. Recomendações circulam amplamente em material de
analista e de fornecedor. Para este roadmap, o valor de referência permanece **NAO CONFIRMADO em
fonte oficial**. O mesmo vale para faixas salariais de CISO: **NAO CONFIRMADO em fonte oficial**.
Não use nenhum dos dois em um pedido de verba.

### 5.3 Exemplo resolvido

Situação: 2.400 endpoints, EDR contratado no plano básico, sem resposta gerenciada. Fila de
detecção com tempo médio de resposta de 3 dias. Você quer subir para o plano com resposta
gerenciada 24x7, custo adicional de R$ 480 mil por ano.

Passo 1. Exposição da opção "não fazer nada". Use o histórico interno, não estatística de mercado:
nos últimos 24 meses, três incidentes com criptografia de dados, custo médio apurado de R$ 300 mil
cada, sendo dois fora do horário comercial. Exposição anual estimada: R$ 300 mil.

Passo 2. Opções.

| Opção | Custo anual | O que muda | Exposição residual estimada |
|---|---|---|---|
| Nada | R$ 0 | tempo de resposta de 3 dias | R$ 300 mil |
| Plano avançado sem serviço | R$ 180 mil | detecção melhor, resposta segue interna | R$ 240 mil |
| Plano avançado com resposta 24x7 | R$ 480 mil | resposta em 1 hora, 24x7 | R$ 90 mil |

Passo 3. Compare. A segunda opção reduz R$ 60 mil de exposição com R$ 180 mil de custo: a relação é
negativa e o pedido não se sustenta sozinho. A terceira reduz R$ 210 mil de exposição com R$ 480 mil
de custo adicional, e cobre a janela noturna, que é onde os dois incidentes mais caros ocorreram.

Passo 4. Métrica. Tempo médio de resposta a incidente de severidade alta, hoje 3 dias, meta 1 hora
com janela 24x7. Essa métrica é alimentada pelo SOC e aparece na mesma família de indicadores do
relatório ao board.

Passo 5. Registro. Dono: você. Data de revisão: 12 meses. Condição de reavaliação: se o tempo médio
de resposta já estiver abaixo de 4 horas antes do prazo, o contrato é revisto.

Resultado: a decisão deixa de ser preferência técnica e passa a ser comparação de exposição com
custo, com métrica de verificação declarada.

### 5.4 Problema de completar

Situação: 90% do parque de servidores fora de suporte do fornecedor. Custo de migração estimado em
R$ 1,2 milhão em 18 meses. Complete as três últimas etapas.

1. Exposição da opção "não fazer nada": _______
2. Duas opções de tratamento com custo e exposição residual: _______
3. Métrica que indicará se o tratamento funcionou, com valor atual e meta: _______
4. Dono do risco e data de revisão: _______
5. O que entra na sua declaração de tolerância ao risco se a migração não couber no orçamento: _______

## 6. Por que isso importa para o CISO

Verba aprovada é verba defendida. Um pedido sem exposição declarada sobrevive até o primeiro corte
de custos; um pedido com exposição, opções e métrica sobrevive porque o executivo que o aprovou
assina junto. Nos dois anos seguintes, a mesma planilha responde a três perguntas que sempre
chegam: o que aconteceu se não fizéssemos nada, quanto gastamos e o que melhorou. Sem esses três
números, a próxima conversa de orçamento começa do zero, e começa pior.

## 7. Aplicação prática

Escolha o maior gasto de segurança aprovado no último ciclo e reconstrua o caso de negócio com os
cinco passos, mesmo que ele já esteja contratado. Leve o documento ao dono do orçamento e pergunte
qual número ele usaria para cortar. A resposta indica exatamente onde o caso está fraco.

## 8. Autoexplicação

Explique em 3 frases por que "risco alto" perde para "exposição de R$ X milhões com duas opções", e
nomeie a métrica que você já tem hoje e poderia usar como medida de retorno. Se não houver métrica,
esse é o primeiro item da sua lista de trabalho.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Basta alinhar o gasto a um percentual de referência do mercado" | Não existe percentual fixado em fonte primária de norma ou framework | Use exposição, opções e custo total; trate percentuais de mercado como não confirmados |
| "Apetite de risco e orçamento tratam da mesma coisa" | Apetite declara o risco aceitável; o orçamento financia a redução de risco | Peça verba vinculada a uma declaração de apetite já existente |
| "Conformidade e redução de risco são o mesmo gasto" | Uma exige evidência documental; a outra muda a probabilidade do evento | Separe as duas linhas no orçamento para não perder a discussão de retorno |
| "ROI de segurança se mede pelo número de incidentes" | Contagem pode cair por sorte ou por subnotificação e subir por melhor detecção | Use exposição estimada mais uma métrica de tempo ou cobertura |
| "Comprar a licença resolve" | Sem quem opere, a licença amplia a superfície de trabalho e não reduz exposição | Inclua pessoas e manutenção no custo total da opção |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Como o NIST IR 8286 define exposição, e quais elementos do registro de riscos tornam o orçamento auditável?
2. Qual é a diferença entre apetite de risco e tolerância ao risco?
3. Por que uma métrica de contagem de vulnerabilidades abertas não serve como medida de retorno de um investimento?

<details>
<summary>Conferir respostas</summary>

1. Exposição é a combinação entre probabilidade de ocorrência e impacto; no registro, os campos de custo da resposta, dono do risco e status tornam o gasto rastreável.
2. Apetite é a quantidade de risco que a organização aceita para perseguir objetivos; tolerância é o nível aceitável de variação de desempenho em relação ao objetivo declarado.
3. Porque mede atividade e não efeito sobre risco: a contagem cai sem que a exposição mude, se o inventário for incompleto, e sobe quando o inventário melhora.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Refazer o caso de negócio de um gasto aprovado no ciclo anterior | Rebaixar: repetir em D+3 |
| D+30 | Conferir se a métrica prometida tem valor atual e se o dono do risco foi registrado | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 02-governanca-risco-compliance#TEMA-06 | orçamento e reporte usam as mesmas métricas |
| complementa | 17-lideranca-ciso#TEMA-06 | o plano de maturidade define a fila de investimento que o orçamento financia |
| nao_confundir_com | 02-governanca-risco-compliance#TEMA-03 | apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [EC-Council CCISO Blueprint v3](https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf) |
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [ISACA CISM Exam Content Outline](https://www.isaca.org/credentialing/cism/cism-exam-content-outline) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |
| 2 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 3 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 4 | NIST IR 8286 (out/2020), retirado em 18/12/2025 e substituído por IR 8286r1 | primaria | https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf | "2026-09-25" | alta |
| 5 | DOE C2M2 v2.1, junho de 2022 | primaria | https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2 | "2026-09-25" | alta |
| 6 | European Commission — NIS2 Directive | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-posicao-e-reporte.md) |
| Próximo tema | [TEMA-04](TEMA-04-comunicacao.md) |
| Home | [README](../README.md) |
