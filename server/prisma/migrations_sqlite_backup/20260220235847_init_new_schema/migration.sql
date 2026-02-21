-- CreateTable
CREATE TABLE "WeaponPassive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weaponTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    CONSTRAINT "WeaponPassive_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeaponTypeTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weaponTypeId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    CONSTRAINT "WeaponTypeTag_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeaponTypeTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "MechanicTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeaponTypeTag_weaponTypeId_tagId_key" ON "WeaponTypeTag"("weaponTypeId", "tagId");
