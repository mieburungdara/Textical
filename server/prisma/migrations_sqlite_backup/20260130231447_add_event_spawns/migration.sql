-- CreateTable
CREATE TABLE "EventResource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL DEFAULT 1.0,
    "gatherTime" INTEGER NOT NULL DEFAULT 10,
    CONSTRAINT "EventResource_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorldEventTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventResource_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventMonster" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "monsterId" INTEGER NOT NULL,
    "spawnChance" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "EventMonster_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorldEventTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "MonsterTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
