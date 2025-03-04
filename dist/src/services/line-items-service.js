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
exports.LineItemsService = void 0;
const line_items_repo_1 = __importDefault(require("../repository/line-items-repo"));
const lineItemsRepo = new line_items_repo_1.default();
class LineItemsService {
    updateIndexInGroup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ lineItemId, indexInGroup }) {
            try {
                const lineItem = yield lineItemsRepo.updateIndexInGroup({ lineItemId, indexInGroup });
                return lineItem;
            }
            catch (error) {
                console.error("Error updating index in group", error);
                throw error;
            }
        });
    }
}
exports.LineItemsService = LineItemsService;
