# treinamento-si
Um repositório simples para manter uma proposta de treinamentos para futuros gestores de segurança da informação.

## Estrutura

- **[conteudo/](conteudo/README.md)** — o material: 18 áreas, 109 temas e 3 trilhas em Markdown com Mermaid. É a fonte única da verdade, e o frontmatter de cada arquivo traz a estrutura.
- **[app/](app/README.md)** — o app de estudo. Lê o Markdown acima e gera `app/dist/index.html`, um arquivo único que abre por duplo clique, sem servidor e sem rede. Pede Node 22, `npm install` e `npm run build`; o resto está no README do app.
- **[conteudo/scripts/](conteudo/scripts/)** — os sincronizadores e verificadores que mantêm as visões derivadas (mapa de relações, índices, navegação) em dia com o frontmatter.

O conteúdo e o app são separados de propósito: editar texto nunca exige mexer em código, e o app não reescreve conteúdo nenhum. O que é derivado — `app/src/content/generated/` e `app/dist/` — não vai para o controle de versão, porque sai inteiro de `conteudo/`.
