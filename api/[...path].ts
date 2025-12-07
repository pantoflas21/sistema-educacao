// api/[...path].ts
// Handler para todas as rotas /api/* na Vercel
// SOLUÇÃO DEFINITIVA: Rotas inline para garantir funcionamento

import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import express from "express";
import cors from "cors";

// Criar app Express diretamente no handler
const app = express();

// Middleware básico
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Handler CORS para OPTIONS
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

// Dados demo (em memória)
const secStudents: { id: string; name: string; cpf: string; rg?: string; birthDate?: string; classId?: string }[] = [
  { id: "s1", name: "Ana Silva", cpf: "000.000.000-00", classId: "c7A" },
  { id: "s2", name: "Bruno Sousa", cpf: "111.111.111-11", classId: "c7A" }
];

const secClasses: { id: string; name: string; capacity: number; shift: string }[] = [
  { id: "c7A", name: "7º A", capacity: 40, shift: "manha" },
  { id: "c8B", name: "8º B", capacity: 40, shift: "tarde" }
];

const demoData = {
  terms: [
    { id: "term1", number: 1, status: "active", startDate: "2025-02-01", endDate: "2025-03-31" },
    { id: "term2", number: 2, status: "locked", startDate: "2025-04-01", endDate: "2025-05-31" },
    { id: "term3", number: 3, status: "locked", startDate: "2025-06-01", endDate: "2025-07-31" },
    { id: "term4", number: 4, status: "locked", startDate: "2025-08-01", endDate: "2025-09-30" }
  ],
  classes: [
    { id: "c7A", name: "7º A", studentsCount: 5 },
    { id: "c8B", name: "8º B", studentsCount: 5 }
  ],
  subjectsByClass: {
    c7A: [ { id: "MAT", code: "MAT", name: "Matemática" }, { id: "POR", code: "POR", name: "Português" } ],
    c8B: [ { id: "HIS", code: "HIS", name: "História" }, { id: "GEO", code: "GEO", name: "Geografia" } ]
  },
  studentsByClass: {
    c7A: [
      { id: "s1", name: "Ana Silva", matricula: "2025-0001" },
      { id: "s2", name: "Bruno Sousa", matricula: "2025-0002" },
      { id: "s3", name: "Carla Lima", matricula: "2025-0003" },
      { id: "s4", name: "Diego Alves", matricula: "2025-0004" },
      { id: "s5", name: "Ellen Rocha", matricula: "2025-0005" }
    ],
    c8B: [
      { id: "s6", name: "Fabio Nunes", matricula: "2025-0006" },
      { id: "s7", name: "Gabriela Reis", matricula: "2025-0007" },
      { id: "s8", name: "Hugo Dias", matricula: "2025-0008" },
      { id: "s9", name: "Iara Campos", matricula: "2025-0009" },
      { id: "s10", name: "João Melo", matricula: "2025-0010" }
    ]
  }
};

const lessons: any[] = [];
const grades: Record<string, { n1: number; n2: number; n3: number; n4: number }> = {};
const adminUsers: any[] = [
  { id: "1", email: "admin@escola.com", role: "Admin", firstName: "Admin", lastName: "Sistema", active: true },
  { id: "2", email: "prof@escola.com", role: "Teacher", firstName: "Professor", lastName: "Teste", active: true },
];

// Helper para headers JSON
const setJsonHeaders = (res: VercelResponse) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

// Health check
app.get("/api/health", (req, res) => {
  setJsonHeaders(res);
  res.json({ ok: true, uptime: process.uptime() });
});

// Endpoint de teste
app.get("/api/test", (req, res) => {
  setJsonHeaders(res);
  res.json({ 
    ok: true, 
    authDemo: process.env.AUTH_DEMO || "false",
    message: "API funcionando corretamente",
    timestamp: new Date().toISOString()
  });
});

// Login simplificado (modo demo)
app.post("/api/login", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: "validation_error", 
        message: "Email e senha são obrigatórios" 
      });
    }
    
    // Modo demo - sempre permitir login
    const emailLower = String(email || "").toLowerCase();
    let role = "Admin";
    
    if (emailLower.includes("tesouraria")) {
      role = "Treasury";
    } else if (emailLower.includes("prof") || emailLower.includes("professor")) {
      role = "Teacher";
    } else if (emailLower.includes("secretario") || emailLower.includes("secretaria")) {
      role = "Secretary";
    } else if (emailLower.includes("educacao") || emailLower.includes("educação")) {
      role = "EducationSecretary";
    } else if (emailLower.includes("aluno") || emailLower.includes("student")) {
      role = "Student";
    }
    
    // Token simples para demo (em produção, use JWT real)
    const token = `demo-token-${Date.now()}-${role.toLowerCase()}`;
    
    console.log("✅ Login (DEMO):", emailLower, "role:", role);
    
    return res.json({ token, role });
  } catch (error: any) {
    console.error("❌ Erro no login:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "internal_server_error", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/secretary/students
app.get("/api/secretary/students", (req, res) => {
  try {
    console.log("🔍 GET /api/secretary/students");
    setJsonHeaders(res);
    console.log("✅ GET /api/secretary/students - Retornando", secStudents.length, "alunos");
    res.status(200).json(secStudents);
  } catch (error: any) {
    console.error("❌ Erro ao listar alunos:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao listar alunos", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/secretary/classes
app.get("/api/secretary/classes", (req, res) => {
  try {
    console.log("🔍 GET /api/secretary/classes");
    setJsonHeaders(res);
    console.log("✅ GET /api/secretary/classes - Retornando", secClasses.length, "turmas");
    res.status(200).json(secClasses);
  } catch (error: any) {
    console.error("❌ Erro ao listar turmas:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao listar turmas", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// POST /api/secretary/students
app.post("/api/secretary/students", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { name, cpf, rg, birthDate, classId, matricula } = req.body || {};
    
    if (!name || !cpf) {
      return res.status(400).json({ 
        error: "validation_error",
        message: "Nome e CPF são obrigatórios"
      });
    }
    
    const id = `stu-${Date.now()}`;
    const newStudent = { 
      id, 
      name: String(name), 
      cpf: String(cpf), 
      rg: rg ? String(rg) : undefined, 
      birthDate: birthDate ? String(birthDate) : undefined, 
      classId: classId ? String(classId) : undefined,
      matricula: matricula || undefined
    };
    
    secStudents.push(newStudent);
    
    console.log("✅ POST /api/secretary/students - Aluno criado:", id);
    res.status(201).json(newStudent);
  } catch (error: any) {
    console.error("❌ Erro ao criar aluno:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao criar aluno", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// POST /api/secretary/classes
app.post("/api/secretary/classes", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { name, capacity, shift, code } = req.body || {};
    
    if (!name) {
      return res.status(400).json({ 
        error: "validation_error",
        message: "Nome é obrigatório"
      });
    }
    
    const id = code || `c${Date.now()}`;
    const newClass = { 
      id,
      name: String(name),
      capacity: capacity ? Number(capacity) : 40,
      shift: shift || "manha"
    };
    
    secClasses.push(newClass);
    
    console.log("✅ POST /api/secretary/classes - Turma criada:", id);
    res.status(201).json(newClass);
  } catch (error: any) {
    console.error("❌ Erro ao criar turma:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao criar turma", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/statistics/overview
app.get("/api/statistics/overview", (req, res) => {
  try {
    setJsonHeaders(res);
    const data = { 
      systemHealth: 98, 
      activeUsers: 120, 
      connectedSchools: 5, 
      responseTimeMsP95: 120, 
      resourcesUsage: { cpu: 35, memory: 48 }, 
      engagement: { dailyActive: 80, weeklyActive: 220 }, 
      errorsLastHour: 1 
    };
    console.log("✅ GET /api/statistics/overview");
    res.status(200).json(data);
  } catch (error: any) {
    console.error("❌ Erro ao retornar estatísticas:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao carregar estatísticas", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/admin/users
app.get("/api/admin/users", (req, res) => {
  try {
    console.log("🔍 GET /api/admin/users");
    setJsonHeaders(res);
    console.log("✅ GET /api/admin/users - Retornando", adminUsers.length, "usuários");
    res.status(200).json(adminUsers);
  } catch (error: any) {
    console.error("❌ Erro ao listar usuários:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao listar usuários", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// POST /api/admin/users
app.post("/api/admin/users", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { email, password, role, firstName, lastName } = req.body || {};
    
    if (!email || !password || !role) {
      return res.status(400).json({ 
        error: "validation_error",
        message: "Email, senha e role são obrigatórios"
      });
    }
    
    const id = `demo-${Date.now()}`;
    const newUser = {
      id,
      email: String(email),
      role: String(role),
      firstName: firstName || null,
      lastName: lastName || null,
      active: true,
      createdAt: new Date().toISOString()
    };
    
    adminUsers.push(newUser);
    
    console.log("✅ POST /api/admin/users - Usuário criado:", id);
    res.status(201).json({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      message: "Usuário criado em modo demo"
    });
  } catch (error: any) {
    console.error("❌ Erro ao criar usuário:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao criar usuário", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/teacher/terms
app.get("/api/teacher/terms", (req, res) => {
  try {
    console.log("🔍 GET /api/teacher/terms");
    setJsonHeaders(res);
    console.log("✅ GET /api/teacher/terms - Retornando", demoData.terms.length, "bimestres");
    res.status(200).json(demoData.terms);
  } catch (error: any) {
    console.error("❌ Erro ao retornar bimestres:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar bimestres", details: String(error) });
  }
});

// GET /api/teacher/classes
app.get("/api/teacher/classes", (req, res) => {
  try {
    const termId = String(req.query.termId || "");
    console.log("🔍 GET /api/teacher/classes?termId=" + termId);
    setJsonHeaders(res);
    const classes = demoData.classes.map(c => ({ ...c, termId }));
    console.log("✅ GET /api/teacher/classes - Retornando", classes.length, "turmas");
    res.status(200).json(classes);
  } catch (error: any) {
    console.error("❌ Erro ao retornar turmas:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar turmas", details: String(error) });
  }
});

// GET /api/teacher/subjects
app.get("/api/teacher/subjects", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    console.log("🔍 GET /api/teacher/subjects?classId=" + classId);
    setJsonHeaders(res);
    const list = (demoData.subjectsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/subjects - Retornando", list.length, "disciplinas");
    res.status(200).json(list);
  } catch (error: any) {
    console.error("❌ Erro ao retornar disciplinas:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar disciplinas", details: String(error) });
  }
});

// GET /api/teacher/students
app.get("/api/teacher/students", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    console.log("🔍 GET /api/teacher/students?classId=" + classId);
    setJsonHeaders(res);
    const list = (demoData.studentsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/students - Retornando", list.length, "alunos");
    res.status(200).json(list);
  } catch (error: any) {
    console.error("❌ Erro ao retornar alunos:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar alunos", details: String(error) });
  }
});

// GET /api/teacher/lessons
app.get("/api/teacher/lessons", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    console.log("🔍 GET /api/teacher/lessons?classId=" + classId + "&subjectId=" + subjectId);
    setJsonHeaders(res);
    const filtered = lessons.filter((l: any) => l.classId === classId && l.subjectId === subjectId);
    console.log("✅ GET /api/teacher/lessons - Retornando", filtered.length, "aulas");
    res.status(200).json(filtered);
  } catch (error: any) {
    console.error("❌ Erro ao retornar aulas:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar aulas", details: String(error) });
  }
});

// POST /api/teacher/lessons
app.post("/api/teacher/lessons", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { classId, subjectId, title, content, lessonDate, startTime, endTime, objectives, methodology, resources } = req.body || {};
    
    if (!classId || !subjectId || !title) {
      return res.status(400).json({ 
        error: "validation_error",
        message: "classId, subjectId e title são obrigatórios"
      });
    }
    
    const id = `lesson-${Date.now()}`;
    const newLesson = { 
      id, 
      classId: String(classId), 
      subjectId: String(subjectId), 
      title: String(title), 
      content: content || "", 
      lessonDate: lessonDate ? String(lessonDate) : new Date().toISOString().split('T')[0],
      startTime: startTime ? String(startTime) : undefined,
      endTime: endTime ? String(endTime) : undefined,
      objectives: objectives ? String(objectives) : undefined,
      methodology: methodology ? String(methodology) : undefined,
      resources: resources ? String(resources) : undefined,
    };
    
    lessons.push(newLesson);
    
    console.log("✅ POST /api/teacher/lessons - Aula criada:", id);
    res.status(201).json(newLesson);
  } catch (error: any) {
    console.error("❌ Erro ao criar aula:", error);
    setJsonHeaders(res);
    res.status(500).json({ 
      error: "Erro ao criar aula", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

// GET /api/teacher/grades/grid
app.get("/api/teacher/grades/grid", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    console.log("🔍 GET /api/teacher/grades/grid?classId=" + classId + "&subjectId=" + subjectId);
    setJsonHeaders(res);
    
    const students = (demoData.studentsByClass as any)[classId] || [];
    const grid = students.map((s: any) => {
      const key = `${classId}:${s.id}`;
      const g = grades[key] || { n1: 0, n2: 0, n3: 0, n4: 0 };
      const average = Number((g.n1*0.2 + g.n2*0.3 + g.n3*0.25 + g.n4*0.25).toFixed(2));
      return { studentId: s.id, name: s.name, n1: g.n1, n2: g.n2, n3: g.n3, n4: g.n4, average };
    });
    
    console.log("✅ GET /api/teacher/grades/grid - Retornando", grid.length, "notas");
    res.status(200).json(grid);
  } catch (error: any) {
    console.error("❌ Erro ao retornar notas:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao carregar notas", details: String(error) });
  }
});

// PUT /api/teacher/grades
app.put("/api/teacher/grades", async (req, res) => {
  try {
    setJsonHeaders(res);
    
    const { classId, studentId, n1, n2, n3, n4, subjectId } = req.body;
    
    if (!classId || !studentId) {
      return res.status(400).json({ error: "Campos obrigatórios: classId, studentId" });
    }
    
    const validateGrade = (val: any) => {
      const num = Number(val || 0);
      return Math.max(0, Math.min(10, isNaN(num) ? 0 : num));
    };
    
    const cleanN1 = validateGrade(n1);
    const cleanN2 = validateGrade(n2);
    const cleanN3 = validateGrade(n3);
    const cleanN4 = validateGrade(n4);
    const average = Number((cleanN1*0.2 + cleanN2*0.3 + cleanN3*0.25 + cleanN4*0.25).toFixed(2));
    
    const key = `${classId}:${studentId}`;
    grades[key] = { n1: cleanN1, n2: cleanN2, n3: cleanN3, n4: cleanN4 };
    
    console.log("✅ PUT /api/teacher/grades - Notas atualizadas, média:", average);
    res.status(200).json({ 
      studentId, 
      classId, 
      subjectId, 
      n1: cleanN1, 
      n2: cleanN2, 
      n3: cleanN3, 
      n4: cleanN4, 
      average 
    });
  } catch (error: any) {
    console.error("❌ Erro ao atualizar notas:", error);
    setJsonHeaders(res);
    res.status(500).json({ error: "Erro ao atualizar notas", details: String(error) });
  }
});

// Handler para rotas não encontradas
app.use("*", (req, res) => {
  setJsonHeaders(res);
  res.status(404).json({ 
    error: "Rota não encontrada", 
    path: req.path || req.url,
    method: req.method
  });
});

// Criar handler serverless
const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});

// Exportar handler para Vercel
export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🚀 [VERCEL] ${req.method} ${req.url || req.path}`);
    return await handler(req, res);
  } catch (error: any) {
    console.error(`❌ [VERCEL] Erro:`, error);
    setJsonHeaders(res);
    res.status(500).json({
      error: "Erro ao processar requisição",
      message: error?.message || "Erro interno",
      path: req.url || req.path,
      method: req.method
    });
  }
}
