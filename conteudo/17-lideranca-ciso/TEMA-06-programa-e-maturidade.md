---
tema: "Programa de segurança e plano de maturidade"
tema_id: "TEMA-06"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Construir um plano de maturidade de 12 meses com estado atual, estado-alvo, lacuna, dono, custo e métrica de verificação, cobrindo ao menos três funções do CSF 2.0."
atende_objetivo: [4]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: ["TEMA-01", "TEMA-03"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-04"
      motivo: "o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes"
    - alvo: "17-lideranca-ciso#TEMA-03"
      motivo: "o plano de maturidade define a fila de investimento que o orçamento financia"
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-05"
      motivo: "a maturidade do programa aparece nas métricas do SOC"
fontes:
  - titulo: "NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "U.S. Department of Energy — Cybersecurity Capability Maturity Model (C2M2), versão 2.1"
    url: "https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "EC-Council CCISO Blueprint v3"
    url: "https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA European Cybersecurity Skills Framework — Role Profiles"
    url: "https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Programa de segurança e plano de maturidade

Maturidade sem plano é diagnóstico de gaveta. O plano transforma a lacuna medida em trabalho com
dono, custo e data de verificação.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: construir um plano de maturidade de 12 meses com estado
atual, estado-alvo, lacuna, dono, custo e métrica de verificação, cobrindo ao menos três funções do
CSF 2.0.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-papel-e-mandato.md) e [TEMA-03](./TEMA-03-orcamento-e-priorizacao.md). Programa
sem mandato vira lista de intenções; plano sem orçamento vira apresentação.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Descreva de palpite o estado do seu programa em resultados, e não em ferramentas, em uma frase.
   Confiança: ___
2. Quantas lacunas você conhece hoje, e para quantas existe dono nomeado? Chute dois números.
   Confiança: ___
3. Como você decide hoje o que fica para o ano que vem: risco, orçamento disponível ou pedido da diretoria? Aposte no critério real.
   Confiança: ___
## 4. Caso real

O Cybersecurity Capability Maturity Model, mantido pelo Departamento de Energia dos Estados Unidos,
contém mais de 350 práticas de segurança agrupadas em 10 domínios, cada prática associada a um nível
indicador de maturidade (MIL). A versão vigente publicada na página oficial é a 2.1, de junho de
2022, e o modelo foi desenhado para que qualquer organização conclua uma autoavaliação em um único
dia. A ferramenta gera relatórios com painéis de desempenho que, segundo o texto oficial, facilitam
comparação e ajudam a fortalecer a comunicação com líderes executivos sobre o que o programa
conquistou e do que precisa
(https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2, acessado em 25/09/2026).

Duas decisões de desenho aparecem nesse caso. A primeira é o teto de esforço: uma autoavaliação que
não cabe em um dia não é executada por ninguém. A segunda é o produto: o resultado é insumo de
conversa com executivo, não relatório técnico. A pergunta que o caso deixa aberta é como transformar
o diagnóstico em plano com dono e prazo.

## 5. Conteúdo

### 5.1 Conceito

O CSF 2.0 resolve o problema com dois componentes. O primeiro é o Organizational Profile, que
descreve a postura atual e a desejada nos termos dos resultados do framework: o Current Profile
especifica o que a organização alcança hoje e em que medida; o Target Profile especifica os
resultados desejados que foram selecionados e priorizados. O segundo é o Tier, que caracteriza o
rigor das práticas de governança e de gestão de risco, em quatro níveis: Partial (Tier 1), Risk
Informed (Tier 2), Repeatable (Tier 3) e Adaptive (Tier 4). O documento também declara que progredir
para Tiers mais altos é encorajado quando os riscos ou as obrigações são maiores ou quando uma
análise de custo-benefício indica redução factível e custo-efetiva do risco negativo
(https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf, acessado em 25/09/2026, páginas 7, 8 e 25).

Tier não é nota de qualidade da empresa. É descrição do rigor do processo. Um programa em Tier 2 com
documentação honesta tem mais valor de gestão do que um programa que se declara Tier 4 sem
evidência, porque permite tomar decisões sobre lacunas reais.

### 5.2 Como funciona

O CSF 2.0 descreve cinco passos para usar um perfil organizacional: delimitar o escopo do perfil;
reunir a informação necessária, incluindo políticas, prioridades de risco, recursos, análise de
impacto no negócio, requisitos e papéis de trabalho; criar o perfil; analisar as lacunas entre
perfil atual e alvo e criar um plano de ação priorizado, que pode assumir a forma de registro de
riscos, relatório de detalhe de risco ou plano de ação e marcos; implementar o plano e atualizar o
perfil. O ciclo se repete conforme necessário (páginas 6 e 7 da mesma publicação).

Do lado do CSF Core, o plano ganha pontos de controle. A categoria Oversight exige revisão dos
resultados da estratégia (`GV.OV-01`), revisão e ajuste da estratégia para cobrir requisitos e
riscos (`GV.OV-02`) e avaliação e revisão do desempenho da gestão de risco (`GV.OV-03`). A categoria
Improvement, na função Identify, exige que as melhorias sejam identificadas a partir de avaliações
(`ID.IM-01`), de testes de segurança e exercícios (`ID.IM-02`), da execução de processos
operacionais (`ID.IM-03`) e que planos de resposta a incidentes e outros planos sejam estabelecidos,
comunicados, mantidos e melhorados (`ID.IM-04`).

O segundo insumo é o modelo de capacidade. O C2M2 estrutura o diagnóstico em 10 domínios — entre
eles gestão de ativos, arquitetura de segurança, gestão do programa, resposta a eventos, gestão de
identidades e acessos, gestão de risco, consciência situacional, gestão de terceiros, gestão de
ameaças e vulnerabilidades e gestão da força de trabalho — com três níveis indicadores de maturidade
descritos na página oficial como MIL 1 Initiated, MIL 2 Performed e MIL 3 Managed. Ele foi desenhado
para uso em ambientes de TI e de tecnologia operacional e é declaradamente alinhado ao CSF do NIST.

O CISM trata a construção do programa no Domínio 3, que responde por 33% do exame, com subtemas que
incluem recursos do programa, identificação e classificação de ativos, padrões e frameworks,
políticas, métricas do programa, desenho e teste de controles, conscientização, gestão de serviços
externos e comunicação e reporte
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026). O
CCISO trata o mesmo assunto no Domínio 3, "Information Security Controls, Security Program
Management & Operations", com 12% do exame, incluindo desenho de controles alinhados aos objetivos
operacionais, medição por métricas e indicadores-chave de desempenho e gestão do orçamento do
programa (https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em 25/09/2026,
páginas 5 e 6).

### 5.3 Exemplo resolvido

Situação: empresa com 2.400 endpoints, sem inventário confiável, com detecção apenas por antivírus e
sem processo de resposta testado. Você tem 12 meses e um orçamento incremental aprovado.

Passo 1. Delimite o escopo: organização inteira, ambiente de TI, excluindo tecnologia operacional
neste primeiro ciclo.

Passo 2. Crie o perfil atual em três funções, com evidência.

| Função | Resultado do CSF | Estado atual com evidência |
|---|---|---|
| Identify | `ID.AM-01` | inventário de hardware parcial, atualizado por planilha manual |
| Detect | `DE.CM-09` | apenas antivírus; sem telemetria centralizada |
| Respond | `RS.MA-01` | plano informal, nunca exercitado |

Passo 3. Crie o perfil alvo e declare o Tier pretendido para o ciclo: Repeatable, com processos
formalmente aprovados e expressos em política.

Passo 4. Analise as lacunas e escreva o plano como registro de riscos, com as colunas que sustentam
orçamento.

| Lacuna | Ação | Dono | Custo anual | Métrica de verificação | Data |
|---|---|---|---|---|---|
| inventário parcial | descoberta automatizada e conciliação mensal | gestor de infraestrutura | informado | cobertura do inventário em percentual | 6 meses |
| sem telemetria centralizada | coleta de log de endpoint e servidor com retenção definida | você | informado | percentual de ativos com log em 24 h | 4 meses |
| plano não exercitado | exercício de mesa semestral com ata | você | sem custo adicional | exercícios realizados e ações abertas por exercício | 3 meses |

Passo 5. Implemente e atualize. A cada trimestre, revise o perfil atual e ajuste o alvo. As métricas
do plano são as mesmas que alimentam o relatório ao board e as métricas do SOC para detecção e
resposta: percentual de ativos com telemetria, tempo de triagem, tempo de resposta e exercícios
realizados.

Resultado: a lacuna deixa de ser diagnóstico e passa a ser linha de plano com dono, custo, métrica e
data.

### 5.4 Problema de completar

No mesmo caso, três lacunas foram priorizadas: gestão de terceiros sem avaliação, ausência de
revisão de acessos privilegiados e falta de classificação de dados. Complete as três últimas etapas.

1. Perfil atual nas três lacunas, com a evidência que comprova cada uma: _______
2. Perfil alvo e Tier pretendido para o ciclo: _______
3. Ações, donos e custos das três lacunas: _______
4. Métrica de verificação de cada ação, com valor atual e meta: _______
5. Como você reaproveita essas métricas no relatório ao board e nas métricas do SOC: _______

## 6. Por que isso importa para o CISO

O plano de maturidade é o único documento que responde simultaneamente às três perguntas que você
vai receber: onde estamos, para onde vamos e o que isso custa. Sem ele, cada pedido de verba é um
pedido isolado e cada auditoria recomeça do zero. Com ele, o aceite de risco de uma lacuna não
tratada passa a ter data e dono, e a discussão deixa de ser sobre opinião técnica. É também o
documento que sobrevive à sua saída: um sucessor herda perfil atual, alvo, fila e evidência.

## 7. Aplicação prática

Escolha três funções do CSF 2.0 e escreva o perfil atual delas com evidência que você consegue abrir
em tela hoje. Sem evidência, o resultado está ausente. Depois escreva o perfil alvo de uma das
funções e o plano de 12 meses apenas dessa função, com dono, custo e métrica. Um escopo pequeno
concluído vale mais do que um diagnóstico completo arquivado.

## 8. Autoexplicação

Explique em 3 frases a diferença entre perfil atual e perfil alvo, e diga qual Tier descreve o seu
programa hoje com justificativa em evidência. Se a justificativa for "achismo", o Tier é 1.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Maturidade alta significa organização segura" | Tier caracteriza rigor de processo, não ausência de risco | Use o Tier como contexto de governança e mantenha o risco medido separado |
| "Autoavaliação sem evidência economiza tempo" | Sem evidência o resultado é opinião e não sustenta decisão de verba | Exija uma evidência abrível para cada resultado declarado |
| "Plano de maturidade é lista de projetos de TI" | Projeto sem dono de negócio e sem métrica de verificação não fecha ciclo | Escreva cada linha com dono, custo, métrica e data |
| "Medir tudo demonstra rigor" | Medição excessiva consome a capacidade do time e não muda decisão | Meça o que alimenta decisão de verba, reporte ou correção de rota |
| "Uma vez por ano é suficiente" | `GV.OV-01` a `GV.OV-03` e `ID.IM-01` a `ID.IM-04` tratam de revisão e melhoria contínuas | Revise o perfil atual e os planos em ciclo trimestral |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a diferença entre perfil atual e perfil alvo, e quantos Tiers o CSF 2.0 define?
2. Quais são os três níveis indicadores de maturidade do C2M2 versão 2.1, e quantos domínios o modelo tem?
3. Quais subcategorias do CSF 2.0 exigem que as melhorias sejam identificadas, e a partir de quais fontes?

<details>
<summary>Conferir respostas</summary>

1. O perfil atual especifica os resultados que a organização alcança hoje e em que medida; o perfil alvo especifica os resultados desejados selecionados e priorizados. São quatro Tiers: Partial, Risk Informed, Repeatable e Adaptive.
2. MIL 1 Initiated, MIL 2 Performed e MIL 3 Managed, em 10 domínios, com mais de 350 práticas.
3. `ID.IM-01`, a partir de avaliações; `ID.IM-02`, a partir de testes de segurança e exercícios; `ID.IM-03`, a partir da execução de processos, procedimentos e atividades operacionais; e `ID.IM-04`, que exige que planos, incluindo o de resposta a incidentes, sejam estabelecidos, comunicados, mantidos e melhorados.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever o perfil atual de uma função com evidência abrível | Rebaixar: repetir em D+3 |
| D+30 | Revisar o plano de uma função e verificar dono, métrica e data | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 10-operacoes-soc#TEMA-05 | a maturidade do programa aparece nas métricas do SOC |
| complementa | 02-governanca-risco-compliance#TEMA-04 | o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes |
| complementa | 17-lideranca-ciso#TEMA-03 | o plano de maturidade define a fila de investimento que o orçamento financia |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [NIST Cybersecurity Framework (CSF) 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) |
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [U.S. Department of Energy](https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | DOE C2M2 v2.1, junho de 2022 | primaria | https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2 | "2026-09-25" | alta |
| 3 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 4 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |
| 5 | ENISA ECSF Role Profiles, 19/09/2022 | primaria | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-time-de-seguranca.md) |
| Home | [README](../README.md) |
