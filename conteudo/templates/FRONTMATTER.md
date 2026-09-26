# Esquema do frontmatter

Registro único das chaves YAML usadas nos cinco templates. Qualquer documento novo deve
seguir exatamente estes nomes — não invente variações.

## Chaves comuns

| Chave | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| `escopo` | string | sim (home e índices) | Identifica o documento quando ele não segue um dos cinco templates: home, índice de certificações, índice de trilhas. |
| `status_verificacao` | enum | sim | `rascunho` → `pendente` → `verificado` |
| `atualizado_em` | data (string) | sim | Data da última edição. **Sempre entre aspas** (`"2026-09-25"`), para o Obsidian não coagir a tipo data. |
| `revisar_ate` | data (string) | sim | Prazo de revisão. Obrigatório para temas de certificação e de regulação (máx. 12 meses). |
| `fontes` | lista de objeto | sim | Ver schema abaixo. |
| `nivel` | enum | sim | `base` \| `intermediario` \| `avancado` |

## Schema de `fontes`

```yaml
fontes:
  - titulo: "CompTIA Security+ SY0-701 Exam Objectives"
    url: "https://assets.ctfassets.net/.../CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf"
    tipo: primaria          # primaria | academica | secundaria
    acessado_em: "2026-09-25"
    confianca: alta         # alta | media | baixa
```

A ordem das chaves acima é a mesma das colunas das tabelas de corpo
(`Título | Tipo | URL | Acessado em | Confiança`).

## Schema de `relacoes`

Vínculos do tema com outros temas, inclusive de áreas diferentes. Regras completas em
[RELACOES-TEMAS.md](./RELACOES-TEMAS.md).

```yaml
relacoes:
  complementa:                      # simétrica
    - alvo: "05-rede-infraestrutura#TEMA-04"
      motivo: "zero trust não fecha sem segmentação"
  aprofundado_por: []               # dirigida
  aplicado_em: []                   # dirigida
  nao_confundir_com: []             # simétrica
```

| Chave | Simétrica | Alvo |
|---|---|---|
| `complementa` | sim | `area_id#tema_id`, com `motivo` |
| `nao_confundir_com` | sim | `area_id#tema_id`, com `motivo` |
| `aprofundado_por` | não | `area_id#tema_id`, com `motivo` |
| `aplicado_em` | não | `area_id#tema_id`, com `motivo` |

Teto de 5 relações por tema. Alvo ainda não escrito precisa de `pendente: true`.

## Chaves por template

| Template | Chaves |
|---|---|
| Guia de área (`README.md` da área) | `area_nome`, `area_id`, `ordem_estudo`, `nivel`, `ancoragem`, `certificacoes`, `pre_requisitos`, `temas`, `fontes`, `atualizado_em`, `revisar_ate`, `status_verificacao` |
| Tema (`TEMA-*.md`) | `tema`, `tema_id`, `area_id`, `nivel`, `tempo_estimado`, `objetivo_aprendizagem`, `atende_objetivo`, `certificacoes`, `pre_requisitos`, `relacoes`, `fontes`, `revisao_inicial_dias`, `proxima_revisao`, `atualizado_em`, `revisar_ate`, `status_verificacao` |
| Plano de estudo | `trilha`, `publico`, `carga_semanal_h`, `areas_envolvidas`, `fontes`, `atualizado_em`, `revisar_ate`, `status_verificacao` |
| Certificações | `fornecedor`, `fornecedor_id`, `certificacoes_cobertas`, `fontes`, `atualizado_em`, `revisar_ate`, `status_verificacao` |
| Glossário | `escopo`, `idioma`, `fontes`, `atualizado_em`, `revisar_ate`, `status_verificacao` |
| Home e índices (`README.md` de `90-`, `91-`, `99-` e a home) | `escopo`, `fontes`, `atualizado_em`, `revisar_ate`, `status_verificacao` + as chaves próprias abaixo |
| Artefato gerado (`mapa-relacoes.md`, `indice-fontes.md`, `status-links.md`, `auditoria-arquivos.md`, `fila-auditoria-humana.md`) | `escopo`, `gerado_por`, `fontes: []`, `atualizado_em`, `revisar_ate`, `status_verificacao` + as chaves próprias abaixo |

### Chaves próprias de índices e artefatos gerados

| Chave | Onde | Significado |
|---|---|---|
| `gerado_por` | artefato gerado | script que produz o arquivo. Não edite o arquivo à mão. |
| `trilhas` | `91-trilhas/README.md` | lista dos arquivos de trilha indexados |
| `certificacoes_cobertas` | `90-certificacoes/README.md` | lista das siglas catalogadas |

Estas chaves existem apenas nesses arquivos. Não as replique em guia de área nem em tema.

**Exceção de fonte primária.** `artefato gerado` é o único documento que pode ter apenas fonte
secundária: ele cataloga material de estudo, e o acervo do próprio leitor é secundário por natureza.
Não há afirmação normativa nele. A exceção está registrada em `scripts/auditar-arquivos.py`.

### `pre_requisitos` aceita duas formas

- `"TEMA-03"` — tema da mesma área. É a forma mais comum.
- `"01-fundamentos#TEMA-06"` — tema de outra área. Use quando o pré-requisito atravessa áreas.

## Armadilhas conhecidas

- **`area` está proibido.** Use `area_nome` (nome de exibição) e `area_id` (slug, ex. `01-fundamentos`). A chave genérica `area` causava colisão semântica entre o guia e o tema.
- **Aspas nos placeholders de data.** `atualizado_em: AAAA-MM-DD` sem aspas vira tipo data no Obsidian.
- **Não usar `|` fora de comentário ou de valor citado.** Em valor livre, quebra o YAML.
- **Dono único.** `certificacoes` no frontmatter é apenas uma lista de siglas; o detalhe pertence a `90-certificacoes/`.
- **`relacoes` não usa nome de arquivo.** O alvo é `area_id#tema_id`; inserir um tema no meio renumera os arquivos e quebraria qualquer vínculo por nome.
- **`relacoes.complementa` e `relacoes.nao_confundir_com` são simétricas.** Declarar só um lado é erro apontado pelo validador.
