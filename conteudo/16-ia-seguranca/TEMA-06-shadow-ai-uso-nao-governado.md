---
tema: "Shadow AI: uso não governado"
tema_id: "TEMA-06"
area_id: "16-ia-seguranca"
nivel: intermediario
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Montar o registro de uso de IA da empresa incluindo ferramentas não aprovadas, com dono, dado de entrada e situação, e escrever a política de uso que decide o que fazer com cada caso"
atende_objetivo: [2]
certificacoes: []
pre_requisitos: ["TEMA-01", "TEMA-04"]
relacoes:
  complementa:
    - alvo: "15-fatores-humanos#TEMA-04"
      motivo: "uso não governado cede a política que a liderança sustenta, e não a bloqueio de rede; o alvo trata cultura e papel da liderança; destino planejado"
  aprofundado_por: []
  aplicado_em:
    - alvo: "14-dados-privacidade#TEMA-04"
      motivo: "dado pessoal colado em ferramenta não aprovada é tratamento sem base legal declarada e pode virar incidente comunicável"
  nao_confundir_com: []
fontes:
  - titulo: "European Commission — AI Act, Regulation (EU) 2024/1689, obrigacoes de alfabetizacao em IA e papel do deployer"
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 42001:2023 — AI management system"
    url: "https://www.iso.org/standard/42001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "OWASP Top 10 for LLM Applications 2025 — LLM02, LLM06 e LLM10"
    url: "https://genai.owasp.org/llm-top-10/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Shadow AI: uso não governado

A Comissão Europeia registra que as obrigações de alfabetização em IA do AI Act passaram a valer em 2 de fevereiro de 2025, junto das proibições, e que o regulamento trata o deployer — quem usa o sistema — como responsável por supervisão humana e monitoramento ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). A ISO descreve a ISO/IEC 42001:2023 como aplicável a organizações envolvidas em desenvolver, fornecer **ou usar** produtos e serviços baseados em IA ([iso.org](https://www.iso.org/standard/42001), acessado em 2026-09-25). As duas referências dizem a mesma coisa em linguagens diferentes: o uso, e não apenas a construção, é objeto de governança. É exatamente o uso que a segurança costuma não enxergar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: montar o registro de uso de IA da empresa incluindo ferramentas não aprovadas, com dono, dado de entrada e situação, e escrever a política de uso que decide o que fazer com cada caso.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-riscos-de-ia.md) fornece o inventário e a classificação; [TEMA-04](TEMA-04-governanca-ia-iso-42001.md) fornece o critério de aprovação e a alçada. Sem os dois, a discussão vira proibição sem alternativa.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantas ferramentas de IA você aposta que alguém da sua empresa usa hoje sem aprovação formal? Chute um número.
   Confiança: ___
2. A política da sua empresa trata explicitamente de colar dado de cliente em ferramenta pública? Aposte sim, não ou não sei.
   Confiança: ___
3. Se um funcionário cola dado de cliente em um assistente público, a empresa tem obrigação de comunicar alguém? Aposte antes de ler.
   Confiança: ___
## 4. Caso real

Um gerente comercial colou o contrato de um cliente, com cláusula de preço e nome dos signatários, em um assistente público de texto, para pedir um resumo em português mais claro. A ferramenta exibia, na tela inicial, a frase "não insira informações confidenciais"; ninguém havia lido.

Três semanas depois, o cliente pediu acesso ao registro de tratamento de dado do projeto. O jurídico descobriu o episódio ao perguntar ao gerente, não pelo sistema. Não havia log de egresso, não havia política de uso de IA, e a decisão sobre comunicar ou não o incidente foi tomada sem saber se o dado tinha sido retido ou usado em treino pelo fornecedor.

A pergunta que o caso deixa aberta: como a empresa descobre o uso não governado antes do cliente descobrir, e o que precisa existir escrito para que a descoberta vire decisão em vez de improviso?

## 5. Conteúdo

### 5.1 Conceito

Uso não governado de IA é o uso de sistema de IA fora do processo de aprovação da empresa. O nome popular no mercado é shadow AI. A definição operacional é mais útil que o apelido: é uso que não está no inventário, com dono, dado de entrada e situação declarados.

Vale separar de dois vizinhos que não são a mesma coisa. Shadow IT clássico é software instalado fora do processo de TI, e costuma aparecer em inventário de dispositivo e de rede. Uso de IA generativa tem uma diferença que agrava o caso: a maior parte é acesso a serviço externo por navegador, com autenticação pessoal, sem instalação e sem tráfego distinguível a olho nu. E o dado enviado no prompt é irreversível do ponto de vista da empresa — uma vez enviado, não existe revogação técnica.

O uso não governado aparece por três caminhos. Produtividade: a ferramenta resolve um problema que o processo interno não resolve, e a pessoa resolve por conta. Latência de aprovação: quando aprovar uma ferramenta leva três meses, o uso acontece antes da aprovação. E omissão de política: a empresa nunca escreveu o que pode e o que não pode, então cada pessoa decide por conta própria, e a decisão individual costuma ser a mais permissiva.

### 5.2 Como funciona

Descoberta, classificação, decisão e alternativa. Nessa ordem, porque bloquear antes de oferecer alternativa apenas empurra o uso para o canal mais difícil de ver.

**Descoberta.** Cinco fontes que não exigem sensor novo.

| Fonte | O que revela | Limite |
|---|---|---|
| Inventário de aplicações com SSO | ferramenta acessada com identidade corporativa | não pega conta pessoal |
| Extensões de navegador gerenciadas | assistente embutido no navegador e em ferramenta de escritório | não pega uso em dispositivo não gerenciado |
| Despesa de cartão corporativo e reembolso | assinatura individual ou de área | atraso de um ciclo de fatura |
| Log de DNS e de proxy, quando existirem | domínio de serviço de IA acessado | volume alto e falso positivo alto |
| Chamados de suporte e conversa com o time | uso relatado por quem usa | depende de canal sem punição |

**Classificação.** Cada achado entra na ficha do [TEMA-01](TEMA-01-riscos-de-ia.md): dono, finalidade, dado de entrada, onde a saída é usada, e situação entre aprovado, aprovado com condição e não aprovado.

**Decisão em quatro respostas.** Aprovar como está, quando o risco cabe no critério. Aprovar com condição, quando falta um controle — retenção, conta corporativa, proibição de dado classificado. Substituir, quando existe ferramenta equivalente já aprovada. E proibir, quando a finalidade ou o dado não são aceitáveis. Proibir sem alternativa é a resposta que menos funciona.

**Alternativa.** O que sustenta a política é ter onde colocar o uso. Se o assistente interno demora a chegar, a instrução de não usar ferramenta pública é cumprida por quem já respeita a regra, e ignorada por quem tem prazo.

Há um ponto regulatório que muda a conversa com o comitê. As obrigações de alfabetização em IA do AI Act valem desde 2 de fevereiro de 2025, e o deployer responde por supervisão humana e monitoramento ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), acessado em 2026-09-25). Isso significa que treinar quem usa não é programa de conscientização opcional: é obrigação declarada, e o registro de treinamento entra no calendário de evidência do sistema de gestão de IA. Quando o uso não governado envolve dado pessoal, o tratamento passa a existir sem base legal declarada, e o tema deixa de ser de segurança e passa a ser de privacidade — o encaminhamento pertence a [14-dados-privacidade](../14-dados-privacidade/README.md), com as fontes normativas registradas em [99-fontes/registro-verificacao.md](../99-fontes/registro-verificacao.md).

### 5.3 Exemplo resolvido

Episódio: contrato de cliente colado em assistente público. Trate o caso em oito passos, com o dono de cada um.

1. Contenha o canal, e não a pessoa. Peça que a conta seja encerrada e que o conteúdo não seja reaproveitado. Investir contra o funcionário garante que o próximo episódio não seja relatado. Dono: gestor da área.
2. Levante o dado. Quais clientes, qual classificação, qual volume, se havia dado pessoal além de nome de signatário. Dono: segurança com jurídico.
3. Verifique a retenção no fornecedor. Configuração de retenção, uso para treino e prazo de exclusão, por escrito. Sem resposta do fornecedor, presuma retenção até prova em contrário. Dono: compras com segurança.
4. Leve ao programa de privacidade. O encarregado decide sobre comunicação a titular e autoridade, com os prazos e critérios que pertencem à área de privacidade. Dono: encarregado.
5. Registre no inventário. O assistente público entra no registro de uso de IA com situação "não aprovado" e decisão registrada. Dono: segurança.
6. Ofereça a alternativa. Se a função de resumo de contrato é necessária, ela precisa de caminho aprovado, com ferramenta corporativa e retenção contratada. Dono: área de negócio com segurança.
7. Escreva a política de uso. Regra por classificação de dado, lista de ferramentas aprovadas, canal de relato sem punição e o que fazer em caso de exposição acidental. Dono: segurança com jurídico e RH.
8. Meça. Número de ferramentas descobertas por trimestre, tempo entre descoberta e decisão, e percentual da empresa treinado em IA. Dono: segurança, no reporte ao comitê.

Resultado esperado em 90 dias: três ferramentas na lista de aprovadas, duas substituídas, uma proibida com alternativa publicada, e o registro de treinamento iniciado. Sem os passos 6 e 7, o passo 1 vira o único controle, e ele não escala.

### 5.4 Problema de completar

Uma área de engenharia usa um assistente de código com conta pessoal para revisar trechos de código proprietário. Complete o tratamento.

1. Risco do OWASP mais provável nesse uso: ______
2. Decisão recomendada entre aprovar, aprovar com condição, substituir ou proibir, e por quê: ______
3. Dado que precisa ser proibido no prompt, com o critério: ______
4. Fonte de descoberta que você usaria para achar outros casos: ______
5. Métrica de acompanhamento, com frequência: ______

Regra de conferência: se o item 2 ficou "proibir", verifique se existe alternativa aprovada com a mesma função. Sem alternativa, a proibição tende a ser contornada pelo mesmo caminho, com mais cuidado em esconder.

## 6. Por que isso importa para o CISO

O uso não governado define o tamanho real do problema de IA na empresa. Governança sobre as ferramentas aprovadas mede a parte que já estava sob controle. O risco não medido fica fora, e é ele que aparece primeiro em auditoria, em pedido de cliente ou em incidente.

Três decisões caem na mesa do CISO. Quanto investir em descoberta, sabendo que a descoberta tem limite técnico e que a fonte mais produtiva é o relato. Qual é o prazo máximo entre a descoberta e a decisão, porque achado sem decisão vira risco aceito por omissão no registro. E como tratar quem relata, porque a política que pune o relato garante que o próximo caso chegue pela voz do cliente.

Há também o efeito sobre o orçamento de conscientização. Alfabetização em IA virou obrigação declarada no AI Act, com aplicação desde fevereiro de 2025, e evidência de treinamento entra no sistema de gestão de IA. Programa de conscientização deixa de ser iniciativa de cultura e passa a ser item de conformidade, com registro.

## 7. Aplicação prática

Faça a descoberta em 30 dias, com as fontes disponíveis.

1. Peça ao time de identidade a lista de aplicações com SSO cujo nome contenha termos de IA e a lista de extensões de navegador aprovadas.
2. Peça ao financeiro as despesas recorrentes com serviço que tenha termos de IA no descritivo, dos últimos 12 meses.
3. Se houver log de DNS ou proxy, selecione os 20 domínios de serviço de IA mais acessados e compare com a lista de ferramentas aprovadas.
4. Monte a ficha única de cada achado, com dono, dado de entrada e situação, e leve à reunião de risco.
5. Escreva a política de uso em duas páginas e publique, com canal de relato sem punição e prazo de resposta declarado.
6. Coloque no calendário o registro de treinamento em IA, porque ele é evidência do sistema de gestão.
7. Meça a cada trimestre: ferramentas descobertas, decisões pendentes, treinamento concluído.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma sobre por que o uso aparece, uma sobre as cinco fontes de descoberta, e uma sobre por que proibir sem alternativa não fecha o caso.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Bloquear o domínio resolve" | Empurra para rede pessoal e celular, e o uso sai do alcance de qualquer log | Descubra, decida e ofereça alternativa aprovada |
| "Isso é shadow IT, já sei tratar" | Uso de IA por navegador não instala nada e não aparece em inventário de dispositivo | Some fontes de identidade, despesa, extensão e relato |
| "O funcionário agiu de má-fé" | Na maior parte dos casos a ferramenta resolve um problema real sem alternativa interna | Trate como falha de política e de caminho aprovado, e mantenha o relato sem punição |
| "A ferramenta diz que não guarda dado" | A frase pode estar na tela e o contrato dizer outra coisa, ou não existir contrato | Peça retenção, uso para treino e prazo por escrito, e registre a resposta |
| Deixar o caso fora do registro quando a ferramenta é gratuita | Risco não depende de haver custo, e o dado enviado sai do controle do mesmo modo | Registre com situação e dono, como qualquer sistema de IA |
| Treinar uma vez e considerar cumprido | Há obrigação de alfabetização em IA com aplicação declarada desde fevereiro de 2025 | Registre treinamento por pessoa e mantenha no calendário de evidência |

## 10. Recuperação ativa

Responda tudo antes do gabarito.

1. Qual é a diferença entre shadow IT clássico e uso não governado de IA generativa?
2. Cite as cinco fontes de descoberta e o limite de cada uma.
3. Quais são as quatro decisões possíveis para um uso descoberto, e quando cada uma se aplica?
4. O que a Comissão Europeia registra sobre alfabetização em IA e sobre o papel do deployer?
5. Por que o episódio de dado pessoal colado em ferramenta pública deixa de ser tema de segurança e passa a ser de privacidade?

<details>
<summary>Conferir respostas</summary>

1. Shadow IT clássico é software instalado fora do processo de TI, detectável por inventário de dispositivo e de rede. Uso de IA generativa costuma ser acesso por navegador, com autenticação pessoal, sem instalação, e envia dado que a empresa não consegue revogar depois.
2. Inventário de aplicações com SSO, que não pega conta pessoal; extensões de navegador gerenciadas, que não pegam dispositivo não gerenciado; despesa de cartão corporativo e reembolso, com atraso de um ciclo; log de DNS e de proxy, com volume e falso positivo altos; e relato em chamado ou conversa, que depende de canal sem punição.
3. Aprovar como está, quando o risco cabe no critério; aprovar com condição, quando falta controle como retenção, conta corporativa ou proibição de dado classificado; substituir, quando existe ferramenta equivalente aprovada; e proibir, quando finalidade ou dado não são aceitáveis, sempre com alternativa publicada.
4. Que as obrigações de alfabetização em IA passaram a valer em 2 de fevereiro de 2025 e que o deployer responde por supervisão humana e monitoramento.
5. Porque o dado pessoal enviado passa a ser tratamento sem base legal declarada, com deveres próprios de comunicação e de atendimento a direitos, que pertencem ao encarregado e ao programa de privacidade.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Rodar a descoberta por duas fontes e registrar os achados | Rebaixar: repetir em D+3 |
| D+30 | Publicar a política de uso e medir decisões pendentes | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 14-dados-privacidade#TEMA-04 | dado pessoal colado em ferramenta não aprovada é tratamento sem base legal declarada e pode virar incidente comunicável |
| complementa | 15-fatores-humanos#TEMA-04 | uso não governado cede a política que a liderança sustenta, e não a bloqueio de rede; o alvo trata cultura e papel da liderança; destino planejado |

## 13. Certificações e leitura recomendada

Nenhuma certificação de segurança de IA foi confirmada em fonte oficial nesta execução. Os recursos de referência são a página da Comissão Europeia sobre o AI Act, para as obrigações de alfabetização em IA e o papel do deployer, e a página da ISO sobre a ISO/IEC 42001:2023, que estende o objeto do sistema de gestão a quem usa sistemas de IA ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) e [iso.org](https://www.iso.org/standard/42001), acessados em 2026-09-25). O detalhe de credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | European Commission — AI Act, Regulation (EU) 2024/1689 | primaria | https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai | "2026-09-25" | alta |
| 2 | ISO/IEC 42001:2023 — AI management system | primaria | https://www.iso.org/standard/42001 | "2026-09-25" | alta |
| 3 | OWASP Top 10 for LLM Applications 2025 | primaria | https://genai.owasp.org/llm-top-10/ | "2026-09-25" | alta |

**NAO CONFIRMADO em fonte oficial nesta execução:** qualquer estatística de adoção de uso não governado de IA em organizações — nenhuma fonte primária foi localizada, e números que circulam em material de fornecedor e de imprensa não são usados aqui; pesquisa ou orientação específica de autoridade sobre shadow AI; prazo e critério de comunicação de incidente com dado pessoal, que pertencem a [14-dados-privacidade](../14-dados-privacidade/README.md) e estão registrados em [99-fontes/registro-verificacao.md](../99-fontes/registro-verificacao.md); conteúdo das obrigações de alfabetização em IA além do que a página da Comissão declara; número, versão e estrutura do NIST AI RMF e do seu perfil para IA generativa, cujo acesso falhou por erro 504.

---

| Navegação | |
|---|---|
| Área | [16 Segurança em IA e LLM](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-ia-como-ferramenta-de-defesa.md) |
| Home | [README](../README.md) |
