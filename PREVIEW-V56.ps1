$ErrorActionPreference = 'Stop'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw 'Node.js was not found. Install Node.js, then run this preview command again.' }

# Ask Windows for an available loopback port instead of assuming 8080 is free.
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
$listener.Start()
$port = $listener.LocalEndpoint.Port
$listener.Stop()
$env:PORT = [string]$port

Write-Host ''
Write-Host 'Davonium Technologies V56 local preview' -ForegroundColor Cyan
Write-Host 'Local only — no deployment or Git push will occur.' -ForegroundColor Yellow
Write-Host "Open http://127.0.0.1:$port in your browser. Press Ctrl+C to stop."
Write-Host ''
& $node.Source (Join-Path $PSScriptRoot 'preview-v56-server.cjs')
