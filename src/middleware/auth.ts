import { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma/prisma-client';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAuthenticated middleware triggered');
  if (req.isAuthenticated()) {
    console.log('User is authenticated');
    return next();
  }
  console.log('User is not authenticated');
  res.status(401).json({ error: 'Not authenticated' });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAdmin middleware triggered');
  if (!req.isAuthenticated()) {
    console.log('User is not authenticated');
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = req.user as { isAdmin: boolean };
  if (!user.isAdmin) {
    console.log('User is not an admin');
    res.status(403).json({ error: 'Not authorized - Admin access required' });
    return;
  }

  console.log('User is an admin');
  return next();
}; 