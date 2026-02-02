import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getDashboardConfig() {
  const tabs = await prisma.dashboardTab.findMany({
    orderBy: { order: "asc" },
    include: { tiles: { orderBy: { order: "asc" } } },
  });

  return {
    tabs: tabs.map(t => ({
      key: t.key,
      label: t.label,
      icon: t.icon ?? null,
    })),
    tilesByTab: tabs.reduce<Record<string, { category: string; description: string; icon?: string | null }[]>>(
      (acc, t) => {
        acc[t.key] = t.tiles.map(x => ({
          category: x.category,
          description: x.description,
          icon: x.icon ?? null,
        }));
        return acc;
      },
      {}
    ),
  };
}