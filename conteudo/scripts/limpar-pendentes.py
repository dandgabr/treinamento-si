#!/usr/bin/env python3
"""Remove `pendente: true` de relacoes cujo alvo ja existe.

`pendente: true` significa "o tema alvo ainda nao foi escrito". Depois que ele e escrito, a
marca vira metadado enganoso e aparece nas visoes derivadas. Este script limpa a marca.

Uso:
    python3 scripts/limpar-pendentes.py            # limpa
    python3 scripts/limpar-pendentes.py --check    # apenas reporta
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
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
TODAS = ("complementa", "aprofundado_por", "aplicado_em", "nao_confundir_com")


def chaves_existentes() -> set[str]:
    chaves: set[str] = set()
    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        for arquivo in sorted(pasta.glob("TEMA-*.md")):
            m = RE_FM.match(arquivo.read_text(encoding="utf-8"))
            if not m:
                continue
            fm = yaml.safe_load(m.group(1)) or {}
            if fm.get("tema_id"):
                chaves.add(f"{fm.get('area_id', pasta.name)}#{fm['tema_id']}")
    return chaves


def main() -> int:
    somente_check = "--check" in sys.argv
    existentes = chaves_existentes()
    limpos = 0

    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        for arquivo in sorted(pasta.glob("TEMA-*.md")):
            texto = arquivo.read_text(encoding="utf-8")
            m = RE_FM.match(texto)
            if not m:
                continue
            fm = yaml.safe_load(m.group(1)) or {}
            rel = fm.get("relacoes") or {}
            obsoletos = [
                i["alvo"]
                for tipo in TODAS
                for i in (rel.get(tipo) or [])
                if isinstance(i, dict) and i.get("pendente") and i.get("alvo") in existentes
            ]
            if not obsoletos:
                continue
            novo = texto
            for alvo in obsoletos:
                padrao = re.compile(
                    r'(    - alvo: "' + re.escape(alvo) + r'"\n      motivo: "[^\n]*"\n)      pendente: true\n'
                )
                novo, n = padrao.subn(r"\1", novo)
                if n == 0:
                    print(f"FALHA  {arquivo.relative_to(RAIZ)}: nao localizei a marca de {alvo}")
            try:
                yaml.safe_load(RE_FM.match(novo).group(1))
            except Exception as e:
                print(f"ERRO   {arquivo.relative_to(RAIZ)}: YAML invalido apos limpeza ({e})")
                continue
            print(f"{'LIMPO' if not somente_check else 'OBSOLETO'}  {arquivo.relative_to(RAIZ)}: {len(obsoletos)} marca(s)")
            if not somente_check:
                arquivo.write_text(novo, encoding="utf-8")
            limpos += len(obsoletos)

    print(f"\n{limpos} marcas {'removidas' if not somente_check else 'obsoletas'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
