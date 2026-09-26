---
tema: "Autenticação: fatores, MFA e FIDO2"
tema_id: "TEMA-01"
area_id: "04-identidade-acesso"
nivel: intermediario
tempo_estimado: "40-55 min"
objetivo_aprendizagem: "Selecionar o nível de garantia de autenticação de três sistemas, justificando a escolha por exposição do dado, resistência a phishing e caminho de recuperação da credencial"
atende_objetivo: [1, 2]
certificacoes: ["CISSP"]
pre_requisitos: []
relacoes:
  complementa:
    - alvo: "07-criptografia-segredos#TEMA-01"
      motivo: "o segundo fator por chave pública só se explica pela mecânica assimétrica, e a autenticação decide o que essa chave prova"
  aprofundado_por:
    - alvo: "07-criptografia-segredos#TEMA-02"
      motivo: "o desafio-resposta de um autenticador FIDO2 é criptografia de chave pública amarrada à origem; a mecânica de chave, certificado e cadeia de confiança fica na área 07"
  aplicado_em: []
  nao_confundir_com:
    - alvo: "04-identidade-acesso#TEMA-02"
      motivo: "autenticação prova quem é o sujeito; autorização decide o que ele pode fazer; tratar as duas como uma só camada é a origem da maior parte dos erros de projeto de acesso"
fontes:
  - titulo: "NIST SP 800-63B-4 — Digital Identity Guidelines: Authentication and Authenticator Management, final de 31/07/2025"
    url: "https://csrc.nist.gov/pubs/sp/800/63/b/4/final"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST SP 800-63B-4 — Authentication Assurance Levels, seção normativa"
    url: "https://pages.nist.gov/800-63-4/sp800-63b/aal/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "OWASP Authentication Cheat Sheet"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "FIDO Alliance — Passkeys"
    url: "https://fidoalliance.org/passkeys/"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# Autenticação: fatores, MFA e FIDO2

Uma ideia central: autenticação é a checagem de que o sujeito controla um autenticador ligado a uma conta, e a força dessa checagem depende menos do número de fatores do que da capacidade do ataque de se colocar no meio do caminho.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: escolher o nível de garantia de autenticação de três sistemas da sua empresa, escrevendo para cada um a exposição que justifica o nível, o requisito de resistência a phishing e o caminho de recuperação quando o autenticador é perdido.

## 2. Pré-requisitos

Nada. O tema se sustenta sozinho. A leitura de [01 Fundamentos](../01-fundamentos/README.md) ajuda pelo vocabulário de controle, mas o conteúdo abaixo traz os termos que usa.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantos usuários da sua empresa ainda usam código por SMS como segundo fator? Anote uma ordem de grandeza.
   Confiança: ___
2. Palpite: um código gerado em aplicativo e uma chave física com PIN resistem igual a uma página de login falsa? Escolha.
   Confiança: ___
3. Antes de ler: o seu help desk aceita redefinir o segundo fator por telefone? Sim ou não, e quem autoriza.
   Confiança: ___

## 4. Caso real

Em 31 de julho de 2025, o NIST publicou a versão final do SP 800-63B-4, substituindo a edição de 02 de março de 2020. A revisão mantém três níveis de garantia de autenticação e acrescenta obrigações: o verificador passa a ter de oferecer pelo menos uma opção resistente a phishing já no nível 2, e agências federais dos Estados Unidos passam a ter de exigir autenticação resistente a phishing de servidores, contratados e parceiros. No nível 3, o autenticador criptográfico precisa ter chave privada não exportável e prover resistência a phishing, e autenticadores sincronizáveis entre dispositivos estão proibidos.

O caso deixa uma pergunta aberta para quem dirige segurança em empresa privada: se o MFA da casa hoje é senha mais código por SMS ou por aplicativo, o que precisa mudar no parque de autenticadores, no suporte e no orçamento para chegar ao que a norma passa a exigir de quem tem dado sensível exposto.

## 5. Conteúdo

### 5.1 Conceito

Autenticação é o processo de verificar que um indivíduo, entidade ou site é quem diz ser, pela validade de um ou mais autenticadores apresentados. O dicionário do OWASP define assim, e a definição importa porque separa autenticação de identidade: identidade digital é a representação única de um sujeito, e prova de identidade (identity proofing) é o processo de ligar essa representação a uma pessoa real. Criar a conta é um problema; provar quem entra nela é outro.

Fator de autenticação é a categoria de segredo usado: algo que se sabe, algo que se tem, algo que se é. Uma senha e uma resposta secreta são o mesmo fator, porque ambos são conhecimento. O OWASP registra esse ponto ao explicar por que pergunta de segurança não constitui MFA: os dois itens pertencem à mesma categoria. Autenticador é o objeto ou software que gera ou guarda a prova, e verificador é quem confere a prova.

Nível de garantia de autenticação (AAL) é a escala de força. O SP 800-63B-4 trabalha com três. O nível 1 entrega confiança básica de que o requerente controla um autenticador ligado à conta e admite autenticação de fator único, com tempo limite geral de reautenticação recomendado em até 30 dias. O nível 2 exige prova de posse e controle de dois fatores distintos por protocolo seguro, com pelo menos um autenticador resistente a replay, tempo limite geral recomendado em até 24 horas e de inatividade em 1 hora. O nível 3 exige autenticador criptográfico com chave privada não exportável, resistência a phishing, intenção de autenticação em toda autenticação e reautenticação, tempo limite geral de 12 horas no máximo e inatividade recomendada em 15 minutos.

### 5.2 Como funciona

A mecânica moderna de um autenticador forte é desafio-resposta com criptografia de chave pública. O autenticador gera um par de chaves na inscrição e entrega a chave pública ao serviço. No login, o serviço envia um desafio; o autenticador assina o desafio com a chave privada, que não sai do dispositivo, e o serviço verifica a assinatura com a chave pública. Não existe segredo compartilhado que o usuário digite, e é por isso que a interceptação de tela e o site clonado não produzem nada reutilizável.

A FIDO Alliance descreve FIDO2 como o conjunto formado por WebAuthn e CTAP, e passkey como a credencial FIDO guardada no telefone, no computador ou em chave de segurança, desbloqueada pelo mesmo processo que libera o aparelho: biometria, PIN ou padrão. Passkeys podem ser sincronizadas entre dispositivos do usuário por um provedor de passkeys ou vinculadas a um único dispositivo, e o processamento biométrico continua local; o servidor recebe apenas a confirmação de que a verificação local deu certo. Quando a passkey não está no dispositivo que está sendo usado, o fluxo entre dispositivos usa o transporte híbrido do CTAP com verificação de proximidade por Bluetooth, sem depender das propriedades de segurança do Bluetooth para a segurança do login.

Do lado de quem opera, três requisitos normativos mudam a escolha do produto. O primeiro é resistência a phishing: no nível 2 ela é recomendada e a opção precisa estar disponível; no nível 3 é obrigatória. O segundo é resistência a replay, exigida já no nível 2 para pelo menos um autenticador. O terceiro é intenção de autenticação, recomendada no nível 2 e obrigatória no nível 3: o usuário precisa agir, como tocar na chave ou aprovar no dispositivo, em vez de o autenticador responder sozinho a um pedido.

Duas observações normativas ajudam a evitar promessa exagerada em projeto. A primeira: indicador de fraude, como login de geolocalização fora do padrão, pode reduzir o risco de autenticação incorreta, mas não altera o nível de garantia nem substitui um fator. A segunda: característica biométrica isolada não é reconhecida como autenticador; a comparação biométrica precisa vir acompanhada de um autenticador físico. E um alerta de expectativa: a própria FIDO Alliance registra que alguns regimes regulatórios ainda precisam reconhecer passkeys como forma listada de autenticação multifator. Antes de anunciar conformidade regulatória com passkey, confirme a norma aplicável ao seu setor.

### 5.3 Exemplo resolvido

Três sistemas, três decisões, com a fonte de cada uma.

Sistema A: portal de RH que exibe holerite, endereço e dados bancários do empregado. O dado é informação pessoal exposta online, e o SP 800-63B-4 determina que agências federais selecionem no mínimo o nível 2 quando informação pessoal é disponibilizada online. Decisão: nível 2, o que implica dois fatores distintos, um autenticador com resistência a replay e a oferta obrigatória de uma opção resistente a phishing. Caminho de recuperação: reemissão por procedimento presencial ou por verificação com o gestor, registrada, nunca por pergunta secreta.

Sistema B: console de administração de infraestrutura, com poder de apagar produção. Decisão: nível 3. Isso implica chave privada não exportável e resistência a phishing, ou seja, chave de segurança física com PIN ou autenticador de plataforma com chave protegida por hardware e verificação local. Passkey sincronizada não serve aqui, porque o nível 3 proíbe autenticadores sincronizáveis. Recuperação: duas chaves registradas por administrador e um cofre de emergência com acesso aprovado por duas pessoas.

Sistema C: aplicativo interno de consulta de catálogo, sem dado pessoal e sem operação de escrita. Decisão: nível 1 é suficiente. O SP 800-63B-4 recomenda que o verificador ofereça opções de múltiplos fatores no nível 1 e as incentive. Caminho adotado: habilitar passkey e manter senha como alternativa, com bloqueio por tentativas e mensagem de erro genérica para não permitir enumeração de usuário.

O que fecha as três decisões: no nível 3 a exigência de intenção de autenticação muda o suporte, porque o usuário precisa participar da cerimônia de login; no nível 2 ela é recomendada, o que dá margem de negociação com a área de experiência do usuário.

### 5.4 Problema de completar

Uma empresa tem 1.200 empregados, autenticação por senha mais código por SMS, e o time de suporte libera o acesso de quem perde o telefone após três perguntas de conferência.

Passo 1: classificar o desenho atual. Senha mais código por SMS são dois fatores distintos, um deles resistente a replay, o que atende ao nível 2 na letra da norma quanto à contagem de fatores.

Passo 2: identificar o que falta. O verificador não oferece opção resistente a phishing, e o SMS pode ser interceptado ou obtido por engenharia social contra a operadora.

Passo 3: identificar o ponto mais frágil, que não é o fator e sim o processo: a recuperação por pergunta de conferência devolve o nível de garantia ao que o atendente consegue ser convencido a fazer.

Passo 4: escolher o alvo.

Passo 5: desenhar a migração em fases, com o que muda no suporte.

Passo 6: definir a métrica de adoção e a data de desligamento do SMS.

## 6. Por que isso importa para o CISO

A frase "temos MFA" deixa de ser suficiente quando o auditor pergunta qual fator, resistente a quê, e como é recuperado. O nível 2 pode ser cumprido com fator que ainda é phishável, e o requisito de oferecer opção resistente a phishing no nível 2 dá ao CISO um argumento de orçamento que não depende de opinião: a norma mudou em julho de 2025 e passou a tratar a opção resistente a phishing como item de oferta obrigatória no nível 2.

O efeito prático aparece no custo de suporte. Chave de segurança física ou passkey vinculada ao dispositivo reduz chamado de reset de senha e reduz a taxa de sucesso do phishing, mas cria um processo novo de inscrição, de segunda chave e de substituição. Quem não orça esse processo descobre o problema no primeiro diretor que perde o telefone em viagem, e o contorno improvisado no help desk anula o ganho do controle.

Há ainda um efeito contratual. Se o cliente corporativo exigir autenticação multifator resistente a phishing no questionário de fornecedor, a resposta passa a ser uma pergunta sobre o que existe hoje no diretório e em quais aplicações, não sobre a intenção de projeto.

## 7. Aplicação prática

Monte uma tabela com cinco colunas e preencha em uma hora, sem ferramenta nova: sistema, dado que expõe, fator exigido hoje, resistência a phishing sim ou não, e processo de recuperação. Faça a lista a partir da tela de login, não a partir do documento de arquitetura. Depois escolha os dois sistemas com maior privilégio e escreva, em três linhas cada, o nível de garantia que você vai exigir e a data.

Se não houver acesso ao diretório, a versão mínima é entrevistar o gestor do service desk e perguntar três coisas: quantos reset de MFA por mês, quantos desses foram autorizados por telefone, e o que o atendente aceita como prova de identidade. O número que sair dessa conversa costuma ser a métrica que abre a discussão de verba.

## 8. Autoexplicação

Explique o tema em três frases, sem consultar o texto, e conecte-o a algo que você já faz hoje. Se as três frases mencionarem produto e não mencionarem fator, recuperação e resistência a phishing, releia a seção 5.3 antes de seguir.

## 9. Erros comuns e equívocos

| Equívoco | Por que está errado | O que é correto |
|---|---|---|
| MFA significa dois aplicativos ou dois códigos | Contar códigos não conta fatores; dois códigos de conhecimento são o mesmo fator | O fator é a categoria do segredo; um autenticador de múltiplos fatores executa dois fatores em um ato |
| Biometria resolve autenticação forte | Característica biométrica isolada não é reconhecida como autenticador pela norma | A comparação biométrica precisa acompanhar um autenticador físico, e a verificação local é preferível |
| Pergunta de segurança ajuda como segundo fator | São dois elementos de conhecimento, o que viola a exigência de dois fatores distintos | Substituir por autenticador de posse ou por verificação local no dispositivo |
| Aumentar a frequência de troca de senha aumenta a segurança | O OWASP orienta evitar rotação periódica obrigatória, porque ela piora a qualidade das escolhas | Bloquear senhas vazadas e conhecidas, exigir comprimento e oferecer MFA |
| Passkey sincronizada serve para qualquer acesso | No nível 3 autenticadores sincronizáveis são proibidos, porque a chave privada precisa ser não exportável | Reservar passkey sincronizada para acesso comum e usar chave vinculada ao dispositivo onde o nível 3 se aplica |
| Indicador de risco de login substitui o fator | A norma é explícita: indicador de fraude não altera o nível de garantia nem substitui fator | Tratar risco de contexto como controle adicional, nunca como substituto |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quantos níveis de garantia de autenticação existem no SP 800-63B-4 e qual é a data do documento final?
2. O que o nível 2 exige de tempo limite de reautenticação e de inatividade, e o que ele exige sobre resistência a phishing?
3. Por que a norma proíbe autenticadores sincronizáveis no nível 3?
4. O que é intenção de autenticação e em qual nível ela é obrigatória?
5. Cite dois motivos pelos quais o processo de recuperação de credencial pode anular a força do MFA.
6. O que compõe o FIDO2 e o que é uma passkey, segundo a FIDO Alliance?

<details>
<summary>Conferir respostas</summary>

1. Três níveis. O documento final é de 31 de julho de 2025 e substitui a edição de 02 de março de 2020.
2. Tempo limite geral de reautenticação recomendado em até 24 horas e de inatividade em 1 hora. O verificador deve oferecer pelo menos uma opção resistente a phishing, que é recomendada nesse nível.
3. Porque o nível 3 exige chave privada não exportável, e um autenticador sincronizável precisa que a chave seja exportável para viajar entre dispositivos.
4. É o requisito de que o usuário pratique uma ação deliberada, como tocar a chave, em vez de o autenticador responder sozinho. É recomendada no nível 2 e obrigatória no nível 3.
5. Reset autorizado por telefone sem prova forte, pergunta secreta como prova, atendente convencido por engenharia social e segunda via enviada a um canal de e-mail comprometido. Qualquer um deles move o ataque para fora do autenticador.
6. FIDO2 corresponde a WebAuthn e CTAP. Passkey é a credencial FIDO guardada no dispositivo ou na chave de segurança, desbloqueada por biometria, PIN ou padrão, e pode ser sincronizada entre dispositivos ou vinculada a um só.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Explicar em três frases a diferença entre fator, autenticador e nível de garantia | Rebaixar: repetir em D+3 |
| D+30 | Classificar dois sistemas novos do seu ambiente e justificar o nível exigido | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| aprofundado_por | 07-criptografia-segredos#TEMA-02 | o desafio-resposta de um autenticador FIDO2 é criptografia de chave pública amarrada à origem; a mecânica de chave, certificado e cadeia de confiança fica na área 07 |
| complementa | 07-criptografia-segredos#TEMA-01 | o segundo fator por chave pública só se explica pela mecânica assimétrica, e a autenticação decide o que essa chave prova |
| nao_confundir_com | 04-identidade-acesso#TEMA-02 | autenticação prova quem é o sujeito; autorização decide o que ele pode fazer; tratar as duas como uma só camada é a origem da maior parte dos erros de projeto de acesso |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 5, Identity and Access Management, subtema 5.2 Design identification and authentication strategy, e 5.6 Implement authentication systems | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 7, Security Operations, subtema 7.15, que inclui fadiga de 2FA entre as preocupações de segurança de pessoal | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: a seção de níveis de garantia do SP 800-63B-4 e o guia de passkeys da FIDO Alliance, ambos listados na seção 14.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | NIST SP 800-63B-4 — Digital Identity Guidelines: Authentication and Authenticator Management, final de 31/07/2025, DOI 10.6028/NIST.SP.800-63b-4 | primaria | https://csrc.nist.gov/pubs/sp/800/63/b/4/final | "2026-09-25" | alta |
| 2 | NIST SP 800-63B-4 — Authentication Assurance Levels, com a tabela de requisitos por nível, resistência a phishing, intenção de autenticação e tempos limite | primaria | https://pages.nist.gov/800-63-4/sp800-63b/aal/ | "2026-09-25" | alta |
| 3 | OWASP Authentication Cheat Sheet — força de senha, ataques automatizados, pergunta de segurança e FIDO | primaria | https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html | "2026-09-25" | alta |
| 4 | FIDO Alliance — Passkeys, com definição de passkey, FIDO2, sincronização, autenticação entre dispositivos e reconhecimento regulatório | primaria | https://fidoalliance.org/passkeys/ | "2026-09-25" | alta |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Próximo tema | [TEMA-02](TEMA-02-autorizacao-rbac-abac-modelo-de-decisao.md) |
| Home | [README](../README.md) |
