/*
  Warnings:

  - A unique constraint covering the columns `[heroId,slotKey]` on the table `HeroEquipment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "HeroEquipment_heroId_slotKey_key" ON "HeroEquipment"("heroId", "slotKey");
