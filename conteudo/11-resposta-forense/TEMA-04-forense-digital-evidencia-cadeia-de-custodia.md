---
tema: "Forense digital: evidência e cadeia de custódia"
tema_id: "TEMA-04"
area_id: "11-resposta-forense"
nivel: avancado
tempo_estimado: "45-55 min"
objetivo_aprendizagem: "Especificar a aquisição de evidência digital de um incidente, com integridade verificável e registro de custódia contínuo, respeitando o limite entre investigar e tratar dado pessoal para outra finalidade"
atende_objetivo: [5]
certificacoes: ["CHFI", "GCFA"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "05-rede-infraestrutura#TEMA-06"
      motivo: "o fluxo e o pacote retidos são a evidência da investigação, e retenção e integridade se decidem na rede antes do incidente"
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com:
    - alvo: "14-dados-privacidade#TEMA-04"
      motivo: "coletar evidência forense não autoriza tratar dado pessoal para outra finalidade"
fontes:
  - titulo: "NIST SP 800-86 — Guide to Integrating Forensic Techniques into Incident Response, agosto de 2006"
    url: "https://csrc.nist.gov/pubs/sp/800/86/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISO/IEC 27037:2012 — Guidelines for identification, collection, acquisition and preservation of digital evidence"
    url: "https://www.iso.org/standard/44381.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
  - titulo: "Resolução CD/ANPD nº 15, de 24 de abril de 2024 — Regulamento de Comunicação de Incidente de Segurança, art. 3º, incisos VIII, XII, XIV, XV e XIX"
    url: "https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Forense digital: evidência e cadeia de custódia

O NIST SP 800-86, publicado em agosto de 2006, apresenta a forense sob a ótica de TI e não sob a ótica da autoridade policial, descreve processos para executar atividades forenses e orienta sobre fontes de dados como arquivos, sistemas operacionais, tráfego de rede e aplicações; o próprio documento declara que não é um guia passo a passo de investigação nem orientação jurídica, e recomenda aplicar as práticas somente depois de consultar a gestão e o jurídico quanto à conformidade com leis e regulamentos aplicáveis ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/86/final), acessado em 2026-09-25). A primeira decisão de um CISO em forense, portanto, é saber para quem a evidência vai servir.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: especificar a aquisição de evidência digital de um incidente, com integridade verificável e registro de custódia contínuo, respeitando o limite entre investigar e tratar dado pessoal para outra finalidade.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-ciclo-de-resposta-a-incidentes.md), porque a coleta acontece dentro do ciclo e consome tempo dele. E o [TEMA-04 de 14 Dados e privacidade](../14-dados-privacidade/TEMA-04-lgpd-bases-legais-direitos-incidentes.md), cujo conteúdo define obrigação, prazo e base legal do tratamento de dado pessoal que a coleta vai capturar.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quem, na sua empresa, assina o termo de custódia quando uma evidência é coletada, e quem guarda esse termo?
   Confiança: ___
2. Se o time desligar o servidor comprometido antes de capturar memória, o que se perde?
   Confiança: ___
3. Onde a cópia do disco feita para análise fica armazenada, e quem tem acesso a ela?
   Confiança: ___
4. Se um funcionário é suspeito de copiar a base de clientes, o time de segurança pode copiar a estação dele e o conteúdo do e-mail corporativo sem mais nenhum parecer?
   Confiança: ___

## 4. Caso real

Um analista de infraestrutura sai da empresa em uma sexta-feira. Na segunda, o time de segurança descobre que ele baixou 40 mil registros da base de clientes nos 20 dias anteriores à saída. O jurídico pede a cópia da estação de trabalho e o conteúdo da caixa de e-mail corporativo. O time copia a estação sem termo de custódia, sem hash e sem registrar quem manuseou; guarda os arquivos em uma pasta compartilhada com acesso amplo; e devolve a estação ao estoque de equipamentos dois dias depois, já formatada.

Na audiência trabalhista, a empresa tem a informação e não tem a prova. A pergunta que o caso deixa aberta: quais quatro elementos faltaram na coleta, e por que cada um deles é suficiente para descartar a evidência.

## 5. Conteúdo

### 5.1 Conceito

Evidência digital é o item que sustenta uma afirmação sobre o que aconteceu com um sistema. Três propriedades a sustentam. Relevância: o item responde a uma pergunta do caso. Integridade: o item é o mesmo que foi coletado, demonstrável por comparação de hash. Procedência: existe registro contínuo de quem teve o item em mãos, quando e para quê.

A ISO/IEC 27037:2012 fornece orientação para atividades específicas do manuseio de evidência digital: identificação, coleta, aquisição e preservação de evidência digital em potencial que possa ter valor probatório ([iso.org](https://www.iso.org/standard/44381.html), confirmado no índice de busca do domínio iso.org, acessado em 2026-09-25). As quatro atividades são um ciclo: identificar o que existe, coletar o que é volátil, adquirir o que precisa de cópia e preservar o que foi adquirido.

O regulador usa vocabulário próprio para o mesmo objeto. O Regulamento de Comunicação de Incidente de Segurança define confidencialidade, integridade, disponibilidade e autenticidade como propriedades do dado pessoal, define dado pessoal afetado como aquele cuja confidencialidade, integridade, disponibilidade ou autenticidade foi comprometida, e define relatório de tratamento de incidente como documento que contém cópias, em meio físico ou digital, de dados e informações relevantes para descrever o incidente e as providências adotadas (art. 3º, incisos V, VI, XIII, VIII, XII e XIX, [in.gov.br](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024), acessado em 2026-09-25). Em incidente com dado pessoal, o relatório de tratamento é artefato esperado pela autoridade, e ele é feito de material que a perícia separou.

Há um limite que o CISO precisa declarar em voz alta para o time. A cópia feita para investigar cria operação de tratamento com finalidade nova, e finalidade nova exige base legal e prazo de eliminação, como trata o [TEMA-04 de 14 Dados e privacidade](../14-dados-privacidade/TEMA-04-lgpd-bases-legais-direitos-incidentes.md). Investigar não é autorização para usar, compartilhar ou reter indefinidamente.

### 5.2 Como funciona

A coleta segue uma ordem que começa pelo que desaparece mais rápido. A prática de ordem de volatilidade orienta capturar primeiro o conteúdo de memória, conexões de rede e processos em execução, e por último o disco; a fonte primária que formula essa ordem não foi lida nesta execução: NAO CONFIRMADO em fonte oficial. O que se pode afirmar com fonte é o desenho do guia do NIST: fontes de dados distintas, incluindo arquivos, sistema operacional, tráfego de rede e aplicações, exigem técnicas próprias ([csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/86/final), acessado em 2026-09-25).

Antes de tocar em qualquer sistema, três decisões. A primeira é o objetivo: qual pergunta a coleta responde. A segunda é quem tem competência e alçada para coletar, e se o caso pede o fornecedor externo. A terceira é o destino do material: onde fica, quem acessa e por quanto tempo, porque isso define o desenho do armazenamento desde o começo.

| Tipo de coleta | Quando usar | O que se perde se não fizer | Cuidado principal |
|---|---|---|---|
| Estado volátil | Antes de qualquer ação de contenção no host | Processos, conexões, usuários logados, artefatos em memória | Ferramenta confiável e hash do arquivo gerado |
| Imagem de disco | Sempre que a integridade do sistema importa | Histórico completo do que existiu no armazenamento | Bloqueio de escrita e hash do conjunto |
| Log centralizado | Quando a retenção já existe fora do host | Correlação entre hosts e janela temporal | Preservar a cópia do coletor, não a do host |
| Telemetria de EDR | Para reconstruir execução e linha do tempo | Sequência de processos e eventos de arquivo | Exportar em formato que mantenha a assinatura |
| Captura de rede | Quando o vetor é remoto e há retenção | Evidência do canal e do conteúdo transmitido | Retenção decidida antes do incidente |

O registro de custódia é o documento que faz a prova existir. Ele tem, no mínimo: identificação do item; origem, com host, usuário e caminho; quem coletou e com que ferramenta; data e hora com fuso; método de aquisição; hash do item coletado; local de guarda; e cada transferência, manuseio ou acesso, com assinatura de quem recebeu e de quem entregou, mais o motivo do acesso. Cadeia quebrada é qualquer intervalo sem essa linha.

Cinco falhas invalidam uma coleta bem-feita: copiar arquivos por rede em vez de adquirir o item; analisar o original em vez da cópia; guardar a cópia em armazenamento sem controle de acesso; não registrar quem acessou depois; e deixar o host voltar ao estoque antes do encerramento do caso.

Limite normativo do escopo brasileiro. A disciplina legal brasileira específica de cadeia de custódia não foi lida nesta execução, e este tema não afirma nenhum de seus dispositivos: NAO CONFIRMADO em fonte oficial. O que o SP 800-86 estabelece é suficiente para operar: a orientação é técnica, e a decisão sobre o que pode ser coletado, retido e divulgado é de gestão e de jurídico.

### 5.3 Exemplo resolvido

Servidor Linux de aplicação exposto à internet, 400 GB de disco, base com 800 mil registros de clientes, suspeita de acesso remoto não autorizado com nove dias de duração. O time decide manter o host ligado para capturar o estado volátil antes do isolamento completo.

| Ordem | Item | Método | Tamanho | Hash registrado | Guarda |
|---|---|---|---|---|---|
| 1 | Memória volátil | Ferramenta de aquisição de memória, com hash do arquivo gerado | 64 GB | Sim | Cofre de evidências, acesso restrito |
| 2 | Conexões e processos em execução | Coleta de saída de comandos e tabela de conexões | 12 MB | Sim | Cofre de evidências |
| 3 | Log de autenticação e de aplicação dos 30 dias | Exportação do coletor central, com assinatura | 8 GB | Sim | Cofre de evidências |
| 4 | Imagem do disco | Aquisição com bloqueio de escrita e hash do conjunto | 400 GB | Sim | Cofre de evidências |
| 5 | Telemetria de EDR da janela | Exportação nativa e cópia do índice | 22 GB | Sim | Cofre de evidências |
| 6 | Configuração e inventário do servidor | Exportação de arquivos de configuração e papel de servidor | 300 MB | Sim | Cofre de evidências |

Regras aplicadas na execução. O host foi isolado depois do item 1, não antes. A cópia do item 4 foi restaurada em ambiente separado para análise, e o original permaneceu lacrado. O termo de custódia registrou as duas transferências: do plantão para o analista e do analista para o cofre, com data, hora, hash conferido e motivo.

Fechamento com o jurídico, em uma página. O que a empresa afirma ter acontecido, o que a evidência sustenta, o que ficou sem resposta e qual é o prazo de retenção do material. A cópia contém dados de 800 mil titulares; a base legal é o cumprimento de obrigação legal e o exercício regular de direitos, com acesso nominalmente restrito a três pessoas e eliminação programada para depois do encerramento do caso, o que precisa constar do registro.

### 5.4 Problema de completar

Caso novo: a empresa demite um funcionário do time comercial sob suspeita de levar a carteira de clientes para um concorrente. O notebook corporativo está com o funcionário, que se compromete a devolvê-lo em dois dias. O acesso ao e-mail corporativo e ao sistema de CRM é imediato.

Preencha as etapas e feche as três últimas.

1. O que preservar antes de o notebook voltar, e por qual meio: __________
2. Que itens exigem parecer do jurídico antes da coleta, e por quê: __________
3. Itens que precisam de termo de custódia no primeiro dia, com quem assina cada um: __________
4. Destino, controle de acesso e prazo de retenção do material coletado: __________
5. O que muda se o caso evoluir para investigação criminal e a autoridade requisitar o material: __________

## 6. Por que isso importa para o CISO

Evidência decide três conversas caras. A primeira é a disciplinar e a trabalhista: sem custódia registrada, a empresa leva a informação e perde a prova. A segunda é a regulatória: em incidente com dado pessoal, o relatório de tratamento de incidente que a autoridade pode solicitar é feito de cópias de dados e informações que descrevem o incidente e as providências adotadas, e um material sem procedência não sustenta o relatório. A terceira é a do seguro e do contrato: apólices e acordos com clientes costumam exigir demonstração técnica do que ocorreu, e a demonstração é o conjunto de evidência com custódia.

Há uma decisão de orçamento escondida neste tema. Cofre de evidências, armazenamento com controle de acesso, ferramenta de aquisição de memória e contrato com fornecedor forense são itens pequenos no orçamento total e são os que determinam se a empresa consegue provar o que afirma. O custo de não ter isso aparece uma vez, no pior momento.

## 7. Aplicação prática

Escolha o host mais crítico do seu ambiente e escreva o procedimento de coleta em uma página, com as cinco decisões da seção 5.2: objetivo, competente, destino, ordem de coleta e quem assina. Submeta ao jurídico e ao encarregado de dados para aceite escrito.

Depois faça o teste barato: adquira a imagem de uma máquina virtual de laboratório, calcule o hash, guarde em local com controle de acesso, registre a transferência e tente reconstruir a linha do tempo a partir da cópia. Se a sua equipe não conseguir explicar de memória quem acessou a cópia depois de 48 horas, o registro de custódia ainda não funciona.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, as três propriedades que fazem um item digital valer como evidência, o que o registro de custódia precisa conter e por que a cópia feita para investigar cria obrigação de privacidade.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Desligar o host é a forma segura de preservar | Desligar apaga memória, processos e conexões | Preserve o volátil antes de decidir o desligamento |
| Copiar arquivos pela rede é suficiente | A cópia seletiva perde metadados e não é reprodutível | Adquira o item com método documentado e hash do conjunto |
| Hash comprovado é toda a custódia necessária | Integridade sem procedência não mostra quem manuseou nem quando | Registre cada transferência, com quem, quando, para quê |
| A evidência pode ficar na pasta compartilhada do time | Acesso amplo cria cadeia obscura e aumenta a exposição de dado pessoal | Guarde em cofre com acesso nominal e registro de acesso |
| Analisar no original é mais rápido | Alterar o original destrói a base de comparação | Analise sempre a cópia, com o original lacrado |
| Coletar é decisão técnica | O que pode ser coletado, retido e divulgado depende de obrigação legal e de direito de terceiro | Decida com o jurídico e registre o fundamento da coleta |
| Caso encerrado, material pode ser descartado | Descarte sem critério elimina a possibilidade de revisão e viola prazo e base legal | Defina prazo de retenção e eliminação programada desde a coleta |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as quatro atividades de manuseio de evidência digital descritas pela ISO/IEC 27037:2012?
2. O que o SP 800-86 declara sobre a ótica da forense que ele apresenta e sobre o uso do próprio documento?
3. Cite os campos mínimos de um registro de custódia.
4. Por que a cópia de um disco com 800 mil registros de clientes cria obrigação de privacidade, e qual é o limite de uso?
5. Quais são as quatro propriedades do dado pessoal usadas pelo Regulamento da ANPD, e o que elas têm a ver com o material que a perícia separa?

<details>
<summary>Conferir respostas</summary>

1. Identificação, coleta, aquisição e preservação de evidência digital em potencial com valor probatório.
2. A forense é apresentada sob a ótica de TI, e não sob a ótica da autoridade policial; o documento não é guia passo a passo de investigação nem orientação jurídica, e o leitor deve consultar a gestão e o jurídico quanto à conformidade antes de aplicar as práticas.
3. Identificação do item, origem com host e caminho, quem coletou e com que ferramenta, data e hora com fuso, método de aquisição, hash, local de guarda e cada transferência com assinatura e motivo.
4. Porque a cópia é operação de tratamento com finalidade nova, que exige base legal e prazo de eliminação. O uso fica restrito à finalidade declarada da investigação, com acesso nominalmente controlado.
5. Confidencialidade, integridade, disponibilidade e autenticidade. O regulamento define dado pessoal afetado como aquele cuja confidencialidade, integridade, disponibilidade ou autenticidade foi comprometida, e define relatório de tratamento de incidente como documento com cópias de dados e informações relevantes para descrever o incidente.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever o procedimento de coleta do host mais crítico e obter aceite do jurídico | Rebaixar: repetir em D+3 |
| D+30 | Executar o teste de aquisição em laboratório e conferir o registro de custódia depois de 48 horas | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 05-rede-infraestrutura#TEMA-06 | o fluxo e o pacote retidos são a evidência da investigação, e retenção e integridade se decidem na rede antes do incidente |
| nao_confundir_com | 14-dados-privacidade#TEMA-04 | coletar evidência forense não autoriza tratar dado pessoal para outra finalidade |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CHFI | Aquisição de evidência, análise de disco e cadeia de custódia | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |
| GCFA | Análise forense de host e reconstrução de linha do tempo | Índice de certificações do roadmap | secundaria | [90-certificacoes/](../90-certificacoes/README.md) |

Leitura recomendada: [NIST SP 800-86, forense aplicada a resposta a incidentes](https://csrc.nist.gov/pubs/sp/800/86/final); [ISO/IEC 27037:2012, identificação, coleta, aquisição e preservação de evidência digital](https://www.iso.org/standard/44381.html); [Regulamento de Comunicação de Incidente de Segurança, propriedades do dado pessoal](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-86 | primaria | https://csrc.nist.gov/pubs/sp/800/86/final | "2026-09-25" | alta |
| 2 | ISO/IEC 27037:2012 | primaria | https://www.iso.org/standard/44381.html | "2026-09-25" | media |
| 3 | Resolução CD/ANPD nº 15, de 24 de abril de 2024 | primaria | https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024 | "2026-09-25" | alta |

NAO CONFIRMADO em fonte oficial nesta execução: a identificação completa da ISO/IEC 27037:2012 foi obtida no índice de busca do domínio iso.org, com título e escopo, e não na página da norma; a fonte primária que formula a ordem de volatilidade; a disciplina legal brasileira de cadeia de custódia e de preservação de registros de conexão e de acesso a aplicações, que não foi lida e não é citada neste tema; e as propriedades mínimas de uma ferramenta de aquisição aceita em juízo.

---

| Navegação | |
|---|---|
| Área | [11 Resposta a incidentes, forense e resiliência](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-contencao-erradicacao-recuperacao.md) |
| Próximo tema | [TEMA-05](TEMA-05-continuidade-de-negocios-recuperacao-de-desastre.md) |
| Home | [README](../README.md) |
