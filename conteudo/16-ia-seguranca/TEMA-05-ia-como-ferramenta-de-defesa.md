---
tema: "IA como ferramenta de defesa"
tema_id: "TEMA-05"
area_id: "16-ia-seguranca"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Avaliar uma ferramenta de segurança que usa IA com seis perguntas de due diligence, um desenho de piloto com métrica declarada e um critério de aceitação registrado antes da compra"
atende_objetivo: [6]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-03"
      motivo: "a detecção define o caso de uso e a telemetria que o modelo vai consumir na triagem; sem regra que gere alerta não existe dado para o modelo"
  nao_confundir_com:
    - alvo: "09-aplicacoes-devsecops#TEMA-04"
      motivo: "regra determinística no pipeline e modelo probabilístico na triagem produzem vereditos de natureza diferente e não se substituem; destino planejado"
fontes:
  - titulo: "OWASP Top 10 for LLM Applications 2025 — LLM01, LLM06 e LLM10"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — Plano de acao da UE sobre ciberseguranca e inteligencia artificial"
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA — Artificial Intelligence Cybersecurity Challenges"
    url: "https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "MITRE ATLAS"
    url: "https://atlas.mitre.org/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# IA como ferramenta de defesa

A Comissão Europeia registra que o plano de ação de julho de 2026 sobre cibersegurança e inteligência artificial prevê que a Comissão e a ENISA criem um blueprint para assegurar o acesso a sistemas avançados de IA para fins de cibersegurança e estabeleçam uma plataforma de teste para organizações de setores críticos, além de uma chamada para ampliar a capacidade europeia de avaliar modelos de IA antes de sua colocação no mercado, com operação esperada até 2027 ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). O Estado já trata avaliação de modelo como infraestrutura de defesa. A empresa não tem esse aparato, tem fornecedor com proposta comercial, e é aí que a decisão fica difícil: quase todo produto de segurança passou a se apresentar como "com IA", e o critério de compra continua sendo o de sempre — o que a ferramenta muda no tempo do analista e na taxa de erro.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: avaliar uma ferramenta de segurança que usa IA com seis perguntas de due diligence, um desenho de piloto com métrica declarada e um critério de aceitação registrado antes da compra.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-riscos-de-ia.md), porque a ferramenta de defesa que usa IA é, ela mesma, um sistema de IA que precisa entrar no inventário e no critério de aprovação.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Se o resumo do alerta vem de um modelo, quem responde pelo erro de triagem: o fornecedor, o analista ou o CISO? Aposte antes de ler.
   Confiança: ___
2. Que dado do seu ambiente sai para o modelo do fornecedor, e com qual retenção? Responda de palpite, antes de pedir o contrato.
   Confiança: ___
3. Um piloto de triagem assistida por IA precisa medir o tempo do analista por alerta? Aposte sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Uma equipe de SOC de sete analistas avaliou três produtos que anunciavam triagem de alertas por IA. A demonstração de cada fornecedor foi feita com dados do próprio fornecedor, e todos os três "acertaram".

A empresa pediu então uma prova diferente: 500 alertas históricos com desfecho conhecido, rotulados pelo próprio time, rodados às cegas nos três produtos. O resultado separou os candidatos. Um produto reproduziu bem os alertas repetitivos de regra e errou nos casos que exigiam correlação entre fontes; outro acertou a classificação e devolveu resumo que omitia a evidência que o analista precisava para escalar; o terceiro não conseguiu processar metade da telemetria no formato da empresa.

A compra foi feita, mas com escopo restrito a uma família de alertas e com o produto em posição de assistente, não de decisor. A pergunta que o caso deixa aberta: quais perguntas separam fornecedor de ferramenta útil antes de assinar contrato?

## 5. Conteúdo

### 5.1 Conceito

IA na defesa aparece em seis usos que já estão em produção no mercado. Triagem e priorização de alerta, com classificação e resumo. Enriquecimento de contexto, juntando alerta, ativo, identidade e histórico. Busca em linguagem natural sobre telemetria. Geração e manutenção de regra de detecção. Apoio à análise de código e à revisão de configuração. E automação de resposta, com playbook que decide e executa.

Cada uso tem valor e tem custo. O ganho típico está no tempo gasto em alerta repetitivo, que consome a maior parte da jornada do analista. O custo está em três lugares: no dado que sai do ambiente para o modelo, na taxa de erro que o time não mede e na perda de capacidade de investigação quando ninguém mais lê o alerta original.

A ferramenta de defesa é também superfície de ataque. O OWASP Top 10 for LLM Applications 2025 lista LLM01 prompt injection, o risco em que o prompt do usuário altera o comportamento do modelo, e LLM06 agência excessiva, sobre o grau de agência concedido a um sistema baseado em LLM ([genai.owasp.org](https://genai.owasp.org/llm-top-10/), acessado em 2026-09-25). Em um SOC, o material que o modelo lê é escrito em parte pelo atacante: nome de arquivo, linha de comando, campo de log, mensagem de erro, assunto de e-mail. Um agente de triagem que lê telemetria não confiável e tem permissão de fechar alerta é o mesmo problema do assistente com ferramenta, com a diferença de que aqui o atacante escolhe o texto.

Do lado do atacante, o MITRE ATLAS se descreve como base de conhecimento de táticas e técnicas adversariais envolvendo IA, incluindo ataques contra sistemas com IA, abuso ou manipulação de capacidades de IA e comportamento autônomo danoso viabilizado por IA ([atlas.mitre.org](https://atlas.mitre.org/), confirmado pelo índice de busca do domínio em 2026-09-25). A ENISA mantém um relatório que mapeia o ecossistema de cibersegurança de IA e o seu threat landscape, com apoio de grupo de trabalho dedicado ao tema ([enisa.europa.eu](https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges), confirmado pelo índice de busca do domínio em 2026-09-25).

### 5.2 Como funciona

A avaliação tem três etapas: perguntas de due diligence, piloto com métrica e critério de aceitação escrito antes do resultado.

As seis perguntas, com o que conta como resposta aceitável.

| # | Pergunta | Resposta que sustenta compra |
|---|---|---|
| 1 | Com que dado o modelo foi treinado e ajustado, e qual a cobertura em relação à nossa telemetria | descrição do conjunto, formato suportado e limitação declarada |
| 2 | Qual é a taxa de falso positivo e de falso negativo medida, e em que base de teste | número com tamanho de amostra e processo de rotulagem |
| 3 | O que sai do nosso ambiente, em que formato, com qual retenção e com qual base contratual | configuração de retenção, região de processamento e cláusula de uso do dado |
| 4 | Onde o analista humano entra, e o que a ferramenta decide sozinha | lista de ações automáticas e ações que exigem aprovação |
| 5 | Como o modelo resiste a conteúdo de telemetria escrito por atacante | teste com amostra adversa e comportamento esperado declarado |
| 6 | Como sai do fornecedor, e quem fica com o modelo ajustado com os nossos dados | cláusula de saída, exportação de configuração e destino do ajuste fino |

O piloto tem desenho fixo. Escolha uma família de alerta com volume relevante e desfecho conhecido. Rotule uma amostra com o próprio time, sem o fornecedor. Rode às cegas. Meça quatro números: precisão, cobertura sobre a amostra, tempo do analista por alerta com e sem a ferramenta, e quantidade de evidência que o analista precisou buscar fora do resumo. Sem os quatro, a decisão fica apoiada em impressão.

O critério de aceitação se escreve antes. Exemplo: adota se a precisão na família escolhida não for inferior à do time em mais de 5 pontos percentuais, se o tempo por alerta cair ao menos 20% e se o produto não exigir enviar conteúdo de log com dado pessoal para fora da região contratada. Escrever depois do resultado transforma o critério em justificativa.

### 5.3 Exemplo resolvido

Fornecedor propõe triagem de alerta de phishing reportado por usuário, com resumo automático e classificação em malicioso, suspeito ou legítimo.

1. Fixe o volume e o desfecho. A família escolhida tem 1.200 alertas no trimestre, dos quais 180 foram confirmados como maliciosos pelo time. Esse é o número base.
2. Rotule 300 alertas com o time, preservando a proporção entre malicioso, suspeito e legítimo.
3. Rode os 300 às cegas. O fornecedor não vê o rótulo; o time não vê a previsão até o fim.
4. Monte a matriz de confusão e calcule precisão e cobertura por classe, sem média única. Média esconde o erro que importa.
5. Meça o tempo. Cronometre 30 alertas com a ferramenta e 30 sem, com o mesmo analista e a mesma família.
6. Verifique a evidência. Para cada alerta, registre se o resumo trazia anexo, cabeçalho completo e veredito de reputação. Resumo que esconde evidência empurra trabalho para o analista.
7. Verifique o dado que sai. Peça o log de egresso do período do piloto e confirme se algum campo com dado pessoal foi enviado, e para qual região.
8. Decida contra o critério escrito. No exemplo, o critério foi cumprido em precisão e tempo, e falhou em evidência. A compra ficou condicionada a um campo de resumo adicional, com prazo.
9. Registre no inventário de sistemas de IA, com dono, dado de entrada, retenção e situação de aprovação, como manda o [TEMA-01](TEMA-01-riscos-de-ia.md).

### 5.4 Problema de completar

Um fornecedor propõe busca em linguagem natural sobre a telemetria do SOC, com o modelo hospedado no ambiente dele. Complete a avaliação.

1. A família de consulta que você vai usar no piloto: ______
2. A métrica que decide a adoção, com o número mínimo: ______
3. O dado que sai do ambiente e o campo que você vai proibir: ______
4. A ação que a ferramenta não pode executar sozinha: ______
5. O critério de saída do fornecedor, em uma frase: ______

Regra de conferência: se o item 3 ficou "nenhum dado sai", confirme se a telemetria contém identidade de usuário, endereço de e-mail, URL acessada ou conteúdo de mensagem. Quando um desses campos existe, algum dado sensível sai, ainda que cifrado em trânsito.

## 6. Por que isso importa para o CISO

A IA na defesa muda o custo por alerta, e o custo por alerta é a variável que decide se o time escala sem contratar. É a única área de IA em que o investimento aparece direto no orçamento de operações, e por isso ela entra cedo no plano.

O risco é comprar opacidade. Ferramenta que classifica sem que o time consiga reproduzir o critério transfere a responsabilidade pelo erro para o CISO, e a primeira falha relevante mostra que ninguém sabia o que o modelo fazia. As três proteções que ficam na decisão do CISO: o analista humano no circuito para ação irreversível, o critério de medição escrito antes da compra e a cláusula de saída com exportação de configuração. A isso soma-se uma obrigação que já existe: o dado de telemetria enviado a um fornecedor de modelo passa pelas mesmas regras de retenção e de base legal que qualquer outro tratamento, e isso pertence ao programa de privacidade.

## 7. Aplicação prática

Escolha uma proposta de ferramenta com IA que esteja na sua mesa e faça a avaliação em 30 dias.

1. Escreva as seis perguntas em um documento e envie ao fornecedor por escrito, pedindo resposta objetiva. Silêncio em uma pergunta é resposta.
2. Escolha a família de alerta com maior volume e pior tempo médio de tratamento.
3. Rotule 300 alertas históricos com o time e guarde o rótulo fora do alcance do fornecedor.
4. Rode o piloto às cegas e calcule precisão, cobertura, tempo e completude de evidência.
5. Peça o log de egresso do período e verifique região e campos enviados.
6. Escreva o critério de aceitação e decida contra ele, registrando a decisão com data e dono.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma sobre o ganho real de um modelo na triagem, uma sobre por que a ferramenta de defesa é também alvo, e uma sobre o que o critério escrito antes do piloto muda na decisão.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "A demonstração do fornecedor acertou, então funciona" | A demonstração usa dado escolhido pelo fornecedor | Piloto às cegas com amostra rotulada pelo próprio time |
| "O modelo reduz falso positivo" | Sem número, base de teste e tamanho de amostra, é afirmação comercial | Peça precisão e cobertura medidas, com o processo de rotulagem descrito |
| "A ferramenta só lê, não executa nada" | Ler telemetria escrita pelo atacante e resumir já altera a decisão do analista | Trate a telemetria como entrada não confiável e limite a agência da ferramenta |
| "O analista confere tudo depois" | Sob volume, o resumo passa a ser a fonte de decisão na prática | Meça se a evidência completa está no resumo e exija o original a um clique |
| "Dado agregado não é dado pessoal" | Telemetria de rede e de endpoint carrega identidade, URL e conteúdo | Aplique retenção, região e base contratual como em qualquer tratamento |
| Medir adoção pelo tempo economizado só | Tempo cai também quando o analista investiga menos | Meça precisão e cobertura junto do tempo |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite quatro usos de IA na defesa e o risco principal de cada um.
2. Quais são as seis perguntas de due diligence, e o que conta como resposta aceitável em cada uma?
3. Quais quatro números o piloto precisa produzir?
4. Por que a ferramenta de defesa que usa IA é uma superfície de ataque?
5. O que o CISO precisa manter sob controle próprio ao adotar triagem assistida por modelo?

<details>
<summary>Conferir respostas</summary>

1. Entre os usos: triagem e priorização de alerta, com risco de erro de classificação não medido; enriquecimento de contexto, com risco de dado incorreto que induz decisão; busca em linguagem natural sobre telemetria, com risco de exposição de dado ao fornecedor; geração de regra de detecção, com risco de regra que ninguém revisa; apoio a análise de código, com risco de achar problema que não existe e perder tempo; e automação de resposta, com risco de ação irreversível executada pelo modelo.
2. Com que dado o modelo foi treinado; taxa de falso positivo e falso negativo com base de teste; o que sai do ambiente e com qual retenção; onde o analista humano entra; como resiste a conteúdo escrito por atacante; e como sai do fornecedor. Resposta aceitável é a que traz número, limitação declarada e compromisso contratual, e não a que promete resultado.
3. Precisão, cobertura, tempo do analista por alerta com e sem a ferramenta, e completude de evidência no resultado apresentado.
4. Porque o material que o modelo processa é escrito em parte pelo atacante — nome de arquivo, linha de comando, assunto de e-mail, mensagem de erro —, e o OWASP registra prompt injection e agência excessiva como riscos de aplicação com LLM.
5. O analista humano no circuito para ação irreversível, o critério de medição escrito antes da compra e a cláusula de saída com exportação de configuração e dados.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Rodar o piloto às cegas em uma família de alerta | Rebaixar: repetir em D+3 |
| D+30 | Comparar a medição do piloto com a medição em produção | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 10-operacoes-soc#TEMA-03 | a detecção define o caso de uso e a telemetria que o modelo vai consumir na triagem; sem regra que gere alerta não existe dado para o modelo |
| nao_confundir_com | 09-aplicacoes-devsecops#TEMA-04 | regra determinística no pipeline e modelo probabilístico na triagem produzem vereditos de natureza diferente e não se substituem; destino planejado |

## 13. Certificações e leitura recomendada

Nenhuma certificação de segurança de IA foi confirmada em fonte oficial nesta execução. Os recursos de referência são a página de riscos do OWASP Top 10 for LLM Applications 2025, para os riscos LLM01 e LLM06 aplicados à ferramenta de defesa, o MITRE ATLAS, para o comportamento adversário contra sistemas de IA, e o relatório da ENISA, que mapeia o ecossistema e o threat landscape de IA ([genai.owasp.org](https://genai.owasp.org/llm-top-10/), [atlas.mitre.org](https://atlas.mitre.org/) e [enisa.europa.eu](https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges), acessados em 2026-09-25). O detalhe de credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | OWASP Top 10 for LLM Applications 2025 | primaria | https://genai.owasp.org/llm-top-10/ | "2026-09-25" | alta |
| 2 | European Commission — plano de ação sobre cibersegurança e IA | primaria | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | "2026-09-25" | alta |
| 3 | ENISA — Artificial Intelligence Cybersecurity Challenges | primaria | https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges | "2026-09-25" | media |
| 4 | MITRE ATLAS | primaria | https://atlas.mitre.org/ | "2026-09-25" | media |

**NAO CONFIRMADO em fonte oficial nesta execução:** norma ou método consolidado para validar ferramenta de segurança que usa IA — nenhum documento normativo foi localizado; os guias conjuntos de agências de governo sobre implantação segura de IA, citados no mercado, não foram abertos nesta execução; data de publicação do relatório da ENISA; contagem de táticas e técnicas do MITRE ATLAS; número, versão e estrutura do NIST AI RMF e do seu perfil para IA generativa, cujo acesso falhou por erro 504; qualquer estatística de redução de falso positivo ou de tempo de triagem obtida com IA, por falta de fonte primária localizada.

---

| Navegação | |
|---|---|
| Área | [16 Segurança em IA e LLM](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-governanca-ia-iso-42001.md) |
| Próximo tema | [TEMA-06](TEMA-06-shadow-ai-uso-nao-governado.md) |
| Home | [README](../README.md) |
