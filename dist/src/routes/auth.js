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
const express_1 = require("express");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const passport_1 = __importDefault(require("passport"));
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../services/auth-service");
const router = (0, express_1.Router)();
const authService = new auth_service_1.AuthService(prisma_client_1.default);
router.use((req, res, next) => {
    console.log('auth request');
    next();
});
// Create new user (admin only)
router.post('/create-user', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { email, password, firstName, lastName, role = client_1.UserRole.USER } = req.body;
    if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }
    try {
        // Check if requesting user is authorized to create an admin
        const requestingUser = req.user;
        if (role === client_1.UserRole.ADMIN && ((_a = requestingUser.userAccount) === null || _a === void 0 ? void 0 : _a.role) !== client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Only super admins can create admin users' });
            return;
        }
        // Prevent creation of SUPER_ADMIN users through API
        if (role === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be created through the API' });
            return;
        }
        const userAccount = yield authService.register({
            email,
            password,
            firstName,
            lastName,
            role
        });
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: (_b = userAccount.user) === null || _b === void 0 ? void 0 : _b.id,
                firstName: (_c = userAccount.user) === null || _c === void 0 ? void 0 : _c.firstName,
                lastName: (_d = userAccount.user) === null || _d === void 0 ? void 0 : _d.lastName,
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
    }
    catch (error) {
        if (error instanceof Error && error.message === 'User with this email already exists') {
            res.status(400).json({ error: error.message });
        }
        else {
            console.error('Error creating user account:', error);
            res.status(500).json({ error: 'Error creating user account' });
        }
    }
}));
// Delete user (admin only)
router.delete('/users/:userId', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    try {
        const user = yield prisma_client_1.default.user.findUnique({
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
        if (((_a = user.userAccount) === null || _a === void 0 ? void 0 : _a.role) === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super Admin users cannot be deleted' });
            return;
        }
        // Delete the user and their account in a transaction
        yield prisma_client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Remove user from all their projects
            for (const project of user.projects) {
                yield prisma.project.update({
                    where: { id: project.id },
                    data: {
                        users: {
                            disconnect: { id: userId }
                        }
                    }
                });
            }
            // Delete the user account (this will cascade delete the user due to the relation)
            yield prisma.userAccount.delete({
                where: { id: user.userAccountId }
            });
        }));
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
}));
// Login
router.post('/login', passport_1.default.authenticate('local'), (req, res) => {
    if (req.user) {
        res.json(req.user);
    }
    else {
        res.status(401).json({ error: 'Authentication failed' });
    }
});
// Get current user
router.get('/me', auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    res.json(req.user);
}));
// Logout
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});
// Search users
router.get('/users/search', auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Searching users with query:', req.query.query);
    console.log('Request user:', req.user);
    try {
        const query = req.query.query || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // First, let's check how many total users exist
        const totalUsers = yield prisma_client_1.default.user.count();
        console.log('Total users in system:', totalUsers);
        const whereClause = {
            OR: [
                { firstName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                { lastName: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } },
                { userAccount: { email: { contains: query, mode: client_1.Prisma.QueryMode.insensitive } } }
            ]
        };
        const [users, total] = yield Promise.all([
            prisma_client_1.default.user.findMany({
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
            prisma_client_1.default.user.count({ where: whereClause })
        ]);
        console.log(`Found ${users.length} users matching query "${query}"`);
        console.log('Users found:', users.map(u => {
            var _a, _b;
            return ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: (_a = u.userAccount) === null || _a === void 0 ? void 0 : _a.email,
                role: (_b = u.userAccount) === null || _b === void 0 ? void 0 : _b.role
            });
        }));
        res.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    }
    catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
}));
// Get all users (admin only)
router.get('/users', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Getting all users');
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [users, total] = yield Promise.all([
            prisma_client_1.default.user.findMany({
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
            prisma_client_1.default.user.count()
        ]);
        res.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
}));
// Get single user (admin only)
router.get('/users/:userId', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield prisma_client_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}));
// Update user (admin only)
router.put('/users/:userId', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    const { firstName, lastName, email, role } = req.body;
    try {
        const user = yield prisma_client_1.default.user.findUnique({
            where: { id: userId },
            include: { userAccount: true }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Prevent modification of super admin role
        if (((_a = user.userAccount) === null || _a === void 0 ? void 0 : _a.role) === client_1.UserRole.SUPER_ADMIN) {
            if (role && role !== client_1.UserRole.SUPER_ADMIN) {
                res.status(403).json({ error: 'Super Admin role cannot be modified' });
                return;
            }
        }
        // Update user and account in a transaction
        const updatedUser = yield prisma_client_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Update user details
            const user = yield prisma.user.update({
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
                yield prisma.userAccount.update({
                    where: { id: user.userAccountId },
                    data: Object.assign(Object.assign({}, (email && { email })), (role && { role }))
                });
            }
            return user;
        }));
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Email already exists' });
        }
        else {
            res.status(500).json({ error: 'Error updating user' });
        }
    }
}));
// Toggle user blocked status (admin only)
router.patch('/users/:userAccountId/toggle-block', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userAccountId } = req.params;
    try {
        const userAccount = yield prisma_client_1.default.userAccount.findUnique({
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
        if (userAccount.role === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be blocked' });
            return;
        }
        // Toggle the blocked status
        const updatedUser = yield prisma_client_1.default.userAccount.update({
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
            user: Object.assign(Object.assign({}, updatedUser.user), { userAccount: {
                    email: updatedUser.email,
                    role: updatedUser.role,
                    isBlocked: updatedUser.isBlocked
                } })
        });
    }
    catch (error) {
        console.error('Error toggling user blocked status:', error);
        res.status(500).json({ error: 'Error toggling user blocked status' });
    }
}));
router.post('/change-password', auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { currentPassword, newPassword } = req.body;
    const userId = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userAccount) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    try {
        yield authService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unknown error occurred' });
        }
    }
}));
// Reset user password (admin only)
router.post('/users/:userAccountId/reset-password', auth_1.isAuthenticated, auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userAccountId } = req.params;
    try {
        const userAccount = yield prisma_client_1.default.userAccount.findUnique({
            where: { id: userAccountId },
            include: { user: true }
        });
        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Prevent resetting password of super admin users
        if (userAccount.role === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin passwords cannot be reset' });
            return;
        }
        const temporaryPassword = yield authService.resetUserPassword(userAccountId);
        res.json({
            message: 'Password reset successfully',
            temporaryPassword
        });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
}));
exports.default = router;
