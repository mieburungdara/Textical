-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SetBonusCondition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bonusId" INTEGER NOT NULL,
    "conditionType" TEXT NOT NULL,
    "conditionValue" TEXT NOT NULL,
    CONSTRAINT "SetBonusCondition_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "EquipmentSetBonus" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SetBonusCondition" ("bonusId", "conditionType", "conditionValue", "id") SELECT "bonusId", "conditionType", "conditionValue", "id" FROM "SetBonusCondition";
DROP TABLE "SetBonusCondition";
ALTER TABLE "new_SetBonusCondition" RENAME TO "SetBonusCondition";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
