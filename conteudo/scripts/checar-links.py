#!/usr/bin/env python3
"""Checagem HTTP de todas as URLs citadas como fonte.

Percorre o frontmatter de todos os documentos, deduplica as URLs e faz uma requisicao real
em cada uma. Reporta status, redirecionamento e tempo. Nao julga o conteudo: uma pagina que
responde 200 pode nao sustentar a afirmacao — isso e a auditoria humana.

Uso:
    python3 scripts/checar-links.py                # checa e grava
    python3 scripts/checar-links.py --limite 50    # checa apenas 50 URLs
    python3 scripts/checar-links.py --check        # nao grava relatorio
"""
from __future__ import annotations

import re
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "99-fontes" / "status-links.md"
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
TIMEOUT = 20


def coleta() -> dict[str, list[str]]:
    urls: dict[str, list[str]] = {}
    alvos = sorted(RAIZ.glob("[0-9][0-9]-*/*.md")) + [RAIZ / "README.md", RAIZ / "glossario.md"]
    for p in alvos:
        if not p.exists():
            continue
        m = RE_FM.match(p.read_text(encoding="utf-8"))
        if not m:
            continue
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except Exception:
            continue
        for f in fm.get("fontes") or []:
            if isinstance(f, dict) and f.get("url"):
                urls.setdefault(str(f["url"]), []).append(str(p.relative_to(RAIZ)))
    return urls


def requisita(url: str) -> tuple[str, str]:
    pedido = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(pedido, timeout=TIMEOUT) as r:
            return (str(r.status), r.geturl() if r.geturl() != url else "")
    except urllib.error.HTTPError as e:
        if e.code in (403, 405, 406, 429):
            try:
                pedido2 = urllib.request.Request(url, headers={"User-Agent": UA})
                with urllib.request.urlopen(pedido2, timeout=TIMEOUT) as r:
                    return (str(r.status), "")
            except Exception:
                pass
        return (str(e.code), "")
    except urllib.error.URLError as e:
        motivo = str(getattr(e, "reason", e))
        return ("SEM-CONEXAO", motivo[:40])
    except Exception as e:
        return ("ERRO", str(e)[:40])


def main() -> int:
    urls = coleta()
    limite = 0
    if "--limite" in sys.argv:
        try:
            limite = int(sys.argv[sys.argv.index("--limite") + 1])
        except (IndexError, ValueError):
            limite = 0
    itens = sorted(urls.items())
    if limite:
        itens = itens[:limite]

    print(f"checando {len(itens)} URLs distintas...")
    with ThreadPoolExecutor(max_workers=12) as pool:
        status = list(pool.map(lambda kv: (kv[0], *requisita(kv[0])), itens))

    ok, ruim, bloqueado = [], [], []
    for url, codigo, extra in status:
        if codigo.startswith(("2", "3")):
            ok.append((url, codigo, extra))
        elif codigo in {"403", "405", "406", "429"}:
            bloqueado.append((url, codigo, extra))
        else:
            ruim.append((url, codigo, extra))

    hoje = date.today().isoformat()
    linhas = [
        "---",
        'escopo: "checagem de status das URLs citadas"',
        'gerado_por: "scripts/checar-links.py"',
        "fontes: []",
        f'atualizado_em: "{hoje}"',
        "revisar_ate: null",
        "status_verificacao: rascunho",
        "---",
        "",
        "# Status dos links citados",
        "",
        "> Arquivo **gerado**. Não edite à mão. Uma URL que responde 200 não prova que o texto",
        "> corresponde à fonte — isso é a auditoria humana. Aqui se verifica apenas que a página",
        "> existe, redireciona ou desapareceu.",
        "",
        f"URLs distintas checadas: **{len(status)}**. "
        f"Respondem 2xx/3xx: **{len(ok)}**. Bloqueiam cliente automatizado (403/429): **{len(bloqueado)}**. "
        f"Falhas reais: **{len(ruim)}**.",
        "",
        "> Um redirecionamento (3xx) não é link morto; está contado como resposta normal.",
        "",
        "## Falhas reais (link morto, 404, erro de servidor ou sem conexão)",
        "",
        "| Status | URL | Citada em |",
        "|---|---|---|",
    ]
    for url, codigo, extra in ruim:
        linhas.append(f"| {codigo} {extra} | <{url}> | {len(urls[url])} arquivo(s) |")

    linhas += ["", "## Bloqueio a cliente automatizado (verificar no navegador)", "",
               "| Status | URL | Citada em |", "|---|---|---|"]
    for url, codigo, _ in bloqueado:
        linhas.append(f"| {codigo} | <{url}> | {len(urls[url])} arquivo(s) |")

    linhas += ["", "## Respondem normalmente", "", "| Status | URL |", "|---|---|"]
    for url, codigo, extra in ok:
        seta = f" → {extra}" if extra else ""
        linhas.append(f"| {codigo}{seta} | <{url}> |")

    linhas += ["", "---", "", "| Home |", "|---|", "| [README](../README.md) |", ""]
    if "--check" not in sys.argv:
        SAIDA.write_text("\n".join(linhas), encoding="utf-8")
        print(f"relatorio: {SAIDA.relative_to(RAIZ)}")

    print(f"\n2xx: {len(ok)} | bloqueio automatizado: {len(bloqueado)} | falhas: {len(ruim)}")
    for url, codigo, extra in ruim:
        print(f"FALHA  {codigo} {extra}  {url}")
    return 1 if ruim else 0


if __name__ == "__main__":
    raise SystemExit(main())
