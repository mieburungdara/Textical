-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentDurability" INTEGER NOT NULL DEFAULT 100,
    "maxDurability" INTEGER NOT NULL DEFAULT 100,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,
    "quality" TEXT NOT NULL DEFAULT 'COMMON',
    "powerScale" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InventoryItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ItemTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InventoryItem" ("currentDurability", "id", "isTrash", "maxDurability", "quantity", "templateId", "userId") SELECT "currentDurability", "id", "isTrash", "maxDurability", "quantity", "templateId", "userId" FROM "InventoryItem";
DROP TABLE "InventoryItem";
ALTER TABLE "new_InventoryItem" RENAME TO "InventoryItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
