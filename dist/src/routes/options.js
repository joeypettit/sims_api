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
const options_services_1 = require("../services/options-services");
const auth_1 = require("../middleware/auth");
const optionsService = new options_services_1.OptionsService();
router.use(auth_1.isAuthenticated);
router.get("/:optionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lineItemId = req.params.optionId;
    try {
        if (!lineItemId) {
            res.status(400).json({ error: "Option ID is required" });
            return;
        }
        const result = undefined;
        if (!result) {
            res.status(404).json({ error: "option not found" });
            return;
        }
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error fetching option:", error);
        res.status(500).json({ error: "An error occurred while fetching option" });
    }
}));
router.put("/:optionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, priceAdjustmentMultiplier, exactCostInDollarsPerUnit, highCostInDollarsPerUnit, lowCostInDollarsPerUnit, isSelected, optionTierId, } = req.body;
    const { optionId } = req.params;
    try {
        const option = yield optionsService.update({
            optionId,
            description,
            exactCostInDollarsPerUnit,
            highCostInDollarsPerUnit,
            lowCostInDollarsPerUnit,
            priceAdjustmentMultiplier,
            isSelected,
            optionTierId,
        });
        res.status(200).json(option);
    }
    catch (error) {
        console.error("Error updating line item:", error);
        res
            .status(500)
            .json({ error: "An error occurred while updating the line item" });
    }
}));
exports.default = router;
