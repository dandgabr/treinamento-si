#!/usr/bin/env python3
"""Gera o indice de fontes a partir do frontmatter de todos os documentos.

O frontmatter de cada arquivo e a fonte unica das suas fontes. Este script agrega e
deduplica, produzindo a visao consolidada que ninguem consegue manter a mao quando o
repositorio passa de cem arquivos.

Uso:
    python3 scripts/gerar-indice-fontes.py
    python3 scripts/gerar-indice-fontes.py --check    # confere contra o arquivo, sem escrever
"""
from __future__ import annotations

import re
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "99-fontes" / "indice-fontes.md"
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
MARCA = "NAO CONFIRMADO em fonte oficial"


def arquivos() -> list[Path]:
    alvos = sorted(RAIZ.glob("[0-9][0-9]-*/*.md"))
    alvos += [RAIZ / "README.md", RAIZ / "glossario.md"]
    return [a for a in alvos if a.exists()]


def sem_data(texto: str) -> str:
    """Neutraliza o `atualizado_em` gerado: a data sai de `date.today()` e mudaria todo dia."""
    return re.sub(r'^atualizado_em: ".*"$', 'atualizado_em: "AAAA-MM-DD"', texto, flags=re.M)


def main() -> int:
    por_url: dict[str, dict] = {}
    citantes: dict[str, list[str]] = defaultdict(list)
    tipos: Counter = Counter()
    sem_fonte: list[str] = []
    nao_confirmado: Counter = Counter()
    total_fontes = 0

    for p in arquivos():
        rel = str(p.relative_to(RAIZ))
        txt = p.read_text(encoding="utf-8")
        nao_confirmado[rel] = txt.count(MARCA)
        m = RE_FM.match(txt)
        if not m:
            continue
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except Exception:
            continue
        lista = fm.get("fontes") or []
        if not lista and rel.endswith("README.md"):
            continue
        if not lista:
            sem_fonte.append(rel)
            continue
        for f in lista:
            if not isinstance(f, dict) or not f.get("url"):
                continue
            url = f["url"]
            total_fontes += 1
            tipos[f.get("tipo", "?")] += 1
            por_url.setdefault(url, {
                "titulo": f.get("titulo", ""),
                "tipo": f.get("tipo", "?"),
                "acessado_em": f.get("acessado_em", ""),
                "confianca": f.get("confianca", ""),
            })
            citantes[url].append(rel)

    hoje = date.today().isoformat()
    linhas = [
        "---",
        'escopo: "indice de fontes gerado"',
        'gerado_por: "scripts/gerar-indice-fontes.py"',
        "fontes: []",
        f'atualizado_em: "{hoje}"',
        "revisar_ate: null",
        "status_verificacao: rascunho",
        "---",
        "",
        "# Índice de fontes",
        "",
        "> Arquivo **gerado**. Não edite à mão: a fonte é o bloco `fontes` do frontmatter de cada",
        "> documento. Rode `python3 scripts/gerar-indice-fontes.py` para regenerar. O registro",
        "> narrativo das confirmações fica em [registro-verificacao.md](./registro-verificacao.md).",
        "",
        f"Documentos com fontes: **{len({c for v in citantes.values() for c in v})}**. "
        f"Citações: **{total_fontes}**. URLs distintas: **{len(por_url)}**.",
        "",
        "## Distribuição por tipo",
        "",
        "| Tipo | Citações |",
        "|---|---|",
    ]
    for tipo, n in sorted(tipos.items(), key=lambda x: -x[1]):
        linhas.append(f"| {tipo} | {n} |")

    linhas += ["", "## Fontes mais citadas", "", "| Título | Tipo | Citada em | URL |", "|---|---|---|---|"]
    for url, n in sorted(citantes.items(), key=lambda x: (-len(x[1]), por_url[x[0]]["titulo"]))[:60]:
        d = por_url[url]
        linhas.append(f"| {d['titulo']} | {d['tipo']} | {len(n)} | <{url}> |")

    linhas += [
        "",
        "## Documentos com marca NAO CONFIRMADO",
        "",
        "| Documento | Ocorrências |",
        "|---|---|",
    ]
    for rel, n in sorted(nao_confirmado.items(), key=lambda x: -x[1]):
        if n:
            linhas.append(f"| {rel} | {n} |")

    if sem_fonte:
        linhas += ["", "## Documentos sem fontes declaradas", ""]
        linhas += [f"- {r}" for r in sorted(set(sem_fonte))]

    linhas += ["", "---", "", "| Home |", "|---|", "| [README](../README.md) |", ""]
    novo = "\n".join(linhas)

    if "--check" in sys.argv:
        # O indice e visao derivada: alterar `fontes` num tema e nao regerar deixava o
        # verificador verde, porque nada comparava o arquivo com o frontmatter de agora.
        atual = sem_data(SAIDA.read_text(encoding="utf-8")) if SAIDA.exists() else ""
        divergencias = 0 if atual == sem_data(novo) else 1
        if divergencias:
            print(f"DIVERGE  {SAIDA.relative_to(RAIZ)}{'' if SAIDA.exists() else ' (ausente)'}")
        print(f"citações: {total_fontes} | URLs distintas: {len(por_url)}")
        print(f"CHECK {Path(__file__).name} {divergencias}")
        return 1 if divergencias else 0

    SAIDA.write_text(novo, encoding="utf-8")

    print(f"citações: {total_fontes} | URLs distintas: {len(por_url)} | tipos: {dict(tipos)}")
    print(f"documentos sem fontes: {len(set(sem_fonte))}")
    print(f"marca NAO CONFIRMADO no repositório: {sum(nao_confirmado.values())} em {sum(1 for v in nao_confirmado.values() if v)} documentos")
    print(f"gravado: {SAIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
