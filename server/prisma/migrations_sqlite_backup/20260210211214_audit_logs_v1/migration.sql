-- CreateTable
CREATE TABLE "HeroStatAudit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "heroId" INTEGER NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeType" TEXT NOT NULL,
    "statName" TEXT,
    "previousValue" REAL,
    "newValue" REAL,
    "notes" TEXT,
    CONSTRAINT "HeroStatAudit_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "Hero" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "HeroStatAudit_heroId_recordedAt_idx" ON "HeroStatAudit"("heroId", "recordedAt");
