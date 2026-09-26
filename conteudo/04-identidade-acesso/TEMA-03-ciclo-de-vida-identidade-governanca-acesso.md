---
tema: "Ciclo de vida da identidade e governança de acesso"
tema_id: "TEMA-03"
area_id: "04-identidade-acesso"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Projetar o fluxo de entrada, mudança e saída de acesso de uma organização, declarando a fonte da verdade, o prazo de retirada e a evidência que fica arquivada"
atende_objetivo: [4]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "04-identidade-acesso#TEMA-04"
      motivo: "o processo que cria e retira acesso é o que a revisão periódica verifica; sem fluxo declarado, a recertificação vira conferência de lista sem critério"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "a prova de que contas nascem e morrem com autorização registrada é evidência de auditoria e matéria de reporte ao comitê"
    - alvo: "15-fatores-humanos#TEMA-03"
      motivo: "a retirada de acesso no desligamento só executa no prazo se o gestor e o RH agirem; sem isso a norma de saída não sai do documento; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "Microsoft Entra ID Governance — What is Microsoft Entra ID Governance"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "IETF RFC 7644 — System for Cross-domain Identity Management: Protocol, Standards Track, setembro de 2015"
    url: "https://datatracker.ietf.org/doc/rfc7644/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline, Domain 5, subtema 5.5, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "OWASP Secrets Management Cheat Sheet — rotação de credencial de usuário e auditoria do segredo"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Ciclo de vida da identidade e governança de acesso

Uma ideia central: acesso não é um evento de cadastro, é um processo com estados, e a governança de identidade existe para que cada estado tenha gatilho, dono e prova.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: desenhar o fluxo de entrada, mudança e saída de acesso de uma organização, nomeando a fonte da verdade de cada atributo, o prazo de retirada de cada tipo de acesso e a evidência que fica arquivada para auditoria.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-autenticacao-fatores-mfa-fido2.md) vem antes porque o ciclo de vida define quais autenticadores precisam ser inscritos, substituídos e revogados. O [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) dá o vocabulário de papel, atributo e concessão que este tema movimenta.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quando alguém é desligado na sua empresa, em quantos sistemas o acesso é retirado, e quem executa cada um? Anote o número e o nome.
   Confiança: ___
2. Palpite: qual sistema decide hoje quem trabalha na empresa para fins de acesso — RH, folha ou a planilha do gestor? Aposte.
   Confiança: ___
3. Antes de ler: existe conta de aplicação na sua empresa sem correspondência no diretório? Quantas, no seu palpite.
   Confiança: ___

## 4. Caso real

A documentação do Microsoft Entra ID Governance descreve o ciclo de vida da identidade ancorado no sistema de gestão de capital humano como origem, com fluxos que rodam em eventos: antes da data de início, em mudança de situação e na saída. O mesmo conjunto de recursos inclui políticas de atribuição automática em pacotes de acesso por mudança de atributo, revisões de acesso recorrentes e uma rotina para descobrir contas órfãs ou locais nas aplicações. A documentação também registra que a gestão de direitos remove o convidado externo do diretório quando o acesso expira ou é revogado.

O caso deixa uma pergunta aberta: se o sistema de RH é a origem declarada, o que acontece com as contas que não têm correspondência nele, como terceiros, contas de serviço e identidades locais de aplicação, que costumam ser a maior parte da população sem dono.

## 5. Conteúdo

### 5.1 Conceito

Governança de identidade é o conjunto de processos que responde a quatro perguntas, conforme a descrição do produto da Microsoft: quais identidades devem ter acesso a quais recursos, o que essas identidades fazem com o acesso, se existem controles organizacionais para gerir o acesso e se o auditor consegue verificar que os controles funcionam. As quatro perguntas servem como teste de maturidade: um programa que responde só a primeira tem cadastro, não tem governança.

O ciclo de vida tem três momentos clássicos e um quarto que costuma ficar de fora. Entrada é a criação da identidade e a concessão inicial. Mudança é a alteração de função, unidade, gestor ou vínculo, e é onde a maior parte do excesso de acesso nasce, porque conceder é fácil e retirar depende de alguém lembrar. Saída é a retirada, que precisa ocorrer em prazo declarado e comprovável. O quarto momento é a permanência: conta de serviço, conta de terceiro e identidade de aplicação, que não entram por processo de admissão e por isso escapam do fluxo.

Três objetos precisam ser separados na cabeça de quem desenha o processo. Identidade é a representação da pessoa ou do agente. Conta é o objeto autenticável ligado a essa identidade, e uma pessoa pode ter várias. Concessão, em inglês entitlement, é o direito concreto: a associação a um grupo, o papel em uma aplicação, a permissão em um recurso. A retirada de acesso acontece no nível da concessão, e a exclusão da conta é decisão separada, porque a trilha de auditoria depende de a conta continuar existindo por prazo definido.

### 5.2 Como funciona

O motor do processo é a fonte da verdade. Cada atributo usado em decisão de acesso deve ter um sistema declarado como origem e um caminho de propagação. Declarar o RH como origem de "quem trabalha aqui" e de "qual é a função" basta para disparar criação e alteração; declarar o gestor como origem de "qual carteira" permite negar por padrão quando o dado está ausente. Sem fontes declaradas, o acesso é mantido por evento manual e a auditoria não consegue reconstruir o caminho da autorização.

A automação entre sistemas usa, na maior parte dos casos, o SCIM. O RFC 7644 define um protocolo HTTP de provisão e gestão de identidade em cenários multi-domínio, com esquema comum de usuário, modelo de extensão e protocolo de serviço, endpoints para usuários, grupos, configuração e esquema, além de operação em lote. Dois detalhes operacionais do protocolo são úteis para o desenho: o provedor deve mapear o cliente autenticado a uma política de controle de acesso, e a exclusão de recurso devolve resposta sem conteúdo, com operações posteriores retornando não encontrado. O protocolo depende de TLS e de esquemas padrão de autenticação HTTP, e a própria especificação desaconselha autenticação básica, por ser fator único baseado em segredo estático.

A revisão periódica e o pacote de acesso são os instrumentos de manutenção. Revisão de acesso faz o dono do recurso confirmar, em ciclo definido, quem deve manter o acesso e quem perde. Pacote de acesso agrupa concessões, define aprovação, prazo e revisão obrigatória, e remove o que expirou. Os dois instrumentos só funcionam com consequência: revisão sem prazo de resposta e sem remoção automática do que não foi confirmado produz assinatura sem redução de risco.

Há um ponto que quase sempre fica para trás: a credencial do usuário e a credencial de máquina não seguem a mesma regra de rotação. O guia de gestão de segredos do OWASP registra que credenciais de usuário ficam fora da rotação periódica e são trocadas apenas quando há suspeita ou evidência de comprometimento, conforme recomendação do NIST, enquanto segredos de aplicação seguem ciclo de criação, rotação, revogação e expiração. Aplicar a regra errada no lugar errado aumenta trabalho e piora a qualidade das escolhas.

### 5.3 Exemplo resolvido

Empresa com 3.000 empregados, quatro unidades, 180 aplicações e uma planilha de acessos revisada a cada semestre.

Passo 1: declarar a fonte da verdade. RH é origem de vínculo, função, unidade e gestor. O diretório recebe esses atributos por provisão de entrada. Aplicação não é fonte de verdade de nada que decida acesso.

Passo 2: desenhar a entrada. A conta é criada a partir de sinal do RH com antecedência de dois dias úteis, recebe atributos, entra nos grupos derivados da função e da unidade, e o autenticador é inscrito antes do primeiro dia. Nada de pacote individual de admissão.

Passo 3: desenhar a mudança. Mudança de função dispara remoção das concessões do papel anterior e concessão das do novo papel, no mesmo evento. Concessões fora de papel, chamadas exceções, expiram em 90 dias e precisam de novo pedido com justificativa.

Passo 4: desenhar a saída. No desligamento, a conta é desativada no mesmo dia, as sessões são encerradas e os tokens são invalidados, as concessões são removidas e a propriedade de artefatos é transferida. A exclusão da conta ocorre após o prazo de retenção definido pela área jurídica, para não destruir trilha de auditoria.

Passo 5: cobrir o que não vem do RH. Terceiro entra com prazo declarado e remove-se ao expirar. Conta de serviço tem dono nomeado, finalidade descrita e revisão semestral. Conta local de aplicação entra no inventário de descoberta e é migrada ou desativada.

Passo 6: definir a evidência. Cada passo grava registro com data, quem autorizou e qual atributo disparou a mudança. A evidência da auditoria é a consulta que mostra, para uma pessoa sorteada, todos os acessos concedidos e retirados nos últimos 12 meses.

Passo 7: medir. Três indicadores bastam para começar: prazo médio de retirada de acesso em desligamentos, percentual de concessões sem pedido registrado e número de contas sem dono nomeado.

### 5.4 Problema de completar

Uma empresa tem 400 fornecedores e consultores com acesso a duas aplicações internas. O acesso é pedido por e-mail ao gestor da área e concedido pelo time de infraestrutura, sem prazo.

Passo 1: identificar a fonte da verdade para a existência do vínculo do terceiro e o atributo que representa a data de término do contrato.

Passo 2: transformar o pedido por e-mail em pedido registrado com aprovador nomeado e data de expiração.

Passo 3: definir o prazo máximo de acesso para terceiro e a rotina de renovação.

Passo 4: definir o que acontece com a conta quando o contrato é renovado e quando é encerrado antes do prazo.

Passo 5: desenhar a consulta que lista terceiros ativos com data de expiração vencida.

Passo 6: definir o relatório trimestral para a área que patrocina o contrato.

## 6. Por que isso importa para o CISO

A conta sem dono é o item que mais aparece em achado de auditoria e o mais barato de resolver. O produto de governança de identidade já oferece descoberta de contas órfãs e locais nas aplicações, o que significa que o trabalho deixou de ser invenção e passou a ser configuração mais processo. Em uma primeira auditoria de certificação, a pergunta costuma ser objetiva: mostre o processo de desligamento, mostre o prazo e mostre a evidência de dez casos.

O efeito no orçamento é indireto e relevante. Se o custo de uma conta é licença, o processo de retirada é redução de despesa recorrente, argumento que sobrevive à troca de gestão. Se o custo de uma conta é risco, o argumento é o tempo de permanência de acesso indevido, que é o indicador que o comitê de risco entende.

Há ainda a dimensão de quem assina. Uma revisão de acesso em que ninguém perde o acesso comunica ao comitê que o controle existe no papel. O CISO que quer preservar credibilidade usa a taxa de remoção como medida de saúde do processo, não apenas a taxa de preenchimento do formulário.

## 7. Aplicação prática

Escolha uma pessoa que saiu da empresa no último trimestre e reconstrua, por escrito, a linha do tempo: data da rescisão, data de desativação da conta, data de remoção das concessões e data de exclusão. Se a linha do tempo não puder ser reconstruída, o problema não é a ferramenta, é a fonte da verdade.

Repita o exercício com uma pessoa que mudou de área. A diferença entre os dois casos costuma mostrar que a saída tem processo e a mudança não tem, e é na mudança que o excesso de acesso se acumula.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, quem é a fonte da verdade de acesso na sua empresa e o que dispara a retirada quando alguém sai. Se a resposta citar uma pessoa e não um sistema, o processo depende de memória.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Desativar a conta encerra o acesso | Sessão e token já emitidos continuam válidos até expirar | Desativar a conta, encerrar sessões e invalidar tokens no mesmo evento |
| Excluir a conta é o passo mais seguro da saída | A exclusão destrói a trilha necessária para auditoria e para investigação | Retirar concessões na saída e excluir a conta após o prazo de retenção |
| Cadastro inicial cobre o ciclo de vida | A concessão feita na entrada raramente corresponde à função após dois anos | Retirar a concessão do papel anterior na mesma mudança que concede a nova |
| Terceiro é caso especial demais para automatizar | Terceiro sem prazo é a maior fonte de acesso esquecido | Exigir prazo declarado, aprovação registrada e rotina de expiração |
| Rotação periódica de senha de usuário melhora a postura | O guia de segredos orienta trocar credencial de usuário apenas com indício de comprometimento | Reservar rotação periódica para segredos de aplicação e de serviço |
| Revisão de acesso é conferência de lista | Sem remoção automática do que não foi confirmado, a revisão não muda o estado | Vincular a revisão a prazo e à remoção do que não foi reafirmado |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as quatro perguntas que a governança de identidade responde, segundo a documentação do Entra ID Governance?
2. Qual é a diferença entre identidade, conta e concessão?
3. O que o RFC 7644 define e de que autenticação o protocolo depende?
4. Por que a mudança de função concentra mais risco do que a admissão?
5. Quais registros mínimos a auditoria precisa para provar a retirada de acesso?
6. O que fazer com a conta local de uma aplicação que não tem correspondência no diretório?

<details>
<summary>Conferir respostas</summary>

1. Quais identidades devem ter acesso a quais recursos, o que essas identidades fazem com o acesso, se existem controles organizacionais para gerir o acesso e se o auditor consegue verificar que os controles funcionam.
2. Identidade é a representação do sujeito; conta é o objeto autenticável ligado a ela, e pode haver mais de uma por identidade; concessão é o direito concreto sobre recurso, grupo ou papel.
3. O SCIM, protocolo HTTP de provisão e gestão de identidade em cenários multi-domínio, com esquema comum de usuário. Depende de TLS e de esquemas padrão de autenticação HTTP, e desaconselha autenticação básica.
4. Porque conceder é imediato e retirar depende de evento explícito. A admissão tem gatilho contratual; a mudança de área costuma ser acompanhada apenas da nova concessão.
5. Data e hora da ação, quem autorizou, qual evento disparou, quais concessões foram removidas e qual foi a origem do dado. Sem essas cinco informações não há como reconstruir o caminho.
6. Incluir no inventário de descoberta, nomear dono, descrever finalidade e decidir entre migrar para a identidade central ou desativar. Manter sem dono é a opção que não se sustenta em auditoria.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Reconstruir a linha do tempo de um desligamento real | Rebaixar: repetir em D+3 |
| D+30 | Escrever o fluxo de entrada, mudança e saída em uma página | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-06 | a prova de que contas nascem e morrem com autorização registrada é evidência de auditoria e matéria de reporte ao comitê |
| aplicado_em | 15-fatores-humanos#TEMA-03 | a retirada de acesso no desligamento só executa no prazo se o gestor e o RH agirem; sem isso a norma de saída não sai do documento; destino planejado, número provisório |
| complementa | 04-identidade-acesso#TEMA-04 | o processo que cria e retira acesso é o que a revisão periódica verifica; sem fluxo declarado, a recertificação vira conferência de lista sem critério |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 5, Identity and Access Management, subtema 5.5 Manage the identity and access provisioning lifecycle, com revisão de acesso, provisão e desprovisão, definição de papel e gestão de conta de serviço | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 5, subtema 5.3 Federated identity with a third-party service | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: o RFC 7644 para entender o que o protocolo padroniza e o que fica fora dele; a página de governança de identidade do Entra para ver o vocabulário de fluxo de ciclo de vida, pacote de acesso e revisão.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Microsoft Entra ID Governance — ciclo de vida ancorado no sistema de RH, fluxos por evento, pacotes de acesso, revisões, remoção de convidado expirado e descoberta de contas órfãs | primaria | https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview | "2026-09-25" | alta |
| 2 | IETF RFC 7644 — System for Cross-domain Identity Management: Protocol, Standards Track, setembro de 2015 | primaria | https://datatracker.ietf.org/doc/rfc7644/ | "2026-09-25" | alta |
| 3 | ISC2 CISSP Certification Exam Outline, Domain 5, subtemas 5.3 e 5.5 | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | "2026-09-25" | alta |
| 4 | OWASP Secrets Management Cheat Sheet — rotação de credencial de usuário apenas sob indício de comprometimento, com referência à recomendação do NIST | primaria | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) |
| Próximo tema | [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md) |
| Home | [README](../README.md) |
