-- CreateTable
CREATE TABLE "ItemInstanceTrait" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemInstanceId" INTEGER NOT NULL,
    "traitId" INTEGER NOT NULL,
    CONSTRAINT "ItemInstanceTrait_itemInstanceId_fkey" FOREIGN KEY ("itemInstanceId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ItemInstanceTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "TraitTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
