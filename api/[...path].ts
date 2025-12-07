// api/[...path].ts
// Handler para todas as rotas /api/* na Vercel usando serverless-http

import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import * as path from "path";

// Importar o app Express com múltiplas tentativas
let app: any = null;
let handler: any = null;

// Função para tentar importar o backend
function importBackend() {
  // Caminhos a tentar, em ordem de preferência
  const pathsToTry = [
    "../apps/backend/dist/api",
    "../apps/backend/src/api",
    path.join(process.cwd(), "apps", "backend", "dist", "api"),
    path.join(process.cwd(), "apps", "backend", "src", "api"),
  ];

  for (let i = 0; i < pathsToTry.length; i++) {
    const modulePath = pathsToTry[i];
    try {
      console.log(`🔍 [VERCEL] Tentativa ${i + 1}/${pathsToTry.length}: Importando de ${modulePath}...`);
      
      // Tentar importar diretamente (require resolve caminhos automaticamente)
      const backendModule = require(modulePath);
      app = backendModule.default || backendModule.app || backendModule;
      
      if (app && typeof app === 'object') {
        // Verificar se é um app Express válido
        if (app.get && app.post && app.use) {
          console.log(`✅ [VERCEL] Backend importado com sucesso!`);
          console.log(`📋 [VERCEL] Caminho: ${modulePath}`);
          
          // Contar rotas registradas para debug
          try {
            const routesCount = app._router?.stack?.length || 0;
            console.log(`📋 [VERCEL] Total de rotas registradas: ${routesCount}`);
          } catch (e) {
            // Ignorar erro ao contar rotas
          }
          
          return true;
        } else {
          console.warn(`⚠️ [VERCEL] Backend importado mas não é um app Express válido`);
          console.warn(`📋 [VERCEL] Tipo: ${typeof app}, Propriedades:`, Object.keys(app || {}).slice(0, 5).join(", "));
          app = null;
        }
      } else {
        console.warn(`⚠️ [VERCEL] Backend importado mas não é um objeto válido`);
        app = null;
      }
    } catch (error: any) {
      if (error.code === 'MODULE_NOT_FOUND') {
        console.log(`   ⚠️ Módulo não encontrado: ${modulePath}`);
      } else {
        console.warn(`   ⚠️ Erro ao importar: ${error.message}`);
      }
      app = null;
      continue;
    }
  }
  
  console.error("❌ [VERCEL] Nenhuma tentativa de importação funcionou");
  console.error("❌ [VERCEL] Verifique se o backend foi compilado corretamente");
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
