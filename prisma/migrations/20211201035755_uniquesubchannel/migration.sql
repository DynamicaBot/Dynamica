/*
  Warnings:

  - A unique constraint covering the columns `[channelId]` on the table `Subchannel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subchannel_channelId_key" ON "Subchannel"("channelId");
