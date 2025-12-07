// api/[...path].ts
// Handler para todas as rotas /api/* na Vercel

import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express usando require para compatibilidade CommonJS
// ESTRATÉGIA: Tentar arquivo compilado primeiro (produção), depois TypeScript (fallback)
let app: any;

// Tentativa 1: Importar backend compilado (produção - Vercel)
try {
  app = require("../apps/backend/dist/api").default;
  console.log("✅ [VERCEL] Backend compilado importado com sucesso (dist/api.js)");
} catch (error1: any) {
  console.warn("⚠️ [VERCEL] Tentativa 1 falhou (dist/api.js não encontrado)");
  console.warn("⚠️ [VERCEL] Erro:", error1.message);
  
  // Tentativa 2: Importar arquivo TypeScript (desenvolvimento/fallback)
  try {
    app = require("../apps/backend/src/api").default;
    console.log("✅ [VERCEL] Backend TypeScript importado (modo dev/fallback)");
  } catch (error2: any) {
    console.error("❌ [VERCEL] Ambas tentativas de importação falharam!");
    console.error("❌ [VERCEL] Erro Tentativa 1 (dist):", error1.message);
    console.error("❌ [VERCEL] Erro Tentativa 2 (src):", error2.message);
    console.error("❌ [VERCEL] Stack 1:", error1?.stack);
    console.error("❌ [VERCEL] Stack 2:", error2?.stack);
    // app permanece undefined - será tratado no handler
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log inicial para debug
  console.log(`🔍 [VERCEL HANDLER] ${req.method} ${req.url}`);
  
  // Headers CORS - SEMPRE definir antes de qualquer resposta
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Resposta para preflight OPTIONS
  if (req.method === "OPTIONS") {
    console.log("✅ [VERCEL] OPTIONS preflight - retornando 200");
    return res.status(200).end();
  }

  // Verificar se o app foi importado corretamente
  if (!app) {
    console.error("❌ [VERCEL] App Express não foi importado");
    return res.status(500).json({ 
      error: "Erro interno do servidor", 
      message: "App Express não disponível",
      hint: "Verifique os logs de build na Vercel"
    });
  }

  try {
    // Processar path corretamente
    // Na Vercel, req.url já vem com /api/ incluído quando a rota é /api/*
    let path = req.url || "/";
    
    // Remover query string
    path = path.split("?")[0];
    
    // Garantir que começa com /
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    
    // IMPORTANTE: Na Vercel com [...path].ts, req.url já vem com /api/ incluído
    // Não adicionar /api/ novamente se já existir
    if (!path.startsWith("/api/")) {
      path = `/api${path === "/" ? "" : path}`;
    }

    console.log(`🔍 [VERCEL] Path processado: ${path} (url original: ${req.url})`);

    // Converter body JSON se necessário
    let parsedBody: any = req.body;
    if (typeof req.body === "string" && req.headers["content-type"]?.includes("application/json")) {
      try {
        parsedBody = JSON.parse(req.body);
      } catch (parseError) {
        console.warn("⚠️ [VERCEL] Erro ao parsear JSON, usando body original");
        parsedBody = req.body;
      }
    }

    // Criar objetos req/res compatíveis com Express
    const expressReq: any = {
      method: (req.method || "GET").toUpperCase(),
      url: path,
      path: path,
      query: req.query || {},
      body: parsedBody,
      headers: req.headers || {},
      params: {},
      get: (name: string) => {
        const lower = name.toLowerCase();
        return req.headers?.[lower] || req.headers?.[name];
      },
      header: (name: string) => {
        const lower = name.toLowerCase();
        return req.headers?.[lower] || req.headers?.[name];
      },
      originalUrl: path,
      baseUrl: "",
    };

    const expressRes: any = {
      statusCode: 200,
      _headers: {},
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        if (res.writableEnded) {
          console.warn("⚠️ [VERCEL] Tentativa de enviar resposta após end");
          return this;
        }
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(this.statusCode).json(data);
      },
      send(data: any) {
        if (res.writableEnded) {
          console.warn("⚠️ [VERCEL] Tentativa de enviar resposta após end");
          return this;
        }
        const contentType = typeof data === "string" ? "text/plain" : "application/json";
        res.setHeader("Content-Type", contentType);
        return res.status(this.statusCode).send(data);
      },
      end(data?: any) {
        if (res.writableEnded) return;
        return res.status(this.statusCode).end(data);
      },
      setHeader(name: string, value: string) {
        this._headers[name] = value;
        if (!res.writableEnded) {
          res.setHeader(name, value);
        }
        return this;
      },
    };

    // Chamar o Express app
    return new Promise<void>((resolve) => {
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved && !res.writableEnded) {
          resolved = true;
          console.error("⏱️ [VERCEL] Timeout após 10s - nenhuma resposta do Express");
          res.status(504).json({ 
            error: "Timeout", 
            message: "A requisição demorou muito para processar" 
          });
          resolve();
        }
      }, 10000);

      const next = (err?: any) => {
        if (resolved) {
          console.warn("⚠️ [VERCEL] next() chamado após resolução");
          return;
        }
        
        clearTimeout(timeout);
        resolved = true;

        if (err) {
          console.error("❌ [VERCEL] Erro no Express middleware:", err);
          console.error("❌ [VERCEL] Stack:", err?.stack);
          if (!res.writableEnded) {
            res.status(500).json({ 
              error: "Erro interno do servidor", 
              message: err.message || "Erro ao processar requisição"
            });
          }
          resolve();
          return;
        }
        
        // Se chegou aqui sem resposta, é 404
        if (!res.writableEnded) {
          console.warn(`⚠️ [VERCEL] 404 - Rota não encontrada: ${expressReq.method} ${path}`);
          res.status(404).json({
            error: "Rota não encontrada",
            method: expressReq.method,
            path: path,
            url: req.url,
            hint: "Verifique se a rota está definida no backend"
          });
        }
        resolve();
      };

      // Chamar o Express
      try {
        console.log(`🚀 [VERCEL] Chamando Express app: ${expressReq.method} ${path}`);
        app(expressReq, expressRes, next);
      } catch (error: any) {
        clearTimeout(timeout);
        if (!resolved && !res.writableEnded) {
          resolved = true;
          console.error("❌ [VERCEL] Erro ao chamar Express:", error);
          console.error("❌ [VERCEL] Stack:", error?.stack);
          res.status(500).json({
            error: "Erro ao processar requisição",
            message: error?.message || "Erro interno do servidor"
          });
        }
        resolve();
      }
    });
  } catch (err: any) {
    console.error("❌ [VERCEL] Erro no handler:", err);
    console.error("❌ [VERCEL] Stack:", err?.stack);
    if (!res.writableEnded) {
      res.status(500).json({ 
        error: "Erro interno do servidor", 
        message: err.message || "Erro ao processar requisição"
      });
    }
  }
}
