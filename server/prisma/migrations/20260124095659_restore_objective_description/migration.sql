-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DialogueTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" TEXT NOT NULL DEFAULT 'Unknown'
);
INSERT INTO "new_DialogueTemplate" ("id") SELECT "id" FROM "DialogueTemplate";
DROP TABLE "DialogueTemplate";
ALTER TABLE "new_DialogueTemplate" RENAME TO "DialogueTemplate";
CREATE TABLE "new_QuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "QuestObjective_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QuestObjective" ("amount", "id", "questId", "targetId", "type") SELECT "amount", "id", "questId", "targetId", "type" FROM "QuestObjective";
DROP TABLE "QuestObjective";
ALTER TABLE "new_QuestObjective" RENAME TO "QuestObjective";
CREATE TABLE "new_StatusEffectTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'None'
);
INSERT INTO "new_StatusEffectTemplate" ("id") SELECT "id" FROM "StatusEffectTemplate";
DROP TABLE "StatusEffectTemplate";
ALTER TABLE "new_StatusEffectTemplate" RENAME TO "StatusEffectTemplate";
CREATE TABLE "new_HallOfFame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalId" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_HallOfFame" ("id") SELECT "id" FROM "HallOfFame";
DROP TABLE "HallOfFame";
ALTER TABLE "new_HallOfFame" RENAME TO "HallOfFame";
CREATE TABLE "new_MarketHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "soldPrice" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_MarketHistory" ("id") SELECT "id" FROM "MarketHistory";
DROP TABLE "MarketHistory";
ALTER TABLE "new_MarketHistory" RENAME TO "MarketHistory";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
