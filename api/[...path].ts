// api/[...path].ts
// Handler para todas as rotas /api/* na Vercel usando serverless-http

import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";

// Importar o app Express com múltiplas tentativas
let app: any = null;
let handler: any = null;

// Função para tentar importar o backend
function importBackend() {
  // Tentativa 1: Backend compilado (produção - Vercel)
  try {
    const backendModule = require("../apps/backend/dist/api");
    app = backendModule.default || backendModule.app || backendModule;
    if (app && typeof app === 'object' && (app.get || app.post || app.use)) {
      console.log("✅ [VERCEL] Backend compilado importado com sucesso");
      return true;
    } else {
      console.warn("⚠️ [VERCEL] Backend importado mas não é um app Express válido");
    }
  } catch (error1: any) {
    console.warn("⚠️ [VERCEL] Tentativa 1 falhou (dist/api.js):", error1.message);
  }
  
  // Tentativa 2: Backend TypeScript (fallback/desenvolvimento)
  try {
    const backendModule = require("../apps/backend/src/api");
    app = backendModule.default || backendModule.app || backendModule;
    if (app && typeof app === 'object' && (app.get || app.post || app.use)) {
      console.log("✅ [VERCEL] Backend TypeScript importado (fallback)");
      return true;
    } else {
      console.warn("⚠️ [VERCEL] Backend TypeScript importado mas não é um app Express válido");
    }
  } catch (error2: any) {
    console.error("❌ [VERCEL] Tentativa 2 falhou (src/api.ts):", error2.message);
  }
  
  console.error("❌ [VERCEL] Nenhuma tentativa de importação funcionou");
  return false;
}

// Tentar importar o backend
if (importBackend() && app) {
  // Criar handler serverless
  handler = serverless(app, {
    binary: ['image/*', 'application/pdf'],
    request: (req: any, event: any, context: any) => {
      // Na Vercel, req.url já vem com o path completo incluindo /api/
      // Garantir que está correto
      if (req.url) {
        // Se não começar com /api/, adicionar
        if (!req.url.startsWith('/api/')) {
          req.url = `/api${req.url === '/' ? '' : req.url}`;
        }
        // Garantir que req.path também está correto
        req.path = req.url.split('?')[0];
      }
      return req;
    },
    response: (res: any) => {
      // Garantir headers CORS
      if (!res.headersSent) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      return res;
    }
  });
  console.log("✅ [VERCEL] Handler serverless criado com sucesso");
} else {
  // Handler de fallback se app não foi importado
  handler = async (req: VercelRequest, res: VercelResponse) => {
    console.error("❌ [VERCEL] Handler de fallback acionado - backend não disponível");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({
      error: "Backend não disponível",
      message: "App Express não foi importado corretamente",
      hint: "Verifique os logs de build na Vercel. O backend deve ser compilado antes do deploy."
    });
  };
}

export default handler;
