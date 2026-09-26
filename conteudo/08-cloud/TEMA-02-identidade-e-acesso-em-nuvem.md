---
tema: "Identidade e acesso em nuvem"
tema_id: "TEMA-02"
area_id: "08-cloud"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Escrever a política de identidade de uma conta de nuvem, decidindo para cada credencial se ela é humana, de carga de trabalho ou de plataforma, com prazo de rotação e dono declarados"
atende_objetivo: [2]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por:
    - alvo: "04-identidade-acesso#TEMA-02"
      motivo: "aqui a autorização aparece como política do provedor; a mecânica de RBAC, ABAC e do modelo de decisão está na área 04"
  aplicado_em:
    - alvo: "04-identidade-acesso#TEMA-06"
      motivo: "a política de identidade do provedor é onde a decisão por recurso do zero trust vira configuração executável"
  nao_confundir_com: []
fontes:
  - titulo: "AWS Identity and Access Management — Security best practices in IAM"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Learn — Shared responsibility in the cloud, com dados, endpoints, contas e gestão de acesso sempre com o cliente, última atualização em 24 de agosto de 2026"
    url: "https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA — Cloud Controls Matrix v4.1, com o domínio IAM entre os 17 domínios e 197 control objectives"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS Well-Architected Framework — Security Pillar, publicado em 6 de novembro de 2024"
    url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Identidade e acesso em nuvem

A página de boas práticas de identidade da AWS abre com duas exigências: usuário humano deve entrar
por federação com um provedor de identidade, recebendo credencial temporária, e carga de trabalho
deve usar credencial temporária de papel. Chave de acesso de longa duração aparece na mesma página
como exceção para casos específicos, entre eles plugin que não suporta papel e cliente de terceiro.
A política de identidade da conta é, na prática, essa decisão repetida por credencial.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir escrever a política de identidade de uma conta de nuvem,
decidindo para cada credencial se ela é humana, de carga de trabalho ou de plataforma, com prazo de
rotação e dono declarados.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-responsabilidade-compartilhada.md), porque a matriz de responsabilidade mostra
que identidade, acesso, contas e configuração não saem do cliente em nenhum modelo de serviço. Do
[04 Identidade e acesso](../04-identidade-acesso/README.md), o modelo de decisão e o ciclo de vida
da identidade.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual é a diferença entre identidade federada e usuário local na conta de nuvem?
   Confiança: ___
2. Uma função serverless precisa ler um bucket. Onde ela guarda a credencial?
   Confiança: ___
3. O que uma service control policy faz quando aplicada a uma unidade organizacional?
   Confiança: ___
4. Quem deve responder pela gestão de acesso, segundo a matriz de responsabilidade compartilhada?
   Confiança: ___

## 4. Caso real

Uma empresa descobre, na revisão anual de acesso, que quatro pipelines de integração contínua
gravam objetos em nuvem usando chave de acesso criada dois anos antes por um analista que já saiu.
Nenhuma política de papel foi criada para os pipelines, e a chave não aparece em nenhum inventário
de aplicação. A boa prática publicada pelo provedor descreve o caminho oposto: a plataforma de
integração contínua fornece um token de identidade, o papel confia nesse emissor e entrega
credencial temporária. O episódio é composto para exercício.

A pergunta que o caso deixa aberta: por que a chave estática sobrevive tanto tempo em ambientes que
já usam federação para pessoas.

## 5. Conteúdo

### 5.1 Conceito

A conta de nuvem tem três tipos de identidade e cada um admite um regime diferente. Identidade
humana é a pessoa da empresa ou o colaborador externo; a recomendação publicada é federação com um
provedor de identidade e credencial temporária, com gestão centralizada. Identidade de carga de
trabalho é o programa, o contêiner ou a função, que recebe credencial temporária entregue pelo
próprio serviço de computação. Identidade de plataforma é a do serviço que executa em seu nome,
como o agente de gestão ou o serviço de backup, e é a origem mais comum de privilégio excessivo,
porque nasce de uma integração e raramente é revista.

O provedor não decide essas escolhas por você. A Microsoft lista gestão de acesso entre as
responsabilidades que o cliente mantém em qualquer modelo, junto com dados, endpoints e contas. A
Google escreve que o cliente é sempre responsável pelas suas políticas de acesso e pelos seus dados.
O CCM da CSA reserva um domínio inteiro, IAM, dentro dos 17 domínios e 197 control objectives, o
que sinaliza a proporção do assunto dentro de um programa de segurança em nuvem.

### 5.2 Como funciona

O mecanismo tem quatro peças. A primeira é o emissor de identidade: o provedor de identidade
corporativo para pessoas, ou o emissor de tokens da plataforma para cargas de trabalho. A segunda é
o papel, entidade sem senha própria que pode ser assumida por quem o documento de confiança do papel
autorizar. A terceira é a política de permissão, que nomeia ação, recurso e condição. A quarta é a
credencial temporária, emitida com validade curta e entregue ao recurso de computação.

A AWS descreve o caminho da carga de trabalho dentro do provedor: ao executar em serviço de
computação, a empresa recebe as credenciais temporárias do papel e as bibliotecas de
desenvolvimento as descobrem e usam, sem necessidade de distribuir credencial de longa duração ao
programa. Para carga fora do provedor, a mesma página lista as formas de entrega: requisição de
credencial temporária usando certificado X.509 da sua própria infraestrutura de chave pública,
chamada de API com asserção SAML de um provedor de identidade externo, chamada de API com token
JWT de um provedor de identidade configurado na conta, autenticação mútua TLS em dispositivo de
borda. Também entram nessa lista os serviços que estendem a entrega de credencial para computação
executada fora do provedor.

As permissões efetivas de uma requisição não vêm de um só lugar. A AWS resume o conjunto em política
de identidade, política de recurso, condição contextual e limite de permissão, e recomenda separar
cargas por conta com guardrails de organização que, segundo o próprio documento, não concedem
permissão alguma por si: quem concede é a política ligada à identidade ou ao recurso. Para revisar
e reduzir permissão, a mesma página indica o analisador que gera política a partir da atividade
registrada na trilha de auditoria e que valida política com mais de cem verificações.

Sobre chave de longa duração, a recomendação é substituir sempre que possível e atualizar quando
necessário, apoiando-se na informação de último uso para remover com segurança. A página nomeia os
casos em que ela ainda é usada: carga que não consegue assumir papel, cliente de terceiro que não
suporta o acesso federado, acesso por ferramenta específica de repositório de código e serviço
gerenciado de banco compatível com protocolo legado. MFA aparece como exigência para usuário local
e para a conta raiz, com preferência declarada por fatores resistentes a phishing, como chave de
segurança e passkey.

### 5.3 Exemplo resolvido

Situação: pipeline de integração contínua hospedado fora do provedor precisa gravar objetos em um
bucket. Decisão: eliminar a chave de acesso e usar federação de identidade de carga de trabalho.

1. Criar ou reaproveitar o provedor de identidade do pipeline na conta, registrando o emissor e as
   condições aceitas.
2. Criar o papel com documento de confiança que aceita token daquele emissor e, na condição, na
   audiência e no identificador do projeto ou repositório.
3. Anexar política de permissão com a ação de gravação de objeto, o recurso nomeado pelo caminho do
   bucket e a condição de exigir conexão criptografada.
4. Não emitir chave de acesso para o pipeline; o token é obtido a cada execução e a credencial
   entregue tem validade curta.
5. Validar a política com o analisador antes de publicar, e conferir se ela não permite leitura nem
   exclusão.
6. Registrar o dono do papel, o prazo de revisão e a origem do emissor como itens de inventário.
7. Cobrir a conta com guardrail de organização que impeça criação de credencial de longa duração
   fora de uma lista de exceções aprovada.
8. Agendar a revisão de último uso dos papéis a cada trimestre e remover o que não foi usado.

### 5.4 Problema de completar

Complete a política de permissão e as duas últimas etapas do procedimento para um serviço de
relatórios que precisa apenas listar e ler objetos de um prefixo específico:

```json
{
  "Effect": "Allow",
  "Action": ["s3:______", "s3:______"],
  "Resource": "arn:aws:s3:::relatorios/______",
  "Condition": { "Bool": { "aws:SecureTransport": "______" } }
}
```

Etapa 7: guardrail de organização que ______.
Etapa 8: revisão trimestral de ______, com remoção do papel que ______.

## 6. Por que isso importa para o CISO

A chave de longa duração é o artefato que sobrevive a desligamento, mudança de dono e reestruturação,
porque não depende de ninguém estar logado para funcionar. A página de boas práticas do provedor
trata a substituição por credencial temporária como primeira recomendação e reserva a chave
permanente a exceções nomeadas. Um inventário que responda "quantas chaves existem, de quem são e
quando foram usadas pela última vez" muda de conversa em auditoria e em incidente.

O segundo efeito é de proporção de esforço. O CCM da CSA dedica um domínio inteiro à gestão de
identidade e acesso dentro de 17 domínios. Em ambiente de nuvem, a maior parte do trabalho de
segurança é política de permissão, revisão de acesso e guardrail de organização, e não instalação de
agente.

O terceiro efeito é de rastreabilidade. A permissão sem condição, concedida em nível amplo e nunca
revisada, é o que faz um incidente começar em um serviço pequeno e terminar em dado de cliente. O
relatório ao comitê ganha tração quando apresenta número de papéis sem condição, número de chaves
sem uso registrado e cobertura de MFA na conta raiz.

## 7. Aplicação prática

Exporte a lista de identidades, papéis e chaves de longa duração da sua conta principal. Para cada
item, preencha cinco colunas: tipo de identidade, dono, emissor de confiança, última utilização e
prazo de revisão. Marque em vermelho toda chave de longa duração sem dono nomeado e toda permissão
que use curinga em ação e em recurso ao mesmo tempo. Leve a lista vermelha para a próxima reunião de
mudança e transforme cada linha em item com data.

## 8. Autoexplicação

Explique em três frases por que credencial temporária reduz risco em relação a chave estática, e
onde cada tipo de identidade obtém a sua credencial. Conecte com algo que você já faz hoje: a senha
de serviço usada em qualquer integração da empresa é o mesmo problema em outro provedor.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Federação resolve o problema de credencial de carga de trabalho | Federação de pessoas e federação de carga de trabalho usam emissores e políticas diferentes | Trate as duas como trilhas separadas, com dono distinto |
| Papel sem senha é seguro por natureza | Papel com documento de confiança amplo pode ser assumido de fora | Restrinja o documento de confiança ao emissor, à audiência e ao projeto |
| Permissão ampla é aceitável no começo e some depois | Sem dono e sem prazo, a permissão ampla permanece e vira caminho de escalada | Nomeie dono e prazo desde a criação, e reduza com base na atividade registrada |
| Guardrail de organização já concede acesso | Guardrail limita o teto e não concede nada | A concessão vem da política ligada à identidade ou ao recurso |
| Cofre de segredo de aplicação substitui a federação | Cofre guarda segredo, e o segredo continua sendo credencial de longa duração | Prefira credencial temporária; use cofre para o que não tem federação |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais dois grupos a página de boas práticas da AWS coloca sob credencial temporária obrigatória, e
   qual recurso cada um usa para obtê-la?
2. Cite três formas listadas pelo provedor para entregar credencial temporária a carga que executa
   fora da nuvem dele.
3. O que uma permissão efetiva combina, além da política de identidade?
4. Por que o guardrail de organização, sozinho, não garante que ninguém tenha acesso indevido?

<details>
<summary>Conferir respostas</summary>

1. Usuário humano, que deve usar federação com provedor de identidade e assumir papel, e carga de
   trabalho, que deve receber credencial temporária de papel entregue pelo serviço de computação. A
   gestão centralizada do acesso humano é feita pelo serviço de identidade do provedor.
2. Certificado X.509 da sua própria infraestrutura de chave pública usando o serviço de acesso para
   carga fora da nuvem, asserção SAML de provedor de identidade externo, token JWT de emissor
   configurado na conta, e autenticação mútua TLS para dispositivo de borda.
3. Combina política de recurso, condição contextual e limite de permissão; guardrails definem o teto
   e não concedem acesso.
4. Porque ele só limita o que pode ser concedido. A permissão continua vindo da política ligada à
   identidade ou ao recurso, e uma concessão ampla dentro do teto continua valendo.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)).

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever um documento de confiança de papel para um caso real da empresa | Rebaixar: repetir em D+3 |
| D+30 | Refazer o inventário da seção 7 e comparar com o do primeiro dia | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 04-identidade-acesso#TEMA-06 | a política de identidade do provedor é onde a decisão por recurso do zero trust vira configuração executável |
| aprofundado_por | 04-identidade-acesso#TEMA-02 | aqui a autorização aparece como política do provedor; a mecânica de RBAC, ABAC e do modelo de decisão está na área 04 |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Identidade, federação e credencial temporária em nuvem | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Controles do CCM de identidade e de acesso | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [AWS IAM, Security best practices in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | AWS IAM — Security best practices in IAM, com federação de usuário humano, credencial temporária de carga de trabalho, guardrails e limites de permissão | primaria | https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html | "2026-09-25" | alta |
| 2 | Microsoft Learn — Shared responsibility in the cloud, gestão de acesso sempre com o cliente | primaria | https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility | "2026-09-25" | alta |
| 3 | Google Cloud — Shared responsibilities and shared fate, cliente sempre responsável pelas políticas de acesso e pelos dados | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 4 | CSA — Cloud Controls Matrix v4.1, domínio IAM entre os 17 domínios | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |
| 5 | AWS Well-Architected Framework — Security Pillar, publicado em 6 de novembro de 2024 | primaria | https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html | "2026-09-25" | alta |

Nenhuma estatística de incidente ou de custo foi afirmada neste tema. O episódio da seção 4 é
composto para exercício.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-responsabilidade-compartilhada.md) |
| Próximo tema | [TEMA-03](TEMA-03-configuracao-incorreta-e-gestao-de-postura.md) |
| Home | [README](../README.md) |
