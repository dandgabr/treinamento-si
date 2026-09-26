---
tema: "Preparação: playbooks, papéis e exercícios"
tema_id: "TEMA-02"
area_id: "11-resposta-forense"
nivel: intermediario
tempo_estimado: "45-55 min"
objetivo_aprendizagem: "Montar o playbook de um tipo de incidente com gatilho, matriz de severidade, papéis, alçada de decisão e janela de preservação de evidência, e validá-lo em um exercício de mesa cujas lacunas saem com dono e prazo"
atende_objetivo: [1, 2, 3]
certificacoes: ["CHFI", "GCFA"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "10-operacoes-soc#TEMA-01"
      motivo: "o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos"
    - alvo: "13-ofensiva-pentest#TEMA-02"
      motivo: "o mesmo escopo autorizado que limita o exercício adversarial limita o exercício de mesa: quem pode ser afetado, com qual finalidade e até onde"
    - alvo: "11-resposta-forense#TEMA-05"
      motivo: "o exercício de mesa só vale se o plano de continuidade declarar antes o RTO e o RPO que o time deve tentar cumprir"
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-03"
      motivo: "a lacuna apontada no exercício só sai do papel quando entra no pedido de verba do ciclo seguinte"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-84 — Guide to Test, Training, and Exercise Programs for IT Plans and Capabilities, setembro de 2006"
    url: "https://csrc.nist.gov/pubs/sp/800/84/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27035-1:2023 — Information security incident management — Part 1: Principles and process, edição 2, publicada em 13/02/2023"
    url: "https://www.iso.org/standard/78973.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-184 — Guide for Cybersecurity Event Recovery, dezembro de 2016"
    url: "https://csrc.nist.gov/pubs/sp/800/184/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA — Good Practice Guide for Incident Management, publicada em 20 de dezembro de 2010"
    url: "https://www.enisa.europa.eu/publications/good-practice-guide-for-incident-management"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Preparação: playbooks, papéis e exercícios

O SP 800-84, publicado em setembro de 2006, descreve o desenho, o desenvolvimento, a condução e a avaliação de eventos de teste, treinamento e exercício cujo objetivo é treinar pessoas, exercitar planos de TI e testar sistemas, para que a organização consiga se preparar, responder, gerenciar e se recuperar de eventos adversos; o guia trata de eventos de uma única organização, e não de exercícios que envolvem várias ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/84/final), acessado em 2026-09-25). A preparação de resposta é, portanto, um programa com avaliação própria, e não uma pasta de documentos escrita depois do primeiro incidente grave.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: montar o playbook de um tipo de incidente com gatilho, matriz de severidade, papéis, alçada de decisão e janela de preservação de evidência, e validá-lo em um exercício de mesa cujas lacunas saem com dono e prazo.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md), porque o playbook é a forma escrita das marcas de tempo que o ciclo precisa medir. Sem as marcas, o playbook vira descrição de tarefas e ninguém consegue provar que ele funcionou.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantos playbooks escritos o seu time tem hoje, e qual foi o último tipo de incidente que apareceu e não estava coberto por nenhum?
   Confiança: ___
2. Quem atende a um alerta crítico às 3h da manhã de domingo, e em quanto tempo essa pessoa responde?
   Confiança: ___
3. Qual ação de contenção qualquer analista de plantão pode executar em um sistema de produção sem pedir aprovação?
   Confiança: ___
4. Quando foi o último exercício de mesa de resposta a incidente na sua empresa, e quais lacunas ele apontou?
   Confiança: ___

## 4. Caso real

Um time de segurança escreve, ao longo de dois meses, 14 playbooks com o apoio de uma consultoria. Seis meses depois, durante um incidente de sequestro de dados, o gerente de plantão abre o playbook de ransomware e encontra a instrução "acionar o comitê de crise". O comitê não tem lista nominal atualizada, não tem horário de convocação e não sabe quem isola o servidor de backup. O playbook estava correto e o incidente ficou 11 horas sem contenção.

A pergunta que o caso deixa aberta: o que um playbook precisa conter para ser executável às 3h da manhã por quem está de plantão, e não por quem o escreveu.

## 5. Conteúdo

### 5.1 Conceito

A ISO/IEC 27035-1:2023 coloca "preparar-se para incidentes" como a primeira atividade do processo de gestão de incidentes, antes de detectar e responder ([iso.org](https://www.iso.org/standard/78973.html), acessado em 2026-09-25). O SP 800-61 Rev. 3 declara entre seus objetivos ajudar a organização a se preparar para a resposta, reduzir o número e o impacto dos incidentes e melhorar a eficiência das atividades de detecção, resposta e recuperação ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/61/r3/final), acessado em 2026-09-25). Preparação, nas duas fontes, é capacidade construída antes do evento, com verificação.

Três artefatos compõem essa capacidade. O plano de resposta define quem manda, quanto custa e com que autoridade. O playbook define, por tipo de incidente, o gatilho, a sequência mínima de ações e as decisões que precisam de gente. E o programa de exercícios mede se os dois funcionam sob pressão, seguindo o ciclo de desenho, condução e avaliação do SP 800-84.

A ENISA publicou em 20 de dezembro de 2010 um guia de boas práticas de gestão de incidentes que complementa o conjunto de guias de apoio a CSIRTs e trata da gestão de incidentes de segurança de rede e de informação com ênfase no tratamento do incidente ([enisa.europa.eu](https://www.enisa.europa.eu/publications/good-practice-guide-for-incident-management), acessado em 2026-09-25). Ele é útil por um motivo específico: descreve a função de tratamento como papel com tarefas definidas, o que é exatamente o que falta em playbooks escritos como lista de comandos.

O SP 800-184 trata de planejamento, desenvolvimento de playbook, teste e melhoria do planejamento de recuperação, e oferece métricas informativas para acompanhar esses itens ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/184/final), acessado em 2026-09-25). Isso fecha o desenho: playbook não é documento de leitura, é objeto de teste com métrica.

### 5.2 Como funciona

Um playbook executável tem seis campos. Cada campo existe para eliminar uma pergunta durante o incidente.

| Campo | O que responde | Formato utilizável |
|---|---|---|
| Gatilho | O que faz este playbook entrar em vigor | Condição observável, ligada a alerta ou a relato, com limiar |
| Severidade | Quanto esforço este caso recebe | Matriz de duas dimensões: impacto no serviço e exposição de dado |
| Primeiras ações | O que fazer nos primeiros 30 minutos | Lista numerada, com o responsável por cada item |
| Alçada | Quem pode agir em produção sem autorização superior | Nome de papel, valor de impacto permitido, duração máxima |
| Preservação | O que capturar antes de mexer | Artefato, quem captura, onde guarda, hash |
| Comunicação | Quem avisa quem, e a partir de qual severidade | Rota de escalonamento com horário e destinatário |

Duas convenções evitam a maior parte do atrito. A primeira é o papel de plantão com nome de função, nunca nome de pessoa: quem está de plantão responde pela execução, e o playbook é escrito para essa função. A segunda é a ação pré-autorizada: a lista de ações que o plantão executa sem perguntar, com o limite declarado — por exemplo, isolar host de estação de trabalho por até 8 horas sem aprovação; isolar servidor de banco de dados apenas com aprovação do dono do serviço.

O programa de exercícios roda em ciclos. O SP 800-84 descreve o desenho, o desenvolvimento, a condução e a avaliação do evento; a avaliação produz lacunas, e cada lacuna recebe dono e prazo. Na prática, três formatos escalam o custo: discussão de mesa com o caso impresso e sem ferramenta; exercício funcional em que o time executa o playbook em ambiente de teste; e exercício integrado que inclui fornecedor, jurídico e comunicação. Comece pelo de mesa, com 90 minutos e quatro participantes, e só avance quando as lacunas do anterior estiverem fechadas.

O que faz o programa sobreviver é a inclusão do fornecedor. Se a empresa tem retainer de resposta, forense externo ou serviço gerenciado, o exercício precisa testar o acionamento real do contrato: número de telefone que funciona fora do horário, prazo de chegada, quem assina o aceite e qual é o limite de escopo sem nova aprovação. Contrato de resposta nunca usado é contrato não testado.

Um detalhe de interface evita conflito de expectativa com a área ofensiva. O exercício de resposta é um evento autorizado, com escopo, data e alçada escritos, do mesmo tipo de autorização que um exercício adversarial exige; a diferença está no objetivo, que aqui é validar procedimento e ali é encontrar caminho de ataque.

### 5.3 Exemplo resolvido

Playbook de conta privilegiada comprometida em uma empresa com 1.200 funcionários, identidade em nuvem e três administradores de domínio.

1. Gatilho. Login bem-sucedido de conta administrativa a partir de país onde a empresa não opera, ou criação de nova conta com papel privilegiado fora da janela de mudança aprovada. Os dois são observáveis em log de identidade.

2. Severidade. Alta por definição, porque uma conta com papel privilegiado pode alterar controle de acesso, e a recuperação exige reconstrução de confiança, não apenas troca de senha.

| Dimensão | Nível alto | Nível médio | Nível baixo |
|---|---|---|---|
| Exposição de dado | Acesso a dado pessoal ou financeiro | Acesso a dado interno | Nenhum acesso a dado |
| Impacto no serviço | Conta com papel de administração | Conta de serviço com privilégio limitado | Conta de usuário comum |

3. Primeiras ações, em ordem, com dono.

| Ordem | Ação | Dono | Prazo máximo |
|---|---|---|---|
| 1 | Revogar sessões ativas e tokens da conta | Plantão de identidade | 15 min |
| 2 | Preservar log de autenticação e de auditoria da conta na janela de 30 dias | Plantão de resposta | 30 min |
| 3 | Identificar todos os recursos tocados pela conta na janela | Plantão de resposta | 2 h |
| 4 | Rotacionar credenciais e chaves que a conta podia ler | Dono do cofre de segredos | 4 h |
| 5 | Acionar comunicação nível 2 e o encarregado se houver dado pessoal no escopo | Gerente de plantão | 2 h |

4. Alçada. O plantão revoga sessão e desabilita conta sem aprovação, em qualquer horário. A remoção de papel privilegiado de outra conta exige aprovação do dono do serviço. A rotação de chave de criptografia de disco exige aprovação do encarregado de segurança, porque a perda da chave gera indisponibilidade.

5. Preservação. Antes de desabilitar a conta, exportar o log de autenticação, a lista de recursos acessados e o inventário de chaves legíveis pela conta; cada artefato com hash e registro de custódia, conforme o [TEMA-04](TEMA-04-forense-digital-evidencia-cadeia-de-custodia.md).

6. Comunicação. Severidade alta aciona o gerente de plantão em 15 minutos e o comitê de crise em 2 horas, seguindo o que o [TEMA-06](TEMA-06-comunicacao-de-crise-notificacao-regulatoria.md) define para público e prazo.

Exercício que valida o playbook, com o resultado anotado:

| Passo do exercício | Resultado observado | Lacuna | Dono | Prazo |
|---|---|---|---|---|
| Acionar o plantão fora do horário pelo canal do playbook | 40 minutos até o primeiro contato | Canal de plantão era o telefone pessoal de um analista | Gerente de segurança | 15 dias |
| Revogar sessões em 15 minutos | Executado em 9 minutos | Nenhuma | — | — |
| Identificar recursos tocados em 2 horas | Não concluído: ferramenta não cobre armazenamento de objetos | Falta de log de acesso no armazenamento | Arquiteto de nuvem | 60 dias |
| Acionar comunicação nível 2 | Somente após 4 horas, porque ninguém sabia quem decidia | Falta de critério de acionamento por severidade | CISO | 30 dias |

O exercício custou 90 minutos de quatro pessoas e produziu três itens de plano com dono e prazo. Esse é o produto que o SP 800-84 chama de avaliação do evento.

### 5.4 Problema de completar

Caso novo: a empresa depende de um provedor de e-mail em nuvem e de um provedor de identidade. O time precisa escrever o playbook de comprometimento de conta de e-mail de executivo, com dados de clientes na caixa de entrada.

Preencha a matriz e feche as quatro últimas linhas.

1. Gatilho observável, com limiar: __________
2. Severidade, pelas duas dimensões: __________
3. Ações pré-autorizadas do plantão, com limite de tempo: __________
4. Artefatos preservados, com quem captura e onde guarda: __________
5. Rota de comunicação, com destinatário e prazo por severidade: __________
6. Contato do fornecedor que precisa ser testado no exercício, e o que o contrato permite sem nova aprovação: __________

## 6. Por que isso importa para o CISO

Playbook é o documento que permite ao CISO delegar resposta sem perder controle. Sem ele, toda decisão relevante sobe para o CISO em qualquer hora, o que torna o plantão decorativo e transforma o gestor no gargalo do próprio processo. Com a alçada escrita, o CISO decide uma vez, no tempo normal, o que pode ser feito em produção, e não durante a madrugada.

O segundo efeito é orçamentário. A lacuna levantada no exercício é o item de verba com melhor argumento que existe: foi verificada por exercício, tem dono, tem prazo e tem consequência descrita. É esse material que entra no pedido do ciclo seguinte, seguindo a lógica de priorização do [TEMA-03 de 17 Liderança do CISO](../17-lideranca-ciso/TEMA-03-orcamento-e-priorizacao.md).

O terceiro efeito é contratual. Contrato de resposta gerenciada, forense externo ou seguro cibernético precisa ser exercitado; cláusula que nunca foi acionada é declaração de intenção.

## 7. Aplicação prática

Escolha o tipo de incidente mais provável do seu ambiente, olhando os últimos seis meses de alertas. Escreva o playbook em duas páginas, com os seis campos da seção 5.2, e leve para um exercício de mesa de 90 minutos com quatro participantes: alguém do plantão, alguém do jurídico, alguém de comunicação e o dono do serviço mais exposto.

No exercício, ninguém executa nada em ferramenta. O facilitador narra a situação em três incrementos de tempo e pergunta a cada passo: quem faz o quê agora. Registre cada hesitação como lacuna e feche com dono e prazo. Se o exercício terminar sem lacuna, o caso estava fácil demais.

## 8. Autoexplicação

Explique o tema em três frases, sem consultar o texto. Uma sobre a diferença entre plano de resposta e playbook; uma sobre o que faz um playbook ser executável às 3h da manhã; e uma sobre o que o exercício entrega que o documento não entrega.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Playbook longo é playbook completo | Documento de 40 páginas não é lido sob pressão | Duas páginas com gatilho, alçada e primeiras ações |
| Playbook cita nomes de pessoas | Pessoas saem de férias, mudam de cargo e de empresa | Papéis com nome de função, e lista nominal só na rota de escalonamento, com data de revisão |
| O plano de resposta já cobre todos os casos | Plano define governança; o playbook define o que fazer por tipo de incidente | Um plano e vários playbooks, um por tipo relevante no seu ambiente |
| Exercício serve para treinar o time técnico | O time técnico é a parte que menos hesita; a lacuna mora na interface com jurídico, comunicação e dono do serviço | Inclua as outras áreas no exercício de mesa |
| Exercício sem lacuna está bom | Lacuna zero indica caso fácil ou facilitador complacente | Suba a dificuldade e inclua indisponibilidade de ferramenta |
| O contrato de resposta cobre o que a empresa precisa | Contrato não exercitado tem prazo, escopo e limite de aprovação desconhecidos | Teste o acionamento real no exercício e ajuste a cláusula |
| Preparação é documento, não atividade | O ciclo de desenho, condução e avaliação do SP 800-84 existe para medir a capacidade | Trate preparação como programa com calendário e métrica |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são os seis campos de um playbook executável e qual pergunta cada um elimina?
2. O que o SP 800-84 declara sobre o escopo dos eventos que descreve, e quais são as quatro etapas do ciclo do evento?
3. Por que a ação pré-autorizada é o item mais importante da alçada em um playbook de contenção?
4. O que a ISO/IEC 27035-1:2023 coloca antes da detecção no processo de gestão de incidentes?
5. Que parte do contrato com fornecedor de resposta precisa ser testada em exercício, e por quê?

<details>
<summary>Conferir respostas</summary>

1. Gatilho, o que ativa o playbook; severidade, quanto esforço o caso recebe; primeiras ações, o que fazer nos primeiros 30 minutos e quem faz; alçada, quem pode agir em produção sem autorização superior e com qual limite; preservação, o que capturar antes de mexer; comunicação, quem avisa quem e a partir de qual severidade.
2. Descreve o desenho, o desenvolvimento, a condução e a avaliação de eventos para uma única organização, e não eventos de larga escala que envolvem várias organizações; os eventos treinam pessoas, exercitam planos de TI e testam sistemas.
3. Porque sem uma lista de ações que dispensam aprovação, toda contenção fora do horário comercial espera alguém com alçada responder, e o intervalo é tempo de operação do adversário.
4. Preparar-se para incidentes, antes de detectar e de responder.
5. O acionamento real: telefone que atende fora do horário, prazo de chegada, quem assina o aceite e o limite de escopo sem nova aprovação. Sem testar, a empresa não sabe qual serviço comprou de fato.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever o playbook do tipo de incidente mais provável do seu ambiente | Rebaixar: repetir em D+3 |
| D+30 | Conduzir o exercício de mesa e fechar as lacunas com dono e prazo | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 17-lideranca-ciso#TEMA-03 | a lacuna apontada no exercício só sai do papel quando entra no pedido de verba do ciclo seguinte |
| complementa | 10-operacoes-soc#TEMA-01 | o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos |
| complementa | 11-resposta-forense#TEMA-05 | o exercício de mesa só vale se o plano de continuidade declarar antes o RTO e o RPO que o time deve tentar cumprir |
| complementa | 13-ofensiva-pentest#TEMA-02 | o mesmo escopo autorizado que limita o exercício adversarial limita o exercício de mesa: quem pode ser afetado, com qual finalidade e até onde |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CHFI | Aquisição de evidência e cadeia de custódia previstas no playbook | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| GCFA | Análise forense de host e preparação do time | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |

Leitura recomendada: [NIST SP 800-84, desenho, condução e avaliação de exercícios](https://csrc.nist.gov/pubs/sp/800/84/final); [NIST SP 800-184, playbook de recuperação, teste e melhoria](https://csrc.nist.gov/pubs/sp/800/184/final); [ENISA Good Practice Guide for Incident Management](https://www.enisa.europa.eu/publications/good-practice-guide-for-incident-management); [ISO/IEC 27035-1:2023](https://www.iso.org/standard/78973.html).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-84 | primaria | https://csrc.nist.gov/pubs/sp/800/84/final | "2026-09-25" | alta |
| 2 | ISO/IEC 27035-1:2023 | primaria | https://www.iso.org/standard/78973.html | "2026-09-25" | alta |
| 3 | NIST SP 800-184 | primaria | https://csrc.nist.gov/pubs/sp/800/184/final | "2026-09-25" | alta |
| 4 | ENISA Good Practice Guide for Incident Management | primaria | https://www.enisa.europa.eu/publications/good-practice-guide-for-incident-management | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a data de publicação do guia da ENISA está confirmada como 20 de dezembro de 2010, mas o conteúdo interno do PDF não foi lido neste tema; a tipologia de exercício usada na seção 5.2 é prática corrente de mercado, e nenhuma das fontes citadas aqui enumera os três formatos apresentados. Os domínios de exame de CHFI e GCFA não foram conferidos.

---

| Navegação | |
|---|---|
| Área | [11 Resposta a incidentes, forense e resiliência](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md) |
| Próximo tema | [TEMA-03](TEMA-03-contencao-erradicacao-recuperacao.md) |
| Home | [README](../README.md) |
