---
tema: "Governança de IA e ISO/IEC 42001"
tema_id: "TEMA-04"
area_id: "16-ia-seguranca"
nivel: avancado
tempo_estimado: "40-45 min"
objetivo_aprendizagem: "Escrever o escopo de um sistema de gestão de IA conforme a ISO/IEC 42001:2023, com as exclusões justificadas e o calendário de evidência que a operação precisa produzir por trimestre"
atende_objetivo: [4, 1]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-04"
      motivo: "o sistema de gestão de IA usa a mesma mecânica de escopo, evidência e auditoria do ISMS; o alvo é a versão já rodada em segurança da informação"
  nao_confundir_com: []
fontes:
  - titulo: "ISO/IEC 42001:2023 — Information technology — Artificial intelligence — Management system"
    url: "https://www.iso.org/standard/42001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 23894:2023 — Guidance on risk management de IA"
    url: "https://www.iso.org/standard/77304.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — AI Act, Regulation (EU) 2024/1689"
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Governança de IA e ISO/IEC 42001

A ISO/IEC 42001:2023 é a edição 1, publicada em 18 de dezembro de 2023, com 51 páginas, número de referência 81230, sob o comitê técnico ISO/IEC JTC 1/SC 42, e a ISO a descreve como o primeiro padrão de sistema de gestão de inteligência artificial ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). O padrão usa a lógica Plan-Do-Check-Act, e a ISO responde que sim à pergunta sobre se ele se aplica a todo tipo de sistema de IA. Um CISO que já rodou a ISO/IEC 27001 reconhece a mecânica; o que muda é o objeto, e o objeto aqui inclui o uso de IA por quem apenas contrata o serviço.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: escrever o escopo de um sistema de gestão de IA conforme a ISO/IEC 42001:2023, com as exclusões justificadas e o calendário de evidência que a operação precisa produzir por trimestre.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-riscos-de-ia.md), porque o escopo do sistema de gestão é escrito a partir do inventário de sistemas de IA e do papel da organização na cadeia. O funcionamento de um sistema de gestão, com política, escopo, avaliação de risco, evidência e análise crítica, tem tratamento completo em [02-governanca-risco-compliance](../02-governanca-risco-compliance/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Uma empresa que só consome API de modelo precisa de sistema de gestão de IA? Aposte sim ou não.
   Confiança: ___
2. Tratar IA dentro do sistema de gestão de segurança existente, sem documento novo, passa em auditoria interna? Aposte sim, não ou depende.
   Confiança: ___
3. O regulamento europeu de IA muda a conversa de governança de uma empresa no Brasil? Aposte sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Uma empresa com certificação ISO/IEC 27001 auditada havia dois anos decidiu que "IA seria tratada dentro do ISMS existente". A decisão foi registrada em ata e não gerou documento novo.

Na auditoria interna seguinte, o auditor pediu a lista de sistemas de IA em uso e a avaliação de impacto de cada um. Não existia lista. Pediu o critério de aprovação de ferramenta de IA: o único documento era uma política de uso aceitável de TI, escrita em 2019, que falava de instalação de software. Pediu o tratamento dado ao risco de informação inserida em prompt de fornecedor: o contrato com o provedor de modelo não tinha cláusula de retenção.

O ISMS cobria o risco de segurança da informação e cobria bem. O que ele não cobria era o objeto novo. A pergunta que o caso deixa aberta: o que exatamente um sistema de gestão de IA precisa ter que um ISMS bem feito não obriga a ter?

## 5. Conteúdo

### 5.1 Conceito

A ISO define sistema de gestão de IA como um conjunto de elementos interrelacionados de uma organização que estabelece políticas, objetivos e processos para o desenvolvimento, o fornecimento ou o uso responsável de sistemas de IA, e afirma que o padrão especifica requisitos e orienta o estabelecimento, a implementação, a manutenção e a melhoria contínua desse sistema no contexto da organização ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). É a mesma definição estrutural de qualquer management system standard, com o objeto trocado.

A diferença de objeto tem consequência prática. Um ISMS parte de ativos de informação e de risco de confidencialidade, integridade e disponibilidade. Um sistema de gestão de IA parte de sistemas de IA e acrescenta riscos que não são de segurança da informação: decisão sem revisão humana, viés em dado de treino, uso fora da finalidade declarada, ausência de rastreabilidade da resposta. Esses riscos podem não ter impacto de CIA nenhum e ainda assim parar um contrato ou gerar sanção regulatória.

A ISO posiciona o padrão em uma família. Na mesma página, a ISO lista a ISO/IEC 22989, que estabelece terminologia de IA, a ISO/IEC 23053, que estabelece um framework de IA e aprendizado de máquina para descrever um sistema genérico de IA, e a ISO/IEC 23894, que fornece orientação de gestão de risco de IA ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). A ISO/IEC 23894:2023 é edição 1, publicada em 6 de fevereiro de 2023, com 26 páginas, e o resumo oficial descreve orientação para organizações que desenvolvem, produzem, implantam ou usam produtos, sistemas e serviços com IA gerenciarem risco relacionado a IA, integrando a gestão de risco às atividades de IA ([iso.org](https://www.iso.org/standard/77304.html), acessado em 2026-09-25). A ISO também comercializa a ISO/IEC 42005:2025 no pacote de governança de IA responsável, junto da 42001.

A camada regulatória europeia corre em paralelo e com prazos próprios. O AI Act entrou em vigor em 1 de agosto de 2024 e ficou aplicável em 2 de agosto de 2026; as proibições e as obrigações de alfabetização em IA valem desde 2 de fevereiro de 2025; as regras de governança e as obrigações para modelos de uso geral valem desde 2 de agosto de 2025; e, depois do acordo político sobre o pacote de simplificação, as regras de risco alto em áreas sensíveis passaram a valer a partir de 2 de dezembro de 2027, com as regras para sistemas embarcados em produtos a partir de 2 de agosto de 2028 ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). O AI Office e as autoridades dos Estados-membros passaram a supervisionar e aplicar o regulamento em 2 de agosto de 2026, e a Comissão publicou, em julho de 2025, o código de prática para modelos de uso geral e o modelo de resumo público do conteúdo de treino.

### 5.2 Como funciona

Cinco entregas organizam o primeiro ano.

**Escopo.** Uma frase com nome próprio, que declare quais sistemas de IA, quais unidades e quais atividades estão dentro. O escopo precisa deixar claro se a organização é fornecedora, deployer ou as duas coisas, porque isso define a obrigação.

**Inventário e critério de aprovação.** O inventário do [TEMA-01](TEMA-01-riscos-de-ia.md) é a entrada do sistema. O critério de aprovação é o documento que decide se uma nova ferramenta pode ser usada, com regra por classificação de dado, exigência de retenção e exigência de revisão humana, quando aplicável.

**Avaliação de risco e de impacto.** Risco de IA se avalia com o método que já existe, aplicado ao objeto novo. A avaliação de impacto olha o efeito sobre pessoas e direitos, e é o item que um ISMS puro não pede.

**Evidência de operação.** Controle sem registro não existe para auditoria. O calendário mínimo viável: inventário revisado por trimestre, avaliação de impacto por sistema novo, registro de treinamento em IA por pessoa que usa, registro de exceção com prazo, e ata de análise crítica da direção.

**Papéis e alçada.** Quem aprova o quê. Aprovar ferramenta nova, aprovar sistema de IA de risco alto, aprovar exceção. Sem alçada escrita, a decisão sobe para o CISO por padrão, e o CISO passa a ser o gargalo.

Há três lacunas que precisam ser ditas, porque a área é nova. A primeira: a lista de controles do Anexo A da ISO/IEC 42001:2023 e a sua organização não foram confirmadas nesta execução, porque o texto da norma é pago. A segunda: se o padrão é certificável por organismo de terceira parte não foi confirmado aqui; é management system standard, com a mesma mecânica dos demais, e a afirmação sobre certificação fica como `NAO CONFIRMADO`. A terceira: o NIST AI RMF, citado no mercado como base de gestão de risco de IA, não foi acessado nesta execução, e por isso não é usado aqui como fonte.

### 5.3 Exemplo resolvido

Banco de médio porte, com ISMS certificado, três usos de IA em produção e um em piloto.

1. Escreva o escopo em uma frase: "desenvolvimento, contratação e operação de sistemas de IA usados no atendimento, na análise de crédito assistida e na engenharia de software, nas unidades Matriz e Centro de Serviços". Se a frase não cabe em duas linhas, o escopo está largo.
2. Declare o papel. O banco é deployer de dois modelos contratados por API e fornecedor do sistema de análise assistida que ele mesmo integra e revende a uma cooperativa. Os dois papéis convivem.
3. Liste as dependências fora do escopo com decisão registrada.

| Item | Decisão | Justificativa registrada |
|---|---|---|
| Assistente de atendimento | Dentro | Interage com cliente e trata dado pessoal |
| Análise de crédito assistida | Dentro | Efeito sobre titular e revenda a terceiro |
| Assistente de código | Dentro, com escopo reduzido | Não processa dado de cliente; risco de propriedade intelectual |
| Provedor de modelo por API | Fora, com dependência declarada | Serviço compartilhado; exige cláusula de retenção, de notificação e de auditoria |
| Ferramenta de transcrição usada por uma área | Fora no primeiro ciclo | Uso restrito e sem dado de cliente; risco registrado com data de reavaliação |

4. Monte a avaliação de impacto dos três sistemas que estão dentro, um documento por sistema, com finalidade, dado de entrada, efeito sobre pessoas, supervisão humana e forma de reclamação.
5. Escreva o calendário de evidência com dono por linha. Sem dono, a evidência não é produzida.

| Evidência | Frequência | Dono |
|---|---|---|
| Inventário de sistemas de IA | trimestral | segurança da informação |
| Avaliação de impacto de sistema novo | por sistema | dono do sistema |
| Registro de treinamento em IA | anual | RH com segurança |
| Registro de exceção de uso | contínuo, revisão mensal | segurança da informação |
| Análise crítica com a direção | semestral | patrocinador executivo |

6. Ligue o sistema de gestão de IA ao ISMS existente: política única com seção de IA, avaliação de risco no mesmo registro, auditoria interna no mesmo ciclo. O ganho é não manter dois programas de evidência.

### 5.4 Problema de completar

Uma indústria com ISMS certificado quer um sistema de gestão de IA cobrindo a linha de produção e o assistente de manutenção. Complete.

1. Frase de escopo: ______
2. Papel da organização para o modelo preditivo da linha e para o assistente contratado por API: ______
3. Um item deliberadamente fora do escopo, com justificativa e data de reavaliação: ______
4. Uma dependência fora do escopo que exige cláusula contratual, com o nome da cláusula: ______
5. Três linhas do calendário de evidência, com dono: ______

Regra de conferência: escopo que inclui "toda a empresa" no primeiro ano costuma indicar que ninguém escolheu o que fica de fora, e a primeira auditoria encontra exatamente o que não foi preparado.

## 6. Por que isso importa para o CISO

A governança de IA decide quem responde quando o sistema erra, e essa é a única pergunta que o comitê executivo faz com dinheiro envolvido. Com escopo, papéis e calendário de evidência escritos, a resposta deixa de ser o CISO e passa a ser o dono do sistema, com registro. Sem eles, cada caso de uso novo vira uma negociação improvisada, e o padrão que se firma é o do uso mais permissivo que passou.

Há um efeito contratual imediato. Cliente grande e setor público começam a perguntar por governança de IA em questionário de fornecedor, do mesmo modo que passaram a perguntar por ISO/IEC 27001. Ter o escopo escrito e a avaliação de impacto por sistema responde a esse questionário sem projeto novo. E há um efeito de risco: o deployer tem obrigações próprias de supervisão humana e monitoramento no AI Act, e supervisão documentada é evidência que se produz ou não se produz.

## 7. Aplicação prática

Faça as três primeiras entregas em 60 dias, sem consultor.

1. Escreva o escopo em uma frase com nome próprio e liste as exclusões com justificativa. Leve ao patrocinador executivo para assinatura.
2. Redija o critério de aprovação de ferramenta de IA em uma página, com regra por classificação de dado, exigência de retenção e exigência de revisão humana.
3. Monte a avaliação de impacto de um sistema que já está em produção. O exercício revela mais sobre o que falta do que qualquer leitura da norma.
4. Defina o calendário de evidência com dono e frequência, e coloque a primeira data no calendário de quem é dono.
5. Verifique o que o ISMS existente já cobre. O que ele cobre, mantenha no mesmo registro; o que ele não cobre, crie documento novo.
6. Escreva no mesmo documento o que não foi confirmado: a lista de controles do Anexo A e a certificabilidade são itens a conferir no texto adquirido da norma.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma sobre o que o sistema de gestão de IA herda do ISMS, uma sobre o que ele acrescenta de objeto novo, e uma sobre qual entrega destrava auditoria e questionário de cliente.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Declarar em ata que IA fica dentro do ISMS basta" | O ISMS não obriga inventário de IA nem avaliação de impacto sobre pessoas | Escopo, inventário, critério de aprovação e calendário de evidência são entregas próprias |
| "Como só consumimos API, não precisamos de nada disso" | A ISO descreve o padrão para quem fornece ou usa IA, e o AI Act trata o deployer como responsável por supervisão e monitoramento | O papel de deployer tem obrigação própria e exige evidência |
| Copiar o escopo do ISMS | Os objetos são diferentes e as dependências também | Escopo próprio, com nome dos sistemas de IA e papel na cadeia |
| Contratar auditoria antes de rodar um ciclo | Sem um ciclo completo existe evidência de intenção, não de operação | Inventário, avaliação de impacto e análise crítica antes da auditoria |
| Afirmar número de controles do Anexo A | O texto da norma é pago e a lista não foi confirmada nesta execução | Escreva `NAO CONFIRMADO` até conferir no texto adquirido |
| Tratar governança de IA como projeto de ferramenta | Ferramenta ajuda a operar o sistema, e não define escopo, papel e alçada | Escreva primeiro escopo, aprovação e calendário, depois escolha a ferramenta |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a edição, a data de publicação e o número de páginas da ISO/IEC 42001:2023, e a quem ela se aplica segundo a ISO?
2. Qual lógica de gestão o padrão usa, segundo a própria ISO?
3. Quais padrões da família de IA a ISO lista na mesma página e o que cada um faz?
4. Quais são as datas de aplicação relevantes do AI Act registradas pela Comissão Europeia?
5. Quais são as cinco entregas do primeiro ano de um sistema de gestão de IA?

<details>
<summary>Conferir respostas</summary>

1. Edição 1, publicada em 18 de dezembro de 2023, 51 páginas, referência 81230. Aplica-se a organizações de qualquer tamanho envolvidas em desenvolver, fornecer ou usar produtos e serviços baseados em IA, em qualquer setor, incluindo agências públicas, empresas e organizações sem fins lucrativos, e a ISO responde que sim à pergunta sobre aplicação a todo tipo de sistema de IA.
2. A lógica Plan-Do-Check-Act, a mesma dos demais management system standards.
3. ISO/IEC 22989, terminologia e conceitos de IA; ISO/IEC 23053, framework de IA e aprendizado de máquina para descrever um sistema genérico; ISO/IEC 23894, orientação de gestão de risco de IA, edição 1 de 6 de fevereiro de 2023, 26 páginas. A ISO também comercializa a ISO/IEC 42005:2025 no pacote de governança de IA responsável.
4. Em vigor em 1 de agosto de 2024; aplicável em 2 de agosto de 2026; proibições e alfabetização em IA desde 2 de fevereiro de 2025; governança e obrigações de modelos de uso geral desde 2 de agosto de 2025; risco alto em áreas sensíveis a partir de 2 de dezembro de 2027; sistemas embarcados em produtos a partir de 2 de agosto de 2028. A aplicação do regulamento passou ao AI Office e às autoridades nacionais em 2 de agosto de 2026.
5. Escopo com nome próprio e exclusões justificadas; inventário e critério de aprovação; avaliação de risco e de impacto; evidência de operação com dono e frequência; papéis e alçada de decisão.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever a frase de escopo do sistema de gestão de IA da sua empresa | Rebaixar: repetir em D+3 |
| D+30 | Rodar um ciclo de evidência completo e levá-lo à análise crítica | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-04 | o sistema de gestão de IA usa a mesma mecânica de escopo, evidência e auditoria do ISMS; o alvo é a versão já rodada em segurança da informação |

## 13. Certificações e leitura recomendada

Nenhuma certificação de segurança de IA foi confirmada em fonte oficial nesta execução. A leitura de referência é a ISO/IEC 42001:2023, que a ISO descreve como o primeiro padrão de sistema de gestão de IA, e a ISO/IEC 23894:2023 para gestão de risco de IA ([iso.org](https://www.iso.org/standard/42001) e [iso.org](https://www.iso.org/standard/77304.html), acessados em 2026-09-25). O detalhe de credencial, custo e validade pertence a [90-certificacoes/](../90-certificacoes/README.md), e a mecânica de sistema de gestão tem tratamento completo em [02-governanca-risco-compliance](../02-governanca-risco-compliance/README.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | ISO/IEC 42001:2023 — AI management system | primaria | https://www.iso.org/standard/42001 | "2026-09-25" | alta |
| 2 | ISO/IEC 23894:2023 — Guidance on risk management de IA | primaria | https://www.iso.org/standard/77304.html | "2026-09-25" | alta |
| 3 | European Commission — AI Act, Regulation (EU) 2024/1689 | primaria | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | "2026-09-25" | alta |

**NAO CONFIRMADO em fonte oficial nesta execução:** a lista de controles do Anexo A da ISO/IEC 42001:2023 e a sua organização, porque o texto da norma é pago; se a ISO/IEC 42001 é certificável por organismo de terceira parte; o conteúdo da ISO/IEC 42005:2025, citada apenas como item do pacote comercializado pela ISO; o conteúdo da ISO/IEC 22989 e da ISO/IEC 23053, citadas apenas pelo título e pela finalidade registradas na página da ISO; número, versão, data e estrutura do NIST AI RMF e do seu perfil para IA generativa, cujo acesso falhou por erro 504; qualquer estatística de certificação ou adoção da ISO/IEC 42001.

---

| Navegação | |
|---|---|
| Área | [16 Segurança em IA e LLM](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-dados-em-pipelines-de-ia.md) |
| Próximo tema | [TEMA-05](TEMA-05-ia-como-ferramenta-de-defesa.md) |
| Home | [README](../README.md) |
