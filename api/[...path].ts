// Serverless Function para Vercel - captura todas as rotas /api/*
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Importar o app Express do backend (arquivo api.ts sem servir arquivos estáticos)
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Garantir headers CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handler para OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // Converter Vercel request/response para Express
  // O @vercel/node já faz isso automaticamente, mas precisamos garantir compatibilidade
  return new Promise((resolve) => {
    // Criar objetos compatíveis
    const expressReq = {
      method: req.method,
      url: req.url,
      path: req.url?.split("?")[0] || "/",
      query: req.query,
      body: req.body,
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
        res.status(code);
        return this;
      },
      json: function(data: any) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.status(this.statusCode).json(data);
        resolve(undefined);
        return this;
      },
      send: function(data: any) {
        if (typeof data === "string") {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
        } else {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
        }
        res.status(this.statusCode).send(data);
        resolve(undefined);
        return this;
      },
      setHeader: function(name: string, value: string) {
        this._headers[name] = value;
        res.setHeader(name, value);
        return this;
      },
      end: function(data?: any) {
        if (data) {
          res.status(this.statusCode).end(data);
        } else {
          res.status(this.statusCode).end();
        }
        resolve(undefined);
        return this;
      },
    } as any;
    
    // Chamar app Express
    app(expressReq, expressRes, () => {
      // Se chegou aqui sem resposta, retornar 404
      if (!res.writableEnded) {
        res.status(404).json({ error: "Rota não encontrada", path: req.url });
        resolve(undefined);
      }
    });
  });
}


