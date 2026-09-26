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
| `npm run build` | encadeia `build:content`, `check:content` e `vite build` |
| `npm run smoke` | abre o artefato por `file://` num Chrome headless e confere o DOM renderizado |

A ordem tem uma dependência real: `check:content` lê o JSON em disco, então sozinho ele não adianta
nada. O `dev` também não vigia `conteudo/`. Editou um tema com o servidor no ar? Rode
`npm run build:content` de novo e a página recarrega com o texto novo.

O `smoke` exige o build feito antes e o Chrome instalado. Em outra máquina, aponte o binário pela
variável `CHROME_BIN`.

## O que sai do build

A build inteira vira um arquivo: `app/dist/index.html`, com 7,6 MB na última execução. Ele abre por
`file://`, roda offline e não pede nada instalado na máquina de quem vai estudar. Esse é o formato
inteiro do produto, e é o motivo de `inlineDynamicImports` estar ligado no `vite.config.ts`: o
Mermaid carrega os tipos de diagrama por `import()` dinâmico e um chunk externo não seria lido a
partir de `file://`.

`dist/` está no `.gitignore` da raiz, então o HTML pronto não vai para o controle de versão. Quem
quiser o arquivo precisa gerá-lo.

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
designação formal (Resolução CMN 4.893/2021, art. 7º), não conquista. Ficaram as três coisas
acionáveis ou verificáveis, cada uma exibida com a régua ao lado: a **fila de hoje** (com link para
cada tema), os **temas firmes** e os **checkpoints aprovados** no critério que o guia declara.

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

- tiver contagem de áreas ou de temas diferente de 18 e 109;
- perder o bloco "Por que isso importa" (a ancoragem no cargo do CISO);
- perder a seção "Recuperação ativa", ou ficar com menos de 2 itens nela;
- publicar item de recuperação sem gabarito;
- chegar sem `fontes` no frontmatter;
- ficar sem a tabela de erros comuns;
- zerar o pré-teste;
- apontar relação para tema inexistente, para alvo sem `#` ou sem `motivo`;
- deixar guia de área sem checkpoint, ou com checkpoint sem gabarito ou sem critério declarado;
- usar qualquer uma das 12 expressões do léxico proibido da seção 5 do `CONTRIBUTING`.

O gate imprime `verificado: 18 areas, 109 temas, 22 paginas` quando passa. Quando falha, lista cada
erro e sai com código 1, o que derruba o `npm run build` antes de o Vite entrar em ação.

## Por que existe um `.npmrc` aqui dentro

O npm configurado nesta máquina define `omit=dev` no nível do usuário, e essa opção pula as
devDependencies. Vite, TypeScript, `tsx`, `gray-matter`, `markdown-it` e `dompurify` vivem todas ali.
O sintoma é cruel: o `npm install` termina dizendo sucesso e o build morre em `vite: command not
found`.

O arquivo `app/.npmrc` inverte a omissão só neste projeto, com uma linha: `include=dev`. Ele precisa
continuar existindo. Se desaparecer, o caminho alternativo é `npm install --include=dev`.

## O que ainda não existe

O progresso é gravado no navegador (`localStorage`, chave `roadmap:progresso`): leitura, confiança
do pré-teste, veredito da recuperação com a revisão reagendada e resultado do checkpoint. Não há
botão para recomeçar nem para exportar; os dois entram com a exportação.

Esse progresso é **local e não confidencial**. Em `file://`, no Chrome, todos os arquivos HTML
locais compartilham o mesmo armazenamento — qualquer página local aberta no mesmo perfil enxerga a
mesma chave. No Firefox o balde é por arquivo. Não guarde nada sensível ali, e note que apagar o
progresso também não tem caminho pela interface ainda.

O launcher, que distribuiria o app para quem não tem Node nem terminal, também não existe: hoje o
usuário final precisa de Node 22 e de dois comandos. A promessa de "abrir com um clique em qualquer
sistema" depende dele, e é o próximo passo.

## Pendências conhecidas

Levantadas nas revisões de segurança, de testes, de frontend e de UI/UX, ainda em aberto, com a fase
em que entram.

| Pendência | Fase |
|---|---|
| Regras do material ainda não implementadas: "duas passagens falhas seguidas mandam para releitura completa" (`plano-12-meses.md`), revisão além de D+90, a tarefa concreta de cada intervalo, o artefato da fase e o diagnóstico por item (hoje é um booleano por tema) | 4 |
| Os 1328 links relativos (`../README.md`, `TEMA-*.md`) ficam mortos no arquivo único: precisam ser reescritos para as rotas do app. Os 586 externos abrem normalmente | 3 |
| A fila de hoje agora é clicável, mas só lista os cinco primeiros: falta paginar ou abrir a lista inteira | 3 |
| Os vereditos por item do checkpoint vivem em `useState`: o total persiste, mas após recarregar os botões voltam em branco, com o texto dizendo "último resultado registrado" | 3 |
| Não há como recomeçar nem exportar o progresso; em `file://` no Chrome ele é compartilhado por qualquer HTML local | 7 |
| `npm run dev` não funciona: a CSP do `index.html` bloqueia o `<script src>` que o Vite injeta. O `<meta>` precisa ser injetado só no build | 3 |
| Diagramas: falta um botão de ampliar (o fluxograma tem ~3000 px e rola na horizontal) e `aria-label` no SVG. Cabeçalho de tabela longa sem `position: sticky` | 3 |
| Escala de confiança do pré-teste: alvos de 29 px, sem rótulo nas pontas (o que é 1 e o que é 5) e 25 paradas de tabulação no bloco | 3 |
| Acessibilidade: `document.title` fixo em todas as rotas, foco não vai para o `main` na troca de rota, falta link "pular para o conteúdo" e alvos de 44 px no celular | 3 |
| Tema escuro não segue `prefers-color-scheme` e a primeira tela pisca branca enquanto o bundle de 7,6 MB monta | 3 |
| Páginas de 35 mil px (mapa de relações) sem sumário ou âncoras; as 6 páginas de `99-fontes/` aparecem no menu do aluno, mas são a trilha de QA do mantenedor | 3 |
| Sobre o JSON: o HTML das seções 3 e 10 dos temas (~0,25 MB) e o campo `errosComuns` nunca chegam à tela; o §9 dos guias é renderizado, ao contrário do que esta tabela dizia antes | 3 |
| `glossario.md` e `mapa-relacoes.md` usam `## Título` sem número e caem inteiros no `intro`, sem seções | 3 |
| 3,4 MB dos 7,6 MB do artefato são o bundle inteiro do Mermaid, e os 69 diagramas são todos `flowchart`: dá para registrar só esse tipo | 3 |
| O contrato de re-render do Mermaid mora na `key` do React, repetido em três arquivos, e o laço de seções também está triplicado | 3 |
| O verificador do material dá verde quando um sincronizador falha, trata o léxico apenas como aviso e não valida `templates/` nem `CONTRIBUTING.md` | 2 ou depois |
| Importação de progresso: esquema com versão, corte de tamanho antes do `JSON.parse` e cópia campo a campo (nunca merge). A leitura do `localStorage` já faz isso | 7 |
| Launcher: bind em `127.0.0.1`, porta efêmera, servir um único arquivo, validar o header `Host` e usar token no caminho. É o próximo passo, e é o que falta para a promessa de um clique | próxima |
| Commit do lockfile (feito), `npm ci` e versões exatas; SBOM e soma de verificação por release. Há um advisory `dev-only` no Vitest | 7 |
