import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build em arquivo unico, offline, aberto por duplo clique (file://).
// `inlineDynamicImports` e obrigatorio: o mermaid carrega os tipos de diagrama por
// import() dinamico, e um chunk externo nao seria carregado a partir de file://.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
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
