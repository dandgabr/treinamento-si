---
tema: "O fator humano: por que pessoas são exploradas"
tema_id: "TEMA-01"
area_id: "15-fatores-humanos"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Explicar por que uma decisão legítima é mais barata de explorar do que uma falha técnica, nomeando o mecanismo de influência, a autorização usada pelo atacante e o controle que aumentaria o custo do ataque em um caso real do próprio ambiente"
atende_objetivo: [1]
certificacoes: []
pre_requisitos: []
relacoes:
  complementa:
    - alvo: "16-ia-seguranca#TEMA-01"
      motivo: "risco de IA chega à pessoa pelo canal que ela já usa, e sem a leitura do fator humano o controle de uso de IA vira bloqueio de ferramenta"
  aprofundado_por: []
  aplicado_em:
    - alvo: "13-ofensiva-pentest#TEMA-04"
      motivo: "o exercício adversarial é onde a exploração do humano é medida com resultado observável, e não presumida"
  nao_confundir_com:
    - alvo: "15-fatores-humanos#TEMA-05"
      motivo: "erro humano derruba controle sem intenção; risco interno usa autorização existente para desviar ativo, e a resposta de cada caso é diferente"
fontes:
  - titulo: "CISA, NSA, FBI e MS-ISAC — Phishing Guidance: Stopping the Attack Cycle at Phase One, outubro de 2023"
    url: "https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA — Emerging technologies make it easier to phish, comunicado de 26/09/2023"
    url: "https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-50 — Building an Information Technology Security Awareness and Training Program, outubro de 2003, retirada em 12/09/2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC — Awareness, Training, and Education, índice de publicações"
    url: "https://csrc.nist.gov/Projects/Awareness-Training-Education/publications"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management, abril de 2025"
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

# O fator humano: por que pessoas são exploradas

Uma ideia central: o atacante que explora uma pessoa não quebra autorização nenhuma — ele convence quem já tem autorização a agir em favor dele, e isso torna a decisão humana o caminho mais barato da rede.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir explicar, para um caso real do seu ambiente, por que uma decisão legítima é mais barata de explorar que uma falha técnica, nomeando o mecanismo de influência usado, a autorização que o atacante tomou emprestada e o controle que aumentaria o custo daquele ataque específico.

## 2. Pré-requisitos

Nada. O tema usa o vocabulário de ameaça, vulnerabilidade e risco de [01 Fundamentos](../01-fundamentos/README.md#4-temas), que pode ser consultado conforme a necessidade.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. A sua conta de administrador: o segundo fator dela sobrevive a um atacante que já tem a senha e o código de seis dígitos? Aposte sim, não ou não sei.
   Confiança: ___
2. Se alguém com acesso legítimo executar a ação que o atacante pediu, você acha que o log distingue esse acesso de um acesso normal? Aposte.
   Confiança: ___
3. Que fração das decisões diárias da sua empresa depende de alguém abrir um anexo, seguir um link ou aprovar uma transferência? Chute um percentual.
   Confiança: ___
## 4. Caso real

O guia conjunto do CISA, NSA, FBI e MS-ISAC descreve como atores maliciosos obtêm credencial: eles se passam por supervisores, colegas de confiança ou pessoa de TI, e enviam mensagens direcionadas. O mesmo documento registra que os atacantes usam celular e SMS, além de chats em plataformas como Slack, Teams, Signal, WhatsApp e Facebook Messenger, e que o VoIP permite falsificar a identificação de chamada, aproveitando a confiança que existe no telefone
(https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf, acessado em 25/09/2026).

O guia faz uma observação específica sobre trabalho híbrido: em ambientes com poucas interações presenciais e trocas virtuais frequentes, o usuário fica mais exposto a técnicas de engenharia social desenhadas para as plataformas que ele usa todos os dias.

A pergunta que o caso deixa aberta: a mensagem pediu uma informação, ou pediu uma ação? A diferença define o controle que deveria estar no caminho.

## 5. Conteúdo

### 5.1 Conceito

Engenharia social é, na definição do guia do CISA, a tentativa de enganar alguém para revelar informação, como uma senha, ou para praticar uma ação que possa ser usada para comprometer sistemas e redes. *Phishing* é uma forma de engenharia social em que o atacante atrai a vítima, tipicamente por e-mail, para um site malicioso ou a convence a fornecer credencial de acesso.

A ENISA registra no seu comunicado de 26/09/2023 que *phishing* se tornou o vetor inicial mais comum, "meaning social engineering is the most popular attack type to gain access to an organisation". A mesma nota define engenharia social como alguém sendo manipulado a praticar ações ou a entregar informação sensível ou pessoal, e reproduz a avaliação do diretor executivo da agência de que um dos elos mais fracos em segurança cibernética são os humanos.

O guia do CISA separa dois propósitos do *phishing*, e a separação importa porque a defesa é diferente em cada caso. No primeiro, o atacante quer credencial para obter acesso inicial à rede. No segundo, quer executar código para atividade subsequente, que o documento descreve como interromper ou danificar sistemas, escalar privilégio de usuário e manter persistência nos sistemas comprometidos.

Há uma data que mostra que este assunto é objeto de política, e não de campanha de bom comportamento. O índice de publicações do CSRC registra que a Lei Pública 100-235, o *Computer Security Act of 1987*, obrigou a NIST e o OPM a produzir diretrizes de conscientização e treinamento em segurança de computadores baseadas em papéis organizacionais funcionais; o resultado foi a NIST SP 800-16, *Information Technology Security Training Requirements: A Role- and Performance-Based Model* (https://csrc.nist.gov/Projects/Awareness-Training-Education/publications, acessado em 25/09/2026).

### 5.2 Como funciona

O mecanismo tem quatro partes. A primeira é uma fonte de confiança: um nome, um cargo, um número de telefone que aparece na tela como conhecido. A segunda é o canal, escolhido conforme o que a vítima usa. A terceira é o pedido, que costuma ser pequeno e caber na rotina. A quarta é a ação, que a vítima pratica com a autorização que já possui.

Essa quarta parte é o que distingue a exploração humana. Explorar uma falha técnica exige que a falha exista no momento do ataque, o que depende de versão de software, configuração e janela de exposição. Explorar uma pessoa exige apenas que exista uma decisão a ser tomada — e decisões existem todos os dias, em toda empresa, sem manutenção corretiva.

A autenticação não resolve sozinha, e o guia do CISA diz onde. Formas de MFA sem FIDO ou PKI continuam suscetíveis a atacante que já tem credencial legítima comprometida, porque ele se autentica no portal verdadeiro como se fosse o usuário. *Push* de MFA sem *number matching* permite ao atacante disparar pedidos repetidos até a vítima aceitar por engano ou por incômodo, e o texto cita o caso de MFA por SMS ou voz, no qual o atacante convence a operadora a transferir o número.

A consequência para quem investiga é contraintuitiva. Se a ação foi praticada com credencial válida, no portal correto, o registro do sistema mostra um acesso legítimo. A primeira fonte de log diz que a pessoa entrou; ela não diz que a pessoa entregou a credencial a terceiro. A NIST SP 800-61 Rev. 3 trata recomendações de resposta a incidente distribuídas pelas atividades de gestão de risco descritas no CSF 2.0, justamente porque a decisão de investigar começa antes de o incidente existir
(https://csrc.nist.gov/pubs/sp/800/61/r3/final, acessado em 25/09/2026).

### 5.3 Exemplo resolvido

Situação: três relatos chegam ao mesmo tempo, e você precisa decidir onde investir o mês da equipe.

Passo 1. Descreva cada relato sem adjetivo e sem culpa.

- Relato A: analista de contas a pagar recebe ligação de número que consta na lista de fornecedores e é instruída a alterar dados bancários de uma nota fiscal.
- Relato B: pessoa de vendas recebe mensagem no aplicativo de mensagens da empresa, de um contato com foto e nome de conhecido, com um link para "documento compartilhado".
- Relato C: analista de suporte recebe e-mail do "gestor" pedindo captura de tela da tela de administração do sistema de folha.

Passo 2. Nomeie o mecanismo de influência de cada caso. Em A é autoridade combinada com contexto já esperado — a lista de fornecedores. Em B é relação social mais curiosidade. Em C é autoridade hierárquica mais urgência implícita.

Passo 3. Nomeie a autorização tomada de empréstimo. Em A é o direito de alterar cadastro de pagamento. Em B é o direito de abrir documento compartilhado dentro do domínio. Em C é o direito de ver a tela administrativa.

Passo 4. Nomeie o controle que aumenta o custo do ataque. Em A, confirmação por segundo canal com lista fechada de aprovadores e prazo de espera para primeira alteração de conta bancária. Em B, isolamento remoto de navegação e verificação de vínculo por catálogo corporativo de identidade, em vez de por foto de contato. Em C, menor privilégio na conta de suporte e registro de toda captura de tela de tela administrativa.

Passo 5. Anote o que o log vai mostrar depois. Na hipótese de sucesso, os três casos aparecem como ação autorizada. Se a única evidência disponível for o log de sucesso, a investigação termina antes de começar.

Passo 6. Decida a ordem. O relato A move dinheiro, o C alcança dado de folha e o B entrega execução dentro da rede. O critério de ordem é o dano máximo em caso de sucesso, não a frequência com que o relato chegou.

### 5.4 Problema de completar

Situação: uma equipe de engenharia recebe mensagem em que o "fornecedor de nuvem" informa que o certificado do ambiente expira em duas horas e pede que alguém faça login no painel do provedor pelo link da mensagem. Complete as duas últimas etapas.

1. Mecanismo de influência: _______
2. Autorização tomada de empréstimo: _______
3. Controle que aumenta o custo do ataque: _______
4. O que o log mostrará em caso de sucesso: _______
5. Métrica que indica se esse tipo de tentativa está sendo contida: _______

## 6. Por que isso importa para o CISO

Uma pergunta de comitê comum é se vale gastar em conscientização ou em ferramenta. A resposta exige olhar os dois lados do mesmo ataque. O guia do CISA alinha treinamento de usuário em engenharia social e *phishing* à meta `CPG 2.I`, DMARC em `reject` à meta `CPG 2.M` e MFA por FIDO ou PKI à meta `CPG 2.H`, no mesmo conjunto de metas de desempenho do CISA e da NIST. A recomendação é que a organização faça os três, e que priorize MFA resistente a *phishing* para contas de administrador e de usuário privilegiado.

Isso dá ao CISO um critério de decisão que não depende de opinião: se a organização usa MFA por SMS em contas administrativas, o investimento em conscientização chega depois de um controle que já foi contornado por desenho. Inverter a ordem — treinar primeiro, trocar o MFA depois — deixa a organização exposta durante todo o período do treinamento.

A segunda consequência é sobre atribuição. Um incidente praticado com credencial válida não tem autor identificado pelo log de autenticação, e a resposta a incidente precisa de outra fonte: correlação de acesso fora do padrão, registro de reporte interno e a própria declaração da pessoa que foi enganada. A NIST SP 800-61 Rev. 3 posiciona resposta a incidente dentro das atividades de gestão de risco descritas no CSF 2.0, o que significa que essa capacidade é decidida no orçamento e não no susto.

## 7. Aplicação prática

Reúna as cinco últimas mensagens suspeitas que colegas enviaram ao canal de segurança e monte uma tabela com quatro colunas: quem recebeu, o que o remetente aparentava ser, qual decisão era pedida e qual autorização seria usada. Não avalie se a pessoa acertou. O objetivo é contar quantas decisões diferentes foram atacadas; o resultado costuma ser maior que o número de controles que a organização tem no caminho dessas decisões.

Depois escolha a autorização que aparece com mais frequência e responda: qual controle mudaria o custo daquele pedido específico, e quem precisa aprovar a mudança.

## 8. Autoexplicação

Explique em três frases por que um ataque que usa credencial válida é mais difícil de investigar do que um ataque que explora falha de software, sem consultar o texto. Se a explicação não mencionar que o registro da ação autorizada parece legítimo, releia a seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "O usuário é o elo mais fraco" | A frase atribui culpa a quem operou dentro da autorização que recebeu, e encerra a análise antes de chegar ao controle ausente | Descreva a decisão atacada e o controle que faltou no caminho |
| "Treinamento resolve *phishing*" | O próprio guia do CISA diz que credencial comprometida continua autenticando quando o MFA não é resistente a *phishing* | Trate treinamento e MFA resistente a *phishing* como metas distintas e obrigatórias |
| "Um percentual conhecido de incidentes vem de erro humano" | Não há estatística desse tipo confirmada em fonte primária nesta execução | Use a lista de decisões atacadas no seu ambiente, que você consegue levantar |
| "*Phishing* é um problema de e-mail" | O guia descreve SMS, chats em plataformas colaborativas e falsificação de chamada por VoIP | Cubra no programa os canais que a organização efetivamente usa |
| "Trabalho híbrido não muda a exposição" | O guia registra que menos interação presencial aumenta a chance de a vítima ser enganada por abordagem ajustada às plataformas que ela usa | Ajuste canal e conteúdo do programa ao modelo de trabalho real |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a diferença entre engenharia social e *phishing*, na definição do guia conjunto do CISA?
2. Quais são os dois propósitos principais do *phishing* descritos no guia, e o que muda na defesa entre eles?
3. Por que a autenticação por MFA baseada em SMS ou em *push* sem *number matching* não contém o ataque que já tem a senha?
4. O que a ENISA afirma sobre a posição do *phishing* entre os vetores de acesso, e em que documento a agência registra isso?
5. Qual lei dos Estados Unidos exigiu diretrizes de conscientização e treinamento baseadas em papéis organizacionais, e qual publicação da NIST resultou dela?

<details>
<summary>Conferir respostas</summary>

1. Engenharia social é a tentativa de enganar alguém para revelar informação ou praticar uma ação que comprometa sistemas e redes. *Phishing* é uma forma de engenharia social em que o atacante atrai a vítima, tipicamente por e-mail, para site malicioso ou a convence a fornecer credencial de acesso.
2. Obter credencial, para acesso inicial à rede, e executar *malware*, para interromper ou danificar sistemas, escalar privilégio e manter persistência. A defesa muda: contra credencial valem MFA resistente a *phishing* e controle de sessão; contra execução valem *allowlist* de aplicação, bloqueio de macro e isolamento de navegação.
3. Porque o atacante usa a credencial no portal legítimo e se apresenta como o usuário. Sem FIDO ou PKI, o segundo fator não exige a posse de um dispositivo vinculado ao site verdadeiro, e o *push* sem *number matching* permite insistir até a vítima aceitar.
4. A ENISA afirma que *phishing* se tornou o vetor inicial mais comum, o que faz da engenharia social o tipo de ataque mais popular para obter acesso a uma organização. O registro está no comunicado *Emerging technologies make it easier to phish*, de 26/09/2023, que apresenta a campanha do Mês Europeu da Cibersegurança.
5. O *Computer Security Act of 1987*, Lei Pública 100-235, que obrigou a NIST e o OPM a produzir diretrizes de conscientização e treinamento baseadas em papéis organizacionais funcionais. Dela resultou a NIST SP 800-16, com modelo baseado em papel e desempenho.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Classificar cinco mensagens suspeitas reais nas quatro colunas da seção 7 | Rebaixar: repetir em D+3 |
| D+30 | Apresentar ao time a autorização mais atacada e propor um controle para ela | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 13-ofensiva-pentest#TEMA-04 | o exercício adversarial é onde a exploração do humano é medida com resultado observável, e não presumida |
| complementa | 16-ia-seguranca#TEMA-01 | risco de IA chega à pessoa pelo canal que ela já usa, e sem a leitura do fator humano o controle de uso de IA vira bloqueio de ferramenta |
| nao_confundir_com | 15-fatores-humanos#TEMA-05 | erro humano derruba controle sem intenção; risco interno usa autorização existente para desviar ativo, e a resposta de cada caso é diferente |

## 13. Certificações e leitura recomendada

Leitura recomendada: as seções *Overview*, *Phishing to Obtain Login Credentials* e *Mitigations* do guia conjunto; e a página do CSRC sobre o índice de publicações de conscientização e treinamento, para a origem normativa do assunto.
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA, NSA, FBI e MS-ISAC, *Phishing Guidance: Stopping the Attack Cycle at Phase One*, outubro de 2023 | primaria | https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf | "2026-09-25" | alta |
| 2 | ENISA, *Emerging technologies make it easier to phish*, 26/09/2023 | primaria | https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish | "2026-09-25" | alta |
| 3 | NIST SP 800-50, outubro de 2003, retirada em 12/09/2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/final | "2026-09-25" | alta |
| 4 | NIST CSRC, *Awareness, Training, and Education*, índice de publicações | primaria | https://csrc.nist.gov/Projects/Awareness-Training-Education/publications | "2026-09-25" | media |
| 5 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Percentual de incidentes causado por erro ou por decisão humana: Não confirmado; nenhuma estatística desse tipo foi lida em fonte primária nesta execução. Tempo médio entre recebimento de mensagem de *phishing* e reporte interno: Não confirmado; depende de dados da própria organização. Efetividade comparada entre treinamento e MFA resistente a *phishing* na redução de comprometimento: Não confirmado por medição; a recomendação do guia é implementar os dois, e não escolher um.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-engenharia-social-e-phishing.md) |
| Home | [README](../README.md) |
