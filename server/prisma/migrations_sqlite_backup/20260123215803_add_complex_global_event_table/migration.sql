-- CreateTable
CREATE TABLE "GlobalEventTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'WEATHER',
    "triggerType" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "worldModifiers" TEXT NOT NULL DEFAULT '{}',
    "combatModifiers" TEXT NOT NULL DEFAULT '{}',
    "specialSpawns" TEXT NOT NULL DEFAULT '[]',
    "targetScope" TEXT NOT NULL DEFAULT 'GLOBAL',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/events/default.png',
    "filePath" TEXT NOT NULL DEFAULT 'events/misc.json'
);
