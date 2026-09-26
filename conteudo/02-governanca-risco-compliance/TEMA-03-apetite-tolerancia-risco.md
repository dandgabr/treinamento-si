---
tema: "Apetite e tolerância ao risco"
tema_id: "TEMA-03"
area_id: "02-governanca-risco-compliance"
nivel: avancado
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Redigir uma declaração de apetite de risco com limite financeiro, 3 tolerâncias operacionais medidas e regra de escalonamento, submetendo-a à aprovação de quem tem mandato"
atende_objetivo: [3]
certificacoes: ["CISM", "CRISC"]
pre_requisitos: ["TEMA-01", "TEMA-02", "01-fundamentos#TEMA-06"]
relacoes:
  complementa:
    - alvo: "11-resposta-forense#TEMA-05"
      motivo: "a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar"
    - alvo: "00-guia-basico#TEMA-03"
      motivo: "risco medido só decide quando há apetite declarado, e o registro de risco daquela área é a entrada deste tema"
    - alvo: "01-fundamentos#TEMA-06"
      motivo: "probabilidade e impacto ganham critério de aceitação: sem limiar aprovado, o risco residual não tem contra o que ser comparado"
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "o semáforo do reporte ao conselho só existe porque o limiar declarado aqui define o amarelo e o vermelho"
  aprofundado_por: []
  nao_confundir_com:
    - alvo: "17-lideranca-ciso#TEMA-03"
      motivo: "apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado"

fontes:
  - titulo: "The NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29, 26 de fevereiro de 2024"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — risk tolerance"
    url: "https://csrc.nist.gov/glossary/term/risk_tolerance"
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
  - titulo: "The IIA's Three Lines Model — An update of the Three Lines of Defense, julho de 2020"
    url: "https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — Using Risk Tolerance to Support Enterprise Strategy, white paper de 2022, definições de apetite, tolerância e capacidade de risco"
    url: "https://www.isaca.org/resources/white-papers/using-risk-tolerance-to-support-enterprise-strategy"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Apetite e tolerância ao risco

O CSF 2.0 tem uma subcategoria dedicada a este assunto: `GV.RM-02`, segundo a qual declarações de apetite e de tolerância ao risco são estabelecidas, comunicadas e mantidas ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25). É uma das poucas exigências de framework que pede um documento que quase nenhuma empresa de porte médio tem. Sem esse documento, o risco residual calculado em [01-fundamentos#TEMA-06](../01-fundamentos/TEMA-06-risco-probabilidade-impacto.md) não tem contra o que ser comparado, e a decisão de corrigir ou aceitar volta a depender de quem fala mais alto na reunião.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: redigir uma declaração de apetite de risco com limite financeiro, 3 tolerâncias operacionais medidas e regra de escalonamento, e submetê-la à aprovação de quem tem mandato para isso.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md) e [TEMA-02](TEMA-02-politica-norma-procedimento-diretriz.md), porque apetite aprovado sem alçada e sem documento não muda nenhuma decisão, e [01-fundamentos#TEMA-06](../01-fundamentos/TEMA-06-risco-probabilidade-impacto.md), porque o insumo é risco já medido.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: a sua empresa tem declaração de apetite de risco escrita? Se sim, quem assinou e quando.
   Confiança: ___
2. Palpite: quantas horas de indisponibilidade por trimestre o seu negócio aguenta antes de perder cliente? Anote o número.
   Confiança: ___
3. Antes de ler: quem pode aceitar sozinho um risco de segurança na sua empresa — um diretor, o comitê ou o conselho? Aposte um.
   Confiança: ___
4. Palpite: quantos riscos a sua empresa declarou inaceitáveis por escrito? Anote o número ou "nenhum".
   Confiança: ___

## 4. Caso real

Em uma reunião trimestral de risco, a diretoria aprova o indicador de indisponibilidade com o limite de 4 horas por trimestre em sistemas críticos. No trimestre seguinte, um erro de configuração em um balanceador derruba o portal de pedidos por 6 horas. Ninguém chama o conselho, ninguém revisa o risco e o indicador volta ao patamar normal no trimestre seguinte. O limite foi declarado, mas não havia regra de escalonamento associada a ele.

A pergunta que o caso deixa aberta: o que deveria acontecer automaticamente quando um indicador cruza o limite aprovado? O conteúdo abaixo define as partes da declaração, e a regra de escalonamento é uma delas.

## 5. Conteúdo

### 5.1 Conceito

Apetite de risco e tolerância ao risco são coisas diferentes, e o NIST mantém definições de várias fontes no glossário do CSRC. A mais curta, herdada do SP 800-137, define tolerância como o nível de risco que uma entidade aceita assumir para alcançar um resultado desejado. Outra definição, do SP 800-39, fala em nível de risco ou grau de incerteza aceitável para a organização. Uma terceira, adaptada do ISO Guide 73, descreve a disposição da organização ou das partes interessadas de suportar o risco residual depois de respondê-lo ([csrc.nist.gov](https://csrc.nist.gov/glossary/term/risk_tolerance), acessado em 2026-09-25).

Na prática, apetite é a declaração estratégica de quanto de incerteza a empresa quer correr para perseguir seus objetivos, e tolerância é o número operacional que traduz essa declaração em limite verificável. O CSF 2.0 mantém as duas palavras juntas porque as duas precisam existir: uma sem a outra produz declarações genéricas ou limites sem direção.

O órgão de governança é quem determina o apetite. O modelo da IIA, publicado em julho de 2020, lista entre as responsabilidades do órgão de governança determinar o apetite da organização ao risco e exercer supervisão da gestão de risco, incluindo controle interno ([theiia.org](https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf), acessado em 2026-09-25). O CISO prepara o documento, propõe os limites e mantém o registro; ele não aprova o próprio apetite.

O CSF 2.0 conecta apetite a mais três resultados: objetivos de gestão de risco acordados pelos stakeholders (`GV.RM-01`), direção estratégica que descreve as opções de resposta a risco adequadas (`GV.RM-04`) e método padronizado para calcular, documentar, categorizar e priorizar risco cibernético (`GV.RM-06`). Os três são pré-condição para que o apetite seja aplicável: sem método padronizado, cada área traz um número calculado de forma diferente.

### 5.2 Como funciona

Uma declaração de apetite utilizável tem cinco partes. Documentos de uma página funcionam melhor que manifestos de dez.

**Declaração qualitativa.** Uma ou duas frases sobre a disposição da empresa. Exemplo: "A empresa aceita risco cibernético quando ele é medido, registrado e contido dentro dos limites desta declaração, e não aceita risco que comprometa a continuidade de serviços financeiros ou a exposição de dados pessoais sensíveis de clientes."

**Limites quantitativos por categoria.** Cada categoria tem valor, métrica e janela. As três categorias que quase sempre importam: disponibilidade, confidencialidade e integridade financeira.

| Categoria | Métrica | Tolerância | Janela |
|---|---|---|---|
| Disponibilidade de sistema crítico | Horas de indisponibilidade não planejada | 4 horas | Trimestre |
| Confidencialidade de dado pessoal sensível | Registros expostos de forma não autorizada | 0 registro | Contínuo |
| Integridade financeira | Perda por fraude ou pagamento indevido | R$ 500 mil | Trimestre |
| Exposição de credencial privilegiada ativa | Credenciais sem revisão há mais de 90 dias | 0 credencial | Mensal |

**Riscos declarados inaceitáveis.** A lista negativa evita discussão caso a caso. Costuma incluir violação de obrigação legal de notificação, perda permanente de dado de cliente sem backup verificável e alteração não autorizada em sistema de liquidação financeira.

**Alçada de aceitação.** Quem aceita risco, até que valor e por quanto tempo. Sem essa parte, a declaração é decorativa; a mecânica é a do [TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md).

**Regra de escalonamento e revisão.** O que acontece quando uma tolerância é rompida, quem é notificado, em quanto tempo e o que entra na próxima revisão. É aqui que o caso da seção 4 se resolve: romper a tolerância de indisponibilidade dispara análise de causa, plano com data e reporte no próximo ciclo de governança, sem esperar que alguém decida se o assunto é relevante.

Dois cuidados de calibragem. Primeiro, tolerância acima da capacidade de suportar o impacto é ficção: se a empresa não sobrevive a 12 horas de parada do sistema de faturamento, tolerar 24 horas não é opção. Segundo, tolerância só funciona com medição contínua; um limite trimestral sem dado mensal chega à reunião já estourado.

A ISACA publica definições operacionais dos três termos, atribuindo-as expressamente ao seu Risk IT Framework, 2ª edição, declarado compatível com o COSO ERM e com a ISO 31000 ([isaca.org](https://www.isaca.org/resources/white-papers/using-risk-tolerance-to-support-enterprise-strategy), white paper aberto de 2022, acessado em 2026-09-25). **Apetite** é a quantidade ampla de risco que a organização aceita na busca da sua missão. **Tolerância** é a faixa aceitável em relação ao alcance de um objetivo específico, e a recomendação é quantificá-la na mesma unidade de medida do objetivo. **Capacidade** é a magnitude objetiva de perda que a organização suporta sem pôr em risco a própria continuidade.

A diferença é de consequência, e é isso que muda a conversa com o comitê. Estourar a tolerância pede ação sobre um objetivo; estourar a capacidade ameaça a existência da organização. Quando o apetite não está escrito, o comitê decide no caso concreto, e cada decisão vira precedente — o que dá no mesmo que ter um apetite implícito, só que sem controle.

### 5.3 Exemplo resolvido

Empresa com receita anual de R$ 900 milhões, margem operacional de 12%, sistema de faturamento crítico com indisponibilidade alvo de 99,5%. O CISO precisa transformar "somos conservadores com risco" em declaração aprovada.

1. Ancore no impacto financeiro, não em adjetivo. Uma hora de parada do faturamento custa R$ 180 mil em receita não reconhecida e R$ 60 mil em custo de recuperação, total de R$ 240 mil. A margem trimestral é de R$ 27 milhões.
2. Calcule o teto do apetite pela capacidade de suportar. A diretoria aceita comprometer até 1% da margem trimestral com eventos de segurança, o que dá R$ 270 mil por trimestre. Esse é o teto, e ele cabe em pouco mais de uma hora de indisponibilidade.
3. Traduza o teto em tolerâncias coerentes.

| Categoria | Métrica | Tolerância | Justificativa |
|---|---|---|---|
| Disponibilidade do faturamento | Horas de indisponibilidade por trimestre | 1 hora | O teto de R$ 270 mil equivale a pouco mais de uma hora de parada |
| Confidencialidade de dado pessoal de cliente | Registros expostos | 0 registro | Obrigação legal de notificação e perda de confiança não têm valor compensatório |
| Exposição a fraude em pagamentos | Perda por trimestre | R$ 270 mil | Mesmo teto, mantido por consistência de critério |
| Acesso privilegiado | Credenciais sem recertificação há mais de 90 dias | 0 | Cada credencial sem revisão é exposição sem controle |

4. Escreva a regra de escalonamento. Rompimento de qualquer tolerância dispara: registro no sistema de risco em até 24 horas, análise de causa em 5 dias úteis, plano com data e dono em 10 dias úteis, e reporte obrigatório no próximo fórum executivo de risco, independentemente de o indicador já ter voltado ao normal.
5. Leve à aprovação com três perguntas objetivas: o teto de R$ 270 mil por trimestre está correto? As quatro tolerâncias refletem o que a diretoria quer proteger? O escalonamento automático é aceitável mesmo quando o indicador se recupera sozinho?

Caso de decisão, usando a declaração pronta. Um servidor de banco de dados fica sem suporte do fornecedor por 18 meses. A migração custa R$ 1,4 milhão. O risco estimado é de indisponibilidade de 12 horas durante a janela, com impacto de R$ 2,9 milhões, e probabilidade média. A comparação é direta: exposição de R$ 2,9 milhões contra R$ 1,4 milhão de correção, e o risco não cabe em nenhuma tolerância declarada. Com a declaração aprovada, a decisão não é do CISO, é da diretoria estatutária, na faixa acima de R$ 2 milhões definida no [TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md). O papel do CISO é levar o número, o registro e o prazo, não a opinião.

### 5.4 Problema de completar

Complete as linhas em branco da tabela de tolerâncias para uma empresa de varejo online com receita de R$ 400 milhões, margem operacional de 8%, e complete a regra de escalonamento.

1. Teto de apetite: 1% da margem trimestral. Margem trimestral = ______. Teto = ______.
2. Uma hora de indisponibilidade do checkout custa R$ 90 mil de receita e R$ 20 mil de custo de recuperação. Tolerância de disponibilidade em horas por trimestre = ______.
3. Rompimento de tolerância de confidencialidade de dado de cartão exige, no máximo em 24 horas: ______.
4. A declaração deve dizer quem aprova a aceitação de risco até o teto: ______.

Regra de conferência: cada tolerância tem métrica, valor, janela e consequência automática. Se faltar a consequência, o número não muda comportamento.

## 6. Por que isso importa para o CISO

Três consequências concretas. A primeira é orçamento: com teto declarado, o pedido de verba deixa de ser comparação entre projetos de segurança e passa a ser comparação entre custo do controle e exposição dentro do limite que o conselho aprovou. A segunda é exposição pessoal: a aceitação de risco sai da mesa do CISO e entra na mesa de quem tem alçada, com registro. A terceira é a conversa com o regulador e com a auditoria: a ISACA trata da resposta a risco com base no apetite organizacional como tarefa de apoio do CISM, e reportar risco, não conformidade e mudanças no risco para apoiar a decisão é outra tarefa explícita ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25).

Há um efeito de segunda ordem que costuma pegar o CISO de surpresa. Quando a tolerância fica explícita, o valor da segurança fica visível no orçamento dos outros: áreas de negócio passam a comparar o custo do controle com o teto de perda que a própria empresa declarou aceitar. Quem não preparou esse argumento perde a discussão no comitê de investimento.

## 7. Aplicação prática

Um mês, quatro passos, sem consultoria.

1. Levante cinco números que a empresa já tem: margem por trimestre, custo por hora de parada do sistema mais crítico, perdas por fraude nos últimos 12 meses, número de registros pessoais sob gestão e número de credenciais privilegiadas ativas.
2. Leve ao patrocinador executivo a pergunta sobre o teto: qual percentual da margem trimestral a empresa aceita comprometer com eventos de segurança? Anote a resposta literal, mesmo informal.
3. Escreva a declaração em uma página, com as cinco partes da seção 5.2, e circule os dois números que você não conseguiu calcular.
4. Submeta ao fórum que tem mandato sobre risco. Se não houver esse fórum, a primeira decisão é criar o fórum, e o [TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md) dá o desenho dele.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre a diferença entre apetite e tolerância, uma sobre por que o teto se ancora em capacidade de suportar o impacto, e uma conectando a declaração a uma decisão que está travada na sua empresa agora.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Apetite se declara com adjetivos | "Somos conservadores" não permite comparar dois riscos nem ordenar fila | Cada tolerância tem métrica, valor e janela |
| Tolerância é o risco que sobra depois do controle | Risco residual é resultado de tratamento; tolerância é critério de aceitação definido antes | Primeiro se declara o limite, depois se mede o residual contra ele |
| Tolerância alta resolve o problema | Limite acima da capacidade de suportar impacto não protege nada e desloca a decisão para o pior momento | O teto sai da capacidade financeira e operacional da empresa |
| O CISO aprova o apetite | Determinar apetite é papel do órgão de governança no modelo da IIA | O CISO propõe, mede e mantém; a aprovação é de quem tem mandato |
| Declaração se revisa só quando muda a diretoria | Requisitos, ameaças e tecnologia mudam todo ano e `GV.PO-02` pede revisão por mudança | A declaração tem data de revisão e gatilhos de revisão extraordinária |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual definição de tolerância ao risco o glossário do CSRC atribui ao SP 800-137?
2. Cite três subcategorias da função Govern do CSF 2.0 ligadas a apetite e método de risco, com o que cada uma pede.
3. Quais são as cinco partes de uma declaração de apetite utilizável?
4. Um indicador de indisponibilidade rompe a tolerância e volta ao normal dois dias depois. O que deve acontecer mesmo assim?
5. Por que a tolerância de confidencialidade costuma ser zero enquanto a de disponibilidade é um número em horas?

<details>
<summary>Conferir respostas</summary>

1. O nível de risco que uma entidade aceita assumir para alcançar um resultado desejado.
2. `GV.RM-01`, objetivos de gestão de risco estabelecidos e acordados pelos stakeholders; `GV.RM-02`, declarações de apetite e tolerância estabelecidas, comunicadas e mantidas; `GV.RM-06`, método padronizado para calcular, documentar, categorizar e priorizar risco cibernético.
3. Declaração qualitativa, limites quantitativos por categoria com métrica e janela, lista de riscos inaceitáveis, alçada de aceitação e regra de escalonamento e revisão.
4. Registro em até 24 horas, análise de causa, plano com data e dono, e reporte obrigatório no próximo fórum de risco. O rompimento aconteceu; a recuperação rápida reduz o dano, não apaga o evento.
5. Porque exposição de dado pessoal aciona obrigação legal de notificação e perda de confiança que não têm valor compensatório, enquanto indisponibilidade tem custo por hora mensurável e absorvível dentro de um teto.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever a declaração de uma página para a sua empresa e marcar os números que faltam | Rebaixar: repetir em D+3 |
| D+30 | Levar a declaração ao fórum competente e registrar a resposta do executivo | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 00-guia-basico#TEMA-03 | risco medido só decide quando há apetite declarado, e o registro de risco daquela área é a entrada deste tema |
| complementa | 01-fundamentos#TEMA-06 | probabilidade e impacto ganham critério de aceitação: sem limiar aprovado, o risco residual não tem contra o que ser comparado |
| complementa | 02-governanca-risco-compliance#TEMA-06 | o semáforo do reporte ao conselho só existe porque o limiar declarado aqui define o amarelo e o vermelho |
| complementa | 11-resposta-forense#TEMA-05 | a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar |
| nao_confundir_com | 17-lideranca-ciso#TEMA-03 | apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado |

## 13. Certificações e leitura recomendada

O domínio 2 do CISM, Information Security Risk Management, responde por 20% das questões e cobre avaliação de risco, resposta a risco, propriedade de risco e controle, e monitoramento e reporte de risco. Entre as tarefas de apoio estão identificar, recomendar ou implementar opções de tratamento para manter o risco em nível aceitável com base no apetite organizacional, e reportar risco, incluindo não conformidade e mudanças no risco, para apoiar a decisão ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25).

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Risk Management | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CRISC | Risk response e apetite organizacional | NIST CSRC Glossary — risk tolerance | primaria | https://csrc.nist.gov/glossary/term/risk_tolerance |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — risk tolerance | primaria | https://csrc.nist.gov/glossary/term/risk_tolerance | "2026-09-25" | alta |
| 3 | NIST SP 800-39 — Managing Information Security Risk | primaria | https://csrc.nist.gov/pubs/sp/800/39/final | "2026-09-25" | alta |
| 4 | NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments | primaria | https://csrc.nist.gov/pubs/sp/800/30/r1/final | "2026-09-25" | alta |
| 5 | The IIA's Three Lines Model, julho de 2020 | primaria | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf | "2026-09-25" | alta |
| 6 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: os percentuais de margem, os custos por hora de parada e os tetos usados nos exemplos são ilustrativos; nenhum dos documentos citados fixa percentual de apetite, porque essa é uma decisão de cada organização.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-politica-norma-procedimento-diretriz.md) |
| Próximo tema | [TEMA-04](TEMA-04-isms-iso-27001.md) |
| Home | [README](../README.md) |
