-- Add Item Socketing System tables
-- GemTemplate: Stores all available gem types (elemental, 5 tiers)
-- InventoryItemSocket: Tracks gems inserted into equipment

-- Create GemTemplate table
CREATE TABLE "GemTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    "percentValue" REAL NOT NULL DEFAULT 0,
    "dropChance" REAL NOT NULL DEFAULT 0.01,
    "bossDropChance" REAL NOT NULL DEFAULT 0.1,
    "baseValue" INTEGER NOT NULL DEFAULT 100,
    "nextTierGemId" INTEGER,
    UNIQUE("element", "tier")
);

-- Create index on element for faster lookups
CREATE INDEX "GemTemplate_element_idx" ON "GemTemplate"("element");
CREATE INDEX "GemTemplate_tier_idx" ON "GemTemplate"("tier");

-- Create InventoryItemSocket table
CREATE TABLE "InventoryItemSocket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL UNIQUE,
    "gemId" INTEGER,
    "insertedAt" DATETIME,
    FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE,
    FOREIGN KEY ("gemId") REFERENCES "GemTemplate"("id") ON DELETE SET NULL
);

-- Create index on gemId for faster lookups
CREATE INDEX "InventoryItemSocket_gemId_idx" ON "InventoryItemSocket"("gemId");

-- Add socket relation to InventoryItem (using SQLite trigger or default)
-- The @relation is handled by Prisma, no column needed in InventoryItem
