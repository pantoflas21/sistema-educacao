# 🔧 Variáveis de Ambiente do Vercel

## ⚠️ IMPORTANTE: Configure estas variáveis no Vercel!

Para o painel do professor funcionar corretamente, você **DEVE** configurar a variável de ambiente `AUTH_DEMO=true` no Vercel.

### Como configurar:

1. Acesse o painel do Vercel: https://vercel.com
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - **Nome:** `AUTH_DEMO`
   - **Valor:** `true`
   - **Ambiente:** Production, Preview, Development (todos)

### Por que isso é necessário?

O middleware de autenticação (`authMiddleware`) verifica se `AUTH_DEMO=true`. Se estiver configurado:
- ✅ Permite acesso sem token de autenticação
- ✅ Cria um usuário demo automaticamente
- ✅ Permite que o painel do professor funcione

**Sem essa variável, o sistema pode retornar 401 (não autorizado) e o painel não funcionará!**


