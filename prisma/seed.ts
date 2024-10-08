import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const premierTier = await prisma.productTier.create({
    data: {
      tierLevel: 1,
      label: "Premier",
    },
  });

  const designerTier = await prisma.productTier.create({
    data: {
      tierLevel: 2,
      label: "Designer",
    },
  });

  const luxuryTier = await prisma.productTier.create({
    data: {
      tierLevel: 3,
      label: "Luxury",
    },
  });

  // Create Line Item Units
  const squareFootUnit = await prisma.lineItemUnit.create({
    data: {
      name: "Square Feet",
    },
  });

  const pieceUnit = await prisma.lineItemUnit.create({
    data: {
      name: "Piece",
    },
  });

  const productsCategory = await prisma.groupCategory.create({
    data: {
      name: "Products",
    },
  });

  const cabinetryGroup = await prisma.lineItemGroup.create({
    data: {
      name: "Cabinetry",
      groupCategory: {
        connect: { id: productsCategory.id },
      },
    },
  });

  const plumbingCategory = await prisma.groupCategory.create({
    data: {
      name: "Products",
    },
  });

  const plumbingFixturesGroup = await prisma.lineItemGroup.create({
    data: {
      name: "Plumbing Fixtures",
      groupCategory: {
        connect: { id: productsCategory.id },
      },
    },
  });

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      firstName: "John",
      lastName: "Doe",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: "Jane",
      lastName: "Smith",
    },
  });

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Johnson",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Williams",
    },
  });

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: "Doe Family Kitchen Remodel",
      description:
        "A complete kitchen renovation with modern cabinets and flooring.",
      clients: {
        connect: [{ id: client1.id }],
      },
      users: {
        connect: [{ id: user1.id }, { id: user2.id }],
      },
      areas: {
        create: [
          {
            name: "Kitchen",
            lineItems: {
              create: [
                {
                  name: "Kitchen Sink Faucet",
                  quantity: 2,
                  marginPercent: 20,
                  unitId: pieceUnit.id,
                  lineItemGroupId: plumbingFixturesGroup.id,
                  lineItemOptions: {
                    create: [
                      {
                        lowCostInDollars: 3000,
                        highCostInDollars: 5000,
                        priceAdjustmentPercentage: 15,
                        description:
                          "Premier custom faucets with awesome finish.",
                        productTier: {
                          connect: { id: premierTier.id },
                        },
                        isSelected: true,
                      },
                      {
                        lowCostInDollars: 4000,
                        highCostInDollars: 6000,
                        priceAdjustmentPercentage: 10,
                        description:
                          "Designer faucets with really cool hardware.",
                        productTier: {
                          connect: { id: designerTier.id },
                        },
                        isSelected: false,
                      },
                      {
                        lowCostInDollars: 4000,
                        highCostInDollars: 6000,
                        priceAdjustmentPercentage: 10,
                        description: "Luxury faucets with custom hardware.",
                        productTier: {
                          connect: { id: luxuryTier.id },
                        },
                        isSelected: false,
                      },
                    ],
                  },
                },
                {
                  name: "Custom Cabinets",
                  quantity: 10,
                  marginPercent: 20,
                  unitId: pieceUnit.id,
                  lineItemGroupId: cabinetryGroup.id,
                  lineItemOptions: {
                    create: [
                      {
                        lowCostInDollars: 3000,
                        highCostInDollars: 5000,
                        priceAdjustmentPercentage: 15,
                        description:
                          "Premier custom cabinets with wood finish.",
                        productTier: {
                          connect: { id: premierTier.id },
                        },
                        isSelected: true,
                      },
                      {
                        lowCostInDollars: 4000,
                        highCostInDollars: 6000,
                        priceAdjustmentPercentage: 10,
                        description:
                          "Designer cabinets with, frankly, just OK hardware.",
                        productTier: {
                          connect: { id: luxuryTier.id },
                        },
                        isSelected: false,
                      },
                      {
                        lowCostInDollars: 4000,
                        highCostInDollars: 6000,
                        priceAdjustmentPercentage: 10,
                        description: "Luxury cabinets with custom hardware.",
                        productTier: {
                          connect: { id: luxuryTier.id },
                        },
                        isSelected: false,
                      },
                    ],
                  },
                },
                {
                  name: "Flooring",
                  quantity: 500,
                  marginPercent: 12,
                  unitId: squareFootUnit.id,
                  lineItemGroupId: cabinetryGroup.id,
                  lineItemOptions: {
                    create: [
                      {
                        lowCostInDollars: 2000,
                        highCostInDollars: 4000,
                        priceAdjustmentPercentage: 5,
                        description: "Designer-grade hardwood flooring.",
                        productTier: {
                          connect: { id: designerTier.id },
                        },
                        isSelected: true,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
