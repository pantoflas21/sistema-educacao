// api/login.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
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
    console.error("❌ Erro no login:", error);
    return res.status(500).json({ 
      error: "internal_server_error", 
      message: error?.message || "Erro interno do servidor"
    });
  }
}

