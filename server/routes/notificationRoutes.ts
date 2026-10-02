import { Router, Response } from 'express';
import { Notification } from '../models/Notification';
import { isDbConnected } from '../config/db';
import { dbManager } from '../db';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

export const notificationRouter = Router();

// GET /api/notifications - Authenticated user notifications
notificationRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id || req.user?._id;

    if (isDbConnected()) {
      let filter: any = {};
      if (role === 'ADMIN') {
        filter = { target: 'ADMIN' };
      } else {
        filter = { target: 'CUSTOMER', userId };
      }

      const list = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
      const unreadCount = list.filter(n => !n.read).length;
      return res.json({ notifications: list, unreadCount });
    } else {
      const all = await dbManager.getNotifications();
      let list = all;
      if (role === 'ADMIN') {
        list = all.filter((n: any) => n.target === 'ADMIN');
      } else {
        list = all.filter((n: any) => n.target === 'CUSTOMER' && (n.userId === userId || !n.userId));
      }
      const unreadCount = list.filter((n: any) => !n.read).length;
      return res.json({ notifications: list, unreadCount });
    }
  } catch (error: any) {
    console.error('[Notifications API] Get error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.' });
  }
});

// PATCH /api/notifications/:id/read
notificationRouter.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const notif = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
      return res.json(notif);
    } else {
      const updated = await dbManager.markNotificationAsRead(id);
      return res.json(updated);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
});

// POST /api/notifications/read-all
notificationRouter.post('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id || req.user?._id;

    if (isDbConnected()) {
      if (role === 'ADMIN') {
        await Notification.updateMany({ target: 'ADMIN', read: false }, { read: true });
      } else {
        await Notification.updateMany({ target: 'CUSTOMER', userId, read: false }, { read: true });
      }
      return res.json({ success: true });
    } else {
      await dbManager.markAllNotificationsAsRead(role, userId);
      return res.json({ success: true });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to mark all as read.' });
  }
});

export default notificationRouter;
