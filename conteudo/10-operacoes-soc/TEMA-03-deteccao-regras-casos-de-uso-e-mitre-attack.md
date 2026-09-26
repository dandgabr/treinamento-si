---
tema: "Detecção: regras, casos de uso e MITRE ATT&CK"
tema_id: "TEMA-03"
area_id: "10-operacoes-soc"
nivel: intermediario
tempo_estimado: "45-60 min"
objetivo_aprendizagem: "Escrever um caso de uso de detecção com lógica, fonte de dados, condição e mapeamento em ATT&CK, declarando o falso positivo esperado"
atende_objetivo: [3]
certificacoes: ["CySA+", "GCIH"]
pre_requisitos: ["TEMA-02"]
relacoes:
  complementa:
    - alvo: "13-ofensiva-pentest#TEMA-04"
      motivo: "purple team mede detecção; sem caso de uso no SOC não existe o que medir"
    - alvo: "02-governanca-risco-compliance#TEMA-05"
      motivo: "o framework declara o resultado de detecção esperado e o caso de uso do SOC é a implementação verificável dele"
    - alvo: "12-vulnerabilidades-threat-intel#TEMA-04"
      motivo: "as duas leituras usam ATT&CK, uma para escrever a regra e a outra para priorizar o que o adversário explora em campo"
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com: []
fontes:
  - titulo: "MITRE ATT&CK — Tactics, Enterprise, versão atual v19.2 vigente desde 28 de abril de 2026"
    url: "https://attack.mitre.org/tactics/enterprise/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "MITRE ATT&CK — Version History, esquema de versão major.minor e histórico de versões"
    url: "https://attack.mitre.org/resources/versions/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "SigmaHQ — Sigma Rules Specification, versão 2.1.0, de 02 de agosto de 2025"
    url: "https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA — Cybersecurity Incident & Vulnerability Response Playbooks, publicação de novembro de 2021"
    url: "https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "MITRE D3FEND — grafo de conhecimento de contramedidas, versão 1.6.0"
    url: "https://d3fend.mitre.org/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Detecção: regras, casos de uso e MITRE ATT&CK

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir escrever um caso de uso de detecção com fonte de dados, lógica, condição, nível e mapeamento em ATT&CK, e declarar por escrito o falso positivo que a regra deve produzir — critério que outro analista consegue revisar sem perguntar a você.

## 2. Pré-requisitos

[TEMA-02](./TEMA-02-fontes-de-log-e-telemetria.md): a regra só vale sobre telemetria que existe. A leitura de ATT&CK para priorização do que o adversário explora fica em [12 Vulnerabilidades e threat intelligence](../12-vulnerabilidades-threat-intel/README.md).

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Quantas regras de detecção a sua operação tem ligadas hoje? Chute um número e diga quem as revisou por último.
   Confiança: ___
2. Quem escreve essas regras: o time interno, o fornecedor da ferramenta ou os dois? Anote sua aposta e quem saberia responder.
   Confiança: ___
3. Se um analista quisesse entender hoje o que uma regra detecta, qual documento ele abriria? Se não houver documento, anote essa resposta.
   Confiança: ___

## 4. Caso real

O playbook do CISA observa que indicadores atômicos — domínio, endereço IP — têm prazo de validade curto: o adversário troca infraestrutura entre campanhas, usa infraestrutura diferente por alvo e muda de endereço quando percebe que foi notado. O mesmo documento registra que o adversário pode introduzir ferramenta nova ou modificar a existente para subverter mecanismo de resposta centrado em indicador. A recomendação escrita é usar padrão de comportamento, a TTP, sempre que possível, e comparar a TTP observada com o que está documentado no ATT&CK.

A pergunta que o caso deixa aberta: se o padrão de comportamento é o que sustenta a detecção, como demonstrar cobertura sem recorrer a contagem de regras?

## 5. Conteúdo

### 5.1 Conceito

Uma regra de detecção é uma aposta: a aposta de que determinada combinação de campos separa a atividade maliciosa da atividade autorizada com frequência suficiente para valer a atenção de um analista. Fonte de dados, lógica, condição, nível e falso positivo esperado são as cinco partes que tornam a aposta revisável. Falta qualquer uma e a regra vira caixa preta que ninguém ousa desligar.

Casos de uso organizam as regras por pergunta de negócio e não por ferramenta: "detectar uso de credencial válida fora do padrão da conta" agrupa várias regras em fontes diferentes. Um caso de uso tem dono, técnica coberta, fonte, nível e métrica de ruído.

O ATT&CK entra como mapa de cobertura. A versão atual é a v19.2, vigente desde 28 de abril de 2026, e o catálogo usa esquema de versão maior e menor, com a v18.1 tendo vigorado de 28 de outubro de 2025 a 27 de abril de 2026. A versão de empresa lista 15 táticas, de TA0043 Reconnaissance a TA0040 Impact, incluindo TA0005 Stealth, que descreve o adversário tentando esconder e dissimular suas ações, e TA0112 Defense Impairment, que descreve a tentativa de quebrar mecanismo, fluxo e ferramenta de defesa para que o defensor não veja nem confie no que está acontecendo. O mapa muda: táticas novas alteram o vocabulário do relatório de cobertura, e por isso a versão usada precisa estar registrada.

Do outro lado do mapa está o D3FEND, na versão 1.6.0, um grafo de contramedidas com sete táticas — Model, Harden, Detect, Isolate, Deceive, Evict e Restore — e técnicas identificadas por código, como D3-NTA para análise de tráfego de rede, D3-PA para análise de processo e D3-UBA para análise de comportamento de usuário. ATT&CK descreve o ataque; D3FEND nomeia a resposta. Uma regra que não se liga a nenhuma contramedida identificável detecta algo sobre o que a organização não decidiu o que fazer.

### 5.2 Como funciona

A especificação Sigma, na versão 2.1.0 de 02 de agosto de 2025, descreve um formato genérico de assinatura para sistemas de SIEM. O arquivo é YAML em UTF-8, com quebra de linha LF, indentação de quatro espaços e chaves minúsculas. Título, `logsource`, `detection` e `condition` são obrigatórios; `id` com UUID versão 4, `status`, `level`, `falsepositives`, `tags` e `scope` são opcionais.

`logsource` descreve o dado de entrada por `category`, `product` e `service`, o que desacopla a regra do produto que gera o log. `detection` reúne identificadores de busca; `condition` combina esses identificadores com `and`, `or`, `not`, `1 of` e `all of`. O campo `level` tem cinco valores: informativo, para enriquecimento, sem abertura de caso ou alerta; baixo, evento notável que raramente é incidente; médio, evento relevante com revisão manual frequente; alto, evento que deve gerar alerta interno e revisão imediata; crítico, evento que indica incidente e exige revisão imediata, usado quando a probabilidade beira a certeza.

Dois recursos da especificação resolvem problema de manutenção. A correlação permite ligar vários eventos em uma regra de meta-nível, o que viabiliza lógica como contagem de falha de autenticação seguida de sucesso. Os filtros permitem escrever em um lugar só a exclusão que vale para várias regras, evitando que o mesmo ruído seja rejeitado em vinte arquivos com vinte critérios ligeiramente diferentes.

O `tags` segue sintaxe com ponto como separador de namespace, no formato `attack.t1234`. A cobertura deixa de ser uma planilha paralela e passa a ser derivada do repositório de regras: cada regra declara a técnica que cobre.

### 5.3 Exemplo resolvido

Objetivo de cobertura: detectar execução de PowerShell com comando codificado, técnica que aparece na tática de execução e que o CISA lista entre os casos a mapear em ATT&CK. O nível alvo é médio, porque o evento é relevante e exige revisão, mas não é conclusivo.

Passo a passo.

1. Escolher a fonte. A criação de processo é o evento que carrega o nome da imagem e a linha de comando; sem ela não há como distinguir comando codificado de execução normal.
2. Escrever a lógica com o vocabulário abstrato de `logsource`, para que a mesma regra valha para qualquer coletor que produza o evento de criação de processo.
3. Declarar a exceção dentro da própria regra, com o serviço que usa comando codificado de forma legítima, em vez de deixar a exceção para a consciência do analista.
4. Declarar falsos positivos conhecidos, porque a especificação prevê esse campo e o ruído esperado precisa ser auditável.
5. Fixar o nível e a técnica coberta.

```yaml
title: 'PowerShell com comando codificado'
status: experimental
description: 'Detecta criacao de processo de PowerShell com argumento de comando codificado'
references:
    - 'https://attack.mitre.org/tactics/TA0002/'
author: 'equipe de deteccao'
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        Image|endswith: '\powershell.exe'
        CommandLine|contains:
            - ' -enc '
            - ' -EncodedCommand '
    filter_automacao:
        User|endswith:
            - '\svc_inventario'
            - '\svc_backup'
    condition: selection and not filter_automacao
fields:
    - CommandLine
    - ParentImage
falsepositives:
    - 'Script de inventario assinado que usa comando codificado'
    - 'Ferramenta de automacao de terceiro com codificacao propria'
level: medium
tags:
    - attack.t1059
```

6. Registrar a regra em um repositório versionado com o status inicial `experimental`, que a especificação define como a regra que pode gerar falso positivo e ainda assim identificar evento interessante. Promover a `stable` depois de um período com o ruído medido.

### 5.4 Problema de completar

Objetivo de cobertura: movimento lateral por serviço remoto usando credencial válida, que o playbook do CISA mapeia para log de rede interna, log de evento de host e log de aplicação, com o sinal de combinação entre usuário e máquina fora do padrão. Complete.

1. Fonte mínima necessária no lado do host: ___
2. Fonte mínima no lado da rede: ___
3. Lógica em uma frase, incluindo o que distingue a atividade legítima: ___
4. Nível e justificativa com o vocabulário da especificação: ___
5. Falsos positivos esperados: ___
6. Tática e técnica que a regra cobre: ___

## 6. Por que isso importa para o CISO

Cobertura de detecção é a resposta técnica à pergunta "estamos protegidos?" e é também a área em que é mais fácil comprar número em vez de capacidade. Contar regras ativas não informa nada; informar quantas táticas relevantes têm regra com nível alto, falso positivo declarado e dono, e quantas foram revisadas no último semestre, muda a conversa de orçamento. O mapa ATT&CK também serve de argumento defensivo em apuração posterior: mostra que a técnica executada estava endereçada no papel e revela se o problema foi a regra, a fonte de dado ou o turno de plantão.

## 7. Aplicação prática

Pegue uma regra que já gera alerta no seu ambiente e reescreva as cinco partes: fonte, lógica, condição, nível e falsos positivos esperados. Se não houver mapeamento de técnica, associe uma das 15 táticas de empresa da versão corrente do ATT&CK, registrando a versão consultada. Depois responda por escrito: quem é o dono dessa regra e em que data ela foi revisada pela última vez.

## 8. Autoexplicação

Explique em três frases por que a mesma detecção precisa de fonte de dado, lógica e mapeamento. Ligue a algo que você já faz hoje: a lista de exceções que alguém do time aplicou manualmente na triagem no último mês é uma lista de regras que deveriam ser corrigidas.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Medir cobertura pela quantidade de regras | regra duplicada, desligada ou sem dono infla o número sem cobrir tática nenhuma | medir cobertura por tática com regra em produção, ativa e revisada |
| Tratar a lista de indicadores como detecção | o prazo de validade do indicador é curto e o adversário troca de infraestrutura entre campanhas | usar padrão de comportamento como base e indicador como reforço temporário |
| Deixar a exceção na cabeça do analista | o conhecimento não sobrevive à troca de turno e some das métricas | declarar a exceção na regra ou no filtro compartilhado |
| Não registrar a versão do framework usada | TA0005 passou a se chamar Stealth e TA0112 Defense Impairment existe na versão corrente, o que muda relatório antigo | gravar a versão do ATT&CK em cada avaliação de cobertura |

## 10. Recuperação ativa

1. Quais campos da especificação Sigma são obrigatórios e quais são opcionais?
2. O que significa o nível informativo na especificação, e qual é a consequência operacional desse nível?
3. Um analista propõe criar três regras separadas para o mesmo padrão, uma por produto de origem do log. Qual recurso da especificação evita essa triplicação e por quê?
4. Um relatório de cobertura diz que a organização cobre 70% das técnicas de ATT&CK. Qual pergunta você faz antes de aceitar o número?

<details>
<summary>Conferir respostas</summary>

1. Obrigatórios: título, `logsource`, `detection` e `condition`. Opcionais, entre outros: `id`, `status`, `level`, `falsepositives`, `tags` e `scope`.
2. É o nível destinado a enriquecimento; pela própria especificação não deve abrir caso nem alerta, porque se espera grande volume de eventos casando. Na operação, regra informativa que dispara alerta é erro de configuração.
3. O campo `logsource`, que descreve o dado por categoria, produto e serviço e permite apontar a mesma regra para fontes equivalentes, em vez de replicar a lógica por produto.
4. Qual versão do ATT&CK foi usada, o que conta como coberta — regra em produção, ativa, com nível alto e dono — e se a contagem inclui técnica sem fonte de telemetria disponível no ambiente.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder a seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Escrever uma regra nova de memória, com nível e falso positivo | Rebaixar: repetir em D+3 |
| D+30 | Revisar a cobertura das 15 táticas de empresa contra as suas regras em produção | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 02-governanca-risco-compliance#TEMA-05 | o framework declara o resultado de detecção esperado e o caso de uso do SOC é a implementação verificável dele |
| complementa | 12-vulnerabilidades-threat-intel#TEMA-04 | as duas leituras usam ATT&CK, uma para escrever a regra e a outra para priorizar o que o adversário explora em campo |
| complementa | 13-ofensiva-pentest#TEMA-04 | purple team mede detecção; sem caso de uso no SOC não existe o que medir |

## 13. Certificações e leitura recomendada

| Certificação | Domínio coberto | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CySA+ | Análise de segurança e detecção por caso de uso | MITRE ATT&CK — Tactics, Enterprise, v19.2 | primaria | https://attack.mitre.org/tactics/enterprise/ |
| GCIH | Tratamento de incidente e leitura de modelo de adversário | SigmaHQ — Sigma Rules Specification, v2.1.0 | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md |

Leitura recomendada: [CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021](https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | MITRE ATT&CK — Tactics, Enterprise, v19.2 desde 28 de abril de 2026, 15 táticas | primaria | https://attack.mitre.org/tactics/enterprise/ | "2026-09-25" | alta |
| 2 | MITRE ATT&CK — Version History, esquema major.minor | primaria | https://attack.mitre.org/resources/versions/ | "2026-09-25" | alta |
| 3 | SigmaHQ — Sigma Rules Specification, v2.1.0, 02 de agosto de 2025 | primaria | https://github.com/SigmaHQ/sigma-specification/blob/main/specification/sigma-rules-specification.md | "2026-09-25" | alta |
| 4 | CISA — Cybersecurity Incident & Vulnerability Response Playbooks, novembro de 2021 | primaria | https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf | "2026-09-25" | alta |
| 5 | MITRE D3FEND, versão 1.6.0 | primaria | https://d3fend.mitre.org/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [10 Operações de segurança e SOC](./README.md) |
| Tema anterior | [TEMA-02](TEMA-02-fontes-de-log-e-telemetria.md) |
| Próximo tema | [TEMA-04](TEMA-04-triagem-severidade-e-escalonamento.md) |
| Home | [README](../README.md) |
