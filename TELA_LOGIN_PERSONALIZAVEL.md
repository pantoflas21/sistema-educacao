# ✅ Tela de Login Personalizável

## 🎨 Funcionalidades Implementadas

### 1. **Tela de Login Completa**
- ✅ Formulário de login com email e senha
- ✅ Validação de campos
- ✅ Tratamento de erros
- ✅ Loading state
- ✅ Design moderno e responsivo

### 2. **Personalização**
- ✅ **Upload de Logo da Escola**
  - Suporta PNG, JPG, SVG, GIF
  - Preview antes de salvar
  - Máximo 5MB
  - Exibição na tela de login

- ✅ **Cores Personalizáveis**
  - Cor primária (header e botão)
  - Cor secundária (gradiente)
  - Atualização em tempo real

- ✅ **Textos Personalizáveis**
  - Nome da escola
  - Mensagem de boas-vindas

### 3. **Autenticação**
- ✅ Integração com endpoint `/api/login`
- ✅ Salva token JWT no localStorage
- ✅ Redirecionamento baseado no role:
  - Admin → `/admin`
  - Teacher → `/teacher`
  - Student → `/student`
  - Secretary → `/secretary`
  - Treasury → `/treasury`
  - EducationSecretary → `/education-secretary`

### 4. **Configuração Persistente**
- ✅ Salva no localStorage (frontend)
- ✅ Endpoint para salvar no backend (`/api/admin/login-config`)
- ✅ Carrega automaticamente ao abrir a tela

---

## 📋 Como Usar

### Acessar a Tela de Login
```
URL: /login
```

### Fazer Login
1. Digite seu email
2. Digite sua senha
3. Clique em "Entrar"
4. Será redirecionado para o painel correspondente ao seu role

### Personalizar a Tela
1. Na tela de login, clique em "⚙️ Personalizar Login"
2. **Upload de Logo:**
   - Clique na área de upload
   - Selecione uma imagem (PNG, JPG, SVG ou GIF)
   - Clique em "Fazer Upload"
3. **Personalizar Cores:**
   - Escolha a cor primária
   - Escolha a cor secundária
   - As mudanças são aplicadas automaticamente
4. **Personalizar Textos:**
   - Digite o nome da escola
   - Digite a mensagem de boas-vindas
5. Clique em "Salvar Configuração"

---

## 🔧 Endpoints Criados

### Backend (`apps/backend/src/api.ts`)

1. **GET `/api/admin/login-config`**
   - Retorna a configuração atual da tela de login

2. **POST `/api/admin/login-config`**
   - Salva a configuração (cores, textos)
   - Body: `{ logoUrl, primaryColor, secondaryColor, schoolName, welcomeMessage }`

3. **POST `/api/admin/login-config/logo`**
   - Faz upload da logo
   - Retorna URL da logo salva

---

## 🎯 Estrutura de Dados

```typescript
type LoginConfig = {
  logoUrl?: string;           // URL da logo
  primaryColor?: string;      // Cor primária (hex)
  secondaryColor?: string;    // Cor secundária (hex)
  schoolName?: string;        // Nome da escola
  welcomeMessage?: string;    // Mensagem de boas-vindas
};
```

---

## 📱 Responsividade

- ✅ Mobile: Layout adaptado
- ✅ Tablet: Layout otimizado
- ✅ Desktop: Layout completo

---

## 🔐 Modo Demo

No modo demo (`AUTH_DEMO=true`):
- Qualquer email e senha funcionam
- O role é determinado pelo email:
  - `prof` → Teacher
  - `tesouraria` → Treasury
  - `secretario` → Secretary
  - `educacao` → EducationSecretary
  - Outros → Admin

---

## ✅ Status

- ✅ Tela de login criada
- ✅ Upload de logo funcionando
- ✅ Personalização de cores funcionando
- ✅ Personalização de textos funcionando
- ✅ Autenticação integrada
- ✅ Redirecionamento por role funcionando
- ✅ Configuração persistente

**Tudo implementado e funcionando!** 🚀

