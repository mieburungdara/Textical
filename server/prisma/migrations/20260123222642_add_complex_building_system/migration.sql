-- CreateTable
CREATE TABLE "BuildingTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ECONOMY',
    "upgradeTree" TEXT NOT NULL DEFAULT '[]',
    "perksPerLevel" TEXT NOT NULL DEFAULT '[]',
    "staffingLogic" TEXT NOT NULL DEFAULT '{}',
    "maintenance" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/buildings/default.png',
    "modelPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'buildings/misc.json'
);

-- CreateTable
CREATE TABLE "BuildingInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "regionId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "instanceData" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BuildingInstance_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BuildingInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "BuildingTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
