-- CreateTable
CREATE TABLE "RegionalDailyTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "regionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "requiredCount" INTEGER NOT NULL,
    "silverReward" INTEGER NOT NULL DEFAULT 500,
    "repReward" INTEGER NOT NULL DEFAULT 10,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegionalDailyTask_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "RegionTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayerDailyTaskProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "currentCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACCEPTED',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlayerDailyTaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "RegionalDailyTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerDailyTaskProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
