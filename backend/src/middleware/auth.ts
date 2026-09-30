import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
    name: string;
    studentId?: string;
    teacherId?: string;
    staffId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'ai_smart_campus_super_secret_jwt_key_2026';
    
    const decoded = jwt.verify(token, secret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: true,
        teacherProfile: true,
        staffProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User account is inactive or not found.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      name: user.name,
      studentId: user.studentProfile?.id,
      teacherId: user.teacherProfile?.id,
      staffId: user.staffProfile?.id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized request.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Requires ${roles.join(' or ')} permission.` });
    }

    next();
  };
};

export const logAudit = async (userId: string | undefined, action: string, entity: string, details?: string, ipAddress?: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        details: details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (e) {
    console.error('Audit log write failed:', e);
  }
};
