import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: any) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken(token: string) {
  try { 
    return jwt.verify(token, env.JWT_SECRET); 
  } catch (error) {
    console.warn("⚠️ Token inválido:", error instanceof Error ? error.message : String(error));
    return null; 
  }
}