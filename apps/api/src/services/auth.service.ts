import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { config } from "../config";

export async function registerUser(email: string, password: string, displayName: string) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw { status: 409, message: "Email já em uso" };
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, profile: { create: { displayName } } },
    include: { profile: true }
  });
  return { access: sign(user.id), user };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
  if (!user) throw { status: 401, message: "Credenciais inválidas" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: "Credenciais inválidas" };
  return { access: sign(user.id), user };
}

function sign(sub: string) {
  return jwt.sign({ sub }, config.jwtSecret, { expiresIn: "15m" });
}