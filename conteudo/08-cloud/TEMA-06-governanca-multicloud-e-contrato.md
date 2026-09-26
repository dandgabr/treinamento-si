---
tema: "Governança multi-cloud e contrato"
tema_id: "TEMA-06"
area_id: "08-cloud"
nivel: avancado
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Montar o anexo de segurança e privacidade de um contrato de nuvem, ligando cada cláusula a um controle publicado e a um item de evidência"
atende_objetivo: [6]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: ["TEMA-01", "TEMA-05"]
relacoes:
  complementa:
    - alvo: "14-dados-privacidade#TEMA-05"
      motivo: "a transferência internacional só se materializa em cláusula contratual e anexo de garantias no contrato de nuvem"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-02"
      motivo: "a exigência de segurança do fornecedor vira norma interna publicada, com escopo, responsável e critério verificável"
  nao_confundir_com: []
fontes:
  - titulo: "CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios, com CAIQ e STAR Registry"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27017:2015 — controles para serviços em nuvem, dirigida a provedor e a cliente, edição 1, 30 páginas, retirada em 27 de julho de 2026 e substituída por ISO/IEC 27017:2026"
    url: "https://www.iso.org/standard/43757.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27018:2019 — proteção de informação pessoal identificável em nuvem pública por quem atua como processador sob contrato, edição 2, 23 páginas, retirada em 26 de agosto de 2025 e substituída por ISO/IEC 27018:2025"
    url: "https://www.iso.org/standard/76559.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model, com uso da documentação de controle e conformidade do provedor na avaliação do cliente"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-144 — Guidelines on Security and Privacy in Public Cloud Computing, dezembro de 2011, com considerações sobre terceirizar dado, aplicação e infraestrutura"
    url: "https://csrc.nist.gov/pubs/sp/800/144/final"
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

# Governança multi-cloud e contrato

O CCM da CSA, na versão 4.1, traz 197 control objectives em 17 domínios e declara servir para dizer
qual ator da cadeia de nuvem implementa cada controle. Do outro lado da mesa, o cliente corporativo
manda um questionário e espera resposta. Governar nuvem é transformar essa troca em cláusula
assinada, controle com dono e evidência arquivada.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir montar o anexo de segurança e privacidade de um contrato de
nuvem, ligando cada cláusula a um controle publicado e a um item de evidência.

## 2. Pré-requisitos

O [TEMA-01](TEMA-01-responsabilidade-compartilhada.md), que produz a matriz de responsabilidade que
o contrato precisa refletir, e o
[TEMA-05](TEMA-05-dados-em-nuvem-criptografia-e-segregacao.md), que define a custódia da chave e a
residência do dado declaradas em anexo.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantos contratos de nuvem a empresa assinou e em quantos alguém de segurança leu a cláusula de auditoria? Chute os dois números.
   Confiança: ___
2. Se o provedor principal dobrasse o preço amanhã, quanto tempo você estima para mover a carga crítica para outro provedor?
   Confiança: ___
3. O contrato atual protege a empresa numa saída de provedor? Anote o que ele garante hoje, por escrito ou não.
   Confiança: ___

## 4. Caso real

Uma empresa assina contrato de nuvem com desconto por compromisso de três anos e sem anexo de
segurança. Dois anos depois, o provedor muda a política de retenção de log do serviço que guarda
dado de cliente, e a área de segurança descobre pelo questionário anual do cliente corporativo.
Nada no contrato obriga aviso prévio de mudança de controle. O episódio é composto para exercício.

A pergunta que o caso deixa aberta: quais cláusulas precisam existir antes da assinatura para que a
mudança de controle seja gerenciável.

## 5. Conteúdo

### 5.1 Conceito

Governança de nuvem tem três objetos. O catálogo de serviços aprovados, que diz o que pode ser
contratado e por quem. O anexo de segurança e privacidade, que traduz o catálogo em obrigação do
fornecedor. E a evidência, que é o que sobra quando a auditoria pergunta se o combinado foi
cumprido. Sem o primeiro, a empresa contrata por fora; sem o segundo, a exigência depende do humor
do fornecedor; sem o terceiro, a resposta é declaração.

A referência publicada para o anexo existe. O CCM da CSA organiza 197 control objectives em 17
domínios e tem o propósito declarado de indicar qual ator da cadeia implementa cada controle, com
questionário de respostas de sim ou não para avaliar provedor e registro público de autoavaliação. A
ISO/IEC 27017:2015, retirada em 27 de julho de 2026 e substituída pela edição 2026, entregava
orientação de implementação adicional e controles adicionais específicos de serviço em nuvem,
dirigidos ao provedor e ao cliente. A ISO/IEC 27018:2019, retirada em agosto de 2025 e substituída
pela edição 2025, tratava da proteção de informação pessoal identificável por quem atua como
processador em nuvem pública sob contrato.

A Microsoft publica a divisão de responsabilidade como matriz de governança, com aviso explícito de
que o documento é orientação ilustrativa e não conclui questão jurídica nem altera contrato. Essa
frase é útil na mesa de negociação: o modelo compartilhado orienta, e o contrato decide.

### 5.2 Como funciona

O anexo se constrói em sete blocos, e cada bloco tem controle de referência e item de evidência.

Escopo e papéis: quais serviços, quais regiões, quais dados e quem é controlador e quem é operador.
Controle de referência: matriz de responsabilidade e domínio de governança, risco e conformidade do
CCM. Evidência: tabela de serviço, região e classificação de dado.

Controle de acesso e privilégio do fornecedor: quem do provedor pode alcançar o dado, com qual
registro e por qual aprovação. Controle de referência: domínio de identidade e acesso do CCM.
Evidência: política de acesso do suporte e registro de sessão privilegiada.

Cifra e custódia de chave: quem detém a chave, se ela pode ser exportada e qual é o procedimento de
revogação. Controle de referência: domínio de criptografia, cifra e gestão de chave do CCM.
Evidência: política de chave e documentação do serviço de chaves.

Localização e transferência: onde o dado fica, onde o backup fica e sob quais garantias ele cruza
fronteira. Controle de referência: domínio de segurança e privacidade de dado do CCM. Evidência:
registro de região do recurso e instrumento contratual de transferência.

Cadeia de subcontratados: lista de subcontratados, critério de aprovação, aviso prévio de mudança e
direito de objeção. Controle de referência: domínio de gestão de cadeia de suprimentos,
transparência e accountability do CCM. Evidência: lista publicada e registro de notificação.

Incidente e notificação: prazo de aviso à empresa, conteúdo mínimo do aviso, canal e apoio à
investigação. Controle de referência: domínio de gestão de incidente e forense em nuvem do CCM.
Evidência: registro da notificação e relatório de incidente do provedor.

Auditoria e evidência: quais relatórios de terceiro o provedor entrega, com que frequência, e qual é
o direito de verificação da empresa. Controle de referência: domínio de auditoria e garantia do CCM,
com a documentação de controle do provedor como fonte para a verificação do cliente. Evidência:
pacote de conformidade, relatório de auditoria vigente e questionário respondido.

Saída e portabilidade entra como oitavo bloco, muitas vezes esquecido: formato de exportação, prazo
de apoio na migração, prazo de eliminação do dado depois do encerramento e o que acontece com a
chave. Controle de referência: domínio de interoperabilidade e portabilidade do CCM. Evidência:
procedimento de exportação testado e termo de eliminação.

Multi-cloud adiciona uma camada acima do contrato. Cada provedor tem catálogo de controles e
benchmark próprios, o que significa que o mesmo controle pode ter nome diferente em cada ambiente.
O papel da governança é manter um mapa único de controle para os vários provedores, com guardrails
aplicados no nível da organização, catálogo de serviço aprovado e política de identidade comum. A
Google descreve instrumentos equivalentes no seu lado: zonas de aterrissagem, modelos de implantação
com configuração segura por padrão, política de organização aplicada ao longo da hierarquia de
pastas e projetos e produto dedicado a obrigações de conformidade.

### 5.3 Exemplo resolvido

Empresa com dois provedores e quatro serviços críticos. Montagem do anexo em cinco passos.

1. Fixar o escopo: nomear os quatro serviços, as regiões permitidas e as classes de dado que podem
   entrar em cada um. Registrar a matriz de responsabilidade de cada serviço, conforme o TEMA-01.
2. Escolher o catálogo de controle: adotar o CCM como estrutura única e mapear, para cada um dos 17
   domínios, os controles aplicáveis aos quatro serviços.
3. Escrever as cláusulas dos sete blocos, com prazo e obrigação verificável em cada uma: aviso de
   subcontratado novo em prazo definido, notificação de incidente em prazo definido, entrega anual de
   relatório de auditoria e direito de verificação documental.
4. Definir a evidência por cláusula e o responsável por arquivá-la, com local único e prazo de
   retenção. Sem isso, o anexo vira promessa.
5. Testar a saída: exportar uma base de teste para formato aberto e medir o tempo gasto. O resultado
   define o prazo realista de migração que será escrito no contrato.

No passo 3, duas cláusulas costumam decidir a negociação: a de notificação de incidente, com prazo e
conteúdo mínimo, e a de aviso prévio de mudança de controle de segurança. Sem a segunda, o episódio
da seção 4 se repete.

### 5.4 Problema de completar

Complete o mapa de três cláusulas que faltam.

| Cláusula | Domínio de referência no CCM | Evidência | Dono na empresa |
|---|---|---|---|
| Aviso prévio de inclusão de subcontratado | ______ | lista publicada e registro de notificação | ______ |
| Notificação de incidente de segurança | gestão de incidente e forense em nuvem | ______ | ______ |
| Direito de verificação de controle | auditoria e garantia | ______ | segurança |
| Prazo de eliminação de dado após encerramento | ______ | ______ | ______ |

## 6. Por que isso importa para o CISO

A discussão de contrato de nuvem é onde a área de segurança tem poder de decisão real, porque a
cláusula assinada vale mais que qualquer promessa de roadmap. A Microsoft declara que o material
público de responsabilidade é orientação de governança e não altera contrato; a AWS declara que o
cliente usa a documentação de controle e conformidade do provedor para executar seus próprios
procedimentos de avaliação e verificação. Sem anexo escrito, o CISO fica com a parte fraca das duas
frases.

O segundo efeito é de custo de auditoria. Cada questionário de cliente respondido do zero consome
horas de time técnico. Com anexo mapeado em um catálogo único de controle e com evidência arquivada,
a resposta passa a ser encaminhar o documento. Em organização com dois provedores, esse efeito
multiplica.

O terceiro efeito é de risco concentrado. A saída é a única cláusula que só serve no pior dia, e é a
primeira a ser retirada da minuta. Testar exportação antes da assinatura é o que impede que a
migração de emergência dependa de boa vontade do fornecedor.

## 7. Aplicação prática

Pegue o contrato de nuvem mais relevante da empresa e liste, em uma página, as sete cláusulas da
seção 5.2 com três colunas: existe, tem prazo verificável, tem evidência arquivada. Leve a página ao
jurídico e ao time de compras e transforme cada linha vazia em item de renegociação com data. Se o
contrato estiver dentro do prazo de renovação, use o momento para incluir a cláusula de aviso prévio
de mudança de controle de segurança.

## 8. Autoexplicação

Explique em três frases por que o anexo de segurança existe além do relatório de auditoria do
provedor. Conecte com algo que você já faz hoje: o contrato de serviço terceirizado que a empresa
assinou nos últimos doze meses tem quantas das sete cláusulas.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Certificado do provedor substitui o anexo | Certificado atesta o ambiente dele e não obriga aviso, prazo ou verificação | Escreva obrigação verificável por cláusula |
| Auditoria direta é o padrão de mercado | Na prática o que se entrega é relatório de terceiro e questionário respondido | Negocie direito de verificação documental com prazo e escopo |
| Portabilidade é problema do futuro | Cláusula de saída só tem valor antes da assinatura | Teste a exportação e escreva o prazo de apoio antes de renovar |
| Multi-cloud é só multiplicar contratos | Cada provedor nomeia o mesmo controle de forma diferente | Mantenha um mapa único de controle e um catálogo aprovado |
| Dado pessoal em nuvem é assunto só de privacidade | A garantia técnica e a contratual precisam estar no mesmo anexo | Trate custódia de chave, região e transferência no mesmo documento |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quantos control objectives e quantos domínios tem o CCM na versão 4.1, e qual é o propósito
   declarado dele quanto aos atores da cadeia?
2. Cite quatro dos blocos do anexo de segurança e um controle de referência para cada um.
3. Quais são as duas cláusulas que mais mudam a situação da empresa em incidente e em mudança de
   controle?
4. Qual é a situação das edições ISO/IEC 27017 e ISO/IEC 27018 confirmadas nesta execução?

<details>
<summary>Conferir respostas</summary>

1. 197 control objectives em 17 domínios, com o propósito declarado de orientar qual ator da cadeia
   de nuvem deve implementar cada controle, além de questionário de respostas de sim ou não e
   registro de autoavaliação.
2. Escopo e papéis, com governança, risco e conformidade; controle de acesso e privilégio do
   fornecedor, com identidade e acesso; cifra e custódia de chave, com criptografia e gestão de
   chave; localização e transferência, com segurança e privacidade de dado; cadeia de subcontratados,
   com gestão de cadeia de suprimentos; incidente e notificação, com gestão de incidente e forense;
   auditoria e evidência, com auditoria e garantia; saída, com interoperabilidade e portabilidade.
3. A cláusula de notificação de incidente, com prazo e conteúdo mínimo, e a de aviso prévio de
   mudança de controle de segurança.
4. A ISO/IEC 27017:2015 está retirada desde 27/07/2026 e foi substituída pela ISO/IEC 27017:2026; a
   ISO/IEC 27018:2019 está retirada desde 26/08/2025 e foi substituída pela ISO/IEC 27018:2025.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)).

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Conferir quais cláusulas do contrato em vigor têm evidência arquivada | Rebaixar: repetir em D+3 |
| D+30 | Testar a exportação de uma base e medir o tempo real | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-02 | a exigência de segurança do fornecedor vira norma interna publicada, com escopo, responsável e critério verificável |
| complementa | 14-dados-privacidade#TEMA-05 | a transferência internacional só se materializa em cláusula contratual e anexo de garantias no contrato de nuvem |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Governança de nuvem, contrato e saída de provedor | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Controles do CCM, anexo de segurança e direito de auditoria | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [CSA Cloud Controls Matrix v4.1 e questionário CAIQ](https://cloudsecurityalliance.org/research/cloud-controls-matrix).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios, CAIQ, STAR Registry e mapa de atores da cadeia | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |
| 2 | ISO/IEC 27017:2015, edição 1, 30 páginas, dirigida a provedor e a cliente, retirada em 27/07/2026 e substituída por ISO/IEC 27017:2026 | primaria | https://www.iso.org/standard/43757.html | "2026-09-25" | alta |
| 3 | ISO/IEC 27018:2019, edição 2, 23 páginas, processador de informação pessoal identificável sob contrato, retirada em 26/08/2025 e substituída por ISO/IEC 27018:2025 | primaria | https://www.iso.org/standard/76559.html | "2026-09-25" | alta |
| 4 | AWS — Shared Responsibility Model, documentação de controle e conformidade usada pelo cliente na verificação | primaria | https://aws.amazon.com/compliance/shared-responsibility-model/ | "2026-09-25" | alta |
| 5 | Google Cloud — Shared responsibilities and shared fate, revisado em 21/08/2023, com zonas de aterrissagem, modelos com configuração segura e política de organização | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 6 | NIST SP 800-144 — considerações sobre terceirizar dado, aplicação e infraestrutura, dezembro de 2011 | primaria | https://csrc.nist.gov/pubs/sp/800/144/final | "2026-09-25" | alta |
| 7 | AWS Well-Architected Framework — Security Pillar, publicado em 6 de novembro de 2024 | primaria | https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html | "2026-09-25" | alta |

Prazo de notificação de incidente exigido por lei ou por regulador específico não é afirmado neste
tema; o prazo citado na seção 5.2 é o que a empresa negocia em contrato. O episódio da seção 4 é
composto para exercício.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-dados-em-nuvem-criptografia-e-segregacao.md) |
| Home | [README](../README.md) |
