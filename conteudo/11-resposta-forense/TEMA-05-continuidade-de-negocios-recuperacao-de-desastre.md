---
tema: "Continuidade de negócios e recuperação de desastre"
tema_id: "TEMA-05"
area_id: "11-resposta-forense"
nivel: intermediario
tempo_estimado: "40-50 min"
objetivo_aprendizagem: "Calcular o tempo real de recuperação de um processo crítico pela cadeia de dependências, compará-lo com o limite que o negócio declara aceitar e fechar a diferença com item de plano, dono e evidência de restauração testada"
atende_objetivo: [6]
certificacoes: ["CHFI", "GCFA", "CISM"]
pre_requisitos: ["TEMA-01", "02-governanca-risco-compliance#TEMA-03"]
relacoes:
  complementa:
    - alvo: "02-governanca-risco-compliance#TEMA-03"
      motivo: "a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar"
    - alvo: "11-resposta-forense#TEMA-02"
      motivo: "o exercício de mesa só vale se o plano de continuidade declarar antes o RTO e o RPO que o time deve tentar cumprir"
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com:
    - alvo: "11-resposta-forense#TEMA-03"
      motivo: "derrubar o serviço para interromper o ataque e manter o serviço funcionando durante o ataque são objetivos que se opõem, e a decisão entre os dois precisa ser explícita"
fontes:
  - titulo: "ISO 22301:2019 — Business continuity management systems"
    url: "https://www.iso.org/standard/75106.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "ABNT NBR ISO 22301:2020 — Gestão de continuidade de negócios, comitê ABNT/CEE-063 Gestão de Riscos, 24 páginas"
    url: "https://abntcatalogo.com.br/sebrae/norma.aspx?Q=OVllOUVzQUhJdVNDOTZsNnJDUWdYaFNFVjEwWkx6ZUpieFQ3bjl5M3pyaz0="
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "NIST SP 800-34 Rev. 1 — Contingency Planning Guide for Federal Information Systems, maio de 2010, atualizado em 11/11/2010"
    url: "https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-184 — Guide for Cybersecurity Event Recovery, dezembro de 2016"
    url: "https://csrc.nist.gov/pubs/sp/800/184/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Continuidade de negócios e recuperação de desastre

A adoção brasileira da norma de continuidade, ABNT NBR ISO 22301:2020, tem 24 páginas, pertence ao comitê ABNT/CEE-063 Gestão de Riscos e declara em seu objetivo especificar os requisitos para implementar, manter e melhorar um sistema de gestão para proteger-se, reduzir a probabilidade de ocorrência, preparar-se, responder a e recuperar-se de disrupções quando estas ocorrerem ([abntcatalogo.com.br](https://abntcatalogo.com.br/sebrae/norma.aspx?Q=OVllOUVzQUhJdVNDOTZsNnJDUWdYaFNFVjEwWkx6ZUpieFQ3bjl5M3pyaz0=), confirmado no índice de busca do domínio do catálogo oficial da ABNT, acessado em 2026-09-25). A norma trata de sistema de gestão, mas o que a empresa compra na prática é uma resposta a uma pergunta de uma linha: quanto tempo aguentamos ficar fora do ar.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: calcular o tempo real de recuperação de um processo crítico pela cadeia de dependências, compará-lo com o limite que o negócio declara aceitar e fechar a diferença com item de plano, dono e evidência de restauração testada.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md), pelas marcas de tempo, e [02 Governança #TEMA-03](../02-governanca-risco-compliance/TEMA-03-apetite-tolerancia-risco.md), porque a tolerância a indisponibilidade declarada lá é o teto que o objetivo de recuperação precisa respeitar.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual é o tempo de interrupção que a sua empresa considera inaceitável no sistema de faturamento, por escrito?
   Confiança: ___
2. Quanto tempo leva, de fato, para restaurar esse sistema, contando identidade, chave de criptografia, banco de dados e integração com terceiros?
   Confiança: ___
3. Quando foi a última vez que um backup da sua empresa foi restaurado em ambiente separado e conferido, e quem assinou o resultado?
   Confiança: ___
4. O contrato do provedor de nuvem define prazo de recuperação e crédito por descumprimento?
   Confiança: ___

## 4. Caso real

Uma empresa de saúde declara RTO de 4 horas para o sistema de prontuário. No exercício anual, o time restaura o banco de dados em 3 horas e descobre que não consegue abrir o sistema: o cofre de chaves que guarda a chave de criptografia do banco está em um serviço separado, com restauração dependente do diretório de identidade, que por sua vez depende de um servidor de autenticação que também foi afetado. O tempo total observado foi de 11 horas.

A pergunta que o caso deixa aberta: por que o RTO declarado e o RTO observado divergem tanto, e o que precisa ser medido para que isso pare de acontecer.

## 5. Conteúdo

### 5.1 Conceito

Continuidade é capacidade declarada em números e comprovada por teste. A ISO 22301:2019 se apresenta como o padrão internacional para sistemas de gestão de continuidade de negócios, oferecendo estrutura para planejar, estabelecer, implementar, operar, monitorar, analisar criticamente, manter e melhorar continuamente um sistema de gestão documentado, com o fim de proteger contra incidentes disruptivos, reduzir sua probabilidade e assegurar a recuperação ([iso.org](https://www.iso.org/standard/75106.html), confirmado no índice de busca do domínio iso.org, acessado em 2026-09-25).

Do lado do sistema de informação, o NIST SP 800-34 Rev. 1, publicado em maio de 2010 e atualizado em 11/11/2010, trata do propósito, do processo e do formato do planejamento de contingência de sistemas de informação, das relações entre esse planejamento e outros planos de continuidade e de gestão de emergência, da resiliência organizacional e do ciclo de vida do sistema, e ajuda a avaliar sistemas e operações para determinar requisitos e prioridades de contingência; o documento publica como material suplementar um modelo de análise de impacto no negócio ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final), acessado em 2026-09-25).

Três planos diferentes ocupam esse espaço e é comum encontrá-los fundidos. O plano de continuidade de negócios descreve como o processo de negócio continua funcionando, inclusive sem sistema, com procedimento manual e pessoas. O plano de recuperação de desastre descreve como a infraestrutura e as aplicações voltam. O plano de resposta a incidentes descreve como o adversário é contido. O [TEMA-03](TEMA-03-contencao-erradicacao-recuperacao.md) explica por que os dois últimos entram em conflito: conter rápido pode significar derrubar o serviço que a continuidade tenta manter de pé.

### 5.2 Como funciona

O cálculo começa pela análise de impacto no negócio. Ela identifica os processos críticos, o efeito da interrupção por faixa de tempo e as dependências de cada processo. O produto utilizável são três números por processo: o tempo máximo aceitável de interrupção; a perda de dado aceitável, medida em tempo; e o ponto a partir do qual o dano deixa de ser reversível.

| Faixa de interrupção | Efeito no negócio | Quem sente primeiro |
|---|---|---|
| Até 1 hora | Degradação percebida, sem perda financeira relevante | Usuário interno |
| 1 a 4 horas | Fila de trabalho acumulada, atraso em compromisso assumido | Cliente com prazo contratado |
| 4 a 24 horas | Receita não reconhecida, obrigação legal em risco | Financeiro e compliance |
| Acima de 24 horas | Perda de cliente, penalidade contratual, exposição regulatória | Conselho e regulador |

O tempo real de recuperação é o maior tempo da cadeia, e não a soma dos tempos de cada item nem o tempo do item mais visível. Cada dependência tem prazo próprio de volta, e a recuperação do processo termina quando a última delas volta.

| Dependência | Prazo de volta observado | Se falhar |
|---|---|---|
| Diretório de identidade | 1 hora | Ninguém autentica, e todo o resto fica inacessível |
| Cofre de chaves e certificados | 6 horas | Dado cifrado não abre, mesmo com o banco disponível |
| Banco de dados | 3 horas | Perda de dado desde a última cópia confirmada |
| Servidor de aplicação | 1 hora | Serviço indisponível |
| Integração com terceiro | 4 horas | Processo roda pela metade e gera erro em cascata |
| Comunicação ao cliente e ao órgão regulador | Não declarado | Exposição regulatória descoberta depois |

Cinco decisões de desenho resolvem a maior parte das divergências. Primeira: o desenho de backup assume que o adversário com privilégio administrativo alcança o servidor de backup, o que exige cópia imutável e credencial separada do domínio. Segunda: restauração é operação testada com data e responsável, não promessa de procedimento. Terceira: o procedimento de contingência manual existe em papel, para quando o sistema que publica o procedimento também estiver fora. Quarta: o contrato com o provedor declara prazo de recuperação e consequência por descumprimento, porque prazo sem consequência não é compromisso. Quinta: a volta ao ambiente principal tem critério de saída escrito, o que evita migrar de volta sobre um ambiente ainda instável.

### 5.3 Exemplo resolvido

Processo de folha de pagamento de 3.200 funcionários, com prazo legal de pagamento no quinto dia útil. O negócio declara que uma interrupção acima de 8 horas antes da data de pagamento é inaceitável.

1. Levante a cadeia de dependências, com o prazo de volta de cada item, medido em exercício anterior.

| Item | Prazo de volta | Responsável | Evidência |
|---|---|---|---|
| Diretório de identidade | 2 h | Time de identidade | Restauração de autoridade certificadora testada em 14 meses atrás |
| Cofre de chaves | 6 h | Time de plataforma | Nunca testado |
| Banco de dados da folha | 4 h | DBA | Restauração testada em 3 meses atrás |
| Servidor de aplicação | 1 h | Time de plataforma | Imagem atualizada em 1 mês |
| Integração bancária | 5 h | Fornecedor | Prazo declarado em contrato, sem teste |
| Assinatura digital do arquivo de pagamento | 3 h, dependente do cofre de chaves | Time de segurança | Nunca testado |

2. Calcule o tempo real. A cadeia mais longa é cofre de chaves, com 6 horas, mais a dependência da assinatura digital, que só funciona depois dele, mais 3 horas: 9 horas. O ajuste é 1 hora acima do limite declarado de 8 horas.

3. Feche a diferença com item de plano, não com ajuste de expectativa.

| Lacuna | Ação | Custo estimado | Dono | Prazo |
|---|---|---|---|---|
| Cofre de chaves nunca testado | Exercício de restauração do cofre em ambiente isolado, com registro de tempo | 40 horas de time | Plataforma | 45 dias |
| Assinatura depende do cofre | Chave de assinatura em cofre secundário, com cópia de recuperação testada | Licença adicional e 60 horas | Segurança | 90 dias |
| Prazo do fornecedor sem consequência | Renegociar cláusula com prazo e crédito por descumprimento | Jurídico e compras | 120 dias |
| Procedimento manual inexistente | Escrever checklist em papel do fechamento manual da folha | 16 horas | RH e finanças | 60 dias |

4. Registre o resultado com uma frase verificável: o processo de folha tem tempo de recuperação de 9 horas contra limite declarado de 8 horas, medido em exercício de 12 de setembro, com quatro itens de plano abertos.

### 5.4 Problema de completar

Caso novo: processo de faturamento de uma empresa de serviços, com emissão de nota fiscal eletrônica e prazo legal mensal de envio. O time levantou as dependências abaixo.

| Item | Prazo de volta |
|---|---|
| Diretório de identidade | 2 h |
| Banco de dados do faturamento | 5 h |
| Chave de assinatura da nota fiscal | 8 h |
| Serviço de emissão do fornecedor | 3 h |
| Rede com acesso à internet | 1 h |

O negócio declara que a interrupção aceitável é de 6 horas.

Preencha as etapas e feche as três últimas.

1. Tempo real de recuperação do processo e a cadeia que o determina: __________
2. Diferença em relação ao limite declarado, em horas: __________
3. Duas ações que reduzem o tempo pela cadeia, e não pelo item mais visível: __________
4. Evidência que precisa existir para que o número valha em auditoria: __________
5. O que responder ao conselho quando ele perguntar se a empresa aguenta um sequestro de dados com cópia dos backups comprometida: __________

## 6. Por que isso importa para o CISO

Continuidade é a resposta que o conselho entende sem tradução. Quando alguém pergunta se a empresa deve pagar um resgate, a resposta depende de existir cópia imutável, de o tempo de restauração ser conhecido e de a operação aguentar esse tempo. Sem esses três elementos, a decisão é tomada sob pressão, no meio da madrugada, com informação incompleta.

O segundo efeito é de priorização de verba. A cadeia de dependências mostra que itens pequenos, como a chave de assinatura em cofre secundário, às vezes determinam o tempo total. Um pedido de verba com o cálculo da cadeia compete de igual para igual com projetos de negócio, o que raramente acontece com um pedido justificado por boas práticas.

O terceiro efeito é contratual e jurídico. Prazo de recuperação sem cláusula de consequência é declaração de intenção; a renegociação com o fornecedor é tarefa de risco, não de tecnologia.

## 7. Aplicação prática

Escolha o processo de negócio mais crítico e monte a cadeia de dependências em uma tabela, com prazo de volta, responsável e evidência de teste por item. Considere dependências que costumam ficar fora da lista: autenticação, chave de criptografia, DNS, certificado, integração bancária e impressão de documento físico.

Depois faça a restauração real de um item por mês, cronometrada e registrada, e mantenha o painel atualizado. Peça ao dono do processo que assine o limite aceito. A diferença entre o limite assinado e o tempo medido é o seu plano de continuidade, em números, para o próximo ciclo de orçamento.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, por que o tempo de recuperação é o maior tempo da cadeia, o que a análise de impacto no negócio entrega de útil e por que restauração não testada não conta como capacidade.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Backup feito é backup disponível | Cópia no mesmo domínio, com a mesma credencial, cai junto com o ambiente | Cópia imutável e credencial separada do diretório principal |
| O RTO declarado é o RTO praticado | O declarado costuma ignorar identidade, chave e integração | Meça a cadeia completa em exercício e publique o número medido |
| Plano de continuidade é o plano de recuperação de desastre | Um trata do processo de negócio, outro trata da infraestrutura e das aplicações | Mantenha os dois, com donos diferentes e interface declarada |
| Restaurar o banco é recuperar o serviço | Falta aplicação, identidade, chave e integração com terceiro | Restaure e valide a cadeia inteira, com teste funcional ponta a ponta |
| Continuidade é responsabilidade da TI | O limite aceitável de interrupção é decisão do dono do processo e do negócio | Peça assinatura do dono do processo no limite e no resultado do exercício |
| Cláusula de prazo no contrato resolve | Sem consequência por descumprimento, o prazo não muda comportamento | Negocie prazo com crédito ou com obrigação de reporte de recuperação |
| Procedimento de contingência pode ficar no sistema | Se o sistema está fora, o procedimento está fora junto | Mantenha o procedimento crítico em papel, com cópia física acessível |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. O que a ISO 22301:2019 declara como finalidade do sistema de gestão de continuidade de negócios?
2. Qual é a identificação da norma brasileira de continuidade, segundo o catálogo oficial da ABNT, e quantas páginas ela tem?
3. O que o SP 800-34 Rev. 1 cobre, e qual material suplementar ele publica?
4. Por que o tempo real de recuperação de um processo é o maior tempo da cadeia de dependências?
5. Quais são as cinco decisões de desenho que reduzem a divergência entre tempo declarado e tempo praticado?

<details>
<summary>Conferir respostas</summary>

1. Fornecer estrutura para planejar, estabelecer, implementar, operar, monitorar, analisar criticamente, manter e melhorar continuamente um sistema de gestão documentado, para proteger contra incidentes disruptivos, reduzir sua probabilidade e assegurar a recuperação.
2. ABNT NBR ISO 22301:2020, do comitê ABNT/CEE-063 Gestão de Riscos, com 24 páginas.
3. O propósito, o processo e o formato do planejamento de contingência de sistemas de informação, as relações com outros planos e com o ciclo de vida do sistema, e a avaliação de sistemas e operações para determinar requisitos e prioridades de contingência; publica um modelo de análise de impacto no negócio.
4. Porque o processo só opera quando todas as dependências estão disponíveis, e a última a voltar determina o tempo total.
5. Backup imutável com credencial separada; restauração testada com data e responsável; procedimento de contingência manual em papel; cláusula contratual com prazo e consequência; e critério de saída escrito para a volta ao ambiente principal.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Montar a cadeia de dependências do processo mais crítico com prazos observados | Rebaixar: repetir em D+3 |
| D+30 | Cronometrar a restauração de um item da cadeia e atualizar o painel com o dono do processo | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 02-governanca-risco-compliance#TEMA-03 | a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar |
| complementa | 11-resposta-forense#TEMA-02 | o exercício de mesa só vale se o plano de continuidade declarar antes o RTO e o RPO que o time deve tentar cumprir |
| nao_confundir_com | 11-resposta-forense#TEMA-03 | derrubar o serviço para interromper o ataque e manter o serviço funcionando durante o ataque são objetivos que se opõem, e a decisão entre os dois precisa ser explícita |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CHFI | Preservação de evidência na recuperação de desastre | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| GCFA | Reconstrução de linha do tempo depois da restauração | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| CISM | Governança da continuidade e comunicação ao executivo | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |

Leitura recomendada: [ISO 22301:2019, sistema de gestão de continuidade de negócios](https://www.iso.org/standard/75106.html); [ABNT NBR ISO 22301:2020, adoção brasileira da norma](https://abntcatalogo.com.br/sebrae/norma.aspx?Q=OVllOUVzQUhJdVNDOTZsNnJDUWdYaFNFVjEwWkx6ZUpieFQ3bjl5M3pyaz0=); [NIST SP 800-34 Rev. 1, planejamento de contingência e análise de impacto](https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final); [NIST SP 800-184](https://csrc.nist.gov/pubs/sp/800/184/final).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | ISO 22301:2019 | primaria | https://www.iso.org/standard/75106.html | "2026-09-25" | media |
| 2 | ABNT NBR ISO 22301:2020 | primaria | https://abntcatalogo.com.br/sebrae/norma.aspx?Q=OVllOUVzQUhJdVNDOTZsNnJDUWdYaFNFVjEwWkx6ZUpieFQ3bjl5M3pyaz0= | "2026-09-25" | media |
| 3 | NIST SP 800-34 Rev. 1 | primaria | https://csrc.nist.gov/pubs/sp/800/34/r1/upd1/final | "2026-09-25" | alta |
| 4 | NIST SP 800-184 | primaria | https://csrc.nist.gov/pubs/sp/800/184/final | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a edição e a data de publicação da ISO 22301:2019 e a data de publicação da ABNT NBR ISO 22301:2020, ambas obtidas no índice de busca do respectivo domínio oficial sem abertura da página da norma; as definições normativas de RTO e RPO, usadas aqui como termos de prática corrente e não como citação de dispositivo; e a existência de certificação de continuidade no Brasil e sua validade.

---

| Navegação | |
|---|---|
| Área | [11 Resposta a incidentes, forense e resiliência](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-forense-digital-evidencia-cadeia-de-custodia.md) |
| Próximo tema | [TEMA-06](TEMA-06-comunicacao-de-crise-notificacao-regulatoria.md) |
| Home | [README](../README.md) |
