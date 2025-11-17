# 📤 Como Enviar para o GitHub pelo Cursor

## Método 1: Usando a Interface Gráfica do Cursor (Mais Fácil!)

### Passo 1: Abra o Controle de Versão no Cursor

1. **No Cursor, procure o ícone no menu lateral esquerdo:**
   - Procure por um ícone que parece uma **ramificação de árvore** 🌿
   - OU pressione `Ctrl + Shift + G` (atalho para Git)

2. **Você verá uma aba chamada "Source Control" ou "Controle de Versão"**

### Passo 2: Primeira Vez - Configurar Git (se ainda não fez)

1. Na parte inferior do Cursor, clique no ícone de **Terminal** ou pressione `Ctrl + '`
2. Digite (substitua com seus dados):
   ```
   git config --global user.name "Seu Nome"
   git config --global user.email "seu@email.com"
   ```

### Passo 3: Inicializar o Repositório (Primeira Vez)

1. No Terminal do Cursor (parte inferior)
2. Digite:
   ```
   git init
   ```

### Passo 4: Adicionar Arquivos

1. Na aba "Source Control" (lateral esquerdo)
2. Você verá uma lista de arquivos com um sinal de **+** ao lado
3. Clique no **+** ao lado de "Changes" para adicionar todos os arquivos
4. OU clique com botão direito em cada arquivo e escolha "Stage Changes"

### Passo 5: Fazer Commit (Salvar)

1. Na parte superior da aba "Source Control"
2. Você verá uma caixa de texto que diz "Message"
3. Digite: `Primeira versão do Aletheia`
4. Clique no botão **✓ (check)** ao lado ou pressione `Ctrl + Enter`

### Passo 6: Conectar com o GitHub

1. No Terminal do Cursor, digite:
   ```
   git remote add origin https://github.com/SEU_USUARIO/aletheia.git
   ```
   (Substitua SEU_USUARIO pelo seu usuário do GitHub)

2. Para enviar:
   ```
   git branch -M main
   git push -u origin main
   ```

3. Você será pedido para fazer login no GitHub
   - Digite seu usuário e senha
   - OU use um Personal Access Token (mais seguro)

---

## Método 2: Usando o Terminal Integrado do Cursor

Se preferir comandos:

1. Abra o Terminal: `Ctrl + '` ou menu Terminal → New Terminal
2. Execute os comandos um por um:

```bash
git init
git add .
git commit -m "Primeira versão do Aletheia"
git remote add origin https://github.com/SEU_USUARIO/aletheia.git
git branch -M main
git push -u origin main
```

---

## 🔄 Enviar Atualizações Futuras

Quando fizer mudanças no código:

1. **Adicione os arquivos** (clique no + na aba Source Control)
2. **Faça commit** (digite mensagem e clique no ✓)
3. **Envie para GitHub** (botão "..." ou "Sync Changes" ou use o terminal):
   ```
   git push
   ```

---

## 🆘 Problemas Comuns

### "git não é reconhecido"
**Solução**: Instale o Git: [https://git-scm.com/download/win](https://git-scm.com/download/win)

### Erro de autenticação
**Solução**: Use Personal Access Token ao invés de senha:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token
3. Use o token como senha

### "remote origin already exists"
**Solução**: 
```
git remote remove origin
git remote add origin https://github.com/SEU_USUARIO/aletheia.git
```

---

**Pronto! Seu código está no GitHub! 🎉**

