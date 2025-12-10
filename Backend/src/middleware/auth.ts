import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = await redis.get(`session:${token}`);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  await redis.expire(`session:${token}`, 60 * 60 * 24 * 30); // 30 days

  req.user = { id: userId };
  next();
};