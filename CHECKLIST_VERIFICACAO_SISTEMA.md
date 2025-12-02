# ✅ CHECKLIST DE VERIFICAÇÃO DO SISTEMA

## 🎯 Endpoints Críticos para Testar

### 1. **Sistema de Saúde**
- [ ] `GET /api/health` - Retorna `{ ok: true, uptime: ... }`
- [ ] `GET /api/test` - Retorna `{ ok: true, authDemo: "...", message: "..." }`

### 2. **Autenticação**
- [ ] `POST /api/login` - Login funciona com timeout de 2s
- [ ] `GET /api/auth/user` - Retorna dados do usuário autenticado

### 3. **Administração**
- [ ] `GET /api/admin/users` - Lista usuários
- [ ] `POST /api/admin/users` - Cria usuário (sem erro 405)
- [ ] `GET /api/admin/schools` - Lista escolas
- [ ] `POST /api/admin/schools` - Cria escola

### 4. **Estatísticas**
- [ ] `GET /api/statistics/overview` - Retorna estatísticas do sistema

### 5. **Secretaria**
- [ ] `GET /api/secretary/students` - Lista alunos
- [ ] `POST /api/secretary/students` - Cria aluno (sem erro 405)
- [ ] `GET /api/secretary/classes` - Lista turmas
- [ ] `POST /api/secretary/classes` - Cria turma (sem erro 405)
- [ ] `GET /api/secretary/subjects` - Lista disciplinas
- [ ] `POST /api/secretary/subjects` - Cria disciplina (sem erro 405)

### 6. **Professor**
- [ ] `GET /api/teacher/terms` - Lista bimestres
- [ ] `GET /api/teacher/classes` - Lista turmas
- [ ] `GET /api/teacher/subjects` - Lista disciplinas
- [ ] `GET /api/teacher/students` - Lista alunos
- [ ] `GET /api/teacher/lessons` - Lista aulas
- [ ] `POST /api/teacher/lessons` - Cria aula (sem erro 405)
- [ ] `POST /api/teacher/attendance` - Registra presença (sem erro 405)
- [ ] `PUT /api/teacher/grades` - Atualiza notas (sem erro 405)

### 7. **Tesouraria**
- [ ] `GET /api/treasury/overview` - Dashboard tesouraria
- [ ] `GET /api/treasury/invoices` - Lista faturas
- [ ] `POST /api/treasury/invoices/generate` - Gera faturas (sem erro 405)

### 8. **Aluno**
- [ ] `GET /api/student/me` - Dados do aluno
- [ ] `GET /api/student/report-card` - Boletim
- [ ] `POST /api/student/chat/send` - Envia mensagem (sem erro 405)

---

## 🔧 Verificações Técnicas

### Backend
- [ ] Todas as rotas POST têm headers CORS configurados
- [ ] Middleware de autenticação não bloqueia requisições em modo demo
- [ ] Handler do Vercel trata OPTIONS corretamente
- [ ] Validação de métodos HTTP no handler Vercel
- [ ] Timeout configurado (não bloqueia indefinidamente)

### Frontend
- [ ] Timeout do login: 2 segundos (não 3s)
- [ ] Fallback local funciona se API não responder
- [ ] Paths corretos: `/api/admin/users`, `/api/statistics/overview`, etc.
- [ ] Tratamento de erro em todas as requisições
- [ ] Loading states implementados

### Deploy Vercel
- [ ] Variável `AUTH_DEMO=true` configurada
- [ ] Variável `JWT_SECRET` configurada (se não usar demo)
- [ ] Build do frontend funcionando
- [ ] Serverless Functions funcionando
- [ ] Logs do Vercel sem erros críticos

---

## 🧪 Testes Funcionais

### Login
- [ ] Login rápido (não demora mais de 2-3 segundos)
- [ ] Fallback local funciona se API não responder
- [ ] Redirecionamento correto baseado no role

### Formulários
- [ ] Cadastro de usuários funciona (sem erro 405)
- [ ] Cadastro de alunos funciona (sem erro 405)
- [ ] Criação de turmas funciona (sem erro 405)
- [ ] Criação de disciplinas funciona (sem erro 405)
- [ ] Lançamento de aulas funciona (sem erro 405)
- [ ] Lançamento de notas funciona (sem erro 405)
- [ ] Registro de presença funciona (sem erro 405)

### Navegação
- [ ] Todas as rotas do frontend carregam corretamente
- [ ] Dados são carregados das APIs
- [ ] Erros são tratados graciosamente
- [ ] Loading states aparecem durante carregamento

---

## 📋 Comandos para Testar Endpoints

### Teste Local (se rodando servidor local)
```bash
# Health check
curl http://localhost:3000/api/health

# Test endpoint
curl http://localhost:3000/api/test

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Statistics
curl http://localhost:3000/api/statistics/overview
```

### Teste Produção (Vercel)
```bash
# Substitua SEU_DOMINIO pelo domínio do Vercel
# Health check
curl https://SEU_DOMINIO.vercel.app/api/health

# Test endpoint
curl https://SEU_DOMINIO.vercel.app/api/test

# Statistics
curl https://SEU_DOMINIO.vercel.app/api/statistics/overview
```

---

## ✅ Status Esperado

### ✅ Funcionando Corretamente
- Login rápido (< 3 segundos)
- Todos os formulários funcionam (sem erro 405)
- CORS configurado corretamente
- Headers corretos em todas as rotas POST
- Timeout de 2s no login
- Fallback local funciona

### ⚠️ Verificar se Configurado
- Variáveis de ambiente no Vercel
- Remote do Git configurado
- Build do frontend funcionando

---

## 🐛 Problemas Comuns e Soluções

### Erro 405 em Formulários
**Causa:** Handler do Vercel não reconhece método POST
**Solução:** ✅ Já corrigido - verificar se deploy foi feito

### Login Lento
**Causa:** Timeout muito alto ou API não responde
**Solução:** ✅ Já corrigido - timeout reduzido para 2s

### CORS Errors
**Causa:** Headers CORS não configurados
**Solução:** ✅ Já corrigido - headers em todas as rotas

### 404 em Rotas
**Causa:** Path incorreto ou rota não existe
**Solução:** Verificar paths no frontend e rotas no backend

---

**Última Atualização:** 2025-01-27  
**Versão:** 1.0.0

