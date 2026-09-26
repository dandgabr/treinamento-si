#!/usr/bin/env python3
"""Regenera a secao "Conexoes com outras areas" de cada guia de area.

Essa secao e uma VISAO DERIVADA: a fonte e o bloco `relacoes` do frontmatter de cada
TEMA-*.md. Escrever a mao garante divergencia, como aconteceu na Fase 1.

Uso:
    python3 scripts/sincronizar-guias.py             # regenera
    python3 scripts/sincronizar-guias.py --check     # apenas reporta divergencia

Codigo de saida: 0 sem divergencia, 1 se houver (no modo --check).
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
TODAS = {"complementa", "aprofundado_por", "aplicado_em", "nao_confundir_com"}
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
RE_HEADING = re.compile(r"^##\s+\d+\.\s+Conexões com outras áreas[ \t]*$", re.M)
RE_PROX = re.compile(r"^##\s+\d+\.", re.M)

INTRO = (
    "Relações de saída dos temas desta área que apontam para fora dela, agregadas do frontmatter\n"
    "`relacoes`. A visão consolidada está em [mapa-relacoes.md](../mapa-relacoes.md); as regras, em\n"
    "[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md). Alvos marcados como pendentes\n"
    "ainda não foram escritos."
)


def frontmatter(caminho: Path) -> dict:
    m = RE_FM.match(caminho.read_text(encoding="utf-8"))
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def linhas_da_area(pasta: Path) -> list[str]:
    area = pasta.name
    linhas: list[tuple[str, str, str, str, bool]] = []
    for arquivo in sorted(pasta.glob("TEMA-*.md")):
        fm = frontmatter(arquivo)
        tema_id = fm.get("tema_id", "?")
        rel = fm.get("relacoes") or {}
        if not isinstance(rel, dict):
            continue
        for tipo in sorted(TODAS):
            for item in rel.get(tipo) or []:
                if not isinstance(item, dict):
                    continue
                alvo = str(item.get("alvo", ""))
                if not alvo or alvo.startswith(area + "#"):
                    continue
                linhas.append(
                    (
                        tema_id,
                        tipo,
                        alvo,
                        str(item.get("motivo", "")),
                        bool(item.get("pendente")),
                    )
                )
    ordenadas = sorted(linhas)
    saida = [INTRO, ""]
    if not ordenadas:
        saida.append("Nenhuma relação cross-area declarada nesta área ainda.")
        return saida
    saida += ["| Tema daqui | Relação | Destino | Por que |", "|---|---|---|---|"]
    for tema_id, tipo, alvo, motivo, pendente in ordenadas:
        marca = " *(pendente)*" if pendente else ""
        saida.append(f"| {tema_id} | {tipo} | {alvo}{marca} | {motivo} |")
    return saida


def processa(pasta: Path, escrever: bool) -> bool:
    readme = pasta / "README.md"
    texto = readme.read_text(encoding="utf-8")
    m = RE_HEADING.search(texto)
    if not m:
        print(f"AVISO  {readme.relative_to(RAIZ)}: secao 'Conexões com outras áreas' ausente")
        return False

    inicio = m.end()
    seguinte = RE_PROX.search(texto, inicio)
    fim = seguinte.start() if seguinte else len(texto)
    atual = texto[inicio:fim]
    novo = "\n\n" + "\n".join(linhas_da_area(pasta)) + "\n\n"

    if atual == novo:
        return False
    print(f"{'REGENERADO' if escrever else 'DIVERGE'}  {readme.relative_to(RAIZ)}")
    if escrever:
        readme.write_text(texto[:inicio] + novo.rstrip("\n") + "\n\n" + texto[fim:], encoding="utf-8")
    return True


def main() -> int:
    escrever = "--check" not in sys.argv
    divergencias = 0
    pastas = sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir())
    for pasta in pastas:
        if (pasta / "README.md").exists():
            if processa(pasta, escrever):
                divergencias += 1
    acao = "regenerados" if escrever else "divergentes"
    print(f"\n{len(pastas)} areas verificadas, {divergencias} {acao}")
    return 1 if (divergencias and not escrever) else 0


if __name__ == "__main__":
    raise SystemExit(main())
