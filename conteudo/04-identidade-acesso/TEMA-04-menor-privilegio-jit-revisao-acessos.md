---
tema: "Menor privilégio, acesso just-in-time e revisão de acessos"
tema_id: "TEMA-04"
area_id: "04-identidade-acesso"
nivel: intermediario
tempo_estimado: "35-50 min"
objetivo_aprendizagem: "Converter um conjunto nomeado de acessos administrativos permanentes em acesso elegível com aprovação e prazo, definindo a métrica de adoção e o critério de exceção"
atende_objetivo: [4, 5]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-02", "TEMA-03"]
relacoes:
  complementa:
    - alvo: "04-identidade-acesso#TEMA-03"
      motivo: "o fluxo de ciclo de vida cria e retira concessão; a revisão verifica se o resultado corresponde ao que a função exige hoje"
    - alvo: "04-identidade-acesso#TEMA-05"
      motivo: "a conta privilegiada é o caso extremo de menor privilégio: quem já tem poder permanente sobre a plataforma não tem para onde reduzir depois"
  aprofundado_por: []
  aplicado_em:
    - alvo: "05-rede-infraestrutura#TEMA-03"
      motivo: "privilégio mínimo de rede exige segmentação, porque o alcance de uma credencial é limitado pelo que a rede permite alcançar; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "NIST CSRC Glossary — least privilege, conforme CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5"
    url: "https://csrc.nist.gov/glossary/term/least_privilege"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Entra Privileged Identity Management — papel elegível, papel ativo, ativação com aprovação, revisão de acesso e trilha de auditoria"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Entra ID Governance — acesso just-in-time, atualizações de papel privilegiado e recertificação"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline, Domain 5 e Domain 7, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-63B-4 — Authentication Assurance Levels, requisitos do nível 3 aplicáveis a acesso administrativo"
    url: "https://pages.nist.gov/800-63-4/sp800-63b/aal/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Menor privilégio, acesso just-in-time e revisão de acessos

Uma ideia central: reduzir privilégio é uma operação com prazo e evidência, e o instrumento que dá prazo ao privilégio é o acesso just-in-time com aprovação registrada.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: converter um conjunto nomeado de acessos administrativos permanentes em acesso elegível, com aprovação, justificativa e prazo, definindo a métrica de adoção, o indicador de recertificação e o critério de exceção assinado pelo dono do risco.

## 2. Pré-requisitos

O [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) vem antes porque o privilégio só pode ser reduzido onde existe modelo de decisão identificável. O [TEMA-03](TEMA-03-ciclo-de-vida-identidade-governanca-acesso.md) vem antes porque a revisão de acesso verifica o resultado do fluxo de ciclo de vida.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantas pessoas na sua empresa têm acesso administrativo permanente a um sistema de produção? Anote o número.
   Confiança: ___
2. Palpite: o acesso administrativo da sua empresa é permanente por padrão ou concedido por pedido? Escolha o que descreve a realidade.
   Confiança: ___
3. Antes de ler: numa revisão de acesso, qual proporção de permissões você aposta que é removida? Anote um percentual.
   Confiança: ___

## 4. Caso real

O Microsoft Entra Privileged Identity Management trabalha com duas formas de atribuição. A atribuição ativa dá o privilégio imediatamente, sem nenhuma ação do usuário. A atribuição elegível não dá: a pessoa precisa ativar o papel, e a ativação pode exigir verificação por múltiplos fatores, justificativa de negócio e aprovação de aprovador designado, com duração limitada escolhida dentro do máximo configurado. O produto ainda permite limitar a atribuição por data de início e fim, notifica quando papel privilegiado é ativado, mantém histórico de auditoria para auditoria interna e externa e exige aprovação de administrador global ou administrador de papéis privilegiados para estender ou renovar.

O caso deixa a pergunta aberta: se o produto sabe distinguir elegível de ativo, por que a maior parte das empresas mantém o privilégio no modo ativo para quase todos os administradores, e o que seria preciso mudar no plantão e na operação para sustentar o modo elegível.

## 5. Conteúdo

### 5.1 Conceito

Menor privilégio está definido no glossário do NIST em três formulações complementares. Restringir os privilégios de acesso de usuários, ou de processos agindo em nome de usuários, ao mínimo necessário para cumprir as tarefas designadas; projetar a arquitetura de segurança de modo que cada entidade receba o mínimo de recursos e autorizações de sistema de que precisa para executar sua função. A segunda formulação desloca a cobrança do comportamento para o desenho, e é a que interessa a quem define requisito de sistema.

Acesso just-in-time é a aplicação do princípio ao tempo. O PIM define o modelo como aquele em que o usuário recebe permissão temporária para executar tarefas privilegiadas, o que impede que usuário mal-intencionado ou não autorizado mantenha acesso depois que a permissão expira. O ponto central é que o acesso é concedido quando necessário e deixa de existir depois, sem depender de alguém lembrar de retirar.

Revisão de acesso é o instrumento de manutenção do estado. Ela existe para responder se a pessoa ainda precisa daquele papel, e o PIM lista a revisão de acesso entre os recursos do produto, ao lado de histórico de auditoria. O erro de execução mais comum é tratar a revisão como evento de conformidade: coleta de assinaturas, sem remoção do que não foi reafirmado. Sem remoção automática, a revisão documenta o problema em vez de resolvê-lo.

### 5.2 Como funciona

A conversão de permanente para elegível tem quatro elementos e nenhum deles é opcional.

O primeiro é a elegibilidade: quem pode pedir o papel. Isso muda o desenho de plantão, porque quem está de plantão precisa poder ativar rápido e quem não está, não.

O segundo é a prova exigida na ativação. O PIM permite exigir verificação por múltiplos fatores, e para os acessos administrativos mais poderosos o alvo é o nível 3 da escala do NIST: autenticador criptográfico com chave privada não exportável e resistência a phishing. Se o papel permite apagar produção, aceitar código por SMS na ativação é manter aberta a porta que o controle tenta fechar.

O terceiro é a decisão de aprovação. Aprovação automática serve para o que é rotina e de baixo impacto; aprovação nominal serve para o que é raro e de alto impacto. O ponto que costuma travar projeto é o regime de plantão: em incidente às 3 da manhã, aprovação nominal precisa de aprovador de plantão com o mesmo nível de acesso a ser aprovado, ou de uma janela de autoaprovação registrada e revisada depois.

O quarto é o prazo. A ativação tem duração limitada dentro do máximo configurado, e o prazo precisa ser negociado com quem opera: curto demais gera reativação constante e atrito; longo demais transforma o acesso elegível em permanente com passo extra.

A revisão fecha o ciclo com três decisões de desenho. Frequência: papel administrativo pede ciclo curto, acesso comum de leitura tolera ciclo longo. Quem revisa: o dono do recurso, não o próprio contemplado, e nunca a mesma pessoa que aprovou a concessão inicial. Consequência: o que não foi reafirmado dentro do prazo é removido indiscriminadamente, para que a exceção seja pedida explicitamente.

Duas relações com outros controles merecem atenção. A segregação de função, listada entre os princípios de projeto seguro do CISSP, não coexiste com o hábito de dar a mesma pessoa a permissão de pedir e a de aprovar, e a revisão é o momento de procurar essas combinações. E o registro de escalação de privilégio, que o CISSP cita no contexto de ferramentas de elevação como o sudo e da auditoria de seu uso, é matéria-prima da revisão: quem escalou, quando e com qual justificativa.

### 5.3 Exemplo resolvido

Cenário: 42 pessoas com papel de administrador em uma plataforma de nuvem, todas com atribuição ativa permanente. Auditoria pediu redução em 90 dias.

Passo 1: inventariar. Listar as 42 atribuições com dono, tipo de atribuição, data de criação e escopo. Descobrir quantas são de pessoas que não usaram o papel nos últimos 90 dias, usando o histórico do próprio produto.

Passo 2: cortar o que não tem justificativa. Atribuições sem uso e sem dono claro saem primeiro. Nesse passo é comum derrubar de 42 para 20 sem nenhum trabalho de engenharia, porque a maior parte do excesso vem de mudança de função sem retirada.

Passo 3: definir os grupos de risco. Papel que apaga dado, muda configuração de rede ou lê segredo entra no grupo de alto impacto; papel de leitura administrativa entra no grupo de baixo impacto.

Passo 4: converter por grupo. Alto impacto vira elegível com aprovação nominal, verificação por múltiplos fatores, justificativa obrigatória, prazo máximo de 4 horas e notificação ao time de segurança na ativação. Baixo impacto vira elegível com autoaprovação registrada e prazo de 8 horas.

Passo 5: resolver o plantão antes de anunciar. Definir a escala de aprovadores, o canal de pedido e o procedimento para quando o aprovador não responde em 15 minutos. Sem isso o time cria um caminho paralelo em duas semanas.

Passo 6: revisar. Revisão mensal do grupo de alto impacto e trimestral do grupo de baixo. O que não for reafirmado no prazo é removido, e a remoção é comunicada com o caminho para pedir de novo.

Passo 7: medir e reportar. Indicadores: número de atribuições ativas permanentes, número de atribuições elegíveis, número de ativações no mês, duração média da ativação, número de ativações recusadas por falta de justificativa e número de exceções abertas com prazo vencido.

Resultado típico ao final do trimestre: atribuição permanente cai para poucas contas de emergência, o volume de ativações fica baixo, e a auditoria passa a ter trilha nominal de quem usou poder administrativo, quando e para quê.

### 5.4 Problema de completar

Uma empresa tem 300 acessos com exceção individual, criados por pedido de gestor em e-mail, sem prazo. A revisão semestral aprova 100% de tudo há dois anos.

Passo 1: extrair a lista de concessões individuais e agrupar por sistema, por gestor que autorizou e por data de criação.

Passo 2: identificar quais dessas concessões poderiam virar papel ou atributo, eliminando a exceção pela raiz.

Passo 3: definir prazo padrão para exceção e o formato de justificativa aceita.

Passo 4: escrever a regra de remoção do que não for reafirmado no prazo.

Passo 5: definir o indicador que mostra se a revisão está funcionando.

Passo 6: definir quem assina a exceção permanente, quando ela for inevitável, e por qual motivo.

## 6. Por que isso importa para o CISO

A frase "temos acesso administrativo controlado" só se sustenta com três números: quantas atribuições ativas permanentes existem, quantas ativações ocorreram no mês e qual foi a duração média delas. Com esses três números, o CISO responde à pergunta que o comitê de risco faz depois de qualquer incidente com conta comprometida: por quanto tempo um atacante teria poder administrativo.

Há um efeito direto no custo de um incidente. Com privilégio permanente, o comprometimento de uma estação de trabalho de administrador vale até a próxima troca de senha, ou seja, vale indefinidamente. Com privilégio elegível, o atacante ainda precisa passar por fator adicional, justificativa e aprovação, e a ativação fica registrada antes de o dano começar, o que encurta a detecção.

A revisão de acesso é o ponto onde a credibilidade do programa é testada. Uma revisão em que nada foi removido nos últimos ciclos é o tipo de evidência que o auditor usa para concluir que o controle não opera. Medir a taxa de remoção e o prazo de resposta por dono de recurso transforma a revisão em indicador de gestão, e dá ao CISO um argumento concreto para escalar com o gestor que não responde.

## 7. Aplicação prática

Liste as dez contas com mais privilégio na sua empresa e responda, para cada uma, quatro perguntas: a atribuição é ativa ou elegível, qual é o escopo, quem é o dono e quando o papel foi usado pela última vez. Se o produto não informar o último uso, a ausência dessa informação já é o primeiro achado, porque nenhuma revisão séria se sustenta sem dado de uso.

Em seguida, escolha uma dessas contas, converta para elegível e acompanhe por duas semanas. Anote quantas ativações ocorreram, quanto tempo duraram e o que travou. Essa é a ordem de grandeza real do esforço de conversão, e ela costuma ser menor do que o time teme.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, a diferença entre atribuição ativa e atribuição elegível e o que isso muda em um incidente de conta administrativa comprometida. Se a explicação não mencionar prazo e aprovação, releia a seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Acesso just-in-time é apenas configurar prazo curto | Prazo curto sem aprovação e sem fator adicional só adiciona atrito | Combinar prazo, prova na ativação, justificativa e aprovação conforme o impacto |
| Quem ativa o papel deve ser quem aprova | Elimina a segregação de função e cria caminho de autoaprovação silenciosa | Separar quem pede de quem aprova, com regra explícita para o plantão |
| Revisão de acesso que aprova tudo está funcionando | Sem remoção, o controle não altera o estado do acesso | Remover o que não for reafirmado e medir taxa e prazo de resposta |
| Retirar o privilégio de todos os administradores é o objetivo | Conta de emergência é necessária para restaurar o serviço | Manter poucas contas de emergência com acesso aprovado por duas pessoas e testadas |
| Menor privilégio é assunto só de acesso humano | Processos e contas de serviço também recebem privilégio | A definição do NIST cobre usuários e processos agindo em nome de usuários |
| Converter para elegível resolve o excesso de escopo | Papel elegível com escopo amplo continua concedendo demais na ativação | Reduzir escopo antes de reduzir temporalidade |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Como o glossário do NIST formula menor privilégio e qual é a diferença entre as formulações?
2. O que o modelo just-in-time impede, segundo a definição do PIM?
3. Quais ações podem ser exigidas na ativação de um papel elegível?
4. Por que a revisão de acesso precisa remover automaticamente o que não foi reafirmado?
5. Qual requisito de autenticação faz sentido para ativação de papel de alto impacto e por quê?
6. Se a auditoria pedir o tempo máximo em que uma conta administrativa comprometida manteria poder, quais números você usa para responder?

<details>
<summary>Conferir respostas</summary>

1. Restringir privilégios de usuários ou de processos ao mínimo necessário para cumprir as tarefas designadas; projetar a arquitetura de modo que cada entidade receba o mínimo de recursos e autorizações de sistema. A segunda formulação cobra o desenho, não apenas o comportamento.
2. Que usuário mal-intencionado ou não autorizado mantenha o acesso depois que a permissão expira. O acesso é concedido por necessidade e deixa de existir em seguida.
3. Verificação por múltiplos fatores, justificativa de negócio, aprovação de aprovador designado e escolha da duração dentro do máximo configurado.
4. Porque a ausência de confirmação é, por si, informação: se ninguém reafirmou, não há dono atento ao acesso. Sem remoção, a revisão deixa de ser controle e vira registro.
5. O nível 3 da escala do NIST: autenticador criptográfico com chave privada não exportável e resistência a phishing, com intenção de autenticação. O papel de alto impacto não pode depender de segredo phishável na ativação.
6. Número de atribuições ativas permanentes e duração máxima configurada de ativação. A resposta é a maior entre o tempo até a troca de credencial e a duração máxima de ativação vigente.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Listar as dez contas mais privilegiadas e classificar em ativa ou elegível | Rebaixar: repetir em D+3 |
| D+30 | Converter uma conta para elegível e registrar o que travou | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 05-rede-infraestrutura#TEMA-03 | privilégio mínimo de rede exige segmentação, porque o alcance de uma credencial é limitado pelo que a rede permite alcançar; destino planejado, número provisório |
| complementa | 04-identidade-acesso#TEMA-03 | o fluxo de ciclo de vida cria e retira concessão; a revisão verifica se o resultado corresponde ao que a função exige hoje |
| complementa | 04-identidade-acesso#TEMA-05 | a conta privilegiada é o caso extremo de menor privilégio: quem já tem poder permanente sobre a plataforma não tem para onde reduzir depois |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 5, subtema 5.2, que lista just-in-time entre os itens da estratégia de identificação e autenticação | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 7, Security Operations, subtema 7.4, com need-to-know e menor privilégio, segregação de função, gestão de conta privilegiada e rotação de função | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: a página do PIM para o vocabulário de elegível, ativo, ativação e aprovação, e a seção de níveis de garantia do SP 800-63B-4 para o que exigir na ativação de papel poderoso.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSRC Glossary — least privilege, com as três definições herdadas | primaria | https://csrc.nist.gov/glossary/term/least_privilege | "2026-09-25" | alta |
| 2 | Microsoft Entra Privileged Identity Management — elegível e ativo, ativação com MFA, justificativa e aprovação, duração limitada, notificação, revisão de acesso e histórico de auditoria | primaria | https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure | "2026-09-25" | alta |
| 3 | Microsoft Entra ID Governance — recertificação de papéis administrativos e alertas de mudança em papel | primaria | https://learn.microsoft.com/en-us/entra/id-governance/identity-governance-overview | "2026-09-25" | alta |
| 4 | ISC2 CISSP Certification Exam Outline, Domain 3, subtema 3.1 e Domain 5, subtemas 5.2 e 5.5 | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | "2026-09-25" | alta |
| 5 | NIST SP 800-63B-4 — Authentication Assurance Levels, requisitos de nível 3, incluindo chave privada não exportável e resistência a phishing | primaria | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-ciclo-de-vida-identidade-governanca-acesso.md) |
| Próximo tema | [TEMA-05](TEMA-05-pam-contas-privilegiadas-cofres-de-senha.md) |
| Home | [README](../README.md) |
