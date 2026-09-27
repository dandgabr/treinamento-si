import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/**
 * O app roda offline num arquivo unico, sem backend e sem credenciais. Esta CSP nao impede
 * XSS (o script inline do singlefile exige 'unsafe-inline'); ela corta rede e formularios,
 * que e o que um XSS conseguiria usar para exfiltrar. Freio, nao antidoto: a defesa de
 * verdade e a sanitizacao no build.
 */
const CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
  "img-src data:; font-src data:; connect-src 'none'; object-src 'none'; " +
  "base-uri 'none'; form-action 'none'"

/**
 * Poe a CSP no HTML do BUILD, e so nele.
 *
 * A meta nao pode morar no `index.html`: em `npm run dev` o Vite serve esse mesmo arquivo e
 * injeta um `<script type="module" src="/src/main.tsx">`, que a CSP (sem `'self'`) bloqueia
 * — a tela fica em branco e o console acusa a violacao. Injetada aqui, ela sai no artefato
 * publicado (que roda o script inline) e nao existe em desenvolvimento.
 *
 * O `vite.desktop.config.ts` nao usa este plugin: o desktop manda a CSP como cabecalho, que
 * e mais forte, e a meta do build de navegador bloquearia o `<script src>` dele.
 */
function cspNoBuild(): Plugin {
  return {
    name: 'csp-no-build',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `    <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n  </head>`,
      )
    },
  }
}

// Build do NAVEGADOR: arquivo unico, offline, aberto por duplo clique (file://).
// `inlineDynamicImports` e obrigatorio: o mermaid carrega os tipos de diagrama por
// import() dinamico, e um chunk externo nao seria carregado a partir de file://.
// O desktop nao tem essa restricao e usa `vite.desktop.config.ts`.
//
// `cspNoBuild` fica depois do `viteSingleFile`: o singlefile inlina o script e a folha no
// head, e a meta sai como ultimo elemento dele. A ordem nos dois sentidos foi conferida e
// gera o mesmo HTML, entao fica a que se le de cima para baixo.
export default defineConfig({
  plugins: [react(), viteSingleFile(), cspNoBuild()],
  resolve: {
    alias: { '@fonte': path.join(AQUI, 'src/infrastructure/content/fonte-web.ts') },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 20_000,
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
})
