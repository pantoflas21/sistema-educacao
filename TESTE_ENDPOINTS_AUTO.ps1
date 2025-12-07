# TESTE_ENDPOINTS_AUTO.ps1
# Script para testar endpoints - versão automática

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n🧪 TESTE DE ENDPOINTS - SISTEMA ALETHEIA" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Tentar detectar URL automaticamente
$baseUrl = $args[0]

if (-not $baseUrl) {
    # Tentar encontrar URL do repositório Git
    try {
        $gitUrl = git remote get-url origin 2>$null
        if ($gitUrl -match 'github\.com/([^/]+)/([^/]+)') {
            $user = $matches[1]
            $repo = $matches[2] -replace '\.git$', ''
            # Tentar URL comum da Vercel
            $baseUrl = "https://$repo.vercel.app"
            Write-Host "`n🔍 Tentando URL detectada: $baseUrl" -ForegroundColor Yellow
        }
    } catch {
        # Ignorar erro
    }
    
    # Se ainda não tem URL, pedir ao usuário
    if (-not $baseUrl) {
        Write-Host "`n⚠️  Informe a URL do projeto:" -ForegroundColor Yellow
        Write-Host "1. URL da Vercel (ex: https://seu-projeto.vercel.app)" -ForegroundColor White
        Write-Host "2. URL local (ex: http://localhost:3000)" -ForegroundColor White
        Write-Host "`nDigite a URL ou pressione Enter para testar localmente:" -ForegroundColor Cyan
        $input = Read-Host
        if ($input) {
            $baseUrl = $input
        } else {
            $baseUrl = "http://localhost:3000"
            Write-Host "`n📡 Usando URL local: $baseUrl" -ForegroundColor Green
        }
    }
}

$baseUrl = $baseUrl.TrimEnd('/')
Write-Host "`n📡 URL Base: $baseUrl" -ForegroundColor Green
Write-Host "`n⏳ Iniciando testes...`n" -ForegroundColor Yellow

$total = 0
$sucesso = 0
$erro = 0
$resultados = @()

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Description
    )
    
    $script:total++
    $url = "$baseUrl$Path"
    
    Write-Host "[$script:total] $Method $Path" -ForegroundColor Cyan -NoNewline
    Write-Host " - $Description" -ForegroundColor Gray
    
    try {
        $headers = @{ "Content-Type" = "application/json" }
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            TimeoutSec = 5
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10 -Compress)
        }
        
        $response = Invoke-RestMethod @params
        $script:sucesso++
        Write-Host "   ✅ SUCESSO" -ForegroundColor Green
        $script:resultados += [PSCustomObject]@{
            Endpoint = "$Method $Path"
            Status = "✅"
            StatusCode = 200
            Descricao = $Description
        }
        return $true
    }
    catch {
        $statusCode = 0
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
        } catch {
            $statusCode = 0
        }
        
        $script:erro++
        $status = "❌ ERRO"
        
        if ($statusCode -eq 404) {
            Write-Host "   ❌ 404 - Rota não encontrada" -ForegroundColor Red
            $status = "❌ 404"
        }
        elseif ($statusCode -eq 405) {
            Write-Host "   ❌ 405 - Método não permitido" -ForegroundColor Red
            $status = "❌ 405"
        }
        elseif ($statusCode -eq 401) {
            Write-Host "   ⚠️  401 - Não autorizado" -ForegroundColor Yellow
            $status = "⚠️  401"
        }
        elseif ($statusCode -eq 0) {
            Write-Host "   ❌ Erro de conexão" -ForegroundColor Red
            $status = "❌ CONN"
        }
        else {
            Write-Host "   ❌ $statusCode" -ForegroundColor Red
            $status = "❌ $statusCode"
        }
        
        $script:resultados += [PSCustomObject]@{
            Endpoint = "$Method $Path"
            Status = $status
            StatusCode = $statusCode
            Descricao = $Description
        }
        return $false
    }
}

# TESTES
Write-Host "`n📋 SISTEMA" -ForegroundColor Magenta
Test-Endpoint "GET" "/api/health" $null "Health check"
Test-Endpoint "GET" "/api/test" $null "Teste de config"

Write-Host "`n🔐 AUTENTICAÇÃO" -ForegroundColor Magenta
Test-Endpoint "POST" "/api/login" @{email="admin@test.com";password="test"} "Login"

Write-Host "`n👨‍💼 ADMINISTRAÇÃO" -ForegroundColor Magenta
Test-Endpoint "GET" "/api/statistics/overview" $null "Estatísticas"
Test-Endpoint "GET" "/api/admin/users" $null "Listar usuários"
Test-Endpoint "POST" "/api/admin/users" @{email="test@test.com";password="123";role="Teacher";firstName="Test"} "Criar usuário ⚠️"

Write-Host "`n📋 SECRETARIA" -ForegroundColor Magenta
Test-Endpoint "GET" "/api/secretary/students" $null "Listar alunos"
Test-Endpoint "GET" "/api/secretary/classes" $null "Listar turmas"
Test-Endpoint "POST" "/api/secretary/classes" @{name="7A";capacity=30;shift="manha"} "Criar turma ⚠️"
Test-Endpoint "POST" "/api/secretary/subjects" @{code="MAT";name="Matemática";workload=80} "Criar disciplina ⚠️"

Write-Host "`n👨‍🏫 PROFESSOR" -ForegroundColor Magenta
Test-Endpoint "GET" "/api/teacher/terms" $null "Bimestres"
Test-Endpoint "POST" "/api/teacher/lessons" @{classId="c7A";subjectId="MAT";title="Aula";lessonDate="2025-01-27"} "Criar aula ⚠️"

# RELATÓRIO
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`nTotal: $total | ✅ Sucessos: $sucesso | ❌ Erros: $erro" -ForegroundColor White

$taxa = if ($total -gt 0) { [math]::Round(($sucesso / $total) * 100, 1) } else { 0 }
$cor = if ($taxa -ge 90) { "Green" } elseif ($taxa -ge 70) { "Yellow" } else { "Red" }
Write-Host "Taxa de sucesso: $taxa%" -ForegroundColor $cor

$erros404 = $resultados | Where-Object { $_.StatusCode -eq 404 }
$erros405 = $resultados | Where-Object { $_.StatusCode -eq 405 }

if ($erros404.Count -gt 0) {
    Write-Host "`n❌ ERROS 404:" -ForegroundColor Red
    $erros404 | ForEach-Object { Write-Host "   - $($_.Endpoint)" -ForegroundColor Red }
}

if ($erros405.Count -gt 0) {
    Write-Host "`n❌ ERROS 405:" -ForegroundColor Red
    $erros405 | ForEach-Object { Write-Host "   - $($_.Endpoint)" -ForegroundColor Red }
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
if ($erros404.Count -eq 0 -and $erros405.Count -eq 0) {
    Write-Host "✅ Problema de 404/405 RESOLVIDO!" -ForegroundColor Green
} else {
    Write-Host "❌ Ainda há erros 404/405!" -ForegroundColor Red
}
Write-Host ""

