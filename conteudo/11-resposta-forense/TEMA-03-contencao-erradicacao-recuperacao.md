---
tema: "Contenção, erradicação e recuperação"
tema_id: "TEMA-03"
area_id: "11-resposta-forense"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Escolher a ação de contenção em um incidente em curso comparando o custo operacional de cada opção, definir o escopo da erradicação e escrever os critérios de saída que autorizam a volta à operação normal"
atende_objetivo: [4]
certificacoes: ["CHFI", "GCFA"]
pre_requisitos: ["TEMA-01", "TEMA-02"]
relacoes:
  complementa:
    - alvo: "10-operacoes-soc#TEMA-06"
      motivo: "a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-02"
      motivo: "isolar um sistema em produção só é permitido se a alçada estiver publicada como procedimento aprovado, com dono e exceção"
  nao_confundir_com:
    - alvo: "11-resposta-forense#TEMA-05"
      motivo: "derrubar o serviço para interromper o ataque e manter o serviço funcionando durante o ataque são objetivos que se opõem, e a decisão entre os dois precisa ser explícita"
fontes:
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-184 — Guide for Cybersecurity Event Recovery, dezembro de 2016"
    url: "https://csrc.nist.gov/pubs/sp/800/184/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27035-1:2023 — Information security incident management — Part 1: Principles and process, edição 2, publicada em 13/02/2023"
    url: "https://www.iso.org/standard/78973.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Resolução CD/ANPD nº 15, de 24 de abril de 2024 — Regulamento de Comunicação de Incidente de Segurança, arts. 15 e 19"
    url: "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Contenção, erradicação e recuperação

A autoridade regulatória pode determinar medidas imediatas durante um incidente: o art. 15 do Regulamento de Comunicação de Incidente de Segurança permite à ANPD determinar ao controlador, com ou sem prévia manifestação, a adoção imediata de medidas preventivas necessárias para prevenir, mitigar ou reverter os efeitos do incidente e evitar dano grave e irreparável, com possibilidade de multa diária para assegurar o cumprimento ([in.gov.br](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024), acessado em 2026-09-25). Contenção, portanto, é decisão que pode ser tomada de fora para dentro, com prazo fixado por terceiro.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: escolher a ação de contenção em um incidente em curso comparando o custo operacional de cada opção, definir o escopo da erradicação e escrever os critérios de saída que autorizam a volta à operação normal.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md), pelas marcas de tempo que medem a contenção, e [TEMA-02](TEMA-02-preparacao-playbooks-papeis-exercicios.md), porque a contenção é executada pela alçada que o playbook define.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. No último incidente da sua empresa, quanto tempo passou entre a decisão de conter e a contenção executada? Anote o número que você lembra.
   Confiança: ___
2. Qual ação de contenção é politicamente mais difícil de aprovar hoje: isolar a máquina de um diretor, bloquear um domínio de negócio ou revogar o acesso de um fornecedor?
   Confiança: ___
3. Chute quantas horas a operação ficou interrompida no último incidente. Depois chute quanto disso foi decisão e quanto foi técnica.
   Confiança: ___

## 4. Caso real

Durante um incidente em uma empresa de logística, o time identifica que o adversário usa uma conta de serviço de integração para mover dados do sistema de rastreamento. O gerente de plantão desabilita a conta às 2h. A integração para e 300 caminhões ficam sem atualização de rota; o dono do serviço descobre às 7h e reabilita a conta antes da contenção estar completa. O adversário volta pelo mesmo caminho, agora com credencial nova criada por ele mesmo.

A pergunta que o caso deixa aberta: qual era a decisão que faltava às 2h, e por que a resposta não é "desabilitar mais rápido".

## 5. Conteúdo

### 5.1 Conceito

Contenção é a decisão de reduzir o alcance do adversário aceitando um custo operacional declarado. A ISO/IEC 27035-1:2023 inclui responder entre as atividades-chave do processo de gestão de incidentes, junto de preparar, detectar, reportar, avaliar e aplicar lições aprendidas ([iso.org](https://www.iso.org/standard/78973.html), acessado em 2026-09-25). O SP 800-61 Rev. 3 trata as atividades de resposta e recuperação dentro das atividades de gestão de risco cibernético do CSF 2.0, com o objetivo declarado de reduzir o número e o impacto dos incidentes e melhorar a eficiência de detecção, resposta e recuperação ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/61/r3/final), acessado em 2026-09-25).

Erradicação é o passo seguinte e tem escopo maior do que o artefato encontrado. Remover o executável malicioso resolve a manifestação; o adversário costuma manter mais de um caminho de retorno, e cada caminho precisa ser identificado e fechado. Os caminhos que a maioria deixa aberto: conta de serviço criada durante o incidente, chave de acesso de nuvem com validade longa, token de aplicativo com consentimento delegado, tarefa agendada, certificado de autenticação instalado, regra de encaminhamento de e-mail e chave SSH adicionada a um arquivo de autorização.

Recuperação é a volta ao serviço com confiança verificável. O SP 800-184 apresenta orientação tática e estratégica sobre planejamento, desenvolvimento de playbook, teste e melhoria do planejamento de recuperação, além de métricas informativas ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/184/final), acessado em 2026-09-25). O ponto central: recuperar não é restaurar arquivo, é restabelecer serviço com o adversário fora e com capacidade de detectar a volta.

### 5.2 Como funciona

As opções de contenção formam uma escala de custo. Escolher a mais barata que resolve é a regra; escolher a mais rápida sempre custa caro em produção.

| Opção | Alcance | Custo operacional típico | Reversibilidade | Tempo de execução |
|---|---|---|---|---|
| Revogar sessão e token | Encerra acesso ativo | Baixo, usuário refaz login | Imediata | Minutos |
| Desabilitar conta | Impede novo acesso | Médio, quebra integração que usa a conta | Imediata, com nova credencial | Minutos |
| Isolar host na rede | Impede movimento lateral | Médio, para o serviço daquele host | Imediata | Minutos |
| Bloquear destino de comando e controle na saída | Corta o canal do adversário | Baixo, risco de bloquear serviço legítimo | Imediata | Minutos |
| Revogar chave ou certificado | Invalida caminho de autenticação | Alto, quebra tudo que usa a chave | Difícil, exige redistribuição | Horas |
| Tirar serviço do ar | Elimina o risco de propagação | Alto, para o negócio | Depende de restauração | Minutos para parar, horas ou dias para voltar |

Três regras de operação tornam essa escala utilizável. A primeira é preservar antes de desligar: encerrar processo apaga estado volátil, e a decisão de desligar precisa ser tomada sabendo o que se perde, conforme o [TEMA-04](TEMA-04-forense-digital-evidencia-cadeia-de-custodia.md). A segunda é conter a identidade junto com a máquina: enquanto a credencial vale, o adversário volta de outro host. A terceira é avisar o dono do serviço antes de conter, com hora e prazo de retorno, porque a contenção silenciosa é revertida por quem sente o impacto.

| Momento | Ação | Quem decide |
|---|---|---|
| Antes de mexer | Preservar estado volátil e log da janela | Plantão de resposta |
| 0 a 15 min | Revogar sessão, token e chave de sessão do adversário | Plantão, pré-autorizado |
| 15 a 60 min | Isolar hosts e desabilitar contas comprometidas, com aviso ao dono do serviço | Gerente de plantão |
| 1 a 4 h | Fechar caminhos de persistência identificados e rotacionar credenciais expostas | Encarregado de segurança |
| 4 h a 72 h | Reconstruir ambiente afetado e restabelecer serviço com monitoramento reforçado | Dono do serviço com o time de resposta |

A erradicação tem um inventário de saída. Antes de declarar limpo, o time percorre a lista: contas criadas na janela; credenciais e chaves legíveis pelas contas comprometidas; tokens de aplicativo com consentimento; tarefas agendadas e serviços instalados; certificados; regras de encaminhamento; chaves de acesso em nuvem; e código alterado em pipeline ou repositório. Cada item tem responsável e evidência de conclusão.

A recuperação precisa de critérios de saída escritos. Um conjunto que funciona: adversário sem caminho conhecido de retorno; todos os itens do inventário de erradicação com evidência; credenciais expostas rotacionadas; capacidade de detecção elevada por janela declarada; e restauração a partir de cópia verificada, com hash conferido. Sem esse conjunto, a volta é fé.

### 5.3 Exemplo resolvido

Comprometimento de controlador de domínio em uma empresa de 2.000 funcionários, com identidade híbrida e servidores em dois provedores de nuvem.

| Hora | Decisão | Base |
|---|---|---|
| H+0 | Agrupar o caso como incidente de severidade crítica e acionar o playbook de comprometimento de identidade | Conta administrativa com criação de conta nova fora da janela de mudança |
| H+0h20 | Revogar sessões e tokens do adversário e preservar logs de autenticação dos 30 dias anteriores | Ação pré-autorizada no playbook; perda de estado volátil evitada por não desligar o host |
| H+1h | Isolar os dois servidores usados como ponto de apoio e avisar os donos de serviço sobre o impacto | Alçada do gerente de plantão |
| H+2h | Identificar as 14 contas criadas na janela e as 6 chaves de acesso em nuvem legíveis pelo adversário | Auditoria de identidade e de nuvem |
| H+6h | Bloquear os destinos de comando e controle na saída e habilitar registro detalhado de autenticação | Ação reversível e de baixo impacto |
| H+24h | Rotacionar as chaves de acesso, os certificados de serviço e a senha do modo de restauração de diretório | Credenciais expostas mapeadas |
| H+48h | Reconstruir os dois servidores de apoio a partir de imagem verificada, em vez de limpar | Comprometimento de nível administrativo |
| H+72h | Restabelecer identidade e autenticação com monitoramento elevado e janela declarada de 30 dias | Critérios de saída cumpridos |

Custo declarado da decisão às 3h da manhã, para servir de comparação em revisão posterior: 6 horas de indisponibilidade de autenticação para 1.400 usuários, 2 dias de atraso na integração de folha e 40 horas de trabalho do time. A alternativa considerada e recusada foi restringir a autenticação a um subconjunto de usuários e manter o domínio em execução, o que preservaria o serviço e deixaria o adversário com caminho ativo por tempo indeterminado.

Anote o cruzamento regulatório. O art. 19 do Regulamento autoriza a ANPD a determinar providências para salvaguardar direitos dos titulares, e o §7º exige que, na determinação de medidas para reverter ou mitigar efeitos, sejam consideradas as que garantam confidencialidade, integridade, disponibilidade e autenticidade dos dados afetados. Em ambiente com dado pessoal, a contenção que o regulador pode ordenar é a que fecha o acesso, e não a que preserva a conveniência.

### 5.4 Problema de completar

Caso novo: uma página de captura de dados em um servidor exposto à internet recebeu um arquivo de acesso remoto. O servidor processa cadastros e guarda 800 mil registros de clientes. O time confirma o acesso remoto pela primeira vez às 11h de quarta-feira; o arquivo tem data de 9 dias antes.

Preencha as etapas e feche as três últimas.

1. Estado volátil e log que precisam ser preservados antes de qualquer ação: __________
2. Primeira ação de contenção e a segunda, na ordem correta, com quem executa: __________
3. Lista de itens de erradicação aplicáveis a um servidor exposto que guarda dado pessoal: __________
4. Critérios de saída para declarar a operação restabelecida: __________
5. O que muda na resposta se o servidor estiver no escopo de um contrato de nuvem com responsabilidade compartilhada: __________

## 6. Por que isso importa para o CISO

A escolha de contenção define o custo do incidente antes de qualquer análise forense ficar pronta. Um CISO que não participa dessa escolha descobre o impacto depois, na reclamação do dono do serviço. Um CISO que participa sem números decide por simpatia; com a tabela de custo da seção 5.2 preenchida com valores da própria empresa, decide por comparação.

Há uma exposição específica em ambiente com dado pessoal: a contenção pode ser determinada de fora. Se a ANPD fixar medida imediata com multa diária, a empresa executa no prazo da autoridade, e a capacidade de executar rápido é resultado de preparação, não de improviso.

O terceiro item é a prova do que foi feito. `GV.RR-01` do CSF 2.0 declara a liderança responsável final pelo risco cibernético, e a decisão de contenção é uma das que a auditoria vai querer ver registrada, com hora, autor e base. Registro de decisão durante a crise é o que separa "agimos" de "não sabemos por que agimos assim".

## 7. Aplicação prática

Preencha a tabela de custo de contenção para três sistemas do seu ambiente, com números que a empresa já tem: custo por hora de indisponibilidade, número de usuários afetados e existência de rota alternativa. Peça a dois donos de serviço que confirmem os números por escrito.

Depois escreva, em uma página, os critérios de saída de recuperação para o serviço mais crítico e submeta ao dono do serviço e ao jurídico. Guarde a versão assinada no playbook. No próximo incidente, a discussão sobre voltar ou não à operação começa por um documento, não por opinião.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, por que a contenção mais rápida costuma ser a mais cara, o que a erradicação tem de cobrir além do arquivo malicioso e por que recuperação exige critério escrito.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Conter é isolar a máquina | Enquanto a credencial vale, o adversário entra por outro host | Contenha identidade e máquina na mesma ação, com a ordem definida |
| Desligar o servidor preserva a evidência | Desligar apaga memória, processos e conexões abertas | Preserve o volátil antes de desligar, e decida o desligamento com base no que se perde |
| Remover o arquivo malicioso encerra a erradicação | Sobram conta criada, chave de nuvem, token e certificado | Percorra o inventário de saída da seção 5.2 com evidência por item |
| Voltar ao ar rápido reduz o impacto | Voltar sem critério de saída reintroduz o adversário e gera um segundo incidente | Cumpra os critérios de saída antes de restabelecer o serviço |
| Reabilitar a conta é problema do dono do serviço | Sem acordo escrito, a contenção é revertida por quem sente o impacto | Avise o dono do serviço antes de conter, com hora e prazo de retorno |
| Limpar o host comprometido em nível administrativo resolve | Persistência em nível de administração sobrevive à limpeza | Reconstrua a partir de origem verificada e rotacione o que a conta podia ler |
| A contenção é decisão do time técnico | O custo da contenção é operacional e a alçada é do negócio | Decida com a tabela de custo e com quem responde pela indisponibilidade |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite cinco opções de contenção em ordem crescente de custo operacional e diga o que cada uma alcança.
2. Por que revogar chave ou certificado é a opção mais difícil de reverter?
3. Quais itens compõem o inventário de erradicação além da remoção do artefato malicioso?
4. Quais são os critérios de saída que autorizam declarar a operação restabelecida?
5. O que o art. 15 do Regulamento de Comunicação de Incidente de Segurança permite à ANPD fazer durante um incidente?

<details>
<summary>Conferir respostas</summary>

1. Revogar sessão e token, com custo baixo e alcance de acesso ativo; desabilitar conta; isolar host na rede; bloquear destino de comando e controle; revogar chave ou certificado, com custo alto; e tirar o serviço do ar, com o maior custo para o negócio.
2. Porque tudo que depende da chave ou do certificado deixa de funcionar até que a substituição seja distribuída, o que exige janela de mudança e coordenação com todos os donos de sistema.
3. Contas criadas na janela, credenciais e chaves legíveis pelas contas comprometidas, tokens de aplicativo, tarefas agendadas e serviços instalados, certificados, regras de encaminhamento, chaves de acesso em nuvem e código alterado em pipeline ou repositório.
4. Adversário sem caminho conhecido de retorno, inventário de erradicação fechado com evidência, credenciais expostas rotacionadas, detecção elevada por janela declarada e restauração a partir de cópia verificada.
5. Determinar ao controlador, com ou sem prévia manifestação, a adoção imediata de medidas preventivas para prevenir, mitigar ou reverter os efeitos do incidente e evitar dano grave e irreparável, podendo fixar multa diária para assegurar o cumprimento.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Preencher a tabela de custo de contenção de três sistemas reais | Rebaixar: repetir em D+3 |
| D+30 | Escrever os critérios de saída do serviço mais crítico e obter aceite do dono do serviço | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-02 | isolar um sistema em produção só é permitido se a alçada estiver publicada como procedimento aprovado, com dono e exceção |
| complementa | 10-operacoes-soc#TEMA-06 | a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala |
| nao_confundir_com | 11-resposta-forense#TEMA-05 | derrubar o serviço para interromper o ataque e manter o serviço funcionando durante o ataque são objetivos que se opõem, e a decisão entre os dois precisa ser explícita |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CHFI | Preservação de evidência durante contenção e erradicação | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| GCFA | Análise forense de host na erradicação e na recuperação | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |

Leitura recomendada: [NIST SP 800-61 Rev. 3, atividades de resposta e recuperação](https://csrc.nist.gov/pubs/sp/800/61/r3/final); [NIST SP 800-184, planejamento, playbook, teste e melhoria da recuperação](https://csrc.nist.gov/pubs/sp/800/184/final); [Regulamento de Comunicação de Incidente de Segurança, medidas imediatas e providências de mitigação](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-61 Rev. 3 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |
| 2 | NIST SP 800-184 | primaria | https://csrc.nist.gov/pubs/sp/800/184/final | "2026-09-25" | alta |
| 3 | ISO/IEC 27035-1:2023 | primaria | https://www.iso.org/standard/78973.html | "2026-09-25" | alta |
| 4 | Resolução CD/ANPD nº 15, de 24 de abril de 2024 | primaria | https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024 | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a ordem de grandeza de custo por hora de indisponibilidade usada no exemplo da seção 5.3 é ilustrativa, e nenhuma das fontes citadas fixa valores; a numeração de famílias de controle do NIST SP 800-53 Rev. 5 ligada a resposta a incidente não foi conferida neste tema e não foi citada.

---

| Navegação | |
|---|---|
| Área | [11 Resposta a incidentes, forense e resiliência](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-preparacao-playbooks-papeis-exercicios.md) |
| Próximo tema | [TEMA-04](TEMA-04-forense-digital-evidencia-cadeia-de-custodia.md) |
| Home | [README](../README.md) |
