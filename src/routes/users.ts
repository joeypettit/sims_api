import express from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import prisma from '../../prisma/prisma-client';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Get all users
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        userAccount: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/:userId/role', isAdmin, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    const userAccount = await prisma.userAccount.findUnique({
      where: { id: userId }
    });

    if (!userAccount) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent modification of SUPER_ADMIN users
    if (userAccount.role === UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: 'Super admin users cannot be modified' });
      return;
    }

    // Only SUPER_ADMIN can promote to ADMIN
    const requestingUser = req.user as { userAccount?: { role: UserRole } };
    if (role === UserRole.ADMIN && requestingUser.userAccount?.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: 'Only super admins can promote users to admin' });
      return;
    }

    const updatedUser = await prisma.userAccount.update({
      where: { id: userId },
      data: { role },
      include: {
        user: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/:userId', isAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    const userAccount = await prisma.userAccount.findUnique({
      where: { id: userId }
    });

    if (!userAccount) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent deletion of SUPER_ADMIN users
    if (userAccount.role === UserRole.SUPER_ADMIN) {
      res.status(403).json({ error: 'Super admin users cannot be deleted' });
      return;
    }

    await prisma.userAccount.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 
