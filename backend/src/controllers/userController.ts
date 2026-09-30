import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, search } = req.query;
    const where: any = {};

    if (role) where.role = String(role);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { username: { contains: String(search) } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch users.', error: error.message });
  }
};

export const updateUserRoleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role: role !== undefined ? role : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logAudit(req.user?.id, 'UPDATE_USER_PERMISSIONS', 'User', `Updated role/status for user ${user.email}`);
    return res.json({ message: 'User permissions updated successfully.', user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update user permissions.', error: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });
    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch audit logs.', error: error.message });
  }
};
