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
    console.log("🔍 [VERCEL] Tentando importar backend compilado de dist/api.js...");
    const backendModule = require("../apps/backend/dist/api");
    app = backendModule.default || backendModule.app || backendModule;
    
    if (app && typeof app === 'object') {
      // Verificar se é um app Express válido
      if (app.get && app.post && app.use) {
        console.log("✅ [VERCEL] Backend compilado importado com sucesso");
        console.log("📋 [VERCEL] Rotas disponíveis:", Object.keys(app._router?.stack || {}).length || "N/A");
        return true;
      } else {
        console.warn("⚠️ [VERCEL] Backend importado mas métodos Express não encontrados");
        console.warn("📋 [VERCEL] Propriedades encontradas:", Object.keys(app || {}).join(", "));
      }
    } else {
      console.warn("⚠️ [VERCEL] Backend importado mas não é um objeto válido");
    }
  } catch (error1: any) {
    console.warn("⚠️ [VERCEL] Tentativa 1 falhou (dist/api.js):", error1.message);
    if (error1.stack) {
      console.warn("📋 [VERCEL] Stack trace:", error1.stack);
    }
  }
  
  // Tentativa 2: Backend TypeScript (fallback/desenvolvimento)
  try {
    console.log("🔍 [VERCEL] Tentando importar backend TypeScript de src/api.ts...");
    const backendModule = require("../apps/backend/src/api");
    app = backendModule.default || backendModule.app || backendModule;
    
    if (app && typeof app === 'object') {
      if (app.get && app.post && app.use) {
        console.log("✅ [VERCEL] Backend TypeScript importado (fallback)");
        console.log("📋 [VERCEL] Rotas disponíveis:", Object.keys(app._router?.stack || {}).length || "N/A");
        return true;
      } else {
        console.warn("⚠️ [VERCEL] Backend TypeScript importado mas métodos Express não encontrados");
        console.warn("📋 [VERCEL] Propriedades encontradas:", Object.keys(app || {}).join(", "));
      }
    } else {
      console.warn("⚠️ [VERCEL] Backend TypeScript importado mas não é um objeto válido");
    }
  } catch (error2: any) {
    console.error("❌ [VERCEL] Tentativa 2 falhou (src/api.ts):", error2.message);
    if (error2.stack) {
      console.error("📋 [VERCEL] Stack trace:", error2.stack);
    }
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
      // Log da requisição para debug
      console.log(`📥 [VERCEL] Recebida requisição: ${req.method} ${req.url}`);
      
      // Na Vercel, req.url já vem com o path completo incluindo /api/
      // Garantir que está correto
      if (req.url) {
        // Se não começar com /api/, adicionar
        if (!req.url.startsWith('/api/')) {
          const oldUrl = req.url;
          req.url = `/api${req.url === '/' ? '' : req.url}`;
          console.log(`🔄 [VERCEL] URL ajustada: ${oldUrl} -> ${req.url}`);
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
    console.error(`❌ [VERCEL] Handler de fallback acionado - ${req.method} ${req.url}`);
    console.error("❌ [VERCEL] Backend não disponível");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(500).json({
      error: "Backend não disponível",
      message: "App Express não foi importado corretamente",
      hint: "Verifique os logs de build na Vercel. O backend deve ser compilado antes do deploy.",
      path: req.url,
      method: req.method
    });
  };
}

// Exportar handler para Vercel
export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🚀 [VERCEL] Processando: ${req.method} ${req.url || req.path}`);
    
    if (!handler) {
      console.error("❌ [VERCEL] Handler não foi inicializado");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.status(500).json({
        error: "Handler não inicializado",
        message: "O handler do servidor não foi inicializado corretamente",
        path: req.url || req.path,
        method: req.method
      });
    }
    
    return await handler(req, res);
  } catch (error: any) {
    console.error(`❌ [VERCEL] Erro ao processar requisição ${req.method} ${req.url || req.path}:`, error);
    if (error?.stack) {
      console.error("📋 [VERCEL] Stack trace:", error.stack);
    }
    
    // Garantir que os headers estão definidos antes de enviar resposta
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(500).json({
        error: "Erro ao processar requisição",
        message: error?.message || "Erro interno",
        path: req.url || req.path,
        method: req.method
      });
    }
  }
}
