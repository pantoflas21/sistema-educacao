# 🚀 Comandos para Deploy - Login Corrigido

## 📋 Passo a Passo

### 1. **Verificar Status do Git**

```bash
git status
```

### 2. **Adicionar Todos os Arquivos Modificados**

```bash
git add .
```

### 3. **Fazer Commit**

```bash
git commit -m "FIX: Melhora sistema de login com credenciais claras para todos os painéis

- Adiciona informações visuais de credenciais na tela de login
- Melhora detecção de perfil (suporta aluno/student, professor/prof)
- Cria documentação de credenciais de teste
- Corrige consistência entre api.ts e index.ts
- Remove aviso desnecessário do Supabase no console"
```

### 4. **Push para o Repositório**

```bash
git push origin main
```

**OU se sua branch principal for `master`:**

```bash
git push origin master
```

---

## ✅ Após o Push

1. **A Vercel fará deploy automaticamente** (se estiver conectada ao GitHub)
2. **Aguarde alguns minutos** para o deploy concluir
3. **Acesse:** `https://sistema-educacao.vercel.app/login`

---

## 🔑 Credenciais para Testar

### 👨‍💼 Administrador
- Email: `admin@escola.com`
- Senha: qualquer valor

### 👨‍🏫 Professor
- Email: `prof@escola.com` ou `professor@escola.com`
- Senha: qualquer valor

### 📋 Secretário
- Email: `secretario@escola.com` ou `secretaria@escola.com`
- Senha: qualquer valor

### 💰 Tesouraria
- Email: `tesouraria@escola.com`
- Senha: qualquer valor

### 🏛️ Secretaria de Educação
- Email: `educacao@escola.com` ou `educação@escola.com`
- Senha: qualquer valor

### 👨‍🎓 Aluno
- Email: `aluno@escola.com` ou `student@escola.com`
- Senha: qualquer valor

---

## ⚠️ Importante

Certifique-se de que a variável `AUTH_DEMO=true` está configurada na Vercel:
1. Acesse o painel da Vercel
2. Vá em Settings > Environment Variables
3. Verifique se `AUTH_DEMO=true` está configurado
4. Se não estiver, adicione e faça um novo deploy

---

**Pronto!** Após o push, o sistema estará atualizado na Vercel. 🎉




