@echo off
rem Abre o app de estudo. Com Python, sobe o servidor local (endereco estavel, o
rem progresso continua no mesmo lugar). Sem Python, abre o arquivo no navegador.
setlocal
set "DIR=%~dp0"

rem `if errorlevel 1` e comparacao de execucao; `%errorlevel%` dentro de bloco seria
rem expandido antes de o comando rodar e o fallback nunca aconteceria.
where py >nul 2>&1
if not errorlevel 1 (
  py "%DIR%servidor.py"
  if errorlevel 1 goto :fallback
  exit /b 0
)

where python >nul 2>&1
if not errorlevel 1 (
  python "%DIR%servidor.py"
  if errorlevel 1 goto :fallback
  exit /b 0
)

:fallback
start "" "%DIR%index.html"
