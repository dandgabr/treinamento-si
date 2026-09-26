---
tema: "Política, norma, procedimento e diretriz"
tema_id: "TEMA-02"
area_id: "02-governanca-risco-compliance"
nivel: intermediario
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Classificar um documento de segurança no nível correto da hierarquia documental e reescrever 5 trechos com verbo de obrigação, escopo, responsável e critério verificável"
atende_objetivo: [2]
certificacoes: ["CISM"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-01"
      motivo: "o documento registra a decisão e a alçada que o mapa de direitos de decisão atribui"
  aplicado_em:
    - alvo: "15-fatores-humanos#TEMA-03"
      motivo: "a norma só muda comportamento quando o programa de conscientização a traduz para a rotina de quem executa; destino planejado"
  aprofundado_por: []
  nao_confundir_com: []
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
  - titulo: "ISO/IEC 27001:2022 — Information security management systems — Requirements"
    url: "https://www.iso.org/standard/27001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023 — catálogo oficial ABNT"
    url: "https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0="
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Política, norma, procedimento e diretriz

A ISACA lista, entre as tarefas de apoio do CISM, estabelecer e manter políticas, procedimentos e diretrizes de segurança da informação e estabelecer, comunicar e manter políticas, normas, diretrizes, procedimentos e outros documentos organizacionais ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). São quatro níveis distintos, com aprovadores distintos. A falha mais comum em empresas de porte médio não é ter pouca documentação, e sim ter procedimento aprovado pelo conselho, norma publicada como recomendação e diretriz tratada como obrigação.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: classificar um documento de segurança no nível correto da hierarquia documental e reescrever 5 trechos com verbo de obrigação, escopo, responsável e critério verificável.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md), porque o nível do documento determina quem assina, e quem assina vem da alçada.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantos documentos de segurança em vigor na sua empresa você nomeia de cabeça? Anote o número.
   Confiança: ___
2. Palpite: quem assina a norma de senha na sua organização hoje? Aposte um cargo, não uma pessoa.
   Confiança: ___
3. Antes de ler: exceção sem data de expiração é mais comum na sua empresa do que exceção com prazo? Aposte.
   Confiança: ___
4. Chute: o conselho da sua empresa aprova procedimento operacional? Sim ou não.
   Confiança: ___

## 4. Caso real

Um achado de auditoria recorrente em empresas certificadas: o auditor pede a norma de controle de acesso, recebe um documento de 40 páginas aprovado pelo comitê executivo, com o passo a passo de cadastro de usuário no sistema de RH. O auditor não questiona o conteúdo; questiona o nível. Passo a passo operacional aprovado no mais alto nível significa que toda troca de sistema exige uma nova aprovação executiva, e por isso o documento fica desatualizado em relação ao procedimento real.

A pergunta que o caso deixa aberta: se o procedimento muda a cada troca de ferramenta, como a norma continua estável por anos sem perder aderência à realidade? A resposta está na separação entre o que não deve mudar e o que deve mudar rápido.

## 5. Conteúdo

### 5.1 Conceito

São quatro níveis, e cada um responde a uma pergunta diferente. Política responde por que a empresa protege informação e quais princípios valem para todos, inclusive para quem não é da área técnica. Norma responde o que é obrigatório, com critério verificável e um dono nomeado. Procedimento responde como se executa uma tarefa específica, na ferramenta que a empresa usa hoje. Diretriz responde como fazer melhor quando há mais de um caminho aceitável, sem obrigação.

O CSF 2.0 trata da política na categoria `GV.PO`, com dois resultados: a política de gestão de risco cibernético é estabelecida com base no contexto organizacional, na estratégia e nas prioridades, e é comunicada e aplicada; e ela é revisada, atualizada, comunicada e aplicada para refletir mudanças em requisitos, ameaças, tecnologia e missão (`GV.PO-01` e `GV.PO-02`, [NIST CSWP 29](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf), acessado em 2026-09-25). Repare no verbo: a política é comunicada e aplicada, e não apenas publicada. Aplicar significa que existir descumprimento sem consequência é falha de desenho do documento, não de caráter de quem descumpriu.

A ISACA coloca políticas, procedimentos e diretrizes dentro do domínio 3 do CISM, Information Security Program, que responde por 33% das questões, e lista políticas, procedimentos e diretrizes junto de normas e frameworks do setor entre os subtemas de desenvolvimento do programa ([isaca.org](https://www.isaca.org/credentialing/cism/cism-exam-content-outline), acessado em 2026-09-25). A credencial trata os quatro níveis como um sistema de documentos governado, não como arquivos soltos em uma pasta compartilhada.

### 5.2 Como funciona

**Teste de nível.** Quatro perguntas classificam qualquer documento. A regra vale para todos os funcionários, inclusive os que não operam tecnologia? É política. A regra define um critério que um auditor pode testar em uma amostra e tem dono nomeado? É norma. A regra descreve cliques e telas de uma ferramenta específica? É procedimento. A regra admite mais de uma forma correta e não gera não conformidade quando ignorada? É diretriz.

**Aprovação coerente com o nível.** Política é aprovada pelo mais alto nível executivo, porque vale para a empresa inteira e toca orçamento e cultura. Norma é aprovada pelo dono da função que responde pela regra, com parecer de segurança. Procedimento é aprovado pelo dono da operação. Diretriz é publicada pelo time que tem a prática, com revisão anual.

**Ciclo de revisão proporcional.** Diretriz e procedimento acompanham a ferramenta: revisão a cada mudança relevante, no máximo anual. Norma tem revisão anual. Política tem revisão a cada dois anos, ou antes se mudar a obrigação legal ou a estratégia.

**Redação verificável.** Toda norma tem quatro elementos: verbo de obrigação, sujeito explícito, critério mensurável e evidência esperada. "Os administradores devem ser criteriosos no uso de privilégios" não é norma, porque nenhum auditor testa critério. "Todo acesso administrativo a ambiente de produção é concedido por no máximo 8 horas, aprovado nominalmente, registrado no sistema de tickets e revisto em 24 horas" é norma, porque a amostra se testa em cinco minutos.

**Exceção com prazo e dono.** Toda norma precisa do caminho de exceção. O registro de exceção tem cinco campos: quem pediu, o que a norma exigiria, o que será feito em substituição, quem aprovou, e a data em que ela expira. Exceção sem data de expiração é a norma nova, escrita por acidente.

### 5.3 Exemplo resolvido

Três trechos reais de empresas diferentes, reescritos no nível correto.

| Trecho original | Nível atual | Nível correto | Versão corrigida |
|---|---|---|---|
| "Os colaboradores devem usar senhas fortes e trocá-las com frequência." | Política, com regra técnica embutida | Norma | "Toda conta humana em sistema corporativo exige autenticação com dois fatores. Senha com no mínimo 12 caracteres, sem reúso nos 5 últimos valores. Exceção aprovada pelo dono da plataforma, válida por 90 dias. Evidência: relatório de cobertura de MFA e registro de exceções." |
| "O procedimento de provisionamento de acesso deve ser aprovado pelo comitê executivo." | Procedimento aprovado no nível da política | Procedimento, aprovado pelo dono da operação | O documento desce para o dono da operação de identidade, com versão e data. O comitê executivo passa a aprovar apenas a norma de controle de acesso. |
| "Recomenda-se revisar os acessos periodicamente." | Diretriz disfarçada de norma | Norma | "Acessos privilegiados são revistos a cada 90 dias pelo dono da plataforma, com registro de remoção ou reconfirmação. Evidência: relatório de recertificação assinado." |

Passo a passo do método usado, aplicável a qualquer trecho:

1. Identifique o sujeito obrigado. Se o texto não nomeia quem deve agir, ele não é norma.
2. Substitua o adjetivo por número. "Frequente", "criterioso" e "adequado" saem; entram contagem, prazo e percentual.
3. Confirme quem tem autoridade para assinar aquele nível. Se o aprovador não existe na alçada, o documento não sai do papel.
4. Escreva a evidência esperada. Se você não sabe qual relatório prova o cumprimento, a norma não é auditável.
5. Registre a exceção aplicável. Toda norma que ninguém consegue cumprir integralmente hoje precisa do caminho formal para a diferença.

### 5.4 Problema de completar

Complete os campos em branco, aplicando o método.

| Trecho | Problema de nível ou de redação | Reescrita |
|---|---|---|
| "Backups devem ser feitos regularmente e guardados com segurança." | ______ | ______ |
| "A área de TI deve garantir a disponibilidade dos sistemas." | Sujeito amplo demais e sem critério; disponibilidade sem número não se testa | ______ |
| "Os gestores devem aprovar os acessos de suas equipes antes da concessão." | Falta a evidência e o prazo de revisão | ______ |

Regra de conferência: se a reescrita não tem número, dono e evidência, ela não passa no teste de norma.

## 6. Por que isso importa para o CISO

O nível do documento define quem pode ser responsabilizado. Um desvio em procedimento é problema de treinamento e de supervisão; um desvio em norma é não conformidade, com plano de ação, prazo e escalonamento. Quando a empresa escreve tudo no nível de política, o CISO perde a capacidade de escalar em camadas: qualquer descumprimento vira questão de conselho. Quando escreve regra obrigatória como recomendação, perde a autoridade para exigir correção.

Há um efeito direto em auditoria. A ABNT NBR ISO/IEC 27001:2022 estabelece requisitos para estabelecer, implementar, manter e melhorar continuamente um sistema de gestão, e o catálogo da ABNT registra que a exclusão de qualquer requisito das seções 4 a 10 não é aceitável quando a organização busca conformidade ([abntcatalogo.com.br](https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0=), acessado em 2026-09-25). Um sistema de gestão sem hierarquia documental clara produz não conformidade em série, porque o auditor não consegue determinar qual é a regra aplicável.

## 7. Aplicação prática

Pegue 10 documentos de segurança da sua empresa, escolhidos entre os mais consultados pelos times.

1. Classifique cada um nos quatro níveis, usando o teste de nível da seção 5.2, e anote o aprovador atual.
2. Marque em vermelho os que estão no nível errado, e escreva ao lado o nível correto.
3. Escolha os 5 piores e reescreva apenas o trecho crítico, com verbo de obrigação, critério mensurável e evidência.
4. Para cada um dos 5, registre por escrito qual exceção existe hoje na prática, mesmo que informal, e transforme-a em exceção formal com prazo.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto. Uma frase sobre o que muda no dia a dia do time quando a regra desce para o nível de procedimento, uma sobre o custo de escrever recomendação onde deveria haver obrigação, e uma conectando a hierarquia documental a um documento real que você já assinou.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Política deve conter a regra técnica | Política aprovada no topo e alterada a cada mudança de ferramenta acumula atraso e perde credibilidade | Política traz princípios estáveis; o critério verificável fica na norma |
| Diretriz é norma que não deu certo | Diretriz é escolha entre caminhos aceitáveis, e ignorá-la não gera não conformidade | Se o descumprimento precisa de plano de ação, o documento é norma |
| Exceção é exceção para sempre | Prazo não declarado transforma a exceção em configuração permanente e não auditada | Exceção tem aprovador, substituição declarada, prazo e revisão |
| Norma precisa de linguagem jurídica | Textos longos e abstratos reduzem aderência e aumentam interpretação divergente | Norma se escreve curta, com sujeito, número e evidência |
| Documento publicado é documento aplicado | O CSF 2.0 pede política comunicada e aplicada, não apenas estabelecida | Comunicação, treinamento e consequência entram no desenho da norma |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais quatro perguntas classificam um documento nos níveis política, norma, procedimento e diretriz?
2. Quais quatro elementos tornam uma norma verificável em auditoria?
3. Quais cinco campos um registro de exceção precisa ter?
4. O CSF 2.0 exige que a política seja apenas estabelecida? Cite os dois resultados de política e o que eles pedem.
5. Por que procedimento operacional aprovado no conselho gera desatualização?

<details>
<summary>Conferir respostas</summary>

1. Vale para todos, inclusive não técnicos? Define critério testável com dono nomeado? Descreve cliques de uma ferramenta? Admite mais de um caminho correto sem gerar não conformidade? As respostas apontam, na ordem, política, norma, procedimento e diretriz.
2. Verbo de obrigação, sujeito explícito, critério mensurável e evidência esperada.
3. Quem pediu, o que a norma exigiria, o que será feito em substituição, quem aprovou e a data de expiração.
4. Não. `GV.PO-01` pede política estabelecida com base no contexto e na estratégia, comunicada e aplicada; `GV.PO-02` pede revisão, atualização, comunicação e aplicação diante de mudanças em requisitos, ameaças, tecnologia e missão.
5. Porque cada mudança de ferramenta exige nova aprovação no nível mais alto, e o tempo de aprovação executiva é maior que o tempo de mudança operacional. O procedimento real passa a divergir do aprovado.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Classificar 3 documentos novos da empresa sem consultar o texto | Rebaixar: repetir em D+3 |
| D+30 | Publicar uma norma reescrita e medir a aderência em 30 dias | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 15-fatores-humanos#TEMA-03 | a norma só muda comportamento quando o programa de conscientização a traduz para a rotina de quem executa; destino planejado |
| complementa | 02-governanca-risco-compliance#TEMA-01 | o documento registra a decisão e a alçada que o mapa de direitos de decisão atribui |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Information Security Program | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CISM | Information Security Governance | CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | ISACA — CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 3 | ISO/IEC 27001:2022 — Requirements | primaria | https://www.iso.org/standard/27001 | "2026-09-25" | alta |
| 4 | ABNT NBR ISO/IEC 27001:2022 Versão Corrigida:2023 — catálogo ABNT | primaria | https://abntcatalogo.com.br/sebrae/norma.aspx?Q=WXV0VDkwSGkvd0Z5K2xqb0pOczhybU0xUGFhRllraFE4anAvT2lBQzNxbz0= | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a estrutura de seções e a lista de documentos obrigatórios exigidos pela ISO/IEC 27001:2022, que só é acessível no texto pago; os números usados nos exemplos de norma são ilustrativos.

---

| Navegação | |
|---|---|
| Área | [02 Governança, risco e compliance](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-papel-governanca-estrutura-decisoria.md) |
| Próximo tema | [TEMA-03](TEMA-03-apetite-tolerancia-risco.md) |
| Home | [README](../README.md) |
