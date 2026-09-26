---
tema: "Métricas, reporte ao board e auditoria"
tema_id: "TEMA-06"
area_id: "02-governanca-risco-compliance"
nivel: avancado
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Construir a página de reporte trimestral ao conselho com indicadores ligados ao apetite aprovado, movimento no trimestre e decisão pedida por escrito, distinguindo auditoria interna, auditoria de certificação e inspeção regulatória"
atende_objetivo: [6]
certificacoes: ["CISM", "CRISC"]
pre_requisitos: ["TEMA-03", "TEMA-05"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-03"
      motivo: "sem limiar declarado não existe amarelo nem vermelho no relatório, e sem relatório o limiar nunca é aplicado"
    - alvo: "17-lideranca-ciso#TEMA-03"
      motivo: "o número que sobe ao conselho é o mesmo que disputa orçamento no ciclo seguinte; destino planejado"
  aplicado_em: []
  aprofundado_por: []
  nao_confundir_com:
    - alvo: "13-ofensiva-pentest#TEMA-01"
      motivo: "teste ofensivo aponta falha pontual em um alvo; auditoria verifica se o sistema de gestão opera como declarado; destino planejado"
fontes:
  - titulo: "The NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29, 26 de fevereiro de 2024"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "The IIA's Three Lines Model — An update of the Three Lines of Defense, julho de 2020"
    url: "https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27001:2022 — Information security management systems — Requirements"
    url: "https://www.iso.org/standard/27001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA — CRISC Exam Content Outline, 150 questões e pesos por domínio, com linhas de defesa e apetite de risco na governança"
    url: "https://www.isaca.org/credentialing/crisc/crisc-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Métricas, reporte ao board e auditoria

O CSF 2.0 dedica a categoria `GV.OV` à supervisão: resultados da estratégia de gestão de risco revisados para ajustar direção, estratégia revisada para cobrir requisitos e riscos, e desempenho avaliado e revisado para os ajustes necessários ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25). Supervisão exige número. Um CISO que reporta "estamos trabalhando em segurança" não está exercendo governança, porque ninguém no conselho tem como discordar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: construir a página de reporte trimestral ao conselho com indicadores ligados ao apetite aprovado, movimento no trimestre e decisão pedida por escrito, e distinguir auditoria interna, auditoria de certificação e inspeção regulatória.

## 2. Pré-requisitos

[TEMA-03](TEMA-03-apetite-tolerancia-risco.md), porque indicador sem limiar não tem cor, e [TEMA-05](TEMA-05-frameworks-nist-csf-2-cis-controls.md), porque a cobertura de controle é o dado que sustenta a maior parte dos indicadores.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantos indicadores de segurança chegam hoje ao conselho da sua empresa? Anote o número.
   Confiança: ___
2. Palpite: qual foi a última decisão do conselho tomada com base em um relatório de segurança? Se não lembrar, anote isso.
   Confiança: ___
3. Antes de ler: quem responde por um achado de auditoria aberto além do prazo — o CISO, o dono do controle ou o comitê? Aposte.
   Confiança: ___
4. Chute: quantos achados de auditoria estão abertos fora do prazo na sua empresa hoje.
   Confiança: ___

## 4. Caso real

Em uma empresa de capital aberto, o relatório trimestral de segurança apresentava 38 indicadores, entre eles número de alertas do SIEM, número de vulnerabilidades abertas e percentual de conclusão do treinamento anual. No trimestre em que um ataque de ransomware paralisou a operação por dois dias, nenhum dos 38 números havia piorado antes do incidente. O conselho questionou por que o painel não mostrou nada.

A pergunta que o caso deixa aberta: o que separa um indicador que antecipa decisão de um indicador que apenas descreve atividade? O critério é a resposta, e o conteúdo abaixo o define.

## 5. Conteúdo

### 5.1 Conceito

Indicador de desempenho mede a operação do controle; indicador de risco mede a exposição que sobra. Os dois são necessários, e a maior parte dos painéis de segurança erra por excesso do primeiro. O CSF 2.0 descreve esse fluxo com precisão: os profissionais de operação fornecem a gestores e executivos as informações de que precisam, entre elas indicadores-chave de desempenho e de risco, para entender a postura e ajustar a estratégia; e os executivos podem combinar esses dados com informações de outros tipos de risco da organização ([NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25).

A ISACA trata o assunto em dois pontos do CISM. No desenvolvimento do programa, entre os subtemas está a métrica do programa de segurança da informação; na gestão, entre os subtemas estão teste e avaliação de controle e comunicação e reporte do programa. Nas tarefas de apoio aparecem três itens diretos: compilar e apresentar relatórios aos stakeholders sobre atividades, tendências e efetividade geral do programa; avaliar e reportar métricas; e definir e monitorar métricas gerenciais e operacionais ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). Métrica que ninguém define por escrito não é monitorada, é estimada.

Auditoria é a segunda metade do tema, e existem três tipos com donos diferentes. Auditoria interna é a terceira linha do modelo da IIA, com independência da gestão, accountable perante o órgão de governança, com acesso irrestrito a pessoas, recursos e dados e com o plano de auditoria aprovado e financiado por esse órgão. Auditoria de certificação é avaliação externa contra um requisito, limitada a um escopo declarado, contratada pela organização. Inspeção regulatória é conduzida pelo supervisor, com poder sancionatório, e a relação com ela é de obrigação legal, não de serviço contratado ([theiia.org](https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf), acessado em 2026-09-25).

### 5.2 Como funciona

**Teste de mérito de um indicador.** Quatro perguntas decidem se o número entra no relatório. Ele muda alguma decisão possível? Tem dono nomeado entre os gestores? Tem limiar e ação pré-acordada? A série histórica é comparável? Um indicador que falha em duas dessas perguntas pertence ao painel operacional, não ao conselho.

**Ficha de definição por indicador.** Sem ficha, cada área calcula o número de um jeito. A ficha tem oito campos: nome, tipo (desempenho ou risco), fórmula, fonte do dado, dono, frequência, limiar em três faixas e ação pré-acordada para a faixa vermelha.

| Indicador | Tipo | Fórmula | Fonte | Dono | Limiar amarelo | Limiar vermelho | Ação se vermelho |
|---|---|---|---|---|---|---|---|
| Exposição acima do SLA de correção crítica | risco | Dias de exposição acumulados de criticidade alta além do prazo | Plataforma de gestão de vulnerabilidades | Gestor de infraestrutura | 30 dias | 60 dias | Plano de correção em 10 dias úteis, reporte obrigatório |
| Riscos aceitos com prazo vencido | risco | Quantidade de aceitações expiradas sem revisão | Registro de risco | CISO | 1 | 3 | Revisão de todas no próximo fórum executivo |
| Cobertura de autenticação multifator em contas humanas | desempenho | Contas com MFA dividido pelo total de contas ativas | Diretório corporativo | Gestor de identidade | 95% | 90% | Bloqueio de acesso em 5 dias úteis |
| Achados de auditoria vencidos | desempenho | Achados com prazo estourado | Sistema de planos de ação | Dono de cada achado | 2 | 5 | Escalonamento à diretoria e revisão de capacidade |
| Sucesso em teste de restauração de backup | desempenho | Restaurações bem-sucedidas dividido pelo total testado | Registro de testes | Gestor de operações | 90% | 80% | Reteste em 15 dias com acompanhamento |

**Cadência.** Painel operacional mensal com os donos técnicos. Relatório executivo trimestral com o teto de apetite, os cinco riscos materiais com movimento, os incidentes, o status de auditoria e uma decisão pedida. Revisão anual do apetite e da estratégia.

**Anatomia da página do conselho.** Cinco blocos, nessa ordem, cabendo em uma página: exposição atual contra o apetite aprovado; os cinco riscos materiais com o que mudou desde o trimestre anterior; incidentes materiais com impacto e status; auditoria, com achados por idade e o que vence no próximo trimestre; e a decisão pedida, com valor, alternativas e consequência de não decidir.

**Dois erros de desenho que anulam o relatório.** Reportar sem pedir decisão transforma governança em prestação de contas retroativa. E apresentar indicador vermelho pela primeira vez na reunião produz constrangimento em vez de decisão; o vermelho é comunicado ao patrocinador executivo antes, e chega à reunião com proposta de ação.

**Ciclo de auditoria.** Achado entra no sistema com quatro campos: descrição, causa, dono e data. Sem causa, o plano de ação trata o sintoma. Sem dono, ninguém executa. Sem data, a lista cresce. A idade média dos achados abertos é um dos poucos indicadores de governança que não depende de dado técnico e que o conselho entende de imediato.

Os pesos publicados nas credenciais de gestão dizem o que o mercado espera do cargo. O **CISM** tem 150 questões em quatro domínios: programa de segurança da informação com 33%, gestão de incidentes com 30%, gestão de risco com 20% e governança com 17% — e a ISACA avisa que o outline muda em **3 de novembro de 2026** ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). O **CRISC** tem 150 questões em quatro domínios, com resposta e reporte de risco em 32% e avaliação de risco em 22%, e lista explicitamente, dentro da governança, os subtemas linhas de defesa e apetite e tolerância de risco ([isaca.org](https://www.isaca.org/credentialing/crisc/crisc-exam-content-outline)). A leitura útil não é a de preparação para prova: é a de que o mercado trata resposta e reporte de risco como o maior bloco do trabalho de risco, acima da própria avaliação.

Sobre as linhas de defesa, o modelo das Três Linhas do IIA, de julho de 2020, corrige o equívoco mais comum: as linhas são **diferenciação de papéis, não estruturas**, e não operam em sequência — todas operam ao mesmo tempo ([theiia.org](https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf)). A primeira linha entrega produto e gerencia risco; a segunda oferece especialidade, apoio, monitoramento e desafio em matéria de risco, e inclui explicitamente **segurança da informação e tecnologia**; a terceira dá asseguração independente. Quem determina o apetite de risco é o órgão de governança, e cabe a ele supervisionar a gestão de risco e o controle interno — o que, na prática, define a quem o CISO responde e de quem ele cobra.

### 5.3 Exemplo resolvido

Empresa com apetite aprovado conforme o [TEMA-03](TEMA-03-apetite-tolerancia-risco.md): teto de R$ 270 mil de perda por trimestre, tolerância de uma hora de indisponibilidade por trimestre no faturamento e zero exposição de dado pessoal de cliente. No trimestre, três eventos aconteceram: um erro de configuração derrubou o faturamento por 40 minutos, um fornecedor de e-mail marketing expôs uma base de contatos e 12 credenciais privilegiadas passaram de 90 dias sem recertificação.

1. Monte a linha de base. Compare cada evento com o limiar aprovado, e não com o trimestre anterior. A indisponibilidade somou 40 minutos, dentro de uma hora tolerada. A exposição de contatos violou a tolerância de zero registro. As 12 credenciais violaram a tolerância de zero.
2. Classifique por materialidade, e não por barulho. Dois rompimentos e um evento dentro da tolerância: o relatório abre com os dois rompimentos.
3. Escreva o bloco de riscos com movimento. Neste exemplo: risco de continuidade do faturamento estável; risco de vazamento por terceiro subiu, porque a exposição veio de fornecedor; risco de credencial privilegiada sem controle subiu, com 12 casos.
4. Descreva a causa, não o sintoma. A exposição veio de fornecedor sem cláusula de notificação e sem avaliação prévia de segurança; as credenciais decorrem de um processo de recertificação trimestral que não tem dono nomeado.
5. Escreva a decisão pedida. Exemplo: "Aprovar a exigência de cláusula de notificação em 72 horas e de avaliação de segurança prévia em todos os contratos de fornecedor com dado pessoal, com vigência de 90 dias e custo estimado de R$ 60 mil em assessoria jurídica e revisão contratual. Sem a decisão, o risco de nova exposição permanece acima do apetite declarado."
6. Registre a decisão. O CSF 2.0 pede que respostas a risco sejam escolhidas, priorizadas, planejadas, acompanhadas e comunicadas (`ID.RA-06`), e que as melhorias identificadas em avaliações sejam incorporadas (`ID.IM-01`). A ata da reunião é a evidência de que a supervisão aconteceu.
7. Feche o ciclo de auditoria. Cada achado relacionado aos eventos ganha dono e data, e entra na contagem de idade média de achados abertos que o conselho verá no trimestre seguinte.

A página final tem 5 indicadores, 3 riscos com movimento, 2 rompimentos de tolerância e 1 decisão com valor. Vinte linhas de texto e cinco números.

### 5.4 Problema de completar

Complete a ficha e a decisão pedida.

1. Indicador "percentual de servidores com agente de endpoint atualizado" — tipo: ______; fonte do dado: ______; limiar vermelho: ______; ação se vermelho: ______.
2. Indicador "tempo entre publicação de correção crítica e aplicação em produção" — tipo: ______; por que ele é melhor indicador de governança que o contador de vulnerabilidades abertas: ______.
3. O rompimento da tolerância de confidencialidade ocorreu dois dias antes da reunião do conselho. O que o CISO deve fazer antes da reunião: ______.
4. A decisão pedida precisa conter quatro elementos. Quais são: ______.

Regra de conferência: cada indicador tem fonte, dono, limiar e ação; a decisão pedida tem valor, prazo, dono e consequência de não decidir.

## 6. Por que isso importa para o CISO

O relatório é o instrumento pelo qual o CISO existe para o conselho. Sem número comparável, o executivo só consegue avaliar segurança por incidente, e a única métrica passa a ser "aconteceu algo ruim ou não". Empresas que avaliam segurança por incidente cortam verba em anos calmos e aumentam verba depois de um susto, o que é o oposto de gestão.

A auditoria define a segunda fonte de credibilidade. O modelo da IIA estabelece que a asseguração da terceira linha tem o mais alto grau de objetividade e confiança, justamente por sua independência da gestão, e que a gestão comunica o órgão de governança sobre resultados planejados, realizados e esperados, riscos e resposta a risco ([theiia.org](https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf), acessado em 2026-09-25). O CISO que interfere no plano de auditoria interna, ou que acumula a função de auditar o próprio controle, destrói essa fonte e obriga o conselho a contratar asseguração externa.

## 7. Aplicação prática

Em 30 dias, sem consultoria.

1. Reduza o painel atual a no máximo 8 indicadores, aplicando o teste de mérito da seção 5.2. Os cortados vão para o painel operacional, e não somem.
2. Escreva a ficha de definição dos 8, com fórmula, fonte, dono, frequência, limiar e ação.
3. Monte a página do conselho com os cinco blocos e leve-a ao patrocinador executivo antes da reunião. Peça uma única crítica: a decisão pedida está clara?
4. Abra a lista de achados de auditoria abertos com dono e data e calcule a idade média. Esse é o primeiro indicador de governança que você pode publicar sem depender de ferramenta nova.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre a diferença entre indicador de desempenho e de risco, uma sobre o que torna um relatório acionável, e uma conectando o tema a uma reunião que você já tem na agenda.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Mais indicadores significam mais controle | Painel grande dilui a atenção e não muda decisão | No máximo 8 indicadores com dono, limiar e ação; o resto é painel operacional |
| Número de alertas mede detecção | Volume de alerta cresce com ruído e não indica risco tratado | Meça tempo de exposição, cobertura e tempo de contenção |
| Relatório é prestação de contas | Relatório sem decisão pedida não fecha o ciclo de supervisão do `GV.OV` | Cada reporte traz ao menos uma decisão pedida, com valor e consequência |
| Auditoria interna pode ficar subordinada ao CISO | Quem desenha o controle não dá asseguração independente sobre ele | Auditoria interna responde ao órgão de governança, com plano aprovado por ele |
| Achado sem causa vira ação corretiva | Plano que trata sintoma reabre o mesmo achado no ciclo seguinte | Registro com descrição, causa, dono e data, e idade média reportada |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais três resultados do CSF 2.0 compõem a categoria `GV.OV`, e o que cada um pede?
2. Cite as quatro perguntas do teste de mérito de um indicador.
3. Quais oito campos compõem a ficha de definição de um indicador?
4. Qual a diferença de accountability entre auditoria interna, auditoria de certificação e inspeção regulatória?
5. Quais cinco blocos aparecem na página de reporte ao conselho, e qual deles é obrigatório em qualquer versão do relatório?

<details>
<summary>Conferir respostas</summary>

1. `GV.OV-01`, resultados da estratégia de gestão de risco revisados para informar e ajustar estratégia e direção; `GV.OV-02`, estratégia revisada e ajustada para cobrir requisitos e riscos organizacionais; `GV.OV-03`, desempenho da gestão de risco avaliado e revisado para os ajustes necessários.
2. Muda alguma decisão possível? Tem dono nomeado? Tem limiar e ação pré-acordada? A série histórica é comparável?
3. Nome, tipo, fórmula, fonte do dado, dono, frequência, limiar em três faixas e ação pré-acordada para a faixa vermelha.
4. Auditoria interna é terceira linha, independente da gestão e accountable perante o órgão de governança. Auditoria de certificação é contratada pela organização, avalia contra requisito e dentro de escopo declarado. Inspeção regulatória é conduzida pelo supervisor, com poder sancionatório e obrigação legal de resposta.
5. Exposição contra apetite; riscos materiais com movimento; incidentes materiais; auditoria e remediação; decisão pedida. O bloco obrigatório é a decisão pedida: sem ele o reporte não fecha o ciclo de supervisão.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Reescrever o painel com no máximo 8 indicadores e fichas completas | Rebaixar: repetir em D+3 |
| D+30 | Apresentar a página de reporte ao patrocinador executivo e registrar a crítica | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 02-governanca-risco-compliance#TEMA-03 | sem limiar declarado não existe amarelo nem vermelho no relatório, e sem relatório o limiar nunca é aplicado |
| complementa | 17-lideranca-ciso#TEMA-03 | o número que sobe ao conselho é o mesmo que disputa orçamento no ciclo seguinte; destino planejado |
| nao_confundir_com | 13-ofensiva-pentest#TEMA-01 | teste ofensivo aponta falha pontual em um alvo; auditoria verifica se o sistema de gestão opera como declarado; destino planejado |

## 13. Certificações e leitura recomendada

O domínio 3 do CISM responde por 33% das questões e traz, entre os subtemas, métricas do programa de segurança da informação, comunicação e reporte, e teste e avaliação de controle. As tarefas de apoio incluem compilar e apresentar relatórios sobre atividades, tendências e efetividade, e definir e monitorar métricas gerenciais e operacionais ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25).

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Program | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CISM | Information Security Governance | Three Lines Model | primaria | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf |
| CRISC | Cobertura geral do tema | ISACA CRISC | primaria | https://www.isaca.org/credentialing/crisc |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 3 | The IIA's Three Lines Model, julho de 2020 | primaria | https://www.theiia.org/globalassets/site/communication/2020/three-lines-model-updated.pdf | "2026-09-25" | alta |
| 4 | ISO/IEC 27001:2022 — Requirements | primaria | https://www.iso.org/standard/27001 | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a duração e o ciclo das auditorias de certificação, que seguem documentos obrigatórios do IAF; os limiares e percentuais usados nas fichas são ilustrativos.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Tema anterior | [TEMA-05](TEMA-05-frameworks-nist-csf-2-cis-controls.md) |
| Home | [README](../README.md) |
