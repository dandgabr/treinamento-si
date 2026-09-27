#!/usr/bin/env python3
"""Regenera o rodape de navegacao de todos os guias e temas.

O rodape e o caminho principal de leitura: quem estuda clica em "Proximo". Escrito a mao por
agentes diferentes, ele virou tres ordens concorrentes e um ciclo (03 -> 04 -> 05 -> 07 -> 08
-> 03), que deixava dez areas fora do caminho.

A fonte da ordem e o `ordem_estudo` do frontmatter de cada guia. Dentro da area, a ordem e o
`tema_id`.

Uso:
    python3 scripts/sincronizar-navegacao.py
    python3 scripts/sincronizar-navegacao.py --check
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
AREAS = {"90-certificacoes", "91-trilhas", "99-fontes"}
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
RE_NAV = re.compile(r"(?:^---[ \t]*\n\n)?^\| Navegação \|[^\n]*\n^\|[-| ]+\|[^\n]*\n(?:^\|[^\n]*\n?)*", re.M)


def frontmatter(caminho: Path) -> dict:
    m = RE_FM.match(caminho.read_text(encoding="utf-8"))
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def limpa_titulo(t: str) -> str:
    t = re.sub(r"^\d\d\s+", "", t or "")
    t = re.sub(r"\s*\(.*?\)\s*$", "", t)
    return t.strip()


def areas_ordenadas() -> list[dict]:
    itens = []
    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        if pasta.name in AREAS or not (pasta / "README.md").exists():
            continue
        fm = frontmatter(pasta / "README.md")
        itens.append({
            "pasta": pasta,
            "area_id": fm.get("area_id") or pasta.name,
            "ordem": fm.get("ordem_estudo") or 999,
            "rotulo": limpa_titulo(fm.get("area_nome") or pasta.name),
        })
    return sorted(itens, key=lambda x: x["ordem"])


def bloco_guia(idx: int, areas: list[dict]) -> str:
    linhas = ["---", "", "| Navegação | |", "|---|---|"]
    if idx > 0:
        a = areas[idx - 1]
        linhas.append(f"| Anterior | [{a['area_id'][:2]} {a['rotulo']}](../{a['area_id']}/README.md) |")
    if idx < len(areas) - 1:
        p = areas[idx + 1]
        linhas.append(f"| Próximo | [{p['area_id'][:2]} {p['rotulo']}](../{p['area_id']}/README.md) |")
    linhas.append("| Home | [README](../README.md) |")
    return "\n".join(linhas) + "\n"


def bloco_tema(area: dict, anterior, proximo) -> str:
    linhas = ["---", "", "| Navegação | |", "|---|---|",
              f"| Área | [{area['area_id'][:2]} {area['rotulo']}](./README.md) |"]
    if anterior:
        linhas.append(f"| Tema anterior | [{anterior[0]}]({anterior[1]}) |")
    if proximo:
        linhas.append(f"| Próximo tema | [{proximo[0]}]({proximo[1]}) |")
    linhas.append("| Home | [README](../README.md) |")
    return "\n".join(linhas) + "\n"


def substitui(caminho: Path, bloco: str, escrever: bool) -> bool:
    txt = caminho.read_text(encoding="utf-8")
    achados = list(RE_NAV.finditer(txt))
    if not achados:
        # Rodape ausente e divergencia, e nao aviso: enquanto era aviso o arquivo saia da
        # conta e o verificador dava verde sobre um guia sem caminho de leitura.
        print(f"DIVERGE  {caminho.relative_to(RAIZ)} (rodapé de navegação ausente)")
        return True
    m = achados[-1]
    corpo = txt[: m.start()].rstrip("\n")
    novo = corpo + "\n\n" + bloco
    if novo == txt:
        return False
    print(f"{'OK' if escrever else 'DIVERGE'}  {caminho.relative_to(RAIZ)}")
    if escrever:
        caminho.write_text(novo, encoding="utf-8")
    return True


def main() -> int:
    escrever = "--check" not in sys.argv
    areas = areas_ordenadas()
    mudou = 0
    for i, area in enumerate(areas):
        if substitui(area["pasta"] / "README.md", bloco_guia(i, areas), escrever):
            mudou += 1
        temas = []
        for arq in sorted(area["pasta"].glob("TEMA-*.md")):
            fm = frontmatter(arq)
            temas.append((fm.get("tema_id") or arq.name[:7], arq.name))
        temas.sort(key=lambda x: x[0])
        for j, (tid, nome) in enumerate(temas):
            ant = temas[j - 1] if j > 0 else None
            prox = temas[j + 1] if j < len(temas) - 1 else None
            if substitui(area["pasta"] / nome, bloco_tema(area, ant, prox), escrever):
                mudou += 1
    print(f"\n{len(areas)} areas, {mudou} arquivos {'atualizados' if escrever else 'divergentes'}")
    if not escrever:
        # Linha que o `verificar-repo.py` exige: prova que o script chegou ao fim, mesmo
        # quando nao ha nada a fazer. Sem ela, um script que morre no meio (e nao imprime
        # DIVERGE nenhum) passaria como "sem divergencia".
        print(f"CHECK {Path(__file__).name} {mudou}")
    return 1 if (mudou and not escrever) else 0


if __name__ == "__main__":
    raise SystemExit(main())
