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
    "base-uri 'none'; form-action 'none'"
)


class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "RoadmapLocal/1"

    def log_message(self, formato: str, *args: object) -> None:
        # Sem ruido na janela do usuario; o banner e impresso uma vez, no inicio.
        pass

    def _responder(self, enviar_corpo: bool) -> None:
        if self.headers.get("Host") not in HOSTS_ACEITOS:
            self.send_error(421, "Host nao reconhecido")
            return
        if self.path.split("?")[0] not in ("/", "/index.html"):
            self.send_error(404, "Nao encontrado")
            return
        try:
            with open(ARQUIVO, "rb") as arquivo:
                corpo = arquivo.read()
        except OSError:
            self.send_error(500, "index.html ilegivel")
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", CSP)
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
