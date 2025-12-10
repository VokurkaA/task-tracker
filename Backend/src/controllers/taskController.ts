import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../config/redis.js';
import { AuthRequest } from '../middleware/auth.js';
import { Task, Role, Priority, User } from '../types/index.js';
import { logActivity } from '../services/streamService.js';

const NOTIFY_CHANNEL = 'channel:updates';

const notifyUsers = async (userIds: string[], type: string, payload: any) => {
  await redis.publish(NOTIFY_CHANNEL, JSON.stringify({ userIds, type, payload }));
};

export const createTask = async (req: AuthRequest, res: Response) => {
  const { title, description, priority } = req.body;
  const userId = req.user!.id;
  const taskId = `task:${uuidv4()}`;

  const task: Task = {
    id: taskId,
    ownerId: userId,
    title,
    description: description || '',
    priority: priority || Priority.MEDIUM,
    status: 'pending',
    createdAt: Date.now(),
    sharedWith: [],
    subtasks: []
  };

  await redis.call('JSON.SET', taskId, '$', JSON.stringify(task));
  await redis.expire(taskId, 60 * 60 * 24 * 30); // 30 days

  await logActivity(userId, 'CREATE_TASK', { taskId, title });
  res.status(201).json(task);
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const query = `@ownerId:{${userId.replace(/:/g, '\\:')}} | @sharedUserId:{${userId.replace(/:/g, '\\:')}}`;
  
  const result: any = await redis.call('FT.SEARCH', 'idx:tasks', query, 'LIMIT', '0', '100');
  
  const tasks = [];
  for (let i = 1; i < result.length; i += 2) {
    tasks.push(JSON.parse(result[i + 1][1]));
  }
  
  res.json(tasks);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = req.user!.id;

  const taskData = await redis.call('JSON.GET', id) as string;
  if (!taskData) return res.status(404).json({ error: 'Task not found' });
  const task: Task = JSON.parse(taskData);

  const isOwner = task.ownerId === userId;
  const isEditor = task.sharedWith.some(u => u.userId === userId && u.role === Role.EDITOR);

  if (!isOwner && !isEditor) return res.status(403).json({ error: 'Forbidden' });

  if (updates.status === 'completed' && task.status !== 'completed') {
    await redis.call('JSON.NUMINCRBY', userId, '$.xp', 10);
  }

  await redis.call('JSON.MERGE', id, '$', JSON.stringify(updates));

  const recipients = [task.ownerId, ...task.sharedWith.map(u => u.userId)];
  await notifyUsers(recipients, 'TASK_UPDATED', { taskId: id, ...updates });
  await logActivity(userId, 'UPDATE_TASK', { taskId: id });

  res.json({ success: true });
};

export const addSubtask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;
  const userId = req.user!.id;

  const subtask = { id: uuidv4(), title, isComplete: false };
  
  await redis.call('JSON.ARRAPPEND', id, '$.subtasks', JSON.stringify(subtask));
  
  const taskData = await redis.call('JSON.GET', id) as string;
  const task: Task = JSON.parse(taskData);
  
  const recipients = [task.ownerId, ...task.sharedWith.map(u => u.userId)];
  await notifyUsers(recipients, 'SUBTASK_ADDED', { taskId: id, subtask });

  res.status(201).json(subtask);
};

export const shareTask = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { email, role } = req.body; // Role: 'viewer' | 'editor'
  const userId = req.user!.id;

  const userSearch: any = await redis.call('FT.SEARCH', 'idx:users', `@email:{${email.replace(/@/g, '\\@')}}`);
  if (userSearch[0] === 0) return res.status(404).json({ error: 'User not found' });
  const targetUser = JSON.parse(userSearch[2][1]) as User;

  const shareObj = { userId: targetUser.id, role };
  await redis.call('JSON.ARRAPPEND', id, '$.sharedWith', JSON.stringify(shareObj));

  res.json({ message: `Shared with ${targetUser.username}` });
};