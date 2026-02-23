-- CreateTable
CREATE TABLE "ClassTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "growthRates" TEXT NOT NULL DEFAULT '{}',
    "innateTraits" TEXT NOT NULL DEFAULT '[]',
    "skillUnlocks" TEXT NOT NULL DEFAULT '[]',
    "equipmentAccess" TEXT NOT NULL DEFAULT '{}',
    "promotionReqs" TEXT NOT NULL DEFAULT '{}',
    "nextClasses" TEXT NOT NULL DEFAULT '[]',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/classes/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'classes/misc.json'
);
