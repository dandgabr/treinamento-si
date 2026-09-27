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

/** A mesma chave que o App le para saber o tema escolhido (`src/ui/App.tsx`). */
const CHAVE_DO_TEMA = 'roadmap:tema'

/** Os mesmos dois valores que o App grava nessa chave. */
const TEMA = { claro: 'claro', escuro: 'escuro' } as const

/**
 * Escreve a escolha de tema guardada ANTES da primeira pintura.
 *
 * A tela de carregamento e pintada pelo `<style>` do `index.html`, que sozinho so sabe seguir
 * o sistema. Quem escolheu "escuro" num sistema claro via a tela clara e o app escuro logo
 * depois — e "logo depois" nao e instantaneo num bundle de 8,6 MB. O script adianta a leitura
 * que o App faria na montagem, escrevendo o mesmo `data-theme`.
 *
 * Ele entra por aqui, e nao no `index.html`, porque o desktop serve esse mesmo arquivo com
 * `script-src 'self'`, sem `'unsafe-inline'`: um `<script>` inline no fonte seria bloqueado
 * la. O desktop tambem nao precisa dele — a janela so aparece pronta (`ready-to-show`).
 *
 * Entra logo depois dos dois `<meta>` do topo, antes de tudo o que o build injeta: a posicao
 * e o que garante que ele rode antes do bundle.
 */
function temaAntesDaPintura(): Plugin {
  const codigo = `
      try {
        var escolha = window.localStorage.getItem('${CHAVE_DO_TEMA}')
        if (escolha === '${TEMA.claro}' || escolha === '${TEMA.escuro}') {
          document.documentElement.dataset.theme = escolha
        }
      } catch (erro) {
        // Armazenamento negado (file:// em alguns navegadores, janela privada): a tela de
        // carregamento fica com a preferencia do sistema, que e o que ela sabe pintar.
      }
`
  const DEPOIS_DO_META =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
  return {
    name: 'tema-antes-da-pintura',
    transformIndexHtml(html) {
      return html.replace(DEPOIS_DO_META, `${DEPOIS_DO_META}\n    <script>${codigo}    </script>`)
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
  plugins: [react(), viteSingleFile(), cspNoBuild(), temaAntesDaPintura()],
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
