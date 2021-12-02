-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PrimaryChannel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creator" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT '@@game@@ ##',
    "generalName" TEXT NOT NULL DEFAULT 'General ##'
);
INSERT INTO "new_PrimaryChannel" ("creator", "generalName", "id", "template") SELECT "creator", coalesce("generalName", 'General ##') AS "generalName", "id", coalesce("template", '@@game@@ ##') AS "template" FROM "PrimaryChannel";
DROP TABLE "PrimaryChannel";
ALTER TABLE "new_PrimaryChannel" RENAME TO "PrimaryChannel";
CREATE UNIQUE INDEX "PrimaryChannel_id_key" ON "PrimaryChannel"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
