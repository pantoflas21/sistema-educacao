# 📤 Como Enviar para o GitHub pelo Cursor (SEM PowerShell)

## 🎯 Método Visual - Só Clicar!

### Passo 1: Abrir o Controle de Versão no Cursor

1. **No menu lateral ESQUERDO** do Cursor, procure por:
   - Um ícone de **ramificação/árvore** 🌿 
   - OU um ícone que diz **"Source Control"**
   - OU pressione: `Ctrl + Shift + G`

2. **Você verá uma aba "Source Control" ou "SCM"**

### Passo 2: Primeira Vez - Inicializar Git

Se você nunca usou Git neste projeto:

1. Na parte **INFERIOR** do Cursor, clique no ícone de **Terminal** 📟
   - OU pressione: `Ctrl + '` (aspas simples)

2. No terminal que abrir, digite:
   ```
   git init
   ```
   Pressione Enter.

### Passo 3: Adicionar Arquivos (Staging)

1. Na aba **"Source Control"** (lateral esquerdo)
2. Você verá:
   - Uma lista de arquivos com o sinal **+** ao lado
   - Um contador tipo "X changes" (X mudanças)
   
3. **Clique no sinal +** ao lado de cada arquivo
   - OU clique no **+** ao lado de "Changes" (adiciona todos de uma vez)

### Passo 4: Fazer Commit (Salvar Mudanças)

1. **Acima da lista de arquivos**, você verá uma caixa de texto que diz:
   - "Message" ou "Type commit message..."
   
2. **Digite uma mensagem**, por exemplo:
   ```
   Primeira versão do Aletheia
   ```

3. **Clique no botão ✓ (checkmark)** no canto superior direito
   - OU pressione: `Ctrl + Enter`

### Passo 5: Publicar no GitHub

1. **Acima do botão de commit**, você verá um botão:
   - **"Publish Branch"** ou **"..." (três pontos)**
   
2. **Clique em "Publish Branch"** ou:
   - Clique nos **"..."** 
   - Escolha **"Publish Branch"**

3. **Uma janela vai abrir pedindo:**
   - Se você quer criar um repositório **privado** ou **público**
   - Escolha **"Private"** (privado) para seu projeto
   - Clique em **"OK"** ou **"Publish to GitHub"**

4. **Faça login no GitHub** se necessário
   - Uma janela do navegador pode abrir pedindo autorização
   - Autorize o Cursor a acessar seu GitHub

✅ **PRONTO!** Seu código está no GitHub!

---

## 🔄 Atualizações Futuras (Enviar Mudanças)

Quando você fizer mudanças no código e quiser enviar de novo:

1. Abra **Source Control** (`Ctrl + Shift + G`)
2. Clique no **+** para adicionar os arquivos modificados
3. Digite uma mensagem de commit
4. Clique no **✓**
5. Clique no botão **"Sync Changes"** ou **"Push"** que aparece no topo

---

## 🆘 Se não aparecer "Publish Branch"

Use o Terminal do Cursor:

1. Abra o Terminal: `Ctrl + '`
2. Digite (um comando por vez):
   ```
   git remote add origin https://github.com/SEU_USUARIO/aletheia.git
   ```
   (Substitua SEU_USUARIO pelo seu usuário do GitHub)
   
3. Depois:
   ```
   git branch -M main
   git push -u origin main
   ```

---

## 📸 Visualização

O botão "Publish Branch" geralmente fica:
- No canto superior direito da aba Source Control
- Ao lado do botão de commit (✓)
- Ou nos três pontos (...)

**É só procurar no canto superior direito da aba!** 🔍

---

**Pronto! Agora você sabe como enviar para o GitHub sem usar PowerShell!** 🎉

