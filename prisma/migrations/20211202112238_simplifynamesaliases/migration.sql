/*
  Warnings:

  - You are about to drop the `PrimaryChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `primaryChannelId` on the `Secondary` table. All the data in the column will be lost.
  - Added the required column `primaryId` to the `Secondary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PrimaryChannel_id_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PrimaryChannel";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Primary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT '@@game@@ ##',
    "generalName" TEXT NOT NULL DEFAULT 'General ##'
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activity" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "primaryId" TEXT NOT NULL,
    CONSTRAINT "Alias_primaryId_fkey" FOREIGN KEY ("primaryId") REFERENCES "Primary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Secondary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "primaryId" TEXT NOT NULL,
    CONSTRAINT "Secondary_primaryId_fkey" FOREIGN KEY ("primaryId") REFERENCES "Primary" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Secondary" ("id", "name") SELECT "id", "name" FROM "Secondary";
DROP TABLE "Secondary";
ALTER TABLE "new_Secondary" RENAME TO "Secondary";
CREATE UNIQUE INDEX "Secondary_id_key" ON "Secondary"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Primary_id_key" ON "Primary"("id");
