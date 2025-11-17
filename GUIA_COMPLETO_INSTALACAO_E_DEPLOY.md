# 🚀 Guia Completo: Instalação e Deploy do Aletheia

Este guia foi criado para pessoas que estão começando. Siga cada passo com calma!

---

## 📋 **PARTE 1: INSTALANDO AS DEPENDÊNCIAS**

### O que são dependências?
São programas externos que o projeto precisa para funcionar. É como baixar ferramentas antes de construir algo.

### Como instalar (passo a passo):

#### **Opção A: Instalação Completa (Recomendado)**

1. **Abra o PowerShell ou Prompt de Comando**
   - Pressione `Windows + R`
   - Digite `powershell` e pressione Enter
   - OU digite `cmd` e pressione Enter

2. **Vá até a pasta do projeto**
   - Digite: `cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"`
   - Pressione Enter

3. **Instale as dependências do projeto principal**
   - Digite: `npm install`
   - Pressione Enter
   - ⏳ **Aguarde! Isso pode demorar 2-5 minutos.**
   - ✅ Você verá muitas linhas passando. Isso é normal!

4. **Instale as dependências do backend**
   - Digite: `cd apps\backend`
   - Pressione Enter
   - Digite: `npm install`
   - Pressione Enter
   - ⏳ **Aguarde novamente!**
A: Instalação Completa (Recomendado)**

1. **Abra o PowerShell ou Prompt de Comando**
   - Pressione `Windows + R`
   - Digite `powershell` e pressione Enter
   - OU digite `cmd` e pressione Enter

2. **Vá até a pasta do projeto**
   - Digite: `cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"`
   - Pressione Enter

3. **Instale as dependências do projeto principal**
   - Digite: `npm install`
   - Pressione Enter
   - ⏳ **Aguarde! Isso pode demorar 2-5 minutos.**
   - ✅ Você verá muitas linhas passando. Isso é normal!

4. **Instale as dependências do backend**
   - Digite: `cd apps\backend`
   - Pressione Enter
   - Digite: `npm install`
5. **Volte para a pasta raiz**
   - Digite: `cd ..\..`
   - Pressione Enter

6. **Instale as dependências do frontend**
   - Digite: `cd apps\frontend`
   - Pressione Enter
   - Digite: `npm install`
   - Pressione Enter
   - ⏳ **Última espera!**

#### **Opção B: Usando o script automático (se funcionar no Windows)**

1. Abra o PowerShell na pasta do projeto
2. Digite: `npm install`
3. Depois digite: `cd apps\backend` e `npm install`
4. Depois digite: `cd ..\frontend` e `npm install`

### ⚠️ **Se der erro:**
- Certifique-se de ter o Node.js instalado: [https://nodejs.org](https://nodejs.org)
- Feche e abra o PowerShell novamente
- Tente novamente

---

## 📦 **PARTE 2: FAZENDO BUILD DO PROJETO**

Build = Transformar o código em arquivos prontos para usar.

1. **Abra o PowerShell na pasta do projeto**
   ```
   cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"
   ```

2. **Faça o build do backend**
   ```
   cd apps\backend
   npm run build
   ```
   ⏳ Aguarde terminar!

3. **Volte e faça o build do frontend**
   ```
   cd ..\frontend
   npm run build
   ```
   ⏳ Aguarde terminar!

✅ **Pronto!** Agora o projeto está compilado.

---

## 📤 **PARTE 3: COLOCANDO NO GITHUB**

### O que é o GitHub?
É como um "Google Drive" para código. Lá você guarda seu projeto e pode compartilhar com outras pessoas.

### Passo a passo:

#### **1. Criar conta no GitHub (se não tiver)**
1. Acesse: [https://github.com](https://github.com)
2. Clique em "Sign up"
3. Crie sua conta (é grátis!)

#### **2. Instalar o Git (se não tiver)**
1. Baixe em: [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Instale normalmente (clique Next em tudo)
3. Reinicie o computador

#### **3. Configurar o Git (apenas uma vez)**
1. Abra o PowerShell
2. Digite (substitua com seu nome e email):
   ```
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

#### **4. Criar repositório no GitHub**
1. Acesse: [https://github.com/new](https://github.com/new)
2. Nome do repositório: `aletheia` (ou outro nome de sua escolha)
3. **Marque**: ✅ "Add a README file"
4. Clique em "Create repository"

#### **5. Conectar seu projeto ao GitHub**
1. **Abra o PowerShell na pasta do projeto**
   ```
   cd "C:\Users\Claiton\Desktop\SISTEMA EDUCAÇÃO CURSOR"
   ```

2. **Inicialize o Git** (apenas se ainda não fez):
   ```
   git init
   ```

3. **Adicione todos os arquivos**:
   ```
   git add .
   ```

4. **Faça o primeiro commit** (salvamento):
   ```
   git commit -m "Primeira versão do Aletheia"
   ```

5. **Conecte ao GitHub** (substitua SEU_USUARIO):
   ```
   git remote add origin https://github.com/SEU_USUARIO/aletheia.git
   ```

6. **Envie para o GitHub**:
   ```
   git branch -M main
   git push -u origin main
   ```

7. **Você será pedido para fazer login**
   - Digite seu usuário do GitHub
   - Digite sua senha (ou token de acesso pessoal)

✅ **Pronto!** Seu projeto está no GitHub!

---

## 🌐 **PARTE 4: FAZENDO DEPLOY NA VERCEL**

### O que é a Vercel?
É um serviço que coloca seu site na internet, de graça!

### Passo a passo:

#### **1. Criar conta na Vercel**
1. Acesse: [https://vercel.com](https://vercel.com)
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize a Vercel a acessar seu GitHub

#### **2. Importar o projeto**
1. Na Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá seus repositórios do GitHub
3. Clique em **"Import"** no repositório `aletheia`

#### **3. Configurar o projeto**
A Vercel vai detectar automaticamente, mas verifique:

- **Framework Preset**: Deixe como está (Vite)
- **Root Directory**: Deixe vazio (ou `./` se pedir)
- **Build Command**: `cd apps/frontend && npm run build`
- **Output Directory**: `apps/frontend/dist`
- **Install Command**: `npm install`

#### **4. Variáveis de Ambiente (IMPORTANTE!)**
Clique em **"Environment Variables"** e adicione:

- **Nome**: `AUTH_DEMO`
- **Valor**: `true`
- Clique em **"Add"**

#### **5. Fazer Deploy**
1. Clique no botão **"Deploy"**
2. ⏳ **Aguarde 2-5 minutos**
3. ✅ Quando terminar, você verá: **"Congratulations!"**

#### **6. Acessar seu site**
1. A Vercel vai dar uma URL tipo: `aletheia.vercel.app`
2. Clique nela ou copie e cole no navegador
3. 🎉 **Seu site está no ar!**

---

## ✅ **CHECKLIST FINAL - ANTES DE APRESENTAR**

### Antes de mostrar para o cliente, verifique:

- [ ] ✅ Site abre sem erros
- [ ] ✅ Login funciona (modo demo)
- [ ] ✅ Todas as páginas carregam sem erro 404
- [ ] ✅ A logo do Aletheia aparece
- [ ] ✅ As cores estão bonitas (laranja, verde, azul)
- [ ] ✅ Funciona no celular (teste no navegador do celular)
- [ ] ✅ Nome "Aletheia" aparece em todos os lugares

### Como testar:
1. Acesse a URL da Vercel
2. Teste fazer login com:
   - Email: `admin@exemplo.com`
   - Senha: qualquer coisa (modo demo)
3. Navegue pelas páginas
4. Teste no celular abrindo a URL

---

## 🆘 **RESOLUÇÃO DE PROBLEMAS**

### Erro: "npm não é reconhecido"
**Solução**: Instale o Node.js: [https://nodejs.org](https://nodejs.org)

### Erro: "git não é reconhecido"
**Solução**: Instale o Git: [https://git-scm.com/download/win](https://git-scm.com/download/win)

### Erro 404 na Vercel
**Solução**: Verifique se:
- O arquivo `vercel.json` está na raiz do projeto
- O `apps/frontend/dist` foi criado (fez build?)
- As variáveis de ambiente estão configuradas

### "Connection Failed"
**Solução**: Verifique se:
- O arquivo `api/[...path].ts` existe
- O arquivo `apps/backend/src/api.ts` existe
- As dependências foram instaladas

### Site não carrega
**Solução**: 
- Verifique os logs na Vercel (aba "Logs")
- Certifique-se de que fez o build do frontend
- Verifique se todas as dependências foram instaladas

---

## 📞 **PRECISOU DE AJUDA?**

Se algo não funcionar:
1. Leia as mensagens de erro com calma
2. Verifique se seguiu todos os passos
3. Tente fazer novamente
4. Procure a mensagem de erro no Google

---

## 🎉 **PRONTO!**

Agora seu sistema Aletheia está:
- ✅ Funcionando localmente
- ✅ No GitHub (versionado)
- ✅ Online na Vercel (para clientes verem)
- ✅ Livre de erros 404
- ✅ Com identidade visual moderna

**Boa sorte com a apresentação! 🚀**


