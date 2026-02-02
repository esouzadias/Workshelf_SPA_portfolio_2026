import {prisma} from '../db';
import { educationService } from "./education.service";

// About
export const getAbout = (profileId: string) =>
  prisma.profile.findUnique({ where: { id: profileId }, select: { about: true } });

export const setAbout = (profileId: string, about: string | null) =>
  prisma.profile.update({ where: { id: profileId }, data: { about } });

// Experiences
export const listExperiences = (profileId: string) =>
  prisma.experience.findMany({
    where: { profileId },
    orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
    include: {
      tasks: { orderBy: { order: 'asc' } },
      techLinks: { include: { technology: true } }
    }
  });

export const saveExperience = async (profileId: string, payload: any) => {
  const { id, tasks = [], technologies = [], ...base } = payload;
  const techRecords = await prisma.technology.findMany({ where: { name: { in: technologies } } });
  const existing = new Set(techRecords.map((t:any) => t.name));
  const toCreate = technologies.filter((n: string) => !existing.has(n)).map((name:string) => ({ name }));
  const created = toCreate.length ? await prisma.technology.createMany({ data: toCreate }) : null;
  const allTech = await prisma.technology.findMany({ where: { name: { in: technologies } } });

  if (id) {
    await prisma.experienceTechnology.deleteMany({ where: { experienceId: id } });
    await prisma.experienceTask.deleteMany({ where: { experienceId: id } });
    return prisma.experience.update({
      where: { id },
      data: {
        ...base,
        profileId,
        tasks: { create: tasks.map((t: any, i: number) => ({ text: t, order: i })) },
        techLinks: { create: allTech.map((t:any) => ({ technologyId: t.id })) }
      },
      include: { tasks: true, techLinks: { include: { technology: true } } }
    });
  }

  return prisma.experience.create({
    data: {
      ...base,
      profileId,
      tasks: { create: tasks.map((t: any, i: number) => ({ text: t, order: i })) },
      techLinks: { create: allTech.map((t:any) => ({ technologyId: t.id })) }
    },
    include: { tasks: true, techLinks: { include: { technology: true } } }
  });
};

export const deleteExperience = (id: string) =>
  prisma.experience.delete({ where: { id } });

export const listTechSuggestions = async () => {
  const items = await prisma.technology.findMany({ orderBy: { name: 'asc' } });
  return items.map((i:any) => i.name);
};

// Languages
export const listLanguages = (profileId: string) =>
  prisma.language.findMany({ where: { profileId }, orderBy: [{ isNative: 'desc' }, { name: 'asc' }] });

export const setLanguages = async (profileId: string, items: Array<{name: string; level: string; isNative?: boolean;}>) => {
  await prisma.$transaction([
    prisma.language.deleteMany({ where: { profileId } }),
    prisma.language.createMany({
      data: items.map(i => ({ profileId, name: i.name, level: i.level as any, isNative: !!i.isNative }))
    })
  ]);
};

// Contacts
export const listContacts = (profileId: string) =>
  prisma.contactMethod.findMany({ where: { profileId }, orderBy: { order: 'asc' } });

export const setContacts = async (profileId: string, items: Array<{type: string; value: string; label?: string; icon?: string; order?: number;}>) => {
  await prisma.$transaction([
    prisma.contactMethod.deleteMany({ where: { profileId } }),
    prisma.contactMethod.createMany({
      data: items.map((i, idx) => ({
        profileId,
        type: i.type as any,
        value: i.value,
        label: i.label ?? null,
        icon: i.icon ?? null,
        order: i.order ?? idx
      }))
    })
  ]);
};

// Skills
type SkillInput = {
  id?: string;
  name?: string;
  proficiency?: number;
  icon?: string | null;
  order?: number;
};

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export async function listSkills(profileId: string) {
  return prisma.skill.findMany({
    where: { profileId },
    orderBy: { order: "asc" },
  });
}

export async function setSkills(profileId: string, skills: SkillInput[]) {
  const input = Array.isArray(skills) ? skills : [];

  const cleaned = input
    .map((s, idx) => ({
      id: typeof s.id === "string" ? s.id : undefined,
      name: String(s.name ?? "").trim(),
      proficiency: clamp(Number(s.proficiency ?? 0)),
      icon: s.icon ?? null,
      order: typeof s.order === "number" ? s.order : idx,
    }))
    .filter((s) => s.name.length > 0);

  const existing = await prisma.skill.findMany({
    where: { profileId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((x) => x.id));
  const incomingIds = new Set(cleaned.filter((x) => x.id).map((x) => x.id as string));

  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));

  await prisma.$transaction(async (tx) => {
    if (toDelete.length) {
      await tx.skill.deleteMany({ where: { id: { in: toDelete }, profileId } });
    }

    for (const s of cleaned) {
      const data = {
        profileId,
        name: s.name,
        proficiency: s.proficiency,
        icon: s.icon,
        order: s.order,
      };

      if (s.id && existingIds.has(s.id)) {
        await tx.skill.update({ where: { id: s.id }, data });
      } else {
        await tx.skill.create({ data });
      }
    }
  });
}

export async function deleteSkill(id: string) {
  await prisma.skill.delete({ where: { id } });
}

// Reviews
export const listReviews = (profileId: string) =>
  prisma.review.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' }
  });

export const deleteReviews = (id: string) =>
  prisma.review.delete({ where: { id } }); 

