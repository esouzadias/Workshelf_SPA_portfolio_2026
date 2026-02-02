-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogoUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewDate" DATETIME NOT NULL,
    CONSTRAINT "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("companyLogoUrl", "companyName", "createdAt", "fileName", "id", "mimeType", "profileId", "reviewDate", "url") SELECT "companyLogoUrl", "companyName", "createdAt", "fileName", "id", "mimeType", "profileId", "reviewDate", "url" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
CREATE INDEX "Review_profileId_reviewDate_idx" ON "Review"("profileId", "reviewDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
