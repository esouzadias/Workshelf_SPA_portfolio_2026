-- CreateTable
CREATE TABLE "DashboardTab" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "DashboardTile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tabId" TEXT NOT NULL,
    CONSTRAINT "DashboardTile_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "DashboardTab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
