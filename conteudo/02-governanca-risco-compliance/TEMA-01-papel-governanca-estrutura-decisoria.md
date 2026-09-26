---
tema: "Papel da governança de segurança e a estrutura decisória"
tema_id: "TEMA-01"
area_id: "02-governanca-risco-compliance"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Mapear os direitos de decisão de segurança de uma empresa, nomeando para 6 decisões o aprovador, o consultado, o informado e o responsável pela execução, com alçada escrita para aceitação de risco"
atende_objetivo: [1]
certificacoes: ["CISM", "CRISC"]
pre_requisitos: ["01-fundamentos#TEMA-06"]
relacoes:
  complementa:
    - alvo: "17-lideranca-ciso#TEMA-02"
      motivo: "alçada interna só fecha quando se sabe a posição do cargo na estrutura e a linha de reporte ao conselho; destino planejado"
    - alvo: "02-governanca-risco-compliance#TEMA-02"
      motivo: "a decisão vive no documento: sem norma aprovada, a alçada existe apenas na memória de quem estava na reunião"
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "o rito de decisão só é verificável quando o reporte e a auditoria testam se ele foi seguido"
  aprofundado_por: []
  nao_confundir_com: []
fontes:
  - titulo: "The IIA's Three Lines Model — An update of the Three Lines of Defense, julho de 2020"
    url: "https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "The NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29, 26 de fevereiro de 2024"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-39 — Managing Information Security Risk: Organization, Mission, and Information System View"
    url: "https://csrc.nist.gov/pubs/sp/800/39/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments"
    url: "https://csrc.nist.gov/pubs/sp/800/30/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Resolução CMN nº 4.893, de 26 de fevereiro de 2021 — art. 7º, sobre diretor responsável pela política de segurança cibernética"
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Papel da governança de segurança e a estrutura decisória

A IIA publicou em julho de 2020 um modelo em que o órgão de governança é quem determina o apetite da organização ao risco, a gestão executa e assume risco na primeira linha, funções de segunda linha apoiam e questionam, e a auditoria interna presta asseguração independente como terceira linha ([theiia.org](https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf), acessado em 2026-09-25). Governança de segurança, portanto, não é o conjunto de reuniões em que o CISO participa. É o conjunto de decisões que têm dono nomeado, alçada escrita e registro.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: mapear os direitos de decisão de segurança da sua empresa, nomeando para 6 decisões o aprovador, o consultado, o informado e o responsável pela execução, com alçada escrita para aceitação de risco.

## 2. Pré-requisitos

[01-fundamentos#TEMA-06](../01-fundamentos/TEMA-06-risco-probabilidade-impacto.md), porque alçada de risco se escreve em faixa de impacto, e probabilidade e impacto já vêm definidos de lá.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quem aceita formalmente, na sua empresa, um risco de segurança que custa mais de R$ 1 milhão para ser corrigido?
   Confiança: ___
2. O comitê de segurança da sua empresa decide o quê, e em quantas das decisões do ano passado ele teve a palavra final?
   Confiança: ___
3. Segurança da informação está na primeira, na segunda ou na terceira linha do modelo de governança?
   Confiança: ___
4. Se o CISO não tem alçada para aprovar orçamento, quais decisões ele ainda controla?
   Confiança: ___

## 4. Caso real

A Resolução CMN nº 4.893, de 26 de fevereiro de 2021, exige em seu art. 7º que a instituição designe diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes ([bcb.gov.br](https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893), registro de fonte de 2026-09-25 em [99-fontes/registro-verificacao.md](../99-fontes/registro-verificacao.md), não reverificado nesta execução). A exigência cria uma pessoa accountable, e não uma equipe. O diretor designado pode delegar trabalho, mas não pode delegar a responsabilidade perante o regulador.

A pergunta que o caso deixa aberta: se a responsabilidade é pessoal e a execução é distribuída por seis diretorias, onde termina a governança e onde começa a operação? O conteúdo abaixo responde com a distinção entre responsabilidade e execução.

## 5. Conteúdo

### 5.1 Conceito

Governança de segurança é a alocação de direitos de decisão sobre risco. Três perguntas definem se ela existe: quem pode decidir, com que informação, e o que acontece quando a decisão é contrária à recomendação técnica. Uma empresa que responde às três por escrito tem governança; uma empresa que responde por hábito tem hierarquia.

O CSF 2.0 organiza essa camada na função Govern, com categorias para contexto organizacional `GV.OC`, estratégia de gestão de risco `GV.RM`, papéis e responsabilidades `GV.RR`, política `GV.PO`, supervisão `GV.OV` e risco da cadeia de suprimentos `GV.SC` ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25). Os resultados de papéis são explícitos: liderança responsável e accountable pelo risco cibernético (`GV.RR-01`), papéis, responsabilidades e autoridades estabelecidos, comunicados, compreendidos e aplicados (`GV.RR-02`), e recursos adequados alocados conforme a estratégia (`GV.RR-03`).

Accountability não se transfere por e-mail. Quem responde pelo risco de um processo é o dono do processo, mesmo quando a escolha técnica foi feita por outro. O NIST SP 800-39, publicado em março de 2011, estrutura a gestão de risco em três níveis, do nível da organização ao nível do sistema de informação, e é esse desenho que permite ao executivo tratar risco cibernético no mesmo fórum em que trata risco financeiro ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/39/final), acessado em 2026-09-25). O SP 800-30 Rev. 1, de setembro de 2012, complementa ao levar a avaliação de risco aos três níveis da hierarquia de gestão de risco, entregando a liderança a informação de que ela precisa para escolher o curso de ação ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/30/r1/final), acessado em 2026-09-25).

### 5.2 Como funciona

A estrutura decisória se monta em quatro artefatos, e não em um organograma.

**Mapa de direitos de decisão.** Uma tabela com uma linha por tipo de decisão e quatro colunas: aprovador, consultado, informado e executor. Decisões típicas de segurança: aceitar risco acima da tolerância, aprovar exceção a norma, liberar orçamento de projeto, aprovar arquitetura de referência, aprovar plano de resposta a incidente, contratar fornecedor crítico.

**Alçadas de aceitação.** Uma faixa de valor por decisão. Aceitação de risco até um limite fica com o dono do processo; acima do limite sobe para o comitê; acima do teto do comitê sobe para o conselho ou para a diretoria estatutária. O valor é escrito em moeda e em impacto de negócio, e não em cor de risco.

**Fóruns com pauta fixa.** Um fórum executivo trimestral trata apetite, risco material e orçamento. Um fórum operacional mensal trata exceções, incidentes, mudanças de arquitetura e planos de ação. Dois fóruns com públicos diferentes evitam que a decisão de R$ 50 mil consuma a agenda da decisão de R$ 5 milhões.

**Escalonamento com prazo.** Toda exceção e todo risco acima da tolerância tem prazo máximo para voltar ao fórum. Sem prazo, a exceção temporária se torna configuração permanente e o mapa de decisão perde validade.

A separação entre linhas é o que sustenta o resto. Segurança da informação é função de segunda linha no modelo da IIA: ajuda a gerir risco, monitora e questiona. Auditoria interna é a terceira linha, com independência da gestão, e é ela que dá ao conselho a asseguração sobre a adequação e a efetividade da governança e da gestão de risco. Um CISO que assume atividade de terceira linha, como auditar o próprio controle que desenhou, devolve ao conselho a obrigação de contratar asseguração externa.

### 5.3 Exemplo resolvido

Objetivo: uma empresa de 4.000 funcionários, com receita anual de R$ 900 milhões, precisa saber quem decide aceitar risco e quem decide conceder exceção. Passo a passo.

1. Liste os tipos de decisão que hoje param na mesa do CISO. No exemplo, apareceram sete: aceitar risco, conceder exceção a norma, aprovar exceção de firewall, liberar acesso privilegiado permanente, aprovar fornecedor crítico, aprovar desvio de arquitetura e aprovar orçamento de segurança.
2. Fixe o critério de valor. A tolerância aprovada admite aceitação de risco até R$ 250 mil de custo de correção. Acima disso, a decisão é do comitê executivo de risco; acima de R$ 2 milhões, da diretoria estatutária, com registro em ata.
3. Preencha o mapa, com quatro colunas por decisão.

| Decisão | Aprovador | Consultado | Informado | Executor |
|---|---|---|---|---|
| Aceitar risco até R$ 250 mil | Dono do processo de negócio | CISO | Comitê de risco, na ata | Dono do controle |
| Aceitar risco acima de R$ 2 milhões | Diretoria estatutária | CISO e jurídico | Conselho, no reporte trimestral | Dono do processo |
| Conceder exceção a norma | Dono da norma, com parecer do CISO | Auditoria interna | Comitê de risco | Dono do controle |
| Liberar acesso privilegiado permanente | Dono da plataforma | Segurança, na segunda linha | Comitê de risco | Operação de identidade |
| Aprovar fornecedor crítico | Compras, com veto técnico do CISO | Jurídico e privacidade | Comitê de risco | Dono do contrato |

4. Defina o rito de discordância. Quando o dono do processo decide contra o parecer do CISO dentro da própria alçada, a decisão vale e o parecer vai anexado ao registro. O que não pode acontecer é a decisão existir sem que a discordância fique registrada; é esse registro que protege a empresa e o próprio dono da decisão.
5. Publique a alçada na norma de gestão de risco, com data de revisão anual. Alçada que não está em documento aprovado é hábito, e hábito muda quando muda o executivo.

### 5.4 Problema de completar

Mesma empresa, dois casos novos. Complete as linhas em branco antes de seguir.

| Decisão | Aprovador | Consultado | Informado | Executor |
|---|---|---|---|---|
| Manter servidor de banco de dados sem suporte por 18 meses, custo de migração R$ 1,4 milhão | ______ | CISO e jurídico | ______ | Infraestrutura |
| Liberar exceção para que o time de dados acesse produção sem cofre de senha, por 60 dias | Dono da plataforma | ______ | Comitê de risco | ______ |
| Contratar fornecedor de SOC terceirizado com acesso a log de toda a empresa | ______ | Jurídico, privacidade e CISO | ______ | Dono do contrato |

Regra de conferência: o aprovador nunca é quem executa; o consultado nunca tem veto quando não assina; e toda exceção tem prazo, dono e critério de encerramento.

## 6. Por que isso importa para o CISO

O que muda é a exposição pessoal. Um CISO que aceita risco fora da alçada cria para si um passivo que nenhuma ferramenta cobre: quando o incidente chega, a pergunta do regulador, do conselho e da apólice de seguro é quem autorizou. A Resolução CMN nº 4.893, no art. 7º, coloca a responsabilidade em um diretor designado, e essa é a direção que o regulador brasileiro adotou para o setor financeiro.

Há uma consequência de verba também. Com alçada escrita, o pedido de orçamento deixa de ser uma negociação de gosto e passa a ser uma comparação: o custo do controle contra o limite de aceitação já aprovado. Quem não tem esse número discute opinião.

## 7. Aplicação prática

Em três semanas, sem depender de ferramenta nova.

1. Semana 1: liste as decisões de segurança tomadas nos últimos 90 dias, com data, decisor e registro. Levante atas, e-mails de aprovação e tickets de exceção.
2. Semana 2: escreva a primeira versão do mapa de direitos de decisão com as sete decisões da seção 5.3 adaptadas à sua realidade. Marque com asterisco as que hoje não têm dono nomeado.
3. Semana 3: leve o mapa ao patrocinador executivo com uma pergunta única: qual valor de aceitação cada nível pode autorizar? A resposta, mesmo provisória, vira a primeira versão da alçada e o insumo do [TEMA-03](TEMA-03-apetite-tolerancia-risco.md).

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto, e conecte-o a algo que você já faz hoje. Uma frase sobre a diferença entre responder pelo risco e executar o controle, uma sobre o que a alçada escrita muda em uma decisão real da sua semana, e uma sobre o que acontece quando o CISO acumula segunda e terceira linha.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| O comitê de segurança aprova risco | Comitê sem mandato do conselho ou da diretoria apenas recomenda; a decisão continua sem dono formal | O mandato do comitê é escrito, com faixa de valor e limite de alçada, e revisado anualmente |
| O CISO é o dono do risco de segurança | O risco pertence ao processo de negócio que depende do ativo; o CISO é o segundo dono, que questiona e monitora | Dono do risco é o dono do processo; o CISO mantém o método, o registro e o parecer |
| Segurança da informação é a terceira linha | Quem desenha e opera o controle não pode ser a instância que dá asseguração independente sobre ele | Segurança é segunda linha; auditoria interna é a terceira, com independência da gestão |
| Governança é o mesmo que gestão | Gestão executa o plano; governança define direção, alçada e supervisão | O CSF 2.0 coloca os dois em categorias distintas, com supervisão em `GV.OV` |
| Aprovar política é o bastante | Política sem alçada de exceção e sem rito de discordância não resolve o caso concreto | Toda norma precisa do caminho de exceção, do prazo e de quem assina a exceção |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite as três perguntas que definem se a governança de segurança existe em uma empresa.
2. Um diretor estatutário decidiu manter um sistema sem suporte contra o parecer do CISO. O que precisa existir no registro para que a decisão seja considerada governada?
3. Em qual linha do modelo da IIA fica a auditoria interna, e o que isso muda quando o CISO quer testar o próprio controle?
4. Qual resultado do CSF 2.0 trata da alocação de recursos para segurança?
5. Por que a alçada de aceitação de risco se escreve em valor financeiro e não em cor de risco?

<details>
<summary>Conferir respostas</summary>

1. Quem pode decidir, com que informação decide, e o que acontece quando decide contra a recomendação técnica. Sem as três respostas por escrito, a empresa tem hierarquia e não governança.
2. A decisão registrada com o dono nomeado, o parecer técnico anexado, o valor de exposição estimado, a data de revisão e o fórum em que foi comunicada. Discordância registrada é o que separa decisão consciente de omissão.
3. Terceira linha, com independência da gestão e accountability perante o órgão de governança. Se o CISO audita o controle que desenhou, a asseguração perde objetividade e o conselho precisa buscar terceiro qualificado.
4. `GV.RR-03`: recursos adequados alocados em proporção à estratégia de risco, aos papéis, às responsabilidades e às políticas.
5. Porque valor financeiro é comparável com o custo do controle e com o limite que o conselho aprovou. Cor de risco não ordena fila nem define até onde alguém pode decidir sozinho.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo ([91-trilhas](../91-trilhas/README.md)), que mantém `proxima_revisao` no registro de progresso.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar o mapa de direitos de decisão da sua empresa em 3 frases | Rebaixar: repetir em D+3 |
| D+30 | Apresentar o mapa revisado ao patrocinador executivo e anotar a reação | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-06 | o rito de decisão só é verificável quando o reporte e a auditoria testam se ele foi seguido |
| complementa | 02-governanca-risco-compliance#TEMA-02 | a decisão vive no documento: sem norma aprovada, a alçada existe apenas na memória de quem estava na reunião |
| complementa | 17-lideranca-ciso#TEMA-02 | alçada interna só fecha quando se sabe a posição do cargo na estrutura e a linha de reporte ao conselho; destino planejado |

## 13. Certificações e leitura recomendada

O domínio 1 do CISM, Information Security Governance, responde por 17% das 150 questões e cobre cultura organizacional, requisitos legais, regulatórios e contratuais, e estruturas organizacionais, papéis e responsabilidades. Entre as supporting tasks do exame estão definir, comunicar e monitorar responsabilidades de segurança ao longo da organização e das linhas de autoridade, e obter compromisso contínuo da liderança sênior ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). O detalhe da credencial fica em [90-certificacoes/](../90-certificacoes/README.md).

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Governance | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CRISC | Governança de risco de TI e controles | Three Lines Model | primaria | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | The IIA's Three Lines Model, julho de 2020 | primaria | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf | "2026-09-25" | alta |
| 2 | NIST CSF 2.0 — NIST CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 3 | NIST SP 800-39 — Managing Information Security Risk | primaria | https://csrc.nist.gov/pubs/sp/800/39/final | "2026-09-25" | alta |
| 4 | NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments | primaria | https://csrc.nist.gov/pubs/sp/800/30/r1/final | "2026-09-25" | alta |
| 5 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 6 | Resolução CMN nº 4.893, art. 7º | primaria | https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893 | "2026-09-25" | media |

NAO CONFIRMADO em fonte oficial nesta execução: a faixa de valor de alçada usada no exemplo resolvido é ilustrativa e não corresponde a exigência normativa de nenhum dos documentos citados.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-politica-norma-procedimento-diretriz.md) |
| Home | [README](../README.md) |
