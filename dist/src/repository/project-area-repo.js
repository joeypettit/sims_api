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
const query_objects_1 = require("./query-objects");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
class ProjectAreasRepo {
    findById(_a) {
        return __awaiter(this, arguments, void 0, function* ({ areaId }) {
            try {
                const result = yield prisma_client_1.default.projectArea.findUnique(Object.assign({ where: {
                        id: areaId,
                    } }, query_objects_1.projectAreaFullSelect));
                return result;
            }
            catch (error) {
                throw Error(`Error getting area with id ${areaId}`);
            }
        });
    }
}
exports.default = ProjectAreasRepo;
