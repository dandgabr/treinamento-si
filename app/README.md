# App de estudo do roadmap CISO

Este repositório tem 18 áreas, 109 temas e 3 trilhas de estudo em Markdown. O app lê esses arquivos
e devolve o mesmo texto numa aplicação que abre com duplo clique, sem servidor no meio. O código
mora em `app/`; o material continua em `conteudo/`, e é de lá que ele vem, sempre.

## O que a aplicação faz

A tela inicial é o painel, com as 18 áreas na ordem de `ordem_estudo`. Cada linha traz o nome da
área, o nível (`base`, `intermediario` ou `avancado`) e a contagem de temas. Do painel se chega a
todo o resto: guia da área, temas, glossário, mapa de relações, as 3 trilhas (90 dias, 12 meses, 24
meses), certificações por fornecedor, o índice de fontes e o quiz de múltipla escolha.

Duas dessas telas leem o material de um jeito próprio, e cada uma tem a seção dela abaixo: o
**glossário** é navegável por termo (`#/pagina/glossario/termo-triade-cia`) e as **trilhas** trazem
o pré-teste diagnóstico com veredito por item e o checklist de artefatos da §8 de cada guia.

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
| `npm test` | roda a suíte do Vitest, **510 testes** na árvore de 2026-09-27: parser, gate, banco de questões e motor pedagógico |
| `npm run dev` | roda `build:content` e sobe o Vite com recarga automática |
| `npm run build` | gera o conteúdo e produz o build do navegador, em arquivo único |
| `npm run build:desktop` | produz o build do desktop em `dist-desktop/` (usa o conteúdo já gerado) |
| `npm run preparar:conteudo` | lê `conteudo/`, valida o JSON gerado, gera o banco de questões e roda o gate dele — roda uma vez por verificação |
| `npm run medir` | mede O1, O2, O4, O5 e O6 no aplicativo empacotado |
| `npm run typecheck` | roda o `tsc --noEmit`; o Vite apaga tipos sem conferi-los, então isto precisa existir separado |
| `npm run verificar` | **o portão do dia a dia**: build, build do Electron, testes, os três smokes do código (navegador, desktop e pasta) e o verificador do material — **não empacota nem testa o pacote** |
| `npm run verificar:pacote` | empacota e roda o smoke do pacote — o portão de quem vai distribuir |
| `npm run release` | **o portão de quem publica**: exige a árvore limpa e o `verificar` verde, empacota para o sistema em que roda e grava ao lado do artefato o `.sha256` — o passo a passo e as recusas estão em "Publicação" |
| `npm run smoke` | abre o artefato por `file://` num Chrome headless e confere o DOM renderizado em **107 cenários**, mais o quiz respondido e o glossário navegável |
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

A build inteira vira um arquivo: `app/dist/index.html`, com **7,86 MiB** (8.241.528 bytes), medido em
**2026-09-27**. A medição anterior, de antes de o banco entrar inline, era 7,6 MB — os 18 arquivos do banco
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
para `file://` e é bloqueado, fecha e **reabre** com o estado no lugar. Também exercita, com 50
asserções, o que antes só existia por inspeção: a ponte expõe só a lista fechada de canais (nenhum
`ipcRenderer` cru), `window.open` devolve `null` e nenhuma janela nova nasce, o que cruza a ponte é
recusado quando não é objeto e cortado por tamanho antes do `JSON.parse`, nos dois sentidos da
leitura e da escrita, as permissões são negadas nas duas checagens (a do pedido e a da consulta) e
nenhuma requisição do renderer chega a um servidor local — esta última com controle positivo, porque
"nada chegou" passaria também por ausência de tentativa. Cada uma tem prova de falsificabilidade por
mutação: desligada a proteção de propósito, a asserção reprova. O teto do progresso aparece nas duas
pontas e nas duas medidas: a gravação recusa o payload que passa em unidades de código e estoura em
bytes, e a leitura trata arquivo acima do teto **ou** truncado como erro — não como "primeira vez
aqui" —, de modo que o clique que gravaria não sobrescreve o que não foi possível ler. O import que
**efetivamente grava** também entrou: o `showOpenDialog` responde com um arquivo de verdade e a
resposta "Progresso importado." só sai depois do disco. E exercita o protocolo pelo
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
| Conteúdo | inline no JavaScript (3.891.053 bytes, 3,71 MiB) | `conteudo.json` ao lado — o mesmo JSON, 3.891.053 bytes (3,71 MiB) |
| Banco de questões | inline no JavaScript, junto com o conteúdo | `questoes.json` ao lado (543.668 bytes, 0,52 MiB) |
| Diagramas | todos inlinados (3,4 MB) | só o `flowchart`; 35 chunks de outros tipos são descartados |
| Script no arranque | **7,86 MiB** (8.241.528 bytes, medido em 2026-09-27) para o V8 analisar | **953,3 kB** (976.188 bytes, medido em 2026-09-27) |
| CSP | `<meta>` no HTML, com `'unsafe-inline'` | cabeçalho, `script-src 'self'` |
| Quem usa | launcher (`dist/Roadmap-CISO-Interativo/`) | empacotado pelo electron-builder |

Os números desta tabela foram medidos em **2026-09-27**, nos artefatos de agora: `dist/index.html`, o
`assets/index-*.js` do arranque em `dist-desktop/`, o `conteudo.json` (o mesmo arquivo que o build de
navegador embute) e o `questoes.json`. As unidades são bytes e MiB — o "kB" da linha do arranque é
KiB, como no resto do documento.

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

| O que | Medido em 2026-09-27, Linux x64, Electron 33.4.11, no pacote da release |
|---|---|
| AppImage | **104,0 MiB** (109.100.595 bytes) — O7 |
| `app.asar` | 5,46 MiB (5.726.389 bytes): o `conteudo.json`, o `questoes.json`, os 29 arquivos de `dist-desktop/` e o `main`/`preload` |
| `questoes.json` | 543.668 bytes (0,52 MiB): o banco de múltipla escolha, que viaja dentro do asar — eram 791.357 bytes antes de as questões discursivas saírem |
| `dist-desktop/index.html` + assets | 953,3 kB (976.161 bytes) de JavaScript no arranque, contra 7,86 MiB (8.241.528 bytes) inlinados |
| Pasta desempacotada | 268 MiB — o binário do Electron sozinho tem 177,7 MiB (186.312.608 bytes) |

**Estas cinco linhas são da release de 2026-09-27**, e não mais da build de 26/09: as três que
antes diziam "medido **antes do banco**" ficaram velhas quando o banco de múltipla escolha entrou no
pacote (a lista de `files` inclui `dist-desktop/**/*`, e é lá que o `questoes.json` é gravado), e
esperavam um `distribuir`. O `npm run release` desta fase foi esse `distribuir` — o passo a passo e
o hash do artefato estão em "Publicação".

As unidades são as mesmas em todas as linhas (MiB, com os bytes ao lado) porque misturar decimal
com binário produz uma contradição visível: 7,6 MB contra 7,3 MB para o mesmo arquivo faz a asar
parecer menor que o `index.html` que ela contém. O AppImage quase não mudou com a 4.4 — 104,6 para
104,0 MiB — porque o que ele carrega é o Electron; o ganho está no `asar` (7,3 → 4,9 MiB) e, acima
de tudo, no que o V8 precisa analisar antes da primeira tela.

Os 104,0 MiB são quase todos o Electron. O que é nosso é 5,46 MiB, e o desenho do pacote é o que
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

## Publicação

Publicar são **duas** coisas, e a fase 7 do plano entregou uma e declarou a outra. A **release
versionada com soma de verificação** está feita, com o comando `npm run release`. A **assinatura e
notarização** está declarada e não feita: cada uma exige uma peça que esta máquina não tem
(certificado, um Mac, uma conta de desenvolvedor), e configuração de assinatura que ninguém
consegue testar é uma promessa que o primeiro usuário descobre ser falsa. As duas estão abaixo, com
o que cada passo exige e com a consequência prática de não fazer cada uma.

### Release versionada: `npm run release`

O comando faz o que uma release precisa e nada além: exige a árvore limpa, exige o
`npm run verificar` verde, empacota para o sistema em que está rodando e grava ao lado do artefato
o arquivo de soma. Cada portão tem uma recusa própria, com mensagem dizendo o que fazer.

| Portão, nesta ordem | Recusa quando | O que a mensagem diz |
|---|---|---|
| árvore limpa, antes de verificar | o `git status --porcelain` tem qualquer linha (modificada, encenada ou não rastreada) | o que está pendente, e que a release sai de um commit |
| artefato da versão | já existe arquivo com o número da versão em `instalador/` | se é pacote de teste (mover ou apagar) ou release publicada, com soma ao lado (subir a versão) |
| `npm run verificar` | qualquer etapa do portão do dia a dia falha | que a release não publica código que não passa no próprio portão |
| árvore limpa, depois de verificar | a verificação sujou o repositório | que o gerador do banco gravou algo novo e isso tem de ser commitado antes |
| árvore limpa, depois de empacotar | o repositório mudou durante o empacotamento | que o `distribuir` recompila a partir de `src/`, então o artefato seria de código que o portão não viu — e a soma **não** é gravada |
| nome × soma × versão | o `.sha256` aponta para outro nome, outro tamanho ou outra versão | que não se publique: um checksum que aponta para outro nome dá uma conferência falsa |

A ordem é do mais barato para o mais caro — recusar em segundos é melhor que recusar depois de
quase três minutos de verificação (medido: **2m42s** em 2026-09-27, nesta máquina). O segundo portão
é o que impede a perda silenciosa: o `electron-builder` reescreve o AppImage no lugar, então
empacotar por cima apagaria a única cópia conferível da release anterior sem avisar ninguém. A
conferência depois de empacotar não é repetição da anterior: `distribuir` recompila o bundle a
partir de `src/`, e um repositório que mudasse no meio do caminho produziria um pacote conferível —
com soma e tudo — feito de código que nunca passou no portão.

O que sai da execução é o par que se publica:

```
instalador/Roadmap CISO-<versão>.AppImage
instalador/Roadmap CISO-<versão>.AppImage.sha256
```

O arquivo de soma é o do `sha256sum`, e as linhas de comentário existem porque o formato não tem
onde guardar a versão e o tamanho — nele, tudo o que vem depois dos dois espaços é o nome do
arquivo, e uma coluna a mais faria a conferência procurar um arquivo chamado
`Roadmap CISO-0.1.0.AppImage  109100531`. Com `#`, o `sha256sum -c` ignora o comentário e confere a
soma:

```
# release 0.1.0 — Roadmap CISO
# arquivo: Roadmap CISO-0.1.0.AppImage
# tamanho: 109100531 bytes
# gerado em: 2026-09-27
# confira com: sha256sum -c "Roadmap CISO-0.1.0.AppImage.sha256"
d33ac80153bd33d5f74849bb601b427776230c9614b0f05f6703eef3de3e88ee  Roadmap CISO-0.1.0.AppImage
```

Quem baixa roda `sha256sum -c "Roadmap CISO-0.1.0.AppImage.sha256"` com o artefato ao lado e recebe
`SUCESSO`. A versão sai de `package.json` **e de nenhum outro lugar**: ela não é digitada no script
nem no `electron-builder.yml`, o nome do artefato tem de contê-la, e o script relê o arquivo de
soma depois de gravar para conferir que o nome, o tamanho e o resumo são os do artefato que acabou
de sair. `app/instalador/` está no `.gitignore`, então o par viaja como **anexo da release**, não
como commit — refazer o pacote muda o hash, e um hash versionado seria mentira no dia seguinte.

### A release desta árvore (medida, não copiada)

| | Valor |
|---|---|
| arquivo | `instalador/Roadmap CISO-0.1.0.AppImage` |
| origem | reconstruído do commit `1136c52` (HEAD), com a árvore limpa |
| tamanho | **109.100.531 bytes** (104,0 MiB) |
| SHA-256 | `d33ac80153bd33d5f74849bb601b427776230c9614b0f05f6703eef3de3e88ee` |
| conferido com | `sha256sum -c` → `SUCESSO` |
| SBOM ao lado | `instalador/sbom.cdx.json` (CycloneDX 1.6, 572 componentes) |
| medido em | 2026-09-27 |

Refazer o pacote muda o hash, e é por isso que ele não é versionado: publica-se o par como anexo.
A diferença de tamanho para o pacote de 26/09 é compressão entre builds, não conteúdo — o que vale
como prova de origem é a soma conferida contra o arquivo que se baixou.

### O AppImage que estava no disco antes (medido, e depois sobrescrito)

| | Valor |
|---|---|
| arquivo | `instalador/Roadmap CISO-0.1.0.AppImage`, na época — **este arquivo não existe mais** |
| tamanho | **109.137.711 bytes** (104,1 MiB) |
| SHA-256 | `cbebd26b69ae50f41af585b126fa0270838ed22e091cf21c953781c0fc366997` |
| data do arquivo | 2026-09-26 22:45:41 (-03:00) |
| medido em | 2026-09-27, no disco desta máquina, antes de ser sobrescrito |

**Este pacote saiu de disco, e o erro foi meu.** Ao guardar na mesma pasta o par construído a partir
de um commit temporário, os nomes dos arquivos eram idênticos aos dele — e `mv`, na mesma partição,
renomeia e **sobrescreve em silêncio**. O que sobrou em `instalador/anteriores/` é o par do commit
temporário (`092e0ec6287726cb3aaef710e8e0976583733775178e3a3c614d00f158833820`, 109.100.595 bytes),
esse com o `.sha256` ainda conferindo. A medição acima continua valendo como registro do que
existiu, **não** como algo que se possa baixar hoje.

**Este pacote não é do código de hoje, e a conta é esta.** O trabalho da fase 6 está nos commits de
27/09 — 03:08 (`79bea35`, links do material virando rota e glossário navegável), 13:38 (`e178217`,
o CSS das telas novas) e 14:48 (`68b6e6a`) —, e o arquivo é de 26/09 às 22:45, anterior a todos.
Medido com a mesma regra de frescor que os smokes usam (`scripts/lib/frescor.mjs`): **82 arquivos de
fonte do app são mais novos que o pacote**, 31 deles `.ts`/`.tsx` em `src/`. Ninguém reconstruiu o
AppImage depois da fase 6 — e por isso este README não podia afirmar que o artefato publicado
correspondia ao código de hoje. A tabela de "Empacotamento" acima também tinha três linhas marcadas
como medidas "antes do banco" esperando um `distribuir`: a release abaixo é esse `distribuir`, e as
três foram remedidas depois dela.

### A release desta fase

| | Valor |
|---|---|
| versão | 0.1.0, de `package.json` |
| artefato | `instalador/Roadmap CISO-0.1.0.AppImage` |
| tamanho | **109.100.595 bytes** (104,0 MiB) |
| SHA-256 | `092e0ec6287726cb3aaef710e8e0976583733775178e3a3c614d00f158833820` |
| soma | `instalador/Roadmap CISO-0.1.0.AppImage.sha256` |
| conferida com | `sha256sum -c "Roadmap CISO-0.1.0.AppImage.sha256"` → `SUCESSO` |
| de onde saiu | um checkout limpo e vazio de alterações — a release sai de um commit, e o portão não abre exceção para árvore suja |
| medido em | 2026-09-27, no `instalador/` desta árvore |

Este pacote é o primeiro artefato do disco reconstruído desde a fase 6, e sai do mesmo `src/`,
`electron/` e `conteudo/` do commit `68b6e6a`: a fase 7 só acrescentou este script, uma linha do
`package.json` e este README, e nada disso entra no `asar` além do próprio `package.json`. A
diferença para o pacote anterior está no tamanho (109.137.711 contra 109.100.595 bytes) e no hash —
as três linhas do pacote de 26/09 esperavam este passo, e estão remedidas acima. O pacote antigo
**não foi apagado**: ele está em `instalador/anteriores/`, com o mesmo hash da tabela, para quem
quiser conferir a medição em vez de acreditar nela.

O `npm run smoke:pacote` rodou sobre este pacote (as 20 asserções de *fuses*, `asar`, protocolo e
progresso em arquivo passaram) — o artefato da release abre e grava progresso, e não é só um arquivo
com o tamanho certo.

### Assinatura e notarização: o que falta, e o que cada passo exige

O §16.2 do plano (item S14) e a §13 condicionam isto a "se o app for distribuído a terceiros". Esta
máquina não produz nenhuma das duas assinaturas, então o `electron-builder.yml` continua **sem
configuração de assinatura** (`mac.identity: null`, `publish: null`) — de propósito, e nada aqui foi
executado: é caminho **declarado**, não caminho **testado**. O que está feito é o AppImage do Linux,
com os sete fuses, o `asar` conferido e a soma de verificação acima.

#### Windows: NSIS e portátil

**O que falta:** certificado de assinatura de código.

1. **Certificado**, emitido por uma CA depois de validar a identidade de quem publica, com cobrança
   anual. Desde 2023 a chave privada de um certificado OV/EV não pode viver em arquivo: ela fica num
   token ou HSM (FIPS 140-2 nível 2 ou equivalente), e é isso que se compra. **Exige:** identidade
   validada e pagamento.
2. **Máquina de build.** O alvo NSIS precisa de `wine` no Linux (`dnf install wine` / `apt install
   wine`) ou de um Windows com o repositório. **Exige:** uma das duas — nesta máquina não há nenhuma.
3. **Ligar o certificado ao electron-builder**, no bloco `win:` (`certificateFile`,
   `certificatePassword`, `publisherName` e, nas versões mais novas, `signtoolOptions`).
   **Exige:** o certificado do passo 1 — e confirme os nomes na versão instalada antes de editar,
   porque eles mudam entre majors.
4. **Conferir o artefato, não a configuração.** No Linux:
   `osslsigncode verify -in "instalador/Roadmap CISO Setup 0.1.0.exe"`; no Windows,
   `signtool verify /pa /v` no arquivo do instalador. **Esperado:** o nome do editor, não "Editor
   desconhecido".
5. **Republicar a soma.** O `.exe` assinado é outro arquivo: `npm run release` roda de novo na
   máquina que assinou e grava o `.sha256` dele.

**Consequência prática de publicar sem assinar.** O Windows mostra o aviso do Microsoft Defender
SmartScreen — "O Windows protegeu o seu PC" — com o editor como **Editor desconhecido**; para abrir,
a pessoa precisa clicar em "Mais informações" e depois em "Executar assim mesmo". Um binário sem
assinatura não acumula reputação, e boa parte das políticas corporativas bloqueia executável não
assinado por padrão. Para o público deste app — quem responde pela segurança da informação numa
empresa —, esse é justamente o caso comum, e o aviso é indistinguível do de um arquivo malicioso.

#### macOS: `.dmg` e `.zip`

**O que falta:** um Mac, uma conta de desenvolvedor e a notarização.

1. **Conta** no Apple Developer Program (o `~US$99/ano` da §16.2 do plano) e um certificado
   "Developer ID Application" no chaveiro do Mac que vai construir. **Exige:** a conta e a
   identidade verificada pela Apple.
2. **Máquina.** Um Mac: o `.dmg` não se monta de fora, e `codesign`/`notarytool` são ferramentas do
   sistema. **Exige:** um Mac — nesta máquina não há.
3. **Construir com a identidade** (`npm run distribuir:mac`, com `mac.identity` apontando para o
   certificado) e **notarizar**: o electron-builder notariza quando o bloco de notarização está
   configurado, e a Apple aceita chave de API ou senha de app. **Exige:** conta e certificado.
4. **Grampear o recibo** no arquivo: `xcrun stapler staple "instalador/Roadmap CISO-0.1.0.dmg"`.
   Sem isso, quem estiver offline não consegue validar a notarização. **Exige:** a notarização do
   passo 3.
5. **Conferir em outro Mac**, com o arquivo **baixado** (com a marca de quarentena):
   `spctl --assess --type open --verbose=4 "Roadmap CISO.app"` deve responder `accepted` com
   `source=Notarized Developer ID`, e o duplo clique tem de abrir sem "abrir mesmo assim". O
   `fuses.mjs` já re-assina o binário de forma ad-hoc, e isso **não** é assinatura de distribuição:
   serve só para o `.dmg` de desenvolvimento abrir.

**Consequência prática de publicar sem assinar.** O Gatekeeper bloqueia: "não é possível abrir
porque o desenvolvedor não pode ser verificado" (nas versões recentes, com a oferta de mover o
arquivo para o Lixo). A saída é abrir pelo menu de contexto com "Abrir" ou liberar em Ajustes →
Privacidade e Segurança → "Abrir assim mesmo". Como a marca de quarentena vem do download, o aviso
não desaparece com o tempo: ele volta a cada arquivo novo.

#### Linux: não há assinatura a fazer

O AppImage não passa por portão de aceitação como o SmartScreen ou o Gatekeeper, e não há
certificado para comprar. **Consequência prática:** quem recebe o arquivo não vê aviso nenhum — e
também não tem prova de origem. A soma de verificação é a única garantia oferecida, e ela diz que o
arquivo chegou inteiro: vindo o pacote de um espelho de terceiro, o `.sha256` só ajuda se for
comparado com o da origem oficial. O `.desktop` que o AppImage distribui abre com `--no-sandbox`
(veja "Pendências conhecidas"); assinar não mudaria isso.

#### A soma de verificação não é um SBOM

A §16.2 do plano separa as duas coisas, e a assinatura também não resolve a segunda: os fuses e o
`.sha256` provam a **integridade** do que foi empacotado, não o **inventário** do que está dentro. O
O SBOM saiu em 27/09: `npx @cyclonedx/cyclonedx-npm --omit dev` gerou `instalador/sbom.cdx.json` (CycloneDX 1.6), que inventaria a árvore de dependências declarada no `package-lock.json` (produção) — não os bytes dentro do AppImage, que é o que a soma cobre. Os dois viajam como anexo da release.

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
| O3 bundle dividido | **sim** | sim: 953,3 kB (976.188 bytes) de script no arranque, contra 7,86 MiB (8.241.528 bytes) inlinados | `vite.desktop.config.ts` |
| O4 só o `flowchart` do Mermaid | **sim** | sim: 35 chunks de outros diagramas removidos; desenhar puxa 8 | `vite.desktop.config.ts`, `medir` |
| O5 memória após navegações | — | sim: heap de 11 MB na primeira tela, 16 MB com o diagrama | `medir` |
| O6 diagramas por tela | — | sim: 1 por tema | `medir` |
| O7 tamanho do instalador | **sim** | sim: AppImage 104,0 MiB (109.100.595 bytes), medido no pacote da release de 2026-09-27 | `npm run release`, "Empacotamento" |
| O8 decisão sobre XP/nível/sequência | — | sim (removidos, com o motivo) | `progresso.test.ts` |
| S1 prefs endurecidas | sim | parcial: `allowRunningInsecureContent` não é assertado | `smoke-desktop.mjs` |
| S2 ponte por allowlist | sim | sim | `smoke-desktop.mjs` |
| S3 link externo só `http(s)` | sim | sim | `smoke-desktop.mjs` |
| S4 sem `webview`/janela nova | sim | sim | `smoke-desktop.mjs` |
| S5 CSP como cabeçalho | sim | sim — e o desktop passou a `script-src 'self'`, sem `unsafe-inline` | `smoke-desktop.mjs` |
| S6 o que cruza a ponte passa pelo normalizador | sim | sim — recusa e corte nos dois sentidos da ponte (escrita e leitura) | `smoke-desktop.mjs` |
| S7 corte antes do `JSON.parse` | sim | sim — teto de 1 MB **em bytes**, conferido no descritor que é lido (`fstat`), não em `stat` sobre o caminho, e provado com um payload que passa em unidades de código e estoura em bytes | `smoke-desktop.mjs`, `progresso-desktop.test.ts` |
| S8 importação com esquema e cópia campo a campo | sim | sim | `progresso.test.ts`, `persistencia.test.ts` |
| S9 nenhuma requisição de rede | sim (`connect-src 'self'`, que é `app://`) | sim, com controle positivo (servidor local que responde) | `smoke-desktop.mjs` |
| S10 permissões negadas | sim | sim — a checagem do pedido e a da consulta | `smoke-desktop.mjs` |
| S11 fuses e integridade do asar | sim | sim | `fuses.mjs`, `smoke-pacote.mjs` |
| S12 travessia e host bloqueados | sim | sim | `smoke-desktop.mjs`, `smoke-pacote.mjs` |
| S13 cadência de patch do Electron | decisão registrada | — | pendências, fase 7 |
| S14 assinatura | **declarado, não feito** | — (esta máquina não tem certificado, `wine` nem Mac) | seção "Publicação" |

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
| `srs.ts` | intervalos D+1, D+7, D+30 e o degrau das trilhas em D+90; acerto avança, erro rebaixa (90→30, 30→7, 7→3, 1→1) | **do material**: §11 de cada tema, §5.2 do TEMA-05 de 00 e a §6 das duas trilhas |
| `criterio.ts` | lê o critério de aprovação que o guia publica em prosa | **do material**: campo `criterio` de cada guia (`4 dos 5`, `80%`) |
| `progresso.ts` | estado do estudo, dias com estudo e a escala de confiança do pré-teste | **decisão daqui** — o material não descreve formato de estado |
| `dominio.ts` | tema "firme" = última recuperação ativa acertada sem consulta | **decisão daqui** |
| `trilha.ts` | o ponto de entrada do pré-teste diagnóstico, o artefato da §8 do guia e o marco de cada fase (checkpoint aprovado **e** artefato produzido) | **do material**: §1.1 e §3 das trilhas, §8 e §9 dos guias |

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

### A escada de revisão termina em D+90

A escada do app terminava em D+30, e o acerto ali tirava o tema da fila. As duas trilhas tabelam um
degrau a mais — "D+90 | ok / revisar | avançar / repetir em D+30", na §6 do plano de 12 meses e na do
de 24 —, e é ele que entrou: `D+1 → D+7 → D+30 → D+90`, com o erro em D+90 voltando a **D+30**. Como
o material manda rever todos os temas em "D+90 e além", o tema consolidado **não sai da fila para
sempre**: ele volta pela etapa final a cada 90 dias contados da última passagem. É por isso que a
data de retorno é calculada da passagem — subtraindo o intervalo que o próprio estado guardou — e não
de um campo novo, e é por isso que um arquivo que consolidou sob a regra antiga também volta: sem
isso, aquele tema ficaria fora da etapa final das trilhas pelo resto da vida.

O `SEQUENCIA_DIAS` do domínio **não mudou**, e é de propósito: aquele array espelha o
`revisao_inicial_dias` do frontmatter dos 109 temas (`[1, 7, 30]`) e o gate compara os dois, então
acrescentar o 90 ali reprovaria o build. O tema declara os intervalos que sugere; o calendário
completo é das trilhas — e é por isso que o D+90 mora à parte, em `INTERVALO_ALEM_DIAS`.

**Duas passagens falhas seguidas** passaram a ser contadas (`revisao.falhasSeguidas`), o que é coisa
diferente de `rebaixamentos`: aquele conta a vida toda, e duas falhas separadas por um acerto não
mandam o tema para releitura. O que o app faz é **anunciar** — a fila de hoje marca "releitura
completa antes desta passagem" —, e a escada de rebaixamento **não** muda por causa disso, por
decisão do dono. Não há trava exigindo a marca antes da passagem seguinte: o material **descreve**
essa etapa — a §6 do plano de 12 meses manda o tema para releitura completa "contada na conta da
seção 3.3", e a §3.3 tabela o destino ("voltam a D+7 no mês seguinte"). Ou seja: **o material manda a
terceira passagem em D+7 e o app decidiu não agendar**; a divergência fica nomeada aqui, em vez de
negada.

O campo é **aditivo**, e a `VERSAO_PROGRESSO` continua **1**. Subir a versão faria o app já
distribuído **descartar o progresso inteiro** — o normalizador joga fora versão que não conhece — e
obrigaria a migrar todo arquivo em disco antes disso. É o mesmo precedente de `questoes`, que entrou
na v1 sem mudança de número. O valor neutro do campo novo é zero, e o efeito colateral fica
declarado: um tema que já tinha duas falhas seguidas antes de o campo existir só entra em releitura
completa após a próxima falha — supor "sim" faria o app exigir releitura de um tema que talvez tenha
acabado de acertar.

O XP era **derivado**, o que continua valendo para o que ficou: a mesma função sobre o mesmo estado
devolve sempre o mesmo resultado. O veredito da recuperação é registrado uma vez por passagem;
repetir o clique não avança a escada — a passagem seguinte se abre de forma explícita.

`app/scripts/lib/` guarda o parser e o gate como funções puras, para serem testados com fixtures
pequenos. `gerar-conteudo.test.ts` fecha o contrato: parseia o material real e exige `validar()`
vazio com os totais 18/109/22.

## As trilhas de estudo

As três trilhas (`91-trilhas/`) descrevem o plano — cadência, fases, marcos e pré-teste — e duas
coisas delas existem só como texto no material: o **pré-teste diagnóstico** da §1.1 e a **tabela de
fases** da §3. `application/extrair-trilha.ts` lê as duas no build, do HTML que o gerador acabou de
produzir, e é por isso que ele aproveita os links já resolvidos para rota — essa informação não
existe mais no Markdown cru. O que sai de lá é `pagina.trilha`, e as seções seguem com a região do
diagnóstico **retirada**, porque ela volta como bloco interativo no mesmo lugar: manter as duas
versões na tela mostraria os mesmos dez itens duas vezes, um deles sem clique.

**Diagnóstico por item.** O pré-teste das três trilhas traz dez itens com veredito "Acertei: sim/não"
por item, o rótulo da própria coluna do material, e o **ponto de entrada** aparece só quando os dez
estão julgados — com metade das respostas, o número de acertos descreveria uma prova que ninguém
terminou. A faixa é lida da tabela do material ("0 a 3", "4 a 7", "8 a 10"); quando nenhuma delas
cobre o total de acertos, o app não diz nada, em vez de estender a tabela do material. O texto do
item, a abertura e a nota em volta são do material e viajam com o bloco, na ordem em que ele os
escreve. Medido no `content.json`: as três trilhas saem com **10 itens e 3 faixas** cada.

**Artefatos e marcos.** O checklist percorre as fases da §3 — todas com rótulo, período e "Marco de
saída" do material — e a coluna "Áreas (ordem_estudo)" é resolvida contra as áreas que existem; a
célula que diz "todas" vale pelas áreas do conteúdo, e a fase de segunda passagem do plano de 12
meses e do de 24 sai com as **18** ligadas a ela. A lista da **§8 do guia** e as caixas aparecem
**uma vez por área**: na primeira fase que a §3 liga a ela (`faseDeEstudoDasAreas`). As fases que a
retomam — e as 18 áreas pertencem a duas fases nos planos de 12 e 24 meses — não repetem a lista:
mostram o estado do marco e um botão de volta para a fase que estuda a área. Medido: dos **77 pares
(área, fase)** das três trilhas, **37** não listam a §8 na fase em que a área reaparece, e a lista
cobre os outros **40** — um por área distinta de cada trilha (18 + 18 + 4). As atividades são as da
§8 do guia (medido: **100 atividades nos 18 guias**, das quais **43** declaram "nenhum" pré-requisito
técnico), com uma caixa por artefato e a data da produção ao lado. O **marco exige** o checkpoint da
área aprovado no critério que o próprio guia publica — lido por `dominioDaArea`, nunca copiado para a
trilha — **e** o artefato da §8 produzido. A **contagem** de condições não é afirmada: a §7 do plano
de 12 meses e a da trilha de 90 dias declaram **duas**, e a do plano de 24 declara **três**, sendo a
terceira o laboratório do Bloco E — que o app **não** modela, por decisão do arquiteto de 2026-09-27
(ver "Pendências conhecidas").
Fase que a §3 não liga a área nenhuma (o Bloco F do plano de 24 meses) nunca fica "cumprida": o marco
dela é o texto do material, e o app não inventa a ligação para poder marcar.

**Tarefa por intervalo.** A fila de hoje mostra, para cada tema vencido, só o **"o que fazer"** lido
da coluna da §11 daquele tema — "Responder à seção 10 sem reler" no D+1, "Explicar o tema em 3
frases…" no D+7. O "se errar" da mesma linha **não** aparece na fila: ele só é escrito na tela do
tema, no bloco `TarefaDaPassagem` ("O que fazer nesta passagem"). O intervalo que **não tem linha
tabelada** — o D+3 do rebaixamento e o D+90 do degrau final — não empresta a tarefa de outro
intervalo: a tela diz que não há tarefa ali e devolve o caminho da seção 10, que é a recuperação
ativa. Medido: as tabelas da §11 dos **109 temas** têm exatamente D+1, D+7 e D+30 — nenhum tema
tabela D+3 nem D+90.

**O estado é do app, e é aditivo.** Os vereditos do diagnóstico ficam em `diagnosticos[slug]`, por
índice do material, e os artefatos em `artefatos[areaId#N]`, com o dia local da produção — que é
limpo ao desmarcar, para o registro não dizer que algo foi produzido no dia em que alguém percebeu
que não existe.

## Glossário navegável por termo

`glossario.md` usa `## Título` sem número, então ele cai inteiro no `intro` da página — e é ali que
estão as duas tabelas de verbetes: **Termos** (7 colunas, 59 linhas) e **Siglas** (4 colunas, 19
linhas), **78 verbetes** ao todo. A prosa em volta continua HTML, no lugar dela; quem vira React são
as duas tabelas.

Cada verbete ganha um `id` (o termo sem acento, sem maiúscula e com hífen no que não é letra:
`tríade CIA` vira `termo-triade-cia`), o `id` vira o **endereço daquele termo** e o primeiro `id` de
cada grupo vira **âncora**: `#/pagina/glossario/termo-triade-cia`. O endereço por termo não precisou
de gramática nova — ele usa a mesma âncora como último segmento que o material já usava para as
seções (`#/area/01-fundamentos/secao-4`) —, e a primeira célula é o link do próprio termo, que é o
que deixa o endereço à mão e viaja junto do texto copiado. Termo e sigla com o mesmo texto ("TLS" nas
duas tabelas) não colidem: o prefixo separa.

O **índice** segue o sumário das outras telas (botões que movem foco e rolagem, sem mudar a rota) e
tem **uma entrada por área de origem**, e não por letra inicial: a tabela de termos não está em ordem
alfabética — ela segue o material, que agrupa os verbetes por tema —, então um índice por letra
mandaria "S" para o primeiro verbete do arquivo a começar com S, que é "segurança da informação", e
não para "sigilo". A tabela de siglas não tem coluna de área, e a entrada dela é a própria tabela.
A busca ignora acento e maiúscula (`NFD` separa a letra do sinal e o intervalo `U+0300`–`U+036F` é o
bloco dos acentos), exige que todas as palavras digitadas apareçam — "trust zero" acha "zero trust" —
e a contagem que ela atualiza é uma região `role="status"`, que é o que o leitor de tela ouve a cada
tecla.

**O casamento é por substring, sem fronteira de palavra, e isso é decisão.** "confid" acha
"confidencialidade" enquanto se digita, e é esse o efeito desejado — exigir o termo inteiro faria a
consulta parcial cair em "Nenhum termo bate". É uma escolha, não um descuido: `src/ui/Glossario.test.tsx`
pina o comportamento, e trocá-lo por fronteira de palavra reprova o teste em vez de passar despercebido.

Medido: **23 asserções** no cenário `glossario (navegavel por termo)` do `npm run smoke`, sobre os
78 verbetes do material — a lista começa inteira, a busca encolhe e volta, o termo que não existe
esvazia a lista com aviso, o índice cai em verbete (e não em título), e o endereço de um termo aberto
direto muda a rota, leva o foco e rola até ele, abaixo do cabeçalho fixo.

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

### Os links do material viram rota

**O material não muda.** Quem lê no GitHub ou no disco continua vendo `TEMA-02-triade-cia.md` e
`../01-fundamentos/TEMA-01-*.md`: referência cruzada por caminho de arquivo é decisão editorial, e
trocar isso na origem quebraria quem lê o repositório. A tradução acontece **na geração do
`content.json`**, uma vez, onde o gate consegue conferir o resultado. O mapa
`caminho relativo → rota do app` sai do mesmo material que o parser lê, e o caminho do link é
normalizado contra a pasta do documento de origem — por isso `TEMA-02-triade-cia.md` e
`../00-guia-basico/TEMA-02-triade-cia.md` dão a mesma rota. A pasta com `README.md` herda a rota dele,
que é como o material cita `[91-trilhas/](../91-trilhas/)`.

Medido no `content.json`: **0 `href` relativo** no HTML gerado, contra **1328** antes. Deste total,
**1196 viraram rota** do app (`#/area/…`, `#/tema/…`, `#/pagina/…`) e **132 ficaram declarados sem
rota** — o texto fica, a marca de link sai. Os **586** externos (e os que saem do material) seguem
intactos. O total de `href` caiu de **1914** para **1782**: a diferença são exatamente os 132 que
viraram texto.

**A âncora viaja como último segmento da rota, e é honrada na volta.** O material escreve
`README.md#4-temas`, com o slug do cabeçalho como o GitHub o monta; o app endereça seção por número.
Como o fragmento da URL pertence à rota, a âncora entra depois dela — `#/area/01-fundamentos/secao-4`
—, que é a mesma gramática do endereço de um termo do glossário. Um `#` a mais não serve: ele não é
delimitador de segmento, e `#/area/x#secao-4` viraria o `areaId` `x#secao-4`, ou seja, "área não
encontrada". O material de hoje tem **uma** âncora assim. Ela era emitida e descartada: o roteador
devolvia a área sem âncora e a seção 4 ficava a 4000 px de distância. O `useRota` passou a devolver
`ancora` também para a rota de área e o efeito do `App` a lê, então o link chega à seção — a decisão
foi **honrar** a âncora, e não parar de emiti-la.

**O relatório de links acusa onde antes era mudo.** Link que **sai da raiz** do material, caminho
**absoluto** (`/x.md`) e **protocol-relative** (`//host/x.md`) não entravam em `links.erros`, ao
contrário do que o cabeçalho do próprio módulo prometia — os dois primeiros saíam no HTML com zero
erros, e quem reprovava era só o gate, que não roda no `build:content`, o caminho do `npm run dev`.
Os três ramos passaram a empurrar erro; a sonda sobre o material real confirma a não-regressão:
1196 rotas, 132 como texto, 586 intactos, 0 erros — o mesmo de antes.

**O que não tem rota está declarado num lugar só** (`scripts/lib/links-material.ts`,
`DECLARADOS_SEM_ROTA`), com o motivo ao lado — quatro entradas: `CONTRIBUTING.md` (regra de autoria
do material), `templates/` (pasta das fichas de autoria, citada como pasta),
`templates/RELACOES-TEMAS.md` (formato do bloco de relações) e `templates/INDICE-TEMAS.md` (numeração
canônica dos temas). Um link declarado cujo texto **não nomeia** o arquivo de destino reprova: sem
`href`, o leitor do app perderia para onde a referência aponta. E o `99-fontes/` **não** entra nesta
lista, apesar de ser trilha de QA do mantenedor: ele tem tela no app, e declará-lo seria esconder uma
tela que existe — lá existe rota, e o que não existe é a leitura.

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
  contrato: o bloco `contrato-mermaid` da §7 do `conteudo/CONTRIBUTING.md`;
- sobrar **`href` relativo no HTML gerado**: alvo que não tem rota no app, alvo que não existe no
  material, ou uma troca que não passou pelo mapa. Esta é a conferência do **resultado**, e não da
  intenção — um campo de HTML novo que escape da troca, ou um resolvedor que deixe de ser passado,
  reprova aqui, e não no mapa que já disse o que pretendia fazer;
- a lista de declarações sem rota ter uma entrada que **ninguém mais linka**: declaração morta
  reprova, para a lista não virar depósito de caminhos que o material já não cita.

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

**O teto é medido em bytes — nos dois lados.** Gravação e leitura usam o mesmo limite de 1 MB sobre
os **bytes** do texto, e não sobre unidades de código: antes a gravação media
`JSON.stringify(valor).length` e a leitura media `stat.size`, então um arquivo que cabia no teto da
gravação passava dele no disco — no relançamento a leitura devolvia nulo e o primeiro clique gravava
por cima do que a pessoa tinha importado. No import, o teto é conferido sobre o **descritor lido**
(`fstat`), e não sobre o caminho: com `stat` no caminho, um FIFO (`size == 0`) passava pelo teto e
pendurava o handler para sempre.

**Arquivo ausente e arquivo ilegível são coisas diferentes.** `lerProgresso` só trata `ENOENT` como
"primeira vez aqui"; **truncado, com JSON quebrado ou acima do teto** ele sinaliza erro, e o app não
deixa gravar por cima. É a diferença entre a tela avisar e o primeiro clique apagar o progresso: a
defesa existia no store e nunca ligava no desktop. O `importar()` segue a mesma linha — só responde
"Progresso importado." **depois** da gravação. E o normalizador passou a exigir uma janela sã para
`proximaRevisao`: uma data no limite do `Date` fazia o clique de "Acertei sem consultar" lançar
`RangeError: Invalid time value`.

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
| **Os links do material viraram rota, e o HTML gerado ficou sem `href` relativo nenhum.** Os 1328 relativos de antes viraram **0**: 1196 chegaram ao app como rota e 132 ficaram declarados sem rota (o texto fica, o `<a>` sai). Os 586 externos seguem intactos. O portão reprova link novo sem rota e declaração morta. Fechada — os números e a lista estão em "Os links do material viram rota" | — |
| **As regras do material desta lista entraram.** A escada da revisão termina em **D+90** e o tema consolidado volta pela etapa final a cada 90 dias ("D+90 e além"); a tarefa de cada intervalo sai da coluna "O que fazer" da §11 do próprio tema; o registro guarda o **artefato da §8** de cada guia com a data da produção; e o **diagnóstico por item** existe no pré-teste das trilhas — dez itens com veredito por item e o ponto de entrada lido da tabela do material. As duas passagens falhas seguidas passaram a ser contadas: elas marcam "releitura completa antes desta passagem" na fila de hoje e **não** mudam a escada de rebaixamento, por decisão do dono — a releitura é anunciada, não imposta. Fechada | — |
| O **escopo do critério na trilha de 90 dias** (`plano-90-dias.md` §7 recomenda que só os itens 1 e 2 de 02 contem) não é aplicado pelo app, que usa o critério do guia inteiro. O dono do critério já está declarado (`CONTRIBUTING` §3: o guia da área); falta decidir se a trilha é recomendação de escopo ou régua própria | 6 |
| **O glossário passou a ser navegável por termo**: endereço próprio por verbete (`#/pagina/glossario/termo-triade-cia`), índice no padrão de sumário das outras telas e filtro que ignora acento e maiúscula. Medido: 78 verbetes do material (59 termos e 19 siglas) e **23 asserções** no cenário `glossario (navegavel por termo)` do `npm run smoke`. O índice é **por área de origem**, e não por letra, porque a tabela de termos segue a ordem do material e não a alfabética — a razão está registrada em "Glossário navegável por termo". Fechada | — |
| `glossario.md` e `mapa-relacoes.md` continuam sem `## N.` — o material deles usa `## Título` sem número —, então os dois caem inteiros no `intro`. O que a tela ganha são os cabeçalhos como âncoras de sumário (o mapa de relações é a página mais longa; medido: 0 seções e 58.410 bytes de `intro` nele, contra 0 seções e 38.335 bytes no glossário). Reescrever essa estrutura é do material, e não do app | 6 |
| **A fila de hoje abre inteira.** Ela mostra os cinco primeiros e o botão "Ver os N vencidos" (`aria-expanded`/`aria-controls`) abre a lista toda; sem nada vencido, ela diz "nada vencido em D+1, D+7, D+30 ou D+90". Fechada | — |
| Os vereditos por item do checkpoint vivem em `useState`: o total persiste, mas após recarregar os botões voltam em branco, com o texto dizendo "último resultado registrado" | 6 |
| **`npm run dev` funciona**: a CSP saiu do `index.html` e é injetada por plugin do Vite só no build (`apply: 'build'`), então o `<script src>` do dev não é bloqueado. Fechada | — |
| **Diagramas: botão "Ampliar" e `aria-label` no SVG** entregues (`src/ui/mermaid.ts`), e o cabeçalho das tabelas longas ficou `position: sticky` (`src/styles.css`). Fechada | — |
| **Escala de confiança do pré-teste**: as pontas ganharam rótulo ("chutei" e "certeza"), os alvos têm 44 px (48 px no dedo) e o `tabIndex` virou itinerante — 5 paradas no bloco, uma por item, em vez de 25. Fechada | — |
| **Acessibilidade**: `document.title` por rota, foco no `main` na troca de rota, link "pular para o conteúdo" como primeiro alvo de tabulação e alvos de 44 px (48 px no celular). Fechada | — |
| **Tema escuro segue `prefers-color-scheme`** no modo "sistema" (`data-theme="auto"` + `light-dark()`), e a tela de carregamento pinta a cor certa antes do bundle. Fechada | — |
| As páginas longas ganharam sumário com âncoras (o mapa de relações é a maior); o que segue aberto é o menu: as 6 páginas de `99-fontes/` aparecem para o aluno, mas são a trilha de QA do mantenedor | 6 |
| Sobre o JSON: **253 kB (6,6% do `content.json`) são HTML duplicado** das seções 3 e 10 dos temas — a tela remonta os dois blocos de `preTeste`/`recuperacao`, e o que só existe no HTML é boilerplate que o app reescreve, não prosa órfã. O `errosComuns` (144.591 bytes, 608 linhas) **saiu desta linha**: virou item de quiz, com as três colunas na tela, uma por linha de tabela. E há 3,4 MB de bundle do Mermaid para 69 diagramas que são todos `flowchart` | 6 |
| O contrato de rótulo do Mermaid era triplicado, e uma das cópias já estava para trás. Agora tem uma fonte só: o bloco `contrato-mermaid: {...}` da §7 do `conteudo/CONTRIBUTING.md`, lido pelo verificador do material e por `app/scripts/lib/contrato-mermaid.ts`, que falha alto em vez de cair num padrão embutido. A prosa da §7 tem de concordar com o bloco, e nenhuma ficha pode manter cópia. Fechada | — |
| O contrato de re-render do Mermaid continua na `key` do React: são **7** remontagens por `key` que carrega o tema, em **5** arquivos (`App`, `AreaView`, `Blocos`, `Glossario` e `ThemeView`), e **4** chamadas a `renderizarMermaid` — as três telas de conteúdo mais `App.tsx`, que o inventário anterior não nomeava. O laço de seções segue **triplicado** (`ThemeView`, `AreaView`, `Blocos`); a fase 6 **não** criou um quarto laço, mas acrescentou **três** pontos de `Html` fora do contrato em `src/ui/Trilha.tsx` | 6 |
| **O verificador do material fechou os pontos cegos.** `conteudo/scripts/verificar-repo.py` roda os nove sincronizadores em `--check` e exige a linha de conclusão `CHECK <script> <n>` de cada um (sem ela, erro); reprova o léxico da §5 como **erro** (o `&` continua permitido — `ATT&CK` na área 12 prova); confere as cinco fichas de `templates/` contra o esquema do `FRONTMATTER.md` e confere o próprio `CONTRIBUTING` nos dois sentidos — o que ele promete existe e o que existe está documentado. Ele assina o material com sha256 antes e depois, então `--check` não pode escrever. Roda de dentro de `conteudo/`, e o repositório não tem `scripts/` na raiz. Fechada | — |
| O desktop carrega um **Chromium 130, fora de linha** (Electron 33). O `npm audit` acusa 1 crítica e 13 altas, e a leitura correta é: as de `tar`, `node-gyp` e `app-builder-lib` são de ferramenta de build e não entram no pacote (o `asar list` prova: 4 arquivos, zero `node_modules`); mas o **`electron` é dependência direta e o runtime está embarcado**, com 33 advisories que tocam justamente o que a casca anuncia — *context isolation bypass* (`GHSA-h7rp-cf8h-j98x`), *sandboxed iframe allow-popups bypass* (`GHSA-9f4c-93c8-jc8g`) e *ASAR integrity bypass* (`GHSA-vmqv-hx8q-j7mg`), este último **não mitigado no Linux**, onde a integridade do asar não é verificada. Subir de major e declarar cadência de patch | 7 |
| O `.desktop` do AppImage abre com `--no-sandbox` (padrão do electron-builder), então a via do menu de aplicativos roda sem o sandbox do Chromium. Decidido manter, para o app não abortar em distros que restringem user namespaces. **Testar em Ubuntu 24.04 antes de distribuir** e reabrir a decisão, ou trazer de volta um `.deb`/`.rpm`, onde o auxiliar pode ser 4755 | 7 |
| O desktop só foi exercitado no Linux. Falta abrir num Windows e num macOS de verdade | 7 |
| **Assinatura e notarização seguem pendentes, e a fase 7 escolheu declará-las em vez de as inventar.** Esta máquina não tem certificado de assinatura, `wine` nem Mac, então o `electron-builder.yml` continua **sem** configuração de assinatura (`identity: null`), de propósito — configuração que ninguém consegue testar é promessa que o primeiro usuário descobre falsa. O caminho de cada uma (o que o passo exige, como conferir, e o que o usuário final vê quando o pacote vai sem assinatura) está em "Publicação" | 7 |
| **Soma de verificação por release: feita** — `npm run release` exige árvore limpa e `verificar` verde, empacota e grava o `.sha256` ao lado do artefato, com os números medidos na seção "Publicação". **SBOM feito em 27/09**, e é outra coisa: a soma prova a integridade do que foi empacotado, o inventário prova o que está dentro. O `package-lock.json` já cobre electron, electron-builder e playwright | 7 |
| **A camada de interface tem teste de componente**: `@testing-library` + `jsdom` num segundo projeto do Vitest (`vitest.config.ts`), e `src/ui/Progresso.test.tsx` exercita exportar e importar **pelo componente** — inclusive importar inválido sem sobrescrever o progresso e a ponte que rejeita. Fechada | — |
| O caminho de exportar/importar **do navegador** (Blob, `<input type=file>`, corte de 1 MB no arquivo escolhido) não tem teste; o cancelamento do diálogo deixa a promise pendente | 6 |
| O gate é um subconjunto do `conteudo/scripts/verificar-repo.py`: ainda não confere `<details>` do gabarito, formato de datas e coerência da tabela de tempos. **Links internos saíram desta linha**: o `check:content` confere os alvos dos links do material (que existam, que tenham rota ou declaração) e o HTML gerado (nenhum `href` relativo). O que ele ainda não confere é o **destino** da rota — se `#/tema/a/TEMA-01` abre uma tela —, e isso é papel do `smoke`, que percorre a matriz de rotas | 6 |
| **A via da pasta com atalho tem portão**: `npm run smoke:pasta` monta a pasta, sobe o `servidor.py` numa porta efêmera, confere 200/421/404/501 e a CSP pelo fio, e encerra no `finally`. Entrou no `npm run verificar`. Fechada | — |
| O `.gitattributes` promete CRLF para `*.bat`, mas o arquivo no repositório está em LF — a conversão de verdade é a do `empacotar.mjs`, e ela **não pode ser removida** achando que o git resolve | 6 |
| Os smokes dependem de `google-chrome-stable` no PATH e de sessão gráfica para o Electron; nada disso está em CI, porque CI não existe | 7 |
| **O pré-teste diagnóstico e os artefatos passaram a ter teste de componente na fila de hoje.** O buraco era a `TarefaDaPassagem` e o ramo "sem tarefa tabelada" da fila, em `src/ui/Progresso.tsx`: a camada de aplicação (`filaComTarefas`) era exercitada, e o que a tela escreve não era — no `smoke`, a fila só era conferida vazia ("fila vazia no inicio"). `src/ui/Progresso.test.tsx` ganhou caso para a `TarefaDaPassagem`, para a fila com a tarefa que a §11 declara, para o intervalo sem linha na §11 (que devolve o caminho da seção 10 sem emprestar tarefa de outro intervalo) e para a marca de releitura depois de duas falhas seguidas. Fechada | — |
| **A revisão da fase 6 com os agentes foi feita, em três frentes.** A varredura que pegou o CSS sem regra veio primeiro; depois a de testes, que fechou a cobertura de componente que faltava; e por fim a de segurança, segmentada por superfície, cujos achados estão em "Onde o progresso mora" e em "Os links do material viram rota". Fechada | — |
| **A varredura da fase 6 pegou um defeito de entrega — telas novas sem CSS — e ele foi corrigido.** No commit `5e0d460`, `src/ui/Trilha.tsx` e `src/ui/Progresso.tsx` entraram com **26 + 6** classes novas sem nenhuma regra em `src/styles.css`, e `git show --numstat --format= 5e0d460 -- app/src/styles.css` é **vazio**: o efeito medido era "marco cumprido" sem diferença visual de "marco pendente". O `e178217` levou ao `styles.css` as 265 linhas que faltavam. Fica o registro de que **nenhum portão pegaria isso**: teste e smoke passam com classe sem regra, porque nenhum dos dois casa `className` com seletor — quem pegou foi a varredura que leu cada `className` das duas telas contra o CSS. Fechada | — |
| **O smoke passou a assere o pré-teste diagnóstico e o checklist de artefatos.** Três cenários `trilha <slug>` conferem o DOM contra o próprio `content.json`: um item de lista por item do material no pré-teste (`.lista-diagnostico > li`), uma linha por faixa (`.tabela-diagnostico tbody tr`), uma `.area-marco` por área **na fase que a estuda**, com uma caixa por atividade da §8 do guia dela, e as `.area-retomada` sem repetir a caixa. Os seletores assertados são esses — o cenário não olha para as classes `.bloco-diagnostico`/`.checklist-trilha`, que é o que a pendência anterior pedia por nome. Fechada | — |
| **A conferência de `href` relativo passou a percorrer `pagina.trilha.*`.** O HTML do conteúdo virou **uma lista só**, em `scripts/lib/htmls-do-conteudo.ts`: `htmlsDaPagina` compõe `intro`, `secoes` e `htmlsDaTrilha(pagina.trilha)` — os **12** campos (`diagnostico.introHtml`, os dez `itens[].origemHtml` e `diagnostico.notaHtml`) —, e o gate e os testes leem a mesma lista em vez de cada um varrer os campos por conta própria. `gerar-conteudo.test.ts` prova que a varredura visita campo da trilha, e `validar-content.test.ts` prova que o gate reprova um `href` relativo escondido ali. Fechada | — |
| **A `faseDeEstudoDasAreas` ganhou teste próprio.** `src/domain/trilha.test.ts` tem um `describe` para ela — inclusive com as fases do plano de 90 dias do material —, além do uso indireto pela tela, em `src/ui/Trilha.test.tsx`. É ela que sustenta a regra "uma lista por área" do "Artefatos e marcos". Fechada | — |
| **Terceira condição do marco no plano de 24 meses — decisão do arquiteto (2026-09-27): não modelar.** A §7 do plano de 24 meses declara **três** condições por bloco, e a terceira é "no Bloco E, o laboratório correspondente concluído com dado real. Sem L1 e L2, o Bloco F não começa"; as §7 dos planos de 90 dias e de 12 meses declaram **duas**. O app modela as **duas condições por área** (checkpoint + artefato), e a §2.2 até oferece os cinco laboratórios numa tabela legível (coluna "#", L1–L5), mas **não** liga laboratório a bloco: essa ligação só existe em prosa na coluna "Marco de saída" da §3 ("Laboratório L1 concluído" no Bloco D, "Laboratórios L2 e L3" no E, "Laboratórios L4 e L5" no G), e a §7 ainda a repete divergindo — "o laboratório correspondente", no singular, contra L2 e L3 da §3, e "L1 e L2" como portão do Bloco F, contra L1 no D e L2/L3 no E. Decisão: **(B)** não modelar a terceira condição e o app **deixar de afirmar a contagem** — a tela passa a dizer "as condições que a seção 7 desta trilha declara", sem o "duas", e a omissão fica registrada aqui. Para **(A)** ser possível, o material precisaria de: (1) uma ligação laboratório→bloco legível por código (uma coluna em §2.2 ou §3, porque hoje só há a prosa do "Marco de saída"); (2) uma §7 de 24 meses que concorde com a §3 — hoje ela nomeia "o laboratório correspondente" no singular e toma "L1 e L2" como portão do Bloco F, contra a atribuição da §3. Quem implementar: a contagem estava afirmada em **quatro** pontos de `src/ui/Trilha.tsx` no commit `5e0d460` — dois comentários e duas frases visíveis (a `dica` do `ChecklistDaTrilha` e a linha do `fase-estado`). No diretório de trabalho os quatro já tinham saído; agora está no histórico: o commit `e178217` traz as frases dizendo "as condições que a seção 7 desta trilha declara", sem o número. **Decisão tomada em 2026-09-27 e implementada.** | 6 |
| **Um FIFO sem escritor ainda bloqueia no `open(2)`.** `lerImportado` abre o arquivo uma vez e recusa o que não é arquivo comum pelo `fstat`, então diretório, FIFO e dispositivo não têm o conteúdo lido — mas o `open` de um FIFO **sem escritor** não retorna, e é antes da conferência: o handler do IPC fica sem resposta e a tela sem retorno. Sair disso pede `O_NONBLOCK` no `open`, que o `fs` do Node não expõe de forma portátil. É inerente ao arquivo especial, está declarado, e não é defeito do app | 6 |
| **O `id` que vem do material não pode mais sombrear as âncoras do app.** O `id` sobrevive à sanitização e `getElementById` devolve o primeiro elemento da árvore, então um `id="secao-10"` escrito no material desviaria o "Ir para a seção 10" da fila e o item do sumário para o texto dele; um `id="checklist-da-trilha"` desviaria o índice da trilha. O comportamento de agora, medido por sonda em 2026-09-27: `renderSeguro` prefixa todo `id` do material com `material-` (`PREFIXO_ID_MATERIAL`, em `scripts/lib/markdown.ts`), religa o href de âncora da mesma página (`#nota` → `#material-nota`), deixa `#4-temas` como veio — quem o reprova continua sendo o gate — e nunca toca no href de rota (`#/…`). A correção está na árvore de trabalho, **ainda não commitada**. Fechada no código | — |
