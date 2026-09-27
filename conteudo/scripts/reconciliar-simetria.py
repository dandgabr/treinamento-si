#!/usr/bin/env python3
"""Espelha relacoes simetricas que ficaram declaradas em apenas um lado.

`complementa` e `nao_confundir_com` sao simetricas. Quando dois temas sao escritos em
paralelo por agentes diferentes, um lado pode declarar o vinculo e o outro nao. Este script
fecha o par automaticamente, marcando o motivo espelhado com a origem, para que a
procedencia fique explicita e nao se confunda com uma declaracao independente.

Tambem reporta CONFLITOS: mesmo par ligado por tipos diferentes nos dois sentidos.

Uso:
    python3 scripts/reconciliar-simetria.py            # corrige e reporta
    python3 scripts/reconciliar-simetria.py --check    # apenas reporta

Codigo de saida: 0 sem conflito, 1 se houver conflito ou par acima do teto.
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
SIMETRICAS = ("complementa", "nao_confundir_com")
TODAS = {"complementa", "aprofundado_por", "aplicado_em", "nao_confundir_com"}
MAX_RELACOES = 5
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)


def frontmatter(texto: str) -> dict:
    m = RE_FM.match(texto)
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def coleta():
    temas: dict[str, dict] = {}
    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        for arquivo in sorted(pasta.glob("TEMA-*.md")):
            texto = arquivo.read_text(encoding="utf-8")
            fm = frontmatter(texto)
            if not fm.get("tema_id"):
                continue
            chave = f"{fm.get('area_id', pasta.name)}#{fm['tema_id']}"
            temas[chave] = {"path": arquivo, "texto": texto, "fm": fm}
    return temas


def pares(temas: dict[str, dict]) -> dict[tuple[str, str], set[str]]:
    mapa: dict[tuple[str, str], set[str]] = {}
    for origem, dados in temas.items():
        rel = dados["fm"].get("relacoes") or {}
        if not isinstance(rel, dict):
            continue
        for tipo in TODAS:
            for item in rel.get(tipo) or []:
                if not isinstance(item, dict):
                    continue
                alvo = str(item.get("alvo", ""))
                if not alvo:
                    continue
                mapa.setdefault(tuple(sorted((origem, alvo))), set()).add(tipo)
    return mapa


def insere_item(texto: str, tipo: str, alvo: str, motivo: str) -> str | None:
    m = re.search(r"^relacoes:\n", texto, re.M)
    if not m:
        return None
    m2 = re.search(rf"^  {tipo}:[ \t]*(.*)$", texto, re.M)
    if not m2:
        return None
    motivo = motivo.replace('"', "'")
    item = f'    - alvo: "{alvo}"\n      motivo: "{motivo}"\n'
    if m2.group(1).strip() in ("[]", ""):
        return texto[: m2.start()] + f"  {tipo}:\n" + item + texto[m2.end() + 1 :]
    return texto[: m2.end() + 1] + item + texto[m2.end() + 1 :]


def main() -> int:
    somente_check = "--check" in sys.argv
    temas = coleta()
    conflitos = 0
    espelhados = 0
    problemas = 0

    for par, tipos in sorted(pares(temas).items()):
        if len(tipos) > 1:
            print(f"CONFLITO  {par[0]} <-> {par[1]}: tipos divergentes {sorted(tipos)}")
            conflitos += 1
            continue
        tipo = next(iter(tipos))
        if tipo not in SIMETRICAS:
            continue
        a, b = par
        if a not in temas or b not in temas:
            continue
        for origem, destino in ((a, b), (b, a)):
            atual = temas[destino]["fm"].get("relacoes") or {}
            volta = [i for i in (atual.get(tipo) or []) if isinstance(i, dict) and i.get("alvo") == origem]
            if volta:
                continue
            total = sum(len((atual.get(t) or [])) for t in TODAS)
            if total >= MAX_RELACOES:
                print(f"TETO  {destino} ja tem {total} relacoes; nao espelhei {tipo} de {origem}")
                problemas += 1
                continue
            fonte = temas[origem]["fm"].get("relacoes") or {}
            original = next(
                (i for i in (fonte.get(tipo) or []) if isinstance(i, dict) and i.get("alvo") == destino),
                {},
            )
            motivo = f"{original.get('motivo', 'par simetrico')} [espelho de {origem}]"
            novo = insere_item(temas[destino]["texto"], tipo, origem, motivo)
            if novo is None:
                print(f"FALHA  nao consegui inserir {tipo} em {destino}")
                problemas += 1
                continue
            try:
                yaml.safe_load(RE_FM.match(novo).group(1))
            except Exception as e:
                print(f"ERRO   YAML invalido apos inserir em {destino}: {e}")
                problemas += 1
                continue
            if not somente_check:
                temas[destino]["path"].write_text(novo, encoding="utf-8")
                temas[destino]["texto"] = novo
                temas[destino]["fm"] = frontmatter(novo)
            print(f"ESPELHADO  {destino} <- {tipo} de {origem}")
            espelhados += 1

    print(f"\n{len(temas)} temas, {espelhados} espelhados, {conflitos} conflitos, {problemas} problemas")
    if somente_check:
        # Linha exigida pelo `verificar-repo.py`: prova que o script chegou ao fim.
        print(f"CHECK {Path(__file__).name} {espelhados + conflitos + problemas}")
    # Em `--check`, par simetrico declarado de um so lado e pendencia: antes o script imprimia
    # ESPELHADO e devolvia 0, e o verificador tratava como "nada a fazer".
    return 1 if (conflitos or problemas or (espelhados and somente_check)) else 0


if __name__ == "__main__":
    raise SystemExit(main())
