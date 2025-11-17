# 🔧 CORREÇÃO: Dependências do Backend no Vercel

## 🔴 PROBLEMA IDENTIFICADO:

O Vercel estava tentando compilar o TypeScript do backend (`apps/backend/src/api.ts`), mas as dependências do backend não estavam sendo instaladas, causando erros:

```
erro TS2307: Não foi possível encontrar o módulo 'express'
erro TS2307: Não foi possível encontrar o módulo 'cors'
erro TS2307: Não foi possível encontrar o módulo 'helmet'
... (e outros)
```

## ✅ CORREÇÕES APLICADAS:

### 1. **`vercel.json` - installCommand Atualizado** ✅
```json
"installCommand": "cd apps/backend && npm install && cd ../frontend && npm install"
```
- Agora instala as dependências do **backend** E do **frontend**
- Garante que todas as dependências necessárias estejam disponíveis

### 2. **`build.js` - Verificação de Dependências** ✅
- Adicionada verificação se `node_modules` do backend existe
- Se não existir, instala automaticamente antes do build

## 📋 ARQUIVOS MODIFICADOS:

1. ✅ `vercel.json`
   - `installCommand` atualizado para instalar backend + frontend

2. ✅ `build.js`
   - Verificação e instalação automática de dependências do backend

## 🚀 PRÓXIMOS PASSOS:

1. Execute os comandos Git para enviar as correções
2. O Vercel irá:
   - Instalar dependências do backend
   - Instalar dependências do frontend
   - Compilar o frontend
   - Deploy das serverless functions

## ⚠️ IMPORTANTE:

**Ainda é necessário configurar `AUTH_DEMO=true` no Vercel!**

Veja `VERCEL_ENV_VARS.md` para instruções detalhadas.


