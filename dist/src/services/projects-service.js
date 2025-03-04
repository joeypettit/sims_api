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
exports.ProjectsService = void 0;
const projects_repo_1 = __importDefault(require("../repository/projects-repo"));
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const project_areas_service_1 = require("./project-areas-service");
const projectsRepo = new projects_repo_1.default();
const projectAreasService = new project_areas_service_1.ProjectAreasService();
class ProjectsService {
    search(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query = "", page = "1", limit = "10" }) {
            try {
                const skip = (Number(page) - 1) * Number(limit);
                const { projects, total } = yield projectsRepo.search({
                    query,
                    skip,
                    limit: Number(limit)
                });
                return {
                    projects,
                    pagination: {
                        total,
                        pages: Math.ceil(total / Number(limit)),
                        currentPage: Number(page)
                    }
                };
            }
            catch (error) {
                throw new Error(`Error searching projects: ${error}`);
            }
        });
    }
    calculateProjectCostRange(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all project areas
                const project = yield prisma_client_1.default.project.findUnique({
                    where: { id: projectId },
                    include: {
                        areas: true
                    }
                });
                if (!project) {
                    throw new Error(`Project with ID ${projectId} not found`);
                }
                // Initialize total price range
                const totalPriceRange = {
                    lowPriceInDollars: 0,
                    highPriceInDollars: 0
                };
                // Calculate total by summing up each area's cost range
                for (const area of project.areas) {
                    const areaCostRange = yield projectAreasService.calculateAreaCostRange(area.id);
                    totalPriceRange.lowPriceInDollars += areaCostRange.lowPriceInDollars;
                    totalPriceRange.highPriceInDollars += areaCostRange.highPriceInDollars;
                }
                // Round to whole dollars
                totalPriceRange.lowPriceInDollars = Math.ceil(totalPriceRange.lowPriceInDollars);
                totalPriceRange.highPriceInDollars = Math.ceil(totalPriceRange.highPriceInDollars);
                return totalPriceRange;
            }
            catch (error) {
                console.error("Error calculating project cost range:", error);
                throw new Error(`Error calculating project cost range: ${error}`);
            }
        });
    }
    calculateTotalPrice({ costPerUnit, quantity, marginDecimal, priceAdjustmentMultiplier }) {
        // Calculate sale price per unit using the margin formula
        const salePricePerUnit = (costPerUnit / (1 - marginDecimal)) * priceAdjustmentMultiplier;
        // Calculate total price
        return salePricePerUnit * quantity;
    }
    starProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield projectsRepo.starProject(userId, projectId);
            }
            catch (error) {
                throw new Error(`Error starring project: ${error}`);
            }
        });
    }
    unstarProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield projectsRepo.unstarProject(userId, projectId);
            }
            catch (error) {
                throw new Error(`Error unstarring project: ${error}`);
            }
        });
    }
    isProjectStarred(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield projectsRepo.isProjectStarred(userId, projectId);
            }
            catch (error) {
                throw new Error(`Error checking project star status: ${error}`);
            }
        });
    }
    getStarredProjects(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield projectsRepo.getStarredProjects(userId);
            }
            catch (error) {
                throw new Error(`Error getting starred projects: ${error}`);
            }
        });
    }
    searchProjects(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, skip, limit, userId }) {
            try {
                const { projects, total } = yield projectsRepo.search({ query, skip, limit });
                // Transform projects to include isStarred boolean
                const transformedProjects = projects.map(project => (Object.assign(Object.assign({}, project), { isStarred: project.stars.some(star => star.userId === userId) })));
                return {
                    projects: transformedProjects,
                    total
                };
            }
            catch (error) {
                throw new Error(`Error searching projects: ${error}`);
            }
        });
    }
    searchMyProjects(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, skip, limit, userId }) {
            try {
                const { projects, total } = yield projectsRepo.searchMyProjects({ query, skip, limit, userId });
                // Transform projects to include isStarred boolean
                const transformedProjects = projects.map(project => (Object.assign(Object.assign({}, project), { isStarred: project.stars.some(star => star.userId === userId) })));
                return {
                    projects: transformedProjects,
                    total
                };
            }
            catch (error) {
                throw new Error(`Error searching my projects: ${error}`);
            }
        });
    }
}
exports.ProjectsService = ProjectsService;
