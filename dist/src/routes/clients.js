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
const auth_1 = require("../middleware/auth");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Apply isAuthenticated to all routes
router.use(auth_1.isAuthenticated);
// Search clients
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query.query || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        console.log(`Searching for clients with query: ${query}`);
        const whereClause = {
            OR: [
                { firstName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                { lastName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                { email: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } }
            ]
        };
        const [clients, total] = yield Promise.all([
            prisma_client_1.default.client.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    projects: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: {
                    lastName: 'asc'
                }
            }),
            prisma_client_1.default.client.count({ where: whereClause })
        ]);
        res.json({
            clients,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    }
    catch (error) {
        console.error('Error searching clients:', error);
        res.status(500).json({ error: 'Error searching clients' });
    }
}));
// Get single client
router.get('/:clientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = req.params;
    try {
        const client = yield prisma_client_1.default.client.findUnique({
            where: { id: clientId },
            include: {
                projects: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        if (!client) {
            res.status(404).json({ error: 'Client not found' });
            return;
        }
        res.json(client);
    }
    catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Error fetching client' });
    }
}));
// Create client
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName) {
        res.status(400).json({ error: 'First name and last name are required' });
        return;
    }
    try {
        const client = yield prisma_client_1.default.client.create({
            data: {
                firstName,
                lastName,
                email,
                phone
            },
            include: {
                projects: true
            }
        });
        res.status(201).json(client);
    }
    catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Error creating client' });
    }
}));
// Update client
router.put('/:clientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    if (!firstName || !lastName) {
        res.status(400).json({ error: 'First name and last name are required' });
        return;
    }
    try {
        const client = yield prisma_client_1.default.client.update({
            where: { id: clientId },
            data: {
                firstName,
                lastName,
                email,
                phone
            },
            include: {
                projects: true
            }
        });
        res.json(client);
    }
    catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Error updating client' });
    }
}));
// Delete client
router.delete('/:clientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clientId } = req.params;
    try {
        yield prisma_client_1.default.client.delete({
            where: { id: clientId }
        });
        res.json({ message: 'Client deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Error deleting client' });
    }
}));
exports.default = router;
