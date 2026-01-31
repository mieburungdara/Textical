-- CreateTable
CREATE TABLE "NPCSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "hourStart" INTEGER NOT NULL,
    "hourEnd" INTEGER NOT NULL,
    "targetRegionId" INTEGER NOT NULL,
    CONSTRAINT "NPCSchedule_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NPCSchedule_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NPCEventReaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "npcId" INTEGER NOT NULL,
    "eventTemplateId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetRegionId" INTEGER,
    "overrideDialogueId" INTEGER,
    CONSTRAINT "NPCEventReaction_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPCTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NPCEventReaction_eventTemplateId_fkey" FOREIGN KEY ("eventTemplateId") REFERENCES "WorldEventTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NPCEventReaction_targetRegionId_fkey" FOREIGN KEY ("targetRegionId") REFERENCES "RegionTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
