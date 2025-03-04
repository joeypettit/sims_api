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
// Get all users
router.get('/', auth_1.isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_client_1.default.user.findMany({
            include: {
                userAccount: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));
// Update user role
router.patch('/:userId/role', auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    const { role } = req.body;
    try {
        const userAccount = yield prisma_client_1.default.userAccount.findUnique({
            where: { id: userId }
        });
        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Prevent modification of SUPER_ADMIN users
        if (userAccount.role === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be modified' });
            return;
        }
        // Only SUPER_ADMIN can promote to ADMIN
        const requestingUser = req.user;
        if (role === client_1.UserRole.ADMIN && ((_a = requestingUser.userAccount) === null || _a === void 0 ? void 0 : _a.role) !== client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Only super admins can promote users to admin' });
            return;
        }
        const updatedUser = yield prisma_client_1.default.userAccount.update({
            where: { id: userId },
            data: { role },
            include: {
                user: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
}));
// Delete user
router.delete('/:userId', auth_1.isAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const userAccount = yield prisma_client_1.default.userAccount.findUnique({
            where: { id: userId }
        });
        if (!userAccount) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Prevent deletion of SUPER_ADMIN users
        if (userAccount.role === client_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ error: 'Super admin users cannot be deleted' });
            return;
        }
        yield prisma_client_1.default.userAccount.delete({
            where: { id: userId }
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}));
exports.default = router;
