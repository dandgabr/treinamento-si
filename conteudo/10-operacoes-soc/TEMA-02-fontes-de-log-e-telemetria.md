---
tema: "Fontes de log e telemetria"
tema_id: "TEMA-02"
area_id: "10-operacoes-soc"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Julgar a cobertura de telemetria de um incidente declarado, nomeando a fonte ausente e a classe de técnica que fica sem evidência"
atende_objetivo: [2]
certificacoes: ["CySA+", "GCIH"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "06-endpoint-plataforma#TEMA-01"
      motivo: "o endpoint é a principal fonte de telemetria do SOC, e sem os eventos do host o caso de uso de detecção nasce cego"
  aprofundado_por: []
  aplicado_em:
    - alvo: "11-resposta-forense#TEMA-04"
      motivo: "o log coletado e retido é a evidência que a análise forense usa depois do isolamento, e retenção curta destrói a prova antes da perícia"
  nao_confundir_com: []
fontes:
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-92 — Guide to Computer Security Log Management, setembro de 2006"
    url: "https://csrc.nist.gov/pubs/sp/800/92/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-137 — Information Security Continuous Monitoring (ISCM) for Federal Information Systems and Organizations, setembro de 2011"
    url: "https://csrc.nist.gov/pubs/sp/800/137/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Fontes de log e telemetria

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir pegar um incidente declarado, listar as fontes de telemetria necessárias para investigá-lo, apontar qual delas não existe ou não é retida no seu ambiente, e nomear a classe de técnica que fica sem evidência por causa dessa ausência.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-o-que-e-um-soc-e-seus-modelos.md): sem modelo definido, não se sabe quem consulta o log nem em que prazo.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quais fontes de log do seu ambiente são centralizadas e quais ficam apenas no próprio equipamento?
   Confiança: ___
2. Qual é o prazo de retenção do log de autenticação e quem aprovou esse prazo?
   Confiança: ___
3. Se o endpoint for comprometido hoje, você consegue provar qual processo foi o pai do processo malicioso?
   Confiança: ___
4. Quais registros existem do ambiente de nuvem contratado e quem é o dono deles: você ou o fornecedor?
   Confiança: ___

## 4. Caso real

O checklist de preparação do playbook do CISA, de novembro de 2021, exige manter um quadro atualizado da infraestrutura — sistemas, redes, plataformas de nuvem e redes hospedadas por terceiros — implementando telemetria em amplitude: antimalware, solução de detecção e resposta em endpoint, prevenção de perda de dado, sistema de detecção e prevenção de intrusão, logs de autorização, de host, de aplicação e de nuvem, fluxo de rede, captura de pacote e SIEM. O mesmo item manda coletar e reter o log de forma centralizada e manter o prazo de retenção definido por diretriz.

A segunda metade do documento explica por que essa lista não é enfeite. Na tabela de técnicas e fontes de log, o playbook liga cada tática a um conjunto de fontes: acesso inicial sai de e-mail, proxy de web, log de aplicação de servidor e IDS ou IPS; execução sai de log de evento de host, Sysmon, antimalware, EDR e log de PowerShell; credencial sai de log de autenticação, log de controlador de domínio e monitoramento de tráfego de rede; comando e controle sai de firewall, proxy, DNS, tráfego de rede, log de atividade em nuvem e IDS ou IPS.

A pergunta que o caso deixa aberta: quando uma dessas fontes não existe, o que exatamente a organização perde — e como isso aparece em um relatório de incidente?

## 5. Conteúdo

### 5.1 Conceito

Log é o registro do que um sistema decidiu. Telemetria é o conjunto de registros disponíveis para observação, incluindo o que não é log textual: fluxo de rede, captura de pacote, telemetria de processo do agente de endpoint. Detecção e investigação só acontecem sobre telemetria que existe, chega ao lugar certo e permanece pelo tempo necessário.

Um inventário de fontes tem quatro colunas por item: origem, conteúdo útil, onde é armazenado, por quanto tempo. A quarta coluna costuma ser a mais cara e a menos documentada. O playbook do CISA determina que o prazo de retenção seja definido por diretriz e que os logs sejam coletados de forma centralizada, porque investigação de incidente quase nunca acontece no mesmo dia do comprometimento.

A ausência de uma fonte tem efeito diferente da ausência de uma regra. Uma regra que não existe pode ser escrita em uma tarde. Uma fonte que não existe — ou que só retém sete dias — limita para sempre a classe de técnica que pode ser provada naquele ambiente.

A diretriz de log management do NIST, o SP 800-92, foi publicada em setembro de 2006 e trata da infraestrutura de gestão de log e dos processos ao redor dela, com as famílias de controle de auditoria e responsabilização, resposta a incidente e integridade de sistema entre as relacionadas. Ela antecede nuvem elástica e agentes modernos, e continua útil no que não muda com a tecnologia: a decisão sobre o que registrar, onde centralizar e por quanto guardar.

### 5.2 Como funciona

O caminho de um evento tem seis etapas. Geração na origem; transporte até o ponto de coleta; centralização; normalização para um vocabulário comum de campo; retenção com prazo definido; consulta durante a investigação. Falha em qualquer etapa produz um log que existe na origem e não serve para nada.

O monitoramento contínuo, descrito no NIST SP 800-137 de setembro de 2011, tem por objetivo dar visibilidade sobre ativos, ameaças e vulnerabilidades e sobre a efetividade dos controles implantados, de modo alinhado à tolerância ao risco da organização e capaz de sustentar resposta em tempo hábil quando a observação mostrar controle inadequado. Essa definição é útil como teste de prioridade para telemetria: fonte nova que não muda nenhuma dessas quatro visibilidades é custo sem função.

A administração dos sensores segue regra de segurança própria. O playbook do CISA manda gerenciar sensores e dispositivos de segurança por caminho fora de banda e notificar usuário de máquina comprometida por telefone em vez de e-mail, para não avisar o adversário que está sendo observado enquanto ele ainda tem acesso.

### 5.3 Exemplo resolvido

Incidente: colaborador abre anexo, executa um arquivo, e dez minutos depois a estação inicia conexão periódica para um domínio recém-registrado. A hipótese de trabalho é execução seguida de comando e controle.

| Pergunta da investigação | Fonte necessária | Existe no ambiente? | Se faltar, o que fica sem prova |
|---|---|---|---|
| Qual arquivo foi aberto e por qual processo | telemetria de processo do agente de endpoint, ou log de evento de host com identificador de processo pai | sim | a origem da execução e o vetor |
| Qual foi a linha de comando executada | log de PowerShell ou telemetria de linha de comando do agente | parcial | o comando exato, e com isso a técnica executada |
| Para onde a estação tentou se conectar | log de fluxo de rede e log do resolver de DNS | sim para fluxo, não para consulta interna de DNS | o domínio consultado antes de qualquer bloqueio |
| O domínio respondeu e quanto dado saiu | captura de pacote no ponto de saída | sim, com retenção curta | o volume transferido e a confirmação de canal |
| A mesma técnica ocorreu em outras estações | SIEM com log de host centralizado e consulta por campo comum | parcial, sem linha de comando na base | a extensão do incidente |

Passo a passo da decisão de cobertura.

1. Escrever a hipótese em uma frase, como feita acima, antes de consultar as fontes.
2. Derivar da hipótese as perguntas cuja resposta é necessária para confirmar ou descartar. Cada pergunta vira uma linha da tabela.
3. Ligar cada pergunta à fonte que responde, usando o mapeamento entre tática e fonte de log que o playbook do CISA publica. A ligação é técnica: não existe pergunta de comando e controle respondida por log de aplicação de folha de pagamento.
4. Marcar o que falta e traduzir a falta em classe de técnica sem cobertura. Aqui: consulta interna de DNS ausente significa que a correlação entre resolução de nome e tentativa de conexão fica frágil.
5. Priorizar pelo custo de não ter. Falta de telemetria de processo afeta toda a família de execução e persistência; falta de captura de pacote afeta confirmação e medida, não a identificação.
6. Só depois escolher o que fazer: ligar o registro que já está disponível e desligado, ampliar o prazo de retenção, ou contratar capacidade. As duas primeiras costumam ser mais baratas e mais rápidas que a terceira.

### 5.4 Problema de completar

Incidente em conta de serviço de nuvem: uma credencial usada por um sistema passou a ser empregada de um endereço fora do intervalo conhecido e criou uma regra de encaminhamento de mensagem. Complete a análise.

1. Pergunta que se faz primeiro, para saber se é incidente ou mudança legítima: ___
2. Fonte necessária para responder, no plano de controle do provedor: ___
3. Fonte necessária para saber o que a credencial acessou depois: ___
4. Prazo de retenção que precisa existir nessas duas fontes e por quê: ___
5. Classe de técnica que fica sem evidência se o log de atividade de nuvem não estiver habilitado: ___

## 6. Por que isso importa para o CISO

Retenção de log é uma decisão de compra com efeito jurídico. A mesma capacidade ingerida que sustenta a investigação de hoje é o que permite responder, seis meses depois, a uma pergunta de auditoria, de cliente corporativo ou de autoridade. Encurtar o prazo para reduzir a fatura do SIEM é barato no orçamento e caro na hora em que o incidente é descoberto tarde, porque o dado que provaria a extensão do comprometimento já foi descartado. O outro lado é o custo de coletar o que ninguém vai consultar: a lista de fontes sem pergunta de investigação associada é o principal vetor de crescimento de custo da operação.

## 7. Aplicação prática

Monte a tabela de cinco linhas da seção 5.3 para um incidente plausível do seu ambiente, usando os nomes reais das suas fontes. Preencha a coluna de prazo de retenção com o valor que o fornecedor informa, não com o que você imagina. Marque as linhas em que a resposta é "não sei" e transforme essas linhas na sua pauta de verificação com o time de infraestrutura.

## 8. Autoexplicação

Explique em três frases por que uma fonte de telemetria ausente não pode ser compensada por uma regra melhor. Ligue isso a algo que você faz hoje: por exemplo, o prazo de retenção de registro de acesso que o seu escritório de privacidade promete em contrato com cliente é compatível com o prazo que o SIEM retém.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Confundir "registrar" com "ter log" | o sistema pode gravar e descartar em dias, ou nunca enviar para fora do próprio equipamento | o inventário precisa da coluna de retenção e da coluna de destino |
| Acreditar que o fornecedor de nuvem entrega o log que você precisa por padrão | o modelo de responsabilidade compartilhada deixa parte da visibilidade com o cliente | conferir quais categorias de log existem no plano de controle e habilitar explicitamente |
| Coletar tudo para "não perder nada" | volume sem pergunta associada encarece a plataforma e piora o tempo de consulta | cada fonte entra com a pergunta de investigação que ela responde |
| Guardar o log apenas na origem | no host comprometido o adversário pode alterar ou apagar o registro | centralizar a coleta e gerenciar o sensor por caminho fora de banda |

## 10. Recuperação ativa

1. Cite quatro fontes de telemetria que o playbook do CISA lista na instrumentação esperada de preparação.
2. Um incidente de movimento lateral não deixa vestígio no log de host porque só o tráfego de rede registra. A organização tem fluxo de rede sem captura de pacote e sem log de autenticação centralizado. Nomeie a fonte ausente mais crítica e a técnica que fica sem evidência.
3. Por que o mesmo playbook manda gerenciar sensores por caminho fora de banda?
4. O que precisa estar escrito no inventário de fontes, além do nome da fonte?

<details>
<summary>Conferir respostas</summary>

1. Entre as listadas: antimalware, detecção e resposta em endpoint, prevenção de perda de dado, detecção e prevenção de intrusão, logs de autorização, de host, de aplicação e de nuvem, fluxo de rede, captura de pacote e SIEM.
2. A fonte crítica é o log de autenticação centralizado; sem ele não há prova de qual conta autenticou onde, e o movimento lateral por uso de conta válida fica sem evidência, junto com a elevação de privilégio e o acesso a credencial.
3. Para que o adversário que já opera na rede corporativa não alcance o gerenciamento do sensor, não leia o tráfego de administração e não possa desativá-lo antes de ser contido.
4. Conteúdo útil, destino de armazenamento, prazo de retenção, dono da fonte e a pergunta de investigação que ela responde.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar em 3 frases a diferença entre log ausente e regra ausente | Rebaixar: repetir em D+3 |
| D+30 | Refazer a tabela da seção 5.3 para um incidente novo escolhido pelo time | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 11-resposta-forense#TEMA-04 | o log coletado e retido é a evidência que a análise forense usa depois do isolamento, e retenção curta destrói a prova antes da perícia |
| complementa | 06-endpoint-plataforma#TEMA-01 | o endpoint é a principal fonte de telemetria do SOC, e sem os eventos do host o caso de uso de detecção nasce cego |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CySA+ | Análise de segurança, telemetria e gestão de log | NIST SP 800-92 — Guide to Computer Security Log Management, setembro de 2006 | primaria | https://csrc.nist.gov/pubs/sp/800/92/final |
| GCIH | Tratamento de incidente a partir de telemetria e log | CISA — Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf |

Leitura recomendada: [NIST SP 800-137, setembro de 2011](https://csrc.nist.gov/pubs/sp/800/137/final).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 2 | NIST SP 800-92, setembro de 2006, DOI 10.6028/NIST.SP.800-92 | primaria | https://csrc.nist.gov/pubs/sp/800/92/final | "2026-09-25" | alta |
| 3 | NIST SP 800-137, setembro de 2011, DOI 10.6028/NIST.SP.800-137 | primaria | https://csrc.nist.gov/pubs/sp/800/137/final | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-o-que-e-um-soc-e-seus-modelos.md) |
| Próximo tema | [TEMA-03](TEMA-03-deteccao-regras-casos-de-uso-e-mitre-attack.md) |
| Home | [README](../README.md) |
