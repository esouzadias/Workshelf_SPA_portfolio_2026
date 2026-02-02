import { Request, Response } from "express";
import { reqBody } from "../utils/validate";
import { loginUser, registerUser } from "../services/auth.service";

export async function postRegister(req: Request, res: Response) {
  const check = reqBody<{ email: string; password: string; displayName: string }>(
    req.body, ["email", "password", "displayName"]
  );
  if (!("ok" in check) || !check.ok) return res.status(400).json({ error: "Campos obrigatórios", missing: (check as any).missing });

  try {
    const out = await registerUser(req.body.email, req.body.password, req.body.displayName);
    res.status(201).json({ access: out.access, user: safeUser(out.user) });
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Erro" });
  }
}

export async function postLogin(req: Request, res: Response) {
  const check = reqBody<{ email: string; password: string }>(req.body, ["email", "password"]);
  if (!("ok" in check) || !check.ok) return res.status(400).json({ error: "Campos obrigatórios" });

  try {
    const out = await loginUser(req.body.email, req.body.password);
    res.json({ access: out.access, user: safeUser(out.user) });
  } catch (e: any) {
    res.status(e.status || 500).json({ error: e.message || "Erro" });
  }
}

function safeUser(u: any) {
  const { id, email, profile } = u;
  return { id, email, profile };
}