/*
  Warnings:

  - You are about to drop the column `degree` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `schoolLogoUrl` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "education" TEXT,
    "school" TEXT NOT NULL,
    "schoolLogoUrl" TEXT,
    "degree" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Education_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "avatarUrl" TEXT,
    "fullName" TEXT,
    "birthDate" DATETIME,
    "nationality" TEXT,
    "gender" TEXT,
    "employmentStatus" TEXT,
    "currentTitle" TEXT,
    "currentCompany" TEXT,
    "currentCompanyLogoUrl" TEXT,
    "currentClient" TEXT,
    "currentClientLogoUrl" TEXT,
    "currentRoleStart" DATETIME,
    "maritalStatus" TEXT,
    "dependents" INTEGER,
    "about" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("about", "avatarUrl", "birthDate", "createdAt", "currentClient", "currentClientLogoUrl", "currentCompany", "currentCompanyLogoUrl", "currentRoleStart", "currentTitle", "dependents", "displayName", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "theme", "updatedAt", "userId") SELECT "about", "avatarUrl", "birthDate", "createdAt", "currentClient", "currentClientLogoUrl", "currentCompany", "currentCompanyLogoUrl", "currentRoleStart", "currentTitle", "dependents", "displayName", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "theme", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Education_profileId_startDate_idx" ON "Education"("profileId", "startDate");

-- CreateIndex
CREATE INDEX "Education_profileId_isCurrent_endDate_idx" ON "Education"("profileId", "isCurrent", "endDate");
