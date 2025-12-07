# 🔧 CORREÇÃO: Versão do Node.js

## ❌ ERRO ENCONTRADO

```
Foi encontrada uma versão inválida do Node.js: "20.x". 
Por favor, defina a versão do Node.js para 18.x nas configurações do seu projeto para usar o Node.js 18.
```

## ✅ CORREÇÃO APLICADA

Alterado no `vercel.json`:
- **ANTES:** `"runtime": "@vercel/node@3.0.0"` (tentava usar Node 20)
- **DEPOIS:** `"runtime": "nodejs18.x"` (usa Node.js 18.x)

---

## 🚀 COMANDOS PARA COMMIT

```bash
git add vercel.json
git commit -m "Correcao: Ajusta versao do Node.js para 18.x na Vercel"
git push origin main
```

---

## ✅ DEPOIS DO PUSH

1. Aguarde 1-2 minutos para deploy
2. O erro de versão do Node.js deve desaparecer
3. O deploy deve funcionar corretamente

---

**Correção aplicada!** ✅



