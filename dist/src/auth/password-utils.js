"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
exports.hashPassword = hashPassword;
exports.generateSimplePassword = generateSimplePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function validatePassword(password, passwordHash) {
    return bcryptjs_1.default.compare(password, passwordHash);
}
function hashPassword(password) {
    return bcryptjs_1.default.hash(password, 10);
}
function generateSimplePassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}
