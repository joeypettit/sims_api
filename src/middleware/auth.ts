import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '../../prisma/prisma-client';

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  // Check if user is blocked
  const user = req.user as { id: string, userAccount?: { role: UserRole } };
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: user.id },
    select: { isBlocked: true }
  });

  if (userAccount?.isBlocked) {
    req.logout(() => {
      res.status(403).json({ error: 'Account is blocked. Please contact an administrator.' });
    });
    return;
  }

  return next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = req.user as { userAccount?: { role: UserRole } };
  if (!user.userAccount?.role || (user.userAccount.role !== UserRole.ADMIN && user.userAccount.role !== UserRole.SUPER_ADMIN)) {
    res.status(403).json({ error: 'Not authorized - Admin access required' });
    return;
  }

  return next();
}; 