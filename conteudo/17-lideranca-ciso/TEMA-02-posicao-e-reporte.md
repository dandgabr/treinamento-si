---
tema: "Posição na estrutura e reporte ao board"
tema_id: "TEMA-02"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Distinguir as instâncias que decidem, aprovam e supervisionam risco cibernético, montando uma matriz de reporte com três decisões reais e o órgão que as recebe."
atende_objetivo: [2]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-01"
      motivo: "a posição do cargo só produz efeito dentro de uma estrutura decisória declarada"
    - alvo: "17-lideranca-ciso#TEMA-04"
      motivo: "quem recebe o relatório define como ele precisa ser escrito"
  aplicado_em:
    - alvo: "11-resposta-forense#TEMA-06"
      motivo: "o reporte ao board se testa na comunicação de crise e na notificação regulatória"
fontes:
  - titulo: "SEC Release 33-11216 — Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure"
    url: "https://www.sec.gov/files/rules/final/2023/33-11216.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — NIS2 Directive: securing network and information systems"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
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
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Posição na estrutura e reporte ao board

Onde o cargo se senta determina o que ele consegue decidir. A regra S-K, Item 106(c), obriga
companhias abertas nos Estados Unidos a descrever a supervisão do conselho sobre risco
cibernético e o papel da administração nessa gestão desde 2023.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: distinguir as instâncias que decidem, aprovam e
supervisionam risco cibernético, montando uma matriz de reporte com três decisões reais e o órgão
que as recebe.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-papel-e-mandato.md). Sem mandato definido, a discussão de posição na estrutura
degenera em disputa de organograma.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quem, na sua organização, tem obrigação formal de supervisionar risco cibernético? Aposte um nome de função antes de ler.
   Confiança: ___
2. Com que frequência o conselho recebe informação de risco cibernético na sua empresa hoje? Chute um intervalo.
   Confiança: ___
3. Se você levar um risco relevante ao comitê, fica registro verificável dessa conversa? Aposte sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Em 08 de julho de 2026, a Comissão Europeia levou Irlanda, Espanha, França e Países Baixos ao
Tribunal de Justiça da União Europeia por não terem notificado as medidas de transposição da NIS2
(Diretiva 2022/2555) para o direito nacional
(https://digital-strategy.ec.europa.eu/en/policies/nis2-directive, acessado em 25/09/2026).

O prazo de transposição era 17 de outubro de 2024. Uma diferença de calendário entre países que
compartilham o mesmo mercado produz uma consequência prática para quem opera em mais de um deles: o
mesmo incidente passa a ter dois regimes de notificação e dois relógios. A pergunta que fica é quem
no seu organograma é o dono desse calendário regulatório.

## 5. Conteúdo

### 5.1 Conceito

Reporte não é acesso. São três coisas distintas, e cada uma tem nome próprio: acesso ao conselho
(ser ouvido), obrigação de reporte (quem é formalmente responsável por levar a informação) e
supervisão (quem responde pelo resultado). A maioria dos CISOs consegue as duas primeiras e
descobre que não tem a terceira.

A matéria não é de estilo. A SEC, na Release 33-11216, adotou regras que exigem que as companhias
descrevam "a supervisão do conselho sobre os riscos de ameaças cibernéticas" e "o papel da
administração na avaliação e gestão de riscos materiais de ameaças cibernéticas" (Item 106(c) da
Regulation S-K). As regras entraram em vigor em 05 de setembro de 2023
(https://www.sec.gov/files/rules/final/2023/33-11216.pdf, acessado em 25/09/2026, páginas 1 e 12).

A NIS2 caminha na mesma direção pelo lado da responsabilização: a Comissão descreve a diretiva como
introdutora da responsabilidade da alta administração pelo descumprimento de medidas de gestão de
risco cibernético. A consequência para o CISO é que a alta administração precisa de informação
suficiente para responder — e informação insuficiente deixa de ser problema de comunicação e passa
a ser problema jurídico.

### 5.2 Como funciona

O CSF 2.0 define a função Govern como o conjunto de resultados que estabelece, comunica e monitora a
estratégia, as expectativas e a política de risco cibernético, e a coloca no centro da roda porque
informa como as outras cinco funções serão implementadas. Dentro dela, a categoria Oversight
(`GV.OV`) determina que os resultados e o desempenho das atividades de gestão de risco sejam usados
para informar, melhorar e ajustar a estratégia, com três subcategorias: `GV.OV-01`, revisão dos
resultados para ajustar direção; `GV.OV-02`, revisão e ajuste da estratégia para cobrir requisitos
e riscos; `GV.OV-03`, avaliação e revisão do desempenho da gestão de risco
(https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf, acessado em 25/09/2026, páginas 17 e 18).

Traduzindo para desenho organizacional, existem quatro posições possíveis para o cargo. Reportar ao
CIO mantém o CISO dentro da cadeia de tecnologia, o que facilita a execução e enfraquece a
capacidade de dizer não a um projeto de TI. Reportar ao CRO ou ao jurídico coloca o tema na agenda
de risco corporativo e pode distanciar o cargo da operação. Reportar ao CEO cria acesso e
dependência de agenda. Reportar ao comitê de auditoria ou ao conselho cria supervisão formal, com
linha de reporte independente da administração. Nenhuma das quatro é correta em abstrato: a escolha
segue o regime regulatório da empresa e o grau de concentração de decisão.

O CISM organiza o mesmo problema no Domínio 1 e entre suas tarefas de apoio inclui "compilar e
apresentar relatórios a stakeholders-chave sobre as atividades, tendências e efetividade geral do
programa" e "avaliar e reportar métricas de segurança da informação a stakeholders-chave"
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026). O
CCISO, no Domínio 2, lista "Board Briefing" e "Managing Up and Managing Expectations" entre as
tarefas de liderança (https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em
25/09/2026, página 4).

### 5.3 Exemplo resolvido

Situação: empresa de capital fechado com comitê de auditoria do conselho, CISO reportando ao CIO,
duas reuniões de conselho por ano. O CISO quer levar risco cibernético à agenda sem reescrever o
organograma no primeiro trimestre.

Passo 1. Separe as decisões que precisam de instância superior. Liste tudo o que você decidiu nos
últimos 90 dias e marque apenas o que envolveu risco residual alto ou exceção de política.

Passo 2. Identifique o receptor por tipo de decisão.

| Decisão | Instância | Periodicidade | Produto |
|---|---|---|---|
| Aceitar risco residual alto de um fornecedor crítico | comitê de auditoria | semestral, com item extraordinário | uma página, com opções e recomendação |
| Aprovar exceção de política para um processo de negócio | dono do processo, com registro | contínua | registro no registro de riscos |
| Orçamento e realocação | comitê executivo | anual, com revisão trimestral | caso de negócio |
| Progresso do programa e desempenho (`GV.OV-03`) | comitê de auditoria | trimestral | painel com poucos indicadores |

Passo 3. Monte o pacote de 30 minutos: 5 minutos de mudanças desde o último ciclo, 10 minutos de
risco material com número, 10 minutos de decisão pedida, 5 minutos de reserva. Sem demo de
ferramenta.

Passo 4. Registre a decisão e a data. A evidência de supervisão é a ata, não a apresentação.

Resultado: o reporte passa a ser um ciclo com produto definido, e o Item 106(c) — quando aplicável
— descreve um processo que existe de fato.

### 5.4 Problema de completar

Sua empresa tem operação na União Europeia e é entidade essencial sob a NIS2. Um incidente
significativo ocorreu. Complete as três últimas etapas.

1. Classifique: incidente notificável, com impacto em serviço essencial.
2. Identifique o receptor interno: comitê de risco e conselho, com o jurídico no circuito.
3. Quem é o dono do prazo de notificação à autoridade nacional e como o prazo é monitorado: _______
4. O que a ata precisa conter para servir como evidência de supervisão: _______
5. Qual decisão você pede nessa reunião, além do informe: _______

## 6. Por que isso importa para o CISO

Posição na estrutura define o que acontece quando você diz não. Com reporte dentro da cadeia de
tecnologia, um "não" é conflito de área. Com linha de supervisão formal, o mesmo "não" é uma decisão
registrada com dono. É também o que separa um incidente administrável de um problema pessoal: se a
supervisão foi exercida e registrada, o conselho tem base para responder; se não foi, não há
evidência de que alguém decidiu algo.

## 7. Aplicação prática

Pegue as três decisões de segurança mais caras do último ano e escreva, para cada uma, quem decidiu,
em qual fórum e onde está o registro. Onde houver célula vazia, leve o caso ao seu gestor com uma
proposta de instância. Uma decisão por reunião, sem pauta temática.

## 8. Autoexplicação

Explique em 3 frases a diferença entre acesso ao conselho, obrigação de reporte e supervisão, usando
um caso da sua organização. Depois responda: qual das três você tem hoje com o conselho?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Ter 15 minutos na reunião do conselho é reporte" | Acesso sem produto não produz decisão nem evidência | Leve um item de decisão e registre em ata |
| "Reportar ao CIO inviabiliza o cargo" | Depende do regime regulatório e da concentração de decisão | Confira o que a norma aplicável exige e documente o desenho escolhido |
| "Avaliação de risco é assunto do comitê de risco" | `GV.OV-03` trata da avaliação do desempenho, não só da avaliação do risco | Separe indicador de risco de indicador de desempenho do programa |
| "Painel de 40 métricas demonstra rigor" | Volume esconde o sinal e consome a única janela que você tem | Três a cinco indicadores ligados a decisões pendentes |
| "Compliance é assunto do jurídico" | Prazo de notificação é decisão técnica e regulatória ao mesmo tempo | Nomeie um dono do calendário regulatório com data e responsável |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. O que a Regulation S-K, Item 106(c), exige que a companhia descreva sobre o conselho?
2. Quais são as três subcategorias da categoria Oversight do CSF 2.0, e o que cada uma pede?
3. Qual é a diferença entre acesso ao conselho, obrigação de reporte e supervisão?

<details>
<summary>Conferir respostas</summary>

1. A supervisão do conselho sobre os riscos de ameaças cibernéticas e o papel da administração na avaliação e gestão de riscos materiais dessa natureza.
2. `GV.OV-01`, revisar os resultados da estratégia para informar e ajustar direção; `GV.OV-02`, revisar e ajustar a estratégia para cobrir requisitos e riscos organizacionais; `GV.OV-03`, avaliar e revisar o desempenho da gestão de risco para os ajustes necessários.
3. Acesso é ser ouvido; reporte é a obrigação formal de levar a informação a quem decide; supervisão é quem responde pelo resultado e deixa registro. As três podem existir em separado.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Montar a matriz de reporte com três decisões reais | Rebaixar: repetir em D+3 |
| D+30 | Verificar se a última decisão do conselho sobre risco está registrada em ata | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 11-resposta-forense#TEMA-06 | o reporte ao board se testa na comunicação de crise e na notificação regulatória |
| complementa | 02-governanca-risco-compliance#TEMA-01 | a posição do cargo só produz efeito dentro de uma estrutura decisória declarada |
| complementa | 17-lideranca-ciso#TEMA-04 | quem recebe o relatório define como ele precisa ser escrito |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [SEC Release 33-11216](https://www.sec.gov/files/rules/final/2023/33-11216.pdf) |
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [NIST Cybersecurity Framework (CSF) 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | SEC Release 33-11216, vigente desde 05/09/2023 | primaria | https://www.sec.gov/files/rules/final/2023/33-11216.pdf | "2026-09-25" | alta |
| 2 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 3 | European Commission — NIS2 Directive | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |
| 4 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 5 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-papel-e-mandato.md) |
| Próximo tema | [TEMA-03](TEMA-03-orcamento-e-priorizacao.md) |
| Home | [README](../README.md) |
