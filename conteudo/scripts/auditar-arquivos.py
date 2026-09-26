#!/usr/bin/env python3
"""Auditoria estrutural arquivo por arquivo.

Verifica, para cada documento: esquema do frontmatter, identidade (area_id/tema_id contra a
pasta e o contrato de numeracao), sequencia das secoes, esquema das fontes, placeholders
esquecidos, referencias cruzadas e duplicacao de paragrafos entre arquivos.

Nao substitui a auditoria de citacao (conferir se o texto diz o que a fonte diz), que e humana.
Produz 99-fontes/auditoria-arquivos.md e um resumo no terminal.

Uso:
    python3 scripts/auditar-arquivos.py
    python3 scripts/auditar-arquivos.py --quiet
"""
from __future__ import annotations

import hashlib
import re
import sys
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "99-fontes" / "auditoria-arquivos.md"
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
RE_SEC = re.compile(r"^##\s+(\d+)\.\s*(.+?)\s*$", re.M)
RE_URL = re.compile(r"^https?://", re.I)
RE_DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
RE_PLACEHOLDER = re.compile(r"AAAA-MM-DD|<[a-zA-Z][a-zA-Z-]{2,}>|lorem ipsum", re.I)
RE_MARCADOR = re.compile(r"\b(TODO|TBD|FIXME)\b")
TAGS_OK = {"details", "summary", "br", "sub", "sup", "kbd", "code", "em", "strong"}
GERADOS = {"mapa-relacoes.md", "indice-fontes.md", "status-links.md", "auditoria-arquivos.md",
           "fila-auditoria-humana.md"}
SEM_FRONTMATTER = {"99-fontes/registro-verificacao.md"}

TIPOS_VALIDOS = {"primaria", "academica", "secundaria"}
NIVEIS = {"base", "intermediario", "avancado"}
STATUS = {"rascunho", "pendente", "verificado"}

KEYS = {
    "tema": ["tema", "tema_id", "area_id", "nivel", "tempo_estimado", "objetivo_aprendizagem",
             "atende_objetivo", "pre_requisitos", "relacoes", "fontes", "revisao_inicial_dias",
             "atualizado_em", "revisar_ate", "status_verificacao"],
    "guia": ["area_nome", "area_id", "ordem_estudo", "nivel", "ancoragem", "certificacoes",
             "temas", "fontes", "atualizado_em", "revisar_ate", "status_verificacao"],
    "indice": ["escopo", "fontes", "atualizado_em", "revisar_ate", "status_verificacao"],
}

SECOES = {
    "tema": ["Objetivo de aprendizagem", "Pré-requisitos", "Pré-teste", "Caso real", "Conteúdo",
             "Por que isso importa", "Aplicação prática", "Autoexplicação", "Erros comuns",
             "Recuperação ativa", "Revisão espaçada", "Fontes verificadas"],
    "guia": ["Introdução", "Objetivos de aprendizagem", "Diagrama", "Temas", "Pré-requisitos",
             "Certificações", "Atividades práticas", "Checkpoint", "Termos", "Fontes verificadas"],
}

resultados: list[tuple[str, str, str]] = []   # (severidade, arquivo, mensagem)
campos_data: list[str] = []                   # AAAA-MM-DD: campo que o leitor preenche, nao defeito
paragrafos: dict[str, list[str]] = defaultdict(list)


def achado(sev: str, arq: str, msg: str) -> None:
    resultados.append((sev, arq, msg))


def tipo_de(p: Path, rel: str) -> str:
    if p.name in GERADOS or p.name == "glossario.md":
        return "glossario" if p.name == "glossario.md" else "gerado"
    if p.name == "README.md":
        if p.parent.name in {"90-certificacoes", "91-trilhas", "99-fontes"}:
            return "indice"
        return "guia" if re.match(r"^\d\d-", p.parent.name) else "indice"
    if p.name.startswith("TEMA-"):
        return "tema"
    return "outro"


def contrato() -> tuple[set[str], dict[str, list[str]]]:
    caminho = RAIZ / "templates" / "INDICE-TEMAS.md"
    areas: dict[str, list[str]] = {}
    area_atual = None
    for linha in caminho.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^##\s+(\d\d-[a-z0-9-]+)\s+—", linha)
        if m:
            area_atual = m.group(1)
            areas[area_atual] = []
            continue
        m = re.match(r"^\|\s*(TEMA-\d\d)\s*\|", linha)
        if m and area_atual:
            areas[area_atual].append(m.group(1))
    return {f"{a}#{t}" for a, ts in areas.items() for t in ts}, areas


def checa_fontes(rel: str, fm: dict) -> None:
    if Path(rel).name in GERADOS:
        return
    fontes = fm.get("fontes")
    if fontes is None:
        achado("erro", rel, "frontmatter sem a chave `fontes`")
        return
    if not isinstance(fontes, list) or not fontes:
        if rel.endswith("README.md") or rel in GERADOS or tipo_de(Path(rel), rel) in {"indice", "gerado"}:
            return
        achado("erro", rel, "frontmatter com `fontes` vazio")
        return
    for i, f in enumerate(fontes, 1):
        if not isinstance(f, dict):
            achado("erro", rel, f"fonte {i} nao e um mapa")
            continue
        for chave in ("titulo", "url", "tipo", "acessado_em", "confianca"):
            if not f.get(chave):
                achado("erro", rel, f"fonte {i} sem `{chave}`")
        url = str(f.get("url", ""))
        if url and not RE_URL.match(url):
            achado("erro", rel, f"fonte {i} com URL invalida ({url[:50]})")
        tipo = f.get("tipo")
        if tipo and tipo not in TIPOS_VALIDOS:
            achado("erro", rel, f"fonte {i} com tipo invalido ({tipo!r})")
        data_acesso = str(f.get("acessado_em", ""))
        if data_acesso and not RE_DATA.match(data_acesso):
            achado("erro", rel, f"fonte {i} com acessado_em fora de AAAA-MM-DD ({data_acesso})")
    tem_primaria = any(isinstance(f, dict) and f.get("tipo") == "primaria" for f in fontes)
    if not tem_primaria:
        achado("erro", rel, "nenhuma fonte primaria: fonte secundaria nao sustenta afirmacao normativa")


def checa_identidade(p: Path, rel: str, tipo: str, fm: dict, chaves: set[str]) -> None:
    area_id = fm.get("area_id")
    pasta = p.parent.name
    if tipo == "tema":
        if area_id != pasta:
            achado("erro", rel, f"area_id ({area_id}) difere da pasta ({pasta})")
        tema_id = str(fm.get("tema_id", ""))
        prefixo = p.name.split("-")[0] + "-" + p.name.split("-")[1]
        if tema_id and tema_id != prefixo:
            achado("erro", rel, f"tema_id ({tema_id}) difere do nome do arquivo ({prefixo})")
        chave = f"{pasta}#{tema_id}"
        if chave not in chaves:
            achado("erro", rel, f"{chave} nao consta no contrato templates/INDICE-TEMAS.md")
    if tipo == "guia" and area_id and area_id != pasta:
        achado("erro", rel, f"area_id ({area_id}) difere da pasta ({pasta})")


def checa_secoes(rel: str, tipo: str, txt: str) -> int:
    if tipo not in SECOES:
        return 0
    for frase in SECOES[tipo]:
        if frase.lower() not in txt.lower():
            achado("aviso", rel, f"secao ausente: {frase}")
    nums = [int(n) for n, _ in RE_SEC.findall(txt)]
    if nums:
        esperado = list(range(1, len(nums) + 1))
        if nums != esperado:
            achado("aviso", rel, f"secoes numeradas fora de sequencia: {nums}")
    return len(nums)


def checa_placeholders(rel: str, txt: str) -> None:
    corpo = RE_FM.sub("", txt, count=1)
    for m in RE_PLACEHOLDER.finditer(corpo):
        valor = m.group(0)
        if valor.strip("<>").lower() in TAGS_OK:
            continue
        linha = corpo[: m.start()].count("\n") + 1
        if valor.upper() == "AAAA-MM-DD":
            campos_data.append(rel)
        else:
            achado("erro", rel, f"placeholder esquecido na linha {linha}: {valor!r}")
    for m in RE_MARCADOR.finditer(corpo):
        linha = corpo[: m.start()].count("\n") + 1
        achado("erro", rel, f"marcador de pendencia na linha {linha}: {m.group(0)!r}")


def checa_datas(rel: str, fm: dict) -> None:
    at = str(fm.get("atualizado_em") or "")
    rv = str(fm.get("revisar_ate") or "")
    if at and RE_DATA.match(at) and rv and RE_DATA.match(rv):
        try:
            d1 = datetime.strptime(at, "%Y-%m-%d")
            d2 = datetime.strptime(rv, "%Y-%m-%d")
            if d2 <= d1:
                achado("erro", rel, f"revisar_ate ({rv}) nao e posterior a atualizado_em ({at})")
            elif (d2 - d1).days > 400:
                achado("aviso", rel, f"revisar_ate a {(d2 - d1).days} dias; a regra pede ate 12 meses")
        except ValueError:
            achado("erro", rel, "data invalida no frontmatter")


def checa_pre_requisitos(p: Path, rel: str, fm: dict, chaves: set[str]) -> None:
    for item in fm.get("pre_requisitos") or []:
        if not isinstance(item, str):
            achado("erro", rel, f"pre_requisito nao textual: {item!r}")
            continue
        alvo = item if "#" in item else f"{p.parent.name}#{item}"
        if alvo not in chaves:
            achado("erro", rel, f"pre-requisito inexistente: {item}")


def checa_atende(p: Path, rel: str, fm: dict, objetivos: dict[str, int]) -> None:
    vals = fm.get("atende_objetivo") or []
    if not isinstance(vals, list):
        achado("erro", rel, "atende_objetivo precisa ser lista")
        return
    total = objetivos.get(p.parent.name)
    if total is None:
        return
    for v in vals:
        if not isinstance(v, int) or v < 1:
            achado("erro", rel, f"atende_objetivo invalido: {v!r}")
        elif v > total:
            achado("erro", rel, f"atende_objetivo {v} excede os {total} objetivos do guia da area")


def checa_objetivo(rel: str, fm: dict) -> None:
    obj = str(fm.get("objetivo_aprendizagem") or "").strip()
    if not obj:
        achado("erro", rel, "objetivo_aprendizagem ausente ou vazio")
        return
    if len(obj.split()) < 6:
        achado("aviso", rel, f"objetivo_aprendizagem muito curto: {obj!r}")
    if not re.match(r"^[A-Za-zÀ-ú]+(ar|er|ir|or)\b", obj):
        achado("aviso", rel, f"objetivo_aprendizagem sem verbo no infinitivo no inicio: {obj[:60]!r}")


def coleta_paragrafos(rel: str, txt: str) -> None:
    if not rel.endswith(".md"):
        return
    corpo = RE_FM.sub("", txt, count=1)
    # a secao de conexoes e gerada por scripts/sincronizar-guias.py: repetir ali e por desenho
    corpo = re.sub(r"^##\s+\d+\.\s+Conexões com outras áreas[ \t]*$.*?(?=^##\s|\Z)", "", corpo, flags=re.S | re.M)
    # a secao de cursos e gerada por scripts/gerar-catalogo-cursos.py: repetir ali e por desenho
    corpo = re.sub(r"^##\s+Cursos (?:de segurança )?na sua conta[ \t]*$.*?(?=^##\s|\Z)", "", corpo, flags=re.S | re.M)
    for bruto in re.split(r"\n\s*\n", corpo):
        p = " ".join(bruto.split())
        if len(p.split()) < 25 or p.startswith(("|", "#", "-", ">", "```", "1.")):
            continue
        chave = hashlib.sha1(re.sub(r"[^\w\s]", "", p.lower()).encode()).hexdigest()
        paragrafos[chave].append(rel)


def main() -> int:
    chaves, _ = contrato()
    arquivos = sorted(RAIZ.glob("[0-9][0-9]-*/*.md")) + [RAIZ / "README.md", RAIZ / "glossario.md"]
    arquivos = [a for a in arquivos if a.exists()]

    objetivos: dict[str, int] = {}
    for guia in arquivos:
        if guia.name != "README.md":
            continue
        txt = guia.read_text(encoding="utf-8")
        m = re.search(r"##\s+\d+\.\s+Objetivos de aprendizagem(.*?)(?=\n##\s+\d+\.)", txt, re.S)
        if m:
            objetivos[guia.parent.name] = len(re.findall(r"^\|\s*\d+\s*\|", m.group(1), re.M))

    linhas: list[tuple[str, str, int]] = []
    for p in arquivos:
        rel = str(p.relative_to(RAIZ))
        txt = p.read_text(encoding="utf-8")
        tipo = tipo_de(p, rel)
        m = RE_FM.match(txt)
        fm: dict = {}
        if not m:
            if rel not in SEM_FRONTMATTER:
                achado("erro", rel, "sem frontmatter delimitado")
        else:
            try:
                fm = yaml.safe_load(m.group(1)) or {}
            except Exception as e:
                achado("erro", rel, f"YAML invalido: {str(e).splitlines()[0][:60]}")
                fm = {}
        if isinstance(fm, dict) and fm:
            for chave in KEYS.get(tipo, []):
                if chave not in fm:
                    achado("erro" if tipo == "tema" else "aviso", rel, f"chave ausente no frontmatter: `{chave}`")
            if fm.get("nivel") and fm["nivel"] not in NIVEIS:
                achado("erro", rel, f"nivel invalido: {fm['nivel']!r}")
            if fm.get("status_verificacao") not in STATUS:
                achado("erro", rel, f"status_verificacao invalido: {fm.get('status_verificacao')!r}")
            if "area" in fm:
                achado("erro", rel, "chave proibida `area`")
            checa_identidade(p, rel, tipo, fm, chaves)
            checa_fontes(rel, fm)
            checa_datas(rel, fm)
            if tipo == "tema":
                checa_pre_requisitos(p, rel, fm, chaves)
                checa_atende(p, rel, fm, objetivos)
                checa_objetivo(rel, fm)
        n_sec = checa_secoes(rel, tipo, txt)
        checa_placeholders(rel, txt)
        coleta_paragrafos(rel, txt)
        if tipo == "tema":
            palavras = len(RE_FM.sub("", txt, count=1).split())
            if palavras < 400:
                achado("aviso", rel, f"tema curto: {palavras} palavras")
        linhas.append((rel, tipo, n_sec))

    for chave, arqs in paragrafos.items():
        unicos = sorted(set(arqs))
        if len(unicos) > 1:
            for rel in unicos:
                achado("aviso", rel, f"paragrafo identico em {len(unicos)} arquivos: {unicos}")

    if campos_data:
        por_arq = len(set(campos_data))
        achado("aviso", "(agregado)",
               f"{len(campos_data)} campos AAAA-MM-DD em {por_arq} arquivo(s): tabelas de registro "
               f"que o leitor preenche. Intencional nas trilhas; conferir se sobrou em outro lugar.")

    erros = [r for r in resultados if r[0] == "erro"]
    avisos = [r for r in resultados if r[0] == "aviso"]
    por_arquivo: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for sev, arq, msg in resultados:
        por_arquivo[arq].append((sev, msg))

    hoje = date.today().isoformat()
    out = [
        "---",
        'escopo: "auditoria estrutural arquivo por arquivo"',
        'gerado_por: "scripts/auditar-arquivos.py"',
        "fontes: []",
        f'atualizado_em: "{hoje}"',
        "revisar_ate: null",
        "status_verificacao: rascunho",
        "---",
        "",
        "# Auditoria por arquivo",
        "",
        "> Arquivo **gerado**. Não edite à mão. Cobre esquema do frontmatter, identidade,",
        "> sequência de seções, fontes, placeholders, referências cruzadas e duplicação.",
        "> Não cobre a conferência de conteúdo contra a fonte — essa é a auditoria humana.",
        "",
        f"Arquivos auditados: **{len(linhas)}**. Erros: **{len(erros)}**. Avisos: **{len(avisos)}**.",
        "",
        "## Resultado por arquivo",
        "",
        "| Arquivo | Tipo | Seções | Erros | Avisos | Situação |",
        "|---|---|---|---|---|---|",
    ]
    for rel, tipo, n_sec in linhas:
        achados = por_arquivo.get(rel, [])
        e = sum(1 for s, _ in achados if s == "erro")
        a = sum(1 for s, _ in achados if s == "aviso")
        sit = "ERRO" if e else ("aviso" if a else "ok")
        out.append(f"| {rel} | {tipo} | {n_sec} | {e} | {a} | {sit} |")

    out += ["", "## Achados", ""]
    for sev, arq, msg in sorted(resultados):
        out.append(f"- **{sev.upper()}** `{arq}`: {msg}")
    out += ["", "---", "", "| Home |", "|---|", "| [README](../README.md) |", ""]
    SAIDA.write_text("\n".join(out), encoding="utf-8")

    print(f"{len(linhas)} arquivos auditados, {len(erros)} erros, {len(avisos)} avisos")
    if "--quiet" not in sys.argv:
        for sev, arq, msg in sorted(erros):
            print(f"ERRO   {arq}: {msg}")
    print(f"relatorio: {SAIDA.relative_to(RAIZ)}")
    return 1 if erros else 0


if __name__ == "__main__":
    raise SystemExit(main())
