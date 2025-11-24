# Script de inicio rápido para TalentMatch

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  TalentMatch - Sistema de Talento  " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe la carpeta Frontend
if (-not (Test-Path ".\Frontend")) {
    Write-Host "[ERROR] No se encontró la carpeta Frontend" -ForegroundColor Red
    exit 1
}

# Verificar si existe la carpeta Backend
if (-not (Test-Path ".\Backend")) {
    Write-Host "[ERROR] No se encontró la carpeta Backend" -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Verificando dependencias..." -ForegroundColor Yellow

# Verificar dotnet
try {
    $dotnetVersion = dotnet --version
    Write-Host "  ✓ .NET SDK: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ .NET SDK no encontrado. Instala .NET 9 SDK" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm no encontrado. Instala Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location Frontend
if (-not (Test-Path ".\node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Error al instalar dependencias de npm" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}
Write-Host "  ✓ Dependencias del frontend instaladas" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "[3/4] Restaurando paquetes del backend..." -ForegroundColor Yellow
Set-Location Backend
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Error al restaurar paquetes de .NET" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "  ✓ Paquetes del backend restaurados" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Verificando base de datos..." -ForegroundColor Yellow
# Verificar si existe la base de datos
$dbExists = dotnet ef database update --dry-run 2>&1
if ($dbExists -match "No migrations") {
    Write-Host "  ⚠ No hay migraciones. Ejecuta 'dotnet ef database update'" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ Base de datos configurada" -ForegroundColor Green
}
Set-Location ..

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Configuración completada           " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar el sistema:" -ForegroundColor White
Write-Host ""
Write-Host "  BACKEND (Terminal 1):" -ForegroundColor Yellow
Write-Host "    cd Backend" -ForegroundColor Gray
Write-Host "    dotnet run" -ForegroundColor Gray
Write-Host "    URL: http://localhost:5010" -ForegroundColor Cyan
Write-Host ""
Write-Host "  FRONTEND (Terminal 2):" -ForegroundColor Yellow
Write-Host "    cd Frontend" -ForegroundColor Gray
Write-Host "    npm start" -ForegroundColor Gray
Write-Host "    URL: http://localhost:4200" -ForegroundColor Cyan
Write-Host ""
Write-Host "  LOGIN:" -ForegroundColor Yellow
Write-Host "    Email: mateo@ntt.com" -ForegroundColor Gray
Write-Host "    Password: mateo123" -ForegroundColor Gray
Write-Host ""
