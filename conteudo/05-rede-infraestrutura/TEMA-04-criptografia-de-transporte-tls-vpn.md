---
tema: "Criptografia de transporte: TLS e VPN"
tema_id: "TEMA-04"
area_id: "05-rede-infraestrutura"
nivel: intermediario
tempo_estimado: "35-45 min"
objetivo_aprendizagem: "Julgar a adequação de versão, certificado e ponto de término de uma conexão protegida, indicando onde o conteúdo volta a ser legível"
atende_objetivo: [4]
certificacoes: ["Network+", "Security+"]
pre_requisitos: ["TEMA-01"]
relacoes:
  complementa:
    - alvo: "07-criptografia-segredos#TEMA-03"
      motivo: "o TLS da rede é o mesmo protocolo que a área de criptografia detalha: aqui se decide onde o túnel começa e termina, lá está a mecânica de chave, certificado e cadeia de confiança; destino planejado, número provisório"
  aprofundado_por: []
  aplicado_em:
    - alvo: "04-identidade-acesso#TEMA-06"
      motivo: "túnel de acesso remoto vira decisão por identidade e por estado do dispositivo quando o padrão de zero trust é aplicado; destino planejado, número provisório"
  nao_confundir_com: []
fontes:
  - titulo: "NIST SP 800-52 Rev. 2 — Guidelines for the Selection, Configuration, and Use of Transport Layer Security (TLS) Implementations, agosto de 2019"
    url: "https://csrc.nist.gov/pubs/sp/800/52/r2/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "RFC 9846 — The Transport Layer Security (TLS) Protocol Version 1.3, que obsoleta o RFC 8446"
    url: "https://www.rfc-editor.org/info/rfc9846/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3, agosto de 2018, obsoletado pelo RFC 9846"
    url: "https://www.rfc-editor.org/info/rfc8446/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-77 Rev. 1 — Guide to IPsec VPNs, junho de 2020"
    url: "https://csrc.nist.gov/pubs/sp/800/77/r1/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-207 — Zero Trust Architecture, agosto de 2020"
    url: "https://csrc.nist.gov/pubs/sp/800/207/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Criptografia de transporte: TLS e VPN

Uma ideia central: um túnel protege o conteúdo entre dois pontos e não protege nada fora deles, de modo que a decisão que importa é onde o túnel termina.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: julgar se uma conexão protegida usa versão e certificado aceitáveis, identificar onde o conteúdo volta a ser legível no caminho e indicar quem tem acesso administrativo a esse ponto.

## 2. Pré-requisitos

[TEMA-01](TEMA-01-fundamentos-de-rede-para-o-gestor.md). A pergunta de legibilidade só existe depois que o caminho está desenhado.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Qual versão de TLS os seus serviços próprios aceitam hoje, e qual delas foi desativada por último?
   Confiança: ___
2. Quem consegue ler o conteúdo entre o balanceador de carga e o servidor de aplicação na sua empresa?
   Confiança: ___
3. O que a organização ganha e o que ela perde ao inspecionar tráfego cifrado na saída?
   Confiança: ___

## 4. Caso real

O NIST SP 800-52 Rev. 2, publicado em agosto de 2019, exige que TLS 1.2 configurado com suítes de cifra baseadas em FIPS seja suportado por todos os servidores e clientes TLS do governo americano, e exige suporte a TLS 1.3 até 1º de janeiro de 2024. Uma nota de planejamento de 07/05/2026 informa que a publicação está em revisão no projeto de revisão de publicações criptográficas do NIST.

O mesmo período trouxe uma mudança documental que quase ninguém acompanhou. O RFC 8446, de agosto de 2018, que especificou o TLS 1.3, foi obsoletado pelo RFC 9846. O documento novo obsoleta o RFC 8446 e também o RFC 5246, que especificava o TLS 1.2, além dos RFCs 5077, 6961, 7627 e 8422, e atualiza os RFCs 5705 e 6066. Quem cita "RFC 8446" em política interna está citando um documento substituído.

A pergunta que o caso deixa aberta: como uma organização mantém política de transporte alinhada quando a norma de configuração e o documento do protocolo mudam em ritmos diferentes?

## 5. Conteúdo

### 5.1 Conceito

O TLS existe para oferecer três propriedades sobre um canal entre dois pontos: sigilo, integridade e autenticação do servidor, com autenticação do cliente opcional. O RFC 8446 descreve como objetivo primário prover um canal seguro entre dois pares e afirma que as propriedades devem valer mesmo diante de um atacante com controle completo da rede. O mesmo documento registra duas limitações que interessam ao gestor: o TLS não esconde o comprimento dos dados, e o modo 0-RTT tem propriedades mais fracas, sem sigilo direto e sem garantia de não repetição.

VPN é proteção de transporte aplicada ao caminho, não ao serviço. O NIST SP 800-77 Rev. 1, de junho de 2020, descreve IPsec como controle de segurança de camada de rede amplamente usado, framework de padrões abertos para comunicações privadas sobre IP, configurado em geral pelo protocolo de troca de chaves IKE. A distinção que importa ao CISO: IPsec protege tudo o que passa pelo túnel, inclusive protocolos que nunca pensaram em criptografia; TLS protege a sessão de uma aplicação específica.

A pergunta central não é qual dos dois é melhor, e sim onde cada um termina. Túnel que termina em um balanceador de carga deixa o trecho seguinte em claro. Túnel de acesso remoto que termina na rede interna coloca o dispositivo do usuário dentro da rede, que é exatamente o que o NIST SP 800-207 questiona ao afirmar que as defesas passam de perímetros de rede estáticos para o foco em usuários, ativos e recursos.

### 5.2 Como funciona

O TLS 1.3 divide a conexão em três fases: troca de chaves, parâmetros do servidor e autenticação. Depois da primeira fase, tudo é cifrado, inclusive os certificados do servidor. O RFC 8446 lista as diferenças funcionais em relação ao TLS 1.2, e três delas mudam decisão de gestão: as suítes de cifra legadas foram removidas e as que restam são de criptografia autenticada; as suítes de RSA estático e de Diffie-Hellman estático saíram, e toda troca de chaves por chave pública passa a oferecer sigilo direto; e a negociação de versão por campo legado foi substituída por uma lista em extensão, com mecanismo de proteção contra rebaixamento de versão.

Sigilo direto tem consequência de investigação. Chave de sessão comprometida hoje não abre tráfego capturado de ontem, porque a chave efêmera foi descartada. Captura de pacote antiga perde valor probatório, e é por isso que a telemetria útil migrou para metadados e registros, assunto do [TEMA-06](TEMA-06-monitoramento-de-trafego-arquitetura.md).

Do lado da VPN, os elementos que o gestor precisa reconhecer na configuração são quatro: o modo, transporte ou túnel; o algoritmo e o grupo da troca de chaves; o método de autenticação dos pares, certificado ou chave pré-compartilhada; e a política de encaminhamento do que entra no túnel. Chave pré-compartilhada copiada para vários dispositivos deixa de identificar o par e vira credencial compartilhada, o que anula a propriedade de autenticação.

Há uma decisão de arquitetura que costuma aparecer só em auditoria: intercepção de TLS na saída. Ela cria um ponto onde o conteúdo é legível por definição, exige certificado próprio distribuído a todas as estações e transforma o dispositivo de intercepção em alvo de alto valor. Se a decisão for interceptar, ela precisa vir com política de retenção, de acesso ao registro e de finalidade declarada.

### 5.3 Exemplo resolvido

Ambiente hipotético: doze serviços internos expostos à rede corporativa, após um inventário de versões e certificados.

Passo 1, inventário. Nove serviços aceitam apenas TLS 1.2 e 1.3. Dois aceitam TLS 1.0 e 1.1, ambos em sistemas de fornecedor. Um usa certificado emitido por autoridade pública com validade de 90 dias renovada por processo manual.

Passo 2, classificar por exposição. Os dois serviços antigos estão acessíveis apenas pela rede interna de gestão, e servem área restrita. O certificado de 90 dias é do portal de parceiros, exposto à internet.

Passo 3, tratar risco por ordem de exposição. Biblioteca de criptografia é atualizada no sistema do portal de parceiros, e a renovação passa a ser automática com alerta em 21 dias antes do vencimento. A renovação manual com alerta é o que evita indisponibilidade; o prazo de 90 dias não é problema por si.

Passo 4, tratar os serviços antigos. Como não há atualização do fornecedor no ciclo atual, a decisão é reduzir exposição: o serviço sai da rede interna de gestão e passa a aceitar conexão apenas de dois endereços, com registro de sessão. A exceção entra na ata com prazo trimestral de reavaliação.

Passo 5, provar. Um teste interno tenta conectar aos dois serviços com TLS 1.0 a partir de uma estação comum e falha por não haver caminho. A evidência é o registro do próprio teste, guardado junto da ata.

O que o exemplo demonstra: a versão antiga nem sempre é corrigível no prazo, e a decisão que resta é de caminho e de registro. Também demonstra que o certificado vencido é risco de disponibilidade, e não risco de sigilo.

### 5.4 Problema de completar

Mesma empresa, agora o acesso remoto. Hoje, o funcionário entra por VPN e passa a ter acesso à rede interna conforme o perfil genérico.

| Pergunta | Resposta atual | Consequência |
|---|---|---|
| O que autentica o par na VPN | ______ | ______ |
| O que decide o que o usuário alcança depois do túnel | ______ | ______ |
| O dispositivo é verificado antes de entrar | ______ | ______ |
| O que fica registrado da sessão | ______ | ______ |

Complete as quatro linhas e responda: se a organização migrasse a decisão de acesso para identidade e estado do dispositivo, qual das quatro linhas mudaria primeiro, e que evidência provaria a mudança em auditoria?

## 6. Por que isso importa para o CISO

Certificado vencido é indisponibilidade, e indisponibilidade tem custo de receita e de reputação que aparece no mesmo dia. Uma política de transporte precisa de calendário de validade e de dono da renovação antes de precisar de criptografia mais forte.

A segunda consequência é sobre prova. Chave de sessão efêmera reduz o valor de captura antiga, e a organização que investiu em armazenar pacote descobre, durante o incidente, que não consegue decifrar o que guardou. Investir em metadado e em registro de sessão rende mais do que investir em volume de pacote.

A terceira é de dado pessoal. Intercepção de TLS produz um acervo que contém o que o usuário digitou em qualquer site, com finalidade declarada e acesso a definir. Quem decide interceptar precisa decidir também quem lê, por quanto tempo e sob qual justificativa, e essa decisão tem dono.

## 7. Aplicação prática

Escolha os dez serviços próprios mais usados e, para cada um, anote a versão mínima de TLS aceita, a validade do certificado e o ponto onde o TLS termina. Marque com uma linha os que aceitam TLS 1.0 ou 1.1.

Depois siga o caminho do serviço com certificado de validade mais curta e responda: quem renova, com quantos dias de antecedência, e o que aconteceria se essa pessoa estivesse de férias no dia do vencimento. Se a resposta for "ninguém sabe", escreva o procedimento de renovação com dono e alerta antecipado e leve para aprovação. É o item de menor custo e maior efeito imediato desta área.

## 8. Autoexplicação

Explique em três frases por que sigilo direto reduz o valor de tráfego capturado ontem. Conecte ao seu ambiente: onde hoje existe tráfego que trafega legível, e qual desses trechos você conseguiria fechar nos próximos noventa dias?

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| Usar VPN significa estar protegido | O túnel protege o transporte entre dois pontos e não decide o que o usuário alcança depois | Separe autenticação do túnel de autorização do recurso e verifique o dispositivo |
| Certificado vencido é falha de segurança de dados | O efeito imediato é indisponibilidade e alerta de navegador | Trate como item de continuidade, com dono, calendário e alerta antecipado |
| TLS 1.2 pode ser desativado sem inventário | Cliente antigo, integração de parceiro e equipamento de rede dependem de versões específicas | Inventarie antes, agrupe por exposição e desative por onda com plano de reversão |
| Interceptar TLS aumenta a segurança e nada mais | Cria ponto onde o conteúdo é legível e um alvo de alto valor, além de acervo com dado pessoal | Decida com finalidade, retenção, controle de acesso e dono declarados |
| Captura de pacote resolve a investigação futura | Com sigilo direto, a chave da sessão capturada não existe mais | Priorize metadado, registro de sessão e registro de resolução |
| Citar RFC 8446 é suficiente para política de TLS | O RFC 8446 foi obsoletado pelo RFC 9846 | Cite o documento vigente e registre a data da revisão da política |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais três propriedades o TLS oferece, e quais duas limitações o RFC 8446 registra explicitamente?
2. O que o RFC 9846 obsoleta, além do RFC 8446?
3. O que o NIST SP 800-52 Rev. 2 exige de TLS 1.2 e de TLS 1.3, e qual é a data limite citada no resumo?
4. O que o NIST SP 800-77 Rev. 1 descreve como IPsec, e por qual protocolo a configuração costuma ser feita?
5. Quais são as três diferenças do TLS 1.3 em relação ao TLS 1.2 com efeito de gestão?
6. Por que chave pré-compartilhada copiada para vários dispositivos enfraquece a VPN, e qual alternativa preserva a autenticação do par?

<details>
<summary>Conferir respostas</summary>

1. Sigilo, integridade e autenticação — do servidor sempre, do cliente opcionalmente. O RFC 8446 registra que o TLS não esconde o comprimento dos dados transmitidos e que o modo 0-RTT tem propriedades mais fracas, sem sigilo direto e sem garantia de não repetição.
2. O RFC 5246, que especificava o TLS 1.2, e também os RFCs 5077, 6961, 7627 e 8422, além de atualizar os RFCs 5705 e 6066.
3. Exige que TLS 1.2 configurado com suítes de cifra baseadas em FIPS seja suportado por todos os servidores e clientes TLS do governo, e exige suporte a TLS 1.3 até 1º de janeiro de 2024.
4. Um controle de segurança de camada de rede amplamente usado, framework de padrões abertos para comunicações privadas sobre redes IP, com configuração em geral feita pelo protocolo de troca de chaves IKE.
5. Remoção das suítes legadas com manutenção apenas de cifra autenticada; remoção de RSA estático e Diffie-Hellman estático, com sigilo direto em toda troca de chaves por chave pública; e substituição da negociação de versão por lista em extensão, com proteção contra rebaixamento de versão.
6. Porque deixa de identificar um par único: qualquer dispositivo com a cópia autentica como se fosse os demais, e a revogação exige trocar a chave em todos. Certificado por dispositivo, com revogação individual, preserva a identificação do par.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Citar de memória as três fases do handshake e as três diferenças do TLS 1.3 | Rebaixar: repetir em D+1 |
| D+7 | Refazer a seção 7 para outro grupo de serviços | Rebaixar: repetir em D+3 |
| D+30 | Conferir se a política de transporte cita o documento vigente e a data de revisão | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aplicado_em | 04-identidade-acesso#TEMA-06 | túnel de acesso remoto vira decisão por identidade e por estado do dispositivo quando o padrão de zero trust é aplicado; destino planejado, número provisório |
| complementa | 07-criptografia-segredos#TEMA-03 | o TLS da rede é o mesmo protocolo que a área de criptografia detalha: aqui se decide onde o túnel começa e termina, lá está a mecânica de chave, certificado e cadeia de confiança; destino planejado, número provisório |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| Security+ | Cobertura geral do tema | CompTIA Security+ | primaria | https://www.comptia.org/certifications/security |
| Network+ | Cobertura geral do tema | CompTIA Network+ | primaria | https://www.comptia.org/certifications/network |

Leitura direta: [RFC 9846, The Transport Layer Security Protocol Version 1.3](https://www.rfc-editor.org/info/rfc9846/) e [NIST SP 800-77 Rev. 1, Guide to IPsec VPNs](https://csrc.nist.gov/pubs/sp/800/77/r1/final).

O detalhe de cada credencial pertence a [90-certificacoes/](../90-certificacoes/README.md).

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-52 Rev. 2 — exigência de TLS 1.2 com suítes FIPS e de TLS 1.3 até 01/01/2024; nota de revisão de 07/05/2026 | primaria | https://csrc.nist.gov/pubs/sp/800/52/r2/final | "2026-09-25" | alta |
| 2 | RFC 9846 — obsoleta o RFC 8446 e o RFC 5246, além dos RFCs 5077, 6961, 7627 e 8422 | primaria | https://www.rfc-editor.org/info/rfc9846/ | "2026-09-25" | alta |
| 3 | RFC 8446 — objetivo do TLS, fases do handshake, diferenças do TLS 1.3 e limites do 0-RTT | primaria | https://www.rfc-editor.org/info/rfc8446/ | "2026-09-25" | alta |
| 4 | NIST SP 800-77 Rev. 1 — IPsec como controle de camada de rede e uso de IKE, junho de 2020 | primaria | https://csrc.nist.gov/pubs/sp/800/77/r1/final | "2026-09-25" | alta |
| 5 | NIST SP 800-207 — deslocamento das defesas de perímetros de rede estáticos para usuários, ativos e recursos | primaria | https://csrc.nist.gov/pubs/sp/800/207/final | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [05 Segurança de rede e infraestrutura](./README.md) |
| Tema anterior | [TEMA-03](TEMA-03-segmentacao-vlan-microssegmentacao.md) |
| Próximo tema | [TEMA-05](TEMA-05-dns-email-web.md) |
| Home | [README](../README.md) |
