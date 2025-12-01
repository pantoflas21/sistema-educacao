// api/[...path].ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../apps/backend/src/api";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Headers CORS globais
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Resposta para preflight OPTIONS
  if (req.method === "OPTIONS") {
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
    const expressReq: any = {
      method: req.method,
      url: req.url,
      path: req.url?.split("?")[0] || "/",
      query: req.query,
      body: parsedBody,
      headers: req.headers,
      get: (name: string) => req.headers[name.toLowerCase()] || req.headers[name],
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
    await new Promise<void>((resolve) => {
      app(expressReq, expressRes, () => {
        // Se a rota não existir, retorna 404 JSON
        if (!res.writableEnded) {
          res.status(404).json({ error: "Rota não encontrada", path: req.url });
        }
        resolve();
      });
    });

  } catch (err: any) {
    console.error("Erro no handler Vercel:", err);
    // Retorno JSON sempre, nunca HTML
    res.status(500).json({ error: err.message || "Erro interno do servidor" });
  }
}
