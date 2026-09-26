# Índice canônico de temas

Contrato de numeração. **Todo `tema_id` deste repositório consta aqui.** Agentes e autores não
inventam números: referenciam apenas o que está nesta tabela. Se um tema novo for necessário,
ele é acrescentado aqui primeiro, na posição correta.

A chave de identidade é `area_id#tema_id`. `tema_id` sozinho não é único: `TEMA-01` existe em
todas as áreas.

## 00-guia-basico — Guia básico do CISO

| tema_id | Tema |
|---|---|
| TEMA-01 | O que é segurança da informação e o que o CISO governa |
| TEMA-02 | A tríade CIA na prática |
| TEMA-03 | Ameaças, vulnerabilidades e risco: o vocabulário mínimo |
| TEMA-04 | O mandato do CISO: o que a lei e o mercado esperam |
| TEMA-05 | Como usar este roadmap e a trilha dos primeiros 90 dias |

## 01-fundamentos — Fundamentos de segurança da informação

| tema_id | Tema |
|---|---|
| TEMA-01 | Segurança da informação, segurança cibernética e privacidade |
| TEMA-02 | Objetivos de segurança em conflito e o custo do high water mark |
| TEMA-03 | Ativos, classificação e ciclo de vida da informação |
| TEMA-04 | Ameaças, atores e motivações |
| TEMA-05 | Vulnerabilidades, exposição e superfície de ataque |
| TEMA-06 | Risco: probabilidade, impacto e risco residual |
| TEMA-07 | Controles: preventivos, detectivos, corretivos e compensatórios |
| TEMA-08 | Defesa em profundidade e o princípio do menor privilégio |

## 02-governanca-risco-compliance — Governança, risco e compliance

| tema_id | Tema |
|---|---|
| TEMA-01 | Papel da governança de segurança e a estrutura decisória |
| TEMA-02 | Política, norma, procedimento e diretriz |
| TEMA-03 | Apetite e tolerância ao risco |
| TEMA-04 | ISMS e ISO/IEC 27001 |
| TEMA-05 | Frameworks de controles: NIST CSF 2.0 e CIS Controls |
| TEMA-06 | Métricas, reporte ao board e auditoria |

## 03-arquitetura-engenharia — Arquitetura e engenharia de segurança

| tema_id | Tema |
|---|---|
| TEMA-01 | Princípios de arquitetura de segurança |
| TEMA-02 | Modelagem de ameaças |
| TEMA-03 | Segmentação e zonas de confiança |
| TEMA-04 | Padrões de arquitetura: zero trust e defesa em profundidade |
| TEMA-05 | Segurança por design e requisitos não funcionais |
| TEMA-06 | Revisão de arquitetura e dívida de segurança |

## 04-identidade-acesso — Identidade, acesso e zero trust

| tema_id | Tema |
|---|---|
| TEMA-01 | Autenticação: fatores, MFA e FIDO2 |
| TEMA-02 | Autorização: RBAC, ABAC e o modelo de decisão |
| TEMA-03 | Ciclo de vida da identidade e governança de acesso |
| TEMA-04 | Menor privilégio, acesso just-in-time e revisão de acessos |
| TEMA-05 | PAM: contas privilegiadas e cofres de senha |
| TEMA-06 | Zero trust: identidade como novo perímetro |

## 05-rede-infraestrutura — Segurança de rede e infraestrutura

| tema_id | Tema |
|---|---|
| TEMA-01 | Fundamentos de rede para o gestor |
| TEMA-02 | Perímetro, firewall e inspeção |
| TEMA-03 | Segmentação, VLAN e microssegmentação |
| TEMA-04 | Criptografia de transporte: TLS e VPN |
| TEMA-05 | Segurança de DNS, e-mail e web |
| TEMA-06 | Monitoramento de tráfego e arquitetura de rede segura |

## 06-endpoint-plataforma — Segurança de endpoint e plataforma

| tema_id | Tema |
|---|---|
| TEMA-01 | Endpoint como superfície e como sensor |
| TEMA-02 | Hardening e linhas de base |
| TEMA-03 | Gestão de vulnerabilidades e patches no endpoint |
| TEMA-04 | EDR, XDR e resposta no host |
| TEMA-05 | Proteção de dados no endpoint e DLP |
| TEMA-06 | Segurança de servidores e cargas de trabalho |

## 07-criptografia-segredos — Criptografia e gestão de segredos

| tema_id | Tema |
|---|---|
| TEMA-01 | Simétrica, assimétrica e hashing |
| TEMA-02 | PKI, certificados e cadeia de confiança |
| TEMA-03 | TLS na prática |
| TEMA-04 | Gestão de chaves e ciclo de vida |
| TEMA-05 | Gestão de segredos e cofres |
| TEMA-06 | Criptografia pós-quântica e agilidade criptográfica |

## 08-cloud — Segurança em cloud

| tema_id | Tema |
|---|---|
| TEMA-01 | Modelo de responsabilidade compartilhada |
| TEMA-02 | Identidade e acesso em nuvem |
| TEMA-03 | Configuração incorreta e gestão de postura |
| TEMA-04 | Segurança de workloads e containers |
| TEMA-05 | Dados em nuvem: criptografia e segregação |
| TEMA-06 | Governança multi-cloud e contrato |

## 09-aplicacoes-devsecops — Segurança de aplicações e DevSecOps

| tema_id | Tema |
|---|---|
| TEMA-01 | Segurança no ciclo de vida de desenvolvimento |
| TEMA-02 | OWASP Top 10 para gestores |
| TEMA-03 | Modelagem de ameaças em aplicações |
| TEMA-04 | SAST, DAST, SCA e segurança no pipeline |
| TEMA-05 | Gestão de dependências e cadeia de suprimentos de software |
| TEMA-06 | Segurança de API |

## 10-operacoes-soc — Operações de segurança e SOC

| tema_id | Tema |
|---|---|
| TEMA-01 | O que é um SOC e seus modelos |
| TEMA-02 | Fontes de log e telemetria |
| TEMA-03 | Detecção: regras, casos de uso e MITRE ATT&CK |
| TEMA-04 | Triagem, severidade e escalonamento |
| TEMA-05 | Métricas de SOC e o problema dos falsos positivos |
| TEMA-06 | SOAR, automação e o futuro do SOC |

## 11-resposta-forense — Resposta a incidentes, forense e resiliência

| tema_id | Tema |
|---|---|
| TEMA-01 | Ciclo de resposta a incidentes |
| TEMA-02 | Preparação: playbooks, papéis e exercícios |
| TEMA-03 | Contenção, erradicação e recuperação |
| TEMA-04 | Forense digital: evidência e cadeia de custódia |
| TEMA-05 | Continuidade de negócios e recuperação de desastre |
| TEMA-06 | Comunicação de crise e notificação regulatória |

## 12-vulnerabilidades-threat-intel — Vulnerabilidades e threat intelligence

| tema_id | Tema |
|---|---|
| TEMA-01 | Gestão de vulnerabilidades: do inventário ao fechamento |
| TEMA-02 | CVSS, EPSS e priorização por risco real |
| TEMA-03 | Threat intelligence: fontes e níveis |
| TEMA-04 | MITRE ATT&CK na prática |
| TEMA-05 | Bug bounty e divulgação responsável |
| TEMA-06 | Métricas de exposição e dívida de remediação |

## 13-ofensiva-pentest — Segurança ofensiva

| tema_id | Tema |
|---|---|
| TEMA-01 | O que é pentest e o que ele não é |
| TEMA-02 | Metodologias e escopo |
| TEMA-03 | Tipos de teste: black, grey e white box |
| TEMA-04 | Red team, purple team e exercícios adversariais |
| TEMA-05 | Como ler um relatório de pentest |
| TEMA-06 | Contratar, autorizar e usar o resultado ofensivo |

## 14-dados-privacidade — Dados, privacidade e LGPD/GDPR

| tema_id | Tema |
|---|---|
| TEMA-01 | Privacidade, dado pessoal e o que a distingue de segurança |
| TEMA-02 | Classificação e inventário de dados |
| TEMA-03 | Ciclo de vida do dado e retenção |
| TEMA-04 | LGPD: bases legais, direitos do titular e incidentes |
| TEMA-05 | GDPR e transferência internacional |
| TEMA-06 | Programa de privacidade e o papel do encarregado |

## 15-fatores-humanos — Fatores humanos e cultura de segurança

| tema_id | Tema |
|---|---|
| TEMA-01 | O fator humano: por que pessoas são exploradas |
| TEMA-02 | Engenharia social e phishing |
| TEMA-03 | Programa de conscientização que funciona |
| TEMA-04 | Cultura de segurança e o papel da liderança |
| TEMA-05 | Insider threat e o acesso privilegiado humano |
| TEMA-06 | Medir comportamento, não cliques |

## 16-ia-seguranca — Segurança em IA e LLM

| tema_id | Tema |
|---|---|
| TEMA-01 | Riscos de IA e o que muda na segurança |
| TEMA-02 | Prompt injection e manipulação de modelos |
| TEMA-03 | Segurança de dados em pipelines de IA |
| TEMA-04 | Governança de IA e ISO/IEC 42001 |
| TEMA-05 | IA como ferramenta de defesa |
| TEMA-06 | Shadow AI: uso não governado |

## 17-lideranca-ciso — Liderança e gestão do CISO

| tema_id | Tema |
|---|---|
| TEMA-01 | O papel e o mandato do CISO |
| TEMA-02 | Posição na estrutura e reporte ao board |
| TEMA-03 | Orçamento, priorização e retorno de segurança |
| TEMA-04 | Comunicação com o executivo e com o técnico |
| TEMA-05 | Construir e liderar o time de segurança |
| TEMA-06 | Programa de segurança e plano de maturidade |

---

| Navegação | |
|---|---|
| Regras de relação | [RELACOES-TEMAS.md](./RELACOES-TEMAS.md) |
| Esquema do frontmatter | [FRONTMATTER.md](./FRONTMATTER.md) |
| Home | [README](../README.md) |
