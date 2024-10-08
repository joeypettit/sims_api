/*
  Warnings:

  - You are about to drop the column `adjustment` on the `LineItemOption` table. All the data in the column will be lost.
  - You are about to drop the column `marginPercent` on the `LineItemOption` table. All the data in the column will be lost.
  - Added the required column `marginPercent` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceAdjustmentPercentage` to the `LineItemOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LineItem" ADD COLUMN     "marginPercent" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "LineItemOption" DROP COLUMN "adjustment",
DROP COLUMN "marginPercent",
ADD COLUMN     "priceAdjustmentPercentage" DOUBLE PRECISION NOT NULL;
