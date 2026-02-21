-- CreateTable
CREATE TABLE "RegionMonster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    CONSTRAINT "RegionMonster_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
