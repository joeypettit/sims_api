import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Product Tiers
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

  // Create Group Categories
  const productsCategory = await prisma.groupCategory.create({
    data: {
      name: "Products",
    },
  });

  const servicesCategory = await prisma.groupCategory.create({
    data: {
      name: "Services",
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
            lineItemGroups: {
              create: [
                {
                  name: "Cabinets",
                  groupCategory: {
                    connect: { id: productsCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Custom Cabinets",
                        quantity: 10,
                        marginDecimal: 0.2,
                        unit: {
                          connect: { id: pieceUnit.id },
                        },
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 5000,
                              priceAdjustmentDecimal: 0.15,
                              description:
                                "Premier custom cabinets with wood finish.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 4000,
                              highCostInDollarsPerUnit: 6000,
                              priceAdjustmentDecimal: 0.1,
                              description:
                                "Luxury cabinets with custom hardware.",
                              productTier: {
                                connect: { id: luxuryTier.id },
                              },
                              isSelected: false,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Flooring",
                  groupCategory: {
                    connect: { id: servicesCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Hardwood Flooring",
                        quantity: 500,
                        marginDecimal: 0.12,
                        unit: {
                          connect: { id: squareFootUnit.id },
                        },
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 2000,
                              highCostInDollarsPerUnit: 4000,
                              priceAdjustmentDecimal: 0.05,
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
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Smith Living Room Update",
      description: "Modern living room with new furniture and flooring.",
      clients: {
        connect: [{ id: client2.id }],
      },
      users: {
        connect: [{ id: user2.id }],
      },
      areas: {
        create: [
          {
            name: "Living Room",
            lineItemGroups: {
              create: [
                {
                  name: "Furniture",
                  groupCategory: {
                    connect: { id: productsCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Sofa Set",
                        quantity: 1,
                        marginDecimal: 0.18,
                        unit: {
                          connect: { id: pieceUnit.id },
                        },
                        lineItemOptions: {
                          create: [
                            {
                              exactCostInDollarsPerUnit: 2000,
                              priceAdjustmentDecimal: 0.08,
                              description: "Luxury leather sofa set.",
                              productTier: {
                                connect: { id: luxuryTier.id },
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
