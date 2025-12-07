// Script de build para Vercel
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando build do Aletheia...');

try {
  const rootDir = __dirname;
  const backendPath = path.join(rootDir, 'apps', 'backend');
  const frontendPath = path.join(rootDir, 'apps', 'frontend');
  
  // ============================================
  // FASE 1: Compilar Backend TypeScript
  // ============================================
  console.log('🔨 FASE 1: Compilando backend TypeScript...');
  
  // Verificar se a pasta backend existe
  if (!fs.existsSync(backendPath)) {
    throw new Error(`Pasta backend não encontrada: ${backendPath}`);
  }
  
  // Verificar se package.json do backend existe
  const backendPackageJson = path.join(backendPath, 'package.json');
  if (!fs.existsSync(backendPackageJson)) {
    throw new Error(`package.json do backend não encontrado: ${backendPackageJson}`);
  }
  
  // Compilar backend TypeScript
  console.log('📁 Diretório backend:', backendPath);
  execSync('npm run build', { 
    stdio: 'inherit', 
    cwd: backendPath,
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  // Verificar se dist/api.js foi criado
  const backendDistApi = path.join(backendPath, 'dist', 'api.js');
  if (!fs.existsSync(backendDistApi)) {
    throw new Error(`Backend não compilado corretamente: ${backendDistApi} não encontrado`);
  }
  
  console.log('✅ Backend compilado com sucesso!');
  console.log('📦 Arquivo gerado:', backendDistApi);
  
  // ============================================
  // FASE 2: Compilar Frontend
  // ============================================
  console.log('🔨 FASE 2: Compilando frontend...');
  
  // Verificar se a pasta frontend existe
  if (!fs.existsSync(frontendPath)) {
    throw new Error(`Pasta frontend não encontrada: ${frontendPath}`);
  }
  
  // Verificar se package.json existe
  const frontendPackageJson = path.join(frontendPath, 'package.json');
  if (!fs.existsSync(frontendPackageJson)) {
    throw new Error(`package.json do frontend não encontrado: ${frontendPackageJson}`);
  }
  
  // Build do frontend
  console.log('📁 Diretório frontend:', frontendPath);
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
  
  console.log('✅ Frontend compilado com sucesso!');
  console.log('📦 Arquivos gerados em:', distPath);
  
  console.log('✅✅✅ Build completo concluído com sucesso! ✅✅✅');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  if (error.stdout) console.error('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
  process.exit(1);
}


