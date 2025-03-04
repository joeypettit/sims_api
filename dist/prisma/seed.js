"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_utils_1 = require("../auth/password-utils");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Aaron Harrison as super admin
        const aaronPassword = yield (0, password_utils_1.hashPassword)('password123');
        const aaron = yield prisma.userAccount.create({
            data: {
                email: 'aaron@simsincorporated.com',
                passwordHash: aaronPassword,
                role: client_1.UserRole.SUPER_ADMIN,
                user: {
                    create: {
                        firstName: 'Aaron',
                        lastName: 'Harrison'
                    }
                }
            }
        });
        // Create Joey Pettit as super admin
        const joeyPassword = yield (0, password_utils_1.hashPassword)('password123');
        const joey = yield prisma.userAccount.create({
            data: {
                email: 'joeywpettit@gmail.com',
                passwordHash: joeyPassword,
                role: client_1.UserRole.SUPER_ADMIN,
                user: {
                    create: {
                        firstName: 'Joey',
                        lastName: 'Pettit'
                    }
                }
            }
        });
        console.log('Created super admin users:', { aaron, joey });
        // Create User Accounts with hashed passwords
        const aliceAccount = yield prisma.userAccount.create({
            data: {
                email: "alice@example.com",
                passwordHash: yield (0, password_utils_1.hashPassword)("password123"),
                role: client_1.UserRole.ADMIN,
                user: {
                    create: {
                        firstName: "Alice",
                        lastName: "Johnson"
                    }
                }
            }
        });
        const aliceUser = yield prisma.user.findUnique({
            where: { userAccountId: aliceAccount.id }
        });
        const bobAccount = yield prisma.userAccount.create({
            data: {
                email: "bob@example.com",
                passwordHash: yield (0, password_utils_1.hashPassword)("password123"),
                role: client_1.UserRole.USER,
                user: {
                    create: {
                        firstName: "Bob",
                        lastName: "Williams"
                    }
                }
            }
        });
        const bobUser = yield prisma.user.findUnique({
            where: { userAccountId: bobAccount.id }
        });
        if (!aliceUser || !bobUser) {
            throw new Error("Failed to create user accounts properly");
        }
        // Create Product Tiers
        const premierTier = yield prisma.optionTier.create({
            data: {
                tierLevel: 1,
                name: "Premier",
            },
        });
        const designerTier = yield prisma.optionTier.create({
            data: {
                tierLevel: 2,
                name: "Designer",
            },
        });
        const luxuryTier = yield prisma.optionTier.create({
            data: {
                tierLevel: 3,
                name: "Luxury",
            },
        });
        // Create Line Item Units
        const squareFootUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Square Feet",
            },
        });
        const piecesUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Pieces",
            },
        });
        const slabUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Slabs",
            },
        });
        const sheetUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Sheets",
            },
        });
        const gallonUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Gallons",
            },
        });
        const linearFootUnit = yield prisma.lineItemUnit.create({
            data: {
                name: "Linear Foot",
            },
        });
        // Create Group Categories
        const productsCategory = yield prisma.groupCategory.create({
            data: {
                name: "Products",
            },
        });
        const laborCategory = yield prisma.groupCategory.create({
            data: {
                name: "Labor",
            },
        });
        // Create Clients
        const client1 = yield prisma.client.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "(555) 123-4567"
            },
        });
        const client2 = yield prisma.client.create({
            data: {
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com",
                phone: "(555) 987-6543"
            },
        });
        // Create Projects and Related Data
        // This project will be assigned to Alice (Admin) as the project manager and Bob (User) as the sales person
        const project1 = yield prisma.project.create({
            data: {
                name: "Doe Family Kitchen Remodel",
                description: "A complete kitchen renovation with modern cabinets, countertops, and flooring.",
                clients: {
                    connect: [{ id: client1.id }],
                },
                users: {
                    connect: [{ id: aliceUser.id }, { id: bobUser.id }],
                },
                areas: {
                    create: [
                        {
                            name: "Master Bathroom Remodel",
                            lineItemGroups: {
                                create: [
                                    {
                                        name: "Permits",
                                        groupCategory: {
                                            connect: { id: laborCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Building Permit",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Basic Permit",
                                                                optionTier: {
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
                                                    indexInGroup: 1,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Basic Permit for Plumbing",
                                                                optionTier: {
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
                                            connect: { id: laborCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Project Management",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier Management",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Designer Management",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 6000,
                                                                highCostInDollarsPerUnit: 10000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Luxury Management",
                                                                optionTier: {
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
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier custom cabinets with wood finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury cabinets with custom hardware.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 3500,
                                                                highCostInDollarsPerUnit: 4500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer cabinets with modern handles.",
                                                                optionTier: {
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
                                                    indexInGroup: 1,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Premier cabinet shelves with reinforced wood.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury reinforced shelves.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer reinforced shelves.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Cabinet Hardware",
                                                    quantity: 10,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 2,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 1500,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier cabinet hardware with premium finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 800,
                                                                highCostInDollarsPerUnit: 1800,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Luxury cabinet hardware with designer finish.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 700,
                                                                highCostInDollarsPerUnit: 1600,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer cabinet hardware with stylish finish.",
                                                                optionTier: {
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
                                                    name: "Countertops",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: slabUnit.id,
                                                    indexInGroup: 2,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Luxury granite countertops with custom edges.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4500,
                                                                highCostInDollarsPerUnit: 7000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier laminate countertops with polished finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer marble countertops with custom patterns.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Backsplash",
                                                    quantity: 1,
                                                    marginDecimal: 0.18,
                                                    unitId: slabUnit.id,
                                                    indexInGroup: 4,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 2500,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury marble backsplash with intricate design.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 4000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier backsplash with subtle textures.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer ceramic backsplash with custom patterns.",
                                                                optionTier: {
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
                                        name: "Flooring",
                                        groupCategory: {
                                            connect: { id: productsCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Flooring Material",
                                                    quantity: 1,
                                                    marginDecimal: 0.15,
                                                    unitId: squareFootUnit.id,
                                                    indexInGroup: 4,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier hardwood flooring material.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer vinyl plank flooring material.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2500,
                                                                highCostInDollarsPerUnit: 4000,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury marble flooring material.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Flooring Baseboard",
                                                    quantity: 1,
                                                    marginDecimal: 0.18,
                                                    unitId: linearFootUnit.id,
                                                    indexInGroup: 5,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 1000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier wooden baseboard.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 700,
                                                                highCostInDollarsPerUnit: 1200,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer MDF baseboard with custom finish.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 1000,
                                                                highCostInDollarsPerUnit: 1500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury crown molding baseboard.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Flooring Finish",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: gallonUnit.id,
                                                    indexInGroup: 6,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 300,
                                                                highCostInDollarsPerUnit: 500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier protective wood finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 400,
                                                                highCostInDollarsPerUnit: 600,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer satin finish for flooring.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 800,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury high-gloss marble finish.",
                                                                optionTier: {
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
                        {
                            name: "Kitchen Remodel",
                            lineItemGroups: {
                                create: [
                                    {
                                        name: "Permits",
                                        groupCategory: {
                                            connect: { id: laborCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Building Permit",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Basic Permit",
                                                                optionTier: {
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
                                                    indexInGroup: 1,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Basic Permit for Plumbing",
                                                                optionTier: {
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
                                            connect: { id: laborCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Project Management",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier Management",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Designer Management",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 6000,
                                                                highCostInDollarsPerUnit: 10000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Luxury Management",
                                                                optionTier: {
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
                                                    indexInGroup: 0,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier custom cabinets with wood finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury cabinets with custom hardware.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 3500,
                                                                highCostInDollarsPerUnit: 4500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer cabinets with modern handles.",
                                                                optionTier: {
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
                                                    indexInGroup: 1,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Premier cabinet shelves with reinforced wood.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury reinforced shelves.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer reinforced shelves.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Cabinet Hardware",
                                                    quantity: 10,
                                                    marginDecimal: 0.2,
                                                    unitId: piecesUnit.id,
                                                    indexInGroup: 2,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 1500,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier cabinet hardware with premium finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 800,
                                                                highCostInDollarsPerUnit: 1800,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Luxury cabinet hardware with designer finish.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 700,
                                                                highCostInDollarsPerUnit: 1600,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer cabinet hardware with stylish finish.",
                                                                optionTier: {
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
                                                    name: "Countertops",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: slabUnit.id,
                                                    indexInGroup: 2,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 3000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Luxury granite countertops with custom edges.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4500,
                                                                highCostInDollarsPerUnit: 7000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier laminate countertops with polished finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 4000,
                                                                highCostInDollarsPerUnit: 6000,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer marble countertops with custom patterns.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Backsplash",
                                                    quantity: 1,
                                                    marginDecimal: 0.18,
                                                    unitId: slabUnit.id,
                                                    indexInGroup: 4,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 2500,
                                                                highCostInDollarsPerUnit: 5000,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury marble backsplash with intricate design.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 4000,
                                                                priceAdjustmentMultiplier: 0.15,
                                                                description: "Premier backsplash with subtle textures.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer ceramic backsplash with custom patterns.",
                                                                optionTier: {
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
                                        name: "Flooring",
                                        groupCategory: {
                                            connect: { id: productsCategory.id },
                                        },
                                        lineItems: {
                                            create: [
                                                {
                                                    name: "Flooring Material",
                                                    quantity: 1,
                                                    marginDecimal: 0.15,
                                                    unitId: squareFootUnit.id,
                                                    indexInGroup: 4,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 1500,
                                                                highCostInDollarsPerUnit: 3000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier hardwood flooring material.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2000,
                                                                highCostInDollarsPerUnit: 3500,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer vinyl plank flooring material.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 2500,
                                                                highCostInDollarsPerUnit: 4000,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury marble flooring material.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Flooring Baseboard",
                                                    quantity: 1,
                                                    marginDecimal: 0.18,
                                                    unitId: linearFootUnit.id,
                                                    indexInGroup: 5,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 1000,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier wooden baseboard.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 700,
                                                                highCostInDollarsPerUnit: 1200,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Designer MDF baseboard with custom finish.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 1000,
                                                                highCostInDollarsPerUnit: 1500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Luxury crown molding baseboard.",
                                                                optionTier: {
                                                                    connect: { id: luxuryTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    name: "Flooring Finish",
                                                    quantity: 1,
                                                    marginDecimal: 0.2,
                                                    unitId: gallonUnit.id,
                                                    indexInGroup: 6,
                                                    lineItemOptions: {
                                                        create: [
                                                            {
                                                                lowCostInDollarsPerUnit: 300,
                                                                highCostInDollarsPerUnit: 500,
                                                                priceAdjustmentMultiplier: 0.1,
                                                                description: "Premier protective wood finish.",
                                                                optionTier: {
                                                                    connect: { id: premierTier.id },
                                                                },
                                                                isSelected: true,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 400,
                                                                highCostInDollarsPerUnit: 600,
                                                                priceAdjustmentMultiplier: 0.12,
                                                                description: "Designer satin finish for flooring.",
                                                                optionTier: {
                                                                    connect: { id: designerTier.id },
                                                                },
                                                                isSelected: false,
                                                            },
                                                            {
                                                                lowCostInDollarsPerUnit: 500,
                                                                highCostInDollarsPerUnit: 800,
                                                                priceAdjustmentMultiplier: 0.2,
                                                                description: "Luxury high-gloss marble finish.",
                                                                optionTier: {
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
        const templateOne = yield prisma.areaTemplate.create({
            data: {
                name: "Bathroom Template",
                projectArea: {
                    create: {
                        name: "",
                        lineItemGroups: {
                            create: [
                                {
                                    name: "Permits",
                                    groupCategory: {
                                        connect: { id: laborCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Building Permit",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Basic Permit",
                                                            optionTier: {
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
                                                indexInGroup: 1,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Basic Permit for Plumbing",
                                                            optionTier: {
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
                                        connect: { id: laborCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Project Management",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier Management",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Designer Management",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 6000,
                                                            highCostInDollarsPerUnit: 10000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Luxury Management",
                                                            optionTier: {
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
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier custom cabinets with wood finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury cabinets with custom hardware.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 3500,
                                                            highCostInDollarsPerUnit: 4500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer cabinets with modern handles.",
                                                            optionTier: {
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
                                                indexInGroup: 1,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Premier cabinet shelves with reinforced wood.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury reinforced shelves.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer reinforced shelves.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Cabinet Hardware",
                                                quantity: 10,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 2,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 1500,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier cabinet hardware with premium finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 800,
                                                            highCostInDollarsPerUnit: 1800,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Luxury cabinet hardware with designer finish.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 700,
                                                            highCostInDollarsPerUnit: 1600,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer cabinet hardware with stylish finish.",
                                                            optionTier: {
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
                                                name: "Countertops",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: slabUnit.id,
                                                indexInGroup: 2,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Luxury granite countertops with custom edges.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4500,
                                                            highCostInDollarsPerUnit: 7000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier laminate countertops with polished finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer marble countertops with custom patterns.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Backsplash",
                                                quantity: 1,
                                                marginDecimal: 0.18,
                                                unitId: slabUnit.id,
                                                indexInGroup: 4,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 2500,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury marble backsplash with intricate design.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 4000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier backsplash with subtle textures.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer ceramic backsplash with custom patterns.",
                                                            optionTier: {
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
                                    name: "Flooring",
                                    groupCategory: {
                                        connect: { id: productsCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Flooring Material",
                                                quantity: 1,
                                                marginDecimal: 0.15,
                                                unitId: squareFootUnit.id,
                                                indexInGroup: 4,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier hardwood flooring material.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer vinyl plank flooring material.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2500,
                                                            highCostInDollarsPerUnit: 4000,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury marble flooring material.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Flooring Baseboard",
                                                quantity: 1,
                                                marginDecimal: 0.18,
                                                unitId: linearFootUnit.id,
                                                indexInGroup: 5,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 1000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier wooden baseboard.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 700,
                                                            highCostInDollarsPerUnit: 1200,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer MDF baseboard with custom finish.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 1000,
                                                            highCostInDollarsPerUnit: 1500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury crown molding baseboard.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Flooring Finish",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: gallonUnit.id,
                                                indexInGroup: 6,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 300,
                                                            highCostInDollarsPerUnit: 500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier protective wood finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 400,
                                                            highCostInDollarsPerUnit: 600,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer satin finish for flooring.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 800,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury high-gloss marble finish.",
                                                            optionTier: {
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
                },
            },
        });
        const templateTwo = yield prisma.areaTemplate.create({
            data: {
                name: "Kitchen Template",
                projectArea: {
                    create: {
                        name: "",
                        lineItemGroups: {
                            create: [
                                {
                                    name: "Permits",
                                    groupCategory: {
                                        connect: { id: laborCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Building Permit",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Basic Permit",
                                                            optionTier: {
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
                                                indexInGroup: 1,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Basic Permit for Plumbing",
                                                            optionTier: {
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
                                        connect: { id: laborCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Project Management",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier Management",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Designer Management",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 6000,
                                                            highCostInDollarsPerUnit: 10000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Luxury Management",
                                                            optionTier: {
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
                                                indexInGroup: 0,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier custom cabinets with wood finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury cabinets with custom hardware.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 3500,
                                                            highCostInDollarsPerUnit: 4500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer cabinets with modern handles.",
                                                            optionTier: {
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
                                                indexInGroup: 1,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Premier cabinet shelves with reinforced wood.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury reinforced shelves.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer reinforced shelves.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Cabinet Hardware",
                                                quantity: 10,
                                                marginDecimal: 0.2,
                                                unitId: piecesUnit.id,
                                                indexInGroup: 2,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 1500,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier cabinet hardware with premium finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 800,
                                                            highCostInDollarsPerUnit: 1800,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Luxury cabinet hardware with designer finish.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 700,
                                                            highCostInDollarsPerUnit: 1600,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer cabinet hardware with stylish finish.",
                                                            optionTier: {
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
                                                name: "Countertops",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: slabUnit.id,
                                                indexInGroup: 2,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 3000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Luxury granite countertops with custom edges.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4500,
                                                            highCostInDollarsPerUnit: 7000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier laminate countertops with polished finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 4000,
                                                            highCostInDollarsPerUnit: 6000,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer marble countertops with custom patterns.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Backsplash",
                                                quantity: 1,
                                                marginDecimal: 0.18,
                                                unitId: slabUnit.id,
                                                indexInGroup: 4,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 2500,
                                                            highCostInDollarsPerUnit: 5000,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury marble backsplash with intricate design.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 4000,
                                                            priceAdjustmentMultiplier: 0.15,
                                                            description: "Premier backsplash with subtle textures.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer ceramic backsplash with custom patterns.",
                                                            optionTier: {
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
                                    name: "Flooring",
                                    groupCategory: {
                                        connect: { id: productsCategory.id },
                                    },
                                    lineItems: {
                                        create: [
                                            {
                                                name: "Flooring Material",
                                                quantity: 1,
                                                marginDecimal: 0.15,
                                                unitId: squareFootUnit.id,
                                                indexInGroup: 4,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 1500,
                                                            highCostInDollarsPerUnit: 3000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier hardwood flooring material.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2000,
                                                            highCostInDollarsPerUnit: 3500,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer vinyl plank flooring material.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 2500,
                                                            highCostInDollarsPerUnit: 4000,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury marble flooring material.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Flooring Baseboard",
                                                quantity: 1,
                                                marginDecimal: 0.18,
                                                unitId: linearFootUnit.id,
                                                indexInGroup: 5,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 1000,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier wooden baseboard.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 700,
                                                            highCostInDollarsPerUnit: 1200,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Designer MDF baseboard with custom finish.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 1000,
                                                            highCostInDollarsPerUnit: 1500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Luxury crown molding baseboard.",
                                                            optionTier: {
                                                                connect: { id: luxuryTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                name: "Flooring Finish",
                                                quantity: 1,
                                                marginDecimal: 0.2,
                                                unitId: gallonUnit.id,
                                                indexInGroup: 6,
                                                lineItemOptions: {
                                                    create: [
                                                        {
                                                            lowCostInDollarsPerUnit: 300,
                                                            highCostInDollarsPerUnit: 500,
                                                            priceAdjustmentMultiplier: 0.1,
                                                            description: "Premier protective wood finish.",
                                                            optionTier: {
                                                                connect: { id: premierTier.id },
                                                            },
                                                            isSelected: true,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 400,
                                                            highCostInDollarsPerUnit: 600,
                                                            priceAdjustmentMultiplier: 0.12,
                                                            description: "Designer satin finish for flooring.",
                                                            optionTier: {
                                                                connect: { id: designerTier.id },
                                                            },
                                                            isSelected: false,
                                                        },
                                                        {
                                                            lowCostInDollarsPerUnit: 500,
                                                            highCostInDollarsPerUnit: 800,
                                                            priceAdjustmentMultiplier: 0.2,
                                                            description: "Luxury high-gloss marble finish.",
                                                            optionTier: {
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
                },
            },
        });
        console.log("Seeding completed!");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
