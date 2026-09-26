---
fornecedor: "AWS, Microsoft, Google, Oracle e Cloud Security Alliance"
fornecedor_id: "07-cloud"
certificacoes_cobertas:
  - CLF-C02
  - SCS-C03
  - AZ-500
  - SC-200
  - SC-100
  - PCSE
  - OCI Security Professional
  - CCSK
  - CCZT
fontes:
  - titulo: "AWS Certified Cloud Practitioner"
    url: "https://aws.amazon.com/certification/certified-cloud-practitioner/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS Certified Security - Specialty"
    url: "https://aws.amazon.com/certification/certified-security-specialty/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Certified: Azure Security Engineer Associate"
    url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Professional Cloud Security Engineer Certification"
    url: "https://cloud.google.com/learn/certification/cloud-security-engineer"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA Education — CCSK, CCZT e demais certificados"
    url: "https://cloudsecurityalliance.org/education"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Certificações — Segurança em nuvem

Duas famílias convivem neste arquivo e não são intercambiáveis. Certificação de fornecedor mede implementação na plataforma daquele fornecedor: AWS Security - Specialty custa USD 300, tem 65 questões em 170 minutos e vale 3 anos; Professional Cloud Security Engineer, do Google Cloud, custa USD 200 mais imposto e tem 50 a 60 questões em 2 horas. Certificação neutra de fornecedor mede vocabulário e critério: o CCSK, da Cloud Security Alliance, cobre os 12 domínios do CSA Security Guidance v5.

Uma armadilha de tempo: a certificação Azure Security Engineer Associate, exame AZ-500, foi aposentada em 31 de agosto de 2026, conforme aviso na própria página da Microsoft.

## 1. Para que serve

Do lado do fornecedor, a credencial prova que a pessoa sabe configurar controle dentro de uma conta, de um tenant ou de um projeto. Do lado neutro, prova que a pessoa sabe discutir arquitetura, modelo de responsabilidade compartilhada e controle auditável sem depender do console de um fornecedor.

Para um CISO, o interesse é diferente em cada lado. A credencial de fornecedor serve para checar se o time entrega ou apenas opina sobre a plataforma que a empresa usa. A credencial neutra serve para dar linguagem comum entre nuvem, GRC e auditoria, e é a única das duas famílias que um CISO deve considerar fazer em nome próprio.

Nenhuma delas prova capacidade de negociar contrato, de avaliar cláusula de retenção de dado em nuvem ou de aceitar risco residual. Isso continua sendo trabalho de governança.

Sobre segurança de IA: não existe certificação consolidada, no nível de CISSP ou CISM, para segurança de IA. O que existe são credenciais recentes e específicas, como o Trusted AI Safety Expert da Cloud Security Alliance com a Northeastern University e as credenciais de IA da GIAC listadas em [`05-giac.md`](05-giac.md), várias ainda marcadas como novas ou em pré-venda. Trate como área sem padrão de mercado, não como trilha pronta.

## 2. Catálogo essencial

| Certificação | Sigla | Código do exame | Nível | Pré-requisito | URL oficial |
|---|---|---|---|---|---|
| AWS Certified Cloud Practitioner | CLF-C02 | CLF-C02 | foundational | sem pré-requisito formal | https://aws.amazon.com/certification/certified-cloud-practitioner/ |
| AWS Certified Security - Specialty | SCS-C03 | SCS-C03 | specialty | não exige certificação prévia; candidatos costumam ter Solutions Architect Associate ou Professional antes | https://aws.amazon.com/certification/certified-security-specialty/ |
| Microsoft Certified: Azure Security Engineer Associate | AZ-500 | AZ-500 | intermediate | aposentada em 31/08/2026 | https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/ |
| Microsoft Certified: Security Operations Analyst Associate | SC-200 | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | https://learn.microsoft.com/en-us/credentials/certifications/ |
| Microsoft Certified: Cybersecurity Architect Expert | SC-100 | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | https://learn.microsoft.com/en-us/credentials/certifications/ |
| Professional Cloud Security Engineer | PCSE | não há código; o exame é identificado pelo nome | professional | nenhum | https://cloud.google.com/learn/certification/cloud-security-engineer |
| Oracle Cloud Infrastructure Security Professional | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | NAO CONFIRMADO em fonte oficial | https://education.oracle.com |
| Certificate of Cloud Security Knowledge | CCSK | NAO CONFIRMADO em fonte oficial | fundamental | nenhum declarado | https://cloudsecurityalliance.org/education/ccsk |
| Certificate of Competence in Zero Trust | CCZT | NAO CONFIRMADO em fonte oficial | fundamental | nenhum declarado | https://cloudsecurityalliance.org/education/cczt/ |

Sobre a Oracle: a página de educação da Oracle não foi aberta nesta execução. Nenhuma credencial de segurança de OCI foi confirmada em fonte oficial, e o item deve ser reconferido antes de virar linha de orçamento.

## 3. Detalhe por certificação

### CLF-C02 — AWS Certified Cloud Practitioner

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | NAO CONFIRMADO em fonte oficial | |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | USD 100, mais imposto conforme o país | "2026-09-25" |
| Validade | 3 anos | |
| Treinamento oficial obrigatório | não | |
| Recertificação | três caminhos: o jogo Cloud Quest: Recertify Cloud Practitioner, a nova versão da própria prova, ou a aprovação em exame de nível Associate ou Professional | |
| Formato do exame | 65 questões, 90 minutos, múltipla escolha e múltipla resposta, em centro Pearson VUE ou online com proctoring | |

### SCS-C03 — AWS Certified Security - Specialty

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | NAO CONFIRMADO em fonte oficial | |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | USD 300, mais imposto conforme o país | "2026-09-25" |
| Validade | 3 anos | |
| Treinamento oficial obrigatório | não | |
| Recertificação | passar a versão vigente da prova antes do vencimento | |
| Formato do exame | 65 questões, 170 minutos, múltipla escolha e múltipla resposta | |

### AZ-500 — Microsoft Certified: Azure Security Engineer Associate

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | Quatro áreas avaliadas: proteger identidade e acesso; proteger rede; proteger computação, armazenamento e banco de dados; proteger Azure com Microsoft Defender for Cloud e Microsoft Sentinel | "2026-09-25" |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial: a página não publica preço | |
| Validade | encerrada: certificação e exame aposentados em 31/08/2026, sem renovação possível depois dessa data | |
| Treinamento oficial obrigatório | não | |
| Recertificação | não aplicável após a aposentadoria | |
| Formato do exame | proctorado, com componentes interativos possíveis; idiomas disponíveis incluem português do Brasil; retake liberado 24 horas após a primeira reprovação | |

### SC-200 — Microsoft Certified: Security Operations Analyst Associate

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | NAO CONFIRMADO em fonte oficial | |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial | |
| Validade | NAO CONFIRMADO em fonte oficial | |
| Treinamento oficial obrigatório | NAO CONFIRMADO em fonte oficial | |
| Recertificação | NAO CONFIRMADO em fonte oficial | |
| Formato do exame | NAO CONFIRMADO em fonte oficial | |

### SC-100 — Microsoft Certified: Cybersecurity Architect Expert

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | NAO CONFIRMADO em fonte oficial | |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial | |
| Validade | NAO CONFIRMADO em fonte oficial | |
| Treinamento oficial obrigatório | NAO CONFIRMADO em fonte oficial | |
| Recertificação | NAO CONFIRMADO em fonte oficial | |
| Formato do exame | NAO CONFIRMADO em fonte oficial | |

### PCSE — Professional Cloud Security Engineer

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | Configurar acesso; proteger comunicações e estabelecer proteção de fronteira; assegurar proteção de dados; gerenciar operações; apoiar requisitos de conformidade | "2026-09-25" |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | USD 200, mais imposto onde aplicável | |
| Validade | NAO CONFIRMADO em fonte oficial: a página remete às perguntas frequentes de renovação sem publicar o prazo | |
| Treinamento oficial obrigatório | não | |
| Recertificação | renovação dentro da janela de elegibilidade, conforme as perguntas frequentes de renovação | |
| Formato do exame | 50 a 60 questões de múltipla escolha e múltipla seleção, 2 horas, online com proctoring ou em centro de teste; experiência recomendada de 3 anos ou mais, sendo mais de 1 ano em Google Cloud | |

### OCI Security Professional — Oracle Cloud Infrastructure

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | NAO CONFIRMADO em fonte oficial | |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial | |
| Validade | NAO CONFIRMADO em fonte oficial | |
| Treinamento oficial obrigatório | NAO CONFIRMADO em fonte oficial | |
| Recertificação | NAO CONFIRMADO em fonte oficial | |
| Formato do exame | NAO CONFIRMADO em fonte oficial | |

### CCSK — Certificate of Cloud Security Knowledge

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | Os 12 domínios do CSA Security Guidance v5, com tópicos de zero trust, DevSecOps, telemetria e análise de segurança em nuvem e inteligência artificial | "2026-09-25" |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial: o token é comprado ou resgatado na plataforma de exames da CSA, que a página acessada não detalha em valor | |
| Validade | NAO CONFIRMADO em fonte oficial | |
| Treinamento oficial obrigatório | não | |
| Recertificação | NAO CONFIRMADO em fonte oficial | |
| Formato do exame | online, na plataforma de exames da CSA | |

### CCZT — Certificate of Competence in Zero Trust

| Campo | Valor | Verificado em |
|---|---|---|
| Domínios | Zero trust a partir dos componentes fundacionais publicados por CISA e NIST, do trabalho da CSA em Software Defined Perimeter e da orientação de especialistas da área | "2026-09-25" |
| Peso por domínio | NAO CONFIRMADO em fonte oficial | |
| Custo do exame | NAO CONFIRMADO em fonte oficial | |
| Validade | NAO CONFIRMADO em fonte oficial | |
| Treinamento oficial obrigatório | não | |
| Recertificação | NAO CONFIRMADO em fonte oficial | |
| Formato do exame | online, na plataforma de exames da CSA | |

## 4. Ordem recomendada para um CISO

Primeiro CCSK. É a credencial neutra de fornecedor, de menor custo relativo e a que dá ao CISO o vocabulário que aparece em reunião com auditoria, GRC e jurídico sem depender de qual nuvem a empresa usa.

Segundo AWS Certified Cloud Practitioner, apenas se a organização tiver carga relevante em AWS. Serve para o CISO acompanhar conversa de arquitetura e de custo, não para operar.

Terceiro, uma credencial de plataforma por vez, conforme a nuvem dominante: AWS Security - Specialty ou Professional Cloud Security Engineer. Custear para o time de segurança de nuvem. Escolher a plataforma majoritária e só depois abrir a segunda.

Quarto CCZT, se houver programa de zero trust em andamento e a empresa precisar de linguagem comum entre segurança, rede e identidade.

Duas exclusões. Não custear AZ-500: a credencial foi aposentada. Não custear SC-200 ou SC-100 antes de confirmar, em learn.microsoft.com, código, validade e modelo de renovação dos dois exames, que não foram confirmados nesta execução.

## 5. Custo total e manutenção

| Item | Valor | Fonte |
|---|---|---|
| AWS Cloud Practitioner, exame | USD 100 mais imposto | https://aws.amazon.com/certification/certified-cloud-practitioner/ |
| AWS Security - Specialty, exame | USD 300 mais imposto | https://aws.amazon.com/certification/certified-security-specialty/ |
| Desconto AWS após a primeira certificação | 50% no exame seguinte | https://aws.amazon.com/certification/certified-security-specialty/ |
| Recertificação AWS | por novo exame, ou pelo jogo Cloud Quest no caso do Cloud Practitioner; sem taxa adicional publicada na página acessada | https://aws.amazon.com/certification/certified-cloud-practitioner/ |
| Google Professional Cloud Security Engineer, exame | USD 200 mais imposto | https://cloud.google.com/learn/certification/cloud-security-engineer |
| Microsoft AZ-500, exame | NAO CONFIRMADO em fonte oficial | |
| Microsoft SC-200 e SC-100, exames | NAO CONFIRMADO em fonte oficial | |
| Oracle OCI, exame | NAO CONFIRMADO em fonte oficial | |
| CSA CCSK, token de exame | NAO CONFIRMADO em fonte oficial | |
| CSA CCZT, token de exame | NAO CONFIRMADO em fonte oficial | |
| Renovação das credenciais de nuvem | AWS vale 3 anos; Microsoft e Google não publicaram o prazo nas páginas acessadas de forma utilizável para este arquivo | |
| Curso de preparação | NAO CONFIRMADO em fonte oficial: AWS, Google e CSA vendem trilha de preparação, sem preço nas páginas acessadas | |

O ciclo de manutenção é o ponto de atenção orçamentária. AWS cobra a cada 3 anos, por novo exame, e oferece 50% de desconto no exame seguinte a quem já tem uma certificação ativa: certificar a equipe em sequência, um exame por vez, custa metade do que certificar todos em paralelo. As demais linhas ficam em aberto por falta de publicação de preço, e a Microsoft não publica tarifa de exame nas páginas de certificação.

## 6. Reconhecimento e equivalências

Nenhuma equivalência com DoD 8140, acreditação ANSI ou esquema nacional foi confirmada em fonte primária para as credenciais de nuvem deste arquivo.

## 7. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | AWS Certified Cloud Practitioner | primaria | https://aws.amazon.com/certification/certified-cloud-practitioner/ | "2026-09-25" | alta |
| 2 | AWS Certified Security - Specialty | primaria | https://aws.amazon.com/certification/certified-security-specialty/ | "2026-09-25" | alta |
| 3 | Microsoft Certified: Azure Security Engineer Associate | primaria | https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/ | "2026-09-25" | alta |
| 4 | Professional Cloud Security Engineer Certification | primaria | https://cloud.google.com/learn/certification/cloud-security-engineer | "2026-09-25" | alta |
| 5 | CSA Education — CCSK, CCZT e demais certificados | primaria | https://cloudsecurityalliance.org/education | "2026-09-25" | alta |
