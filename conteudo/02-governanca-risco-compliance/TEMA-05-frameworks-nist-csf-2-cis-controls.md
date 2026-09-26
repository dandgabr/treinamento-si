---
tema: "Frameworks de controles: NIST CSF 2.0 e CIS Controls"
tema_id: "TEMA-05"
area_id: "02-governanca-risco-compliance"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Escolher entre NIST CSF 2.0 e CIS Controls para uma decisão de priorização e montar uma matriz que ligue 6 controles ao mesmo tempo a resultados de framework, controle CIS e evidência única"
atende_objetivo: [5]
certificacoes: ["CISM", "CRISC"]
pre_requisitos: ["TEMA-04"]
relacoes:
  complementa:
    - alvo: "10-operacoes-soc#TEMA-03"
      motivo: "o framework define os resultados a detectar e o caso de uso do SOC implementa a detecção; destino planejado"
    - alvo: "02-governanca-risco-compliance#TEMA-04"
      motivo: "o sistema de gestão exige o processo; o framework entrega o catálogo de controles de onde saem as escolhas da declaração de aplicabilidade"
  aplicado_em:
    - alvo: "12-vulnerabilidades-threat-intel#TEMA-01"
      motivo: "o controle de gestão de vulnerabilidades só vira processo com inventário, prazo e fechamento registrados; destino planejado"
  aprofundado_por: []
  nao_confundir_com: []
fontes:
  - titulo: "The NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29, 26 de fevereiro de 2024"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST Cybersecurity Framework 2.0 — Resource and Overview Guide, NIST SP 1299, fevereiro de 2024"
    url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1299.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CIS Critical Security Controls v8.1 — lista dos 18 controles"
    url: "https://www.cisecurity.org/controls/cis-controls-list"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27002:2022 — Information security controls"
    url: "https://www.iso.org/standard/75652.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-37 Rev. 2 — Risk Management Framework for Information Systems and Organizations, dezembro de 2018, as sete fases do RMF"
    url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-37r2.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-30 Rev. 1 — Guide for Conducting Risk Assessments, setembro de 2012, as quatro etapas da avaliação"
    url: "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Frameworks de controles: NIST CSF 2.0 e CIS Controls

O NIST publicou o CSF 2.0 em 26 de fevereiro de 2024, com seis funções, 22 categorias e um conjunto de subcategorias que descrevem resultados, sem prescrever como alcançá-los ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25). O Center for Internet Security mantém, na versão 8.1, 18 controles prescritivos, priorizados e simplificados, com a adição da função de segurança Governance ([cisecurity.org](https://www.cisecurity.org/controls/cis-controls-list), acessado em 2026-09-25). Os dois respondem a perguntas diferentes, e quem tenta usar um no lugar do outro perde a saída que justificava o esforço.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: escolher entre NIST CSF 2.0 e CIS Controls para uma decisão de priorização, justificando pela saída esperada de cada um, e montar uma matriz que ligue 6 controles ao mesmo tempo a resultados de framework, controle CIS e evidência única.

## 2. Pré-requisitos

[TEMA-04](TEMA-04-isms-iso-27001.md), porque a matriz de controles é o que alimenta a declaração de aplicabilidade do sistema de gestão.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantas funções você aposta que o CSF 2.0 tem — quatro, cinco ou seis? Marque.
   Confiança: ___
2. Palpite: a sua empresa tem um perfil-alvo do CSF escrito? Se sim, quem mantém.
   Confiança: ___
3. Antes de ler: adotar o CSF 2.0 cria alguma obrigação legal nova para a sua empresa? Sim ou não.
   Confiança: ___
4. Chute: quantos controles o CIS Controls tem hoje? Anote o número.
   Confiança: ___

## 4. Caso real

Um CISO novo chega em uma empresa que já usa CIS Controls para o plano operacional e recebe do cliente um questionário baseado no NIST CSF 2.0. A equipe responde ao questionário abrindo uma segunda planilha, e cada controle passa a ter dois registros, dois donos e duas evidências. Em seis meses, as duas planilhas divergem sobre a cobertura de backup, e o cliente encontra a divergência.

A pergunta que o caso deixa aberta: como manter duas linguagens sem duplicar evidência? A resposta é uma matriz de correspondência com uma evidência por linha, e o resto do tema mostra como montá-la.

## 5. Conteúdo

### 5.1 Conceito

O CSF 2.0 é uma taxonomia de resultados. O CSF Core organiza subcategorias em categorias e as categorias nas seis funções: Govern, Identify, Protect, Detect, Respond e Recover. As funções devem ser tratadas ao mesmo tempo, e Govern aparece no centro do diagrama porque informa como as outras cinco são implementadas. O framework é de adoção voluntária e não prescreve como atingir cada resultado; o NIST mantém recursos complementares, entre eles Informative References, que mapeiam resultados para normas e outras publicações, Implementation Examples, Quick Start Guides e Community Profiles ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25).

As 22 categorias do CSF 2.0, com seus identificadores, são: `GV.OC` contexto organizacional, `GV.RM` estratégia de gestão de risco, `GV.RR` papéis, responsabilidades e autoridades, `GV.PO` política, `GV.OV` supervisão e `GV.SC` risco da cadeia de suprimentos; `ID.AM` gestão de ativos, `ID.RA` avaliação de risco e `ID.IM` melhoria; `PR.AA` identidade, autenticação e controle de acesso, `PR.AT` conscientização e treinamento, `PR.DS` segurança de dados, `PR.PS` segurança de plataforma e `PR.IR` resiliência da infraestrutura de tecnologia; `DE.CM` monitoramento contínuo e `DE.AE` análise de eventos adversos; `RS.MA` gestão de incidentes, `RS.AN` análise, `RS.CO` reporte e comunicação e `RS.MI` mitigação; `RC.RP` execução do plano de recuperação e `RC.CO` comunicação na recuperação.

O CIS Controls v8.1 é uma lista de controles prescritivos. Os 18 controles, na ordem publicada, são: inventário e controle de ativos corporativos; inventário e controle de ativos de software; proteção de dados; configuração segura de ativos e software; gestão de contas; gestão de controle de acesso; gestão contínua de vulnerabilidades; gestão de log de auditoria; proteções de e-mail e navegador; defesas contra malware; recuperação de dados; gestão de infraestrutura de rede; monitoramento e defesa de rede; conscientização e treinamento em segurança; gestão de prestadores de serviço; segurança de software de aplicação; gestão de resposta a incidentes; e teste de penetração ([cisecurity.org](https://www.cisecurity.org/controls/cis-controls-list), acessado em 2026-09-25).

### 5.2 Como funciona

A diferença de saída é o que orienta a escolha. O CSF 2.0 produz linguagem e priorização para comunicação: perfis organizacionais com estado atual e estado alvo, análise de lacunas e plano de ação. O CIS Controls produz uma lista ordenada de ações com dono técnico, o que é mais útil quando a equipe é pequena e a pergunta é por onde começar. A ISO/IEC 27002:2022 entra como orientação de implementação dos controles e a ISO/IEC 27001:2022 como requisito do sistema que sustenta o conjunto.

O CSF 2.0 descreve cinco passos para criar e usar um perfil organizacional, e são eles que estruturam a análise de lacunas: delimitar o escopo do perfil; reunir as informações necessárias, incluindo políticas, prioridades, registros de risco e análise de impacto no negócio; criar o perfil; analisar as lacunas entre perfil atual e alvo e produzir plano de ação, que pode ser um registro de risco ou um plano de ação e marcos; e implementar atualizando o perfil, repetindo o ciclo conforme necessário ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25).

O CIS Controls oferece priorização por grupos de implementação, e a própria CIS mantém material específico sobre eles na página oficial dos controles. O número de safeguards por controle e a distribuição por grupo não foram conferidos nesta execução, porque exigem o documento completo. O que o CISO precisa saber é o princípio: a priorização existe para que uma empresa com equipe pequena comece pelos controles de inventário e configuração, que são pré-requisito de quase todo o resto.

A matriz de correspondência resolve o problema do caso da seção 4. A regra é uma evidência por linha. Um controle bem escolhido aparece em três colunas e é provado por um único relatório, gerado uma vez, revisado no mesmo ciclo.

O CSF 2.0 organiza as seis funções em **22 categorias**, e a distribuição não é uniforme: Govern tem 6, Identify 3, Protect 5, Detect 2, Respond 4 e Recover 2 ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), Anexo A, Tabela 1, acessado em 2026-09-25). As seis categorias da função Govern são as que um CISO usa na conversa com o conselho, porque nomeiam contexto organizacional (`GV.OC`), estratégia de gestão de risco (`GV.RM`), papéis, responsabilidades e autoridades (`GV.RR`), política (`GV.PO`), supervisão (`GV.OV`) e risco da cadeia de suprimentos (`GV.SC`). O número 22 é útil por si: permite medir cobertura por categoria em vez de declarar aderência ao framework inteiro, que é o que a maioria dos relatórios faz.

Abaixo do CSF, dois documentos do NIST fazem o trabalho operacional e valem como referência de método. O **SP 800-30 Rev. 1**, de setembro de 2012, define a avaliação de risco em quatro etapas — preparar, conduzir, comunicar e compartilhar, e manter — com tarefas nomeadas de 1-1 a 4-1 ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-30r1.pdf)). O **SP 800-37 Rev. 2**, de dezembro de 2018, define o Risk Management Framework em **sete fases**: preparar, categorizar, selecionar, implementar, avaliar, autorizar e monitorar, e explicita que a preparação existe tanto no nível da organização quanto no do sistema ([nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-37r2.pdf)). Para um gestor, a diferença entre os dois é de escopo: o 800-30 diz como se avalia um risco; o 800-37 diz como o risco entra no ciclo de vida do sistema com decisão formal de autorização.

### 5.3 Exemplo resolvido

Objetivo: montar a matriz de correspondência para uma empresa que já usa CIS Controls e precisa responder ao cliente em linguagem CSF 2.0. Passo a passo.

1. Escolha 6 controles que já existem, com evidência produzida hoje. Backups, inventário de ativos, gestão de vulnerabilidades, autenticação com dois fatores, coleta de log e resposta a incidente.
2. Para cada um, encontre o resultado correspondente no CSF 2.0 e o controle correspondente no CIS Controls v8.1.
3. Descreva a evidência única. Se um controle exigir três relatórios diferentes, ele está mal desenhado.

| Controle implementado | Resultado no CSF 2.0 | CIS Controls v8.1 | Evidência única |
|---|---|---|---|
| Backup com teste de restauração trimestral | `PR.DS-11`: backups de dados são criados, protegidos, mantidos e testados | Controle 11, Data Recovery | Relatório de teste de restauração com data, escopo e assinatura |
| Inventário de ativos mantido e reconciliado | `ID.AM-01`: inventários de hardware gerenciado são mantidos | Controle 1, Inventory and Control of Enterprise Assets | Exportação mensal do inventário com taxa de reconciliação |
| Vulnerabilidades identificadas, validadas e registradas | `ID.RA-01`: vulnerabilidades em ativos são identificadas, validadas e registradas | Controle 7, Continuous Vulnerability Management | Relatório de varredura com prazos por criticidade e fechamento |
| Autenticação com dois fatores nas contas humanas | `PR.AA-03`: usuários, serviços e hardware são autenticados | Controle 6, Access Control Management | Relatório de cobertura de autenticação multifator por aplicação |
| Log gerado e disponível para monitoramento | `PR.PS-04`: registros de log são gerados e ficam disponíveis para monitoramento contínuo | Controle 8, Audit Log Management | Lista de fontes de log ativas com retenção configurada |
| Plano de resposta executado e incidentes categorizados | `RS.MA-01` e `RS.MA-03`: plano executado em coordenação com terceiros e incidentes categorizados e priorizados | Controle 17, Incident Response Management | Registro de incidente com classificação, cronologia e lições aprendidas |

4. Rode a análise de lacunas no formato do CSF 2.0. Para cada linha, marque: alcançado, parcial ou ausente, e no perfil alvo liste o que falta. No exemplo, a maior lacuna apareceu em `GV` e não em `PR`: as linhas de proteção estavam razoáveis, e as de governança, como apetite declarado e papéis comunicados, estavam ausentes.
5. Leve a matriz para o fórum executivo. Ela resolve três conversas de uma vez: o questionário do cliente, o plano operacional da equipe e a declaração de aplicabilidade do sistema de gestão.

### 5.4 Problema de completar

Complete as duas linhas em branco da matriz e responda à pergunta de priorização.

| Controle implementado | Resultado no CSF 2.0 | CIS Controls v8.1 | Evidência única |
|---|---|---|---|
| MFA em contas administrativas e cofre de senha | ______ | Controle 5, Account Management | ______ |
| Processo de remoção de acesso em até 24 horas após desligamento | `PR.AA-05` | ______ | ______ |

Pergunta de priorização: a empresa tem três pessoas na equipe de segurança e nenhum inventário confiável de ativos. O primeiro trimestre deve priorizar a construção do inventário ou a compra de ferramenta de detecção sofisticada? Justifique em duas linhas usando as fontes deste tema.

Regra de conferência: sem inventário, vulnerabilidade não tem objeto, monitoramento não tem escopo e incidente não tem universo de busca.

## 6. Por que isso importa para o CISO

O framework é o que permite responder a três públicos com o mesmo trabalho. Para o cliente que manda um questionário, o CSF 2.0 dá o vocabulário; para a equipe pequena, o CIS Controls dá a ordem de execução; para o regulador que pede sistema de gestão, a ISO/IEC 27001 dá o requisito. A matriz de correspondência é o que impede o custo de manter três programas paralelos.

Há um segundo efeito, mais sutil e mais importante para quem está começando. O CSF 2.0 diz explicitamente que as funções devem acontecer ao mesmo tempo e que Govern informa as outras cinco. Isso contraria a prática comum de tratar governança como projeto de documentação posterior aos controles técnicos. Quem inverte a ordem descobre no primeiro incidente que não tem critério de aceitação nem alçada para decidir o que fazer.

## 7. Aplicação prática

Duas semanas, sem comprar ferramenta.

1. Liste 10 controles que a sua empresa já opera e colete, para cada um, a evidência que existe hoje. Se não houver evidência, o controle é intenção.
2. Monte a matriz de correspondência com três colunas: resultado no CSF 2.0, controle no CIS Controls v8.1 e evidência única.
3. Marque cada linha como alcançada, parcial ou ausente e escreva as duas lacunas de governança que aparecerem.
4. Leve a matriz ao fórum executivo e peça decisão sobre as duas lacunas, com data e dono.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre a diferença de saída entre os dois frameworks, uma sobre por que a matriz evita trabalho duplicado, e uma conectando a escolha a uma decisão de orçamento que você tem na mesa.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Govern é uma função que se implementa depois | O CSF 2.0 diz que as funções são tratadas ao mesmo tempo e que Govern informa as outras cinco | Govern produz contexto, estratégia, papéis, política e supervisão antes e durante os controles |
| Tier do CSF é nota de maturidade | Tier caracteriza o rigor da governança e da gestão de risco, aplicado a um perfil | Tier é rótulo de contexto, não pontuação; a nota não existe no CSF 2.0 |
| Adotar o CSF 2.0 é obrigatório | A adoção é voluntária, ainda que possa ser exigida por política pública ou contrato | Verifique o que o seu cliente ou regulador exige: normalmente é resultado, não framework específico |
| CIS Controls substituem a ISO/IEC 27001 | Os CIS Controls são catálogo prescritivo de controles e não definem requisitos de sistema de gestão | A 27001 define o sistema, a 27002 orienta os controles, os CIS Controls ordenam a execução |
| Cada framework precisa de evidência própria | Evidência duplicada diverge com o tempo, como no caso da seção 4 | Uma evidência por controle, referenciada por todas as colunas da matriz |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Liste as seis funções do CSF 2.0 e explique por que Govern fica no centro.
2. Quantas categorias tem o CSF 2.0, e quais pertencem à função Govern?
3. Descreva os cinco passos do CSF 2.0 para criar e usar um perfil organizacional.
4. Quantos controles tem o CIS Controls v8.1 e qual função foi acrescentada nessa versão?
5. Qual das duas ferramentas você escolhe para montar um plano de 90 dias com equipe pequena e por quê?

<details>
<summary>Conferir respostas</summary>

1. Govern, Identify, Protect, Detect, Respond e Recover. Govern fica no centro porque estabelece contexto, estratégia, papéis e supervisão que informam como as outras cinco funções são implementadas.
2. São 22 categorias. Na função Govern: `GV.OC`, `GV.RM`, `GV.RR`, `GV.PO`, `GV.OV` e `GV.SC`.
3. Delimitar o escopo; reunir as informações necessárias; criar o perfil; analisar lacunas e produzir plano de ação; implementar e atualizar o perfil, repetindo o ciclo.
4. 18 controles, e a versão 8.1 acrescentou a função de segurança Governance.
5. CIS Controls, porque entrega lista prescritiva e priorizada, adequada a equipe pequena, enquanto o CSF 2.0 entrega taxonomia de resultados e perfis, mais útil para comunicação e análise de lacunas com o executivo.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Montar a matriz de correspondência com 6 controles reais | Rebaixar: repetir em D+3 |
| D+30 | Apresentar a análise de lacunas no formato do CSF 2.0 ao fórum executivo | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 12-vulnerabilidades-threat-intel#TEMA-01 | o controle de gestão de vulnerabilidades só vira processo com inventário, prazo e fechamento registrados; destino planejado |
| complementa | 02-governanca-risco-compliance#TEMA-04 | o sistema de gestão exige o processo; o framework entrega o catálogo de controles de onde saem as escolhas da declaração de aplicabilidade |
| complementa | 10-operacoes-soc#TEMA-03 | o framework define os resultados a detectar e o caso de uso do SOC implementa a detecção; destino planejado |

## 13. Certificações e leitura recomendada

O domínio 3 do CISM inclui normas e frameworks do setor entre os subtemas de desenvolvimento do programa e pede que o candidato determine se os controles são apropriados e mantêm o risco em nível aceitável ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25).

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Program | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CRISC | Controles de risco de TI | NIST CSF 2.0 — CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | NIST CSF 2.0 Resource and Overview Guide — NIST SP 1299 | primaria | https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.1299.pdf | "2026-09-25" | alta |
| 3 | CIS Critical Security Controls v8.1 — lista dos 18 controles | primaria | https://www.cisecurity.org/controls/cis-controls-list | "2026-09-25" | alta |
| 4 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 5 | ISO/IEC 27002:2022 — Information security controls | primaria | https://www.iso.org/standard/75652.html | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: o número total de safeguards do CIS Controls v8.1 e a distribuição por implementation group; e a correspondência item a item entre o Anexo A da ISO/IEC 27001:2022 e os controles da ISO/IEC 27002:2022, que exigiria o texto pago.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-isms-iso-27001.md) |
| Próximo tema | [TEMA-06](TEMA-06-metricas-reporte-auditoria.md) |
| Home | [README](../README.md) |
