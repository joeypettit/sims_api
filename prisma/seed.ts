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

  const piecesUnit = await prisma.lineItemUnit.create({
    data: {
      name: "Pieces",
    },
  });

  const slabUnit = await prisma.lineItemUnit.create({
    data: {
      name: "Slabs",
    },
  });

  const sheetUnit = await prisma.lineItemUnit.create({
    data: {
      name: "Sheets",
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

  const administrativeCategory = await prisma.groupCategory.create({
    data: {
      name: "Administrative",
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

  // Create Projects and Related Data
  const project1 = await prisma.project.create({
    data: {
      name: "Doe Family Kitchen Remodel",
      description:
        "A complete kitchen renovation with modern cabinets, countertops, and flooring.",
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
                  name: "Permits",
                  groupCategory: {
                    connect: { id: administrativeCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Building Permit",
                        quantity: 1,
                        marginDecimal: 0.2,
                        unitId: piecesUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 5000,
                              priceAdjustmentDecimal: 0.15,
                              description: "Basic Permit",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                          ],
                        },
                      },
                      {
                        name: "Plumbing Permit",
                        quantity: 5,
                        marginDecimal: 0.18,
                        unitId: piecesUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 1500,
                              highCostInDollarsPerUnit: 3000,
                              priceAdjustmentDecimal: 0.12,
                              description: "Basic Permit for Plumbing",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  name: "Project Management",
                  groupCategory: {
                    connect: { id: administrativeCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Project Management",
                        quantity: 1,
                        marginDecimal: 0.2,
                        unitId: piecesUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 5000,
                              priceAdjustmentDecimal: 0.15,
                              description: "Premier Management",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 5000,
                              priceAdjustmentDecimal: 0.15,
                              description: "Designer Management",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 5000,
                              priceAdjustmentDecimal: 0.15,
                              description: "Luxury Management",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
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
                        unitId: piecesUnit.id,
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
                            {
                              lowCostInDollarsPerUnit: 3500,
                              highCostInDollarsPerUnit: 4500,
                              priceAdjustmentDecimal: 0.12,
                              description:
                                "Designer cabinets with modern handles.",
                              productTier: {
                                connect: { id: designerTier.id },
                              },
                              isSelected: false,
                            },
                          ],
                        },
                      },
                      {
                        name: "Cabinet Shelves",
                        quantity: 5,
                        marginDecimal: 0.18,
                        unitId: piecesUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 1500,
                              highCostInDollarsPerUnit: 3000,
                              priceAdjustmentDecimal: 0.12,
                              description:
                                "Premier cabinet shelves with reinforced wood.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 2000,
                              highCostInDollarsPerUnit: 3500,
                              priceAdjustmentDecimal: 0.1,
                              description: "Luxury reinforced shelves.",
                              productTier: {
                                connect: { id: luxuryTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 2000,
                              highCostInDollarsPerUnit: 3500,
                              priceAdjustmentDecimal: 0.1,
                              description: "designer reinforced shelves.",
                              productTier: {
                                connect: { id: designerTier.id },
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
                  name: "Countertops",
                  groupCategory: {
                    connect: { id: productsCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Granite Countertops",
                        quantity: 1,
                        marginDecimal: 0.2,
                        unitId: slabUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 3000,
                              highCostInDollarsPerUnit: 6000,
                              priceAdjustmentDecimal: 0.15,
                              description:
                                "Luxury granite countertops with custom edges.",
                              productTier: {
                                connect: { id: luxuryTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 4500,
                              highCostInDollarsPerUnit: 7000,
                              priceAdjustmentDecimal: 0.1,
                              description:
                                "Premier quartz countertops with polished finish.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 4000,
                              highCostInDollarsPerUnit: 6000,
                              priceAdjustmentDecimal: 0.12,
                              description:
                                "Designer marble countertops with custom patterns.",
                              productTier: {
                                connect: { id: designerTier.id },
                              },
                              isSelected: false,
                            },
                          ],
                        },
                      },
                      {
                        name: "Quartz Countertops",
                        quantity: 1,
                        marginDecimal: 0.22,
                        unitId: slabUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 5000,
                              highCostInDollarsPerUnit: 8000,
                              priceAdjustmentDecimal: 0.2,
                              description: "Luxury quartz countertops.",
                              productTier: {
                                connect: { id: luxuryTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 4000,
                              highCostInDollarsPerUnit: 7000,
                              priceAdjustmentDecimal: 0.15,
                              description: "Premier quartz with patterns.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 4000,
                              highCostInDollarsPerUnit: 7000,
                              priceAdjustmentDecimal: 0.15,
                              description: "designer quartz with patterns.",
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
                {
                  name: "Backsplash",
                  groupCategory: {
                    connect: { id: productsCategory.id },
                  },
                  lineItems: {
                    create: [
                      {
                        name: "Glass Tile Backsplash",
                        quantity: 1,
                        marginDecimal: 0.15,
                        unitId: sheetUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 1000,
                              highCostInDollarsPerUnit: 2000,
                              priceAdjustmentDecimal: 0.1,
                              description: "Premier glass tile backsplash.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: true,
                            },
                            {
                              lowCostInDollarsPerUnit: 1500,
                              highCostInDollarsPerUnit: 2500,
                              priceAdjustmentDecimal: 0.12,
                              description:
                                "Designer ceramic backsplash with custom designs.",
                              productTier: {
                                connect: { id: designerTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 2000,
                              highCostInDollarsPerUnit: 3000,
                              priceAdjustmentDecimal: 0.2,
                              description:
                                "Luxury tile backsplash with custom grout.",
                              productTier: {
                                connect: { id: luxuryTier.id },
                              },
                              isSelected: false,
                            },
                          ],
                        },
                      },
                      {
                        name: "Ceramic Backsplash",
                        quantity: 1,
                        marginDecimal: 0.18,
                        unitId: sheetUnit.id,
                        lineItemOptions: {
                          create: [
                            {
                              lowCostInDollarsPerUnit: 1000,
                              highCostInDollarsPerUnit: 2000,
                              priceAdjustmentDecimal: 0.1,
                              description:
                                "Premier ceramic tile backsplash with modern design.",
                              productTier: {
                                connect: { id: premierTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 1000,
                              highCostInDollarsPerUnit: 2000,
                              priceAdjustmentDecimal: 0.1,
                              description:
                                "Designer ceramic tile backsplash with modern design.",
                              productTier: {
                                connect: { id: designerTier.id },
                              },
                              isSelected: false,
                            },
                            {
                              lowCostInDollarsPerUnit: 1000,
                              highCostInDollarsPerUnit: 2000,
                              priceAdjustmentDecimal: 0.1,
                              description:
                                "Luxury ceramic tile backsplash with modern design.",
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
