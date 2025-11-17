import { verifyToken } from "../auth/jwt";

export function authMiddleware(req: any, _res: any, next: any) {
  const hdr = req.headers["authorization"] || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  const demo = process.env.AUTH_DEMO === "true";
  if (demo && !token) {
    req.user = { sub: "demo-admin", role: "Admin", email: "admin@example.com" };
    return next();
  }
  if (token) {
    const payload = verifyToken(token);
    if (payload) { req.user = payload; return next(); }
  }
  req.user = null;
  next();
}

export function requireRole(role: string) {
  return function(req: any, res: any, next: any) {
    const u = req.user;
    if (!u) return res.status(401).json({ error: "unauthorized" });
    if (u.role !== role && u.role !== "Admin") return res.status(403).json({ error: "forbidden" });
    next();
  };
}