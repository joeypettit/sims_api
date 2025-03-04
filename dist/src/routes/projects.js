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
const projects_service_1 = require("../services/projects-service");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const projectsService = new projects_service_1.ProjectsService();
// Apply isAuthenticated to all routes
router.use(auth_1.isAuthenticated);
// define the home page route
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_client_1.default.project.findMany({
        select: {
            clients: true,
            name: true,
            users: true,
            id: true,
            startDate: true,
            endDate: true,
        },
    });
    res.send(result);
}));
router.get("/get-by-id/:projectId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = req.params.projectId;
    const result = yield prisma_client_1.default.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            areas: true,
            description: true,
            clients: true,
            name: true,
            users: true,
            id: true,
            startDate: true,
            endDate: true,
        },
    });
    res.send(result);
}));
router.post("/create-blank", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, userId, startDate, endDate } = req.body;
    if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
    }
    if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
    }
    try {
        const newProject = yield prisma_client_1.default.project.create({
            data: {
                name: name,
                description: "",
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                users: {
                    connect: [{ id: userId }]
                },
            },
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        console.error("Error creating new project:", error);
        res.status(500).json({ error: "An error occurred while creating new project" });
    }
}));
router.get("/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query = '', page = '1', limit = '10' } = req.query;
        const userId = req.user.id; // Get the current user's ID
        const skip = (Number(page) - 1) * Number(limit);
        const result = yield projectsService.searchProjects({
            query: query,
            skip,
            limit: Number(limit),
            userId // Pass the userId to the service
        });
        res.json({
            projects: result.projects,
            pagination: {
                total: result.total,
                pages: Math.ceil(result.total / Number(limit)),
                currentPage: Number(page)
            }
        });
    }
    catch (error) {
        console.error('Error searching projects:', error);
        res.status(500).json({ error: 'Failed to search projects' });
    }
}));
// Add user to project
router.post("/:projectId/users", auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { userId } = req.body;
    try {
        const updatedProject = yield prisma_client_1.default.project.update({
            where: { id: projectId },
            data: {
                users: {
                    connect: { id: userId }
                }
            },
            include: {
                users: true
            }
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error("Error adding user to project:", error);
        res.status(500).json({ error: "Failed to add user to project" });
    }
}));
// Remove user from project
router.delete("/:projectId/users/:userId", auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, userId } = req.params;
    try {
        const updatedProject = yield prisma_client_1.default.project.update({
            where: { id: projectId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            },
            include: {
                users: true
            }
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error("Error removing user from project:", error);
        res.status(500).json({ error: "Failed to remove user from project" });
    }
}));
// Add client to project
router.post("/:projectId/clients", auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { clientId } = req.body;
    try {
        const updatedProject = yield prisma_client_1.default.project.update({
            where: { id: projectId },
            data: {
                clients: {
                    connect: { id: clientId }
                }
            },
            include: {
                clients: true
            }
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error("Error adding client to project:", error);
        res.status(500).json({ error: "Failed to add client to project" });
    }
}));
// Remove client from project
router.delete("/:projectId/clients/:clientId", auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, clientId } = req.params;
    try {
        const updatedProject = yield prisma_client_1.default.project.update({
            where: { id: projectId },
            data: {
                clients: {
                    disconnect: { id: clientId }
                }
            },
            include: {
                clients: true
            }
        });
        res.json(updatedProject);
    }
    catch (error) {
        console.error("Error removing client from project:", error);
        res.status(500).json({ error: "Failed to remove client from project" });
    }
}));
// Add the cost range endpoint
router.get("/:projectId/cost-range", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    try {
        const costRange = yield projectsService.calculateProjectCostRange(projectId);
        res.json(costRange);
    }
    catch (error) {
        console.error("Error getting project cost range:", error);
        res.status(500).json({ error: "Failed to calculate project cost range" });
    }
}));
router.patch('/:id/dates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { startDate, endDate } = req.body;
        const projectId = req.params.id;
        const updatedProject = yield prisma_client_1.default.project.update({
            where: { id: projectId },
            data: {
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            }
        });
        res.json(updatedProject);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project dates' });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const projectId = req.params.id;
        yield prisma_client_1.default.project.delete({
            where: { id: projectId }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
}));
router.post('/:projectId/star', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        const star = yield projectsService.starProject(userId, projectId);
        res.json(star);
    }
    catch (error) {
        console.error('Error starring project:', error);
        res.status(500).json({ error: 'Failed to star project' });
    }
}));
router.delete('/:projectId/star', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        yield projectsService.unstarProject(userId, projectId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error unstarring project:', error);
        res.status(500).json({ error: 'Failed to unstar project' });
    }
}));
router.get('/:projectId/star', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        const isStarred = yield projectsService.isProjectStarred(userId, projectId);
        res.json({ isStarred });
    }
    catch (error) {
        console.error('Error checking project star status:', error);
        res.status(500).json({ error: 'Failed to check star status' });
    }
}));
router.get('/starred', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const projects = yield projectsService.getStarredProjects(userId);
        res.json(projects);
    }
    catch (error) {
        console.error('Error getting starred projects:', error);
        res.status(500).json({ error: 'Failed to get starred projects' });
    }
}));
router.get('/my-projects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query = '', page = '1', limit = '10' } = req.query;
        const userId = req.user.id;
        const result = yield projectsService.searchMyProjects({
            query: query,
            skip: (Number(page) - 1) * Number(limit),
            limit: Number(limit),
            userId
        });
        res.json({
            projects: result.projects,
            pagination: {
                total: result.total,
                pages: Math.ceil(result.total / Number(limit)),
                currentPage: Number(page)
            }
        });
    }
    catch (error) {
        console.error('Error getting my projects:', error);
        res.status(500).json({ error: 'Failed to get my projects' });
    }
}));
exports.default = router;
