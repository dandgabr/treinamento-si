---
tema: "Perímetro, firewall e inspeção"
tema_id: "TEMA-02"
area_id: "05-rede-infraestrutura"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Avaliar uma política de firewall contra o princípio de negação por padrão, listando regras permissivas sem justificativa, a última data de revisão e o dono de cada exceção"
atende_objetivo: [2]
certificacoes: ["Network+", "Security+"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa: []
  aprofundado_por: []
  aplicado_em:
    - alvo: "02-governanca-risco-compliance#TEMA-02"
      motivo: "a política de firewall é a norma aprovada que descreve o que o dispositivo executa, com dono, exceção e prazo"
    - alvo: "11-resposta-forense#TEMA-03"
      motivo: "bloquear na borda é a primeira ação de contenção e depende de alguém capaz de publicar a regra durante o incidente; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-41 Rev. 1 — Guidelines on Firewalls and Firewall Policy, setembro de 2009"
    url: "https://csrc.nist.gov/pubs/sp/800/41/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — boundary protection, conforme NIST SP 800-53 Rev. 5"
    url: "https://csrc.nist.gov/glossary/term/boundary_protection"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "RFC 1918 / BCP 5 — Address Allocation for Private Internets, fevereiro de 1996"
    url: "https://www.rfc-editor.org/info/rfc1918/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Perímetro, firewall e inspeção

Uma ideia central: a fronteira não é um equipamento, é a política que define o que fica alcançável — e política escrita em regra permissiva sem dono não é política.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: avaliar uma política de firewall contra o princípio de negação por padrão, listando as regras permissivas sem justificativa, a última data de revisão do conjunto e o dono de cada exceção concedida.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-fundamentos-de-rede-para-o-gestor.md). Endereço, porta e protocolo são a linguagem em que a regra é escrita.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual é a diferença entre um firewall de filtragem de pacote e um firewall com inspeção de estado?
   Confiança: ___
2. Quando a última revisão da política de firewall da sua empresa aconteceu, e quem assinou?
   Confiança: ___
3. Quem aprova hoje uma exceção de acesso a partir da internet para um servidor interno?
   Confiança: ___

## 4. Caso real

A revisão 1 do NIST SP 800-41 saiu em setembro de 2009, substituindo a edição de 2002, e define firewall como dispositivo ou programa que controla o fluxo de tráfego de rede entre redes ou hosts com posturas de segurança diferentes. Entre as palavras-chave do documento estão filtragem de pacote, proxy, firewall de host, firewall de rede e política de firewall.

O detalhe interessante é a data. A referência que o mercado cita para escrever política de firewall é de 2009, e o texto continua válido porque o problema que ele descreve não envelheceu: decidir o que atravessa, com registro do que foi decidido. Produto mudou; o problema de política, não.

Um achado típico de auditoria segue o mesmo roteiro em quase toda empresa. O firewall tem 900 regras, das quais três permitem qualquer origem para qualquer destino em portas administrativas, herdadas de três projetos diferentes; a última revisão documentada é de quatro anos atrás; ninguém sabe quem pediu as três regras. Nenhuma delas falhou em teste algum. Todas juntas anulam o efeito das outras 897.

A pergunta que o caso deixa aberta: o que transforma um conjunto de regras em política, e que evidência prova essa transformação a um auditor?

## 5. Conteúdo

### 5.1 Conceito

O NIST SP 800-41 Rev. 1 recomenda estabelecer políticas de firewall e selecionar, configurar, testar, implantar e gerenciar soluções de firewall. A ordem das ações é o conteúdo: política antes de produto, teste antes de implantação, gestão depois dela. Contratar o produto antes de escrever a política é a sequência invertida mais comum.

O NIST SP 800-53 Rev. 5, no verbete de proteção de fronteira do glossário do CSRC, define o conceito como monitoramento e controle de comunicações na interface externa de um sistema, para prevenir e detectar comunicações maliciosas e outras não autorizadas por meio de dispositivos de proteção de fronteira. Duas palavras importam ao gestor: monitorar e detectar. Um firewall que só bloqueia e não registra cumpre metade da definição.

A fronteira de uma empresa moderna tem várias superfícies: link de internet, link privado de fornecedor, acesso remoto de funcionário, serviço publicado em nuvem e interface de parceiro. Cada uma dessas superfícies tem uma política própria, e tratá-las como "o firewall" é o que produz o ponto cego de 2017 no ambiente de 2026.

### 5.2 Como funciona

O motor de decisão de um firewall moderno combina quatro camadas. A primeira é a filtragem de pacote, que olha endereço, porta e protocolo. A segunda é o estado da conexão, que aceita pacotes de retorno pertencentes a uma sessão já autorizada. A terceira é o reconhecimento do protocolo de aplicação, que entende a diferença entre uma sessão de banco de dados e uma sessão de vídeo na mesma porta. A quarta é a identidade, que decide por usuário ou por grupo em vez de por faixa de endereço.

O documento do NIST separa firewall de rede de firewall de host. A separação tem consequência de projeto: o firewall de host existe em cada servidor e acompanha a carga de trabalho quando ela muda de lugar, o que resolve parte do problema de segmentação interna tratado em [TEMA-03](TEMA-03-segmentacao-vlan-microssegmentacao.md).

A disciplina que faz a política funcionar cabe em cinco itens. Primeiro, negação por padrão: o que não está escrito é negado. Segundo, cada regra tem origem, destino, porta, protocolo, ação e registro. Terceiro, cada regra tem dono e data. Quarto, a ordem das regras é revisada, porque regra ampla colocada antes de regra específica torna a específica inalcançável. Quinto, existe processo de exceção com prazo, e o vencimento é verificado.

O RFC 1918, no capítulo de considerações operacionais, recomenda que roteadores que conectam a empresa a redes externas sejam configurados com filtros de pacote e de roteamento nas duas pontas do link, para impedir vazamento de pacote e de informação de rota. Isso é política de fronteira descrita em 1996, no mesmo documento que recusa tratar de segurança: filtro de rota e de pacote é higiene de endereçamento, antes de ser controle de segurança.

### 5.3 Exemplo resolvido

Ambiente hipotético: uma regra herdada permite origem e destino abertos na porta do banco de dados, com a justificativa "integração do sistema de relatórios".

Passo 1, levantar os pares reais. Consultar o log do próprio firewall nos últimos 30 dias mostra que quatro endereços de origem se conectaram à porta: dois servidores de aplicação, um servidor de relatórios e uma estação de trabalho de analista.

Passo 2, classificar cada par. Os dois servidores de aplicação têm justificativa de operação. O servidor de relatórios também. A estação de trabalho é a pergunta: se há um servidor de relatórios, por que uma estação conecta direto no banco.

Passo 3, escrever a regra nova. Três regras nominais: cada servidor de aplicação com seu endereço de origem em direção ao endereço do banco, na porta, com registro ativado.

Passo 4, tratar a exceção legítima. Se o analista precisa consultar dado, a resposta é o servidor de relatórios com autenticação própria, não a conexão direta. A conexão direta entra na ata com prazo de 30 dias para desativação e dono declarado.

Passo 5, provar o efeito. Depois da mudança, a mesma consulta do passo 1 mostra três origens, todas justificadas. A pergunta "quem alcança o banco" passou a ter resposta de uma linha.

O que o exemplo demonstra é que a correção não exige produto novo. Exige log, alguém para ler o log e um dono para assinar a exceção.

### 5.4 Problema de completar

Mesma empresa, regra diferente: um proxy de saída permite qualquer origem interna para qualquer destino na internet, nas portas de web, com a justificativa "navegação dos usuários".

| Passo | Ação | Evidência usada | Dono |
|---|---|---|---|
| 1 | Levantar os destinos realmente acessados | ______ | ______ |
| 2 | Classificar em categoria de negócio e categoria de risco | ______ | ______ |
| 3 | Escrever a regra por categoria e por identidade | ______ | ______ |
| 4 | Definir bloqueio, observação e exceção | ______ | ______ |

Complete os campos em branco e responda por escrito: qual é a diferença de efeito entre negar a categoria de risco no proxy e bloquear por faixa de endereço de destino no firewall, e qual dos dois o usuário consegue contornar pela rede móvel pessoal.

## 6. Por que isso importa para o CISO

A política de firewall é o artefato que o auditor pede primeiro, e a pergunta que ele faz é sobre autoria e data. Sem esses dois campos, o conjunto de regras descreve o passado do ambiente, não a intenção vigente.

A segunda consequência é de tempo de resposta. Durante um incidente, a contenção começa pelo bloqueio de um destino ou de uma origem. Se cada mudança de regra exige pedido formal com prazo de três dias, a contenção não acontece na janela em que ela faz diferença, e o restante do plano de resposta perde eficácia.

A terceira é de orçamento. Inspeção de conteúdo cifrado custa licença, processamento e ponto único de falha, além de criar tratamento de dado pessoal em um equipamento que vê o que antes era invisível. Decidir inspecionar exige responder antes o que será feito com o que aparecer: onde fica registrado, quem pode ler e por quanto tempo. Um proxy com categorias e identidade resolve parte do problema a custo menor, porque decide sem abrir o conteúdo.

## 7. Aplicação prática

Peça a política de firewall vigente e faça três contagens: quantas regras existem, quantas têm origem ou destino declarados como qualquer, e quantas têm dono registrado. Anote a data da última revisão completa.

Depois escolha uma das regras abertas e faça o exercício da seção 5.3 na metade do tempo: consulte o log de 7 dias, liste as origens reais e escreva as regras nominais que substituem a aberta. Não publique ainda. Leve as três contagens e a proposta à próxima reunião de operação e pergunte quem assina o dono. Quem assina define se a mudança acontece.

## 8. Autoexplicação

Explique em três frases por que uma política de firewall sem dono e sem data não é política. Conecte ao seu ambiente: quantas mudanças de regra de rede foram feitas no último trimestre, e quantas você consegue rastrear até um pedido com autor.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Firewall e sistema de detecção de intrusão são a mesma função | Um decide e registra o que passa; o outro observa e alerta, e a definição do NIST separa controle de detecção em dois verbos | Se o dispositivo só alerta, ele não cumpre a função de controle, e vice-versa |
| Regra permissiva herdada é dívida técnica | Dívida técnica afeta manutenção; regra aberta altera o risco incorrido | Trate como risco aceito sem registro, com dono e prazo |
| Bloquear porta administrativa resolve acesso remoto indevido | Acesso remoto migra de porta e de protocolo, e a política precisa decidir por identidade | Decida por identidade de usuário e de dispositivo, não só por porta |
| Fronteira é um equipamento | A definição do NIST fala em dispositivos de proteção de fronteira, no plural, e a fronteira segue o acesso remoto e a nuvem | Enumere as superfícies de fronteira que existem hoje e dê dono a cada uma |
| Inspecionar tudo é sempre melhor | Aumenta superfície de falha, custo e criação de dado pessoal em log | Decida o que inspecionar por classe de dado e registre a justificativa e a retenção |
| Revisar a política anualmente é suficiente | Mudança de negócio altera a regra em semanas | Revise por gatilho, com data e autor, e mantenha fila de exceções vencidas |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Qual é a definição de firewall do NIST SP 800-41 Rev. 1, e em que data essa revisão foi publicada?
2. Quais são as cinco ações que o mesmo documento recomenda na sequência, e por que a ordem importa?
3. Como o NIST SP 800-53 Rev. 5 define proteção de fronteira, e quais dois verbos dessa definição um firewall que não registra deixa de cumprir?
4. Quais são os cinco itens de disciplina de política apresentados no tema?
5. Por que uma regra ampla colocada antes de uma regra específica é problema, e como se detecta isso?
6. Que recomendação o RFC 1918 faz para o link entre a empresa e redes externas, e qual é a finalidade declarada?

<details>
<summary>Conferir respostas</summary>

1. Dispositivo ou programa que controla o fluxo de tráfego de rede entre redes ou hosts que empregam posturas de segurança diferentes. Revisão 1, publicada em setembro de 2009, com histórico de documento em 28/09/2009, substituindo a edição de 2002.
2. Estabelecer políticas de firewall e selecionar, configurar, testar, implantar e gerenciar soluções. A política define o critério; sem ela, o teste e a configuração não têm contra o que ser comparados.
3. Como monitoramento e controle de comunicações na interface externa de um sistema, para prevenir e detectar comunicações maliciosas e outras não autorizadas, por meio de dispositivos de proteção de fronteira. O firewall que não registra deixa de cumprir o monitoramento e a detecção.
4. Negação por padrão; regra com origem, destino, porta, protocolo, ação e registro; dono e data por regra; verificação de ordem e de regra inalcançável; processo de exceção com prazo e verificação de vencimento.
5. Porque a regra específica nunca é avaliada. Detecta-se por revisão da ordem, por ferramenta de análise de política e por teste que tenta o acesso que a regra específica deveria permitir e não permite.
6. Recomenda que os roteadores que conectam a empresa a redes externas sejam configurados com filtros de pacote e de roteamento nas duas pontas do link, para impedir vazamento de pacote e de informação de roteamento.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Citar de memória a definição de firewall e de proteção de fronteira | Rebaixar: repetir em D+1 |
| D+7 | Repetir a seção 7 com uma segunda regra aberta | Rebaixar: repetir em D+3 |
| D+30 | Conferir se as exceções vencidas foram removidas | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 02-governanca-risco-compliance#TEMA-02 | a política de firewall é a norma aprovada que descreve o que o dispositivo executa, com dono, exceção e prazo |
| aplicado_em | 11-resposta-forense#TEMA-03 | bloquear na borda é a primeira ação de contenção e depende de alguém capaz de publicar a regra durante o incidente; destino planejado, número provisório |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| Security+ | Cobertura geral do tema | CompTIA Security+ | primaria | https://www.comptia.org/certifications/security |
| Network+ | Cobertura geral do tema | CompTIA Network+ | primaria | https://www.comptia.org/certifications/network |

Leitura direta: [NIST SP 800-41 Rev. 1, Guidelines on Firewalls and Firewall Policy](https://csrc.nist.gov/pubs/sp/800/41/r1/final).

O detalhe de cada credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-41 Rev. 1 — definição de firewall, palavras-chave e recomendação de política, teste, implantação e gestão; setembro de 2009 | primaria | https://csrc.nist.gov/pubs/sp/800/41/r1/final | "2026-09-25" | alta |
| 2 | NIST CSRC Glossary — boundary protection, texto do NIST SP 800-53 Rev. 5 | primaria | https://csrc.nist.gov/glossary/term/boundary_protection | "2026-09-25" | alta |
| 3 | RFC 1918 — considerações operacionais sobre filtros de pacote e de roteamento nas pontas do link externo | primaria | https://www.rfc-editor.org/info/rfc1918/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [05 Segurança de rede e infraestrutura](./README.md) |
| Tema anterior | [TEMA-01](TEMA-01-fundamentos-de-rede-para-o-gestor.md) |
| Próximo tema | [TEMA-03](TEMA-03-segmentacao-vlan-microssegmentacao.md) |
| Home | [README](../README.md) |
