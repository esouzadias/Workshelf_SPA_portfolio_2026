import { prisma } from "../db";

export const educationService = {
  async listByProfile(profileId: string) {
    return prisma.education.findMany({
      where: { profileId },
      orderBy: [
        { isCurrent: "desc" },
        { endDate: "desc" },
        { startDate: "desc" },
      ],
    });
  },

  async create(profileId: string, data: any) {
    return prisma.education.create({
      data: {
        profileId,
        education: data.education ?? null,
        school: data.school,
        schoolLogoUrl: data.schoolLogoUrl ?? null,
        degree: data.degree ?? null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isCurrent: !!data.isCurrent,
      },
    });
  },

  async update(id: string, profileId: string, data: any) {
    return prisma.education.update({
      where: { id },
      data: {
        // enforce ownership via route/controller checks (recommended)
        education: data.education ?? null,
        school: data.school,
        schoolLogoUrl: data.schoolLogoUrl ?? null,
        degree: data.degree ?? null,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate === null ? null : data.endDate ? new Date(data.endDate) : undefined,
        isCurrent: typeof data.isCurrent === "boolean" ? data.isCurrent : undefined,
      },
    });
  },

  async remove(id: string) {
    return prisma.education.delete({ where: { id } });
  },

  async latestByProfile(profileId: string) {
    return prisma.education.findFirst({
      where: { profileId },
      orderBy: [
        { isCurrent: "desc" },
        { endDate: "desc" },
        { startDate: "desc" },
      ],
    });
  },
};