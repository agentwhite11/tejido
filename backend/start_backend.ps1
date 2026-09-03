$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot

$Python = Get-Command py -ErrorAction SilentlyContinue
if (-not $Python) {
    $Python = Get-Command python -ErrorAction SilentlyContinue
}
if (-not $Python) {
    throw "No se encontró Python. Instala Python 3 y vuelve a intentarlo."
}

Write-Host "Iniciando backend TEJIDO..." -ForegroundColor Cyan
if ($Python.Name -eq "py.exe") {
    & $Python.Source -3 (Join-Path $ProjectRoot "server.py")
} else {
    & $Python.Source (Join-Path $ProjectRoot "server.py")
}
