import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../prisma/prisma-client";
import { validatePassword } from "./password-utils";

const customFields = {
    usernameField: "email",
    passwordField: "password"
}

const verifyCallback = async (username: string, password: string, done: any) => {
    try {
        const userAccount = await prisma.userAccount.findUnique({
            where: { email: username }
        });
        if (!userAccount) {
            return done(null, false);
        }
        const isPasswordValid = await validatePassword(password, userAccount.passwordHash);
        if (!isPasswordValid) {
            return done(null, false);
    }
    const user = await prisma.user.findUnique({
            where: { userAccountId: userAccount.id },
            include: { userAccount: true }
    });
    return done(null, user);
    } catch (error) {
    return done(error);
}
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user: any, done) => {
    done(null, { 
        id: user.id, 
        userAccountId: user.userAccountId,
        isAdmin: user.userAccount?.isAdmin || false 
    });
});

passport.deserializeUser(async (serializedUser: { id: string, userAccountId: string, isAdmin: boolean }, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: serializedUser.id },
            include: { userAccount: true }
        });
        done(null, { ...user, isAdmin: serializedUser.isAdmin });
    } catch (error) {
        done(error);
    }
}); 