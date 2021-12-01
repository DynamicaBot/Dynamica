-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subchannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT,
    "channelId" TEXT NOT NULL,
    "primaryChannelId" TEXT NOT NULL,
    CONSTRAINT "Subchannel_primaryChannelId_fkey" FOREIGN KEY ("primaryChannelId") REFERENCES "PrimaryChannel" ("channelId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subchannel" ("channelId", "id", "nickname", "primaryChannelId") SELECT "channelId", "id", "nickname", "primaryChannelId" FROM "Subchannel";
DROP TABLE "Subchannel";
ALTER TABLE "new_Subchannel" RENAME TO "Subchannel";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
