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
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const query_objects_1 = require("./query-objects");
class LineItemsRepo {
    findById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ lineItemId }) {
            try {
                const result = yield prisma_client_1.default.lineItem.findUnique(Object.assign({ where: {
                        id: lineItemId,
                    } }, query_objects_1.lineItemFullSelect));
                return result;
            }
            catch (error) {
                throw Error(`Error finding lineItem with id ${lineItemId}`);
            }
        });
    }
    updateIndexInGroup(_a) {
        return __awaiter(this, arguments, void 0, function* ({ lineItemId, indexInGroup }) {
            try {
                const result = yield prisma_client_1.default.lineItem.update(Object.assign({ where: {
                        id: lineItemId,
                    }, data: {
                        indexInGroup: indexInGroup
                    } }, query_objects_1.lineItemFullSelect));
                return result;
            }
            catch (error) {
                throw Error(`Error updating index for lineItem with id ${lineItemId}`);
            }
        });
    }
}
exports.default = LineItemsRepo;
