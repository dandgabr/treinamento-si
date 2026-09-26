---
escopo: "mapa de relacoes entre temas"
gerado_por: "scripts/relacoes.py"
fontes: []
atualizado_em: "2026-09-25"
revisar_ate: null
status_verificacao: rascunho
---

# Mapa de relações entre áreas

> Arquivo **gerado**. Não edite à mão: a fonte é o bloco `relacoes` do frontmatter de cada
> tema. Rode `python3 scripts/relacoes.py` para regenerar. Regras em
> [templates/RELACOES-TEMAS.md](./templates/RELACOES-TEMAS.md).

Temas indexados: **109**. Ligações que atravessam áreas: **188**.

## Pares que atravessam áreas

| Área de origem | Tema e relação | Área de destino | Destino | Por que |
|---|---|---|---|---|
| 00-guia-basico | TEMA-01 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-01 | o perímetro definido aqui é o que a política precisa cobrir por escrito, e política é artefato da área 02 |
| 00-guia-basico | TEMA-02 — aprofundado_por | 01-fundamentos | 01-fundamentos#TEMA-02 | a introdução aplica os três pilares a um ativo; a área 01 define os objetivos de segurança com precisão formal |
| 00-guia-basico | TEMA-03 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-03 | risco estimado em unidade comparável só decide algo quando há critério de aceite declarado, e o apetite de risco pertence à área 02 |
| 00-guia-basico | TEMA-04 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-01 | o mandato formal descrito aqui é o que sustenta autoridade e verba no exercício do cargo tratado na área 17 |
| 00-guia-basico | TEMA-05 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-06 | a ordem de estudo e a fila de revisão são o insumo do plano de maturidade do programa |
| 01-fundamentos | TEMA-01 — nao_confundir_com | 14-dados-privacidade | 14-dados-privacidade#TEMA-01 | proteger o dado contra acesso indevido não é o mesmo que decidir se o tratamento de dado pessoal é legítimo; destino planejado, número provisório |
| 01-fundamentos | TEMA-02 — aplicado_em | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-01 | confidencialidade e integridade só se sustentam em primitivas criptográficas concretas |
| 01-fundamentos | TEMA-03 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-02 | classificar ativo e inventariar dado pessoal são a mesma disciplina com obrigação legal distinta |
| 01-fundamentos | TEMA-04 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-03 | saber quem ataca determina qual inteligência vale pagar |
| 01-fundamentos | TEMA-05 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-02 | superfície de ataque é o que a priorização por risco real precisa medir |
| 01-fundamentos | TEMA-06 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-03 | risco medido só vira decisão quando existe apetite declarado, e o limiar de aceitação é definido fora desta área |
| 01-fundamentos | TEMA-07 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-05 | a taxonomia de controles é o que permite escolher um framework e justificar o gasto |
| 01-fundamentos | TEMA-08 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-04 | o princípio do menor privilégio só existe quando papéis e políticas de acesso o implementam; destino planejado, número provisório |
| 01-fundamentos | TEMA-08 — complementa | 04-identidade-acesso | 04-identidade-acesso#TEMA-02 | o princípio do menor privilégio só se realiza no modelo de autorização, onde atributo, política e ponto de decisão o transformam em decisão executável |
| 02-governanca-risco-compliance | TEMA-01 — complementa | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-02 | alçada interna só fecha quando se sabe a posição do cargo na estrutura e a linha de reporte ao conselho; destino planejado |
| 02-governanca-risco-compliance | TEMA-02 — aplicado_em | 15-fatores-humanos | 15-fatores-humanos#TEMA-03 | a norma só muda comportamento quando o programa de conscientização a traduz para a rotina de quem executa; destino planejado |
| 02-governanca-risco-compliance | TEMA-03 — complementa | 00-guia-basico | 00-guia-basico#TEMA-03 | risco medido só decide quando há apetite declarado, e o registro de risco daquela área é a entrada deste tema |
| 02-governanca-risco-compliance | TEMA-03 — complementa | 01-fundamentos | 01-fundamentos#TEMA-06 | probabilidade e impacto ganham critério de aceitação: sem limiar aprovado, o risco residual não tem contra o que ser comparado |
| 02-governanca-risco-compliance | TEMA-03 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-05 | a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar |
| 02-governanca-risco-compliance | TEMA-03 — nao_confundir_com | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-03 | apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado |
| 02-governanca-risco-compliance | TEMA-04 — aplicado_em | 08-cloud | 08-cloud#TEMA-06 | a exigência do ISMS só chega ao fornecedor se estiver no contrato e na cláusula de auditoria; destino planejado |
| 02-governanca-risco-compliance | TEMA-04 — complementa | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-06 | o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes |
| 02-governanca-risco-compliance | TEMA-04 — nao_confundir_com | 14-dados-privacidade | 14-dados-privacidade#TEMA-06 | certificado de segurança da informação não atesta a legalidade do tratamento de dado pessoal; são dois sistemas de gestão com objetos diferentes; destino planejado |
| 02-governanca-risco-compliance | TEMA-05 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | o controle de gestão de vulnerabilidades só vira processo com inventário, prazo e fechamento registrados; destino planejado |
| 02-governanca-risco-compliance | TEMA-05 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | o framework define os resultados a detectar e o caso de uso do SOC implementa a detecção; destino planejado |
| 02-governanca-risco-compliance | TEMA-06 — complementa | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-03 | o número que sobe ao conselho é o mesmo que disputa orçamento no ciclo seguinte; destino planejado |
| 02-governanca-risco-compliance | TEMA-06 — nao_confundir_com | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-01 | teste ofensivo aponta falha pontual em um alvo; auditoria verifica se o sistema de gestão opera como declarado; destino planejado |
| 03-arquitetura-engenharia | TEMA-01 — aplicado_em | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-02 | a linha de base de hardening é o princípio de negação por padrão escrito para um tipo de ativo; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-02 — aplicado_em | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-03 | o mesmo método, aplicado ao desenho de uma aplicação dentro do ciclo de desenvolvimento; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-02 — aprofundado_por | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-04 | aqui a ameaça é enumerada por categoria; o catálogo de técnicas observadas em campo e a ligação com o atacante real estão na área 12; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-03 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-02 | o desenho de zona determina quais fluxos existem e, por consequência, o que a telemetria de rede consegue provar; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-03 — complementa | 05-rede-infraestrutura | 05-rede-infraestrutura#TEMA-03 | a zona de confiança define o que precisa ser isolado e por qual critério; a configuração de VLAN, firewall e política de fluxo executa o isolamento; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-04 — aplicado_em | 08-cloud | 08-cloud#TEMA-02 | o acesso em nuvem é onde o padrão de zero trust encosta na política de identidade do provedor; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-04 — complementa | 04-identidade-acesso | 04-identidade-acesso#TEMA-06 | zero trust só se sustenta com identidade forte: sem autenticação de sujeito e de dispositivo confiável, o padrão vira intenção sem controle; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-05 — aplicado_em | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-01 | o requisito não funcional aprovado é o que o ciclo de desenvolvimento tem de verificar a cada entrega; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-06 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | dívida de segurança medida é matéria de reporte ao comitê e de evidência de auditoria; destino planejado, número provisório |
| 03-arquitetura-engenharia | TEMA-06 — nao_confundir_com | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-06 | dívida de desenho adiada e vulnerabilidade pendente de correção têm dono, prazo e instrumento de medição diferentes; destino planejado, número provisório |
| 04-identidade-acesso | TEMA-01 — aprofundado_por | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-02 | o desafio-resposta de um autenticador FIDO2 é criptografia de chave pública amarrada à origem; a mecânica de chave, certificado e cadeia de confiança fica na área 07 |
| 04-identidade-acesso | TEMA-01 — complementa | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-01 | o segundo fator por chave pública só se explica pela mecânica assimétrica, e a autenticação decide o que essa chave prova |
| 04-identidade-acesso | TEMA-02 — aplicado_em | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-06 | o modelo de decisão vira escopo de token e checagem no gateway de API, que é onde a autorização encosta no código; destino planejado, número provisório |
| 04-identidade-acesso | TEMA-02 — complementa | 01-fundamentos | 01-fundamentos#TEMA-08 | o princípio do menor privilégio só se realiza no modelo de autorização, onde atributo, política e ponto de decisão o transformam em decisão executável |
| 04-identidade-acesso | TEMA-03 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | a prova de que contas nascem e morrem com autorização registrada é evidência de auditoria e matéria de reporte ao comitê |
| 04-identidade-acesso | TEMA-03 — aplicado_em | 15-fatores-humanos | 15-fatores-humanos#TEMA-03 | a retirada de acesso no desligamento só executa no prazo se o gestor e o RH agirem; sem isso a norma de saída não sai do documento; destino planejado, número provisório |
| 04-identidade-acesso | TEMA-04 — aplicado_em | 05-rede-infraestrutura | 05-rede-infraestrutura#TEMA-03 | privilégio mínimo de rede exige segmentação, porque o alcance de uma credencial é limitado pelo que a rede permite alcançar; destino planejado, número provisório |
| 04-identidade-acesso | TEMA-05 — nao_confundir_com | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-05 | cofre de credencial humana privilegiada não substitui o cofre de segredo de aplicação, e o dono do acesso é diferente em cada caso |
| 04-identidade-acesso | TEMA-05 — nao_confundir_com | 15-fatores-humanos | 15-fatores-humanos#TEMA-05 | o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso |
| 04-identidade-acesso | TEMA-06 — aplicado_em | 08-cloud | 08-cloud#TEMA-02 | a política de identidade do provedor de nuvem é onde a decisão por recurso do zero trust vira configuração executável; destino planejado, número provisório |
| 04-identidade-acesso | TEMA-06 — complementa | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-04 | zero trust na identidade e zero trust na arquitetura são as duas metades do mesmo padrão: uma prova quem é e qual é o estado do dispositivo, a outra decide o que o desenho protege e o que contém o dano |
| 05-rede-infraestrutura | TEMA-01 — aplicado_em | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-02 | o limite de confiança marcado no diagrama de fluxo só descreve a realidade quando o fluxo nomeado corresponde ao caminho que existe na rede |
| 05-rede-infraestrutura | TEMA-01 — aprofundado_por | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-01 | aqui o tráfego é tratado como legível no caminho até existir proteção; a mecânica de cifra, chave e autenticação está na área 07; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-02 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-02 | a política de firewall é a norma aprovada que descreve o que o dispositivo executa, com dono, exceção e prazo |
| 05-rede-infraestrutura | TEMA-02 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-03 | bloquear na borda é a primeira ação de contenção e depende de alguém capaz de publicar a regra durante o incidente; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-03 — aplicado_em | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-06 | a regra de microssegmentação depende de identidade da carga de trabalho e de agente no host para ser aplicada abaixo do endereço; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-03 — complementa | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-03 | segmentação é decisão de arquitetura antes de ser configuração de switch: a zona de confiança define o que isolar e por qual critério, e VLAN, firewall e política de fluxo executam o isolamento |
| 05-rede-infraestrutura | TEMA-04 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-06 | túnel de acesso remoto vira decisão por identidade e por estado do dispositivo quando o padrão de zero trust é aplicado; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-04 — complementa | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-03 | o TLS da rede é o mesmo protocolo que a área de criptografia detalha: aqui se decide onde o túnel começa e termina, lá está a mecânica de chave, certificado e cadeia de confiança; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-05 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | o registro do resolver é uma das poucas fontes que mostram consulta a domínio de comando e controle antes de qualquer bloqueio; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-05 — complementa | 15-fatores-humanos | 15-fatores-humanos#TEMA-02 | o controle de e-mail reduz o alcance do clique que o programa de conscientização tenta evitar, e os dois medem o mesmo fenômeno por lados diferentes; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-06 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-02 | sem captura de tráfego não há telemetria de rede no SOC, e o que não é exportado não vira caso de uso; destino planejado, número provisório |
| 05-rede-infraestrutura | TEMA-06 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-04 | o fluxo e o pacote retidos são a evidência técnica da investigação, e retenção e integridade são decisão tomada na rede antes do incidente; destino planejado, número provisório |
| 06-endpoint-plataforma | TEMA-01 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-02 | o endpoint é a principal fonte de telemetria do SOC; sem os eventos do host, o caso de uso de detecção nasce cego |
| 06-endpoint-plataforma | TEMA-02 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | o desvio de linha de base é a exposição configuracional que entra no inventário de vulnerabilidades |
| 06-endpoint-plataforma | TEMA-03 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-06 | o tempo entre detecção e correção no parque é o insumo da métrica de exposição e dívida de remediação |
| 06-endpoint-plataforma | TEMA-03 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-02 | CVSS, EPSS e o catálogo de exploração em campo são o critério de priorização que a janela de patch do endpoint executa |
| 06-endpoint-plataforma | TEMA-04 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-03 | isolar a máquina e remover o artefato é a contenção e a erradicação executadas no host |
| 06-endpoint-plataforma | TEMA-04 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-04 | a resposta no host e a triagem do SOC são o mesmo incidente visto de dois lugares |
| 06-endpoint-plataforma | TEMA-05 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-03 | retenção e descarte do dado no dispositivo são executados pelas ferramentas que aplicam o rótulo |
| 06-endpoint-plataforma | TEMA-05 — complementa | 14-dados-privacidade | 14-dados-privacidade#TEMA-02 | a política de saída só classifica o que a classificação de dado já declarou sensível |
| 06-endpoint-plataforma | TEMA-06 — aplicado_em | 08-cloud | 08-cloud#TEMA-01 | o modelo de responsabilidade compartilhada define até onde a correção do servidor e da imagem é sua |
| 06-endpoint-plataforma | TEMA-06 — complementa | 08-cloud | 08-cloud#TEMA-04 | a carga endurecida no host é a mesma que roda como contêiner ou instância em nuvem, com o mesmo problema de superfície |
| 07-criptografia-segredos | TEMA-01 — complementa | 04-identidade-acesso | 04-identidade-acesso#TEMA-01 | o segundo fator por chave pública só se explica pela mecânica assimétrica, e a autenticação decide o que essa chave prova |
| 07-criptografia-segredos | TEMA-02 — aplicado_em | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-05 | escolher cifra e emissor de certificado é requisito não funcional de arquitetura, com critério de aceite verificável |
| 07-criptografia-segredos | TEMA-03 — complementa | 05-rede-infraestrutura | 05-rede-infraestrutura#TEMA-04 | o mesmo protocolo visto pela rede e visto pelo material criptográfico que ele apresenta; um tema fecha o outro |
| 07-criptografia-segredos | TEMA-04 — complementa | 08-cloud | 08-cloud#TEMA-05 | cifrar dado em nuvem depende de quem detém a chave e do ciclo de vida dela, e a décima segunda pergunta do fornecedor é quem consegue exportá-la |
| 07-criptografia-segredos | TEMA-05 — nao_confundir_com | 04-identidade-acesso | 04-identidade-acesso#TEMA-05 | cofre de credencial humana privilegiada não substitui o cofre de segredo de aplicação, e o dono do acesso é diferente em cada caso |
| 07-criptografia-segredos | TEMA-06 — aplicado_em | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-05 | o inventário criptográfico é o mesmo tipo de artefato que o inventário de dependências, e é alimentado pelo mesmo pipeline |
| 07-criptografia-segredos | TEMA-06 — nao_confundir_com | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-02 | prazo de descontinuação de algoritmo é decisão de padrão com data, e não pontuação de vulnerabilidade explorada no momento |
| 08-cloud | TEMA-01 — aplicado_em | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-06 | o modelo decide até onde a correção do sistema operacional convidado e da imagem é sua e a partir de onde o provedor responde |
| 08-cloud | TEMA-02 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-06 | a política de identidade do provedor é onde a decisão por recurso do zero trust vira configuração executável |
| 08-cloud | TEMA-02 — aprofundado_por | 04-identidade-acesso | 04-identidade-acesso#TEMA-02 | aqui a autorização aparece como política do provedor; a mecânica de RBAC, ABAC e do modelo de decisão está na área 04 |
| 08-cloud | TEMA-03 — aplicado_em | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-04 | a mesma checagem de configuração executada no pipeline evita que o desvio nasça no deploy |
| 08-cloud | TEMA-03 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | a configuração desviante entra no inventário de exposição como item com dono e prazo, junto da vulnerabilidade de software |
| 08-cloud | TEMA-04 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-02 | o log do plano de controle e o evento do runtime do contêiner são fontes de telemetria para a triagem |
| 08-cloud | TEMA-04 — complementa | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-06 | a carga endurecida no host é a mesma que roda como contêiner ou instância em nuvem, com o mesmo problema de superfície |
| 08-cloud | TEMA-05 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-03 | a cifra e a segregação decididas no desenho do dado em nuvem são executadas na retenção e no descarte |
| 08-cloud | TEMA-05 — complementa | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-04 | cifrar dado em nuvem depende de quem detém a chave e do ciclo de vida dela, e a décima segunda pergunta do fornecedor é quem consegue exportá-la |
| 08-cloud | TEMA-05 — complementa | 16-ia-seguranca | 16-ia-seguranca#TEMA-03 | conjunto de treino e índice vetorial vivem em armazenamento gerenciado, e quem detém a chave decide o que acontece com eles |
| 08-cloud | TEMA-06 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-02 | a exigência de segurança do fornecedor vira norma interna publicada, com escopo, responsável e critério verificável |
| 08-cloud | TEMA-06 — complementa | 14-dados-privacidade | 14-dados-privacidade#TEMA-05 | a transferência internacional só se materializa em cláusula contratual e anexo de garantias no contrato de nuvem |
| 09-aplicacoes-devsecops | TEMA-01 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-04 | o processo de desenvolvimento verificado é o que o sistema de gestão registra como evidência de controle e o que aparece na auditoria de certificação |
| 09-aplicacoes-devsecops | TEMA-01 — aplicado_em | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-05 | o requisito não funcional aprovado é o critério que o ciclo de desenvolvimento verifica a cada entrega; a área 03 declara a mesma relação com o mesmo tipo |
| 09-aplicacoes-devsecops | TEMA-02 — aplicado_em | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | as categorias de risco de aplicação são o que a gestão de vulnerabilidades precisa triar primeiro |
| 09-aplicacoes-devsecops | TEMA-03 — aplicado_em | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-02 | o método de modelagem descrito na área 03 é aplicado aqui ao desenho de uma aplicação dentro do ciclo de desenvolvimento; a área 03 declara a mesma relação com o mesmo tipo |
| 09-aplicacoes-devsecops | TEMA-04 — nao_confundir_com | 16-ia-seguranca | 16-ia-seguranca#TEMA-05 | regra determinística no pipeline e modelo probabilístico na triagem produzem vereditos de natureza diferente e não se substituem; destino planejado |
| 09-aplicacoes-devsecops | TEMA-05 — aplicado_em | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-06 | o inventário criptográfico é o mesmo tipo de artefato que o inventário de dependências e sai do mesmo build; a área 07 declara a mesma relação com o mesmo tipo |
| 09-aplicacoes-devsecops | TEMA-06 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-02 | o modelo de decisão de autorização vira escopo de token e verificação por objeto na API; a área 04 declara a mesma relação com o mesmo tipo |
| 10-operacoes-soc | TEMA-01 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-05 | o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro |
| 10-operacoes-soc | TEMA-01 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-01 | o modelo de SOC e o ciclo de resposta descrevem o mesmo plantão: quem atende, com que cobertura horária e em quanto tempo |
| 10-operacoes-soc | TEMA-01 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-02 | o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos |
| 10-operacoes-soc | TEMA-02 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-04 | o log coletado e retido é a evidência que a análise forense usa depois do isolamento, e retenção curta destrói a prova antes da perícia |
| 10-operacoes-soc | TEMA-02 — complementa | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-01 | o endpoint é a principal fonte de telemetria do SOC, e sem os eventos do host o caso de uso de detecção nasce cego |
| 10-operacoes-soc | TEMA-03 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-05 | o framework declara o resultado de detecção esperado e o caso de uso do SOC é a implementação verificável dele |
| 10-operacoes-soc | TEMA-03 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-04 | as duas leituras usam ATT&CK, uma para escrever a regra e a outra para priorizar o que o adversário explora em campo |
| 10-operacoes-soc | TEMA-03 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-04 | purple team mede detecção; sem caso de uso no SOC não existe o que medir |
| 10-operacoes-soc | TEMA-04 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-03 | a decisão de triagem vira ação na contenção e na erradicação, e é lá que a qualidade da decisão é medida |
| 10-operacoes-soc | TEMA-04 — complementa | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-04 | a resposta no host e a triagem do SOC são o mesmo incidente visto de dois lugares |
| 10-operacoes-soc | TEMA-05 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | a métrica do SOC é o insumo numérico do reporte ao board e da evidência de auditoria |
| 10-operacoes-soc | TEMA-05 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-06 | a maturidade do programa de segurança aparece nas métricas do SOC, que são o número auditável do plano |
| 10-operacoes-soc | TEMA-06 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-02 | o playbook automatizado é a mesma preparação de papéis, contatos e exercícios, em formato executável |
| 10-operacoes-soc | TEMA-06 — aprofundado_por | 16-ia-seguranca | 16-ia-seguranca#TEMA-05 | a automação de triagem evolui para modelos que classificam alerta, e o mecanismo dessa classificação pertence à área de segurança em IA |
| 10-operacoes-soc | TEMA-06 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-03 | a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala |
| 11-resposta-forense | TEMA-01 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-01 | o modelo de SOC e o ciclo de resposta descrevem o mesmo plantão: quem atende, com que cobertura horária e em quanto tempo |
| 11-resposta-forense | TEMA-01 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-04 | as técnicas do ATT&CK descrevem o que o adversário faz entre a detecção e a erradicação, e sem elas o ciclo para no primeiro alerta |
| 11-resposta-forense | TEMA-02 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-03 | a lacuna apontada no exercício só sai do papel quando entra no pedido de verba do ciclo seguinte |
| 11-resposta-forense | TEMA-02 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-01 | o SOC decide e escala; o ciclo de resposta a incidentes é o outro lado do mesmo processo, e as fases só fecham quando os dois são lidos juntos |
| 11-resposta-forense | TEMA-02 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-02 | o mesmo escopo autorizado que limita o exercício adversarial limita o exercício de mesa: quem pode ser afetado, com qual finalidade e até onde |
| 11-resposta-forense | TEMA-03 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-02 | isolar um sistema em produção só é permitido se a alçada estiver publicada como procedimento aprovado, com dono e exceção |
| 11-resposta-forense | TEMA-03 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-06 | a automação que contém um host em segundos só existe se o playbook tiver decidido antes o que roda sem gente na sala |
| 11-resposta-forense | TEMA-04 — complementa | 05-rede-infraestrutura | 05-rede-infraestrutura#TEMA-06 | o fluxo e o pacote retidos são a evidência da investigação, e retenção e integridade se decidem na rede antes do incidente |
| 11-resposta-forense | TEMA-04 — nao_confundir_com | 14-dados-privacidade | 14-dados-privacidade#TEMA-04 | coletar evidência forense não autoriza tratar dado pessoal para outra finalidade |
| 11-resposta-forense | TEMA-05 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-03 | a tolerância a indisponibilidade declarada no apetite de risco é o teto que o RTO do processo crítico não pode ultrapassar |
| 11-resposta-forense | TEMA-06 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-04 | o prazo de três dias úteis da comunicação com dado pessoal obriga o comitê a decidir sob informação incompleta |
| 11-resposta-forense | TEMA-06 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-06 | o achado ofensivo que expõe dado pessoal entra na mesma decisão de comunicação, com conteúdo e prazo definidos antes do resultado chegar |
| 12-vulnerabilidades-threat-intel | TEMA-01 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-03 | a lista de pares dispositivo e vulnerabilidade é o mesmo objeto que o teste de caixa branca percorre com julgamento humano e escopo acordado |
| 12-vulnerabilidades-threat-intel | TEMA-01 — nao_confundir_com | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-01 | varredura e inventário de exposição rodam em escala e repetem toda semana; o teste ofensivo encadeia exploração com julgamento humano e escopo acordado |
| 12-vulnerabilidades-threat-intel | TEMA-02 — complementa | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-03 | o critério de priorização definido aqui só se converte em correção quando a janela de patch do endpoint o executa |
| 12-vulnerabilidades-threat-intel | TEMA-02 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-05 | o achado descrito no relatório de teste entra na fila pelo mesmo critério de probabilidade estimada e contexto do ativo |
| 12-vulnerabilidades-threat-intel | TEMA-02 — nao_confundir_com | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-06 | prazo de descontinuação de algoritmo é decisão de padrão com data; EPSS e CVSS medem a vulnerabilidade explorada no momento |
| 12-vulnerabilidades-threat-intel | TEMA-03 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-02 | indicador sem fonte de telemetria mapeada vira relatório; o log precisa existir para o indicador virar detecção |
| 12-vulnerabilidades-threat-intel | TEMA-04 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | a matriz diz qual comportamento observar e o caso de uso de detecção entrega a regra que observa |
| 12-vulnerabilidades-threat-intel | TEMA-04 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-01 | a mesma matriz organiza a triagem do incidente e a hipótese de contenção |
| 12-vulnerabilidades-threat-intel | TEMA-04 — complementa | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-04 | o exercício adversarial valida no ambiente a cobertura que o mapa de técnicas declarou, e o resultado volta para o mapa |
| 12-vulnerabilidades-threat-intel | TEMA-05 — aplicado_em | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-06 | autorizar teste e receber relato de falha usam o mesmo documento de escopo e salvo-conduto |
| 12-vulnerabilidades-threat-intel | TEMA-06 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | exposição e dívida medidas são as linhas de métrica que o comitê consome |
| 12-vulnerabilidades-threat-intel | TEMA-06 — nao_confundir_com | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-06 | dívida de desenho adiada e item de correção vencido têm dono, prazo e instrumento de medição diferentes |
| 13-ofensiva-pentest | TEMA-01 — nao_confundir_com | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | teste ofensivo aponta falha pontual em um alvo; auditoria verifica se o sistema de gestão opera como declarado |
| 13-ofensiva-pentest | TEMA-01 — nao_confundir_com | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | varredura encontra fraqueza em escala pelo catálogo; pentest encadeia exploração com julgamento humano e escopo autorizado |
| 13-ofensiva-pentest | TEMA-02 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-02 | regras de engajamento e exercícios usam a mesma preparação: papéis, contatos e critério de parada |
| 13-ofensiva-pentest | TEMA-03 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-01 | o teste com informação interna confirma a eficácia do processo de gestão de vulnerabilidades, que é o objeto do outro tema |
| 13-ofensiva-pentest | TEMA-04 — complementa | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | purple team mede detecção; sem caso de uso no SOC não existe o que medir |
| 13-ofensiva-pentest | TEMA-04 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-04 | o exercício se planeja por tática e técnica, na mesma linguagem que sustenta a detecção |
| 13-ofensiva-pentest | TEMA-05 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-03 | o achado do relatório entra na fila de investimento como exposição com custo de tratamento |
| 13-ofensiva-pentest | TEMA-05 — complementa | 12-vulnerabilidades-threat-intel | 12-vulnerabilidades-threat-intel#TEMA-02 | severidade vem no relatório; prioridade exige o contexto que a área de vulnerabilidades mantém |
| 13-ofensiva-pentest | TEMA-06 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-05 | contratar teste ofensivo é uma instância da decisão de terceirizar capacidade descrita lá |
| 13-ofensiva-pentest | TEMA-06 — complementa | 11-resposta-forense | 11-resposta-forense#TEMA-06 | achado que revela incidente em curso sai do backlog e entra na comunicação de crise e na notificação regulatória |
| 14-dados-privacidade | TEMA-01 — nao_confundir_com | 01-fundamentos | 01-fundamentos#TEMA-01 | proteger um dado e tratar dado pessoal são obrigações distintas, com donos distintos |
| 14-dados-privacidade | TEMA-02 — complementa | 06-endpoint-plataforma | 06-endpoint-plataforma#TEMA-05 | a política de DLP só consegue bloquear o que o inventário classificou antes |
| 14-dados-privacidade | TEMA-03 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-02 | a tabela de retenção só tem efeito quando publicada como norma aprovada com dono e evidência de execução |
| 14-dados-privacidade | TEMA-04 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-06 | o incidente com dado pessoal dispara a notificação regulatória, com prazo e critério próprios |
| 14-dados-privacidade | TEMA-04 — nao_confundir_com | 11-resposta-forense | 11-resposta-forense#TEMA-04 | coletar evidência forense não autoriza tratar dado pessoal para outra finalidade |
| 14-dados-privacidade | TEMA-05 — aprofundado_por | 07-criptografia-segredos | 07-criptografia-segredos#TEMA-04 | a garantia técnica da transferência depende de quem detém a chave e em qual jurisdição ela está custodiada |
| 14-dados-privacidade | TEMA-05 — complementa | 08-cloud | 08-cloud#TEMA-06 | a transferência internacional só se materializa em cláusula contratual e anexo de garantias no contrato de nuvem |
| 14-dados-privacidade | TEMA-06 — nao_confundir_com | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-04 | o sistema de gestão de segurança da informação organiza controles; o programa de governança em privacidade decide finalidade, hipótese legal e direitos do titular |
| 14-dados-privacidade | TEMA-06 — nao_confundir_com | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-01 | o mandato do CISO responde pelo risco de segurança; o do encarregado responde pela legitimidade do tratamento e pelo canal do titular |
| 15-fatores-humanos | TEMA-01 — aplicado_em | 13-ofensiva-pentest | 13-ofensiva-pentest#TEMA-04 | o exercício adversarial é onde a exploração do humano é medida com resultado observável, e não presumida |
| 15-fatores-humanos | TEMA-01 — complementa | 16-ia-seguranca | 16-ia-seguranca#TEMA-01 | risco de IA chega à pessoa pelo canal que ela já usa, e sem a leitura do fator humano o controle de uso de IA vira bloqueio de ferramenta |
| 15-fatores-humanos | TEMA-02 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | a mensagem que já convenceu alguém só vira detecção se a regra aceitar como sinal um acesso autorizado fora do padrão da conta |
| 15-fatores-humanos | TEMA-02 — complementa | 05-rede-infraestrutura | 05-rede-infraestrutura#TEMA-05 | o filtro de e-mail, DNS e web corta o alcance do clique que o programa de conscientização tenta evitar, e os dois olham o mesmo evento por lados diferentes |
| 15-fatores-humanos | TEMA-03 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-02 | o texto da norma vira rotina quando o programa de aprendizagem o traduz para a decisão que cada público toma no dia de trabalho |
| 15-fatores-humanos | TEMA-03 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-03 | o prazo de retirada de acesso no desligamento depende de gestor e de Recursos Humanos agirem, e os dois são público nomeado do programa |
| 15-fatores-humanos | TEMA-04 — aplicado_em | 17-lideranca-ciso | 17-lideranca-ciso#TEMA-04 | a comunicação executiva é o instrumento pelo qual a liderança enuncia o que a cultura deve sustentar em caso de conflito |
| 15-fatores-humanos | TEMA-04 — complementa | 16-ia-seguranca | 16-ia-seguranca#TEMA-06 | uso não governado de ferramenta cede ao critério que a liderança sustenta, e não ao bloqueio de rede, o que coloca os dois temas no mesmo conflito |
| 15-fatores-humanos | TEMA-05 — aplicado_em | 04-identidade-acesso | 04-identidade-acesso#TEMA-04 | a revisão periódica de acesso é o controle que remove privilégio acumulado, que é a matéria-prima do uso indevido de acesso autorizado |
| 15-fatores-humanos | TEMA-05 — nao_confundir_com | 04-identidade-acesso | 04-identidade-acesso#TEMA-05 | o cofre de credencial controla o empréstimo e o registro da credencial privilegiada; risco interno trata a decisão de quem já tem o acesso |
| 15-fatores-humanos | TEMA-06 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | o indicador de comportamento entra no mesmo relatório de métricas e reporte que o comitê já recebe, com a mesma exigência de decisão associada |
| 15-fatores-humanos | TEMA-06 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-05 | a crítica a indicador de volume e a exigência de dono por métrica valem igual para o indicador do programa de comportamento |
| 16-ia-seguranca | TEMA-01 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-03 | risco de IA só entra no registro com critério de aceitação declarado; o alvo é onde apetite e tolerância são escritos |
| 16-ia-seguranca | TEMA-01 — complementa | 15-fatores-humanos | 15-fatores-humanos#TEMA-01 | risco de IA muda o que a pessoa vê e faz; o alvo trata por que gente é explorada e sem isso o controle de uso de IA vira bloqueio de ferramenta; destino planejado |
| 16-ia-seguranca | TEMA-02 — aplicado_em | 03-arquitetura-engenharia | 03-arquitetura-engenharia#TEMA-02 | o modelo de ameaças é onde a entrada do prompt entra no diagrama com ativo, ator e fronteira de confiança |
| 16-ia-seguranca | TEMA-02 — aprofundado_por | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-02 | mesma classe de falha, superfície nova; o alvo trata validação de entrada e de saída no pipeline; destino planejado |
| 16-ia-seguranca | TEMA-03 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-02 | classificação e inventário definem o que pode entrar em conjunto de treino e em base de conhecimento |
| 16-ia-seguranca | TEMA-03 — complementa | 08-cloud | 08-cloud#TEMA-05 | conjunto de treino e índice vetorial vivem em armazenamento gerenciado; o outro lado é chave, segregação e ciclo de vida na nuvem; destino planejado |
| 16-ia-seguranca | TEMA-04 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-04 | o sistema de gestão de IA usa a mesma mecânica de escopo, evidência e auditoria do ISMS; o alvo é a versão já rodada em segurança da informação |
| 16-ia-seguranca | TEMA-05 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-03 | a detecção define o caso de uso e a telemetria que o modelo vai consumir na triagem; sem regra que gere alerta não existe dado para o modelo |
| 16-ia-seguranca | TEMA-05 — nao_confundir_com | 09-aplicacoes-devsecops | 09-aplicacoes-devsecops#TEMA-04 | regra determinística no pipeline e modelo probabilístico na triagem produzem vereditos de natureza diferente e não se substituem; destino planejado |
| 16-ia-seguranca | TEMA-06 — aplicado_em | 14-dados-privacidade | 14-dados-privacidade#TEMA-04 | dado pessoal colado em ferramenta não aprovada é tratamento sem base legal declarada e pode virar incidente comunicável |
| 16-ia-seguranca | TEMA-06 — complementa | 15-fatores-humanos | 15-fatores-humanos#TEMA-04 | uso não governado cede a política que a liderança sustenta, e não a bloqueio de rede; o alvo trata cultura e papel da liderança; destino planejado |
| 17-lideranca-ciso | TEMA-01 — nao_confundir_com | 14-dados-privacidade | 14-dados-privacidade#TEMA-06 | responder por risco cibernético não transfere ao CISO o papel do encarregado pelo tratamento de dados pessoais |
| 17-lideranca-ciso | TEMA-02 — aplicado_em | 11-resposta-forense | 11-resposta-forense#TEMA-06 | o reporte ao board se testa na comunicação de crise e na notificação regulatória |
| 17-lideranca-ciso | TEMA-02 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-01 | a posição do cargo só produz efeito dentro de uma estrutura decisória declarada |
| 17-lideranca-ciso | TEMA-03 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | orçamento e reporte usam as mesmas métricas |
| 17-lideranca-ciso | TEMA-03 — nao_confundir_com | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-03 | apetite declara quanto risco se aceita; orçamento decide quanto se paga para reduzir risco já declarado |
| 17-lideranca-ciso | TEMA-04 — aplicado_em | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-06 | o relatório ao board é onde a comunicação executiva é medida |
| 17-lideranca-ciso | TEMA-04 — aplicado_em | 15-fatores-humanos | 15-fatores-humanos#TEMA-04 | a mensagem da liderança é o que sustenta cultura de segurança |
| 17-lideranca-ciso | TEMA-05 — aplicado_em | 00-guia-basico | 00-guia-basico#TEMA-05 | a trilha dos primeiros 90 dias define quais papéis existem antes de qualquer contratação |
| 17-lideranca-ciso | TEMA-05 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-01 | o modelo de SOC escolhido define o que fica com time próprio e o que vai para terceiro |
| 17-lideranca-ciso | TEMA-06 — aplicado_em | 10-operacoes-soc | 10-operacoes-soc#TEMA-05 | a maturidade do programa aparece nas métricas do SOC |
| 17-lideranca-ciso | TEMA-06 — complementa | 02-governanca-risco-compliance | 02-governanca-risco-compliance#TEMA-04 | o programa de segurança e o ISMS descrevem o mesmo objeto em linguagens diferentes |

## Matriz de proximidade entre áreas

| Área A | Área B | Ligações |
|---|---|---|
| 00-guia-basico | 01-fundamentos | 1 |
| 00-guia-basico | 02-governanca-risco-compliance | 3 |
| 00-guia-basico | 17-lideranca-ciso | 3 |
| 01-fundamentos | 02-governanca-risco-compliance | 3 |
| 01-fundamentos | 04-identidade-acesso | 3 |
| 01-fundamentos | 07-criptografia-segredos | 1 |
| 01-fundamentos | 12-vulnerabilidades-threat-intel | 2 |
| 01-fundamentos | 14-dados-privacidade | 3 |
| 02-governanca-risco-compliance | 03-arquitetura-engenharia | 1 |
| 02-governanca-risco-compliance | 04-identidade-acesso | 1 |
| 02-governanca-risco-compliance | 05-rede-infraestrutura | 1 |
| 02-governanca-risco-compliance | 08-cloud | 2 |
| 02-governanca-risco-compliance | 09-aplicacoes-devsecops | 1 |
| 02-governanca-risco-compliance | 10-operacoes-soc | 3 |
| 02-governanca-risco-compliance | 11-resposta-forense | 3 |
| 02-governanca-risco-compliance | 12-vulnerabilidades-threat-intel | 2 |
| 02-governanca-risco-compliance | 13-ofensiva-pentest | 2 |
| 02-governanca-risco-compliance | 14-dados-privacidade | 3 |
| 02-governanca-risco-compliance | 15-fatores-humanos | 3 |
| 02-governanca-risco-compliance | 16-ia-seguranca | 2 |
| 02-governanca-risco-compliance | 17-lideranca-ciso | 9 |
| 03-arquitetura-engenharia | 04-identidade-acesso | 2 |
| 03-arquitetura-engenharia | 05-rede-infraestrutura | 3 |
| 03-arquitetura-engenharia | 06-endpoint-plataforma | 1 |
| 03-arquitetura-engenharia | 07-criptografia-segredos | 1 |
| 03-arquitetura-engenharia | 08-cloud | 1 |
| 03-arquitetura-engenharia | 09-aplicacoes-devsecops | 4 |
| 03-arquitetura-engenharia | 10-operacoes-soc | 1 |
| 03-arquitetura-engenharia | 12-vulnerabilidades-threat-intel | 3 |
| 03-arquitetura-engenharia | 16-ia-seguranca | 1 |
| 04-identidade-acesso | 05-rede-infraestrutura | 2 |
| 04-identidade-acesso | 07-criptografia-segredos | 5 |
| 04-identidade-acesso | 08-cloud | 3 |
| 04-identidade-acesso | 09-aplicacoes-devsecops | 2 |
| 04-identidade-acesso | 15-fatores-humanos | 5 |
| 05-rede-infraestrutura | 06-endpoint-plataforma | 1 |
| 05-rede-infraestrutura | 07-criptografia-segredos | 3 |
| 05-rede-infraestrutura | 10-operacoes-soc | 2 |
| 05-rede-infraestrutura | 11-resposta-forense | 3 |
| 05-rede-infraestrutura | 15-fatores-humanos | 2 |
| 06-endpoint-plataforma | 08-cloud | 4 |
| 06-endpoint-plataforma | 10-operacoes-soc | 4 |
| 06-endpoint-plataforma | 11-resposta-forense | 1 |
| 06-endpoint-plataforma | 12-vulnerabilidades-threat-intel | 4 |
| 06-endpoint-plataforma | 14-dados-privacidade | 3 |
| 07-criptografia-segredos | 08-cloud | 2 |
| 07-criptografia-segredos | 09-aplicacoes-devsecops | 2 |
| 07-criptografia-segredos | 12-vulnerabilidades-threat-intel | 2 |
| 07-criptografia-segredos | 14-dados-privacidade | 1 |
| 08-cloud | 09-aplicacoes-devsecops | 1 |
| 08-cloud | 10-operacoes-soc | 1 |
| 08-cloud | 12-vulnerabilidades-threat-intel | 1 |
| 08-cloud | 14-dados-privacidade | 3 |
| 08-cloud | 16-ia-seguranca | 2 |
| 09-aplicacoes-devsecops | 12-vulnerabilidades-threat-intel | 1 |
| 09-aplicacoes-devsecops | 16-ia-seguranca | 3 |
| 10-operacoes-soc | 11-resposta-forense | 9 |
| 10-operacoes-soc | 12-vulnerabilidades-threat-intel | 3 |
| 10-operacoes-soc | 13-ofensiva-pentest | 2 |
| 10-operacoes-soc | 15-fatores-humanos | 2 |
| 10-operacoes-soc | 16-ia-seguranca | 2 |
| 10-operacoes-soc | 17-lideranca-ciso | 4 |
| 11-resposta-forense | 12-vulnerabilidades-threat-intel | 2 |
| 11-resposta-forense | 13-ofensiva-pentest | 4 |
| 11-resposta-forense | 14-dados-privacidade | 4 |
| 11-resposta-forense | 17-lideranca-ciso | 2 |
| 12-vulnerabilidades-threat-intel | 13-ofensiva-pentest | 9 |
| 13-ofensiva-pentest | 15-fatores-humanos | 1 |
| 13-ofensiva-pentest | 17-lideranca-ciso | 2 |
| 14-dados-privacidade | 16-ia-seguranca | 2 |
| 14-dados-privacidade | 17-lideranca-ciso | 2 |
| 15-fatores-humanos | 16-ia-seguranca | 4 |
| 15-fatores-humanos | 17-lideranca-ciso | 2 |

---

| Home |
|---|
| [README](./README.md) |
