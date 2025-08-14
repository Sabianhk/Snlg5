import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "@config/env";

export type JwtPayload = {
  userId: string;
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, env.jwtSecret as Secret, { expiresIn: env.jwtExpiresIn as any } as SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, env.jwtSecret as Secret, { expiresIn: env.jwtRefreshExpiresIn as any } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret as Secret) as JwtPayload;
  
}