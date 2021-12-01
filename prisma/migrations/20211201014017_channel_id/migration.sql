/*
  Warnings:

  - You are about to drop the column `primaryId` on the `Subchannel` table. All the data in the column will be lost.
  - Added the required column `channelId` to the `PrimaryChannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `channelId` to the `Subchannel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryChannelId` to the `Subchannel` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "general_name" TEXT NOT NULL
);
INSERT INTO "new_PrimaryChannel" ("general_name", "id", "name") SELECT "general_name", "id", "name" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_channelId_key" ON "PrimaryChannel"("channelId");
CREATE TABLE "new_Subchannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "primaryChannelId" TEXT NOT NULL,
    CONSTRAINT "Subchannel_primaryChannelId_fkey" FOREIGN KEY ("primaryChannelId") REFERENCES "PrimaryChannel" ("channelId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subchannel" ("id", "nickname") SELECT "id", "nickname" FROM "Subchannel";
DROP TABLE "Subchannel";
ALTER TABLE "new_Subchannel" RENAME TO "Subchannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
