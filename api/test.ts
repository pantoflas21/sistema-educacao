// api/test.ts - Handler de teste para verificar se a Vercel está funcionando
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({ 
    ok: true, 
    message: "Test endpoint funcionando",
    method: req.method,
    url: req.url,
    query: req.query,
    path: (req.query as any).path
  });
}

