// Script de build para Vercel
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando build do Aletheia...');

try {
  // Verificar se as dependências do backend estão instaladas
  const backendPath = path.join(__dirname, 'apps', 'backend');
  const backendNodeModules = path.join(backendPath, 'node_modules');
  
  if (!fs.existsSync(backendNodeModules)) {
    console.log('📦 Instalando dependências do backend...');
    process.chdir(backendPath);
    execSync('npm install', { stdio: 'inherit' });
  }
  
  // Build do frontend
  const frontendPath = path.join(__dirname, 'apps', 'frontend');
  
  if (!fs.existsSync(frontendPath)) {
    throw new Error(`Pasta frontend não encontrada: ${frontendPath}`);
  }
  
  console.log('🔨 Fazendo build do frontend...');
  process.chdir(frontendPath);
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build concluído com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}

