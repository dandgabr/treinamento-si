---
tema: "Segurança de dados em pipelines de IA"
tema_id: "TEMA-03"
area_id: "16-ia-seguranca"
nivel: avancado
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Especificar os controles de dado de um pipeline de IA — origem, classificação, retenção, segregação e resposta à eliminação — justificando cada controle por escrito e indicando o risco correspondente"
atende_objetivo: [5, 3]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "08-cloud#TEMA-05"
      motivo: "conjunto de treino e índice vetorial vivem em armazenamento gerenciado; o outro lado é chave, segregação e ciclo de vida na nuvem; destino planejado"
  aprofundado_por: []
  aplicado_em:
    - alvo: "14-dados-privacidade#TEMA-02"
      motivo: "classificação e inventário definem o que pode entrar em conjunto de treino e em base de conhecimento"
  nao_confundir_com: []
fontes:
  - titulo: "OWASP Top 10 for LLM Applications 2025 — LLM02, LLM03, LLM04 e LLM08"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — AI Act, Regulation (EU) 2024/1689 — resumo publico do conteudo de treino de modelos de uso geral"
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 42001:2023 — AI management system"
    url: "https://www.iso.org/standard/42001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 23894:2023 — Guidance on risk management de IA"
    url: "https://www.iso.org/standard/77304.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Segurança de dados em pipelines de IA

O OWASP Top 10 for LLM Applications 2025 dedica quatro dos dez riscos ao dado: LLM02 divulgação de informação sensível, LLM03 cadeia de suprimentos, LLM04 envenenamento de dado e de modelo e LLM08 fragilidades de vetor e embedding ([genai.owasp.org](https://genai.owasp.org/llm-top-10/), acessado em 2026-09-25). Quatro de dez é proporção alta, e ela tem uma razão simples: em um sistema de IA, o dado é componente executável. O que entra no conjunto de treino, na base de conhecimento ou no índice vetorial muda o que o sistema responde depois. Tratar esse dado como "arquivo de entrada" é o erro que antecede quase todos os incidentes de confidencialidade com IA.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: especificar os controles de dado de um pipeline de IA — origem, classificação, retenção, segregação e resposta à eliminação — justificando cada controle por escrito e indicando o risco correspondente.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-riscos-de-ia.md), porque o inventário define quais pipelines existem. O ciclo de vida e a classificação do dado têm dono em [14-dados-privacidade](../14-dados-privacidade/README.md), e este tema aplica aquele vocabulário ao pipeline de IA em vez de recriá-lo.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Um documento removido da pasta de origem sai da base de conhecimento do assistente? Aposte sim, não ou não sei.
   Confiança: ___
2. Quantos dias você acha que os prompts enviados ao fornecedor do modelo ficam retidos? Chute um número.
   Confiança: ___
3. O documento restrito à diretoria estava na mesma árvore de diretórios das políticas gerais. Você aposta que o filtro de permissão é aplicado na recuperação? Sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Uma empresa indexou a pasta de políticas de RH em um assistente interno. A pasta continha a política de remuneração, com faixas salariais por cargo, acessível apenas à diretoria, e estava na mesma árvore de diretórios das políticas gerais.

Um analista júnior perguntou ao assistente qual era a faixa salarial do cargo dele. O assistente respondeu com a faixa correta, extraída do documento restrito. A busca funcionou como projetada; o controle de acesso ao arquivo não foi aplicado na recuperação, porque o índice continha o texto do documento e o filtro de permissão existia só na interface de arquivos.

A pergunta que o caso deixa aberta: em que ponto do pipeline a permissão do documento precisa ser verificada para que a resposta respeite a mesma regra do arquivo original? A resposta está em levar o controle para a consulta, e não para a interface.

## 5. Conteúdo

### 5.1 Conceito

O pipeline de IA tem cinco estágios de dado, e cada um gera risco próprio. A origem, onde o dado entra. A preparação, onde ele é limpo, recortado, convertido e, no caso de busca semântica, transformado em embedding. O armazenamento, onde vivem conjunto de treino, índice vetorial, cache de resposta e histórico de conversa. O uso, onde o dado vira contexto de prompt e depois resposta. A saída, que circula para outros sistemas, é registrada em log e, muitas vezes, fica retida no fornecedor por prazo definido em contrato.

Envenenamento de dado é o risco que nasce do primeiro estágio. O OWASP descreve LLM04 como o risco em que dado de pré-treino, de ajuste fino ou de embedding é manipulado. Em um sistema que consome API de modelo de terceiro, os pesos não estão ao alcance da empresa, mas os dois últimos continuam: o dado de ajuste fino, quando existe, e o embedding da base de conhecimento, que existe em praticamente todo assistente com busca.

Divulgação de informação sensível é o risco do estágio de uso. O OWASP descreve LLM02 como o risco em que informação sensível pode afetar tanto o modelo quanto a sua aplicação. A frase é curta e cobre três vias: o dado que estava no treino e o modelo devolve, o dado que entra no contexto na hora da consulta e o dado que sai em log, em cache ou em telemetria de fornecedor.

Fragilidades de vetor e embedding é o risco que a maioria dos times descobre por último. O OWASP descreve LLM08 como o risco presente em sistemas que dependem de vetor e embedding. A consequência prática é que o índice é uma cópia do dado em outro formato, com outro controle de acesso, e frequentemente com menos controle do que o original. A cadeia de suprimentos aparece no LLM03: o dado que a empresa recebe de terceiro, o modelo pré-treinado, o plugin e a biblioteca entram no sistema com um nível de verificação que quase nunca é o mesmo aplicado a código próprio.

### 5.2 Como funciona

Seis controles fecham a maior parte dos casos, e todos cabem em política escrita.

**Procedência.** Todo dado que entra no pipeline carrega registro de origem, dono e base legal ou autorização de uso. Sem procedência, não existe resposta para "de onde veio isto" em uma auditoria ou em um pedido de titular.

**Classificação antes da ingestão.** A regra que evita o caso de RH é simples: se o dado tem classificação restrita, ele não entra em índice compartilhado, ou entra com marcação que a consulta vai respeitar. A decisão de classificar precisa acontecer antes do primeiro carregamento, porque retrofitar classificação em índice vetorial exige reconstrução.

**Controle de acesso na recuperação.** Verificar permissão no momento da consulta, com a identidade de quem pergunta, e não apenas na interface de arquivos. É o controle que separa "busca que funciona" de "busca que respeita a regra".

**Retenção declarada em todas as pontas.** Prompt enviado ao fornecedor, log de conversa, cache de resposta e cópia em ferramenta analítica. Cada ponta tem prazo, e prazo não declarado é prazo indefinido.

**Segregação por conjunto de dados.** Índice de um cliente não alimenta resposta de outro; índice de um departamento não alimenta busca de outro. Em ambiente compartilhado, isso se resolve com namespace e filtro obrigatório, não com disciplina de uso.

**Resposta à eliminação.** Quando o dado é eliminado na origem, a eliminação precisa alcançar a cópia do índice e o registro de histórico. A decisão sobre quando reconstruir o índice é uma decisão de arquitetura com prazo, e não um efeito automático.

Vale uma nota sobre a camada regulatória, do lado do fornecedor. A Comissão Europeia registra que o AI Act exige de fornecedores de modelos de uso geral um resumo público do conteúdo usado no treino, com visão geral das fontes do dado, incluindo grandes conjuntos de dados e os principais nomes de domínio, e informações sobre aspectos de tratamento de dado ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). A obrigação é do fornecedor, e serve à empresa que contrata como pergunta de due diligence: o que o seu fornecedor declara sobre o dado com que treinou o modelo que você usa.

### 5.3 Exemplo resolvido

Empresa de saúde com um assistente interno sobre políticas, procedimentos e protocolos clínicos.

Passo a passo para levar a pasta inteira para o índice.

1. Inventarie a origem. Liste repositórios, pastas compartilhadas, bases de dados e sistemas que serão fonte. Nomeie o dono de cada um.
2. Aplique a classificação existente ao dado antes da ingestão. O que estiver marcado como restrito ou confidencial não entra em índice de acesso amplo.
3. Defina a granularidade da marcação. Marcação por documento é o mínimo; em documento com seções de sensibilidade diferente, o recorte por seção evita excluir a política inteira por causa de um anexo.
4. Escreva a regra de recuperação em função da identidade. Ao montar a resposta, o sistema consulta apenas os trechos cuja marcação a identidade do solicitante alcança.
5. Trate o texto recuperado como dado não confiável, como no [TEMA-02](TEMA-02-prompt-injection.md). Procedimento clínico com frase de instrução embutida é comportamento alterado.
6. Defina retenção por ponta e registre no contrato. Prompt enviado ao fornecedor, log de conversa e cache têm prazos distintos.
7. Defina o processo de eliminação. Remover o documento da origem dispara reconstrução de índice em prazo declarado, com registro de quem executou.
8. Registre no sistema de gestão. Cada decisão do passo 2 e do passo 4 vira evidência para o AIMS do [TEMA-04](TEMA-04-governanca-ia-iso-42001.md).

| Estágio | Risco do OWASP | Controle | Evidência produzida |
|---|---|---|---|
| Origem | LLM03 cadeia de suprimentos | procedência e autorização de uso por fonte | registro de origem por conjunto de dados |
| Preparação | LLM04 envenenamento | revisão do que entra por fonte externa e versionamento da base | histórico de versão do índice |
| Armazenamento | LLM08 vetor e embedding | segregação por namespace e filtro obrigatório na consulta | configuração de filtro e teste de acesso |
| Uso | LLM02 informação sensível | marcação por trecho e verificação na recuperação | log de consulta com identidade |
| Saída | LLM02 e LLM05 | validação antes de enviar a outro sistema e retenção declarada | configuração de retenção e registro de fornecedor |

### 5.4 Problema de completar

Um banco quer um assistente que responda a gerentes de conta sobre contratos de clientes, a partir do repositório de contratos digitalizados. Complete o desenho.

1. Qual é o dado restrito que o inventário provavelmente vai encontrar: ______
2. Onde a verificação de permissão precisa acontecer: ______
3. Qual é o risco do OWASP que o item 2 endereça: ______
4. O que acontece com o índice quando um contrato é encerrado e eliminado: ______
5. Qual comprovação você pede ao fornecedor do modelo sobre o dado de treino: ______

Regra de conferência: se o item 1 ficou sem resposta, procure dado pessoal de titular que não é cliente do banco — fiador, avalista, dependente, beneficiário. É o que costuma não estar no contrato e estar no anexo.

## 6. Por que isso importa para o CISO

O dado é o ativo que a empresa já classificou e já protege, e o pipeline de IA cria uma segunda cópia dele com outro comportamento. O custo de não tratar isso aparece na forma de achado de auditoria e de notificação de incidente, não como vazamento espetacular. Um índice vetorial sem filtro de permissão é indistinguível, para o titular, de um arquivo exposto.

Três decisões ficam na mesa do CISO. Quanto de reconstrução de índice a empresa aceita por ano, porque reconstruir tem custo de nuvem e de janela de indisponibilidade. Qual é o prazo máximo de retenção que o negócio aceita contratar com fornecedor, porque retenção zero às vezes não está na oferta comercial. E quem assina a liberação de uma nova fonte de dado para o pipeline, porque essa decisão define o que o assistente vai saber responder a partir do mês seguinte.

## 7. Aplicação prática

Escolha um pipeline de IA existente e faça a revisão em duas semanas.

1. Monte a lista de fontes de dado do pipeline, com dono por fonte.
2. Para cada fonte, escreva a classificação mais alta que ela contém. Se a classificação não existir, esse é o primeiro problema a resolver.
3. Faça o teste do acesso cruzado: peça a duas pessoas com perfis diferentes que façam a mesma pergunta sobre um documento restrito e compare as respostas.
4. Peça ao fornecedor do modelo, por escrito, os prazos de retenção de prompt e o uso do conteúdo para treino próprio.
5. Escolha um documento, elimine na origem e verifique, em 30 dias, se ele ainda aparece na resposta. Registre o resultado com data.
6. Leve os três achados para o registro de risco e proponha dono e prazo para cada um.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma sobre por que o dado é componente executável e não apenas entrada, uma sobre qual risco cada estágio do pipeline produz, e uma sobre o controle que impede a busca de devolver o que a interface nega.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "O controle de acesso da pasta é suficiente" | O índice é uma cópia do texto em outro armazenamento, consultada por outro caminho | Verifique permissão na recuperação, com a identidade do solicitante |
| "Removi da origem, então saiu do assistente" | Índice, cache e histórico mantêm cópia até que alguém reconstrua ou expire | Declare o prazo de reconstrução e teste a eliminação de ponta a ponta |
| "Não treino modelo, então não há envenenamento" | Base de conhecimento e embedding continuam sob controle da empresa e alteram a resposta | Aplique o controle ao que você controla: ingestão, versionamento e revisão de fonte externa |
| "O fornecedor já apaga tudo" | Prazo de retenção e uso para treino próprio variam por contrato e por configuração | Peça por escrito, configure o que for configurável e registre a resposta no inventário |
| "Classificar depois é mais rápido" | Índice sem marcação exige reconstrução para passar a filtrar | Classifique antes da ingestão e marque por trecho quando a sensibilidade variar dentro do documento |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite os quatro riscos de dado do OWASP Top 10 for LLM Applications 2025 e o estágio do pipeline em que cada um é mais forte.
2. Qual é o controle que impede um assistente de responder sobre documento que o solicitante não pode acessar?
3. O que muda no pipeline quando o dado é eliminado na origem?
4. Que obrigação de transparência sobre dado de treino existe para fornecedores de modelos de uso geral, segundo a Comissão Europeia?
5. Por que marcar por trecho, e não apenas por documento?

<details>
<summary>Conferir respostas</summary>

1. LLM02 divulgação de informação sensível, no uso e na saída; LLM03 cadeia de suprimentos, na origem; LLM04 envenenamento de dado e de modelo, na preparação; LLM08 fragilidades de vetor e embedding, no armazenamento e na recuperação.
2. Verificação de permissão no momento da recuperação, com a identidade do solicitante, aplicada ao trecho e não à interface.
3. A cópia no índice, no cache e no histórico permanece até expirar por prazo declarado ou até a reconstrução do índice. Sem prazo e sem dono, a eliminação na origem não chega ao pipeline.
4. A de publicar um resumo do conteúdo usado no treino, com visão geral das fontes, incluindo grandes conjuntos de dados e os principais nomes de domínio, e informações sobre aspectos de tratamento de dado. A obrigação é do fornecedor; a empresa que contrata usa isso como pergunta de due diligence.
5. Porque a sensibilidade varia dentro do mesmo documento. Marcar só por documento força a escolha entre excluir conteúdo útil e expor anexo restrito.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Executar o teste de acesso cruzado em um assistente em produção | Rebaixar: repetir em D+3 |
| D+30 | Verificar se a eliminação na origem alcançou o índice e registrar o resultado | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 14-dados-privacidade#TEMA-02 | classificação e inventário definem o que pode entrar em conjunto de treino e em base de conhecimento |
| complementa | 08-cloud#TEMA-05 | conjunto de treino e índice vetorial vivem em armazenamento gerenciado; o outro lado é chave, segregação e ciclo de vida na nuvem; destino planejado |

## 13. Certificações e leitura recomendada

Nenhuma certificação de segurança de IA foi confirmada em fonte oficial nesta execução. Os recursos de referência são a página de riscos do OWASP Top 10 for LLM Applications 2025, que descreve os riscos LLM02, LLM03, LLM04 e LLM08 e aponta mitigações ([genai.owasp.org](https://genai.owasp.org/llm-top-10/), acessado em 2026-09-25), e a ISO/IEC 23894:2023, cujo resumo oficial descreve orientação para organizações que desenvolvem, produzem, implantam ou usam produtos, sistemas e serviços com IA gerenciarem risco relacionado a IA ([iso.org](https://www.iso.org/standard/77304.html), acessado em 2026-09-25). O detalhe de credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | OWASP Top 10 for LLM Applications 2025 | primaria | https://genai.owasp.org/llm-top-10/ | "2026-09-25" | alta |
| 2 | European Commission — AI Act, Regulation (EU) 2024/1689 | primaria | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | "2026-09-25" | alta |
| 3 | ISO/IEC 42001:2023 — AI management system | primaria | https://www.iso.org/standard/42001 | "2026-09-25" | alta |
| 4 | ISO/IEC 23894:2023 — Guidance on risk management de IA | primaria | https://www.iso.org/standard/77304.html | "2026-09-25" | alta |

**NAO CONFIRMADO em fonte oficial nesta execução:** o texto completo de cada página de risco do OWASP Top 10 for LLM, lido apenas no índice; o conteúdo dos controles de dado do Anexo A da ISO/IEC 42001:2023, porque o texto da norma é pago; qualquer estatística de vazamento de dado por sistema de IA ou de frequência de envenenamento em produção; relação nominal entre artigo da LGPD e dado de treino, porque a verificação das fontes normativas de privacidade pertence a [14-dados-privacidade](../14-dados-privacidade/README.md) e está registrada em [99-fontes/registro-verificacao.md](../99-fontes/registro-verificacao.md).

---

| Navegação | |
|---|---|
| Área | [16 Segurança em IA e LLM](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-prompt-injection.md) |
| Próximo tema | [TEMA-04](TEMA-04-governanca-ia-iso-42001.md) |
| Home | [README](../README.md) |
