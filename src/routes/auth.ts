import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '../../prisma/prisma-client';
import passport from 'passport';
import { hashPassword } from '../../auth/password-utils';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { User, UserAccount, UserRole, Prisma } from '@prisma/client';
import { AuthService } from '../services/auth-service';

// Define custom type for authenticated request user
type AuthenticatedUser = User & {
    userAccount?: Pick<UserAccount, 'id' | 'email' | 'role' | 'isBlocked' | 'isTemporaryPassword'>;
};

// Extend Express Request type
declare global {
    namespace Express {
        interface User extends AuthenticatedUser {}
    }
}

const router = Router();
const authService = new AuthService(prisma);

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

        const userAccount = await authService.register({
            email,
            password,
            firstName,
            lastName,
            role
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: userAccount.user?.id,
                firstName: userAccount.user?.firstName,
                lastName: userAccount.user?.lastName,
                email: userAccount.email,
                role: userAccount.role,
                userAccount: {
                    id: userAccount.id,
                    email: userAccount.email,
                    role: userAccount.role,
                    isBlocked: userAccount.isBlocked,
                    isTemporaryPassword: userAccount.isTemporaryPassword
                }
            }
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'User with this email already exists') {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating user account:', error);
            res.status(500).json({ error: 'Error creating user account' });
        }
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

            // Delete the user first, then the account
            await prisma.user.delete({
                where: { id: userId }
            });

            // Now we can safely delete the user account
            if (user.userAccount) {
                await prisma.userAccount.delete({
                    where: { id: user.userAccount.id }
                });
            }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

// Login
router.post('/login', passport.authenticate('local'), (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Authentication failed' });
    }
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

// Search users
router.get('/users/search', isAuthenticated, async (req: Request, res: Response) => {
    console.log('Searching users with query:', req.query.query);
    console.log('Request user:', req.user);
    try {
        const query = (req.query.query as string) || '';
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // First, let's check how many total users exist
        const totalUsers = await prisma.user.count();
        console.log('Total users in system:', totalUsers);

        const whereClause: Prisma.UserWhereInput = {
            OR: [
                { firstName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
                { userAccount: { email: { contains: query, mode: Prisma.QueryMode.insensitive } } }
            ]
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
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
                    lastName: 'asc'
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        console.log(`Found ${users.length} users matching query "${query}"`);
        console.log('Users found:', users.map(u => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.userAccount?.email,
            role: u.userAccount?.role
        })));
        
        res.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
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

router.post('/change-password', isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userAccount?.id;

    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }

    try {
        await authService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
});

// Reset user password (admin only)
router.post('/users/:userAccountId/reset-password', isAuthenticated, isAdmin, async (req, res) => {
    const { userAccountId } = req.params;

    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { id: userAccountId },
            include: { user: true }
        });

        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Prevent resetting password of super admin users
        if (userAccount.role === UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin passwords cannot be reset' });
            return;
        }

        const temporaryPassword = await authService.resetUserPassword(userAccountId);

        res.json({ 
            message: 'Password reset successfully',
            temporaryPassword
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

// Set user password (admin only)
router.post('/users/:userAccountId/set-password', async (req: Request, res: Response) => {
    const { userAccountId } = req.params;
    const { newPassword, secretKey } = req.body;

    // Validate secret key
    if (secretKey !== process.env.PASSWORD_CHANGE_SECRET_KEY) {
        res.status(401).json({ error: 'Invalid secret key' });
        return;
    }

    if (!newPassword) {
        res.status(400).json({ error: 'New password is required' });
        return;
    }

    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { id: userAccountId },
            include: { user: true }
        });

        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update the user account with the new password
        const updatedUser = await prisma.userAccount.update({
            where: { id: userAccountId },
            data: { 
                passwordHash: hashedPassword,
                isTemporaryPassword: false
            },
            include: {
                user: true
            }
        });

        res.json({
            message: 'Password set successfully',
            user: {
                ...updatedUser.user,
                userAccount: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isBlocked: updatedUser.isBlocked,
                    isTemporaryPassword: updatedUser.isTemporaryPassword
                }
            }
        });
    } catch (error) {
        console.error('Error setting user password:', error);
        res.status(500).json({ error: 'Error setting user password' });
    }
});

export default router; 
