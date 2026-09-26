---
tema: "Construir e liderar o time de segurança"
tema_id: "TEMA-05"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Montar uma matriz de papéis de segurança com seis capacidades, indicando para cada uma o que fica interno, o que vai para terceiro e qual lacuna precisa ser contratada em até 12 meses."
atende_objetivo: [4]
certificacoes: ["CCISO", "CISM"]
pre_requisitos: ["TEMA-01"]
relacoes:
  aplicado_em:
    - alvo: "00-guia-basico#TEMA-05"
      motivo: "a trilha dos primeiros 90 dias define quais papéis existem antes de qualquer contratação"
    - alvo: "10-operacoes-soc#TEMA-01"
      motivo: "o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro"
    - alvo: "17-lideranca-ciso#TEMA-06"
      motivo: "o organograma de segurança aterrissa no plano de maturidade com dono e data"
fontes:
  - titulo: "NIST SP 800-181 Rev. 1 — Workforce Framework for Cybersecurity (NICE Framework)"
    url: "https://csrc.nist.gov/pubs/sp/800/181/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA European Cybersecurity Skills Framework — Role Profiles"
    url: "https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
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
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Construir e liderar o time de segurança

Time de segurança se dimensiona por capacidade, não por headcount. A pergunta que organiza a
decisão é qual trabalho precisa existir em casa e qual pode ser comprado com contrato e nível de
serviço.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: montar uma matriz de papéis de segurança com seis
capacidades, indicando para cada uma o que fica interno, o que vai para terceiro e qual lacuna
precisa ser contratada em até 12 meses.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-papel-e-mandato.md). Sem mandato declarado não existe descrição de papel
defensável.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Liste de cabeça as competências do seu time e as três que você acha que faltam. Faça isso antes de conferir o organograma.
   Confiança: ___
2. Quantas dessas competências estão descritas em documento, e não apenas na cabeça das pessoas? Chute uma fração.
   Confiança: ___
3. Se a pessoa que opera a ferramenta principal sair amanhã, existe plano escrito? Aposte sim, não ou parcialmente.
   Confiança: ___
## 4. Caso real

O NIST publicou a revisão 1 do SP 800-181, Workforce Framework for Cybersecurity, em novembro de
2020, substituindo a versão de agosto de 2017. O documento traz uma nota de planejamento de
26/06/2025 informando que os componentes do framework — declarações de tarefa, conhecimento e
habilidade, além de work roles, work role categories e competency areas — passam a ser mantidos na
página de versões atuais do NICE Framework Resource Center, para consulta atualizada
(https://csrc.nist.gov/pubs/sp/800/181/r1/final, acessado em 25/09/2026).

Uma nota de planejamento desse tipo resolve um problema corriqueiro de gestão: descrição de vaga
escrita copiando um PDF de 2020 envelhece sozinha. A pergunta que o caso deixa aberta é como a sua
estrutura de papéis permanece válida quando a referência externa muda.

## 5. Conteúdo

### 5.1 Conceito

Existem dois insumos para desenhar um time, e eles vêm de fontes diferentes. O primeiro é o trabalho
que a organização precisa executar, que sai do seu plano de maturidade e da sua arquitetura. O
segundo é o vocabulário comum para descrever esse trabalho, que existe em frameworks públicos: o
NICE Framework nos Estados Unidos e o ECSF na União Europeia.

O NICE é descrito como uma referência para descrever e compartilhar informação sobre o trabalho em
segurança cibernética, expressando-o como declarações de tarefa e conhecimento, e é apresentado como
léxico comum que categoriza o trabalho para melhorar a comunicação sobre identificar, recrutar,
desenvolver e reter talento. O ECSF publica 12 perfis de papel típicos, com missões, tarefas,
habilidades, conhecimentos e competências, com o objetivo de criar entendimento comum entre pessoas,
empregadores e provedores de formação
(https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles,
acessado em 25/09/2026, publicação de 19/09/2022).

A vantagem de usar vocabulário público não é estética. Descrição de papel escrita em linguagem
própria da empresa passa pelo jurídico, pelo sindicato e pelo mercado sem referência externa; a
mesma descrição ancorada em um framework aceito encurta discussão com recrutamento, auditoria e
área de pessoas.

### 5.2 Como funciona

O CSF 2.0 coloca recursos humanos dentro da função Govern: `GV.RR-04` exige que a segurança
cibernética seja incluída nas práticas de recursos humanos, e `PR.AT-01` e `PR.AT-02` exigem
capacitação tanto para o conjunto do pessoal quanto para quem ocupa papéis especializados. A
mensagem operacional é que treinamento não é evento anual de conscientização: é requisito de
capacidade para função especializada
(https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf, acessado em 25/09/2026, páginas 17 e 20).

O CISM trata o tema no Domínio 3, ao listar "Information Security Program Resources (e.g., People,
Tools, Technologies)" e "Management of External Services", e inclui entre as tarefas de apoio
"organizar, treinar, equipar e atribuir responsabilidades às equipes de resposta a incidentes"
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026). O
CCISO dedica o Domínio 2, com 16% do exame, a "Leading People, Building Teams, and Mentoring Future
Leaders", com itens de contratação, plano de sucessão, avaliação de desempenho e feedback; e o
Domínio 3 a adquirir, desenvolver e gerenciar a equipe, atribuindo funções claras e provendo
treinamento contínuo
(https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em 25/09/2026, páginas 4
e 6). Ambos tratam sucessão e avaliação como parte do desenho do time, não como assunto de RH
isolado.

Sobre dimensionamento de mercado: números de déficit de profissionais, tempo médio de contratação e
rotatividade variam por metodologia e por país, e não foram confirmados em fonte primária nesta
execução. Trate-os como **NAO CONFIRMADO em fonte oficial** e não os use como base de decisão.
Decida por capacidade entregue versus capacidade necessária.

### 5.3 Exemplo resolvido

Situação: time de três pessoas em uma empresa de 2.400 endpoints. Uma pessoa faz tudo de operação,
uma cuida de identidade e uma de conformidade. Não há função de resposta a incidentes nem de
arquitetura.

Passo 1. Liste as capacidades por verbo, não por ferramenta: projetar (arquitetura), operar
(detecção e monitoramento), responder (incidentes), administrar identidades, avaliar risco,
gerenciar terceiros.

Passo 2. Monte a matriz de decisão por capacidade.

| Capacidade | Interno | Terceiro | Lacuna |
|---|---|---|---|
| Arquitetura e requisitos de segurança | responsável técnico | apoio pontual | falta papel formal |
| Detecção e monitoramento | triagem de primeiro nível | análise 24x7 por MSSP | contrato inexistente |
| Resposta a incidentes | coordenação | contenção e forense sob demanda | playbook não testado |
| Identidade e acesso | sim | não | sobrecarga de uma pessoa |
| Avaliação de risco | facilitador | não | sem método padronizado |
| Gestão de terceiros | coordenação | não | avaliação informal |

Passo 3. Decida o que compra capacidade e o que compra responsabilidade. Monitoramento 24x7 em
empresa desse porte raramente fecha com time próprio em um ciclo orçamentário. O que não se
terceiriza é a coordenação da resposta e a decisão de escalonamento: alguém seu precisa poder dizer
"isto é incidente material".

Passo 4. Escreva duas descrições de papel, uma de analista de detecção e uma de responsável por
arquitetura, ancoradas em um framework público. Aponte na descrição qual referência foi usada e a
data de consulta.

Passo 5. Plano de sucessão mínimo: para cada papel crítico, uma pessoa que já executa a tarefa em
treinamento. Sem plano, a saída de uma pessoa vira incidente de disponibilidade do programa.

### 5.4 Problema de completar

Situação: você assume um time de sete pessoas, com duas aposentadorias previstas em 18 meses e
nenhuma documentação de processo. Complete as três últimas etapas.

1. Liste as capacidades existentes e identifique quais dependem de conhecimento não documentado:
   _______
2. Marque o que precisa ser interno por obrigação regulatória: _______
3. Decida o que vai para terceiro e com qual nível de serviço: _______
4. Escreva o plano de transferência de conhecimento dos dois papéis críticos: _______
5. Defina a métrica que mostrará que a capacidade existe de fato, e não só no organograma: _______

## 6. Por que isso importa para o CISO

O time é o que transforma plano em evidência. Um programa com ferramentas caras e sem capacidade de
operação produz exatamente o material que ninguém usa: alerta sem triagem e mapa de calor todo
vermelho. Do outro lado, uma equipe enxuta com papéis claros, escalonamento definido e
documentação mínima sustenta um plano de maturidade inteiro. A decisão de comprar versus construir
também é a decisão que define o seu custo fixo nos próximos três anos, o que liga este tema
diretamente ao orçamento.

## 7. Aplicação prática

Faça o inventário de capacidades em uma tabela de duas colunas: capacidade e nome da pessoa que
executa. Onde o nome for vazio ou a mesma pessoa aparecer três vezes, há uma lacuna. Escolha a
lacuna mais crítica e escreva a descrição do papel com referência a um framework público, indicando
a data de consulta. Leve a descrição para a próxima conversa de orçamento.

## 8. Autoexplicação

Explique em 3 frases por que vocabulário público de papéis ajuda a contratar melhor, e diga qual
capacidade do seu time você consegue descrever hoje sem usar o nome de uma ferramenta. Se não
conseguir descrever nenhuma, o desenho do time está apoiado em produtos.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Contratar mais gente resolve capacidade" | Capacidade depende de papel definido, treinamento e processo | Descreva o papel e o resultado esperado antes de abrir a vaga |
| "Terceirizar SOC terceiriza a responsabilidade" | `GV.RR-01` mantém a responsabilidade na liderança da organização | Mantenha interno o escalonamento e a decisão de materialidade |
| "Descrição de vaga copiada do framework é suficiente" | Componentes de framework são atualizados e a cópia envelhece | Aponte a referência, a versão e a data de consulta |
| "Treinamento é evento anual de conscientização" | `PR.AT-02` exige capacitação para papéis especializados | Separe conscientização geral de formação por função |
| "Sem plano de sucessão, o time segue igual" | Papel crítico concentrado em uma pessoa é risco de disponibilidade do programa | Nomeie substituto em treinamento para cada papel crítico |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Para que serve um framework público de papéis, segundo a descrição do NICE Framework?
2. O que o CSF 2.0 exige na subcategoria que trata de práticas de recursos humanos?
3. Um gerente pede para contratar uma pessoa para operar o SIEM. Quais duas perguntas a estrutura de papéis responde antes da contratação?

<details>
<summary>Conferir respostas</summary>

1. Funciona como léxico comum que categoriza e descreve o trabalho em segurança cibernética, melhorando a comunicação sobre identificar, recrutar, desenvolver e reter talento, e servindo de base para organizações criarem suas próprias ferramentas.
2. `GV.RR-04`: a segurança cibernética deve ser incluída nas práticas de recursos humanos.
3. Se a atividade de operar o SIEM existe como papel com tarefas e resultado esperado descritos, e se a competência necessária está especificada antes de virar vaga — caso contrário, o pedido é sobre ferramenta e não sobre capacidade.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Completar a matriz de capacidades com nome de responsável em cada linha | Rebaixar: repetir em D+3 |
| D+30 | Revisar a matriz e verificar se a lacuna escolhida ganhou dono e data | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 00-guia-basico#TEMA-05 | a trilha dos primeiros 90 dias define quais papéis existem antes de qualquer contratação |
| aplicado_em | 10-operacoes-soc#TEMA-01 | o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro |
| aplicado_em | 17-lideranca-ciso#TEMA-06 | o organograma de segurança aterrissa no plano de maturidade com dono e data |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [NIST SP 800-181 Rev. 1](https://csrc.nist.gov/pubs/sp/800/181/r1/final) |
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [ENISA European Cybersecurity Skills Framework](https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-181 Rev. 1, novembro de 2020, com nota de planejamento de 26/06/2025 | primaria | https://csrc.nist.gov/pubs/sp/800/181/r1/final | "2026-09-25" | alta |
| 2 | ENISA ECSF Role Profiles, 19/09/2022 | primaria | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | "2026-09-25" | alta |
| 3 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |
| 4 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 5 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-comunicacao.md) |
| Próximo tema | [TEMA-06](TEMA-06-programa-e-maturidade.md) |
| Home | [README](../README.md) |
