/*
  Warnings:

  - You are about to drop the `Subchannel` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `PrimaryChannel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `channelId` on the `PrimaryChannel` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PrimaryChannel` table. All the data in the column will be lost.
  - Added the required column `template` to the `PrimaryChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Subchannel_channelId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Subchannel";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Secondary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "primaryChannelId" TEXT NOT NULL,
    CONSTRAINT "Secondary_primaryChannelId_fkey" FOREIGN KEY ("primaryChannelId") REFERENCES "PrimaryChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "generalName" TEXT NOT NULL DEFAULT 'General ##'
);
INSERT INTO "new_PrimaryChannel" ("creator", "generalName", "id") SELECT "creator", "generalName", "id" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_id_key" ON "PrimaryChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Secondary_id_key" ON "Secondary"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Secondary_channelId_key" ON "Secondary"("channelId");
