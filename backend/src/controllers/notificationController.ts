import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    return res.json({ notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch notifications.', error: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await prisma.notification.updateMany({
        where: { userId: req.user!.id },
        data: { isRead: true },
      });
      return res.json({ message: 'All notifications marked as read.' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return res.json({ message: 'Notification marked as read.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update notification.', error: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.delete({ where: { id } });
    return res.json({ message: 'Notification deleted.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete notification.', error: error.message });
  }
};
