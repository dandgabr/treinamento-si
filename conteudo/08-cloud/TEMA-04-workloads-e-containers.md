---
tema: "Segurança de workloads e containers"
tema_id: "TEMA-04"
area_id: "08-cloud"
nivel: avancado
tempo_estimado: "35-50 min"
objetivo_aprendizagem: "Definir o regime de hardening de nó, imagem e runtime para cada carga de trabalho, justificando o que muda quando o serviço é gerenciado"
atende_objetivo: [4]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: ["TEMA-01", "TEMA-03"]
relacoes:
  complementa:
    - alvo: "06-endpoint-plataforma#TEMA-06"
      motivo: "a carga endurecida no host é a mesma que roda como contêiner ou instância em nuvem, com o mesmo problema de superfície"
  aprofundado_por: []
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-02"
      motivo: "o log do plano de controle e o evento do runtime do contêiner são fontes de telemetria para a triagem"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-190 — Application Container Security Guide, setembro de 2017, final em 25/09/2017, DOI 10.6028/NIST.SP.800-190"
    url: "https://csrc.nist.gov/pubs/sp/800/190/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CIS Benchmarks List, com Kubernetes 2.0.1, Amazon Elastic Kubernetes Service 2.0.0, Azure Kubernetes Service 2.0.0, Google Kubernetes Engine 2.0.0 e Docker 1.8.0"
    url: "https://www.cisecurity.org/cis-benchmarks"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS Identity and Access Management — Security best practices in IAM, credencial temporária entregue ao recurso de computação"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model, com a correção do sistema operacional convidado entre as tarefas do cliente"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA — Cloud Controls Matrix v4.1, com domínios de infraestrutura e virtualização e de gestão de ameaça e vulnerabilidade"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Kubernetes — Configure Service Accounts for Pods, campo automountServiceAccountToken"
    url: "https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Kubernetes — Network Policies, comportamento padrao e negacao por omissao"
    url: "https://kubernetes.io/docs/concepts/services-networking/network-policies/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Kubernetes — Pod Security Admission, aplicacao por namespace"
    url: "https://kubernetes.io/docs/concepts/security/pod-security-admission/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Kubernetes — Pod Security Standards, niveis privileged, baseline e restricted"
    url: "https://kubernetes.io/docs/concepts/security/pod-security-standards/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Segurança de workloads e containers

O NIST SP 800-190, publicado em setembro de 2017, define contêiner como forma de virtualização do
sistema operacional combinada com empacotamento de software de aplicação, e existe para tratar as
preocupações de segurança dessa combinação. A lista de benchmarks da CIS traz números de referência
para esse ambiente: Kubernetes 2.0.1, Amazon Elastic Kubernetes Service 2.0.0, Azure Kubernetes
Service 2.0.0, Google Kubernetes Engine 2.0.0 e Docker 1.8.0.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir definir o regime de hardening de nó, imagem e runtime
para cada carga de trabalho, justificando o que muda quando o serviço é gerenciado.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-responsabilidade-compartilhada.md), que separa o que o provedor opera do que
fica com o cliente, e o [TEMA-03](TEMA-03-configuracao-incorreta-e-gestao-de-postura.md), que fixa a
versão do benchmark e a fila de correção.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantas imagens de contêiner a sua empresa publica por semana? Chute, sem abrir o registro.
   Confiança: ___
2. Quem responde pela correção de segurança do nó de um cluster gerenciado: o provedor, o time de plataforma ou ninguém? Anote sua aposta e quem diria o contrário.
   Confiança: ___
3. Onde você aposta que está a credencial de nuvem de uma carga em contêiner hoje: dentro da imagem, em variável de ambiente ou no cofre?
   Confiança: ___

## 4. Caso real

Uma equipe publica a mesma imagem de aplicação com a etiqueta de versão mais recente em cada
implantação. Seis meses depois, dois nós passam a executar código diferente do que está no
repositório, porque a imagem de base foi atualizada e um comportamento novo entrou de carona. A
investigação não consegue dizer qual versão rodava no dia do desvio. O episódio é composto para
exercício.

A pergunta que o caso deixa aberta: quais decisões de imagem, nó e runtime precisam estar escritas
antes de a carga existir.

## 5. Conteúdo

### 5.1 Conceito

A carga de trabalho em nuvem tem cinco camadas, e cada uma tem dono diferente conforme o serviço
escolhido. O nó, que é a máquina ou a instância que executa o contêiner. O plano de controle, que é
o orquestrador que decide onde a carga roda. O registro e a imagem, que são o conteúdo que será
executado. O runtime do contêiner ou da função, que é o processo em execução. O código e a
configuração, que são do time que construiu a aplicação.

O NIST SP 800-190 trata o assunto como problema de virtualização de sistema operacional: o contêiner
compartilha o kernel do nó anfitrião, e é isso que reduz o isolamento em relação à máquina virtual
tradicional. O mesmo documento organiza as recomendações pelas famílias de controle que elas
atendem, entre elas controle de acesso, gestão de configuração, identificação e autenticação,
resposta a incidente e proteção de sistema e comunicação. Publicação complementar, o NIST IR 8176,
trata das ameaças a tecnologias de contêiner.

A divisão de responsabilidade não desaparece ao adotar serviço gerenciado. A AWS atribui ao cliente
o sistema operacional convidado com suas correções, quando a carga roda em máquina virtual. A Google
coloca o modelo de função, próximo ao modelo de software como serviço, com o cliente ainda
responsável pelas políticas de acesso e pelos dados. O resultado prático é que o cluster gerenciado
resolve o plano de controle e não resolve a imagem, o usuário dentro do contêiner e a permissão da
carga.

### 5.2 Como funciona

O hardening começa pela imagem. A imagem precisa nascer de base conhecida, com versão fixada e
sem ferramenta de compilação dentro do que vai para produção, e precisa ser identificada por digest
para que o artefato executado seja verificável. A lista da CIS oferece referências adicionais para
o mesmo ambiente, entre elas Kubernetes, os três clusters gerenciados dos grandes provedores,
imagem otimizada de nó, sistema operacional mínimo para contêiner e o próprio Docker.

O segundo passo é o nó. Quando o serviço é gerenciado, o provedor opera a infraestrutura e a
plataforma, e o cliente permanece responsável por escolher a versão do ambiente, pela política de
atualização, pelas extensões instaladas e pela configuração de rede do cluster. Quando o nó é uma
instância alugada, o cliente responde pelo sistema operacional convidado, pelas correções e pela
imagem de base, conforme a matriz do provedor.

O terceiro passo é o runtime. Usuário sem privilégio dentro do contêiner, sistema de arquivos
somente leitura onde possível, limites de recurso, política de rede que restringe o que a carga
alcança e lista de registro de imagem permitida. Cada um desses itens aparece em benchmark
publicado e vira linha de verificação com versão.

O quarto passo é a identidade da carga. Chamar o serviço de armazenamento ou de banco com credencial
embutida na imagem é o erro mais caro desse ambiente, porque a imagem se replica. A prática
publicada pelo provedor é a oposta: o recurso de computação recebe credencial temporária de papel e
a biblioteca de desenvolvimento a descobre, sem distribuição de credencial de longa duração ao
programa.

O quinto passo é a observabilidade da camada. Evento de admissão do orquestrador, criação e
encerramento de contêiner, alteração de configuração do plano de controle e acesso a segredo
compõem a telemetria mínima. Sem ela, o desvio de configuração só aparece na próxima varredura.

Além desses cinco passos, três controles do orquestrador aparecem em toda linha de base publicada e
costumam faltar em ambiente que cresceu sem revisão. O primeiro é a **conta de serviço**: por padrão
o Kubernetes monta um token no pod, e esse token é credencial da API do cluster — o campo
`automountServiceAccountToken` existe exatamente para desligar essa montagem, e conta dedicada por
carga, com permissão mínima, é o que separa um pod comprometido de um cluster comprometido
([kubernetes.io](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/),
acessado em 2026-09-25). O segundo é a **política de rede**: sem `NetworkPolicy`, todo pod alcança
todo pod, e o padrão documentado é negar por omissão e abrir só o que a aplicação precisa
([kubernetes.io](https://kubernetes.io/docs/concepts/services-networking/network-policies/),
acessado em 2026-09-25). O terceiro é a **admissão**: o Pod Security Admission classifica cada
namespace em um de três níveis — `privileged`, `baseline` e `restricted` — e recusa o pod que não
atende antes de ele existir, o único ponto do ciclo em que a configuração ruim é impedida em vez de
detectada depois
([kubernetes.io](https://kubernetes.io/docs/concepts/security/pod-security-admission/),
[padrões](https://kubernetes.io/docs/concepts/security/pod-security-standards/), acessados em
2026-09-25). Os três cabem na mesma frase de contrato com o time de plataforma: conta de serviço com
escopo mínimo, rede com negação por omissão e admissão que recusa o que não atende.

### 5.3 Exemplo resolvido

Situação: uma aplicação de consulta será publicada em cluster gerenciado, com acesso a um bucket.
Montagem do regime em sete decisões.

1. Imagem base mínima, versão fixada e publicação identificada por digest, guardando a referência
   usada em cada implantação.
2. Pipeline que constrói a imagem a partir de código versionado e gera o registro da origem do
   artefato.
3. Benchmark do cluster com versão fixada — Kubernetes 2.0.1 ou o benchmark específico do serviço
   gerenciado — aplicado como item de verificação.
4. Contêiner executando como usuário sem privilégio, com sistema de arquivos somente leitura e
   limites de recurso definidos.
5. Política de rede que permite apenas a saída necessária, em vez de acesso livre.
6. Identidade da carga em papel dedicado, com política que nomeia a ação permitida, o recurso do
   bucket e a condição de conexão criptografada; nenhuma chave guardada na imagem.
7. Retenção de log do plano de controle e do runtime enviada à central de eventos, com alerta para
   criação de contêiner privilegiado e alteração de política de rede.

O passo 1 e o passo 6 são os que mais aparecem em revisão. Sem digest, não existe resposta para
"qual código rodava". Sem identidade de carga, a imagem vira portadora de credencial.

### 5.4 Problema de completar

Complete a tabela de camadas para uma função serverless que lê fila e grava em banco gerenciado.

| Camada | Quem responde | Decisão que precisa estar escrita | Evidência |
|---|---|---|---|
| Nó e infraestrutura | ______ | escolha da versão e da região suportada | documento do provedor |
| Runtime da função | ______ | ______ | ______ |
| Código e dependências | ______ | ______ | ______ |
| Identidade da função | ______ | papel dedicado com ação, recurso e condição | ______ |
| Configuração de rede de saída | ______ | ______ | ______ |

## 6. Por que isso importa para o CISO

Cluster gerenciado não elimina a pergunta de auditoria; ele a desloca. O que some é a manutenção do
plano de controle, e o que resta é imagem, identidade da carga, política de rede e política de
admissão. Um programa que responde "usamos Kubernetes gerenciado" para todas as perguntas de
contêiner está deixando a maior parte das linhas sem dono.

O segundo efeito é de resposta a incidente. A imagem identificada por digest e o registro de
implantação são o que permite dizer qual código estava em produção no momento do desvio. Sem isso,
a investigação começa pela reconstrução do ambiente em vez do evento.

O terceiro efeito é de custo recorrente. Imagem construída com ferramenta de compilação embutida,
usuário com privilégio e credencial estática dentro do artefato produzem três frentes de trabalho
que se repetem a cada ciclo de publicação. Definir o padrão antes da primeira carga custa uma
reunião de arquitetura.

## 7. Aplicação prática

Pegue as cinco cargas containerizadas mais críticas. Para cada uma, responda por escrito seis
perguntas: qual é a imagem base e a versão; a implantação usa digest; qual usuário executa dentro do
contêiner; como a carga obtém credencial para serviço de nuvem; qual é a política de rede; e onde
fica o registro de implantação. Onde a resposta for "não sei", abra item com dono e data. Depois,
baixe o benchmark do cluster em uso e verifique vinte itens do plano de controle e do nó.

## 8. Autoexplicação

Explique em três frases por que o contêiner oferece menos isolamento que a máquina virtual e o que
isso muda no hardening. Conecte com algo que você já faz hoje: o servidor de aplicação que roda
com usuário de serviço e não como administrador é o mesmo princípio dentro do contêiner.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Cluster gerenciado transfere toda a segurança da carga ao provedor | O provedor opera o plano de controle; imagem, identidade e política de rede seguem com o cliente | Escreva a matriz de camadas por serviço, como no TEMA-01 |
| Etiqueta de versão é suficiente para identificar a imagem | Etiqueta pode ser reatribuída e deixa de apontar para o mesmo conteúdo | Registre o digest implantado e mantenha o histórico |
| Segredo embutido na imagem é aceitável se a imagem é privada | A imagem se replica em cópias, registros e ambientes de teste | Use identidade de carga com credencial temporária |
| Corrigir o nó resolve a segurança do contêiner | O conteúdo que executa vem da imagem e do código do cliente | Trate nó, imagem e runtime como três frentes distintas |
| Política de rede do cluster é detalhe de operação | A política define o alcance de um contêiner comprometido | Trate a política como item de benchmark, com dono e versão |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Como o NIST SP 800-190 define contêiner e qual é a consequência de isolamento dessa definição?
2. Cite cinco benchmarks publicados pela CIS que se aplicam a ambiente de contêiner.
3. Quais decisões continuam com o cliente quando o cluster é gerenciado?
4. Como a carga de trabalho obtém credencial para serviço de nuvem sem guardar chave na imagem?

<details>
<summary>Conferir respostas</summary>

1. Forma de virtualização do sistema operacional combinada com empacotamento de software de
   aplicação. Como o kernel é compartilhado com o nó anfitrião, o isolamento é menor que o da
   máquina virtual, e isso desloca parte do controle para configuração de runtime e de admissão.
2. Kubernetes 2.0.1, Amazon Elastic Kubernetes Service 2.0.0, Azure Kubernetes Service 2.0.0,
   Google Kubernetes Engine 2.0.0 e Docker 1.8.0. A lista também traz Red Hat OpenShift Container
   Platform 2.0.0, Bottlerocket 1.0.0 e Kubernetes STIG 1.1.0.
3. Imagem base e versão, identificação por digest, usuário dentro do contêiner, política de rede,
   política de admissão, identidade da carga e registro de implantação. A infraestrutura e a
   plataforma ficam com o provedor no serviço gerenciado.
4. Por papel associado à identidade da carga: o serviço de computação entrega credencial temporária
   ao recurso e a biblioteca de desenvolvimento a descobre e usa, sem distribuição de credencial de
   longa duração ao programa.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)).

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Verificar em duas cargas quais camadas estão sem dono nomeado | Rebaixar: repetir em D+3 |
| D+30 | Conferir se o digest implantado corresponde ao registrado no mês anterior | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 10-operacoes-soc#TEMA-02 | o log do plano de controle e o evento do runtime do contêiner são fontes de telemetria para a triagem |
| complementa | 06-endpoint-plataforma#TEMA-06 | a carga endurecida no host é a mesma que roda como contêiner ou instância em nuvem, com o mesmo problema de superfície |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Arquitetura de carga de trabalho e de contêiner em nuvem | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Controles do CCM de desenvolvimento e de carga de trabalho | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [NIST SP 800-190, Application Container Security Guide, setembro de 2017](https://csrc.nist.gov/pubs/sp/800/190/final).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-190 — final em 25/09/2017, DOI 10.6028/NIST.SP.800-190, famílias de controle atendidas pelas recomendações | primaria | https://csrc.nist.gov/pubs/sp/800/190/final | "2026-09-25" | alta |
| 2 | CIS Benchmarks List, com Kubernetes 2.0.1, Amazon EKS 2.0.0, Azure Kubernetes Service 2.0.0, Google Kubernetes Engine 2.0.0, Docker 1.8.0 e Kubernetes STIG 1.1.0 | primaria | https://www.cisecurity.org/cis-benchmarks | "2026-09-25" | alta |
| 3 | AWS IAM — Security best practices, credencial temporária entregue ao recurso de computação | primaria | https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html | "2026-09-25" | alta |
| 4 | Google Cloud — Shared responsibilities and shared fate, revisado em 21/08/2023, com o modelo de função próximo ao de software como serviço | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 5 | AWS — Shared Responsibility Model, sistema operacional convidado e correções entre as tarefas do cliente | primaria | https://aws.amazon.com/compliance/shared-responsibility-model/ | "2026-09-25" | alta |
| 6 | CSA — Cloud Controls Matrix v4.1, domínios de infraestrutura e virtualização e de gestão de ameaça e vulnerabilidade | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |

O guia de hardening de Kubernetes publicado pela CISA não renderizou em leitura direta nesta
execução; a versão vigente desse documento está como `NAO CONFIRMADO em fonte oficial` e não foi
citada. O episódio da seção 4 é composto para exercício.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-configuracao-incorreta-e-gestao-de-postura.md) |
| Próximo tema | [TEMA-05](TEMA-05-dados-em-nuvem-criptografia-e-segregacao.md) |
| Home | [README](../README.md) |
