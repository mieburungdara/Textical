-- DropForeignKey
ALTER TABLE "Hero" DROP CONSTRAINT "Hero_userId_fkey";

-- AlterTable
ALTER TABLE "Hero" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Hero" ADD CONSTRAINT "Hero_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
