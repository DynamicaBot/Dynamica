-- CreateTable
CREATE TABLE "PrimaryChannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "general_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Subchannel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "primaryId" INTEGER NOT NULL,
    CONSTRAINT "Subchannel_primaryId_fkey" FOREIGN KEY ("primaryId") REFERENCES "PrimaryChannel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
