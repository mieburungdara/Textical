-- CreateTable
CREATE TABLE "SkillTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" TEXT NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "ClassSkillTree" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "classId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "unlockLevel" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "ClassSkillTree_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassSkillTree_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeroSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "HeroSkill_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HeroSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "SkillTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassSkillTree_classId_skillId_key" ON "ClassSkillTree"("classId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "HeroSkill_heroId_skillId_key" ON "HeroSkill"("heroId", "skillId");
