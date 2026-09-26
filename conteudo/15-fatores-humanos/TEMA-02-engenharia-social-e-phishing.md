---
tema: "Engenharia social e phishing"
tema_id: "TEMA-02"
area_id: "15-fatores-humanos"
nivel: base
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Classificar uma tentativa real de engenharia social pelo canal e pelo objetivo, e apontar para ela o controle de camada de e-mail, de autenticação, de endpoint e de privilégio que aumenta o custo do ataque"
atende_objetivo: [1, 2]
certificacoes: []
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "05-rede-infraestrutura#TEMA-05"
      motivo: "o filtro de e-mail, DNS e web corta o alcance do clique que o programa de conscientização tenta evitar, e os dois olham o mesmo evento por lados diferentes"
  aprofundado_por: []
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-03"
      motivo: "a mensagem que já convenceu alguém só vira detecção se a regra aceitar como sinal um acesso autorizado fora do padrão da conta"
  nao_confundir_com: []
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
  - titulo: "NIST SP 800-50 Rev. 1 — Building a Cybersecurity and Privacy Learning Program, setembro de 2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Engenharia social e phishing

Uma ideia central: o canal e o objetivo definem a defesa. Mensagem por e-mail que rouba credencial e mensagem por chat que entrega *malware* chegam ao mesmo lugar por caminhos diferentes, e cada caminho tem um controle próprio que precisa existir antes da mensagem chegar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir classificar uma tentativa real de engenharia social pelo canal usado e pelo objetivo pretendido, e apontar para ela os controles de camada de e-mail, de autenticação, de endpoint e de privilégio que aumentam o custo daquele ataque — com a meta de desempenho correspondente quando ela existir.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-por-que-pessoas-sao-exploradas.md): sem entender que o ataque usa uma autorização existente, a lista de controles daqui parece uma coleção de medidas soltas.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual política de DMARC está publicada no domínio da sua organização hoje: `none`, `quarantine` ou `reject`? Aposte antes de conferir.
   Confiança: ___
2. Se um usuário digita a senha e o código de seis dígitos em uma página falsa, você acha que algum controle da sua empresa impede o acesso? Sim, não ou em parte.
   Confiança: ___
3. Quantas mensagens de *phishing* você aposta que chegaram na última semana por chat corporativo, e não por e-mail? Chute um número.
   Confiança: ___
## 4. Caso real

O guia conjunto do CISA, NSA, FBI e MS-ISAC lista três caminhos usados para obter credencial. O atacante se passa por supervisor, colega de confiança ou pessoa de TI; usa celular e SMS, além de chats em Slack, Teams, Signal, WhatsApp e Facebook Messenger; e usa VoIP para falsificar a identificação de chamada, aproveitando a confiança depositada no telefone. O documento observa que a interface reduzida desses aplicativos de mensagem torna difícil para a pessoa avaliar um endereço malicioso na tela do celular
(https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf, acessado em 25/09/2026).

O mesmo guia descreve o segundo uso do *phishing*: levar a pessoa a abrir anexo com macro ou a seguir link que baixa executável, o que permite ao atacante interromper sistemas, escalar privilégio e manter persistência.

A pergunta que o caso deixa aberta: se a organização só treina e filtra e-mail, quantos dos caminhos descritos acima ficam sem controle?

## 5. Conteúdo

### 5.1 Conceito

Engenharia social é a tentativa de enganar alguém para revelar informação ou praticar uma ação que possa comprometer sistemas e redes. *Phishing* é a forma que usa uma isca — tipicamente mensagem — para levar a vítima a um site malicioso ou a entregar credencial. A ENISA registra que *phishing* se tornou o vetor inicial mais comum e que, por consequência, engenharia social é o tipo de ataque mais popular para obter acesso a uma organização
(https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish, acessado em 25/09/2026).

O guia do CISA organiza os ataques em duas famílias, e essa divisão é a espinha dorsal do tema. Na primeira, o objetivo é credencial de acesso. Na segunda, o objetivo é execução de código no equipamento da vítima. A defesa de cada família usa camadas diferentes: a primeira depende do tipo de MFA e do tratamento de sessão; a segunda depende do que o sistema operacional permite executar.

Uma terceira dimensão é o canal. O guia nomeia e-mail, SMS, aplicativos de mensagem em celular e chamada telefônica com identificação falsificada. Vale registrar o que o documento diz sobre ambientes híbridos: com menos interação presencial e mais troca virtual, a pessoa fica mais exposta a abordagem desenhada para as plataformas que ela usa com frequência.

### 5.2 Como funciona

O ciclo de um ataque de credencial tem cinco passos. O atacante escolhe a fonte de confiança, escolhe o canal, escreve a isca, recebe a credencial digitada em página que imita o portal verdadeiro e usa a credencial no portal verdadeiro para obter acesso e código de segundo fator.

É no quarto passo que o guia do CISA localiza a fraqueza das formas comuns de segundo fator. Sem FIDO ou PKI, o atacante que já tem usuário e senha "may authenticate with the compromised user's credentials" no portal legítimo, porque o portal verdadeiro aceita o fator digitado. Sem *number matching*, o atacante dispara vários pedidos de aprovação até a vítima aceitar, por engano ou por incômodo. Com SMS ou voz, o atacante pode convencer a operadora a transferir o número e receber o código. O documento manda priorizar MFA resistente a *phishing* em contas de administrador e de usuário privilegiado, o que o próprio texto justifica: são as contas com acesso amplo a dado de cliente ou financeiro.

O ciclo de um ataque de execução também tem cinco passos: a isca leva a link ou anexo, o arquivo baixa, o usuário autoriza ou o sistema executa, o código roda com os direitos do usuário e o atacante se instala. Os controles que o guia recomenda para essa família interrompem passos diferentes: lista de bloqueio no *gateway* de e-mail e regras de *firewall* impedem a entrega, extensões de risco bloqueadas impedem o download, *allowlist* de aplicação e bloqueio de macro por padrão impedem a execução, isolamento remoto de navegação contém o que já rodou.

Existem dois controles de camada de e-mail que merecem entendimento separado. DMARC, junto com SPF e DKIM, verifica o servidor que enviou a mensagem recebida contra regras publicadas; se a mensagem falha na verificação, o domínio é considerado falsificado e o sistema de correio coloca a mensagem em quarentena e reporta. Quando a política é `reject`, o guia diz que mensagens falsificadas são recusadas no servidor antes da entrega, o que protege terceiros que receberiam mensagem em nome do seu domínio. O segundo controle é a monitoração de correio e mensagens internas, que o guia considera essencial porque a pessoa pode ser enganada por origem interna ou sem conhecimento do time de segurança.

Há ainda um controle que aparece no guia com um efeito indireto na engenharia social. A autenticação única, *single sign on*, concentra o acesso e reduz a chance de a pessoa ser convencida a entregar credencial, além de deixar trilha de auditoria que o time de TI pode examinar de forma proativa ou retroativa depois de um incidente suspeito.

### 5.3 Exemplo resolvido

Situação: uma mensagem chega ao financeiro, com nome e foto de um diretor, pedindo confirmação de dados bancários por link para formulário interno.

Passo 1. Identifique o canal. Não foi e-mail; foi mensagem em aplicativo corporativo. Todo controle centrado apenas no *gateway* de correio não vê este caso.

Passo 2. Identifique o objetivo. É captura de dado, com possível captura de credencial no formulário. Entra na família de obtenção de credencial e de informação.

Passo 3. Trace o caminho de autenticação. Se o formulário imita o portal interno e a organização usa MFA sem FIDO ou PKI, o atacante consegue se autenticar no portal verdadeiro com o que a vítima digitar.

Passo 4. Liste o que deveria ter existido antes da mensagem chegar, seguindo o guia.

| Etapa do ataque | Controle recomendado no guia | Meta citada | Área deste roadmap |
|---|---|---|---|
| Remetente falsifica domínio | DMARC em `reject` para envio e recebimento, com SPF e DKIM | CPG 2.M | [05 Rede e infraestrutura](../05-rede-infraestrutura/TEMA-05-dns-email-web.md) |
| Mensagem circula internamente sem ser notada | Monitoração de correio e mensagens internas, com linha de base de tráfego normal | — | [05 Rede e infraestrutura](../05-rede-infraestrutura/TEMA-05-dns-email-web.md) |
| Vítima digita credencial | MFA por FIDO ou PKI; se não for possível, *number matching* no *push* | CPG 2.H | [04 Identidade, acesso e zero trust](../04-identidade-acesso/README.md) |
| Conta de administrador é alvo | Prioridade de MFA resistente a *phishing* para conta privilegiada e administrativa | — | [04 Identidade, acesso e zero trust](../04-identidade-acesso/README.md) |
| Link baixa arquivo | Extensões de risco bloqueadas e *allowlist* de aplicação | CPG 2.Q | [06 Endpoint e plataforma](../06-endpoint-plataforma/README.md) |
| Usuário executa o arquivo | Bloqueio de macro por padrão e isolamento remoto de navegação | CPG 2.N | [06 Endpoint e plataforma](../06-endpoint-plataforma/README.md) |
| Execução escalada por conta com privilégio | Menor privilégio e restrição de direito administrativo no *workstation* | CPG 2.E | [04 Identidade, acesso e zero trust](../04-identidade-acesso/README.md) |
| Ninguém avisa a segurança | Treinamento que ensina a reconhecer e a reportar, com canal definido | CPG 2.I | Este tema e o [TEMA-03](./TEMA-03-programa-de-conscientizacao.md) |
| Tentativa de login bloqueada passa em branco | Revisão de bloqueio e alerta de MFA, com acompanhamento de login negado | CPG 2.G | [10 Operações de segurança e SOC](../10-operacoes-soc/README.md) |

Passo 5. Escolha o que fazer nesta semana. O item que não depende de compra e fecha o maior buraco é o canal de reporte com resposta registrada: sem ele, nenhuma das outras camadas fica sabendo que a tentativa existiu.

### 5.4 Problema de completar

Situação: o mesmo diretor recebe, por SMS, um link para "assinatura de contrato" que abre uma página que pede usuário, senha e o código de seis dígitos. A organização usa *push* de MFA sem *number matching*. Complete as três últimas etapas.

1. Canal e objetivo: _______
2. Por que o segundo fator atual não impede o acesso: _______
3. Controle de autenticação que resolve, na ordem do guia: _______
4. Controle de endpoint que reduz o dano se a página também baixar arquivo: _______
5. Registro que precisa existir para o time de segurança saber que isso aconteceu: _______

## 6. Por que isso importa para o CISO

A decisão central deste tema é onde o MFA para de proteger. O guia conjunto é explícito: MFA por *push* sem *number matching* permite insistência até o aceite, e MFA por SMS ou voz é vulnerável a transferência de número. Se a organização protege a conta de administrador desse jeito, a conscientização está sendo usada para cobrir uma decisão técnica pendente.

A segunda decisão é sobre o canal. Uma organização que treina apenas e-mail e mede apenas cliques em e-mail não tem visibilidade das abordagens por aplicativo de mensagem e por telefone, que o guia descreve como parte do repertório atual. Isso muda o escopo do programa e muda também a fonte de telemetria que a operação precisa coletar.

A terceira decisão aparece no orçamento. DMARC em `reject`, *allowlist* de aplicação, bloqueio de macro por padrão e isolamento remoto de navegação são itens que competem entre si por verba. O guia indica priorizar, para contas privilegiadas, o MFA resistente a *phishing*; e indica que as mitigações de camada de e-mail vêm antes das de endpoint, porque evitam que a mensagem chegue.

## 7. Aplicação prática

Peça ao time de e-mail a política DMARC publicada e a configuração de SPF e DKIM. Verifique se o domínio de envio está em `reject` e se existe destinatário definido para os relatórios agregados de DMARC. Depois peça ao time de identidade a lista das contas administrativas e o tipo de MFA de cada uma.

Com as duas listas em mãos, monte uma tabela de três colunas: conta ou domínio, controle atual e o que o guia recomenda. Leve a tabela para a próxima reunião de risco. A pergunta a fazer não é quanto custa a ferramenta; é qual dessas linhas a organização aceita deixar como está.

## 8. Autoexplicação

Explique em três frases por que uma política DMARC em `reject` e um MFA resistente a *phishing* protegem coisas diferentes. Se a explicação não distinguir o domínio do usuário, releia a seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "*Phishing* é problema de e-mail" | O guia nomeia SMS, aplicativos de mensagem e VoIP com identificação falsificada | Cubra no programa e na coleta de log os canais que a organização usa |
| "O filtro de e-mail resolve" | Ele não vê mensagem originada dentro da organização nem tráfego em aplicativo de mensagem | Some a filtragem a monitoração de correio e mensagens internas |
| "Basta habilitar MFA" | Sem FIDO ou PKI o atacante com credencial autentica no portal verdadeiro; sem *number matching* ele insiste no *push* | Trate tipo de MFA como decisão por classe de conta |
| "Bloquear domínio malicioso encerra o problema" | Listas de bloqueio são úteis e não conhecem o domínio criado hoje | Priorize padrão de comportamento e restrinja o que pode executar |
| "Anunciar a simulação educa" | Anúncio muda o indicador, não necessariamente a decisão | Defina o que se mede antes de escolher se a simulação é anunciada |
| "Treinar uma vez por ano basta" | A recomendação do guia para pequenas e médias empresas é revisão anual do material e verificação de retenção ao final do programa | Combine revisão anual com verificação de retenção e canal de reporte ativo |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são os dois propósitos principais do *phishing* segundo o guia conjunto, e quais controles param cada um?
2. Por que o guia considera a monitoração de correio e mensagens internas essencial?
3. O que DMARC verifica, junto com SPF e DKIM, e qual é o efeito prático da política `reject`?
4. Quais são os quatro tipos de segundo fator ou implementação de MFA que o guia descreve como insuficientes, e por quê?
5. Como a autenticação única participa da defesa contra engenharia social, segundo o guia?
6. Qual é o primeiro controle a implantar quando não há orçamento novo, e por que ele é o primeiro?

<details>
<summary>Conferir respostas</summary>

1. Obter credencial, para acesso inicial, e executar *malware* para atividade subsequente. Contra o primeiro valem MFA resistente a *phishing* e controle de sessão e de login negado; contra o segundo valem bloqueio de extensão de risco, *allowlist* de aplicação, bloqueio de macro por padrão e isolamento remoto de navegação.
2. Porque a pessoa pode ser enganada por origem interna ou sem que o time de segurança saiba, e o equilíbrio de tráfego interno permite notar desvio em relação à linha de base.
3. Verifica o servidor que enviou a mensagem recebida contra regras publicadas do domínio. Com `reject`, a mensagem falsificada é recusada no servidor antes da entrega, o que impede terceiros de receberem mensagem em nome do domínio da organização.
4. MFA sem FIDO ou PKI, que permite a autenticação no portal legítimo com credencial comprometida; *push* sem *number matching*, que permite insistir até o aceite; SMS ou voz, vulneráveis a transferência de número; e a combinação em que a página falsa coleta senha e código e o atacante usa os dois no portal verdadeiro.
5. Concentra o acesso e reduz a chance de a pessoa ser convencida a entregar credencial, além de produzir trilha de auditoria que pode ser examinada de forma proativa ou retroativa após suspeita ou confirmação de incidente.
6. O canal de reporte com resposta registrada. Sem ele nenhuma camada fica sabendo que a tentativa existiu, e não há dado para decidir o próximo investimento.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Conferir a política DMARC do domínio e o tipo de MFA de cinco contas administrativas | Rebaixar: repetir em D+3 |
| D+30 | Fazer uma tentativa de reporte interna e cronometrar o caminho completo até o registro | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 10-operacoes-soc#TEMA-03 | a mensagem que já convenceu alguém só vira detecção se a regra aceitar como sinal um acesso autorizado fora do padrão da conta |
| complementa | 05-rede-infraestrutura#TEMA-05 | o filtro de e-mail, DNS e web corta o alcance do clique que o programa de conscientização tenta evitar, e os dois olham o mesmo evento por lados diferentes |

## 13. Certificações e leitura recomendada

Leitura recomendada: as seções *Phishing to Obtain Login Credentials*, *Malware-Based Phishing*, *Mitigations*, *Incident Response* e *Reporting* do guia conjunto. As seções de resposta e de reporte são a ponte para o [TEMA-06](./TEMA-06-medir-comportamento-nao-cliques.md).
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA, NSA, FBI e MS-ISAC, *Phishing Guidance: Stopping the Attack Cycle at Phase One*, outubro de 2023 | primaria | https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf | "2026-09-25" | alta |
| 2 | ENISA, *Emerging technologies make it easier to phish*, 26/09/2023 | primaria | https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish | "2026-09-25" | alta |
| 3 | NIST SP 800-50 Rev. 1, setembro de 2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/r1/final | "2026-09-25" | alta |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Taxa de sucesso de campanhas de *phishing* contra organizações: Não confirmado; nenhuma estatística desse tipo foi lida em fonte primária nesta execução. Percentual de mensagens maliciosas que chega por canal que não seja e-mail: Não confirmado; o guia descreve os canais, sem distribuição. Tempo de vida médio de domínio malicioso: Não confirmado; citado no guia apenas como prazo curto de validade de indicador atômico, sem número.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-por-que-pessoas-sao-exploradas.md) |
| Próximo tema | [TEMA-03](TEMA-03-programa-de-conscientizacao.md) |
| Home | [README](../README.md) |
