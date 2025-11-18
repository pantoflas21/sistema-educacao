import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export function signToken(payload: any) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string) {
  try { 
    return jwt.verify(token, env.JWT_SECRET) as any; 
  } catch (error) {
    console.warn("⚠️ Token inválido:", error instanceof Error ? error.message : String(error));
    return null; 
  }
}