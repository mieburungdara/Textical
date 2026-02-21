/*
  Warnings:

  - A unique constraint covering the columns `[presetId,heroId]` on the table `FormationSlot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FormationSlot_presetId_heroId_key" ON "FormationSlot"("presetId", "heroId");
