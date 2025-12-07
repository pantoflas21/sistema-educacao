# 🔧 CORREÇÃO CRÍTICA: vercel.json - Rotas /api/* Retornando HTML

## ❌ PROBLEMA IDENTIFICADO

O erro **"Unexpected token '<', "<!doctype "... is not valid JSON"** significa que:
- As rotas `/api/*` estão sendo capturadas pelo rewrite do frontend
- O Vercel está servindo `index.html` em vez de executar o handler serverless
- Por isso retorna HTML em vez de JSON

---

## ✅ SOLUÇÃO APLICADA

### Ajuste no `vercel.json`:

**ANTES (ERRADO):**
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api/$1"  // Isso não funciona!
  },
  {
    "source": "/(.*)",
    "destination": "/index.html"  // Isso captura TUDO, inclusive /api/*
  }
]
```

**DEPOIS (CORRETO):**
```json
"rewrites": [
  {
    "source": "/((?!api/).*)",
    "destination": "/index.html"  // Captura tudo EXCETO /api/*
  }
]
```

---

## 🎯 COMO FUNCIONA AGORA

1. ✅ **Rotas `/api/*`** → Vercel detecta automaticamente `api/[...path].ts` e executa o handler
2. ✅ **Rotas do frontend** → São redirecionadas para `/index.html`
3. ✅ **Nunca mais HTML nas rotas API** → Sempre JSON!

---

## 🚀 COMANDOS PARA COMMIT

```bash
git add vercel.json
git commit -m "Correcao critica: vercel.json - Rotas /api/* agora funcionam corretamente"
git push origin main
```

---

## ✅ DEPOIS DO DEPLOY

1. Aguarde 1-2 minutos para deploy
2. Teste criar usuário - deve funcionar!
3. Teste outras rotas API - devem retornar JSON!

---

**Esta é a correção definitiva!** 🎉



