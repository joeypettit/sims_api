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
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_client_1.default.lineItemUnit.findMany({
            select: {
                id: true,
                name: true,
            },
        });
        res.status(200).send(result);
    }
    catch (error) {
        console.error("Error fetching units:", error);
        res.status(500).json({ error: "An error occurred while fetching units." });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitName } = req.body;
    if (!unitName) {
        res.status(400).json({ error: "Unit name is required" });
        return;
    }
    try {
        const newUnit = yield prisma_client_1.default.lineItemUnit.create({
            data: {
                name: unitName,
            },
        });
        res.status(201).json(newUnit);
    }
    catch (error) {
        console.error("Error creating new unit:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating new unit" });
    }
}));
router.delete("/:unitId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { unitId } = req.params;
    try {
        // Check if the unit is being used by any line items
        const lineItemsUsingUnit = yield prisma_client_1.default.lineItem.findFirst({
            where: {
                unitId: unitId
            }
        });
        if (lineItemsUsingUnit) {
            res.status(400).json({ error: "Cannot delete unit as it is being used by line items" });
            return;
        }
        yield prisma_client_1.default.lineItemUnit.delete({
            where: {
                id: unitId
            }
        });
        res.status(200).json({ message: "Unit deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting unit:", error);
        res.status(500).json({ error: "An error occurred while deleting the unit" });
    }
}));
exports.default = router;
