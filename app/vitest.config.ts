import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

// Ambiente node por padrao: o que se testa aqui e o parser, o gate e as funcoes puras
// de dominio. Nenhum teste desta fase toca o DOM — o mermaid depende de medicao de
// layout, que o jsdom nao faz, e por isso e coberto pelo smoke em navegador real.
export default defineConfig({
  // O mesmo alias do `vite.config.ts` e do `tsconfig.json`. O Vitest le este arquivo em vez
  // do `vite.config.ts`, entao sem a linha abaixo nenhum teste consegue importar um modulo
  // que le a fonte de conteudo — e o dominio do quiz le. Aponta para a fonte do navegador,
  // que e a que existe dentro do Node (arquivo, nao `fetch`).
  resolve: { alias: { '@fonte': path.join(AQUI, 'src/infrastructure/content/fonte-web.ts') } },
  test: {
    include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
    // O teste de contrato parseia e valida o material real (3,8 MB, com DOMPurify), o
    // que passa dos 5 s padrao numa maquina carregada.
    testTimeout: 30_000,
    // Fuso fixo: o "dia" do progresso e local, e sem isto o resultado do teste de data
    // dependeria da maquina que roda a suite.
    env: { TZ: 'America/Sao_Paulo' },
  },
})
