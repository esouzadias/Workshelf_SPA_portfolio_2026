/*
  Warnings:

  - You are about to drop the column `iconColor` on the `DashboardTile` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DashboardTile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tabId" TEXT NOT NULL,
    CONSTRAINT "DashboardTile_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "DashboardTab" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DashboardTile" ("category", "description", "icon", "id", "order", "tabId") SELECT "category", "description", "icon", "id", "order", "tabId" FROM "DashboardTile";
DROP TABLE "DashboardTile";
ALTER TABLE "new_DashboardTile" RENAME TO "DashboardTile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
