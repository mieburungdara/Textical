-- CreateTable
CREATE TABLE "RegionalInfluence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "factionId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegionalInfluence_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionalInfluence_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionalInfluence_factionId_regionId_key" ON "RegionalInfluence"("factionId", "regionId");
