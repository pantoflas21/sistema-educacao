import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: any) {
  // Garantir que expiresIn seja string (formato aceito pelo jwt.sign)
  // TypeScript precisa de type assertion para StringValue do jsonwebtoken
  const expiresIn = String(env.JWT_EXPIRES_IN) as any;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string) {
  try { 
    return jwt.verify(token, env.JWT_SECRET) as any; 
  } catch (error) {
    console.warn("⚠️ Token inválido:", error instanceof Error ? error.message : String(error));
    return null; 
  }
}