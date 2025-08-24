# scripts/dev.ps1 — UTF-8 + free port + nodemon

param([int]$Port)

# Жёстко включаем UTF-8 для ввода/вывода
chcp 65001 | Out-Null
[Console]::OutputEncoding = [Text.UTF8Encoding]::new()
[Console]::InputEncoding  = [Text.UTF8Encoding]::new()
$OutputEncoding = [Console]::OutputEncoding

# Определяем порт: параметр -> $env:PORT -> .env -> 3000
if (-not $Port) { $Port = $env:PORT -as [int] }
if (-not $Port -and (Test-Path ".\.env")) {
  try {
    $m = Select-String -Path ".\.env" -Pattern '^PORT=(\d+)' -ErrorAction SilentlyContinue |
         Select-Object -First 1
    if ($m) { $Port = [int]($m.Matches[0].Groups[1].Value) }
  } catch {}
}
if (-not $Port) { $Port = 3000 }

# Свободим порт
$portPid = $null
try {
  $portPid = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
             Select-Object -First 1 -ExpandProperty OwningProcess
} catch {
  $portPid = (netstat -ano | Select-String ":$Port" | Select-String "LISTENING" |
              ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -First 1)
}
if ($portPid) {
  try { Stop-Process -Id $portPid -Force -ErrorAction Stop; Write-Host ("Freed port {0} (PID {1})" -f $Port,$portPid) }
  catch { Write-Warning ("Could not kill PID {0}: {1}" -f $portPid,$_.Exception.Message) }
} else {
  Write-Host ("Port {0} is free" -f $Port)
}

Write-Host ("Starting nodemon on port {0}..." -f $Port)
npx nodemon index.js
