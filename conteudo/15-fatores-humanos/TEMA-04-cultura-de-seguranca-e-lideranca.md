---
tema: "Cultura de segurança e o papel da liderança"
tema_id: "TEMA-04"
area_id: "15-fatores-humanos"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Converter a expressão vaga de cultura de segurança em um conjunto nomeado de decisões observáveis, e justificar qual delas a liderança controla de fato e qual depende do programa de aprendizagem"
atende_objetivo: [3, 4]
certificacoes: []
pre_requisitos: ["TEMA-01", "TEMA-03"]
relacoes:
  complementa:
    - alvo: "16-ia-seguranca#TEMA-06"
      motivo: "uso não governado de ferramenta cede ao critério que a liderança sustenta, e não ao bloqueio de rede, o que coloca os dois temas no mesmo conflito"
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-04"
      motivo: "a comunicação executiva é o instrumento pelo qual a liderança enuncia o que a cultura deve sustentar em caso de conflito"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-50 Rev. 1 — Building a Cybersecurity and Privacy Learning Program, setembro de 2024"
    url: "https://csrc.nist.gov/pubs/sp/800/50/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
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
  - titulo: "NIST SP 800-61 Rev. 3 — Incident Response Recommendations and Considerations for Cybersecurity Risk Management, abril de 2025"
    url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Cultura de segurança e o papel da liderança

Uma ideia central: cultura é o que as pessoas fazem quando o controle não está olhando, e a liderança entra nessa conta pelo conflito que ela resolve na hora — entre a proteção do dado e a pressa de alguém.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir converter a frase "precisamos melhorar a cultura de segurança" em uma lista de decisões observáveis, dizer de cada uma quem a toma, e distinguir as decisões que o programa de aprendizagem influencia das decisões que só a liderança pode mudar.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-por-que-pessoas-sao-exploradas.md), para o vocabulário da decisão explorada, e [TEMA-03](./TEMA-03-programa-de-conscientizacao.md), que entrega o programa. Este tema cobre o que o programa não produz sozinho.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantas exceções a controle de segurança foram aprovadas no último trimestre, e por quem? Chute um número antes de conferir a ata.
   Confiança: ___
2. Quando alguém da diretoria pede para pular uma etapa de aprovação, a etapa é pulada ou a decisão fica registrada? Aposte no que acontece de fato.
   Confiança: ___
3. Se uma pessoa reporta um erro que ela mesma cometeu, você acha que ela recebe orientação ou advertência na sua empresa? Aposte.
   Confiança: ___
## 4. Caso real

O guia conjunto do CISA, NSA, FBI e MS-ISAC recomenda revisar configurações de bloqueio e alerta de MFA, acompanhar logins negados ou tentados, executar bloqueio de conta quando houver atividade incomum ou tentativa de login maliciosa em curso, e minimizar interrupções desnecessárias. Na frase que fecha essa recomendação, o documento escreve que isso inclui "prioritizing the health of organizational and consumer data, rather than the short-term productivity of a single employee", e justifica lembrando que um incidente de rede significativo não afeta apenas a produção de muitos empregados, mas também a disponibilidade de recursos e, potencialmente, dados de clientes ou parceiros
(https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf, acessado em 25/09/2026).

Esse trecho é uma instrução escrita sobre um conflito de valores, e o conflito é diário. Bloquear a conta interrompe o trabalho de alguém agora; não bloquear pode significar acesso indevido a dado de cliente. Quem decide em qual lado ficar, quando o caso não está previsto, define o que a organização pratica.

A pergunta que o caso deixa aberta: das decisões de conflito tomadas na sua organização no último mês, quantas ficaram registradas com nome de quem decidiu?

## 5. Conteúdo

### 5.1 Conceito

A NIST declara, para o programa de aprendizagem, que ele deve incentivar mudança de comportamento como parte da gestão de risco e levar ao desenvolvimento de uma cultura de segurança e de privacidade na organização, e situa isso dentro de um processo de toda a organização
(https://csrc.nist.gov/pubs/sp/800/50/r1/final, acessado em 25/09/2026). Duas consequências seguem dessa frase. A primeira é que cultura aparece como desfecho declarado de um programa, e não como pré-requisito dele. A segunda é que o escopo é organizacional, o que coloca a responsabilidade de sustentar o processo fora do time de segurança.

A ENISA também trata o comportamento como variável de resultado, e não de culpa. No comunicado de 26/09/2023, o comissário europeu Thierry Breton afirma que o comportamento dos cidadãos pode ter papel fundamental em como a organização se mantém segura e que isso é responsabilidade compartilhada, enquanto o diretor executivo da agência afirma que explicar como a engenharia social funciona na prática cria consciência das armadilhas possíveis
(https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish, acessado em 25/09/2026).

Cultura, para efeito de decisão, precisa virar conjunto observável. A definição operacional que sobrevive à auditoria tem três critérios: a decisão tem dono nomeado, o critério de decisão existe antes do caso acontecer, e o resultado fica registrado. Onde os três faltam, o que existe é preferência individual, que muda quando a pessoa muda.

Vale separar cultura de clima. Pesquisa de percepção mede o que as pessoas dizem sobre a organização em um momento; ela não mede o que elas fazem quando o controle não está olhando. As duas medidas podem apontar direções opostas, e é o comportamento que aparece em incidente.

### 5.2 Como funciona

O mecanismo da cultura em segurança opera por três canais.

O primeiro é o critério de exceção. Toda organização tem pedido de exceção, e a pergunta é quem pode conceder, contra qual critério, com qual prazo de validade e com qual registro. Quando o critério não existe, o pedido de quem tem mais hierarquia vence sempre, e o controle passa a valer apenas para quem tem menos poder. O guia do CISA trata do caso concreto ao mandar registrar e acompanhar tentativas de login negadas e ao recomendar que a interrupção do trabalho de uma pessoa não prevaleça sobre a saúde do dado.

O segundo é o custo de reportar. Uma organização que precisa saber que a tentativa existiu depende de alguém contar. Se quem conta recebe advertência, o reporte para no segundo caso — e a operação de segurança perde a única fonte que enxerga ataque por canal que não gera log. O guia do CISA coloca o reporte como parte do treinamento de usuário e como uma das formas mais eficientes de proteger a organização, porque ajuda o provedor a identificar campanhas novas ou em curso.

O terceiro é a resposta ao desvio. Não a punição, e sim o que acontece depois: o caso que gerou exceção virou mudança de processo, ou virou exceção permanente? Exceção sem prazo de validade é decisão de risco tomada sem ninguém decidir.

Nesses três canais, o programa de aprendizagem influencia o que as pessoas sabem e o quanto elas se sentem seguras para reportar. O critério de exceção, o precedente aberto por quem tem autoridade e a resposta ao desvio ficam fora do alcance do programa. Não há campanha que ensine um comportamento que a prática contradiz todos os dias.

### 5.3 Exemplo resolvido

Situação: a área de segurança ouve que "a cultura aqui é fraca", sem dado que sustente a frase.

Passo 1. Substitua o adjetivo por uma lista de decisões. Cinco linhas costumam bastar.

| Decisão observável | Quem decide | Fonte do dado | Existe critério escrito |
|---|---|---|---|
| Conceder exceção a controle de acesso ou de MFA | Gestor solicitante e dono do sistema | Registro de exceção | Sim ou não |
| Concentrar aprovação de mudança em pessoa única | Gestor de TI | Registro de mudança | Sim ou não |
| Divulgar internamente um incidente que envolveu erro | Comunicação e jurídico | Registro do incidente | Sim ou não |
| Manter a mesma senha de serviço por anos | Dono da aplicação | Inventário de credencial | Sim ou não |
| Aceitar risco em vez de corrigir dentro do prazo | Dono do risco | Registro de risco | Sim ou não |

Passo 2. Preencha a coluna do critério. Onde não houver critério escrito, marque como lacuna de governança, e não de cultura.

Passo 3. Verifique o que aconteceu nos últimos 90 dias em cada linha. Leve o número de casos, não a impressão.

Passo 4. Selecione a linha com maior dano potencial e escreva o critério que faltava, com dono e prazo. Uma linha resolvida vale mais que cinco cursos novos.

Passo 5. Leve o resultado para o comitê como decisão, não como diagnóstico. A mensagem executiva usa o mesmo fato em dois registros diferentes, conforme [TEMA-04 de Liderança e gestão do CISO](../17-lideranca-ciso/TEMA-04-comunicacao.md).

Passo 6. Registre o que ficou fora. Se não existe dado para uma linha, escreva que ela não é mensurável hoje e diga o que seria necessário para medir.

### 5.4 Problema de completar

Situação: um diretor pede acesso de administrador para uso próprio, alegando que precisa resolver "coisas pequenas" sem depender do time. Complete as últimas etapas.

1. Decisão em jogo, em uma frase: _______
2. Quem tem alçada para conceder, pelo critério da organização: _______
3. Condição que tornaria a concessão aceitável: _______
4. Registro a ser produzido e prazo de validade da decisão: _______
5. Sinal que mostrará, em 90 dias, se a decisão virou precedente: _______

## 6. Por que isso importa para o CISO

A frase da NIST que declara o programa responsável por levar a uma cultura de segurança é uma arma de dois gumes para o CISO. Ela dá base para pedir verba de aprendizagem com objetivo de resultado. Também cria a expectativa de que o time de segurança produza cultura, o que ele não pode fazer enquanto a prática de quem tem autoridade contradiz o conteúdo do treinamento.

A decisão de maior retorno é o critério de exceção. Sem critério escrito, cada pedido é negociado por hierarquia, e o resultado acumulado é um conjunto de exceções permanentes que ninguém revisou. Com critério escrito, o pedido de exceção passa a gerar registro, prazo e dono, o que transforma cultura em item auditável — e auditoria aceita registro, não percepção.

A segunda decisão é sobre o custo de reportar. Se o reporte é tratado como falha, a organização perde a única fonte que enxerga tentativa que não gerou log, e nenhuma ferramenta substitui essa fonte. A recomendação do guia do CISA de que a interrupção do trabalho de uma pessoa não prevaleça sobre a saúde do dado serve como declaração pública de valor: ela diz ao corpo funcional qual é o critério quando houver conflito.

A terceira decisão é de comunicação. Cultura só é observável depois; a liderança precisa enunciar o critério antes do caso acontecer, e isso é trabalho de comunicação executiva, com uma versão para quem decide e uma versão para quem executa.

## 7. Aplicação prática

Reúna os registros de exceção, de mudança e de risco dos últimos 90 dias e conte quantos casos existem em cada um. Depois escolha a decisão de maior dano potencial e escreva, em uma página, o critério que hoje falta: quem concede, com que justificativa registrada, com que prazo de validade e com que evidência de fechamento.

Submeta a página ao dono da decisão para aprovação. Se ele recusar, o registro da recusa é, por si, o diagnóstico mais preciso de cultura que a organização vai obter neste trimestre.

## 8. Autoexplicação

Explique em três frases a diferença entre o que o programa de aprendizagem consegue mudar e o que só a liderança muda, e dê um exemplo do seu ambiente para cada lado. Se a explicação não citar nenhuma decisão de conflito, releia a seção 5.2.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Cultura se resolve com comunicação interna" | A NIST trata cultura como desfecho de programa dentro de processo de toda a organização, com mudança de comportamento como parte da gestão de risco | Ataque as decisões que contradizem a mensagem, e não o alcance da mensagem |
| "Cultura é responsabilidade do time de segurança" | O critério de exceção e o precedente de quem tem autoridade ficam fora da alçada do time | Nomeie o dono de cada decisão de conflito e o critério dele |
| "Pesquisa de clima mede cultura" | Percepção medida em um momento não é comportamento observado no conflito | Observe exceção concedida, reporte feito e desvio tratado |
| "Toda exceção é falha de cultura" | Exceção com critério, prazo e dono é decisão de risco legítima | Trate como problema a exceção sem critério e sem prazo |
| "Uma campanha forte muda o comportamento" | O comportamento contradito pela prática diária volta ao padrão anterior | Faça o critério ser escrito antes do material de campanha |
| "O exemplo da liderança tem efeito mensurável conhecido" | Nenhuma medição desse efeito foi confirmada em fonte primária nesta execução | Trate como hipótese operacional e teste na sua própria organização |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. O que a NIST declara como desfecho esperado do programa de aprendizagem, e em que contexto ele deve ser implementado?
2. Que critério o guia do CISA recomenda usar quando o bloqueio de uma conta interrompe o trabalho de uma pessoa?
3. Explique a diferença entre cultura e clima em uma frase, para fins de decisão.
4. Quais são os três canais pelos quais a cultura em segurança opera na prática?
5. Por que o custo de reportar é um indicador de cultura, e o que o guia do CISA diz sobre o valor do reporte?

<details>
<summary>Conferir respostas</summary>

1. Que o programa deve incentivar mudança de comportamento como parte da gestão de risco e levar ao desenvolvimento de uma cultura de segurança e de privacidade, implementado como parte de um processo de toda a organização, com públicos diversos.
2. Priorizar a saúde do dado organizacional e do dado de consumidor, em vez da produtividade de curto prazo de um único empregado, considerando que um incidente significativo afeta a produção de muitos empregados e pode alcançar dado de cliente ou de parceiro.
3. Cultura é o comportamento observado quando o controle não está olhando, com critério escrito e dono; clima é o que as pessoas dizem em um momento específico. As duas medidas podem divergir, e é a primeira que aparece em incidente.
4. Critério e registro de exceção; custo de reportar; e resposta ao desvio, incluindo se o caso gerou mudança de processo ou exceção permanente.
5. Porque o reporte é a única fonte que enxerga tentativa ocorrida em canal que não gera log para o time. O guia recomenda ensinar a importância de reportar e afirma que reportar é uma das formas mais eficientes de proteger a organização, porque ajuda o provedor a identificar campanhas novas ou em curso.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem releitura | Rebaixar: repetir em D+1 |
| D+7 | Contar exceções concedidas nos últimos 90 dias e verificar quantas têm critério e prazo | Rebaixar: repetir em D+3 |
| D+30 | Redigir o critério de exceção da decisão de maior dano e submetê-lo ao dono | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 17-lideranca-ciso#TEMA-04 | a comunicação executiva é o instrumento pelo qual a liderança enuncia o que a cultura deve sustentar em caso de conflito |
| complementa | 16-ia-seguranca#TEMA-06 | uso não governado de ferramenta cede ao critério que a liderança sustenta, e não ao bloqueio de rede, o que coloca os dois temas no mesmo conflito |

## 13. Certificações e leitura recomendada

Leitura recomendada: o resumo e a introdução da SP 800-50 Rev. 1, para o desfecho declarado do programa, e a recomendação de bloqueio e alerta de MFA do guia conjunto de *phishing*, para o exemplo escrito de conflito entre produtividade e proteção do dado.
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-50 Rev. 1, setembro de 2024 | primaria | https://csrc.nist.gov/pubs/sp/800/50/r1/final | "2026-09-25" | alta |
| 2 | CISA, NSA, FBI e MS-ISAC, *Phishing Guidance: Stopping the Attack Cycle at Phase One*, outubro de 2023 | primaria | https://www.cisa.gov/sites/default/files/2025-03/Phishing%20Guidance%20-%20Stopping%20the%20Attack%20Cycle%20at%20Phase%20One%20508.pdf | "2026-09-25" | alta |
| 3 | ENISA, *Emerging technologies make it easier to phish*, 26/09/2023 | primaria | https://www.enisa.europa.eu/news/emerging-technologies-make-it-easier-to-phish | "2026-09-25" | alta |
| 4 | NIST SP 800-61 Rev. 3, abril de 2025 | primaria | https://csrc.nist.gov/pubs/sp/800/61/r3/final | "2026-09-25" | media |

Não foi possível confirmar em fonte oficial, nesta execução, os pontos abaixo, que por isso não são afirmados neste tema. Efeito quantificado do comportamento da liderança sobre o comportamento de segurança do restante da organização: Não confirmado em fonte primária nesta execução; tratado como hipótese operacional. Percentual de programas de segurança que falha por motivo cultural: Não confirmado; nenhuma estatística desse tipo foi lida. Instrumento validado para medir cultura de segurança: Não localizado em fonte primária nesta execução.

---

| Navegação | |
|---|---|
| Área | [15 Fatores humanos e cultura de segurança](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-programa-de-conscientizacao.md) |
| Próximo tema | [TEMA-05](TEMA-05-insider-threat-e-acesso-privilegiado.md) |
| Home | [README](../README.md) |
