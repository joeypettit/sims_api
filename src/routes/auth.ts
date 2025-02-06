import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '../../prisma/prisma-client';
import passport from 'passport';
import { hashPassword } from '../../passport/password-utils';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;
    console.log('Raw request body:', req.body);
    
    if (!email || !password || !firstName || !lastName) {
        res.status(400).send('All fields are required');
        return;
    }

    try {
        const hashedPassword = await hashPassword(password);
        const userAccount = await prisma.userAccount.create({
            data: { 
                email, 
                passwordHash: hashedPassword, 
                user: { 
                    create: { 
                        firstName, 
                        lastName 
                    } 
                } 
            }
        });
        res.redirect('/api/auth/login');
    } catch (error) {
        console.error('Error creating user account:', error);
        res.status(500).send('Error creating user account');
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/api/auth/login-success',
    failureRedirect: '/api/auth/login-failure'
}));

/**
 * -------------- GET ROUTES ----------------
 */

router.get('/', (req, res, next) => {
    res.send('<h1>Home</h1><p>Please <a href="/api/auth/register">register</a></p>');
});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {
   
    const form = '<h1>Login Page</h1><form method="POST" action="/api/auth/login">\
    Enter Email:<br><input type="text" name="email">\
    <br>Enter Password:<br><input type="password" name="password">\
    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {
    const form = `
        <h1>Register Page</h1>
        <form method="POST" action="/api/auth/register">
            <label for="email">Enter Email:</label><br>
            <input type="email" id="email" name="email" required><br>
            <label for="password">Enter Password:</label><br>
            <input type="password" id="password" name="password" required><br>
            <label for="firstName">Enter First Name:</label><br>
            <input type="text" id="firstName" name="firstName" required><br>
            <label for="lastName">Enter Last Name:</label><br>
            <input type="text" id="lastName" name="lastName" required><br><br>
            <input type="submit" value="Submit">
        </form>
    `;
    res.send(form);
});

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', (req, res, next) => {
    
    // This is how you check if a user is authenticated and protect a route.  You could turn this into a custom middleware to make it less redundant
    if (req.isAuthenticated()) {
        res.send('<h1>You are authenticated</h1><p><a href="/api/auth/logout">Logout and reload</a></p>');
    } else {
        res.send('<h1>You are not authenticated</h1><p><a href="/api/auth/login">Login</a></p>');
    }
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout(() => {
        res.redirect('/api/auth/protected-route');
    });
});

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/api/auth/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

export default router; 
