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
const groups_service_1 = require("../services/groups-service");
const auth_1 = require("../middleware/auth");
const groupsService = new groups_service_1.GroupsService();
router.use(auth_1.isAuthenticated);
router.get("/all-categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let result = null;
    try {
        result = yield prisma_client_1.default.groupCategory.findMany();
    }
    catch (error) {
        console.log("Error fetching all group categories", error);
    }
    if (result) {
        res.send(result);
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId, projectAreaId, groupName } = req.body;
    // Input validation
    if (!categoryId || !projectAreaId || !groupName) {
        res
            .status(400)
            .json({ error: "categoryId, projectAreaId, and name are required" });
        return;
    }
    try {
        const newGroup = yield groupsService.createGroup({ categoryId, groupName, projectAreaId });
        res.status(201).json(newGroup);
    }
    catch (error) {
        console.error("Error creating new group:", error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the group" });
    }
}));
router.put("/:groupId/update-isopen", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { isOpen } = req.body;
    const result = yield prisma_client_1.default.lineItemGroup.update({
        where: {
            id: groupId,
        },
        data: {
            isOpen: isOpen,
        },
    });
    res.send(result);
}));
router.put("/update-isopen-by-area", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { isOpen, areaId } = req.body;
    const result = yield groupsService.setIsOpenOnAllGroupsInArea({ areaId, isOpen });
    res.send(result);
}));
router.put("/:groupId/set-index-in-category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId } = req.params;
    const { categoryId, newIndex } = req.body;
    try {
        const result = yield groupsService.setGroupIndexInCategory({ groupId, categoryId, newIndex });
        res.send(result);
    }
    catch (error) {
        console.error("Error setting index in category:", error);
        res
            .status(500)
            .json({ error: "Error setting index in category" });
    }
}));
exports.default = router;
