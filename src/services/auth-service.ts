import bcrypt from 'bcryptjs';
import prisma from '../../prisma/prisma-client';

export class AuthService {
  async login(email: string, password: string) {
    const userAccount = await prisma.userAccount.findUnique({ 
      where: { email },
      include: { user: true }
    });
    
    if (!userAccount) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, userAccount.passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return userAccount;
  }

  async register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const userAccount = await prisma.userAccount.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
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

    return userAccount;
  }
} 