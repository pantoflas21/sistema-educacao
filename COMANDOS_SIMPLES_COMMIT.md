# 🚀 Comandos Simples para Fazer Commit

## ✅ Use o Terminal do Cursor (Ctrl + ')

Abra o terminal **dentro do Cursor** (não o PowerShell externo) e execute estes comandos:

---

## 📋 COMANDOS (copie e cole):

```bash
git add api/[...path].ts
git add apps/backend/src/api.ts
git add apps/frontend/src/pages/AdminDashboard.tsx
git add apps/frontend/src/lib/authLocal.ts
git add apps/frontend/src/hooks/useAuth.ts

git commit -m "Correcao: Erro 405 nas rotas admin - Sempre retorna JSON"

git push origin main
```

---

## ✅ PRONTO!

Depois do push, a Vercel vai fazer deploy automaticamente! 🎉

---

## ⚠️ SE DER ERRO

### Erro: "not a git repository"
```bash
git init
```

### Erro: "remote not found"
```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

### Erro: "nothing to commit"
Os arquivos já podem estar commitados. Verifique:
```bash
git status
```

---

**É só isso! Execute no terminal do Cursor!** ✨



