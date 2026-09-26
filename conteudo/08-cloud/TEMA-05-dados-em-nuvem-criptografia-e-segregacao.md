---
tema: "Dados em nuvem: criptografia e segregação"
tema_id: "TEMA-05"
area_id: "08-cloud"
nivel: intermediario
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Decidir a custódia da chave para cada classe de dado em nuvem e escrever a decisão como requisito verificável, com dono e forma de revogação"
atende_objetivo: [5]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "07-criptografia-segredos#TEMA-04"
      motivo: "cifrar dado em nuvem depende de quem detém a chave e do ciclo de vida dela, e a décima segunda pergunta do fornecedor é quem consegue exportá-la"
    - alvo: "16-ia-seguranca#TEMA-03"
      motivo: "conjunto de treino e índice vetorial vivem em armazenamento gerenciado, e quem detém a chave decide o que acontece com eles"
  aprofundado_por: []
  aplicado_em:
    - alvo: "14-dados-privacidade#TEMA-03"
      motivo: "a cifra e a segregação decididas no desenho do dado em nuvem são executadas na retenção e no descarte"
  nao_confundir_com: []
fontes:
  - titulo: "AWS Key Management Service — visão geral, chaves protegidas por HSM validado em FIPS 140-3 nível 3, certificado 4884"
    url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model, dado, classificação, opções de cifra e permissões entre as tarefas do cliente em serviço abstrato"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27018:2019 — proteção de informação pessoal identificável em nuvem pública, edição 2, 23 páginas, retirada em 26 de agosto de 2025 e substituída por ISO/IEC 27018:2025"
    url: "https://www.iso.org/standard/76559.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-145 — The NIST Definition of Cloud Computing, setembro de 2011, com pool de recursos compartilhados entre as características essenciais"
    url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA — Cloud Controls Matrix v4.1, com domínios de criptografia, chave e gestão, e de segurança e privacidade de dado"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Dados em nuvem: criptografia e segregação

A documentação do serviço de gestão de chaves da AWS afirma que as chaves são protegidas por
módulos de hardware validados em FIPS 140-3 nível 3 e que nunca deixam o serviço sem cifra. A mesma
página descreve a hierarquia: existe uma chave raiz que protege as chaves de dado. Quem controla a
chave raiz controla o dado, e é essa a pergunta que decide a arquitetura de proteção em nuvem.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir decidir a custódia da chave para cada classe de dado em
nuvem e escrever a decisão como requisito verificável, com dono e forma de revogação.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-responsabilidade-compartilhada.md), que mostra que dado, classificação e opções
de cifra ficam com o cliente em qualquer modelo de serviço. Do
[07 Criptografia e segredos](../07-criptografia-segredos/README.md), o ciclo de vida de chave.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual é a diferença entre cifra padrão do provedor e cifra com chave gerenciada pelo cliente?
   Confiança: ___
2. O que decide quem consegue ler o dado cifrado em um serviço gerenciado?
   Confiança: ___
3. O que o pool de recursos compartilhados implica para o isolamento do dado?
   Confiança: ___
4. Quem pode afirmar ao titular que o dado dele está protegido: o provedor ou a empresa?
   Confiança: ___

## 4. Caso real

Uma empresa de serviços financeiros responde a questionário de cliente sobre proteção de dado em
nuvem e marca a opção "dado criptografado em repouso". O cliente pergunta em seguida quem detém a
chave, se ela pode ser exportada, qual é o processo de revogação e se alguém do provedor consegue
acessar o conteúdo. As quatro respostas não existem por escrito em nenhum lugar. O episódio é
composto para exercício.

A pergunta que o caso deixa aberta: cifra declarada sem decisão de custódia de chave responde qual
requisito.

## 5. Conteúdo

### 5.1 Conceito

Cifra em nuvem tem três camadas de decisão. A primeira é onde o dado fica, o que inclui a região, o
país e o limite lógico entre contas e projetos. A segunda é quem detém a chave, com dois extremos
conhecidos: chave gerenciada pelo provedor, em que ele opera o ciclo de vida inteiro, e chave
gerenciada pelo cliente dentro do serviço de chaves, em que a política de acesso à chave é da
empresa. A terceira é quem pode usar a chave, que se expressa em política de chave e não em
documentação de arquitetura.

O NIST SP 800-145 coloca o pool de recursos compartilhados entre as cinco características essenciais
do modelo. O mesmo hardware e o mesmo serviço atendem vários clientes, e a separação lógica entre
eles é o que impede que o dado de um apareça no contexto de outro. Essa separação é configuração:
conta, projeto, política de acesso e chave.

A AWS deixa explícito que, em serviço abstrato como armazenamento de objetos e banco de dados
abstrato, o cliente gerencia o dado, inclusive as opções de cifra, classifica os ativos e aplica as
permissões com as ferramentas de identidade. A Google escreve que decidir como e onde gerenciar as
chaves de cifra é uma decisão importante, ligada à responsabilidade de proteger o dado, e lista a
cifra padrão entre os controles herdados que podem compor a evidência de postura apresentada a
auditor ou regulador.

### 5.2 Como funciona

O mecanismo básico é a cifra em envelope, descrita na visão geral do serviço de chaves: a chave raiz
protege as chaves de dado, e as chaves de dado protegem o conteúdo. A chave raiz nunca sai do
serviço sem cifra, e o uso dela é autorizado pela política de chave. Isso significa que revogar
acesso ao dado não depende de encontrar cada cópia do arquivo; depende de controlar o uso da chave.

O ciclo de vida da chave tem estados que precisam constar em procedimento: criação com dono nomeado,
rotação por período declarado, desativação, destruição com prazo de espera e plano de continuidade
para o caso de a chave se tornar indisponível. A indisponibilidade da chave é a face menos discutida
da decisão: a mesma política que protege o dado pode parar a operação.

A segregação se escreve em três níveis. Nível de conta ou projeto, que é o limite mais forte e o que
impede que uma permissão errada alcance dado de outro domínio. Nível de rede, que define quem
consegue chegar ao serviço de dado. Nível de chave, que define quem consegue decifrar. Uma permissão
ampla de identidade pode atravessar os dois primeiros níveis, e a chave é a última barreira — quando
a política de chave também é ampla, não há barreira nenhuma.

Residência de dado aparece como decisão explícita. A Google registra que, para clientes na União
Europeia, a empresa é responsável por garantir que o dado coletado permaneça nas regiões europeias,
e cita controles de soberania oferecidos em determinados países. Residência é requisito de
arquitetura e de contrato, e não uma opção de configuração esquecida.

### 5.3 Exemplo resolvido

Quatro classes de dado, com a decisão escrita.

1. Dado pessoal de cliente em banco gerenciado. Chave gerenciada pelo cliente no serviço de chaves
   do provedor, com política que autoriza apenas o papel do serviço de banco. Dono: segurança da
   informação. Verificação: consulta de política de chave, registro de rotação anual e teste de
   leitura negada com um papel sem permissão. Revogação: desativar a chave interrompe o acesso em
   minutos, com procedimento de emergência assinado pelo dono do processo.
2. Relatório analítico agregado em armazenamento de objetos, sem dado pessoal. Chave gerenciada pelo
   provedor, aceitando a cifra padrão. Dono: time de dados. Verificação: declaração do provedor
   registrada como controle herdado no anexo de segurança.
3. Log de auditoria da conta. Chave gerenciada pelo cliente em cofre separado da conta de produção,
   com política que impede exclusão pelos administradores das cargas. Dono: segurança. Verificação:
   política da chave e teste de tentativa de exclusão negada.
4. Cópia de dado pessoal transferida para outro país. Depende de base contratual e de região
   autorizada; a decisão técnica é manter a cifra com chave mantida no país de origem. Dono:
   encarregado pelo tratamento de dados, com o time de plataforma como executor. Verificação:
   registro da região do recurso e da localização da chave.

A ordem importa: a classe de dado define a decisão de chave, e a decisão de chave define a evidência.
Inverter a ordem produz o problema do caso da seção 4.

### 5.4 Problema de completar

Complete as duas últimas colunas e a forma de revogação para cada linha.

| Classe de dado | Custódia da chave | Dono | Evidência de verificação | Revogação |
|---|---|---|---|---|
| Credencial de cliente em banco gerenciado | chave do cliente | ______ | política de chave e teste de leitura negada | ______ |
| Imagem de exame armazenada por dez anos | ______ | ______ | ______ | ______ |
| Índice de busca reconstruível | chave do provedor | time de busca | ______ | ______ |

## 6. Por que isso importa para o CISO

Cifra declarada sem custódia de chave definida é afirmação sem controle por trás. Quando o cliente
corporativo ou o regulador pergunta quem detém a chave, qual é o processo de revogação e se alguém
do provedor alcança o conteúdo, a resposta auditável é a política de chave com dono e o registro de
quem a alterou. A mesma resposta vale em negociação de seguro e em due diligence de aquisição.

O segundo efeito é de classificação. A ISO/IEC 27018:2019, retirada em agosto de 2025 e substituída
pela edição 2025, tratava exatamente da proteção de informação pessoal identificável em nuvem
pública por organizações que atuam como processadoras sob contrato, com objetivos de controle
próprios e princípios de privacidade como referência. Isso mostra que proteção de dado pessoal em
nuvem tem critério publicado, e a decisão de custódia de chave é parte da resposta.

O terceiro efeito é operacional. O mesmo controle que impede acesso indevido pode parar a operação
quando a chave fica indisponível. Sem procedimento de emergência e sem dono nomeado, a primeira
chamada em incidente vira discussão sobre quem tem permissão de reativar a chave.

## 7. Aplicação prática

Liste os cinco conjuntos de dados mais sensíveis que a empresa mantém em nuvem. Para cada um,
responda por escrito: região onde está, serviço que o guarda, quem detém a chave, quem pode usar a
chave, qual é o prazo de rotação e o que acontece com a operação se a chave ficar indisponível. Leve
as duas respostas que você não conseguir preencher para o time de plataforma e transforme cada uma em
item com data.

## 8. Autoexplicação

Explique em três frases o que a cifra em envelope muda na hora de revogar acesso a um dado. Conecte
com algo que você já faz hoje: a chave do cofre de senhas é o mesmo problema, com o mesmo risco de
indisponibilidade.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Cifra em repouso ligada significa dado protegido | Sem política de chave restrita, quem tem permissão ampla decifra | Escreva quem pode usar a chave, não só que a cifra existe |
| Chave gerenciada pelo cliente é sempre melhor | Aumenta a responsabilidade operacional e o risco de indisponibilidade | Escolha por classe de dado, com base em requisito e impacto |
| Segregação por pasta resolve o isolamento | Pasta dentro da mesma conta depende de permissão correta em cada caminho | Use limite de conta ou projeto para o que precisa de isolamento forte |
| A cifra padrão do provedor pode ser apresentada como controle próprio | A cifra padrão é controle herdado, com dono no provedor | Registre-a como herdada e não como controle implementado por você |
| Perder a chave é risco aceitável em troca de segurança | Indisponibilidade de chave é interrupção de operação | Tenha procedimento de emergência com dono e teste registrado |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Descreva a hierarquia de chave usada na cifra em envelope e onde a chave raiz fica.
2. O que a AWS atribui ao cliente em serviço de armazenamento de objetos abstrato?
3. Cite os três níveis em que a segregação de dado se escreve, do mais forte ao mais dependente de
   configuração.
4. Qual documento trata da proteção de informação pessoal identificável em nuvem pública por quem
   atua como processador, e qual é a situação da edição confirmada nesta execução?

<details>
<summary>Conferir respostas</summary>

1. A chave raiz protege as chaves de dado, e estas protegem o conteúdo. A chave raiz é criada,
   gerenciada, usada e destruída dentro do serviço de chaves e não sai dele sem cifra; o uso é
   autorizado pela política de chave.
2. Gerenciar o dado, o que inclui as opções de cifra, classificar os ativos e aplicar as permissões
   com as ferramentas de identidade.
3. Limite de conta ou projeto; política de rede que define quem alcança o serviço de dado; e
   política de chave, que define quem decifra.
4. A ISO/IEC 27018:2019, edição 2, com 23 páginas, alinhada a princípios de privacidade e voltada a
   quem atua como processador em nuvem pública sob contrato. A edição está retirada desde
   26/08/2025 e foi substituída pela ISO/IEC 27018:2025.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)).

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Abrir a política de chave de dois recursos e conferir quem pode usá-la | Rebaixar: repetir em D+3 |
| D+30 | Testar o procedimento de emergência de chave indisponível em ambiente controlado | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 14-dados-privacidade#TEMA-03 | a cifra e a segregação decididas no desenho do dado em nuvem são executadas na retenção e no descarte |
| complementa | 07-criptografia-segredos#TEMA-04 | cifrar dado em nuvem depende de quem detém a chave e do ciclo de vida dela, e a décima segunda pergunta do fornecedor é quem consegue exportá-la |
| complementa | 16-ia-seguranca#TEMA-03 | conjunto de treino e índice vetorial vivem em armazenamento gerenciado, e quem detém a chave decide o que acontece com eles |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Proteção de dado em nuvem, cifra e ciclo de vida de chave | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Controles do CCM de proteção de dado e de segregação | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [AWS Key Management Service, visão geral do serviço de chaves](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | AWS KMS — visão geral, chaves protegidas por HSM validado em FIPS 140-3 nível 3, certificado 4884, hierarquia de chave raiz e política de chave | primaria | https://docs.aws.amazon.com/kms/latest/developerguide/overview.html | "2026-09-25" | alta |
| 2 | AWS — Shared Responsibility Model, dado, classificação, opções de cifra e permissões com o cliente em serviço abstrato | primaria | https://aws.amazon.com/compliance/shared-responsibility-model/ | "2026-09-25" | alta |
| 3 | Google Cloud — Shared responsibilities and shared fate, revisado em 21/08/2023, decisão sobre gestão de chaves e cifra padrão como controle herdado | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 4 | ISO/IEC 27018:2019, edição 2, 23 páginas, retirada em 26/08/2025 e substituída por ISO/IEC 27018:2025 | primaria | https://www.iso.org/standard/76559.html | "2026-09-25" | alta |
| 5 | NIST SP 800-145, setembro de 2011, pool de recursos compartilhados entre as cinco características essenciais | primaria | https://csrc.nist.gov/pubs/sp/800/145/final | "2026-09-25" | alta |
| 6 | CSA — Cloud Controls Matrix v4.1, domínios de criptografia, chave e gestão, e de segurança e privacidade de dado | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |

O episódio da seção 4 é composto para exercício. Detalhes de custódia externa de chave e de
módulo de hardware dedicado por provedor não foram pesquisados nesta execução e não são afirmados
aqui.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-workloads-e-containers.md) |
| Próximo tema | [TEMA-06](TEMA-06-governanca-multicloud-e-contrato.md) |
| Home | [README](../README.md) |
