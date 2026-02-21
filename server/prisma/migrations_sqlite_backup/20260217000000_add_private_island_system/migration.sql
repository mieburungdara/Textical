-- Create PrivateIsland tables for farming feature
-- Migration: add_private_island_system
-- Date: 2026-02-17

-- Main PrivateIsland table
CREATE TABLE "PrivateIsland" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL UNIQUE,
    "isUnlocked" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" DATETIME,
    "plotCount" INTEGER NOT NULL DEFAULT 6,
    "storageSlotCount" INTEGER NOT NULL DEFAULT 10,
    "maxPlots" INTEGER NOT NULL DEFAULT 50,
    "maxStorageSlots" INTEGER NOT NULL DEFAULT 50,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- GardenPlot table for individual plots
CREATE TABLE "GardenPlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "islandId" INTEGER NOT NULL,
    "plotIndex" INTEGER NOT NULL,
    "cropTemplateId" INTEGER,
    "seedItemId" INTEGER,
    "plantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "harvestAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'EMPTY',
    "growthProgress" REAL NOT NULL DEFAULT 0.0,
    "yieldMultiplier" REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY ("islandId") REFERENCES "PrivateIsland"("id") ON DELETE CASCADE,
    FOREIGN KEY ("cropTemplateId") REFERENCES "ItemTemplate"("id"),
    FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate"("id")
);

-- IslandStorage table for storage items
CREATE TABLE "IslandStorageItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "islandId" INTEGER NOT NULL,
    "itemTemplateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "slotIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("islandId") REFERENCES "PrivateIsland"("id") ON DELETE CASCADE,
    FOREIGN KEY ("itemTemplateId") REFERENCES "ItemTemplate"("id")
);

-- CropTemplate table for defining crop types (growth times, yields)
CREATE TABLE "CropTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "seedItemId" INTEGER NOT NULL,
    "harvestItemId" INTEGER NOT NULL,
    "growthTimeSeconds" INTEGER NOT NULL DEFAULT 600,
    "minYield" INTEGER NOT NULL DEFAULT 1,
    "maxYield" INTEGER NOT NULL DEFAULT 3,
    "experienceReward" INTEGER NOT NULL DEFAULT 10,
    "season" TEXT NOT NULL DEFAULT 'ALL',
    "waterRequirement" INTEGER NOT NULL DEFAULT 1,
    "isPremium" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("seedItemId") REFERENCES "ItemTemplate"("id"),
    FOREIGN KEY ("harvestItemId") REFERENCES "ItemTemplate"("id")
);

-- Create indexes for performance
CREATE INDEX "GardenPlot_islandId_idx" ON "GardenPlot"("islandId");
CREATE INDEX "GardenPlot_status_idx" ON "GardenPlot"("status");
CREATE INDEX "IslandStorageItem_islandId_idx" ON "IslandStorageItem"("islandId");
CREATE INDEX "IslandStorageItem_slotIndex_idx" ON "IslandStorageItem"("slotIndex");
CREATE INDEX "CropTemplate_seedItemId_idx" ON "CropTemplate"("seedItemId");
