---
tema: "ISMS e ISO/IEC 27001"
tema_id: "TEMA-04"
area_id: "02-governanca-risco-compliance"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Definir o escopo de um sistema de gestão de segurança da informação e justificar por escrito a inclusão e a exclusão de unidades e serviços, indicando o que a certificação prova e o que ela não prova"
atende_objetivo: [4]
certificacoes: ["CISM"]
pre_requisitos: ["TEMA-02", "TEMA-03"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-05"
      motivo: "o ISMS exige o sistema de gestão; o framework de controles fornece o catálogo de onde saem as escolhas que a declaração de aplicabilidade registra"
    - alvo: "17-lideranca-ciso#TEMA-06"
      motivo: "o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes"
  aplicado_em:
    - alvo: "08-cloud#TEMA-06"
      motivo: "a exigência do ISMS só chega ao fornecedor se estiver no contrato e na cláusula de auditoria; destino planejado"
  aprofundado_por: []
  nao_confundir_com:
    - alvo: "14-dados-privacidade#TEMA-06"
      motivo: "certificado de segurança da informação não atesta a legalidade do tratamento de dado pessoal; são dois sistemas de gestão com objetos diferentes; destino planejado"
fontes:
  - titulo: "ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements"
    url: "https://www.iso.org/standard/27001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27002:2022 — Information security, cybersecurity and privacy protection — Information security controls"
    url: "https://www.iso.org/standard/75652.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023 — catálogo oficial ABNT"
    url: "https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0="
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# ISMS e ISO/IEC 27001

A ISO/IEC 27001:2022 é a edição 3 do requisito, publicada em 25 de outubro de 2022, com 19 páginas e uma emenda publicada em 2024 (`Amd 1:2024`, sobre ação climática) ([iso.org](https://www.iso.org/standard/27001), acessado em 2026-09-25). Vinte páginas de requisitos mudaram a forma como o mercado compra segurança: em vez de conferir produtos instalados, o cliente pede um certificado que atesta a existência de um sistema de gestão. Saber o que esse papel prova, e o que ele não prova, é uma das decisões mais caras que um CISO toma nos primeiros dois anos de cargo.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: definir o escopo de um sistema de gestão de segurança da informação e justificar por escrito a inclusão e a exclusão de unidades e serviços, indicando o que a certificação prova e o que ela não prova.

## 2. Pré-requisitos

[TEMA-02](TEMA-02-politica-norma-procedimento-diretriz.md), porque o sistema de gestão é feito de documentos governados, e [TEMA-03](TEMA-03-apetite-tolerancia-risco.md), porque o critério de aceitação é a régua que decide quais riscos o sistema trata.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantas páginas você imagina que tem a ISO/IEC 27001:2022? Anote uma ordem de grandeza.
   Confiança: ___
2. Palpite: se um cliente pede prova de ISO/IEC 27001 para um serviço hospedado em terceiro, o certificado da sua empresa responde por esse serviço? Escolha.
   Confiança: ___
3. Antes de ler: quem declara que um auditor de certificação é competente — a empresa auditada, o certificador ou um acreditador externo? Aposte.
   Confiança: ___
4. Palpite: quantos anos dura um ciclo de certificação? Anote o número.
   Confiança: ___

## 4. Caso real

Um cliente europeu exige prova de gestão de segurança em um questionário de fornecedor. A empresa responde que segue as boas práticas, apresenta o relatório do último pentest e não é aprovada. No ano seguinte, ela certifica o produto SaaS, mantendo fora do escopo o data center próprio e o time de infraestrutura. O cliente aceita o certificado, e a auditoria seguinte do próprio cliente descobre que a mudança de configuração do data center, fora do escopo, não seguia nenhum dos controles que o certificado sugeria.

A pergunta que o caso deixa aberta: como se define um escopo que seja honesto e, ao mesmo tempo, gerenciável no primeiro ano de certificação? A resposta está na relação entre escopo, dependências e declaração de aplicabilidade.

## 5. Conteúdo

### 5.1 Conceito

Um sistema de gestão de segurança da informação é um conjunto de processos que liga risco avaliado, controle escolhido, evidência gerada e melhoria contínua. A página oficial da ISO descreve a ISO/IEC 27001 como o padrão que define requisitos que um ISMS deve atender, com orientação para estabelecer, implementar, manter e melhorar continuamente o sistema, e afirma que a conformidade significa ter um sistema para gerir riscos relativos à segurança dos dados próprios ou de terceiros ([iso.org](https://www.iso.org/standard/27001), acessado em 2026-09-25).

A ISO/IEC 27001 não é um catálogo de controles. O catálogo e as orientações de implementação estão na ISO/IEC 27002:2022, edição 3, publicada em 15 de fevereiro de 2022, com 152 páginas, que a ISO define como referência de controles genéricos de segurança da informação com orientação de implementação, e que não é certificável: organizações se certificam na 27001, que referencia a orientação da 27002 ([iso.org](https://www.iso.org/standard/75652.html), acessado em 2026-09-25). Separar os dois documentos evita um erro comum em projetos de certificação: tratar a norma de controles como se fosse a norma de requisitos.

A adoção brasileira é a ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023, em vigor, publicada em 23 de novembro de 2022, com 23 páginas e incorporação da Errata 1 de 31 de março de 2023. O catálogo da ABNT registra que o documento especifica requisitos para estabelecer, implementar, manter e melhorar continuamente um sistema de gestão da segurança da informação, que inclui requisitos para avaliação e tratamento de riscos, e que não é aceitável excluir qualquer requisito das seções 4 a 10 quando a organização busca a conformidade ([abntcatalogo.com.br](https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0=), endereço com parâmetro de consulta, acessado em 2026-09-25). Essa última frase é a que decide projetos: o sistema de gestão não é negociável por seção.

### 5.2 Como funciona

O ciclo tem cinco movimentos, e nenhum deles depende de ferramenta.

**Escopo.** O sistema vale para o que está declarado: serviços, unidades, localidades e sistemas. Escopo se escreve com nome próprio, e não com a razão social inteira. Tudo que está dentro responde pelos requisitos; o que fica fora precisa de justificativa escrita e de análise de dependência, porque unidades fora do escopo frequentemente fornecem serviço para dentro dele.

**Avaliação e tratamento de risco.** A organização define o método, mede os riscos do escopo e decide o tratamento, com critério de aceitação aprovado. É aqui que o [TEMA-03](TEMA-03-apetite-tolerancia-risco.md) entra: o sistema de gestão não decide o que é aceitável, ele aplica o que foi declarado.

**Declaração de aplicabilidade.** O documento que liga risco a controle: para cada controle, se é aplicável, onde está implementado e, quando não for aplicável, por quê. O detalhamento das seções 4 a 10 e a lista exata de informações documentadas exigidas não foram conferidos nesta execução, porque o texto da norma é pago; a estrutura de seções usada aqui vem do catálogo oficial da ABNT.

**Operação e evidência.** Controle implementado sem registro não existe para o auditor. O que uma auditoria de certificação costuma pedir, na prática observada de mercado e sujeita a conferência no texto da norma: registro de risco e aprovação do critério de aceitação, declaração de aplicabilidade assinada, treinamentos realizados, registros de exceção, relatórios de auditoria interna e atas de análise crítica pela direção.

**Melhoria.** Não conformidade vira ação corretiva com dono e prazo, e o ciclo recomeça na próxima avaliação. Um sistema que fecha o ano sem nenhuma não conformidade registrada costuma indicar auditoria fraca, não maturidade.

Sobre o certificado, quatro limites que o CISO precisa saber de cor. Ele atesta que um organismo de certificação avaliou o sistema contra os requisitos, dentro de um escopo declarado, em um momento no tempo. Ele não atesta ausência de incidente, não atesta a legalidade do tratamento de dado pessoal, e não cobre o que ficou fora do escopo. A ISO acrescenta um detalhe que evita confusão de vocabulário e de contrato: o padrão deve ser referido pela designação completa, como "certified to ISO/IEC 27001:2022", e a confiança extra vem de o organismo de certificação ter sua competência confirmada por um organismo de acreditação ([iso.org](https://www.iso.org/standard/27001), acessado em 2026-09-25). A ISO informa ainda que, conforme o ISO Survey 2022, mais de 70.000 certificados foram reportados em 150 países. O conjunto de padrões da família é comercializado em pacote, e a página oficial da ISO lista as edições ISO/IEC 27000:2018, 27001:2022, 27002:2022 e 27005:2022 ([iso.org](https://www.iso.org/standard/75652.html), acessado em 2026-09-25).

### 5.3 Exemplo resolvido

Empresa de logística com 900 funcionários, uma matriz, dois centros de distribuição e um serviço de rastreamento exposto a clientes. O pedido do cliente exige certificação em 12 meses. Passo a passo do escopo.

1. Escreva o escopo em uma frase com nome próprio: "desenvolvimento, operação e suporte do serviço de rastreamento de cargas, incluindo a infraestrutura de nuvem contratada, nas unidades Matriz e Centro de Distribuição Sul". Se a frase precisa de mais de duas linhas, o escopo está largo.
2. Liste as dependências do escopo que estão fora dele. No exemplo aparecem três: o data center próprio do Centro de Distribuição Norte, o provedor de identidade corporativo e a equipe de RH. Dependência de fora não vira exclusão silenciosa; vira análise e, quando necessário, exigência contratual.
3. Decida o que entra e o que fica fora, com justificativa escrita por item.

| Item | Decisão | Justificativa registrada |
|---|---|---|
| Serviço de rastreamento e sua infraestrutura de nuvem | Dentro | É o objeto da exigência do cliente |
| Matriz e Centro de Distribuição Sul | Dentro | Operam e sustentam o serviço |
| Centro de Distribuição Norte | Fora no primeiro ciclo | Não opera o serviço; consome apenas relatório; risco registrado e aceito com data de reavaliação |
| Provedor de identidade corporativo | Fora, com dependência declarada | Serviço compartilhado; exige cláusula de auditoria e de notificação no contrato |
| Sistemas financeiros | Fora | Não processam o serviço; risco registrado com dono na diretoria financeira |

4. Monte a declaração de aplicabilidade a partir dos riscos, e não a partir da lista de controles. Para cada risco tratado, marque o controle, o dono e a evidência. Controles marcados como não aplicáveis precisam de justificativa aceita pelo dono do risco.
5. Prepare a evidência antes de contratar a auditoria. No exemplo, três ciclos internos de avaliação de risco, uma auditoria interna completa e uma análise crítica pela direção antes da primeira auditoria de certificação.
6. Contrate o organismo de certificação e confirme a acreditação. O certificado é do escopo declarado, e o cliente que abrir a cláusula de escopo encontrará o Centro de Distribuição Norte fora dele.

### 5.4 Problema de completar

Complete o escopo de uma empresa de saúde com três hospitais, um prontuário eletrônico próprio e um serviço de agendamento por aplicativo. O objetivo é certificar apenas o que serve clientes de planos de saúde, em 9 meses.

1. Frase de escopo, com nome próprio: ______
2. Um item dentro do escopo e sua justificativa: ______
3. Um item deliberadamente fora, com justificativa e data de reavaliação: ______
4. Uma dependência fora do escopo que exige cláusula contratual, com o nome da cláusula: ______
5. Quem assina a declaração de aplicabilidade e quem aprova o critério de aceitação de risco: ______

Regra de conferência: escopo sem exclusão justificada costuma significar que a primeira auditoria vai encontrar o que não estava preparado; escopo com exclusão da dependência crítica costuma significar certificado que não descreve a realidade.

## 6. Por que isso importa para o CISO

O sistema de gestão transforma decisões dispersas em um ativo negociável. Em licitações, o certificado com escopo claro substitui dezenas de páginas de questionário de fornecedor; sem escopo claro, ele vira passivo, porque o cliente vai auditar e vai encontrar a diferença. Em contrato de seguro, o registro de risco e o critério de aceitação são o que sustenta a conversa sobre cobertura.

Há um ganho interno menos citado. O sistema de gestão obriga a empresa a escrever o método de avaliação de risco e a manter registro do que foi aceito e por quem. Com esse registro, a resposta ao regulador em caso de incidente deixa de ser reconstrução de memória e passa a ser consulta a documento aprovado.

## 7. Aplicação prática

Escolha um serviço seu e faça o exercício em duas semanas.

1. Escreva o escopo em uma frase com nome próprio, serviço, localidades e sistemas.
2. Liste as quatro dependências de fora do escopo e classifique cada uma: contrato, risco aceito ou migração.
3. Rascunhe a primeira versão da declaração de aplicabilidade para 10 riscos do seu registro, com dono e evidência. Os riscos que você não conseguir ligar a nenhum controle são a lista de trabalho do próximo trimestre.
4. Verifique se a sua empresa tem interesse comercial real em certificar. Se a resposta for vender para grandes clientes ou para o setor público, siga; se a resposta for melhorar o programa, o mesmo esforço aplicado ao [TEMA-05](TEMA-05-frameworks-nist-csf-2-cis-controls.md) costuma render mais rápido, sem a obrigação de manter evidência de todos os requisitos.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre a diferença entre a norma de requisitos e a norma de controles, uma sobre por que a auditoria do cliente encontra o que ficou fora do escopo, e uma sobre o que o certificado prova e não prova.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| ISO/IEC 27001 é uma lista de controles | O catálogo de controles com orientação de implementação está na ISO/IEC 27002:2022, que não é certificável | 27001 define requisitos do sistema; 27002 orienta os controles que a declaração de aplicabilidade seleciona |
| Certificado ISO/IEC 27001 prova conformidade com a LGPD | O objeto do sistema de gestão é risco de segurança da informação, não a legalidade do tratamento de dado pessoal | São dois sistemas e dois conjuntos de evidência; a ABNT mantém formação específica sobre gestão de privacidade alinhada à LGPD |
| O escopo pode ser a empresa inteira quando só parte está pronta | A exclusão de qualquer requisito das seções 4 a 10 não é aceitável para quem busca conformidade | O escopo é declarado com nome próprio; o que fica fora recebe justificativa, dono e data de reavaliação |
| Contratar auditoria antes de rodar o ciclo interno é mais rápido | Sem um ciclo interno completo não existe evidência de operação, apenas de intenção | Auditoria interna e análise crítica pela direção acontecem antes da auditoria de certificação |
| Certificação encerra o projeto | O certificado vale por um período e o acompanhamento é contínuo | O sistema vive por ciclos; a manutenção do certificado exige auditorias de acompanhamento |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a edição, a data de publicação e o número de páginas da ISO/IEC 27001:2022, e o que mudou na emenda de 2024?
2. Qual documento da família orienta os controles e por que ele não gera certificado?
3. O que o catálogo oficial da ABNT diz sobre excluir requisitos das seções 4 a 10?
4. Segundo a página oficial da ISO, quantos certificados foram reportados e em quantos países, e com base em qual levantamento?
5. Cite três itens que costumam ficar fora do escopo e o que a empresa deve fazer com eles.

<details>
<summary>Conferir respostas</summary>

1. Edição 3, publicada em 25 de outubro de 2022, 19 páginas; a `Amd 1:2024` trata de ação climática.
2. ISO/IEC 27002:2022, edição 3, publicada em 15 de fevereiro de 2022, 152 páginas, com orientação sobre controles genéricos e implementação. Ela não é certificável; a certificação se dá na 27001, que a referencia.
3. Que a exclusão de qualquer requisito das seções 4 a 10 não é aceitável quando a organização busca conformidade com o documento.
4. Mais de 70.000 certificados reportados em 150 países, conforme o ISO Survey 2022, segundo a página oficial do padrão.
5. Unidades que não operam o serviço, serviços compartilhados como identidade corporativa e sistemas administrativos. Cada um recebe decisão registrada com justificativa, dono, risco associado e data de reavaliação; dependências críticas geram exigência contratual de auditoria e notificação.

</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever a frase de escopo de um serviço da sua empresa e as exclusões justificadas | Rebaixar: repetir em D+3 |
| D+30 | Montar a declaração de aplicabilidade de 10 riscos reais, com dono e evidência | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 08-cloud#TEMA-06 | a exigência do ISMS só chega ao fornecedor se estiver no contrato e na cláusula de auditoria; destino planejado |
| complementa | 02-governanca-risco-compliance#TEMA-05 | o ISMS exige o sistema de gestão; o framework de controles fornece o catálogo de onde saem as escolhas que a declaração de aplicabilidade registra |
| complementa | 17-lideranca-ciso#TEMA-06 | o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes |
| nao_confundir_com | 14-dados-privacidade#TEMA-06 | certificado de segurança da informação não atesta a legalidade do tratamento de dado pessoal; são dois sistemas de gestão com objetos diferentes; destino planejado |

## 13. Certificações e leitura recomendada

O domínio 3 do CISM, Information Security Program, responde por 33% das questões e inclui normas e frameworks do setor, desenho e seleção de controles, implementação, e teste e avaliação de controles ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). O catálogo oficial da ABNT lista formação de Lead Implementer baseada na ABNT NBR ISO/IEC 27001:2022 e na ABNT NBR ISO/IEC 27002:2022 ([abntcatalogo.com.br](https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0=), acessado em 2026-09-25). Custo, validade e exigências de cada credencial ficam em [90-certificacoes/](../90-certificacoes/README.md).

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Program | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | ISO/IEC 27001:2022 — Requirements | primaria | https://www.iso.org/standard/27001 | "2026-09-25" | alta |
| 2 | ISO/IEC 27002:2022 — Information security controls | primaria | https://www.iso.org/standard/75652.html | "2026-09-25" | alta |
| 3 | ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023 — catálogo ABNT | primaria | https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0= | "2026-09-25" | alta |
| 4 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a contagem de controles do Anexo A e os temas em que se organizam; o texto das seções 4 a 10 e a lista normativa de informações documentadas exigidas; a duração e o ciclo de auditoria de certificação, que seguem documentos obrigatórios do IAF; e o número de certificados ISO/IEC 27001 emitidos no Brasil.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-apetite-tolerancia-risco.md) |
| Próximo tema | [TEMA-05](TEMA-05-frameworks-nist-csf-2-cis-controls.md) |
| Home | [README](../README.md) |
