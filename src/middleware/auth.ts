import { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma/prisma-client';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = req.user as { isAdmin: boolean };
  if (!user.isAdmin) {
    return res.status(403).json({ error: 'Not authorized - Admin access required' });
  }

  next();
}; 