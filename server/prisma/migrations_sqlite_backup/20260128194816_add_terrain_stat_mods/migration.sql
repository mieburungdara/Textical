-- CreateTable
CREATE TABLE "TerrainEffect" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionTypeId" TEXT NOT NULL,
    "effectType" TEXT NOT NULL,
    "chance" REAL NOT NULL DEFAULT 1.0,
    "power" REAL NOT NULL DEFAULT 0,
    "statKey" TEXT,
    "statValue" REAL,
    "tickInterval" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "TerrainEffect_regionTypeId_fkey" FOREIGN KEY ("regionTypeId") REFERENCES "RegionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
