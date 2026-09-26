---
tema: "Zero trust: identidade como novo perímetro"
tema_id: "TEMA-06"
area_id: "04-identidade-acesso"
nivel: avancado
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Avaliar a arquitetura de acesso de uma organização contra os pressupostos do NIST SP 800-207, listando as decisões que hoje usam apenas a localização de rede como condição de confiança"
atende_objetivo: [6]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-01", "TEMA-02", "TEMA-04"]
relacoes:
  complementa:
    - alvo: "03-arquitetura-engenharia#TEMA-04"
      motivo: "zero trust na identidade e zero trust na arquitetura são as duas metades do mesmo padrão: uma prova quem é e qual é o estado do dispositivo, a outra decide o que o desenho protege e o que contém o dano"
  aprofundado_por: []
  aplicado_em:
    - alvo: "08-cloud#TEMA-02"
      motivo: "a política de identidade do provedor de nuvem é onde a decisão por recurso do zero trust vira configuração executável; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-207 — Zero Trust Architecture, publicado em agosto de 2020"
    url: "https://csrc.nist.gov/pubs/sp/800/207/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-63B-4 — Authentication Assurance Levels"
    url: "https://pages.nist.gov/800-63-4/sp800-63b/aal/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline, Domain 3 e Domain 4, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Entra ID Governance — referência a configurações de identidade e acesso a dispositivos para zero trust"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Zero trust: identidade como novo perímetro

Uma ideia central: zero trust remove a localização de rede do papel de prova de confiança, e o que fica no lugar dessa prova é a autenticação e a autorização de sujeito e de dispositivo, executadas em cada acesso ao recurso.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: avaliar a arquitetura de acesso da sua organização contra os pressupostos do NIST SP 800-207, entregando uma lista das decisões que hoje usam apenas a localização de rede como condição de confiança, com o controle que substitui cada uma e a ordem de implantação.

## 2. Pré-requisitos

Os três temas anteriores vêm antes, cada um por um motivo. Sem [TEMA-01](TEMA-01-autenticacao-fatores-mfa-fido2.md) não existe identidade forte o suficiente para sustentar a decisão. Sem [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) não existe ponto de decisão onde a política possa ser aplicada por recurso. Sem [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md) o acesso administrativo permanente continua sendo confiança implícita por outro nome.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantos recursos da sua empresa verificam a identidade do dispositivo antes de liberar a sessão? Anote o número.
   Confiança: ___
2. Palpite: se a decisão de acesso passa a ser por recurso, quem perde poder na sua empresa — o time de rede ou o de identidade? Aposte.
   Confiança: ___
3. Antes de ler: quantos projetos da sua empresa usam a palavra zero trust no nome sem mudar nenhuma verificação? Escreva um número ou um nome.
   Confiança: ___

## 4. Caso real

O NIST SP 800-207 foi publicado em agosto de 2020, com versão final em 11 de agosto daquele ano. O resumo do documento afirma que zero trust assume não existir confiança implícita concedida a ativos ou a contas de usuário apenas com base na localização física ou de rede, como rede local contra internet, ou com base na propriedade do ativo, da empresa ou pessoal. Afirma também que autenticação e autorização, de sujeito e de dispositivo, são funções discretas executadas antes de estabelecer a sessão com o recurso da empresa, e que o foco é proteger recursos, e não segmentos de rede, porque a localização de rede deixou de ser o componente principal da postura de segurança do recurso. O documento declara ainda responder a tendências como usuários remotos, dispositivo próprio do empregado e ativos em nuvem fora do perímetro da empresa, e apresenta modelos gerais de implantação e casos de uso.

O caso deixa a pergunta aberta: quantas regras de acesso da sua empresa respondem "está na rede interna" como única condição, e qual seria o custo de substituir cada uma delas por decisão baseada em identidade e estado do dispositivo.

## 5. Conteúdo

### 5.1 Conceito

Zero trust é, na definição do próprio NIST, o termo para um conjunto em evolução de paradigmas de segurança cibernética que deslocam as defesas de perímetros estáticos baseados em rede para o foco em usuários, ativos e recursos. A arquitetura de confiança zero usa esses princípios para planejar infraestrutura e fluxos de trabalho. A parte operacional da definição é a que interessa a quem decide: não existe confiança implícita por localização nem por propriedade do ativo.

O tema desta área é a metade do padrão que trata de identidade. A outra metade, o desenho que decide o que fica isolado e o que contém o dano depois da falha de uma barreira, está no [TEMA-04 da área 03](../03-arquitetura-engenharia/TEMA-04-padroes-zero-trust-defesa-em-profundidade.md). Ler os dois juntos evita o erro mais comum de projeto, que é tratar zero trust como compra de produto de identidade quando o problema é também de desenho.

O CISSP trata o mesmo assunto por dois ângulos. No domínio de arquitetura, lista zero trust e "confie mas verifique" entre os princípios de projeto seguro, ao lado de menor privilégio, defesa em profundidade e segregação de função. No domínio de rede, cita microssegmentação com sobreposição de rede, firewall distribuído e zero trust entre as formas de segmentação lógica. Os dois ângulos se encontram: identidade forte sem segmentação deixa o atacante andar; segmentação sem identidade forte deixa o atacante se passar por quem tem direito de andar.

### 5.2 Como funciona

A unidade de decisão muda. No modelo por perímetro, a unidade é o segmento: quem está dentro alcança o que a regra de rede permite. No modelo por recurso, a unidade é o par sujeito e recurso, e cada acesso é avaliado: quem é o sujeito, qual é o estado do dispositivo, qual é o recurso, qual é a operação pedida e qual é a política para esse conjunto.

Quatro elementos compõem a decisão, e cada um tem dono e fonte de dado. Identidade do sujeito, com a força definida pelo nível de garantia de autenticação escolhido no [TEMA-01](TEMA-01-autenticacao-fatores-mfa-fido2.md). Identidade e estado do dispositivo, que respondem se o equipamento está inscrito, atualizado e em conformidade. O recurso, com sua classificação e seu dono. E a operação, com o modelo de autorização do [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) definindo a regra.

A consequência arquitetural é que a autorização passa a ser por recurso e por operação, não por alcance de rede. Onde isso existe, a remoção de confiança implícita é verificável: uma conexão originada da rede interna sem identidade verificada e sem dispositivo em conformidade recebe a mesma decisão que uma conexão vinda da internet.

Três controles já lidos nesta área são peças diretas do padrão. A autenticação resistente a phishing, exigida no nível 3 e ofertada de forma obrigatória no nível 2 pela revisão de 2025 do SP 800-63B-4, impede que a decisão seja tomada em nome de um sujeito que só entregou um segredo digitado. O acesso administrativo elegível com aprovação, visto no [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md), remove a confiança que vinha do cargo ou da permanência. E a revisão periódica de acesso mantém a política fiel à função real, porque política desatualizada transforma decisão correta em decisão errada sobre dado desatualizado.

Vale registrar um cuidado de vocabulário. Chamar de zero trust o uso de VPN com segundo fator, ou o uso de autenticação em nuvem, descreve dois controles diferentes sem dizer o que foi removido. O teste honesto é sempre o mesmo: qual decisão passou a ser tomada por identidade e estado do dispositivo em vez de ser tomada pela rede, e qual confiança implícita deixou de existir.

### 5.3 Exemplo resolvido

Avaliação de confiança implícita em cinco decisões de uma empresa de serviços financeiros.

Passo 1: listar decisões, não sistemas. Decisão A, acesso ao banco de dados de clientes. Decisão B, acesso à ferramenta de administração de servidores. Decisão C, publicação na esteira de implantação. Decisão D, leitura do repositório de código. Decisão E, acesso ao painel de indicadores financeiros.

Passo 2: escrever a condição de confiança atual de cada decisão. A: origem na sub-rede da aplicação. B: origem na rede administrativa. C: credencial de serviço guardada na esteira. D: conta pessoal em serviço de repositório com senha mais código por aplicativo. E: login único com grupo concedido por herança de antigo projeto.

Passo 3: marcar o que é confiança implícita. A decisão A e a decisão B usam localização como prova. A decisão C usa segredo estático compartilhado, que é confiança permanente. A decisão D tem autenticação razoável e fator phishável. A decisão E tem política desconhecida, que é a pior situação porque ninguém consegue nem nomear a regra.

Passo 4: escrever o controle que substitui cada confiança implícita. A: autenticação de carga de trabalho com identidade emitida pela plataforma mais credencial dinâmica, e dispositivo fora da equação por se tratar de processo. B: acesso elegível com aprovação, verificação reforçada e prazo curto, com o caminho de rede restrito como controle complementar e não como prova. C: credencial de esteira com escopo restrito pelo ambiente e expiração ao final do trabalho. D: passkey ou chave de segurança vinculada ao dispositivo, com revisão de organização. E: extrair a política de herança, transformá-la em papel ou atributo explícito e recertificar.

Passo 5: ordenar por dano e por esforço. Primeiro o que tem maior dano e menor esforço: decisão C e decisão E. Depois o que exige mudança de plataforma: A e B. Por último o que depende de campanha de usuário: D.

Passo 6: definir a medida. Percentual de decisões de acesso que incluem condição de dispositivo ou de força de autenticação, número de regras que ainda usam origem de rede como condição suficiente, e percentual de decisões com política nomeada e dono.

Passo 7: registrar o que não fecha. Um servidor legado de banco continuou aceitando conexão sem credencial por falta de suporte do fabricante. Isso entra no registro de risco aceito com dono, prazo e controle compensatório, em vez de virar promessa de conformidade no relatório.

### 5.4 Problema de completar

Uma empresa tem 40 aplicações internas atrás de VPN, com autenticação por senha e sem verificação de dispositivo.

Passo 1: listar as aplicações por criticidade do dado que expõem.

Passo 2: verificar quais suportam autenticação federada e quais suportam decisão por atributo de dispositivo.

Passo 3: definir o padrão de acesso para aplicação crítica e o padrão para aplicação de baixo risco.

Passo 4: definir o que acontece com o dispositivo que não está em conformidade.

Passo 5: decidir o papel da VPN no desenho novo e o que ela deixa de provar.

Passo 6: definir o indicador de progresso.

## 6. Por que isso importa para o CISO

Zero trust aparece em quase todo edital, quase sempre como exigência contratual sem definição. O CISO que consegue responder com a definição do NIST e com três decisões concretas da própria empresa transforma uma frase de efeito em agenda de trabalho. A pergunta que revela se o fornecedor ou o consultor entende o assunto é simples: qual confiança implícita se pretende remover primeiro, e como se mede a remoção.

Há um efeito direto na segurança do trabalho remoto e do dispositivo próprio. No modelo por perímetro, o notebook pessoal dentro da VPN alcança o que a regra de rede permitir. No modelo por recurso, o mesmo notebook recebe decisão diferente por aplicação, conforme identidade e conformidade. É essa diferença que a empresa vende ao cliente quando afirma controlar acesso a dado, e é essa diferença que o auditor procura.

O terceiro efeito é de orçamento. Zero trust não é projeto com data de conclusão, e tratá-lo como projeto cria a expectativa errada de que existe certificado final. Ele é uma direção com marcos: quantas decisões passaram a ser tomadas por identidade, quantas pararam de depender da rede. Cada marco é verificável e cada marco reduz risco de forma mensurável, o que permite dividir o financiamento em etapas em vez de pedir verba para um programa sem fim.

## 7. Aplicação prática

Pegue as dez regras de firewall mais permissivas e pergunte, para cada uma, qual decisão de negócio ela existe para permitir e o que aconteceria se ela fosse trocada por autenticação por recurso. A lista resultante é a pauta de trabalho do trimestre, e ela costuma ser menor do que o time imagina.

Depois escolha uma aplicação crítica e responda por escrito três perguntas: quem decide o acesso, com base em quais atributos, e onde. Se a resposta citar a rede como atributo determinante, a aplicação ainda opera no modelo anterior, e a mudança começa pelo modelo de autorização, não pelo produto.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, o que muda quando a confiança deixa de vir da localização e passa a vir da identidade e do estado do dispositivo. Se as três frases não citarem decisão por recurso, releia a seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Zero trust é produto que se compra | O padrão é conjunto de princípios e modelos de implantação; a remoção de confiança implícita é decisão de desenho | Definir quais decisões passam a usar identidade e estado de dispositivo, com medida de progresso |
| Usar VPN com segundo fator é zero trust | O segundo fator melhora a autenticação, mas a rede continua concedendo alcance depois do login | Decidir por recurso e por operação, com avaliação também do dispositivo |
| Zero trust significa eliminar a rede interna | Segmentação continua necessária para conter dano depois da falha de uma barreira | Combinar identidade forte com segmentação, conforme o TEMA-04 da área 03 |
| Só identidade de usuário interessa | O resumo do SP 800-207 exige autenticação e autorização tanto de sujeito quanto de dispositivo | Tratar identidade de dispositivo e de carga de trabalho com o mesmo rigor |
| Confiar no dispositivo porque está inscrito é suficiente | Inscrição não diz se o dispositivo está atualizado e em conformidade no momento do acesso | Avaliar estado no momento da decisão, não apenas existência do cadastro |
| Zero trust é projeto com data de término | O documento descreve paradigmas em evolução e modelos de implantação, não certificado final | Tratar como direção com marcos verificáveis e financiamento por etapa |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a data de publicação do SP 800-207 e o que ele afirma sobre confiança implícita?
2. O que o documento diz sobre autenticação e autorização de sujeito e de dispositivo em relação ao início da sessão?
3. Por que o documento afirma que o foco é proteger recursos e não segmentos de rede?
4. Quais quatro elementos compõem uma decisão de acesso no modelo por recurso?
5. Como o CISSP trata zero trust nos domínios de arquitetura e de rede?
6. Qual é a pergunta que revela se um plano de zero trust é concreto ou apenas discurso?

<details>
<summary>Conferir respostas</summary>

1. Publicado em agosto de 2020, com versão final em 11 de agosto de 2020. Afirma que não existe confiança implícita concedida a ativos ou contas de usuário apenas pela localização física ou de rede, nem pela propriedade do ativo.
2. São funções discretas executadas antes de estabelecer a sessão com o recurso da empresa.
3. Porque a localização de rede deixou de ser o componente principal da postura de segurança do recurso.
4. Identidade do sujeito, identidade e estado do dispositivo ou da carga de trabalho, o recurso com sua classificação, e a operação pedida com a política que a governa.
5. No domínio de arquitetura, lista zero trust entre os princípios de projeto seguro; no domínio de rede, cita microssegmentação com sobreposição de rede, firewall distribuído e zero trust entre as formas de segmentação lógica.
6. Perguntar qual confiança implícita será removida primeiro e como a remoção será medida.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Listar cinco decisões de acesso e a condição de confiança de cada uma | Rebaixar: repetir em D+3 |
| D+30 | Reescrever uma decisão para que ela deixe de usar a rede como prova | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 08-cloud#TEMA-02 | a política de identidade do provedor de nuvem é onde a decisão por recurso do zero trust vira configuração executável; destino planejado, número provisório |
| complementa | 03-arquitetura-engenharia#TEMA-04 | zero trust na identidade e zero trust na arquitetura são as duas metades do mesmo padrão: uma prova quem é e qual é o estado do dispositivo, a outra decide o que o desenho protege e o que contém o dano |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 3, Security Architecture and Engineering, subtema 3.1, com zero trust entre os princípios de projeto seguro | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 4, Communication and Network Security, subtema 4.1, com microssegmentação e zero trust na segmentação lógica | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: o resumo e as palavras-chave do SP 800-207 no site do CSRC, e o CSWP 20, Planning for a Zero Trust Architecture, listado como publicação relacionada. O título completo do SP 800-207A não foi conferido nesta execução.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-207 — Zero Trust Architecture, agosto de 2020, final em 11/08/2020, DOI 10.6028/NIST.SP.800-207 | primaria | https://csrc.nist.gov/pubs/sp/800/207/final | "2026-09-25" | alta |
| 2 | NIST SP 800-207 — palavras-chave e publicação relacionada CSWP 20, Planning for a Zero Trust Architecture, e publicação complementar SP 800-207A | primaria | https://csrc.nist.gov/pubs/sp/800/207/final | "2026-09-25" | alta (título completo do SP 800-207A NAO CONFIRMADO) |
| 3 | NIST SP 800-63B-4 — Authentication Assurance Levels, com requisito de resistência a phishing | primaria | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | "2026-09-25" | alta |
| 4 | ISC2 CISSP Certification Exam Outline, Domain 3, subtema 3.1, e Domain 4, subtema 4.1 | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | "2026-09-25" | alta |
| 5 | Microsoft Entra ID Governance — referência documental a configurações de identidade e acesso a dispositivos para zero trust | primaria | https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-pam-contas-privilegiadas-cofres-de-senha.md) |
| Home | [README](../README.md) |
