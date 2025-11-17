// Serverless Function para Vercel - captura todas as rotas /api/*
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express do backend (arquivo api.ts sem servir arquivos estáticos)
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Garantir headers JSON antes de processar
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    // Handler para OPTIONS (CORS preflight)
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
    // Garantir que o app Express seja chamado corretamente
    return app(req as any, res as any);
  } catch (error: any) {
    // Garantir que erros também retornam JSON
    console.error("❌ Erro no handler do Vercel:", error);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: error?.message || "Erro ao processar requisição",
      path: req.url
    });
  }
}


