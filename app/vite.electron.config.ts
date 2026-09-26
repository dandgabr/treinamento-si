import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

// Build do processo principal e do preload, separado do build da interface.
// CommonJS de proposito: o preload roda em sandbox e so aceita esse formato.
export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    target: 'node20',
    minify: false,
    lib: {
      entry: {
        main: path.join(AQUI, 'electron/main.ts'),
        preload: path.join(AQUI, 'electron/preload.ts'),
      },
      formats: ['cjs'],
      fileName: (_formato, nome) => `${nome}.cjs`,
    },
    rollupOptions: {
      external: [/^node:/, 'electron'],
    },
  },
})
