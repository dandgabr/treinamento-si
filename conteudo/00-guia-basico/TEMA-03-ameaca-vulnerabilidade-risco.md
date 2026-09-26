---
tema: "Ameaças, vulnerabilidades e risco: o vocabulário mínimo"
tema_id: "TEMA-03"
area_id: "00-guia-basico"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Separar ameaça, vulnerabilidade e risco em um registro de risco próprio, escrevendo cada linha com impacto, probabilidade e responsável nomeado"
atende_objetivo: [3]
certificacoes: ["CISM"]
pre_requisitos: ["TEMA-02"]
relacoes:
  complementa:
    - alvo: "00-guia-basico#TEMA-04"
      motivo: "o vocabulário de risco só vira decisão quando existe um mandato que autorize aceitar risco, e o mandato é o assunto do TEMA-04"
    - alvo: "02-governanca-risco-compliance#TEMA-03"
      motivo: "risco estimado em unidade comparável só decide algo quando há critério de aceite declarado, e o apetite de risco pertence à área 02"
  aprofundado_por: []
  aplicado_em:
    - alvo: "00-guia-basico#TEMA-05"
      motivo: "as três primeiras linhas de registro de risco são o artefato do primeiro marco da agenda dos 90 dias"
  nao_confundir_com: []
fontes:
  - titulo: "NIST CSRC Glossary — risk, conforme NIST SP 800-30 Rev. 1 e OMB Circular A-130"
    url: "https://csrc.nist.gov/glossary/term/risk"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — vulnerability, conforme FIPS 200 e NIST SP 800-30 Rev. 1"
    url: "https://csrc.nist.gov/glossary/term/vulnerability"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — threat source, conforme FIPS 200 e NIST SP 800-30 Rev. 1"
    url: "https://csrc.nist.gov/glossary/term/threat_source"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "FIPS PUB 199 — Standards for Security Categorization of Federal Information and Information Systems"
    url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Comissão Europeia — NIS2 Directive: securing network and information systems"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Ameaças, vulnerabilidades e risco: o vocabulário mínimo

Uma ideia central: ameaça, vulnerabilidade e risco são três substantivos com três donos diferentes, e quem os usa como sinônimo perde a capacidade de priorizar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: separar ameaça, vulnerabilidade e risco em um registro de risco próprio, escrevendo cada linha com o impacto estimado, a probabilidade estimada e um responsável nomeado pela decisão.

## 2. Pré-requisitos

TEMA-02. O impacto que entra na linha de risco é o nível de impacto que você aprendeu a atribuir lá.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Escreva a sua definição de risco em uma frase e guarde. Depois confira se ela cita probabilidade.
   Confiança: ___
2. Palpite: entre ameaça, vulnerabilidade e risco, qual dessas palavras o seu comitê mais usa em reunião? E qual deveria usar?
   Confiança: ___
3. Antes de ler: quem aceita o risco residual na sua empresa — você, o comitê ou o conselho? Anote antes de conferir.
   Confiança: ___

## 4. Caso real

A NIS2, Diretiva 2022/2555 da União Europeia, alcança dezenas de milhares de entidades de porte médio e grande em 18 setores críticos. Ela exige que essas entidades adotem medidas de gestão de risco e notifiquem incidentes significativos à autoridade nacional competente, e introduz responsabilidade da alta administração pelo descumprimento das medidas de gestão de risco.

O prazo para os Estados-membros transporem a diretiva era 17 de outubro de 2024. Em julho de 2026, a Comissão Europeia informou ter encaminhado Irlanda, Espanha, França e Países Baixos ao Tribunal de Justiça por não terem notificado as medidas de transposição.

A pergunta que o caso deixa: quem decide que um incidente é "significativo", e com que critério? A norma cobra a notificação, e a decisão de notificar depende inteiramente de o vocabulário de risco estar ou não resolvido dentro da empresa.

## 5. Conteúdo

### 5.1 Conceito

Comece pelo termo que a maioria usa para tudo. O glossário do NIST, reproduzindo a definição do NIST SP 800-30 Rev. 1 e da Circular A-130 do OMB, define risco como a medida em que uma entidade é ameaçada por uma circunstância ou evento potencial, tipicamente função de dois fatores: o impacto adverso que ocorreria se o evento acontecesse e a probabilidade de ocorrência.

Vulnerabilidade aparece no mesmo glossário com a redação do FIPS 200: fraqueza em um sistema de informação, em procedimentos de segurança, em controles internos ou em implementação, que poderia ser explorada ou disparada por uma fonte de ameaça. Repare no que a definição não diz: não diz que o dano aconteceu, nem que acontecerá.

Fonte de ameaça tem definição separada, também vinda do FIPS 200: a intenção e o método voltados à exploração intencional de uma vulnerabilidade, ou uma situação e um método que podem disparar uma vulnerabilidade acidentalmente. A segunda metade dessa definição é a que a maioria esquece: queda de energia, erro de configuração e falha de hardware são fontes de ameaça, sem adversário nenhum.

Junte as três e a frase fica simples. Uma vulnerabilidade sem fonte de ameaça é um achado. Uma fonte de ameaça sem vulnerabilidade é ruído. Risco é o encontro dos dois, medido pelo impacto sobre a operação e pela probabilidade de acontecer.

### 5.2 Como funciona

O registro de risco transforma a definição em linha de tabela. Cada linha carrega cinco campos, e cada campo tem um dono.

O ativo e o tipo de informação vêm do TEMA-01. O impacto vem do TEMA-02: escreva o objetivo atingido e o nível LOW, MODERATE ou HIGH. A fonte de ameaça descreve quem ou o que, e com qual método. A vulnerabilidade descreve a fraqueza concreta, no formato "o que existe hoje que permite o evento". Os controles já existentes entram na mesma linha, porque risco é o que sobra depois deles.

A probabilidade é o campo onde a honestidade aparece. Existem dois insumos legítimos: exposição, ou seja, o quanto o alvo está alcançável e o quanto aquele tipo de evento já ocorre no seu setor, e histórico interno, ou seja, quantas vezes algo parecido aconteceu nos últimos doze meses. Sem nenhum dos dois, a estimativa é chute com número, e o número dá a falsa impressão de precisão.

Sobre a escala, use poucos degraus. Uma escala de três ou cinco níveis, com uma frase definindo cada nível, sobrevive à auditoria; uma escala de dez níveis ou de valores monetários exatos não sobrevive ao primeiro mês. O registro serve para comparar riscos entre si e para decidir sobre eles — tratar, transferir por contrato ou seguro, ou aceitar formalmente. O critério de quando aceitar não se define aqui: ele é apetite de risco, e pertence à [02 Governança, risco e compliance](../02-governanca-risco-compliance/README.md).

Por fim, o campo que falta em quase todo registro brasileiro: responsável nomeado pela decisão. Não o responsável pela execução do controle, mas quem responde por escolher entre tratar e aceitar. Fonte de ameaça pertence ao adversário, vulnerabilidade pertence ao dono do sistema, e a decisão sobre o risco pertence a quem tem orçamento para mudá-lo.

### 5.3 Exemplo resolvido

Uma varejista de porte médio, com frente de loja online e retaguarda administrativa. A linha de risco é construída passo a passo.

Ativo e tipo de informação: base de clientes com cadastro e histórico de pedidos. Objetivo atingido: confidencialidade, em nível MODERATE, porque a divulgação da base permite fraude contra clientes identificáveis.

Fonte de ameaça: grupo que reaproveita credenciais vazadas de outros serviços e testa combinações de forma automatizada. Método: acesso remoto à VPN administrativa, exposta à internet.

Vulnerabilidade: a conta administrativa aceita autenticação somente por senha, e não há alerta para login fora do horário comercial nem limite de tentativas por origem.

Controles existentes: firewall de borda com regras de porta, registro de acesso retido por 30 dias, revisão trimestral de contas. Nenhum alerta automático.

Impacto: MODERATE, herdado do tipo de informação, com a consequência escrita — um cliente que sofre fraude a partir dos dados da empresa abre reclamação no consumidor, no órgão de proteção de dados e nas redes sociais.

Probabilidade: 4 em 5. O insumo é a exposição — o serviço de acesso remoto está publicamente alcançável e esse tipo de evento é rotina no setor — e o histórico interno, que registra dois picos de tentativas de acesso no último ano.

Decisão: tratar, com prazo. Segundo fator para todas as contas administrativas em 30 dias e alerta de login em horário atípico em 15 dias. Enquanto isso, aceite temporário com data de revisão em 30 dias, assinado pela diretora de operações, que é a responsável nomeada pela decisão.

O que esse exemplo demonstra é o custo de sair do adjetivo. "Risco alto de invasão" não gera prazo nem dono. A linha acima gera dois itens com data e uma assinatura.

### 5.4 Problema de completar

A mesma varejista tem um servidor de backup que roda à noite em uma sala sem controle de acesso físico e mantém cópias em disco conectado de forma permanente. Complete a linha.

| Campo | Preenchimento |
|---|---|
| Ativo e tipo de informação | Servidor de backup com cópias de cadastro e pedidos |
| Objetivo e nível | ______ |
| Fonte de ameaça | Grupo que cifra dados e pede resgate, operando por execução remota automatizada |
| Vulnerabilidade | ______ |
| Controles existentes | Backup diário, sala com porta com fechadura comum, sem registro de entrada |
| Impacto | ______ |
| Probabilidade | ______ |
| Decisão, prazo e responsável | ______ |

Responda ainda: qual dos oito campos acima é o único que não pode ser preenchido por você sozinho, e por quê?

## 6. Por que isso importa para o CISO

Risco aceito sem dono é risco de ninguém. A frase parece óbvia e sobrevive a quase toda primeira auditoria de um CISO novo, porque o registro que ele herda costuma ter coluna de "responsável" preenchida com nome de gerente de TI — pessoa que executa o controle e não tem orçamento para mudá-lo.

A NIS2 mostra a direção em que a responsabilização se move: ela introduz responsabilidade da alta administração pelo descumprimento das medidas de gestão de risco. Onde esse tipo de regra existe, aceitar risco passa a ser ato da administração, com registro. Isso muda o formato do relatório que você leva ao comitê: em vez de uma lista de projetos de segurança, uma lista de riscos com impacto, probabilidade, resposta proposta e quem aceita o que sobrar.

Terceiro efeito: o vocabulário protege a área de segurança de uma acusação comum. Quando a diretoria pergunta por que uma vulnerabilidade crítica divulgada há seis meses não foi corrigida, a resposta com vocabulário separa as coisas — a vulnerabilidade existe, a fonte de ameaça não tem método viável contra esse sistema, e o custo da correção supera o impacto estimado. Sem vocabulário, a resposta é "ainda não deu tempo".

## 7. Aplicação prática

Pegue os três últimos achados de auditoria ou de varredura que chegaram à sua mesa e classifique cada um: é ameaça, é vulnerabilidade ou é risco? A maioria vai cair em vulnerabilidade, e é aí que o trabalho começa.

Reescreva cada um no formato da linha de risco, com os oito campos. Para a probabilidade, procure duas evidências antes de escrever qualquer número: se o serviço está exposto publicamente e se algo parecido aconteceu nos últimos doze meses. Sem as duas, escreva "estimativa sem histórico" no campo e trate isso como dívida que você vai quitar no mês seguinte.

## 8. Autoexplicação

Explique em três frases, sem consultar: a diferença entre vulnerabilidade e risco, o papel da fonte de ameaça, e por que probabilidade sem evidência é pior do que ausência de número. Conecte ao que você já faz: qual decisão recente da sua empresa foi tomada com base em um adjetivo, sem linha de risco?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Vulnerabilidade e risco são a mesma coisa | A definição de vulnerabilidade é fraqueza; risco é função de impacto e probabilidade, e depende de existir fonte de ameaça e consequência | Trate a vulnerabilidade como insumo do risco, não como o risco |
| Só existe risco se houver adversário humano | A definição de fonte de ameaça inclui situações e métodos que disparam vulnerabilidade acidentalmente | Falha de hardware, erro de configuração e evento natural são fontes de ameaça |
| Risco se mede em reais com precisão | Estimativa sem histórico produz número sem significado, e a precisão aparente contamina a decisão | Use poucos degraus, defina cada um com uma frase, e declare quando falta evidência |
| Depois do controle aplicado o risco desaparece | Risco residual permanece e precisa constar no registro, com quem o aceitou | Registre o risco residual e o responsável pela aceitação |
| O responsável pela linha é quem executa o controle | Quem executa não decide sobre orçamento nem responde por aceitar | Nomeie quem responde pela escolha entre tratar, transferir e aceitar |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Escreva as três definições em uma frase cada: risco, vulnerabilidade e fonte de ameaça.
2. Um cadeado quebrado na sala de servidores é qual dos três termos? O que falta para virar risco?
3. Quais são os dois insumos legítimos de uma estimativa de probabilidade?
4. Cite duas respostas possíveis a um risco, além de tratá-lo.
5. O que muda no relatório ao comitê quando aceitar risco é ato da administração?

<details>
<summary>Conferir respostas</summary>

1. Risco: medida em que uma entidade é ameaçada por uma circunstância ou evento potencial, tipicamente função do impacto adverso e da probabilidade de ocorrência. Vulnerabilidade: fraqueza em sistema, procedimentos, controles internos ou implementação, que poderia ser explorada ou disparada por uma fonte de ameaça. Fonte de ameaça: intenção e método de exploração intencional de uma vulnerabilidade, ou situação e método que podem disparar uma vulnerabilidade acidentalmente.
2. Vulnerabilidade. Falta a fonte de ameaça com método viável e a consequência estimada em impacto e probabilidade.
3. Exposição — o quanto o alvo é alcançável e o quanto o evento é frequente no setor — e histórico interno dos últimos doze meses.
4. Transferir o risco por contrato ou seguro, e aceitar formalmente o risco residual com responsável nomeado.
5. O relatório deixa de ser lista de projetos e passa a ser lista de riscos com impacto, probabilidade, resposta proposta e a assinatura de quem aceita o que sobra.

</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo em [91-trilhas/](../91-trilhas/README.md), dono de `proxima_revisao`.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Reescrever as três definições de memória | Rebaixar: repetir em D+1 |
| D+7 | Transformar um achado novo em linha de risco completa | Rebaixar: repetir em D+3 |
| D+30 | Levar três linhas ao dono do processo e registrar a discordância | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 00-guia-basico#TEMA-05 | as três primeiras linhas de registro de risco são o artefato do primeiro marco da agenda dos 90 dias |
| complementa | 00-guia-basico#TEMA-04 | o vocabulário de risco só vira decisão quando existe um mandato que autorize aceitar risco, e o mandato é o assunto do TEMA-04 |
| complementa | 02-governanca-risco-compliance#TEMA-03 | risco estimado em unidade comparável só decide algo quando há critério de aceite declarado, e o apetite de risco pertence à área 02 |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Cobertura geral do tema | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |

Leitura direta: [NIST CSRC Glossary, verbetes risk, vulnerability e threat source](https://csrc.nist.gov/glossary).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSRC Glossary — risk, conforme NIST SP 800-30 Rev. 1 e OMB Circular A-130 | primaria | https://csrc.nist.gov/glossary/term/risk | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — vulnerability, conforme FIPS 200 e NIST SP 800-30 Rev. 1 | primaria | https://csrc.nist.gov/glossary/term/vulnerability | "2026-09-25" | alta |
| 3 | NIST CSRC Glossary — threat source, conforme FIPS 200 e NIST SP 800-30 Rev. 1 | primaria | https://csrc.nist.gov/glossary/term/threat_source | "2026-09-25" | alta |
| 4 | Comissão Europeia — NIS2, Diretiva 2022/2555: 18 setores, medidas de gestão de risco, notificação de incidentes significativos, responsabilidade da alta administração, prazo de transposição em 17/10/2024 | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [00 Guia básico do CISO](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-triade-cia.md) |
| Próximo tema | [TEMA-04](TEMA-04-mandato-do-ciso.md) |
| Home | [README](../README.md) |
