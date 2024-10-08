/*
  Warnings:

  - You are about to drop the `ProductOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductOption" DROP CONSTRAINT "ProductOption_lineItemId_fkey";

-- DropForeignKey
ALTER TABLE "ProductOption" DROP CONSTRAINT "ProductOption_productTierId_fkey";

-- DropTable
DROP TABLE "ProductOption";

-- CreateTable
CREATE TABLE "LineItemOption" (
    "id" TEXT NOT NULL,
    "lowCostInDollars" DOUBLE PRECISION,
    "highCostInDollars" DOUBLE PRECISION,
    "exactCostInDollars" DOUBLE PRECISION,
    "marginPercent" DOUBLE PRECISION NOT NULL,
    "adjustment" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "productTierId" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL,
    "lineItemId" TEXT NOT NULL,

    CONSTRAINT "LineItemOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LineItemOption" ADD CONSTRAINT "LineItemOption_productTierId_fkey" FOREIGN KEY ("productTierId") REFERENCES "ProductTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemOption" ADD CONSTRAINT "LineItemOption_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
