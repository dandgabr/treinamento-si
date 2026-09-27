import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

// O mesmo alias do `vite.config.ts` e do `tsconfig.json`: a fonte do NAVEGADOR, que e a que
// existe dentro do Node (arquivo, nao `fetch`). Sem ele nenhum teste importa um modulo que
// le a fonte de conteudo — e o dominio do quiz le.
const ALIAS = { '@fonte': path.join(AQUI, 'src/infrastructure/content/fonte-web.ts') }

// Opcoes comuns aos dois projetos. Ambos precisam de fuso e de `NODE_ENV` fixos:
//   - fuso: o "dia" do progresso e local, e sem isto o resultado do teste de data dependeria
//     da maquina que roda a suite;
//   - `NODE_ENV=test`: a maquina que roda isto tem `NODE_ENV=production` no ambiente, e o
//     React de producao nao exporta `act` — o `render` do testing-library quebra com
//     "React.act is not a function". Com `test`, o React carrega a build de desenvolvimento,
//     que e a que o testing-library espera.
const COMUM = {
  env: { TZ: 'America/Sao_Paulo', NODE_ENV: 'test' },
  // O teste de contrato parseia e valida o material real (3,8 MB, com DOMPurify), o
  // que passa dos 5 s padrao numa maquina carregada.
  testTimeout: 30_000,
}

// Dois ambientes, um por projeto: o parser, o gate e as funcoes puras de dominio sao `node`;
// os testes de componente (`src/ui/`) precisam de DOM, que o jsdom fornece. O Mermaid
// continua fora dos dois, porque depende de medicao de layout que o jsdom nao faz, e por
// isso e coberto pelo smoke em navegador real.
export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias: ALIAS },
        test: {
          ...COMUM,
          name: 'node',
          include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        resolve: { alias: ALIAS },
        test: {
          ...COMUM,
          name: 'ui',
          include: ['src/ui/**/*.test.tsx'],
          environment: 'jsdom',
        },
      },
    ],
  },
})
