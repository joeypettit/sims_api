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
const project_areas_service_1 = require("../services/project-areas-service");
const router = express_1.default.Router();
const projectAreaService = new project_areas_service_1.ProjectAreasService();
const auth_1 = require("../middleware/auth");
router.use(auth_1.isAuthenticated);
router.post("/create-blank", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, projectId } = req.body;
    if (!projectId) {
        res.status(400).json({
            error: "projectId required",
        });
        return;
    }
    try {
        const newProjectArea = yield projectAreaService.createBlank({
            name,
            projectId,
        });
        res.status(201).json(newProjectArea);
    }
    catch (error) {
        console.error("Error creating New Project Area:", error);
        res.status(500).json({ error: "Error Creating New Project Area" });
    }
}));
router.post("/create-from-template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, projectId, templateId } = req.body;
    if (!projectId || !templateId) {
        res.status(400).json({
            error: "projectId and templateId are required",
        });
        return;
    }
    try {
        const newProjectArea = yield projectAreaService.createFromTemplate({
            name,
            projectId,
            templateId,
        });
        res.status(201).json(newProjectArea);
    }
    catch (error) {
        console.error("Error creating Project Area from Template:", error);
        res
            .status(500)
            .json({ error: "Error Creating Project Area from Template" });
    }
}));
router.get("/:areaId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { areaId } = req.params;
    try {
        const projectArea = yield projectAreaService.getById({ areaId });
        res.status(201).json(projectArea);
    }
    catch (error) {
        console.error(`Error getting Project Area with id ${areaId}`, error);
        res
            .status(500)
            .json({ error: "Error getting Project Area" });
    }
}));
router.get("/:areaId/cost-range", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { areaId } = req.params;
    try {
        const costRange = yield projectAreaService.calculateAreaCostRange(areaId);
        res.json(costRange);
    }
    catch (error) {
        console.error("Error getting area cost range:", error);
        res.status(500).json({ error: "Failed to calculate area cost range" });
    }
}));
router.delete("/:areaId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { areaId } = req.params;
    try {
        const deletedArea = yield projectAreaService.deleteArea({ areaId });
        res.status(200).json(deletedArea);
    }
    catch (error) {
        console.error(`Error deleting Project Area with id ${areaId}:`, error);
        res.status(500).json({ error: "Error deleting Project Area" });
    }
}));
exports.default = router;
