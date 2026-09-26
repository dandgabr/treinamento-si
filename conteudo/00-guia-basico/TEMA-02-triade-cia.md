---
tema: "A tríade CIA na prática"
tema_id: "TEMA-02"
area_id: "00-guia-basico"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Aplicar a categorização por impacto a um ativo real, atribuindo LOW, MODERATE ou HIGH a confidencialidade, integridade e disponibilidade com a consequência operacional como justificativa"
atende_objetivo: [2]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "00-guia-basico#TEMA-01"
      motivo: "o perímetro diz o que governar; os níveis de impacto da tríade dizem com que rigor cada item do perímetro é tratado"
  aprofundado_por:
    - alvo: "01-fundamentos#TEMA-02"
      motivo: "a introdução aplica os três pilares a um ativo; a área 01 define os objetivos de segurança com precisão formal"
  aplicado_em: []
  nao_confundir_com: []
fontes:
  - titulo: "FIPS PUB 199 — Standards for Security Categorization of Federal Information and Information Systems, fevereiro de 2004"
    url: "https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27001:2022 — Information security, cybersecurity and privacy protection — Information security management systems — Requirements"
    url: "https://www.iso.org/standard/27001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CompTIA Security+ SY0-701 Exam Objectives — 5 domínios com pesos 12%, 22%, 18%, 28% e 20%"
    url: "https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline — 8 domínios, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# A tríade CIA na prática

Uma ideia central: confidencialidade, integridade e disponibilidade são três eixos independentes, cada um com um nível de impacto próprio, e é o nível, não o adjetivo "crítico", que define quanto se gasta para proteger.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: aplicar a categorização por impacto a um ativo real da sua organização, atribuindo LOW, MODERATE ou HIGH a confidencialidade, integridade e disponibilidade, com a consequência operacional escrita como justificativa de cada nível.

## 2. Pré-requisitos

TEMA-01, que define o que entra no perímetro. Este tema trata de como medir o que está dentro dele.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Na sua experiência, qual dos três objetivos é decidido por último na mesa do comitê — confidencialidade, integridade ou disponibilidade? Aposte e escreva por quê.
   Confiança: ___
2. Chute: quantos níveis de impacto entram na escala de risco que a sua empresa usa hoje? Anote o número.
   Confiança: ___
3. Palpite: um controle que melhora confidencialidade costuma sair de graça em disponibilidade? Escreva um exemplo seu.
   Confiança: ___

## 4. Caso real

O exemplo 1 do FIPS 199 trata de uma organização que mantém informação pública em um servidor web. A avaliação registra: sem impacto por perda de confidencialidade, impacto moderado por perda de integridade, impacto moderado por perda de disponibilidade.

A categoria resultante é confidencialidade NOT APPLICABLE, integridade MODERATE, disponibilidade MODERATE. Nada ali surpreende quem já fez o exercício: o conteúdo é público.

A parte que interessa vem depois. Se o dado é público, por que ele exige proteção moderada em dois dos três eixos? Alterar em silêncio o preço publicado ou o teor de uma cláusula em uma página oficial não é um problema de sigilo — é um problema de outra natureza, e o nível MODERATE diz que esse problema tem consequência séria para a organização. A pergunta que fica: séria em relação a quem, e medida como?

## 5. Conteúdo

### 5.1 Conceito

Os três objetivos vêm do mesmo trecho de lei que sustenta o tema anterior. O FIPS 199 cita o 44 U.S.C. § 3542 para definir cada um.

Confidencialidade é preservar restrições autorizadas de acesso e divulgação da informação, o que inclui meios de proteger privacidade pessoal e informação proprietária. Perda de confidencialidade é divulgação não autorizada. Integridade é guardar contra modificação ou destruição indevida da informação, e inclui garantir não repúdio e autenticidade. Perda de integridade é modificação ou destruição não autorizada. Disponibilidade é garantir acesso e uso da informação de forma tempestiva e confiável. Perda de disponibilidade é a interrupção do acesso ou do uso.

Três pontos costumam passar batido na leitura rápida. O primeiro: integridade não é sinônimo de backup. Não repúdio significa que quem assinou não pode negar depois; autenticidade significa que a origem é o que diz ser. Um relatório alterado por alguém com acesso legítimo é falha de integridade mesmo com backup intacto.

O segundo: disponibilidade é sobre tempo, não sobre existência. "Tempestiva" é a palavra da definição. Um sistema que responde em doze horas existe e está indisponível para o turno que precisava dele.

O terceiro: os eixos se movem separados. É possível ter disponibilidade HIGH e confidencialidade LOW no mesmo ativo, e é comum. Quem trata a tríade como um único carimbo de criticidade perde a informação mais útil do exercício.

### 5.2 Como funciona

O nível não sai de uma sensação; sai do tipo de efeito adverso que a perda produziria. O FIPS 199 fixa três faixas, e a escala de palavras é o mecanismo.

LOW corresponde a efeito adverso limitado: a organização continua executando suas funções primárias, ainda que com eficácia reduzida, e o prejuízo a ativos, dinheiro ou pessoas é pequeno. MODERATE corresponde a efeito adverso sério: degradação significativa da capacidade de executar funções primárias, dano significativo a ativos, perda financeira significativa ou dano significativo a pessoas, sem perda de vida ou risco de vida sério. HIGH corresponde a efeito adverso severo ou catastrófico: a organização deixa de executar uma ou mais funções primárias, ou há dano severo envolvendo perda de vida.

Note onde o critério está ancorado: em operação, ativo e pessoa. Não em volume de dados, não em preço do ativo, não em opinião técnica. Isso é o que permite usar o mesmo vocabulário no comitê e na sala de servidores.

O passo final é o high water mark: o nível de cada objetivo em um sistema é o mais alto entre os tipos de informação que residem nele. Um único tipo de informação HIGH em integridade sobe a integridade do sistema inteiro, ainda que os outros oito tipos sejam LOW. Não se calcula média, e não existe compensação entre objetivos — confidencialidade HIGH não autoriza rebaixar disponibilidade.

### 5.3 Exemplo resolvido

O exemplo 4 do FIPS 199 trata de um sistema de aquisições de uma organização contratante, com dois tipos de informação.

Informação contratual sensível, na fase que antecede a licitação: confidencialidade MODERATE, integridade MODERATE, disponibilidade LOW. A justificativa de cada nível segue a faixa de efeito: vazar o preço antes do certame causa dano significativo, mas a parada do sistema por um dia não interrompe a operação primária.

Informação administrativa de rotina, sem dado de privacidade: LOW nas três.

Aplicando o high water mark, o sistema de aquisições fica em confidencialidade MODERATE, integridade MODERATE, disponibilidade LOW. A linha da informação administrativa não muda nada do resultado, e isso é a informação mais útil da tabela: os controles que ela exige não devem elevar o custo do sistema.

Escrito o registro, a decisão fica visível. Criptografia e controle de acesso forte na informação contratual; um servidor único com janela de manutenção semanal é suficiente para disponibilidade. Se o dono do processo pedir redundância, a justificativa tem de vir com um nível novo de disponibilidade e com o motivo: parar o sistema impede a organização de executar uma função primária? Se não, LOW continua de pé.

### 5.4 Problema de completar

Um hospital de médio porte opera uma farmácia interna com dispensação de medicamentos controlados. Preencha os níveis que faltam e a linha da categoria do sistema.

| Tipo de informação | Confidencialidade | Integridade | Disponibilidade |
|---|---|---|---|
| Prescrição médica e prontuário | HIGH | HIGH | ______ |
| Estoque de medicamentos controlados | MODERATE | HIGH | LOW |
| Escala de plantão da equipe | LOW | MODERATE | MODERATE |

| Categoria de segurança do sistema | Confidencialidade | Integridade | Disponibilidade |
|---|---|---|---|
| Sistema da farmácia | ______ | ______ | ______ |

Responda ainda: qual tipo de informação definiu o nível de disponibilidade do sistema, e qual argumento o dono do processo precisaria apresentar para elevar a disponibilidade de todo o sistema a HIGH?

## 6. Por que isso importa para o CISO

O nível de impacto é o único lugar em que uma conversa de segurança vira conversa de verba sem virar conversa de susto. "O sistema é crítico" não autoriza gasto; "o sistema é MODERATE em integridade porque um registro de estoque alterado faz a organização perder rastreabilidade de medicamento controlado" autoriza.

Há também a economia da coisa. Cada objetivo elevado a HIGH puxa um conjunto de controles e um custo de operação. Uma organização que declara três HIGH em vinte sistemas comprou redundância para tudo e não sobrou verba para o que sustentava a função primária. O exercício de categorizar é onde o CISO pode reduzir escopo sem reduzir proteção — e é uma das poucas decisões em que a redução é tecnicamente defensável, porque vem de norma publicada, não de opinião.

O terceiro efeito aparece em auditoria. A ISO/IEC 27001:2022 estabelece requisitos para um sistema de gestão de segurança da informação, e a categorização por impacto e a declaração de aplicabilidade são onde o auditor procura a coerência entre o que a política promete e o que o controle entrega.

## 7. Aplicação prática

Escolha os dois sistemas sobre os quais você mais ouve reclamação na empresa. Para cada um, escreva a linha de categoria no formato `{(confidencialidade, x), (integridade, x), (disponibilidade, x)}` e, abaixo dela, uma frase de justificativa por objetivo, na linguagem de consequência operacional.

Depois mande a linha para o dono do processo e peça discordância em uma frase. Se ele responder "tudo deveria ser HIGH", a resposta é pedir a consequência: o que deixa de funcionar, o que se perde em dinheiro, quem se machuca. Sem isso, o nível não muda.

## 8. Autoexplicação

Explique em três frases, sem consultar: por que os três eixos são independentes, o que o high water mark faz, e qual é o critério de LOW, MODERATE e HIGH. Conecte ao que você já faz: em qual reunião do seu calendário a palavra "crítico" é usada sem nível definido?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Confidencialidade é sempre o eixo mais importante | Em sistemas de controle industrial, o exemplo do próprio FIPS 199 mostra confidencialidade NOT APPLICABLE com integridade e disponibilidade HIGH | O eixo decisivo depende do processo; alterar leitura de sensor é pior do que lê-la |
| Alta disponibilidade implica alta integridade | São medidas separadas; um serviço redundante pode entregar dado corrompido com total disponibilidade | Cada objetivo recebe nível próprio, com justificativa própria |
| Volume de dados define o nível | A faixa de impacto é definida por efeito sobre operação, ativos e pessoas | Cem mil registros de baixo impacto podem continuar LOW; um único registro com risco de vida pode ser HIGH |
| A média dos tipos de informação dá o nível do sistema | O FIPS 199 usa o valor mais alto por objetivo, não média | High water mark por objetivo, sem compensação entre eixos |
| Backup resolve integridade | Não repúdio e autenticidade fazem parte da integridade; restauração não prova quem alterou nem quando | Integridade exige controle de alteração e registro de auditoria, além de restauração |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Escreva as três definições de objetivo tal como aparecem na lei citada pelo FIPS 199, com uma palavra-chave de cada.
2. Qual é a diferença entre MODERATE e HIGH em termos de função primária da organização?
3. Um sistema carrega um tipo de informação HIGH em disponibilidade e sete tipos LOW. Qual é o nível de disponibilidade do sistema?
4. Por que NOT APPLICABLE não pode ser usado em um sistema?
5. Dê um exemplo de falha de integridade que não seja detectável por restauração de backup.

<details>
<summary>Conferir respostas</summary>

1. Confidencialidade: preservar restrições autorizadas de acesso e divulgação, incluindo privacidade pessoal e informação proprietária. Integridade: guardar contra modificação ou destruição indevida, incluindo não repúdio e autenticidade. Disponibilidade: acesso e uso tempestivos e confiáveis.
2. Em MODERATE há degradação significativa: a organização executa as funções primárias, com eficácia reduzida. Em HIGH a organização deixa de executar uma ou mais funções primárias, ou há dano severo envolvendo perda de vida.
3. HIGH. O high water mark toma o valor mais alto por objetivo, sem média.
4. Porque o funcionamento do próprio sistema exige um piso de proteção: processamento, funções críticas e informação de nível de sistema precisam de proteção mínima. O piso é LOW.
5. Alteração feita por alguém com acesso legítimo, sem quebra de autenticação, como a troca de um valor em uma tabela de referência por um operador autorizado a acessá-la. O backup restaura o dado e não aponta o autor.

</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo em [91-trilhas/](../91-trilhas/README.md), dono de `proxima_revisao`.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Categorizar um ativo novo em voz alta, justificando os três níveis | Rebaixar: repetir em D+3 |
| D+30 | Comparar a sua categorização com a que a área técnica usaria e explicar a diferença | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aprofundado_por | 01-fundamentos#TEMA-02 | a introdução aplica os três pilares a um ativo; a área 01 define os objetivos de segurança com precisão formal |
| complementa | 00-guia-basico#TEMA-01 | o perímetro diz o que governar; os níveis de impacto da tríade dizem com que rigor cada item do perímetro é tratado |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Cobertura geral do tema | ISC2 CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | FIPS PUB 199, fev/2004 — definições de confidencialidade, integridade e disponibilidade, faixas LOW, MODERATE e HIGH, high water mark, exemplos 1 e 4 | primaria | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.199.pdf | "2026-09-25" | alta |
| 2 | ISO/IEC 27001:2022 — requisitos de sistema de gestão de segurança da informação | primaria | https://www.iso.org/standard/27001 | "2026-09-25" | alta |
| 3 | CompTIA Security+ SY0-701 — 5 domínios, pesos 12%, 22%, 18%, 28%, 20% | primaria | https://assets.ctfassets.net/82ripq7fjls2/6TYWUym0Nudqa8nGEnegjG/0f9b974d3b1837fe85ab8e6553f4d623/CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [00 Guia básico do CISO](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-o-que-e-seguranca.md) |
| Próximo tema | [TEMA-03](TEMA-03-ameaca-vulnerabilidade-risco.md) |
| Home | [README](../README.md) |
