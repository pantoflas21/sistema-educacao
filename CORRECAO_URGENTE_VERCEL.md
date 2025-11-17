# 🚨 CORREÇÃO URGENTE: Painel do Professor no Vercel

## 🔴 PROBLEMA IDENTIFICADO:

O Vercel está retornando **HTML (página 404)** em vez de **JSON** para o endpoint `/api/teacher/terms`. Isso causa o erro:
```
SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON
```

## ✅ CORREÇÕES APLICADAS:

### 1. **Handler de Erro Global** ✅
- Adicionado handler que **SEMPRE retorna JSON**, nunca HTML
- Mesmo para rotas não encontradas, retorna JSON com erro 404

### 2. **Headers Content-Type** ✅
- Todos os endpoints agora definem explicitamente `Content-Type: application/json; charset=utf-8`
- Garante que o navegador sempre espera JSON

### 3. **Endpoint `/api/teacher/terms` Reforçado** ✅
- Headers definidos ANTES de qualquer processamento
- Garante que sempre retorna JSON

## ⚠️ AÇÃO NECESSÁRIA NO VERCEL:

### Configure a variável de ambiente `AUTH_DEMO=true`:

1. Acesse: https://vercel.com
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - **Nome:** `AUTH_DEMO`
   - **Valor:** `true`
   - **Ambiente:** Production, Preview, Development (todos)

**SEM ESSA VARIÁVEL, O SISTEMA PODE RETORNAR 401 E O PAINEL NÃO FUNCIONARÁ!**

## 📋 ARQUIVOS MODIFICADOS:

1. ✅ `apps/backend/src/api.ts`
   - Handler de erro global adicionado
   - Handler para rotas não encontradas adicionado
   - Endpoint `/api/teacher/terms` reforçado

2. ✅ `api/[...path].ts`
   - Simplificado para garantir importação correta

## 🚀 PRÓXIMOS PASSOS:

1. Execute os comandos Git para enviar as correções
2. Configure `AUTH_DEMO=true` no Vercel
3. Aguarde o deploy automático
4. Teste o painel do professor

## 🔍 VERIFICAÇÃO:

Após o deploy, verifique:
- ✅ `/api/teacher/terms` retorna JSON (não HTML)
- ✅ Status code 200 (não 401 ou 404)
- ✅ Dados dos bimestres aparecem corretamente


