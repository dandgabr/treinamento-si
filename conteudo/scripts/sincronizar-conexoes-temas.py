#!/usr/bin/env python3
"""Regenera a secao "Conexoes com outros temas" (§12) de cada tema.

Mesma razao do sincronizar-guias.py: a secao e visao derivada do bloco `relacoes` do
frontmatter, e escrita a mao ela diverge — em 24 temas divergia, em 3 faltava a tabela e em 1
o texto negava uma relacao que o frontmatter declarava.

Uso:
    python3 scripts/sincronizar-conexoes-temas.py
    python3 scripts/sincronizar-conexoes-temas.py --check
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
TODAS = ("complementa", "aprofundado_por", "aplicado_em", "nao_confundir_com")
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
RE_SEC = re.compile(r"^##\s+12\.\s+Conexões com outros temas[ \t]*$", re.M)
RE_PROX = re.compile(r"^##\s+13\.", re.M)

INTRO = (
    "Leitura humana do `relacoes` do frontmatter — que é a fonte. Relações que saem desta área\n"
    "também aparecem em [mapa-relacoes.md](../mapa-relacoes.md). Regras em\n"
    "[templates/RELACOES-TEMAS.md](../templates/RELACOES-TEMAS.md)."
)


def frontmatter(caminho: Path) -> dict:
    m = RE_FM.match(caminho.read_text(encoding="utf-8"))
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def linhas(arquivo: Path) -> list[str]:
    fm = frontmatter(arquivo)
    rel = fm.get("relacoes") or {}
    if not isinstance(rel, dict):
        return [INTRO, "", "Nenhuma relação declarada para este tema."]
    itens = []
    for tipo in TODAS:
        for item in rel.get(tipo) or []:
            if isinstance(item, dict) and item.get("alvo"):
                itens.append((tipo, str(item["alvo"]), str(item.get("motivo", "")), bool(item.get("pendente"))))
    if not itens:
        return [INTRO, "", "Nenhuma relação declarada para este tema."]
    saida = [INTRO, "", "| Relação | Alvo | Por que |", "|---|---|---|"]
    for tipo, alvo, motivo, pendente in sorted(itens):
        marca = " *(pendente)*" if pendente else ""
        saida.append(f"| {tipo} | {alvo}{marca} | {motivo} |")
    return saida


def processa(arquivo: Path, escrever: bool) -> bool:
    txt = arquivo.read_text(encoding="utf-8")
    m = RE_SEC.search(txt)
    if not m:
        # Secao ausente e divergencia, e nao aviso: enquanto era aviso, o tema saia da conta
        # e o verificador dava verde sobre um tema sem a leitura das proprias relacoes.
        print(f"DIVERGE  {arquivo.relative_to(RAIZ)} (seção §12 'Conexões com outros temas' ausente)")
        return True
    inicio = m.end()
    prox = RE_PROX.search(txt, inicio)
    fim = prox.start() if prox else len(txt)
    novo = "\n\n" + "\n".join(linhas(arquivo)) + "\n\n"
    if txt[inicio:fim] == novo:
        return False
    print(f"{'OK' if escrever else 'DIVERGE'}  {arquivo.relative_to(RAIZ)}")
    if escrever:
        arquivo.write_text(txt[:inicio] + novo.rstrip("\n") + "\n\n" + txt[fim:], encoding="utf-8")
    return True


def main() -> int:
    escrever = "--check" not in sys.argv
    mudou = 0
    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        for arq in sorted(pasta.glob("TEMA-*.md")):
            if processa(arq, escrever):
                mudou += 1
    print(f"\n{mudou} arquivos {'atualizados' if escrever else 'divergentes'}")
    if not escrever:
        # Linha exigida pelo `verificar-repo.py`: prova que o script chegou ao fim. Sem ela,
        # script interrompido no meio nao imprimiria DIVERGE e a conferencia passaria.
        print(f"CHECK {Path(__file__).name} {mudou}")
    return 1 if (mudou and not escrever) else 0


if __name__ == "__main__":
    raise SystemExit(main())
