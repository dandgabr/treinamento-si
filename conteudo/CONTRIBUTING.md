# Regras de autoria e verificação

Este repositório é um roadmap de estudos de segurança da informação para um CISO com pouca base
técnica. Ele é escrito em **Markdown + Mermaid**, organizado por **área** (pasta) e **tema**
(arquivo). Estas regras valem para todo arquivo criado aqui.

---

## 1. Convenções de nomes

| Elemento | Convenção | Exemplo |
|---|---|---|
| Área (pasta) | `NN-slug`, dois dígitos | `01-fundamentos` |
| Guia da área | sempre `README.md` na pasta da área | `01-fundamentos/README.md` |
| Tema | `TEMA-NN-slug.md` | `01-fundamentos/TEMA-03-risco.md` |
| Template | `TEMPLATE-<tipo>.md` em `templates/` | `templates/TEMPLATE-tema.md` |
| Certificações | `NN-fornecedor.md` | `90-certificacoes/01-comptia.md` |
| Trilha | `plano-<horizonte>.md` | `91-trilhas/plano-90-dias.md` |

**Numeração não é ordem.** A pasta guarda a identidade da área; a ordem de estudo é o campo
`ordem_estudo` do frontmatter, consolidado na tabela do README raiz.

**Nunca linke por nome de arquivo de tema.** Inserir um tema no meio renumera os seguintes e
quebra links. Linke por `tema_id` (frontmatter) ou por âncora na tabela de temas, como
`[TEMA-03](TEMA-03-risco.md)`.

Evite o substantivo nu `README` como texto de link: existem mais de 20 arquivos com esse nome.
Use sempre o display text da área, como `[01 Fundamentos](../01-fundamentos/README.md)`.

Equivalência com o roadmap.sh: o `README.md` da área faz o papel do arquivo de metadados
(frontmatter YAML com a estrutura) e cada `TEMA-*.md` faz o papel do
`src/data/roadmaps/{id}/content/{topico}@{id}.md`.

## 2. Qual template usar

| Você vai escrever | Use |
|---|---|
| Guia de uma área | `templates/TEMPLATE-guia-area.md` |
| Um tema | `templates/TEMPLATE-tema.md` |
| Uma trilha | `templates/TEMPLATE-plano-estudo.md` |
| Certificações | `templates/TEMPLATE-certificacoes.md` |
| Glossário | `templates/TEMPLATE-glossario.md` |

O esquema das chaves YAML está em `templates/FRONTMATTER.md`. Não invente chaves.

As regras de relação entre temas, inclusive entre áreas diferentes, estão em
`templates/RELACOES-TEMAS.md`.

Nenhum arquivo novo nasce fora desses cinco formatos. Se um conteúdo não couber em nenhum,
proponha um template novo antes de escrever.

**Artefato derivado não é arquivo do material**, e por isso não usa template nenhum. São dois:
`app/src/content/generated/content.json`, que é o material lido pelo aplicativo, e o banco de
questões em `app/src/content/questions/`, que é o material transformado em item de múltipla escolha.
Os dois saem de script, a partir do Markdown, e não têm frontmatter, seção nem prosa própria. Quem
faz o papel do template neles é o gate do aplicativo — `npm run check:content` e
`npm run check:questions` —, descrito no `README.md` de `app/`. Escrever à mão não adianta: o gerador
regrava o arquivo inteiro, e a única coisa que sobrevive de uma edição manual é o campo `status` do
item de questão — o texto editado à mão nem passa pelo gate, que confere item a item contra o que o
material deriva.

## 3. Dono único de cada informação

Duplicar informação garante divergência. Cada dado tem um só lugar:

| Informação | Dono | Quem apenas referencia |
|---|---|---|
| Definição de termo | `glossario.md` | áreas, que listam os termos (seção 9) |
| Domínios, pesos, custo de certificação | `90-certificacoes/` | guia (siglas) e tema (domínio coberto) |
| Itens de recuperação ativa | tema, seção 10 | guia, que monta o somativo intercalado |
| Calendário e estado de revisão espaçada | `91-trilhas/`, que define a cadência, a regra de rebaixamento e o formato do registro | o aplicativo, que guarda o estado de cada usuário em runtime; tema, que sugere os intervalos |
| Critério de aprovação do checkpoint | o guia da área, seção 9 | a trilha, que pode recomendar escopo menor para o seu horizonte; o aplicativo, que lê o critério do guia |
| Fontes verificadas | cada documento, para as próprias afirmações | `99-fontes/`, que indexa |
| Relações entre temas | o `relacoes` do frontmatter do tema | o guia da área e `mapa-relacoes.md`, que são visões derivadas |
| Item de múltipla escolha | o banco em `app/src/content/questions/`: o item sai do tema pela `origem` declarada (tabela de erros comuns ou par de recuperação ativa), e o `status` de revisão pertence a quem audita o item | o aplicativo, que exibe o item com o selo de revisão; o tema de origem (`ref`), que é a linha de onde o texto saiu |

O item de múltipla escolha entra nesta tabela com uma consequência que os outros donos não têm.
`status: "verificado"` não quer dizer que alguém escreveu o texto: quer dizer que uma pessoa
conferiu a **fonte herdada do tema contra a linha de origem**, que é a auditoria de citação do §4
aplicada a um texto que ninguém redigiu aqui. Se a linha de origem mudar, o item é outro e volta para
`rascunho` — o gerador compara o texto derivado com o que estava marcado e derruba o `verificado`
sozinho, porque perder a revisão é o lado certo do erro. O passo a passo da promoção está no
`README.md` de `app/`.

## 4. Protocolo de verificação de fontes

1. **Nenhuma afirmação normativa sem fonte.** Domínio de exame, percentual, versão de framework,
   prazo legal e obrigação regulatória exigem **fonte primária**: o site ou PDF oficial de quem
   publica a norma.
2. **Hierarquia:** primária (fornecedor, NIST, ISO, ENISA, ACM/IEEE) > acadêmica (com DOI) >
   secundária (blogs, agregadores). A secundária nunca sustenta um número; serve de pista para
   chegar à primária.
3. **Toda fonte carrega URL e data de acesso**, no formato definido em `templates/FRONTMATTER.md`.
4. **Rótulo de incerteza.** O que não for confirmado é escrito literalmente como
   `NAO CONFIRMADO em fonte oficial`. Nunca preencher por inferência, analogia ou memória.
5. **Registro central** em `99-fontes/registro-verificacao.md`: data, URL, o que foi confirmado.
6. **Frescor.** `atualizado_em` e `revisar_ate` são obrigatórios. Documento de certificação ou de
   regulação tem revisão obrigatória em até 12 meses.
7. **Direitos autorais.** Materiais de exame são protegidos: parafraseie domínios e objetivos,
   nunca reproduza a lista oficial literalmente.
8. **Auditoria.** Nada recebe `status_verificacao: verificado` antes de uma auditoria de citação
   que compare o texto com as URLs citadas.

## 5. Escrita: evitar cara de texto gerado por IA

O molde é repetitivo por natureza; o texto não pode ser.

- **Não publique metadiscurso.** "Leia a introdução para formar o mapa mental" é manual de uso,
  não conteúdo. Instruções de uso ficam no CONTRIBUTING; o documento começa no fato.
- **Abra cada seção com um fato específico** — um número, uma data, um nome próprio. Não com
  "Nesta seção veremos...".
- **Léxico proibido:** os bordões do texto gerado — "mergulhe", "robusto", "abrangente",
  "no mundo atual", "cada vez mais", "vale destacar", "não é apenas X, é Y",
  "jornada de aprendizado", "no cenário atual". Palavras comuns em sentido próprio **não**
  entram na lista: "jornada de trabalho" é termo jurídico e descrever um cenário concreto é
  uso legítimo. O que se proíbe é o bordão, não a palavra.
- **Varie a cadência.** Alterne frases curtas e longas. Estrutura uniforme em todos os parágrafos
  é a assinatura mais visível de texto gerado.
- **Evite o tricolon decorativo** e os travessões em pares.
- **Títulos não podem ser todos paralelos** em substantivo abstrato.

## 6. Estrutura obrigatória

### 6.1 Guia de área (`README.md`)
Introdução factual → objetivos terminais → diagrama Mermaid → tabela de temas → pré-requisitos →
certificações (siglas e link) → conexões com outras áreas → atividades práticas → checkpoint
intercalado → termos (links) → fontes verificadas.

### 6.2 Tema (`TEMA-*.md`)
Objetivo → pré-requisitos → pré-teste com calibração de confiança → caso real → conteúdo
(conceito, mecânica, exemplo resolvido, problema de completar) → por que importa para o CISO →
aplicação prática → autoexplicação → erros comuns → recuperação ativa → revisão espaçada →
conexões com outros temas → certificações e leitura → fontes verificadas.

## 7. Diagramas Mermaid

- Sintaxe `flowchart TD` com rótulos em `[...]`.
- **Proibido nos rótulos:** `<`, `>`, `"`, `(`, `)`, `#`. O GitHub sanitiza `<` como HTML e o nó
  desaparece ou quebra o parse. O ampersand **não** entra na lista: `ATT&CK` é rótulo legítimo.
- **Proibido** usar `end` como id de nó (palavra reservada, sensível a maiúsculas).
- Não usar `click` nem links em nós: o GitHub descarta.
- Não usar `%%{init}%%`: o GitHub bloqueia.
- **Conferir o render no GitHub e no Obsidian** antes de commitar.

<!-- O bloco abaixo é a forma legível por máquina das regras acima, e é a única cópia delas:
     `scripts/verificar-repo.py` e o gate do app (`app/scripts/lib/validar-content.ts`) leem
     daqui. O verificador confere que a prosa desta seção concorda com o bloco — se um dos dois
     mudar sozinho, a verificação reprova em vez de deixar as duas versões conviverem. -->
<!-- contrato-mermaid: {"rotulos_proibidos": ["<", ">", "\"", "(", ")", "#"], "ids_proibidos": ["end"], "diretivas_proibidas": ["%%{init"], "recursos_proibidos": ["click"]} -->

## 8. Andragogia aplicada (Knowles)

| Pressuposto | Regra concreta |
|---|---|
| Necessidade de saber o porquê | O bloco "Por que isso importa para o CISO" vem antes de qualquer detalhe técnico. |
| Autoconceito | A sequência é sugestão, não pré-requisito rígido. |
| Papel da experiência | Todo tema abre com pré-teste e caso real, ligados ao contexto do leitor. |
| Prontidão para aprender | Exemplos ancorados em orçamento, board, auditoria e incidente. |
| Orientação para problemas | Toda área tem aplicação prática; nada é só conceitual. |
| Motivação interna | Marcos e autoavaliação; sem gamificação artificial. |

Design instrucional: estrutura macro em **ADDIE**, áreas construídas em ciclos **SAM** — o piloto é
o protótipo mínimo antes de escalar.

Nota de precisão: a fonte de referência ([SAGE Encyclopedia, verbete *Andragogy*](https://sk.sagepub.com/ency/edvol/sage-encyclopedia-of-educational-research-measurement-evaluation/chpt/andragogy), verificado em 25/09/2026) lista, além dos seis pressupostos do aprendiz, **quatro pressupostos sobre o ambiente de aprendizagem**. Este repositório aplica os seis primeiros; os quatro do ambiente ficam fora do escopo, e a omissão é declarada em vez de silenciosa.

Evidência cognitiva (Dunlosky et al., 2013, DOI 10.1177/1529100612453266): recuperação ativa
(itens antes do gabarito), prática espaçada com estado, intercalação nos somativos, exemplos
resolvidos com retirada gradual de apoio, e uma ideia central por tema para conter a carga
cognitiva.

## 9. Uso de agentes

- **Teto:** no máximo 4 subagentes simultâneos (5 agentes ativos com o orquestrador).
- **Orçamento por agente:** até 10 fontes primárias e cerca de 25 chamadas de ferramenta. Ao
  atingir o teto, retornar o parcial com o que falta marcado como pendente.
- **Fatiamento:** um agente por tema ou por fornecedor. Nunca "a área inteira".
- **Retorno:** tabela mais URLs mais rótulo de confiança. Sem prosa longa.
- **Rate-limit (429):** pausar, esperar a fila baixar, relançar com backoff exponencial.
- **Regra de ouro:** conteúdo de agente não é publicado sem auditoria de citação e revisão
  linguística.

## 10. Definição de pronto

- [ ] Frontmatter conforme `templates/FRONTMATTER.md`, com `fontes` preenchidas.
- [ ] Objetivo mensurável: verbo observável mais conteúdo mais critério.
- [ ] Diagrama Mermaid presente no guia da área e conferido nos dois renderizadores.
- [ ] Bloco "Por que isso importa para o CISO" presente em todo tema.
- [ ] Pré-teste, recuperação ativa e problema de completar presentes no tema.
- [ ] Intervalos de revisão espaçada declarados, com regra de rebaixamento em caso de erro.
- [ ] Toda afirmação normativa rastreável a fonte primária com URL e data de acesso.
- [ ] Nenhuma informação duplicada fora do seu dono (seção 3).
- [ ] Nenhum termo do léxico proibido; cadência variada.
- [ ] Links por `tema_id` ou âncora, nunca por nome de arquivo renumerável.
- [ ] Relações declaradas no frontmatter `relacoes`, com `motivo`, e o par simétrico atualizado do outro lado.
- [ ] `python3 scripts/relacoes.py` sem erros.
- [ ] `status_verificacao: verificado` apenas após auditoria de citação.

## 11. Fluxo de revisão

`rascunho` → formatação no template → revisão de escrita (seção 5) → auditoria de citação →
`verificado`.

## 12. Scripts do repositório

Tudo o que é visão derivada é gerado — escrever à mão garante divergência. Rode na ordem:

| Script | O que faz | Escreve? |
|---|---|---|
| `scripts/relacoes.py` | valida as relações e gera `mapa-relacoes.md` | sim |
| `scripts/sincronizar-guias.py` | regenera a seção "Conexões com outras áreas" de cada guia | sim |
| `scripts/sincronizar-conexoes-temas.py` | regenera a seção "Conexões com outros temas" de cada tema | sim |
| `scripts/sincronizar-navegacao.py` | regenera o rodapé de navegação dos 18 guias e dos 109 temas a partir do `ordem_estudo` | sim |
| `scripts/reconciliar-simetria.py` | espelha relações simétricas declaradas em um só lado; acusa conflito de tipo | sim |
| `scripts/limpar-pendentes.py` | remove `pendente: true` cujo alvo já existe | sim |
| `scripts/gerar-indice-fontes.py` | gera `99-fontes/indice-fontes.md` a partir do frontmatter | sim |
| `scripts/auditar-arquivos.py` | auditoria estrutural arquivo por arquivo; gera `99-fontes/auditoria-arquivos.md` | sim |
| `scripts/checar-links.py` | status HTTP de cada URL citada; gera `99-fontes/status-links.md` | sim |
| `scripts/gerar-fila-auditoria.py` | ranqueia os arquivos por risco; gera `99-fontes/fila-auditoria-humana.md` | sim |
| `scripts/verificar-repo.py` | auditoria mecânica: frontmatter, léxico, Mermaid, links, estrutura, visões derivadas, fichas de `templates/` e esta convenção | não |

Todos aceitam `--check` para conferir sem escrever, e nesse modo terminam com a linha
`CHECK <script> <n>` e reprovam quando a visão derivada está velha — é assim que
`verificar-repo.py` sabe que o sincronizador rodou até o fim. Exceção: o próprio
`verificar-repo.py`, que não escreve em modo nenhum.
O ciclo completo antes de considerar uma onda encerrada:

```
python3 scripts/limpar-pendentes.py
python3 scripts/reconciliar-simetria.py
python3 scripts/relacoes.py
python3 scripts/sincronizar-guias.py
python3 scripts/sincronizar-conexoes-temas.py
python3 scripts/sincronizar-navegacao.py
python3 scripts/gerar-indice-fontes.py
python3 scripts/auditar-arquivos.py
python3 scripts/checar-links.py
python3 scripts/gerar-fila-auditoria.py
python3 scripts/verificar-repo.py
```

`verificar-repo.py` roda **todos** os sincronizadores em modo `--check` e reprova se o corpo
divergir da fonte. Ele exige a linha final `CHECK <script> <n>` de cada um: sem ela, um
sincronizador que morre no meio não imprime divergência nenhuma e a conferência passaria verde.
Também reprova o bordão da seção 5 (que antes era só aviso), a ficha de `templates/` que
contraria o esquema de `templates/FRONTMATTER.md`, e esta convenção quando ela cita um arquivo
que não existe. O que ele **não** cobre: o que o app deriva — `app/src/content/generated/content.json`
e o banco de questões. Isso é do gate do app (`npm run check:content` e `check:questions`), que
regera e compara; o verificador daqui não roda Node e não tem como regerar esses arquivos.

## 13. Limite conhecido: fontes que bloqueiam leitura automatizada

Alguns publicadores respondem 403 a requisições HTTP simples (`urllib`, `curl`) — na checagem desta
sessão, toda a ISO (`iso.org`), a SAGE (DOI do Dunlosky) e a SEC. Isso é um limite do **verificador
de links**, não necessariamente do conteúdo: as mesmas páginas foram lidas com um navegador real e
confirmaram 14 fatos normativos nesta sessão, incluindo edições e datas de retirada.

Como proceder:

1. `checar-links.py` marca o domínio como "bloqueio a cliente automatizado". Não trate isso como
   link morto.
2. Para confirmar o conteúdo, abra a página em navegador e registre a confirmação em
   `99-fontes/registro-verificacao.md`.
3. Se nem o navegador abrir, troque por fonte aberta equivalente (o NIST e o RFC Editor respondem
   sempre) ou remova a afirmação.
4. Onde a única fonte for bloqueada e não conferida, o campo `confianca` daquela entrada **não**
   deve ser `alta`, e o arquivo aparece na fila de conferência manual
   (`99-fontes/fila-auditoria-humana.md`).

**Lacuna de acesso não é lacuna de pesquisa.** Preço de exame é o caso típico: nenhum fornecedor
publica valor em página estática — CompTIA, ISC2 e EC-Council só mostram o preço dentro do fluxo de
compra. Quando for esse o motivo, o documento deve dizer isso, e não deixar o leitor supor que
ninguém procurou.
