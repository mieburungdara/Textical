-- CreateTable
CREATE TABLE "RegionNPC" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "npcId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL DEFAULT 1.0,
    "isTemporary" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    CONSTRAINT "RegionNPC_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionNPC_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NPCTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "NPCShopItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "priceGold" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT -1,
    CONSTRAINT "NPCShopItem_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NPCShopItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionNPC_regionId_npcId_key" ON "RegionNPC"("regionId", "npcId");
