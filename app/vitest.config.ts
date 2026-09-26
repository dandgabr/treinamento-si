import { defineConfig } from 'vitest/config'

// Ambiente node por padrao: o que se testa aqui e o parser, o gate e as funcoes puras
// de dominio. Nenhum teste desta fase toca o DOM — o mermaid depende de medicao de
// layout, que o jsdom nao faz, e por isso e coberto pelo smoke em navegador real.
export default defineConfig({
  test: {
    include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'node',
  },
})
