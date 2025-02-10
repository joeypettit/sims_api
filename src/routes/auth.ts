import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '../../prisma/prisma-client';
import passport from 'passport';
import { hashPassword } from '../../auth/password-utils';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { User, UserRole } from '@prisma/client';

const router = Router();

router.use((req, res, next)=>{
    console.log('auth request');
    next();
});

// Create new user (admin only)
router.post('/create-user', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, role = UserRole.USER } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    try {
        // Check if requesting user is authorized to create an admin
        const requestingUser = req.user as { userAccount?: { role: UserRole } };
        if (role === UserRole.ADMIN && requestingUser.userAccount?.role !== UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Only super admins can create admin users' });
            return;
        }

        // Prevent creation of SUPER_ADMIN users through API
        if (role === UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be created through the API' });
            return;
        }

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
                role,
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
                role: userAccount.role
            }
        });
    } catch (error) {
        console.error('Error creating user account:', error);
        res.status(500).json({ error: 'Error creating user account' });
    }
});

// Delete user (admin only)
router.delete('/users/:userId', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                userAccount: true,
                projects: true
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent deletion of super admin users
        if (user.userAccount?.role === UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super Admin users cannot be deleted' });
            return;
        }

        // Delete the user and their account in a transaction
        await prisma.$transaction(async (prisma) => {
            // Remove user from all their projects
            for (const project of user.projects) {
                await prisma.project.update({
                    where: { id: project.id },
                    data: {
                        users: {
                            disconnect: { id: userId }
                        }
                    }
                });
            }

            // Delete the user account (this will cascade delete the user due to the relation)
            await prisma.userAccount.delete({
                where: { id: user.userAccountId }
            });
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Logged in successfully' });
});

// Get current user
router.get('/me', isAuthenticated, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
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
                            id: true,
                            email: true,
                            role: true,
                            isBlocked: true
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
                        id: true,
                        email: true,
                        role: true,
                        isBlocked: true
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
    const { firstName, lastName, email, role } = req.body;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { userAccount: true }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent modification of super admin role
        if (user.userAccount?.role === UserRole.SUPER_ADMIN) {
            if (role && role !== UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Super Admin role cannot be modified' });
                return;
            }
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
                            role: true
                        }
                    }
                }
            });

            // Update user account if email or role changed
            if (email || role) {
                await prisma.userAccount.update({
                    where: { id: user.userAccountId },
                    data: {
                        ...(email && { email }),
                        ...(role && { role })
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

// Toggle user blocked status (admin only)
router.patch('/users/:userAccountId/toggle-block', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { userAccountId } = req.params;
    
    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { id: userAccountId },
            include: {
                user: true
            }
        });

        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent blocking of super admin users
        if (userAccount.role === UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be blocked' });
            return;
        }

        // Toggle the blocked status
        const updatedUser = await prisma.userAccount.update({
            where: { id: userAccountId },
            data: { 
                isBlocked: !userAccount.isBlocked 
            },
            include: {
                user: true
            }
        });

        res.json({
            message: `User ${updatedUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: {
                ...updatedUser.user,
                userAccount: {
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isBlocked: updatedUser.isBlocked
                }
            }
        });
    } catch (error) {
        console.error('Error toggling user blocked status:', error);
        res.status(500).json({ error: 'Error toggling user blocked status' });
    }
});

export default router; 
