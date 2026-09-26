---
tema: "Controles: preventivos, detectivos, corretivos e compensatórios"
tema_id: "TEMA-07"
area_id: "01-fundamentos"
nivel: intermediario
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Selecionar controles para um risco identificado, classificando cada um pela função que cumpre e justificando a proporção de verba entre prevenção, detecção e correção"
atende_objetivo: [5, 6]
certificacoes: ["Security+", "CISSP", "CISM"]
pre_requisitos: ["TEMA-06"]
relacoes:
  complementa:
    - alvo: "01-fundamentos#TEMA-06"
      motivo: "o controle escolhido define o risco residual, e sem risco não existe critério para escolher controle"
    - alvo: "01-fundamentos#TEMA-08"
      motivo: "empilhar controles e limitar privilégio são as duas formas de fazer o controle sobreviver à falha do vizinho"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-05"
      motivo: "a taxonomia de controles é o que permite escolher um framework e justificar o gasto"
  nao_confundir_com: []
fontes:
  - titulo: "NIST CSRC Glossary — security control"
    url: "https://csrc.nist.gov/glossary/term/security_control"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — defense in depth"
    url: "https://csrc.nist.gov/glossary/term/defense_in_depth"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — attack surface"
    url: "https://csrc.nist.gov/glossary/term/attack_surface"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CompTIA Security+ SY0-701 Exam Objectives"
    url: "https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Controles: preventivos, detectivos, corretivos e compensatórios

Um plano de segurança com 90% da verba em prevenção tem uma característica previsível: quando o controle preventivo falha, ninguém descobre rápido e ninguém sabe voltar. A distribuição por função é a decisão mais visível do orçamento.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: selecionar controles para um risco identificado, classificando cada um pela função que cumpre e justificando por escrito a proporção de verba entre prevenção, detecção e correção.

## 2. Pré-requisitos

[TEMA-06](TEMA-06-risco-probabilidade-impacto.md). Sem risco declarado, não existe critério para dizer que um controle foi suficiente.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: qual percentual da verba da sua área vai hoje para prevenção? Anote antes de conferir com o orçamento.
   Confiança: ___
2. Palpite: um controle detectivo substitui um preventivo sem que ninguém aceite risco a mais? Escolha sim ou não.
   Confiança: ___
3. Na sua experiência, exceção de política tem prazo e dono, ou vive sendo renovada? Descreva o que acontece hoje.
   Confiança: ___

## 4. Caso real

Um relatório de auditoria exige autenticação multifator para todos os acessos administrativos. Um sistema de faturamento usado desde 2011 não suporta o recurso e o fornecedor encerrou o suporte do produto. O time de TI propõe adiar a exigência por dois anos.

O auditor recusa o adiamento e pede alternativa com efeito equivalente. A saída negociada: acesso administrativo apenas de dois endereços de rede conhecidos, sessão gravada, aprovação nominal de cada acesso pelo gestor do sistema e revisão trimestral dos registros. A pergunta que o caso deixa aberta: o que diferencia essa alternativa de uma exceção comum, e quem precisa assinar para ela valer?

## 5. Conteúdo

### 5.1 Conceito

Controle de segurança, no glossário do NIST: "A safeguard or countermeasure prescribed for an information system or an organization designed to protect the confidentiality, integrity, and availability of its information and to meet a set of defined security requirements". A parte final da definição é a que se esquece com facilidade. Um controle precisa atender a um requisito definido: sem requisito, a compra vira despesa sem critério de aceite.

A mesma página do glossário registra uma segunda variante do verbete, com sentido equivalente e uso corrente no contexto de sistema de informação e de organização. Uma leitura longa e uma curta apontam para o mesmo lugar: o controle existe para produzir efeito declarado sobre um dos três objetivos, e não para constar em inventário.

A função do controle é a classificação mais útil na gestão. Preventivo reduz a probabilidade do evento: autenticação multifator, segmentação de rede, remoção de publicação, política de descarte. Detectivo reduz o tempo até a descoberta: registro de eventos, alerta de comportamento anômalo, verificação de integridade de backup. Corretivo reduz o impacto depois do evento: restauração, isolamento de conta, plano de resposta, redundância.

O controle compensatório é o quarto tipo e o mais mal usado. Ele substitui o controle exigido quando o requisito não pode ser atendido, com efeito equivalente aceito por quem exigiu. O verbete de controle compensatório não trouxe definição no glossário consultado nesta execução: NAO CONFIRMADO em fonte oficial. Trate a formulação acima como conceito de trabalho e confirme na publicação normativa antes de usá-la em política ou em relatório de auditoria.

O catálogo de controles do NIST SP 800-53 Rev. 5 aparece citado pelo glossário como origem do verbete de superfície de ataque. A quantidade de famílias de controle dessa publicação não foi conferida nesta execução: NAO CONFIRMADO em fonte oficial. Evite citar número de famílias ou de controles antes de confirmar no catálogo.

### 5.2 Como funciona

Todo controle entra com quatro campos preenchidos: requisito, risco que atende, função e evidência. Faltando evidência, o controle não é auditável; faltando requisito, não é defensável.

| Função | Efeito sobre o risco | Exemplos comuns | Onde costuma falhar |
|---|---|---|---|
| Preventiva | reduz probabilidade | multifator, segmentação, retirada de exposição, política de descarte | configuração aplicada e revertida depois sem registro |
| Detectiva | reduz tempo de descoberta | trilha de auditoria, alerta de anomalia, checagem de integridade | alerta sem fila de tratamento definida |
| Corretiva | reduz impacto | restauração de backup, isolamento, plano de resposta | plano nunca testado em produção |
| Compensatória | substitui controle exigido | restrição de origem, gravação de sessão, aprovação nominal | aceite informal, sem assinatura de quem exigiu |
| Diretiva | orienta comportamento | política, norma interna, treinamento obrigatório | documento publicado e não aplicado |

A distribuição de verba entre as funções é a decisão de gestão. Programas que investem apenas em prevenção ficam cegos: o controle preventivo falha em algum ponto, e sem detecção o tempo até a descoberta passa a ser ditado pelo atacante. Programas que investem apenas em detecção acumulam alertas sem capacidade de resposta.

Há um segundo mecanismo, menos discutido: controle decai. Regra de firewall criada para um projeto permanece depois que o projeto termina. Conta de serviço continua ativa depois do script desativado. A evidência de operação é o único instrumento que mostra a decadência, e por isso o campo de evidência precisa de verificação periódica e dono.

O controle compensatório segue uma regra própria. Ele não é exceção: a exceção aceita o descumprimento; o compensatório troca um mecanismo por outro com efeito equivalente, e por isso exige aceite de quem formulou o requisito — auditor, cliente ou regulador. O aceite precisa ser escrito, com prazo de validade e condição de revisão.

### 5.3 Exemplo resolvido

Risco: sequestro de dados com interrupção da operação de faturamento, risco residual 8 contra apetite suposto de 6. Objetivo: montar o conjunto de controles por função.

Passo 1, requisito. Reduzir o risco residual a 6 ou menos, com evidência verificável por trimestre.

Passo 2, controles preventivos. Multifator em todos os acessos administrativos, remoção de publicações desnecessárias, atualização de sistema com prazo definido. Efeito: reduz probabilidade.

Passo 3, controles detectivos. Coleta de eventos de autenticação e de execução nos servidores, alerta para criação de conta administrativa fora do fluxo, verificação semanal da integridade do conjunto de backup. Efeito: reduz tempo de descoberta.

Passo 4, controles corretivos. Restauração testada em ambiente isolado, com registro de tempo de recuperação; procedimento de isolamento de segmento de rede; lista de contatos e decisões pré-aprovadas para o caso de indisponibilidade. Efeito: reduz impacto.

Passo 5, leitura do conjunto. Risco residual estimado 5: dois pontos abaixo do alvo. A verba fica dividida em três blocos, e o bloco de detecção tem dono nomeado e fila de tratamento. Nenhum controle isolado garantiria o resultado: a remoção de publicação reduz a entrada, e a verificação de integridade do backup reduz o dano caso a entrada ocorra.

### 5.4 Problema de completar

Risco: pagamento a fornecedor com conta bancária alterada por fraude de correspondência, risco residual 6, apetite suposto 4.

| Função | Controle proposto | Evidência esperada | Dono |
|---|---|---|---|
| Preventiva | __________ | __________ | __________ |
| Detectiva | __________ | __________ | __________ |
| Corretiva | __________ | __________ | __________ |

1. Qual controle você classificaria como compensatório se o sistema de pagamento não aceitasse dupla aprovação? __________
2. Com risco residual ainda acima do apetite, o que precisa existir para o risco ser aceito? __________

## 6. Por que isso importa para o CISO

A proporção de verba entre prevenção, detecção e correção é o item mais fácil de auditar em um plano de segurança. Um programa com 90% em prevenção não tem como descobrir um incidente em tempo útil, e a primeira pergunta do conselho depois de um evento será quanto tempo a empresa levou para saber.

Controle compensatório tem efeito jurídico e contratual. Quando o cliente corporativo exige um controle que o sistema legado não suporta, o CISO precisa apresentar alternativa com aceite formal de quem exigiu. Sem assinatura, a empresa fica com a obrigação contratual e sem o controle, situação pior do que renegociar prazo.

## 7. Aplicação prática

Escolha o maior risco residual aberto na sua lista. Monte a tabela da seção 5.3 com pelo menos um controle em cada uma das três primeiras funções, cada linha com evidência e dono.

Depois calcule a proporção de verba do orçamento atual entre as três funções. Se a detecção ficar abaixo de um quinto do total, escreva a justificativa em duas linhas — e leve-a para a próxima reunião como decisão, não como omissão.

## 8. Autoexplicação

Explique em três frases a diferença entre controle compensatório e exceção. Ligue a explicação a um controle que sua empresa já substituiu por alternativa: existe aceite escrito de quem formulou o requisito?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Controle compensatório é exceção autorizada | A exceção aceita o descumprimento; o compensatório substitui o mecanismo com efeito equivalente | Colete aceite escrito de quem formulou o requisito |
| Antivírus é preventivo ou detectivo | A mesma ferramenta cumpre funções diferentes conforme a configuração | Classifique pela função que gera evidência, não pelo produto |
| Controle aprovado é controle operante | A definição de risco residual exige resposta documentada e executada | Registre a data de entrada em operação |
| Mais prevenção sempre reduz mais risco | Nenhum controle preventivo é infalível, e sem detecção o tempo de descoberta fica indefinido | Distribua verba entre as três funções |
| Controle sem requisito ainda serve | A definição do NIST exige atender a requisito definido | Escreva o requisito antes de comprar |
| Evidência é papelada | Sem evidência não existe prova de operação nem sinal de decadência | Evidência é o campo que mostra a regra que ficou esquecida |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Escreva a definição de controle do NIST e diga o que ela exige além de proteger a tríade.
2. Auditoria exige MFA em sistema legado que não suporta o recurso. Descreva o controle compensatório e quem precisa concordar.
3. Se 90% da verba está em prevenção, o que isso indica sobre a capacidade de responder a incidente?
4. Dê um exemplo de controle detectivo que não sirva como preventivo, e explique a diferença.
5. O que caracteriza uma exceção em contraste com um controle compensatório?

<details>
<summary>Conferir respostas</summary>

1. "A safeguard or countermeasure prescribed for an information system or an organization designed to protect the confidentiality, integrity, and availability of its information and to meet a set of defined security requirements". Exige atender a um requisito definido.
2. Restringir origem de rede ao endereço conhecido, gravar a sessão, exigir aprovação nominal por acesso e revisar registros periodicamente. Precisa do aceite escrito de quem formulou o requisito, no caso o auditor.
3. Indica tempo de descoberta dependente do acaso. Sem detecção, o evento é descoberto por terceiro, por cliente ou por impacto visível, e a resposta começa atrasada.
4. Monitoramento de integridade de arquivo detecta alteração depois que ela ocorreu, e não impede a alteração. A diferença é o ponto de intervenção: antes ou depois do evento.
5. A exceção aceita o descumprimento do requisito, com o risco correndo por conta da empresa. O compensatório troca o mecanismo por outro com efeito equivalente e mantém o requisito atendido.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Classificar 10 controles do seu ambiente por função, sem consultar | Rebaixar: repetir em D+1 |
| D+7 | Refazer a tabela da seção 7 com outro risco | Rebaixar: repetir em D+3 |
| D+30 | Verificar a evidência de dois controles e checar se continuam operantes | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-05 | a taxonomia de controles é o que permite escolher um framework e justificar o gasto |
| complementa | 01-fundamentos#TEMA-06 | o controle escolhido define o risco residual, e sem risco não existe critério para escolher controle |
| complementa | 01-fundamentos#TEMA-08 | empilhar controles e limitar privilégio são as duas formas de fazer o controle sobreviver à falha do vizinho |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| Security+ | Fundamentos de segurança e controles | CompTIA Security+ SY0-701 Exam Objectives | primaria | https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf |
| CISM | Governança e gestão de risco da informação | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CISSP | Cobertura geral do tema | ISC2 CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSRC Glossary — security control | primaria | https://csrc.nist.gov/glossary/term/security_control | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — defense in depth | primaria | https://csrc.nist.gov/glossary/term/defense_in_depth | "2026-09-25" | alta |
| 3 | NIST CSRC Glossary — attack surface | primaria | https://csrc.nist.gov/glossary/term/attack_surface | "2026-09-25" | alta |
| 4 | CompTIA Security+ SY0-701 Exam Objectives | primaria | https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [01 Fundamentos de segurança da informação](./README.md) |
| Tema anterior | [TEMA-06](TEMA-06-risco-probabilidade-impacto.md) |
| Próximo tema | [TEMA-08](TEMA-08-defesa-em-profundidade-menor-privilegio.md) |
| Home | [README](../README.md) |
