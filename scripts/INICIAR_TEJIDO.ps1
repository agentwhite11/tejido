$ErrorActionPreference = "Stop"

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Server = Join-Path $Root "server.py"
$AppUrl = "http://127.0.0.1:8765/#explorar"
$HealthUrl = "http://127.0.0.1:8765/api/health"
$CodexPython = "C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$Mutex = [Threading.Mutex]::new($false, "Local\TEJIDO-Servidor-8765")
$HasLock = $false

function Test-TejidoHealth {
    try {
        $Health = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 1
        return $Health.status -eq "ok" -and $Health.database -eq "sqlite"
    }
    catch {
        return $false
    }
}

function Find-Python {
    $Candidates = @()

    if (Test-Path -LiteralPath $CodexPython) {
        $Candidates += [pscustomobject]@{ File = $CodexPython; Arguments = @() }
    }

    foreach ($CommandName in @("py", "python", "python3")) {
        $Command = Get-Command $CommandName -ErrorAction SilentlyContinue
        if ($Command) {
            $Arguments = if ($CommandName -eq "py") { @("-3") } else { @() }
            $Candidates += [pscustomobject]@{ File = $Command.Source; Arguments = $Arguments }
        }
    }

    foreach ($Candidate in $Candidates) {
        try {
            & $Candidate.File @($Candidate.Arguments) -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 9) else 1)" 2>$null
            if ($LASTEXITCODE -eq 0) {
                return $Candidate
            }
        }
        catch { }
    }

    return $null
}

function Open-Tejido {
    Write-Host "TEJIDO esta listo." -ForegroundColor Green
    Write-Host $AppUrl
    if ($env:TEJIDO_NO_BROWSER -ne "1") {
        Start-Process $AppUrl
    }
}

try {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "       INICIANDO TEJIDO"
    Write-Host "========================================"
    Write-Host ""

    if (Test-TejidoHealth) {
        Write-Host "El servidor ya estaba activo; no se abrira otra instancia."
        Open-Tejido
        exit 0
    }

    $HasLock = $Mutex.WaitOne(0)
    if (-not $HasLock) {
        Write-Host "TEJIDO ya se esta iniciando. Esperando respuesta..."
        foreach ($Attempt in 1..30) {
            if (Test-TejidoHealth) {
                Open-Tejido
                exit 0
            }
            Start-Sleep -Milliseconds 500
        }
        throw "Otro inicio de TEJIDO no logro activar el servidor. Intenta nuevamente."
    }

    $Python = Find-Python
    if (-not $Python) {
        throw "No se encontro Python 3.9 o posterior. Instala Python 3 y activa 'Add Python to PATH'."
    }

    if (-not (Test-Path -LiteralPath $Server)) {
        throw "No se encontro server.py en la raiz del proyecto."
    }

    Write-Host "Python encontrado: $($Python.File)"
    Write-Host "Activando el servidor local..."

    $ServerArgument = '"{0}"' -f $Server
    $ProcessArguments = @($Python.Arguments) + @($ServerArgument)
    $ServerProcess = Start-Process `
        -FilePath $Python.File `
        -ArgumentList $ProcessArguments `
        -WorkingDirectory $Root `
        -WindowStyle Hidden `
        -PassThru

    foreach ($Attempt in 1..30) {
        if (Test-TejidoHealth) {
            Open-Tejido
            exit 0
        }
        if ($ServerProcess.HasExited) {
            throw "El servidor se cerro antes de estar listo. Codigo: $($ServerProcess.ExitCode)."
        }
        Start-Sleep -Milliseconds 500
    }

    throw "El servidor no respondio en el puerto 8765. Cierra procesos anteriores e intenta nuevamente."
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($HasLock) {
        $Mutex.ReleaseMutex()
    }
    $Mutex.Dispose()
}
