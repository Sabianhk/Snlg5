import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@utils/jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }
  const token = authHeader.substring("Bearer ".length);
  try {
    const { userId } = verifyToken(token);
    (req as any).userId = userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}