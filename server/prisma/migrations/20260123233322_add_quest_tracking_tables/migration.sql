-- CreateTable
CREATE TABLE "UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "questId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserQuestObjective" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userQuestId" INTEGER NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "currentAmount" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserQuestObjective_userQuestId_fkey" FOREIGN KEY ("userQuestId") REFERENCES "UserQuest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuestObjective_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "QuestObjective" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ItemAffix" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PREFIX',
    "modifiers" TEXT NOT NULL DEFAULT '{}',
    "allowedCategories" TEXT NOT NULL DEFAULT '[]',
    "minItemLevel" INTEGER NOT NULL DEFAULT 1,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON'
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_userId_questId_key" ON "UserQuest"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestObjective_userQuestId_objectiveId_key" ON "UserQuestObjective"("userQuestId", "objectiveId");
