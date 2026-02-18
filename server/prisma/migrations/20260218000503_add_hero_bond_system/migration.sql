-- CreateTable
CREATE TABLE "HeroBond" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bondType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "bonuses" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "UserHeroBond" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "bondId" INTEGER NOT NULL,
    "heroIds" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserHeroBond_userId_bondId_heroIds_key" ON "UserHeroBond"("userId", "bondId", "heroIds");
