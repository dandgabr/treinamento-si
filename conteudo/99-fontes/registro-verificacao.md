# Registro de verificação de fontes

Log cronológico de tudo que foi conferido contra fonte primária. Uma linha por confirmação.
Nenhum documento é marcado `status_verificacao: verificado` sem estar coberto aqui.

Formato: `data | afirmação confirmada | fonte | tipo | resultado`

---

## 2026-09-25 — Fase 0 (fundação)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 1 | O roadmap.sh usa frontmatter YAML por roadmap (`renderer`, `jsonUrl`, `pdfUrl`, `relatedRoadmaps`, `hasTopics`) e conteúdo de tópico em `src/data/roadmaps/{id}/content/{topico}@{id}.md` | https://deepwiki.com/kamranahmedse/developer-roadmap/3.1-content-structure | secundária (índice do repositório oficial) | CONFIRMADO |
| 2 | NIST CSF 2.0 é organizado em **6 funções**: Govern, Identify, Protect, Detect, Respond, Recover | https://www.nist.gov/cyberframework · https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1299.pdf | primária | CONFIRMADO |
| 3 | O NICE Framework (SP 800-181r1) compreende **52 work roles em 7 categorias** | https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center/resources/occupations-jobs-and-work | primária | CONFIRMADO |
| 4 | CSEC2017 define **8 Knowledge Areas**: Data, Software, Component, Connection, System, Human, Organizational, Societal Security | https://www.acm.org/media-center/2018/february/cybersecurity-curricula-2017 · https://www.acm.org/binaries/content/assets/education/curricula-recommendations/csec2017.pdf | primária | CONFIRMADO |
| 5 | O ENISA ECSF publica **12 role profiles**, documento publicado em 19/09/2022 | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | primária | CONFIRMADO |
| 6 | CompTIA SecurityX substitui o CASP+ (exame CAS-005), rebranding anunciado em dez/2024 | https://www.comptia.org/en-us/blog/introducing-comptia-securityx/ | primária | CONFIRMADO |
| 7 | CompTIA Security+ SY0-701 tem **5 domínios**, com pesos 12% / 22% / 18% / 28% / 20% | https://www.comptia.org/en-us/certifications/security/ | primária | CONFIRMADO |
| 8 | EC-Council CCISO tem **5 domínios**, exame de 150 questões em 2h30 | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf · https://cert.eccouncil.org/images/doc/CCISO-Handbook-v6.2.pdf | primária | CONFIRMADO |
| 9 | ISC2 CISSP tem **8 domínios**; outline vigente desde 15/04/2024 | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | primária | CONFIRMADO |
| 10 | ISACA CISM tem **4 domínios** | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | primária | CONFIRMADO |
| 11 | Knowles (1980) define a andragogia por **6 pressupostos** do aprendiz adulto (p. 43) | https://sk.sagepub.com/ency/edvol/sage-encyclopedia-of-educational-research-measurement-evaluation/chpt/andragogy | acadêmica | CONFIRMADO |
| 12 | Dunlosky et al. (2013) avalia técnicas de aprendizagem; DOI 10.1177/1529100612453266 | https://journals.sagepub.com/doi/abs/10.1177/1529100612453266 | acadêmica | CONFIRMADO |

## Pendências marcadas como NAO CONFIRMADO

> Esta tabela é o retrato do fim da Fase 0. O estado vivo e gerado está em
> [fila-auditoria-humana.md](./fila-auditoria-humana.md) e
> [indice-fontes.md](./indice-fontes.md) — consulte esses dois antes desta tabela.

| # | Item | Situação em 25/09/2026 |
|---|---|---|
| 1 | Nomes das 7 categorias e dos 52 work roles do NICE | ABERTO — só o total "52 em 7" confirmado |
| 2 | Nomes dos 12 role profiles do ECSF | ABERTO — confirmado que existem 12, incluindo CISO, Cyber Incident Responder, Cybersecurity Architect e Penetration Tester |
| 3 | Pesos por domínio de CISM e CISSP | PARCIAL — CISM confirmado em 17/20/33/30 (outline com efeito até 03/11/2026); CISSP não |
| 4 | Custos de GIAC, OffSec, AWS, Microsoft, IAPP, ISO 27001 LI/LA | PARCIAL, por limite de acesso — preço de exame não é publicado em página estática |
| 5 | Domínios de CEH, CPENT, CHFI, LPT | ABERTO |
| 6 | Versões atuais das normas ISO/IEC citadas | **RESOLVIDO** em 25/09/2026 — ver Fase 7 abaixo |
| 7 | Certificação consolidada de segurança de IA | ABERTO — indício de que não existe |
| 8 | Versão atual do MITRE ATT&CK | PARCIAL — Enterprise v19.2, 15 táticas, confirmado na área 10 |

> **Numeracao.** A contagem de itens reinicia em cada fase; por isso a citacao de um item
> deve trazer a fase junto (ex.: "Fase 0, item 6"). O estado vivo das pendencias esta em
> [fila-auditoria-humana.md](./fila-auditoria-humana.md).

## 2026-09-25 — Fase 1 (00-guia-basico)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 13 | Segurança da informação é a proteção de informação e de sistemas de informação contra acesso, uso, divulgação, interrupção, modificação ou destruição não autorizados, para prover confidencialidade, integridade e disponibilidade (FIPS 199, apêndice A, citando 44 U.S.C. § 3542) | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf | primária | CONFIRMADO (texto integral lido) |
| 14 | Confidencialidade, integridade e disponibilidade têm definição própria no FIPS 199, com níveis de impacto LOW, MODERATE e HIGH e a regra do high water mark por objetivo; NOT APPLICABLE só vale para confidencialidade de um tipo de informação | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf | primária | CONFIRMADO (texto integral lido, seções 3 e exemplos 1 a 5) |
| 15 | Risco é a medida em que uma entidade é ameaçada por circunstância ou evento potencial, função do impacto adverso e da probabilidade de ocorrência (SP 800-30 Rev. 1 e OMB A-130) | https://csrc.nist.gov/glossary/term/risk | primária | CONFIRMADO (página lida) |
| 16 | Vulnerabilidade é fraqueza em sistema, procedimentos, controles internos ou implementação, explorável ou disparável por uma fonte de ameaça (FIPS 200) | https://csrc.nist.gov/glossary/term/vulnerability | primária | CONFIRMADO (página lida) |
| 17 | Fonte de ameaça é a intenção e o método voltados à exploração de uma vulnerabilidade, ou situação e método que podem disparar uma vulnerabilidade acidentalmente (FIPS 200) | https://csrc.nist.gov/glossary/term/threat_source | primária | CONFIRMADO (página lida) |
| 18 | ISO/IEC 27001:2022 é a edição vigente do requisito de sistema de gestão de segurança da informação | https://www.iso.org/standard/27001 | primária | CONFIRMADO por título e URL oficiais no índice de busca do domínio iso.org; página não aberta diretamente |
| 19 | A NIS2 (Diretiva 2022/2555) alcança 18 setores críticos, exige medidas de gestão de risco e notificação de incidentes significativos, introduz responsabilidade da alta administração, previa transposição até 17/10/2024 e revogou a NIS1 em 18/10/2024 | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | primária | CONFIRMADO (página lida) |
| 20 | A Comissão Europeia informou em julho de 2026 o encaminhamento de Irlanda, Espanha, França e Países Baixos ao Tribunal de Justiça por falta de notificação da transposição da NIS2 | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | primária | CONFIRMADO (página lida) |
| 21 | A Resolução CMN nº 4.893, de 26/02/2021, exige no art. 7º designar diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes | https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893 | primária | CONFIRMADO pelo índice oficial do bcb.gov.br, com transcrição do art. 7º; a página do normativo não renderizou |
| 22 | A Lei nº 13.709/2018, art. 41, determina que o controlador indique encarregado pelo tratamento de dados pessoais e que a identidade e o contato do encarregado sejam divulgados publicamente | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm | primária | CONFIRMADO pelo índice de busca do domínio planalto.gov.br, com transcrição do art. 41; o acesso direto à página expirou por timeout |

Pendência nº 6 da Fase 0 atualizada parcialmente: a versão do ISO/IEC 27001 foi confirmada como 2022. MITRE ATT&CK e CIS Controls seguem não pesquisados e não foram citados nos temas desta fase.

Itens normativos deliberadamente **não** afirmados por falta de verificação nesta execução: nomes de domínio de CISM, CISSP e CCISO (apenas as contagens — 4, 8 e 5 — estavam confirmadas); custos e validade de credenciais; qualquer data de incidente público usada como caso.

---

## 2026-09-25 — Fase 1 (17-lideranca-ciso)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 23 | O ENISA ECSF publica 12 perfil de papel, incluindo o perfil CISO com missão, tarefas, habilidades, conhecimentos e competências; publicação de 19/09/2022 | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | primária | CONFIRMADO (página lida) |
| 24 | O CISM tem 4 domínios, 150 questões, pesos 17% / 20% / 33% / 30%; o Domínio 1 traz "Strategic Planning (e.g., Budgets, Resources, Business Case)" e o Domínio 3 traz métricas do programa e comunicação e reporte; o outline será atualizado com efeito em 03/11/2026 | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | primária | CONFIRMADO (página lida) |
| 25 | O CCISO (blueprint v3) tem 5 domínios com pesos 15% / 16% / 12% / 46% / 11%; o Domínio 1 inclui o papel do conselho e o apoio do CISO ao conselho; o Domínio 2 inclui board briefing, funding request e ROI; o Domínio 5 inclui orçamento operacional e balanceamento de portfólio | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | primária | CONFIRMADO (PDF lido) |
| 26 | O CSF 2.0 (NIST CSWP 29, 26/02/2024) tem 6 funções e a função Govern tem 6 categorias (GV.OC, GV.RM, GV.RR, GV.PO, GV.OV, GV.SC); `GV.RR-01` declara a liderança responsável e accountable pelo risco cibernético; define 4 Tiers (Partial, Risk Informed, Repeatable, Adaptive), descreve os 5 passos do perfil organizacional e o fluxo bidirecional de comunicação entre executivos, gestores e praticantes | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | primária | CONFIRMADO (PDF lido, páginas 3 a 30) |
| 27 | A NIS2 introduz a responsabilização da alta administração pelo descumprimento das medidas de gestão de risco; o prazo de transposição era 17/10/2024 e a NIS1 foi revogada em 18/10/2024; em 08/07/2026 a Comissão levou Irlanda, Espanha, França e Países Baixos ao TJUE por falta de notificação; em 20/01/2026 propôs alterações pontuais com alívio estimado para 28.700 empresas, incluindo 6.200 micro e pequenas | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | primária | CONFIRMADO (página lida) |
| 28 | O NIST IR 8286 (out/2020) foi retirado em 18/12/2025 e substituído integralmente pelo NIST IR 8286r1 (18/12/2025, DOI 10.6028/NIST.IR.8286r1); a edição de 2020 define exposição como combinação de probabilidade e impacto, diferencia apetite de tolerância ao risco, lista custo da resposta e dono do risco entre os campos do registro e registra que a quantificação em valores monetários é feita de forma ad hoc, com risco chegando ao nível corporativo como "mapa de calor perpetuamente vermelho" | https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf | primária | CONFIRMADO (PDF lido, com aviso de retirada na página 1) |
| 29 | O C2M2 versão 2.1, de junho de 2022, tem mais de 350 práticas em 10 domínios, três níveis indicadores de maturidade (MIL 1 Initiated, MIL 2 Performed, MIL 3 Managed), autoavaliação possível em um único dia, relatórios com painéis de desempenho para comunicação com executivos, alinhamento declarado ao NIST CSF e mais de 3.500 solicitações da ferramenta em PDF desde 2012 | https://www.energy.gov/ceser/cybersecurity-capability-maturity-model-c2m2 | primária | CONFIRMADO (página lida) |
| 30 | O NIST SP 800-181 Rev. 1, de novembro de 2020, substitui o SP 800-181 de 07/08/2017 e descreve o NICE Framework como léxico comum para identificar, recrutar, desenvolver e reter talento; nota de planejamento de 26/06/2025 informa que os componentes passam a ser mantidos na página de versões atuais do NICE Framework Resource Center | https://csrc.nist.gov/pubs/sp/800/181/r1/final | primária | CONFIRMADO (página lida) |
| 31 | A Release 33-11216 da SEC, vigente em 05/09/2023, exige descrever a supervisão do conselho sobre risco cibernético e o papel da administração (Regulation S-K, Item 106(c)) e define o Item 1.05 do Form 8-K com prazo de quatro dias úteis a partir da determinação de materialidade; a equipe da SEC observou que divulgações de risco cibernético apareciam às vezes junto a outras não relacionadas, dificultando localizar, interpretar e analisar | https://www.sec.gov/files/rules/final/2023/33-11216.pdf | primária | CONFIRMADO (PDF lido, páginas 1, 7 e 12) |

### Pendências marcadas como NAO CONFIRMADO nesta fase

| # | Item | Situação | Ação |
|---|---|---|---|
| 8 | Percentual do orçamento de TI ou da receita que deveria ser destinado a segurança | Nenhuma fonte primária localizada; valores circulam em material de analista e fornecedor | Mantido como NAO CONFIRMADO nos temas; não usar em pedido de verba |
| 9 | Faixas salariais de CISO e de cargos de segurança | Não pesquisado nesta execução | Manter fora do roadmap ou confirmar em pesquisa remunerada com fonte citável |
| 10 | Déficit de profissionais de segurança, tempo médio de contratação e rotatividade | Estatísticas existentes variam por metodologia e país; nenhuma fonte primária confirmada | Tratar como NAO CONFIRMADO nos temas de time e orçamento |
| 11 | Pesos por domínio do CISM e do CISSP | Pesos do CISM confirmados nesta execução (17/20/33/30); pesos do CISSP seguem pendentes | Confirmar CISSP em `90-certificacoes/` |

A Resolução CMN nº 4.893/2021 é citada no TEMA-01 da área 17 com base no item 21 deste registro; a
página do normativo no bcb.gov.br não foi reaberta nesta execução.

## 2026-09-25 — Fase 1.5 (03-arquitetura-engenharia)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 23 | NIST SP 800-207, Zero Trust Architecture, publicado em agosto de 2020, final em 11/08/2020, DOI 10.6028/NIST.SP.800-207; o resumo afirma ausência de confiança implícita por localização ou propriedade, autenticação e autorização de sujeito e de dispositivo como funções discretas antes da sessão, e foco em recursos e não em segmentos | https://csrc.nist.gov/pubs/sp/800/207/final | primária | CONFIRMADO (página lida) |
| 24 | O SP 800-207A existe como publicação complementar ao SP 800-207 | https://csrc.nist.gov/pubs/sp/800/207/final · https://csrc.nist.gov/pubs/sp/800/207/a/final | primária | CONFIRMADO pelo índice da página do SP 800-207; o título completo do SP 800-207A não foi lido (ver pendências) |
| 25 | NIST SP 800-160 Vol. 1 Rev. 1, Engineering Trustworthy Secure Systems, publicado em novembro de 2022 e substituto da edição de 21/03/2018; palavras-chave incluem security architecture, security design, security requirements, engineering trades, review, verification, validation e assessment criteria | https://csrc.nist.gov/pubs/sp/800/160/v1/r1/final | primária | CONFIRMADO (página lida) |
| 26 | NIST SP 800-154, Guide to Data-Centric System Threat Modeling, initial public draft publicado em março de 2016, comentários encerrados em 15/04/2016, com nota de planejamento de 23/01/2025 declarando intenção de finalizar; definição de threat modeling como forma de avaliação de risco que modela os lados do ataque e da defesa de uma entidade lógica | https://csrc.nist.gov/pubs/sp/800/154/ipd | primária | CONFIRMADO (página lida) |
| 27 | OWASP Threat Modeling Cheat Sheet: quatro perguntas do Threat Modeling Manifesto, quatro etapas de processo, STRIDE com seis categorias ligadas a atributos de segurança, quatro respostas (mitigate, eliminate, transfer, accept), critério de revisão e validação, e a declaração de que não existe padrão de indústria universalmente aceito para o processo | https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html | primária | CONFIRMADO (página lida) |
| 28 | MITRE ATT&CK, tactic TA0008 Lateral Movement: técnicas para entrar e controlar sistemas remotos em uma rede, após explorar a rede em busca do alvo e pivotar por sistemas e contas | https://attack.mitre.org/tactics/TA0008/ | primária | CONFIRMADO pelo índice de busca no domínio attack.mitre.org |
| 29 | MITRE ATT&CK, technique T1021 Remote Services: uso de contas válidas para entrar em serviço que aceita conexão remota, com 8 sub-técnicas | https://attack.mitre.org/techniques/T1021/ | primária | CONFIRMADO pelo índice de busca no domínio attack.mitre.org |
| 30 | NIST CSRC Glossary — defense in depth, com o texto do NIST SP 800-53 Rev. 5 e a expressão "variable barriers across multiple layers and dimensions of the organization" | https://csrc.nist.gov/glossary/term/defense_in_depth | primária | CONFIRMADO pelo índice de busca no domínio csrc.nist.gov |
| 31 | NIST CSRC Glossary — least privilege, com o texto do NIST SP 800-12 Rev. 1 sob origem CNSSI 4009: cada entidade recebe o mínimo de recursos e autorizações necessário para cumprir sua função | https://csrc.nist.gov/glossary/term/least_privilege | primária | CONFIRMADO pelo índice de busca no domínio csrc.nist.gov |
| 32 | NIST SP 800-53 Rev. 5 é catálogo de controles de segurança e privacidade para sistemas e organizações | https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final | primária | CONFIRMADO pelo índice de busca no domínio csrc.nist.gov; o identificador SC-7 não foi conferido (ver pendências) |
| 33 | Saltzer e Schroeder, The Protection of Information in Computer Systems (1975), seção I trata de funções desejadas e princípios de projeto de proteção | https://web.mit.edu/Saltzer/www/publications/protection/ | primária | CONFIRMADO (página lida) |
| 34 | A enumeração dos oito princípios do paper de 1975: economy of mechanism, fail-safe defaults, complete mediation, open design, separation of privilege, least privilege, least common mechanism, psychological acceptability | https://www.cs.virginia.edu/~evans/cs551/saltzer/ | secundária (cópia institucional do paper) | CONFIRMADO; a enumeração não foi lida na página do MIT nesta execução |
| 35 | Estudo Defining Security Debt: A Case Study Based on Practice, DOI 10.1007/978-3-031-78386-9_4: objetivos declarados de definir dívida de segurança, relacioná-la à dívida técnica, distingui-la de vulnerabilidade e identificar padrões de acumulação, por entrevistas com profissionais de software | https://link.springer.com/chapter/10.1007/978-3-031-78386-9_4 | acadêmica | CONFIRMADO pelo resumo do editor, lido no índice de busca |

### Pendências desta fase marcadas como NAO CONFIRMADO

| # | Item | Situação | Ação |
|---|---|---|---|
| 8 | Título completo do NIST SP 800-207A | Só a existência e o início do título foram vistos | Conferir na área 08-cloud |
| 9 | Identificador SC-7 do NIST SP 800-53 Rev. 5 como controle de proteção de fronteira | Não conferido nesta execução; a citação de SC-7 foi evitada nos temas | Conferir na área 05-rede-infraestrutura |
| 10 | Definição de dívida de segurança em norma primária | Não encontrada; a distinção aparece apenas em literatura acadêmica | Nova busca antes de `status_verificacao: verificado` no TEMA-06 |
| 11 | Nomes de domínio do CISSP e do SecurityX | Contagens registradas na Fase 0; nomes não conferidos | Conferir em `90-certificacoes/` |

## 2026-09-25 — Fase 2 (02-governanca-risco-compliance)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 23 | ISO/IEC 27001:2022 é edição 3, publicada em 25/10/2022, com 19 páginas e emenda `Amd 1:2024` sobre ação climática; a certificação é opcional, o padrão define requisitos de um ISMS e a designação completa deve ser usada ao referenciá-lo | https://www.iso.org/standard/27001 | primaria | CONFIRMADO (página lida) |
| 24 | Conforme o ISO Survey 2022, mais de 70.000 certificados ISO/IEC 27001 foram reportados em 150 países | https://www.iso.org/standard/27001 | primaria | CONFIRMADO (texto da própria página oficial) |
| 25 | ISO/IEC 27002:2022 é edição 3, publicada em 15/02/2022, com 152 páginas e versão corrigida em 03/2022; fornece controles genéricos com orientação de implementação e não é certificável | https://www.iso.org/standard/75652.html | primaria | CONFIRMADO (página lida) |
| 26 | A família inclui as edições ISO/IEC 27000:2018, 27001:2022, 27002:2022 e 27005:2022, conforme o pacote comercializado listado na página oficial | https://www.iso.org/standard/75652.html | primaria | CONFIRMADO (página lida) |
| 27 | ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023 está em vigor, publicada em 23/11/2022, incorpora a Errata 1 de 31/03/2023, tem 23 páginas e especifica requisitos para estabelecer, implementar, manter e melhorar continuamente um sistema de gestão da segurança da informação, incluindo avaliação e tratamento de riscos; a exclusão de requisitos das seções 4 a 10 não é aceitável para conformidade | https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0= | primaria | CONFIRMADO (página lida) |
| 28 | O CSF 2.0 (CSWP 29, 26/02/2024) tem 6 funções e 22 categorias, é composto de Core, Organizational Profiles e Tiers, com Tiers Partial, Risk Informed, Repeatable e Adaptive; `GV.RM-02` trata de declarações de apetite e tolerância; identificadores das categorias de Govern confirmados (`GV.OC`, `GV.RM`, `GV.RR`, `GV.PO`, `GV.OV`, `GV.SC`), assim como `PR.DS-11`, `ID.RA-01`, `ID.RA-06`, `ID.IM-01`, `RS.MA-01`, `RS.MA-03` e `GV.OV-01` a `GV.OV-03` | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | primaria | CONFIRMADO (PDF lido) |
| 29 | NIST SP 1299 é o Resource and Overview Guide do CSF 2.0, de fevereiro de 2024, com as seis funções e Govern no centro do diagrama | https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1299.pdf | primaria | CONFIRMADO (PDF lido) |
| 30 | O glossário do CSRC define risk tolerance com definições herdadas do SP 800-137, do SP 800-39 e do ISO Guide 73 | https://csrc.nist.gov/glossary/term/risk_tolerance | primaria | CONFIRMADO (página lida) |
| 31 | NIST SP 800-39 trata de programa integrado de gestão de risco (organização, missão e sistema de informação) e SP 800-30 Rev. 1 amplia essa orientação, com avaliações de risco nos três níveis da hierarquia de gestão de risco | https://csrc.nist.gov/pubs/sp/800/39/final · https://csrc.nist.gov/pubs/sp/800/30/r1/final | primaria | CONFIRMADO (páginas lidas) |
| 32 | CIS Controls v8.1 tem 18 controles, é prescritivo e priorizado, e a versão 8.1 acrescentou a função de segurança Governance | https://www.cisecurity.org/controls/cis-controls-list | primaria | CONFIRMADO (página lida) |
| 33 | ISACA CISM: 150 questões em 4 domínios, pesos 17% / 20% / 33% / 30%, outline atualizado a partir de 03/11/2026; entre os subtemas estão métricas do programa de segurança da informação e comunicação e reporte | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | primaria | CONFIRMADO (página lida) |
| 34 | IIA Three Lines Model (julho de 2020): o órgão de governança determina o apetite ao risco; papéis de segunda linha incluem segurança da informação e de tecnologia; auditoria interna é a terceira linha, independente da gestão e accountable perante o órgão de governança | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf | primaria | CONFIRMADO (PDF lido) |

Pendência nº 6 da Fase 0 atualizada: ISO/IEC 27001 confirmada como 2022 e CIS Controls confirmada como v8.1. MITRE ATT&CK segue não pesquisado e não foi citado nesta fase.

### NAO CONFIRMADO nesta fase

| # | Item | Situação | Ação |
|---|---|---|---|
| 1 | Contagem de controles do Anexo A da ISO/IEC 27001:2022 e os temas em que se organizam | Texto da norma é pago | Conferir no texto adquirido |
| 2 | Conteúdo das seções 4 a 10 da ISO/IEC 27001:2022 e lista normativa de informações documentadas | Texto da norma é pago | Conferir no texto adquirido |
| 3 | Número total de safeguards do CIS Controls v8.1 e distribuição por implementation group | Exige o documento completo | Conferir no material oficial da CIS |
| 4 | Duração e ciclo da auditoria de certificação ISO/IEC 27001 | Segue documentos obrigatórios do IAF, não lidos | Conferir em `iaf.nu` |
| 5 | Número de certificados ISO/IEC 27001 no Brasil | Exigiria recorte do ISO Survey por país | Conferir no ISO Survey |

## 2026-09-25 — Fase 14 (14-dados-privacidade)

| # | Afirmação confirmada | Fonte | Tipo | Resultado |
|---|---|---|---|---|
| 23 | A LGPD define em um só artigo dado pessoal, dado pessoal sensível, dado anonimizado, banco de dados, titular, controlador, operador, encarregado, agentes de tratamento, tratamento, anonimização, consentimento, bloqueio, eliminação, transferência internacional, uso compartilhado, relatório de impacto e autoridade nacional (art. 5º, incisos I a XIX) | https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.pdf | primária (Câmara dos Deputados, texto atualizado) | CONFIRMADO (art. 5º lido integralmente) |
| 24 | O tratamento se apoia em 10 princípios (art. 6º) e em 10 hipóteses legais (art. 7º); dado pessoal sensível tem hipóteses restritas próprias (art. 11); o legítimo interesse não consta da lista do art. 11 | idem | primária | CONFIRMADO |
| 25 | O art. 15 lista 4 situações de término do tratamento; o art. 16 manda eliminar depois e autoriza conservação em 4 hipóteses, duas delas exigindo anonimização | idem | primária | CONFIRMADO |
| 26 | O art. 18 lista 9 direitos do titular; o art. 18, §5º, remete o prazo de atendimento a regulamento; o art. 19 fixa em até 15 dias a declaração clara e completa de confirmação de existência ou acesso | idem | primária | CONFIRMADO |
| 27 | O art. 33 lista 9 hipóteses de transferência internacional; o art. 34 atribui à ANPD a avaliação do nível de proteção do país de destino; o art. 35 atribui à ANPD a definição do conteúdo das cláusulas-padrão contratuais | idem | primária | CONFIRMADO |
| 28 | O art. 41 obriga o controlador a indicar encarregado e a divulgar publicamente identidade e contato, preferencialmente no sítio eletrônico, e lista 4 atividades no §2º; o §3º prevê normas complementares e hipóteses de dispensa | idem | primária | CONFIRMADO |
| 29 | O art. 48 obriga o controlador a comunicar à ANPD e ao titular incidente que possa acarretar risco ou dano relevante, com conteúdo mínimo de 6 itens no §1º; o §3º valoriza, no juízo de gravidade, medidas que tornem os dados ininteligíveis | idem | primária | CONFIRMADO |
| 30 | O art. 50, §2º, descreve o programa de governança em privacidade em 8 alíneas, incluindo avaliação sistemática de impactos e riscos, supervisão interna e externa e planos de resposta a incidentes; o §3º manda publicar e atualizar as regras | idem | primária | CONFIRMADO |
| 31 | O art. 52 fixa as sanções administrativas, entre elas advertência e multa simples de até 2 por cento do faturamento, excluídos os tributos, limitada a R$ 50.000.000,00 por infração, multa diária, publicização, bloqueio, eliminação, suspensão do banco de dados e da atividade por até 6 meses prorrogável e proibição parcial ou total; o §1º lista 11 critérios de dosimetria | idem | primária | CONFIRMADO |
| 32 | O art. 55-A define a ANPD como autarquia de natureza especial vinculada ao Ministério da Justiça e Segurança Pública, com redação dada pela Medida Provisória nº 1.317, de 2025, convertida na Lei nº 15.352, de 2026; o art. 55-K dá à ANPD exclusividade na aplicação das sanções; o art. 65 escalona a vigência, com sanções a partir de 1º de agosto de 2021 | idem | primária | CONFIRMADO |
| 33 | A Resolução CD/ANPD nº 15, de 24 de abril de 2024, aprova o Regulamento de Comunicação de Incidente de Segurança e altera o art. 14, inciso II, do regulamento de agentes de tratamento de pequeno porte aprovado pela Resolução CD/ANPD nº 2, de 27 de janeiro de 2022 | https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024 | primária (Imprensa Nacional) | CONFIRMADO (texto integral lido) |
| 34 | O art. 5º do Regulamento define 6 critérios de risco ou dano relevante, cumulativos com a afetação significativa de interesses e direitos fundamentais, e o §2º define incidente com dados em larga escala | idem | primária | CONFIRMADO |
| 35 | O art. 6º fixa em 3 dias úteis, contados do conhecimento de que o incidente afetou dados pessoais, o prazo de comunicação à ANPD; o art. 9º fixa o mesmo prazo para a comunicação ao titular | idem | primária | CONFIRMADO |
| 36 | O art. 8º autoriza a ANPD a solicitar, a qualquer tempo, o registro das operações de tratamento, o relatório de impacto e o relatório de tratamento do incidente | idem | primária | CONFIRMADO |
| 37 | O art. 33.º do GDPR obriga o responsável a notificar a autoridade de controlo sem demora injustificada e, sempre que possível, até 72 horas após ter tido conhecimento da violação, e o subcontratante a notificar o responsável | https://eur-lex.europa.eu/legal-content/PT/TXT/HTML/?uri=CELEX:32016R0679 | primária (EUR-Lex) | CONFIRMADO (texto em português lido) |
| 38 | O Capítulo V do GDPR trata das transferências; o art. 44.º fixa o princípio geral; o art. 45.º admite a transferência com base em decisão de adequação da Comissão, sem autorização específica; o art. 46.º exige garantias adequadas com direitos oponíveis aos titulares; o art. 49.º trata das derrogações | idem | primária | CONFIRMADO |
| 39 | O art. 83.º, n.º 4, do GDPR fixa coimas até 10.000.000 EUR ou 2 por cento do volume de negócios anual mundial; o n.º 5 fixa até 20.000.000 EUR ou 4 por cento, abrangendo na alínea c) os arts. 44.º a 49.º; o n.º 2 lista os critérios de decisão | idem | primária | CONFIRMADO |
| 40 | O art. 6.º do GDPR lista 6 bases de licitude; o art. 5.º enuncia princípios relativos ao tratamento, com as alíneas a) a d) confirmadas nesta leitura | idem | primária | CONFIRMADO (art. 5.º lido parcialmente) |
| 41 | O EDPB mantém consultas e instrumentos datados, entre eles as Guidelines 01/2025 sobre pseudonimização, com feedback de 17/01/2025 a 14/03/2025; as Guidelines 02/2026 sobre anonimização, de 08/07/2026 a 30/10/2026; o modelo de notificação de violação de dados pessoais, de 10/06/2026 a 05/08/2026; e a recomendação sobre normas corporativas globais do subcontratante referida no art. 47.º do GDPR | https://www.edpb.europa.eu/public-consultations_en | primária | CONFIRMADO |
| 42 | A ANPD mantém centrais de conteúdo separadas para agente de tratamento, cidadão e titular de dados e fornecedores, canais de fiscalização, ouvidoria e acesso à informação, e publica instrumentos como o Radar Tecnológico nº 6 sobre deepfakes e orientações preliminares sobre aferição de idade, além de consultas sobre regulamento de fiscalização e agenda regulatória com temas de crianças e adolescentes, IA e biometria | https://www.gov.br/anpd/pt-br | primária | CONFIRMADO (página lida; as datas das consultas não foram lidas e não foram afirmadas) |

### Acesso às fontes nesta fase

planalto.gov.br devolveu timeout em duas tentativas. O texto da LGPD foi obtido no repositório
oficial da Câmara dos Deputados, com conteúdo normativo atualizado. O EUR-Lex devolveu página de
desafio de JavaScript para requisição direta; o texto em português do Regulamento (UE) 2016/679
foi lido em navegador com JavaScript habilitado, no endereço registrado na tabela acima.

### Pendências marcadas como NAO CONFIRMADO

| # | Item | Situação | Ação |
|---|---|---|---|
| 1 | Prazo regulamentar de atendimento aos direitos do titular além do art. 19 | O art. 18, §5º, remete a regulamento, que não foi lido | Confirmar em regulamento da ANPD antes de afirmar prazo |
| 2 | Lista da ANPD de países ou organismos com nível de proteção adequado (arts. 34 e 35) | Não pesquisado | Confirmar antes de citar qualquer país como adequado |
| 3 | Prazo do regulamento de agentes de tratamento de pequeno porte (Resolução CD/ANPD nº 2/2022, art. 14) | Não lido | Confirmar na revisão deste tema |
| 4 | Metodologia de cálculo do valor-base das multas (art. 53) | Não lida | Confirmar em 02-governanca-risco-compliance |
| 5 | Normas complementares da ANPD sobre definição, atribuições e dispensa do encarregado (art. 41, §3º) | Não lidas | Confirmar em 17-lideranca-ciso |
| 6 | ISO/IEC 27701, identificação e versão; domínios e validade de CDPSE, CIPP/E, CISM e CISSP | **27701 RESOLVIDA** na Fase 7 (item 54); domínios das credenciais seguem abertos | Ver `90-certificacoes/04-isaca.md` e `08-privacidade-e-iso.md` |
| 7 | Conteúdo do art. 34.º do GDPR, comunicação ao titular | Não lido | Confirmar antes de comparar prazos de comunicação entre regimes |

## 2026-09-25 — Fase 3 (04-identidade-acesso)

Confirmacoes registradas originalmente dentro do guia da area e movidas para ca, que e o dono
unico do registro (CONTRIBUTING §3).

Tabela de rastreio das afirmações normativas usadas nos temas desta área. O registro central fica em [99-fontes/registro-verificacao.md](../99-fontes/registro-verificacao.md).

| # | Afirmação | Fonte (URL) | Resultado |
|---|---|---|---|
| 1 | O SP 800-63B-4 foi publicado em julho de 2025 com data final de 31/07/2025, DOI 10.6028/NIST.SP.800-63b-4, e substitui o SP 800-63B de 02/03/2020 | https://csrc.nist.gov/pubs/sp/800/63/b/4/final | CONFIRMADO (página lida) |
| 2 | No nível 2 o verificador SHALL oferecer pelo menos uma opção resistente a phishing, e agências federais SHALL exigir autenticação resistente a phishing de servidores, contratados e parceiros | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO (seção normativa lida) |
| 3 | No nível 2 a autenticação usa um autenticador de múltiplos fatores ou dois fatores distintos, com pelo menos um autenticador resistente a replay; o tempo limite geral de reautenticação SHOULD ser de no máximo 24 horas e o de inatividade, 1 hora | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO |
| 4 | No nível 3 o autenticador criptográfico SHALL ter chave privada não exportável e SHALL prover resistência a phishing; autenticadores sincronizáveis SHALL NOT ser usados; o tempo limite geral é de no máximo 12 horas e o de inatividade, 15 minutos | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO |
| 5 | A característica biométrica não é reconhecida como autenticador isoladamente; comparação biométrica precisa vir acompanhada de um autenticador físico | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO |
| 6 | Indicadores de fraude podem reduzir o risco de autenticação incorreta, mas não mudam o nível de garantia nem substituem um fator | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO |
| 7 | Agências federais SHALL selecionar no mínimo o nível 2 quando informação pessoal é disponibilizada online | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | CONFIRMADO |
| 8 | Senha com menos de 8 caracteres é fraca quando há MFA; sem MFA, o limite é 15 caracteres; o comprimento máximo deve ser de pelo menos 64 caracteres; não deve haver exigência de rotação periódica nem regras de composição | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | CONFIRMADO (página lida, com referência ao SP 800-63B) |
| 9 | A pergunta de segurança não constitui autenticação de múltiplos fatores porque ambos os fatores são do tipo algo que se sabe | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | CONFIRMADO |
| 10 | Passkey é credencial de autenticação baseada em padrões FIDO, guardada em dispositivo ou chave de segurança e desbloqueada por biometria, PIN ou padrão; FIDO2 corresponde a WebAuthn e CTAP | https://fidoalliance.org/passkeys/ | CONFIRMADO (página lida) |
| 11 | Passkeys podem ser sincronizadas entre dispositivos ou vinculadas a um só dispositivo, e a autenticação entre dispositivos usa o transporte híbrido do CTAP com verificação de proximidade por Bluetooth sem depender das propriedades de segurança do Bluetooth | https://fidoalliance.org/passkeys/ | CONFIRMADO |
| 12 | A FIDO Alliance declara que alguns regimes regulatórios ainda precisam reconhecer passkeys como forma listada de MFA | https://fidoalliance.org/passkeys/ | CONFIRMADO |
| 13 | O SP 800-207, de agosto de 2020, afirma ausência de confiança implícita por localização física ou de rede e por propriedade do ativo; autenticação e autorização de sujeito e de dispositivo são funções discretas executadas antes de estabelecer a sessão com o recurso; o foco é proteger recursos, não segmentos de rede | https://csrc.nist.gov/pubs/sp/800/207/final | CONFIRMADO (resumo lido) |
| 14 | O SP 800-207 tem publicação complementar SP 800-207A e publicação relacionada CSWP 20, Planning for a Zero Trust Architecture | https://csrc.nist.gov/pubs/sp/800/207/final | CONFIRMADO pelo índice da página; título completo do SP 800-207A não lido |
| 15 | O ABAC é metodologia lógica de controle de acesso em que a autorização para executar operações é determinada avaliando atributos do sujeito, do objeto e das operações pedidas e, em alguns casos, condições de ambiente, contra política, regras ou relações | https://csrc.nist.gov/pubs/sp/800/162/upd2/final | CONFIRMADO (resumo lido) |
| 16 | O SP 800-162 é de janeiro de 2014 com atualizações de 02/08/2019 e tem família de controle Access Control | https://csrc.nist.gov/pubs/sp/800/162/upd2/final | CONFIRMADO |
| 17 | O CSRC define least privilege como princípio em que cada entidade recebe o mínimo de recursos e autorizações de sistema necessários para cumprir sua função | https://csrc.nist.gov/glossary/term/least_privilege | CONFIRMADO (página lida, com três definições herdadas de CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5) |
| 18 | O CISSP tem 8 domínios e o Domain 5 é Identity and Access Management, com 13% de peso; o outline é vigente desde 15/04/2024 e lista, no Domain 5, AAA, autenticação sem senha, SSO, gestão de credencial com cofre de senha, just-in-time, RBAC, ABAC, MAC, DAC, ponto de decisão e ponto de execução de política, revisão de acesso, provisão e desprovisão e gestão de conta de serviço | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | CONFIRMADO (página lida) |
| 19 | No PIM, papel elegível exige ação para ser usado e papel ativo não exige; a ativação pode exigir MFA, justificativa e aprovação; a atribuição pode ser limitada por data de início e fim; o produto mantém controle para impedir a remoção da última atribuição ativa de Global Administrator e de Privileged Role Administrator | https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure | CONFIRMADO (página lida) |
| 20 | O PIM define acesso just-in-time como modelo em que o usuário recebe permissão temporária e o acesso expira, e define menor privilégio como prática de dar a cada usuário apenas o mínimo necessário | https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure | CONFIRMADO |
| 21 | A governança de identidade liga o ciclo de vida da identidade ao sistema de RH como origem; fluxos de ciclo de vida rodam em eventos antes do início, em mudança de situação e na saída; a gestão de direitos remove o convidado B2B quando o acesso expira ou é revogado; revisões de acesso recorrentes remove identidades que não precisam mais do acesso; os documentos cobrem descobrir contas órfãs ou locais nas aplicações | https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview | CONFIRMADO (página lida) |
| 22 | O SCIM é protocolo HTTP de provisão e gestão de identidade em cenários multi-domínio, com esquema comum de usuário, modelo de extensão e protocolo de serviço; depende de TLS e de esquemas padrão de autenticação HTTP e desaconselha autenticação básica por ser fator único e segredo estático | https://datatracker.ietf.org/doc/rfc7644/ | CONFIRMADO (RFC lido) |
| 23 | O RFC 7644 é Standards Track de setembro de 2015 e define endpoints como /Users, /Groups, /Me, /Bulk, /Schemas e /ServiceProviderConfig; a exclusão de recurso retorna 204 e operações posteriores sobre ele retornam 404 | https://datatracker.ietf.org/doc/rfc7644/ | CONFIRMADO |
| 24 | O cofre de segredos deve registrar quem pediu o segredo e para qual sistema e papel, se o pedido foi aprovado, quando o segredo foi usado e por quem, quando expirou e se houve tentativa de reusar segredo expirado | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | CONFIRMADO (página lida) |
| 25 | Credenciais de emergência devem ser guardadas em cofre secundário e testadas com rotina, e credenciais de usuário não entram em rotação periódica, sendo trocadas apenas com indício de comprometimento | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | CONFIRMADO |

### Itens NAO CONFIRMADO em fonte oficial

| # | Item | Situação |
|---|---|---|
| 1 | Domínios, pesos e conteúdo do exame AZ-500 | Não pesquisado nesta execução; a sigla aparece apenas como referência de credencial |
| 2 | Número total de certificações e versão vigente da norma ABNT da família ISO/IEC 27002 quanto a controles de acesso | Texto da norma é pago; não usado como sustentação de afirmação |
| 3 | Identificadores de controle do NIST SP 800-53 Rev. 5 para gestão de conta e privilégio mínimo | Não conferidos nesta execução; os temas citam o glossário e não os identificadores |
| 4 | Título completo do NIST SP 800-207A | Apenas a existência e o identificador foram vistos |
| 5 | Estatísticas de terceiros divulgadas na página da FIDO Alliance sobre redução de phishing e roubo de credencial | Percentuais atribuídos a Verizon, Yubico, Google e outros; não são fonte primária e não foram usados nos temas |
| 6 | Análise da Microsoft sobre percentual de compromissos de conta que seriam evitados por MFA | Citada pelo OWASP como referência secundária; não usada nos temas |

---

## 2026-09-25 — Material público de privacidade e de GRC

Pesquisa em fonte primária para as duas áreas em que o acervo de cursos do CISO não tinha material.
Três frentes, todas com página aberta e lida — nenhum fato veio de resumo de terceiro.

### LGPD e ANPD (área 14)

| # | Fato confirmado | Fonte |
|---|---|---|
| 1 | Res. CD/ANPD nº 4/2023 aprova o Regulamento de Dosimetria: infração leve, média ou grave; agravantes de 10%/5%/20%/30% com tetos de 40%/20%/80%/90%; atenuantes de -75%/-50%/-30% por fase da cessação, -20% por política de boas práticas, -20% ou -10% por mitigação, -5% por cooperação; ônus da prova do infrator | in.gov.br (DOU) |
| 2 | Multa limitada a 2% do faturamento e a R$ 50 milhões por infração; pagamento em 20 dias úteis; redução de 25% para quem renuncia a recorrer | in.gov.br (DOU) |
| 3 | Res. CD/ANPD nº 18/2024 regulamenta o encarregado: indicação por ato formal, divulgação pública com nome completo, autonomia técnica como obrigação do agente, responsabilidade da conformidade com o agente, sem exigência de certificação | in.gov.br (DOU) |
| 4 | Res. CD/ANPD nº 19/2024 regulamenta a transferência internacional e as cláusulas-padrão, com prazo de 12 meses para incorporá-las aos contratos existentes | gov.br/anpd |
| 5 | Res. CD/ANPD nº 32/2026 reconhece a União Europeia como grau de proteção adequado, abrangendo Estados-membros, Islândia, Liechtenstein e Noruega | in.gov.br (DOU) |
| 6 | O prazo geral de atendimento ao titular depende de regulamento (art. 18, §5º) e a ANPD não o publicou; o prazo de 15 dias do art. 19 vale para confirmação e acesso | planalto.gov.br |
| 7 | A ANPD mantém publicada a lista de processos sancionadores; os **valores** das sanções não estão publicados de forma legível | gov.br/anpd |

### GDPR e EDPB (área 14)

| # | Fato confirmado | Fonte |
|---|---|---|
| 8 | Art. 33.º: notificação em até 72 horas, quatro itens de conteúdo mínimo, entrega por fases e registro obrigatório de **todas** as violações, sem limiar de risco | EUR-Lex |
| 9 | Art. 34.º: comunicação ao titular só em elevado risco, dispensada por cifragem, por medida posterior ou por esforço desproporcionado | EUR-Lex |
| 10 | Art. 35.º: avaliação de impacto antes do tratamento, com quatro itens de conteúdo mínimo e parecer do encarregado | EUR-Lex |
| 11 | Arts. 37.º a 39.º: três hipóteses de designação obrigatória de encarregado e proteção da posição funcional | EUR-Lex |
| 12 | Lista de decisões de adequação em vigor, incluindo **Brasil, 26/01/2026** | commission.europa.eu |
| 13 | Cláusulas contratuais padrão vigentes: Decisão de Execução (UE) 2021/914, de 04/06/2021, em vigor sem alteração | EUR-Lex |
| 14 | Art. 83.º: dois patamares de multa, 2% e 4% do volume de negócios global, com onze critérios de cálculo | EUR-Lex |
| 15 | EDPB: Guidelines 9/2022 sobre notificação de violação (v2.0, 04/04/2023) e Recommendations 01/2020 sobre medidas suplementares (v2.0, 18/06/2021) | edpb.europa.eu |

### GRC e risco (área 02)

| # | Fato confirmado | Fonte |
|---|---|---|
| 16 | SP 800-39, março/2011: três níveis de risco e quatro componentes (enquadrar, avaliar, responder, monitorar) | csrc.nist.gov |
| 17 | SP 800-30 Rev. 1, setembro/2012: quatro etapas da avaliação de risco, com tarefas de 1-1 a 4-1 | nvlpubs.nist.gov |
| 18 | SP 800-37 Rev. 2, dezembro/2018: sete fases do RMF (preparar, categorizar, selecionar, implementar, avaliar, autorizar, monitorar) | nvlpubs.nist.gov |
| 19 | CSF 2.0 tem 6 funções e **22 categorias**, com Govern 6, Identify 3, Protect 5, Detect 2, Respond 4 e Recover 2; as seis categorias de Govern são GV.OC, GV.RM, GV.RR, GV.PO, GV.OV e GV.SC | NIST CSWP 29 |
| 20 | CISM: 150 questões, pesos 33/30/20/17, com mudança de outline prevista para 03/11/2026 | isaca.org |
| 21 | CRISC: 150 questões, pesos 32/22/26/20, com linhas de defesa e apetite de risco listados na governança | isaca.org |
| 22 | ISACA define apetite, tolerância e capacidade de risco, atribuindo as definições ao Risk IT Framework 2ª edição | isaca.org (white paper aberto) |
| 23 | ISO 31000:2018, edição 2, 2018-02, 16 páginas, em estágio 90.92 "a ser revisada" e **não certificável** | iso.org |
| 24 | ISO/IEC 27005:2022, edição 4, 2022-10, 62 páginas, substitui a edição de 2018 | iso.org |
| 25 | Three Lines Model do IIA, julho/2020: papéis e não estruturas, sem sequência; a segunda linha inclui segurança da informação e tecnologia; o órgão de governança determina o apetite | theiia.org |

**O que ficou de fora por falta de leitura:** os Apêndices I e II da Res. nº 4/2023 (percentuais de valor-base e valores mínimos), os valores das sanções já aplicadas pela ANPD, a estrutura interna da ISO 31000 e da 27005 (conteúdo pago) e a definição de apetite do próprio COSO, lida apenas como citação da ISACA.

---

## 2026-09-25 — Fase 7 (verificação com navegador real)

Páginas que respondem 403 a requisição HTTP simples foram abertas em navegador e conferidas
diretamente. É o caminho de resolução previsto no CONTRIBUTING §13.

| # | Afirmação confirmada | Fonte (iso.org) | Resultado |
|---|---|---|---|
| 43 | ISO/IEC 27001:2022, edição 3, publicada em 2022-10, situação Published | /standard/27001 | CONFIRMADO |
| 44 | ISO/IEC 27002:2022, edição 3, 2022-02 | /standard/75652.html | CONFIRMADO |
| 45 | ISO 22301:2019, edição 2, 2019-10 | /standard/75106.html | CONFIRMADO |
| 46 | ISO/IEC 27037:2012, edição 1, 2012-10 | /standard/44381.html | CONFIRMADO |
| 47 | ISO/IEC 27017:2015 está retirada; a sucessora é ISO/IEC 27017:2026, edição 2, 2026-07 | /standard/43757.html e /standard/27017 | CONFIRMADO |
| 48 | ISO/IEC 27018:2019 está retirada; a sucessora é ISO/IEC 27018:2025, edição 3, 2025-08 | /standard/76559.html e /standard/27018 | CONFIRMADO |
| 49 | ISO/IEC 27035-1:2023, edição 2, 2023-02 | /standard/78973.html | CONFIRMADO |
| 50 | ISO/IEC 30111:2019, edição 2, 2019-10 | /standard/69725.html | CONFIRMADO |
| 51 | ISO/IEC 29147:2018, edição 2, 2018-10 | /standard/72311.html | CONFIRMADO |
| 52 | ISO/IEC 23894:2023, edição 1, 2023-02 | /standard/77304.html | CONFIRMADO |
| 53 | ISO/IEC 42001:2023, edição 1, 2023-12 | /standard/42001 | CONFIRMADO |
| 54 | ISO/IEC 27701:2025, edição 2, 2025-10, sucedendo a edição de 2019 | /standard/27701 | CONFIRMADO — resolve a pendência de identificação da 27701 |
| 55 | ISO/IEC 27000:2026, edição 6, 2026-07 | /standard/27000 | CONFIRMADO |
| 56 | A CompTIA não publica preço de exame nas páginas de certificação: o valor existe apenas no fluxo de compra da loja. A validade declarada é de três anos | comptia.org/en-us/certifications/* | CONFIRMADO — ausência de preço confirmada |
| 57 | A página da SAGE (journals.sagepub.com) bloqueia acesso automatizado **e por navegador** (403 Cloudflare); o artigo do Dunlosky é alcançável pela cópia institucional aberta usada como caminho de leitura | journals.sagepub.com e wku.edu (PDF, HTTP 200) | CONFIRMADO |
| 58 | O PDF do SEC Release 33-11216 é acessível por navegador (1.035.609 bytes, HTTP 200), embora responda 403 a requisição simples | sec.gov/files/rules/final/2023/33-11216.pdf | CONFIRMADO |
| 59 | A entrada "Andragogy" da SAGE Encyclopedia confirma os **seis pressupostos do aprendiz adulto** exatamente como o roadmap os usa, e acrescenta **quatro pressupostos sobre o ambiente de aprendizagem**; autoria de Eric T. Beeson, DOI 10.4135/9781506326139.n43 | sk.sagepub.com (lida em navegador) | CONFIRMADO |

**Consequência para a área 08-cloud:** as duas afirmações sobre normas retiradas estavam corretas,
e agora estão confirmadas em fonte primária. **Consequência para a área 14:** a ISO/IEC 27701
deixou de ser lacuna e passou a ter versão identificada.

**Consequência para a pedagogia do roadmap:** a base de Knowles está confirmada em fonte lida. A fonte
também descreve quatro pressupostos sobre o ambiente de aprendizagem, que o roadmap não explora — o
CONTRIBUTING §8 registra a nuance para que ela não pareça omissão.

---

| Home |
|---|
| [README](../README.md) |
