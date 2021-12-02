/*
  Warnings:

  - You are about to drop the column `general_name` on the `PrimaryChannel` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generalName" TEXT NOT NULL DEFAULT 'General'
);
INSERT INTO "new_PrimaryChannel" ("channelId", "creator", "id", "name") SELECT "channelId", "creator", "id", "name" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_channelId_key" ON "PrimaryChannel"("channelId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
