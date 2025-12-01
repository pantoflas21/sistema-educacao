// Serverless Function para Vercel - captura todas as rotas /api/*
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express do backend (arquivo api.ts sem servir arquivos estáticos)
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // SEMPRE garantir headers CORS e JSON primeiro
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  
  // Handler para OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }
  
  // Converter Vercel request/response para Express
  // Wrapper para garantir que SEMPRE retorne JSON, nunca HTML
  return new Promise((resolve) => {
    let responseSent = false;
    
    // Parse body se necessário (Vercel pode enviar como string)
    let parsedBody = req.body;
    if (typeof req.body === 'string' && req.headers['content-type']?.includes('application/json')) {
      try {
        parsedBody = JSON.parse(req.body);
      } catch (e) {
        console.error("❌ Erro ao fazer parse do body JSON:", e);
        parsedBody = req.body;
      }
    }
    
    // Criar objetos compatíveis com Express
    const expressReq = {
      method: req.method,
      url: req.url,
      path: req.url?.split("?")[0] || "/",
      query: req.query,
      body: parsedBody,
      headers: req.headers,
      get: (name: string) => {
        const lower = name.toLowerCase();
        return req.headers[lower] || req.headers[name];
      },
      header: (name: string) => {
        const lower = name.toLowerCase();
        return req.headers[lower] || req.headers[name];
      },
    } as any;
    
    const expressRes = {
      statusCode: 200,
      _headers: {} as Record<string, string>,
      status: function(code: number) {
        this.statusCode = code;
        if (!responseSent) res.status(code);
        return this;
      },
      json: function(data: any) {
        if (responseSent) return this;
        responseSent = true;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(this.statusCode || 200).json(data);
        resolve(undefined);
        return this;
      },
      send: function(data: any) {
        if (responseSent) return this;
        responseSent = true;
        // Sempre garantir JSON
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        if (typeof data === "string") {
          try {
            // Tentar parsear se for JSON string
            const parsed = JSON.parse(data);
            res.status(this.statusCode || 200).json(parsed);
          } catch {
            // Se não for JSON, retornar como erro JSON
            res.status(this.statusCode || 200).json({ error: data });
          }
        } else {
          res.status(this.statusCode || 200).json(data);
        }
        resolve(undefined);
        return this;
      },
      setHeader: function(name: string, value: string) {
        this._headers[name] = value;
        if (!responseSent) res.setHeader(name, value);
        return this;
      },
      end: function(data?: any) {
        if (responseSent) return this;
        responseSent = true;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        if (data) {
          res.status(this.statusCode || 200).json({ message: data });
        } else {
          res.status(this.statusCode || 200).json({ ok: true });
        }
        resolve(undefined);
        return this;
      },
    } as any;
    
    // Chamar app Express com timeout de segurança
    const timeout = setTimeout(() => {
      if (!responseSent) {
        responseSent = true;
        console.error("❌ Timeout ao processar requisição:", req.method, req.url);
        res.status(504).json({ 
          error: "Timeout", 
          message: "A requisição demorou muito para processar",
          path: req.url 
        });
        resolve(undefined);
      }
    }, 30000); // 30 segundos
    
    try {
      app(expressReq, expressRes, () => {
        clearTimeout(timeout);
        // Se chegou aqui sem resposta (404), retornar JSON de erro
        if (!responseSent) {
          responseSent = true;
          console.warn("⚠️ Rota não encontrada:", req.method, req.url);
          res.status(404).json({ 
            error: "Rota não encontrada", 
            method: req.method,
            path: req.url 
          });
          resolve(undefined);
        }
      });
    } catch (error: any) {
      clearTimeout(timeout);
      if (!responseSent) {
        responseSent = true;
        console.error("❌ Erro ao processar requisição:", error);
        res.status(500).json({ 
          error: "Erro interno do servidor", 
          message: error?.message || "Erro desconhecido",
          path: req.url 
        });
        resolve(undefined);
      }
    }
  });
}


