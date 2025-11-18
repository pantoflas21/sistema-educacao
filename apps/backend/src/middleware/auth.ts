import { verifyToken } from "../auth/jwt";
import { env } from "../config/env";

export function authMiddleware(req: any, _res: any, next: any) {
  const hdr = req.headers["authorization"] || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  
  if (env.AUTH_DEMO && !token) {
    req.user = { sub: "demo-admin", role: "Admin", email: "admin@example.com" };
    return next();
  }
  
  if (token) {
    const payload = verifyToken(token);
    if (payload) { 
      req.user = payload; 
      return next(); 
    }
  }
  
  req.user = null;
  next();
}

export function requireRole(role: string) {
  return function(req: any, res: any, next: any) {
    // Garantir headers CORS mesmo em caso de erro
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    const u = req.user;
    
    // Em modo demo, sempre permitir se não houver usuário
    if (env.AUTH_DEMO && !u) {
      req.user = { sub: "demo-admin", role: "Admin", email: "admin@example.com" };
      return next();
    }
    
    if (!u) {
      console.warn("⚠️ requireRole: Usuário não autenticado");
      return res.status(401).json({ error: "unauthorized", message: "Usuário não autenticado" });
    }
    
    if (u.role !== role && u.role !== "Admin") {
      console.warn("⚠️ requireRole: Acesso negado. Role necessário:", role, "Role do usuário:", u.role);
      return res.status(403).json({ error: "forbidden", message: "Acesso negado" });
    }
    
    next();
  };
}