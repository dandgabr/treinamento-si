#!/usr/bin/env python3
"""Valida as relacoes entre temas e regenera mapa-relacoes.md.

A fonte unica das relacoes e o bloco `relacoes` do frontmatter de cada TEMA-*.md.
Este script nao edita temas: ele audita e produz a visao consolidada.

Chave de identidade de um tema: `area_id#tema_id` (ex.: `01-fundamentos#TEMA-03`).
`tema_id` sozinho NAO e unico — TEMA-01 existe em todas as areas.

Uso:
    python3 scripts/relacoes.py            # valida e regenera mapa-relacoes.md
    python3 scripts/relacoes.py --check    # apenas valida

Codigo de saida: 0 sem erros, 1 com erros.
"""
from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
MAPA = RAIZ / "mapa-relacoes.md"

SIMETRICAS = {"complementa", "nao_confundir_com"}
DIRIGIDAS = {"aprofundado_por", "aplicado_em"}
TODAS = SIMETRICAS | DIRIGIDAS
MAX_RELACOES = 5
RE_ALVO = re.compile(r"^(\d{2}-[a-z0-9-]+)#(TEMA-\d{2,})$")
RE_TEMA_LOCAL = re.compile(r"^TEMA-\d{2,}$")
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)

erros: list[str] = []
avisos: list[str] = []


def frontmatter(caminho: Path) -> dict:
    m = RE_FM.match(caminho.read_text(encoding="utf-8"))
    return (yaml.safe_load(m.group(1)) or {}) if m else {}


def chave(area: str, tema_id: str) -> str:
    return f"{area}#{tema_id}"


def coleta_temas() -> dict[str, dict]:
    temas: dict[str, dict] = {}
    for pasta in sorted(RAIZ.glob("[0-9][0-9]-*")):
        if not pasta.is_dir():
            continue
        for arquivo in sorted(pasta.glob("TEMA-*.md")):
            fm = frontmatter(arquivo)
            tema_id = fm.get("tema_id")
            if not tema_id:
                erros.append(f"{arquivo.relative_to(RAIZ)}: frontmatter sem `tema_id`")
                continue
            area = fm.get("area_id") or pasta.name
            k = chave(area, tema_id)
            if k in temas:
                erros.append(
                    f"`{k}` duplicado: {arquivo.relative_to(RAIZ)} e {temas[k]['path']}"
                )
                continue
            temas[k] = {
                "area": area,
                "tema_id": tema_id,
                "path": str(arquivo.relative_to(RAIZ)),
                "fm": fm,
            }
    return temas


def resolve_pre_requisito(area_origem: str, item: str) -> str | None:
    """pre_requisitos aceita `area_id#TEMA-NN` ou, dentro da mesma area, `TEMA-NN`."""
    if RE_ALVO.match(item):
        return item
    if RE_TEMA_LOCAL.match(item):
        return chave(area_origem, item)
    return None


def valida_item(origem: str, tipo: str, item, temas: dict[str, dict]) -> str | None:
    """Valida um item de relacao. Devolve o alvo canonico, ou None se invalido."""
    if not isinstance(item, dict):
        erros.append(f"{origem}: item de `{tipo}` precisa ser um mapa com `alvo` e `motivo`")
        return None
    alvo = item.get("alvo")
    motivo = str(item.get("motivo") or "").strip()
    pendente = bool(item.get("pendente"))

    if not alvo:
        erros.append(f"{origem}: relacao `{tipo}` sem campo `alvo`")
        return None
    if not RE_ALVO.match(alvo):
        erros.append(f"{origem}: alvo `{alvo}` fora do formato area_id#TEMA-NN")
        return None
    if not motivo:
        erros.append(f"{origem}: relacao `{tipo}` com `{alvo}` sem `motivo`")
    if alvo == origem:
        erros.append(f"{origem}: auto-referencia em `{tipo}`")
        return None
    if alvo not in temas:
        if pendente:
            avisos.append(f"{origem}: `{tipo}` -> {alvo} ainda nao escrito (marcado pendente)")
        else:
            erros.append(
                f"{origem}: `{tipo}` -> {alvo} nao existe e nao esta marcado `pendente: true`"
            )
    return alvo


def valida_temas(temas: dict[str, dict]) -> None:
    for origem, dados in temas.items():
        rel = dados["fm"].get("relacoes") or {}
        if not isinstance(rel, dict):
            erros.append(f"{origem}: `relacoes` precisa ser um mapa")
            continue
        desconhecidas = set(rel) - TODAS
        if desconhecidas:
            erros.append(
                f"{origem}: relacao desconhecida {sorted(desconhecidas)} (ver RELACOES-TEMAS.md)"
            )
        alvos: list[str] = []
        for tipo in TODAS:
            valor = rel.get(tipo)
            if valor is None:
                continue
            if not isinstance(valor, list):
                erros.append(f"{origem}: `relacoes.{tipo}` precisa ser uma lista")
                continue
            for item in valor:
                alvo = valida_item(origem, tipo, item, temas)
                if alvo:
                    alvos.append(alvo)
        if len(alvos) > MAX_RELACOES:
            erros.append(f"{origem}: {len(alvos)} relacoes, acima do teto de {MAX_RELACOES}")
        repetidos = sorted({a for a in alvos if alvos.count(a) > 1})
        if repetidos:
            erros.append(f"{origem}: alvo ligado por mais de uma relacao {repetidos}")
        if alvos and not any(not a.startswith(dados["area"] + "#") for a in alvos):
            avisos.append(f"{origem}: sem nenhuma relacao cross-area")


def valida_simetria(temas: dict[str, dict]) -> None:
    for origem, dados in temas.items():
        rel = dados["fm"].get("relacoes") or {}
        if not isinstance(rel, dict):
            continue
        for tipo in SIMETRICAS:
            for item in rel.get(tipo) or []:
                if not isinstance(item, dict):
                    continue
                alvo = item.get("alvo")
                if not alvo or alvo not in temas:
                    continue
                volta = temas[alvo]["fm"].get("relacoes") or {}
                if not any(
                    isinstance(i, dict) and i.get("alvo") == origem
                    for i in (volta.get(tipo) or [])
                ):
                    erros.append(
                        f"assimetria: `{origem}` declara {tipo} com {alvo}, "
                        f"mas {alvo} nao declara o caminho de volta"
                    )


def valida_ciclos(temas: dict[str, dict]) -> None:
    grafo: dict[str, list[str]] = {}
    for origem, dados in temas.items():
        arestas = []
        for item in dados["fm"].get("pre_requisitos") or []:
            if not isinstance(item, str):
                continue
            destino = resolve_pre_requisito(dados["area"], item)
            if destino is None:
                erros.append(f"{origem}: pre_requisito `{item}` fora do formato aceito")
            elif destino not in temas:
                avisos.append(f"{origem}: pre-requisito {destino} ainda nao escrito")
            else:
                arestas.append(destino)
        grafo[origem] = arestas

    estado: dict[str, int] = {}

    def visita(no: str, trilha: list[str]) -> None:
        if estado.get(no) == 1:
            erros.append("ciclo em pre_requisitos: " + " -> ".join(trilha + [no]))
            return
        if estado.get(no) == 2:
            return
        estado[no] = 1
        for vizinho in grafo.get(no, []):
            visita(vizinho, trilha + [no])
        estado[no] = 2

    for no in grafo:
        visita(no, [])


def gera_mapa(temas: dict[str, dict]) -> None:
    linhas: list[tuple[str, str, str, str, str]] = []
    for origem, dados in sorted(temas.items()):
        rel = dados["fm"].get("relacoes") or {}
        if not isinstance(rel, dict):
            continue
        for tipo in sorted(TODAS):
            for item in rel.get(tipo) or []:
                if not isinstance(item, dict):
                    continue
                alvo = item.get("alvo", "")
                if alvo.startswith(dados["area"] + "#"):
                    continue
                linhas.append(
                    (
                        dados["area"],
                        f"{dados['tema_id']} — {tipo}",
                        alvo.split("#")[0],
                        alvo,
                        str(item.get("motivo", "")),
                    )
                )

    hoje = date.today().isoformat()
    corpo = [
        "---",
        'escopo: "mapa de relacoes entre temas"',
        'gerado_por: "scripts/relacoes.py"',
        "fontes: []",
        f'atualizado_em: "{hoje}"',
        "revisar_ate: null",
        "status_verificacao: rascunho",
        "---",
        "",
        "# Mapa de relações entre áreas",
        "",
        "> Arquivo **gerado**. Não edite à mão: a fonte é o bloco `relacoes` do frontmatter de cada",
        "> tema. Rode `python3 scripts/relacoes.py` para regenerar. Regras em",
        "> [templates/RELACOES-TEMAS.md](./templates/RELACOES-TEMAS.md).",
        "",
        f"Temas indexados: **{len(temas)}**. Ligações que atravessam áreas: **{len(linhas)}**.",
        "",
        "## Pares que atravessam áreas",
        "",
    ]
    if linhas:
        corpo += [
            "| Área de origem | Tema e relação | Área de destino | Destino | Por que |",
            "|---|---|---|---|---|",
        ]
        for origem, tema, area_destino, alvo, motivo in sorted(linhas):
            corpo.append(f"| {origem} | {tema} | {area_destino} | {alvo} | {motivo} |")
    else:
        corpo.append("Nenhuma relação cross-area declarada ainda.")

    corpo += ["", "## Matriz de proximidade entre áreas", ""]
    matriz: dict[tuple[str, str], int] = {}
    for origem, _, area_destino, _, _ in linhas:
        par = tuple(sorted((origem, area_destino)))
        matriz[par] = matriz.get(par, 0) + 1
    if matriz:
        corpo += ["| Área A | Área B | Ligações |", "|---|---|---|"]
        for (a, b), n in sorted(matriz.items()):
            corpo.append(f"| {a} | {b} | {n} |")
    else:
        corpo.append("Sem dados.")

    corpo += ["", "---", "", "| Home |", "|---|", "| [README](./README.md) |", ""]
    MAPA.write_text("\n".join(corpo), encoding="utf-8")


def main() -> int:
    temas = coleta_temas()
    valida_temas(temas)
    valida_simetria(temas)
    valida_ciclos(temas)

    for a in avisos:
        print(f"AVISO  {a}")
    for e in erros:
        print(f"ERRO   {e}")

    print(f"\n{len(temas)} temas, {len(erros)} erros, {len(avisos)} avisos")

    if "--check" not in sys.argv:
        gera_mapa(temas)
        print(f"mapa-relacoes.md regenerado a partir de {len(temas)} temas")

    return 1 if erros else 0


if __name__ == "__main__":
    raise SystemExit(main())
