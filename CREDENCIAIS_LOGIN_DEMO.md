# 🔑 Credenciais de Login - Modo Demo

## 📋 Como Acessar Cada Painel

No **modo demo** (`AUTH_DEMO=true`), o sistema detecta automaticamente o perfil do usuário baseado no **email** usado no login.

### 👨‍💼 **Administrador**
- **Email:** `admin@escola.com` (ou qualquer email que não contenha as palavras-chave abaixo)
- **Senha:** Qualquer valor
- **Painel:** `/admin`
- **Acesso:** Dashboard administrativo completo

### 👨‍🏫 **Professor**
- **Email:** `prof@escola.com` ou `professor@escola.com` (deve conter "prof" ou "professor")
- **Senha:** Qualquer valor
- **Painel:** `/teacher`
- **Acesso:** Gestão de turmas, disciplinas, notas, frequência, provas

### 📋 **Secretário**
- **Email:** `secretario@escola.com` ou `secretaria@escola.com` (deve conter "secretario" ou "secretaria")
- **Senha:** Qualquer valor
- **Painel:** `/secretary`
- **Acesso:** Cadastro de alunos, turmas, disciplinas, matrículas, calendário

### 💰 **Tesouraria**
- **Email:** `tesouraria@escola.com` (deve conter "tesouraria")
- **Senha:** Qualquer valor
- **Painel:** `/treasury`
- **Acesso:** Planos de mensalidade, faturas, boletos, fluxo de caixa

### 🏛️ **Secretaria de Educação**
- **Email:** `educacao@escola.com` ou `educação@escola.com` (deve conter "educacao" ou "educação")
- **Senha:** Qualquer valor
- **Painel:** `/education-secretary`
- **Acesso:** Gestão municipal de escolas, relatórios, planejamento

### 👨‍🎓 **Aluno**
- **Email:** `aluno@escola.com` ou `student@escola.com` (deve conter "aluno" ou "student")
- **Senha:** Qualquer valor
- **Painel:** `/student`
- **Acesso:** Boletim, frequência, atividades, PedaCoins, chat

---

## 🎯 Exemplos de Emails para Teste

```
admin@escola.com          → Admin
prof@escola.com           → Professor
professor@escola.com      → Professor
secretario@escola.com     → Secretário
secretaria@escola.com     → Secretário
tesouraria@escola.com     → Tesouraria
educacao@escola.com       → Secretaria de Educação
aluno@escola.com          → Aluno
student@escola.com        → Aluno
```

---

## ⚠️ Importante

- **Senha:** No modo demo, qualquer senha funciona (não é validada)
- **Email:** O sistema detecta o perfil pela **palavra-chave no email**
- **Case-insensitive:** Não importa maiúsculas/minúsculas
- **Modo Demo:** Configure `AUTH_DEMO=true` no Vercel

---

## 🔧 Configuração no Vercel

Para ativar o modo demo, configure a variável de ambiente:

```
AUTH_DEMO=true
```

---

**Última atualização:** 2025-01-27




