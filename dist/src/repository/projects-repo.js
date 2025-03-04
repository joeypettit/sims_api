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
const client_1 = require("@prisma/client");
class ProjectsRepo {
    search(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, skip, limit }) {
            const whereClause = {
                OR: [
                    { name: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                    {
                        clients: {
                            some: {
                                OR: [
                                    { firstName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                                    { lastName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } }
                                ]
                            }
                        }
                    }
                ]
            };
            try {
                const [projects, total] = yield Promise.all([
                    prisma_client_1.default.project.findMany({
                        where: whereClause,
                        include: {
                            clients: true,
                            users: true,
                            stars: true,
                        },
                        skip,
                        take: limit,
                        orderBy: {
                            name: 'asc'
                        }
                    }),
                    prisma_client_1.default.project.count({
                        where: whereClause
                    })
                ]);
                return { projects, total };
            }
            catch (error) {
                throw new Error(`Error searching projects: ${error}`);
            }
        });
    }
    starProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.projectStar.create({
                data: {
                    userId,
                    projectId
                }
            });
        });
    }
    unstarProject(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.projectStar.delete({
                where: {
                    userId_projectId: {
                        userId,
                        projectId
                    }
                }
            });
        });
    }
    isProjectStarred(userId, projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const star = yield prisma_client_1.default.projectStar.findUnique({
                where: {
                    userId_projectId: {
                        userId,
                        projectId
                    }
                }
            });
            return !!star;
        });
    }
    getStarredProjects(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_client_1.default.project.findMany({
                where: {
                    stars: {
                        some: {
                            userId
                        }
                    }
                },
                include: {
                    clients: true,
                    users: true
                }
            });
        });
    }
    searchMyProjects(_a) {
        return __awaiter(this, arguments, void 0, function* ({ query, skip, limit, userId }) {
            const whereClause = {
                OR: [
                    { name: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                    {
                        clients: {
                            some: {
                                OR: [
                                    { firstName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                                    { lastName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } }
                                ]
                            }
                        }
                    }
                ],
                AND: {
                    OR: [
                        { users: { some: { id: userId } } }, // Projects where user is a member
                        { stars: { some: { userId } } } // Starred projects
                    ]
                }
            };
            try {
                const [projects, total] = yield Promise.all([
                    prisma_client_1.default.project.findMany({
                        where: whereClause,
                        include: {
                            clients: true,
                            users: true,
                            stars: true,
                        },
                        skip,
                        take: limit,
                        orderBy: {
                            name: 'asc'
                        }
                    }),
                    prisma_client_1.default.project.count({
                        where: whereClause
                    })
                ]);
                return { projects, total };
            }
            catch (error) {
                throw new Error(`Error searching my projects: ${error}`);
            }
        });
    }
}
exports.default = ProjectsRepo;
