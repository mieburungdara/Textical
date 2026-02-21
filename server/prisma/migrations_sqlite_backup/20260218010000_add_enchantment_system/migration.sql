-- Create ItemEnchantment table
CREATE TABLE "ItemEnchantment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "statKey" TEXT NOT NULL,
    "statValuePerLevel" REAL NOT NULL DEFAULT 0,
    "percentBonusPerLevel" REAL NOT NULL DEFAULT 0,
    "isPercent" INTEGER NOT NULL DEFAULT 0,
    "condition" TEXT,
    "materialId" INTEGER,
    "materialCount" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "baseSuccessRate" REAL NOT NULL DEFAULT 0.8
);

-- Create InventoryItemEnchantment table
CREATE TABLE "InventoryItemEnchantment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "inventoryItemId" INTEGER NOT NULL,
    "enchantmentId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE,
    FOREIGN KEY ("enchantmentId") REFERENCES "ItemEnchantment"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Add unique constraint for inventoryItem + enchantment
CREATE UNIQUE INDEX "InventoryItemEnchantment_inventoryItemId_enchantmentId_key" ON "InventoryItemEnchantment"("inventoryItemId", "enchantmentId");

-- Add foreign key index for better performance
CREATE INDEX "InventoryItemEnchantment_inventoryItemId_idx" ON "InventoryItemEnchantment"("inventoryItemId");
CREATE INDEX "InventoryItemEnchantment_enchantmentId_idx" ON "InventoryItemEnchantment"("enchantmentId");
