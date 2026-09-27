import conteudo from '../../content/generated/content.json'
import banco00 from '../../content/questions/00-guia-basico.json'
import banco01 from '../../content/questions/01-fundamentos.json'
import banco02 from '../../content/questions/02-governanca-risco-compliance.json'
import banco03 from '../../content/questions/03-arquitetura-engenharia.json'
import banco04 from '../../content/questions/04-identidade-acesso.json'
import banco05 from '../../content/questions/05-rede-infraestrutura.json'
import banco06 from '../../content/questions/06-endpoint-plataforma.json'
import banco07 from '../../content/questions/07-criptografia-segredos.json'
import banco08 from '../../content/questions/08-cloud.json'
import banco09 from '../../content/questions/09-aplicacoes-devsecops.json'
import banco10 from '../../content/questions/10-operacoes-soc.json'
import banco11 from '../../content/questions/11-resposta-forense.json'
import banco12 from '../../content/questions/12-vulnerabilidades-threat-intel.json'
import banco13 from '../../content/questions/13-ofensiva-pentest.json'
import banco14 from '../../content/questions/14-dados-privacidade.json'
import banco15 from '../../content/questions/15-fatores-humanos.json'
import banco16 from '../../content/questions/16-ia-seguranca.json'
import banco17 from '../../content/questions/17-lideranca-ciso.json'

/**
 * Fonte de conteudo da build de NAVEGADOR.
 *
 * O JSON entra inline no JavaScript de proposito: este build e um arquivo unico, aberto por
 * duplo clique, e `file://` nao carrega nada externo — nem chunk, nem `fetch`. Trocar esta
 * fonte e a unica diferenca entre o build web e o do desktop (ver `fonte-desktop.ts`).
 */
export function lerConteudoBruto(): Promise<unknown> {
  return Promise.resolve(conteudo as unknown)
}

/**
 * O banco de multipla escolha, tambem inline: sao 18 arquivos, escritos a mao um a um porque
 * `import` estatico e o unico jeito que `file://` aceita. A chave e o `areaId`, o mesmo nome
 * do arquivo — e o mesmo que `src/content/questions/` e `scripts/check-questions.ts` usam.
 */
const BANCO: Record<string, unknown> = {
  '00-guia-basico': banco00,
  '01-fundamentos': banco01,
  '02-governanca-risco-compliance': banco02,
  '03-arquitetura-engenharia': banco03,
  '04-identidade-acesso': banco04,
  '05-rede-infraestrutura': banco05,
  '06-endpoint-plataforma': banco06,
  '07-criptografia-segredos': banco07,
  '08-cloud': banco08,
  '09-aplicacoes-devsecops': banco09,
  '10-operacoes-soc': banco10,
  '11-resposta-forense': banco11,
  '12-vulnerabilidades-threat-intel': banco12,
  '13-ofensiva-pentest': banco13,
  '14-dados-privacidade': banco14,
  '15-fatores-humanos': banco15,
  '16-ia-seguranca': banco16,
  '17-lideranca-ciso': banco17,
}

export function lerBancoBruto(): Promise<unknown> {
  return Promise.resolve(BANCO)
}
