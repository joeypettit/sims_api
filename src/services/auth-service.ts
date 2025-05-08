import prisma from '../../prisma/prisma-client';
import { UserRole } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { hashPassword, validatePassword, generateSimplePassword } from '../auth/password-utils';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async login(email: string, password: string) {
    const userAccount = await prisma.userAccount.findUnique({ 
      where: { email },
      include: { user: true }
    });
    
    if (!userAccount) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await validatePassword(password, userAccount.passwordHash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return {
      ...userAccount.user,
      userAccount: {
        id: userAccount.id,
        email: userAccount.email,
        role: userAccount.role,
        isBlocked: userAccount.isBlocked,
        isTemporaryPassword: userAccount.isTemporaryPassword
      }
    };
  }

  private validatePasswordFormat(password: string): boolean {
    // At least 8 characters
    if (password.length < 8) return false;
    
    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;
    
    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) return false;
    
    // Must contain at least one number
    if (!/[0-9]/.test(password)) return false;
    
    // Must contain at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    
    return true;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!this.validatePasswordFormat(newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters');
    }

    const userAccount = await this.prisma.userAccount.findUnique({
      where: { id: userId }
    });

    if (!userAccount) {
      throw new Error('User account not found');
    }

    const isPasswordValid = await validatePassword(currentPassword, userAccount.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.prisma.userAccount.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        isTemporaryPassword: false,
      },
    });
  }

  async register(userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string;
    role: string;
  }) {
    // For initial registration, we'll generate a simple temporary password

    const hashedPassword = await hashPassword(userData.password);
    
    const userAccount = await prisma.userAccount.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        isTemporaryPassword: true,
        role: userData.role as UserRole,
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

    return { ...userAccount };
  }

  async resetUserPassword(userAccountId: string): Promise<string> {
    const temporaryPassword = generateSimplePassword(8);
    const hashedPassword = await hashPassword(temporaryPassword);

    await this.prisma.userAccount.update({
      where: { id: userAccountId },
      data: {
        passwordHash: hashedPassword,
        isTemporaryPassword: true,
      },
    });

    return temporaryPassword;
  }
} 
