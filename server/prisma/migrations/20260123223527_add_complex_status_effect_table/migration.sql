-- CreateTable
CREATE TABLE "StatusEffectTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DEBUFF',
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "stackingRule" TEXT NOT NULL DEFAULT 'REFRESH',
    "maxStacks" INTEGER NOT NULL DEFAULT 1,
    "defaultDuration" INTEGER NOT NULL DEFAULT 3,
    "tickLogic" TEXT NOT NULL DEFAULT '{}',
    "statModifiers" TEXT NOT NULL DEFAULT '{}',
    "battleHooks" TEXT NOT NULL DEFAULT '{}',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/effects/default.png',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "applyVfxPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'effects/misc.json'
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuestTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'SIDE',
    "difficulty" TEXT NOT NULL DEFAULT 'NORMAL',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "prerequisiteQuestId" TEXT,
    "objectives" TEXT NOT NULL DEFAULT '[]',
    "logicBranches" TEXT NOT NULL DEFAULT '{}',
    "rewards" TEXT NOT NULL DEFAULT '[]',
    "isTimeLimited" BOOLEAN NOT NULL DEFAULT false,
    "expiryHours" INTEGER NOT NULL DEFAULT 0,
    "requiredRegion" TEXT,
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/quests/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'quests/misc.json'
);
INSERT INTO "new_QuestTemplate" ("category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards") SELECT "category", "description", "difficulty", "expiryHours", "filePath", "iconPath", "id", "isTimeLimited", "logicBranches", "minLevel", "name", "objectives", "prerequisiteQuestId", "requiredRegion", "rewards" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
