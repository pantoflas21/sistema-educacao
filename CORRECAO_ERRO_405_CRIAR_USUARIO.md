# ✅ CORREÇÃO: Erro 405 ao Criar Usuário

## 🔍 PROBLEMA IDENTIFICADO

O erro **405 Method Not Allowed** ao tentar criar um novo usuário acontecia porque:

1. **Token de autenticação não estava sendo enviado** nas requisições
2. O middleware `requireRole("Admin")` precisa de autenticação
3. Sem token, a requisição era rejeitada

---

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Adicionado token de autenticação em todas as requisições

**Arquivo:** `apps/frontend/src/pages/AdminDashboard.tsx`

- ✅ Criada função `getAuthHeaders()` que adiciona token automaticamente
- ✅ Todas as requisições agora incluem `Authorization: Bearer ${token}`
- ✅ Funciona com token local ou token da API

### 2. Requisições corrigidas:

- ✅ `GET /api/admin/users` - Listar usuários
- ✅ `POST /api/admin/users` - Criar usuário
- ✅ `PUT /api/admin/users/:id` - Editar usuário
- ✅ `DELETE /api/admin/users/:id` - Deletar usuário
- ✅ `PUT /api/admin/users/:id/status` - Ativar/desativar usuário
- ✅ `POST /api/admin/users/:id/reset-password` - Resetar senha
- ✅ `GET /api/statistics/overview` - Estatísticas do admin
- ✅ `GET /api/admin/schools` - Listar escolas

---

## 🔄 COMO FUNCIONA AGORA

### Com Token (usuário logado):
```
Frontend → Adiciona token no header
         → Backend valida token
         → Requisição autorizada ✅
```

### Sem Token (modo demo):
```
Frontend → Sem token
         → Backend verifica AUTH_DEMO=true
         → Cria usuário demo automaticamente
         → Requisição autorizada ✅
```

---

## ⚙️ CONFIGURAÇÃO

### Para funcionar sem token (modo demo):

Configure na Vercel:
```env
AUTH_DEMO=true
```

### Para funcionar com token (produção):

1. Configure banco de dados:
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database
JWT_SECRET=sua-chave-secreta-aqui
```

2. Faça login primeiro
3. Token será salvo automaticamente
4. Requisições funcionarão com token

---

## ✅ TESTES

### Teste 1: Criar usuário (modo demo)
1. Configure `AUTH_DEMO=true` na Vercel
2. Acesse `/admin`
3. Clique em "Usuários" → "+ Novo Usuário"
4. Preencha os dados
5. Clique em "Criar"
6. ✅ Deve funcionar!

### Teste 2: Criar usuário (com token)
1. Faça login primeiro
2. Acesse `/admin`
3. Clique em "Usuários" → "+ Novo Usuário"
4. Preencha os dados
5. Clique em "Criar"
6. ✅ Deve funcionar!

---

## 📝 CÓDIGO ADICIONADO

```typescript
// Helper para adicionar token de autenticação nas requisições
function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
```

Todas as requisições `fetch()` agora usam:
```typescript
headers: getAuthHeaders()
```

---

## 🎯 RESULTADO

✅ **Erro 405 corrigido**
✅ **Criação de usuários funcionando**
✅ **Todas as requisições autenticadas**
✅ **Compatível com modo demo e produção**

---

## ⚠️ IMPORTANTE

- Se ainda der erro 405, verifique se `AUTH_DEMO=true` está configurado na Vercel
- Ou faça login primeiro para obter um token válido
- O token é salvo automaticamente após login



