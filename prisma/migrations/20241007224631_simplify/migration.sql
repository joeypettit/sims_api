/*
  Warnings:

  - You are about to drop the column `unit` on the `LineItem` table. All the data in the column will be lost.
  - You are about to drop the column `projectAreaId` on the `LineItemGroup` table. All the data in the column will be lost.
  - You are about to drop the column `exactPriceInDollars` on the `ProductOption` table. All the data in the column will be lost.
  - You are about to drop the column `highPriceInDollars` on the `ProductOption` table. All the data in the column will be lost.
  - You are about to drop the column `lowPriceInDollars` on the `ProductOption` table. All the data in the column will be lost.
  - You are about to drop the column `productTier` on the `ProductOption` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `GroupSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserProjects` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `lineItemUnitId` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `LineItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupCategoryId` to the `LineItemGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adjustment` to the `ProductOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marginPercent` to the `ProductOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTierId` to the `ProductOption` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroupSection" DROP CONSTRAINT "GroupSection_lineItemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupSection" DROP CONSTRAINT "GroupSection_projectAreaId_fkey";

-- DropForeignKey
ALTER TABLE "LineItemGroup" DROP CONSTRAINT "LineItemGroup_projectAreaId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientId_fkey";

-- DropForeignKey
ALTER TABLE "_UserProjects" DROP CONSTRAINT "_UserProjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserProjects" DROP CONSTRAINT "_UserProjects_B_fkey";

-- AlterTable
ALTER TABLE "LineItem" DROP COLUMN "unit",
ADD COLUMN     "lineItemUnitId" TEXT NOT NULL,
ADD COLUMN     "unitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "LineItemGroup" DROP COLUMN "projectAreaId",
ADD COLUMN     "groupCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductOption" DROP COLUMN "exactPriceInDollars",
DROP COLUMN "highPriceInDollars",
DROP COLUMN "lowPriceInDollars",
DROP COLUMN "productTier",
ADD COLUMN     "adjustment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "exactCostInDollars" DOUBLE PRECISION,
ADD COLUMN     "highCostInDollars" DOUBLE PRECISION,
ADD COLUMN     "lowCostInDollars" DOUBLE PRECISION,
ADD COLUMN     "marginPercent" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "productTierId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "clientId",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "GroupSection";

-- DropTable
DROP TABLE "PhoneNumber";

-- DropTable
DROP TABLE "ProductTiers";

-- DropTable
DROP TABLE "_UserProjects";

-- CreateTable
CREATE TABLE "LineItemUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LineItemUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "GroupCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTier" (
    "id" TEXT NOT NULL,
    "tierLevel" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ProductTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClientToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProjectToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToProject_AB_unique" ON "_ClientToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToProject_B_index" ON "_ClientToProject"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUser_AB_unique" ON "_ProjectToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUser_B_index" ON "_ProjectToUser"("B");

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_lineItemUnitId_fkey" FOREIGN KEY ("lineItemUnitId") REFERENCES "LineItemUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productTierId_fkey" FOREIGN KEY ("productTierId") REFERENCES "ProductTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemGroup" ADD CONSTRAINT "LineItemGroup_groupCategoryId_fkey" FOREIGN KEY ("groupCategoryId") REFERENCES "GroupCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToProject" ADD CONSTRAINT "_ClientToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToProject" ADD CONSTRAINT "_ClientToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUser" ADD CONSTRAINT "_ProjectToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
