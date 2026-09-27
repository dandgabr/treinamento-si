import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const AQUI = path.dirname(fileURLToPath(import.meta.url))

/**
 * Build do DESKTOP: arquivos separados, servidos pelo esquema `app://`.
 *
 * Sem `viteSingleFile` e sem `inlineDynamicImports`, ao contrario do build do navegador.
 * Duas consequencias, e as duas sao o objetivo da fase:
 *
 *  - o conteudo vira `conteudo.json` ao lado do HTML, em vez de 3,8 MB de JSON dentro do
 *    JavaScript: o V8 nao precisa analisar tudo antes do primeiro render;
 *  - os tipos de diagrama do mermaid viram chunks proprios e so o `flowchart` e carregado,
 *    porque ele carrega os demais por `import()` dinamico.
 */

/** Emite o JSON gerado como arquivo do build, em vez de deixar o import inline. */
function copiarConteudo(): Plugin {
  return {
    name: 'copiar-conteudo',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'conteudo.json',
        source: fs.readFileSync(path.join(AQUI, 'src/content/generated/content.json')),
      })
    },
  }
}

/**
 * Emite o banco de questoes como UM arquivo: os 18 `src/content/questions/<areaId>.json`
 * viram um objeto `{areaId: itens[]}`, que e o que `fonte-desktop.ts` busca por `app://`.
 *
 * A juncao acontece aqui, e nao num arquivo gerado em disco, porque o banco versionado e a
 * revisao humana que mora nele: um artefato intermediario seria mais uma copia para manter
 * em dia. As areas saem ordenadas, para o mesmo material gerar sempre o mesmo arquivo.
 */
function copiarQuestoes(): Plugin {
  return {
    name: 'copiar-questoes',
    generateBundle() {
      const pasta = path.join(AQUI, 'src/content/questions')
      const banco: Record<string, unknown> = {}
      for (const arquivo of fs.readdirSync(pasta).sort()) {
        if (!arquivo.endsWith('.json')) continue
        const areaId = arquivo.replace(/\.json$/, '')
        banco[areaId] = JSON.parse(fs.readFileSync(path.join(pasta, arquivo), 'utf-8')) as unknown
      }
      this.emitFile({
        type: 'asset',
        fileName: 'questoes.json',
        source: JSON.stringify(banco),
      })
    },
  }
}

/**
 * Tira a CSP que o build do navegador precisa carregar no HTML.
 *
 * Duas razoes, e a segunda e obrigatoria: o desktop manda a CSP como cabecalho, que e mais
 * forte; e a meta do template diz `script-src 'unsafe-inline'`, sem `'self'` — como as CSPs
 * se combinam pelo mais restritivo, ela bloquearia o proprio `<script src>` deste build.
 */
function semMetaCsp(): Plugin {
  return {
    name: 'sem-meta-csp',
    transformIndexHtml(html) {
      return html.replace(/\s*<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, '')
    },
  }
}

/**
 * Descarta os chunks de diagrama que o app nao usa.
 *
 * O material so tem `flowchart` (o gate reprova qualquer outro tipo), e o mermaid emite um
 * chunk por tipo — o pacote levava 60 e poucos arquivos, sendo que desenhar um diagrama
 * carrega oito. O corte e por TIPO, e nao por nome de arquivo: os hashes mudam a cada
 * build, o prefixo nao. O `flowchart` e os utilitarios compartilhados ficam.
 *
 * A rede de seguranca e o `npm run smoke:desktop`, que desenha um diagrama de verdade: se
 * o corte levar algo necessario, o teste falha em vez de o app aparecer sem o desenho.
 */
const DIAGRAMAS_NAO_USADOS = /^([a-z0-9]+)(Diagram|-definition)-/i
// Tipos cujo chunk nao segue o padrao `XDiagram-`: `cynefin` e `swimlanes` sao nomes
// proprios no bundle do mermaid.
const NOMES_PROPRIOS_DE_OUTROS = /^(cynefin|swimlanes)-/
const PESO_DE_OUTROS = /^(katex|cytoscape\.esm|cose-bilkent)/

function soFlowchart(): Plugin {
  return {
    name: 'so-flowchart',
    generateBundle(_opcoes, bundle) {
      const removidos: string[] = []
      for (const nome of Object.keys(bundle)) {
        const arquivo = nome.replace(/^assets\//, '')
        const diagrama = DIAGRAMAS_NAO_USADOS.exec(arquivo)
        const tipo = diagrama?.[1]?.toLowerCase()
        // `flowDiagram` e o chunk do flowchart: o unico tipo que o material usa.
        const naoUsado =
          (tipo !== undefined && tipo !== 'flow') ||
          NOMES_PROPRIOS_DE_OUTROS.test(arquivo) ||
          PESO_DE_OUTROS.test(arquivo)
        if (!naoUsado) continue
        delete bundle[nome]
        removidos.push(arquivo)
      }
      console.log(`  chunks de outros diagramas removidos: ${removidos.length}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), semMetaCsp(), copiarConteudo(), copiarQuestoes(), soFlowchart()],
  resolve: {
    alias: { '@fonte': path.join(AQUI, 'src/infrastructure/content/fonte-desktop.ts') },
  },
  build: {
    outDir: 'dist-desktop',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: { inlineDynamicImports: false },
    },
  },
})
