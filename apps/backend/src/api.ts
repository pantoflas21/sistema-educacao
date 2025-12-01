// Arquivo separado com apenas as rotas da API (sem servir arquivos estáticos)
// Este arquivo será usado pelas Serverless Functions da Vercel
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { authMiddleware, requireRole } from "./middleware/auth";
import { signToken } from "./auth/jwt";
import { db } from "./db";
import { classes as classesTable, subjects as subjectsTable, users as usersTable, schools as schoolsTable } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { env } from "./config/env";
import { generalRateLimit, authRateLimit } from "./middleware/rateLimit";
import { sanitizeEmail, sanitizePassword, validate, schemas } from "./utils/validation";

dotenv.config();

const app = express();

// Limite de tamanho do body
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configurado com origens permitidas
app.use(cors({ 
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc) apenas em dev
    if (!origin && env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Verificar se origin está na lista permitida
    if (origin && env.CORS_ORIGIN.includes(origin)) {
      return callback(null, true);
    }
    
    // Em produção, bloquear origens não autorizadas
    if (env.NODE_ENV === 'production') {
      console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
      return callback(new Error('Origem não permitida'), false);
    }
    
    // Em dev, permitir qualquer origem
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rate limiting global
app.use(generalRateLimit);

// Segurança com Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// OPTIONS handler para CORS - DEVE estar ANTES de outras rotas
app.options("*", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

// Auth middleware - permite acesso em modo demo
// Se AUTH_DEMO=true, permite acesso sem token
app.use(authMiddleware);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Endpoint de teste para verificar configuração
app.get("/api/test", (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ 
    ok: true, 
    authDemo: process.env.AUTH_DEMO,
    message: "API funcionando corretamente",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/auth/user", (req: any, res) => {
  const u = req.user || { sub: "guest", role: "Guest" };
  res.json({ id: u.sub || "guest", email: u.email || null, firstName: u.firstName || null, lastName: u.lastName || null, role: u.role || "Guest", schoolId: u.schoolId || null, profileImageUrl: null });
});

app.post("/api/login", authRateLimit, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sanitização e validação
    let cleanEmail: string;
    let cleanPassword: string;
    
    try {
      cleanEmail = sanitizeEmail(email);
      cleanPassword = sanitizePassword(password);
    } catch (error: any) {
      return res.status(400).json({ 
        error: "validation_error", 
        message: error.message || "Dados inválidos" 
      });
    }
    
    if (env.AUTH_DEMO) {
      // Detectar role baseado no email (modo demo)
      let role = "Admin"; // padrão
      const emailLower = cleanEmail.toLowerCase();
      
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
      
      const token = signToken({ sub: cleanEmail || "demo-admin", email: cleanEmail || "admin@example.com", role });
      return res.json({ token, role });
    }
    
    if (!db) return res.status(503).json({ error: "db_unavailable" });
    
    const found = await db.select().from(usersTable).where(eq(usersTable.email, cleanEmail)).limit(1);
    const u: any = found[0];
    
    if (!u || u.active === false) {
      // Sempre retornar mesmo erro para evitar enumeração de usuários
      // Delay artificial para dificultar brute force
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: "invalid_credentials" });
    }
    
    const ok = await bcrypt.compare(cleanPassword, String(u.passwordHash));
    if (!ok) {
      // Delay artificial
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: "invalid_credentials" });
    }
    
    const token = signToken({ sub: u.id, email: u.email, role: u.role, schoolId: u.schoolId });
    res.json({ token, role: u.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "internal_server_error" });
  }
});

app.get("/api/statistics/overview", (req, res) => {
  try {
    const data = { 
      systemHealth: 98, 
      activeUsers: 120, 
      connectedSchools: 5, 
      responseTimeMsP95: 120, 
      resourcesUsage: { cpu: 35, memory: 48 }, 
      engagement: { dailyActive: 80, weeklyActive: 220 }, 
      errorsLastHour: 1 
    };
    console.log("GET /api/statistics/overview - Retornando:", data);
    res.json(data);
  } catch (error) {
    console.error("Erro ao retornar estatísticas:", error);
    res.status(500).json({ error: "Erro ao carregar estatísticas" });
  }
});

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
} as const;

const lessons: any[] = [];
const attendance: Record<string, { studentId: string; status: "P"|"F"|"J"; date: string; classId: string; subjectId: string }[]> = {};
const grades: Record<string, { n1: number; n2: number; n3: number; n4: number }> = {};

app.get("/api/teacher/terms", (req, res) => {
  try {
    // GARANTIR que sempre retorna JSON, nunca HTML
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Log para debug
    console.log("🔍 GET /api/teacher/terms - AUTH_DEMO:", process.env.AUTH_DEMO);
    console.log("🔍 GET /api/teacher/terms - req.user:", (req as any).user);
    
    const terms = demoData.terms;
    console.log("✅ GET /api/teacher/terms - Retornando", terms.length, "bimestres");
    console.log("📋 Dados:", JSON.stringify(terms, null, 2));
    
    // Retornar dados como JSON
    res.status(200).json(terms);
  } catch (error) {
    console.error("❌ Erro ao retornar bimestres:", error);
    // GARANTIR que erro também retorna JSON
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ 
      error: "Erro ao carregar bimestres", 
      details: String(error),
      message: "Erro interno do servidor"
    });
  }
});

app.get("/api/teacher/classes", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    const termId = String(req.query.termId || "");
    const classes = demoData.classes.map(c => ({ ...c, termId }));
    console.log("✅ GET /api/teacher/classes - Retornando", classes.length, "turmas para termId:", termId);
    res.status(200).json(classes);
  } catch (error) {
    console.error("❌ Erro ao retornar turmas:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar turmas", details: String(error) });
  }
});

app.get("/api/teacher/subjects", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    const classId = String(req.query.classId || "");
    const list = (demoData.subjectsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/subjects - Retornando", list.length, "disciplinas para classId:", classId);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar disciplinas:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar disciplinas", details: String(error) });
  }
});

app.get("/api/teacher/students", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const list = (demoData.studentsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/students - Retornando", list.length, "alunos para classId:", classId);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar alunos:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar alunos", details: String(error) });
  }
});

app.get("/api/teacher/lessons", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    const list = lessons.filter(l => l.classId === classId && l.subjectId === subjectId);
    console.log("✅ GET /api/teacher/lessons - Retornando", list.length, "aulas para classId:", classId, "subjectId:", subjectId);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar aulas:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar aulas", details: String(error) });
  }
});

app.post("/api/teacher/lessons", (req, res) => {
  try {
    // Garantir headers JSON e CORS
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    const { classId, subjectId, title, content, lessonDate, startTime, endTime, objectives, methodology, resources } = req.body || {};
    
    // Validação básica
    if (!classId || !subjectId || !title || !lessonDate) {
      return res.status(400).json({ 
        error: "Campos obrigatórios faltando", 
        message: "classId, subjectId, title e lessonDate são obrigatórios",
        received: { classId: !!classId, subjectId: !!subjectId, title: !!title, lessonDate: !!lessonDate }
      });
    }
    
    const id = `lesson-${Date.now()}`;
    const item = { 
      id, 
      classId: String(classId), 
      subjectId: String(subjectId), 
      title: String(title), 
      content: String(content || ""), 
      lessonDate: String(lessonDate),
      startTime: startTime ? String(startTime) : undefined,
      endTime: endTime ? String(endTime) : undefined,
      objectives: objectives ? String(objectives) : undefined,
      methodology: methodology ? String(methodology) : undefined,
      resources: resources ? String(resources) : undefined,
    };
    lessons.push(item);
    console.log("✅ POST /api/teacher/lessons - Aula criada:", item.id);
    res.status(201).json(item);
  } catch (error: any) {
    console.error("❌ Erro ao criar aula:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ 
      error: "Erro ao criar aula", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

app.get("/api/teacher/attendance", (req, res) => {
  try {
    const dateKey = String(req.query.date || "");
    const list = attendance[dateKey] || [];
    console.log("✅ GET /api/teacher/attendance - Retornando", list.length, "presenças para data:", dateKey);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar presenças:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar presenças", details: String(error) });
  }
});

app.post("/api/teacher/attendance", (req, res) => {
  try {
    const { studentId, status, date, classId, subjectId } = req.body;
    
    // Validação
    if (!studentId || !status || !date || !classId || !subjectId) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "Campos obrigatórios: studentId, status, date, classId, subjectId" });
    }
    
    // Validar status
    if (!["P", "F", "J"].includes(String(status))) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "status_invalid" });
    }
    
    // Sanitização
    const key = String(date).trim().slice(0, 10);
    const cleanStudentId = String(studentId).trim();
    const cleanClassId = String(classId).trim();
    const cleanSubjectId = String(subjectId).trim();
    
    attendance[key] = attendance[key] || [];
    const idx = attendance[key].findIndex(m => m.studentId === cleanStudentId && m.classId === cleanClassId && m.subjectId === cleanSubjectId);
    const item = { studentId: cleanStudentId, status: status as "P" | "F" | "J", date: key, classId: cleanClassId, subjectId: cleanSubjectId } as const;
    if (idx >= 0) attendance[key][idx] = item as any; else attendance[key].push(item as any);
    console.log("✅ POST /api/teacher/attendance - Presença registrada:", item);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(201).json(item);
  } catch (error) {
    console.error("❌ Erro ao registrar presença:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "internal_server_error", details: String(error) });
  }
});

app.get("/api/teacher/grades/grid", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    const students = (demoData.studentsByClass as any)[classId] || [];
    const grid = students.map((s: any) => {
      const key = `${classId}:${s.id}`;
      const g = grades[key] || { n1: 0, n2: 0, n3: 0, n4: 0 };
      const average = Number((g.n1*0.2 + g.n2*0.3 + g.n3*0.25 + g.n4*0.25).toFixed(2));
      return { studentId: s.id, name: s.name, n1: g.n1, n2: g.n2, n3: g.n3, n4: g.n4, average };
    });
    console.log("✅ GET /api/teacher/grades/grid - Retornando", grid.length, "notas para classId:", classId, "subjectId:", subjectId);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(grid);
  } catch (error) {
    console.error("❌ Erro ao retornar notas:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar notas", details: String(error) });
  }
});

app.put("/api/teacher/grades", (req, res) => {
  try {
    const { classId, studentId, n1, n2, n3, n4 } = req.body;
    
    // Validação
    if (!classId || !studentId) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "Campos obrigatórios: classId, studentId" });
    }
    
    // Validar e sanitizar notas (0 a 10)
    const validateGrade = (val: any) => {
      const num = Number(val || 0);
      return Math.max(0, Math.min(10, isNaN(num) ? 0 : num));
    };
    
    const key = `${String(classId).trim()}:${String(studentId).trim()}`;
    grades[key] = { 
      n1: validateGrade(n1), 
      n2: validateGrade(n2), 
      n3: validateGrade(n3), 
      n4: validateGrade(n4) 
    };
    const g = grades[key];
    const average = Number((g.n1*0.2 + g.n2*0.3 + g.n3*0.25 + g.n4*0.25).toFixed(2));
    console.log("✅ PUT /api/teacher/grades - Notas atualizadas para:", key, "média:", average);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ ok: true, average });
  } catch (error) {
    console.error("❌ Erro ao atualizar notas:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "internal_server_error", details: String(error) });
  }
});

const tests: { id: string; title: string; subjectId: string; classId: string; content: string; createdAt: string; savedAt?: string }[] = [];
const testTemplates: { id: string; title: string; subjectId: string; content: string }[] = [
  { id: "template-1", title: "Prova de Matemática - Básico", subjectId: "MAT", content: "<h2>Prova de Matemática</h2><p>Nome: _______________</p><p>Data: _______________</p><div class='question-block p-3 md:p-4 my-3 md:my-4 border-l-4 border-blue-500 bg-blue-50 rounded'><div class='font-semibold mb-2 text-sm md:text-base'>Questão 1</div><div class='mb-3 text-sm md:text-base'>Resolva as operações abaixo:</div><div class='space-y-2 ml-2 md:ml-4 text-sm md:text-base'><div>a) 5 + 3 = _____</div><div>b) 10 - 4 = _____</div><div>c) 2 × 6 = _____</div></div></div>" },
  { id: "template-2", title: "Prova de Português - Interpretação", subjectId: "POR", content: "<h2>Prova de Português</h2><p>Nome: _______________</p><p>Data: _______________</p><div class='question-block p-3 md:p-4 my-3 md:my-4 border-l-4 border-green-500 bg-green-50 rounded'><div class='font-semibold mb-2 text-sm md:text-base'>Questão 1 - Interpretação de Texto</div><div class='mb-3 text-sm md:text-base'>Leia o texto abaixo e responda:</div><div class='border-t border-green-300 pt-3 mt-3'><div class='text-xs md:text-sm text-slate-600'>Espaço para resposta:</div><div class='min-h-[80px] md:min-h-[100px] border border-green-300 rounded p-2 bg-white mt-2'></div></div></div>" }
];

app.get("/api/teacher/tests", (req, res) => {
  try {
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    const list = tests.filter(t => t.classId === classId && t.subjectId === subjectId);
    console.log("✅ GET /api/teacher/tests - Retornando", list.length, "provas");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar provas:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar provas", details: String(error) });
  }
});

app.post("/api/teacher/tests", (req, res) => {
  try {
    const { title, classId, subjectId, content } = req.body;
    if (!title || !classId || !subjectId) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "Campos obrigatórios: title, classId, subjectId" });
    }
    const id = `test-${Date.now()}`;
    const test = { id, title: String(title), classId: String(classId), subjectId: String(subjectId), content: String(content || ""), createdAt: new Date().toISOString() };
    tests.push(test);
    console.log("✅ POST /api/teacher/tests - Prova criada:", id);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(201).json(test);
  } catch (error) {
    console.error("❌ Erro ao criar prova:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao criar prova", details: String(error) });
  }
});

app.put("/api/teacher/tests", (req, res) => {
  try {
    const { id, title, content } = req.body;
    if (!id) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(400).json({ error: "Campo obrigatório: id" });
    }
    const idx = tests.findIndex(t => t.id === id);
    if (idx < 0) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(404).json({ error: "not_found" });
    }
    tests[idx] = { ...tests[idx], title: title ? String(title) : tests[idx].title, content: content ? String(content) : tests[idx].content, savedAt: new Date().toISOString() };
    console.log("✅ PUT /api/teacher/tests - Prova atualizada:", id);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(tests[idx]);
  } catch (error) {
    console.error("❌ Erro ao atualizar prova:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao atualizar prova", details: String(error) });
  }
});

app.get("/api/teacher/test-templates", (req, res) => {
  try {
    const subjectId = String(req.query.subjectId || "");
    const list = testTemplates.filter(t => !subjectId || t.subjectId === subjectId);
    console.log("✅ GET /api/teacher/test-templates - Retornando", list.length, "templates");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(list);
  } catch (error) {
    console.error("❌ Erro ao retornar templates:", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao carregar templates", details: String(error) });
  }
});

const pedacoinsLedger: { studentId: string; amount: number; type: "award"|"spend"; description: string; date: string }[] = [
  { studentId: "s1", amount: 10, type: "award", description: "Participação em aula", date: new Date().toISOString() },
  { studentId: "s1", amount: 20, type: "award", description: "Média > 8.0", date: new Date().toISOString() }
];
const assignments: { id: string; classId: string; subjectId: string; title: string; description: string; dueDate: string; status: string }[] = [
  { id: "a1", classId: "c7A", subjectId: "MAT", title: "Lista de exercícios 1", description: "Frações e decimais", dueDate: "2025-03-15", status: "nao_iniciado" },
  { id: "a2", classId: "c7A", subjectId: "POR", title: "Redação", description: "Tema: meio ambiente", dueDate: "2025-03-20", status: "em_andamento" }
];

app.get("/api/student/me", (req, res) => {
  const student = (demoData.studentsByClass as any)["c7A"][0];
  res.json({ id: student.id, name: student.name, matricula: student.matricula, classId: "c7A", photoUrl: null });
});

app.get("/api/student/report-card", (req, res) => {
  const classId = String(req.query.classId || "c7A");
  const studentId = String(req.query.studentId || "s1");
  const subjects = (demoData.subjectsByClass as any)[classId] || [];
  const key = `${classId}:${studentId}`;
  const g = grades[key] || { n1: 0, n2: 0, n3: 0, n4: 0 };
  const average = Number((g.n1*0.2 + g.n2*0.3 + g.n3*0.25 + g.n4*0.25).toFixed(2));
  const status = average >= 7 ? "aprovado" : average >= 5 ? "recuperacao" : "reprovado";
  const rows = subjects.map((s: any) => ({ subjectId: s.id, subjectName: s.name, n1: g.n1, n2: g.n2, n3: g.n3, n4: g.n4, average, status }));
  res.json(rows);
});

app.get("/api/student/attendance/calendar", (req, res) => {
  const month = String(req.query.month || new Date().toISOString().slice(0,7));
  const list = Object.keys(attendance)
    .filter(d => d.startsWith(month))
    .flatMap(d => (attendance[d]||[]))
    .filter(m => m.classId === "c7A" && ["s1"].includes(m.studentId));
  res.json(list);
});

app.get("/api/student/assignments", (req, res) => {
  const classId = String(req.query.classId || "c7A");
  const list = assignments.filter(a => a.classId === classId);
  res.json(list);
});

app.get("/api/student/pedacoins/wallet", (req, res) => {
  const studentId = String(req.query.studentId || "s1");
  const ledger = pedacoinsLedger.filter(l => l.studentId === studentId);
  const balance = ledger.reduce((sum, l) => sum + (l.type === "award" ? l.amount : -l.amount), 0);
  res.json({ balance, ledger });
});

const secStudents: { id: string; name: string; cpf: string; rg?: string; birthDate?: string; classId?: string }[] = [
  { id: "s1", name: "Ana Silva", cpf: "000.000.000-00", classId: "c7A" },
  { id: "s2", name: "Bruno Sousa", cpf: "111.111.111-11", classId: "c7A" }
];
const secClasses: { id: string; name: string; capacity: number; shift: string }[] = [
  { id: "c7A", name: "7º A", capacity: 40, shift: "manha" },
  { id: "c8B", name: "8º B", capacity: 40, shift: "tarde" }
];
const secSubjects: { id: string; code: string; name: string; workload: number }[] = [
  { id: "MAT", code: "MAT", name: "Matemática", workload: 4 },
  { id: "POR", code: "POR", name: "Português", workload: 4 },
  { id: "HIS", code: "HIS", name: "História", workload: 3 }
];
const classSubjects: Record<string, string[]> = { c7A: ["MAT","POR"], c8B: ["HIS"] };
const secEnrollments: { id: string; studentId: string; classId: string; subjectId: string; enrollmentDate: string }[] = [];
let secTerms: { number: number; startDate: string; endDate: string; status: "open"|"locked"|"closed" }[] = [
  { number: 1, startDate: "2025-02-01", endDate: "2025-03-31", status: "open" },
  { number: 2, startDate: "2025-04-01", endDate: "2025-05-31", status: "locked" },
  { number: 3, startDate: "2025-06-01", endDate: "2025-07-31", status: "locked" },
  { number: 4, startDate: "2025-08-01", endDate: "2025-09-30", status: "locked" }
];

app.get("/api/secretary/students", (req, res) => {
  res.json(secStudents);
});

app.post("/api/secretary/students", (req, res) => {
  const { name, cpf, rg, birthDate, classId } = req.body;
  const id = `stu-${Date.now()}`;
  const s = { id, name, cpf, rg, birthDate, classId };
  secStudents.push(s);
  res.status(201).json(s);
});

app.patch("/api/secretary/students/:id", (req, res) => {
  const id = String(req.params.id);
  const idx = secStudents.findIndex(s => s.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  secStudents[idx] = { ...secStudents[idx], ...req.body };
  res.json(secStudents[idx]);
});

app.delete("/api/secretary/students/:id", (req, res) => {
  const id = String(req.params.id);
  const idx = secStudents.findIndex(s => s.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  const [removed] = secStudents.splice(idx, 1);
  res.json(removed);
});

app.get("/api/secretary/classes", (req, res) => {
  if (db) {
    db.select().from(classesTable).then(rows => {
      res.json(rows.map((r: any) => ({ id: r.code, name: r.name, capacity: r.capacity, shift: r.shift })));
    });
    return;
  }
  res.json(secClasses);
});

app.post("/api/secretary/classes", async (req, res) => {
  const { name, capacity, shift, code } = req.body || {};
  const genCode = String(code || (name || "").toString().trim().toUpperCase().replace(/\s+/g, "_"));
  if (db) {
    const inserted = await db.insert(classesTable).values({ code: genCode, name: String(name||genCode), capacity: Number(capacity||0), shift: String(shift||"manha") }).returning();
    const r = inserted[0];
    return res.status(201).json({ id: r.code, name: r.name, capacity: r.capacity, shift: r.shift });
  }
  const id = genCode;
  const c = { id, name: String(name||genCode), capacity: Number(capacity||0), shift: String(shift||"manha") };
  secClasses.push(c);
  res.status(201).json(c);
});

app.patch("/api/secretary/classes/:id", async (req, res) => {
  const id = String(req.params.id);
  if (db) {
    const upd = await db.update(classesTable).set({ name: req.body?.name, capacity: Number(req.body?.capacity||0), shift: req.body?.shift }).where(eq(classesTable.code, id)).returning();
    if (!upd[0]) return res.status(404).json({ error: "not_found" });
    const r = upd[0];
    return res.json({ id: r.code, name: r.name, capacity: r.capacity, shift: r.shift });
  }
  const idx = secClasses.findIndex(c => c.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  secClasses[idx] = { ...secClasses[idx], ...req.body };
  res.json(secClasses[idx]);
});

app.get("/api/secretary/subjects", (req, res) => {
  if (db) {
    db.select().from(subjectsTable).then(rows => {
      res.json(rows.map((r: any) => ({ id: r.code, code: r.code, name: r.name, workload: r.workload })));
    });
    return;
  }
  res.json(secSubjects);
});

app.post("/api/secretary/subjects", async (req, res) => {
  const { code, name, workload } = req.body || {};
  const finalCode = String(code || (name || "").toString().trim().toUpperCase().slice(0,8).replace(/\s+/g, "_"));
  if (db) {
    const inserted = await db.insert(subjectsTable).values({ code: finalCode, name: String(name||finalCode), workload: Number(workload||0) }).returning();
    const r = inserted[0];
    return res.status(201).json({ id: r.code, code: r.code, name: r.name, workload: r.workload });
  }
  const s = { id: finalCode, code: finalCode, name: String(name||finalCode), workload: Number(workload||0) };
  secSubjects.push(s);
  res.status(201).json(s);
});

app.patch("/api/secretary/subjects/:id", async (req, res) => {
  const id = String(req.params.id);
  if (db) {
    const upd = await db.update(subjectsTable).set({ name: req.body?.name, workload: Number(req.body?.workload||0) }).where(eq(subjectsTable.code, id)).returning();
    if (!upd[0]) return res.status(404).json({ error: "not_found" });
    const r = upd[0];
    return res.json({ id: r.code, code: r.code, name: r.name, workload: r.workload });
  }
  const idx = secSubjects.findIndex(s => s.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  secSubjects[idx] = { ...secSubjects[idx], ...req.body };
  res.json(secSubjects[idx]);
});

app.post("/api/admin/users", requireRole("Admin"), validate(schemas.createUser), async (req, res) => {
  try {
    // Garantir headers JSON e CORS ANTES de tudo
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    console.log("🔍 POST /api/admin/users - AUTH_DEMO:", env.AUTH_DEMO);
    console.log("🔍 POST /api/admin/users - req.user:", (req as any).user);
    
    const { email, password, role, firstName, lastName, schoolId } = req.body;
    
    // Sanitização adicional
    let cleanEmail: string;
    let cleanPassword: string;
    
    try {
      cleanEmail = sanitizeEmail(email);
      cleanPassword = sanitizePassword(password);
    } catch (error: any) {
      return res.status(400).json({ 
        error: "validation_error", 
        message: error.message || "Dados inválidos"
      });
    }
    
    // Em modo demo, simular criação de usuário sem banco
    if (env.AUTH_DEMO || !db) {
      console.log("✅ MODO DEMO: Criando usuário simulado:", cleanEmail);
      const demoUser = {
        id: `demo-${Date.now()}`,
        email: cleanEmail,
        role: String(role),
        firstName: firstName || null,
        lastName: lastName || null,
        schoolId: schoolId || null,
        active: true,
        createdAt: new Date().toISOString()
      };
      return res.status(201).json({ 
        id: demoUser.id, 
        email: demoUser.email, 
        role: demoUser.role,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        message: "Usuário criado em modo demo"
      });
    }
    
    // Modo produção com banco de dados
    const hash = await bcrypt.hash(cleanPassword, 10);
    const inserted = await db.insert(usersTable).values({ 
      email: cleanEmail, 
      passwordHash: hash, 
      role: String(role), 
      firstName, 
      lastName, 
      schoolId, 
      active: true 
    }).returning();
    const u = inserted[0];
    res.status(201).json({ id: u.id, email: u.email, role: u.role });
  } catch (error: any) {
    console.error("❌ Erro ao criar usuário:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ 
      error: "Erro ao criar usuário", 
      message: error?.message || "Erro interno do servidor"
    });
  }
});

app.get("/api/secretary/class-subjects", (req, res) => {
  const classId = String(req.query.classId || "");
  res.json((classSubjects as any)[classId] || []);
});

app.post("/api/secretary/class-subjects", (req, res) => {
  const { classId, subjectId } = req.body;
  classSubjects[classId] = classSubjects[classId] || [];
  if (!classSubjects[classId].includes(subjectId)) classSubjects[classId].push(subjectId);
  res.status(201).json({ classId, subjects: classSubjects[classId] });
});

app.post("/api/secretary/enrollments", (req, res) => {
  const { studentId, classId, enrollmentDate } = req.body;
  const subjects = classSubjects[classId] || [];
  const created: any[] = [];
  subjects.forEach(sub => {
    const id = `enr-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const e = { id, studentId, classId, subjectId: sub, enrollmentDate: enrollmentDate || new Date().toISOString().slice(0,10) };
    secEnrollments.push(e);
    created.push(e);
  });
  res.status(201).json(created);
});

app.get("/api/secretary/enrollments", (req, res) => {
  const { classId, studentId } = req.query as any;
  const list = secEnrollments.filter(e => (!classId || e.classId === classId) && (!studentId || e.studentId === studentId));
  res.json(list);
});

app.get("/api/secretary/calendar/terms", (req, res) => {
  res.json(secTerms);
});

app.put("/api/secretary/calendar/terms", (req, res) => {
  const terms = req.body?.terms || [];
  if (!Array.isArray(terms) || terms.length !== 4) return res.status(400).json({ error: "invalid_terms" });
  secTerms = terms.map((t: any, i: number) => ({ number: t.number || (i+1), startDate: t.startDate, endDate: t.endDate, status: t.status || "locked" }));
  res.json(secTerms);
});

app.post("/api/secretary/documents/generate", (req, res) => {
  const { type, studentId } = req.body;
  const code = `DOC-${Date.now()}`;
  const url = `/public/${code}.pdf`;
  res.status(201).json({ id: code, type, studentId, fileUrl: url, verificationCode: code });
});

const tuitionPlans: { id: string; classId?: string; serie?: string; valorMensal: number; dueDay: number; multaPercent: number; jurosDiaPercent: number; descontoAntecipadoPercent: number }[] = [
  { id: "plan-c7A", classId: "c7A", valorMensal: 350, dueDay: 10, multaPercent: 2, jurosDiaPercent: 0.1, descontoAntecipadoPercent: 5 }
];
const invoices: { id: string; studentId: string; classId: string; period: string; dueDate: string; valorBase: number; descontosValor: number; multaValor: number; jurosValor: number; extrasValor: number; total: number; status: "pending"|"issued"|"paid"|"overdue"|"canceled"; boleto?: { linhaDigitavel: string; codigoBarras: string } }[] = [];
const cashEntries: { id: string; date: string; categoria: "receita"|"despesa"; subcategoria: string; valor: number; origem: string }[] = [];

app.get("/api/treasury/tuition-plans", (req, res) => {
  res.json(tuitionPlans);
});

app.post("/api/treasury/tuition-plans", (req, res) => {
  const { classId, valorMensal, dueDay, multaPercent, jurosDiaPercent, descontoAntecipadoPercent } = req.body;
  const id = `plan-${Date.now()}`;
  const plan = { id, classId, valorMensal: Number(valorMensal||0), dueDay: Number(dueDay||10), multaPercent: Number(multaPercent||0), jurosDiaPercent: Number(jurosDiaPercent||0), descontoAntecipadoPercent: Number(descontoAntecipadoPercent||0) };
  tuitionPlans.push(plan);
  res.status(201).json(plan);
});

app.get("/api/treasury/invoices", (req, res) => {
  const { status, period } = req.query as any;
  const list = invoices.filter(i => (!status || i.status === status) && (!period || i.period === period));
  res.json(list);
});

app.post("/api/treasury/invoices/generate", requireRole("Treasury"), (req, res) => {
  const period = String(req.query.period || new Date().toISOString().slice(0,7));
  const created: any[] = [];
  secStudents.forEach(s => {
    const plan = tuitionPlans.find(p => p.classId === s.classId) || tuitionPlans[0];
    const dueDate = `${period}-${String(plan.dueDay).padStart(2,'0')}`;
    const valorBase = plan.valorMensal;
    const multaValor = 0;
    const jurosValor = 0;
    const descontosValor = 0;
    const extrasValor = 0;
    const total = valorBase - descontosValor + extrasValor + multaValor + jurosValor;
    const id = `inv-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const inv = { id, studentId: s.id, classId: s.classId || "", period, dueDate, valorBase, descontosValor, multaValor, jurosValor, extrasValor, total, status: "pending" as const };
    invoices.push(inv);
    created.push(inv);
  });
  res.status(201).json(created);
});

app.post("/api/treasury/invoices/:id/issue-boleto", requireRole("Treasury"), (req, res) => {
  const id = String(req.params.id);
  const idx = invoices.findIndex(i => i.id === id);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  const linhaDigitavel = `34190.00000 12345.678901 23456.789012 3 12345678901234`;
  const codigoBarras = `34191234567890123456789012345678901234567890`;
  invoices[idx].boleto = { linhaDigitavel, codigoBarras };
  invoices[idx].status = "issued";
  res.json(invoices[idx]);
});

app.post("/api/treasury/payments/webhook", (req, res) => {
  const { invoiceId, valorPago } = req.body;
  const idx = invoices.findIndex(i => i.id === invoiceId);
  if (idx < 0) return res.status(404).json({ error: "not_found" });
  invoices[idx].status = "paid";
  cashEntries.push({ id: `cash-${Date.now()}`, date: new Date().toISOString().slice(0,10), categoria: "receita", subcategoria: "mensalidade", valor: Number(valorPago||invoices[idx].total), origem: "mensalidade" });
  res.json({ ok: true });
});

app.get("/api/treasury/cash/overview", (req, res) => {
  const receita = cashEntries.filter(c => c.categoria === "receita").reduce((s,c) => s+c.valor, 0);
  const despesa = cashEntries.filter(c => c.categoria === "despesa").reduce((s,c) => s+c.valor, 0);
  res.json({ receita, despesa, saldo: receita - despesa, entries: cashEntries });
});

app.post("/api/treasury/cash/entries", (req, res) => {
  const { categoria, subcategoria, valor, origem } = req.body;
  const e = { id: `cash-${Date.now()}`, date: new Date().toISOString().slice(0,10), categoria, subcategoria, valor: Number(valor||0), origem: origem||"outro" };
  cashEntries.push(e);
  res.status(201).json(e);
});

app.get("/api/treasury/overview", (req, res) => {
  const totalInvoices = invoices.length;
  const overdue = invoices.filter(i => i.status === "overdue").length;
  const paid = invoices.filter(i => i.status === "paid").length;
  const receita = cashEntries.filter(c => c.categoria === "receita").reduce((s,c) => s+c.valor, 0);
  res.json({ totalInvoices, overdue, paid, receita });
});

// Envio de cobranças por WhatsApp
app.post("/api/treasury/invoices/:id/send-whatsapp", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const id = String(req.params.id);
    const { phoneNumber, message } = req.body || {};
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return res.status(404).json({ error: "Fatura não encontrada" });
    
    // Simular envio por WhatsApp (em produção, integrar com API do WhatsApp Business)
    const whatsappMessage = message || `Olá! Você tem uma fatura pendente no valor de R$ ${invoice.total.toFixed(2)}. Vencimento: ${invoice.dueDate}. Para pagar, acesse: [link]`;
    
    console.log("📱 Enviando cobrança por WhatsApp:", {
      invoiceId: id,
      phone: phoneNumber,
      message: whatsappMessage
    });
    
    // Em produção, aqui seria a integração real com WhatsApp Business API
    res.json({ 
      success: true, 
      message: "Cobrança enviada por WhatsApp com sucesso",
      sentTo: phoneNumber,
      invoiceId: id
    });
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao enviar WhatsApp", message: error?.message });
  }
});

app.post("/api/treasury/invoices/bulk-send-whatsapp", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { invoiceIds, customMessage } = req.body || {};
    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return res.status(400).json({ error: "Lista de faturas é obrigatória" });
    }
    
    const sent: string[] = [];
    invoiceIds.forEach((id: string) => {
      const invoice = invoices.find(i => i.id === id);
      if (invoice) {
        console.log("📱 Enviando cobrança em lote:", id);
        sent.push(id);
      }
    });
    
    res.json({ 
      success: true, 
      message: `${sent.length} cobrança(s) enviada(s) por WhatsApp`,
      sent: sent.length,
      total: invoiceIds.length
    });
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao enviar WhatsApp em lote", message: error?.message });
  }
});

app.get("/api/education-secretary/dashboard", (req, res) => {
  const totalEscolas = 49;
  const totalAlunos = secStudents.length;
  const totalProfessores = 12;
  const mediaGeral = 7.6;
  const taxaAprovacao = 0.82;
  const indiceFrequencia = 0.91;
  const evasaoPercent = 0.03;
  const idebScore = 5.2;
  res.json({ totalEscolas, totalAlunos, totalProfessores, mediaGeral, taxaAprovacao, indiceFrequencia, evasaoPercent, idebScore });
});

type Escola = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  capacidade?: number;
  ocupacao?: number;
  status?: "operacional"|"pendente";
  infraNeeds?: number;
  solicitacoesPendentes?: number;
  staff: { diretor?: string; professores?: number; vigilantes?: number; servicosGerais?: number; agentesAdm?: number };
};

const eduSchools: Escola[] = [
  { id: "escola-a", name: "Escola Municipal A", city: "Cidade", state: "UF", capacidade: 400, ocupacao: 320, status: "operacional", infraNeeds: 1, solicitacoesPendentes: 0, staff: { diretor: "Maria", professores: 20, vigilantes: 2, servicosGerais: 4, agentesAdm: 3 } }
];

app.get("/api/education-secretary/schools", async (_req, res) => {
  if (db) {
    const rows: any[] = await db.select().from(schoolsTable);
    const merged = rows.map(r => {
      const mem = eduSchools.find(e => e.id === String(r.id)) || null;
      return { id: String(r.id), name: r.name, city: r.city, state: r.state, capacidade: mem?.capacidade || 0, ocupacao: mem?.ocupacao || 0, status: mem?.status || "operacional", infraNeeds: mem?.infraNeeds || 0, solicitacoesPendentes: mem?.solicitacoesPendentes || 0, staff: mem?.staff || { professores: 0, vigilantes: 0, servicosGerais: 0, agentesAdm: 0 } };
    });
    return res.json(merged.length ? merged : eduSchools);
  }
  res.json(eduSchools);
});

app.post("/api/education-secretary/schools", async (req, res) => {
  const { name, city, state, diretor, professores, vigilantes, servicosGerais, agentesAdm, capacidade } = req.body || {};
  if (!name) return res.status(400).json({ error: "missing_name" });
  let id = `school-${Date.now()}`;
  if (db) {
    try {
      const inserted = await db.insert(schoolsTable).values({ name: String(name), city: city ? String(city) : null as any, state: state ? String(state) : null as any }).returning();
      const r = inserted[0];
      id = String(r.id);
    } catch {}
  }
  const escola: Escola = {
    id,
    name: String(name),
    city: city ? String(city) : undefined,
    state: state ? String(state) : undefined,
    capacidade: Number(capacidade || 0),
    ocupacao: 0,
    status: "operacional",
    infraNeeds: 0,
    solicitacoesPendentes: 0,
    staff: { diretor: diretor ? String(diretor) : undefined, professores: Number(professores||0), vigilantes: Number(vigilantes||0), servicosGerais: Number(servicosGerais||0), agentesAdm: Number(agentesAdm||0) }
  };
  eduSchools.push(escola);
  res.status(201).json(escola);
});

app.get("/api/education-secretary/reports/ranking", (req, res) => {
  const year = String(req.query.year || new Date().getFullYear());
  const ranking = [
    { school: "Escola A", aprovacao: 0.88, frequencia: 0.93 },
    { school: "Escola B", aprovacao: 0.81, frequencia: 0.9 },
    { school: "Escola C", aprovacao: 0.76, frequencia: 0.88 }
  ];
  res.json({ year, ranking });
});

// Stubs para rotas que não existem no backend ainda
// Chat com suporte a arquivos (PDF, Word, etc)
type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: Array<{ url: string; name: string; type: string; size: number }>;
};

const chatMessages: ChatMessage[] = [];
const chatConversations: Array<{ id: string; name: string; type: string; participants: string[] }> = [];

app.get("/api/student/chat/conversations", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(chatConversations);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar conversas", message: error?.message });
  }
});

app.get("/api/student/chat/messages", (req, res) => {
  try {
    const conversationId = String(req.query.conversationId || "");
    const filtered = conversationId ? chatMessages.filter(m => m.conversationId === conversationId) : [];
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(filtered);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar mensagens", message: error?.message });
  }
});

app.post("/api/student/chat/send", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    // Em produção, usar multer ou similar para upload de arquivos
    const { conversationId, senderId, senderName, content, attachments } = req.body || {};
    
    if (!conversationId || !senderId || !content) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: String(conversationId),
      senderId: String(senderId),
      senderName: String(senderName || "Usuário"),
      content: String(content),
      timestamp: new Date().toISOString(),
      attachments: attachments || []
    };
    
    chatMessages.push(message);
    console.log("💬 Mensagem enviada:", message.id, "Anexos:", attachments?.length || 0);
    
    res.status(201).json(message);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao enviar mensagem", message: error?.message });
  }
});

// Upload de arquivos para chat (PDF, Word, etc)
app.post("/api/student/chat/upload", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    // Em produção, usar multer para processar multipart/form-data
    // Por enquanto, simular upload
    const { fileName, fileType, fileSize } = req.body || {};
    
    if (!fileName) {
      return res.status(400).json({ error: "Nome do arquivo é obrigatório" });
    }
    
    // Validar tipos permitidos
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];
    if (fileType && !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: "Tipo de arquivo não permitido. Use PDF, Word, PNG ou JPEG" });
    }
    
    // Simular URL do arquivo (em produção, salvar no storage e retornar URL real)
    const fileUrl = `/uploads/chat/${Date.now()}-${fileName}`;
    
    res.status(201).json({
      url: fileUrl,
      name: fileName,
      type: fileType || "application/octet-stream",
      size: fileSize || 0
    });
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao fazer upload", message: error?.message });
  }
});
app.get("/api/student/terms", (req, res) => res.json(demoData.terms));
app.get("/api/student/attendance/summary", (req, res) => res.json({ totalPresences: 0, totalAbsences: 0, totalJustified: 0, frequencyPercent: 0 }));
app.get("/api/student/justifications", (req, res) => res.json([]));
app.post("/api/student/justifications", (req, res) => res.status(201).json({ id: `just-${Date.now()}`, ...req.body }));
app.get("/api/student/pedacoins/rewards", (req, res) => res.json([]));
app.post("/api/student/pedacoins/purchase", (req, res) => res.json({ ok: true }));
app.post("/api/student/assignments/submit", (req, res) => res.json({ ok: true }));
app.get("/api/education-secretary/goals", (req, res) => res.json([]));
app.post("/api/education-secretary/goals", (req, res) => res.status(201).json({ id: `goal-${Date.now()}`, ...req.body }));
app.get("/api/education-secretary/projects", (req, res) => res.json([]));
app.post("/api/education-secretary/projects", (req, res) => res.status(201).json({ id: `project-${Date.now()}`, ...req.body }));
app.get("/api/education-secretary/resource-requests", (req, res) => res.json([]));
app.post("/api/education-secretary/transfer-teacher", (req, res) => res.json({ ok: true }));
app.post("/api/education-secretary/reallocate-student", (req, res) => res.json({ ok: true }));
app.post("/api/education-secretary/resource-requests/:id/approve", (req, res) => res.json({ ok: true }));
app.get("/api/education-secretary/reports/mec", (req, res) => res.json({}));

// Sistema de Planos de Aula - SECRETÁRIO DA ESCOLA (não Secretário de Educação)
type LessonPlan = {
  id: string;
  teacherId: string;
  teacherName: string;
  schoolId: string;
  schoolName: string;
  category: "educacao-infantil" | "fundamental-1" | "fundamental-2" | "ensino-medio";
  subject: string;
  classId: string;
  className: string;
  title: string;
  content: string;
  objectives: string;
  methodology: string;
  resources: string;
  evaluation: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "revision";
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
};

const lessonPlans: LessonPlan[] = [];

// Endpoints para SECRETÁRIO DA ESCOLA (não Secretário de Educação)
app.get("/api/secretary/lesson-plans", (req, res) => {
  try {
    const { category, status } = req.query as any;
    let filtered = lessonPlans;
    if (category) filtered = filtered.filter(p => p.category === category);
    if (status) filtered = filtered.filter(p => p.status === status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(filtered);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar planos", message: error?.message });
  }
});

app.post("/api/secretary/lesson-plans", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { teacherId, teacherName, schoolId, schoolName, category, subject, classId, className, title, content, objectives, methodology, resources, evaluation } = req.body || {};
    if (!teacherId || !category || !title) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }
    const plan: LessonPlan = {
      id: `plan-${Date.now()}`,
      teacherId: String(teacherId),
      teacherName: String(teacherName || "Professor"),
      schoolId: String(schoolId || ""),
      schoolName: String(schoolName || ""),
      category: category as LessonPlan["category"],
      subject: String(subject || ""),
      classId: String(classId || ""),
      className: String(className || ""),
      title: String(title),
      content: String(content || ""),
      objectives: String(objectives || ""),
      methodology: String(methodology || ""),
      resources: String(resources || ""),
      evaluation: String(evaluation || ""),
      submittedAt: new Date().toISOString(),
      status: "pending"
    };
    lessonPlans.push(plan);
    console.log("✅ Plano de aula recebido pelo Secretário da Escola:", plan.id, plan.category);
    res.status(201).json(plan);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao criar plano", message: error?.message });
  }
});

app.put("/api/secretary/lesson-plans/:id/review", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const id = String(req.params.id);
    const { status, feedback, reviewedBy } = req.body || {};
    const idx = lessonPlans.findIndex(p => p.id === id);
    if (idx < 0) return res.status(404).json({ error: "Plano não encontrado" });
    lessonPlans[idx].status = status || "pending";
    lessonPlans[idx].feedback = feedback;
    lessonPlans[idx].reviewedBy = reviewedBy;
    lessonPlans[idx].reviewedAt = new Date().toISOString();
    console.log("✅ Plano de aula avaliado pelo Secretário da Escola:", id, status);
    res.json(lessonPlans[idx]);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao avaliar plano", message: error?.message });
  }
});

app.get("/api/secretary/lesson-plans/stats", (req, res) => {
  try {
    const stats = {
      total: lessonPlans.length,
      pending: lessonPlans.filter(p => p.status === "pending").length,
      approved: lessonPlans.filter(p => p.status === "approved").length,
      rejected: lessonPlans.filter(p => p.status === "rejected").length,
      byCategory: {
        "educacao-infantil": lessonPlans.filter(p => p.category === "educacao-infantil").length,
        "fundamental-1": lessonPlans.filter(p => p.category === "fundamental-1").length,
        "fundamental-2": lessonPlans.filter(p => p.category === "fundamental-2").length,
        "ensino-medio": lessonPlans.filter(p => p.category === "ensino-medio").length
      }
    };
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(stats);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar estatísticas", message: error?.message });
  }
});
// Admin - UMA escola apenas (não múltiplas)
let adminSchool: { id: string; name: string; logoUrl?: string; maxStudents: number; currentStudents: number; evaluationType: "notas" | "conceitos"; active: boolean } | null = null;

app.get("/api/admin/schools", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Retornar array com uma escola apenas (ou vazio se não configurada)
    res.json(adminSchool ? [adminSchool] : []);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar escola", message: error?.message });
  }
});

app.post("/api/admin/schools", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { name, logoUrl, maxStudents, evaluationType } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: "Nome da escola é obrigatório" });
    }
    
    // Sempre substituir a escola (uma escola apenas)
    adminSchool = {
      id: `school-${Date.now()}`,
      name: String(name),
      logoUrl: logoUrl || undefined,
      maxStudents: Number(maxStudents || 1000),
      currentStudents: 0,
      evaluationType: evaluationType === "conceitos" ? "conceitos" : "notas",
      active: true
    };
    
    console.log("✅ Escola configurada (Admin):", adminSchool.id);
    res.status(201).json(adminSchool);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao criar escola", message: error?.message });
  }
});

app.put("/api/admin/schools/:id", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (!adminSchool) {
      return res.status(404).json({ error: "Escola não encontrada" });
    }
    
    const { name, logoUrl, maxStudents, evaluationType, active } = req.body || {};
    adminSchool = {
      ...adminSchool,
      ...(name && { name: String(name) }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(maxStudents !== undefined && { maxStudents: Number(maxStudents) }),
      ...(evaluationType && { evaluationType: evaluationType === "conceitos" ? "conceitos" : "notas" }),
      ...(active !== undefined && { active: Boolean(active) })
    };
    
    res.json(adminSchool);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao atualizar escola", message: error?.message });
  }
});

app.get("/api/admin/users/:id", (req, res) => res.status(404).json({ error: "not_found" }));
app.delete("/api/admin/users/:id", (req, res) => res.json({ ok: true }));
app.put("/api/admin/users/:id/status", (req, res) => res.json({ ok: true }));
app.post("/api/admin/users/:id/reset-password", (req, res) => res.json({ ok: true }));

// Configuração da tela de login (personalização)
let loginConfig: {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  schoolName?: string;
  welcomeMessage?: string;
} = {};

app.get("/api/admin/login-config", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(loginConfig);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao buscar configuração", message: error?.message });
  }
});

app.post("/api/admin/login-config", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    const { logoUrl, primaryColor, secondaryColor, schoolName, welcomeMessage } = req.body || {};
    loginConfig = {
      logoUrl: logoUrl || loginConfig.logoUrl,
      primaryColor: primaryColor || loginConfig.primaryColor || "#4f46e5",
      secondaryColor: secondaryColor || loginConfig.secondaryColor || "#6366f1",
      schoolName: schoolName || loginConfig.schoolName || "Aletheia",
      welcomeMessage: welcomeMessage || loginConfig.welcomeMessage || "Bem-vindo ao Sistema de Gestão Educacional"
    };
    console.log("✅ Configuração de login salva:", loginConfig);
    res.json(loginConfig);
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao salvar configuração", message: error?.message });
  }
});

// Upload de logo para login
app.post("/api/admin/login-config/logo", (req, res) => {
  try {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    // Em produção, usar multer para processar multipart/form-data
    // Por enquanto, simular upload e retornar URL
    const { fileName, fileType, fileSize } = req.body || {};
    
    // Validar tipo de arquivo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/gif"];
    if (fileType && !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: "Tipo de arquivo não permitido. Use PNG, JPG, SVG ou GIF" });
    }
    
    // Validar tamanho (máx 5MB)
    if (fileSize && fileSize > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Arquivo muito grande. Máximo 5MB" });
    }
    
    // Simular URL do arquivo (em produção, salvar no storage e retornar URL real)
    const fileUrl = `/uploads/login/logo-${Date.now()}.${fileType?.split('/')[1] || 'png'}`;
    loginConfig.logoUrl = fileUrl;
    
    console.log("✅ Logo do login atualizado:", fileUrl);
    
    res.status(201).json({
      url: fileUrl,
      message: "Logo enviado com sucesso"
    });
  } catch (error: any) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({ error: "Erro ao fazer upload", message: error?.message });
  }
});
app.get("/api/treasury/reports/dre", (req, res) => res.json({}));
app.get("/api/treasury/reports/balancete", (req, res) => res.json({}));
app.get("/api/treasury/reports/cashflow", (req, res) => res.json({}));
app.get("/api/treasury/reports/export", (req, res) => res.json({ url: "/export.pdf" }));
app.post("/api/treasury/invoices/:id/notify", (req, res) => res.json({ ok: true }));
app.get("/api/treasury/students-payments", (req, res) => res.json([]));
app.post("/api/treasury/students/:id/discount", (req, res) => res.json({ ok: true }));
app.get("/api/secretary/communication/announcements", (req, res) => res.json([]));
app.post("/api/secretary/communication/announcements", (req, res) => res.status(201).json({ id: `ann-${Date.now()}`, ...req.body }));
app.post("/api/secretary/communication/announcements/:id/send", (req, res) => res.json({ ok: true }));
app.get("/api/secretary/communication/meetings", (req, res) => res.json([]));
app.post("/api/secretary/communication/meetings", (req, res) => res.status(201).json({ id: `meet-${Date.now()}`, ...req.body }));
app.get("/api/secretary/documents/templates", (req, res) => res.json([]));
app.get("/api/secretary/calendar/holidays", (req, res) => res.json([]));
app.post("/api/secretary/calendar/holidays", (req, res) => res.status(201).json({ id: `holiday-${Date.now()}`, ...req.body }));
app.get("/api/secretary/calendar/schedules", (req, res) => res.json([]));
app.get("/api/secretary/teachers", (req, res) => res.json([]));
app.patch("/api/secretary/classes/:id/subjects", (req, res) => res.json({ ok: true }));

// Handler de erro global - garante que sempre retorna JSON
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ Erro não tratado:", err);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(500).json({ 
    error: "Erro interno do servidor", 
    details: String(err),
    message: "Ocorreu um erro inesperado"
  });
});

// Handler para rotas não encontradas - sempre retorna JSON
app.use((req: any, res: any) => {
  console.error("❌ Rota não encontrada:", req.method, req.path);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(404).json({ 
    error: "Rota não encontrada", 
    path: req.path,
    method: req.method
  });
});

export default app;


