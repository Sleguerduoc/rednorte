<#
.SYNOPSIS
    Calcula el % de cobertura de lineas GLOBAL ponderado del proyecto RedNorte,
    sumando los reportes JaCoCo (target/site/jacoco/jacoco.csv) de los 5 microservicios.

.DESCRIPTION
    Lee LINE_COVERED y LINE_MISSED de cada fila de cada CSV (una fila por clase
    analizada; las exclusiones de JaCoCo configuradas en cada pom.xml ya quedan
    fuera del CSV, asi que no hay que volver a aplicarlas aqui). Imprime una
    tabla por servicio y el GLOBAL ponderado al final.

.PARAMETER RunTests
    Si se pasa, corre "mvn test" en cada uno de los 5 servicios antes de leer
    los CSV, para regenerarlos. Sin este switch, el script solo lee lo que ya
    exista en disco.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File cobertura-global.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File cobertura-global.ps1 -RunTests
#>

param(
    [switch]$RunTests
)

$ErrorActionPreference = 'Stop'

$Servicios = @(
    'api-gateway',
    'servicio-lista-espera',
    'servicio-notificaciones',
    'servicio-pacientes',
    'servicio-reasignacion'
)

$RaizProyecto = $PSScriptRoot

if ($RunTests) {
    Write-Host "Corriendo 'mvn test' en los 5 servicios para regenerar los CSV de JaCoCo..." -ForegroundColor Cyan
    foreach ($servicio in $Servicios) {
        $rutaServicio = Join-Path $RaizProyecto $servicio
        if (-not (Test-Path $rutaServicio)) {
            Write-Host "  [OMITIDO] No existe la carpeta '$servicio'." -ForegroundColor Yellow
            continue
        }
        Write-Host "  -> $servicio" -ForegroundColor Cyan
        Push-Location $rutaServicio
        try {
            & mvn -q test
            if ($LASTEXITCODE -ne 0) {
                Write-Host "     ADVERTENCIA: 'mvn test' termino con codigo $LASTEXITCODE en $servicio." -ForegroundColor Yellow
            }
        }
        finally {
            Pop-Location
        }
    }
    Write-Host ""
}

$filas = @()
$csvFaltantes = @()

foreach ($servicio in $Servicios) {
    $rutaCsv = Join-Path $RaizProyecto "$servicio\target\site\jacoco\jacoco.csv"

    if (-not (Test-Path $rutaCsv)) {
        Write-Host "ADVERTENCIA: no se encontro '$rutaCsv'. Corriste 'mvn test' en ${servicio}? Se omite del calculo." -ForegroundColor Yellow
        $csvFaltantes += $servicio
        $filas += [PSCustomObject]@{
            Servicio   = $servicio
            Cubiertas  = $null
            Total      = $null
            Porcentaje = $null
            Estado     = 'CSV FALTANTE'
        }
        continue
    }

    try {
        $registros = Import-Csv -Path $rutaCsv
    }
    catch {
        Write-Host "ADVERTENCIA: no se pudo leer '$rutaCsv' ($($_.Exception.Message)). Se omite del calculo." -ForegroundColor Yellow
        $csvFaltantes += $servicio
        $filas += [PSCustomObject]@{
            Servicio   = $servicio
            Cubiertas  = $null
            Total      = $null
            Porcentaje = $null
            Estado     = 'CSV ILEGIBLE'
        }
        continue
    }

    if (-not $registros -or $registros.Count -eq 0) {
        Write-Host "ADVERTENCIA: '$rutaCsv' existe pero no tiene filas de datos. Se omite del calculo." -ForegroundColor Yellow
        $csvFaltantes += $servicio
        $filas += [PSCustomObject]@{
            Servicio   = $servicio
            Cubiertas  = $null
            Total      = $null
            Porcentaje = $null
            Estado     = 'CSV VACIO'
        }
        continue
    }

    $cubiertas = 0L
    $perdidas  = 0L
    foreach ($registro in $registros) {
        $cubiertas += [long]$registro.LINE_COVERED
        $perdidas  += [long]$registro.LINE_MISSED
    }
    $total = $cubiertas + $perdidas
    $porcentaje = if ($total -gt 0) { [math]::Round(($cubiertas / $total) * 100, 1) } else { 0 }

    $filas += [PSCustomObject]@{
        Servicio   = $servicio
        Cubiertas  = $cubiertas
        Total      = $total
        Porcentaje = $porcentaje
        Estado     = 'OK'
    }
}

Write-Host ""
Write-Host "=== Cobertura de lineas por servicio (JaCoCo) ===" -ForegroundColor Cyan
Write-Host ""

$anchoServicio = 28
$filasFormateadas = foreach ($f in $filas) {
    if ($f.Estado -eq 'OK') {
        [PSCustomObject]@{
            Servicio    = $f.Servicio.PadRight($anchoServicio)
            'Cub/Total' = "$($f.Cubiertas)/$($f.Total)"
            '%'         = "$($f.Porcentaje)%"
        }
    }
    else {
        [PSCustomObject]@{
            Servicio    = $f.Servicio.PadRight($anchoServicio)
            'Cub/Total' = '-'
            '%'         = $f.Estado
        }
    }
}
$filasFormateadas | Format-Table -AutoSize | Out-String | Write-Host

$filasValidas = $filas | Where-Object { $_.Estado -eq 'OK' }
$totalCubiertas = ($filasValidas | Measure-Object -Property Cubiertas -Sum).Sum
$totalLineas    = ($filasValidas | Measure-Object -Property Total -Sum).Sum

if (-not $totalCubiertas) { $totalCubiertas = 0 }
if (-not $totalLineas)    { $totalLineas = 0 }

if ($totalLineas -gt 0) {
    $globalPorcentaje = [math]::Round(($totalCubiertas / $totalLineas) * 100, 2)
}
else {
    $globalPorcentaje = 0
}

Write-Host "=================================================="
if ($csvFaltantes.Count -gt 0) {
    Write-Host ("ATENCION: {0} servicio(s) excluido(s) del calculo por falta de CSV: {1}" -f $csvFaltantes.Count, ($csvFaltantes -join ', ')) -ForegroundColor Yellow
    Write-Host "El GLOBAL mostrado abajo es PARCIAL (no incluye esos servicios)." -ForegroundColor Yellow
}
Write-Host ("GLOBAL: {0}/{1} lineas cubiertas = {2}%" -f $totalCubiertas, $totalLineas, $globalPorcentaje) -ForegroundColor Green
Write-Host "=================================================="
