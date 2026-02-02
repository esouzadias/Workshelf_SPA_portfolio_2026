/*
  Warnings:

  - You are about to drop the column `careerStart` on the `Profile` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Hobby" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Hobby_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "currentClient" TEXT,
    "currentRoleStart" DATETIME,
    "education" TEXT,
    "school" TEXT,
    "Degree" TEXT,
    "maritalStatus" TEXT,
    "dependents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("Degree", "avatarUrl", "birthDate", "createdAt", "currentClient", "currentCompany", "currentRoleStart", "currentTitle", "dependents", "displayName", "education", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "school", "theme", "updatedAt", "userId") SELECT "Degree", "avatarUrl", "birthDate", "createdAt", "currentClient", "currentCompany", "currentRoleStart", "currentTitle", "dependents", "displayName", "education", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "school", "theme", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Hobby_profileId_name_key" ON "Hobby"("profileId", "name");
