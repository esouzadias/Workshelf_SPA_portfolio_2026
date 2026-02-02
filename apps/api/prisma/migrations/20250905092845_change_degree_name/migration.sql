/*
  Warnings:

  - You are about to drop the column `Degree` on the `Profile` table. All the data in the column will be lost.

*/
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
    "education" TEXT,
    "school" TEXT,
    "schoolLogoUrl" TEXT,
    "degree" TEXT,
    "degreeIcon" TEXT,
    "maritalStatus" TEXT,
    "dependents" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("avatarUrl", "birthDate", "createdAt", "currentClient", "currentClientLogoUrl", "currentCompany", "currentCompanyLogoUrl", "currentRoleStart", "currentTitle", "degreeIcon", "dependents", "displayName", "education", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "school", "schoolLogoUrl", "theme", "updatedAt", "userId") SELECT "avatarUrl", "birthDate", "createdAt", "currentClient", "currentClientLogoUrl", "currentCompany", "currentCompanyLogoUrl", "currentRoleStart", "currentTitle", "degreeIcon", "dependents", "displayName", "education", "employmentStatus", "fullName", "gender", "id", "locale", "maritalStatus", "nationality", "school", "schoolLogoUrl", "theme", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
