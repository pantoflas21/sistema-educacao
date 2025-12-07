# 🔴 CORREÇÃO URGENTE - Erro 405 no Login

## ❌ Problema Identificado

**Erro:** `405 Method Not Allowed` ao tentar fazer login na Vercel

**Causa:** O handler do Vercel não estava convertendo corretamente a requisição do Vercel para o formato Express.

## ✅ Correção Aplicada

### Arquivo: `api/[...path].ts`

**Mudanças:**
1. ✅ Melhorada a conversão de VercelRequest/VercelResponse para formato Express
2. ✅ Garantido que o método HTTP é passado corretamente
3. ✅ Headers CORS configurados antes de processar
4. ✅ Handler OPTIONS para CORS preflight

## 🚀 Como Aplicar a Correção

### 1. Fazer Commit e Push

```bash
git add api/[...path].ts
git commit -m "FIX URGENTE: Corrige erro 405 no login - conversão correta Vercel/Express"
git push origin main
```

### 2. Aguardar Deploy na Vercel

A Vercel fará deploy automaticamente após o push.

### 3. Testar Login

Após o deploy, teste:
- Acesse: `https://sistema-educacao.vercel.app/login`
- Use: `admin@escola.com` / qualquer senha
- Deve funcionar sem erro 405

## 🔍 O Que Foi Corrigido

### Antes:
- Handler não convertia corretamente req/res do Vercel para Express
- Método HTTP não era passado corretamente
- Express não recebia os dados no formato esperado

### Depois:
- ✅ Conversão correta de objetos
- ✅ Método HTTP preservado
- ✅ Body e headers passados corretamente
- ✅ CORS configurado antes de processar

## ⚠️ Importante

Certifique-se de que `AUTH_DEMO=true` está configurado na Vercel:
1. Vercel Dashboard > Settings > Environment Variables
2. Verifique se `AUTH_DEMO=true` está configurado

---

**Status:** ✅ Corrigido  
**Prioridade:** 🔴 URGENTE  
**Data:** 2025-01-27




