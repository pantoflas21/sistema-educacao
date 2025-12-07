# 🔧 Configuração do Supabase (Opcional)

## ⚠️ IMPORTANTE: Supabase é OPCIONAL

O sistema **Aletheia funciona perfeitamente sem Supabase** usando o backend Express. O Supabase é apenas para funcionalidades opcionais (teste, cadastro de pessoas).

## 📋 Como Configurar (Se Quiser Usar)

### 1. Criar Arquivo `.env`

Na pasta `apps/frontend/`, crie um arquivo chamado `.env`:

```env
# Supabase (Opcional)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 2. Obter as Chaves do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Crie um projeto ou selecione um existente
3. Vá em **Settings > API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 3. Reiniciar o Servidor

Após criar o arquivo `.env`, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## ✅ Verificar se Está Funcionando

1. Acesse `/test-supabase` no navegador
2. Clique em "Testar Conexão"
3. Se configurado corretamente, verá mensagem de sucesso

## 🚫 Não Quer Usar Supabase?

**Não precisa fazer nada!** O sistema funciona normalmente sem essas variáveis.

- ✅ Login funciona
- ✅ Todas as funcionalidades principais funcionam
- ✅ Backend Express fornece todas as APIs necessárias
- ⚠️ Apenas funcionalidades específicas do Supabase não estarão disponíveis

## 📝 Notas

- O arquivo `.env` não deve ser commitado no Git (já está no `.gitignore`)
- Em produção (Vercel), configure as variáveis nas configurações do projeto
- O aviso no console só aparece se tentar usar funcionalidades do Supabase sem configurar

---

**Última atualização:** 2025-01-27




