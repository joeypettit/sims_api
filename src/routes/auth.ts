import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '../../prisma/prisma-client';
import passport from 'passport';
import { hashPassword } from '../../auth/password-utils';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { User } from '@prisma/client';

const router = Router();

router.use((req, res, next)=>{
    console.log('auth request');
    next();
});

// Create new user (admin only)
router.post('/create-user', isAuthenticated, isAdmin, (async (req: Request, res: Response) => {
    console.log('Creating user', req.body);
    const { email, password, firstName, lastName, isAdmin: newUserIsAdmin } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.userAccount.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }

        const hashedPassword = await hashPassword(password);
        const userAccount = await prisma.userAccount.create({
            data: { 
                email, 
                passwordHash: hashedPassword,
                isAdmin: newUserIsAdmin || false,
                user: { 
                    create: { 
                        firstName, 
                        lastName 
                    } 
                } 
            },
            include: {
                user: true
            }
        });
        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: userAccount.user?.id,
                firstName: userAccount.user?.firstName,
                lastName: userAccount.user?.lastName,
                email: userAccount.email,
                isAdmin: userAccount.isAdmin
            }
        });
    } catch (error) {
        console.error('Error creating user account:', error);
        res.status(500).json({ error: 'Error creating user account' });
    }
}));

// Login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: User | false, info: any) => {
        if (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }
            return res.status(200).json({ 
                message: 'Login successful',
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        });
    })(req, res, next);
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
    res.json(req.user);
});

// Logout
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

// Get all users (admin only)
router.get('/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    console.log('Getting all users');
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                include: {
                    userAccount: {
                        select: {
                            email: true,
                            isAdmin: true
                        }
                    }
                },
                orderBy: {
                    firstName: 'asc'
                }
            }),
            prisma.user.count()
        ]);

        res.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Get single user (admin only)
router.get('/users/:userId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                userAccount: {
                    select: {
                        email: true,
                        isAdmin: true
                    }
                }
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// Update user (admin only)
router.put('/users/:userId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { firstName, lastName, email, isAdmin: newIsAdmin } = req.body;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { userAccount: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update user and account in a transaction
        const updatedUser = await prisma.$transaction(async (prisma) => {
            // Update user details
            const user = await prisma.user.update({
                where: { id: userId },
                data: { firstName, lastName },
                include: {
                    userAccount: {
                        select: {
                            email: true,
                            isAdmin: true
                        }
                    }
                }
            });

            // Update user account if email or isAdmin changed
            if (email || typeof newIsAdmin === 'boolean') {
                await prisma.userAccount.update({
                    where: { id: user.userAccountId },
                    data: {
                        ...(email && { email }),
                        ...(typeof newIsAdmin === 'boolean' && { isAdmin: newIsAdmin })
                    }
                });
            }

            return user;
        });

        res.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating user:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: 'Error updating user' });
        }
    }
});

export default router; 
