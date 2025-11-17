// Script de build para Vercel
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando build do Aletheia...');

try {
  const rootDir = __dirname;
  const frontendPath = path.join(rootDir, 'apps', 'frontend');
  
  // Verificar se a pasta frontend existe
  if (!fs.existsSync(frontendPath)) {
    throw new Error(`Pasta frontend não encontrada: ${frontendPath}`);
  }
  
  // Verificar se package.json existe
  const frontendPackageJson = path.join(frontendPath, 'package.json');
  if (!fs.existsSync(frontendPackageJson)) {
    throw new Error(`package.json do frontend não encontrado: ${frontendPackageJson}`);
  }
  
  // Build do frontend (dependências já foram instaladas pelo installCommand do Vercel)
  console.log('🔨 Fazendo build do frontend...');
  console.log('📁 Diretório:', frontendPath);
  
  execSync('npm run build', { 
    stdio: 'inherit', 
    cwd: frontendPath,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verificar se o build foi criado
  const distPath = path.join(frontendPath, 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error(`Pasta dist não foi criada após o build: ${distPath}`);
  }
  
  console.log('✅ Build concluído com sucesso!');
  console.log('📦 Arquivos gerados em:', distPath);
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
  process.exit(1);
}


