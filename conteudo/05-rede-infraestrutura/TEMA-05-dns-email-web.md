---
tema: "Segurança de DNS, e-mail e web"
tema_id: "TEMA-05"
area_id: "05-rede-infraestrutura"
nivel: intermediario
tempo_estimado: "35-50 min"
objetivo_aprendizagem: "Verificar o estado de DNSSEC, de autenticação de e-mail e de HTTPS de um domínio próprio, listando o que falta para cada controle e quem é o dono de cada pendência"
atende_objetivo: [5]
certificacoes: ["Network+", "Security+"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "15-fatores-humanos#TEMA-02"
      motivo: "o controle de e-mail reduz o alcance do clique que o programa de conscientização tenta evitar, e os dois medem o mesmo fenômeno por lados diferentes; destino planejado, número provisório"
  aprofundado_por: []
  aplicado_em:
    - alvo: "10-operacoes-soc#TEMA-03"
      motivo: "o registro do resolver é uma das poucas fontes que mostram consulta a domínio de comando e controle antes de qualquer bloqueio; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-81 Rev. 3 — Secure Domain Name System (DNS) Deployment Guide, março de 2026"
    url: "https://csrc.nist.gov/pubs/sp/800/81/r3/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-81-2 — Secure Domain Name System (DNS) Deployment Guide, setembro de 2013, retirado em 19/03/2026"
    url: "https://csrc.nist.gov/pubs/sp/800/81/2/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance (DMARC)"
    url: "https://www.rfc-editor.org/info/rfc7489/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-52 Rev. 2 — Guidelines for the Selection, Configuration, and Use of Transport Layer Security (TLS) Implementations, agosto de 2019"
    url: "https://csrc.nist.gov/pubs/sp/800/52/r2/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "CISA — Enhanced Email and Web Security, guia derivado da Binding Operational Directive 18-01"
    url: "https://www.cisa.gov/resources-tools/resources/enhanced-email-and-web-security"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: media
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Segurança de DNS, e-mail e web

Uma ideia central: três serviços decidem para onde o usuário vai e o que ele aceita, e quando um deles é alterado o resto da defesa perde efeito.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: verificar o estado de DNSSEC, de autenticação de e-mail e de HTTPS de um domínio sob sua responsabilidade, listando o que falta em cada controle, o risco de cada lacuna e o dono da pendência.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-fundamentos-de-rede-para-o-gestor.md). Resolução de nome e caminho do fluxo são a base desta verificação.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: o seu domínio principal publica política de autenticação de mensagem, e em qual modo — observação, quarentena ou rejeição? Aposte.
   Confiança: ___
2. Palpite: qual resolver os seus usuários consultam no escritório, e quem vê essas consultas? Escreva o palpite.
   Confiança: ___
3. Antes de ler: quem responde pela zona de DNS principal da sua empresa — o time de rede, o provedor ou ninguém nomeado? Aposte.
   Confiança: ___

## 4. Caso real

O NIST retirou o SP 800-81-2, de setembro de 2013, em 19 de março de 2026, e o substituiu pelo SP 800-81 Rev. 3, publicado na mesma data. A revisão 3 traz entre suas palavras-chave DNSSEC, registro de DNS, DNS cifrado e DNS protetivo, e abre o resumo com uma frase seca: um ataque contra a infraestrutura de DNS de uma empresa ameaça toda operação de rede dessa empresa.

A edição anterior partia de premissa diferente. O SP 800-81-2 afirmava que os objetivos primários de segurança do DNS são integridade de dado e autenticação de origem, e dedicava o documento a mantê-las. A revisão 3 acrescenta camadas de operação: registro, cifra do transporte de consulta e uso do serviço como sensor. O acréscimo acompanha o uso novo do DNS, que passou a servir também para bloqueio e para detecção.

Quem cita o SP 800-81-2 em política interna hoje cita documento retirado há meses. O ponto de atenção não é acadêmico: um plano de segurança de DNS aprovado sobre a edição antiga não menciona registro nem uso protetivo, que são exatamente os controles que a revisão 3 acrescentou.

A pergunta que o caso deixa aberta: se um ataque ao nome derruba a operação inteira, quais quatro decisões de configuração precisam de dono e de data?

## 5. Conteúdo

### 5.1 Conceito

O DNS traduz nomes em endereços, e quem responde escolhe o destino. Três decisões definem o estado de proteção de um domínio. A primeira é quem responde: servidor autoritativo próprio ou de terceiro, com contrato e com acesso restrito. A segunda é se a resposta é assinada: DNSSEC permite que o resolver validante verifique que a resposta veio da zona autoritativa e não foi alterada no caminho. A terceira é quem consulta em nome dos usuários: o resolver corporativo vê todas as consultas e é o ponto onde se aplica bloqueio e registro.

Os dois últimos pontos são a razão de o DNS ser controle e não só serviço. Com o transporte de consulta cifrado no trecho do cliente, o conteúdo continua visível para quem opera o resolver que recebe a consulta. O ponto de observação muda de lugar em vez de desaparecer.

No e-mail, o problema é de identidade de remetente. Qualquer pessoa pode escrever o nome do seu domínio no campo de remetente; o protocolo original não exige prova. A família de controles que resolve isso combina autorização de envio e autenticação de mensagem, e o RFC 7489 descreve o DMARC como o mecanismo que permite aos originadores associar identificadores de domínio confiáveis e autenticados às mensagens, comunicar políticas sobre mensagens que usam esses identificadores e reportar sobre o uso deles.

### 5.2 Como funciona

A cadeia do DNS tem quatro papéis: o cliente que consulta, o resolver recursivo que busca, o servidor autoritativo que responde pela zona e o conteúdo assinado que permite validar. DNSSEC entra no quarto papel e exige assinatura na zona e validação no resolver. Assinar sem validar não produz efeito, e é o erro de implantação mais comum: a zona publica as chaves, e o resolver da empresa não valida nada.

A segurança de nome tem três lacunas que o DNSSEC não cobre. Ele não esconde o nome consultado, não impede bloqueio por indisponibilidade e não protege contra nome de domínio parecido com outro. Registro de consulta no resolver responde a primeira; redundância de servidor autoritativo responde à segunda; e monitoramento de registro de domínio parecido responde à terceira.

No e-mail, a verificação funciona em três camadas. A primeira autoriza quem pode enviar em nome do domínio. A segunda assina a mensagem de modo que o destinatário possa verificar que o conteúdo chegou intacto e que a assinatura se refere àquele domínio. A terceira publica a política do domínio para as duas primeiras: o que fazer quando a verificação falha e para onde enviar os relatórios. O RFC 7489 é o documento que descreve essa terceira camada, chamada DMARC.

A política tem três modos: não fazer nada e apenas coletar relatório, colocar em quarentena e rejeitar. O modo de observação é etapa de transição, e transição sem prazo é o que se encontra em operação: domínio com política publicada há dois anos, ainda em observação, com percentual de mensagens legítimas mal configuradas que ninguém mediu.

As especificações dos dois primeiros controles têm RFC próprio. Nesta execução não foram conferidos em fonte primária, e por isso o texto os trata por função e não por número: **NAO CONFIRMADO em fonte oficial** para os números dos RFC de SPF e de DKIM.

No acesso web, o controle visível ao usuário é o cadeado do navegador, e ele indica apenas que o transporte é protegido com certificado válido. O NIST SP 800-52 Rev. 2 trata da seleção e configuração de implementações de TLS e menciona orientação sobre certificados e extensões que impactam segurança. A CISA mantém um guia de segurança de e-mail e web derivado da Binding Operational Directive 18-01, dirigido a órgãos federais americanos e divulgado como referência para outras entidades.

### 5.3 Exemplo resolvido

Ambiente hipotético: domínio corporativo único usado para e-mail, site institucional e portal de cliente.

Passo 1, estado atual. A zona está assinada, mas o resolver interno não valida. O e-mail tem autorização de envio publicada para o provedor de disparo em massa e política de autenticação em modo de observação, com relatório semanal enviado a um endereço que ninguém lê. O portal usa TLS 1.2 e 1.3 com certificado de autoridade pública renovado por procedimento manual.

Passo 2, priorizar por efeito. Duas ações rendem mais. Ligar a validação no resolver torna o DNSSEC útil e não muda nada para o usuário. Ler o relatório de autenticação de e-mail por quatro semanas define se a política pode sair de observação, e essa leitura é o que separa política publicada de política efetiva.

Passo 3, executar. O resolver passa a validar, com registro das falhas de validação. O relatório de e-mail passa a ser lido por uma pessoa nomeada, com planilha de fontes legítimas e de fontes desconhecidas. Ao final do período, as fontes desconhecidas são tratadas: ou entram na autorização de envio, ou a política avança de modo.

Passo 4, provar. O teste de validação usa um domínio de teste conhecido por assinatura inválida, e o resolver rejeita a resposta. O avanço de política é comprovado pela consulta pública ao registro do domínio, com data.

O que o exemplo demonstra é que a maior parte do ganho não vem de comprar serviço. Vem de ligar a validação e de nomear quem lê o relatório.

### 5.4 Problema de completar

Mesma empresa, agora com portal de parceiro exposto à internet.

| Controle | Estado hoje | Risco se ficar assim | Dono |
|---|---|---|---|
| Assinatura da zona | assinada | ______ | ______ |
| Validação no resolver interno | desligada | ______ | ______ |
| Política de autenticação de e-mail | observação | ______ | ______ |
| Registro de consulta no resolver | não existe | ______ | ______ |
| Certificado do portal externo | manual, 90 dias | ______ | ______ |

Complete as lacunas e responda por escrito: qual desses cinco itens tem a menor razão entre custo e redução de risco, e qual tem a maior. Justifique com o efeito concreto de cada um sobre bloqueio e sobre investigação.

## 6. Por que isso importa para o CISO

Mensagem falsa com o nome da empresa é o incidente que chega ao cliente e ao jornal, e o controle que a reduz custa configuração e leitura de relatório, não licença. Quando a diretoria pergunta o que foi feito contra fraude de identidade, a resposta defensável é a política publicada do domínio, o modo dela e a data em que passou a bloquear.

A segunda consequência é a única telemetria que sobrevive ao tráfego cifrado. Em rede onde quase tudo está cifrado ponta a ponta, o registro de consulta do resolver continua mostrando o nome que a estação pediu, e é ali que se vê contato com domínio usado por ataque antes de o bloqueio existir. Quem trata DNS como serviço de infraestrutura perde a fonte.

A terceira é de responsabilidade compartilhada. Registro de domínio, zona, chave de assinatura e renovação de certificado são ativos com dono. Quando o domínio está registrado no nome de um funcionário que saiu e a assinatura de zona está com o fornecedor, o CISO descobre no pior momento que o controle não está sob sua autoridade.

## 7. Aplicação prática

Faça a consulta pública dos registros do seu domínio principal e responda três perguntas: existe política de autenticação de e-mail, em qual modo e com qual endereço de relatório. Depois pergunte à equipe de infraestrutura se a zona é assinada e se o resolver interno valida. Anote as duas respostas.

Em seguida verifique quem recebe o relatório de autenticação e quantas mensagens foram reportadas como falha no último mês. Se ninguém recebe, o item entra na lista com um nome e uma data. Se recebe e ninguém lê, o item é processo, e processo se resolve com atribuição, não com ferramenta.

## 8. Autoexplicação

Explique em três frases por que assinar a zona sem validar no resolver não produz efeito. Conecte ao seu ambiente: quem na sua empresa veria hoje uma consulta de estação a um domínio recém-registrado usado por ataque, e em quanto tempo essa pessoa saberia?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| DNSSEC cobre a segurança do DNS inteiro | Ele prova origem e integridade da resposta, e não esconde o nome consultado nem impede indisponibilidade | Trate DNSSEC, registro de consulta e redundância como controles distintos |
| Política de e-mail em observação protege o domínio | Observação registra e não bloqueia mensagem em nome do domínio | Defina prazo de transição, leia o relatório e avance de modo |
| Filtro de spam resolve fraude de identidade | Filtro de conteúdo não verifica se o remetente tinha autorização para usar o domínio | Combine autorização de envio, assinatura de mensagem e política publicada |
| Cadeado no navegador significa site confiável | O cadeado indica transporte protegido com certificado válido, não a intenção de quem opera o site | Verifique o certificado, o domínio exato e o que o site faz com o dado |
| Citar o SP 800-81-2 em política interna é aceitável | O documento foi retirado em 19/03/2026 e substituído pela revisão 3 | Atualize a política para a revisão vigente e registre a data da revisão |
| Resolver público melhora a experiência e não custa nada | Retira o ponto de registro e de bloqueio que a empresa opera | Decida o resolver como controle, com registro e dono |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais são as quatro palavras-chave da revisão 3 do guia de DNS do NIST relacionadas a segurança do serviço, e quando essa revisão foi publicada?
2. O que o resumo da revisão 3 afirma sobre o efeito de um ataque contra a infraestrutura de DNS de uma empresa?
3. O que o SP 800-81-2 descrevia como objetivos primários de segurança do DNS, e em que data ele foi retirado?
4. O que o RFC 7489 permite aos originadores de correio fazer, segundo o resumo do documento?
5. Por que o registro de consulta do resolver continua sendo fonte útil quando o transporte de consulta está cifrado?
6. Quais decisões de configuração de DNS precisam de dono e de data em uma política de domínio?

<details>
<summary>Conferir respostas</summary>

1. DNSSEC, registro de DNS, DNS cifrado e DNS protetivo. Publicada em março de 2026, com final em 19/03/2026, substituindo o SP 800-81-2.
2. Que um ataque contra a infraestrutura de DNS de uma empresa ameaça toda operação de rede dessa empresa.
3. Integridade de dado e autenticação de origem, considerando que o dado de DNS é público por natureza. O documento foi retirado em 19 de março de 2026.
4. Associar identificadores de domínio confiáveis e autenticados às mensagens, comunicar políticas sobre mensagens que usam esses identificadores e reportar sobre o uso deles.
5. Porque a cifra protege o trecho entre o cliente e o resolver; o resolver que recebe a consulta continua vendo o nome consultado, e é ele que a organização opera e registra.
6. Quem responde pela zona, se a resposta é assinada e validada, quem opera o resolver e o que ele registra ou bloqueia, e quem renova o certificado dos serviços expostos, cada um com dono, data e procedimento.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Citar de memória as quatro palavras-chave da revisão 3 e os três modos de política de e-mail | Rebaixar: repetir em D+1 |
| D+7 | Repetir a consulta pública dos registros do domínio e comparar com a anotação anterior | Rebaixar: repetir em D+3 |
| D+30 | Verificar se o relatório de autenticação de e-mail teve leitura e decisão registradas | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 10-operacoes-soc#TEMA-03 | o registro do resolver é uma das poucas fontes que mostram consulta a domínio de comando e controle antes de qualquer bloqueio; destino planejado, número provisório |
| complementa | 15-fatores-humanos#TEMA-02 | o controle de e-mail reduz o alcance do clique que o programa de conscientização tenta evitar, e os dois medem o mesmo fenômeno por lados diferentes; destino planejado, número provisório |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| Security+ | Cobertura geral do tema | CompTIA Security+ | primaria | https://www.comptia.org/certifications/security |
| Network+ | Cobertura geral do tema | CompTIA Network+ | primaria | https://www.comptia.org/certifications/network |

Leitura direta: [NIST SP 800-81 Rev. 3, Secure DNS Deployment Guide](https://csrc.nist.gov/pubs/sp/800/81/r3/final) e [CISA, Enhanced Email and Web Security](https://www.cisa.gov/resources-tools/resources/enhanced-email-and-web-security).

O detalhe de cada credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-81 Rev. 3 — escopo, palavras-chave, autores e data de março de 2026 | primaria | https://csrc.nist.gov/pubs/sp/800/81/r3/final | "2026-09-25" | alta |
| 2 | NIST SP 800-81-2 — objetivos primários do DNS e retirada em 19/03/2026 | primaria | https://csrc.nist.gov/pubs/sp/800/81/2/final | "2026-09-25" | alta |
| 3 | RFC 7489 — DMARC como associação de identificadores autenticados, comunicação de política e reporte | primaria | https://www.rfc-editor.org/info/rfc7489/ | "2026-09-25" | alta |
| 4 | NIST SP 800-52 Rev. 2 — seleção e configuração de TLS e orientação sobre certificados, agosto de 2019 | primaria | https://csrc.nist.gov/pubs/sp/800/52/r2/final | "2026-09-25" | alta |
| 5 | CISA — Enhanced Email and Web Security, derivado da Binding Operational Directive 18-01 | primaria | https://www.cisa.gov/resources-tools/resources/enhanced-email-and-web-security | "2026-09-25" | media |

---

| Navegação | |
|---|---|
| Área | [05 Segurança de rede e infraestrutura](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-criptografia-de-transporte-tls-vpn.md) |
| Próximo tema | [TEMA-06](TEMA-06-monitoramento-de-trafego-arquitetura.md) |
| Home | [README](../README.md) |
