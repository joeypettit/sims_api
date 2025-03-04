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
exports.AuthService = void 0;
const prisma_client_1 = __importDefault(require("../../prisma/prisma-client"));
const password_utils_1 = require("../auth/password-utils");
class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userAccount = yield prisma_client_1.default.userAccount.findUnique({
                where: { email },
                include: { user: true }
            });
            if (!userAccount) {
                throw new Error('Invalid credentials');
            }
            const isValidPassword = yield (0, password_utils_1.validatePassword)(password, userAccount.passwordHash);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }
            return Object.assign(Object.assign({}, userAccount.user), { userAccount: {
                    id: userAccount.id,
                    email: userAccount.email,
                    role: userAccount.role,
                    isBlocked: userAccount.isBlocked,
                    isTemporaryPassword: userAccount.isTemporaryPassword
                } });
        });
    }
    validatePasswordFormat(password) {
        // At least 8 characters
        if (password.length < 8)
            return false;
        // Must contain at least one uppercase letter
        if (!/[A-Z]/.test(password))
            return false;
        // Must contain at least one lowercase letter
        if (!/[a-z]/.test(password))
            return false;
        // Must contain at least one number
        if (!/[0-9]/.test(password))
            return false;
        // Must contain at least one special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
            return false;
        return true;
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validatePasswordFormat(newPassword)) {
                throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
            }
            const userAccount = yield this.prisma.userAccount.findUnique({
                where: { id: userId }
            });
            if (!userAccount) {
                throw new Error('User account not found');
            }
            const isPasswordValid = yield (0, password_utils_1.validatePassword)(currentPassword, userAccount.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            const hashedPassword = yield (0, password_utils_1.hashPassword)(newPassword);
            yield this.prisma.userAccount.update({
                where: { id: userId },
                data: {
                    passwordHash: hashedPassword,
                    isTemporaryPassword: false,
                },
            });
        });
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            // For initial registration, we'll generate a simple temporary password
            const temporaryPassword = (0, password_utils_1.generateSimplePassword)(8);
            const hashedPassword = yield (0, password_utils_1.hashPassword)(temporaryPassword);
            const userAccount = yield prisma_client_1.default.userAccount.create({
                data: {
                    email: userData.email,
                    passwordHash: hashedPassword,
                    isTemporaryPassword: true,
                    role: userData.role,
                    user: {
                        create: {
                            firstName: userData.firstName,
                            lastName: userData.lastName
                        }
                    }
                },
                include: {
                    user: true
                }
            });
            return Object.assign(Object.assign({}, userAccount), { temporaryPassword });
        });
    }
    resetUserPassword(userAccountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const temporaryPassword = (0, password_utils_1.generateSimplePassword)(8);
            const hashedPassword = yield (0, password_utils_1.hashPassword)(temporaryPassword);
            yield this.prisma.userAccount.update({
                where: { id: userAccountId },
                data: {
                    passwordHash: hashedPassword,
                    isTemporaryPassword: true,
                },
            });
            return temporaryPassword;
        });
    }
}
exports.AuthService = AuthService;
