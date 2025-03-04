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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const auth_1 = require("../middleware/auth");
router.use(auth_1.isAuthenticated);
router.get("/area/all-templates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let templates = null;
    try {
        templates = yield prisma_client_1.default.areaTemplate.findMany({
            select: {
                id: true,
                name: true,
                projectAreaId: true,
            },
        });
    }
    catch (error) {
        console.log("error getting all templates", error);
        res.status(500).json({ error: error });
    }
    if (templates) {
        res.json(templates);
    }
}));
router.get("/area/:templateId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId } = req.params;
    let template = null;
    try {
        template = yield prisma_client_1.default.areaTemplate.findUnique({
            where: {
                id: templateId,
            },
            select: {
                id: true,
                name: true,
                projectAreaId: true,
                projectArea: {
                    select: {
                        id: true,
                        name: true,
                        lineItemGroups: {
                            select: {
                                id: true,
                                name: true,
                                groupCategory: true,
                                lineItems: {
                                    select: {
                                        id: true,
                                        marginDecimal: true,
                                        quantity: true,
                                        name: true,
                                        unit: true,
                                        lineItemGroup: {
                                            select: {
                                                groupCategory: true,
                                            },
                                        },
                                        lineItemOptions: {
                                            select: {
                                                id: true,
                                                description: true,
                                                exactCostInDollarsPerUnit: true,
                                                lowCostInDollarsPerUnit: true,
                                                highCostInDollarsPerUnit: true,
                                                isSelected: true,
                                                priceAdjustmentMultiplier: true,
                                                optionTier: {
                                                    select: {
                                                        name: true,
                                                        tierLevel: true,
                                                    },
                                                },
                                            },
                                            orderBy: {
                                                optionTier: {
                                                    tierLevel: "asc",
                                                },
                                            },
                                        },
                                    },
                                    orderBy: {
                                        indexInGroup: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }
    catch (error) {
        console.log("error getting template", error);
        res.status(500).json({ error: error });
    }
    if (template) {
        res.json(template);
    }
}));
router.post("/area/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, projectAreaId } = req.body;
    let newArea = undefined;
    let newTemplate = undefined;
    try {
        newArea = yield prisma_client_1.default.projectArea.create({ data: {} });
    }
    catch (error) {
        console.log("Error Creating Area For New Area Template");
        res.status(500).json({ error: error });
    }
    if (newArea) {
        try {
            newTemplate = yield prisma_client_1.default.areaTemplate.create({
                data: {
                    name,
                    projectAreaId: newArea.id,
                },
            });
        }
        catch (error) {
            console.log("Error Creating Area Template");
            res.status(500).json({ error: error });
        }
    }
    res.json(newTemplate);
}));
router.delete('/area/:templateId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { templateId } = req.params;
        yield prisma_client_1.default.areaTemplate.delete({
            where: { id: templateId }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
}));
exports.default = router;
