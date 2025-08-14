import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "@config/env";

export type JwtPayload = {
  userId: string;
};

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn };
  return jwt.sign(payload as object, env.jwtSecret as Secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.jwtRefreshExpiresIn };
  return jwt.sign(payload as object, env.jwtSecret as Secret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret as Secret) as JwtPayload;
}