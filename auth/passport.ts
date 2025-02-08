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
        // Find the user account with the associated user data
        const userAccount = await prisma.userAccount.findUnique({
            where: { email: username },
            include: {
                user: true
            }
        });

        if (!userAccount) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        const isPasswordValid = await validatePassword(password, userAccount.passwordHash);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        if (!userAccount.user) {
            return done(null, false, { message: 'User profile not found' });
        }

        // Return the user with admin status
        return done(null, {
            ...userAccount.user,
            isAdmin: userAccount.isAdmin
        });
    } catch (error) {
        return done(error);
    }
}

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user: any, done) => {
    done(null, { 
        id: user.id,
        isAdmin: user.isAdmin || false 
    });
});

passport.deserializeUser(async (serializedUser: { id: string, isAdmin: boolean }, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: serializedUser.id },
            include: { userAccount: true }
        });
        if (!user) {
            return done(null, false);
        }
        done(null, { ...user, isAdmin: serializedUser.isAdmin });
    } catch (error) {
        done(error);
    }
}); 