/*
  Warnings:

  - You are about to drop the column `sfxPath` on the `SkillTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `templateId` on the `Hero` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonsterTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "hp_base" INTEGER NOT NULL,
    "damage_base" INTEGER NOT NULL,
    "defense_base" INTEGER NOT NULL,
    "speed_base" INTEGER NOT NULL,
    "range_base" INTEGER NOT NULL,
    "exp_reward" INTEGER NOT NULL,
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "size" TEXT NOT NULL DEFAULT 'MEDIUM',
    "traits" TEXT NOT NULL DEFAULT '[]',
    "skills" TEXT NOT NULL DEFAULT '[]',
    "immunities" TEXT NOT NULL DEFAULT '[]',
    "lootTable" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'monsters/misc.json',
    CONSTRAINT "MonsterTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MonsterCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonsterTemplate" ("categoryId", "damage_base", "defense_base", "element", "exp_reward", "filePath", "hp_base", "id", "immunities", "lootTable", "name", "range_base", "size", "skills", "speed_base", "traits") SELECT "categoryId", "damage_base", "defense_base", "element", "exp_reward", "filePath", "hp_base", "id", "immunities", "lootTable", "name", "range_base", "size", "skills", "speed_base", "traits" FROM "MonsterTemplate";
DROP TABLE "MonsterTemplate";
ALTER TABLE "new_MonsterTemplate" RENAME TO "MonsterTemplate";
CREATE TABLE "new_SkillTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ATTACK',
    "element" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "manaCost" INTEGER NOT NULL DEFAULT 0,
    "staminaCost" INTEGER NOT NULL DEFAULT 0,
    "healthCost" INTEGER NOT NULL DEFAULT 0,
    "cooldown" INTEGER NOT NULL DEFAULT 3,
    "castTime" INTEGER NOT NULL DEFAULT 0,
    "damageFormula" TEXT NOT NULL DEFAULT '{}',
    "targetType" TEXT NOT NULL DEFAULT 'ENEMY',
    "aoePattern" TEXT NOT NULL DEFAULT 'SINGLE',
    "aoeSize" INTEGER NOT NULL DEFAULT 0,
    "range" INTEGER NOT NULL DEFAULT 1,
    "statusEffects" TEXT NOT NULL DEFAULT '[]',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "animationName" TEXT NOT NULL DEFAULT 'attack',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
INSERT INTO "new_SkillTemplate" ("animationName", "aoePattern", "aoeSize", "castTime", "category", "cooldown", "damageFormula", "description", "element", "filePath", "healthCost", "id", "manaCost", "name", "range", "requirements", "staminaCost", "statusEffects", "targetType", "vfxPath") SELECT "animationName", "aoePattern", "aoeSize", "castTime", "category", "cooldown", "damageFormula", "description", "element", "filePath", "healthCost", "id", "manaCost", "name", "range", "requirements", "staminaCost", "statusEffects", "targetType", "vfxPath" FROM "SkillTemplate";
DROP TABLE "SkillTemplate";
ALTER TABLE "new_SkillTemplate" RENAME TO "SkillTemplate";
CREATE TABLE "new_Hero" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'MALE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "classId" TEXT NOT NULL DEFAULT 'class_novice',
    "classTier" INTEGER NOT NULL DEFAULT 1,
    "jobId" TEXT,
    "jobLevel" INTEGER NOT NULL DEFAULT 1,
    "jobExp" INTEGER NOT NULL DEFAULT 0,
    "baseStats" TEXT NOT NULL DEFAULT '{}',
    "naturalTraits" TEXT NOT NULL DEFAULT '[]',
    "acquiredTraits" TEXT NOT NULL DEFAULT '[]',
    "unlockedBehaviors" TEXT NOT NULL DEFAULT '[]',
    "activeBehavior" TEXT NOT NULL DEFAULT 'balanced',
    "deeds" TEXT NOT NULL DEFAULT '{}',
    "hasReproduced" BOOLEAN NOT NULL DEFAULT false,
    "fatherId" TEXT,
    "motherId" TEXT,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Hero_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Hero" ("acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId") SELECT "acquiredTraits", "activeBehavior", "baseStats", "classTier", "createdAt", "deeds", "equipment", "exp", "fatherId", "gender", "generation", "hasReproduced", "id", "jobExp", "jobId", "jobLevel", "level", "motherId", "name", "naturalTraits", "race", "unlockedBehaviors", "userId" FROM "Hero";
DROP TABLE "Hero";
ALTER TABLE "new_Hero" RENAME TO "Hero";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
