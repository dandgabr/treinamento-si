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

## Cinco comandos

Cinco comandos cobrem o ciclo inteiro.

| Comando | O que ele faz |
|---|---|
| `npm install` | instala as dependências. Leia a nota sobre `omit=dev` abaixo antes de rodar. |
| `npm run build:content` | lê `conteudo/` e regrava `app/src/content/generated/content.json` |
| `npm run check:content` | valida o JSON já gerado e falha o processo quando algo falta |
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

Nenhum progresso de estudo é gravado. O `localStorage` guarda uma única coisa, a preferência de tema
claro ou escuro; não há tema marcado como concluído, contador de acertos, retomada de onde parou nem
histórico de revisão espaçada. Gamificação, com pontos, marcos e sequência de dias, está fora desta
versão. O launcher, que distribuiria o app para quem não tem Node nem terminal, também.

O que a versão atual entrega é leitura, pré-teste e recuperação ativa num arquivo único. Nada além
disso, e é melhor dizer isso do que deixar alguém procurando um placar que não está lá.

## Pendências conhecidas

Levantadas na revisão de segurança e na de testes, ainda em aberto, com a fase em que entram.

| Pendência | Fase |
|---|---|
| Os 1328 links relativos (`../README.md`, `TEMA-*.md`) ficam mortos no arquivo único: precisam ser reescritos para as rotas do app. Os 586 externos abrem normalmente | 3 |
| `glossario.md` e `mapa-relacoes.md` usam `## Título` sem número, então caem inteiros no `intro` em vez de virar seções | 3 |
| 3,4 MB dos 7,6 MB do artefato são o bundle inteiro do Mermaid, e os 69 diagramas são todos `flowchart`: dá para registrar só esse tipo, com um gate no `check-content.ts` para barrar outro | 3 |
| Cerca de 1,05 MB do JSON é conteúdo morto ou duplicado: o HTML das seções 3, 9 e 10 (substituídas pelos blocos interativos) e as mesmas perguntas repetidas nos campos estruturados | 3 |
| O contrato de re-render do Mermaid mora na `key` do React, repetida em três arquivos, e remonta as seções na troca de tema; centralizar em `renderizarMermaid` | 3 |
| O laço que renderiza seções está duplicado em três arquivos, com os números das seções interativas escritos à mão | 3 |
| Acessibilidade pendente: `document.title` por rota, foco no `main` na troca de rota, link "pular para o conteúdo" e alvos de toque de 44 px | 3 |
| Extrair o parser para funções puras e instalar o Vitest — hoje `build-content.ts` e `check-content.ts` chamam `main()` no topo e não podem ser importados por teste | 2 |
| Validação de esquema do `content.json` no gate, e não só a checagem de forma que o app faz em runtime | 2 |
| `noUncheckedIndexedAccess` no `tsconfig`, que hoje deixa `content.temas[ref]` passar por `Tema` sendo `undefined` em runtime | 2 |
| O verificador do material (`conteudo/scripts/verificar-repo.py`) dá verde quando um sincronizador falha, trata o léxico apenas como aviso e não valida `templates/` nem `CONTRIBUTING.md` | 2 |
| Commit do lockfile, `npm ci` e versões exatas das seis dependências que geram o artefato; SBOM e soma de verificação por release | 7 |
| Launcher: bind em `127.0.0.1`, porta efêmera, servir um único arquivo, validar o header `Host` e usar token no caminho | 7 |
| Importação de progresso: esquema com versão, corte de tamanho antes do `JSON.parse` e cópia campo a campo (nunca merge) | 7 |
