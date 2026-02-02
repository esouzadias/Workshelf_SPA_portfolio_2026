import fs from "fs/promises";
import path from "path";
import { prisma } from "../db";

async function getProfileId(userId: string) {
  const p = await prisma.profile.findUnique({ where: { userId } });
  if (!p) throw new Error("profile not found");
  return p.id;
}

export type CreateCertData = {
  title: string;
  fileName: string;
  mimeType: string;
  url: string;
  badgeColor?: string | null;
  iconUrl?: string | null;
};

export async function listCerts(userId: string) {
  const profileId = await getProfileId(userId);
  return prisma.certification.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    // no select: return all fields, including badgeColor & iconUrl
  });
}

export async function createCert(userId: string, data: CreateCertData) {
  const profileId = await getProfileId(userId);
  return prisma.certification.create({
    data: {
      title: data.title,
      fileName: data.fileName,
      mimeType: data.mimeType,
      url: data.url,
      badgeColor: data.badgeColor ?? null,
      iconUrl: data.iconUrl ?? null,
      profileId,
    },
  });
}

export async function deleteCert(userId: string, certId: string) {
  const cert = await prisma.certification.findFirst({
    where: { id: certId, profile: { userId } },
  });
  if (!cert) return;
  if (cert.url.startsWith("/uploads/")) {
    const abs = path.resolve(__dirname, "../public", "." + cert.url);
    try { await fs.unlink(abs); } catch {}
  }
  await prisma.certification.delete({ where: { id: certId } });
}