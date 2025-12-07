# TESTE_ENDPOINTS.ps1
# Script para testar todos os endpoints críticos do sistema

# Configurar encoding UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "`n🧪 TESTE DE ENDPOINTS - SISTEMA ALETHEIA" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Configurar URL base
$baseUrl = $args[0]
if (-not $baseUrl) {
    Write-Host "`n⚠️  URL não informada!" -ForegroundColor Yellow
    Write-Host "Uso: .\TESTE_ENDPOINTS.ps1 <URL_BASE>" -ForegroundColor White
    Write-Host "Exemplo: .\TESTE_ENDPOINTS.ps1 https://seu-projeto.vercel.app" -ForegroundColor White
    Write-Host "Exemplo: .\TESTE_ENDPOINTS.ps1 http://localhost:3000" -ForegroundColor White
    exit 1
}

# Remover barra final se existir
$baseUrl = $baseUrl.TrimEnd('/')

Write-Host "`n📡 URL Base: $baseUrl" -ForegroundColor Green
Write-Host "`n⏳ Iniciando testes...`n" -ForegroundColor Yellow

# Contadores
$total = 0
$sucesso = 0
$erro = 0
$resultados = @()

# Função para testar endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Description
    )
    
    $total++
    $url = "$baseUrl$Path"
    
    Write-Host "[$total] Testando: $Method $Path" -ForegroundColor Cyan -NoNewline
    Write-Host " - $Description" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        $statusCode = 200
        
        $sucesso++
        Write-Host "   ✅ SUCESSO (200)" -ForegroundColor Green
        $resultados += [PSCustomObject]@{
            Endpoint = "$Method $Path"
            Status = "✅ SUCESSO"
            StatusCode = 200
            Descricao = $Description
        }
        
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $erro++
        
        if ($statusCode -eq 404) {
            Write-Host "   ❌ ERRO 404 - Rota não encontrada" -ForegroundColor Red
            $resultados += [PSCustomObject]@{
                Endpoint = "$Method $Path"
                Status = "❌ ERRO 404"
                StatusCode = 404
                Descricao = $Description
            }
        }
        elseif ($statusCode -eq 405) {
            Write-Host "   ❌ ERRO 405 - Método não permitido" -ForegroundColor Red
            $resultados += [PSCustomObject]@{
                Endpoint = "$Method $Path"
                Status = "❌ ERRO 405"
                StatusCode = 405
                Descricao = $Description
            }
        }
        elseif ($statusCode -eq 401) {
            Write-Host "   ⚠️  ERRO 401 - Não autorizado (pode ser normal)" -ForegroundColor Yellow
            $resultados += [PSCustomObject]@{
                Endpoint = "$Method $Path"
                Status = "⚠️  ERRO 401"
                StatusCode = 401
                Descricao = $Description
            }
        }
        else {
            Write-Host "   ❌ ERRO $statusCode - $($_.Exception.Message)" -ForegroundColor Red
            $resultados += [PSCustomObject]@{
                Endpoint = "$Method $Path"
                Status = "❌ ERRO $statusCode"
                StatusCode = $statusCode
                Descricao = $Description
            }
        }
        
        return $false
    }
}

# ============================================
# TESTES DE SISTEMA
# ============================================
Write-Host "`n📋 TESTES DE SISTEMA" -ForegroundColor Magenta
Write-Host "-" * 60 -ForegroundColor Gray

Test-Endpoint -Method "GET" -Path "/api/health" -Description "Health check do sistema"
Test-Endpoint -Method "GET" -Path "/api/test" -Description "Teste de configuração"

# ============================================
# TESTES DE AUTENTICAÇÃO
# ============================================
Write-Host "`n🔐 TESTES DE AUTENTICAÇÃO" -ForegroundColor Magenta
Write-Host "-" * 60 -ForegroundColor Gray

$loginBody = @{
    email = "admin@test.com"
    password = "test123"
}
Test-Endpoint -Method "POST" -Path "/api/login" -Body $loginBody -Description "Login de usuário"

# ============================================
# TESTES DE ADMINISTRAÇÃO
# ============================================
Write-Host "`n👨‍💼 TESTES DE ADMINISTRAÇÃO" -ForegroundColor Magenta
Write-Host "-" * 60 -ForegroundColor Gray

Test-Endpoint -Method "GET" -Path "/api/statistics/overview" -Description "Estatísticas do sistema"
Test-Endpoint -Method "GET" -Path "/api/admin/users" -Description "Listar usuários"

$createUserBody = @{
    email = "teste@exemplo.com"
    password = "senha123"
    role = "Teacher"
    firstName = "Teste"
    lastName = "Usuario"
}
Test-Endpoint -Method "POST" -Path "/api/admin/users" -Body $createUserBody -Description "Criar usuário (CRÍTICO - deve funcionar)"

# ============================================
# TESTES DE SECRETARIA
# ============================================
Write-Host "`n📋 TESTES DE SECRETARIA" -ForegroundColor Magenta
Write-Host "-" * 60 -ForegroundColor Gray

Test-Endpoint -Method "GET" -Path "/api/secretary/students" -Description "Listar alunos"
Test-Endpoint -Method "GET" -Path "/api/secretary/classes" -Description "Listar turmas"
Test-Endpoint -Method "GET" -Path "/api/secretary/subjects" -Description "Listar disciplinas"

$createStudentBody = @{
    name = "Aluno Teste"
    email = "aluno@test.com"
    birthDate = "2010-01-01"
    classId = "7A"
}
Test-Endpoint -Method "POST" -Path "/api/secretary/students" -Body $createStudentBody -Description "Criar aluno (CRÍTICO - deve funcionar)"

$createClassBody = @{
    name = "7º A"
    capacity = 30
    shift = "manha"
}
Test-Endpoint -Method "POST" -Path "/api/secretary/classes" -Body $createClassBody -Description "Criar turma (CRÍTICO - deve funcionar)"

$createSubjectBody = @{
    code = "MAT"
    name = "Matemática"
    workload = 80
}
Test-Endpoint -Method "POST" -Path "/api/secretary/subjects" -Body $createSubjectBody -Description "Criar disciplina (CRÍTICO - deve funcionar)"

# ============================================
# TESTES DE PROFESSOR
# ============================================
Write-Host "`n👨‍🏫 TESTES DE PROFESSOR" -ForegroundColor Magenta
Write-Host "-" * 60 -ForegroundColor Gray

Test-Endpoint -Method "GET" -Path "/api/teacher/terms" -Description "Listar bimestres"
Test-Endpoint -Method "GET" -Path "/api/teacher/classes?termId=term1" -Description "Listar turmas do professor"
Test-Endpoint -Method "GET" -Path "/api/teacher/subjects?classId=c7A" -Description "Listar disciplinas"
Test-Endpoint -Method "GET" -Path "/api/teacher/students?classId=c7A" -Description "Listar alunos"

$createLessonBody = @{
    classId = "c7A"
    subjectId = "MAT"
    title = "Aula de Teste"
    content = "Conteúdo da aula"
    lessonDate = "2025-01-27"
}
Test-Endpoint -Method "POST" -Path "/api/teacher/lessons" -Body $createLessonBody -Description "Criar aula (CRÍTICO - deve funcionar)"

# ============================================
# RELATÓRIO FINAL
# ============================================
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 RELATÓRIO FINAL" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host "`nTotal de testes: $total" -ForegroundColor White
Write-Host "✅ Sucessos: $sucesso" -ForegroundColor Green
Write-Host "❌ Erros: $erro" -ForegroundColor Red

$taxaSucesso = [math]::Round(($sucesso / $total) * 100, 2)
Write-Host "📈 Taxa de sucesso: $taxaSucesso%" -ForegroundColor $(if ($taxaSucesso -ge 90) { "Green" } elseif ($taxaSucesso -ge 70) { "Yellow" } else { "Red" })

# Mostrar erros críticos
$erros404 = $resultados | Where-Object { $_.StatusCode -eq 404 }
$erros405 = $resultados | Where-Object { $_.StatusCode -eq 405 }

if ($erros404.Count -gt 0) {
    Write-Host "`n❌ ERROS 404 (Rota não encontrada):" -ForegroundColor Red
    $erros404 | ForEach-Object {
        Write-Host "   - $($_.Endpoint) - $($_.Descricao)" -ForegroundColor Red
    }
}

if ($erros405.Count -gt 0) {
    Write-Host "`n❌ ERROS 405 (Método não permitido):" -ForegroundColor Red
    $erros405 | ForEach-Object {
        Write-Host "   - $($_.Endpoint) - $($_.Descricao)" -ForegroundColor Red
    }
}

# Salvar relatório em arquivo
$relatorioPath = "RELATORIO_TESTES_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$resultados | Format-Table -AutoSize | Out-File -FilePath $relatorioPath -Encoding UTF8
Write-Host "`n💾 Relatório salvo em: $relatorioPath" -ForegroundColor Cyan

# Conclusão
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
if ($erro -eq 0) {
    Write-Host "🎉 TODOS OS TESTES PASSARAM!" -ForegroundColor Green
    Write-Host "✅ Sistema funcionando perfeitamente!" -ForegroundColor Green
} elseif ($erros404.Count -eq 0 -and $erros405.Count -eq 0) {
    Write-Host "⚠️  Alguns testes falharam, mas não são erros 404/405" -ForegroundColor Yellow
    Write-Host "✅ O problema de 404/405 foi RESOLVIDO!" -ForegroundColor Green
} else {
    Write-Host "❌ AINDA HÁ ERROS 404/405!" -ForegroundColor Red
    Write-Host "⚠️  Verifique os logs do Vercel e a configuração" -ForegroundColor Yellow
}
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

