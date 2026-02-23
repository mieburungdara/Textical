/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `TraitTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TraitTemplate_name_key" ON "TraitTemplate"("name");
