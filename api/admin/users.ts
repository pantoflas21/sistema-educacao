// api/admin/users.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const adminUsers: any[] = [
  { id: "1", email: "admin@escola.com", role: "Admin", firstName: "Admin", lastName: "Sistema", active: true },
  { id: "2", email: "prof@escola.com", role: "Teacher", firstName: "Professor", lastName: "Teste", active: true },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    console.log("✅ GET /api/admin/users - Retornando", adminUsers.length, "usuários");
    return res.json(adminUsers);
  }

  if (req.method === "POST") {
    try {
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
      console.error("❌ Erro ao criar usuário:", error);
      return res.status(500).json({ 
        error: "Erro ao criar usuário", 
        message: error?.message || "Erro interno do servidor"
      });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}

