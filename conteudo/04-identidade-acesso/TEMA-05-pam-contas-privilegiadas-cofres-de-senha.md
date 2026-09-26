---
tema: "PAM: contas privilegiadas e cofres de senha"
tema_id: "TEMA-05"
area_id: "04-identidade-acesso"
nivel: avancado
tempo_estimado: "40-55 min"
objetivo_aprendizagem: "Justificar a adoção de cofre de credenciais e de emissão dinâmica para um conjunto nomeado de contas privilegiadas, definindo cobertura, rotação, controle de emergência e métrica de adoção"
atende_objetivo: [5]
certificacoes: ["CISSP"]
pre_requisitos: ["TEMA-04"]
relacoes:
  complementa:
    - alvo: "04-identidade-acesso#TEMA-04"
      motivo: "menor privilégio reduz o que a pessoa pode; PAM reduz o que a credencial revela e prova quem a usou"
  aprofundado_por: []
  aplicado_em: []
  nao_confundir_com:
    - alvo: "15-fatores-humanos#TEMA-05"
      motivo: "o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso"
    - alvo: "07-criptografia-segredos#TEMA-05"
      motivo: "cofre de credencial humana privilegiada não substitui o cofre de segredo de aplicação, e o dono do acesso é diferente em cada caso"
fontes:
  - titulo: "OWASP Secrets Management Cheat Sheet"
    url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "Microsoft Entra Privileged Identity Management — histórico de auditoria, aprovação e proteção da última atribuição administrativa"
    url: "https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "ISC2 CISSP Certification Exam Outline, Domain 5 e Domain 7, vigente desde 15/04/2024"
    url: "https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
  - titulo: "NIST CSRC Glossary — least privilege, conforme CNSSI 4009-2022, SP 800-12 Rev. 1 e SP 800-53 Rev. 5"
    url: "https://csrc.nist.gov/glossary/term/least_privilege"
    tipo: primaria
    acessado_em: "2026-09-25"
    confianca: alta
revisao_inicial_dias: [1, 7, 30]
proxima_revisao: null
atualizado_em: "2026-09-25"
revisar_ate: "2027-03-25"
status_verificacao: pendente
---

# PAM: contas privilegiadas e cofres de senha

Uma ideia central: a conta privilegiada é o ativo de maior valor na rede, e a disciplina de PAM consiste em tirar a credencial do alcance da pessoa que tem o poder, guardando-a em um lugar que registre pedido, uso e devolução.

## 1. Objetivo de aprendizagem

Ao final deste tema você deve conseguir: justificar a adoção de cofre de credenciais e de emissão dinâmica para um conjunto nomeado de contas privilegiadas, definindo a cobertura pretendida, o regime de rotação, o controle de emergência e a métrica trimestral de adoção.

## 2. Pré-requisitos

O [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md) vem antes: sem inventário de privilégio e sem redução do excesso, colocar um cofre no caminho da operação apenas protege credencial que não deveria existir.

## 3. Pré-teste


Responda de palpite, antes de ler o resto. Anote a confiança de 1 a 5.

1. Chute: quantas senhas de banco de dados da sua empresa estão em arquivo de configuração ou variável de ambiente de aplicação? Anote a ordem de grandeza.
   Confiança: ___
2. Palpite: qual tipo de segredo da sua empresa você aposta que não está em cofre nenhum? Nomeie o tipo, nunca o valor.
   Confiança: ___
3. Antes de ler: quem consegue abrir uma conta de emergência na sua empresa hoje, e sob qual autorização? Aposte.
   Confiança: ___

## 4. Caso real

O guia de gestão de segredos do OWASP lista o que um cofre precisa registrar em auditoria: quem pediu o segredo e para qual sistema e papel, se o pedido foi aceito ou recusado, quando o segredo foi usado e por quem, quando expirou e se houve tentativa de reusar segredo expirado. O mesmo guia recomenda monitorar quem acessa o segredo, de qual endereço e por qual método, e alertar quando a credencial usada pela esteira de integração aparece vindo de outro endereço, assumindo comprometimento. E trata a emergência como requisito: credenciais de emergência guardadas em cofre secundário e testadas com rotina.

O caso deixa a pergunta aberta: das sete informações de auditoria listadas, quantas a sua empresa consegue responder hoje sobre a conta de banco usada pela aplicação de folha de pagamento.

## 5. Conteúdo

### 5.1 Conceito

Conta privilegiada é a conta cujo poder de dano excede o de um usuário comum, seja por alcançar configuração de plataforma, dados de todos os clientes ou mecanismo de autenticação. O CISSP dedica itens específicos a esse universo: gestão de conta privilegiada no domínio de operações, gestão de conta de serviço no ciclo de provisão e sistemas de gestão de credencial, com cofre de senha entre os exemplos, na estratégia de identificação e autenticação.

Uma taxonomia de cinco tipos organiza o inventário, e cada tipo pede tratamento diferente. O primeiro é a conta humana nominada com privilégio administrativo, que deve seguir o caminho do [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md): elegível, com aprovação e prazo. O segundo é a conta compartilhada, com usuário genérico tipo "root" ou "adm", que existe porque a plataforma antiga não suporta identidade individual e que só deveria existir dentro do cofre. O terceiro é a conta de serviço, usada por aplicação, rotina agendada ou integração, cuja credencial costuma estar em arquivo, em variável de ambiente ou no código. O quarto é a conta de emergência, criada para sobreviver à perda do mecanismo normal de acesso. O quinto é a identidade de máquina, com certificado ou chave, que cresce rápido com automação e quase nunca tem dono nomeado.

Cofre de credenciais é o componente que guarda o segredo cifrado, controla quem pode pedir qual credencial e registra o empréstimo. O ganho não vem da criptografia em repouso, que qualquer banco de dados já oferece. Vem da substituição do segredo conhecido por segredo emprestado: a pessoa não sabe mais a senha, ela recebe a sessão ou uma credencial de vida curta, e o pedido fica registrado com nome, hora e justificativa.

### 5.2 Como funciona

O ciclo do segredo tem quatro estágios, conforme o guia do OWASP: criação, rotação, revogação e expiração. A criação precisa gerar o segredo com aleatoriedade adequada e com o mínimo de privilégio para a função. A rotação tem duas formas: a automática de segredo estático, que troca a senha em intervalo definido, e a emissão dinâmica, em que o consumidor pede credencial nova a cada início de sessão e ela morre no fim. A emissão dinâmica reduz a superfície de reuso, e o próprio guia observa que, se a credencial for roubada, ela já estará expirada no próximo reinício. A revogação precisa ser possível sem quebrar a aplicação, e a expiração transfere para o sistema a obrigação de renovar em vez de para a memória das pessoas.

Há uma assimetria de regra que evita retrabalho inútil: credencial de usuário não entra em rotação periódica e é trocada só quando existe suspeita ou evidência de comprometimento, na recomendação do NIST citada pelo guia do OWASP. O ciclo de rotação automática é para segredo de aplicação e de serviço. Um plano que promete trocar senha de 3.000 empregados a cada 90 dias gasta energia e não reduz risco proporcional.

O cofre cria uma nova dependência que precisa ser desenhada antes de virar produção. O guia registra o caso de borda mais comum: mesmo centralizando em uma solução, o segredo primário dessa solução costuma precisar ser guardado em uma segunda. Também recomenda separar cofres por aplicação e ambiente, para que o vazamento de um não alcance o outro. E determina que o acesso ao próprio cofre siga menor privilégio: quem lê e altera segredo pode vazar por ali, então o número de pessoas com acesso amplo é indicador de risco por si.

Na ponta da aplicação, o guia desaconselha três atalhos. Não guardar segredo no código; não usar variável de ambiente como destino final quando existem alternativas, porque variáveis ficam acessíveis a todos os processos e podem vazar em log e em despejo de memória; e não construir o segredo dentro da imagem do contêiner, porque a definição da imagem passa a carregar a credencial. As alternativas citadas são volume montado pelo orquestrador, injeção por contêiner lateral de vida curta que busca o segredo no cofre e o entrega em volume compartilhado, ou busca direta pelo próprio processo com identidade de carga de trabalho.

A conta de emergência tem regra própria e não pode ser improvisada. O guia recomenda guardar credenciais de emergência em cofre secundário, com backup regular, e testá-las com rotina para verificar que funcionam. O desenho que costuma funcionar: duas pessoas necessárias para abrir o envelope, registro obrigatório de abertura, revisão de todo uso em até 48 horas e teste semestral em ambiente controlado. Conta de emergência que nunca foi usada é conta de emergência que talvez não funcione, e descobrir isso durante a recuperação de desastre é o pior momento possível.

Do lado do produto de plataforma, o controle que evita a perda de acesso administrativo é o que impede a remoção da última atribuição ativa de administrador global e de administrador de papéis privilegiados. Vale o desenho espelhado: se ninguém consegue remover o último administrador, então o procedimento de saída de um administrador precisa começar pela criação de outro.

### 5.3 Exemplo resolvido

Empresa com 600 servidores, 40 administradores de sistema, 120 contas de serviço e uma senha de root de banco compartilhada entre três times.

Passo 1: inventariar em quatro colunas. Conta, tipo, dono nomeado e sistema alcançado. Incluir contas de serviço descobertas por varredura de credencial em arquivo de configuração e em esteira de integração.

Passo 2: eliminar o que não deve existir. Contas compartilhadas usadas por pessoas viram conta nominada com privilégio elegível. Contas de administrador sem uso em 90 dias saem antes de qualquer compra de ferramenta.

Passo 3: priorizar por dano. Três grupos, nesta ordem: contas com acesso a dado de cliente ou a segredo, contas com poder de apagar dado, contas com poder de alterar configuração de rede e autenticação.

Passo 4: escolher o padrão por tipo de conta. Conta humana nominada mantém o acesso elegível do tema anterior e não passa pelo cofre. Conta compartilhada de plataforma legada entra no cofre com empréstimo de sessão e troca de senha ao final do empréstimo. Conta de serviço de banco de dados migra para emissão dinâmica, com credencial de vida curta e sem senha estática em arquivo. Conta de emergência vai para cofre secundário, com duplo controle e teste semestral.

Passo 5: fechar a ponta da aplicação. Remover segredo de arquivo de configuração, de variável de ambiente e de definição de imagem, substituindo por busca no cofre com identidade da carga de trabalho ou por injeção por contêiner lateral.

Passo 6: definir auditoria mínima. Pedido com nome e justificativa, aprovação ou recusa, uso com data e origem, expiração, tentativa de reuso de segredo expirado, e alerta quando a credencial de automação aparecer de origem diferente da esperada.

Passo 7: medir. Cobertura: percentual de contas privilegiadas dentro do cofre. Rotação: percentual de segredos de aplicação com rotação automática ativa. Exposição: número de segredos encontrados em código, em log e em variável de ambiente. Emergência: número de aberturas por trimestre e resultado do último teste. Revogação: tempo médio entre o pedido de troca e a entrada em vigor.

### 5.4 Problema de completar

Uma empresa descobre, em varredura, 87 credenciais em arquivos de configuração de 12 aplicações, todas com acesso de escrita ao banco de produção.

Passo 1: registrar cada ocorrência com aplicação, dono, tipo de acesso e criticidade do dado alcançado.

Passo 2: decidir, por aplicação, entre emissão dinâmica, consulta ao cofre ou uso de identidade gerenciada da plataforma.

Passo 3: definir a ordem de migração e a janela de mudança.

Passo 4: definir a rotação obrigatória das credenciais expostas, com prazo, e o que fazer quando a rotação quebra a aplicação.

Passo 5: definir o controle que impede a reintrodução de segredo em arquivo no próximo ciclo de desenvolvimento.

Passo 6: definir o indicador que mede se a exposição voltou a ocorrer.

## 6. Por que isso importa para o CISO

A conta de serviço é a credencial que sobrevive a tudo: a pessoa que a criou saiu, a aplicação continua rodando com o mesmo segredo há sete anos, e ninguém sabe quem pode usá-la. Em investigação de incidente, esse é o ponto onde não existe resposta para a pergunta "quem usou isso e quando", e a ausência de resposta define se o incidente é contido em horas ou em semanas.

O efeito direto no negócio está na capacidade de provar autoria. Quando a credencial de banco é compartilhada, não existe atribuição possível, e o relatório final de um incidente passa a dizer que qualquer uma das três pessoas com a senha poderia ter feito a alteração. Quando a credencial é emprestada pelo cofre, a mesma pergunta tem resposta nominal, com data, origem e justificativa.

Há também o efeito sobre continuidade. Conta de emergência guardada, com duplo controle e teste em rotina, é o que permite restaurar serviço quando o mecanismo normal de autenticação está indisponível. A decisão de gastar duas horas por semestre testando esse caminho é uma decisão de risco operacional, e ela costuma ser aprovada sem debate quando apresentada como tempo de indisponibilidade esperado.

## 7. Aplicação prática

Peça à equipe de desenvolvimento a lista de segredos usados pela aplicação mais crítica e pergunte, para cada um, onde ele está guardado, quem sabe o valor, quando foi trocado pela última vez e o que quebra se for trocado hoje. As quatro respostas costumam revelar que o segredo está em arquivo versionado, é conhecido por seis pessoas, nunca foi trocado e quebra o processo de implantação.

Depois escolha uma conta de serviço, migre-a para credencial emitida dinamicamente e acompanhe dois ciclos de implantação. Registre o que quebrou; cada quebra aponta um lugar onde a credencial está embutida em outro lugar além do configurado.

## 8. Autoexplicação

Explique em três frases, sem consultar o texto, por que guardar a senha em cofre altera o resultado de uma investigação, mesmo que a senha continue a mesma. Se a explicação não mencionar registro nominal do empréstimo, releia a seção 5.1.

## 9. Erros comuns e equívocos

| Equívocos | Por que está errado | O que é correto |
|---|---|---|
| Cofre resolve o problema de senha compartilhada por si | Sem troca de senha ao final do empréstimo, quem viu a credencial continua com ela | Combinar empréstimo com rotação automática após o uso |
| Colocar todas as contas no cofre é o objetivo do projeto | Cofre em conta de usuário nominada cria atrito sem ganho de atribuição | Reservar cofre para conta compartilhada, conta de serviço e emergência |
| Variável de ambiente é lugar seguro para segredo | O guia observa que variáveis são acessíveis a todos os processos e podem vazar em log e despejo de memória | Buscar no cofre com identidade da carga de trabalho ou injetar por contêiner lateral |
| Rotacionar senha de usuário a cada 90 dias fortalece a postura | A recomendação citada pelo guia é trocar credencial de usuário só sob suspeita ou evidência de comprometimento | Destinar rotação automática a segredo de aplicação e de serviço |
| Conta de emergência pode ficar guardada sem teste | Credencial nunca testada pode não funcionar quando for necessária | Guardar em cofre secundário, com duplo controle, e testar em rotina |
| Auditoria do cofre é log de acesso | O que a investigação precisa é o par pedido e uso, com justificativa e destino | Registrar pedido, aprovação, uso com origem, expiração e tentativa de reuso |

## 10. Recuperação ativa

Responda tudo antes de abrir o gabarito.

1. Quais quatro estágios compõem o ciclo de vida do segredo e o que acontece em cada um?
2. Qual é a diferença entre rotação automática de segredo estático e emissão dinâmica, e qual reduz a superfície de reuso?
3. Quais sete informações de auditoria o guia do OWASP manda o cofre registrar?
4. O que o guia recomenda para credencial de usuário quanto à rotação, e para credencial de emergência quanto à guarda?
5. Cite dois motivos técnicos para não colocar segredo em variável de ambiente.
6. Quais números você levaria ao comitê para mostrar que o programa de PAM está avançando?

<details>
<summary>Conferir respostas</summary>

1. Criação, rotação, revogação e expiração. Criação gera o segredo com aleatoriedade adequada e mínimo privilégio; rotação troca o segredo; revogação invalida o que não é mais necessário ou pode estar comprometido; expiração define prazo e obriga a renovação.
2. A rotação automática troca o valor do segredo estático em intervalo definido. A emissão dinâmica entrega credencial nova a cada início de sessão, que morre no fim. A emissão dinâmica reduz a superfície de reuso.
3. Quem pediu o segredo e para qual sistema e papel; se o pedido foi aceito ou recusado; quando o segredo foi usado e por quem; quando expirou; se houve tentativa de reuso de segredo expirado; se houve erro de autenticação ou autorização; quando o segredo foi atualizado e por quem.
4. Credencial de usuário fica fora da rotação periódica e é trocada só sob suspeita ou evidência de comprometimento. Credencial de emergência vai para cofre secundário, com backup regular, e é testada em rotina.
5. Variáveis de ambiente ficam acessíveis a todos os processos do ambiente e podem aparecer em log e em despejo de memória.
6. Cobertura de contas privilegiadas no cofre, percentual de segredos de aplicação com rotação automática ativa, número de segredos ainda encontrados em código, log e variável de ambiente, e número de aberturas de conta de emergência no trimestre com o resultado do último teste.
</details>

## 11. Revisão espaçada

| Intervalo | O que fazer | Se errar |
|---|---|---|
| D+1 | Responder à seção 10 sem reler | Rebaixar: repetir em D+1 |
| D+7 | Inventariar as contas privilegiadas de um sistema e classificá-las nos cinco tipos | Rebaixar: repetir em D+3 |
| D+30 | Migrar uma credencial de serviço para emissão dinâmica | Rebaixar: repetir em D+7 |

## 12. Conexões com outros temas

Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área
também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em
[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md).

| Relação | Alvo | Por que |
|---|---|---|
| complementa | 04-identidade-acesso#TEMA-04 | menor privilégio reduz o que a pessoa pode; PAM reduz o que a credencial revela e prova quem a usou |
| nao_confundir_com | 07-criptografia-segredos#TEMA-05 | cofre de credencial humana privilegiada não substitui o cofre de segredo de aplicação, e o dono do acesso é diferente em cada caso |
| nao_confundir_com | 15-fatores-humanos#TEMA-05 | o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso |

## 13. Certificações e leitura recomendada

| Certificação | Domínio | Recurso | Tipo | Fonte |
|---|---|---|---|---|
| CISSP | Domain 7, Security Operations, subtema 7.4, com gestão de conta privilegiada e segregação de função | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |
| CISSP | Domain 5, subtema 5.2, com sistemas de gestão de credencial, cofre de senha e SSO, e subtema 5.5, com gestão de conta de serviço | CISSP Certification Exam Outline | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline |

Leitura direta: o guia de gestão de segredos do OWASP nas seções 2 e 5, e a página do PIM para o vocabulário de ativação e aprovação aplicado a conta humana privilegiada.

## 14. Fontes verificadas

| # | Título | Tipo | URL | Acessado em | Confiança |
|---|---|---|---|---|---|
| 1 | OWASP Secrets Management Cheat Sheet — ciclo de vida, auditoria, rotação, emissão dinâmica, conta de emergência, separação de cofres e injeção em contêiner | primaria | https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html | "2026-09-25" | alta |
| 2 | Microsoft Entra Privileged Identity Management — trilha de auditoria, aprovação e proteção da última atribuição ativa de administrador | primaria | https://learn.microsoft.com/en-us/entra/id-governance/privileged-identity-management/pim-configure | "2026-09-25" | alta |
| 3 | ISC2 CISSP Certification Exam Outline, Domain 5, subtemas 5.2 e 5.5, e Domain 7, subtema 7.4 | primaria | https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline | "2026-09-25" | alta |
| 4 | NIST CSRC Glossary — least privilege | primaria | https://csrc.nist.gov/glossary/term/least_privilege | "2026-09-25" | alta |

### NAO CONFIRMADO em fonte oficial neste tema

| Item | Situação |
|---|---|
| Gravação e reprodução de sessão administrativa como capacidade do cofre | Não confirmado em fonte primária nesta execução; tratar como requisito a verificar na avaliação de fornecedor |
| Tempo máximo recomendado de retenção de log de acesso a segredo | Não confirmado; o guia do OWASP cita 90 dias no contexto de log de esteira de integração, e esse número não foi transportado para o cofre |

---

| Navegação | |
|---|---|
| Área | [04 Identidade, acesso e zero trust](./README.md) |
| Tema anterior | [TEMA-04](TEMA-04-menor-privilegio-jit-revisao-acessos.md) |
| Próximo tema | [TEMA-06](TEMA-06-zero-trust-identidade-como-perimetro.md) |
| Home | [README](../README.md) |
