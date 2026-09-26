---
tema: "O que é um SOC e seus modelos"
tema_id: "TEMA-01"
area_id: "10-operacoes-soc"
nivel: base
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Descrever um modelo de SOC pelas variáveis de operação, horário e escopo, justificando cada escolha por capacidade e custo"
atende_objetivo: [1]
certificacoes: ["CySA+", "GCIH"]
pre_requisitos: []
relacoes:
  complementa:
    - alvo: "11-resposta-forense#TEMA-01"
      motivo: "o modelo de SOC e o ciclo de resposta descrevem o mesmo plantão: quem atende, com que cobertura horária e em quanto tempo"
    - alvo: "11-resposta-forense#TEMA-02"
      motivo: "o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos"
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-05"
      motivo: "o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro"
  nao_confundir_com: []
fontes:
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management: A CSF 2.0 Community Profile, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
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

# O que é um SOC e seus modelos

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir descrever um modelo de SOC nomeando as três variáveis que o definem — quem opera, em que horário e com que escopo — e justificar cada escolha por capacidade necessária e custo, sem recorrer a adjetivo de fornecedor.

## 2. Pré-requisitos

Nada. O tema é a porta de entrada da área e só usa vocabulário de controle detectivo, que vem do [01 Fundamentos](../01-fundamentos/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quem recebe o alerta do seu ambiente às três da manhã e o que essa pessoa pode decidir sem consultar ninguém?
   Confiança: ___
2. A telemetria do seu ambiente cobre o que roda em conta de nuvem contratada ou em rede de terceiro?
   Confiança: ___
3. Se o fornecedor de monitoramento classifica um alerta como informativo, quem tem autoridade para discordar e escalar?
   Confiança: ___
4. Quanto do orçamento de detecção está em licença de ferramenta e quanto está em hora de pessoa treinada?
   Confiança: ___

## 4. Caso real

Em novembro de 2021 o CISA publicou o playbook de resposta a incidentes para as agências civis federais dos Estados Unidos e partiu de uma premissa incômoda: as capacidades de defesa variam muito entre organizações, e a padronização do processo tem de conviver com isso. Para quem não tem time de caça próprio, o documento prevê acionar a autorização federal de rede e receber apoio de caça do CISA, permitindo também contratar um provedor terceiro de resposta, com a ressalva escrita de que esse provedor complementa e não substitui a assistência federal. O playbook não discute qual ferramenta usar. Ele fixa quem faz o quê, com quais pontos de contato, e em quanto tempo.

A pergunta que o caso deixa aberta: o que precisa permanecer obrigatoriamente dentro de casa quando a capacidade de detecção é emprestada ou contratada?

## 5. Conteúdo

### 5.1 Conceito

Um SOC é uma função operacional contínua, com turno e dono, que converte evento em decisão sobre incidente. O CISA trata esse conjunto como sistema de produção: a lista de medidas de segurança operacional do playbook manda segmentar e administrar os sistemas do SOC separadamente dos sistemas corporativos e gerenciar sensores e dispositivos de segurança por caminho fora de banda. Uma operação que compartilha o mesmo diretório de domínio e o mesmo caminho de rede do resto da empresa perde o console no mesmo instante em que perde a rede.

O modelo é escolhido por três variáveis. A primeira é a operação: conduzida por equipe própria, por terceiro ou por arranjo misto. A segunda é o horário de cobertura, de oito por cinco até vinte e quatro por sete. A terceira é o escopo: quais ativos entram, incluindo nuvem, rede de terceiro e ambiente de tecnologia operacional. Cada combinação tem preço e tem uma consequência específica na primeira hora do incidente.

Existe uma quarta variável, que é de governança e costuma ser esquecida na apresentação comercial: a autoridade. O checklist de preparação do playbook do CISA exige designar previamente o coordenador de incidente e documentar o procedimento de escalonamento e de relato de incidente maior. Autoridade que não foi escrita antes do incidente é negociada durante o incidente, com o relógio de notificação correndo.

O SOC também é definido pelo que não é. Ele não é o ciclo de resposta completo nem a análise forense, que ficam em [11 Resposta a incidentes](../11-resposta-forense/README.md); não é a gestão de vulnerabilidades nem a produção de threat intelligence, que ficam em [12 Vulnerabilidades e threat intelligence](../12-vulnerabilidades-threat-intel/README.md). O SOC consome esses insumos e devolve sinal para eles.

### 5.2 Como funciona

O caminho do sinal tem seis estações e um retorno. A telemetria é gerada na origem; é transportada e normalizada; passa pela lógica de detecção; gera alerta; entra na triagem, que decide se vira caso; e o caso é escalonado para quem tem autoridade sobre a ação. O retorno vem depois do encerramento: o playbook do CISA manda, na fase de pós-incidente, acrescentar detecção de amplitude empresarial para as técnicas que o adversário executou com sucesso e identificar os pontos cegos que permitiram a passagem.

O registro do caso tem estrutura mínima exigida pelo mesmo playbook: um sistema de ticket ou de gestão de casos que capture sistemas, aplicações e usuários afetados, tipo de atividade, grupo de ameaça quando conhecido, TTPs empregadas e impacto. Sem esse registro não existe catálogo de incidentes, e sem catálogo não há como tirar lição de série histórica.

A capacidade declarada muda o que a operação pode fazer. O playbook reserva a manobra de desviar o adversário para um sandbox aos SOCs avançados, e a defesa ativa com iscas e contas falsas a quem tem pessoal e capacidade. Reconhecer em que degrau a operação está evita prometer no contrato um comportamento que ela não executa.

### 5.3 Exemplo resolvido

Empresa de serviços com 900 pessoas, um administrador de segurança, sem plantão noturno, e um cliente corporativo que exige cláusula de resposta a incidente em 24 horas. Três modelos candidatos.

| Variável | Modelo A: próprio em horário comercial | Modelo B: terceiro em 24x7 com escalonamento interno | Modelo C: misto |
|---|---|---|---|
| Operação | equipe própria | terceiro monitora e triagem de primeiro nível; interno decide | terceiro fora do horário, interno no horário |
| Horário | 8x5 | 24x7 | 24x7 efetivo |
| Escopo | ativos de escritório e servidores | todos os ativos, com nuvem | todos, com nuvem e endpoint |
| Custo fixo | baixo | alto e previsível por contrato | médio, com dois contratos |
| Risco principal | primeira hora perdida à noite | decisão presa sem autoridade escrita | fronteira de responsabilidade mal definida |

Passo a passo da decisão.

1. Levantar as obrigações com prazo. Aqui, a cláusula contratual de 24 horas e qualquer prazo regulatório de notificação aplicável. O prazo define quantas horas de cobertura são obrigatórias, não quantas são desejáveis.
2. Descrever as três variáveis para cada modelo, como na tabela. Modelo descrito em uma frase de marketing não permite comparar preço.
3. Marcar o que não pode sair de casa. A decisão de declarar incidente, a de conter um ativo com impacto em produção e a guarda da evidência são internas por natureza; contrato nenhum transfere a responsabilidade. O playbook do CISA é explícito ao exigir, no passo de coleta, que a evidência seja registrada com o que foi adquirido, quando e por quem.
4. Fixar os dois pontos de contato por escrito, primário e secundário, com nome, telefone e e-mail, e o caminho de escalonamento com prazo por degrau. Esse item está no checklist de preparação do playbook.
5. Definir o que o terceiro pode fazer sozinho. Bloquear domínio é reversível e pode ser automático; isolar máquina de banco de dados não é.
6. Escolher e registrar a decisão com o custo anual e a consequência aceita. O modelo C resolve o prazo contratual com custo menor, desde que os passos 3 e 4 estejam fechados; sem eles, o modelo C repete o risco do modelo B pagando menos.

### 5.4 Problema de completar

Grupo industrial com planta em duas unidades, tecnologia operacional conectada ao mesmo backbone corporativo, quatro analistas, nenhuma cobertura noturna, e uma proposta de MSSP que inclui "monitoramento 24x7 com triagem de nível 1 e nível 2". Complete a decisão.

1. Operação: ___
2. Horário e como o horário é comprovado no contrato, não apenas prometido: ___
3. Escopo, incluindo a tecnologia operacional e o que o provedor enxerga dela: ___
4. Decisões que permanecem internas: ___
5. Dois artefatos a exigir do provedor antes da assinatura: ___

## 6. Por que isso importa para o CISO

O modelo define quem responde pelo primeiro relógio. Se a operação é 24x7 contratada e a regra de escalonamento diz que a decisão de declarar incidente é do CISO, então o prazo de notificação só começa a contar quando o CISO acorda, e a organização perde a hora mais importante do incidente. O CISA trabalha com uma hora para notificar o órgão central a partir da determinação do incidente. O modelo também decide a estrutura do orçamento: hora de plantão é custo fixo recorrente e ferramenta sem plantão é custo afundado.

## 7. Aplicação prática

Escreva em uma página o caminho de um alerta no seu ambiente: qual sistema gera, quem lê, em que horário, até que hora pode esperar, quem pode isolar uma máquina sem pedir licença e quem declara o incidente. Depois pegue os cinco últimos alertas que viraram caso e verifique se o caminho escrito descreve o que aconteceu. As divergências são a lacuna real do modelo; a proposta de ferramenta vem depois.

## 8. Autoexplicação

Explique o tema em três frases, sem consultar o texto. Depois ligue a algo que você já faz hoje: por exemplo, quem no seu organograma assina a liberação de acesso emergencial fora do horário. Se ninguém assina, a lacuna que este tema descreve já existe na sua empresa.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Comprar SIEM para "ter um SOC" | a ferramenta não define dono, horário nem autoridade; o alerta sem decisão apenas acumula | escolher o modelo primeiro e dimensionar a ferramenta pela cobertura e pelo volume que ele exige |
| Tratar plantão como detalhe operacional | sem plantão real, o prazo de notificação começa a correr com todo mundo dormindo | horário de cobertura é decisão de risco, com consequência contratual e regulatória |
| Supor que nível de analista é padrão normativo | a escada de níveis de analista é convenção de mercado; NAO CONFIRMADO em fonte oficial uma definição normativa desses níveis nas fontes verificadas nesta execução | o que as fontes verificadas exigem é coordenador de incidente designado e caminho de escalonamento documentado |
| Contratar monitoramento esperando transferir responsabilidade | o provedor complementa a capacidade e não assume a decisão sobre o próprio ativo | escrever o que o provedor pode fazer sozinho e o que volta para o cadastro interno de decisão |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as três variáveis que definem um modelo de SOC?
2. Uma empresa com obrigação de notificar incidente em uma hora roda monitoramento 24x7 contratado, mas a decisão de declarar incidente é de uma pessoa que dorme às 23h e não tem substituto. Qual é o defeito do modelo e qual é a correção mínima?
3. Por que o playbook do CISA exige que os sistemas do SOC fiquem separados da rede corporativa e que os sensores sejam gerenciados fora de banda?
4. Cite dois itens que precisam estar escritos antes do incidente e que aparecem no checklist de preparação do playbook.

<details>
<summary>Conferir respostas</summary>

1. Operação — própria, terceira ou mista —, horário de cobertura e escopo de ativos. A autoridade de decisão é a quarta variável de governança que precisa estar escrita.
2. O defeito é que a capacidade de 24x7 termina no alerta: não há decisão à noite. A correção mínima é designar um substituto com autoridade limitada e declarada — por exemplo, declarar incidente e conter um host sem impacto em produção — e registrar isso na regra de escalonamento.
3. Para que o adversário que já controla a rede corporativa não alcance o console de detecção, não leia o tráfego de administração e não possa desligar o sensor. O playbook lista ainda notificar usuário por telefone em vez de e-mail, para reduzir o risco de avisar o adversário.
4. Entre outros: o coordenador de incidente designado, o procedimento de escalonamento e relato de incidente maior, os pontos de contato primário e secundário com nome, telefone e e-mail, e o plano de reforço de pessoal com papéis atribuídos.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar o tema em 3 frases, nomeando as três variáveis | Rebaixar: repetir em D+3 |
| D+30 | Aplicar o modelo escolhido a um ativo novo do seu ambiente, como uma conta de nuvem recém-criada | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 17-lideranca-ciso#TEMA-05 | o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro |
| complementa | 11-resposta-forense#TEMA-01 | o modelo de SOC e o ciclo de resposta descrevem o mesmo plantão: quem atende, com que cobertura horária e em quanto tempo |
| complementa | 11-resposta-forense#TEMA-02 | o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CySA+ | Análise de segurança e operação de monitoramento contínuo | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf |
| GCIH | Tratamento de incidente e operação de resposta | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final |

Leitura recomendada: [NIST SP 800-137, setembro de 2011](https://csrc.nist.gov/pubs/sp/800/137/final).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 2 | NIST SP 800-61 Rev. 3, abril de 2025, DOI 10.6028/NIST.SP.800-61r3 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | alta |
| 3 | NIST SP 800-137, setembro de 2011, DOI 10.6028/NIST.SP.800-137 | primaria | https://csrc.nist.gov/pubs/sp/800/137/final | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-fontes-de-log-e-telemetria.md) |
| Home | [README](../README.md) |
