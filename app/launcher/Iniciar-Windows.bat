@echo off
rem Abre o app de estudo. Com Python, sobe o servidor local (endereco estavel, o
rem progresso continua no mesmo lugar). Sem Python, abre o arquivo no navegador.
setlocal
set "DIR=%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
  py "%DIR%servidor.py"
  if %errorlevel%==0 exit /b 0
)

where python >nul 2>&1
if %errorlevel%==0 (
  python "%DIR%servidor.py"
  if %errorlevel%==0 exit /b 0
)

start "" "%DIR%index.html"
