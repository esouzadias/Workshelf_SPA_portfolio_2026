import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT = process.env.JWT_SECRET || "change-me";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sem token" });

  try {
    const payload = jwt.verify(token, JWT) as { sub: string };
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}