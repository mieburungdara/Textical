-- CreateTable
CREATE TABLE "Faction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserReputation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "factionId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserReputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserReputation_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DialogueNode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "isRoot" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DialogueNode_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DialogueChoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nodeId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "nextNodeId" INTEGER,
    "questId" INTEGER,
    "reputationAmount" INTEGER,
    "reputationFactionId" INTEGER,
    "triggerCombat" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "DialogueChoice_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "DialogueNode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NPCTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isWanderer" BOOLEAN NOT NULL DEFAULT false,
    "healCost" INTEGER,
    "betMultiplier" REAL,
    "betWinChance" REAL,
    "travelCost" INTEGER,
    "factionId" INTEGER,
    CONSTRAINT "NPCTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_NPCTemplate" ("betMultiplier", "betWinChance", "description", "healCost", "id", "isWanderer", "name", "title", "travelCost", "type") SELECT "betMultiplier", "betWinChance", "description", "healCost", "id", "isWanderer", "name", "title", "travelCost", "type" FROM "NPCTemplate";
DROP TABLE "NPCTemplate";
ALTER TABLE "new_NPCTemplate" RENAME TO "NPCTemplate";
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    "factionId" INTEGER,
    CONSTRAINT "QuestTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuestTemplate" ("description", "id", "name") SELECT "description", "id", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "UserReputation_userId_factionId_key" ON "UserReputation"("userId", "factionId");
