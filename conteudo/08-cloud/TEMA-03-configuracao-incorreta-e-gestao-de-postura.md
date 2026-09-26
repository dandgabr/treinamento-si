---
tema: "Configuração incorreta e gestão de postura"
tema_id: "TEMA-03"
area_id: "08-cloud"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Construir a fila de correção de configuração de uma conta de nuvem, ligando cada desvio a um benchmark com versão, a um dono e a um prazo"
atende_objetivo: [3]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "12-vulnerabilidades-threat-intel#TEMA-01"
      motivo: "a configuração desviante entra no inventário de exposição como item com dono e prazo, junto da vulnerabilidade de software"
    - alvo: "09-aplicacoes-devsecops#TEMA-04"
      motivo: "a mesma checagem de configuração executada no pipeline evita que o desvio nasça no deploy"
  nao_confundir_com: []
fontes:
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CIS Benchmarks List, com versões de provedor de nuvem, entre elas Amazon Web Services Foundations 7.0.0 e Microsoft Azure Foundations 6.0.0"
    url: "https://www.cisecurity.org/cis-benchmarks"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios, com CAIQ e STAR Registry"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS Identity and Access Management — Security best practices in IAM, com verificação de acesso público e entre contas"
    url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model, com a configuração do firewall do provedor entre as tarefas do cliente"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
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

# Configuração incorreta e gestão de postura

A lista de benchmarks da CIS traz recomendações prescritivas de configuração para mais de 25
famílias de produtos, e entre elas estão benchmarks de provedor de nuvem com versão numerada:
Amazon Web Services Foundations 7.0.0, Microsoft Azure Foundations 6.0.0, Google Cloud Platform
Foundation 5.0.0, Oracle Cloud Infrastructure Foundations 3.1.1, IBM Cloud Foundations 2.0.0 e
Alibaba Cloud Foundation 2.0.0. Um número desses é o que transforma "a conta está bem configurada"
em item verificável.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir construir a fila de correção de configuração de uma conta de
nuvem, ligando cada desvio a um benchmark com versão, a um dono e a um prazo.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-responsabilidade-compartilhada.md), porque a maior parte dos achados de
configuração nasce em linha que é exclusiva do cliente e não será corrigida pelo provedor.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual documento você cita quando o auditor pergunta qual é a configuração esperada da conta?
   Confiança: ___
2. Uma regra de rede que permite entrada de qualquer origem é achado de qual domínio de controle?
   Confiança: ___
3. O que fazer com o achado que a empresa decide não corrigir?
   Confiança: ___
4. Quem corrige o desvio de configuração de um serviço gerenciado?
   Confiança: ___

## 4. Caso real

Uma empresa migra vinte cargas para nuvem em um trimestre. Ao ligar a ferramenta de avaliação de
postura, aparecem 940 achados, 380 deles marcados como críticos. O time de plataforma corrige os
oitenta mais fáceis, o número cai para 860 e a diretoria pergunta por que o indicador não melhorou.
Ninguém fixou versão de benchmark, ninguém atribuiu dono por serviço e ninguém decidiu quais achados
são desvio aceito. O episódio é composto para exercício.

A pergunta que o caso deixa aberta: qual é a diferença entre contagem de achados e fila de correção.

## 5. Conteúdo

### 5.1 Conceito

Postura de segurança em nuvem é o estado de configuração dos recursos de uma conta comparado a uma
referência declarada. A referência existe publicada: os benchmarks de fundação da CIS descrevem, por
provedor, o que se espera de configuração de identidade, de registro de auditoria, de rede e de
armazenamento, e trazem versão própria, como a 7.0.0 do benchmark de fundação da AWS. Sem versão
fixada, o mesmo achado de janeiro e o de junho não são comparáveis, e a série histórica do indicador
perde sentido.

A Google Cloud trata configuração incorreta como causa direta de muitos incidentes de segurança em
nuvem e conclui que o cliente precisa de boas práticas opinativas do provedor, começando por
configuração segura por padrão e por uma linha de base. O CCM da CSA, versão 4.1, cobre o tema em
domínios próprios, entre eles controle de mudança e gestão de configuração, segurança de
infraestrutura e virtualização, gestão de ameaça e vulnerabilidade e registro e monitoramento.

Configuração não é vulnerabilidade de software. Vulnerabilidade é falha no código ou no produto, que
o fornecedor corrige em versão nova; desvio de configuração é escolha ou omissão de quem opera o
recurso, que o fornecedor não corrige por você. A AWS lista a configuração do firewall de segurança
do provedor entre as tarefas do cliente, e a matriz da Microsoft deixa a linha de configurações com
o cliente em todas as colunas de modelo de implantação.

### 5.2 Como funciona

O ciclo tem cinco etapas. Medir, comparando o estado dos recursos com o benchmark de versão fixada.
Triar, separando o que é exposição real do que é desvio cosmético. Atribuir, ligando cada item a um
dono nomeado. Corrigir ou aceitar, sendo que a aceitação exige justificativa, prazo e revisão.
Verificar, medindo de novo e guardando o resultado como evidência.

A medição depende de cobertura de inventário, e a parte mais frágil é o recurso criado fora do
processo. A página de boas práticas de identidade da AWS descreve dois recursos úteis nessa etapa:
a verificação de acesso público e entre contas para tipos de recurso suportados, com achado gerado
de forma contínua para o recurso que permite esse tipo de acesso, e a informação de último uso de
papéis e credenciais, que mostra o que existe sem uso. Os dois alimentam a mesma fila.

A priorização precisa de um critério que sobreviva a auditoria. Três perguntas resolvem a maior
parte da fila: o achado expõe dado ou apenas descreve padrão de estilo; a correção quebra alguma
carga de trabalho em produção; e a linha do achado pertence a um controle herdado, compartilhado ou
exclusivo do cliente, conforme o [TEMA-01](TEMA-01-responsabilidade-compartilhada.md). Achado em
controle herdado se resolve com documento do provedor, não com mudança na conta.

A remediação em escala vem de política como código. O mesmo controle que a ferramenta de postura
verifica depois do deploy pode ser verificado antes, no pipeline, e aplicado como guardrail de
organização para impedir que a criação seja possível. A ordem importa: guardrail sem catálogo de
política vira exceção atrás de exceção.

### 5.3 Exemplo resolvido

Quatro achados da conta principal, com a decisão de fila.

1. Bucket de armazenamento com leitura pública. Benchmark de fundação do provedor, item de controle
   de acesso. Linha exclusiva do cliente. Dono: time de dados. Prazo: 24 horas. Ação: remover a
   política pública, verificar por qual caminho ela foi criada e adicionar guardrail que bloqueie a
   repetição. Evidência: captura do estado antes e depois, mais o identificador do guardrail.
2. Registro de auditoria do serviço de identidade desligado. Mesmo benchmark, item de registro. Dono:
   time de plataforma. Prazo: 48 horas. Ação: ligar o registro em todas as regiões contratadas e
   definir retenção conforme a política interna. Evidência: configuração de retenção e consulta de
   teste mostrando evento recente.
3. Token de conta com MFA não exigido para o usuário raiz. Benchmark de fundação, item de
   identidade. Dono: segurança. Prazo: 7 dias. Ação: exigir fator resistente a phishing e guardar as
   credenciais em custódia física. Evidência: registro de habilitação e lista de quem tem acesso.
4. Chave de acesso com mais de 180 dias e sem uso registrado. Item herdado da revisão de identidade.
   Dono: dono da aplicação. Prazo: 30 dias. Ação: migrar a aplicação para papel e desativar a chave.
   Evidência: registro de desativação e confirmação de funcionamento da aplicação.

Os dois primeiros entram na fila do dia. O terceiro entra na semana. O quarto vira item de projeto
com data, porque depende de mudança na aplicação. Nenhum deles aparece como "crítico" na planilha
sem dono e sem prazo.

### 5.4 Problema de completar

Continue a fila para três achados novos. Complete dono, prazo e evidência.

| Achado | Benchmark e item | Classificação da linha | Dono | Prazo | Evidência |
|---|---|---|---|---|---|
| Grupo de segurança permite entrada de qualquer origem na porta de administração | Fundação do provedor, item de rede | exclusiva do cliente | ______ | ______ | ______ |
| Serviço gerenciado de banco com cifra em repouso desligada | Fundação do provedor, item de armazenamento | ______ | ______ | ______ | ______ |
| Aplicação sem autenticação multifator para acesso de operador | Fundação do provedor, item de identidade | ______ | ______ | ______ | ______ |

## 6. Por que isso importa para o CISO

Contagem de achados é o indicador que mais desgasta a credibilidade de um programa de segurança,
porque cresce com a cobertura da ferramenta e não com o risco. A fila de correção, com dono, prazo
e evidência por item fechado, é o que permite responder à diretoria com tendência em vez de volume.

O segundo efeito é de prova de diligência. A resposta que resiste a auditoria de cliente e a
auditoria de certificação é o identificador do benchmark com a versão, a data da medição e a lista
de desvios aceitos com justificativa. É também a evidência que comprova ação depois de um incidente,
quando a pergunta passa a ser o que a empresa sabia e quando agiu.

O terceiro efeito é de custo de correção. O CCM reserva domínios distintos para controle de mudança e
gestão de configuração e para gestão de ameaça e vulnerabilidade, o que reflete a prática: o desvio
nasce na mudança, não na operação diária. Corrigir no pipeline custa menos do que corrigir em
produção, e um guardrail de organização custa menos do que uma campanha de correção recorrente.

## 7. Aplicação prática

Escolha o benchmark de fundação do provedor principal e fixe a versão em um documento de uma página.
Rode a avaliação e exporte os achados. Para os trinta primeiros, monte uma tabela com seis colunas:
identificador do item no benchmark, recurso, classificação de linha, dono, prazo e evidência
esperada. Marque a coluna de dono em vermelho onde estiver vazia e leve essa lista para a reunião de
mudança. Nos trinta itens, escolha três que possam virar guardrail e escreva a regra em uma linha
cada.

## 8. Autoexplicação

Explique em três frases a diferença entre desvio de configuração e vulnerabilidade de software, e
por que o desvio não desaparece quando o provedor publica uma correção. Conecte com algo que você já
faz hoje: a diferença entre o servidor instalado com a configuração padrão e o servidor instalado
como a norma interna manda.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Reduzir a contagem de achados é o objetivo | O número cai ao desligar a verificação e não mede risco | Meça desvio aceito, prazo vencido e reincidência por item de benchmark |
| Achado crítico da ferramenta é prioridade automática | A severidade da ferramenta não conhece a crítica do seu negócio nem a exposição real | Aplique exposição de dado, impacto de negócio e possibilidade de quebra como critério |
| Aceitar o achado sem registro resolve | Sem registro, a decisão não é auditável e volta a cada ciclo | Regra de desvio aceito exige motivo, aprovador, prazo e data de revisão |
| Configuração é tarefa só do time de plataforma | O dono do recurso é quem decide a mudança funcional | Atribua dono por recurso, com a plataforma como executor |
| Corrigir tudo de uma vez é o caminho mais rápido | Correção em massa quebra carga de trabalho e gera retrocesso | Priorize por exposição e proteja a correção com verificação antes do deploy |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite três versões atuais de benchmarks de fundação de provedor de nuvem publicados pela CIS.
2. Quais são as cinco etapas do ciclo de gestão de postura, na ordem em que você as usaria?
3. O que a documentação da AWS oferece para identificar recurso com acesso público e recurso com
   credencial sem uso?
4. Por que fixar a versão do benchmark antes de medir?

<details>
<summary>Conferir respostas</summary>

1. Amazon Web Services Foundations 7.0.0, Microsoft Azure Foundations 6.0.0 e Google Cloud
   Platform Foundation 5.0.0. A mesma lista traz Oracle Cloud Infrastructure Foundations 3.1.1, IBM
   Cloud Foundations 2.0.0 e Alibaba Cloud Foundation 2.0.0.
2. Medir contra a referência, triar por exposição, atribuir dono, corrigir ou aceitar com
   justificativa e prazo, verificar com nova medição e guardar a evidência.
3. A verificação de acesso público e entre contas para tipos de recurso suportados, que gera achado
   contínuo quando o recurso permite esse acesso, e a informação de último uso de papéis,
   permissões e credenciais.
4. Porque o item muda de identificador e de conteúdo entre versões, o que impede comparação da série
   histórica e permite que a mesma conta pareça melhorar apenas porque a referência mudou.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)).

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Refazer a triagem dos trinta achados e conferir se algum prazo venceu | Rebaixar: repetir em D+3 |
| D+30 | Verificar se algum item fechado voltou a aparecer na medição | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 09-aplicacoes-devsecops#TEMA-04 | a mesma checagem de configuração executada no pipeline evita que o desvio nasça no deploy |
| aplicado_em | 12-vulnerabilidades-threat-intel#TEMA-01 | a configuração desviante entra no inventário de exposição como item com dono e prazo, junto da vulnerabilidade de software |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Operação em nuvem e gestão de postura de configuração | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Controles do CCM de configuração e de gestão de mudança | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [CIS Benchmarks List, versões de fundação por provedor de nuvem](https://www.cisecurity.org/cis-benchmarks).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Google Cloud — Shared responsibilities and shared fate, revisado em 21/08/2023, declara que muitos incidentes resultam de configuração incorreta | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 2 | CIS Benchmarks List, com Amazon Web Services Foundations 7.0.0, Microsoft Azure Foundations 6.0.0 e Google Cloud Platform Foundation 5.0.0 | primaria | https://www.cisecurity.org/cis-benchmarks | "2026-09-25" | alta |
| 3 | CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios, com domínios de configuração, infraestrutura e monitoramento | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |
| 4 | AWS IAM — Security best practices, verificação de acesso público e entre contas e informação de último uso | primaria | https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html | "2026-09-25" | alta |
| 5 | AWS — Shared Responsibility Model, configuração do firewall do provedor entre as tarefas do cliente | primaria | https://aws.amazon.com/compliance/shared-responsibility-model/ | "2026-09-25" | alta |
| 6 | AWS Well-Architected Framework — Security Pillar, publicado em 6 de novembro de 2024 | primaria | https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html | "2026-09-25" | alta |

O episódio da seção 4 é composto para exercício. Nenhum percentual de redução de risco e nenhuma
estatística de incidente foram afirmados neste tema.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-identidade-e-acesso-em-nuvem.md) |
| Próximo tema | [TEMA-04](TEMA-04-workloads-e-containers.md) |
| Home | [README](../README.md) |
