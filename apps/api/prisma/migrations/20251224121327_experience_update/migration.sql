/*
  Warnings:

  - You are about to drop the column `location` on the `Experience` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "companyLogoUrl" TEXT,
    "isConsultancy" BOOLEAN NOT NULL DEFAULT false,
    "client" TEXT,
    "clientLogoUrl" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Experience" ("company", "createdAt", "description", "endDate", "id", "isCurrent", "profileId", "startDate", "title", "updatedAt") SELECT "company", "createdAt", "description", "endDate", "id", "isCurrent", "profileId", "startDate", "title", "updatedAt" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
