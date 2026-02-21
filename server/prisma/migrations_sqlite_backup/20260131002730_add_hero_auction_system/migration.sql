-- CreateTable
CREATE TABLE "HeroOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "creatorId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "heroId" INTEGER,
    "targetClassId" INTEGER,
    "minUnitLevel" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HeroOrder_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroOrder_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroOrder_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HeroOrder_targetClassId_fkey" FOREIGN KEY ("targetClassId") REFERENCES "ClassTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "HeroOrder_heroId_key" ON "HeroOrder"("heroId");
