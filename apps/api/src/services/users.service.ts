// services/users.service.ts
import { prisma } from "../db";
export async function getMe(userId: string) {
  return prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
}
export async function updateProfile(userId: string, data: { displayName?: string; theme?: string; locale?: string }) {
  return prisma.profile.update({ where: { userId }, data });
}