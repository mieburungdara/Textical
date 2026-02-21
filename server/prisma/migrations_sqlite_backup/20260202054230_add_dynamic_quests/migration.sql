-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QuestTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "minReputation" INTEGER NOT NULL DEFAULT 0,
    "factionId" INTEGER,
    "isDynamic" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    CONSTRAINT "QuestTemplate_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "Faction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QuestTemplate" ("description", "factionId", "id", "minReputation", "name") SELECT "description", "factionId", "id", "minReputation", "name" FROM "QuestTemplate";
DROP TABLE "QuestTemplate";
ALTER TABLE "new_QuestTemplate" RENAME TO "QuestTemplate";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
