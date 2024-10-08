/*
  Warnings:

  - You are about to drop the column `lineItemUnitId` on the `LineItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LineItem" DROP CONSTRAINT "LineItem_lineItemUnitId_fkey";

-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "lineItemUnitId";

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "LineItemUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
