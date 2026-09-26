#!/usr/bin/env python3
"""Verificacao final do repositorio: conformidade, escrita, Mermaid, links e estrutura.

Nao substitui a auditoria de citacao (que exige leitura humana das fontes), mas pega os
defeitos mecanicos que se acumulam quando muitos arquivos sao escritos em paralelo.

Uso:
    python3 scripts/verificar-repo.py            # relatorio
    python3 scripts/verificar-repo.py --strict   # falha tambem em avisos

Codigo de saida: 0 sem erros, 1 com erros (ou com avisos, em --strict).
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
RE_MERMAID = re.compile(r"^```mermaid\n(.*?)^```", re.S | re.M)
RE_LABEL = re.compile(r"\[([^\]\n]*)\]|\(([^)\n]*)\)")
STATUS = {"rascunho", "pendente", "verificado"}
LEXICO = [
    "mergulhe", "robusto", "abrangente",
    "no mundo atual", "cada vez mais", "vale destacar", "é importante ressaltar",
    "jornada de aprendizado", "jornada de transformação", "jornada de conhecimento",
    "no cenário atual", "não é apenas",
]
SECOES_EXIGIDAS = [
    ("Por que isso importa", "bloco de ancoragem no cargo"),
    ("Recuperação ativa", "itens de recuperação"),
    ("<details>", "gabarito em bloco recolhido"),
    ("Fontes verificadas", "rastreabilidade de fonte"),
]
ARQUIVOS_SEM_FRONTMATTER = {"99-fontes/registro-verificacao.md"}

erros: list[str] = []
avisos: list[str] = []


def arquivos_conteudo() -> list[Path]:
    alvos = sorted(RAIZ.glob("[0-9][0-9]-*/*.md"))
    alvos += [RAIZ / "README.md", RAIZ / "glossario.md", RAIZ / "mapa-relacoes.md"]
    return [a for a in alvos if a.exists()]


def checa_frontmatter(p: Path, txt: str) -> dict | None:
    rel = str(p.relative_to(RAIZ))
    m = RE_FM.match(txt)
    if not m:
        if rel not in ARQUIVOS_SEM_FRONTMATTER:
            erros.append(f"{rel}: sem frontmatter delimitado")
        return None
    try:
        fm = yaml.safe_load(m.group(1))
    except Exception as e:
        erros.append(f"{rel}: YAML invalido ({str(e).splitlines()[0][:60]})")
        return None
    if not isinstance(fm, dict):
        erros.append(f"{rel}: frontmatter nao e um mapa")
        return None
    if "area" in fm:
        erros.append(f"{rel}: chave proibida `area` (use area_nome/area_id)")
    st = fm.get("status_verificacao")
    if st is not None and st not in STATUS:
        erros.append(f"{rel}: status_verificacao invalido ({st!r})")
    if fm.get("status_verificacao") == "verificado":
        avisos.append(f"{rel}: marcado como verificado antes da auditoria de citacao")
    for chave in ("atualizado_em", "revisar_ate"):
        valor = fm.get(chave)
        if isinstance(valor, str) and not re.match(r'^"?\d{4}-\d{2}-\d{2}"?$', valor):
            avisos.append(f"{rel}: {chave} fora do formato AAAA-MM-DD ({valor!r})")
    return fm


def checa_lexico(p: Path, txt: str) -> None:
    rel = str(p.relative_to(RAIZ))
    m = RE_FM.match(txt)
    offset = txt[: m.end()].count("\n") if m else 0
    corpo = txt[m.end():] if m else txt
    for termo in LEXICO:
        for enc in re.finditer(rf"\b{re.escape(termo)}\b", corpo, re.I):
            linha = offset + corpo[: enc.start()].count("\n") + 1
            avisos.append(f"{rel}:{linha}: léxico proibido ({termo!r})")


def checa_mermaid(p: Path, txt: str) -> None:
    rel = str(p.relative_to(RAIZ))
    blocos = RE_MERMAID.findall(txt)
    if txt.count("```mermaid") != len(blocos):
        erros.append(f"{rel}: bloco mermaid nao fechado")
    for bloco in blocos:
        for rotulo in re.findall(r"\[([^\]\n]*)\]", bloco):
            for proibido in ("<", ">", '"', "(", ")", "#"):
                if proibido in rotulo:
                    erros.append(f"{rel}: rótulo Mermaid com caractere proibido ({proibido!r}) em {rotulo!r}")
        if re.search(r"^\s*(\w+)\s*(\(|\[|\{)?[^\n]*\bend\b", bloco, re.M):
            for linha in bloco.splitlines():
                if re.match(r"^\s*end\s*[\[\(]", linha) or re.match(r"^\s*end\s*-->", linha):
                    erros.append(f"{rel}: `end` usado como id de nó Mermaid")
        if "%%{init" in bloco:
            erros.append(f"{rel}: Mermaid usa init directive (bloqueado pelo GitHub)")
        if "click " in bloco:
            avisos.append(f"{rel}: Mermaid com clique em nó (o GitHub descarta)")


def checa_links(p: Path, txt: str) -> None:
    rel = str(p.relative_to(RAIZ))
    for destino, ancora in re.findall(r"\]\((?!https?://|#)([^)#\s]+)(#[^)\s]*)?\)", txt):
        alvo = (p.parent / destino).resolve()
        try:
            alvo.relative_to(RAIZ)
        except ValueError:
            continue
        if not alvo.exists():
            erros.append(f"{rel}: link interno quebrado -> {destino}")


def checa_estrutura(p: Path, txt: str, fm: dict | None) -> None:
    rel = str(p.relative_to(RAIZ))
    if "/TEMA-" not in rel:
        return
    for marca, descricao in SECOES_EXIGIDAS:
        if marca not in txt:
            erros.append(f"{rel}: falta {descricao} ({marca!r})")
    fontes = (fm or {}).get("fontes") or []
    if not fontes:
        erros.append(f"{rel}: frontmatter sem fontes")
    elif not any(isinstance(f, dict) and f.get("url") and f.get("tipo") for f in fontes):
        erros.append(f"{rel}: fontes sem url/tipo")


def frontmatter_de(caminho: Path) -> dict:
    m = RE_FM.match(caminho.read_text(encoding="utf-8"))
    if not m:
        return {}
    try:
        return yaml.safe_load(m.group(1)) or {}
    except Exception:
        return {}


def checa_tempos() -> None:
    """A tabela de temas do guia (§4) tem de reproduzir o `tempo_estimado` de cada tema.

    Defeito real: dois agentes editaram em paralelo e o guia ficou anunciando 45-55 min para
    temas que passaram a declarar 40-45. Sem esta checagem, ninguém veria.
    """
    for pasta in sorted(p for p in RAIZ.glob("[0-9][0-9]-*") if p.is_dir()):
        guia = pasta / "README.md"
        if not guia.exists() or pasta.name in {"90-certificacoes", "91-trilhas", "99-fontes"}:
            continue
        texto = guia.read_text(encoding="utf-8")
        for arq in sorted(pasta.glob("TEMA-*.md")):
            fm = frontmatter_de(arq)
            tid, tempo = fm.get("tema_id"), str(fm.get("tempo_estimado", ""))
            if not tid or not tempo:
                continue
            for linha in texto.splitlines():
                if not linha.startswith("| ") or f"| {tid} |" not in linha:
                    continue
                celulas = [c.strip() for c in linha.strip("|").split("|")]
                if len(celulas) >= 5 and celulas[4] != tempo:
                    erros.append(
                        f"{guia.relative_to(RAIZ)}: {tid} anuncia '{celulas[4]}' na §4, "
                        f"mas o tema declara '{tempo}'"
                    )


def checa_derivados() -> None:
    """Compara corpo e fonte nas visoes derivadas.

    Sem isto o verificador dava verde sobre um repositorio onde a navegacao formava ciclo e as
    tabelas de conexao contradiziam o frontmatter — porque so olhava o frontmatter.
    """
    import subprocess
    for script, nome in (
        ("sincronizar-navegacao.py", "rodapé de navegação"),
        ("sincronizar-guias.py", "conexões dos guias"),
        ("sincronizar-conexoes-temas.py", "conexões dos temas"),
    ):
        r = subprocess.run(
            [sys.executable, str(RAIZ / "scripts" / script), "--check"],
            capture_output=True, text=True,
        )
        divergentes = [l for l in r.stdout.splitlines() if l.startswith("DIVERGE")]
        if divergentes:
            erros.append(
                f"visão derivada divergente ({nome}): {len(divergentes)} arquivo(s) "
                f"— rode scripts/{script}"
            )


def main() -> int:
    arquivos = arquivos_conteudo()
    for p in arquivos:
        txt = p.read_text(encoding="utf-8")
        fm = checa_frontmatter(p, txt)
        checa_lexico(p, txt)
        checa_mermaid(p, txt)
        checa_links(p, txt)
        checa_estrutura(p, txt, fm)

    checa_tempos()
    checa_derivados()

    print(f"{len(arquivos)} arquivos de conteudo verificados\n")
    for a in avisos:
        print(f"AVISO  {a}")
    for e in erros:
        print(f"ERRO   {e}")
    print(f"\n{len(erros)} erros, {len(avisos)} avisos")
    if "--strict" in sys.argv:
        return 1 if (erros or avisos) else 0
    return 1 if erros else 0


if __name__ == "__main__":
    raise SystemExit(main())
