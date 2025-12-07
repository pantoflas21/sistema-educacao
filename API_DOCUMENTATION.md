# 📚 Documentação da API - Sistema Aletheia

**Base URL:** `/api`  
**Autenticação:** Bearer Token (JWT)

---

## 🔐 Autenticação

### POST /api/login
Autentica um usuário e retorna um token JWT.

**Request:**
```json
{
  "email": "admin@escola.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "Admin"
}
```

**Erros:**
- `400` - Dados inválidos
- `401` - Credenciais inválidas

---

## 📊 Estatísticas

### GET /api/statistics/overview
Retorna estatísticas gerais do sistema.

**Response (200):**
```json
{
  "systemHealth": 98,
  "activeUsers": 120,
  "connectedSchools": 5,
  "responseTimeMsP95": 120,
  "resourcesUsage": {
    "cpu": 35,
    "memory": 48
  },
  "engagement": {
    "dailyActive": 80,
    "weeklyActive": 220
  },
  "errorsLastHour": 1
}
```

---

## 👨‍💼 Administração

### GET /api/admin/users
Lista todos os usuários do sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "1",
    "email": "admin@escola.com",
    "role": "Admin",
    "firstName": "Admin",
    "lastName": "Sistema",
    "active": true
  }
]
```

### POST /api/admin/users
Cria um novo usuário.

**Request:**
```json
{
  "email": "novo@escola.com",
  "password": "senha123",
  "role": "Teacher",
  "firstName": "João",
  "lastName": "Silva"
}
```

**Response (201):**
```json
{
  "id": "2",
  "email": "novo@escola.com",
  "role": "Teacher",
  "firstName": "João",
  "lastName": "Silva"
}
```

### POST /api/admin/schools
Cria ou atualiza a escola (apenas uma escola por instância).

**Request:**
```json
{
  "name": "Escola Municipal",
  "city": "São Paulo",
  "state": "SP"
}
```

---

## 👨‍🏫 Professor

### GET /api/teacher/terms
Lista os bimestres do ano letivo.

**Response (200):**
```json
[
  {
    "id": "term1",
    "number": 1,
    "status": "active",
    "startDate": "2025-02-01",
    "endDate": "2025-03-31"
  }
]
```

### GET /api/teacher/classes
Lista as turmas de um bimestre.

**Query Parameters:**
- `termId` (obrigatório) - ID do bimestre

**Response (200):**
```json
[
  {
    "id": "c7A",
    "name": "7º A",
    "studentsCount": 5,
    "termId": "term1"
  }
]
```

### GET /api/teacher/subjects
Lista as disciplinas de uma turma.

**Query Parameters:**
- `classId` (obrigatório) - ID da turma

**Response (200):**
```json
[
  {
    "id": "MAT",
    "code": "MAT",
    "name": "Matemática"
  }
]
```

### GET /api/teacher/students
Lista os alunos de uma turma.

**Query Parameters:**
- `classId` (obrigatório) - ID da turma

**Response (200):**
```json
[
  {
    "id": "s1",
    "name": "Ana Silva",
    "matricula": "2025-0001"
  }
]
```

### GET /api/teacher/lessons
Lista as aulas de uma turma e disciplina.

**Query Parameters:**
- `classId` (obrigatório) - ID da turma
- `subjectId` (obrigatório) - ID da disciplina

**Response (200):**
```json
[
  {
    "id": "1",
    "classId": "c7A",
    "subjectId": "MAT",
    "title": "Introdução à Álgebra",
    "content": "Conteúdo da aula...",
    "lessonDate": "2025-02-15",
    "startTime": "08:00",
    "endTime": "09:00"
  }
]
```

### POST /api/teacher/lessons
Cria uma nova aula.

**Request:**
```json
{
  "classId": "c7A",
  "subjectId": "MAT",
  "title": "Introdução à Álgebra",
  "content": "Conteúdo da aula...",
  "lessonDate": "2025-02-15",
  "startTime": "08:00",
  "endTime": "09:00",
  "objectives": "Objetivos da aula...",
  "methodology": "Metodologia...",
  "resources": "Recursos utilizados..."
}
```

**Response (201):**
```json
{
  "id": "1",
  "classId": "c7A",
  "subjectId": "MAT",
  "title": "Introdução à Álgebra",
  ...
}
```

### GET /api/teacher/attendance
Lista as presenças de uma data.

**Query Parameters:**
- `date` (obrigatório) - Data no formato YYYY-MM-DD
- `classId` (opcional) - ID da turma
- `subjectId` (opcional) - ID da disciplina

**Response (200):**
```json
[
  {
    "studentId": "s1",
    "status": "P",
    "date": "2025-02-15",
    "classId": "c7A",
    "subjectId": "MAT"
  }
]
```

### POST /api/teacher/attendance
Registra ou atualiza a presença de um aluno.

**Request:**
```json
{
  "studentId": "s1",
  "classId": "c7A",
  "subjectId": "MAT",
  "date": "2025-02-15",
  "status": "P"
}
```

**Status possíveis:** `P` (Presente), `F` (Falta), `J` (Justificado)

**Response (201):**
```json
{
  "studentId": "s1",
  "status": "P",
  "date": "2025-02-15",
  "classId": "c7A",
  "subjectId": "MAT"
}
```

### GET /api/teacher/grades/grid
Lista as notas de uma turma e disciplina.

**Query Parameters:**
- `classId` (obrigatório) - ID da turma
- `subjectId` (obrigatório) - ID da disciplina

**Response (200):**
```json
[
  {
    "studentId": "s1",
    "name": "Ana Silva",
    "n1": 8.5,
    "n2": 7.0,
    "n3": 9.0,
    "n4": 8.0,
    "average": 8.1
  }
]
```

### PUT /api/teacher/grades
Atualiza as notas de um aluno.

**Request:**
```json
{
  "classId": "c7A",
  "studentId": "s1",
  "subjectId": "MAT",
  "termId": "term1",
  "n1": 8.5,
  "n2": 7.0,
  "n3": 9.0,
  "n4": 8.0
}
```

**Response (200):**
```json
{
  "n1": 8.5,
  "n2": 7.0,
  "n3": 9.0,
  "n4": 8.0,
  "average": 8.1
}
```

---

## 📋 Secretaria

### GET /api/secretary/students
Lista todos os alunos.

**Response (200):**
```json
[
  {
    "id": "s1",
    "name": "Ana Silva",
    "cpf": "123.456.789-00",
    "classId": "c7A"
  }
]
```

### POST /api/secretary/students
Cria um novo aluno.

**Request:**
```json
{
  "name": "João Silva",
  "cpf": "123.456.789-00",
  "birthDate": "2010-05-15",
  "classId": "c7A"
}
```

### GET /api/secretary/classes
Lista todas as turmas.

**Response (200):**
```json
[
  {
    "id": "c7A",
    "name": "7º A",
    "capacity": 40,
    "shift": "manha"
  }
]
```

### POST /api/secretary/classes
Cria uma nova turma.

**Request:**
```json
{
  "code": "7A",
  "name": "7º A",
  "capacity": 40,
  "shift": "manha"
}
```

### GET /api/secretary/lesson-plans
Lista os planos de aula recebidos.

**Query Parameters:**
- `category` (opcional) - Filtro por categoria
- `status` (opcional) - Filtro por status (pending, approved, rejected)

**Response (200):**
```json
[
  {
    "id": "plan-123",
    "teacherId": "t1",
    "teacherName": "Prof. João",
    "category": "fundamental-1",
    "title": "Plano de Aula de Matemática",
    "status": "pending",
    "submittedAt": "2025-01-27T10:00:00Z"
  }
]
```

### POST /api/secretary/lesson-plans
Recebe um plano de aula do professor.

**Request:**
```json
{
  "teacherId": "t1",
  "teacherName": "Prof. João",
  "category": "fundamental-1",
  "subject": "Matemática",
  "classId": "c7A",
  "title": "Plano de Aula de Matemática",
  "content": "Conteúdo do plano...",
  "objectives": "Objetivos...",
  "methodology": "Metodologia...",
  "resources": "Recursos..."
}
```

### PUT /api/secretary/lesson-plans/:id/review
Avalia um plano de aula.

**Request:**
```json
{
  "status": "approved",
  "feedback": "Plano aprovado com sucesso!"
}
```

**Status possíveis:** `approved`, `rejected`, `revision`

---

## 💰 Tesouraria

### GET /api/treasury/overview
Retorna visão geral financeira.

**Response (200):**
```json
{
  "totalInvoices": 150,
  "overdue": 12,
  "paid": 120,
  "receita": 45000,
  "inadimplencia": 8.0
}
```

### GET /api/treasury/invoices
Lista as faturas.

**Query Parameters:**
- `period` (opcional) - Período no formato YYYY-MM
- `status` (opcional) - Filtro por status

**Response (200):**
```json
[
  {
    "id": "inv-123",
    "studentId": "s1",
    "period": "2025-02",
    "dueDate": "2025-02-10",
    "total": 500,
    "status": "pending"
  }
]
```

### POST /api/treasury/invoices/generate
Gera faturas para todos os alunos.

**Query Parameters:**
- `period` (opcional) - Período no formato YYYY-MM

**Response (201):**
```json
[
  {
    "id": "inv-123",
    "studentId": "s1",
    "total": 500,
    "status": "pending"
  }
]
```

---

## 👨‍🎓 Aluno

### GET /api/student/me
Retorna dados do aluno autenticado.

**Response (200):**
```json
{
  "id": "s1",
  "name": "Ana Silva",
  "matricula": "2025-0001",
  "classId": "c7A",
  "photoUrl": null
}
```

### GET /api/student/report-card
Retorna o boletim do aluno.

**Query Parameters:**
- `classId` (obrigatório) - ID da turma
- `studentId` (obrigatório) - ID do aluno

**Response (200):**
```json
[
  {
    "subjectId": "MAT",
    "subjectName": "Matemática",
    "n1": 8.5,
    "n2": 7.0,
    "n3": 9.0,
    "n4": 8.0,
    "average": 8.1,
    "status": "Aprovado"
  }
]
```

### GET /api/student/attendance/summary
Retorna resumo de frequência.

**Query Parameters:**
- `studentId` (obrigatório) - ID do aluno

**Response (200):**
```json
{
  "totalPresences": 45,
  "totalAbsences": 5,
  "totalJustified": 2,
  "frequencyPercent": 90.0
}
```

---

## 🏛️ Secretaria de Educação

### GET /api/education-secretary/overview
Retorna estatísticas municipais.

**Response (200):**
```json
{
  "totalEscolas": 60,
  "totalAlunos": 12000,
  "totalProfessores": 800,
  "mediaGeral": 7.2,
  "taxaAprovacao": 0.85,
  "indiceFrequencia": 0.92
}
```

### GET /api/education-secretary/schools
Lista todas as escolas da rede.

**Response (200):**
```json
[
  {
    "id": "school-1",
    "name": "Escola Municipal A",
    "city": "São Paulo",
    "status": "operacional",
    "capacidade": 500,
    "ocupacao": 450
  }
]
```

---

## ⚠️ Códigos de Erro

- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `405` - Method Not Allowed (método HTTP não permitido)
- `500` - Internal Server Error (erro interno)

---

## 🔒 Segurança

- Todos os endpoints (exceto `/api/login`) requerem autenticação via Bearer Token
- Tokens expiram em 7 dias (configurável via `JWT_EXPIRES_IN`)
- Validação de entrada com Zod em todos os endpoints POST/PUT/PATCH
- Rate limiting implementado para prevenir abuso
- CORS configurado com origens específicas

---

## 📝 Notas

- Todas as datas devem estar no formato `YYYY-MM-DD`
- Todos os valores monetários são em centavos (inteiros)
- Notas são de 0 a 10 (números decimais)
- Status de presença: `P` (Presente), `F` (Falta), `J` (Justificado)

---

**Última Atualização:** 2025-01-27

