@echo off
setlocal
cd /d "%~dp0"
title TEJIDO - Servidor

set "PYTHON_EXE="

where py >nul 2>nul
if %errorlevel%==0 set "PYTHON_EXE=py"

if not defined PYTHON_EXE (
  where python >nul 2>nul
  if %errorlevel%==0 set "PYTHON_EXE=python"
)

if not defined PYTHON_EXE (
  if exist "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
    set "PYTHON_EXE=C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  )
)

if not defined PYTHON_EXE (
  echo.
  echo No se encontro Python en este equipo.
  echo Instala Python 3 y vuelve a abrir este archivo.
  echo.
  pause
  exit /b 1
)

echo Iniciando TEJIDO...
"%PYTHON_EXE%" -c "import mysql.connector" >nul 2>nul

if %errorlevel%==0 (
  echo Base de datos: MySQL
  "%PYTHON_EXE%" server_mysql.py
) else (
  echo MySQL no esta disponible en este Python.
  echo TEJIDO se iniciara en modo local para no detener la presentacion.
  "%PYTHON_EXE%" server.py
)

echo.
echo El servidor se detuvo. Revisa el mensaje anterior.
pause
endlocal
