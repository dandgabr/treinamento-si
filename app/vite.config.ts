import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

// Build do NAVEGADOR: arquivo unico, offline, aberto por duplo clique (file://).
// `inlineDynamicImports` e obrigatorio: o mermaid carrega os tipos de diagrama por
// import() dinamico, e um chunk externo nao seria carregado a partir de file://.
// O desktop nao tem essa restricao e usa `vite.desktop.config.ts`.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
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
