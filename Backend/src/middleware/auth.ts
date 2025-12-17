import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {redis} from '../config/redis.js';

export interface AuthRequest extends Request {
    user?: { id: string };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const userId = await redis.get(`session:${token}`);
        if (!userId || userId !== decoded.id) {
            return res.status(401).json({error: 'Session expired or revoked'});
        }

        await redis.expire(`session:${token}`, 60 * 60 * 24 * 30); // 30 days

        req.user = {id: userId};
        next();
    } catch (err) {
        return res.status(401).json({error: 'Invalid token'});
    }
};