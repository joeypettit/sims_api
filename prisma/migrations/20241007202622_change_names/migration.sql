/*
  Warnings:

  - You are about to drop the `ClientsProjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTierLookup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsersProjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClientsProjects" DROP CONSTRAINT "ClientsProjects_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ClientsProjects" DROP CONSTRAINT "ClientsProjects_projectId_fkey";

-- DropForeignKey
ALTER TABLE "GroupCategory" DROP CONSTRAINT "GroupCategory_lineItemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupCategory" DROP CONSTRAINT "GroupCategory_projectAreaId_fkey";

-- DropForeignKey
ALTER TABLE "UsersProjects" DROP CONSTRAINT "UsersProjects_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UsersProjects" DROP CONSTRAINT "UsersProjects_userId_fkey";

-- DropTable
DROP TABLE "ClientsProjects";

-- DropTable
DROP TABLE "GroupCategory";

-- DropTable
DROP TABLE "ProductTierLookup";

-- DropTable
DROP TABLE "UsersProjects";

-- CreateTable
CREATE TABLE "GroupSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectAreaId" TEXT NOT NULL,
    "lineItemGroupId" TEXT,

    CONSTRAINT "GroupSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTiers" (
    "id" TEXT NOT NULL,
    "tierLevel" INTEGER NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ProductTiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserProjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserProjects_AB_unique" ON "_UserProjects"("A", "B");

-- CreateIndex
CREATE INDEX "_UserProjects_B_index" ON "_UserProjects"("B");

-- AddForeignKey
ALTER TABLE "GroupSection" ADD CONSTRAINT "GroupSection_projectAreaId_fkey" FOREIGN KEY ("projectAreaId") REFERENCES "ProjectArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupSection" ADD CONSTRAINT "GroupSection_lineItemGroupId_fkey" FOREIGN KEY ("lineItemGroupId") REFERENCES "LineItemGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserProjects" ADD CONSTRAINT "_UserProjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserProjects" ADD CONSTRAINT "_UserProjects_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
