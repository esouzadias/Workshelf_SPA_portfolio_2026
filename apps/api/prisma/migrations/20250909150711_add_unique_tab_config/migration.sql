/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `DashboardTab` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DashboardTab_key_key" ON "DashboardTab"("key");
