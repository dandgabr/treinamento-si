#!/usr/bin/env python3
"""Gera a fila de auditoria humana: onde a conferencia manual rende mais.

A checagem automatica ja garante estrutura, ligacoes e status das URLs. O que sobra para um
humano e conferir se o TEXTO diz o que a FONTE diz. Este script ranqueia os arquivos por risco
para que essa revisao comece pelos que mais precisam.

Sinais considerados:
  - cita fonte em dominio que bloqueia leitura automatizada (a pagina nao foi lida)
  - cita fonte secundaria ao lado de primaria (conferir se a afirmacao nao depende dela)
  - acumula marcas NAO CONFIRMADO em fonte oficial
  - tema sem nenhuma relacao cross-area
  - status_verificacao ja promovido a verificado (nao deveria acontecer antes da auditoria)

Uso:
    python3 scripts/gerar-fila-auditoria.py
    python3 scripts/gerar-fila-auditoria.py --check    # confere contra o arquivo, sem escrever
"""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    raise SystemExit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "99-fontes" / "fila-auditoria-humana.md"
STATUS_LINKS = RAIZ / "99-fontes" / "status-links.md"
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
MARCA = "NAO CONFIRMADO em fonte oficial"
SIMETRICAS = {"complementa", "nao_confundir_com"}


def sem_data(texto: str) -> str:
    """Neutraliza o `atualizado_em` gerado: a data sai de `date.today()` e mudaria todo dia."""
    return re.sub(r'^atualizado_em: ".*"$', 'atualizado_em: "AAAA-MM-DD"', texto, flags=re.M)


def dominios_bloqueados() -> set[str]:
    """Le os dominios marcados como bloqueio no relatorio de links.

    Falha alto quando o relatorio ou a secao nao estao onde a leitura procura, em vez de devolver
    um conjunto vazio: "dominio que bloqueia automacao" e o sinal de MAIOR peso da fila (3 pontos
    por fonte), e a ausencia da secao o zerava em silencio. A fila sairia reordenada — as fontes
    que so um humano consegue abrir ficariam no fim — e o passo que gera a fila diria que esta tudo
    em dia. Secao ausente nao e "nenhum dominio bloqueado": e a regra que nao pode ser conferida.
    """
    if not STATUS_LINKS.exists():
        raise SystemExit(
            f"ERRO  {STATUS_LINKS.relative_to(RAIZ)}: ausente — e o relatorio do "
            f"`scripts/checar-links.py`, de onde saem os dominios que bloqueiam automacao; sem ele "
            f"o sinal de maior peso da fila de auditoria nao existe"
        )
    txt = STATUS_LINKS.read_text(encoding="utf-8")
    m = re.search(r"## Bloqueio a cliente automatizado.*?(?=\n## |\Z)", txt, re.S)
    if not m:
        raise SystemExit(
            f"ERRO  {STATUS_LINKS.relative_to(RAIZ)}: sem a secao '## Bloqueio a cliente "
            f"automatizado' — restaure-a (quem a escreve e o `scripts/checar-links.py`) em vez de "
            f"tratar a ausencia como 'nenhum dominio bloqueado': as fontes que exigem navegador "
            f"sairiam da fila sem que ninguem note"
        )
    return {re.sub(r"^https?://(www\.)?", "", u).split("/")[0]
            for u in re.findall(r"<(https?://[^>]+)>", m.group(0))}


def main() -> int:
    bloqueados = dominios_bloqueados()
    risco: list[tuple[int, str, list[str]]] = []
    resumo: dict[str, int] = defaultdict(int)

    alvos = sorted(RAIZ.glob("[0-9][0-9]-*/*.md")) + [RAIZ / "README.md", RAIZ / "glossario.md"]
    for p in alvos:
        if not p.exists():
            continue
        rel = str(p.relative_to(RAIZ))
        txt = p.read_text(encoding="utf-8")
        if p.name in {"mapa-relacoes.md", "indice-fontes.md", "status-links.md",
                      "auditoria-arquivos.md", "fila-auditoria-humana.md"}:
            continue
        if p.parent.name in {"90-certificacoes", "91-trilhas", "99-fontes"}:
            continue
        m = RE_FM.match(txt)
        fm = (yaml.safe_load(m.group(1)) or {}) if m else {}
        motivos: list[str] = []
        pontos = 0

        fontes = [f for f in (fm.get("fontes") or []) if isinstance(f, dict)]
        bloqueadas = [f for f in fontes
                      if any(d in str(f.get("url", "")) for d in bloqueados)] if bloqueados else []
        if bloqueadas:
            pontos += 3 * len(bloqueadas)
            motivos.append(f"{len(bloqueadas)} fonte(s) em dominio que bloqueia automacao — conferir no navegador")
            resumo["dominio bloqueado"] += 1
        if any(f.get("tipo") == "secundaria" for f in fontes):
            pontos += 2
            motivos.append("cita fonte secundaria — conferir se a afirmacao nao depende dela")
            resumo["fonte secundaria"] += 1

        marcas = txt.count(MARCA)
        if marcas:
            pontos += marcas
            motivos.append(f"{marcas} marca(s) NAO CONFIRMADO em fonte oficial")
            resumo["lacuna declarada"] += 1

        if p.name.startswith("TEMA-"):
            relacoes = fm.get("relacoes") or {}
            alvos_rel = [i.get("alvo", "") for t in relacoes for i in (relacoes.get(t) or []) if isinstance(i, dict)]
            if not any(not a.startswith(p.parent.name + "#") for a in alvos_rel):
                pontos += 1
                motivos.append("sem relacao cross-area")
                resumo["sem relacao cross-area"] += 1

        if fm.get("status_verificacao") == "verificado":
            pontos += 10
            motivos.append("marcado como verificado antes da auditoria humana")
            resumo["verificado indevidamente"] += 1

        if pontos:
            risco.append((pontos, rel, motivos))

    risco.sort(key=lambda x: (-x[0], x[1]))
    hoje = date.today().isoformat()
    linhas = [
        "---",
        'escopo: "fila de auditoria humana"',
        'gerado_por: "scripts/gerar-fila-auditoria.py"',
        "fontes: []",
        f'atualizado_em: "{hoje}"',
        "revisar_ate: null",
        "status_verificacao: rascunho",
        "---",
        "",
        "# Fila de auditoria humana",
        "",
        "> Arquivo **gerado**. Não edite à mão. A checagem automática já cobre estrutura, ligações,",
        "> duplicação e status das URLs. O que resta ao humano é conferir se o texto diz o que a",
        "> fonte diz. Esta é a ordem sugerida para essa conferência.",
        "",
        f"Arquivos com algum sinal de risco: **{len(risco)}**. Prioridade = soma dos sinais.",
        "",
        "## Sinais por tipo",
        "",
        "| Sinal | Arquivos |",
        "|---|---|",
    ]
    for k, v in sorted(resumo.items(), key=lambda x: -x[1]):
        linhas.append(f"| {k} | {v} |")

    linhas += ["", "## Comece por aqui (20 primeiros)", "",
               "| Prioridade | Arquivo | Motivos |", "|---|---|---|"]
    for pontos, rel, motivos in risco[:20]:
        linhas.append(f"| {pontos} | {rel} | {'; '.join(motivos)} |")

    linhas += ["", "## Fila completa", "", "| Prioridade | Arquivo | Motivos |", "|---|---|---|"]
    for pontos, rel, motivos in risco:
        linhas.append(f"| {pontos} | {rel} | {'; '.join(motivos)} |")

    linhas += [
        "",
        "## Como conduzir a conferência",
        "",
        "1. Abra a fonte citada e leia a passagem que sustenta a afirmação — não a página inteira.",
        "2. Se o texto afirmar mais do que a fonte sustenta, corte a afirmação até o que a fonte permite.",
        "3. Se a fonte não abrir nem no navegador, troque por uma equivalente aberta ou remova a afirmação.",
        "4. Ao terminar a conferência de um arquivo, mude `status_verificacao` para `verificado`.",
        "5. Registre a conferência em `registro-verificacao.md`.",
        "",
        "---",
        "",
        "| Home |",
        "|---|",
        "| [README](../README.md) |",
        "",
    ]
    novo = "\n".join(linhas)

    if "--check" in sys.argv:
        # Visao derivada (relacoes, marcas NAO CONFIRMADO, status e dominios bloqueados):
        # arquivo velho aqui mandava a revisao humana para a ordem antiga sem avisar.
        atual = sem_data(SAIDA.read_text(encoding="utf-8")) if SAIDA.exists() else ""
        divergencias = 1 if atual != sem_data(novo) else 0
        if divergencias:
            print(f"DIVERGE  {SAIDA.relative_to(RAIZ)}{'' if SAIDA.exists() else ' (ausente)'}")
        print(f"{len(risco)} arquivos com sinal de risco")
        print(f"CHECK {Path(__file__).name} {divergencias}")
        return 1 if divergencias else 0

    SAIDA.write_text(novo, encoding="utf-8")

    print(f"{len(risco)} arquivos com sinal de risco")
    for k, v in sorted(resumo.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print(f"relatorio: {SAIDA.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
