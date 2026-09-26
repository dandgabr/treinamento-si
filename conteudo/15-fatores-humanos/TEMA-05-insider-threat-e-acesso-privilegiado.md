---
tema: "Insider threat e o acesso privilegiado humano"
tema_id: "TEMA-05"
area_id: "15-fatores-humanos"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Classificar um evento interno ambíguo como risco interno, erro operacional ou incidente externo, nomeando a evidência exigida, o dono da decisão e o controle de acesso privilegiado que reduz a recorrência"
atende_objetivo: [5]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "04-identidade-acesso#TEMA-04"
      motivo: "a revisão periódica de acesso é o controle que remove privilégio acumulado, que é a matéria-prima do uso indevido de acesso autorizado"
  nao_confundir_com:
    - alvo: "04-identidade-acesso#TEMA-05"
      motivo: "o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso"
    - alvo: "15-fatores-humanos#TEMA-01"
      motivo: "erro humano derruba controle sem intenção; risco interno usa autorização existente para desviar ativo, e a resposta de cada caso é diferente"
fontes:
  - titulo: "SEI, Carnegie Mellon — Common Sense Guide to Mitigating Insider Threats, Seventh Edition, 07/09/2022"
    url: "https://www.sei.cmu.edu/library/common-sense-guide-to-mitigating-insider-threats-seventh-edition/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA — Insider Threat Mitigation Guide"
    url: "https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-171 Rev. 3 — overlay de CUI, arquivo oficial no domínio csrc.nist.gov"
    url: "https://csrc.nist.gov/files/pubs/sp/800/171/r3/final/docs/sp800-171r3-cui-overlay.xlsx"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "NIST SP 800-50 — Building an Information Technology Security Awareness and Training Program, outubro de 2003, retirada em 12/09/2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Insider threat e o acesso privilegiado humano

Uma ideia central: risco interno é o uso indevido de um acesso que já foi autorizado, e o problema de controle começa no privilégio que ninguém revisou — a decisão de investigar vem depois e depende de acordo entre segurança, Recursos Humanos e Jurídico.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir classificar um evento interno ambíguo como risco interno, erro operacional ou incidente externo, e nomear para ele a evidência mínima exigida, o dono da decisão, o efeito sobre a pessoa envolvida e o controle de acesso privilegiado que reduz a chance de repetição.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-por-que-pessoas-sao-exploradas.md), para o mecanismo da autorização tomada de empréstimo. O controle de credencial privilegiada e a revisão de acesso ficam em [04 Identidade, acesso e zero trust](../04-identidade-acesso/README.md); aqui se trata a decisão e o programa, não o cofre.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantas pessoas na sua empresa conseguem exportar a base de clientes completa sem abrir pedido de acesso ou emitir alerta? Chute um número.
   Confiança: ___
2. Depois de um desligamento, quantas horas você acha que levam para todos os acessos terminarem, e quem confirma o término? Aposte.
   Confiança: ___
3. Você aposta que existe acordo escrito com Recursos Humanos e Jurídico sobre quando uma conduta interna vira investigação formal? Sim, não ou não sei.
   Confiança: ___
## 4. Caso real

O SEI, da Carnegie Mellon, publicou em 07/09/2022 a sétima edição do *Common Sense Guide to Mitigating Insider Threats*, com 22 práticas baseadas na pesquisa e na análise de 3.000 casos de risco interno. O resumo define o problema como "misuse of authorized access to an organization's critical assets" e afirma que ele é uma ameaça significativa e complexa, que exige um esforço coordenado, proativo e de toda a organização para ser tratado de forma suficiente. O mesmo resumo registra que cada prática traz estratégias e táticas para ganhos rápidos e soluções de maior impacto, mitigações para os obstáculos de implementação e mapeamento para normas de segurança e privacidade, além de recursos destinados a cada parte interessada: gestão, Recursos Humanos, Jurídico, segurança física, Tecnologia da Informação, segurança da informação, donos de dado e engenheiros de software
(https://www.sei.cmu.edu/library/common-sense-guide-to-mitigating-insider-threats-seventh-edition/, acessado em 25/09/2026).

A lista de partes interessadas é o achado mais útil do documento para quem tem pouco orçamento. O problema é descrito como de toda a organização, e a segurança da informação aparece como uma entre oito partes.

A pergunta que o caso deixa aberta: na sua organização, quem assina a decisão de tratar um evento interno como investigação — e existe acordo escrito com Recursos Humanos e Jurídico antes do caso acontecer?

## 5. Conteúdo

### 5.1 Conceito

Risco interno, na formulação do SEI, é o uso indevido de acesso autorizado a ativos críticos da organização. A definição é precisa e vale ser lida devagar: o acesso foi concedido, e o ativo estava dentro do alcance legítimo de alguém. O que caracteriza o problema é o desvio de finalidade, e não a quebra de um controle de autenticação.

Isso separa o tema de outros dois com que ele costuma ser confundido. Não é o mesmo que cofre de credencial privilegiada: o cofre controla o empréstimo da credencial e registra quem a usou, o que ajuda na atribuição, mas não decide nada sobre a intenção de quem tem acesso legítimo. E não é o mesmo que erro humano: quem derruba um controle por engano gerou incidente sem intenção de desviar ativo, e a resposta adequada é diferente.

A comparação com erro humano é o que estabelece o custo do tema. Em erro, a resposta é orientação e ajuste de processo. Em desvio intencional, a resposta envolve investigação, decisão disciplinar e possível consequência legal, e por isso a organização precisa decidir antes quem decide — e com que evidência.

O SEI trata o programa como esforço de toda a organização e nomeia oito partes interessadas, das quais cinco ficam fora do time de segurança: gestão, Recursos Humanos, Jurídico, segurança física e donos de dado. O CISA mantém um guia de mitigação de risco interno com informação passo a passo e boas práticas para estabelecer um programa que reduza a probabilidade de dano a pessoas, empresas, organizações e infraestrutura crítica
(https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide, acessado em 25/09/2026).

Há ainda o lado de conscientização. O overlay de CUI da NIST SP 800-171 Rev. 3, disponível no domínio csrc.nist.gov, inclui entre as ações de capacitação a de fornecer treinamento em reconhecer e reportar potenciais indicadores de risco interno. A consequência prática é que o canal de reporte interno, tratado no [TEMA-04](./TEMA-04-cultura-de-seguranca-e-lideranca.md), é também uma fonte de detecção de risco interno, e não apenas de *phishing*.

### 5.2 Como funciona

O mecanismo do risco interno tem três estágios observáveis, e o programa precisa de controle em cada um.

O primeiro é a acumulação de acesso. Privilégio se acumula por promoção, por troca de função, por projeto temporário e por substituição durante férias. Ninguém concede privilégio por decisão única; ele se soma em dez decisões pequenas. É aqui que os controles de identidade atuam: menor privilégio, acesso por tempo determinado e revisão periódica de acesso.

O segundo é a oportunidade. Ela aparece quando a pessoa consegue, sem obstáculo técnico e sem testemunha, alcançar o ativo crítico — exportar a base, alterar dado de pagamento, criar credencial nova, copiar repositório. O acesso em massa a ativo crítico é o sinal que costuma ser monitorado, e ele é diferente de uso fora de horário, que tem explicação frequente e legítima em operação de produção.

O terceiro é o indicador comportamental, que é o mais difícil e o mais mal usado. O SEI situa os recursos por parte interessada porque o indicador relevante muitas vezes chega a Recursos Humanos — pedido de demissão, conflito com gestor, mudança de comportamento, processo disciplinar em curso — e não ao time de segurança. Um programa que só recebe dado técnico ignora a maior parte do que existe.

A resposta tem uma ordem que evita dano desnecessário. Primeiro, contenção proporcional, que pode ser apenas suspender o acesso em massa sem comunicar. Segundo, verificação com a área de origem do indicador. Terceiro, decisão formal, com quem tem alçada e com registro. Quarto, correção do acesso que permitiu o alcance, porque essa parte vale independentemente da conclusão sobre a pessoa. A NIST SP 800-61 Rev. 3 posiciona as recomendações de resposta a incidente dentro das atividades de gestão de risco descritas no CSF 2.0, o que vale igualmente para o caso interno
(https://csrc.nist.gov/pubs/sp/800/61/r3/final, acessado em 25/09/2026).

### 5.3 Exemplo resolvido

Situação: três eventos chegam na mesma semana.

- Evento A: analista de dados copia a base de clientes para armazenamento pessoal em nuvem, duas semanas antes da data que consta no aviso de desligamento.
- Evento B: administrador cola credencial de produção em um chamado aberto no sistema de suporte, para pedir ajuda a um colega.
- Evento C: conta de serviço usada às 02h00 para consultar a base de clientes de uma origem nunca vista.

Passo 1. Classifique pelo tipo de desvio, não pela gravidade aparente.

| Evento | Classificação | Primeira evidência a obter | Quem decide | Controle que reduz recorrência |
|---|---|---|---|---|
| A | Indício de risco interno, com indicador vindo do ciclo de desligamento | Log de exportação em massa e escopo do ativo copiado | Dono do dado, com Recursos Humanos e Jurídico | Terminar acesso em massa a base de cliente por padrão; revisão de acesso no aviso prévio |
| B | Erro operacional com risco de exposição | Existência de uso da credencial fora do horário e origem do chamado | Gestor do administrador | Cofre de credencial com empréstimo registrado e proibição de credencial em chamado |
| C | Suspeita de incidente externo com credencial de serviço | Origem do acesso e comparação com o horário de rotina esperada | Time de segurança, com o dono da aplicação | Rotação e emissão dinâmica de credencial de serviço; alerta por origem inesperada |

Passo 2. Aplique a ordem de resposta. Em A, suspenda o acesso em massa antes de conversar; em B, rotacione a credencial exposta antes de tratar conduta; em C, valide se existe rotina legítima naquele horário antes de bloquear produção.

Passo 3. Separe a correção do controle da decisão sobre a pessoa. Mesmo que o evento A termine sem conclusão sobre intenção, a retirada do acesso em massa no aviso de desligamento se justifica por si.

Passo 4. Registre o que ficou aberto. Em B, a pergunta que sobra é por que o chamado permitia texto livre para segredo; em C, por que uma credencial de serviço de longa duração ainda existe.

Passo 5. Meça o que é controlável. Número de contas capazes de exportar base completa; tempo entre o aviso de desligamento e o fim do acesso em massa; número de segredos de serviço sem emissão dinâmica; tempo entre a detecção do acesso anômalo e a contenção.

### 5.4 Problema de completar

Situação: quarenta e oito horas depois de a avaliação de desempenho registrar conflito com o gestor, um engenheiro acessa pela primeira vez o repositório de credenciais de produção, sem tarefa atribuída. Complete as três últimas etapas.

1. Classificação inicial e o que ainda falta saber: _______
2. Evidência mínima antes de qualquer conclusão sobre intenção: _______
3. Ação imediata e proporcional: _______
4. Quem decide e quem é consultado: _______
5. Controle que reduz a chance de o acesso existir sem tarefa atribuída: _______

## 6. Por que isso importa para o CISO

O programa de risco interno é o que costuma chegar ao comitê com pedido de verba de ferramenta, e o SEI oferece o argumento oposto: o problema é descrito como exigindo esforço coordenado de toda a organização, com oito partes interessadas, e as 22 práticas incluem medidas de baixo custo ao lado de medidas de alto impacto. O que mais reduz o risco na prática está em outro orçamento — privilégio mínimo, acesso por tempo determinado, revisão periódica e emissão dinâmica de credencial. Ferramenta de monitoração sem essa base produz alerta sobre acesso que não deveria existir.

A segunda consequência é de natureza jurídica e trabalhista. Investigar empregado toca dado pessoal e exige base legal, finalidade declarada e proporcionalidade, o que aproxima o tema de [14 Dados, privacidade e LGPD/GDPR](../14-dados-privacidade/README.md). O CISO que instala monitoração sem acordo com Jurídico e Recursos Humanos descobre o limite no primeiro caso concreto, quando já existe dano à pessoa e risco para a organização.

A terceira consequência é sobre atribuição. Como o acesso era autorizado, o log de autenticação não distingue uso indevido de uso legítimo. O que sustenta a conclusão é a combinação entre escopo do ativo, origem, horário, volume e indicador vindo de outra área. Montar essa combinação antes do caso é decisão de arquitetura de detecção.

## 7. Aplicação prática

Peça ao dono da base de clientes a lista de contas que conseguem exportar o conteúdo completo. Depois peça à área de identidade o tempo médio entre o registro de desligamento e o término dos acessos. Com as duas informações, escolha a base de clientes e escreva, em uma página, o que passa a ser exigido para exportação em massa: pedido registrado, aprovação nominal e alerta automático para quem aprovou e para a segurança.

Em paralelo, converse com Recursos Humanos e Jurídico e escreva o critério de escalonamento: qual sinal faz um evento interno virar investigação formal, quem decide, o que é comunicado à pessoa e com que registro. Sem esse critério escrito, cada caso será decidido no improviso e o precedente será definido pela primeira ocorrência.

## 8. Autoexplicação

Explique em três frases por que o cofre de credencial privilegiada ajuda a atribuir uso, mas não reduz o risco interno por si. Se a explicação não mencionar que o acesso continua existindo depois do empréstimo, releia a seção 5.1.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Risco interno é assunto do time de segurança" | O SEI descreve esforço de toda a organização e nomeia oito partes interessadas, sendo cinco externas à segurança | Envolva gestão, Recursos Humanos, Jurídico, segurança física e donos de dado |
| "Instalar monitoração resolve" | Sem critério de escalonamento e sem base legal, o dado coletado não vira decisão defensável | Escreva o critério com Jurídico e Recursos Humanos antes de coletar |
| "Insider threat é o mesmo que PAM" | O cofre controla a credencial e o registro do empréstimo; o risco interno trata a decisão de quem tem acesso legítimo | Trate os dois como camadas distintas e complementares |
| "Todo acesso fora de horário indica risco interno" | Produção, plantão e rotina agendada explicam a maior parte desses acessos | Monitore acesso em massa a ativo crítico, que é sinal mais específico |
| "Exportação em massa é motivo para desligar alguém" | A correção do controle independe da conclusão sobre intenção, e a decisão sobre a pessoa tem rito próprio | Separe contenção, correção do acesso e decisão disciplinar |
| "O programa começa pela ferramenta" | As práticas do SEI incluem medidas de ganho rápido, muitas delas de processo e de acesso | Comece por privilégio, revisão de acesso e critério de escalonamento |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Como o SEI define o problema de risco interno, e o que essa definição implica sobre o controle de autenticação?
2. Quantas práticas a sétima edição do guia do SEI apresenta, e sobre quantos casos a pesquisa se baseia?
3. Quais partes interessadas o SEI nomeia como destinatárias dos recursos de cada prática?
4. Qual é a diferença entre risco interno e erro humano, e por que a resposta adequada muda?
5. Quais são os três estágios observáveis do mecanismo de risco interno, e qual controle atua em cada um?
6. Por que a correção do acesso deve ser tratada separadamente da decisão sobre a pessoa?

<details>
<summary>Conferir respostas</summary>

1. Como uso indevido de acesso autorizado a ativos críticos da organização. Como o acesso é legítimo, o controle de autenticação não distingue o uso indevido, e a detecção precisa vir da combinação entre escopo do ativo, origem, horário, volume e indicador de outra área.
2. Vinte e duas práticas, baseadas na análise de 3.000 casos de risco interno.
3. Gestão, Recursos Humanos, Jurídico, segurança física, Tecnologia da Informação, segurança da informação, donos de dado e engenheiros de software.
4. No erro humano o dano acontece sem intenção de desviar ativo, e a resposta é orientação e ajuste de processo. No risco interno há desvio de finalidade, e a resposta envolve investigação, rito disciplinar e possível consequência legal.
5. Acumulação de acesso, respondida por privilégio mínimo, acesso por tempo determinado e revisão periódica; oportunidade, respondida por controle de exportação em massa e alerta; indicador comportamental, respondido por canal que traga para a segurança o que Recursos Humanos já sabe.
6. Porque o controle que permitiu o alcance do ativo está errado independentemente da conclusão sobre a intenção, e misturar as duas coisas adia a correção até o fim de uma apuração que pode levar meses.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem releitura | Rebaixar: repetir em D+1 |
| D+7 | Levantar o número de contas com permissão de exportar a base de clientes completa | Rebaixar: repetir em D+3 |
| D+30 | Escrever com Recursos Humanos e Jurídico o critério de escalonamento de evento interno | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 04-identidade-acesso#TEMA-04 | a revisão periódica de acesso é o controle que remove privilégio acumulado, que é a matéria-prima do uso indevido de acesso autorizado |
| nao_confundir_com | 04-identidade-acesso#TEMA-05 | o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso |
| nao_confundir_com | 15-fatores-humanos#TEMA-01 | erro humano derruba controle sem intenção; risco interno usa autorização existente para desviar ativo, e a resposta de cada caso é diferente |

## 13. Certificações e leitura recomendada

Leitura recomendada: as 22 práticas do guia do SEI, com atenção à marcação de qual parte interessada é destinatária de cada uma, e o guia de mitigação de risco interno do CISA para a sequência de montagem do programa.
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | SEI, *Common Sense Guide to Mitigating Insider Threats*, 7ª edição, 07/09/2022 | primaria | https://www.sei.cmu.edu/library/common-sense-guide-to-mitigating-insider-threats-seventh-edition/ | "2026-09-25" | alta |
| 2 | CISA, *Insider Threat Mitigation Guide* | primaria | https://www.cisa.gov/resources-tools/resources/insider-threat-mitigation-guide | "2026-09-25" | media |
| 3 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |
| 4 | NIST SP 800-171 Rev. 3, overlay de CUI, domínio csrc.nist.gov | primaria | https://csrc.nist.gov/files/pubs/sp/800/171/r3/final/docs/sp800-171r3-cui-overlay.xlsx | "2026-09-25" | media |
| 5 | NIST SP 800-50, outubro de 2003, retirada em 12/09/2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/final | "2026-09-25" | media |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Taxonomia de tipos de risco interno, como ator infiltrado, negligent e malicioso: Não confirmada em fonte primária nesta execução; nenhuma classificação formal foi lida. Magnitude de incidentes internos em relação ao total: Não confirmado; nenhuma estatística desse tipo foi lida. Data e conteúdo da última revisão do *Insider Threat Mitigation Guide* do CISA: Existência confirmada no índice do domínio cisa.gov; a página não abriu nesta execução e a data da revisão não foi confirmada. Eficácia de ferramenta de monitoração de comportamento na redução de risco interno: Não confirmado; o guia do SEI parte de práticas, sem métrica de eficácia de fornecedor. Base legal específica para monitoração de empregado no Brasil e na União Europeia: Fora do escopo desta área; verificar em 14 Dados, privacidade e LGPD/GDPR.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-cultura-de-seguranca-e-lideranca.md) |
| Próximo tema | [TEMA-06](TEMA-06-medir-comportamento-nao-cliques.md) |
| Home | [README](../README.md) |
