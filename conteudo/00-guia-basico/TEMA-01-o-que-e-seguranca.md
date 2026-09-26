---
tema: "O que é segurança da informação e o que o CISO governa"
tema_id: "TEMA-01"
area_id: "00-guia-basico"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Descrever o perímetro de governança do CISO citando os seis modos de falha da definição legal de segurança da informação e nomeando três tipos de informação cobertos pela sua política"
atende_objetivo: [1]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: []
relacoes:
  complementa:
    - alvo: "00-guia-basico#TEMA-02"
      motivo: "o perímetro diz o que governar; os níveis de impacto da tríade dizem com que rigor cada item do perímetro é tratado"
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-01"
      motivo: "o perímetro definido aqui é o que a política precisa cobrir por escrito, e política é artefato da área 02"
  nao_confundir_com: []
fontes:
  - titulo: "FIPS PUB 199 — Standards for Security Categorization of Federal Information and Information Systems, fevereiro de 2004"
    url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — information security, conforme 44 U.S.C. § 3542"
    url: "https://csrc.nist.gov/glossary"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CSEC2017 — Cybersecurity Curricula, oito Knowledge Areas"
    url: "https://www.acm.org/binaries/content/assets/education/curricula-recommendations/csec2017.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Resolução CMN nº 4.893, de 26/02/2021, art. 7º"
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# O que é segurança da informação e o que o CISO governa

Uma ideia central: o perímetro do CISO é definido por informação e por obrigação, não por servidor e por ferramenta. Tudo o que vem depois neste roadmap é consequência desse recorte.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: descrever o perímetro de governança do CISO citando os seis modos de falha da definição legal de segurança da informação — acesso, uso, divulgação, interrupção, modificação e destruição não autorizados — e nomeando três tipos de informação da sua organização que estão cobertos pela política.

## 2. Pré-requisitos

Nenhum. Este é o primeiro tema do roadmap.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Na sua intuição, a definição legal de segurança da informação cobre mais ou menos do que o time de segurança da sua empresa faz hoje? Anote a direção do erro.
   Confiança: ___
2. Chute: o CISO responde pelo funcionamento do e-mail corporativo? Sim ou não, na sua leitura de hoje.
   Confiança: ___
3. Antes de ler: quem você procuraria primeiro para saber se um evento do mês passado é caso de segurança da informação — o jurídico, a infraestrutura ou o dono do processo? Aposte.
   Confiança: ___

## 4. Caso real

A Resolução CMN nº 4.893, de 26 de fevereiro de 2021, exige no art. 7º que as instituições autorizadas a funcionar pelo Banco Central designem um diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes.

O detalhe que interessa está na palavra "execução". A norma não pede um responsável pela redação do documento; pede alguém que responda por ele ter sido aplicado. Quem ocupa essa cadeira costuma ter agenda de negócio, não de infraestrutura, e por isso precisa de um recorte claro do que está sob sua responsabilidade antes de assinar qualquer coisa.

O caso deixa uma pergunta aberta: o que exatamente precisa estar dentro dessa política para que a execução seja avaliável?

## 5. Conteúdo

### 5.1 Conceito

A definição que serve de base para quase tudo o que vem depois está em lei, não em blog. O FIPS 199 reproduz o texto do 44 U.S.C. § 3542: segurança da informação é a proteção de informação e de sistemas de informação contra acesso, uso, divulgação, interrupção, modificação ou destruição não autorizados, com o objetivo de prover confidencialidade, integridade e disponibilidade.

Seis verbos e três objetivos. Os verbos são os modos de falha que você governa; os objetivos são o critério com que cada falha é medida. Acesso, uso, divulgação, interrupção, modificação e destruição cobrem desde alguém ver o que não devia até alguém apagar o que não podia. Nenhum deles menciona firewall, antivírus ou nuvem.

O segundo ponto é que a definição protege informação antes de proteger sistema. O próprio FIPS 199 observa que a categorização de segurança se aplica a informação em forma eletrônica ou não eletrônica. Isso tem consequência prática imediata: um contrato impresso na mesa do jurídico, um caderno de prontuário e uma planilha exportada para o notebook do diretor entram no mesmo perímetro do banco de dados.

O terceiro ponto é que o CSEC2017 organiza a formação em segurança em oito Knowledge Areas, e apenas três delas são técnicas no sentido usual. As outras tratam de fatores humanos, organizacionais e sociais. Um CISO que reduz o próprio escopo a sistema operacional e rede governa uma fração da definição legal e assina por inteiro.

### 5.2 Como funciona

O mecanismo que transforma a definição legal em trabalho executável é a categorização por impacto. Ele segue uma sequência fixa, definida no FIPS 199.

Primeiro se identificam os tipos de informação da organização — financeira, médica, contratual, de privacidade, de gestão de segurança. Depois, para cada tipo, atribui-se um nível de impacto em cada um dos três objetivos: LOW, MODERATE ou HIGH, e no caso da confidencialidade de um tipo de informação, também NOT APPLICABLE. Em seguida, o sistema que carrega esses tipos recebe, por objetivo, o valor mais alto entre os tipos que residem nele — o high water mark.

A consequência é direta: a categorização define onde o dinheiro vai. Um sistema classificado como HIGH em disponibilidade exige redundância, teste de restauração e monitoramento contínuo. O mesmo sistema classificado como LOW em disponibilidade pode ficar com um único servidor e uma janela de manutenção. O nível não é uma etiqueta de vaidade; é a linha de orçamento.

Há um detalhe que quase todo iniciante erra: NOT APPLICABLE só existe para confidencialidade de um tipo de informação. Para um sistema, o FIPS 199 não permite NOT APPLICABLE em nenhum objetivo, porque o próprio funcionamento do sistema precisa de um piso de proteção.

### 5.3 Exemplo resolvido

O exemplo 5 do FIPS 199 trata de uma planta de energia com sistema SCADA que controla a distribuição elétrica. O sistema carrega duas famílias de informação.

Dados de sensores em tempo real: confidencialidade NOT APPLICABLE, integridade HIGH, disponibilidade HIGH. A leitura do sensor não é segredo — ela não revela nada que precise ficar oculto. Mas se alguém altera a leitura, a operação reage a um dado falso. E se a leitura para, a operação fica cega.

Informação administrativa de rotina: LOW nas três. Folha de pagamento da equipe da planta não move turbina.

Aplicando o high water mark por objetivo, o sistema fica em confidencialidade LOW, integridade HIGH, disponibilidade HIGH. A gestão da planta então sobe a confidencialidade de LOW para MODERATE, com a justificativa de que informação de nível de sistema, como tabelas de roteamento e arquivos de chaves, também está exposta.

O resultado final é um registro de três valores. Dele saem decisões distintas: proteger a integridade e a disponibilidade dos sensores com controles físicos e de rede, e tratar a estação administrativa com um rigor menor em confidencialidade, mas sem ignorá-la. O que ficou de fora do exercício foi o preço — e é justamente aí que o próximo passo acontece.

### 5.4 Problema de completar

Uma operadora de plano de saúde tem um sistema único que processa três tipos de informação. Preencha as duas últimas linhas.

| Tipo de informação | Confidencialidade | Integridade | Disponibilidade |
|---|---|---|---|
| Dados de saúde dos beneficiários | HIGH | HIGH | MODERATE |
| Dados de cobrança e faturamento | MODERATE | HIGH | HIGH |
| Catálogo público de procedimentos e rede credenciada | NOT APPLICABLE | MODERATE | MODERATE |

| Categoria de segurança do sistema | Confidencialidade | Integridade | Disponibilidade |
|---|---|---|---|
| Sistema de gestão de beneficiários | ______ | ______ | ______ |

E responda: qual das três famílias de informação justifica o nível de confidencialidade do sistema, e o que muda no orçamento se a diretoria decidir tratar a disponibilidade como MODERATE por causa do atendimento em pronto-socorro?

## 6. Por que isso importa para o CISO

Duas frases que você vai ouvir na primeira semana. A primeira é "a segurança tem que proteger tudo". A segunda é "isso é problema de TI".

A definição legal e o mecanismo de categorização resolvem as duas. "Proteger tudo" não é executável: o próprio FIPS 199 admite NOT APPLICABLE para confidencialidade de um tipo de informação, ou seja, existem dados que de fato não exigem sigilo e assumir isso libera verba. "Isso é problema de TI" também não fecha: a definição alcança informação em papel e conversa, e o CSEC2017 coloca fatores humanos e organizacionais dentro do campo.

Quando o assunto chega ao comitê de auditoria, o recorte vira defesa. Um diretor designado que não consegue enumerar os tipos de informação sob sua política, nem o nível de cada um, está assinando algo cujo alcance desconhece. É a diferença entre responder por execução e responder por intenção.

## 7. Aplicação prática

Faça uma lista de dez tipos de informação da sua organização, em linguagem de negócio, como "prontuário", "folha de pagamento", "contrato com fornecedor", "código-fonte do produto", "registro de chamados de cliente". Para cada um, escreva em uma frase a consequência concreta de uma divulgação indevida: multa, perda de cliente, vantagem para o concorrente, constrangimento público, ação trabalhista.

Não consulte inventário de sistemas nem ferramenta de classificação. O objetivo é ter a lista no vocabulário de quem trabalha com a informação, não no vocabulário de quem opera o servidor. Depois, leve a lista a duas áreas de negócio e pergunte o que falta. A resposta costuma ser o tipo de informação mais exposto da empresa.

## 8. Autoexplicação

Feche o arquivo e explique o tema em três frases. Depois conecte-o a algo que você já faz: qual dos seis modos de falha aparece com mais frequência nos relatórios que chegam à sua mesa hoje?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Segurança da informação é o mesmo que segurança de TI | A definição legal alcança informação em forma eletrônica ou não eletrônica, e o CSEC2017 inclui fatores humanos, organizacionais e sociais entre as Knowledge Areas | O perímetro se define por informação e por obrigação; a TI é um dos meios de proteção, não o escopo |
| Tudo é crítico, logo tudo é HIGH | Se todo objetivo recebe HIGH, o high water mark não distingue nada e o orçamento não tem de onde sair | Níveis existem para ordenar gasto; NOT APPLICABLE para confidencialidade de um tipo de informação é uma saída legítima e documentada |
| NOT APPLICABLE significa "sem risco" | O valor só se aplica à confidencialidade de um tipo de informação; um sistema nunca recebe NOT APPLICABLE, porque o próprio funcionamento precisa de proteção | LOW é o piso de um sistema, e LOW ainda é proteção |
| A política de segurança descreve o que a TI faz | Política é o documento em que o perímetro e os responsáveis ficam escritos; descrever atividade técnica deixa de fora o que a norma cobra | A política precisa dizer quais tipos de informação estão cobertos e quem responde pela execução em cada um |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Cite os seis modos de falha da definição legal de segurança da informação e diga a qual deles a "conta administrativa sem segundo fator" expõe a organização.
2. Qual é a diferença entre o nível de impacto de um tipo de informação e o de um sistema?
3. Uma planilha exportada para o notebook de um diretor está dentro do perímetro da política? Justifique com o texto do FIPS 199.
4. Por que o FIPS 199 proíbe NOT APPLICABLE para um sistema?
5. Um diretor responde pela política de segurança cibernética e pela execução do plano de resposta. Qual palavra desse trecho muda o trabalho dele no dia a dia?

<details>
<summary>Conferir respostas</summary>

1. Acesso, uso, divulgação, interrupção, modificação e destruição não autorizados. A conta sem segundo fator expõe principalmente a acesso e uso não autorizados, e por tabela a divulgação e a modificação.
2. Para um tipo de informação, cada objetivo recebe LOW, MODERATE ou HIGH e a confidencialidade pode ser NOT APPLICABLE. Para um sistema, o valor de cada objetivo é o mais alto entre os tipos de informação residentes nele, e nenhum objetivo pode ser NOT APPLICABLE.
3. Está. O FIPS 199 registra que a categorização de um tipo de informação se aplica a informação em forma eletrônica ou não eletrônica, e a definição legal cobre a proteção de informação, não apenas do sistema que a armazena.
4. Porque o funcionamento básico do próprio sistema — processamento, funções críticas, informação de nível de sistema — exige um mínimo de proteção. O piso de um sistema é LOW.
5. "Execução". Assinar a política é um evento; responder pela execução é uma rotina de acompanhamento, cobrança de prazo e evidência.

</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo em [91-trilhas/](../91-trilhas/README.md), dono de `proxima_revisao`.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar o tema em 3 frases e listar três tipos de informação próprios | Rebaixar: repetir em D+3 |
| D+30 | Aplicar a categorização a um sistema real e comparar com o que a área técnica já pensava | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-01 | o perímetro definido aqui é o que a política precisa cobrir por escrito, e política é artefato da área 02 |
| complementa | 00-guia-basico#TEMA-02 | o perímetro diz o que governar; os níveis de impacto da tríade dizem com que rigor cada item do perímetro é tratado |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Cobertura geral do tema | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CCISO | Cobertura geral do tema | EC-Council CCISO Blueprint | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | FIPS PUB 199, fev/2004 — definição de segurança da informação e de tipo de informação, categorização por impacto, exemplos 1 a 5 | primaria | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf | "2026-09-25" | alta |
| 2 | CSEC2017 — oito Knowledge Areas da formação em segurança | primaria | https://www.acm.org/binaries/content/assets/education/curricula-recommendations/csec2017.pdf | "2026-09-25" | alta |
| 3 | Resolução CMN nº 4.893, de 26/02/2021, art. 7º — diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes | primaria | https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893 | "2026-09-25" | alta |
| 4 | ISACA CISM Exam Content Outline — 4 domínios | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [00 Guia básico do CISO](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-triade-cia.md) |
| Home | [README](../README.md) |
