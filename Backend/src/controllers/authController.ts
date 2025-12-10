import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { redis } from '../config/redis.js';
import { User } from '../types/index.js';

export const signup = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  const id = `user:${uuidv4()}`;
  
  const existing = await redis.call('FT.SEARCH', 'idx:users', `@email:{${email.replace(/@/g, '\\@')}}`);
  if ((existing as any)[0] > 0) return res.status(400).json({ error: 'Email exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user: User = {
    id, email, username, passwordHash,
    xp: 0, level: 1, currentStreak: 0, lastActive: Date.now()
  };

  await redis.call('JSON.SET', id, '$', JSON.stringify(user));
  
  res.status(201).json({ message: 'User created' });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result: any = await redis.call('FT.SEARCH', 'idx:users', `@email:{${email.replace(/@/g, '\\@')}}`);
  
  if (result[0] === 0) return res.status(400).json({ error: 'Invalid credentials' });
  
  const user = JSON.parse(result[2][1]) as User;
  
  if (!await bcrypt.compare(password, user.passwordHash)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = uuidv4();
  await redis.set(`session:${token}`, user.id, 'EX', 60 * 60 * 24 * 30); // 30 days

  res.json({ token, user: { id: user.id, username: user.username, xp: user.xp } });
};