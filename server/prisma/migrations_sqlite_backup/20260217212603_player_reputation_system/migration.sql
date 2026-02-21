-- CreateTable
CREATE TABLE "PlayerReputation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlayerReputationStats" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "totalDislikes" INTEGER NOT NULL DEFAULT 0,
    "likeTier" INTEGER NOT NULL DEFAULT 0,
    "dislikeTier" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PlayerReputation_toUserId_idx" ON "PlayerReputation"("toUserId");

-- CreateIndex
CREATE INDEX "PlayerReputation_fromUserId_idx" ON "PlayerReputation"("fromUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerReputation_fromUserId_toUserId_key" ON "PlayerReputation"("fromUserId", "toUserId");
