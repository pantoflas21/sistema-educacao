# 🚀 Comandos para Fazer Commit e Push das Correções

## ⚠️ IMPORTANTE

O repositório Git está no diretório home. Para fazer o commit corretamente, execute estes comandos **no PowerShell**:

---

## 📋 COMANDOS PARA EXECUTAR

### 1. Navegar para o diretório do projeto:
```powershell
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"
```

### 2. Adicionar os arquivos modificados:
```powershell
git add api/[...path].ts
git add apps/backend/src/api.ts
git add apps/frontend/src/pages/AdminDashboard.tsx
git add apps/frontend/src/lib/authLocal.ts
git add apps/frontend/src/hooks/useAuth.ts
```

### 3. Fazer commit:
```powershell
git commit -m "Correção: Erro 405 nas rotas admin - Sempre retorna JSON, nunca HTML"
```

### 4. Verificar remote:
```powershell
git remote -v
```

### 5. Se não tiver remote, adicionar (substitua pela URL do seu repositório):
```powershell
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

### 6. Fazer push:
```powershell
git push -u origin main
```

---

## ✅ OU EXECUTAR TUDO DE UMA VEZ:

Abra o **PowerShell** e execute:

```powershell
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"

git add api/[...path].ts
git add apps/backend/src/api.ts  
git add apps/frontend/src/pages/AdminDashboard.tsx
git add apps/frontend/src/lib/authLocal.ts
git add apps/frontend/src/hooks/useAuth.ts

git commit -m "Correção: Erro 405 nas rotas admin - Sempre retorna JSON, nunca HTML"

git push -u origin main
```

---

## 📝 ARQUIVOS MODIFICADOS

1. ✅ `api/[...path].ts` - Handler Vercel melhorado
2. ✅ `apps/backend/src/api.ts` - Rotas admin corrigidas
3. ✅ `apps/frontend/src/pages/AdminDashboard.tsx` - Token de auth adicionado
4. ✅ `apps/frontend/src/lib/authLocal.ts` - Integração híbrida
5. ✅ `apps/frontend/src/hooks/useAuth.ts` - Comentário atualizado

---

## 🎯 O QUE FOI CORRIGIDO

- ✅ Erro 405 corrigido
- ✅ Todas as rotas sempre retornam JSON
- ✅ Nunca retorna HTML
- ✅ Token de autenticação adicionado nas requisições
- ✅ Tratamento de erro completo

---

Após fazer o push, a Vercel vai fazer deploy automaticamente! 🚀



