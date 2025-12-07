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
