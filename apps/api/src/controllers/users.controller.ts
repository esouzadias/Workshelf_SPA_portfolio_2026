// controllers/users.controller.ts
import { Request, Response } from "express";
import { getMe, updateProfile } from "../services/users.service";

export async function getMeCtrl(req: Request, res: Response) {
  const user = await getMe((req as any).userId);
  if (!user) return res.status(404).json({ error: "User não encontrado" });
  res.json({ id: user.id, email: user.email, profile: user.profile });
}

export async function putProfileCtrl(req: Request, res: Response) {
  const userId = (req as any).userId as string;
  const { displayName, theme, locale } = req.body || {};
  const updated = await updateProfile(userId, { displayName, theme, locale });
  res.json(updated);
}