# App de estudo do roadmap CISO

Este repositório tem 18 áreas, 109 temas e 3 trilhas de estudo em Markdown. O app lê esses arquivos
e devolve o mesmo texto numa aplicação que abre com duplo clique, sem servidor no meio. O código
mora em `app/`; o material continua em `conteudo/`, e é de lá que ele vem, sempre.

## O que a aplicação faz

A tela inicial é o painel, com as 18 áreas na ordem de `ordem_estudo`. Cada linha traz o nome da
área, o nível (`base`, `intermediario` ou `avancado`) e a contagem de temas. Do painel se chega a
todo o resto: guia da área, temas, glossário, mapa de relações, as 3 trilhas (90 dias, 12 meses, 24
meses), certificações por fornecedor e o índice de fontes.

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
| `npm run check:content` | valida o JSON já gerado e falha o processo quando algo falta |
| `npm test` | roda a suíte do Vitest: parser, gate e motor pedagógico |
| `npm run dev` | roda `build:content` e sobe o Vite com recarga automática |
| `npm run build` | gera o conteúdo e produz o build do navegador, em arquivo único |
| `npm run build:desktop` | produz o build do desktop em `dist-desktop/` (usa o conteúdo já gerado) |
| `npm run preparar:conteudo` | lê `conteudo/` e valida o JSON gerado — roda uma vez por verificação |
| `npm run medir` | mede O1, O2, O4, O5 e O6 no aplicativo empacotado |
| `npm run typecheck` | roda o `tsc --noEmit`; o Vite apaga tipos sem conferi-los, então isto precisa existir separado |
| `npm run verificar` | **o portão do dia a dia**: build, build do Electron, testes, os dois smokes do código e o verificador do material — **não empacota nem testa o pacote** |
| `npm run verificar:pacote` | empacota e roda o smoke do pacote — o portão de quem vai distribuir |
| `npm run smoke` | abre o artefato por `file://` num Chrome headless e confere o DOM renderizado |
| `npm run build:electron` | compila o processo principal e o preload para `dist-electron/` |
| `npm run desktop` | build completo e abre o aplicativo desktop |
| `npm run smoke:desktop` | abre a janela de verdade e confere a casca, o protocolo, o progresso em arquivo e o bloqueio de navegação |
| `npm run distribuir:<sistema>` | empacota com o `electron-builder`: AppImage, NSIS ou `.dmg`/`.zip` |
| `npm run smoke:pacote` | abre o **app empacotado** por CDP e confere os fuses, o asar e o progresso |
| `npm run verificar:pacote` | empacota e roda o smoke do pacote — o portão de quem vai distribuir |
| `npm run empacotar` | monta a pasta que vai para quem estuda: `dist/Roadmap-CISO-Interativo/` (roda o `build` antes) |
| `npm run test:watch` | a suíte em modo observador |
| `npm run preview` | sobe o Vite servindo o `dist/` para inspeção |

A ordem tem uma dependência real: `check:content` lê o JSON em disco, então sozinho ele não adianta
nada. O `dev` também não vigia `conteudo/`. Editou um tema com o servidor no ar? Rode
`npm run build:content` de novo e a página recarrega com o texto novo.

**Os três smokes conferem o frescor do artefato antes de rodar.** Eles comparam a data de
`dist/index.html` e de `dist-electron/main.cjs` com a da fonte mais nova; se o binário for anterior,
o teste falha dizendo o que rodar, em vez de medir código que não está lá. Isso não é teoria: o smoke
do desktop passou verde contra um `main.cjs` compilado antes das correções de segurança da casca, e
as asserções de travessia, host e CSP — que existem hoje — só foram exercitadas de verdade depois de
recompilar. Por isso o `smoke` exige o build feito antes e o Chrome instalado; em outra máquina,
aponte o binário pela variável `CHROME_BIN`.

## O que sai do build

A build inteira vira um arquivo: `app/dist/index.html`, com 7,6 MB na última execução. Ele abre por
`file://`, roda offline e não pede nada instalado na máquina de quem vai estudar. Esse é o formato
inteiro do produto, e é o motivo de `inlineDynamicImports` estar ligado no `vite.config.ts`: o
Mermaid carrega os tipos de diagrama por `import()` dinâmico e um chunk externo não seria lido a
partir de `file://`.

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
para `file://` e é bloqueado, fecha e **reabre** com o estado no lugar. E exercita o protocolo pelo
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
| Conteúdo | inline no JavaScript (3,8 MB) | `conteudo.json` ao lado (3,79 MiB) |
| Diagramas | todos inlinados (3,4 MB) | só o `flowchart`; 35 chunks de outros tipos são descartados |
| Script no arranque | **7,6 MB** para o V8 analisar | **915 kB** |
| CSP | `<meta>` no HTML, com `'unsafe-inline'` | cabeçalho, `script-src 'self'` |
| Quem usa | launcher (`dist/Roadmap-CISO-Interativo/`) | empacotado pelo electron-builder |

A diferença entre os dois está isolada em `@fonte` (`src/infrastructure/content/fonte-web.ts` e
`fonte-desktop.ts`): o repositório de conteúdo é o mesmo, e o resto do app não sabe de onde o
JSON veio. `carregar()` roda antes da primeira renderização, em `main.tsx`.

O corte dos diagramas é por **tipo**, e não por nome de arquivo — os hashes mudam a cada build,
o prefixo não. A rede de segurança é o `npm run smoke:desktop`, que desenha um diagrama de
verdade: se o corte levar algo necessário, o teste falha em vez de o app aparecer sem o desenho.

## Empacotamento

`npm run distribuir:linux` produz `instalador/Roadmap CISO-0.1.0.AppImage`. O alvo é o
`electron-builder.yml`, e o endurecimento do binário é um `afterPack` (`scripts/fuses.mjs`).

| O que | Medido em 2026-09-26, Linux x64, Electron 33.4.11 |
|---|---|
| AppImage | **104,0 MiB** (109.006.365 bytes) — O7 |
| `app.asar` | 4,89 MiB (5.124.818 bytes): o `conteudo.json`, os 27 assets que sobraram e o `main`/`preload` |
| `dist-desktop/index.html` + assets | 915 kB de JavaScript no arranque, contra 7,6 MB inlinados |
| Pasta desempacotada | 267 MiB — o binário do Electron sozinho tem 177,7 MiB |

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

## Checagens do plano (O1–O8 e S1–S14)

O §16.3 do plano diz que cada item vira linha aqui, com o número medido, ou não conta como feito.
Esta é a tabela — e a coluna "medido" é a que diz o que ainda falta, não a "implementado".

| Item | Implementado | Medido | Evidência |
|---|---|---|---|
| O1 arranque | — | **sim: 1ª pintura 338 ms, DOMContentLoaded 296 ms** | `npm run medir` |
| O2 sem tela branca (`show:false` + `ready-to-show`) | sim | sim: o aviso "Carregando o roadmap…" sai quando a carga termina | `medir`, `main.tsx` |
| O3 bundle dividido | **sim** | sim: 915 kB de script no arranque, contra 7,6 MB inlinados | `vite.desktop.config.ts` |
| O4 só o `flowchart` do Mermaid | **sim** | sim: 35 chunks de outros diagramas removidos; desenhar puxa 8 | `vite.desktop.config.ts`, `medir` |
| O5 memória após navegações | — | sim: heap de 11 MB na primeira tela, 16 MB com o diagrama | `medir` |
| O6 diagramas por tela | — | sim: 1 por tema | `medir` |
| O7 tamanho do instalador | — | sim: AppImage 104,0 MiB (109.006.365 bytes) | acima |
| O8 decisão sobre XP/nível/sequência | — | sim (removidos, com o motivo) | `progresso.test.ts` |
| S1 prefs endurecidas | sim | parcial: `allowRunningInsecureContent` não é assertado | `smoke-desktop.mjs` |
| S2 ponte por allowlist | sim | **não** | `electron/preload.ts` |
| S3 link externo só `http(s)` | sim | sim | `smoke-desktop.mjs` |
| S4 sem `webview`/janela nova | sim | **não** (sem asserção) | `electron/main.ts` |
| S5 CSP como cabeçalho | sim | sim — e o desktop passou a `script-src 'self'`, sem `unsafe-inline` | `smoke-desktop.mjs` |
| S6 o que cruza a ponte passa pelo normalizador | sim | **não** | `main.ts` só recusa o que não é objeto; o normalizador roda no renderer |
| S7 corte antes do `JSON.parse` | sim | **não** | `main.ts` e `electron/progresso.ts` |
| S8 importação com esquema e cópia campo a campo | sim | sim | `progresso.test.ts`, `persistencia.test.ts` |
| S9 nenhuma requisição de rede | sim (`connect-src 'self'`, que é `app://`) | **não** (sem interceptor) | `main.ts` |
| S10 permissões negadas | sim | **não** (sem asserção) | `main.ts` |
| S11 fuses e integridade do asar | sim | sim | `fuses.mjs`, `smoke-pacote.mjs` |
| S12 travessia e host bloqueados | sim | sim | `smoke-desktop.mjs`, `smoke-pacote.mjs` |
| S13 cadência de patch do Electron | decisão registrada | — | pendências, fase 7 |
| S14 assinatura | decisão registrada | — | pendências, fase 7 |

Os números saem de `npm run medir`, no aplicativo **empacotado**, e não de um build de
desenvolvimento — é ele que a pessoa recebe. Faltam as medições que exigem uso prolongado
(memória depois de 20 navegações, por exemplo) e as asserções de S2, S4, S6, S7, S9 e S10,
todas implementadas no código mas não exercitadas por teste.

A via da pasta com atalho (`npm run empacotar`) **não tem portão automático nenhum**: nem o
`verificar` nem teste algum sobe o `servidor.py`. É a única via de entrega sem verificação, e está
registrada nas pendências.

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

O resultado é `app/src/content/generated/content.json`: 18 áreas, 109 temas, 22 páginas, 3,8 MB.
Arquivo gerado, não editável à mão; cada `build:content` o sobrescreve por inteiro.

Nenhuma seção do Markdown é reescrita pelo app. Corrigir um parágrafo significa corrigir em
`conteudo/` e regerar o JSON. O Markdown é a fonte única da verdade e o app é leitor, não autor.

`conteudo/` está versionado, então um clone já traz o material inteiro e o `build:content` roda
direto. O que não vai para o controle de versão é o derivado: `app/src/content/generated/` e
`app/dist/`. Dentro de `conteudo/` há dois diretórios de ferramenta ignorados, `.commandcode/` e
`.playwright-mcp/`, que não são material de estudo.

## O que reprova o build

`app/scripts/check-content.ts` guarda dois números fixos no código, 18 e 109, e compara com os
totais do JSON gerado. Depois percorre cada tema e cada guia. Erra o build quem:

- tiver contagem de áreas ou de temas diferente de 18 e 109, ou `meta.totais` divergente dos dados;
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
  `#` — os mesmos caracteres que o verificador do material recusa.

O gate imprime `verificado: 18 areas, 109 temas, 22 paginas` quando passa. Quando falha, lista cada
erro e sai com código 1, o que derruba o `npm run build` antes de o Vite entrar em ação.

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

Levantadas nas revisões de segurança, de testes, de frontend e de UI/UX, ainda em aberto, com a fase
em que entram.

| Pendência | Fase |
|---|---|
| **4.3 — pronto no Linux.** O `electron-builder` está configurado, o AppImage sai com 104,0 MiB (O7) e os sete fuses entram e são conferidos. Faltam os alvos que esta máquina não produz: `.dmg`/`.zip` (precisa de um Mac) e NSIS + portátil (precisa de `wine` ou de um Windows). O `.deb` saiu da configuração por decisão | 4.3 |
| **4.4 — feito.** Bundle dividido, conteúdo como arquivo, 35 chunks de outros diagramas fora e a CSP do desktop sem `'unsafe-inline'`. Os números estão na tabela acima e na seção "Checagens do plano" | 4.4 |
| **Falta apertar as outras duas CSPs**: o `<meta>` do build de navegador e o cabeçalho do `launcher/servidor.py` ainda aceitam `script-src 'unsafe-inline'`, porque os dois carregam o bundle inline. O desktop já está em `'self'` | 6 |
| **S2, S4, S6, S7, S9 e S10 estão implementados e não têm asserção.** É o que falta para a tabela do §16.3 ficar inteira | 6 |
| **A Fase 5 inteira não existe**: banco de múltipla escolha, `check-questions.ts` e tela de Quiz. É decisão de autoria antes de ser código — exige template novo e auditoria de citação, pelas regras do `CONTRIBUTING` | 5 |
| Os 1328 links relativos (`../README.md`, `TEMA-*.md`) ficam mortos no arquivo único: precisam ser reescritos para as rotas do app. Os 586 externos abrem normalmente | 6 |
| Regras do material ainda não implementadas: "duas passagens falhas seguidas mandam para releitura completa" (`plano-12-meses.md`), revisão além de D+90, a tarefa concreta de cada intervalo, a coluna "Artefato produzido" do registro e o diagnóstico por item (hoje é um booleano por tema) | 6 |
| O **escopo do critério na trilha de 90 dias** (`plano-90-dias.md` §7 recomenda que só os itens 1 e 2 de 02 contem) não é aplicado pelo app, que usa o critério do guia inteiro. O dono do critério já está declarado (`CONTRIBUTING` §3: o guia da área); falta decidir se a trilha é recomendação de escopo ou régua própria | 6 |
| `glossario.md` e `mapa-relacoes.md` usam `## Título` sem número e caem inteiros no `intro`, sem seções; o glossário não é navegável por termo | 6 |
| A fila de hoje é clicável, mas só lista os cinco primeiros: falta paginar ou abrir a lista inteira | 6 |
| Os vereditos por item do checkpoint vivem em `useState`: o total persiste, mas após recarregar os botões voltam em branco, com o texto dizendo "último resultado registrado" | 6 |
| `npm run dev` não funciona: a CSP do `index.html` bloqueia o `<script src>` que o Vite injeta. O `<meta>` precisa ser injetado só no build | 6 |
| Diagramas: falta um botão de ampliar (o fluxograma tem ~3000 px e rola na horizontal) e `aria-label` no SVG. Cabeçalho de tabela longa sem `position: sticky` | 6 |
| Escala de confiança do pré-teste: alvos de 29 px, sem rótulo nas pontas (o que é 1 e o que é 5) e 25 paradas de tabulação no bloco | 6 |
| Acessibilidade: `document.title` fixo em todas as rotas, foco não vai para o `main` na troca de rota, falta link "pular para o conteúdo" e alvos de 44 px no celular | 6 |
| Tema escuro não segue `prefers-color-scheme` e a primeira tela pisca branca enquanto o bundle monta | 6 |
| Páginas de 35 mil px (mapa de relações) sem sumário ou âncoras; as 6 páginas de `99-fontes/` aparecem no menu do aluno, mas são a trilha de QA do mantenedor | 6 |
| Sobre o JSON: o HTML das seções 3 e 10 dos temas (~0,25 MB) e o campo `errosComuns` nunca chegam à tela; e há 3,4 MB de bundle do Mermaid para 69 diagramas que são todos `flowchart` | 6 |
| O contrato de re-render do Mermaid mora na `key` do React, repetido em três arquivos, e o laço de seções também está triplicado | 6 |
| O verificador do material dá verde quando um sincronizador falha, trata o léxico apenas como aviso e não valida `templates/` nem `CONTRIBUTING.md` | 6 |
| O desktop carrega um **Chromium 130, fora de linha** (Electron 33). O `npm audit` acusa 1 crítica e 13 altas, e a leitura correta é: as de `tar`, `node-gyp` e `app-builder-lib` são de ferramenta de build e não entram no pacote (o `asar list` prova: 4 arquivos, zero `node_modules`); mas o **`electron` é dependência direta e o runtime está embarcado**, com 33 advisories que tocam justamente o que a casca anuncia — *context isolation bypass* (`GHSA-h7rp-cf8h-j98x`), *sandboxed iframe allow-popups bypass* (`GHSA-9f4c-93c8-jc8g`) e *ASAR integrity bypass* (`GHSA-vmqv-hx8q-j7mg`), este último **não mitigado no Linux**, onde a integridade do asar não é verificada. Subir de major e declarar cadência de patch | 7 |
| O `.desktop` do AppImage abre com `--no-sandbox` (padrão do electron-builder), então a via do menu de aplicativos roda sem o sandbox do Chromium. Decidido manter, para o app não abortar em distros que restringem user namespaces. **Testar em Ubuntu 24.04 antes de distribuir** e reabrir a decisão, ou trazer de volta um `.deb`/`.rpm`, onde o auxiliar pode ser 4755 | 7 |
| O desktop só foi exercitado no Linux. Falta abrir num Windows e num macOS de verdade | 7 |
| SBOM e soma de verificação por release; o `package-lock.json` já cobre electron, electron-builder e playwright | 7 |
| A camada de interface não tem teste de componente (`@testing-library` não está instalado): exportar, importar e recomeçar só são exercitados pelo store e pelo smoke. Um `AcoesDeProgresso` com ponte que rejeita fecharia o aviso de falha de gravação | 6 |
| O caminho de exportar/importar **do navegador** (Blob, `<input type=file>`, corte de 1 MB no arquivo escolhido) não tem teste; o cancelamento do diálogo deixa a promise pendente | 6 |
| O gate é um subconjunto do `verificar-repo.py`: ainda não confere `<details>` do gabarito, links internos entre arquivos, formato de datas e coerência da tabela de tempos | 6 |
| A **via da pasta com atalho não tem portão automático**: nada sobe o `servidor.py` num teste, então um `smoke:pasta` (200 em `/`, 421 com `Host` estranho, 404 em qualquer outro caminho, e o `index.html` respondendo) fecharia a única via de entrega sem verificação | 6 |
| O `.gitattributes` promete CRLF para `*.bat`, mas o arquivo no repositório está em LF — a conversão de verdade é a do `empacotar.mjs`, e ela **não pode ser removida** achando que o git resolve | 6 |
| Os smokes dependem de `google-chrome-stable` no PATH e de sessão gráfica para o Electron; nada disso está em CI, porque CI não existe | 7 |
