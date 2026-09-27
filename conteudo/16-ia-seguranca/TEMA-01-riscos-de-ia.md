---
tema: "Riscos de IA e o que muda na segurança"
tema_id: "TEMA-01"
area_id: "16-ia-seguranca"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Classificar cinco sistemas de IA em uso na empresa nas quatro categorias de risco do AI Act, registrando para cada um o papel da organização como fornecedora ou deployer e a razão da classificação"
atende_objetivo: [1, 2]
certificacoes: []
pre_requisitos: ["00-guia-basico#TEMA-03", "01-fundamentos#TEMA-06"]
relacoes:
  complementa:
    - alvo: "15-fatores-humanos#TEMA-01"
      motivo: "risco de IA muda o que a pessoa vê e faz; o alvo trata por que gente é explorada e sem isso o controle de uso de IA vira bloqueio de ferramenta; destino planejado"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-03"
      motivo: "risco de IA só entra no registro com critério de aceitação declarado; o alvo é onde apetite e tolerância são escritos"
  nao_confundir_com: []
fontes:
  - titulo: "OWASP Top 10 for LLM Applications 2025 — riscos e mitigacoes"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — AI Act, Regulation (EU) 2024/1689"
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 42001:2023 — AI management system"
    url: "https://www.iso.org/standard/42001"
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

# Riscos de IA e o que muda na segurança

A Comissão Europeia classifica sistemas de IA em quatro níveis de risco e lista nove práticas proibidas, entre elas a manipulação e o engano por IA, a pontuação social, a inferência de emoção no trabalho e na escola e a raspagem não direcionada de internet ou câmera para ampliar base de reconhecimento facial ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). Um CISO que assume o cargo com pouca base técnica costuma tratar IA como "mais um sistema". A consequência de tratar assim é que o registro de risco continua completo no papel e incompleto no que importa: quem responde pelo conteúdo que entrou no modelo, pelo que o modelo respondeu e pelo dado que ficou retido no fornecedor.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: classificar cinco sistemas de IA em uso na empresa nas quatro categorias de risco do AI Act, registrando para cada um o papel da organização como fornecedora ou deployer e a razão da classificação.

## 2. Pré-requisitos

[00-guia-basico#TEMA-03](../00-guia-basico/TEMA-03-ameaca-vulnerabilidade-risco.md), porque sem o vocabulário de ameaça, vulnerabilidade e risco a conversa vira catálogo de sustos, e [01-fundamentos#TEMA-06](../01-fundamentos/TEMA-06-risco-probabilidade-impacto.md), porque a classificação precisa aterrissar em probabilidade, impacto e risco residual.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantos sistemas de IA você aposta que a sua empresa usa hoje sem dono nomeado? Chute um número.
   Confiança: ___
2. Se um modelo erra e causa prejuízo a um cliente, quem responde: a empresa que usou o modelo ou quem o treinou? Aposte antes de ler.
   Confiança: ___
3. Um assistente interno que lê documentos é risco de confidencialidade, de integridade ou dos dois? Escolha antes de ler.
   Confiança: ___
4. Dos sistemas de IA que a sua empresa usa, quantos você acha que passaram por avaliação de dado de entrada e de retenção? Chute um número.
   Confiança: ___
## 4. Caso real

Achado de auditoria interna em uma empresa de serviços. O inventário de aplicações listava 240 sistemas, todos com dono e classificação. Fora do inventário, a mesma auditoria encontrou quatro usos de IA em produção: um assistente de resumo de ata de reunião contratado pelo marketing, um plugin de transcrição usado pela área de qualidade, um serviço de geração de imagem usado em apresentação de proposta e um assistente de código instalado no ambiente de desenvolvimento por dois engenheiros.

Nenhum dos quatro era "sombra" no sentido de escondido: todos passaram por aprovação de despesa ou de acesso. Nenhum tinha dono nomeado, avaliação de dado de entrada ou retenção declarada. A pergunta que o caso deixa aberta: o que exatamente um sistema precisa ter para entrar no registro de risco — e em que momento ele passa a ter obrigação regulatória, mesmo sendo de uso interno.

## 5. Conteúdo

### 5.1 Conceito

Um sistema de IA acrescenta ao registro de risco três objetos que não existiam antes. O primeiro é o dado de entrada e de treino, que passa a influenciar o comportamento do sistema. O segundo é o comportamento do modelo, que não é determinístico: a mesma entrada pode produzir saídas diferentes, e parte da decisão acontece dentro de um componente que a empresa não audita linha a linha. O terceiro é a saída, que circula como texto, decisão ou chamada de ferramenta e chega a outro sistema.

A taxonomia de aplicação mais usada hoje está no OWASP Top 10 for LLM Applications 2025, com dez riscos numerados de LLM01 a LLM10: prompt injection, divulgação de informação sensível, cadeia de suprimentos, envenenamento de dado e de modelo, tratamento inadequado da saída, agência excessiva, vazamento de prompt de sistema, fragilidades de vetor e embedding, desinformação e consumo não limitado ([genai.owasp.org](https://genai.owasp.org/llm-top-10/), acessado em 2026-09-25). Ela serve como checklist de avaliação, não como catálogo de controles: o OWASP não diz o que implementar na sua empresa, diz onde olhar.

A camada regulatória europeia tem vocabulário próprio. O AI Act, Regulamento (UE) 2024/1689, entrou em vigor em 1 de agosto de 2024 e ficou aplicável em 2 de agosto de 2026, com as proibições e as obrigações de alfabetização em IA valendo desde 2 de fevereiro de 2025 e as regras de governança e as obrigações para modelos de uso geral desde 2 de agosto de 2025 ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). Quem usa o sistema aparece como deployer e tem obrigações próprias, diferentes das obrigações de quem constrói o modelo: a mesma página descreve que, depois que o sistema está no mercado, as autoridades fazem vigilância, os deployers garantem supervisão humana e monitoramento e os fornecedores mantêm sistema de monitoramento pós-mercado.

A ISO/IEC 42001:2023 entra por outro lado. A ISO descreve o padrão como aplicável a organizações de qualquer tamanho envolvidas no desenvolvimento, no fornecimento ou no uso de produtos e serviços baseados em IA, válido em qualquer setor, e responde que sim à pergunta sobre se o padrão se aplica a todo tipo de sistema de IA ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). Ou seja: usar já coloca a organização dentro do objeto do sistema de gestão.

### 5.2 Como funciona

O mecanismo de avaliação tem quatro passos, e nenhum deles exige laboratório.

**Inventariar antes de classificar.** Liste cada sistema com nome, fornecedor, modelo hospedado ou contratado por API, dono interno, dado de entrada, dado de saída, onde a saída é usada e se há agente com permissão de ação. Uso aprovado e uso não aprovado entram na mesma lista; a diferença é um campo, não um filtro.

**Classificar pela finalidade, e não pela tecnologia.** A categoria de risco decorre do uso, não do modelo. Um modelo de uso geral aplicado a triagem de currículo e o mesmo modelo aplicado a resumo de ata caem em lugares diferentes. A Comissão lista entre os casos de risco alto o componente de segurança em infraestrutura crítica, o uso em educação que decide acesso, o componente de segurança de produto, ferramenta de emprego e gestão de trabalhador, acesso a serviço essencial como pontuação de crédito, identificação biométrica remota e reconhecimento de emoção, uso em aplicação da lei, migração e asilo, e administração da justiça e de processos democráticos ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). A partir de 2 de dezembro de 2027, sistemas de risco alto nessas áreas sensíveis passam a ter obrigações estritas antes de entrar no mercado, entre elas avaliação e mitigação de risco, qualidade do conjunto de dados, registro de atividade, documentação, informação ao deployer, supervisão humana e nível alto de segurança, precisão e o que a página chama de *robustness* (robustez).

**Nomear o papel na cadeia.** A empresa que só consome API é deployer; a que ajusta um modelo aberto e o coloca em produto próprio assume papel de fornecedora daquele sistema. O papel muda a obrigação: quem entrega ao mercado responde por documentação e conformidade do sistema; quem usa responde por supervisão humana, monitoramento e uso conforme a finalidade declarada.

**Ligar cada risco a um dono e a um controle existente.** O valor do exercício não está em descobrir risco novo, e sim em descobrir qual risco novo não tem controle nenhum por trás. Um assistente de resumo de ata que recebe documento classificado como interno precisa de controle de retenção no fornecedor; se não existe cláusula contratual nem configuração de retenção desligada, o risco está sem controle.

Vale um aviso de método. O MITRE ATLAS é a base de conhecimento de táticas e técnicas adversariais envolvendo IA que o próprio site descreve como incluindo ataques contra sistemas com IA, abuso ou manipulação de capacidades de IA e comportamento autônomo danoso viabilizado por IA ([atlas.mitre.org](https://atlas.mitre.org/), confirmado pelo índice de busca do domínio em 2026-09-25). Ele descreve o lado do atacante. A contagem de táticas e técnicas não foi confirmada nesta execução, e por isso não é citada aqui.

### 5.3 Exemplo resolvido

Empresa de médio porte, 800 funcionários, quatro usos de IA. Monte a ficha dos quatro primeiros.

| Sistema | Papel da empresa | Categoria de risco | Risco principal | Controle que falta |
|---|---|---|---|---|
| Assistente de resumo de ata com documento interno | deployer | risco mínimo ou nulo pela finalidade; obrigação de transparência a partir de agosto de 2026 se houver conteúdo gerado publicado | LLM02 divulgação de informação sensível | retenção no fornecedor declarada e desligada quando possível |
| Plugin de transcrição de reunião com cliente | deployer | risco mínimo ou nulo pela finalidade | LLM02 e exposição de dado pessoal de terceiro | aviso aos participantes e base legal registrada pelo programa de privacidade |
| Triagem automática de currículo | deployer | risco alto, uso em emprego | LLM09 desinformação e decisão sem revisão humana | supervisão humana documentada e registro de critério |
| Assistente de código no ambiente de desenvolvimento | deployer, com risco de virar fornecedora se o código gerado for embarcado | risco mínimo ou nulo pela finalidade | LLM01 injection indireta por dependência, LLM03 cadeia de suprimentos | proibição de dado de cliente no prompt e revisão de código gerado |

Passo a passo do raciocínio, com a mesma ordem para cada linha.

1. Descreva a finalidade em uma frase, sem nome de tecnologia. "Resumir ata de reunião interna" e não "usar um LLM".
2. Pergunte se a finalidade aparece na lista de risco alto da Comissão. Triagem de currículo aparece, em ferramenta de emprego; resumo de ata não aparece.
3. Nomeie o dado que entra e o dado que sai, com classificação. Ata interna e currículo não têm a mesma classificação.
4. Decida quem responde pela saída. Se a saída orienta decisão sobre pessoa, existe decisão automatizada com efeito sobre titular, e o programa de privacidade precisa entrar.
5. Marque o risco do OWASP Top 10 que corresponde. Se nenhum corresponder, registre como risco sem mapeamento, e não invente controle.
6. Escreva o controle que falta, com dono e prazo. "Ausência de supervisão humana documentada na triagem de currículo, dono: RH, prazo: 60 dias."

### 5.4 Problema de completar

O financeiro quer um assistente que responda a perguntas sobre contratos de fornecedor, alimentado por uma pasta compartilhada. Complete a ficha.

1. Finalidade em uma frase, sem tecnologia: ______
2. Dado de entrada e classificação: ______
3. Risco do OWASP Top 10 mais provável e por quê: ______
4. Papel da empresa na cadeia: ______
5. Controle que falta, com dono e prazo: ______

Regra de conferência: se a resposta do item 3 ficou "nenhum", releia a lista de dez riscos. Todo assistente que lê documento de terceiro tem, no mínimo, risco de divulgação de informação sensível e risco de injection indireta pelo texto do documento.

## 6. Por que isso importa para o CISO

A pergunta que sobe ao comitê muda de forma. Antes era "a IA é segura?", que não tem resposta. Depois deste tema é: "o sistema X, cuja finalidade é Y, é usado por Z pessoas, recebe dado de classificação C, e não tem supervisão humana documentada; o custo de fechar isso é H horas de trabalho e K reais por mês". A segunda pergunta cabe em ata, tem dono e tem prazo.

O efeito prático aparece em três lugares. No orçamento, porque retenção, isolamento de ambiente e revisão humana têm custo recorrente e precisam entrar no ciclo seguinte. Na resposta a incidente, porque sem inventário a primeira hora de contenção é gasta descobrindo qual ferramenta estava em uso. E na conversa com o jurídico, porque o papel de deployer traz obrigação própria, e o jurídico precisa dessa lista para decidir o que a empresa afirma publicamente sobre o uso de IA.

## 7. Aplicação prática

Faça o inventário de IA da sua empresa em duas semanas, com ou sem ferramenta.

1. Peça ao financeiro a lista de despesas recorrentes com serviço que tenha "AI", "copilot", "assistant" ou nome de fornecedor de modelo no descritivo, dos últimos 12 meses.
2. Peça ao time de identidade a lista de aplicações com login via SSO cujo nome caia nesses termos, e a lista de extensões de navegador aprovadas.
3. Some as duas listas e remova duplicidade. Esse é o inventário inicial.
4. Para cada item, preencha quatro campos: do, dado de entrada, onde a saída é usada, e situação. Situação tem três valores: aprovado, aprovado com condição, não aprovado.
5. Leve a lista para a próxima reunião de risco e peça decisão sobre os "não aprovado". O que não receber decisão vira risco aceito por omissão, e isso precisa constar do registro.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre por que a classificação de risco decorre da finalidade e não do modelo, uma sobre o que difere entre fornecedor e deployer, e uma sobre o que o inventário muda na conversa de orçamento.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Não treinamos modelo, então não temos risco de IA" | O risco de aplicação nasce do uso, do dado que entra e da saída que circula; o OWASP Top 10 for LLM Applications 2025 é escrito para quem constrói e para quem integra aplicação | A empresa que consome API é deployer e responde por supervisão, monitoramento e uso conforme a finalidade |
| "O fornecedor é responsável por tudo" | O papel na cadeia define obrigações próprias para quem coloca o sistema em uso | Divida a responsabilidade por escrito: o que o contrato cobre e o que fica com a empresa |
| Classificar pelo tipo de modelo | Modelo de uso geral aparece em usos de risco alto e em usos de risco mínimo, com obrigações diferentes | Classifique pela finalidade declarada e pelo efeito sobre pessoa |
| Inventariar só o uso aprovado | O risco mora justamente no que não passou pelo processo | Uso não aprovado entra na lista com situação própria e decisão registrada |
| Tratar o OWASP Top 10 for LLM como catálogo de controles | É uma lista de riscos e mitigações de aplicação, sem o fechamento de um catálogo de controles de gestão | Use como checklist de avaliação e leve o tratamento para o sistema de gestão do TEMA-04 |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as quatro categorias de risco do AI Act e o que caracteriza cada uma?
2. Qual é a diferença entre provider e deployer, e qual é a obrigação típica do deployer?
3. Cite cinco dos dez riscos do OWASP Top 10 for LLM Applications 2025.
4. A ISO descreve a ISO/IEC 42001 como aplicável a quais organizações?
5. Quais campos um registro de sistemas de IA precisa ter para ser útil na conversa de risco?

<details>
<summary>Conferir respostas</summary>

1. Risco inaceitável, com práticas proibidas; risco alto, com casos de uso que podem afetar saúde, segurança ou direitos fundamentais; risco de transparência, com obrigação de informar que o usuário interage com máquina e de identificar conteúdo gerado; e risco mínimo ou nulo, sem regra específica. A Comissão enumera nove práticas proibidas e informa que as proibições 1 a 8 passaram a valer em fevereiro de 2025.
2. Provider coloca o sistema no mercado e responde por documentação, conformidade e monitoramento pós-mercado; deployer usa o sistema e responde por supervisão humana, monitoramento e uso conforme a finalidade. Quem consome modelo por API é deployer, e quem ajusta modelo aberto e o embarca em produto assume papel de fornecedora.
3. Entre os dez: prompt injection, divulgação de informação sensível, cadeia de suprimentos, envenenamento de dado e de modelo, tratamento inadequado da saída, agência excessiva, vazamento de prompt de sistema, fragilidades de vetor e embedding, desinformação e consumo não limitado.
4. Organizações de qualquer tamanho envolvidas em desenvolver, fornecer ou usar produtos e serviços baseados em IA, em qualquer setor, incluindo agências do setor público, empresas e organizações sem fins lucrativos.
5. Nome do sistema, fornecedor e modelo, dono interno, dado de entrada com classificação, dado de saída e onde é usado, presença de agente com permissão de ação, retenção no fornecedor, papel na cadeia, categoria de risco e situação de aprovação. Sem dono e sem situação, a lista não gera decisão.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Refazer a classificação de um sistema que mudou de finalidade no mês | Rebaixar: repetir em D+3 |
| D+30 | Levar o inventário atualizado para a reunião de risco e registrar a decisão | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-03 | risco de IA só entra no registro com critério de aceitação declarado; o alvo é onde apetite e tolerância são escritos |
| complementa | 15-fatores-humanos#TEMA-01 | risco de IA muda o que a pessoa vê e faz; o alvo trata por que gente é explorada e sem isso o controle de uso de IA vira bloqueio de ferramenta; destino planejado |

## 13. Certificações e leitura recomendada

Nenhuma certificação de segurança de IA foi confirmada em fonte oficial nesta execução. O material normativo disponível é o padrão, e a ISO descreve a ISO/IEC 42001:2023 como o primeiro padrão de sistema de gestão de IA, que usa a lógica Plan-Do-Check-Act e se aplica a quem fornece ou usa sistemas de IA ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). A leitura do texto da norma é o próximo passo; o detalhe de credencial, custo e validade pertence a [90-certificacoes/](../90-certificacoes/README.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | OWASP Top 10 for LLM Applications 2025 | primaria | https://genai.owasp.org/llm-top-10/ | "2026-09-25" | alta |
| 2 | European Commission — AI Act, Regulation (EU) 2024/1689 | primaria | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | "2026-09-25" | alta |
| 3 | ISO/IEC 42001:2023 — AI management system | primaria | https://www.iso.org/standard/42001 | "2026-09-25" | alta |
| 4 | ENISA — Artificial Intelligence Cybersecurity Challenges | primaria | https://www.enisa.europa.eu/publications/artificial-intelligence-cybersecurity-challenges | "2026-09-25" | media |
| 5 | MITRE ATLAS | primaria | https://atlas.mitre.org/ | "2026-09-25" | media |

**NAO CONFIRMADO em fonte oficial nesta execução:** número, versão, data e estrutura de funções do NIST AI RMF e do perfil para IA generativa, cujo acesso falhou por erro 504; contagem de táticas e técnicas do MITRE ATLAS; data de publicação do relatório da ENISA; número de controles do Anexo A da ISO/IEC 42001:2023; qualquer estatística de adoção de IA, de incidentes envolvendo IA ou de uso não governado, por falta de fonte primária localizada nesta execução.

---

| Navegação | |
|---|---|
| Área | [16 Segurança em IA e LLM](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-prompt-injection.md) |
| Home | [README](../README.md) |
