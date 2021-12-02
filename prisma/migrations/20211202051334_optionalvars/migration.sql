/*
  Warnings:

  - You are about to drop the column `channelId` on the `Secondary` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "template" TEXT,
    "generalName" TEXT
);
INSERT INTO "new_PrimaryChannel" ("creator", "generalName", "id", "template") SELECT "creator", "generalName", "id", "template" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_id_key" ON "PrimaryChannel"("id");
CREATE TABLE "new_Secondary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "primaryChannelId" TEXT NOT NULL,
    CONSTRAINT "Secondary_primaryChannelId_fkey" FOREIGN KEY ("primaryChannelId") REFERENCES "PrimaryChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Secondary" ("id", "name", "primaryChannelId") SELECT "id", "name", "primaryChannelId" FROM "Secondary";
DROP TABLE "Secondary";
ALTER TABLE "new_Secondary" RENAME TO "Secondary";
CREATE UNIQUE INDEX "Secondary_id_key" ON "Secondary"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
