-- AlterTable
ALTER TABLE "HeroTrait" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ItemInstanceTrait" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "ItemTrait" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "MonsterTrait" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1;
