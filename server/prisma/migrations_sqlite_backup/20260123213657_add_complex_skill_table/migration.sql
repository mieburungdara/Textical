-- CreateTable
CREATE TABLE "SkillTemplate" (
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
    "sfxPath" TEXT NOT NULL DEFAULT '',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'skills/misc.json'
);
