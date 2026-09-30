import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, logAudit } from '../middleware/auth';

export const getNotices = async (req: AuthRequest, res: Response) => {
  try {
    const { category, targetRole } = req.query;
    const where: any = {};

    if (category) where.category = String(category);
    if (targetRole && targetRole !== 'ALL') {
      where.OR = [{ targetRole: 'ALL' }, { targetRole: String(targetRole) }];
    }

    const notices = await prisma.notice.findMany({
      where,
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ notices });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch notices.', error: error.message });
  }
};

export const createNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, priority, publishDate, targetRole } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        description,
        category,
        priority: priority || 'NORMAL',
        publishDate: publishDate || new Date().toISOString().split('T')[0],
        authorId: req.user!.id,
        targetRole: targetRole || 'ALL',
      },
      include: { author: { select: { name: true } } },
    });

    await logAudit(req.user?.id, 'CREATE_NOTICE', 'Notice', `Created announcement ${title}`);
    return res.status(201).json({ message: 'Notice published successfully.', notice });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create notice.', error: error.message });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({ where: { id } });
    await logAudit(req.user?.id, 'DELETE_NOTICE', 'Notice', `Deleted notice ${id}`);
    return res.json({ message: 'Notice deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete notice.', error: error.message });
  }
};
