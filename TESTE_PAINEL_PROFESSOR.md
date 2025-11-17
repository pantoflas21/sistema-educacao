# 🧪 TESTE: Painel do Professor

## ✅ Endpoints Criados para Teste:

### 1. `/api/test` - Endpoint de Teste
- Verifica se a API está funcionando
- Mostra o valor de `AUTH_DEMO`
- Útil para diagnosticar problemas

### 2. `/api/teacher/terms` - Bimestres
- Retorna os 4 bimestres do ano letivo
- Logs detalhados para debug
- Sempre retorna JSON

## 🔍 Como Testar:

1. **Teste o endpoint de teste:**
   ```
   https://seu-dominio.vercel.app/api/test
   ```
   Deve retornar:
   ```json
   {
     "ok": true,
     "authDemo": "true",
     "message": "API funcionando corretamente",
     "timestamp": "2025-11-17T..."
   }
   ```

2. **Teste o endpoint de bimestres:**
   ```
   https://seu-dominio.vercel.app/api/teacher/terms
   ```
   Deve retornar:
   ```json
   [
     {
       "id": "term1",
       "number": 1,
       "status": "active",
       "startDate": "2025-02-01",
       "endDate": "2025-03-31"
     },
     ...
   ]
   ```

## ⚠️ Se Ainda Não Funcionar:

1. **Verifique os logs do Vercel:**
   - Vá em **Deployments** → Clique no último deploy → **Functions** → `/api/teacher/terms`
   - Veja os logs para identificar o problema

2. **Verifique a variável de ambiente:**
   - Settings → Environment Variables
   - Confirme que `AUTH_DEMO=true` está configurado
   - **Re-deploy** após adicionar/modificar variáveis

3. **Teste diretamente no navegador:**
   - Abra o DevTools (F12)
   - Vá em **Network**
   - Acesse `/teacher`
   - Veja a requisição para `/api/teacher/terms`
   - Verifique o status code e a resposta

## 📋 Checklist:

- [ ] Variável `AUTH_DEMO=true` configurada no Vercel
- [ ] Deploy realizado após configurar variável
- [ ] `/api/test` retorna JSON com `authDemo: "true"`
- [ ] `/api/teacher/terms` retorna array de bimestres
- [ ] Frontend consegue carregar os bimestres


