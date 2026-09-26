---
tema: "Programa de conscientização que funciona"
tema_id: "TEMA-03"
area_id: "15-fatores-humanos"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Montar um programa de aprendizagem de 12 meses com ciclo de vida declarado, público segmentado por decisão a acertar, canal, cadência e evidência de comportamento, distinguindo o que é conscientização para todos, treinamento por papel e educação aprofundada"
atende_objetivo: [2, 3]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-02"
      motivo: "o texto da norma vira rotina quando o programa de aprendizagem o traduz para a decisão que cada público toma no dia de trabalho"
    - alvo: "04-identidade-acesso#TEMA-03"
      motivo: "o prazo de retirada de acesso no desligamento depende de gestor e de Recursos Humanos agirem, e os dois são público nomeado do programa"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-50 Rev. 1 — Building a Cybersecurity and Privacy Learning Program, setembro de 2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-50 — Building an Information Technology Security Awareness and Training Program, outubro de 2003, retirada em 12/09/2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA, NSA, FBI e MS-ISAC — Phishing Guidance: Stopping the Attack Cycle at Phase One, outubro de 2023"
    url: "https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC — Awareness, Training, and Education, índice de publicações"
    url: "https://csrc.nist.gov/Projects/Awareness-Training-Education/publications"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "ENISA — Emerging technologies make it easier to phish, comunicado de 26/09/2023"
    url: "https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Programa de conscientização que funciona

Uma ideia central: conscientização é um processo com ciclo de vida, e o resultado que ela precisa entregar é mudança de comportamento ligada à gestão de risco — não a entrega anual de um curso.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir montar um programa de aprendizagem de 12 meses que declare o ciclo de vida, segmente o público pela decisão que cada grupo precisa acertar, escolha canal e cadência, e defina a evidência que mostrará se o comportamento mudou — separando o que é conscientização para todos, treinamento por papel e educação aprofundada.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-por-que-pessoas-sao-exploradas.md), para saber qual decisão o programa treina. O [TEMA-06](./TEMA-06-medir-comportamento-nao-cliques.md) fecha a escolha de indicador; este tema define o programa e deixa a medição declarada como parte dele.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Você aposta que concluir o módulo obrigatório mudou algum comportamento observável na sua organização? Sim, não ou não sei.
   Confiança: ___
2. Quantos públicos diferentes recebem hoje exatamente o mesmo conteúdo de segurança na sua empresa? Chute um número.
   Confiança: ___
3. Quem revisa o material do programa hoje: segurança, recursos humanos ou ninguém? Aposte antes de conferir.
   Confiança: ___
## 4. Caso real

A NIST publicou em setembro de 2024 a SP 800-50 Rev. 1, *Building a Cybersecurity and Privacy Learning Program*, que substitui duas publicações: a SP 800-50 de 01/10/2003 e a SP 800-16 de 01/04/1998. O resumo oficial declara que a publicação fornece orientação para desenvolver e gerir uma abordagem de ciclo de vida na construção de um programa de aprendizagem em segurança cibernética e privacidade, que pode ser implementada como parte de um processo de toda a organização, e que gerencia programas de conscientização, treinamento e educação para públicos diversos. O mesmo resumo afirma que "The program should encourage behavior change as part of risk management and lead to developing a privacy and security culture in the organization", e que a orientação inclui métricas sugeridas e métodos de avaliação para melhorar e atualizar o programa conforme as necessidades mudam
(https://csrc.nist.gov/pubs/sp/800/50/r1/final, acessado em 25/09/2026).

A edição de 2003, agora retirada, identificava quatro etapas no ciclo de vida do programa: desenho, desenvolvimento do material, implementação e pós-implementação
(https://csrc.nist.gov/pubs/sp/800/50/final, acessado em 25/09/2026).

A pergunta que o caso deixa aberta: se a NIST escreveu duas vezes, com 21 anos de intervalo, que o programa precisa produzir mudança de comportamento e avaliação, por que a maioria dos programas internos continua sendo medida pela taxa de conclusão de um curso?

## 5. Conteúdo

### 5.1 Conceito

A NIST trata conscientização e treinamento como programa, com ciclo de vida e avaliação, desde a edição de 2003 — que trabalha o nível estratégico de como construir o programa, enquanto a SP 800-16, de 1998, desce ao nível tático do treinamento baseado em papel. A origem disso é legal: o índice do CSRC registra que a Lei Pública 100-235, o *Computer Security Act of 1987*, obrigou a NIST e o OPM a produzir diretrizes de conscientização e treinamento em segurança de computadores "based on functional organizational roles" (https://csrc.nist.gov/Projects/Awareness-Training-Education/publications, acessado em 25/09/2026).

A edição de 2024 muda duas coisas de vocabulário que afetam o desenho. A primeira é o escopo: o programa passa a se chamar programa de aprendizagem em segurança cibernética **e privacidade**, o que coloca o conteúdo de dado pessoal dentro do mesmo programa em vez de tratá-lo como campanha separada. A segunda é o resultado declarado: mudança de comportamento como parte da gestão de risco, com cultura de segurança e de privacidade como desfecho, e com métricas e métodos de avaliação embutidos.

O público é o eixo de segmentação, e o resumo da publicação separa três níveis. Conscientização alcança todos, e trata do que qualquer pessoa precisa reconhecer e reportar. Treinamento por papel alcança quem tem responsabilidade específica, e trata da decisão que aquela função executa: quem aprova pagamento, quem concede acesso, quem opera produção. Educação aprofundada alcança quem precisa de competência técnica continuada, como o time de segurança e os administradores de plataforma.

A consequência prática de segmentar por decisão, e não por cargo, é que o currículo fica verificável. Um público definido como "todos os colaboradores" produz um material genérico que ninguém consegue avaliar. Um público definido como "quem altera cadastro de fornecedor no sistema de compras" produz material com uma decisão dentro, e essa decisão pode ser observada depois.

### 5.2 Como funciona

O ciclo de vida tem quatro etapas, e cada uma entrega um artefato.

O desenho entrega a matriz de públicos com a decisão que cada um precisa acertar, os objetivos de aprendizagem e o inventário de fonte de dado que vai evidenciar o comportamento. Desenho sem inventário de evidência gera programa que só se mede por presença.

O desenvolvimento entrega o material por público, com o cenário retirado do ambiente da organização. A ENISA usa o argumento de que explicar como a engenharia social funciona na prática cria consciência das armadilhas possíveis, o que favorece cenário concreto em vez de advertência genérica
(https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish, acessado em 25/09/2026).

A implementação entrega o calendário, os canais e os gatilhos. Há três gatilhos que a experiência de programa costuma exigir e que valem estar escritos: entrada de pessoa nova, mudança de sistema ou de processo, e incidente real que envolveu decisão humana. O guia do CISA recomenda treinamento de usuário em engenharia social e *phishing* como meta de linha de base, com educação regular sobre como identificar itens suspeitos, não interagir com eles e reportar.

A pós-implementação entrega a avaliação. O guia do CISA, ao tratar de organizações com recursos limitados, recomenda um programa padrão de treinamento antiphishing, revisão anual do material pelos empregados e, ao final, uma verificação de treinamento que certifique que o empregado reteve o conteúdo. A verificação de retenção é diferente de presença: ela testa o que ficou, não o que foi assistido.

O ciclo fecha quando a avaliação alimenta o desenho seguinte. Sem esse retorno, o programa repete o mesmo material no ano seguinte e a única coisa que muda é a data no certificado.

### 5.3 Exemplo resolvido

Situação: 400 pessoas, três sites, um analista de segurança, nenhum sistema de gestão de aprendizagem contratado.

Passo 1. Defina os públicos pela decisão, não pelo cargo.

| Público | Decisão que precisa acertar | Nível |
|---|---|---|
| Todos | Reconhecer pedido fora do padrão e reportar em vez de agir | Conscientização |
| Compras e contas a pagar | Validar alteração de dado bancário por segundo canal | Treinamento por papel |
| Suporte, administradores e desenvolvimento | Não usar privilégio para atender pedido de terceiro e registrar exceção | Treinamento por papel |
| Time de segurança | Analisar a tentativa reportada e retroalimentar a regra | Educação |

Passo 2. Escreva o artefato do desenho. Para cada linha, uma frase de objetivo observável e a fonte de dado disponível hoje. Se não houver fonte de dado, marque a linha como não mensurável em vez de inventar indicador.

Passo 3. Escolha canal e cadência por público. Mensagem curta e recorrente para todos; encontro de 30 minutos com cenário real para os públicos de papel; sessão técnica e leitura dirigida para o time de segurança. Cadência trimestral para todos, semestral para papel, contínua para segurança.

Passo 4. Escreva os gatilhos. Pessoa nova entra no primeiro mês; sistema novo entra com material próprio; incidente que envolveu decisão humana gera material novo em até 60 dias.

Passo 5. Defina a verificação de retenção ao final de cada ciclo, no formato que o guia do CISA descreve para organizações com recursos limitados, e não como prova de presença.

Passo 6. Agende a pós-implementação. Uma revisão trimestral do material, com registro de quem revisou, do que mudou e de qual incidente motivou a mudança.

Passo 7. Declare o que fica fora. Neste caso, sem sistema de gestão de aprendizagem, o registro de conclusão por pessoa pode ser uma planilha alimentada pelo próprio encontro; a ausência de plataforma não impede o programa, mas impede a certificação automática de conclusão.

### 5.4 Problema de completar

Situação: a organização foi alvo de fraude de fornecedor no trimestre passado e a diretoria pede "um treinamento de segurança para todos". Complete as últimas etapas.

1. Público que precisa de treinamento por papel, e a decisão de cada um: _______
2. Conteúdo que a conscientização para todos deve mudar, em uma frase: _______
3. Canal e cadência escolhidos, com justificativa: _______
4. Evidência de comportamento a ser observada nos 6 meses seguintes: _______
5. Verificação de retenção ao final do ciclo: _______
6. Quem revisa o material e em que data: _______

## 6. Por que isso importa para o CISO

Duas frases governam a conversa de verba sobre conscientização. A primeira é a declaração da NIST de que o programa deve incentivar mudança de comportamento como parte da gestão de risco. A segunda é a lista de públicos por papel, que vem da obrigação legal de 1987 e reaparece em 2024 com o escopo ampliado para privacidade. Juntas, elas tiram o assunto do campo da comunicação institucional e o colocam no campo da gestão de risco, que é onde o orçamento é decidido.

O efeito prático é a substituição de uma métrica de atividade por um compromisso com comportamento. Um programa medido por taxa de conclusão informa quantas pessoas assistiram. Um programa com público segmentado por decisão informa se quem altera dado bancário passou a confirmar por segundo canal, o que é uma afirmação sobre risco e não sobre audiência.

O programa também é o instrumento que dá executabilidade às normas internas. A norma de segurança da informação só sai do documento quando o programa traduz o texto para a decisão do dia de trabalho de quem executa — e isso o liga diretamente à política e à norma descritas em [02 Governança, risco e compliance](../02-governanca-risco-compliance/README.md). O mesmo vale para o ciclo de vida de identidade: o prazo de retirada de acesso no desligamento depende de gestor e de Recursos Humanos agirem no momento certo, e não de o sistema saber que a pessoa saiu.

Por fim, o escopo de privacidade dentro do mesmo programa evita duplicidade de campanha. Nomear um único programa de aprendizagem para segurança e privacidade reduz a competição interna por atenção e mantém um só calendário.

## 7. Aplicação prática

Escreva a matriz de públicos do seu ambiente com três colunas: público, decisão a acertar, fonte de dado que evidencia a decisão. Comece pela lista de quem tem autoridade para mover dinheiro, conceder acesso, alterar produção e atender chamado de terceiro. Quem aparecer nas quatro listas pertence ao público de treinamento por papel.

Depois escolha uma decisão e teste o material atual contra ela: peça a uma pessoa do público que explique, em duas frases, o que ela faz quando recebe o pedido. Se a resposta não descrever o procedimento, o material descreve um princípio e não uma decisão.

## 8. Autoexplicação

Explique em três frases a diferença entre conscientização, treinamento por papel e educação, e diga a qual dos três pertence o conteúdo que sua organização entrega hoje para a maior parte das pessoas. A resposta indica se existe segmentação ou apenas um curso único.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Programa é o curso anual obrigatório" | A NIST descreve ciclo de vida com pós-implementação e avaliação, e não um evento | Declare as quatro etapas do ciclo e o retorno da avaliação para o desenho |
| "Conteúdo único atende todos" | A origem legal das diretrizes é o treinamento baseado em papéis organizacionais | Segmente pelo menos em conscientização, papel e educação |
| "100% de conclusão prova eficácia" | Conclusão mede presença | Verifique retenção e observe a decisão no dado operacional |
| "Segurança e privacidade são campanhas separadas" | A publicação de 2024 trata o programa como de segurança cibernética e privacidade | Um programa, um calendário, dois conteúdos |
| "Depois de um incidente, basta reforçar o mesmo material" | O incidente aponta uma decisão específica que o material não cobriu | Gere material novo a partir do caso real, com prazo declarado |
| "Sem plataforma não há programa" | A publicação trata de organizações de portes diferentes e de quem está começando do zero | Registre com o meio disponível e não prometa certificação automática |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as quatro etapas do ciclo de vida descritas na edição de 2003 da NIST SP 800-50, e qual seção cobre cada uma?
2. O que a NIST SP 800-50 Rev. 1 declara sobre o desfecho esperado do programa?
3. Quais publicações a SP 800-50 Rev. 1 substitui, e o que cada uma cobria?
4. Qual obrigação legal de 1987 está na origem das diretrizes de conscientização e treinamento, e qual característica ela impôs?
5. O que o guia do CISA recomenda como verificação ao final de um programa de treinamento antiphishing?
6. Qual é a diferença entre medir conclusão e verificar retenção?

<details>
<summary>Conferir respostas</summary>

1. Desenho do programa de conscientização e treinamento, seção 3; desenvolvimento do material, seção 4; implementação do programa, seção 5; pós-implementação, seção 6.
2. Que o programa deve incentivar mudança de comportamento como parte da gestão de risco e levar ao desenvolvimento de uma cultura de segurança e de privacidade na organização, com métricas sugeridas e métodos de avaliação para melhoria e atualização contínuas.
3. A SP 800-50 de outubro de 2003, que trabalhava o nível estratégico de construção do programa, e a SP 800-16 de abril de 1998, que descrevia o treinamento baseado em papel, no nível tático.
4. O *Computer Security Act of 1987*, Lei Pública 100-235, que obrigou a NIST e o OPM a criar diretrizes baseadas em papéis organizacionais funcionais.
5. Uma verificação de treinamento que certifique que o empregado reteve o conteúdo do programa, ao final do ciclo de revisão anual do material.
6. Conclusão registra que a pessoa passou pelo conteúdo. Retenção verifica o que permaneceu depois, e é a única das duas que pode ser ligada a uma decisão futura.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever a matriz de públicos do seu ambiente com as três colunas | Rebaixar: repetir em D+3 |
| D+30 | Rodar a verificação de retenção com um público de papel e comparar com o dado operacional | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-02 | o texto da norma vira rotina quando o programa de aprendizagem o traduz para a decisão que cada público toma no dia de trabalho |
| aplicado_em | 04-identidade-acesso#TEMA-03 | o prazo de retirada de acesso no desligamento depende de gestor e de Recursos Humanos agirem, e os dois são público nomeado do programa |

## 13. Certificações e leitura recomendada

Leitura recomendada: a SP 800-50 Rev. 1 é a referência principal e substitui a edição de 2003, que segue útil apenas como registro histórico do ciclo de quatro etapas. O resumo oficial da edição de 2024 já traz o desfecho declarado do programa e a existência de métricas e métodos de avaliação.
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-50 Rev. 1, *Building a Cybersecurity and Privacy Learning Program*, setembro de 2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/r1/final | "2026-09-25" | alta |
| 2 | NIST SP 800-50, outubro de 2003, retirada em 12/09/2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/final | "2026-09-25" | alta |
| 3 | CISA, NSA, FBI e MS-ISAC, *Phishing Guidance: Stopping the Attack Cycle at Phase One*, outubro de 2023 | primaria | https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf | "2026-09-25" | alta |
| 4 | NIST CSRC, *Awareness, Training, and Education*, índice de publicações | primaria | https://csrc.nist.gov/Projects/Awareness-Training-Education/publications | "2026-09-25" | media |
| 5 | ENISA, *Emerging technologies make it easier to phish*, 26/09/2023 | primaria | https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish | "2026-09-25" | media |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Carga horária anual recomendada de treinamento por pessoa: Não confirmado; nenhum número desse tipo foi lido em fonte primária nesta execução. Frequência recomendada de simulação de *phishing*: Não confirmado; o guia recomenda revisão anual do material e não fixa cadência de simulação. Percentual de retenção esperado na verificação de treinamento: Não confirmado; nenhuma meta numérica foi lida. Numeração e redação dos controles da família *Awareness and Training* do NIST SP 800-53 Rev. 5: O nome da família aparece na página oficial da NIST SP 800-50; a numeração não foi conferida no catálogo primário.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-engenharia-social-e-phishing.md) |
| Próximo tema | [TEMA-04](TEMA-04-cultura-de-seguranca-e-lideranca.md) |
| Home | [README](../README.md) |
