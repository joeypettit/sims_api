-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitId" TEXT NOT NULL,
    "marginDecimal" DOUBLE PRECISION NOT NULL,
    "lineItemGroupId" TEXT NOT NULL,

    CONSTRAINT "LineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItemUnit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LineItemUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItemOption" (
    "id" TEXT NOT NULL,
    "lowCostInDollarsPerUnit" DOUBLE PRECISION,
    "highCostInDollarsPerUnit" DOUBLE PRECISION,
    "exactCostInDollarsPerUnit" DOUBLE PRECISION,
    "priceAdjustmentDecimal" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "productTierId" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL,
    "lineItemId" TEXT NOT NULL,

    CONSTRAINT "LineItemOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineItemGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectAreaId" TEXT NOT NULL,
    "groupCategoryId" TEXT NOT NULL,

    CONSTRAINT "LineItemGroup_pkey" PRIMARY KEY ("id")
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
ALTER TABLE "ProjectArea" ADD CONSTRAINT "ProjectArea_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "LineItemUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItem" ADD CONSTRAINT "LineItem_lineItemGroupId_fkey" FOREIGN KEY ("lineItemGroupId") REFERENCES "LineItemGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemOption" ADD CONSTRAINT "LineItemOption_productTierId_fkey" FOREIGN KEY ("productTierId") REFERENCES "ProductTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemOption" ADD CONSTRAINT "LineItemOption_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineItemGroup" ADD CONSTRAINT "LineItemGroup_projectAreaId_fkey" FOREIGN KEY ("projectAreaId") REFERENCES "ProjectArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
