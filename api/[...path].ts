// api/[...path].ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log da requisição para debug
  console.log(`🔍 Handler Vercel: ${req.method} ${req.url}`);
  console.log(`📋 Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`📦 Body:`, typeof req.body, req.body);
  
  // Headers CORS globais
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Resposta para preflight OPTIONS
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request - retornando 200");
    return res.status(200).end();
  }

  try {
    // Converter body JSON se necessário
    let parsedBody: any = req.body;
    if (typeof req.body === "string" && req.headers["content-type"]?.includes("application/json")) {
      try {
        parsedBody = JSON.parse(req.body);
      } catch {
        parsedBody = req.body;
      }
    }

    // Criar objeto Express compatível
    const method = (req.method || "GET").toUpperCase();
    const url = req.url || "/";
    const path = url.split("?")[0] || "/";
    
    console.log(`🔍 Criando Express Req: ${method} ${path}`);
    
    const expressReq: any = {
      method: method,
      url: url,
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
      originalUrl: url,
      baseUrl: "",
      route: undefined,
    };

    const expressRes: any = {
      statusCode: 200,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) {
        res.setHeader("Content-Type", "application/json");
        res.status(this.statusCode).json(data);
      },
      send(data: any) {
        res.setHeader("Content-Type", typeof data === "string" ? "text/plain" : "application/json");
        res.status(this.statusCode).send(data);
      },
      end(data?: any) { res.status(this.statusCode).end(data); },
      setHeader(name: string, value: string) { res.setHeader(name, value); },
    };

    // Encapsular o Express em Promise
    let responseHandled = false;
    
    await new Promise<void>((resolve) => {
      const next = (err?: any) => {
        if (err) {
          console.error("❌ Erro no Express:", err);
          if (!responseHandled) {
            responseHandled = true;
            res.status(500).json({ error: "Erro interno do servidor", message: err.message });
          }
          resolve();
          return;
        }
        
        // Se chegou aqui e não houve resposta, é 404
        if (!responseHandled && !res.writableEnded) {
          responseHandled = true;
          console.warn("⚠️ Rota não encontrada:", method, path);
          res.status(404).json({ error: "Rota não encontrada", method, path: req.url });
        }
        resolve();
      };
      
      console.log(`🚀 Chamando Express app: ${method} ${path}`);
      app(expressReq, expressRes, next);
      
      // Timeout de segurança
      setTimeout(() => {
        if (!responseHandled && !res.writableEnded) {
          responseHandled = true;
          console.error("⏱️ Timeout - nenhuma resposta do Express");
          res.status(504).json({ error: "Timeout", message: "A requisição demorou muito" });
          resolve();
        }
      }, 30000);
    });

  } catch (err: any) {
    console.error("Erro no handler Vercel:", err);
    // Retorno JSON sempre, nunca HTML
    res.status(500).json({ error: err.message || "Erro interno do servidor" });
  }
}
