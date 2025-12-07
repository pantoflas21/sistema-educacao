// api/[...path].ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Headers CORS globais - SEMPRE definir antes de qualquer resposta
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Resposta para preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Processar path corretamente
    let path = req.url || "/";
    
    // Remover query string
    path = path.split("?")[0];
    
    // Garantir que começa com /
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    
    // Se não começar com /api/, adicionar
    if (!path.startsWith("/api/")) {
      path = `/api${path === "/" ? "" : path}`;
    }

    console.log(`🔍 Handler Vercel: ${req.method} ${path} (url original: ${req.url})`);

    // Converter body JSON se necessário
    let parsedBody: any = req.body;
    if (typeof req.body === "string" && req.headers["content-type"]?.includes("application/json")) {
      try {
        parsedBody = JSON.parse(req.body);
      } catch {
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
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(this.statusCode).json(data);
      },
      send(data: any) {
        const contentType = typeof data === "string" ? "text/plain" : "application/json";
        res.setHeader("Content-Type", contentType);
        return res.status(this.statusCode).send(data);
      },
      end(data?: any) {
        return res.status(this.statusCode).end(data);
      },
      setHeader(name: string, value: string) {
        this._headers[name] = value;
        res.setHeader(name, value);
        return this;
      },
    };

    // Chamar o Express app
    return new Promise<void>((resolve) => {
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (!res.writableEnded) {
            console.error("⏱️ Timeout - nenhuma resposta do Express");
            res.status(504).json({ error: "Timeout", message: "A requisição demorou muito" });
          }
          resolve();
        }
      }, 10000);

      const next = (err?: any) => {
        if (resolved) return;
        
        clearTimeout(timeout);
        resolved = true;
        
        if (err) {
          console.error("❌ Erro no Express:", err);
          if (!res.writableEnded) {
            res.status(500).json({ error: "Erro interno do servidor", message: err.message });
          }
          resolve();
          return;
        }
        
        // Se chegou aqui sem resposta, é 404
        if (!res.writableEnded) {
          console.warn("⚠️ Rota não encontrada:", expressReq.method, path);
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
        console.log(`🚀 Chamando Express app: ${expressReq.method} ${path}`);
        app(expressReq, expressRes, next);
      } catch (error: any) {
        clearTimeout(timeout);
        if (!resolved && !res.writableEnded) {
          resolved = true;
          console.error("❌ Erro ao chamar Express:", error);
          res.status(500).json({
            error: "Erro ao processar requisição",
            message: error?.message || "Erro interno do servidor"
          });
        }
        resolve();
      }
    });
  } catch (err: any) {
    console.error("Erro no handler Vercel:", err);
    if (!res.writableEnded) {
      res.status(500).json({ error: err.message || "Erro interno do servidor" });
    }
  }
}
