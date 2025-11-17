# 🌐 Deploy na Vercel - Guia Rápido

## ❓ Posso fazer deploy SEM variáveis de ambiente?

**SIM, você PODE!** ✅

O sistema vai funcionar, mas em **modo demo**. As variáveis de ambiente são **recomendadas**, mas **não obrigatórias** para começar.

---

## 🚀 Deploy Rápido (SEM Variáveis de Ambiente)

### Passo 1: Conectar GitHub

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Você verá seus repositórios do GitHub
5. **Encontre "aletheia"** e clique em **"Import"**

### Passo 2: Configurar Projeto

A Vercel detecta automaticamente! Só verifique:

- **Framework Preset**: Vite (já detectado)
- **Root Directory**: Deixe vazio (ou `./`)
- **Build Command**: `cd apps/frontend && npm run build`
- **Output Directory**: `apps/frontend/dist`
- **Install Command**: `npm install`

**Deixe tudo como está detectado!**

### Passo 3: Pular Variáveis de Ambiente (Por Enquanto)

1. **NÃO adicione nenhuma variável de ambiente agora**
2. Clique direto no botão **"Deploy"** 🔵
3. ⏳ Aguarde 2-5 minutos
4. ✅ **Pronto!** Seu site está no ar!

---

## ✅ O Que Vai Funcionar SEM Variáveis

- ✅ Site vai abrir normalmente
- ✅ Todas as páginas vão carregar
- ✅ Sem erros 404
- ✅ Login vai funcionar em **modo demo**

**Modo Demo** = Qualquer email e senha funcionam para teste!

---

## 🔧 Adicionar Variáveis de Ambiente Depois (Opcional)

Se quiser adicionar depois:

1. Na Vercel, vá no seu projeto
2. Clique em **"Settings"** (Configurações)
3. No menu lateral, clique em **"Environment Variables"**
4. Adicione:
   - **Name**: `AUTH_DEMO`
   - **Value**: `true`
5. Clique em **"Save"**
6. Vá em **"Deployments"** → Clique nos **"..."** do último deploy → **"Redeploy"**

---

## 🎯 Resumo Rápido

| O Que Fazer | Sim/Não |
|------------|---------|
| Fazer deploy SEM variáveis? | ✅ **SIM! Pode!** |
| Site vai funcionar? | ✅ **SIM! Vai funcionar!** |
| Login vai funcionar? | ✅ **SIM! Modo demo!** |
| Preciso adicionar depois? | ⚠️ **Só se quiser!** |

---

## 🚀 Como Proceder

1. ✅ **Faça o deploy AGORA sem variáveis** (funciona!)
2. ✅ **Teste o site** (tudo deve funcionar)
3. ⚠️ **Se quiser, adicione as variáveis depois** (opcional)

---

**Resumo: VARIÁVEIS DE AMBIENTE SÃO OPCIONAIS! O deploy funciona sem elas!** 🎉


