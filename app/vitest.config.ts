import { defineConfig } from 'vitest/config'

// Ambiente node por padrao: o que se testa aqui e o parser, o gate e as funcoes puras
// de dominio. Nenhum teste desta fase toca o DOM — o mermaid depende de medicao de
// layout, que o jsdom nao faz, e por isso e coberto pelo smoke em navegador real.
export default defineConfig({
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
