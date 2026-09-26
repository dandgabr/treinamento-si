---
tema: "O mandato do CISO: o que a lei e o mercado esperam"
tema_id: "TEMA-04"
area_id: "00-guia-basico"
nivel: base
tempo_estimado: "30-40 min"
objetivo_aprendizagem: "Avaliar as obrigações legais e de mercado que recaem sobre o cargo, apontando o documento que exige cada entregável e quem o assina"
atende_objetivo: [4]
certificacoes: ["CISM", "CCISO"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "00-guia-basico#TEMA-03"
      motivo: "o vocabulário de risco só vira decisão quando existe um mandato que autorize aceitar risco, e o mandato é o assunto do TEMA-04"
  aprofundado_por: []
  aplicado_em:
    - alvo: "17-lideranca-ciso#TEMA-01"
      motivo: "o mandato formal descrito aqui é o que sustenta autoridade e verba no exercício do cargo tratado na área 17"
  nao_confundir_com: []
fontes:
  - titulo: "Resolução CMN nº 4.893, de 26/02/2021, art. 7º — diretor responsável pela política de segurança cibernética"
    url: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Lei nº 13.709, de 14/08/2018 (LGPD), art. 41 — indicação de encarregado pelo tratamento de dados pessoais"
    url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Comissão Europeia — NIS2 Directive: securing network and information systems"
    url: "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ENISA European Cybersecurity Skills Framework — Role Profiles, publicado em 19/09/2022"
    url: "https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST Cybersecurity Framework 2.0 — seis funções"
    url: "https://www.nist.gov/cyberframework"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27001:2022 — requisitos de sistema de gestão de segurança da informação"
    url: "https://www.iso.org/standard/27001"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# O mandato do CISO: o que a lei e o mercado esperam

Uma ideia central: o mandato do CISO é escrito por terceiros em três camadas: obrigação legal, regime regulatório setorial e expectativa de mercado. Cada camada cobra um entregável diferente, muitas vezes de uma pessoa diferente.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: avaliar as obrigações legais e de mercado que recaem sobre o seu cargo, apontando para cada uma o documento que a exige, o entregável que ela cobra e quem assina esse entregável na sua organização.

## 2. Pré-requisitos

TEMA-01, que define o perímetro. Sem perímetro, o mandato vira título de cargo.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Sem consultar: as obrigações de designar responsável por segurança cibernética e por tratamento de dados pessoais estão no mesmo documento? Aposte sim ou não.
   Confiança: ___
2. Chute: quantos setores a NIS2 alcança — menos de dez, cerca de vinte ou mais de cinquenta? Marque o intervalo antes de conferir.
   Confiança: ___
3. Palpite: o nome CISO aparece em algum documento com força de lei que a sua empresa já citou? Qual, se lembrar.
   Confiança: ___

## 4. Caso real

Uma instituição financeira autorizada a funcionar pelo Banco Central cumpre, no papel, duas obrigações distintas. Pela Resolução CMN nº 4.893/2021, art. 7º, designa um diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes. Pela Lei nº 13.709/2018, art. 41, indica um encarregado pelo tratamento de dados pessoais.

Suponha que o mesmo vazamento de cadastro seja, ao mesmo tempo, incidente de segurança cibernética e incidente de dados pessoais. O diretor designado precisa demonstrar execução do plano de resposta; o encarregado precisa responder às comunicações dos titulares e à autoridade. Os dois prazos correm juntos e os dois documentos não são o mesmo.

O caso deixa uma pergunta: quando o incidente é um só, quem assina o quê, e onde essa divisão está escrita?

## 5. Conteúdo

### 5.1 Conceito

A primeira camada do mandato é a norma brasileira que atribui função, sem citar cargo. A Resolução CMN nº 4.893, de 26 de fevereiro de 2021, exige que as instituições autorizadas a funcionar pelo Banco Central designem diretor responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes. A Lei nº 13.709/2018 exige, no art. 41, que o controlador indique encarregado pelo tratamento de dados pessoais, com identidade e contato divulgados publicamente.

Nenhum dos dois textos cria o cargo de CISO. Isso é o ponto. A norma atribui função, e função sem designação formal fica sem dono: ninguém responde por ela, e a organização descobre isso no dia em que precisa apresentar quem responde. Um mandato verbal não é designação.

A segunda camada é o regime regulatório setorial e transfronteiriço. A NIS2, Diretiva 2022/2555 da União Europeia, alcança entidades de porte médio e grande em 18 setores críticos, exige medidas de gestão de risco e notificação de incidentes significativos, e introduz responsabilidade da alta administração pelo descumprimento. O prazo de transposição pelos Estados-membros era 17 de outubro de 2024, e a diretiva revogou a NIS1 a partir de 18 de outubro de 2024.

A terceira camada é a expectativa de mercado, e ela não tem força de lei. A ENISA publicou em 19 de setembro de 2022 o European Cybersecurity Skills Framework com 12 role profiles, e o CISO é um deles. O NIST CSF 2.0 organiza a gestão de segurança em seis funções, entre elas Govern. A ISO/IEC 27001:2022 define os requisitos de um sistema de gestão de segurança da informação que pode ser certificado. Nenhum desses documentos obriga uma empresa brasileira. Todos eles aparecem em edital de cliente, em questionário de contrato e em auditoria de fornecedor.

### 5.2 Como funciona

O mandato se converte em artefatos. Todo o resto é conversa.

Política de segurança aprovada: um documento com data, versão e aprovador identificado, cobrindo os tipos de informação do perímetro. Registro de risco com responsáveis nomeados: o instrumento em que o aceite de risco acontece. Plano de ação e de resposta a incidentes: o documento cuja execução a norma setorial cobra do diretor designado. Registro de execução: evidência de que o plano foi seguido, com data de cada passo e nome de quem executou. Canal do titular e identidade pública do encarregado: a exigência que a lei de dados cobra e que não se resolve com trabalho interno.

A cadeia de delegação tem um limite claro. O diretor designado pode delegar a operação técnica de cada controle. Não pode delegar a capacidade de atestar que o plano foi executado, nem a decisão de aceitar o risco residual. É por isso que o desenho do mandato importa para quem chega sem base técnica: o trabalho é de leitura de evidência e de decisão, não de configuração.

Nas três camadas, a pergunta que separa mandato de título é sempre a mesma: existe um documento, com data e assinatura, que diz quem responde por quê?

### 5.3 Exemplo resolvido

Uma fintech brasileira de porte médio, com clientes no Brasil e um contrato com cliente europeu que a obriga contratualmente a observar medidas equivalentes às da NIS2. O evento: exfiltração da base de clientes, descoberta em uma segunda-feira.

Primeira hora. O time técnico isola o serviço e preserva registro. Quem decide sobre isolar é o time; quem é avisado é o diretor designado.

Primeiro dia. O diretor designado aciona o plano de resposta. Ele não executa a contenção; ele garante que o plano está sendo seguido e que o registro de execução está sendo preenchido. A evidência que ele vai precisar depois é essa, com carimbo de tempo.

Segundo dia. O encarregado assume a parte de dados pessoais: dimensiona o incidente que afeta titulares, define o teor da comunicação e a quem se comunica. O diretor designado não responde por essa frente, e o encarregado não responde pela contenção técnica.

Terceiro ao sexto dia. Dois caminhos separados. O regulador setorial recebe a comunicação do incidente e a descrição da execução do plano. O cliente europeu aciona a cláusula contratual e pede evidência de medidas de gestão de risco compatíveis. Note que são pedidos diferentes sobre o mesmo evento.

Resultado do exercício: uma única causa técnica produziu três obrigações — setorial, de proteção de dados e contratual — com destinatários e documentos próprios. A pergunta "quem é o CISO aqui" se dissolve em perguntas melhores: quem assinou a política, quem executou o plano, quem falou com os titulares, quem respondeu ao cliente europeu.

### 5.4 Problema de completar

Você vai escrever o termo de designação do responsável pela política de segurança cibernética. Complete as três últimas cláusulas.

Termo de designação, versão 1:

1. A organização designa, como responsável pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes, o ocupante do cargo de ______, a partir de ______.
2. O designado responde pela revisão anual da política, pela apresentação do registro de risco residual ao comitê e pela comunicação de incidentes ao regulador setorial.
3. Ficam fora do escopo desta designação: a comunicação com titulares de dados pessoais, atribuída ao encarregado pela Lei nº 13.709/2018, art. 41, e ______.
4. A designação pode ser delegada da seguinte forma: ______.
5. A organização se compromete a fornecer ao designado ______.
6. Este termo é revisado a cada ______ e sempre que ______.

Responda ainda: por que a cláusula 3 é a mais importante do documento para quem ocupa a cadeira?

## 6. Por que isso importa para o CISO

Responsabilidade sem autoridade é a armadilha clássica de quem assume o cargo. A norma pede que alguém responda pela execução; se esse alguém não tem orçamento próprio, não participa da contratação de fornecedor crítico e não é ouvido quando um projeto novo entra em produção sem controle, a designação vira exposição pessoal.

O termo de designação é o instrumento que corrige isso. Ele não aumenta o seu poder por decreto, mas obriga a conversa: para escrever a cláusula 5, você precisa pedir verba; para escrever a cláusula 3, precisa dizer em voz alta o que fica fora do seu escopo. Diretor que assina sem essas cláusulas aceita a parte da responsabilidade que a norma cria e nenhuma das condições para cumpri-la.

Há ainda o efeito de mercado. Certificação de gestão de segurança, questionário de cliente e auditoria de fornecedor convergem para três pedidos: política aprovada, registro de risco e evidência de resposta a incidente. Uma organização que consegue produzir os três em um dia passa pela auditoria; a que produz em três semanas passa pelo relatório de exceção.

## 7. Aplicação prática

Procure na sua organização dois documentos e anote o que falta em cada um. O primeiro é o ato que designa quem responde pela política de segurança cibernética — se ele não existe, você acabou de encontrar a primeira lacuna do seu mandato. O segundo é o registro de aceite de risco mais recente, com nome, data e assinatura.

Em seguida, escreva em uma página o termo de designação do seu cargo, mesmo que ninguém o tenha pedido. Leve-o a quem pode assinar. A reação à cláusula 5, a que pede recurso, revela em uma reunião o que três meses de conversa não revelariam.

## 8. Autoexplicação

Explique em três frases, sem consultar: as três camadas do mandato, a diferença entre a função do diretor designado e a do encarregado, e o papel dos frameworks que não têm força de lei. Conecte ao que você já faz: qual documento na sua empresa diz, com data e assinatura, por que você responde?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| A norma cria o cargo de CISO | Os textos legais atribuem funções e exigem designações, sem nomear o cargo | A designação formal é o que transforma função em mandato |
| CISO e encarregado são a mesma função por definição | A LGPD atribui ao encarregado tarefas de interlocução com titulares e autoridade; a norma setorial cobra execução do plano de resposta do diretor designado | Nada impede a mesma pessoa acumular as duas designações, mas cada uma exige ato próprio, e presumir que uma cobre a outra deixa a outra sem dono |
| NIST CSF e ISO/IEC 27001 obrigam a empresa brasileira | São frameworks e normas de requisitos, sem poder de imposição no Brasil | A obrigação vem do regulador setorial, da lei e do contrato; o framework é a régua aceita pelo mercado |
| A NIS2 só alcança empresas europeias | A diretiva alcança entidades de porte médio e grande em 18 setores críticos, e o efeito prático chega por contrato a fornecedores fora da União Europeia | Verifique cláusulas de segurança em contratos com clientes europeus antes de presumir que a diretiva não toca você |
| Delegar operação é delegar responsabilidade | A execução técnica pode ser delegada; a atestação de execução e a decisão sobre risco residual, não | Escreva no termo o que pode ser delegado e o que permanece com o designado |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual documento brasileiro exige a designação de responsável pela política de segurança cibernética, e o que exatamente ele cobra do designado?
2. Qual documento exige a indicação de encarregado pelo tratamento de dados pessoais, e o que a lei manda divulgar?
3. Cite as duas camadas que não têm força de lei e diga por que elas ainda importam.
4. Quantos setores a NIS2 alcança e qual era o prazo de transposição pelos Estados-membros?
5. Quais são os três artefatos que certificação, cliente e auditoria pedem e que você deveria conseguir produzir em um dia?

<details>
<summary>Conferir respostas</summary>

1. A Resolução CMN nº 4.893/2021, art. 7º. O designado responde pela política de segurança cibernética e pela execução do plano de ação e de resposta a incidentes.
2. A Lei nº 13.709/2018, art. 41. O controlador indica o encarregado, e a identidade e as informações de contato dele devem ser divulgadas publicamente, de forma clara e objetiva, preferencialmente no sítio eletrônico do controlador.
3. O ENISA ECSF, que descreve 12 role profiles, entre eles o CISO, e os frameworks de mercado, como o NIST CSF 2.0 e a ISO/IEC 27001:2022. Importam porque aparecem em edital, contrato e auditoria, onde o descumprimento custa negócio.
4. 18 setores críticos; prazo de transposição em 17 de outubro de 2024.
5. Política de segurança aprovada, registro de risco com responsáveis nomeados e evidência de execução do plano de resposta a incidentes.

</details>

## 11. Revisão espaçada

Os intervalos abaixo são sugestão. O calendário e o estado pertencem ao plano de estudo em [91-trilhas/](../91-trilhas/README.md), dono de `proxima_revisao`.

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Listar as três camadas do mandato de memória | Rebaixar: repetir em D+1 |
| D+7 | Comparar o seu termo de designação com as obrigações do TEMA-04 | Rebaixar: repetir em D+3 |
| D+30 | Refazer o exercício do incidente único com as obrigações do seu setor | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 17-lideranca-ciso#TEMA-01 | o mandato formal descrito aqui é o que sustenta autoridade e verba no exercício do cargo tratado na área 17 |
| complementa | 00-guia-basico#TEMA-03 | o vocabulário de risco só vira decisão quando existe um mandato que autorize aceitar risco, e o mandato é o assunto do TEMA-04 |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISM | Cobertura geral do tema | ISACA CISM Exam Content Outline | primaria | https://www.isaca.org/credentialing/cism/cism-exam-content-outline |
| CCISO | Cobertura geral do tema | EC-Council CCISO Blueprint | primaria | https://cert.eccouncil.org/images/doc/CCISO-New-Blueprint-v3.pdf |

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | Resolução CMN nº 4.893, de 26/02/2021, art. 7º | primaria | https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=RESOLU%C3%87%C3%83O%20CMN&numero=4893 | "2026-09-25" | alta |
| 2 | Lei nº 13.709/2018, art. 41 — indicação e divulgação do encarregado | primaria | https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709.htm | "2026-09-25" | alta |
| 3 | Comissão Europeia — NIS2, Diretiva 2022/2555: 18 setores, responsabilidade da alta administração, prazo de 17/10/2024, revogação da NIS1 em 18/10/2024 | primaria | https://digital-strategy.ec.europa.eu/en/policies/nis2-directive | "2026-09-25" | alta |
| 4 | ENISA European Cybersecurity Skills Framework — Role Profiles, 12 perfis publicados em 19/09/2022 | primaria | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | "2026-09-25" | alta |
| 5 | NIST Cybersecurity Framework 2.0 — seis funções, entre elas Govern | primaria | https://www.nist.gov/cyberframework | "2026-09-25" | alta |
| 6 | ISO/IEC 27001:2022 — requisitos de sistema de gestão de segurança da informação | primaria | https://www.iso.org/standard/27001 | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [00 Guia básico do CISO](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-ameaca-vulnerabilidade-risco.md) |
| Próximo tema | [TEMA-05](TEMA-05-como-usar-o-roadmap.md) |
| Home | [README](../README.md) |
