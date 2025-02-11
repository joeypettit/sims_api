import express from 'express';
import { isAuthenticated } from '../middleware/auth';
import prisma from '../../prisma/prisma-client';
import { Prisma } from '@prisma/client';

const router = express.Router();

// Apply isAuthenticated to all routes
router.use(isAuthenticated);

// Search clients
router.get('/search', async (req, res) => {
    try {
        const query = (req.query.query as string) || '';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        console.log(`Searching for clients with query: ${query}`);
        const whereClause: Prisma.ClientWhereInput = {
            OR: [
                { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: query, mode: Prisma.QueryMode.insensitive } }
            ]
        };

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
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
            prisma.client.count({ where: whereClause })
        ]);

        res.json({
            clients,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error searching clients:', error);
        res.status(500).json({ error: 'Error searching clients' });
    }
});

// Get single client
router.get('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    
    try {
        const client = await prisma.client.findUnique({
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
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Error fetching client' });
    }
});

// Create client
router.post('/', async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName) {
        res.status(400).json({ error: 'First name and last name are required' });
        return;
    }

    try {
        const client = await prisma.client.create({
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
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Error creating client' });
    }
});

// Update client
router.put('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const { firstName, lastName, email, phone } = req.body;
    
    if (!firstName || !lastName) {
        res.status(400).json({ error: 'First name and last name are required' });
        return;
    }

    try {
        const client = await prisma.client.update({
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
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Error updating client' });
    }
});

// Delete client
router.delete('/:clientId', async (req, res) => {
    const { clientId } = req.params;
    
    try {
        await prisma.client.delete({
            where: { id: clientId }
        });

        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Error deleting client' });
    }
});

export default router; 