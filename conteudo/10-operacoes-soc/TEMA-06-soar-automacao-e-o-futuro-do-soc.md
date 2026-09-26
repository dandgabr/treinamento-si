---
tema: "SOAR, automação e o futuro do SOC"
tema_id: "TEMA-06"
area_id: "10-operacoes-soc"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Decidir o que automatizar primeiro em um SOC, classificando cada ação candidata por reversibilidade, alcance do erro e efeito sobre a evidência"
atende_objetivo: [5]
certificacoes: ["GCIH", "CySA+"]
pre_requisitos: ["TEMA-04"]
relacoes:
  complementa:
    - alvo: "11-resposta-forense#TEMA-03"
      motivo: "a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala"
  aprofundado_por:
    - alvo: "16-ia-seguranca#TEMA-05"
      motivo: "a automação de triagem evolui para modelos que classificam alerta, e o mecanismo dessa classificação pertence à área de segurança em IA"
  aplicado_em:
    - alvo: "11-resposta-forense#TEMA-02"
      motivo: "o playbook automatizado é a mesma preparação de papéis, contatos e exercícios, em formato executável"
  nao_confundir_com: []
fontes:
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "MITRE D3FEND — grafo de conhecimento de contramedidas, versão 1.6.0"
    url: "https://d3fend.mitre.org/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "SigmaHQ — Sigma Rules Specification, versão 2.1.0, de 02 de agosto de 2025, com histórico de versões e filtros compartilhados"
    url: "https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "MITRE ATT&CK — Version History, cadência de versões do catálogo"
    url: "https://attack.mitre.org/resources/versions/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# SOAR, automação e o futuro do SOC

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir listar as ações repetitivas da sua triagem, classificar cada uma por reversibilidade, alcance do erro e efeito sobre a evidência, e justificar por escrito quais entram em automático, quais entram em fila com aprovação e quais permanecem humanas.

## 2. Pré-requisitos

[TEMA-04](./TEMA-04-triagem-severidade-e-escalonamento.md): automatizar é codificar uma decisão, e decisão que não está escrita não pode ser codificada. A execução do playbook e os papéis ficam em [11 Resposta a incidentes](../11-resposta-forense/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quais três passos da sua triagem são sempre iguais, qualquer que seja o alerta?
   Confiança: ___
2. Quem autorizou, por escrito, a última ação automática que o ambiente executa sem aprovação?
   Confiança: ___
3. Se a automação isolar uma máquina por engano, quanto tempo a empresa perde até alguém perceber?
   Confiança: ___
4. Onde está registrado o que a automação fez no último mês?
   Confiança: ___

## 4. Caso real

O playbook do CISA exige implantar sistema de ticket ou de gestão de casos que capture sistemas, aplicações e usuários afetados, tipo de atividade, grupo de ameaça, TTPs empregadas e impacto. Exige ainda, na preparação, documentar processo para designar coordenador, plano de contingência para reforço de pessoal com papéis atribuídos e pontos de contato primário e secundário com nome, telefone e e-mail. Na fase posterior ao incidente, manda acrescentar detecção de amplitude empresarial para as técnicas que foram executadas com sucesso, identificar pontos cegos e, para capacidade avançada, emular as TTPs do adversário para verificar se a contramedida detecta o comportamento, com coordenação explícita com o time azul para não confundir o exercício com ataque real.

O que o documento padroniza são justamente os elementos que a automação consome: chamado com campos fixos, papéis nomeados, contatos, lista de verificação com condição de encerramento e teste de detecção. Ainda assim, o mesmo material limita a automação à capacidade declarada: a manobra de desviar o adversário para sandbox é reservada aos SOCs avançados, e a defesa ativa com iscas a quem tem pessoal e capacidade.

A pergunta que o caso deixa aberta: se a automação consome o que já está padronizado, por que a maior parte dos projetos de automação começa pela compra da ferramenta e não pela padronização?

## 5. Conteúdo

### 5.1 Conceito

Automação de operação de segurança é a execução de uma decisão já tomada por um processo definido, sem intervenção humana por evento. A sigla SOAR, usada no mercado para plataformas que orquestram esse tipo de execução, NAO CONFIRMADO em fonte oficial: nenhuma definição normativa do termo foi localizada nas fontes verificadas nesta execução. O que existe com definição verificável são as contramedidas, e o MITRE D3FEND, na versão 1.6.0, dá nome e código a elas: suspensão de processo, remoção de processo, isolamento de rede, bloqueio de conta, revogação de credencial, encerramento de sessão e atualização de software aparecem como classes de ação distintas, com identificadores próprios.

Essa distinção tem consequência prática. "Responder ao alerta" é uma frase; revogar credencial é uma ação com efeito mensurável sobre o adversário e sobre a operação. Automação sem vocabulário de ação vira sequência de passos em uma ferramenta que ninguém sabe explicar depois.

O insumo da automação é o dado estruturado. Ticket com campos obrigatórios, contatos nomeados, condição de encerramento definida e lista de verificação são o que permite decidir em código. Produzir esse dado é trabalho de processo, e é o trabalho que costuma ser pulado.

### 5.2 Como funciona

Três condições precisam valer para que uma ação entre em automático. A ação é reversível ou de efeito desprezível. O insumo que a dispara é confiável, ou seja, a regra que a aciona tem falso positivo declarado e medido. E o registro da ação é suficiente para reconstruir o que aconteceu. Falta qualquer uma das três, e a ação deve ficar em fila com aprovação humana.

A evidência tem prioridade sobre a contenção quando as duas competem. O playbook do CISA coloca a coleta e a preservação de dado antes da erradicação e determina que a evidência seja registrada com o que foi adquirido, quando e por quem. Uma rotina automática que reinicia serviço ou apaga artefato no primeiro minuto destrói o que a apuração posterior precisaria provar, inclusive para efeito de notificação regulatória.

O conteúdo de detecção também é software e precisa de gestão de mudança. A especificação Sigma registra versões de especificação em datas identificadas, e a versão 1.0.4 é de junho de 2023, a 2.0.0 de agosto de 2024 e a 2.1.0 de agosto de 2025, com documentos de migração entre versões maiores. Repositório de regras sem controle de versão quebra silenciosamente quando a plataforma muda de formato. Os filtros compartilhados da especificação existem para que a mesma exclusão seja mantida em um lugar só, em vez de replicada em dezenas de arquivos.

O mapa do ataque muda a cada semestre. O ATT&CK teve a v18.1 vigente de 28 de outubro de 2025 a 27 de abril de 2026 e a v19.2 a partir de 28 de abril de 2026. Rotina anual de revisão de cobertura é insuficiente para uma cadência desse tamanho; a revisão precisa de gatilho declarado, ligado à publicação de versão.

### 5.3 Exemplo resolvido

Operação com dois mil alertas por semana e quatro analistas quer cortar trabalho manual. Seis ações candidatas.

| Ação candidata | Reversível | Alcance do erro | Efeito sobre a evidência | Decisão |
|---|---|---|---|---|
| Enriquecer alerta com dono do ativo e histórico de alerta | sim | nenhum, não muda estado | nenhum | automático |
| Criar chamado com campos fixos e notificar o plantão | sim | baixo, ruído de notificação | registra o caso | automático |
| Bloquear domínio em lista de negação com base em regra de reputação | sim, com expiração | indisponibilidade temporária de serviço legítimo | preserva o log de resolução | automático com expiração |
| Revogar sessão de conta de serviço suspeita | sim, com reautenticação | quebra integração entre sistemas | preserva log de autenticação | fila com aprovação do dono do sistema |
| Isolar máquina de banco de dados em produção | sim, com impacto de disponibilidade | parada de serviço com efeito financeiro | impede coleta viva se mal executado | fila com aprovação do coordenador |
| Reinstalar sistema operacional para remover artefato | não | alto | destrói memória e disco | humano, após coleta |

Passo a passo da decisão.

1. Liste as ações que o time executa mais de dez vezes por semana. Automação de ação rara raramente compensa o custo de manter o código.
2. Para cada uma, verifique na prática se o efeito é reversível em minutos, e não no papel. Bloqueio de domínio sem prazo de expiração não é reversível quando alguém esquece de revisá-lo.
3. Verifique a confiabilidade do disparo. Se a regra que aciona a ação não tem falso positivo declarado, a automação vai propagar erro em escala.
4. Verifique a ordem em relação à evidência. Ação que apaga estado ou reinicia serviço deve vir depois da coleta, ou ter coleta embutida.
5. Escreva a política de automação por ação, com quem aprovou, qual o limite e como se reverte. Guarde junto com o playbook, porque a auditoria pede o documento, não a configuração da ferramenta.
6. Registre cada execução automática em log consultável, com o disparador, a ação, o alvo e o resultado. Sem esse registro, a primeira automação errada vira discussão de memória.
7. Meça o efeito na métrica do TEMA-05, tempo até a primeira decisão e hora de triagem por caso real. Automação que não move nenhuma das duas é custo de licença.

### 5.4 Problema de completar

Caso: credencial de conta de serviço usada por integração entre dois sistemas passou a ser empregada de endereço fora do intervalo conhecido e criou regra de encaminhamento de mensagem. Complete a política de automação.

1. Primeiras três ações a automatizar: ___
2. Ação que exige aprovação humana e de quem: ___
3. Ordem em relação à coleta de evidência, com justificativa: ___
4. Como cada execução automática é registrada e por quanto tempo: ___
5. Duas métricas que provam efeito: ___

## 6. Por que isso importa para o CISO

Automação mal delimitada troca um risco por outro e transfere a conta para outra área. Isolar automaticamente uma máquina que sustenta faturamento gera prejuízo que aparece na reunião de resultado, e a conversa deixa de ser sobre segurança. O caminho defensável é a política escrita por ação, com limite e reversão declarados, porque ela é o documento que a auditoria vai pedir e é o que protege a decisão do CISO quando a automação erra. O horizonte também é orçamentário: o insumo da automação é processo padronizado, e investir primeiro em disciplina de chamado e de catálogo custa menos do que a plataforma que depois não tem o que executar.

## 7. Aplicação prática

Assista a uma triagem do início ao fim e anote cada passo manual, com o tempo de cada um. Classifique os passos na tabela da seção 5.3. O primeiro candidato a automação será o passo mais repetido que não muda estado nenhum no ambiente. Escreva a política dele em uma página antes de pedir orçamento.

## 8. Autoexplicação

Explique em três frases por que a automação depende mais de processo escrito do que de plataforma. Ligue a algo que você já faz hoje: a lista de verificação que alguém preenche à mão depois de cada incidente já é o rascunho do playbook executável.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Automatizar primeiro a ação mais visível, como isolar máquina | é a ação irreversível com maior alcance de erro | começar por enriquecimento, abertura de chamado e ação reversível com expiração |
| Tratar automação como projeto de ferramenta | sem campo de chamado, papel nomeado e condição de encerramento, não há o que orquestrar | padronizar o processo antes e usar a ferramenta como executor |
| Automatizar antes de preservar evidência | a rotina apaga exatamente o dado que a apuração e a notificação exigem | coleta antes da ação destrutiva, com registro do que, quando e por quem |
| Manter regras e playbooks sem controle de versão | a plataforma muda de formato e a regra quebra sem aviso | repositório versionado, com migração acompanhando a versão da especificação |
| Revisar cobertura uma vez por ano | o catálogo de táticas muda em intervalo menor, com versão maior e menor | gatilho de revisão declarado ligado à publicação de versão do catálogo |

## 10. Recuperação ativa

1. Quais são as três condições que uma ação deve cumprir para entrar em execução automática?
2. Por que bloqueio de domínio sem prazo de expiração é pior que isolar uma máquina, do ponto de vista de risco operacional acumulado?
3. O que o playbook do CISA exige crescer no ciclo posterior ao incidente, e por que isso importa para a automação?
4. Cite duas classes de contramedida do D3FEND que correspondem a ações típicas de contenção.

<details>
<summary>Conferir respostas</summary>

1. Ação reversível ou de efeito desprezível; insumo de disparo confiável, com falso positivo medido; e registro suficiente para reconstruir o que aconteceu.
2. Porque o erro de bloqueio permanece sem prazo e sem dono, degradando serviço legítimo por tempo indefinido e sem evento que force a revisão, enquanto o isolamento de máquina costuma ter dono e janela de reversão explícitos.
3. Detecção de amplitude empresarial para as técnicas executadas com sucesso e a identificação dos pontos cegos, além de exercício de emulação das TTPs com coordenação com o time azul. Importa porque a automação que só contém, sem alimentar o ciclo de detecção, deixa a mesma técnica voltar.
4. Entre as verificadas: isolamento de rede, bloqueio de conta, revogação de credencial, encerramento de sessão, suspensão de processo e remoção de processo.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Classificar três passos manuais da própria triagem na tabela de decisão | Rebaixar: repetir em D+3 |
| D+30 | Escrever a política de uma ação automatizada, com limite e reversão | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 11-resposta-forense#TEMA-02 | o playbook automatizado é a mesma preparação de papéis, contatos e exercícios, em formato executável |
| aprofundado_por | 16-ia-seguranca#TEMA-05 | a automação de triagem evolui para modelos que classificam alerta, e o mecanismo dessa classificação pertence à área de segurança em IA |
| complementa | 11-resposta-forense#TEMA-03 | a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| GCIH | Tratamento de incidente e automação de resposta | CISA — Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf |
| CySA+ | Análise de segurança com apoio de automação | MITRE D3FEND, versão 1.6.0 | primaria | https://d3fend.mitre.org/ |

Leitura recomendada: [SigmaHQ — Sigma Rules Specification, v2.1.0, 02 de agosto de 2025](https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md); [MITRE ATT&CK — Version History](https://attack.mitre.org/resources/versions/).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 2 | MITRE D3FEND, versão 1.6.0 | primaria | https://d3fend.mitre.org/ | "2026-09-25" | alta |
| 3 | SigmaHQ — Sigma Rules Specification, v2.1.0, 02 de agosto de 2025, com histórico de versões | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md | "2026-09-25" | alta |
| 4 | MITRE ATT&CK — Version History | primaria | https://attack.mitre.org/resources/versions/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-metricas-de-soc-e-falsos-positivos.md) |
| Home | [README](../README.md) |
