#!/usr/bin/env python3
"""Servidor local do app de estudo.

Existe por dois motivos. O primeiro e a origem estavel: o progresso fica no
armazenamento do navegador, que separa por endereco, entao um endereco fixo
(127.0.0.1 na porta 4173) faz o estudo de ontem continuar hoje. O segundo e o
isolamento: aberto por file://, o Chrome deixa qualquer arquivo local ler a mesma
chave.

Ele serve um arquivo so, recusa Host estranho e nunca lista diretorio.
"""

from __future__ import annotations

import http.server
import os
import sys
import webbrowser

PORTA = int(os.environ.get("ROADMAP_PORTA", "4173"))
RAIZ = os.path.dirname(os.path.abspath(__file__))
ARQUIVO = os.path.join(RAIZ, "index.html")
HOSTS_ACEITOS = {f"127.0.0.1:{PORTA}", f"localhost:{PORTA}", f"[::1]:{PORTA}"}
CSP = (
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
    "img-src data:; font-src data:; connect-src 'none'; object-src 'none'; "
    "base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
)
# Os cabecalhos que o 200 sempre mandou e que o caminho de erro nao mandava. Ficam numa lista so
# porque agora os quatro valem nas duas respostas: `send_error` respondia 404/421 sem CSP nem
# `nosniff`, entao a pagina de erro do proprio servidor era servida sem politica de conteudo
# nenhuma — justamente na resposta que qualquer host de fora pode provocar.
CABECALHOS_DE_SEGURO = (
    ("X-Content-Type-Options", "nosniff"),
    ("Cache-Control", "no-store"),
    ("Referrer-Policy", "no-referrer"),
    ("Content-Security-Policy", CSP),
)


class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "RoadmapLocal/1"

    def version_string(self) -> str:
        # Sem a versao do Python no cabecalho Server: e fingerprint de graca.
        return self.server_version

    def log_message(self, formato: str, *args: object) -> None:
        # Sem ruido na janela do usuario; o banner e impresso uma vez, no inicio.
        pass

    def _erro(self, codigo: int, mensagem: str, frase: str | None = None) -> None:
        """Resposta de erro com os MESMOS cabecalhos de seguranca do 200.

        `send_error` do `BaseHTTPRequestHandler` so manda `Content-Type` e `Connection`, entao o
        404 de caminho desconhecido e o 421 de Host estranho saiam sem `Content-Security-Policy` e
        sem `X-Content-Type-Options`: a resposta que qualquer origem de fora consegue provocar era
        a unica sem as travas. O corpo continua sendo a mensagem em texto, e agora o navegador a
        exibe sob a mesma politica do app.

        `frase` e o texto da LINHA DE STATUS e `mensagem`, o do corpo. Estao separados porque o
        erro que vem da biblioteca (o 501) carrega texto tirado do pedido: a linha de status e
        cabecalho, e um `\\r` no meio do pedido viraria quebra de resposta. Aqui os dois textos
        sao o mesmo, como eram antes.
        """
        corpo = f"{codigo} {mensagem}\n".encode("utf-8")
        self.send_response(codigo, mensagem if frase is None else frase)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        for nome, valor in CABECALHOS_DE_SEGURO:
            self.send_header(nome, valor)
        self.end_headers()
        # `HEAD` nao tem corpo: escrever aqui seria corpo em resposta a `do_HEAD`.
        if self.command != "HEAD":
            self.wfile.write(corpo)

    def send_error(
        self, codigo: int, mensagem: str | None = None, explicacao: str | None = None
    ) -> None:
        """Todo erro que o `http.server` levanta sozinho passa a sair por `_erro`.

        O 501 de metodo nao suportado nao vem de nenhum `do_*`: quem o emite e o
        `handle_one_request` da biblioteca, chamando `send_error` — e o `send_error` dela nao
        aceita cabecalho, so sabe fixar `Content-Type`/`Connection` e uma pagina HTML. Era o
        unico caminho do servidor fora da politica de conteudo, justamente no verbo que
        qualquer origem de fora pode tentar. Como nao ha como acrescentar cabecalho a ele, o
        caminho escolhido e escrever a resposta a mao, pelo mesmo `_erro` do 404 e do 421: os
        quatro cabecalhos de uma vez e corpo minimo em texto, no lugar da pagina HTML que
        ninguem le.

        A frase da linha de status e a canonica do codigo, e nao a recebida — que no 501 traz
        o metodo que veio do pedido (ver `_erro`). `explicacao` fica na assinatura so porque e
        a da biblioteca: este servidor manda o corpo curto no lugar da explicacao longa.
        """
        canonica = self.responses[codigo][0] if codigo in self.responses else None
        # A biblioteca manda `Connection: close` nesta resposta porque quem a levanta nao leu
        # o corpo do pedido: fechar de fato evita ler os bytes que sobraram como se fossem um
        # novo pedido. A linha de status e HTTP/1.0, entao fechar e o que o cliente espera.
        self.close_connection = True
        self._erro(codigo, mensagem or canonica or "", canonica)

    def _responder(self, enviar_corpo: bool) -> None:
        if self.headers.get("Host") not in HOSTS_ACEITOS:
            self._erro(421, "Host nao reconhecido")
            return
        if self.path.split("?")[0] not in ("/", "/index.html"):
            self._erro(404, "Nao encontrado")
            return
        try:
            with open(ARQUIVO, "rb") as arquivo:
                corpo = arquivo.read()
        except OSError:
            self._erro(500, "index.html ilegivel")
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        for nome, valor in CABECALHOS_DE_SEGURO:
            self.send_header(nome, valor)
        self.end_headers()
        if enviar_corpo:
            self.wfile.write(corpo)

    def do_GET(self) -> None:
        self._responder(True)

    def do_HEAD(self) -> None:
        self._responder(False)


def main() -> int:
    if not os.path.exists(ARQUIVO):
        print("index.html nao esta na mesma pasta deste servidor.", file=sys.stderr)
        return 1
    try:
        servidor = http.server.ThreadingHTTPServer(("127.0.0.1", PORTA), Handler)
    except OSError as erro:
        print(f"Nao consegui usar a porta {PORTA} ({erro}).", file=sys.stderr)
        return 1

    endereco = f"http://127.0.0.1:{PORTA}/"
    # flush=True: sem isso o texto fica no buffer e a janela do usuario aparece vazia
    # enquanto o estudo nao termina.
    print("App de estudo no ar em " + endereco, flush=True)
    print("Deixe esta janela aberta enquanto estuda. Feche-a para encerrar.", flush=True)
    try:
        webbrowser.open(endereco)
    except Exception:
        print(
            "Nao consegui abrir o navegador sozinho; abra o endereco acima.",
            file=sys.stderr,
            flush=True,
        )
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
