$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot "node_modules"))) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    npm install
}

Write-Host "Iniciando frontend React + Vite..." -ForegroundColor Cyan
npm run dev -- --host 127.0.0.1 --open
