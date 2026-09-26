---
tema: "O papel e o mandato do CISO"
tema_id: "TEMA-01"
area_id: "17-lideranca-ciso"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Descrever o próprio mandato em termos de responsabilidade, autoridade e recursos, citando um limite explícito de escopo e uma decisão real da sua organização que ele autoriza."
atende_objetivo: [1]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: []
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-06"
      motivo: "o mandato vira fila de trabalho com dono e data no plano de maturidade"
  nao_confundir_com:
    - alvo: "14-dados-privacidade#TEMA-06"
      motivo: "responder por risco cibernético não transfere ao CISO o papel do encarregado pelo tratamento de dados pessoais"
fontes:
  - titulo: "NIST Cybersecurity Framework (CSF) 2.0 — NIST CSWP 29"
    url: "https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA European Cybersecurity Skills Framework — Role Profiles"
    url: "https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "European Commission — NIS2 Directive: securing network and information systems"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "EC-Council CCISO Blueprint v3"
    url: "https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISACA CISM Exam Content Outline"
    url: "https://www.isaca.org/credentialing/cism/cism-exam-content-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# O papel e o mandato do CISO

O mandato é o conjunto de decisões que você pode tomar sozinho, o que precisa de aprovação e o que
não é seu. Sem esse recorte escrito, toda discussão vira disputa de opinião.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: descrever o próprio mandato em termos de
responsabilidade, autoridade e recursos, citando um limite explícito de escopo e uma decisão real
da sua organização que ele autoriza.

## 2. Pré-requisitos

Nenhum. O vocabulário mínimo de risco e controle está em [01 Fundamentos](../01-fundamentos/README.md)
e a lista de obrigações legais em [00 Guia básico do CISO](../00-guia-basico/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Se um diretor pede que você aprove o lançamento de um sistema sem MFA, quem decide hoje na sua empresa? Aposte antes de ler.
   Confiança: ___
2. Um incidente com dados pessoais acontece. Quem você acha que responde perante o regulador: você, o encarregado ou a diretoria? Aposte.
   Confiança: ___
3. Você aposta que existe, hoje, um documento que limita o que você pode decidir sozinho? Sim, não ou parcialmente.
   Confiança: ___
## 4. Caso real

A Comissão Europeia descreve a Diretiva 2022/2555 (NIS2) como a norma que "introduz a
responsabilização da alta administração pelo descumprimento das medidas de gestão de risco de
segurança cibernética, trazendo assim a segurança cibernética para a sala do conselho"
(https://digital-strategy.ec.europa.eu/en/policies/nis2-directive, acessado em 25/09/2026).

A frase produz uma pergunta desconfortável para quem acabou de assumir o cargo: se a
responsabilização é da alta administração e a execução é sua, qual parcela do risco tem o seu
nome na linha do dono? É isso que o resto do tema resolve.

## 5. Conteúdo

### 5.1 Conceito

O mandato tem três componentes verificáveis, e os três aparecem no CSF 2.0. O primeiro é
responsabilidade: a subcategoria `GV.RR-01` estabelece que "a liderança organizacional é
responsável e accountable pelo risco de segurança cibernética e fomenta uma cultura que é
consciente do risco, ética e em melhoria contínua". O segundo é autoridade: `GV.RR-02` exige que
papéis, responsabilidades e autoridades relacionadas à gestão do risco cibernético sejam
estabelecidos, comunicados, compreendidos e aplicados. O terceiro é recurso: `GV.RR-03` determina
que recursos adequados sejam alocados de forma proporcional à estratégia de risco, aos papéis, às
responsabilidades e às políticas.

O mandato não se confunde com o cargo. O cargo define o assento na reunião; o mandato define o que
você pode decidir sentado nele. Três casos ajudam a separar os dois: decidir o padrão técnico de
autenticação é autoridade delegada; aceitar formalmente um risco residual alto é decisão de quem
detém o apetite de risco; tratar dado pessoal e responder ao titular é atribuição do encarregado
pelo tratamento de dados.

Existe um limite superior que quase ninguém escreve e quase todo mundo descobre tarde: o CISO
responde por gestão de risco cibernético, não por todos os riscos de tecnologia. Indisponibilidade
causada por capacidade insuficiente de infraestrutura, por exemplo, é risco operacional do dono do
serviço. A fronteira precisa estar declarada antes do primeiro incidente, não depois.

### 5.2 Como funciona

O mecanismo é uma matriz de três colunas aplicada a cada tipo de decisão. Coluna 1: quem decide.
Coluna 2: quem aprova ou aceita o risco. Coluna 3: quem é informado depois. O conteúdo vem do
CSF 2.0, cuja função Govern existe para informar como as outras cinco funções serão implementadas,
e da própria prática de governança descrita nos programas de certificação da área.

O CISM trata o assunto no Domínio 1, "Information Security Governance", com os tópicos
"Organizational Structures, Roles and Responsibilities" e "Strategic Planning (Budgets, Resources,
Business Case)", e traz entre as tarefas de apoio "definir, comunicar e monitorar
responsabilidades de segurança da informação em toda a organização e as linhas de autoridade"
(https://www.isaca.org/credentialing/cism/cism-exam-content-outline, acessado em 25/09/2026).

O CCISO trata do mesmo assunto pelo lado do conselho, no Domínio 1, ao incluir "compreender o
papel do conselho de administração e o papel do CISO no apoio ao conselho"
(https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf, acessado em 25/09/2026, páginas
2 e 3). A consequência operacional é direta: apoiar o conselho é uma tarefa do cargo, com produto
próprio, e não uma cortesia de agenda.

No Brasil, a Resolução CMN nº 4.893, de 26/02/2021, exige no art. 7º designar diretor responsável
pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes
(fonte primária bcb.gov.br, registrada em
[registro de verificação](../99-fontes/registro-verificacao.md), item 21).

O ENISA publica, desde 19/09/2022, o perfil de papel "CISO" entre os 12 perfis do European
Cybersecurity Skills Framework, com missão, tarefas, conhecimentos e competências descritos
(https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles,
acessado em 25/09/2026). A utilidade prática é externa: dá para descrever a vaga e o mandato em
linguagem que auditoria, recrutamento e área de pessoas entendem sem tradução.

### 5.3 Exemplo resolvido

Situação: você assume o cargo em uma empresa de 900 funcionários, com 14 pessoas de TI e nenhuma de
segurança. O primeiro pedido que chega é aprovar a entrada de um SaaS de atendimento ao cliente que
processa dado pessoal, com login por e-mail e senha.

Passo 1. Classifique a decisão pelo efeito, não pelo assunto. O efeito é um novo tratamento de dado
pessoal com um controle de acesso insuficiente. Isso toca duas competências: risco cibernético
(seu) e conformidade de privacidade (do encarregado).

Passo 2. Preencha a matriz para essa decisão.

| Elemento | Quem | Por quê |
|---|---|---|
| Decide o padrão de autenticação aceitável | CISO | autoridade delegada, `GV.RR-02` |
| Aprova a exceção, se o fornecedor não suportar MFA | dono do processo de negócio, com registro no registro de riscos | é ele quem detém o risco operacional |
| Aceita o risco residual formalmente | comitê de risco, dentro do apetite declarado | apetite é decisão de quem responde pelo negócio |
| É informado do tratamento de dado pessoal | encarregado pelo tratamento de dados | competência própria, não sua |
| Fornece evidência técnica e o parecer | segurança da informação | execução |

Passo 3. Escreva o registro. Três linhas: controle exigido, exceção concedida e quem assinou.

Resultado: a decisão deixa de ser "o CISO liberou" e passa a ser "o negócio aceitou um risco
declarado, com o controle exigido registrado". Essa diferença é o produto do mandato.

### 5.4 Problema de completar

Use a mesma situação, agora com um sistema interno de folha de pagamento e sem dado pessoal de
cliente. As duas primeiras etapas estão feitas; complete as três últimas.

1. Classifique pelo efeito: indisponibilidade de um processo crítico de RH às vésperas do
   fechamento mensal.
2. Preencha para a linha "quem decide o padrão de autenticação": CISO, por autoridade delegada.
3. Aprova a exceção de MFA para 3 usuários administrativos: _______
4. Aceita o risco residual e registra no apetite: _______
5. Quem é informado e qual evidência fica arquivada: _______

## 6. Por que isso importa para o CISO

Muda a conversa sobre incidente. Sem mandato escrito, a pergunta que chega no dia seguinte é "por
que a segurança não impediu?". Com responsabilidade, autoridade e recursos declarados, a pergunta
passa a ser "qual controle foi exigido, quem aprovou a exceção e em quanto tempo corrigimos?".
A primeira pergunta não tem resposta; a segunda tem documento. É essa diferença que define a
sobrevida do cargo depois de um incidente material.

## 7. Aplicação prática

Escreva a sua carta de mandato em uma página, com quatro blocos: o que você entrega, o que você
decide sozinho, o que exige aprovação e o que está fora do seu escopo. Leve para a próxima
conversa com o seu gestor e peça correção de rota. Guarde a versão corrigida com data.

## 8. Autoexplicação

Explique o tema em 3 frases, sem consultar o texto, e conecte-o a uma decisão que você tomou nos
últimos sete dias. Se não conseguir apontar a decisão, o mandato ainda está indefinido na prática.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| "O CISO é dono de todo o risco de tecnologia" | Risco operacional e de capacidade pertence ao dono do serviço | Declare a fronteira por escrito e trate o resto como risco de terceiro |
| "Quem tem o cargo tem o mandato" | Cargo dá assento; mandato dá autoridade sobre decisões específicas | Documente as decisões que você autoriza, com base em `GV.RR-02` |
| "Ser accountable significa que executo" | Executar e responder são camadas distintas | Defina quem executa o controle e quem assina o aceite do risco |
| "O encarregado de dados está dentro da segurança" | O papel do encarregado tem competência própria, ligada a dado pessoal | Marque a fronteira e chame o encarregado nas decisões que tratam dado pessoal |
| "Pedir mais verba é sinal de falha de gestão" | `GV.RR-03` vincula recursos à estratégia de risco declarada | Peça com risco documentado, não com urgência |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual subcategoria do CSF 2.0 declara a liderança responsável e accountable pelo risco cibernético?
2. Quais são os três componentes verificáveis do mandato, e em quais subcategorias do CSF 2.0 eles aparecem?
3. Qual é a fronteira entre o CISO e o encarregado pelo tratamento de dados?

<details>
<summary>Conferir respostas</summary>

1. `GV.RR-01`, na categoria Roles, Responsibilities, and Authorities da função Govern.
2. Responsabilidade (`GV.RR-01`), autoridade (`GV.RR-02`) e recursos (`GV.RR-03`).
3. O CISO responde pela gestão do risco cibernético; o encarregado responde pelo tratamento de dado pessoal e pela interlocução com titulares e autoridade. As duas competências se cruzam em incidentes que envolvem dado pessoal, sem se sobrepor.
</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo
([91-trilhas/](../91-trilhas/)), que mantém `proxima_revisao` no registro de progresso.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar o tema em 3 frases para alguém de fora da segurança | Rebaixar: repetir em D+3 |
| D+30 | Reler a carta de mandato e verificar se ocorreu decisão fora dela | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 17-lideranca-ciso#TEMA-06 | o mandato vira fila de trabalho com dono e data no plano de maturidade |
| nao_confundir_com | 14-dados-privacidade#TEMA-06 | responder por risco cibernético não transfere ao CISO o papel do encarregado pelo tratamento de dados pessoais |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Leitura recomendada |
|---|---|---|
| CISM | Governança de segurança da informação; gestão de risco; programa de segurança; gestão de incidentes | [NIST Cybersecurity Framework (CSF) 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf) |
| CCISO | Governança de segurança, risco e conformidade; liderança executiva; controles e operação do programa; fundamentos técnicos do executivo; planejamento estratégico, finanças e terceiros | [ENISA European Cybersecurity Skills Framework](https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles) |
## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST CSF 2.0 — NIST CSWP 29, 26/02/2024 | primaria | https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf | "2026-09-25" | alta |
| 2 | European Commission — NIS2 Directive | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |
| 3 | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |
| 4 | EC-Council CCISO Blueprint v3 | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf | "2026-09-25" | alta |
| 5 | ENISA ECSF Role Profiles, 19/09/2022 | primaria | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [17 Liderança e gestão do CISO](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-posicao-e-reporte.md) |
| Home | [README](../README.md) |
