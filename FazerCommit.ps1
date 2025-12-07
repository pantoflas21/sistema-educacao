# Script para fazer commit e push das correcoes
# Execute este script no PowerShell

Write-Host "Fazendo commit das correcoes..." -ForegroundColor Green

# Navegar para o diretorio do projeto
Set-Location "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"

# Adicionar arquivos modificados
Write-Host "Adicionando arquivos..." -ForegroundColor Yellow
git add "api/[...path].ts"
git add "apps/backend/src/api.ts"
git add "apps/frontend/src/pages/AdminDashboard.tsx"
git add "apps/frontend/src/lib/authLocal.ts"
git add "apps/frontend/src/hooks/useAuth.ts"

# Verificar status
Write-Host "Status dos arquivos:" -ForegroundColor Yellow
git status --short

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "Correcao: Erro 405 nas rotas admin - Sempre retorna JSON, nunca HTML"

# Verificar remote
Write-Host "Verificando remote..." -ForegroundColor Yellow
$remote = git remote -v

if ($remote) {
    Write-Host "Remote configurado" -ForegroundColor Green
    Write-Host "Fazendo push..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "Push concluido!" -ForegroundColor Green
} else {
    Write-Host "Nenhum remote configurado. Configure o remote primeiro:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Concluido! Agora a Vercel vai fazer deploy automaticamente!" -ForegroundColor Green

