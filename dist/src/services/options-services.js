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
exports.OptionsService = void 0;
const util_1 = require("../util");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
class OptionsService {
    update(_a) {
        return __awaiter(this, arguments, void 0, function* ({ optionId, description, priceAdjustmentMultiplier, exactCostInDollarsPerUnit, highCostInDollarsPerUnit, lowCostInDollarsPerUnit, isSelected, optionTierId, }) {
            let dataObj = {
                description,
                priceAdjustmentMultiplier,
                exactCostInDollarsPerUnit,
                highCostInDollarsPerUnit,
                lowCostInDollarsPerUnit,
                isSelected,
            };
            if (optionTierId) {
                dataObj.optionTier = { connect: { id: optionTierId } };
            }
            dataObj = (0, util_1.removeKeysWhereUndefined)(dataObj);
            try {
                const updatedOption = yield prisma_client_1.default.lineItemOption.update({
                    where: { id: optionId },
                    data: dataObj,
                });
                return updatedOption;
            }
            catch (error) {
                console.error(`Error updating option ${optionId}:`, error);
                throw Error("");
            }
        });
    }
}
exports.OptionsService = OptionsService;
