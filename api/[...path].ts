// api/[...path].ts
// Handler direto para todas as rotas /api/* na Vercel
// SOLUÇÃO DEFINITIVA: Router direto sem dependências

import type { VercelRequest, VercelResponse } from "@vercel/node";

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
function setJsonHeaders(res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Função para obter o path correto
function getPath(req: VercelRequest): string {
  // Na Vercel com [...path], o path pode vir de várias formas
  let path = "";
  
  // Forma 1: req.query.path (array do catch-all)
  if (req.query.path) {
    const pathArray = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
    path = `/api/${pathArray.join('/')}`;
  }
  // Forma 2: req.url
  else if (req.url) {
    path = req.url;
  }
  // Forma 3: construir do path do catch-all
  else {
    path = "/api/";
  }
  
  // Limpar query string do path
  if (path.includes('?')) {
    path = path.split('?')[0];
  }
  
  // Garantir que começa com /api/
  if (!path.startsWith('/api/')) {
    if (path === '/') {
      path = '/api/';
    } else {
      path = `/api${path}`;
    }
  }
  
  return path;
}

// Exportar handler para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || "GET";
  const path = getPath(req);
  
  console.log(`🚀 [VERCEL] ${method} ${path}`);
  console.log(`🔍 [VERCEL] req.url:`, req.url);
  console.log(`🔍 [VERCEL] req.query:`, JSON.stringify(req.query));
  
  // CORS Preflight
  if (method === "OPTIONS") {
    setJsonHeaders(res);
    return res.status(200).end();
  }
  
  // Health check
  if (path === "/api/health" || path.startsWith("/api/health")) {
    setJsonHeaders(res);
    return res.json({ ok: true, uptime: process.uptime() });
  }
  
  // Test
  if (path === "/api/test" || path.startsWith("/api/test")) {
    setJsonHeaders(res);
    return res.json({ 
      ok: true, 
      authDemo: process.env.AUTH_DEMO || "false",
      message: "API funcionando corretamente",
      timestamp: new Date().toISOString(),
      path
    });
  }
  
  // Login
  if ((path === "/api/login" || path.startsWith("/api/login")) && method === "POST") {
    try {
      setJsonHeaders(res);
      const { email, password } = req.body || {};
      
      if (!email || !password) {
        return res.status(400).json({ 
          error: "validation_error", 
          message: "Email e senha são obrigatórios" 
        });
      }
      
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
      
      const token = `demo-token-${Date.now()}-${role.toLowerCase()}`;
      console.log("✅ Login (DEMO):", emailLower, "role:", role);
      return res.json({ token, role });
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: "internal_server_error", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }
  
  // Statistics
  if ((path === "/api/statistics/overview" || path.startsWith("/api/statistics/overview")) && method === "GET") {
    setJsonHeaders(res);
    console.log("✅ GET /api/statistics/overview");
    return res.json({ 
      systemHealth: 98, 
      activeUsers: 120, 
      connectedSchools: 5, 
      responseTimeMsP95: 120, 
      resourcesUsage: { cpu: 35, memory: 48 }, 
      engagement: { dailyActive: 80, weeklyActive: 220 }, 
      errorsLastHour: 1 
    });
  }
  
  // Admin Users
  if ((path === "/api/admin/users" || path.startsWith("/api/admin/users")) && method === "GET") {
    setJsonHeaders(res);
    console.log("✅ GET /api/admin/users - Retornando", adminUsers.length, "usuários");
    return res.json(adminUsers);
  }
  
  if ((path === "/api/admin/users" || path.startsWith("/api/admin/users")) && method === "POST") {
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
      return res.status(201).json({ 
        id: newUser.id, 
        email: newUser.email, 
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        message: "Usuário criado em modo demo"
      });
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: "Erro ao criar usuário", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }
  
  // Secretary Students
  if ((path === "/api/secretary/students" || path.startsWith("/api/secretary/students")) && method === "GET") {
    setJsonHeaders(res);
    console.log("✅ GET /api/secretary/students - Retornando", secStudents.length, "alunos");
    return res.json(secStudents);
  }
  
  if ((path === "/api/secretary/students" || path.startsWith("/api/secretary/students")) && method === "POST") {
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
      return res.status(201).json(newStudent);
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: "Erro ao criar aluno", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }
  
  // Secretary Classes
  if ((path === "/api/secretary/classes" || path.startsWith("/api/secretary/classes")) && method === "GET") {
    setJsonHeaders(res);
    console.log("✅ GET /api/secretary/classes - Retornando", secClasses.length, "turmas");
    return res.json(secClasses);
  }
  
  if ((path === "/api/secretary/classes" || path.startsWith("/api/secretary/classes")) && method === "POST") {
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
      return res.status(201).json(newClass);
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: "Erro ao criar turma", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }
  
  // Teacher Routes
  if ((path === "/api/teacher/terms" || path.startsWith("/api/teacher/terms")) && method === "GET") {
    setJsonHeaders(res);
    console.log("✅ GET /api/teacher/terms");
    return res.json(demoData.terms);
  }
  
  if ((path === "/api/teacher/classes" || path.startsWith("/api/teacher/classes")) && method === "GET") {
    setJsonHeaders(res);
    const termId = String(req.query.termId || "");
    const classes = demoData.classes.map(c => ({ ...c, termId }));
    console.log("✅ GET /api/teacher/classes");
    return res.json(classes);
  }
  
  if ((path === "/api/teacher/subjects" || path.startsWith("/api/teacher/subjects")) && method === "GET") {
    setJsonHeaders(res);
    const classId = String(req.query.classId || "");
    const list = (demoData.subjectsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/subjects");
    return res.json(list);
  }
  
  if ((path === "/api/teacher/students" || path.startsWith("/api/teacher/students")) && method === "GET") {
    setJsonHeaders(res);
    const classId = String(req.query.classId || "");
    const list = (demoData.studentsByClass as any)[classId] || [];
    console.log("✅ GET /api/teacher/students");
    return res.json(list);
  }
  
  if ((path === "/api/teacher/lessons" || path.startsWith("/api/teacher/lessons")) && method === "GET") {
    setJsonHeaders(res);
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    const filtered = lessons.filter((l: any) => l.classId === classId && l.subjectId === subjectId);
    console.log("✅ GET /api/teacher/lessons");
    return res.json(filtered);
  }
  
  if ((path === "/api/teacher/lessons" || path.startsWith("/api/teacher/lessons")) && method === "POST") {
    try {
      setJsonHeaders(res);
      const { classId, subjectId, title, content, lessonDate } = req.body || {};
      
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
        lessonDate: lessonDate || new Date().toISOString().split('T')[0]
      };
      
      lessons.push(newLesson);
      console.log("✅ POST /api/teacher/lessons - Aula criada:", id);
      return res.status(201).json(newLesson);
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ 
        error: "Erro ao criar aula", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }
  
  if ((path === "/api/teacher/grades/grid" || path.startsWith("/api/teacher/grades/grid")) && method === "GET") {
    setJsonHeaders(res);
    const classId = String(req.query.classId || "");
    const subjectId = String(req.query.subjectId || "");
    const students = (demoData.studentsByClass as any)[classId] || [];
    const grid = students.map((s: any) => {
      const key = `${classId}:${s.id}`;
      const g = grades[key] || { n1: 0, n2: 0, n3: 0, n4: 0 };
      const average = Number((g.n1*0.2 + g.n2*0.3 + g.n3*0.25 + g.n4*0.25).toFixed(2));
      return { studentId: s.id, name: s.name, n1: g.n1, n2: g.n2, n3: g.n3, n4: g.n4, average };
    });
    console.log("✅ GET /api/teacher/grades/grid");
    return res.json(grid);
  }
  
  if ((path === "/api/teacher/grades" || path.startsWith("/api/teacher/grades")) && method === "PUT") {
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
      
      console.log("✅ PUT /api/teacher/grades");
      return res.json({ studentId, classId, subjectId, n1: cleanN1, n2: cleanN2, n3: cleanN3, n4: cleanN4, average });
    } catch (error: any) {
      setJsonHeaders(res);
      return res.status(500).json({ error: "Erro ao atualizar notas", details: String(error) });
    }
  }
  
  // Rota não encontrada
  setJsonHeaders(res);
  console.log(`❌ [VERCEL] Rota não encontrada: ${method} ${path}`);
  return res.status(404).json({ 
    error: "Rota não encontrada", 
    path,
    method,
    query: req.query,
    url: req.url
  });
}
