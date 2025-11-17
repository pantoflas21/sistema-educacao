// Serverless Function para Vercel - captura todas as rotas /api/*
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express do backend (arquivo api.ts sem servir arquivos estáticos)
import app from "../apps/backend/src/api";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Garantir que o app Express seja chamado corretamente
  return app(req as any, res as any);
}


