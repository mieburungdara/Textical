-- CreateTable
CREATE TABLE "TraitStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "traitId" INTEGER NOT NULL,
    "statKey" TEXT NOT NULL,
    "statValue" REAL NOT NULL,
    CONSTRAINT "TraitStat_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
