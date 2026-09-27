# App de estudo do roadmap CISO

Este repositório tem 18 áreas, 109 temas e 3 trilhas de estudo em Markdown. O app lê esses arquivos
e devolve o mesmo texto numa aplicação que abre com duplo clique, sem servidor no meio. O código
mora em `app/`; o material continua em `conteudo/`, e é de lá que ele vem, sempre.

## O que a aplicação faz

A tela inicial é o painel, com as 18 áreas na ordem de `ordem_estudo`. Cada linha traz o nome da
área, o nível (`base`, `intermediario` ou `avancado`) e a contagem de temas. Do painel se chega a
todo o resto: guia da área, temas, glossário, mapa de relações, as 3 trilhas (90 dias, 12 meses, 24
meses), certificações por fornecedor, o índice de fontes e o quiz de múltipla escolha.

Um tema abre com o pré-teste de calibração de confiança, de 1 a 5, e depois as seções na numeração
do arquivo original. A recuperação ativa esconde o gabarito atrás do botão "Revelar resposta". No
rodapé, links para o tema anterior e o seguinte. O botão do topo troca claro por escuro, e a escolha
fica no `localStorage` do navegador; se o navegador negar esse acesso, a sessão funciona e apenas
não lembra a preferência.

Diagramas Mermaid são renderizados no navegador, com as cores do tema em uso. O build guarda o
código do diagrama como texto, nunca como imagem, e por isso não existe arquivo de figura no pacote.

## Requisitos

Node 22. A máquina de desenvolvimento roda v22.23.1 e o `@types/node` do projeto fixa `^22`. Um
navegador atual, para abrir o resultado.

## Comandos

| Comando | O que ele faz |
|---|---|
| `npm install` | instala as dependências. Leia a nota sobre `omit=dev` abaixo antes de rodar. |
| `npm run build:content` | lê `conteudo/` e regrava `app/src/content/generated/content.json` |
| `npm run check:content` | regera o `content.json` a partir de `conteudo/`, compara com o que está em disco e falha o processo quando o material mudou depois da última geração ou quando algo falta |
| `npm run build:questions` | deriva o banco de múltipla escolha do JSON e regrava um arquivo por área em `app/src/content/questions/`, trazendo de volta o `status` de revisão — e derrubando-o quando o texto do item muda |
| `npm run check:questions` | valida o banco já gravado e falha o processo quando algum item não fecha |
| `npm test` | roda a suíte do Vitest: parser, gate, banco de questões e motor pedagógico |
| `npm run dev` | roda `build:content` e sobe o Vite com recarga automática |
| `npm run build` | gera o conteúdo e produz o build do navegador, em arquivo único |
| `npm run build:desktop` | produz o build do desktop em `dist-desktop/` (usa o conteúdo já gerado) |
| `npm run preparar:conteudo` | lê `conteudo/`, valida o JSON gerado, gera o banco de questões e roda o gate dele — roda uma vez por verificação |
| `npm run medir` | mede O1, O2, O4, O5 e O6 no aplicativo empacotado |
| `npm run typecheck` | roda o `tsc --noEmit`; o Vite apaga tipos sem conferi-los, então isto precisa existir separado |
| `npm run verificar` | **o portão do dia a dia**: build, build do Electron, testes, os três smokes do código (navegador, desktop e pasta) e o verificador do material — **não empacota nem testa o pacote** |
| `npm run verificar:pacote` | empacota e roda o smoke do pacote — o portão de quem vai distribuir |
| `npm run smoke` | abre o artefato por `file://` num Chrome headless e confere o DOM renderizado |
| `npm run build:electron` | compila o processo principal e o preload para `dist-electron/` |
| `npm run desktop` | build completo e abre o aplicativo desktop |
| `npm run smoke:desktop` | abre a janela de verdade e confere a casca, o protocolo, a ponte com lista fechada de canais, as permissões negadas, a ausência de requisição de rede, o progresso em arquivo e o bloqueio de navegação |
| `npm run distribuir:<sistema>` | empacota com o `electron-builder`: AppImage, NSIS ou `.dmg`/`.zip` |
| `npm run smoke:pacote` | abre o **app empacotado** por CDP e confere os fuses, o asar e o progresso |
| `npm run empacotar` | monta a pasta que vai para quem estuda: `dist/Roadmap-CISO-Interativo/` (roda o `build` antes) |
| `npm run test:watch` | a suíte em modo observador |
| `npm run preview` | sobe o Vite servindo o `dist/` para inspeção |

A ordem tem uma dependência real: os dois gates leem o que está em disco e nenhum grava. O
`check:content` regera o material e reprova o arquivo que ficou para trás, então sozinho ele já
acusa um tema editado sem `npm run build:content`; o `check:questions` confere o banco contra a
derivação de agora. Quem grava é `build:content` e `build:questions`, e o `build` do app chama os
quatro na ordem certa. Os dois gates aceitam `ROADMAP_CONTENT_FILE`, `ROADMAP_CONTENT_DIR` e
`ROADMAP_QUESTIONS_DIR`, para serem exercitados num diretório temporário sem tocar no material. O
`dev` também não vigia `conteudo/`. Editou um tema com o servidor no ar? Rode `npm run build:content`
de novo e a página recarrega com o texto novo — e `npm run build:questions` se o tema tinha tabela
de erros comuns, que é de onde saem todos os itens, porque o quiz continua servindo o banco anterior
até o gerador rodar.

**Todos os smokes conferem o frescor do artefato antes de rodar.** Cada um compara a data do que ele
abre (`dist/index.html`, `dist-electron/main.cjs` ou o `app.asar`) com a da fonte mais nova; se o
binário for anterior, o teste falha dizendo o que rodar, em vez de medir código que não está lá. Isso
não é teoria: o smoke do desktop passou verde contra um `main.cjs` compilado antes das correções de
segurança da casca, e as asserções de travessia, host e CSP — que existem hoje — só foram exercitadas
de verdade depois de recompilar. Por isso o `smoke` exige o build feito antes e o Chrome instalado;
em outra máquina, aponte o binário pela variável `CHROME_BIN`.

## O que sai do build

A build inteira vira um arquivo: `app/dist/index.html`, com **7,84 MiB** (8.222.126 bytes) na última
execução. A medição anterior, de antes de o banco entrar inline, era 7,6 MB — os 18 arquivos do banco
viajam dentro desse arquivo. Ele abre por `file://`, roda offline e não pede nada instalado na
máquina de quem vai estudar. Esse é o formato inteiro do produto, e é o motivo de
`inlineDynamicImports` estar ligado no `vite.config.ts`: o Mermaid carrega os tipos de diagrama por
`import()` dinâmico e um chunk externo não seria lido a partir de `file://`.

`dist/` está no `.gitignore` da raiz, então o HTML pronto não vai para o controle de versão. Quem
quiser o arquivo precisa gerá-lo.

## Aplicativo desktop

`npm run desktop` abre o app em Electron. O renderer é exatamente o mesmo do navegador — os
componentes, o domínio e os testes não mudaram; o que muda é a casca em volta e onde o progresso
é guardado.

| Peça | O que faz |
|---|---|
| `electron/main.ts` | janela, menu, protocolo `app://`, permissões negadas, bloqueio de navegação e de janela nova |
| `electron/preload.ts` | ponte com lista fechada de canais; nenhum `ipcRenderer` cru exposto |
| `electron/progresso.ts` | lê e grava `progresso.json` na pasta de dados do app, com troca atômica |
| `src/infrastructure/storage/persistencia.ts` | escolhe o provedor: ponte do Electron ou `localStorage` |

**O progresso vira arquivo.** No desktop ele fica em `progresso.json`, na pasta de dados do
aplicativo (no Linux, `~/.config/roadmap-ciso-app/`), em vez do armazenamento do navegador.
Exportar, importar e recomeçar estão no menu **Progresso** e também no painel — as duas portas
chamam as mesmas ações.

**As duas vias não compartilham progresso, e não há migração automática.** O armazenamento local do
navegador pertence à origem em que o app roda (`file://` ou `127.0.0.1:4173`); no desktop a origem é
`app://bundle`, um balde próprio e vazio. Ler `localStorage` de dentro do desktop nunca acharia o
estudo feito no navegador — por isso o caminho não existe no código. A ponte entre as vias é o
**arquivo exportado**: exporte no navegador e importe no desktop, ou o contrário. Quando não há nada
estudado, o painel diz isso e aponta o botão.

**O que a casca fecha.** O conteúdo é servido por um esquema próprio (`app://`), o que permite mandar
a CSP como **header** e não só como meta tag. Não há Node no renderer (`contextIsolation`, `sandbox`,
sem `nodeIntegration`), nenhuma permissão de câmera, microfone, localização, notificação ou
clipboard é concedida, toda navegação para fora é bloqueada e link externo sai pelo navegador do
sistema — e só `http(s)`. O caminho que serve os arquivos tem trava explícita contra travessia.

O `npm run smoke:desktop` prova isso numa janela de verdade: abre, confere as preferências
endurecidas, navega até um tema, renderiza o diagrama, escreve o progresso no arquivo, tenta sair
para `file://` e é bloqueado, fecha e **reabre** com o estado no lugar. Também exercita, com 18
asserções, o que antes só existia por inspeção: a ponte expõe só a lista fechada de canais (nenhum
`ipcRenderer` cru), `window.open` devolve `null` e nenhuma janela nova nasce, o que cruza a ponte é
recusado quando não é objeto e cortado por tamanho antes do `JSON.parse`, nos dois sentidos da
leitura e da escrita, as permissões são negadas nas duas checagens (a do pedido e a da consulta) e
nenhuma requisição do renderer chega a um servidor local — esta última com controle positivo, porque
"nada chegou" passaria também por ausência de tentativa. Cada uma tem prova de falsificabilidade por
mutação: desligada a proteção de propósito, a asserção reprova. E exercita o protocolo pelo
processo principal, que é o único lugar de onde dá para conferir: `app://bundle/index.html` responde
200 com a CSP no cabeçalho, a travessia codificada (`%2e%2e`) responde 404 e um host diferente de
`bundle` também — do renderer não daria, porque a própria CSP tem `connect-src 'none'` e barraria o
`fetch` antes de o handler ser chamado.

## Os dois builds da interface

Um renderer, dois artefatos, por uma restrição real: `file://` não carrega **nada** externo —
nem chunk, nem `fetch`. Com o conteúdo e os diagramas em arquivos separados, o duplo clique
quebraria. Então o desktop, que não tem essa restrição, ganha o build dividido:

| | `npm run build` (navegador) | `npm run build:desktop` (desktop) |
|---|---|---|
| Saída | `dist/index.html`, um arquivo | `dist-desktop/`, uma pasta |
| Conteúdo | inline no JavaScript (3,89 MB) | `conteudo.json` ao lado (3,71 MiB) |
| Banco de questões | inline no JavaScript, junto com o conteúdo | `questoes.json` ao lado (543.668 bytes, 0,52 MiB) |
| Diagramas | todos inlinados (3,4 MB) | só o `flowchart`; 35 chunks de outros tipos são descartados |
| Script no arranque | **7,84 MiB** para o V8 analisar | **935 kB** (957.699 bytes) |
| CSP | `<meta>` no HTML, com `'unsafe-inline'` | cabeçalho, `script-src 'self'` |
| Quem usa | launcher (`dist/Roadmap-CISO-Interativo/`) | empacotado pelo electron-builder |

A diferença entre os dois está isolada em `@fonte` (`src/infrastructure/content/fonte-web.ts` e
`fonte-desktop.ts`): o repositório de conteúdo é o mesmo, e o resto do app não sabe de onde o
JSON veio. `carregar()` roda antes da primeira renderização, em `main.tsx`. O banco segue o mesmo
caminho: `lerBancoBruto()` entrega os 18 arquivos num objeto de chave `areaId` — inline no navegador,
num `questoes.json` só no desktop — e é lido quando a tela de quiz monta, não no arranque.

O corte dos diagramas é por **tipo**, e não por nome de arquivo — os hashes mudam a cada build,
o prefixo não. A rede de segurança é o `npm run smoke:desktop`, que desenha um diagrama de
verdade: se o corte levar algo necessário, o teste falha em vez de o app aparecer sem o desenho.

## Empacotamento

`npm run distribuir:linux` produz `instalador/Roadmap CISO-0.1.0.AppImage`. O alvo é o
`electron-builder.yml`, e o endurecimento do binário é um `afterPack` (`scripts/fuses.mjs`).

| O que | Medido em 2026-09-26, Linux x64, Electron 33.4.11 |
|---|---|
| AppImage | **104,0 MiB** (109.006.365 bytes) — O7, medido **antes do banco** entrar no pacote |
| `app.asar` | 4,89 MiB (5.124.818 bytes): o `conteudo.json`, os 27 assets que sobraram e o `main`/`preload` — medido **antes do banco** |
| `questoes.json` | 543.668 bytes (0,52 MiB): o banco de múltipla escolha, que agora viaja dentro do asar — eram 791.357 bytes antes de as questões discursivas saírem |
| `dist-desktop/index.html` + assets | 935 kB (957.699 bytes) de JavaScript no arranque, contra 7,84 MiB inlinados |
| Pasta desempacotada | 267 MiB — o binário do Electron sozinho tem 177,7 MiB — medido **antes do banco** |

**O banco entrou no pacote depois destas medições.** A lista de `files` do `electron-builder.yml`
inclui `dist-desktop/**/*`, e é lá que o `questoes.json` é gravado: o asar de agora é maior que os
4,89 MiB da tabela, e o AppImage também. As três linhas marcadas esperam o próximo
`npm run distribuir:<sistema>` para virarem número medido de novo — até então, o que está escrito
nelas é história, não estado.

As unidades são as mesmas em todas as linhas (MiB, com os bytes ao lado) porque misturar decimal
com binário produz uma contradição visível: 7,6 MB contra 7,3 MB para o mesmo arquivo faz a asar
parecer menor que o `index.html` que ela contém. O AppImage quase não mudou com a 4.4 — 104,6 para
104,0 MiB — porque o que ele carrega é o Electron; o ganho está no `asar` (7,3 → 4,9 MiB) e, acima
de tudo, no que o V8 precisa analisar antes da primeira tela.

Os 104,0 MiB são quase todos o Electron. O que é nosso é 4,89 MiB, e o desenho do pacote é o que
mantém isso: a lista de `files` é explícita e termina com `!node_modules/**`. Sem essa linha, o
electron-builder arrasta a árvore de produção inteira — 7480 dos 7487 arquivos do pacote, 137 MB
dos 139 MB do AppImage anterior — mesmo com o React e o Mermaid já dentro do bundle inline de
`dist/index.html` e com o processo principal usando só `node:` e `electron`. Código que nunca é
executado, dentro do instalador de todo mundo.

**Fuses do binário.** Sete chaves, conferidas pelo próprio `afterPack` (uma lista que não chegou
ao binário seria promessa vazia) e de novo pelo `npm run smoke:pacote`:

| Fuse | Estado | Por quê |
|---|---|---|
| `RunAsNode` | desligado | sem `ELECTRON_RUN_AS_NODE`, o nosso binário não vira um Node de propósito geral |
| `EnableNodeOptionsEnvironmentVariable` | desligado | `NODE_OPTIONS` não injeta código no processo |
| `EnableNodeCliInspectArguments` | desligado | `--inspect` não abre depurador |
| `EnableEmbeddedAsarIntegrityValidation` | ligado | o asar é conferido (macOS e Windows; no Linux a chave fica gravada) |
| `OnlyLoadAppFromAsar` | ligado | não roda a partir de pasta extraída |
| `EnableCookieEncryption` | ligado | cofres locais do Chromium criptografados |
| `GrantFileProtocolExtraPrivileges` | desligado | o app não usa `file://`; o padrão do Electron dá privilégio a mais |

Sobraram dois limites, medidos e não supostos:

- **Windows** precisa de `wine` no Linux (ausente aqui) ou de uma máquina Windows. O alvo `nsis` e
  o `portable` estão configurados com `oneClick`, sem senha de administrador.
- **macOS** precisa de um Mac: `.dmg` e `.zip` não se montam de fora. Sem assinatura, o Gatekeeper
  pede "abrir mesmo assim" na primeira vez.

O **`.deb` saiu da configuração** por decisão. Ele depende do `fpm` do electron-builder, que precisa
de `libcrypt.so.1` — ausente no Fedora 44 —, e resolver isso é instalar pacote de sistema para gerar
um formato que o AppImage já cobre com duplo clique.

**O sandbox do Chromium, no Linux — o que é verdade e o que não é.** Rodando o **arquivo do
AppImage** com duplo clique, o sandbox está ativo: o processo do renderer ganha um user namespace
próprio e um filtro seccomp-bpf instalado (medido: `Seccomp: 2, filters: 1`). Mas o `.desktop` que o
AppImage distribui sai com **`Exec=AppRun --no-sandbox %U`**, porque esse é o padrão do
electron-builder para AppImage — e quem integra o AppImage ao menu (AppImageLauncher, `appimaged`)
passa a abrir **sem sandbox** (medido: todos no mesmo namespace, `Seccomp: 0, filters: 0`). O
`npm run smoke:pacote` lê esse `.desktop` e reprova se ele pedir depurador, mas o `--no-sandbox` é
conhecido e não está assertado.

A troca é esta: o `chrome-sandbox` dentro de um AppImage não consegue ser setuid root (squashfs não
sustenta o bit), e em distros que restringem user namespaces sem privilégio — Ubuntu 23.10+ com
AppArmor — o Chromium **aborta** em vez de rodar sem sandbox. Ou seja, tirar o `--no-sandbox` troca
"roda sem sandbox" por "não roda" para parte do público. Ficou como está, declarado, com a decisão
registrada nas pendências; quem quiser o sandbox hoje roda o arquivo do AppImage direto, e um
`.deb`/`.rpm` resolveria de vez porque a instalação pode aplicar `4755` no auxiliar.

**Ícone.** `build/icon.png`, 1024×1024, versionado. O electron-builder deriva `.ico` e `.icns`
dele. Sem esse arquivo ele usa o ícone do Electron — que é o que aparecia no instalador. A pasta se
chama `build/` porque esse é o `buildResources` padrão da ferramenta; convive com `dist/`,
`dist-electron/` e `instalador/`, que são saída, e ela não é.

## Banco de múltipla escolha

`npm run build:questions` deriva o banco do material já verificado e grava um arquivo por área em
`src/content/questions/`. São **608 itens em 18 áreas**, e nenhum deles é prosa nova: todos saem da
**tabela de erros comuns** de um tema. O banco tem uma origem só, e a revisão item a item está
completa: **608/608 `verificado`**, nenhum `pendente`, nenhum `rascunho`.

| Origem | Itens | De onde sai |
|---|---|---|
| `erro-comum` | 608 | Cada linha da tabela de erros comuns de um tema: o `correto` é o gabarito, a justificativa é o `porque`, e os distratores saem das outras linhas do **mesmo tema** — as duas colunas, `equivoco` e `correto` |

No domínio, a origem é um tipo de um valor só: `OrigemDaQuestao` é `'erro-comum'`, e o gate recusa
qualquer outra — a lista fechada guarda a porta contra a origem que saiu.

O enunciado sai de uma moldura fixa, e a moldura teve de ser corrigida no gerador: onde a célula do
material já trazia aspas, elas saíam duplicadas na tela; e onde a célula é prescrição sem sujeito
("Automatizar primeiro a ação mais visível"), a frase ficava agramatical. Agora o gerador tira as
aspas da célula ao citá-la e troca a moldura por `é comum ouvir o seguinte: "…"` quando a célula
abre com verbo no infinitivo — a mesma pergunta no fim, "Qual é a correção?", porque o que o item
pede é a correção do equívoco.

**As perguntas discursivas do material não entram no banco, por decisão do dono.** Os pares de
recuperação ativa do tema e os itens de checkpoint do guia da área tinham origem própria
(`recuperacao` e `checkpoint`: 389 dos 997 itens do banco anterior, que também eram gravados em
`src/content/questions/`): uma revisão item a item, feita por dois revisores independentes, mostrou o
defeito de fundo dos dois. **Ali a pergunta do material é aberta** — "Cite os seis modos de falha…",
"Explique por que…" —, então **nenhuma alternativa é "a resposta"**, e a correta só se reconhece pela
forma da frase. O item parece de múltipla escolha e mede outra coisa: quem responde acerta pelo jeito
do gabarito, não por saber. Os 608 itens de erro comum passaram na mesma revisão: o enunciado cita um
equívoco que o próprio material documenta e as alternativas são células da mesma tabela.

**O que saiu foi só o ITEM.** A recuperação ativa e o checkpoint continuam inteiros no material e na
tela, que é onde as perguntas discursivas vivem: a recuperação é a seção 10 de cada tema, exibida na
página do tema com o gabarito atrás do botão "Revelar resposta" e o veredito que agenda a revisão; o
checkpoint é a seção 9 de cada guia de área, exibido na página da área com veredito por item e o
critério de aprovação declarado. Os dois vêm do mesmo `content.json` que alimenta o resto do app, e
nunca passam pelo gerador de itens — `check:content` continua exigindo pelo menos 2 itens de
recuperação em cada tema e pelo menos 1 par de checkpoint em cada guia. Nada disso virou item, e
nada disso saiu da tela.

Nenhum distrator é inventado, e nenhum vem de fora do material: os candidatos são sempre texto do
próprio tema, como pede a §7 do plano. Dali o gerador fica com os três mais próximos do gabarito em
comprimento, e essa é a defesa mais barata que existe contra um item respondível por contagem de
letras. Com só os `equivoco` no conjunto — curtos, contra um `correto` que explica —, a alternativa
certa era a mais longa em 79,4% dos itens; com as duas colunas no conjunto, caiu para 28,8% (175 dos
608), e o que sobra é assimetria das colunas do material, não do gerador.

A regra que sustenta tudo isso está no §7 do plano: o repositório proíbe afirmação sem fonte
(`CONTRIBUTING` §4), então cada item aponta para o tema de origem (`ref`) e carrega a fonte herdada
dele. O que o gerador faz é semear; quem promove um item de `rascunho` para `verificado` é uma
pessoa, e o app marca na tela o que ainda não passou por isso.

A justificativa segue a mesma ideia: em item de erro comum ela é o `porque` da linha, e o gate
reprova o item que chega sem ela — é a razão que o material documenta, a única coisa do item além
das alternativas que explica a correção. Antes havia item com justificativa vazia por decisão (a
resposta do par de recuperação era o gabarito e não havia coluna de "por que isto está errado"); essa
situação deixou de existir junto com as duas origens, e o campo passou a ser obrigatório para todo
item do banco.

**O status de revisão sobrevive à regeração — enquanto o texto não muda.** Os arquivos são
versionados justamente por isso: o gerador reencontra os itens pelo `id` e traz o status de volta,
em vez de zerar a revisão a cada build. Só que o `id` é a **posição** da linha de origem
(`<tema>#E01` é a primeira linha da tabela de erros comuns), não o texto dela, e quem revisou
revisou um texto. Por isso o gerador compara o resumo do item de agora com o do item que estava no
arquivo. Se o resumo muda — a linha foi corrigida, ou uma linha entrou no meio da tabela e deslocou
os `id` seguintes —, o item volta a `rascunho` e o build diz quantos perderam o selo. Perder a
revisão é o lado certo do erro; mantê-la sobre um texto que ninguém leu seria o app afirmando uma
auditoria que não houve.

O gabarito também não fica sempre na mesma posição — há uma invariante no gate para isso, porque se
a correta fosse sempre a primeira, acertar não mediria nada.

### A tela de Quiz

`#/quiz` é o quiz de todas as áreas; `#/quiz/<areaId>`, o de uma; `#/quiz/<areaId>/<temaId>`, o de um
tema. O escopo também se troca no seletor do topo, sem sair da tela, e o botão "Praticar este tema",
no fim de cada tema, abre a rodada dele. Cada rodada sorteia 10 itens com semente determinística: a
lista não se remexe quando a resposta é gravada, e a ordem põe primeiro o que nunca foi respondido,
depois o que mais errou.

Responder é marcar uma alternativa e confirmar. Depois disso a questão trava, e o veredito traz o
acerto ou o erro, a alternativa correta, a justificativa do material — todo item do banco tem uma,
porque é o `porque` da linha da tabela —, a fonte com link e a volta ao tema de origem. O `ref` de
todo item é de tema (`area#TEMA-NN`): a convenção `#GUIA`, que servia ao item de checkpoint, saiu do
`linkTema` junto com as discursivas, e não há item de guia para linkar. O item que ainda não passou
por revisão humana leva selo: **não revisado** para `rascunho`, **em revisão** para
`pendente`. `verificado` não leva nada — marcar todo item apagaria a diferença entre o revisado e o
resto. Hoje nenhum item leva selo, porque os 608 estão `verificado`; o mecanismo continua no lugar
para o dia em que uma linha do material mudar: o item volta a `rascunho` e o selo aparece sozinho.

**O quiz não mexe no domínio nem na fila de revisão.** O que ele grava é o resultado do item
(acertos, erros e a última resposta) e o dia como dia com estudo. Errar no quiz não rebaixa assunto
nenhum: quem reagenda o tema é a recuperação ativa dele, e a própria tela diz isso ao fim da rodada.

A leitura do banco fica em `src/ui/useBanco.ts`, acontece uma vez por sessão e só quando a tela
monta. Se o arquivo faltar, o quiz diz o comando que o gera e o resto do aplicativo continua
funcionando.

### Como promover um item

O banco nasce inteiro em `rascunho`. A promoção é manual, item a item, e o que a mão humana guarda
no JSON é o campo `status` — o texto do item não se corrige ali: o gerador o regrava a partir do
material, e o gate reprova arquivo cujo texto não bata com a derivação.

1. Abra `app/src/content/questions/<area-id>.json` e ache o item pelo `id`.
2. Confira a **fonte herdada contra a linha de origem**. O `ref` diz qual é o tema, e o link do quiz
   leva até lá. Compare enunciado, gabarito e justificativa com a linha da tabela de erros comuns que
   gerou o item: é a auditoria de citação do `CONTRIBUTING` §4, com uma ressalva a registrar — a data
   de acesso não vem junto, porque a fonte herdada não a carrega.
3. Escreva `pendente` enquanto a conferência está aberta e `verificado` quando ela fecha. Se a linha
   de origem mudar depois, não há o que desfazer: o próximo `build:questions` derruba o item a
   `rascunho` sozinho, e diz quantos perderam o selo.
4. Rode `npm run check:questions` — ou `npm run preparar:conteudo`, que já o inclui — e commite o
   JSON.

Não há uma origem para começar: são todos itens do mesmo material, a tabela de erros comuns do tema.

## Checagens do plano (O1–O8 e S1–S14)

O §16.3 do plano diz que cada item vira linha aqui, com o número medido, ou não conta como feito.
Esta é a tabela — e a coluna "medido" é a que diz o que ainda falta, não a "implementado".

| Item | Implementado | Medido | Evidência |
|---|---|---|---|
| O1 arranque | — | **sim: 1ª pintura 338 ms, DOMContentLoaded 296 ms** | `npm run medir` |
| O2 sem tela branca (`show:false` + `ready-to-show`) | sim | sim: o aviso "Carregando o roadmap…" sai quando a carga termina | `medir`, `main.tsx` |
| O3 bundle dividido | **sim** | sim: 935 kB de script no arranque, contra 7,84 MiB inlinados | `vite.desktop.config.ts` |
| O4 só o `flowchart` do Mermaid | **sim** | sim: 35 chunks de outros diagramas removidos; desenhar puxa 8 | `vite.desktop.config.ts`, `medir` |
| O5 memória após navegações | — | sim: heap de 11 MB na primeira tela, 16 MB com o diagrama | `medir` |
| O6 diagramas por tela | — | sim: 1 por tema | `medir` |
| O7 tamanho do instalador | — | sim: AppImage 104,0 MiB (109.006.365 bytes) — medição de antes do banco, a repetir no próximo `distribuir` | acima |
| O8 decisão sobre XP/nível/sequência | — | sim (removidos, com o motivo) | `progresso.test.ts` |
| S1 prefs endurecidas | sim | parcial: `allowRunningInsecureContent` não é assertado | `smoke-desktop.mjs` |
| S2 ponte por allowlist | sim | sim | `smoke-desktop.mjs` |
| S3 link externo só `http(s)` | sim | sim | `smoke-desktop.mjs` |
| S4 sem `webview`/janela nova | sim | sim | `smoke-desktop.mjs` |
| S5 CSP como cabeçalho | sim | sim — e o desktop passou a `script-src 'self'`, sem `unsafe-inline` | `smoke-desktop.mjs` |
| S6 o que cruza a ponte passa pelo normalizador | sim | sim — recusa e corte nos dois sentidos da ponte (escrita e leitura) | `smoke-desktop.mjs` |
| S7 corte antes do `JSON.parse` | sim | sim — teto de 1 MB, provado com um arquivo válido acima dele | `smoke-desktop.mjs` |
| S8 importação com esquema e cópia campo a campo | sim | sim | `progresso.test.ts`, `persistencia.test.ts` |
| S9 nenhuma requisição de rede | sim (`connect-src 'self'`, que é `app://`) | sim, com controle positivo (servidor local que responde) | `smoke-desktop.mjs` |
| S10 permissões negadas | sim | sim — a checagem do pedido e a da consulta | `smoke-desktop.mjs` |
| S11 fuses e integridade do asar | sim | sim | `fuses.mjs`, `smoke-pacote.mjs` |
| S12 travessia e host bloqueados | sim | sim | `smoke-desktop.mjs`, `smoke-pacote.mjs` |
| S13 cadência de patch do Electron | decisão registrada | — | pendências, fase 7 |
| S14 assinatura | decisão registrada | — | pendências, fase 7 |

Os números saem de `npm run medir`, no aplicativo **empacotado**, e não de um build de
desenvolvimento — é ele que a pessoa recebe. O que ainda falta são as medições que exigem uso
prolongado (memória depois de 20 navegações, por exemplo).

As seis asserções de segurança que faltavam saíram da lista: S2, S4, S6, S7, S9 e S10 são medidas em
`scripts/smoke-desktop.mjs`, em 18 asserções novas, e cada uma tem prova de falsificabilidade por
mutação — desligada a proteção de propósito, a asserção reprova. A de S9 precisou de controle
positivo: um servidor local que responde, alcançado pelo próprio teste antes de o renderer tentar o
mesmo endereço; sem ele, "nenhuma requisição chegou" passaria por ausência de tentativa.

O banco de múltipla escolha não tem linha nesta tabela porque não tem item aqui para medir: a §16.3
é do desktop, e a fase 5 é da §13 do plano. O que ela produziu tem portão próprio
(`check:questions`), teste próprio (domínio, gerador e gate do banco) e um lugar próprio para as
contas que ainda faltam — as pendências.

A via da pasta com atalho (`npm run empacotar`) **tem portão automático**: o `npm run smoke:pasta`
monta a pasta, sobe o `servidor.py` numa porta efêmera (a 4173 de produção nunca é ocupada), confere
200 em `/` e em `/index.html`, 404 para os caminhos que não sejam o arquivo único, 501 num POST, 421
com `Host` estranho, a CSP vinda no cabeçalho e o `index.html` da pasta byte a byte igual ao do
build — e encerra o processo no `finally`, conferindo que a porta voltou a ficar livre. Ele entrou no
`npm run verificar`.

## Como o app chega a quem estuda

Duas vias, com o mesmo renderer e sem progresso compartilhado entre elas:

| Via | Como se produz | O que a pessoa recebe |
|---|---|---|
| Aplicativo desktop | `npm run distribuir:<sistema>` | um instalador ou AppImage; abre com duplo clique |
| Pasta com atalho | `npm run empacotar` | uma pasta; clica em **Iniciar** e o navegador abre |

A segunda existe para quem não quer instalar nada:

```
Roadmap-CISO-Interativo/
  Iniciar-Windows.bat     Iniciar-macOS.command     Iniciar-Linux.sh
  servidor.py             index.html                LEIA-ME.txt
```

Os três atalhos fazem a mesma coisa em sistemas diferentes: procuram Python. Se houver, sobem
`servidor.py`; se não houver, abrem o `index.html` direto, que também funciona.

**Por que o servidor, se o arquivo sozinho já abre.** Dois motivos. O progresso fica no
armazenamento do navegador, que separa por endereço — com um servidor em `127.0.0.1:4173` o
endereço é sempre o mesmo, e o estudo de ontem continua hoje; aberto por `file://`, o Chrome deixa
qualquer arquivo local ler a mesma chave, e o Firefox isola por arquivo, então o progresso muda de
lugar conforme o navegador. E o `servidor.py` serve **um arquivo só**, recusa `Host` estranho com
421 e nunca lista diretório: travessia e listagem ficam fechadas por construção.

A porta é fixa de propósito. Porta aleatória mudaria o endereço a cada abertura e o progresso
sumiria — o que é pior do que o risco de outro processo local disputar a porta. Se a 4173 estiver
ocupada, o servidor avisa e o atalho cai no `file://`, que funciona, só não continua no mesmo lugar.

Dois detalhes de sistema: no macOS, o `.command` precisa de duplo clique e, na primeira vez, do
aceite no Gatekeeper; no Windows, o `.bat` está em CRLF, que é o que o `cmd.exe` espera.

## O motor pedagógico

`app/src/domain/` não sabe nada de React nem de navegador: são funções puras sobre o estado do
estudo, todas com teste. Separei o que vem do material do que é decisão desta implementação,
porque essa diferença importa para julgar o resultado.

| Módulo | O que decide | Origem |
|---|---|---|
| `srs.ts` | intervalos D+1, D+7 e D+30; acerto avança, erro rebaixa (30→7, 7→3, 1→1) | **do material**: §11 de cada tema e §5.2 do TEMA-05 de 00 |
| `criterio.ts` | lê o critério de aprovação que o guia publica em prosa | **do material**: campo `criterio` de cada guia (`4 dos 5`, `80%`) |
| `progresso.ts` | estado do estudo, dias com estudo e a escala de confiança do pré-teste | **decisão daqui** — o material não descreve formato de estado |
| `dominio.ts` | tema "firme" = última recuperação ativa acertada sem consulta | **decisão daqui** |

**Não há XP, nível, faixa nem sequência de dias.** Houve, e saiu: a seção 8 do
`conteudo/CONTRIBUTING.md` pede "marcos e autoavaliação; sem gamificação artificial", e todo insumo
do placar era um clique do próprio usuário — não existe item objetivo no app, então ele media
botões apertados, não aprendizagem. A faixa mais alta se chamava "CISO", que o material trata como
designação formal (Resolução CMN 4.893/2021, art. 7º), não conquista. Ficaram as quatro coisas
acionáveis ou verificáveis, cada uma exibida com a régua ao lado: a **fila de hoje** (com link para
cada tema), os **temas firmes**, os **checkpoints aprovados** no critério que o guia declara e os
**dias com estudo**.

A **calibração** saiu pelo mesmo motivo: cruzar a confiança declarada com o desfecho do tema mede
ruído, porque as perguntas do pré-teste não são as da recuperação ativa. Medir calibração de verdade
exige desfecho por item, que o §11 de cada tema descreve e o app ainda não captura.

**Posse do calendário.** O material declarava `conteudo/91-trilhas/` como dona do calendário e do
estado. Resolvido nos dois lados: a trilha fica com a **definição** — cadência, regra de
rebaixamento e formato do registro —, o app guarda o **estado em runtime**, e o
`CONTRIBUTING.md` §3 registra a divisão. O gate reprova o build se algum tema declarar
`revisao_inicial_dias` diferente da sequência implementada, para o app não mentir sobre o intervalo
lido do material.

O XP era **derivado**, o que continua valendo para o que ficou: a mesma função sobre o mesmo estado
devolve sempre o mesmo resultado. O veredito da recuperação é registrado uma vez por passagem;
repetir o clique não avança a escada — a passagem seguinte se abre de forma explícita.

`app/scripts/lib/` guarda o parser e o gate como funções puras, para serem testados com fixtures
pequenos. `gerar-conteudo.test.ts` fecha o contrato: parseia o material real e exige `validar()`
vazio com os totais 18/109/22.

## Do Markdown para o JSON

`app/scripts/build-content.ts` percorre `conteudo/`, trata as pastas `NN-slug` como áreas e ignora
`90-`, `91-` e `99-`, que são catálogos. De cada área lê o `README.md` (o guia) e cada `TEMA-*.md`. O
corpo é fatiado nos cabeçalhos `## N. Título`, convertido de Markdown para HTML e sanitizado com
DOMPurify, com `details` e `summary` liberados porque é isso que faz o gabarito recolhido funcionar.
Dali saem o pré-teste (seção 3), a recuperação ativa (seção 10), a tabela de erros comuns (seção 9),
o checkpoint do guia e as tabelas de objetivos, temas e atividades.

O resultado é `app/src/content/generated/content.json`: 18 áreas, 109 temas, 22 páginas, 3,89 MB.
Arquivo gerado, não editável à mão; cada `build:content` o sobrescreve por inteiro.

Nenhuma seção do Markdown é reescrita pelo app. Corrigir um parágrafo significa corrigir em
`conteudo/` e regerar o JSON. O Markdown é a fonte única da verdade e o app é leitor, não autor.

`conteudo/` está versionado, então um clone já traz o material inteiro e o `build:content` roda
direto. O que não vai para o controle de versão é o derivado: `app/src/content/generated/` e
`app/dist/`. O banco de questões é a exceção entre os derivados — `app/src/content/questions/` vai
**com** o controle de versão, porque a revisão humana mora no campo `status` de cada item e precisa
sobreviver à próxima regeração. Dentro de `conteudo/` há dois diretórios de ferramenta ignorados,
`.commandcode/` e `.playwright-mcp/`, que não são material de estudo.

## O que reprova o build

`app/scripts/check-content.ts` guarda três números fixos no código, 18, 109 e 22, e compara com os
totais do JSON gerado. Depois percorre cada tema e cada guia. Erra o build quem:

- tiver contagem de áreas, de temas ou de páginas diferente de 18, 109 e 22, ou `meta.totais`
  divergente dos dados;
- chegar com o `content.json` de antes do material: o gate regera o conteúdo a partir de `conteudo/`
  e compara, então editar um tema sem `npm run build:content` reprova;
- perder o bloco "Por que isso importa" (a ancoragem no cargo do CISO);
- perder a seção "Recuperação ativa", ou ficar com menos de 2 itens nela;
- publicar item de recuperação sem gabarito, ou seção sem HTML;
- chegar com título, nível, tempo estimado ou objetivo de aprendizagem vazio;
- chegar sem `fontes` no frontmatter, ou com fonte sem url/tipo;
- ficar sem a tabela de erros comuns;
- zerar o pré-teste;
- apontar relação para tema inexistente, para alvo sem `#` ou sem `motivo`;
- deixar guia de área sem checkpoint, ou com checkpoint sem gabarito ou sem critério declarado;
- declarar um critério que o parser não entende (o limiar deixaria de ter régua);
- declarar `revisao_inicial_dias` diferente da sequência que o escalonador implementa;
- usar qualquer uma das 12 expressões do léxico proibido, em tema, guia ou página;
- usar `ref` diferente da chave do mapa, `tema_id` que não fecha com o `ref`, ou `area_id` que não
  existe — o progresso é gravado sob o `ref`, então divergir faz o usuário marcar "acertei" e o
  painel mostrar zero firmes;
- listar no guia um tema de outra área (o tema entraria na conta de "firmes" das duas);
- repetir o número de uma seção, ou publicar página com `grupo` desconhecido (some da navegação);
- deixar `meta.geradoEm` fora do formato ISO, ou `ordem_estudo` com ref a mais, a menos ou repetida;
- publicar fonte sem título, área sem ancoragem, ou rótulo de Mermaid com `<`, `>`, `"`, `(`, `)` ou
  `#` — os mesmos caracteres que o verificador do material recusa, porque os dois leem o mesmo
  contrato: o bloco `contrato-mermaid` da §7 do `conteudo/CONTRIBUTING.md`.

O gate imprime `verificado: 18 areas, 109 temas, 22 paginas` quando passa. Quando falha, lista cada
erro e sai com código 1, o que derruba o `npm run build` antes de o Vite entrar em ação.

**O banco tem o gate dele, e ele roda no mesmo `preparar:conteudo`.** `app/scripts/check-questions.ts`
reprova o item que aponta para `ref` que não existe ou fica em área diferente da do `ref`; que chega
sem fonte, com esquema que não é `http(s)`, sem enunciado, sem justificativa ou com `status` fora dos
três; que tem menos de três alternativas, alternativa repetida ou vazia, ou `correta` fora da lista;
que tem `id` fora do padrão `area#TEMA-NN#E<nn>`; e que repete `id` ou cai no léxico proibido.
Reprova também o banco editado à mão: cada item em disco é comparado com o que o material deriva
agora, e a única diferença tolerada é o `status`. No conjunto, reprova o gabarito concentrado na
primeira alternativa — fora da faixa de 15% a 45%, a posição vira pista. O gate imprime `verificado:
608 itens em 18 areas — 0 erro(s)` quando passa.

## Por que existe um `.npmrc` aqui dentro

O npm configurado nesta máquina define `omit=dev` no nível do usuário, e essa opção pula as
devDependencies. Vite, TypeScript, `tsx`, `gray-matter`, `markdown-it` e `dompurify` vivem todas ali.
O sintoma é cruel: o `npm install` termina dizendo sucesso e o build morre em `vite: command not
found`.

O arquivo `app/.npmrc` inverte a omissão só neste projeto, com uma linha: `include=dev`. Ele precisa
continuar existindo. Se desaparecer, o caminho alternativo é `npm install --include=dev`.

## Onde o progresso mora

No aplicativo desktop, num arquivo: `progresso.json`, na pasta de dados do app. Na versão de
navegador, no armazenamento local — **local e não confidencial**: em `file://` no Chrome, todos os
arquivos HTML locais compartilham a mesma chave, e qualquer página local do mesmo perfil enxerga o
mesmo dado; no Firefox o balde é por arquivo. Não guarde nada sensível ali.

Exportar, importar e recomeçar existem nos dois, no painel e no menu do desktop. As duas vias não
compartilham progresso direto: o **arquivo exportado** é a ponte.

## Pendências conhecidas

Levantadas nas revisões de segurança, de testes, de frontend e de UI/UX, com a fase em que entram. O
que já fechou continua aqui, com a razão registrada, para o estado não se perder.

| Pendência | Fase |
|---|---|
| **4.3 — pronto no Linux.** O `electron-builder` está configurado, o AppImage sai com 104,0 MiB (O7) e os sete fuses entram e são conferidos. Faltam os alvos que esta máquina não produz: `.dmg`/`.zip` (precisa de um Mac) e NSIS + portátil (precisa de `wine` ou de um Windows). O `.deb` saiu da configuração por decisão | 4.3 |
| **4.4 — feito.** Bundle dividido, conteúdo como arquivo, 35 chunks de outros diagramas fora e a CSP do desktop sem `'unsafe-inline'`. Os números estão na tabela acima e na seção "Checagens do plano" | 4.4 |
| **Viés de comprimento do gabarito**: a alternativa correta é a mais longa em 175 dos 608 itens (28,8%), na medição do banco de agora. Era 79,4% enquanto só os `equivoco` da tabela eram candidatos a distrator — curtos, contra um `correto` que explica; a escolha passou a incluir as duas colunas do tema. Falta decidir se o patamar de agora é aceitável, porque é assimetria das colunas do material e não defeito de código | 5 |
| **As perguntas discursivas saíram do banco, por decisão do dono.** A recuperação ativa do tema (seção 10) e o checkpoint do guia da área (seção 9) **continuam inteiros no material e na tela**, com veredito — são o exercício principal de cada um —, e não viram item: a pergunta é aberta, e nenhuma alternativa seria "a resposta". O banco ficou com 608 itens, todos da tabela de erros comuns. Fechada — o que ficou de fora está dito em "Banco de múltipla escolha" | — |
| **As fontes herdadas pelo banco não têm data de acesso**: o `CONTRIBUTING` §4 exige URL **e** data, e o item carrega título, URL e tipo. Enquanto a herança não trouxer `acessadoEm`, o item não fecha a auditoria de citação sozinho | 5 |
| **A revisão humana fechou: 608/608 `verificado`**, nenhum `pendente`, nenhum `rascunho`. O procedimento de promoção continua na seção "Como promover um item" e o gate segue aceitando os três status; o que não existe é onde contar os que faltam, porque não falta nenhum. Fechada | — |
| **O quiz tem escopo por área e por tema**: `#/quiz` (todas as áreas), `#/quiz/<areaId>` e `#/quiz/<areaId>/<temaId>`, com o botão "Praticar este tema" na página do tema. As três rotas entram na matriz do `smoke` e nos `hrefsInvalidos`. Fechada | — |
| **As duas CSPs restantes não são pendência, são consequência.** O `<meta>` do build de navegador e o cabeçalho do `launcher/servidor.py` aceitam `script-src 'unsafe-inline'` porque os dois servem **um arquivo único com script inline** — o formato que `file://` exige. Não há como apertá-las sem dividir o bundle, e dividir quebraria o duplo clique. O desktop, que pode dividir, já roda em `'self'`. Fechada | — |
| **S2, S4, S6, S7, S9 e S10 saíram da lista**: as seis são medidas em `scripts/smoke-desktop.mjs`, em 18 asserções novas com prova de falsificabilidade por mutação. A tabela do §16.3 ficou inteira no que dependia de teste. Fechada | — |
| Os 1328 links relativos (`../README.md`, `TEMA-*.md`) ficam mortos no arquivo único: precisam ser reescritos para as rotas do app. Os 586 externos abrem normalmente | 6 |
| Regras do material ainda não implementadas: "duas passagens falhas seguidas mandam para releitura completa" (`plano-12-meses.md`), revisão além de D+90, a tarefa concreta de cada intervalo, a coluna "Artefato produzido" do registro e o diagnóstico por item (hoje é um booleano por tema) | 6 |
| O **escopo do critério na trilha de 90 dias** (`plano-90-dias.md` §7 recomenda que só os itens 1 e 2 de 02 contem) não é aplicado pelo app, que usa o critério do guia inteiro. O dono do critério já está declarado (`CONTRIBUTING` §3: o guia da área); falta decidir se a trilha é recomendação de escopo ou régua própria | 6 |
| `glossario.md` e `mapa-relacoes.md` usam `## Título` sem número e caem inteiros no `intro`, sem seções; o glossário não é navegável por termo | 6 |
| A fila de hoje é clicável, mas só lista os cinco primeiros: falta paginar ou abrir a lista inteira | 6 |
| Os vereditos por item do checkpoint vivem em `useState`: o total persiste, mas após recarregar os botões voltam em branco, com o texto dizendo "último resultado registrado" | 6 |
| **`npm run dev` funciona**: a CSP saiu do `index.html` e é injetada por plugin do Vite só no build (`apply: 'build'`), então o `<script src>` do dev não é bloqueado. Fechada | — |
| **Diagramas: botão "Ampliar" e `aria-label` no SVG** entregues (`src/ui/mermaid.ts`), e o cabeçalho das tabelas longas ficou `position: sticky` (`src/styles.css`). Fechada | — |
| **Escala de confiança do pré-teste**: as pontas ganharam rótulo ("chutei" e "certeza"), os alvos têm 44 px (48 px no dedo) e o `tabIndex` virou itinerante — 5 paradas no bloco, uma por item, em vez de 25. Fechada | — |
| **Acessibilidade**: `document.title` por rota, foco no `main` na troca de rota, link "pular para o conteúdo" como primeiro alvo de tabulação e alvos de 44 px (48 px no celular). Fechada | — |
| **Tema escuro segue `prefers-color-scheme`** no modo "sistema" (`data-theme="auto"` + `light-dark()`), e a tela de carregamento pinta a cor certa antes do bundle. Fechada | — |
| As páginas longas ganharam sumário com âncoras (o mapa de relações é a maior); o que segue aberto é o menu: as 6 páginas de `99-fontes/` aparecem para o aluno, mas são a trilha de QA do mantenedor | 6 |
| Sobre o JSON: **253 kB (6,6% do `content.json`) são HTML duplicado** das seções 3 e 10 dos temas — a tela remonta os dois blocos de `preTeste`/`recuperacao`, e o que só existe no HTML é boilerplate que o app reescreve, não prosa órfã. O `errosComuns` (144.591 bytes, 608 linhas) **saiu desta linha**: virou item de quiz, com as três colunas na tela, uma por linha de tabela. E há 3,4 MB de bundle do Mermaid para 69 diagramas que são todos `flowchart` | 6 |
| O contrato de rótulo do Mermaid era triplicado, e uma das cópias já estava para trás. Agora tem uma fonte só: o bloco `contrato-mermaid: {...}` da §7 do `conteudo/CONTRIBUTING.md`, lido pelo verificador do material e por `app/scripts/lib/contrato-mermaid.ts`, que falha alto em vez de cair num padrão embutido. A prosa da §7 tem de concordar com o bloco, e nenhuma ficha pode manter cópia. Fechada | — |
| O contrato de re-render do Mermaid continua na `key` do React, repetida em `ThemeView`, `AreaView` e `Blocos`, e o laço de seções segue triplicado | 6 |
| **O verificador do material fechou os pontos cegos.** `conteudo/scripts/verificar-repo.py` roda os nove sincronizadores em `--check` e exige a linha de conclusão `CHECK <script> <n>` de cada um (sem ela, erro); reprova o léxico da §5 como **erro** (o `&` continua permitido — `ATT&CK` na área 12 prova); confere as cinco fichas de `templates/` contra o esquema do `FRONTMATTER.md` e confere o próprio `CONTRIBUTING` nos dois sentidos — o que ele promete existe e o que existe está documentado. Ele assina o material com sha256 antes e depois, então `--check` não pode escrever. Roda de dentro de `conteudo/`, e o repositório não tem `scripts/` na raiz. Fechada | — |
| O desktop carrega um **Chromium 130, fora de linha** (Electron 33). O `npm audit` acusa 1 crítica e 13 altas, e a leitura correta é: as de `tar`, `node-gyp` e `app-builder-lib` são de ferramenta de build e não entram no pacote (o `asar list` prova: 4 arquivos, zero `node_modules`); mas o **`electron` é dependência direta e o runtime está embarcado**, com 33 advisories que tocam justamente o que a casca anuncia — *context isolation bypass* (`GHSA-h7rp-cf8h-j98x`), *sandboxed iframe allow-popups bypass* (`GHSA-9f4c-93c8-jc8g`) e *ASAR integrity bypass* (`GHSA-vmqv-hx8q-j7mg`), este último **não mitigado no Linux**, onde a integridade do asar não é verificada. Subir de major e declarar cadência de patch | 7 |
| O `.desktop` do AppImage abre com `--no-sandbox` (padrão do electron-builder), então a via do menu de aplicativos roda sem o sandbox do Chromium. Decidido manter, para o app não abortar em distros que restringem user namespaces. **Testar em Ubuntu 24.04 antes de distribuir** e reabrir a decisão, ou trazer de volta um `.deb`/`.rpm`, onde o auxiliar pode ser 4755 | 7 |
| O desktop só foi exercitado no Linux. Falta abrir num Windows e num macOS de verdade | 7 |
| SBOM e soma de verificação por release; o `package-lock.json` já cobre electron, electron-builder e playwright | 7 |
| **A camada de interface tem teste de componente**: `@testing-library` + `jsdom` num segundo projeto do Vitest (`vitest.config.ts`), e `src/ui/Progresso.test.tsx` exercita exportar e importar **pelo componente** — inclusive importar inválido sem sobrescrever o progresso e a ponte que rejeita. Fechada | — |
| O caminho de exportar/importar **do navegador** (Blob, `<input type=file>`, corte de 1 MB no arquivo escolhido) não tem teste; o cancelamento do diálogo deixa a promise pendente | 6 |
| O gate é um subconjunto do `conteudo/scripts/verificar-repo.py`: ainda não confere `<details>` do gabarito, links internos entre arquivos, formato de datas e coerência da tabela de tempos | 6 |
| **A via da pasta com atalho tem portão**: `npm run smoke:pasta` monta a pasta, sobe o `servidor.py` numa porta efêmera, confere 200/421/404/501 e a CSP pelo fio, e encerra no `finally`. Entrou no `npm run verificar`. Fechada | — |
| O `.gitattributes` promete CRLF para `*.bat`, mas o arquivo no repositório está em LF — a conversão de verdade é a do `empacotar.mjs`, e ela **não pode ser removida** achando que o git resolve | 6 |
| Os smokes dependem de `google-chrome-stable` no PATH e de sessão gráfica para o Electron; nada disso está em CI, porque CI não existe | 7 |
