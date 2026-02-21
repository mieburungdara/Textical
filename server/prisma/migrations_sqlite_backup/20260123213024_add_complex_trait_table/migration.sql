-- CreateTable
CREATE TABLE "TraitTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "type" TEXT NOT NULL DEFAULT 'NATURAL',
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "statModifiers" TEXT NOT NULL DEFAULT '{}',
    "elementalMods" TEXT NOT NULL DEFAULT '{}',
    "battleHooks" TEXT NOT NULL DEFAULT '{}',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "conflicts" TEXT NOT NULL DEFAULT '[]',
    "iconPath" TEXT NOT NULL DEFAULT 'res://assets/icons/traits/default.png',
    "vfxPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'traits/misc.json'
);
