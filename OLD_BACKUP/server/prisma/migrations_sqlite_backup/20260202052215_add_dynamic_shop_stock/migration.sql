-- CreateTable
CREATE TABLE "ShopStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "maxQuantity" INTEGER NOT NULL DEFAULT 50,
    "nextRestock" DATETIME NOT NULL,
    CONSTRAINT "ShopStock_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShopStock_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ShopStock_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopStock_npcId_regionId_templateId_key" ON "ShopStock"("npcId", "regionId", "templateId");
