---
tema: "Modelo de responsabilidade compartilhada"
tema_id: "TEMA-01"
area_id: "08-cloud"
nivel: intermediario
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Classificar os controles de um serviço de nuvem em herdados, compartilhados e exclusivos do cliente, atribuindo dono e evidência a cada linha"
atende_objetivo: [1]
certificacoes: ["CCSP", "CCSK"]
pre_requisitos: []
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "06-endpoint-plataforma#TEMA-06"
      motivo: "o modelo decide até onde a correção do sistema operacional convidado e da imagem é sua e a partir de onde o provedor responde"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-145 — The NIST Definition of Cloud Computing, setembro de 2011, DOI 10.6028/NIST.SP.800-145"
    url: "https://csrc.nist.gov/pubs/sp/800/145/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-144 — Guidelines on Security and Privacy in Public Cloud Computing, dezembro de 2011, DOI 10.6028/NIST.SP.800-144"
    url: "https://csrc.nist.gov/pubs/sp/800/144/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model, com controles herdados, compartilhados e exclusivos do cliente"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Learn — Shared responsibility in the cloud, matriz por modelo de implantação, última atualização em 24 de agosto de 2026"
    url: "https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Google Cloud — Shared responsibilities and shared fate on Google Cloud, revisado em 21 de agosto de 2023"
    url: "https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios, com definição de papéis entre provedor e cliente"
    url: "https://cloudsecurityalliance.org/research/cloud-controls-matrix"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27017:2015 — controles para serviços em nuvem, aplicável a provedor e a cliente, retirada em 27 de julho de 2026 e substituída por ISO/IEC 27017:2026"
    url: "https://www.iso.org/standard/43757.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Modelo de responsabilidade compartilhada

A matriz pública da Microsoft atribui ao cliente, em qualquer modelo de implantação, quatro itens:
dados, endpoints, contas e gestão de acesso. A página da AWS divide o resto entre segurança *of* the
cloud, do provedor, e segurança *in* the cloud, do cliente, e acrescenta que a fatia do cliente
depende do serviço escolhido. Governar nuvem começa por escrever essa fronteira para o seu ambiente,
porque nenhuma das duas páginas sabe quais serviços você usa.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir classificar os controles de um serviço de nuvem em
herdados, compartilhados e exclusivos do cliente, atribuindo dono e evidência a cada linha.

## 2. Pré-requisitos

O vocabulário de ativo, controle preventivo e controle detectivo do
[01 Fundamentos](../01-fundamentos/README.md). Nada dentro desta área.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Em um banco de dados gerenciado, quem aplica a correção de segurança do sistema operacional?
   Confiança: ___
2. O certificado ISO/IEC 27001 do provedor cobre a configuração do bucket que o seu time criou?
   Confiança: ___
3. Em uma máquina virtual alugada, quem responde pela configuração do firewall de rede que controla
   o tráfego de entrada?
   Confiança: ___
4. Quem responde pelo controle físico de acesso ao datacenter?
   Confiança: ___

## 4. Caso real

Uma indústria move o banco de dados do ERP para um serviço gerenciado de nuvem e mantém o servidor
de integração em máquina virtual. Na auditoria seguinte, o auditor pede três evidências: registro de
aplicação de correção de segurança do sistema operacional do banco, política de rede que restringe o
acesso ao banco e controle de acesso físico ao datacenter. O time entrega o certificado do provedor
para as três e recebe recusa em duas delas. As matrizes oficiais dos três provedores explicam por
quê; o episódio é composto para exercício e não descreve um incidente público identificado.

A pergunta que o caso deixa aberta: quais linhas do controle ficam com o provedor, quais são
divididas e quais são suas em qualquer serviço.

## 5. Conteúdo

### 5.1 Conceito

O NIST SP 800-145, de setembro de 2011, define cloud computing como modelo de acesso sob demanda,
por rede, a um pool compartilhado de recursos configuráveis, com provisionamento e liberação
rápidos e mínimo esforço de gestão. O mesmo documento fecha o modelo em cinco características
essenciais, três modelos de serviço e quatro modelos de implantação. A característica de pool de
recursos compartilhados é a raiz do problema: o mesmo hardware, a mesma rede e o mesmo hipervisor
atendem vários clientes, e a divisão de quem opera o quê passa a ser contratual e documental.

A AWS nomeia as duas metades. Segurança *of* the cloud é do provedor e cobre hardware, software,
rede e instalações que executam os serviços. Segurança *in* the cloud é do cliente e é determinada
pelos serviços selecionados: em máquina virtual, o cliente cuida do sistema operacional convidado,
das correções, das aplicações instaladas e da configuração do firewall do provedor; em
armazenamento de objetos e em banco de dados abstrato, o provedor opera infraestrutura, sistema
operacional e plataforma, e o cliente responde pelos dados, pela classificação, pelas opções de
cifra e pelas permissões.

A Microsoft publica a divisão como matriz de responsabilidade por área do stack, nas colunas
on-premises, IaaS, PaaS e SaaS. A linha de sistema operacional pertence ao cliente em on-premises e
em IaaS e passa ao provedor em PaaS e SaaS; a linha de controles de rede pertence ao cliente em
on-premises e IaaS, é compartilhada em PaaS e é do provedor em SaaS. Quatro linhas não saem do
cliente em nenhuma coluna: dados, endpoints, identidade e usuários, e configurações.

A Google formula o resíduo de outra maneira: o provedor responde sempre pela rede e pela
infraestrutura de base, e o cliente responde sempre pelas suas políticas de acesso e pelos seus
dados. A mesma página descreve o modelo de serviço de função como próximo do SaaS em divisão de
responsabilidade, e reconhece que o modelo de responsabilidade compartilhada é difícil de aplicar
porque cada serviço tem perfil de configuração próprio.

### 5.2 Como funciona

A AWS organiza o controle em três famílias que dão o vocabulário mais útil para a matriz de uma
organização. Controle herdado é o que o cliente recebe pronto, e o exemplo dado é o controle físico
e ambiental. Controle compartilhado é o que existe nas duas camadas com implementações diferentes: a
gestão de correção aparece como responsabilidade do provedor na infraestrutura e do cliente no
sistema operacional convidado e nas aplicações; a gestão de configuração vale para os
equipamentos do provedor e para os sistemas, bancos de dados e aplicações do cliente; a
conscientização e o treinamento são feitos pelo provedor com seus funcionários e pelo cliente com
os seus. Controle exclusivo do cliente é o que deriva da aplicação que ele implanta, e o exemplo é o
zoneamento e o roteamento de dados em ambientes específicos.

A consequência operacional tem três passos. Primeiro, a linha do controle é localizada na matriz do
provedor para aquele serviço, não para a nuvem em geral. Segundo, a linha recebe dono nomeado no
organograma da empresa. Terceiro, a linha recebe o artefato de evidência: para o herdado, o
documento de conformidade do provedor; para o compartilhado, o registro da parte que cabe ao
cliente; para o exclusivo, o registro produzido pelo próprio cliente.

A ISO/IEC 27017:2015, retirada em 27 de julho de 2026 e substituída pela edição 2026, tratava
exatamente desse ponto: entregava orientação adicional de implementação para controles da
ISO/IEC 27002 e controles adicionais para serviços em nuvem, e era dirigida tanto ao provedor de
serviço em nuvem quanto ao cliente. O CCM da CSA, versão 4.1, faz o mesmo por outra via, com 197
control objectives em 17 domínios e a proposta de indicar qual ator da cadeia implementa cada
controle.

### 5.3 Exemplo resolvido

Serviço: banco de dados relacional gerenciado, com armazenamento criptografado. Classificação de
seis controles.

1. Acesso físico ao datacenter. Controle herdado. Dono: provedor. Evidência: relatório de auditoria
   de terceiro listado na página de conformidade, mais o registro de que o serviço está na região
   contratada.
2. Correção do sistema operacional do banco. Controle herdado pelo cliente no serviço gerenciado.
   Dono: provedor. Evidência: janela de manutenção declarada e histórico de versão do motor na
   console.
3. Correção do motor do banco, na versão principal que depende de decisão do cliente. Compartilhado.
   Dono: time de banco de dados. Evidência: registro da aprovação da janela de atualização e da
   versão em produção por instância.
4. Regra de rede que permite chegada na porta do banco. Exclusivo do cliente. Dono: time de
   plataforma. Evidência: exportação da política de rede com lista de origens permitidas e data de
   revisão.
5. Chave usada na cifra do armazenamento. Compartilhado. Dono: segurança, com o time de plataforma
   como executor. Evidência: identificador da chave, política de acesso da chave e registro de quem
   pode desativá-la.
6. Classificação e permissão de leitura dos dados. Exclusivo do cliente. Dono: dono do processo de
   negócio. Evidência: lista de papéis com acesso e registro da última revisão de acesso.

As três primeiras respondem à auditoria com documento do provedor. As três últimas exigem artefato
produzido pela empresa: sem elas, o certificado não responde.

### 5.4 Problema de completar

Mesmo ambiente, agora com um bucket de objetos que guarda relatórios exportados. Complete as
últimas colunas:

| Controle | Classificação | Dono | Evidência |
|---|---|---|---|
| Acesso físico ao datacenter | herdado | provedor | ______ |
| Correção do sistema operacional do serviço | ______ | ______ | ______ |
| Política que impede acesso público ao bucket | ______ | ______ | ______ |
| Cifra em repouso dos objetos | ______ | ______ | ______ |
| Expiração de objetos após o prazo de retenção | ______ | ______ | ______ |

## 6. Por que isso importa para o CISO

A pergunta de auditoria que derruba um relatório de segurança não é sobre a certificação do
provedor; é sobre a linha da matriz. A AWS declara que o cliente usa a documentação de controle e
conformidade do provedor para executar seus próprios procedimentos de avaliação e verificação, e a
Google trata os controles herdados, como a cifra padrão, como itens que podem compor a evidência de
postura levada a auditor e regulador. Controle herdado que ninguém mapeou não entra em evidência, e
o custo de produzi-lo depois recai sobre o time que já está em operação.

O segundo efeito é orçamentário. A matriz responde onde o dinheiro é necessário: em serviço
abstrato, o esforço vira política de identidade, classificação e monitoramento; em máquina virtual,
vira correção de sistema operacional, hardening e gestão de imagem. Contratar o mesmo pacote de
ferramentas para os dois casos paga duas vezes por um dos lados.

O terceiro efeito é de resposta a incidente. A divisão define quem entra na ponte de crise e o que
se pode exigir do fornecedor com prazo. Perguntar ao provedor por que a conta foi comprometida é
inútil se o comprometimento foi uma política de acesso criada internamente; e o inverso também vale.

## 7. Aplicação prática

Escolha os três serviços de nuvem mais críticos da empresa. Para cada um, produza uma tabela de dez
linhas com quatro colunas: controle, classificação, dono e artefato de evidência. Classifique usando
as palavras herdado, compartilhado e exclusivo. Depois, circule as linhas em que a coluna de
evidência ficou vazia e transforme cada uma em item de trabalho com responsável e data. O resultado
é a primeira página do anexo de segurança que o TEMA-06 vai exigir do fornecedor.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, o que o provedor herda, o que é dividido e o que não
sai do cliente em nenhum modelo de serviço. Conecte com algo que você já faz hoje: o contrato de
qualquer serviço terceirizado que a empresa assina tem uma divisão desse tipo, escrita ou não.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| O provedor é certificado, então o controle está atendido | Certificação de provedor atesta o ambiente dele, não a configuração que o cliente criou | Separe o que é herdado do que é exclusivo; só o herdado se apoia no documento do provedor |
| Responsabilidade compartilhada significa dividir pela metade | Não existe metade: cada linha tem uma coluna definida | Localize a linha do controle na matriz daquele serviço específico |
| Serviço gerenciado elimina a responsabilidade do cliente | Em serviço abstrato, o cliente segue dono de dado, classificação, cifra e permissão | A responsabilidade muda de objeto, não desaparece |
| Em máquina virtual, o firewall é do provedor | A matriz atribui ao cliente a configuração do grupo de segurança da instância | Trate regra de rede como item exclusivo do cliente |
| O modelo é igual em todos os provedores | As matrizes públicas divergem em detalhe e em granularidade por serviço | Escreva uma matriz por provedor e por serviço crítico |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais três famílias de controle a AWS nomeia e qual exemplo cada uma recebe?
2. Em serviço de banco de dados gerenciado, qual linha da matriz muda de coluna em relação à
   máquina virtual, e qual não muda?
3. Por que o pool de recursos compartilhados, descrito no NIST SP 800-145, é a causa da
   necessidade de um modelo explícito de responsabilidade?
4. A empresa quer provar ao regulador que o dado está criptografado. Qual parte da matriz produz a
   evidência e qual parte produz a decisão?

<details>
<summary>Conferir respostas</summary>

1. Herdado, com exemplo no controle físico e ambiental; compartilhado, com exemplos em gestão de
   correção, gestão de configuração e conscientização e treinamento; exclusivo do cliente, com
   exemplo em proteção de serviço e comunicação ou zoneamento. A fonte é a página do modelo de
   responsabilidade da AWS.
2. Muda a linha do sistema operacional, que passa ao provedor no serviço gerenciado. Não mudam as
   linhas de dado, configuração, identidade e acesso, que seguem com o cliente, conforme a matriz da
   Microsoft.
3. Porque o mesmo recurso físico atende vários clientes: o controle físico e o hipervisor ficam com
   quem opera a instalação, e o que resta precisa ser atribuído por escrito a alguém. Sem o modelo
   escrito, cada incidente reabre a negociação.
4. A decisão sobre cifrar e sobre quem detém a chave é do cliente; a evidência pode vir em parte do
   controle herdado de cifra padrão do provedor e em parte do registro de configuração da chave
   gerenciada pelo cliente. A adequação ao requisito regulatório permanece com a organização.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/README.md)), que mantém `proxima_revisao` no registro de progresso.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Preencher três linhas novas da sua matriz usando o serviço mais crítico | Rebaixar: repetir em D+3 |
| D+30 | Revisar as linhas cujo artefato de evidência estava vazio no D+7 | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 06-endpoint-plataforma#TEMA-06 | o modelo decide até onde a correção do sistema operacional convidado e da imagem é sua e a partir de onde o provedor responde |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CCSP | Arquitetura em nuvem e fronteira de responsabilidade compartilhada | ISC2 CCSP | primaria | https://www.isc2.org/certifications/ccsp |
| CCSK | Vocabulário de controle do CCM aplicado a responsabilidade compartilhada | CSA CCSK | primaria | https://cloudsecurityalliance.org/education/ccsk |

Leitura recomendada: [AWS Well-Architected Framework, Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html); [CSA Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios](https://cloudsecurityalliance.org/research/cloud-controls-matrix).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-145, setembro de 2011, cinco características essenciais, três modelos de serviço e quatro modelos de implantação | primaria | https://csrc.nist.gov/pubs/sp/800/145/final | "2026-09-25" | alta |
| 2 | NIST SP 800-144 — segurança e privacidade em nuvem pública, dezembro de 2011, deslocamento de dado e serviço para fora da organização | primaria | https://csrc.nist.gov/pubs/sp/800/144/final | "2026-09-25" | alta |
| 3 | AWS — Shared Responsibility Model, com controle herdado, compartilhado e exclusivo do cliente | primaria | https://aws.amazon.com/compliance/shared-responsibility-model/ | "2026-09-25" | alta |
| 4 | Microsoft Learn — Shared responsibility in the cloud, matriz nas colunas on-premises, IaaS, PaaS e SaaS | primaria | https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility | "2026-09-25" | alta |
| 5 | Google Cloud — Shared responsibilities and shared fate, revisado em 21/08/2023 | primaria | https://cloud.google.com/architecture/framework/security/shared-responsibility-shared-fate | "2026-09-25" | alta |
| 6 | CSA — Cloud Controls Matrix v4.1, 197 control objectives em 17 domínios | primaria | https://cloudsecurityalliance.org/research/cloud-controls-matrix | "2026-09-25" | alta |
| 7 | ISO/IEC 27017:2015, edição 1, 30 páginas, retirada em 27/07/2026 e substituída por ISO/IEC 27017:2026 | primaria | https://www.iso.org/standard/43757.html | "2026-09-25" | alta |

O episódio da seção 4 é composto para exercício; nenhum incidente público foi citado como fato.

---

| Navegação | |
|---|---|
| Área | [08 Segurança em cloud](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-identidade-e-acesso-em-nuvem.md) |
| Home | [README](../README.md) |
