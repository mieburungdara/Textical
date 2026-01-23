-- CreateTable
CREATE TABLE "BehaviourTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetWeights" TEXT NOT NULL DEFAULT '{}',
    "movementStyle" TEXT NOT NULL DEFAULT 'BALANCED',
    "tacticTriggers" TEXT NOT NULL DEFAULT '[]',
    "cohesionWeight" REAL NOT NULL DEFAULT 0.5,
    "requirements" TEXT NOT NULL DEFAULT '{}',
    "filePath" TEXT NOT NULL DEFAULT 'behaviors/misc.json'
);
