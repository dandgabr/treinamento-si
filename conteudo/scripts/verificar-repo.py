#!/usr/bin/env python3
"""Verificacao final do repositorio: conformidade, escrita, Mermaid, links, estrutura e derivados.

Nao substitui a auditoria de citacao (que exige leitura humana das fontes), mas pega os
defeitos mecanicos que se acumulam quando muitos arquivos sao escritos em paralelo.

Uso (a partir da pasta `conteudo/`):
    python3 scripts/verificar-repo.py            # relatorio
    python3 scripts/verificar-repo.py --strict   # falha tambem em avisos

Codigo de saida: 0 sem erros, 1 com erros (ou com avisos, em --strict).

Este verificador NAO escreve nada: ele roda os sincronizadores em `--check` e, no fim, confere
que nenhum arquivo do repositorio mudou de conteudo. Conferir nao pode alterar o que se audita.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML ausente. Instale com: pip install pyyaml")

RAIZ = Path(__file__).resolve().parent.parent
CONTRIBUTING = RAIZ / "CONTRIBUTING.md"
PASTA_TEMPLATES = RAIZ / "templates"
FRONTMATTER_MD = PASTA_TEMPLATES / "FRONTMATTER.md"
RELACOES_MD = PASTA_TEMPLATES / "RELACOES-TEMAS.md"
RE_FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
RE_MERMAID = re.compile(r"^```mermaid\n(.*?)^```", re.S | re.M)
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

# Ampersand nao entra em lista nenhuma: `ATT&CK` e rotulo legitimo no material (area 12) e a
# secao 7 do CONTRIBUTING nao o proibe. O que o material proibe e `< > " ( ) #` em rotulo, mais
# as palavras reservadas — e isso esta no contrato lido abaixo, nao numa copia local.

# Fichas de `templates/` e o rotulo com que `templates/FRONTMATTER.md` declara as chaves delas.
FICHAS = {
    "TEMPLATE-guia-area.md": "Guia de área",
    "TEMPLATE-tema.md": "Tema",
    "TEMPLATE-plano-estudo.md": "Plano de estudo",
    "TEMPLATE-certificacoes.md": "Certificações",
    "TEMPLATE-glossario.md": "Glossário",
}

# Visoes derivadas: cada script aceita `--check`, nao escreve nesse modo e termina com a linha
# `CHECK <nome-do-script> <n>`. O nome entre parenteses e so para a mensagem de erro.
DERIVADOS = [
    ("sincronizar-navegacao.py", "rodapé de navegação"),
    ("sincronizar-guias.py", "conexões dos guias"),
    ("sincronizar-conexoes-temas.py", "conexões dos temas"),
    ("relacoes.py", "mapa de relações"),
    ("limpar-pendentes.py", "marcas `pendente` obsoletas"),
    ("reconciliar-simetria.py", "relações simétricas sem espelho"),
    ("gerar-indice-fontes.py", "índice de fontes"),
    ("auditar-arquivos.py", "auditoria por arquivo"),
    ("gerar-fila-auditoria.py", "fila de auditoria humana"),
]
RE_MARCA_CHECK = re.compile(r"^CHECK\s+(\S+)\s+(\d+)\s*$", re.M)
SINAIS_DO_SINCRONIZADOR = {"DIVERGE", "ERRO", "FALHA", "CONFLITO", "TETO", "ESPELHADO", "OBSOLETO"}
# `checar-links.py` fica de fora de proposito: depende de HTTP (242 URLs) e o verificador tem de
# rodar offline. O que ele deriva (`status-links.md`) e foto da rede, nao do material.

RE_CONTRATO_MERMAID = re.compile(r"<!--\s*contrato-mermaid:\s*(\{.*?\})\s*-->", re.S)

erros: list[str] = []
avisos: list[str] = []


def secoes_nivel(texto: str, nivel: int = 2) -> list[tuple[str, int, int]]:
    """(titulo, inicio do corpo, fim do corpo) de cada secao do nivel dado."""
    cabecalhos = [
        (m.group(1).strip(), m.start(), m.end())
        for m in re.finditer(rf"^#{{{nivel}}}\s+(\S.*)$", texto, re.M)
    ]
    faixas = []
    for i, (titulo, _, fim) in enumerate(cabecalhos):
        proximo = cabecalhos[i + 1][1] if i + 1 < len(cabecalhos) else len(texto)
        faixas.append((titulo, fim, proximo))
    return faixas


def secao(texto: str, titulo_re: str, nivel: int = 2) -> str:
    """Corpo da secao cujo titulo casa com `titulo_re`. Vazio quando nao existe."""
    for titulo, inicio, fim in secoes_nivel(texto, nivel):
        if re.search(titulo_re, titulo, re.I):
            return texto[inicio:fim]
    return ""


def linhas_da_tabela(bloco: str) -> list[list[str]]:
    """Linhas de tabela markdown do bloco, celulas ja aparadas e separador fora."""
    linhas = []
    for linha in bloco.splitlines():
        if not linha.startswith("|"):
            continue
        celulas = [c.strip() for c in linha.strip().strip("|").split("|")]
        if celulas and all(not c or re.fullmatch(r":?-{2,}:?", c) for c in celulas):
            continue
        linhas.append(celulas)
    return linhas


def citados(bloco: str) -> list[str]:
    """Chaves entre crases de um trecho (`` `area_id` `` -> area_id)."""
    return re.findall(r"`([^`\n]+)`", bloco)


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
    """Lexico proibido e ERRO, nao aviso: e regra da secao 5 do CONTRIBUTING.

    Enquanto era aviso, so o modo `--strict` — que ninguem roda — reprovava um bordao publicado,
    e o relatorio normal saia "verde com ressalva". O que se proibe e o bordo, nao a palavra em
    sentido proprio: a propria secao 5 exemplifica isso com "jornada de trabalho".
    """
    rel = str(p.relative_to(RAIZ))
    m = RE_FM.match(txt)
    offset = txt[: m.end()].count("\n") if m else 0
    corpo = txt[m.end():] if m else txt
    for termo in LEXICO:
        for enc in re.finditer(rf"\b{re.escape(termo)}\b", corpo, re.I):
            linha = offset + corpo[: enc.start()].count("\n") + 1
            erros.append(
                f"{rel}:{linha}: léxico proibido ({termo!r}) — reescreva o trecho sem o bordão "
                f"(CONTRIBUTING §5: o que se proíbe é o bordão, não a palavra)"
            )


def carrega_contrato_mermaid() -> dict:
    """Le o contrato do Mermaid onde ele e declarado: a secao 7 do CONTRIBUTING.

    O bloco `<!-- contrato-mermaid: {...} -->` e a forma legivel por maquina da mesma regra que a
    prosa acima dele. Ele existe para este verificador e para o gate do app lerem o contrato de um
    lugar so: antes cada um mantinha a propria copia, e a do app ficou para tras (guardava so a
    lista de rotulos) sem que nada acusasse a divergencia.
    """
    if not CONTRIBUTING.exists():
        erros.append(
            "CONTRIBUTING.md: ausente — é a convenção do material e onde vive o contrato do Mermaid"
        )
        return {}
    txt = CONTRIBUTING.read_text(encoding="utf-8")
    m = RE_CONTRATO_MERMAID.search(txt)
    if not m:
        erros.append(
            "CONTRIBUTING.md §7: falta o bloco `<!-- contrato-mermaid: {...} -->`, que é a fonte "
            "única das regras de rótulo Mermaid — restaure-o lá em vez de reimplementar a lista "
            "em cada verificador"
        )
        return {}
    try:
        contrato = json.loads(m.group(1))
    except Exception as e:
        erros.append(
            f"CONTRIBUTING.md §7: contrato-mermaid ilegível ({str(e)[:60]}) — corrija o JSON do bloco"
        )
        return {}
    if not isinstance(contrato, dict):
        erros.append("CONTRIBUTING.md §7: contrato-mermaid precisa ser um objeto JSON")
        return {}

    texto_secao = secao(txt, r"Diagramas Mermaid")
    if not texto_secao:
        erros.append("CONTRIBUTING.md §7: seção 'Diagramas Mermaid' não encontrada")
        return contrato
    proibidos = set(contrato.get("rotulos_proibidos") or [])
    na_prosa = set(re.findall(r"`(\W)`", texto_secao))
    if na_prosa != proibidos:
        erros.append(
            f"CONTRIBUTING.md §7: a lista de caracteres proibidos em rótulo na prosa "
            f"({sorted(na_prosa)}) difere do contrato ({sorted(proibidos)}) — a regra escrita e o "
            f"contrato têm de mudar juntos"
        )
    for chave in ("ids_proibidos", "diretivas_proibidas", "recursos_proibidos"):
        for valor in contrato.get(chave) or []:
            if valor not in texto_secao:
                erros.append(
                    f"CONTRIBUTING.md §7: o contrato proíbe {valor!r} e a prosa não menciona — "
                    f"escreva a regra na seção junto com o contrato"
                )
    return contrato


def checa_mermaid(p: Path, txt: str, contrato: dict) -> None:
    rel = str(p.relative_to(RAIZ))
    blocos = RE_MERMAID.findall(txt)
    if txt.count("```mermaid") != len(blocos):
        erros.append(f"{rel}: bloco mermaid nao fechado")
    for bloco in blocos:
        for rotulo in re.findall(r"\[([^\]\n]*)\]", bloco):
            for proibido in contrato.get("rotulos_proibidos") or []:
                if proibido in rotulo:
                    erros.append(
                        f"{rel}: rótulo Mermaid com caractere proibido ({proibido!r}) em {rotulo!r} "
                        f"— o GitHub sanitiza `<` como HTML e o nó desaparece (CONTRIBUTING §7)"
                    )
        for palavra in contrato.get("ids_proibidos") or []:
            if re.search(rf"^\s*{re.escape(palavra)}\s*[\[\(\{{]", bloco, re.M) or re.search(
                rf"^\s*{re.escape(palavra)}\s*-->", bloco, re.M
            ):
                erros.append(
                    f"{rel}: `{palavra}` usado como id de nó Mermaid (palavra reservada) — "
                    f"renomeie o nó (CONTRIBUTING §7)"
                )
        for diretiva in contrato.get("diretivas_proibidas") or []:
            if diretiva in bloco:
                erros.append(
                    f"{rel}: Mermaid com diretiva `{diretiva}...}}%%` (o GitHub bloqueia) — "
                    f"remova a diretiva (CONTRIBUTING §7)"
                )
        for recurso in contrato.get("recursos_proibidos") or []:
            if f"{recurso} " in bloco:
                avisos.append(f"{rel}: Mermaid com `{recurso}` em nó (o GitHub descarta)")


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
    temas que passaram a declarar 40-45. Sem esta checagem, ninguem veria.
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


def huella() -> dict[str, str]:
    """Conteudo de cada arquivo do repositorio, para provar que conferir nao escreve."""
    assinaturas: dict[str, str] = {}
    for p in sorted(RAIZ.rglob("*")):
        partes = p.relative_to(RAIZ).parts
        # Pastas ocultas (`.git`, caches de ferramenta) ficam fora: nao sao material e podem ter
        # imagem grande, que so custaria leitura.
        if not p.is_file() or "__pycache__" in partes or any(x.startswith(".") for x in partes):
            continue
        try:
            assinaturas[str(p.relative_to(RAIZ))] = hashlib.sha256(p.read_bytes()).hexdigest()
        except OSError:
            continue
    return assinaturas


def roda_sincronizador(script: str, nome: str) -> None:
    """Roda um sincronizador em `--check` e reprova quando a visao derivada nao esta em dia.

    A ausencia da linha final `CHECK <script> <n>` conta como falha, e nao como "sem divergencia":
    era assim que um sincronizador que morria no meio — sem imprimir DIVERGE nenhum — deixava o
    repositorio passar verde sobre uma visao derivada que ninguem conferiu.
    """
    caminho = RAIZ / "scripts" / script
    if not caminho.exists():
        erros.append(
            f"scripts/{script}: ausente — o CONTRIBUTING §12 anuncia esta visão derivada ({nome})"
        )
        return
    r = subprocess.run([sys.executable, str(caminho), "--check"], capture_output=True, text=True)
    saida = r.stdout or ""
    marca = RE_MARCA_CHECK.search(saida)
    sinais = [
        linha
        for linha in saida.splitlines()
        if linha.split() and linha.split()[0] in SINAIS_DO_SINCRONIZADOR
    ]
    if not marca or marca.group(1) != script:
        cauda = (r.stderr or "").strip().splitlines()
        detalhe = f" — {cauda[-1][:160]}" if cauda else ""
        erros.append(
            f"scripts/{script}: o sincronizador não concluiu em --check (código {r.returncode}, "
            f"sem a linha final `CHECK {script} <n>`){detalhe} — a visão derivada ({nome}) não foi "
            f"conferida; corrija o script antes de confiar no verde"
        )
        return
    pendentes = int(marca.group(2))
    if pendentes or r.returncode == 1:
        amostra = "; ".join(sinais[:3]) if sinais else f"{pendentes} pendência(s)"
        erros.append(
            f"visão derivada divergente ({nome}): {pendentes} pendência(s) — o material foi "
            f"editado sem regerar o que deriva dele; rode `python3 scripts/{script}` e inclua o "
            f"resultado no commit ({amostra})"
        )


def checa_derivados() -> None:
    """Compara o material com tudo o que deriva dele.

    Sem isto o verificador dava verde sobre um repositorio onde a navegacao formava ciclo e as
    tabelas de conexao contradiziam o frontmatter — porque so olhava o frontmatter. A conferencia
    tambem prova que ela mesma nao escreve: o material inteiro e assinado antes e depois.
    """
    antes = huella()
    for script, nome in DERIVADOS:
        roda_sincronizador(script, nome)
    depois = huella()
    mudados = sorted(
        {chave for chave in set(antes) | set(depois) if antes.get(chave) != depois.get(chave)}
    )
    if mudados:
        amostra = ", ".join(mudados[:5]) + ("…" if len(mudados) > 5 else "")
        erros.append(
            f"o verificador escreveu no repositório ({amostra}): `--check` existe para conferir "
            f"sem escrever — nenhum verificador pode alterar o material que audita"
        )


def chaves_do_esquema(texto: str) -> dict[str, list[str]]:
    """`templates/FRONTMATTER.md` -> {rotulo do template: chaves declaradas}."""
    esquema: dict[str, list[str]] = {}
    for celulas in linhas_da_tabela(secao(texto, r"Chaves por template"))[1:]:
        if len(celulas) < 2:
            continue
        esquema[celulas[0]] = citados(celulas[1])
    return esquema


def checa_templates() -> None:
    """As fichas de `templates/` ficavam fora do alcance: uma ficha quebrada passava.

    O esquema de `templates/FRONTMATTER.md` e o dono das chaves; a ficha mostra as chaves ja
    preenchidas. Confere os campos obrigatorios, a chave inventada e a data-exemplo sem aspas
    (armadilha declarada no proprio FRONTMATTER.md).
    """
    if not FRONTMATTER_MD.exists():
        erros.append(
            "templates/FRONTMATTER.md: ausente — é o registro único das chaves e a fonte da "
            "conferência das cinco fichas"
        )
        return
    texto_esquema = FRONTMATTER_MD.read_text(encoding="utf-8")
    esquema = chaves_do_esquema(texto_esquema)
    if not esquema:
        erros.append(
            "templates/FRONTMATTER.md: o quadro 'Chaves por template' não foi encontrado ou está "
            "vazio — sem ele não há como conferir as fichas"
        )
    fichas = sorted(PASTA_TEMPLATES.glob("TEMPLATE-*.md"))
    if not fichas:
        erros.append("templates/: nenhuma ficha `TEMPLATE-*.md` — o CONTRIBUTING §2 promete cinco")
    for ficha in fichas:
        rel = f"templates/{ficha.name}"
        rotulo = FICHAS.get(ficha.name)
        if rotulo is None:
            erros.append(
                f"{rel}: ficha sem linha no quadro 'Chaves por template' — registre as chaves dela "
                f"em templates/FRONTMATTER.md, senão ela não obedece a esquema nenhum"
            )
            continue
        esperadas = next(
            (chaves for chave, chaves in esquema.items() if chave.startswith(rotulo)), None
        )
        if esperadas is None:
            erros.append(
                f"{rel}: templates/FRONTMATTER.md não declara as chaves de {rotulo!r} — sem essa "
                f"linha a ficha não tem esquema a que obedecer"
            )
            continue
        txt = ficha.read_text(encoding="utf-8")
        m = RE_FM.match(txt)
        if not m:
            erros.append(
                f"{rel}: ficha sem frontmatter delimitado — a ficha existe para mostrar as chaves"
            )
            continue
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except Exception as e:
            erros.append(f"{rel}: YAML invalido ({str(e).splitlines()[0][:60]})")
            continue
        presentes = list(fm.keys())
        for chave in esperadas:
            if chave not in presentes:
                erros.append(
                    f"{rel}: ficha sem o campo obrigatório `{chave}` — as chaves de cada ficha são "
                    f"as do quadro 'Chaves por template' de templates/FRONTMATTER.md"
                )
        for chave in presentes:
            if chave not in esperadas:
                erros.append(
                    f"{rel}: campo `{chave}` não consta no esquema (templates/FRONTMATTER.md) — "
                    f"não invente chave: registre-a no esquema primeiro"
                )
        for achado in re.finditer(r"^\s*([a-z_]+):\s*(AAAA-MM-DD)\s*$", txt, re.M):
            erros.append(
                f"{rel}: `{achado.group(1)}` com data-exemplo sem aspas — no Obsidian vira tipo "
                f'data (use "AAAA-MM-DD", como manda templates/FRONTMATTER.md)'
            )
        if ficha.name != "TEMPLATE-tema.md":
            continue
        na_ficha = set((fm.get("relacoes") or {}).keys())
        do_esquema = {
            citados(celulas[0])[0]
            for celulas in linhas_da_tabela(secao(texto_esquema, r"Schema de .relacoes."))[1:]
            if celulas and citados(celulas[0])
        }
        if na_ficha and do_esquema and na_ficha != do_esquema:
            erros.append(
                f"{rel}: `relacoes` com {sorted(na_ficha)} e templates/FRONTMATTER.md declara "
                f"{sorted(do_esquema)} — as duas listas têm de ser a mesma"
            )
        if RELACOES_MD.exists():
            chaves = {
                citados(celulas[1])[0]
                for celulas in linhas_da_tabela(RELACOES_MD.read_text(encoding="utf-8"))
                if len(celulas) > 2 and celulas[0] != "Relação" and citados(celulas[1])
            }
            # `pre_requisitos` e chave de topo do frontmatter, nao do bloco `relacoes`.
            chaves.discard("pre_requisitos")
            if chaves and chaves != na_ficha:
                erros.append(
                    f"{rel}: `relacoes` com {sorted(na_ficha)} e templates/RELACOES-TEMAS.md "
                    f"declara {sorted(chaves)} — unifique o vocabulário"
                )


def checa_contributing() -> None:
    """A propria convencao ficava fora do alcance: ela prometia arquivos que nao existem.

    Confere o que o CONTRIBUTING declara que existe (scripts e fichas), se todo script e toda
    ficha do repositorio estao documentados, e se a promessa da §12 sobre `--check` e verdadeira.
    """
    if not CONTRIBUTING.exists():
        return  # a ausencia ja foi acusada na carga do contrato
    txt = CONTRIBUTING.read_text(encoding="utf-8")

    for ref in sorted(set(re.findall(r"`(scripts/[a-z0-9-]+\.py)`", txt))):
        if not (RAIZ / ref).exists():
            erros.append(
                f"CONTRIBUTING.md: cita `{ref}`, que não existe — crie o script ou corrija a convenção"
            )
    for ref in sorted(set(re.findall(r"`(templates/[A-Za-z0-9-]+\.md)`", txt))):
        if not (RAIZ / ref).exists():
            erros.append(
                f"CONTRIBUTING.md: cita `{ref}`, que não existe — crie a ficha ou corrija a convenção"
            )

    citados_scripts = set(re.findall(r"`scripts/([a-z0-9-]+\.py)`", txt))
    for arq in sorted((RAIZ / "scripts").glob("*.py")):
        if arq.name not in citados_scripts:
            erros.append(
                f"CONTRIBUTING.md §12: `scripts/{arq.name}` existe e não está na tabela de scripts "
                f"— documente o que ele faz e se escreve"
            )
    citadas = set(re.findall(r"`templates/([A-Za-z0-9-]+\.md)`", txt))
    for arq in sorted(PASTA_TEMPLATES.glob("TEMPLATE-*.md")):
        if arq.name not in citadas:
            erros.append(
                f"CONTRIBUTING.md §2: a ficha `templates/{arq.name}` não está no quadro "
                f"'Qual template usar' — nenhum arquivo nasce fora dos cinco formatos"
            )

    tabela = linhas_da_tabela(secao(txt, r"Scripts do repositório"))
    if not tabela:
        erros.append("CONTRIBUTING.md §12: tabela de scripts não encontrada")
    for celulas in tabela[1:]:
        if len(celulas) < 3:
            continue
        achado = re.match(r"`(scripts/[a-z0-9-]+\.py)`", celulas[0])
        if not achado:
            continue
        ref = achado.group(1)
        caminho = RAIZ / ref
        if not caminho.exists():
            continue  # ja acusado acima
        fonte = caminho.read_text(encoding="utf-8")
        escreve_na_tabela = celulas[-1].lower().startswith("sim")
        # Busca por padrao, e nao por substring literal: uma substring literal apareceria nesta
        # propria linha de comparacao e o verificador se acusaria sozinho.
        escreve_no_codigo = re.search(r"\.write_(?:text|bytes)\(", fonte) is not None
        if escreve_na_tabela != escreve_no_codigo:
            erros.append(
                f"CONTRIBUTING.md §12: a coluna 'Escreve?' de `{ref}` diz "
                f"{'sim' if escreve_na_tabela else 'não'} e o script "
                f"{'grava' if escreve_no_codigo else 'não grava'} arquivo — corrija para "
                f"{'sim' if escreve_no_codigo else 'não'}"
            )
        # O modo de conferencia dos sincronizadores de verdade e exercitado em `checa_derivados`;
        # aqui so da para conferir a existencia da opcao (o `checar-links.py`, por exemplo,
        # depende de HTTP e nao roda neste verificador).
        if escreve_na_tabela and "--check" not in fonte:
            erros.append(
                f"CONTRIBUTING.md §12: diz que todo script aceita `--check`, e `{ref}` não trata "
                f"essa opção — implemente o modo de conferência"
            )


def checa_fonte_unica_do_contrato(contrato: dict) -> None:
    """O contrato do Mermaid tem um dono so: nenhuma ficha nem script mantem copia da lista.

    Era a copia do gate do app que ficava para tras (guardava so a lista de rotulos), entao a
    lista de caracteres proibidos so pode aparecer na secao 7 do CONTRIBUTING.
    """
    proibidos = set(contrato.get("rotulos_proibidos") or [])
    if not proibidos:
        return
    alvos = sorted(PASTA_TEMPLATES.glob("*.md")) + sorted((RAIZ / "scripts").glob("*.py"))
    if (RAIZ / "app" / "scripts").exists():
        alvos += sorted((RAIZ / "app" / "scripts").rglob("*.ts"))
    for arq in alvos:
        for i, linha in enumerate(arq.read_text(encoding="utf-8").splitlines(), 1):
            marca = set(re.findall(r"`(\W)`", linha))
            if len(marca & proibidos) >= 3:
                erros.append(
                    f"{arq.relative_to(RAIZ)}:{i}: lista de caracteres proibidos em rótulo Mermaid "
                    f"repetida fora do CONTRIBUTING §7 — aponte para a §7 em vez de manter uma cópia"
                )


def main() -> int:
    contrato = carrega_contrato_mermaid()
    checa_contributing()
    checa_templates()
    checa_fonte_unica_do_contrato(contrato)

    arquivos = arquivos_conteudo()
    for p in arquivos:
        txt = p.read_text(encoding="utf-8")
        fm = checa_frontmatter(p, txt)
        checa_lexico(p, txt)
        checa_mermaid(p, txt, contrato)
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
