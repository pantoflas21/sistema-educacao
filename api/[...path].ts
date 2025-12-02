// api/[...path].ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Log da requisição para debug
  console.log(`🔍 Handler Vercel: ${req.method} ${req.url}`);
  
  // Headers CORS globais - SEMPRE definir antes de qualquer resposta
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight por 24h

  // Resposta para preflight OPTIONS - DEVE ser a primeira coisa
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request - retornando 200");
    return res.status(200).end();
  }

  // Garantir que método HTTP é válido
  const method = (req.method || "GET").toUpperCase();
  const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
  if (!validMethods.includes(method)) {
    console.error(`❌ Método HTTP inválido: ${method}`);
    return res.status(405).json({ 
      error: "Method Not Allowed", 
      message: `Método ${method} não é permitido`,
      allowed: validMethods
    });
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
    const url = req.url || "/";
    // As rotas do Express já começam com /api/, então mantemos o path completo
    // Quando a Vercel usa [...path].ts, req.url já inclui /api/...
    let path = url.split("?")[0] || "/";
    
    // Garantir que path começa com /api/
    if (!path.startsWith("/api/")) {
      path = `/api${path}`;
    }
    
    console.log(`🔍 Criando Express Req: ${method} ${path} (url: ${url})`);
    
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
      const timeoutId = setTimeout(() => {
        if (!responseHandled && !res.writableEnded) {
          responseHandled = true;
          console.error("⏱️ Timeout - nenhuma resposta do Express");
          res.status(504).json({ error: "Timeout", message: "A requisição demorou muito" });
          resolve();
        }
      }, 10000); // Timeout reduzido para 10 segundos
      
      // Interceptar a resposta do Express
      const originalJson = expressRes.json;
      const originalSend = expressRes.send;
      const originalEnd = expressRes.end;
      
      expressRes.json = function(data: any) {
        if (!responseHandled) {
          clearTimeout(timeoutId);
          responseHandled = true;
        }
        return originalJson.call(this, data);
      };
      
      expressRes.send = function(data: any) {
        if (!responseHandled) {
          clearTimeout(timeoutId);
          responseHandled = true;
        }
        return originalSend.call(this, data);
      };
      
      expressRes.end = function(data?: any) {
        if (!responseHandled) {
          clearTimeout(timeoutId);
          responseHandled = true;
        }
        return originalEnd.call(this, data);
      };
      
      const next = (err?: any) => {
        clearTimeout(timeoutId);
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
      
      // Chamar o Express corretamente
      // O Express app pode ser usado como handler diretamente
      try {
        app(expressReq, expressRes, next);
      } catch (expressError: any) {
        console.error("❌ Erro ao chamar Express:", expressError);
        if (!responseHandled) {
          responseHandled = true;
          clearTimeout(timeoutId);
          res.status(500).json({ 
            error: "Erro ao processar requisição", 
            message: expressError?.message || "Erro interno do servidor"
          });
        }
        resolve();
        return;
      }
      
      // Se a resposta já foi enviada, limpar timeout
      if (res.writableEnded) {
        clearTimeout(timeoutId);
        responseHandled = true;
        resolve();
      }
    });

  } catch (err: any) {
    console.error("Erro no handler Vercel:", err);
    // Retorno JSON sempre, nunca HTML
    res.status(500).json({ error: err.message || "Erro interno do servidor" });
  }
}
