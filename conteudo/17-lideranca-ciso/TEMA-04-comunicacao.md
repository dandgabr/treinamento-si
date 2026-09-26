---
tema: "Comunicação com o executivo e com o técnico"
tema_id: "TEMA-04"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "30-35 min"
objetivo_aprendizagem: "Reescrever um relatório técnico em duas versões, uma para decisão executiva e outra para execução técnica, preservando o mesmo fato e a mesma conclusão em ambas."
atende_objetivo: [2]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: ["TEMA-01", "TEMA-02"]
relacoes:
  complementa:
    - alvo: "17-lideranca-ciso#TEMA-02"
      motivo: "quem recebe o relatório define como ele precisa ser escrito"
  aplicado_em:
    - alvo: "15-fatores-humanos#TEMA-04"
      motivo: "a mensagem da liderança é o que sustenta cultura de segurança"
    - alvo: "02-governanca-risco-compliance#TEMA-06"
      motivo: "o relatório ao board é onde a comunicação executiva é medida"
fontes:
  - titulo: "NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST IR 8286 — Integrating Cybersecurity and Enterprise Risk Management (ERM), edição de 2020, retirada em 18/12/2025"
    url: "https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "SEC Release 33-11216 — Cybersecurity Risk Management, Strategy, Governance, and Incident Disclosure"
    url: "https://www.sec.gov/files/rules/final/2023/33-11216.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "EC-Council CCISO Blueprint v3"
    url: "https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Comunicação com o executivo e com o técnico

O mesmo fato sustenta uma decisão de verba e uma alteração de configuração. Comunicação de
segurança é o trabalho de escrever as duas versões sem perder a precisão em nenhuma delas.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: reescrever um relatório técnico em duas versões, uma para
decisão executiva e outra para execução técnica, preservando o mesmo fato e a mesma conclusão em
ambas.

## 2. Pré-requisitos

[TEMA-01](./TEMA-01-papel-e-mandato.md) e [TEMA-02](./TEMA-02-posicao-e-reporte.md). O público do
relatório é definido pela instância que decide.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantos indicadores o seu último relatório ao executivo continha? Chute um número antes de abrir o arquivo.
   Confiança: ___
2. Você aposta que o seu último relatório pedia uma decisão concreta? Se sim, qual delas, de cabeça.
   Confiança: ___
3. Um praticante da sua equipe consegue executar a ação a partir da mesma página que o executivo lê? Aposte sim, não ou não sei.
   Confiança: ___
## 4. Caso real

Ao revisar relatórios de companhias abertas nos Estados Unidos, a equipe da SEC observou que a
maioria dos registrantes que divulgava risco cibernético o fazia na seção de fatores de risco do
relatório anual, mas que essas divulgações apareciam "às vezes incluídas junto a outras divulgações
não relacionadas, o que torna mais difícil para os investidores localizar, interpretar e analisar a
informação" (Release 33-11216, página 7;
https://www.sec.gov/files/rules/final/2023/33-11216.pdf, acessado em 25/09/2026).

O problema descrito não é falta de informação. É informação correta no lugar errado, no formato que
não permite comparação. A pergunta que o caso deixa aberta é o que muda, na prática, quando o
relatório é desenhado a partir da decisão que ele precisa provocar.

## 5. Conteúdo

### 5.1 Conceito

Existem dois públicos com objetivos diferentes. O executivo decide alocação: quer saber o que muda
no resultado, quanto custa e o que acontece se nada for feito. O técnico executa: quer saber onde,
com qual escopo, em qual prazo e com qual evidência de sucesso. Um único documento tentando servir
aos dois costuma falhar nos dois.

O CSF 2.0 descreve o mecanismo de fluxo de informação em dois níveis. No nível superior, entre
executivos e gestores, a discussão trata de estratégia, de como as incertezas relacionadas à
segurança cibernética podem afetar o alcance dos objetivos organizacionais. No nível seguinte, entre
gestores e praticantes, a conversa trata de implementação e medição da mudança no risco operacional.
O documento explicita que o lado esquerdo da figura está lá para indicar a importância de os
praticantes compartilharem atualizações, percepções e preocupações com gestores e executivos — o
fluxo não é só de cima para baixo
(https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf, acessado em 25/09/2026, páginas 15 e 16).

O CSF 2.0 também declara, com todas as letras, um dos serviços que presta: ajudar as organizações a
traduzir a terminologia de segurança cibernética e de gestão de risco cibernético para a linguagem
de gestão de risco geral que os executivos entendem. E descreve os praticantes fornecendo a gestores
e executivos o que eles precisam para decidir: indicadores-chave de desempenho e indicadores-chave
de risco.

### 5.2 Como funciona

O instrumento de comunicação do NIST é o registro de riscos, descrito como o veículo formal de
comunicação para compartilhar e coordenar atividades de risco cibernético como insumo para quem
decide no nível corporativo. O mesmo documento identifica o modo mais comum de falha: quando
organizações ou o nível corporativo recebem dados de risco dos sistemas, "frequentemente é um mapa
de calor perpetuamente vermelho ou um volume tão grande que se torna impraticável"
(https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf, acessado em 25/09/2026, páginas v, 11
e 15). Mapa de calor todo vermelho significa que o critério de priorização não existe ou não foi
aplicado.

Três regras tornam a comunicação operacional. A primeira: um documento, uma decisão. Se não há
decisão pedida, o relatório é informe e deve caber em meia página. A segunda: o risco aparece com
número e janela de tempo, porque o executivo compara risco com risco, não com adjetivo. A terceira:
a mesma fonte de dados alimenta as duas versões, mudando o nível de detalhe e não o valor.

O CISM trata o assunto como item de programa, na alínea "Information Security Program
Communications and Reporting" do Domínio 3, e como tarefa de apoio no reporte de métricas a
stakeholders
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026). O
CCISO aborda a competência por outro ângulo, no Domínio 2, com "Leading with Contextual
Communication" e "Organizational Contextual Intelligence"
(https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em 25/09/2026, página
5): adequar o registro ao público é competência avaliada, não detalhe de estilo.

### 5.3 Exemplo resolvido

Fato de entrada, recebido do time: 412 vulnerabilidades de severidade alta abertas no trimestre,
sendo 61 em sistemas expostos à internet; o tempo médio de correção subiu de 38 para 55 dias.

Passo 1. Identifique a decisão. O fato permite três decisões diferentes: contratar capacidade de
correção, reduzir escopo de exposição ou aceitar o prazo. Escolha uma para este documento.

Passo 2. Versão executiva, uma página.

- Título: exposição externa sem correção dentro do prazo declarado.
- Fato: 61 vulnerabilidades de severidade alta estão abertas em sistemas expostos, com tempo médio
  de correção de 55 dias contra meta de 30.
- Consequência: aumento da exposição a exploração remota; sem tratamento, a projeção é de manter
  essa condição por mais dois trimestres.
- Opções: (a) manter e aceitar o risco; (b) contratar dois analistas e reduzir a 30 dias em cinco
  meses, com custo anual informado; (c) retirar de exposição 14 sistemas sem necessidade de acesso
  externo, sem custo adicional.
- Recomendação: (c) agora, (b) no próximo ciclo orçamentário.
- Métrica de acompanhamento: tempo médio de correção de severidade alta, hoje 55 dias, meta 30.

Passo 3. Versão técnica, mesma fonte de dados.

- Escopo: 61 ativos, com lista nominal e responsável por ativo.
- Ação imediata: retirar 14 ativos da exposição externa; janela agendada; critério de aceite, acesso
  externo desabilitado e verificado por varredura externa em 48 horas.
- Ação estrutural: corrigir a fila de severidade alta, com meta semanal de 15 fechamentos e
  responsável por squad.
- Evidência: repositório de tickets com data de abertura e fechamento; relatório de exposição
  externa gerado semanalmente.

Passo 4. Verifique a consistência. O número 61 aparece nas duas versões; a conclusão é a mesma; o que
muda é o nível de detalhe e o verbo.

### 5.4 Problema de completar

Fato: o tempo médio de resposta a incidentes de severidade alta é de 3 dias; 40% dos alertas de
severidade alta ficam sem triagem no fim de semana. Complete as duas últimas etapas.

1. Decisão pedida ao executivo: _______
2. Fato e consequência em duas linhas: _______
3. Opções com custo e efeito: _______
4. Métrica e valor atual: _______
5. Versão técnica da opção escolhida, com escopo, janela e evidência: _______

## 6. Por que isso importa para o CISO

A comunicação define se o seu trabalho é visto como custo ou como gestão de risco. Um relatório com
30 indicadores entrega a decisão para quem lê, e quem lê não tem tempo. Um relatório com uma decisão
mantém você na posição de quem administra risco com dono. A comunicação técnica para a própria
equipe tem o mesmo peso: instrução ambígua vira retrabalho, e retrabalho consome justamente o
orçamento que você defende no ciclo seguinte.

## 7. Aplicação prática

Pegue o último relatório que você enviou ao executivo e escreva ao lado o número de decisões que ele
pedia. Se for zero, reescreva o documento em meia página com uma decisão e reenvie como adendo. Faça
isso uma vez por mês, com um fato diferente.

## 8. Autoexplicação

Explique em 3 frases qual é a diferença de conteúdo entre a versão executiva e a versão técnica do
mesmo fato, e diga qual das duas você produz com mais frequência hoje. A resposta indica onde está a
sua lacuna.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "Quanto mais dados, mais credibilidade" | O NIST registra o efeito: mapa de calor todo vermelho ou volume impraticável | Entregue poucos indicadores ligados a decisões pendentes |
| "Simplificar para o executivo é omitir risco" | O nível de detalhe muda; o valor e a conclusão não | Mantenha o número e a conclusão, reduza o detalhe operacional |
| "O técnico já sabe o que fazer com o relatório executivo" | A versão executiva não contém escopo, janela nem critério de aceite | Escreva a segunda versão com o mesmo fato e a ação verificável |
| "Informe e decisão são o mesmo documento" | Informe sem decisão não gera registro e não move a organização | Declare o que você está pedindo antes de escrever o resto |
| "Comunicar incidente para o board exige detalhe técnico" | Detalhe técnico expõe vetor e estado de remediação sem contribuir para a decisão | Descreva impacto material, opções e o que você precisa aprovar |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é o fluxo de informação que o CSF 2.0 descreve entre executivos, gestores e praticantes?
2. Que tipo de conteúdo os praticantes fornecem para apoiar a decisão de gestores e executivos?
3. Qual falha de comunicação o NIST IR 8286 identifica no material de risco que chega ao nível corporativo?

<details>
<summary>Conferir respostas</summary>

1. Fluxo bidirecional em dois níveis: no topo, executivos e gestores tratam de estratégia e do efeito das incertezas sobre os objetivos; abaixo, gestores e praticantes tratam de implementação e medição do risco operacional. Os praticantes enviam atualizações, percepções e preocupações para cima.
2. Indicadores-chave de desempenho e indicadores-chave de risco.
3. Volume excessivo e priorização ausente: o material chega como mapa de calor perpetuamente vermelho ou em quantidade impraticável de analisar.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Reescrever um relatório técnico em duas versões e medir o tempo de cada uma | Rebaixar: repetir em D+3 |
| D+30 | Conferir se a última decisão pedida ao executivo foi tomada e registrada | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-06 | o relatório ao board é onde a comunicação executiva é medida |
| aplicado_em | 15-fatores-humanos#TEMA-04 | a mensagem da liderança é o que sustenta cultura de segurança |
| complementa | 17-lideranca-ciso#TEMA-02 | quem recebe o relatório define como ele precisa ser escrito |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [NIST Cybersecurity Framework (CSF) 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) |
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [NIST IR 8286](https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | NIST IR 8286 (out/2020), retirado em 18/12/2025 | primaria | https://nvlpubs.nist.gov/nistpubs/ir/2020/NIST.IR.8286.pdf | "2026-09-25" | alta |
| 3 | SEC Release 33-11216, vigente desde 05/09/2023 | primaria | https://www.sec.gov/files/rules/final/2023/33-11216.pdf | "2026-09-25" | alta |
| 4 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 5 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-orcamento-e-priorizacao.md) |
| Próximo tema | [TEMA-05](TEMA-05-time-de-seguranca.md) |
| Home | [README](../README.md) |
