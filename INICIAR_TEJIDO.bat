@echo off
setlocal
cd /d "%~dp0"
title TEJIDO - Inicio seguro

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0INICIAR_TEJIDO.ps1"
set "RESULT=%ERRORLEVEL%"

if not "%RESULT%"=="0" (
  echo.
  echo No fue posible iniciar TEJIDO. Revisa el mensaje anterior.
  pause
)

exit /b %RESULT%
