# treinamento-si
Um repositório simples para manter uma proposta de treinamentos para futuros gestores de segurança da informação.

## Estrutura

- **[conteudo/](conteudo/README.md)** — o material: 18 áreas, 109 temas e 3 trilhas em Markdown com Mermaid. É a fonte única da verdade, e o frontmatter de cada arquivo traz a estrutura.
- **[app/](app/README.md)** — o aplicativo de estudo, em TypeScript e React, com um renderer só e duas formas de entregar:
  - **aplicativo desktop** (Electron), o caminho principal: menu próprio, progresso num arquivo e sem terminal;
  - **pasta com atalho** (`npm run empacotar`), para quem não quer instalar nada: clica em Iniciar e o navegador abre.
- **[conteudo/scripts/](conteudo/scripts/)** — os sincronizadores e verificadores que mantêm as visões derivadas (mapa de relações, índices, navegação) em dia com o frontmatter.

Quem **estuda** não precisa de nada instalado: recebe a pasta ou o instalador e clica. Quem **constrói** precisa de Node 22, `npm install` e `npm run desktop` (ou `npm run empacotar`); o resto está no README do app.

O conteúdo e o app são separados de propósito: editar texto nunca exige mexer em código, e o app não reescreve conteúdo nenhum. O que é derivado — `app/src/content/generated/`, `app/dist/` e `app/dist-electron/` — não vai para o controle de versão.
