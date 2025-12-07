# 🚀 Como Subir a Atualização para Testar

## ✅ CORREÇÕES PRONTAS

Todas as correções do erro 405 já estão feitas no código! Agora você só precisa fazer commit e push.

---

## 📋 OPÇÃO 1: Script Automático (MAIS FÁCIL)

Execute este comando no **PowerShell**:

```powershell
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"; .\FazerCommit.ps1
```

---

## 📋 OPÇÃO 2: Comandos Manuais

Abra o **PowerShell** e execute **um por um**:

```powershell
# 1. Ir para o diretório do projeto
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"

# 2. Adicionar arquivos modificados
git add api/[...path].ts
git add apps/backend/src/api.ts
git add apps/frontend/src/pages/AdminDashboard.tsx
git add apps/frontend/src/lib/authLocal.ts
git add apps/frontend/src/hooks/useAuth.ts

# 3. Fazer commit
git commit -m "Correção: Erro 405 nas rotas admin - Sempre retorna JSON"

# 4. Fazer push (subir para GitHub/Vercel)
git push origin main
```

---

## 🎯 O QUE FOI CORRIGIDO

✅ **Erro 405 corrigido** nas rotas admin
✅ **GET /api/admin/users** - Agora lista usuários corretamente
✅ **POST /api/admin/users** - Criação de usuários funcionando
✅ **GET /api/statistics/overview** - Sempre retorna JSON
✅ **Handler Vercel** melhorado para nunca retornar HTML
✅ **Token de autenticação** adicionado nas requisições

---

## 🚀 DEPOIS DO PUSH

1. ✅ A Vercel vai fazer deploy **automaticamente**
2. ✅ Em 1-2 minutos você pode testar
3. ✅ Acesse seu site na Vercel
4. ✅ Teste criar um usuário - não deve mais dar erro 405!

---

## ⚠️ SE DER ERRO

### Erro: "remote not found"
```powershell
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

### Erro: "branch not found"
```powershell
git branch -M main
```

### Erro: "nothing to commit"
Os arquivos já podem estar commitados. Verifique:
```powershell
git status
```

---

## ✅ PRONTO!

Depois do push, a Vercel vai fazer deploy e você pode testar! 🎉



