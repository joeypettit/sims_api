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
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const auth_1 = require("../middleware/auth");
const line_items_service_1 = require("../services/line-items-service");
const options_services_1 = require("../services/options-services");
const util_1 = require("../util");
const router = express_1.default.Router();
const optionsService = new options_services_1.OptionsService();
// Apply isAuthenticated to all routes
router.use(auth_1.isAuthenticated);
router.get("/:lineItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lineItemId = req.params.lineItemId;
    try {
        if (!lineItemId) {
            res.status(400).json({ error: "Line item ID is required" });
            return;
        }
        const result = yield prisma_client_1.default.lineItem.findUnique({
            where: {
                id: lineItemId,
            },
            select: {
                id: true,
                name: true,
                unit: true,
                quantity: true,
                marginDecimal: true,
                indexInGroup: true,
                lineItemGroupId: true,
                lineItemOptions: {
                    select: {
                        id: true,
                        description: true,
                        exactCostInDollarsPerUnit: true,
                        highCostInDollarsPerUnit: true,
                        lowCostInDollarsPerUnit: true,
                        isSelected: true,
                        optionTier: true,
                        priceAdjustmentMultiplier: true,
                    },
                },
            },
        });
        if (!result) {
            res.status(404).json({ error: "Line item not found" });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while fetching line item" });
    }
}));
router.post("/create-blank", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { groupId } = req.body;
    let lastIndex = 0;
    let optionTiers = [];
    if (!groupId) {
        res.status(400).json({
            error: "groupId required",
        });
        return;
    }
    try {
        const lineItemsInGroup = yield prisma_client_1.default.lineItem.findMany({
            where: {
                lineItemGroupId: groupId,
            },
        });
        lastIndex = lineItemsInGroup.reduce((acc, current) => {
            if (acc > current.indexInGroup)
                return acc;
            return current.indexInGroup;
        }, 0);
    }
    catch (error) {
        console.error("Error finding last index of line items in group:", error);
    }
    try {
        optionTiers = yield prisma_client_1.default.optionTier.findMany({});
    }
    catch (error) {
        console.error("Error querying option tiers:", error);
    }
    try {
        const newLineItem = yield prisma_client_1.default.lineItem.create({
            data: {
                lineItemGroupId: groupId,
                name: "",
                marginDecimal: 0.1,
                quantity: 0,
                indexInGroup: lastIndex + 1,
                lineItemOptions: {
                    create: [
                        {
                            description: "",
                            priceAdjustmentMultiplier: 1,
                            exactCostInDollarsPerUnit: null,
                            highCostInDollarsPerUnit: 0,
                            lowCostInDollarsPerUnit: 0,
                            isSelected: false,
                            optionTierId: (_a = optionTiers.find((tier) => tier.tierLevel == 1)) === null || _a === void 0 ? void 0 : _a.id,
                        },
                        {
                            description: "",
                            priceAdjustmentMultiplier: 1,
                            exactCostInDollarsPerUnit: null,
                            highCostInDollarsPerUnit: 0,
                            lowCostInDollarsPerUnit: 0,
                            isSelected: false,
                            optionTierId: (_b = optionTiers.find((tier) => tier.tierLevel == 2)) === null || _b === void 0 ? void 0 : _b.id,
                        },
                        {
                            description: "",
                            priceAdjustmentMultiplier: 1,
                            exactCostInDollarsPerUnit: null,
                            highCostInDollarsPerUnit: 0,
                            lowCostInDollarsPerUnit: 0,
                            isSelected: false,
                            optionTierId: (_c = optionTiers.find((tier) => tier.tierLevel == 3)) === null || _c === void 0 ? void 0 : _c.id,
                        },
                    ],
                },
            },
        });
        res.status(201).json(newLineItem);
    }
    catch (error) {
        console.error("Error creating new line item:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating new line item" });
    }
}));
router.put("/:lineItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, marginDecimal, groupId, unitId, quantity, lineItemOptions } = req.body;
    const { lineItemId } = req.params;
    if (!name &&
        !marginDecimal &&
        !groupId &&
        !unitId &&
        !quantity &&
        !lineItemOptions) {
        res.status(400).json({
            error: "No data was recieved to update this lineitem. Please put the data into the request body.",
        });
        return;
    }
    let lineDataObj = {
        name,
        marginDecimal,
        quantity,
        lineItemGroup: undefined,
        unit: undefined,
    };
    if (groupId) {
        lineDataObj.lineItemGroup = {
            connect: { id: groupId },
        };
    }
    if (unitId) {
        lineDataObj.unit = {
            connect: { id: unitId },
        };
    }
    lineDataObj = (0, util_1.removeKeysWhereUndefined)(lineDataObj);
    yield lineItemOptions.map((option) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield optionsService.update({
                optionId: option.id,
                description: option.description,
                exactCostInDollarsPerUnit: option.exactCostInDollarsPerUnit,
                highCostInDollarsPerUnit: option.highCostInDollarsPerUnit,
                lowCostInDollarsPerUnit: option.lowCostInDollarsPerUnit,
                priceAdjustmentMultiplier: option.priceAdjustmentMultiplier,
                isSelected: option.isSelected,
                optionTierId: option.optionTier.id,
            });
        }
        catch (error) {
            console.error(`Error updating Option with id: ${option.id}`);
            res.status(500).json({
                error: `An error occurred while updating the line item option with id ${option.id}`,
            });
        }
    }));
    try {
        // Update the line item with new data
        const updatedLineItem = yield prisma_client_1.default.lineItem.update({
            where: { id: lineItemId },
            data: lineDataObj,
            select: {
                id: true,
                name: true,
                unit: true,
                quantity: true,
                marginDecimal: true,
                lineItemGroup: true,
                indexInGroup: true,
                lineItemOptions: true,
            },
        });
        res.status(200).json(updatedLineItem);
    }
    catch (error) {
        console.error("Error updating line item:", error);
        res
            .status(500)
            .json({ error: "An error occurred while updating the line item" });
    }
}));
// define the home page route
router.put("/:lineItemId/select-option/:optionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lineItemId, optionId } = req.params;
    const result = yield prisma_client_1.default.lineItemOption.update({
        where: {
            id: optionId,
        },
        data: {
            isSelected: true,
        },
    });
    res.send(result);
}));
router.put("/:lineItemId/update-quantity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lineItemId } = req.params;
    const { quantity } = req.body;
    if (quantity == null || typeof quantity !== "number" || quantity < 0) {
        res.status(400).json({ error: "Invalid quantity" });
        return;
    }
    try {
        const updatedLineItem = yield prisma_client_1.default.lineItem.update({
            where: {
                id: lineItemId,
            },
            data: {
                quantity,
            },
        });
        res.json(updatedLineItem);
    }
    catch (error) {
        console.error("Error updating line item quantity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.put("/:lineItemId/unselect-option/:optionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lineItemId, optionId } = req.params;
    const result = yield prisma_client_1.default.lineItemOption.update({
        where: {
            id: optionId,
        },
        data: {
            isSelected: false,
        },
    });
    res.send(result);
}));
router.put("/:lineItemId/set-index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lineItemId } = req.params;
    const { newIndex } = req.body;
    if (typeof newIndex !== 'number') {
        res.status(400).json({ error: "New index must be a number" });
        return;
    }
    try {
        const lineItemsService = new line_items_service_1.LineItemsService();
        const result = yield lineItemsService.updateIndexInGroup({
            lineItemId,
            indexInGroup: newIndex
        });
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred while updating the line item index" });
    }
}));
router.delete("/:lineItemId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lineItemId = req.params.lineItemId;
    try {
        if (!lineItemId) {
            res.status(400).json({ error: "Line item ID is required to delete." });
            return;
        }
        const result = yield prisma_client_1.default.lineItem.delete({
            where: {
                id: lineItemId,
            },
        });
        if (!result) {
            res.status(404).json({ error: "Line item not found" });
            return;
        }
        // Send the result if found
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching line item:", error);
        res
            .status(500)
            .json({ error: "An error occurred while fetching line item" });
    }
}));
exports.default = router;
