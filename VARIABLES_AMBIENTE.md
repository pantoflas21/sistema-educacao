# Variáveis de Ambiente - Sistema Aletheia

## Configuração Obrigatória para Produção

### 1. JWT_SECRET (OBRIGATÓRIO)
- **Descrição:** Chave secreta para assinar tokens JWT
- **Requisito:** Mínimo de 32 caracteres
- **Como gerar:** `openssl rand -base64 32`
- **Exemplo:** `JWT_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

### 2. CORS_ORIGIN (OBRIGATÓRIO)
- **Descrição:** URLs permitidas para requisições CORS
- **Formato:** URLs separadas por vírgula
- **Exemplo:** `CORS_ORIGIN=https://seu-dominio.vercel.app,https://www.seu-dominio.com`

### 3. DATABASE_URL (OBRIGATÓRIO para persistência)
- **Descrição:** URL de conexão com PostgreSQL
- **Formato:** `postgresql://user:password@host:5432/database`
- **Exemplo:** `DATABASE_URL=postgresql://user:pass@localhost:5432/aletheia`

### 4. NODE_ENV
- **Descrição:** Ambiente de execução
- **Valores:** `development`, `production`, `test`
- **Padrão:** `production` em produção

## Configuração Opcional

### 5. JWT_EXPIRES_IN
- **Descrição:** Tempo de expiração do token JWT
- **Padrão:** `7d` (7 dias)
- **Exemplo:** `JWT_EXPIRES_IN=7d`

### 6. PORT
- **Descrição:** Porta do servidor
- **Padrão:** `3000`
- **Exemplo:** `PORT=3000`

### 7. AUTH_DEMO (APENAS DESENVOLVIMENTO)
- **Descrição:** Modo demo - permite login sem banco de dados
- **⚠️ IMPORTANTE:** NUNCA usar `AUTH_DEMO=true` em produção!
- **Valores:** `true`, `false`
- **Padrão:** `false`

## Configuração na Vercel

1. Acesse o dashboard da Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as variáveis:
   - `JWT_SECRET` (obrigatório)
   - `CORS_ORIGIN` (obrigatório)
   - `DATABASE_URL` (obrigatório se usar banco)
   - `NODE_ENV=production`
   - `AUTH_DEMO=false` (ou não adicione)

## Exemplo Completo

```env
JWT_SECRET=sua-chave-secreta-super-segura-com-pelo-menos-32-caracteres
CORS_ORIGIN=https://seu-dominio.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_EXPIRES_IN=7d
```

