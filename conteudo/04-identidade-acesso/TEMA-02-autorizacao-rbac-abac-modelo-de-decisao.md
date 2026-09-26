---
tema: "Autorização: RBAC, ABAC e o modelo de decisão"
tema_id: "TEMA-02"
area_id: "04-identidade-acesso"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Escrever o modelo de decisão de acesso de um serviço, com atributos, política e pontos de decisão e de execução, e testá-lo contra três mudanças de contexto"
atende_objetivo: [1, 3]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "01-fundamentos#TEMA-08"
      motivo: "o princípio do menor privilégio só se realiza no modelo de autorização, onde atributo, política e ponto de decisão o transformam em decisão executável"
  aprofundado_por: []
  aplicado_em:
    - alvo: "09-aplicacoes-devsecops#TEMA-06"
      motivo: "o modelo de decisão vira escopo de token e checagem no gateway de API, que é onde a autorização encosta no código; destino planejado, número provisório"
  nao_confundir_com:
    - alvo: "04-identidade-acesso#TEMA-01"
      motivo: "autenticação prova quem é o sujeito; autorização decide o que ele pode fazer sobre qual recurso; confundir as camadas faz a empresa comprar mais fator para resolver problema de política"
fontes:
  - titulo: "NIST SP 800-162 — Guide to Attribute Based Access Control, janeiro de 2014 com atualizações de 02/08/2019"
    url: "https://csrc.nist.gov/pubs/sp/800/162/upd2/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — least privilege, conforme CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5"
    url: "https://csrc.nist.gov/glossary/term/least_privilege"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline, Domain 5, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Entra Privileged Identity Management — atribuição por escopo e proteção da última atribuição administrativa"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "OWASP Authentication Cheat Sheet — OAuth como estrutura de autorização e OIDC como camada de autenticação"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Autorização: RBAC, ABAC e o modelo de decisão

Uma ideia central: autorização é a decisão de permitir ou negar uma operação sobre um recurso, e essa decisão precisa viver em um lugar identificável, onde se possa perguntar quem a toma, com base em quais dados e onde ela é aplicada.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: escrever o modelo de decisão de acesso de um serviço, declarando os atributos usados, a política que os combina, o ponto onde a decisão é tomada e o ponto onde ela é aplicada, e demonstrar o comportamento do modelo em três mudanças de contexto: troca de função, troca de unidade e acesso fora do horário.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-autenticacao-fatores-mfa-fido2.md) vem antes: sem sujeito autenticado não existe decisão de autorização que valha, e o desenho da política depende de quanto se pode confiar na identidade apresentada.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quem decide hoje na sua empresa se alguém pode exportar a base de clientes — o diretório, a aplicação ou uma planilha de aprovação? Aposte.
   Confiança: ___
2. Palpite: quantos papéis existem no seu diretório? Anote uma ordem de grandeza antes de pedir a lista.
   Confiança: ___
3. Antes de ler: retirar um grupo do usuário e retirar o direito que aquele grupo concedia dão o mesmo resultado? Escolha sim ou não.
   Confiança: ___

## 4. Caso real

O Microsoft Entra Privileged Identity Management mantém um controle específico para impedir a remoção da última atribuição ativa de Global Administrator e de Privileged Role Administrator. A existência desse controle documenta um fato que vale para qualquer plataforma: o modelo de autorização não protege apenas quem pede acesso, protege também o próprio sistema contra ficar sem administrador. Ao mesmo tempo, o produto limita a atribuição por escopo, ou seja, uma mesma função pode valer em todo o diretório ou apenas no conjunto de recursos declarado.

O caso deixa a pergunta aberta: quantas regras do seu modelo de autorização hoje moram em planilha, e-mail de aprovação e memória de gestor, fora de qualquer motor que possa ser consultado, testado e auditado.

## 5. Conteúdo

### 5.1 Conceito

Autorização decide o que um sujeito autenticado pode fazer. O vocabulário de modelos vem, na maior parte, de três tradições nomeadas no CISSP: controle de acesso discricionário, em que o dono do recurso decide quem entra; controle de acesso obrigatório, em que rótulos do recurso e do sujeito definem a permissão e o dono não pode contrariar o rótulo; e controle de acesso baseado em papel, em que a permissão é dada a um papel e o papel é dado à pessoa.

O controle de acesso baseado em atributos é definido pelo NIST SP 800-162 como metodologia lógica em que a autorização para executar um conjunto de operações é determinada avaliando atributos do sujeito, do objeto e das operações pedidas e, em alguns casos, condições de ambiente, contra política, regras ou relações que descrevem as operações permitidas para aquele conjunto de atributos. A definição é útil porque não opõe ABAC a RBAC: papel é atributo, e a maior parte das implementações chamadas de ABAC usa papel como um dos atributos avaliados.

Menor privilégio aparece em três definições no glossário do NIST, e as três apontam para a mesma exigência operacional: cada entidade recebe o mínimo de recursos e autorizações de sistema necessários para cumprir sua função. A primeira formula como princípio de restrição do acesso ao mínimo necessário para as tarefas designadas; a segunda e a terceira falam de arquitetura desenhada para que cada entidade receba o mínimo. A diferença entre as duas formulações importa: a segunda cobra o desenho, não a boa intenção.

### 5.2 Como funciona

O modelo de decisão tem quatro partes, e dar nome a cada uma resolve a maior parte das discussões travadas.

A primeira é o ponto de decisão de política, onde a pergunta "esta operação é permitida?" é respondida. A segunda é o ponto de execução de política, onde a resposta vira permitir ou bloquear no caminho do pedido. A terceira são os atributos e as fontes de onde eles vêm: o diretório fornece papel e unidade, o catálogo de dados fornece classificação, o dispositivo fornece estado de conformidade, o relógio fornece horário. A quarta é a política, que combina tudo isso em regras com precedência declarada.

O CISSP lista os modelos que um programa precisa dominar, incluindo baseado em papel, baseado em regra, obrigatório, discricionário, baseado em atributo e baseado em risco, e cita explicitamente o ponto de decisão e o ponto de execução de política como itens de aplicação da política de acesso. A consequência prática: quando alguém pergunta "onde isso é decidido", deve existir uma resposta com nome de componente, não uma pessoa.

Duas falhas previsíveis aparecem em quase toda implantação. A primeira é a explosão de papéis: cada pedido especial vira um papel novo, e em dois anos existem 800 papéis, 300 deles usados por uma pessoa. A segunda é a herança esquecida: a pessoa entra em um grupo por razão temporária, o grupo concede direitos por inclusão aninhada, e ninguém sabe o alcance total do que foi concedido. Papel e atributo resolvem partes diferentes: papel serve para o que é estável na função; atributo serve para o que muda por contexto, como unidade, carteira, classificação do dado e horário.

Vale um cuidado com autenticação de API. O OWASP é explícito: OAuth é estrutura de autorização para acesso delegado a APIs, e OpenID Connect é camada de identidade sobre OAuth, usada quando o objetivo é autenticar. No mundo de API, a autorização vira escopo de token e validação de público, emissor e assinatura. O RFC 7644 reforça o princípio em outro contexto: o provedor de serviço precisa mapear o cliente autenticado a uma política de controle de acesso, e é normal que o sujeito possa ler e alterar o próprio recurso e não os de terceiros.

### 5.3 Exemplo resolvido

Serviço: consulta e exportação de cadastro de clientes em uma instituição financeira. Atributos disponíveis: papel no diretório, unidade de lotação, carteira de clientes atribuída, classificação do registro, hora do pedido e estado do dispositivo.

Passo 1: definir a decisão mínima em papel. Papéis "analista de crédito", "auditoria interna" e "atendimento" recebem, respectivamente, leitura de cadastro, leitura de cadastro e trilha, e leitura de dados de contato. Nenhum deles recebe exportação.

Passo 2: refinar com atributos. O analista de crédito lê o cadastro do cliente se o cliente pertence à carteira atribuída a ele e a unidade do analista é a mesma do registro. Auditoria lê qualquer registro, mas sem exportação e com registro de auditoria obrigatório.

Passo 3: declarar a regra de contexto. Exportação exige aprovação registrada em pedido, limite de volume por hora e dispositivo em conformidade. A decisão fica negada por padrão quando o atributo de dispositivo está ausente, porque atributo ausente não é atributo permissivo.

Passo 4: escrever a precedência. Negar vence permitir; exceção individual vence papel; política de contexto nunca amplia, apenas restringe. Precedência precisa estar escrita em uma frase, porque a maior parte das discussões de autorização acontece quando alguém descobre que a implementação resolveu o conflito ao contrário do que a área imaginava.

Passo 5: testar contra três mudanças de contexto. Troca de função: o atributo de papel muda e a carteira permanece, então a decisão muda apenas nas operações do novo papel. Troca de unidade: o atributo de unidade muda e a carteira não pertence mais à unidade, então a leitura passa a negar até que a carteira seja transferida, o que expõe uma dependência de processo que ninguém havia declarado. Acesso às 23h de um sábado: a regra de contexto restringe, sem alterar papel nem carteira.

Passo 6: declarar segregação de função. Quem pede o limite de crédito não aprova o próprio pedido, e as duas permissões não podem coexistir no mesmo papel. O CISSP coloca segregação de função entre os princípios de projeto seguro, e ela só é verificável se o modelo permitir consultar as combinações existentes.

### 5.4 Problema de completar

Um mesmo serviço passa a atender duas empresas do grupo, e o diretório contém pessoas das duas.

Passo 1: identificar o atributo que hoje distingue as duas empresas e verificar se ele existe no diretório.

Passo 2: verificar se a política atual usa esse atributo ou se ela usa o nome do grupo, que é o único lugar onde a distinção aparece hoje.

Passo 3: escrever a nova regra de leitura, incluindo o caso em que a pessoa atende as duas empresas.

Passo 4: definir o que acontece com quem não tem o atributo preenchido.

Passo 5: desenhar o teste que prova o comportamento quando o atributo muda de valor.

Passo 6: definir quem aprova a exceção de quem atende as duas empresas e por quanto tempo ela vale.

## 6. Por que isso importa para o CISO

A conversa sobre autorização é onde o CISO consegue mostrar diferença entre postura e evidência. Postura é dizer que a empresa aplica menor privilégio; evidência é apresentar a lista de papéis, a política do ponto de decisão e a consulta que mostra quantas pessoas têm permissão de exportação. A segunda versão sobrevive a auditoria externa e a questionário de cliente.

Verba também depende desse modelo. Sem ponto de decisão centralizado, cada pedido de acesso se transforma em mudança em aplicação, com prazo de fábrica e teste de regressão. Com o modelo declarado, a maior parte dos pedidos vira configuração, e a discussão desloca para o risco de a política estar errada, que é uma conversa melhor.

Existe ainda o efeito sobre o desenho de produto interno. Quando o atributo de carteira existe no diretório, o sistema de crédito consegue negar por padrão. Quando esse atributo só existe na aplicação, a mesma regra precisa ser reimplementada em cada sistema, e a chance de divergência cresce com o número de sistemas.

## 7. Aplicação prática

Escolha o sistema mais crítico da empresa e responda por escrito a quatro perguntas em uma página: onde a decisão de acesso é tomada, onde ela é aplicada, quais atributos são usados e qual é a regra de precedência. Depois peça a lista de papéis e conte quantos existem, quantos têm uma única pessoa e quantos nunca foram usados nos últimos 90 dias. As três contagens costumam justificar sozinhas a priorização do próximo trimestre.

Se o sistema não permitir exportar a lista, faça a versão manual com dez pessoas de funções diferentes: peça a cada uma para listar os sistemas que acessa e a operação que executa. Compare com o que o gestor autorizou. A diferença entre as duas listas é o retrato do acesso efetivo.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, onde a decisão de acesso do seu sistema principal é tomada e o que aconteceria se a pessoa mudasse de unidade na próxima segunda-feira. Se você não conseguir nomear o componente que decide, a resposta ainda está na seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| ABAC substitui RBAC | Papel é atributo; a definição do NIST trata atributo como dado avaliado, e papel é um deles | Usar papel para o que é estável e atributo para o que muda por contexto |
| Criar um papel por pedido especial | Gera explosão de papéis e perde a capacidade de revisar quem tem o quê | Usar atributo ou exceção com prazo, dono e revisão |
| Excluir o usuário do grupo equivale a retirar o acesso | A concessão pode vir por aninhamento, por outro grupo ou por atributo do diretório | Verificar o direito efetivo no ponto de decisão, não a associação |
| O ponto de execução é o único ponto relevante | Sem ponto de decisão identificável não existe política única, apenas regras espalhadas | Nomear quem decide e quem aplica, e documentar a precedência |
| Escopo de papel é detalhe de produto | Sem escopo, um papel válido em todo o diretório concede mais do que a função exige | Declarar o escopo de cada atribuição, como o PIM faz ao limitar o papel a um conjunto de recursos |
| Autorização em API é só token válido | Token válido prova autenticação na origem, não que a operação é permitida naquele recurso | Validar assinatura, emissor e público, e checar a política do recurso |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a definição de ABAC do NIST SP 800-162?
2. Qual é a diferença entre ponto de decisão de política e ponto de execução de política?
3. Como o glossário do NIST define menor privilégio e quantas definições aparecem na mesma entrada?
4. Por que papel e atributo resolvem partes diferentes do problema de autorização?
5. O que o OWASP diz sobre a diferença entre OAuth e OpenID Connect?
6. Que precaução um modelo de autorização precisa tomar quando o atributo usado na regra não está preenchido?

<details>
<summary>Conferir respostas</summary>

1. Metodologia lógica de controle de acesso em que a autorização para executar um conjunto de operações é determinada pela avaliação de atributos do sujeito, do objeto e das operações pedidas e, em alguns casos, de condições de ambiente, contra política, regras ou relações que descrevem as operações permitidas.
2. O ponto de decisão responde se a operação é permitida; o ponto de execução aplica a resposta no caminho do pedido, liberando ou bloqueando.
3. Cada entidade recebe o mínimo de recursos e autorizações de sistema necessários para cumprir sua função. A entrada do glossário traz três definições, com origem em CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5.
4. Papel descreve o que é estável na função e serve para revisão e recertificação; atributo descreve contexto, como unidade, carteira, classificação e horário, e permite negar por padrão sem multiplicar papéis.
5. OAuth é estrutura de autorização para acesso delegado a APIs; OpenID Connect é camada de identidade sobre OAuth, usada para autenticar o usuário final e obter declarações de forma interoperável.
6. Tratar atributo ausente como negação. Atributo não preenchido não pode ser interpretado como permissão, sob pena de a política liberar acesso justamente para a população sem cadastro completo.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Desenhar em uma página o modelo de decisão de um sistema real | Rebaixar: repetir em D+3 |
| D+30 | Testar o modelo contra troca de função e troca de unidade | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 09-aplicacoes-devsecops#TEMA-06 | o modelo de decisão vira escopo de token e checagem no gateway de API, que é onde a autorização encosta no código; destino planejado, número provisório |
| complementa | 01-fundamentos#TEMA-08 | o princípio do menor privilégio só se realiza no modelo de autorização, onde atributo, política e ponto de decisão o transformam em decisão executável |
| nao_confundir_com | 04-identidade-acesso#TEMA-01 | autenticação prova quem é o sujeito; autorização decide o que ele pode fazer sobre qual recurso; confundir as camadas faz a empresa comprar mais fator para resolver problema de política |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 5, Identity and Access Management, subtema 5.4 Implement and manage authorization mechanisms, e 5.1 Control physical and logical access to assets | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 3, Security Architecture and Engineering, subtema 3.1, que lista separação de função e menor privilégio entre os princípios de projeto | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: o resumo do SP 800-162 é curto e vale a leitura integral; a seção 5.4 do outline do CISSP dá o vocabulário de modelos esperado em banca.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-162 — Guide to Attribute Based Access Control (ABAC) Definition and Considerations, janeiro de 2014, com atualizações de 02/08/2019, família de controle Access Control | primaria | https://csrc.nist.gov/pubs/sp/800/162/upd2/final | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — least privilege, com definições de CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5 | primaria | https://csrc.nist.gov/glossary/term/least_privilege | "2026-09-25" | alta |
| 3 | ISC2 CISSP Certification Exam Outline, Domain 5, subtemas 5.1 e 5.4, e Domain 3, subtema 3.1 | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | "2026-09-25" | alta |
| 4 | Microsoft Entra Privileged Identity Management — escopo de atribuição e proteção da última atribuição ativa de administrador global | primaria | https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure | "2026-09-25" | alta |
| 5 | OWASP Authentication Cheat Sheet — OAuth como estrutura de autorização, OIDC como camada de identidade, validação de token | primaria | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | "2026-09-25" | alta |
| 6 | IETF RFC 7644 — mapeamento do cliente autenticado a política de controle de acesso e acesso ao próprio recurso | primaria | https://datatracker.ietf.org/doc/rfc7644/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-autenticacao-fatores-mfa-fido2.md) |
| Próximo tema | [TEMA-03](TEMA-03-ciclo-de-vida-identidade-governanca-acesso.md) |
| Home | [README](../README.md) |
