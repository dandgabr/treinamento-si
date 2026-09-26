---
escopo: "bibliografia central do roadmap"
fontes: []
atualizado_em: 2026-09-25
revisar_ate: "2027-09-25"
status_verificacao: pendente
---

# Fontes

Repositório central de referências. Uma fonte só entra aqui depois de acessada e conferida;
o registro do que foi confirmado fica em [registro-verificacao.md](./registro-verificacao.md).

O índice consolidado — quantas citações, quais URLs, o que ainda está pendente — é **gerado** a
partir do frontmatter de cada documento e vive em [indice-fontes.md](./indice-fontes.md). Toda
edição manual dele desaparece na geração seguinte.

Relatórios de checagem, também gerados:

| Relatório | O que contém |
|---|---|
| [indice-fontes.md](./indice-fontes.md) | citações por tipo, fontes mais citadas, documentos com lacuna |
| [auditoria-arquivos.md](./auditoria-arquivos.md) | auditoria estrutural arquivo por arquivo |
| [status-links.md](./status-links.md) | status HTTP real de cada URL citada |
| [fila-auditoria-humana.md](./fila-auditoria-humana.md) | ordem sugerida para a conferência manual |
| [registro-verificacao.md](./registro-verificacao.md) | registro narrativo das confirmações feitas |

**Limite conhecido:** a ISO, a SAGE e a SEC respondem 403 a requisições automatizadas. As páginas
existem, mas não foram lidas pelos agentes — ver a seção "bloqueio" em
[status-links.md](./status-links.md) e o CONTRIBUTING §13.

## Hierarquia

1. **Primária** — quem publica a norma: NIST, ISO, ENISA, IAPP, ACM/IEEE, fornecedores de certificação, diários oficiais.
2. **Acadêmica** — artigos revisados por pares, com DOI.
3. **Secundária** — blogs, agregadores e sites de preparação. Servem apenas como pista para achar a primária; não sustentam números.

## Como citar (dentro de cada documento)

```yaml
fontes:
  - titulo: "CompTIA Security+ SY0-701 Exam Objectives"
    url: "https://assets.ctfassets.net/.../CompTIA-Security-Plus-SY0-701-Exam-Objectives.pdf"
    tipo: primaria
    acessado_em: 2026-09-25
    confianca: alta
```

## Índice por área

| Área | Fontes primárias | Fontes acadêmicas |
|---|---|---|
| 00-guia-basico | <em construção> | <em construção> |
| 01-fundamentos | <em construção> | <em construção> |
| 02-governanca-risco-compliance | <em construção> | — |
| ... | ... | ... |

## Frameworks e normas de referência

| Framework / norma | Publicador | Versão | URL | Acessado em |
|---|---|---|---|---|
| NIST CSF 2.0 | NIST | 2.0 | https://www.nist.gov/cyberframework | 2026-09-25 |
| NIST SP 800-181r1 (NICE) | NIST | Rev. 1 | https://csrc.nist.gov/pubs/sp/800/181/r1/final | 2026-09-25 |
| CSEC2017 | ACM/IEEE-CS/AIS SIGSEC/IFIP | 2017 | https://www.acm.org/binaries/content/assets/education/curricula-recommendations/csec2017.pdf | 2026-09-25 |
| ENISA ECSF Role Profiles | ENISA | 12 perfis (pub. 19/09/2022) | https://www.enisa.europa.eu/publications/european-cybersecurity-skills-framework-role-profiles | 2026-09-25 |
| MITRE ATT&CK (Enterprise) | MITRE | <versão a confirmar> | https://attack.mitre.org/ | pendente |
| ISO/IEC 27001 / 27002 | ISO | <versão a confirmar> | https://www.iso.org/standard/27001 | pendente |
| ISO/IEC 42001 | ISO | <versão a confirmar> | https://www.iso.org/standard/42001 | pendente |
| CIS Controls | Center for Internet Security | <versão a confirmar> | https://www.cisecurity.org/controls | pendente |

## Aprendizagem e andragogia

| Referência | Tipo | URL / DOI | Acessado em |
|---|---|---|---|
| Knowles, M. S. (1980). *The Modern Practice of Adult Education: From Pedagogy to Andragogy* | acadêmica | https://sk.sagepub.com/ency/edvol/sage-encyclopedia-of-educational-research-measurement-evaluation/chpt/andragogy | 2026-09-25 |
| Dunlosky, J. et al. (2013). *Improving Students' Learning With Effective Learning Techniques* | acadêmica | DOI 10.1177/1529100612453266 | 2026-09-25 |

---

| Home |
|---|
| [README](../README.md) |
