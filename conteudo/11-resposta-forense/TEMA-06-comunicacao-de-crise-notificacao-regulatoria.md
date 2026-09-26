---
tema: "Comunicação de crise e notificação regulatória"
tema_id: "TEMA-06"
area_id: "11-resposta-forense"
nivel: avancado
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Determinar, em um incidente concreto, quem comunica o quê a cada público, com o conteúdo obrigatório e o prazo de cada destinatário, e sustentar a decisão em registro mantido por no mínimo cinco anos"
atende_objetivo: [3, 6]
certificacoes: ["CHFI", "GCFA", "CISM"]
pre_requisitos: ["TEMA-01", "14-dados-privacidade#TEMA-04"]
relacoes:
  complementa:
    - alvo: "11-resposta-forense#TEMA-01"
      motivo: "o ciclo define o que fazer e em que ordem; a comunicação define quem sabe o quê e em quanto tempo, e as duas decisões travam uma na outra"
    - alvo: "13-ofensiva-pentest#TEMA-06"
      motivo: "o achado ofensivo que expõe dado pessoal entra na mesma decisão de comunicação, com conteúdo e prazo definidos antes do resultado chegar"
  aprofundado_por: []
  aplicado_em:
    - alvo: "14-dados-privacidade#TEMA-04"
      motivo: "o prazo de três dias úteis da comunicação com dado pessoal obriga o comitê a decidir sob informação incompleta"
  nao_confundir_com: []
fontes:
  - titulo: "Resolução CD/ANPD nº 15, de 24 de abril de 2024 — Regulamento de Comunicação de Incidente de Segurança, arts. 3º a 10, 15, 17 e 19"
    url: "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Diretiva (UE) 2022/2555 — página oficial da Comissão Europeia sobre a NIS2"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA — EU incident response and cyber crisis management"
    url: "https://www.enisa.europa.eu/topics/eu-incident-response-and-cyber-crisis-management"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
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

# Comunicação de crise e notificação regulatória

O Regulamento de Comunicação de Incidente de Segurança exige doze informações na comunicação à ANPD, entre elas o número de titulares afetados discriminando crianças, adolescentes e idosos, as medidas técnicas adotadas antes e após o incidente, os riscos com identificação dos possíveis impactos e a data da ocorrência e a do conhecimento pelo controlador (art. 6º, §2º, [in.gov.br](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024), acessado em 2026-09-25). Doze campos preenchidos em três dias úteis, enquanto a perícia ainda trabalha, é problema de processo montado antes do incidente.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: determinar, em um incidente concreto, quem comunica o quê a cada público, com o conteúdo obrigatório e o prazo de cada destinatário, e sustentar a decisão em registro mantido por no mínimo cinco anos.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md), pela marca de tempo que dispara o relógio regulatório, e [14 Dados e privacidade #TEMA-04](../14-dados-privacidade/TEMA-04-lgpd-bases-legais-direitos-incidentes.md), pela análise de hipótese legal e de risco ou dano relevante que sustenta a decisão de comunicar.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Se um incidente com dado pessoal acontecesse hoje à noite, a empresa comunicaria dentro do prazo? Anote o que trava essa resposta.
   Confiança: ___
2. Quem assinaria a comunicação ao regulador em nome da empresa? Anote o nome ou a lacuna.
   Confiança: ___
3. Quantos incidentes com dado pessoal a empresa tratou no último ano e quantos exigiram comunicação? Se o número não existir, anote isso.
   Confiança: ___

## 4. Caso real

Em uma empresa de varejo, o time descobre na segunda-feira às 8h que um servidor de arquivos expôs propostas comerciais contendo nome, e-mail e valores de pedido de 12 mil clientes. O jurídico afirma que não há dado pessoal porque "é dado de negócio". O time de comunicação prepara um texto tranquilizador. O encarregado descobre o caso na quarta-feira, por acaso, em uma reunião.

Na quinta-feira, a ANPD publica orientação geral sobre comunicação de incidente e o jurídico muda de posição. A empresa comunica na sexta-feira, oito dias úteis depois de ter conhecido o fato. O caso deixa aberta a pergunta que o conteúdo resolve: em que momento a empresa passou a ter conhecimento de que o incidente afetou dado pessoal, e quem era responsável por identificar isso na terça-feira.

## 5. Conteúdo

### 5.1 Conceito

Comunicação de crise é um processo com quatro públicos com obrigações diferentes: o interno, o cliente, o regulador e o público em geral. O Regulamento define comunicação de incidente de segurança como o ato do controlador que comunica à ANPD e ao titular a ocorrência de incidente que possa acarretar risco ou dano relevante, e mantém a obrigação nos dois destinatários ao mesmo tempo (arts. 3º, IV, e 4º, [in.gov.br](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024), acessado em 2026-09-25).

O gatilho é critério, não sensação. O incidente pode acarretar risco ou dano relevante quando puder afetar significativamente interesses e direitos fundamentais dos titulares e, cumulativamente, envolver ao menos um de seis critérios: dados pessoais sensíveis, dados de crianças, adolescentes ou idosos, dados financeiros, dados de autenticação em sistemas, dados protegidos por sigilo legal, judicial ou profissional, ou dados em larga escala. São doze itens de conteúdo na comunicação à ANPD e sete na comunicação ao titular, cada uma com prazo próprio de três dias úteis contados do conhecimento de que o incidente afetou dados pessoais (arts. 5º, 6º e 9º).

A dimensão europeia entra pela obrigação de notificar incidentes significativos à autoridade nacional competente, aplicável a entidades de porte médio e grande em 18 setores críticos, com responsabilização da alta administração pelo descumprimento das medidas de gestão de risco e com a rede de CSIRTs e a rede EU-CyCLONe para incidentes de larga escala ([digital-strategy.ec.europa.eu](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive), acessado em 2026-09-25; [enisa.europa.eu](https://www.enisa.europa.eu/topics/eu-incident-response-and-cyber-crisis-management), acessado em 2026-09-25). As horas exatas dessas notificações não foram confirmadas nesta execução: NAO CONFIRMADO em fonte oficial.

### 5.2 Como funciona

O processo tem três componentes: audiência, decisão e registro. A audiência define quem recebe o quê; a decisão define o que a empresa afirma; e o registro é o que existe depois, inclusive quando a empresa decide não comunicar.

| Público | O que recebe | Prazo | Quem aprova |
|---|---|---|---|
| Time de resposta e comitê de crise | Fato conhecido, impacto estimado, próximo passo | 30 min a 2 h | Gerente de plantão |
| Diretoria e conselho | Situação, exposição, decisões tomadas e pendentes | 24 h | CISO |
| ANPD | Comunicação com os doze itens do art. 6º, §2º, pelo encarregado, com comprovação de vínculo | 3 dias úteis do conhecimento | Jurídico e encarregado |
| Titular | Comunicação com os itens do art. 9º, em linguagem simples | 3 dias úteis do conhecimento | Jurídico e comunicação |
| Parceiro e cliente contratual | O que a cláusula contratual exige, no prazo dela | Conforme contrato | Dono da relação |
| Público geral | Comunicado único, quando a comunicação individual for inviável | Divulgação por no mínimo 3 meses | Diretoria |

Quatro regras operacionais fazem o processo funcionar.

Primeira: conhecer é evento registrável. O prazo conta do conhecimento pelo controlador de que o incidente afetou dados pessoais, e o registro precisa trazer essa data e hora, além da data da ocorrência quando possível determiná-la. Quem não registra quando soube perde a capacidade de demonstrar que comunicou dentro do prazo.

Segunda: a decisão de não comunicar também se registra. O art. 10 obriga o controlador a manter o registro do incidente, inclusive daquele não comunicado à ANPD e aos titulares, por no mínimo cinco anos, com oito itens mínimos, entre eles a avaliação de risco e possíveis danos, as medidas de correção e mitigação, a forma e o conteúdo da comunicação quando houver, e os motivos da ausência de comunicação. Registro de decisão é o que transforma uma escolha discutível em escolha defensável.

Terceira: informação incompleta se comunica assim mesmo. A comunicação pode ser complementada, de maneira fundamentada, em vinte dias úteis a contar da comunicação. Quem tem escopo parcial comunica o parcial e explica os motivos de eventual demora, campo previsto no próprio formulário.

Quarta: o comunicado não é o relatório. O que a empresa diz ao cliente fala de impacto e de recomendação; o que vai ao regulador traz números, categorias de dado e medidas técnicas. Misturar os dois públicos produz documento que não serve a nenhum dos dois. A comunicação individual usa linguagem simples e os meios habituais de contato; quando não for possível identificar os titulares, a divulgação ocorre pelos meios disponíveis, com fácil visualização, por no mínimo três meses, e a empresa precisa juntar declaração de que realizou a comunicação em até três dias úteis após o encerramento do prazo de comunicação.

O limite da empresa sobre o conteúdo é parcial. O controlador pode pedir sigilo fundamentado de informação protegida por lei, indicando o que deve ter acesso restringido, como informação cuja divulgação viole segredo comercial. O que não se pode é omitir a comunicação.

### 5.3 Exemplo resolvido

Incidente de exposição de arquivos em nuvem, com 12 mil registros de clientes contendo nome, documento, endereço e dados de saúde em 40 dos registros.

| Momento | Ação | Decisão registrada |
|---|---|---|
| Segunda 8h | Descoberta da exposição e início da contenção | Incidente confirmado, severidade alta |
| Segunda 10h | Classificação das categorias de dado do arquivo | Há dado pessoal, incluindo dado sensível em 40 registros |
| Segunda 14h | Aplicação dos critérios do art. 5º | Dado sensível e dado em larga escala: risco ou dano relevante presumido |
| Segunda 16h | Comitê de crise com jurídico, comunicação, encarregado e dono do serviço | Comunicar; relógio de tR é segunda 10h; prazo até quinta-feira |
| Terça | Preenchimento dos doze campos e envio pelo formulário eletrônico | Comunicação à ANPD pelo encarregado, com documento de vínculo |
| Terça | Comunicação aos titulares identificáveis, com recomendação de mitigação | Linguagem simples, canal habitual de contato |
| Quinta | Declaração de que a comunicação ao titular foi realizada | Registro no processo |
| D+20 dias úteis | Complementação com o número final de titulares e a causa raiz | Complementação fundamentada |

Rascunho do comunicado público, em quatro frases que resistem a uma auditoria posterior:

"Em 12 de setembro, identificamos que um repositório de arquivos com dados de clientes ficou acessível de forma indevida por 11 dias. Corrigimos o acesso no mesmo dia e bloqueamos a origem da exposição. Os dados afetados incluem nome, documento e endereço, e em 40 casos incluem informação de saúde. Comunicamos a autoridade competente e os clientes identificados e recomendamos atenção a contatos que peçam dados pessoais em nome da empresa."

O que o texto não faz: não estima número de titulares que não foi confirmado, não atribui culpa a pessoa ou fornecedor, não promete ausência de dano e não usa a palavra "vazamento" sem delimitá-la, porque a palavra vira obrigação interpretativa depois.

Registro que fica guardado por no mínimo cinco anos: data e hora do conhecimento, descrição das circunstâncias, natureza e categoria dos dados, número de titulares afetados, avaliação de risco e possíveis danos, medidas de correção, forma e conteúdo da comunicação e, no campo que quase ninguém preenche, os motivos da ausência de comunicação — que neste caso existiu para os 40 arquivos com dado sensível, tratados individualmente.

### 5.4 Problema de completar

Caso novo: na sexta-feira à noite, o time identifica que conseguiu imprimir a chave de criptografia de um banco de dados, exposta em um repositório de código privado com acesso de 300 desenvolvedores. O banco contém 400 mil registros de clientes. Não há evidência de acesso indevido aos dados.

Preencha as etapas e feche as três últimas.

1. Aplicação dos critérios do art. 5º e a conclusão sobre risco ou dano relevante: __________
2. Momento exato do conhecimento pelo controlador, e como provar isso depois: __________
3. Conteúdo mínimo das duas comunicações e quem assina cada uma: __________
4. O que a empresa diz ao cliente se decidir comunicar sem ter confirmado acesso indevido: __________
5. Módulos e conteúdo do registro do incidente, com prazo de guarda: __________
6. O que muda se a empresa estiver sujeita, além da LGPD, à obrigação de notificar incidente significativo a uma autoridade setorial na Europa: __________

## 6. Por que isso importa para o CISO

O prazo de três dias úteis transforma comunicação em requisito de operação. A empresa precisa saber, por sistema, se há dado pessoal, de qual categoria e quantos titulares — e precisa saber isso com a perícia ainda em curso. Quem depende de varredura manual chega ao terceiro dia sem resposta e comunica no oitavo.

O segundo efeito é a exposição pessoal e institucional. O Regulamento autoriza processo administrativo sancionador por descumprimento dos prazos de comunicação à ANPD e ao titular, e a NIS2 introduz a responsabilização da alta administração pelas medidas de gestão de risco. Comunicação não é atividade de assessoria; é obrigação do controlador, com nome e assinatura.

O terceiro é o custo de dizer pouco. A ANPD pode, avaliada a gravidade, determinar ampla divulgação do incidente em meios de comunicação às expensas do controlador, quando a comunicação feita pela empresa se mostrar insuficiente para alcançar parcela significativa dos titulares afetados, e essa medida precisa ser compatível com a abrangência da empresa e com a localização dos titulares. Comunicação mínima que não alcança o titular tende a virar comunicado pago em mídia, do jeito e no tamanho que a autoridade definir.

## 7. Aplicação prática

Monte, em uma página, o cartão de comunicação de incidente da sua empresa, com quatro colunas: público, conteúdo, prazo e quem aprova. Preencha o campo do prazo com a fonte normativa que o sustenta, e não com estimativa.

Depois faça um exercício de 60 minutos em que o facilitador informa apenas três fatos — um arquivo exposto, uma categoria de dado incerta e um número aproximado de titulares — e pede ao grupo que decida comunicar ou não, com o registro escrito na hora. Cronometre o tempo até a decisão assinada. Se passar de meio dia útil, o prazo de três dias úteis já está em risco no mundo real.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, por que o prazo da comunicação conta do conhecimento e não da conclusão, o que distingue a comunicação ao regulador do comunicado ao cliente e por que o registro do incidente não comunicado é material de defesa.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Sem dado pessoal confirmado, não há prazo | O prazo conta do conhecimento de que o incidente afetou dado pessoal, e a análise precisa de dono e hora | Registre quando soube e trate a classificação do dado como etapa do ciclo |
| Comunicar cedo demais expõe a empresa | O regulamento prevê complementação fundamentada em vinte dias úteis | Comunique o que sabe, explique a demora e complemente |
| O comunicado ao cliente substitui a notificação | São destinatários distintos, com conteúdo e prazos próprios | Faça as duas comunicações, com textos e aprovações separados |
| Incidente não comunicado não precisa de registro | O art. 10 exige registro do incidente, inclusive do não comunicado, por no mínimo cinco anos | Registre a decisão e os motivos da ausência de comunicação |
| O número de titulares pode ser estimado no comunicado | Número não confirmado em documento regulatório vira inconsistência depois | Informe o número com o escopo conhecido e complemente com o número final |
| Texto tranquilizador reduz o dano | Afirmação não verificada vira declaração falsa em processo | Descreva o que sabe, sem prometer ausência de impacto |
| Comunicação é assunto do jurídico | Os doze campos dependem de dado técnico que só o time de segurança tem | Junte jurídico, comunicação, encarregado e segurança na mesma decisão |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite os seis critérios do art. 5º do Regulamento e a condição que precisa ser cumulativa com eles.
2. Quais são os prazos de comunicação à ANPD e ao titular, e de que evento cada um conta?
3. O que o art. 10 exige do registro do incidente, e por quanto tempo ele deve ser mantido?
4. Como a empresa comunica quando não consegue identificar todos os titulares afetados?
5. Que dois documentos a empresa deve juntar ao processo depois de comunicar ao titular?
6. O que a autoridade pode fazer se considerar a comunicação da empresa insuficiente para alcançar parcela significativa dos titulares?

<details>
<summary>Conferir respostas</summary>

1. Dados pessoais sensíveis; dados de crianças, adolescentes ou idosos; dados financeiros; dados de autenticação em sistemas; dados protegidos por sigilo legal, judicial ou profissional; ou dados em larga escala. A condição cumulativa é que o incidente possa afetar significativamente interesses e direitos fundamentais dos titulares.
2. Três dias úteis à ANPD e três dias úteis ao titular, ambos contados do conhecimento pelo controlador de que o incidente afetou dados pessoais.
3. Manter o registro do incidente, inclusive do não comunicado à ANPD e aos titulares, por no mínimo cinco anos, com oito itens mínimos: data de conhecimento, descrição das circunstâncias, natureza e categoria dos dados, número de titulares afetados, avaliação de risco e possíveis danos, medidas de correção e mitigação, forma e conteúdo da comunicação quando houver e motivos da ausência de comunicação.
4. Pelos meios de divulgação disponíveis, como sítio eletrônico, aplicativos, mídias sociais e canais de atendimento, com conhecimento amplo e fácil visualização, pelo período de no mínimo três meses.
5. Primeiro, documentos que comprovem o vínculo contratual, empregatício ou funcional de quem comunica, ou instrumento com poderes de representação quando for representante. Segundo, a declaração de que a comunicação ao titular foi realizada, com os meios utilizados, em até três dias úteis contados do término do prazo de comunicação.
6. Determinar ampla divulgação do incidente em meios de comunicação, às expensas do controlador, compatível com a abrangência da empresa e com a localização dos titulares afetados.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever o cartão de comunicação com prazos e fontes normativas | Rebaixar: repetir em D+3 |
| D+30 | Rodar o exercício de decisão em 60 minutos e medir o tempo até a assinatura | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 14-dados-privacidade#TEMA-04 | o prazo de três dias úteis da comunicação com dado pessoal obriga o comitê a decidir sob informação incompleta |
| complementa | 11-resposta-forense#TEMA-01 | o ciclo define o que fazer e em que ordem; a comunicação define quem sabe o quê e em quanto tempo, e as duas decisões travam uma na outra |
| complementa | 13-ofensiva-pentest#TEMA-06 | o achado ofensivo que expõe dado pessoal entra na mesma decisão de comunicação, com conteúdo e prazo definidos antes do resultado chegar |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CHFI | Evidência e registro que sustentam a comunicação | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| GCFA | Análise forense de host que sustenta a notificação | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| CISM | Governança da resposta e comunicação ao executivo | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |

Leitura recomendada: [Regulamento de Comunicação de Incidente de Segurança, critérios, prazos, conteúdo e registro](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024); [Diretiva (UE) 2022/2555 e a página da Comissão Europeia](https://digital-strategy.ec.europa.eu/en/policies/nis2-directive); [ENISA, gestão de crise e coordenação no nível europeu](https://www.enisa.europa.eu/topics/eu-incident-response-and-cyber-crisis-management); [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Resolução CD/ANPD nº 15, de 24 de abril de 2024 | primaria | https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024 | "2026-09-25" | alta |
| 2 | Diretiva (UE) 2022/2555 — página oficial da Comissão Europeia | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |
| 3 | ENISA — EU incident response and cyber crisis management | primaria | https://www.enisa.europa.eu/topics/eu-incident-response-and-cyber-crisis-management | "2026-09-25" | media |
| 4 | NIST SP 800-61 Rev. 3 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: as horas específicas de notificação de incidente significativo da Diretiva (UE) 2022/2555, que exigem a leitura do articulado e do ato de transposição nacional; a página da ENISA foi confirmada no índice de busca do domínio oficial, sem abertura da página; os prazos de notificação previstos em regulamentos setoriais brasileiros, como o do setor financeiro e o de telecomunicações, que não foram lidos e não são afirmados aqui.

---

| Navegação | |
|---|---|
| Área | [11 Resposta a incidentes, forense e resiliência](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-continuidade-de-negocios-recuperacao-de-desastre.md) |
| Home | [README](../README.md) |
