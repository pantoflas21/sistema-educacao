# 🔧 Variáveis de Ambiente - Guia Completo

## 📋 Arquivo .env.example

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# ============================================
# BACKEND - Autenticação
# ============================================
# JWT Secret - OBRIGATÓRIO EM PRODUÇÃO
# Gere um secret forte: openssl rand -base64 32
JWT_SECRET=seu-secret-super-seguro-aqui-mude-em-producao

# Tempo de expiração do token JWT (padrão: 7d)
JWT_EXPIRES_IN=7d

# Modo Demo - Apenas para desenvolvimento
# true = permite login sem banco de dados
# false = requer banco de dados real
AUTH_DEMO=true

# ============================================
# BACKEND - Banco de Dados
# ============================================
# URL de conexão PostgreSQL (Supabase, Railway, etc)
# Formato: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/educacao

# ============================================
# BACKEND - CORS
# ============================================
# Origens permitidas (separadas por vírgula)
# Em produção, liste apenas seus domínios
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,https://sistema-educacao.vercel.app

# ============================================
# BACKEND - Servidor
# ============================================
# Porta do servidor (opcional, padrão do Vercel)
PORT=3000

# Ambiente (development, production, test)
NODE_ENV=development

# ============================================
# FRONTEND - Supabase (Opcional)
# ============================================
# Se usar Supabase para algumas funcionalidades
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

## ⚠️ IMPORTANTE

1. **JWT_SECRET**: DEVE ser único e secreto em produção
2. **CORS_ORIGIN**: Em produção, liste apenas domínios confiáveis
3. **DATABASE_URL**: Necessário apenas se AUTH_DEMO=false
4. **AUTH_DEMO**: NUNCA deixe true em produção real

## 🔒 Segurança

- NUNCA commite o arquivo `.env` no Git
- Use `.env.example` como template
- Gere secrets fortes para produção
- Revise permissões de CORS regularmente

