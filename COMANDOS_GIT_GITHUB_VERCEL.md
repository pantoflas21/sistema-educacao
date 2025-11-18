# 🚀 COMANDOS PARA GITHUB E VERCEL

## ✅ CONFIRMAÇÃO: Todas as melhorias foram implementadas!

---

## 📋 PASSO 1: NAVEGAR PARA O DIRETÓRIO DO PROJETO

Abra o terminal no Cursor e execute:

```powershell
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"
```

---

## 📋 PASSO 2: VERIFICAR STATUS DO GIT

```powershell
git status
```

---

## 📋 PASSO 3: ADICIONAR ARQUIVOS AO GIT

### 3.1 Adicionar todos os arquivos do projeto:

```powershell
git add .
```

### 3.2 Verificar o que será commitado:

```powershell
git status
```

---

## 📋 PASSO 4: FAZER COMMIT

```powershell
git commit -m "FEAT: Implementa melhorias críticas de segurança e arquitetura - Rate limiting, validação robusta, CORS configurável, hooks reutilizáveis, error boundaries, proteção de rotas"
```

**OU** se o commit acima der erro (caracteres especiais), use:

```powershell
git commit -m "FEAT: Melhorias criticas de seguranca e arquitetura - Rate limiting, validacao, CORS configurável, hooks reutilizaveis, error boundaries, protecao de rotas"
```

---

## 📋 PASSO 5: VERIFICAR SE JÁ TEM REMOTE CONFIGURADO

```powershell
git remote -v
```

Se NÃO aparecer nada ou der erro, você precisa adicionar o remote do GitHub.

---

## 📋 PASSO 6: ADICIONAR REMOTE DO GITHUB

### Se você JÁ TEM um repositório no GitHub:

Substitua `SEU_USUARIO` e `SEU_REPOSITORIO` pelos seus dados:

```powershell
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

**Exemplo:**
```powershell
git remote add origin https://github.com/pantoflas21/sistema-educacao.git
```

### Se você NÃO TEM um repositório no GitHub:

1. Acesse: https://github.com/new
2. Crie um novo repositório (ex: `sistema-educacao`)
3. **NÃO** inicialize com README, .gitignore ou license
4. Copie a URL do repositório
5. Execute o comando acima com a URL do seu repositório

---

## 📋 PASSO 7: FAZER PUSH PARA O GITHUB

### Se for a primeira vez (branch master):

```powershell
git push -u origin master
```

### Se der erro porque o GitHub usa "main" em vez de "master":

```powershell
git branch -M main
git push -u origin main
```

---

## 📋 PASSO 8: DEPLOY NA VERCEL

### Opção 1: Via Dashboard da Vercel (Recomendado)

1. Acesse: https://vercel.com
2. Faça login com sua conta
3. Clique em **"Add New..."** → **"Project"**
4. Importe o repositório do GitHub (se conectado)
   - OU conecte o GitHub se ainda não conectou
   - OU clique em **"Import Git Repository"**
5. Cole a URL do seu repositório GitHub
6. Configure:
   - **Framework Preset:** Vite (já detectado)
   - **Root Directory:** Deixe vazio (ou `./`)
   - **Build Command:** `cd apps/frontend && npm run build`
   - **Output Directory:** `apps/frontend/dist`
   - **Install Command:** `cd apps/backend && npm install && cd ../frontend && npm install`
7. Adicione variáveis de ambiente (opcional):
   - `AUTH_DEMO` = `true` (para modo demo)
   - `JWT_SECRET` = (seu secret forte)
   - `CORS_ORIGIN` = `https://seu-app.vercel.app`
8. Clique em **"Deploy"**

### Opção 2: Via Vercel CLI

Se você já tem Vercel CLI instalado:

```powershell
vercel
```

Siga as instruções no terminal.

---

## ⚠️ IMPORTANTE: Variáveis de Ambiente na Vercel

Após o deploy, configure as variáveis de ambiente:

1. Na Vercel, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Name:** `AUTH_DEMO`
   - **Value:** `true`
   - **Environment:** Production, Preview, Development (todos)
3. Se usar banco real:
   - **Name:** `JWT_SECRET`
   - **Value:** (seu secret forte - gere com: `openssl rand -base64 32`)
4. **Name:** `CORS_ORIGIN`
   - **Value:** `https://seu-app.vercel.app`
5. Clique em **Save**
6. Vá em **Deployments** → Clique nos **"..."** do último deploy → **"Redeploy"**

---

## 🎯 RESUMO RÁPIDO

```powershell
# 1. Navegar para o projeto
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "FEAT: Melhorias criticas de seguranca e arquitetura"

# 4. Adicionar remote (se necessário)
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 5. Fazer push
git branch -M main
git push -u origin main
```

Depois, vá na Vercel e faça o deploy!

---

## ✅ CONFIRMAÇÃO

- [x] Todas as melhorias implementadas
- [x] Arquivos criados e modificados
- [x] Documentação completa
- [ ] Commit no Git (próximo passo)
- [ ] Push para GitHub (próximo passo)
- [ ] Deploy na Vercel (próximo passo)

---

**Pronto!** Execute os comandos acima na ordem. Se tiver alguma dúvida ou erro, me avise!

