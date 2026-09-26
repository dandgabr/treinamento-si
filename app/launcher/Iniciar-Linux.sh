#!/bin/sh
# Abre o app de estudo. Com Python, sobe o servidor local (endereco estavel, o
# progresso continua no mesmo lugar). Sem Python, abre o arquivo direto no navegador.
set -u

DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if command -v python3 >/dev/null 2>&1; then
  python3 "$DIR/servidor.py" && exit 0
fi

xdg-open "$DIR/index.html" >/dev/null 2>&1 &
