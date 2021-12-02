/*
  Warnings:

  - Added the required column `create_above` to the `PrimaryChannel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "create_above" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "general_name" TEXT NOT NULL
);
INSERT INTO "new_PrimaryChannel" ("channelId", "creator", "general_name", "id", "name") SELECT "channelId", "creator", "general_name", "id", "name" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_channelId_key" ON "PrimaryChannel"("channelId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
