# 📋 COMANDOS PARA COPIAR E COLAR - ORDEM DE EXECUÇÃO

## ⚠️ IMPORTANTE: Execute UM COMANDO POR VEZ no terminal

---

## ✅ COMANDO 1: Navegar para o projeto

**Copie e cole esta linha:**

```powershell
cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"
```

**Pressione ENTER e aguarde...**

---

## ✅ COMANDO 2: Verificar status do Git

**Copie e cole esta linha:**

```powershell
git status
```

**Pressione ENTER e veja o que aparece.**

---

## ✅ COMANDO 3: Adicionar todos os arquivos

**Copie e cole esta linha:**

```powershell
git add .
```

**Pressione ENTER e aguarde...**

---

## ✅ COMANDO 4: Verificar o que será commitado

**Copie e cole esta linha:**

```powershell
git status
```

**Pressione ENTER e confira os arquivos que serão commitados.**

---

## ✅ COMANDO 5: Fazer commit

**Copie e cole esta linha:**

```powershell
git commit -m "FEAT: Melhorias criticas de seguranca e arquitetura - Rate limiting, validacao, CORS configurável, hooks reutilizaveis, error boundaries, protecao de rotas"
```

**Pressione ENTER e aguarde...**

---

## ✅ COMANDO 6: Verificar se já tem remote do GitHub

**Copie e cole esta linha:**

```powershell
git remote -v
```

**Pressione ENTER e veja o resultado:**

- **Se aparecer URLs do GitHub:** Pule para o COMANDO 8
- **Se NÃO aparecer nada ou der erro:** Continue com o COMANDO 7

---

## ✅ COMANDO 7: Adicionar remote do GitHub (SÓ SE NÃO TIVER)

**SUBSTITUA `pantoflas21` e `sistema-educacao` pelos seus dados do GitHub:**

**Copie e cole esta linha (ajuste a URL):**

```powershell
git remote add origin https://github.com/pantoflas21/sistema-educacao.git
```

**Pressione ENTER e aguarde...**

**Se você não sabe qual é a URL do seu repositório:**
1. Acesse: https://github.com/new
2. Crie um novo repositório (ex: `sistema-educacao`)
3. **NÃO** inicialize com README
4. Copie a URL que aparece (ex: `https://github.com/SEU_USUARIO/sistema-educacao.git`)
5. Cole aqui substituindo a URL

---

## ✅ COMANDO 8: Mudar branch para main

**Copie e cole esta linha:**

```powershell
git branch -M main
```

**Pressione ENTER e aguarde...**

---

## ✅ COMANDO 9: Fazer push para o GitHub

**Copie e cole esta linha:**

```powershell
git push -u origin main
```

**Pressione ENTER e aguarde...**

**Se pedir usuário e senha:**
- Usuário: Seu usuário do GitHub
- Senha: Use um **Personal Access Token** (não use sua senha normal)
  - Como criar: https://github.com/settings/tokens
  - Permissões: `repo` (todas)

---

## ⚠️ SE DER ERRO NO COMANDO 9

### Erro: "branch main has no upstream branch"

**Execute este comando:**

```powershell
git push --set-upstream origin main
```

---

### Erro: "failed to push some refs" (código já existe no GitHub)

**Opção A: Fazer pull primeiro**

```powershell
git pull origin main --allow-unrelated-histories
```

Depois execute novamente:

```powershell
git push -u origin main
```

**Opção B: Forçar push (CUIDADO: sobrescreve o que está no GitHub)**

```powershell
git push -u origin main --force
```

---

## 🎉 DEPOIS DO GITHUB - DEPLOY NA VERCEL

1. Acesse: **https://vercel.com**
2. Faça login
3. Clique em **"Add New..."** → **"Project"**
4. **Importe seu repositório do GitHub:**
   - Se já tem GitHub conectado, selecione `sistema-educacao`
   - Se não tem, clique em **"Import Git Repository"** e cole a URL
5. **Configure o projeto:**
   - **Framework Preset:** Vite (já detectado)
   - **Root Directory:** Deixe vazio (ou `./`)
   - **Build Command:** `cd apps/frontend && npm run build`
   - **Output Directory:** `apps/frontend/dist`
   - **Install Command:** `cd apps/backend && npm install && cd ../frontend && npm install`
6. **Adicione variável de ambiente:**
   - Clique em **"Environment Variables"**
   - **Name:** `AUTH_DEMO`
   - **Value:** `true`
   - **Environment:** Production, Preview, Development (todos)
   - Clique em **"Save"**
7. Clique em **"Deploy"**
8. Aguarde 2-5 minutos
9. ✅ Pronto! Seu sistema está no ar!

---

## 📝 RESUMO RÁPIDO (ordem)

1. `cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"`
2. `git status`
3. `git add .`
4. `git status`
5. `git commit -m "FEAT: Melhorias criticas..."`
6. `git remote -v`
7. `git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git` (se necessário)
8. `git branch -M main`
9. `git push -u origin main`

---

**Pronto!** Execute na ordem, um comando por vez. Se der erro, me avise qual comando deu erro!

