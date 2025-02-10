import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../prisma/prisma-client";
import { validatePassword } from "./password-utils";
import { UserRole } from "@prisma/client";

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

        // Check if user is blocked
        if (userAccount.isBlocked) {
            return done(null, false, { message: 'Account is blocked. Please contact an administrator.' });
        }

        const isPasswordValid = await validatePassword(password, userAccount.passwordHash);
        if (!isPasswordValid) {
            return done(null, false, { message: 'Invalid credentials' });
        }

        if (!userAccount.user) {
            return done(null, false, { message: 'User profile not found' });
        }

        // Return the user with role information
        return done(null, {
            ...userAccount.user,
            userAccount: {
                email: userAccount.email,
                role: userAccount.role
            }
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
        userAccount: {
            role: user.userAccount.role
        }
    });
});

passport.deserializeUser(async (serializedUser: { id: string, userAccount: { role: UserRole } }, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: serializedUser.id },
            include: {
                userAccount: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error);
    }
}); 