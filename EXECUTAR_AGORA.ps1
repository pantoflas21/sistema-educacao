# Script PowerShell para fazer commit e push das correções
# Execute este script no PowerShell dentro da pasta do projeto

# Configurar encoding UTF-8 para evitar problemas com caracteres especiais
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Iniciando commit das correções..." -ForegroundColor Green

# Obter diretório atual (já estamos na pasta do projeto)
$currentPath = Get-Location
Write-Host "📁 Diretório atual: $currentPath" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path "apps\frontend\src\lib\authLocal.ts")) {
    Write-Host "❌ Erro: Não encontrei os arquivos do projeto!" -ForegroundColor Red
    Write-Host "Certifique-se de estar na pasta do projeto antes de executar este script." -ForegroundColor Yellow
    Write-Host "Execute: cd 'C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Diretório correto encontrado!" -ForegroundColor Green

# Adicionar arquivos modificados
Write-Host "`n📦 Adicionando arquivos modificados..." -ForegroundColor Cyan

git add "apps\frontend\src\lib\authLocal.ts"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ authLocal.ts adicionado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erro ao adicionar authLocal.ts" -ForegroundColor Yellow
}

git add "api\[...path].ts"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ [...path].ts adicionado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erro ao adicionar [...path].ts" -ForegroundColor Yellow
}

git add "apps\backend\src\middleware\auth.ts"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ auth.ts (middleware) adicionado" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erro ao adicionar auth.ts" -ForegroundColor Yellow
}

git add "PANORAMA_GERAL_SISTEMA_ATUALIZADO.md"
git add "COMANDOS_COMMIT_CORRECOES.md"
git add "COMANDOS_RAPIDOS.txt"
git add "EXECUTAR_AGORA.ps1"

Write-Host "`n💾 Fazendo commit..." -ForegroundColor Cyan

$commitMessage = @"
FIX: Corrige login lento e erro 405 em formulários

- Adiciona timeout de 3s no login para evitar espera indefinida
- Melhora handler do Vercel com validação de métodos HTTP
- Ajusta middleware de autenticação para não bloquear requisições em modo demo
- Garante headers CORS em todas as rotas POST
- Adiciona documentação completa do sistema
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Erro ao fazer commit. Verifique se há mudanças para commitar." -ForegroundColor Yellow
    git status
    exit 1
}

Write-Host "`n🔗 Verificando remote..." -ForegroundColor Cyan
$remote = git remote -v 2>&1
if ($remote -and $remote -notmatch "fatal") {
    Write-Host "✅ Remote configurado:" -ForegroundColor Green
    Write-Host $remote -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Nenhum remote configurado!" -ForegroundColor Yellow
    Write-Host "Configure o remote com:" -ForegroundColor Yellow
    Write-Host 'git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git' -ForegroundColor White
    exit 1
}

Write-Host "`n📤 Fazendo push..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCESSO! Push realizado com sucesso!" -ForegroundColor Green
    Write-Host "🚀 O Vercel detectará automaticamente e fará o deploy." -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️ Erro ao fazer push. Verifique:" -ForegroundColor Yellow
    Write-Host "1. Se o remote está configurado corretamente" -ForegroundColor White
    Write-Host "2. Se você tem permissão para fazer push" -ForegroundColor White
    Write-Host "3. Se há commits no remoto que você precisa fazer pull primeiro" -ForegroundColor White
}

Write-Host "`n✨ Processo concluído!" -ForegroundColor Green

