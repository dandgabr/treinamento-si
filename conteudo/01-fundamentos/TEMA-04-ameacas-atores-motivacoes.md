---
tema: "Ameaças, atores e motivações"
tema_id: "TEMA-04"
area_id: "01-fundamentos"
nivel: base
tempo_estimado: "25-35 min"
objetivo_aprendizagem: "Descrever o perfil de ameaça de um serviço em produção, nomeando atores, motivação e capacidade, e apontando qual decisão de controle muda em função do perfil"
atende_objetivo: [3, 4]
certificacoes: ["Security+", "CISSP"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "01-fundamentos#TEMA-05"
      motivo: "a ameaça precisa de uma falha explorável para produzir impacto; sem o par, a lista de ameaças fica decorativa"
  aprofundado_por: []
  aplicado_em:
    - alvo: "12-vulnerabilidades-threat-intel#TEMA-03"
      motivo: "saber quem ataca determina qual inteligência vale pagar"
  nao_confundir_com: []
fontes:
  - titulo: "NIST CSRC Glossary — threat"
    url: "https://csrc.nist.gov/glossary/term/threat"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — risk"
    url: "https://csrc.nist.gov/glossary/term/risk"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — vulnerability"
    url: "https://csrc.nist.gov/glossary/term/vulnerability"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Ameaças, atores e motivações

A lista de ameaças de uma empresa raramente é um problema de informação: quase sempre é um problema de granularidade. "Ciberataque" e "falha humana" não são ameaças, são caixas vazias que impedem qualquer decisão de controle.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: descrever o perfil de ameaça de um serviço em produção, nomeando atores, motivação e capacidade estimada, e apontando qual decisão de controle mudaria em função desse perfil.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-seguranca-informacao-cibernetica-privacidade.md), pela distinção entre os escopos. Ameaça é o primeiro insumo do risco, tratado no [TEMA-06](TEMA-06-risco-probabilidade-impacto.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Palpite: no seu setor, o ator mais provável é oportunista ou direcionado? Escreva em qual aposta você colocaria dinheiro.
   Confiança: ___
2. Chute: motivação e capacidade técnica sobem juntas? Diga quando você viu essa regra falhar.
   Confiança: ___
3. Antes de ler: o que derruba mais controle interno na sua empresa — ameaça externa ou alguém com acesso legítimo? Anote.
   Confiança: ___

## 4. Caso real

Uma operadora de saúde de porte médio sofre um sequestro de dados na sexta-feira à noite. O atacante criptografa os servidores de agendamento e cobra resgate em criptomoeda. A operadora não paga. Restaura o backup de quinta-feira e volta a operar na segunda-feira à tarde, com perda de agendamentos feitos entre quinta e sexta.

A diretoria trata o caso como "ataque criminoso genérico" e pede mais firewall. Ninguém pergunta o que mudaria se o atacante fosse um ex-funcionário demitido, ou um grupo que atua por ideologia, ou um cliente insatisfeito. A pergunta que o caso deixa aberta: com que atributo do ator se decide entre investir em prevenção e investir em detecção?

## 5. Conteúdo

### 5.1 Conceito

Ameaça, no glossário do NIST: "Any circumstance or event with the potential to adversely impact organizational operations (including mission, functions, image, or reputation), organizational assets, or individuals through an information system via unauthorized access, destruction, disclosure, modification of information, and/or denial of service". A mesma entrada acrescenta uma segunda leitura, comum em análise de risco: "the potential for a threat-source to successfully exploit a particular information system vulnerability".

Três elementos aparecem nessa definição e merecem ser separados na sua planilha de riscos. A fonte de ameaça é quem ou o que pode causar o evento. O evento de ameaça é o que acontece: exfiltração, criptografia de dados, queda de energia, erro de digitação em produção. O impacto é a consequência no objetivo de negócio. Lista que mistura os três não permite comparar nada.

Fonte de ameaça não é sinônimo de criminoso. A definição fala de "circumstance or event", e o próprio texto cobre impacto à imagem e às pessoas. Funcionário que erra a instrução, fornecedor que desliga um serviço, falha de disco e interrupção elétrica entram na análise no mesmo nível de importância que um grupo organizado.

A publicação de referência para avaliação de risco, o NIST SP 800-30 Rev. 1, aparece citada pelo glossário como fonte dos verbetes de risco, ameaça e vulnerabilidade. A classificação interna dessa publicação em tipos de fonte de ameaça não foi conferida nesta execução: NAO CONFIRMADO em fonte oficial. O modelo abaixo é o de trabalho do mercado, e deve ser validado contra a publicação antes de entrar em política.

### 5.2 Como funciona

Perfilar ameaça é estimar quatro variáveis por ator. Motivação responde por que ele agiria. Capacidade responde com que meios ele já conta. Oportunidade responde a que acesso ele alcança hoje. Persistência responde por quanto tempo ele insiste. Sem as quatro, a conversa vira adjetivo.

| Grupo de fonte | Motivação típica | Onde a capacidade costuma aparecer | O que muda no controle |
|---|---|---|---|
| Crime organizado | retorno financeiro | compra de acesso pronto, uso de ferramenta pronta | detecção cedo e recuperação rápida superam bloqueio isolado |
| Insider com acesso legítimo | vingança, dívida, coerção | credencial válida e conhecimento do processo | revisão de privilégio e trilha de auditoria por identidade |
| Ativista | visibilidade pública | exploração de superfície exposta e vazamento de dados | proteção de imagem, monitoramento de exposição, plano de comunicação |
| Ator estatal | informação estratégica | paciência e acesso à cadeia de fornecedores | gestão de terceiros e segmentação, não apenas patch |
| Erro e falha operacional | nenhuma, é acidente | mudança mal testada, script executado no ambiente errado | separação de ambiente e capacidade de reverter |

O ritmo de trabalho de cada grupo determina onde o controle rende mais. Um ator que compra acesso pronto escolhe o alvo pelo retorno esperado e pela fraqueza visível: nesse caso, bloqueio de entrada tem efeito decrescente e detecção rápida passa a valer mais. Um insider não precisa entrar, ele já está dentro, e o único controle que muda o resultado é a limitação de alcance da credencial dele.

Ameaça sem vulnerabilidade não gera incidente, e é por isso que o par ameaça e vulnerabilidade é indivisível. Um atacante com motivação e capacidade contra um sistema sem falha alcançável produz tentativa frustrada, que é um evento de segurança e não um incidente. O [TEMA-05](TEMA-05-vulnerabilidades-superficie-de-ataque.md) trata do outro lado do par.

### 5.3 Exemplo resolvido

Uma seguradora quer perfilar a ameaça do portal de sinistros, que expõe dados de clientes e paga reembolso por transferência.

Passo 1, inventário de atores plausíveis. Cliente insatisfeito com reembolso negado, quadrilha especializada em fraude de sinistro, ex-funcionário do time de sinistros, ativista de causa contra seguradora, criminoso oportunista que compra acesso em massa, fornecedor de software do portal.

Passo 2, motivação e retorno esperado. Fraude de sinistro busca dinheiro direto e é a única que transforma o portal em receita: nesse caso o incentivo é o maior da lista. Ativista busca visibilidade, e vazamento de dados de clientes rende manchete. Oportunista busca qualquer alvo com baixo custo de entrada.

Passo 3, capacidade. Quadrilha de fraude tem conhecimento do processo de negócio e capacidade média de técnica. Ator estatal tem capacidade alta e nenhum motivo neste serviço. Ex-funcionário tem acesso, conhecimento e janela de tempo curta antes da desativação.

Passo 4, decisão de controle. Contra fraude de sinistro, o controle que muda o resultado é detecção de padrão de pagamento e confirmação de identidade do beneficiário, mais trilha de auditoria por analista. Contra ex-funcionário, é desativação imediata com revisão de privilégio remanescente. Contra oportunista, é fechar a superfície não usada. As três ameaças geram três compras diferentes a partir do mesmo portal.

### 5.4 Problema de completar

Caso novo: uma universidade privada guarda dados de alunos e notas em um sistema acadêmico acessado por 600 professores e por uma empresa de tecnologia contratada para manter o sistema.

Preencha o perfil e feche as duas últimas etapas.

| Ator | Motivação | Capacidade | Oportunidade | Controle que muda o resultado |
|---|---|---|---|---|
| Aluno inadimplente | __________ | __________ | __________ | __________ |
| Professor com acesso a notas | __________ | __________ | __________ | __________ |
| Funcionário do fornecedor de software | __________ | __________ | __________ | __________ |
| Ativista estudantil | __________ | __________ | __________ | __________ |

1. Qual ator exige trilha de auditoria nominal e por quê? __________
2. Qual ator exige controle contratual, e qual cláusula precisaria existir? __________

## 6. Por que isso importa para o CISO

Perfil de ameaça é o argumento que transforma verba de segurança em decisão de negócio. O mesmo orçamento compra bloqueio de entrada ou detecção de comportamento anômalo, e a escolha depende de quem se está enfrentando. Um CISO que não consegue nomear o ator mais provável para o serviço mais exposto da empresa compra o controle que o fornecedor vende melhor.

Existe um uso defensivo imediato. Quando um diretor pergunta por que um sistema interno com dados de 200 pessoas recebe o mesmo rigor de um sistema com 2 milhões de clientes, a resposta correta é o perfil de ator: quem tem incentivo para atacar cada um, com que capacidade, alcançando o quê.

## 7. Aplicação prática

Escolha o serviço mais exposto da sua empresa e monte a tabela do passo 1 da seção 5.3: cinco atores plausíveis, sem inventar apelido de grupo criminoso nem citar notícia. Para cada um, duas linhas de justificativa sobre motivação e uma sobre o acesso que ele já alcança hoje.

Termine com uma decisão: qual dos cinco teria sucesso hoje, com o controle que existe? A resposta costuma revelar que a defesa está calibrada para o ator errado.

## 8. Autoexplicação

Explique em três frases a diferença entre fonte de ameaça, evento de ameaça e impacto, sem consultar o texto. Depois aplique a distinção ao último incidente da sua empresa: qual parte foi fonte, qual foi evento e qual foi impacto?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Ciberataque" é uma ameaça | Não nomeia fonte, nem evento, nem impacto | Escreva o ator, o evento e a consequência |
| Erro humano não é ameaça | A definição fala de circunstância ou evento com potencial de impacto adverso | Erro operacional entra na análise como fonte de ameaça |
| Ameaça e vulnerabilidade são a mesma coisa | Uma precisa da outra e nenhuma substitui a outra | Ameaça é o que pode causar; vulnerabilidade é a fraqueza explorável |
| Ator externo é sempre o risco principal | Ator com acesso legítimo dispensa entrada e supera muitos controles | Avalie o insider com o mesmo rigor |
| Mais firewall resolve qualquer ator | O controle muda com a motivação e o acesso do ator | Escolha o controle depois de perfilar o ator |
| Perfil de ameaça é trabalho de inteligência de ameaça dedicado | Um perfil inicial se faz com o conhecimento do time de negócio | Comece com cinco atores plausíveis e revise a cada incidente |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Diferencie fonte de ameaça, evento de ameaça e impacto, com um exemplo próprio.
2. Um ator com motivação financeira alta e capacidade técnica baixa muda o seu plano de controle? Como?
3. Por que ameaça insider não se resolve apenas com tecnologia?
4. Que atributo do ator você precisa estimar para decidir entre investir em detecção e investir em prevenção?

<details>
<summary>Conferir respostas</summary>

1. Fonte de ameaça é quem ou o que pode causar o evento; evento é o que acontece; impacto é a consequência no objetivo de negócio. Exemplo: ex-funcionário do financeiro, transferência não autorizada, quebra de confiança do cliente.
2. Sim. Capacidade baixa tende a significar uso de ferramenta pronta e alvo escolhido por fraqueza visível, o que desloca a prioridade para fechar superfície exposta e detectar uso anômalo de credencial em vez de investir em defesa contra ameaça sofisticada.
3. Porque o insider usa acesso concedido por processo, não por falha técnica. O ajuste passa por revisão periódica de privilégio, segregação de função, trilha de auditoria por identidade e processo disciplinar.
4. A capacidade e a persistência. Ator paciente e capaz exige detecção e resposta; ator oportunista exige redução de superfície e higiene de configuração.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Reescrever a definição de ameaça do NIST de memória | Rebaixar: repetir em D+1 |
| D+7 | Perfilar a ameaça de outro serviço da empresa | Rebaixar: repetir em D+3 |
| D+30 | Revisar o perfil com um incidente que ocorreu no período | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 12-vulnerabilidades-threat-intel#TEMA-03 | saber quem ataca determina qual inteligência vale pagar |
| complementa | 01-fundamentos#TEMA-05 | a ameaça precisa de uma falha explorável para produzir impacto; sem o par, a lista de ameaças fica decorativa |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| Security+ | Fundamentos de segurança | CompTIA Security+ SY0-701 Exam Objectives | primaria | https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf |
| CISSP | Cobertura geral do tema | ISC2 CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSRC Glossary — threat | primaria | https://csrc.nist.gov/glossary/term/threat | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — risk | primaria | https://csrc.nist.gov/glossary/term/risk | "2026-09-25" | alta |
| 3 | NIST CSRC Glossary — vulnerability | primaria | https://csrc.nist.gov/glossary/term/vulnerability | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [01 Fundamentos de segurança da informação](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-ativos-classificacao-ciclo-de-vida.md) |
| Próximo tema | [TEMA-05](TEMA-05-vulnerabilidades-superficie-de-ataque.md) |
| Home | [README](../README.md) |
