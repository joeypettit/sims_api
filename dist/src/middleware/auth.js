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
exports.isAdmin = exports.isAuthenticated = void 0;
const client_1 = require("@prisma/client");
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    // Check if user is blocked
    const user = req.user;
    const userAccount = yield prisma_client_1.default.userAccount.findUnique({
        where: { id: user.id },
        select: { isBlocked: true }
    });
    if (userAccount === null || userAccount === void 0 ? void 0 : userAccount.isBlocked) {
        req.logout(() => {
            res.status(403).json({ error: 'Account is blocked. Please contact an administrator.' });
        });
        return;
    }
    return next();
});
exports.isAuthenticated = isAuthenticated;
const isAdmin = (req, res, next) => {
    var _a;
    if (!req.isAuthenticated()) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const user = req.user;
    if (!((_a = user.userAccount) === null || _a === void 0 ? void 0 : _a.role) || (user.userAccount.role !== client_1.UserRole.ADMIN && user.userAccount.role !== client_1.UserRole.SUPER_ADMIN)) {
        res.status(403).json({ error: 'Not authorized - Admin access required' });
        return;
    }
    return next();
};
exports.isAdmin = isAdmin;
