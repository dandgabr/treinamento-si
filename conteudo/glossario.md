---
escopo: "glossário global"
idioma: "pt-BR com termos técnicos em inglês"
fontes:
  - titulo: "NIST CSRC Glossary — verbetes risk, threat, vulnerability, security control, incident"
    url: "https://csrc.nist.gov/glossary"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "FIPS PUB 199 — Standards for Security Categorization of Federal Information and Information Systems, fevereiro de 2004"
    url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-207 — Zero Trust Architecture, agosto de 2020"
    url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-207.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-145 — The NIST Definition of Cloud Computing, setembro de 2011"
    url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-34 Rev. 1 — Contingency Planning Guide for Federal Information Systems, maio de 2010"
    url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-34r1.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-162 — Guide to Attribute Based Access Control (ABAC), janeiro de 2014 com atualizações de 02/08/2019"
    url: "https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-162.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3, agosto de 2018"
    url: "https://www.rfc-editor.org/rfc/rfc8446.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "FIRST — Common Vulnerability Scoring System version 4.0, Specification Document, versão 1.2, 18/06/2024"
    url: "https://www.first.org/cvss/v4.0/specification-document"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "AWS — Shared Responsibility Model"
    url: "https://aws.amazon.com/compliance/shared-responsibility-model/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Saltzer e Schroeder — The Protection of Information in Computer Systems, Invited Paper, MIT"
    url: "https://web.mit.edu/Saltzer/www/publications/protection/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Glossário

## Regras

- Um verbete só entra com fonte verificada, de preferência primária (NIST, ISO, ENISA, RFC, fornecedor padrão de fato).
- Definição de 1 a 2 linhas; o aprofundamento fica no tema.
- Divergência entre frameworks vai na coluna "Observação", não é resolvida por escolha silenciosa.
- Termo sem fonte não é publicado na tabela: vai para o backlog no fim do arquivo.
- A data de verificação é a data de acesso da fonte nesta execução.

## Termos

| Termo (pt) | Termo (en) | Definição | Área | Fonte | Observação | Verificado em |
|---|---|---|---|---|---|---|
| segurança da informação | information security | Proteção da informação e dos sistemas de informação contra acesso, uso, divulgação, interrupção, modificação ou destruição não autorizados, para prover confidencialidade, integridade e disponibilidade. | 01-fundamentos | FIPS 199, Apêndice A | Definição herdada de 44 U.S.C. § 3542. | 2026-09-25 |
| confidencialidade | confidentiality | Preservação de restrições autorizadas ao acesso e à divulgação da informação, incluindo a proteção da privacidade pessoal e de informação proprietária. | 01-fundamentos | FIPS 199, Apêndice A | A perda de confidencialidade é a divulgação não autorizada de informação. | 2026-09-25 |
| integridade | integrity | Proteção contra modificação ou destruição indevida da informação, incluindo a garantia de não repúdio e de autenticidade. | 01-fundamentos | FIPS 199, Apêndice A | A RFC 8446 usa, para o canal TLS, uma noção mais estreita: dado que não pode ser modificado sem detecção. | 2026-09-25 |
| disponibilidade | availability | Garantia de acesso e uso oportunos e confiáveis da informação. | 01-fundamentos | FIPS 199, Apêndice A | — | 2026-09-25 |
| tríade CIA | CIA triad | Os três objetivos de segurança da informação adotados na categorização federal dos EUA: confidencialidade, integridade e disponibilidade. | 01-fundamentos | FIPS 199, Apêndice A | A fonte os chama de "security objectives"; a sigla CIA não aparece no texto da norma. | 2026-09-25 |
| tipo de informação | information type | Categoria específica de informação, como privacidade, médica, proprietária, financeira, investigativa ou de gestão de segurança, definida pela organização ou por lei, ordem executiva, diretriz ou norma. | 00-guia-basico | FIPS 199, Apêndice A | — | 2026-09-25 |
| categoria de segurança | security category | Caracterização de uma informação ou de um sistema de informação a partir da avaliação do impacto potencial da perda de confidencialidade, integridade ou disponibilidade. | 00-guia-basico | FIPS 199, § 3 | Para o sistema aplica-se o "high water mark", o maior valor entre os tipos de informação residentes. | 2026-09-25 |
| nível de impacto | potential impact | Classificação do efeito adverso esperado da perda de confidencialidade, integridade ou disponibilidade em três graus: baixo, moderado e alto. | 00-guia-basico | FIPS 199, § 3 | O valor "não aplicável" só é admitido para o objetivo de confidencialidade em tipos de informação. | 2026-09-25 |
| risco | risk | Medida da extensão em que uma entidade é ameaçada por uma circunstância ou evento potencial, tipicamente função do impacto adverso e da probabilidade de ocorrência. | 01-fundamentos | NIST CSRC Glossary, termo risk (FIPS 200; OMB Circular A-130) | Divergência: o mesmo verbete registra a definição do ISO Guide 73 — "efeito da incerteza sobre os objetivos" —, o que muda a unidade de medida e o cálculo. | 2026-09-25 |
| ameaça | threat | Circunstância ou evento com potencial de afetar adversamente operações, ativos organizacionais ou indivíduos, por meio de acesso não autorizado, destruição, divulgação, modificação da informação e/ou negação de serviço. | 01-fundamentos | NIST CSRC Glossary, termo threat (FIPS 200; CNSSI 4009-2022) | Divergência: o mesmo verbete registra definição de origem ISO/IEC 27000 — "causa potencial de um incidente indesejado, que pode resultar em dano a um sistema ou organização". | 2026-09-25 |
| vulnerabilidade | vulnerability | Fraqueza em um sistema de informação, em procedimentos de segurança, em controles internos ou na implementação, que pode ser explorada ou disparada por uma fonte de ameaça. | 12-vulnerabilidades-threat-intel | NIST CSRC Glossary, termo vulnerability (FIPS 200) | O CNSSI 4009-2022 qualifica a fraqueza como "conhecida" e nomeia o resultado: incidente de segurança ou violação da política. | 2026-09-25 |
| controle | security control | Salvaguarda ou contramedida prescrita para um sistema de informação ou para a organização, destinada a proteger a confidencialidade, a integridade e a disponibilidade do sistema e de sua informação. | 01-fundamentos | NIST CSRC Glossary, termo security control (SP 800-53 Rev. 5; OMB Circular A-130) | O SP 800-160 Vol. 2 Rev. 1 registra uma variante mais genérica: mecanismo que atende a requisitos de segurança. | 2026-09-25 |
| incidente | incident | Ocorrência que de fato ou potencialmente compromete a confidencialidade, a integridade ou a disponibilidade de um sistema de informação ou da informação que ele processa, ou que constitui violação ou ameaça iminente de violação de políticas de segurança, de procedimentos de segurança ou de uso aceitável. | 11-resposta-forense | NIST CSRC Glossary, termo incident (FIPS 200) | Divergência: o CNSSI 4009-2022 acrescenta "sem autoridade legítima" e admite violação de lei. | 2026-09-25 |
| menor privilégio | least privilege | Todo programa e todo usuário deve operar com o menor conjunto de privilégios necessário para completar a tarefa. | 04-identidade-acesso | Saltzer e Schroeder, seção I.A.3 (f) | O NIST CSRC registra definição equivalente (CNSSI 4009-2022; SP 800-53 Rev. 5): restringir o acesso ao mínimo necessário à missão. | 2026-09-25 |
| economia de mecanismo | economy of mechanism | Manter o projeto do mecanismo de proteção o mais simples e pequeno possível, porque caminhos de acesso indevido não aparecem no uso normal e só a inspeção de um projeto enxuto os revela. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (a) | — | 2026-09-25 |
| negação por padrão | fail-safe defaults | Basear a decisão de acesso na permissão, e não na exclusão: o padrão é a falta de acesso, e o mecanismo identifica as condições em que o acesso é permitido. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (b) | A área 05 usa "default deny" para a política de firewall; é a mesma ideia aplicada a rede. | 2026-09-25 |
| mediação completa | complete mediation | Todo acesso a todo objeto deve ser verificado quanto à autoridade, incluindo inicialização, recuperação, desligamento e manutenção, sem confiar em resultados de checagens anteriores. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (c) | — | 2026-09-25 |
| separação de privilégio | separation of privilege | Exigir mais de uma condição, de preferência duas chaves que possam ficar fisicamente separadas, para desbloquear o mecanismo de proteção. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (e) | — | 2026-09-25 |
| projeto aberto | open design | O projeto do mecanismo não deve ser secreto: a segurança depende da posse de chaves ou senhas, não do desconhecimento do atacante. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (d) | — | 2026-09-25 |
| menor mecanismo comum | least common mechanism | Minimizar a quantidade de mecanismo compartilhado por mais de um usuário, porque todo mecanismo comum é um caminho potencial de informação entre usuários. | 03-arquitetura-engenharia | Saltzer e Schroeder, seção I.A.3 (g) | — | 2026-09-25 |
| autenticação | authentication | Ato de verificar que o sujeito está autorizado a usar o identificador apresentado, verificação feita por um provedor de identidade confiável. | 04-identidade-acesso | NIST SP 800-162, § 1.4 | A fonte distingue expressamente autenticação de autorização; Saltzer e Schroeder a definem como verificar a identidade de quem faz o pedido. | 2026-09-25 |
| autorização | authorization | Decisão de permitir ou negar a um sujeito o acesso a objetos do sistema, como rede, dados, aplicação ou serviço. | 04-identidade-acesso | NIST SP 800-162, § 1.4 | A fonte usa autorização e controle de acesso como sinônimos. | 2026-09-25 |
| atributo | attribute | Característica do sujeito, do objeto ou das condições de ambiente, expressa como par nome-valor. | 04-identidade-acesso | NIST SP 800-162, § 2.2 | — | 2026-09-25 |
| RBAC | role-based access control | Modelo de controle de acesso que usa papéis predefinidos, cada um com um conjunto de privilégios, aos quais os sujeitos são atribuídos. | 04-identidade-acesso | NIST SP 800-162, § 2 | A fonte trata RBAC como caso particular de ABAC, no eixo do atributo "papel". | 2026-09-25 |
| ABAC | attribute-based access control | Método de controle de acesso em que pedidos de operação sobre objetos são concedidos ou negados com base nos atributos atribuídos ao sujeito, nos atributos do objeto, nas condições de ambiente e em políticas expressas nesses termos. | 04-identidade-acesso | NIST SP 800-162, § 2.2 | — | 2026-09-25 |
| PDP | policy decision point | Componente que calcula a decisão de acesso avaliando as políticas digitais e as metapolíticas aplicáveis. | 04-identidade-acesso | NIST SP 800-162, § 2.4.3 | SP 800-207 descreve o mesmo componente e o decompõe em policy engine e policy administrator. | 2026-09-25 |
| PEP | policy enforcement point | Componente que aplica a decisão de política em resposta a um pedido de acesso a um objeto protegido. | 04-identidade-acesso | NIST SP 800-162, § 2.4.3 | — | 2026-09-25 |
| PIP | policy information point | Fonte de recuperação dos atributos, ou seja, dos dados exigidos para a avaliação da política, que fornece ao PDP a informação necessária à decisão. | 04-identidade-acesso | NIST SP 800-162, § 2.4.3 | — | 2026-09-25 |
| zero trust | zero trust | Conjunto de conceitos que busca minimizar a incerteza na aplicação de decisões de acesso precisas e de menor privilégio, por requisição, em sistemas e serviços de informação, diante de uma rede tratada como comprometida. | 03-arquitetura-engenharia | NIST SP 800-207, § 2 | — | 2026-09-25 |
| arquitetura zero trust | zero trust architecture | Plano de cibersegurança de uma organização que aplica os conceitos de zero trust e abrange relações entre componentes, planejamento de fluxos e políticas de acesso. | 03-arquitetura-engenharia | NIST SP 800-207, § 2 | A fonte faz a distinção entre o conceito (ZT), o plano (ZTA) e o ambiente resultante (zero trust enterprise). | 2026-09-25 |
| confiança implícita | implicit trust zone | Área em que todas as entidades são confiadas ao menos no nível do último gateway PDP/PEP que as atendeu. | 03-arquitetura-engenharia | NIST SP 800-207, § 2 | A fonte nomeia o conceito "implicit trust zone"; o repositório encurta para confiança implícita. | 2026-09-25 |
| microssegmentação | micro-segmentation | Colocar recursos individuais ou pequenos grupos de recursos em um segmento de rede próprio, protegido por um gateway que age como ponto de execução de política. | 05-rede-infraestrutura | NIST SP 800-207, § 3.1.2 | A fonte admite a variante no host, com agente de software ou firewall no próprio endpoint. | 2026-09-25 |
| plano de controle | control plane | Fluxo de comunicação usado para controlar e configurar a rede, julgar e conceder acesso e montar os caminhos entre recursos, separado logicamente do fluxo de dados. | 08-cloud | NIST SP 800-207, § 3.4 | A fonte opõe control plane a data plane, que carrega o tráfego de aplicação. | 2026-09-25 |
| SIEM | security information and event management | Sistema que recolhe informação centrada em segurança para análise posterior, usada para refinar políticas e avisar de possíveis ataques. | 10-operacoes-soc | NIST SP 800-207, § 3 | — | 2026-09-25 |
| PKI | public key infrastructure | Sistema responsável por gerar e registrar os certificados que a organização emite para recursos, sujeitos, serviços e aplicações, incluindo a autoridade certificadora corporativa. | 07-criptografia-segredos | NIST SP 800-207, § 3 | A fonte admite PKI que não se apoie em certificados X.509. | 2026-09-25 |
| computação em nuvem | cloud computing | Modelo para habilitar acesso de rede ubíquo, conveniente e sob demanda a um conjunto compartilhado de recursos de computação configuráveis, provisionados e liberados rapidamente com mínimo esforço de gestão. | 08-cloud | NIST SP 800-145, § 2 | Composto por cinco características essenciais, três modelos de serviço e quatro modelos de implantação. | 2026-09-25 |
| IaaS | infrastructure as a service | Modelo de serviço em que o consumidor provisiona processamento, armazenamento, redes e outros recursos fundamentais e pode executar software arbitrário, sem gerir a infraestrutura de nuvem subjacente. | 08-cloud | NIST SP 800-145, § 2 | O consumidor mantém controle sobre sistemas operacionais, armazenamento e aplicações implantadas. | 2026-09-25 |
| PaaS | platform as a service | Modelo de serviço em que o consumidor implanta aplicações próprias ou adquiridas, criadas com linguagens, bibliotecas e ferramentas do provedor, sem gerir a infraestrutura de nuvem subjacente. | 08-cloud | NIST SP 800-145, § 2 | O consumidor mantém controle sobre as aplicações e, possivelmente, sobre configurações do ambiente de hospedagem. | 2026-09-25 |
| SaaS | software as a service | Modelo de serviço em que o consumidor usa as aplicações do provedor, acessíveis por interface leve como o navegador ou por interface de programa, sem gerir a infraestrutura de nuvem subjacente. | 08-cloud | NIST SP 800-145, § 2 | Exceção admitida: configurações limitadas específicas do usuário na aplicação. | 2026-09-25 |
| multi-tenancy e pool de recursos | resource pooling | Agrupamento dos recursos de computação do provedor para servir múltiplos consumidores em modelo multi-inquilino, com recursos físicos e virtuais atribuídos e reatribuídos conforme a demanda. | 08-cloud | NIST SP 800-145, § 2 | A fonte associa ao modelo a independência de localização: o cliente não controla a localização exata dos recursos. | 2026-09-25 |
| modelo de responsabilidade compartilhada | shared responsibility model | Divisão da responsabilidade de segurança e conformidade entre o provedor e o cliente, expressa como segurança "da" nuvem, a cargo do provedor, versus segurança "na" nuvem, a cargo do cliente. | 08-cloud | AWS Shared Responsibility Model | Padrão de fato. A AWS lista quatro classes de controle: herdado, compartilhado, exclusivo do cliente e o não citado "exclusivo do provedor". | 2026-09-25 |
| controle herdado | inherited control | Controle que o cliente herda integralmente do provedor de nuvem. | 08-cloud | AWS Shared Responsibility Model | Exemplo citado pela fonte: controles físicos e ambientais. | 2026-09-25 |
| controle compartilhado | shared control | Controle que se aplica à camada de infraestrutura e à camada do cliente em contextos distintos: o provedor fornece os requisitos e o cliente implementa o controle no próprio uso do serviço. | 08-cloud | AWS Shared Responsibility Model | Exemplos citados: gestão de patch, gestão de configuração e conscientização e treinamento. | 2026-09-25 |
| controle exclusivo do cliente | customer-specific control | Controle de responsabilidade exclusiva do cliente, decorrente da aplicação que ele implanta no serviço de nuvem. | 08-cloud | AWS Shared Responsibility Model | Exemplo citado: proteção de serviço e comunicações, ou segurança de zona. | 2026-09-25 |
| TLS | transport layer security | Protocolo que permite a aplicações cliente/servidor se comunicarem pela Internet de modo a impedir escuta clandestina, adulteração e falsificação de mensagens. | 07-criptografia-segredos | RFC 8446, Abstract e § 1 | A área 05 trata o mesmo termo no contexto de criptografia de transporte. | 2026-09-25 |
| handshake | handshake | Negociação inicial entre cliente e servidor que estabelece os parâmetros das interações seguintes dentro do TLS. | 07-criptografia-segredos | RFC 8446, § 1.1 | — | 2026-09-25 |
| suíte de cifra | cipher suite | Lista que indica os pares de algoritmo AEAD e função de hash HKDF oferecidos pelo cliente; no TLS 1.3 a suíte separa o algoritmo de proteção de registro do mecanismo de autenticação e de troca de chaves. | 07-criptografia-segredos | RFC 8446, § 4.1.1 | A RFC registra que esse conceito mudou em relação ao TLS 1.2, onde a suíte agrupava autenticação, troca de chaves, criptografia e MAC. | 2026-09-25 |
| BCP | business continuity plan | Plano que provê procedimentos para sustentar as operações de missão e negócio durante e depois de uma interrupção significativa. | 11-resposta-forense | NIST SP 800-34 Rev. 1, Tabela 2-2 | Dirige-se a processos de missão e negócio, em nível diferente do COOP. | 2026-09-25 |
| COOP | continuity of operations plan | Plano que provê procedimentos e orientação para sustentar as funções essenciais de missão em local alternativo por até 30 dias. | 11-resposta-forense | NIST SP 800-34 Rev. 1, Tabela 2-2 | Exigido por diretivas federais dos EUA. | 2026-09-25 |
| DRP | disaster recovery plan | Plano focado em sistema de informação que provê procedimentos para realocar a operação de sistemas para um local alternativo depois de uma interrupção de longa duração e de causa física. | 11-resposta-forense | NIST SP 800-34 Rev. 1, § 2.2.6 | Abrange apenas interrupções que exijam mudança de local; aciona um ou mais ISCP para recuperar os sistemas afetados. | 2026-09-25 |
| ISCP | information system contingency plan | Conjunto de procedimentos estabelecidos para avaliar e recuperar um sistema após uma interrupção, independentemente do local, reunindo papéis, inventário, procedimentos detalhados de recuperação e testes. | 11-resposta-forense | NIST SP 800-34 Rev. 1, § 2.2.7 | Difere do DRP por não ser específico de local: pode ser ativado no próprio sítio ou em sítio alternativo. | 2026-09-25 |
| BIA | business impact analysis | Etapa que identifica e valida os processos de missão e negócio que dependem ou suportam o sistema e analisa o impacto de sua interrupção, estabelecendo a criticidade de recuperação e as prioridades entre recursos. | 11-resposta-forense | NIST SP 800-34 Rev. 1, § 3.2 | A fonte usa o nível de impacto de disponibilidade do FIPS 199 como base da BIA. | 2026-09-25 |
| plano de comunicação de crise | crisis communications plan | Plano que provê procedimentos para disseminar comunicações internas e externas e para fornecer informação de situação e controlar boatos. | 11-resposta-forense | NIST SP 800-34 Rev. 1, Tabela 2-2 | Não é focado em sistema de informação; costuma ser ativado junto com COOP ou BCP. | 2026-09-25 |
| CVSS | common vulnerability scoring system | Estrutura aberta para comunicar as características e a severidade de vulnerabilidades de software, cuja pontuação vai de 0 a 10. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Introdução | A área 13 usa a mesma base para severidade em relatório de pentest. | 2026-09-25 |
| vetor CVSS | CVSS vector string | Representação textual compacta dos valores de métrica usados para derivar a pontuação, que deve ser exibida junto com o escore. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Nomenclature e Vector String | A ordem das métricas no vetor é fixa; inverter a ordem invalida o vetor. | 2026-09-25 |
| métrica Base | base metric group | Grupo de métricas que representa as qualidades intrínsecas de uma vulnerabilidade, constantes no tempo e entre ambientes de uso. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Metrics | Reúne métricas de explorabilidade e de impacto. | 2026-09-25 |
| métrica Threat | threat metric group | Grupo de métricas que reflete características da vulnerabilidade que mudam no tempo, como a disponibilidade de código de exploração ou a exploração ativa. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Threat Metrics | — | 2026-09-25 |
| métrica Environmental | environmental metric group | Grupo de métricas com as características da vulnerabilidade que são próprias do ambiente de um consumidor específico, como controles mitigadores presentes e a criticidade do sistema vulnerável. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Environmental Metrics | — | 2026-09-25 |
| escala de severidade qualitativa | qualitative severity rating scale | Mapeamento do escore numérico para rótulos textuais: None 0,0; Low 0,1 a 3,9; Medium 4,0 a 6,9; High 7,0 a 8,9; Critical 9,0 a 10,0. | 12-vulnerabilidades-threat-intel | FIRST, CVSS v4.0, Qualitative Severity Rating Scale | A especificação declara o uso dos rótulos opcional. | 2026-09-25 |

## Siglas

| Sigla | Expansão (en) | Uso em português | Fonte |
|---|---|---|---|
| TLS | Transport Layer Security | protocolo de segurança da camada de transporte | RFC 8446 |
| PKI | Public Key Infrastructure | infraestrutura de chaves públicas | NIST SP 800-207, § 3 |
| SIEM | Security Information and Event Management | sistema de correlação de eventos e informação de segurança | NIST SP 800-207, § 3 |
| IaaS | Infrastructure as a Service | infraestrutura como serviço | NIST SP 800-145 |
| PaaS | Platform as a Service | plataforma como serviço | NIST SP 800-145 |
| SaaS | Software as a Service | software como serviço | NIST SP 800-145 |
| ABAC | Attribute-Based Access Control | controle de acesso baseado em atributos | NIST SP 800-162 |
| RBAC | Role-Based Access Control | controle de acesso baseado em papéis | NIST SP 800-162 |
| PDP | Policy Decision Point | ponto de decisão de política | NIST SP 800-162, § 2.4.3 |
| PEP | Policy Enforcement Point | ponto de execução de política | NIST SP 800-162, § 2.4.3 |
| PIP | Policy Information Point | ponto de informação de política | NIST SP 800-162, § 2.4.3 |
| ZT | Zero Trust | zero trust | NIST SP 800-207, § 2 |
| ZTA | Zero Trust Architecture | arquitetura zero trust | NIST SP 800-207, § 2 |
| CVSS | Common Vulnerability Scoring System | sistema comum de pontuação de vulnerabilidades | FIRST, CVSS v4.0 |
| BCP | Business Continuity Plan | plano de continuidade de negócios | NIST SP 800-34 Rev. 1 |
| COOP | Continuity of Operations Plan | plano de continuidade de operações | NIST SP 800-34 Rev. 1 |
| DRP | Disaster Recovery Plan | plano de recuperação de desastre | NIST SP 800-34 Rev. 1 |
| ISCP | Information System Contingency Plan | plano de contingência de sistema de informação | NIST SP 800-34 Rev. 1 |
| BIA | Business Impact Analysis | análise de impacto no negócio | NIST SP 800-34 Rev. 1 |

## Backlog de termos

Termos reivindicados por alguma área que não receberam definição com fonte primária nesta execução. Nenhum entra na tabela sem fonte.

**00-guia-basico:** fonte de ameaça; risco aceito; encarregado pelo tratamento de dados pessoais; política de segurança cibernética.

**01-fundamentos:** ativo (asset); classificação da informação; ciclo de vida da informação; fonte de ameaça; exposição; superfície de ataque (attack surface); risco inerente; risco residual (residual risk); apetite de risco (risk appetite); controle compensatório; defesa em profundidade (defense in depth).

**02-governanca-risco-compliance:** governança de segurança da informação; alçada de decisão (decision rights); comitê de segurança; primeira, segunda e terceira linha (three lines model); política de segurança da informação; norma (standard); procedimento; diretriz (guideline); exceção e waiver; apetite de risco; tolerância ao risco (risk tolerance); limite de risco; declaração de apetite de risco; ISMS; escopo do ISMS; declaração de aplicabilidade (statement of applicability); não conformidade; ação corretiva; risco aceito; certificação e auditoria de certificação; auditoria interna; evidência de auditoria; indicador de desempenho (KPI); indicador de risco (KRI); reporte ao conselho; framework de controles.

**03-arquitetura-engenharia:** arquitetura de segurança (security architecture); princípio de projeto; modelo de ameaças (threat model); diagrama de fluxo de dados (DFD); limite de confiança (trust boundary); STRIDE; zona de confiança (trust zone); defesa em profundidade; requisito não funcional; critério de aceite; trade-off de engenharia; revisão de arquitetura; dívida de segurança (security debt).

**04-identidade-acesso:** fator de autenticação; autenticador (authenticator); nível de garantia de autenticação (AAL); resistência a phishing (phishing resistance); FIDO2, WebAuthn e CTAP; passkey, passkey sincronizada e passkey vinculada ao dispositivo; autenticação de múltiplos fatores (MFA); intenção de autenticação; resistência a replay; sessão e tempo limite de inatividade; MAC; DAC; identidade, conta e entitlement; provisão e desprovisão; SCIM; conta órfã (orphan account); conta de serviço (service account); acesso just-in-time (JIT); papel elegível e papel ativo; recertificação e revisão de acesso; PAM; cofre de credenciais; conta de emergência (break-glass); segregação de função; perímetro de identidade.

**05-rede-infraestrutura:** endereço privado; máscara de sub-rede e CIDR; porta e protocolo de transporte; tradução de endereço de rede (NAT); resolver recursivo e servidor autoritativo; resolução de nomes (DNS); firewall de rede e firewall de host; política de firewall; zona desmilitarizada (DMZ); inspeção de estado (stateful inspection); proxy; proteção de fronteira (boundary protection); segmentação de rede; VLAN; fluxo leste-oeste e norte-sul; túnel (tunnel); certificado de servidor; sigilo direto (forward secrecy); VPN de acesso remoto e VPN site a site; IPsec; DNSSEC; DNS cifrado; domínio de comando e controle (C2); SPF, DKIM e política de e-mail; HSTS; exportação de fluxo (IPFIX); captura de pacote; espelhamento de porta (SPAN) e tap; retenção de telemetria.

**06-endpoint-plataforma:** endpoint; superfície de ataque de dispositivo; telemetria de host; agente de endpoint; hardening; linha de base de configuração (baseline); benchmark de configuração; desvio de configuração (configuration drift); imagem dourada (golden image); application control; lista de permitidos (allowlist); aplicação de patch (patching); tempo de correção (mean time to remediate); EDR (endpoint detection and response); XDR (extended detection and response); isolamento de host (host isolation); criptografia de disco (full disk encryption); DLP (data loss prevention); classificação de dado; ambiente de execução (runtime); identidade do host (host identity); endurecimento de servidor; carga de trabalho (workload); contêiner.

**07-criptografia-segredos:** cifra simétrica e cifra assimétrica; tamanho de chave e tamanho de bloco; função de hash, digest e colisão; derivação de chave; certificado, cadeia de confiança e âncora de confiança; validação de caminho; revogação e lista de revogação; autoridade certificadora e autoridade de registro; sigilo encaminhado (forward secrecy); hierarquia de chaves DEK, KEK e chave raiz; módulo criptográfico validado (FIPS 140-3); segredo de aplicação, cofre e credencial de curta duração; criptografia pós-quântica, KEM e assinatura pós-quântica; agilidade criptográfica e inventário criptográfico (CBOM).

**08-cloud:** função como serviço (FaaS) e serverless; conta de nuvem e organização; política de identidade e política de recurso; credencial temporária; federação de identidade de carga de trabalho (workload identity federation); chave de acesso de longa duração; guardrail e service control policy; permissão efetiva (effective permission); privilégio excessivo (over-permission); postura de segurança (security posture); benchmark de configuração e versão fixada; desvio de configuração; desvio aceito; varredura de configuração em nuvem; linha de base de configuração; contêiner e imagem de contêiner; registro de imagem (image registry) e digest; identidade de nó (node identity); chave gerenciada pelo cliente; HSM e módulo validado; envelope encryption e chave raiz; residência de dado; subcontratado (subprocessor) e cadeia de fornecedores; direito de auditoria; portabilidade e saída (exit); evidência de conformidade (compliance artifact).

**09-aplicacoes-devsecops:** ciclo de vida de desenvolvimento de software (SDLC); gate de segurança; caso de abuso; modelagem de ameaças; limite de confiança; OWASP Top 10; ASVS; SSDF; SAST; DAST; SCA; varredura de segredo; SBOM; VEX; proveniência de build; SLSA; dependência transitiva; Broken Object Level Authorization (BOLA); inventário de API.

**10-operacoes-soc:** SOC; EDR; IDS e IPS; telemetria; log de auditoria; retenção de log; caso de uso de detecção; regra de correlação; falso positivo; falso negativo; severidade de incidente; triagem; escalonamento; MTTA, MTTD e MTTR; playbook; SOAR; IOC; TTP; cobertura de detecção.

**11-resposta-forense:** incidente confirmado; ciclo de resposta a incidentes; playbook; matriz de severidade; alçada de decisão; plantão de resposta; exercício de mesa; teste, treinamento e exercício (TT&E); contenção; erradicação; recuperação; persistência; estado volátil; ordem de volatilidade; aquisição forense; imagem de disco; hash de integridade; cadeia de custódia; evidência digital; RTO (recovery time objective); RPO (recovery point objective); backup imutável; restauração testada; comitê de crise; porta-voz; comunicado de posição; notificação regulatória; comunicação de incidente de segurança; registro do incidente; ampla divulgação do incidente.

**12-vulnerabilidades-threat-intel:** patch management e manutenção preventiva de tecnologia; EPSS; catálogo de vulnerabilidades exploradas em campo (KEV); threat intelligence, indicador e requisito de inteligência; MITRE ATT&CK, tática, técnica, sub-técnica e procedimento; divulgação responsável e divulgação coordenada; bug bounty, salvo-conduto e canal de recebimento de relato; aviso de segurança, CVE e identificador de vulnerabilidade; tempo de exposição e dívida de remediação.

**13-ofensiva-pentest:** pentest e teste de intrusão; varredura de vulnerabilidades; assurance; escopo; rules of engagement; janela de teste; carta de autorização; caixa preta, caixa cinza e caixa branca; red team; purple team; control team; threat-led penetration testing; relatório de pentest; severidade e prioridade; limitação de teste; plano de remediação.

**14-dados-privacidade:** dado pessoal; dado pessoal sensível; dado anonimizado; pseudonimização; anonimização; titular; controlador; operador; agente de tratamento; encarregado; tratamento; hipótese legal de tratamento; consentimento; legítimo interesse; finalidade; necessidade; relatório de impacto à proteção de dados pessoais; registro das operações de tratamento; incidente de segurança com dado pessoal; comunicação de incidente; transferência internacional de dados; decisão de adequação; cláusulas contratuais padrão; programa de governança em privacidade; ciclo de vida do dado; retenção; eliminação; data mapping; direito do titular.

**15-fatores-humanos:** engenharia social; phishing e spearphishing; MFA resistente a phishing; fatigue de MFA; programa de aprendizagem; conscientização, treinamento e educação; segmentação por papel; cultura de segurança; mudança de comportamento; risco interno; uso indevido de acesso autorizado; indicador de comportamento; taxa e tempo de reporte; canal de reporte; engenharia social por chat e por voz.

**16-ia-seguranca:** sistema de IA (AI system); modelo de linguagem de grande porte (LLM); IA generativa; prompt e prompt de sistema; prompt injection direta e indireta; agência excessiva (excessive agency); alucinação e desinformação gerada por modelo; envenenamento de dado (data poisoning); conjunto de treino, ajuste fino e base de conhecimento; recuperação aumentada por geração (RAG); índice vetorial e embedding; vazamento de dado sensível por modelo; cadeia de suprimentos de modelo; consumo não limitado (unbounded consumption); sistema de gestão de IA (AIMS); avaliação de impacto de IA; fornecedor de modelo de uso geral (GPAI); deployer e provider no AI Act; alfabetização em IA (AI literacy); shadow AI e uso não governado; inventário de sistemas de IA.

**17-lideranca-ciso:** CISO; mandato; accountability; apetite de risco; tolerância ao risco; registro de riscos; caso de negócio; perfil atual e perfil alvo; Tier do CSF; maturity indicator level; métrica de segurança; indicador-chave de desempenho (KPI); indicador-chave de risco (KRI); matriz de decisão; MSSP.

### Backlog de siglas

Siglas citadas nas áreas para as quais não foi lida expansão em fonte primária nesta execução. Nenhuma entra na tabela de siglas sem fonte.

- CTI (cyber threat intelligence)
- DFIR
- DLP (data loss prevention)
- EDR (endpoint detection and response)
- IAM (identity and access management)
- ISMS (information security management system)
- MFA (multifactor authentication)
- MSSP
- MTTD (mean time to detect)
- MTTA (mean time to acknowledge)
- MTTR (mean time to respond / repair)
- PAM (privileged access management)
- RPO (recovery point objective)
- RTO (recovery time objective)
- SBOM (software bill of materials)
- SOAR (security orchestration, automation and response)
- SOC (security operations center)
- XDR (extended detection and response)

Nota de divergência pendente: as áreas 05 e 07 grafam o mesmo conceito de duas formas, "sigilo direto (forward secrecy)" e "sigilo encaminhado (forward secrecy)"; a escolha do termo em português fica para quando houver fonte verificada.

---

| Home |
|---|
| [README](./README.md) |
