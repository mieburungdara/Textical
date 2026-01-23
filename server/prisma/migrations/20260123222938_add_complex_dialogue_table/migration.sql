-- CreateTable
CREATE TABLE "DialogueTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "npcId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "branches" TEXT NOT NULL DEFAULT '[]',
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "triggers" TEXT NOT NULL DEFAULT '[]',
    "mood" TEXT NOT NULL DEFAULT 'NEUTRAL',
    "portraitPath" TEXT NOT NULL DEFAULT '',
    "filePath" TEXT NOT NULL DEFAULT 'dialogues/misc.json'
);
