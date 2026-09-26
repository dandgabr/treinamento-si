---
tema: "Triagem, severidade e escalonamento"
tema_id: "TEMA-04"
area_id: "10-operacoes-soc"
nivel: base
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Classificar a severidade de um incidente com o critério declarado antes do evento e decidir o escalonamento com dono e prazo"
atende_objetivo: [4]
certificacoes: ["CySA+", "GCIH"]
pre_requisitos: ["TEMA-03"]
relacoes:
  complementa:
    - alvo: "06-endpoint-plataforma#TEMA-04"
      motivo: "a resposta no host e a triagem do SOC são o mesmo incidente visto de dois lugares"
  aprofundado_por: []
  aplicado_em:
    - alvo: "11-resposta-forense#TEMA-03"
      motivo: "a decisão de triagem vira ação na contenção e na erradicação, e é lá que a qualidade da decisão é medida"
  nao_confundir_com: []
fontes:
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "SigmaHQ — Sigma Rules Specification, versão 2.1.0, de 02 de agosto de 2025, campo level"
    url: "https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "FIRST — Common Vulnerability Scoring System Version 4.0"
    url: "https://www.first.org/cvss/v4.0/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Triagem, severidade e escalonamento

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir, dado um alerta, produzir um registro de triagem com categoria, extensão, impacto, severidade e destinatário do escalonamento, usando um critério que já estava escrito antes de o alerta chegar — e não uma impressão formada às três da manhã.

## 2. Pré-requisitos

[TEMA-03](./TEMA-03-deteccao-regras-casos-de-uso-e-mitre-attack.md): sem regra com nível e falso positivo declarado, a triagem começa sem saber o que o alerta promete. O que a triagem decide é executado em [11 Resposta a incidentes](../11-resposta-forense/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quem decide hoje que um alerta virou incidente na sua operação? Se o nome não vem à cabeça, diga o cargo.
   Confiança: ___
2. Quantos alertas o turno da madrugada recebeu no último domingo? Chute o número e anote qual evidência você tem para ele.
   Confiança: ___
3. Se um incidente que afeta cliente chegasse às 2h de um sábado, o plantão escalaria na hora certa? Justifique a confiança em uma linha.
   Confiança: ___

## 4. Caso real

O playbook do CISA determina que a agência notifique o órgão central em até uma hora depois da determinação do incidente, e que o CISA devolva, em até uma hora do recebimento do relato inicial, o número de acompanhamento e a nota de risco pelo sistema de pontuação de incidente cibernético. O documento define três faixas altas dessa nota: nível 3, com impacto provável à saúde e segurança pública, segurança nacional, economia, relações exteriores, liberdades civis ou confiança pública; nível 4, com impacto significativo nos mesmos bens; e nível 5, com ameaça iminente à prestação de serviço de infraestrutura crítica em larga escala, à estabilidade do governo ou à vida de pessoas.

O mesmo playbook trata explicitamente do falso positivo como problema operacional: é preciso ter procedimento para descartar conflito com atividade autorizada, confirmando que o suspeito não é o administrador de rede usando ferramenta de administração remota para aplicar atualização.

A pergunta que o caso deixa aberta: como o primeiro nível decide, em minutos, entre anomalia, atividade autorizada e incidente declarado, sem depender do julgamento pessoal de quem está de plantão?

## 5. Conteúdo

### 5.1 Conceito

Triagem é a decisão que converte alerta em caso ou em ruído documentado. Ela tem quatro produtos obrigatórios: a categoria do evento, a extensão conhecida, o impacto conhecido e a severidade com o destinatário do escalonamento. Registro sem esses quatro campos não é triagem, é leitura de alerta.

Severidade de incidente não é nota de vulnerabilidade. O CVSS, na versão 4.0 publicada pelo FIRST, pontua vulnerabilidade e organiza as métricas em grupos base, de ameaça e ambiental, com nomenclaturas próprias para as combinações. O CVSS não mede o que já aconteceu no seu ambiente. Para incidente, o material verificado usa outra escala: o CISA pontua pelo sistema de pontuação de incidente cibernético, com faixas definidas por tipo de impacto, e define incidente maior como aquele com probabilidade de dano demonstrável a interesses de segurança nacional, relações exteriores, economia, confiança pública, liberdades civis ou saúde e segurança pública, incluindo o caso de violação que envolva dado pessoal e alcance o limite previsto na diretriz aplicável.

O escalonamento tem duas etapas distintas, que costumam ser confundidas. A primeira é interna: quem recebe o caso, com qual autoridade e em qual prazo. A segunda é externa: quem é notificado fora da organização, quando, e com qual conteúdo. No material verificado, a etapa externa aparece com nome e relógio: o relato à autoridade central, e a decisão de escalar para grupo de coordenação unificada tomada pela autoridade, não pela organização afetada.

O critério de severidade precisa existir antes do alerta. O playbook do CISA exige terminantemente uma condição de encerramento para a análise técnica: ela termina quando o incidente foi verificado, o escopo foi determinado, os caminhos de acesso persistente foram identificados, o impacto foi avaliado, há hipótese de narrativa de exploração e todos os envolvidos operam com o mesmo quadro. Sem critério escrito, cada analista inventa a sua versão dessa lista, e a decisão passa a depender de quem está de plantão.

### 5.2 Como funciona

A sequência operacional tem sete passos. Categorizar o evento inicialmente; designar o coordenador de incidente; determinar escopo do que se investiga; coletar e preservar dado, com registro do que foi adquirido, quando e por quem; executar análise técnica com hipótese; validar e refinar o escopo à medida que a informação evolui; decidir a ação e comunicar.

O nível da regra alimenta a triagem, mas não a define. Na especificação Sigma, o nível alto deve disparar alerta interno com revisão imediata, e o crítico indica incidente com revisão imediata, usado quando a probabilidade beira a certeza. São graus de criticidade do evento da regra, não a severidade do incidente da organização: uma regra de nível alto disparada em máquina de laboratório e a mesma regra disparada em controlador de domínio produzem incidentes de severidades diferentes.

A verificação de conflito com atividade autorizada é etapa formal. Ela exige uma fonte de verdade sobre janela de manutenção, ferramenta de administração em uso e contas de serviço, consultável durante a madrugada. Sem essa fonte, a triagem noturna oscila entre paralisia e alarme falso.

A preservação da evidência precede a ação destrutiva. O playbook coloca a captura de imagem forense e a coleta de memória antes da erradicação e determina que a evidência seja registrada com o que foi adquirido, quando e por quem. Automatizar a contenção sem essa ordem destrói a prova do que aconteceu.

### 5.3 Exemplo resolvido

Alerta às 02h14: estação de trabalho do financeiro estabeleceu conexão periódica, em intervalo regular, com domínio registrado há menos de trinta dias.

Passo a passo.

1. Categorizar: conexão de comando e controle suspeita, com execução provável a montante. Registrar o horário de abertura do caso.
2. Designar o coordenador: o analista de plantão assume o caso; nenhuma ação destrutiva sem o coordenador do horário comercial.
3. Determinar escopo inicial: consultar se o mesmo domínio aparece em outras estações e se o processo de origem é conhecido.
4. Coletar e preservar: memória da estação e registro dos passos dados, com o que, quando e por quem. Sem isso, a análise posterior perde valor.
5. Verificar conflito: conferir janela de manutenção e conta de serviço. Nada aplicável, e o domínio não consta em nenhuma lista interna. O falso positivo é improvável.
6. Aplicar o critério de severidade declarado: ativo com acesso a dado financeiro, domínio sem reputação, possível execução de código, nenhum sinal de movimento lateral confirmado. Registro: severidade alta, com decisão de escalar para o coordenador de incidente e para o dono do sistema financeiro, e conter apenas o isolamento de rede da estação, que é ação reversível.
7. Registrar o externo: verificar se o caso cruza o limite de notificação aplicável. Enquanto não estiver confirmado dado pessoal ou ativo crítico, mantém-se em avaliação com prazo, e a decisão de notificar é do titular da obrigação, não do plantão.

| Campo do registro | Valor às 02h14 | O que mudaria a classificação |
|---|---|---|
| Categoria | possível canal de comando e controle | confirmação de dado transferido eleva a impacto |
| Extensão | uma estação, em verificação | segunda estação com o mesmo domínio amplia o escopo |
| Impacto | ativo com dado financeiro | sinal de movimento lateral muda a severidade para crítica |
| Severidade | alta | exposição de dado pessoal aciona o relógio regulatório |
| Escalamento interno | coordenador de incidente e dono do sistema | nenhum |
| Ação imediata | isolamento de rede da estação, reversível | ação irreversível exige decisão do coordenador |

### 5.4 Problema de completar

Alerta às 04h40: conta de administrador autenticou de endereço em outro continente e três minutos depois acessou o console de gestão de identidade.

1. Categoria: ___
2. Extensão mínima a verificar: ___
3. Impacto, se a conta for de administrador de identidade: ___
4. Severidade com o critério declarado e justificativa: ___
5. Escalamento interno e em que prazo: ___
6. Ação imediata permitida ao plantão e ação que exige o titular da decisão: ___
7. O que a organização precisa ter escrito antes sobre notificação externa para esse caso: ___

## 6. Por que isso importa para o CISO

A triagem é onde o orçamento de detecção vira decisão de negócio. Um SOC que escala tudo gasta a atenção dos donos de sistema e produz indisponibilidade desnecessária; um SOC que não escala nada deixa o incidente crescer até que a decisão seja tomada por terceiro, sob pressão. O critério de severidade é também defesa pessoal do CISO em apuração posterior: com a matriz escrita e datada, a discussão deixa de ser sobre julgamento e passa a ser sobre aderência ao procedimento que a própria organização aprovou.

## 7. Aplicação prática

Escreva a matriz de severidade em uma página, com três níveis e os critérios de cada um, e circule por três donos de sistema para ver se eles assinam. Depois pegue os cinco últimos incidentes e reclassifique cada um com a matriz, comparando com a severidade atribuída na época. Divergência de dois níveis em qualquer caso indica que a matriz é abstrata demais para uso no plantão.

## 8. Autoexplicação

Explique em três frases a diferença entre severidade de incidente e gravidade de vulnerabilidade. Ligue isso a algo que você já faz hoje: a sua lista de sistemas críticos é o insumo principal da classificação de impacto e, se ela não existe por escrito, a severidade está sendo estimada por memória.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Usar notícia de vulnerabilidade para definir severidade de incidente | a nota descreve o potencial da falha, não o que ocorreu no seu ambiente | usar critério de incidente, como categoria, extensão, privilégio obtido e impacto |
| Deixar o critério de severidade na cabeça do analista sênior | o critério não sobrevive à folga, à troca de turno nem à auditoria | matriz escrita, datada e assinada por dono de sistema |
| Contar a hora da notificação a partir da descoberta do time de segurança | a fonte verificada conta a partir da determinação do incidente, que pode ser posterior | registrar explicitamente o momento da determinação e quem a fez |
| Automatizar contenção antes de preservar evidência | destrói a prova do que aconteceu e prejudica notificação e apuração | preservar memória e imagem antes da ação destrutiva, com registro de quem coletou |

## 10. Recuperação ativa

1. Quais são os quatro produtos obrigatórios de uma triagem?
2. Uma regra de nível crítico disparou em estação de teste sem dado. Qual é a severidade do incidente e por quê?
3. O playbook do CISA exige procedimento para descartar conflito com atividade autorizada. Dê um exemplo concreto do que essa verificação evita.
4. Quem decide escalar o incidente para instância superior de coordenação, segundo o material verificado?

<details>
<summary>Conferir respostas</summary>

1. Categoria, extensão, impacto e severidade com destinatário do escalonamento.
2. Baixa, provavelmente. O nível da regra descreve a criticidade do evento que casou, e não o incidente: a mesma regra em ativo sem dado e sem privilégio produz impacto diferente. O padrão observado deve ser investigado e o caso registrado, sem contaminar a contagem de incidentes graves.
3. Evita tratar como ataque a atualização remota aplicada pelo administrador de rede à noite, que é o exemplo dado pelo próprio documento. Sem a verificação, o plantão isola produção ou descarta o alerta errado.
4. A autoridade central, junto com a polícia federal no caso dos Estados Unidos, conforme o playbook, e não a organização afetada.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Reclassificar um incidente antigo com a matriz escrita | Rebaixar: repetir em D+3 |
| D+30 | Cronometrar uma triagem simulada do alerta até a decisão | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 11-resposta-forense#TEMA-03 | a decisão de triagem vira ação na contenção e na erradicação, e é lá que a qualidade da decisão é medida |
| complementa | 06-endpoint-plataforma#TEMA-04 | a resposta no host e a triagem do SOC são o mesmo incidente visto de dois lugares |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CySA+ | Análise de segurança, triagem e classificação de severidade | CISA — Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf |
| GCIH | Tratamento de incidente, escalonamento e coordenação | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final |

Leitura recomendada: [SigmaHQ — Sigma Rules Specification, v2.1.0, campo level](https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md); [FIRST — CVSS v4.0](https://www.first.org/cvss/v4.0/).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 2 | SigmaHQ — Sigma Rules Specification, v2.1.0, campo level | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md | "2026-09-25" | alta |
| 3 | FIRST — CVSS v4.0 | primaria | https://www.first.org/cvss/v4.0/ | "2026-09-25" | alta |
| 4 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-deteccao-regras-casos-de-uso-e-mitre-attack.md) |
| Próximo tema | [TEMA-05](TEMA-05-metricas-de-soc-e-falsos-positivos.md) |
| Home | [README](../README.md) |
