-- Create TreasureMap and TreasureLootTable tables for the Treasure Map System

-- Create TreasureMap table
CREATE TABLE "TreasureMap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "inventoryItemId" INTEGER,
    
    -- Map properties
    "rarity" TEXT NOT NULL,
    "regionId" INTEGER,
    "regionName" TEXT,
    "coordinatesX" INTEGER,
    "coordinatesY" INTEGER,
    "hints" TEXT,
    
    -- State
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "claimedAt" DATETIME,
    
    -- Expiration
    "expiresAt" DATETIME NOT NULL,
    
    -- Anti-exploit: coordinate randomization offset
    "coordOffsetX" INTEGER NOT NULL DEFAULT 0,
    "coordOffsetY" INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "TreasureMap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create TreasureLootTable table
CREATE TABLE "TreasureLootTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rarity" TEXT NOT NULL,
    "lootType" TEXT NOT NULL,
    
    -- For gold drops
    "goldMin" INTEGER,
    "goldMax" INTEGER,
    "goldWeight" INTEGER,
    
    -- For item drops
    "itemTemplateId" INTEGER,
    "quantityMin" INTEGER,
    "quantityMax" INTEGER,
    "itemWeight" INTEGER,
    
    -- Drop chance (for items only, gold always drops)
    "dropChance" REAL NOT NULL DEFAULT 1.0,
    
    -- Epic/Legendary item flags
    "isEpicItem" BOOLEAN NOT NULL DEFAULT false,
    "isLegendaryItem" BOOLEAN NOT NULL DEFAULT false,
    
    -- Rarity tier for items
    "itemRarity" TEXT,
    
    CONSTRAINT "TreasureLootTable_rarity_lootType_itemTemplateId_key" UNIQUE ("rarity", "lootType", "itemTemplateId")
);

-- Create indexes
CREATE INDEX "TreasureMap_userId_idx" ON "TreasureMap" ("userId");
CREATE INDEX "TreasureMap_userId_rarity_idx" ON "TreasureMap" ("userId", "rarity");
CREATE INDEX "TreasureMap_expiresAt_idx" ON "TreasureMap" ("expiresAt");
CREATE INDEX "TreasureLootTable_rarity_idx" ON "TreasureLootTable" ("rarity");

-- Add treasureMaps relation to User model (already done in schema)
