-- CreateTable
CREATE TABLE "LootSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "looterId" INTEGER NOT NULL,
    "victimId" INTEGER NOT NULL,
    "wagonId" INTEGER,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "LootSession_looterId_fkey" FOREIGN KEY ("looterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LootSession_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LootSession_wagonId_fkey" FOREIGN KEY ("wagonId") REFERENCES "Wagon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
