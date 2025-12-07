/**
 * Validação e configuração de variáveis de ambiente
 * Garante que todas as variáveis necessárias estão configuradas
 */

interface EnvConfig {
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // Database
  DATABASE_URL?: string;
  
  // CORS
  CORS_ORIGIN: string[];
  
  // Auth
  AUTH_DEMO: boolean;
  
  // Server
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: number;
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // JWT Secret - CRÍTICO em produção
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    errors.push('❌ JWT_SECRET é obrigatório! Configure uma string segura com pelo menos 32 caracteres.');
  } else if (jwtSecret.length < 32) {
    errors.push('❌ JWT_SECRET deve ter pelo menos 32 caracteres para segurança adequada.');
  } else if (jwtSecret === 'dev-secret-change' || jwtSecret.includes('dev-secret') || jwtSecret.includes('change-in-production')) {
    errors.push('❌ JWT_SECRET não pode usar valores padrão inseguros. Configure um secret único e seguro.');
  }
  
  // CORS Origin
  const corsOrigin = process.env.CORS_ORIGIN;
  let allowedOrigins: string[] = [];
  if (corsOrigin) {
    allowedOrigins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);
  } else {
    // Em produção, não permitir todas as origens
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ CORS_ORIGIN não configurado. Permitindo apenas localhost em produção.');
      allowedOrigins = ['https://sistema-educacao.vercel.app'];
    } else {
      allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    }
  }
  
  // AUTH_DEMO
  const authDemo = process.env.AUTH_DEMO === 'true';
  if (authDemo && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ AUTH_DEMO=true em produção! Isso é apenas para desenvolvimento.');
  }
  
  // JWT Expires In
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  // NODE_ENV
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  
  // PORT
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:');
    errors.forEach(err => console.error(err));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Configuração inválida. Verifique as variáveis de ambiente.');
    }
  }
  
  // Não retornar se houver erros críticos
  if (errors.length > 0 && !jwtSecret) {
    throw new Error('JWT_SECRET é obrigatório. Configure a variável de ambiente JWT_SECRET com uma string segura (mínimo 32 caracteres).');
  }
  
  return {
    JWT_SECRET: jwtSecret!,
    JWT_EXPIRES_IN: jwtExpiresIn,
    DATABASE_URL: process.env.DATABASE_URL,
    CORS_ORIGIN: allowedOrigins,
    AUTH_DEMO: authDemo,
    NODE_ENV: nodeEnv,
    PORT: port
  };
}

export const env = validateEnv();

// Log de configuração (sem secrets)
console.log('📋 Configuração carregada:', {
  NODE_ENV: env.NODE_ENV,
  CORS_ORIGIN: env.CORS_ORIGIN,
  AUTH_DEMO: env.AUTH_DEMO,
  JWT_SECRET: env.JWT_SECRET ? '✅ Configurado' : '❌ Não configurado',
  DATABASE_URL: env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado (modo in-memory)'
});

