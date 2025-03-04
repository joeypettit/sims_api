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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaSessionStore = void 0;
const express_session_1 = require("express-session");
class PrismaSessionStore extends express_session_1.Store {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        // Run cleanup every hour
        setInterval(() => this.cleanup(), 60 * 60 * 1000);
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.session.deleteMany({
                    where: {
                        expiresAt: {
                            lt: new Date()
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error cleaning up expired sessions:', error);
            }
        });
    }
    // get is used to get the session
    get(sessionId, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const session = yield this.prisma.session.findUnique({
                    where: { id: sessionId },
                });
                if (!session) {
                    return callback(null);
                }
                if (session.expiresAt < new Date()) {
                    yield this.destroy(sessionId);
                    return callback(null);
                }
                const sessionData = JSON.parse(session.data);
                callback(null, sessionData);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    // set is used to create a new session
    set(sessionId, session, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 30 days = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds * 30 days
                const expiresAt = new Date(session.cookie.expires || Date.now() + (24 * 60 * 60 * 1000 * 30));
                yield this.prisma.session.upsert({
                    where: { id: sessionId },
                    create: {
                        id: sessionId,
                        data: JSON.stringify(session),
                        expiresAt,
                    },
                    update: {
                        data: JSON.stringify(session),
                        expiresAt,
                    },
                });
                callback === null || callback === void 0 ? void 0 : callback();
            }
            catch (err) {
                callback === null || callback === void 0 ? void 0 : callback(err);
            }
        });
    }
    // destroy is used to delete the session
    destroy(sessionId, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.session.deleteMany({
                    where: { id: sessionId }
                });
                callback === null || callback === void 0 ? void 0 : callback();
            }
            catch (err) {
                console.error('Error destroying session:', err);
                callback === null || callback === void 0 ? void 0 : callback(err);
            }
        });
    }
    // touch is used to update the session expiration time
    touch(sessionId, session, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 30 days = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds * 30 days
                const expiresAt = new Date(session.cookie.expires || Date.now() + (24 * 60 * 60 * 1000 * 30));
                yield this.prisma.session.update({
                    where: { id: sessionId },
                    data: {
                        expiresAt,
                    },
                });
                callback === null || callback === void 0 ? void 0 : callback();
            }
            catch (err) {
                callback === null || callback === void 0 ? void 0 : callback(err);
            }
        });
    }
}
exports.PrismaSessionStore = PrismaSessionStore;
