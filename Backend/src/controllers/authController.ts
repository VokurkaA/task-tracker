import {Request, Response} from 'express';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcryptjs';
import {redis} from '../config/redis.js';
import {User} from '../types/index.js';

const escapeTag = (str: string) => str.replace(/([^a-zA-Z0-9])/g, "\\$1");

export const signup = async (req: Request, res: Response) => {
    const {email, password, username} = req.body;
    const id = `user:${uuidv4()}`;

    if (!email || !password || !username || email.trim() === "" || password.trim() === "" || username.trim() === "") {
        return res.status(400).json({error: 'All fields are required'});
    }

    const existing = await redis.call('FT.SEARCH', 'idx:users', `@email:{${escapeTag(email)}}`);
    if ((existing as any)[0] > 0) return res.status(400).json({error: 'Email exists'});

    const passwordHash = await bcrypt.hash(password, 10);

    const user: User = {
        id, email, username, passwordHash, xp: 0, level: 1, currentStreak: 0, lastActive: Date.now()
    };

    await redis.call('JSON.SET', id, '$', JSON.stringify(user));

    const token = uuidv4();
    await redis.set(`session:${token}`, user.id, 'EX', 60 * 60 * 24 * 30);

    res.status(201).json({
        message: 'User created', token, user: {id: user.id, username: user.username, xp: user.xp}
    });
};

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    if (!email || !password || email.trim() === "" || password.trim() === "") {
        return res.status(400).json({error: 'Email and password are required'});
    }

    const result: any = await redis.call('FT.SEARCH', 'idx:users', `@email:{${escapeTag(email)}}`);

    if (result[0] === 0) return res.status(400).json({error: 'Invalid credentials'});

    const user = JSON.parse(result[2][1]) as User;

    if (!await bcrypt.compare(password, user.passwordHash)) {
        return res.status(400).json({error: 'Invalid credentials'});
    }

    const token = uuidv4();
    await redis.set(`session:${token}`, user.id, 'EX', 60 * 60 * 24 * 30);

    res.json({token, user: {id: user.id, username: user.username, xp: user.xp}});
};

export const me = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({error: 'Unauthorized'});

    const userJson = await redis.call('JSON.GET', userId);
    if (!userJson) return res.status(404).json({error: 'User not found'});

    const user = JSON.parse(userJson as string) as User;

    res.json({id: user.id, username: user.username, xp: user.xp});
};