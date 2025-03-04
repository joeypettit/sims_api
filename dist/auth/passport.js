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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const prisma_client_1 = __importDefault(require("../prisma/prisma-client"));
const password_utils_1 = require("./password-utils");
const customFields = {
    usernameField: "email",
    passwordField: "password"
};
const verifyCallback = (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user account with the associated user data
        const userAccount = yield prisma_client_1.default.userAccount.findUnique({
            where: { email: username },
            include: {
                user: true
            }
        });
        if (!userAccount) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        // Check if user is blocked
        if (userAccount.isBlocked) {
            return done(null, false, { message: 'Account is blocked. Please contact an administrator.' });
        }
        const isPasswordValid = yield (0, password_utils_1.validatePassword)(password, userAccount.passwordHash);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        if (!userAccount.user) {
            return done(null, false, { message: 'User profile not found' });
        }
        // Return the user with all required userAccount fields
        return done(null, Object.assign(Object.assign({}, userAccount.user), { userAccount: {
                id: userAccount.id,
                email: userAccount.email,
                role: userAccount.role,
                isBlocked: userAccount.isBlocked,
                isTemporaryPassword: userAccount.isTemporaryPassword
            } }));
    }
    catch (error) {
        return done(error);
    }
});
const strategy = new passport_local_1.Strategy(customFields, verifyCallback);
passport_1.default.use(strategy);
passport_1.default.serializeUser((user, done) => {
    done(null, {
        id: user.id,
        userAccount: {
            id: user.userAccount.id,
            role: user.userAccount.role,
            isBlocked: user.userAccount.isBlocked,
            isTemporaryPassword: user.userAccount.isTemporaryPassword
        }
    });
});
passport_1.default.deserializeUser((serializedUser, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_client_1.default.user.findUnique({
            where: { id: serializedUser.id },
            include: {
                userAccount: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isBlocked: true,
                        isTemporaryPassword: true
                    }
                }
            }
        });
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
