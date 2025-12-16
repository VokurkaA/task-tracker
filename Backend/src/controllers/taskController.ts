import {Response} from 'express';
import {v4 as uuidv4} from 'uuid';
import {redis} from '../config/redis.js';
import {AuthRequest} from '../middleware/auth.js';
import {Priority, Role, ShareStatus, Task, User} from '../types/index.js';
import {logActivity} from '../services/streamService.js';

const NOTIFY_CHANNEL = 'channel:updates';

const notifyUsers = async (userIds: string[], type: string, payload: any) => {
    await redis.publish(NOTIFY_CHANNEL, JSON.stringify({userIds, type, payload}));
};

export const createTask = async (req: AuthRequest, res: Response) => {
    const {title, description, priority, category, subtasks} = req.body; // Added subtasks
    const userId = req.user!.id;
    const taskId = `task:${uuidv4()}`;

    // Process initial subtasks if provided (array of strings)
    const initialSubtasks = Array.isArray(subtasks) ? subtasks.map((stTitle: string) => ({
        id: uuidv4(), title: stTitle, isComplete: false
    })) : [];

    const task: Task = {
        id: taskId,
        ownerId: userId,
        title,
        description: description || '',
        category: category || 'General',
        priority: priority || Priority.MEDIUM,
        isCompleted: false,
        createdAt: Date.now(),
        sharedWith: [],
        subtasks: initialSubtasks
    };

    await redis.call('JSON.SET', taskId, '$', JSON.stringify(task));
    await redis.expire(taskId, 60 * 60 * 24 * 30); // 30 days

    await logActivity(userId, 'CREATE_TASK', {taskId, title});
    res.status(201).json(task);
};

// ... (getTasks, updateTask, addSubtask, etc. remain the same)
// Note: updateTask works for toggling subtasks because passing the full modified subtasks array
// to JSON.MERGE replaces the existing array.

export const getTasks = async (req: AuthRequest, res: Response) => {
    const escapedUserId = req.user!.id.replace(/[:\-]/g, '\\$&')
    const query = `(@ownerId:{${escapedUserId}}) | (@sharedUserId:{${escapedUserId}})`;

    const result: any = await redis.call('FT.SEARCH', 'idx:tasks', query, 'LIMIT', '0', '100');

    const tasks = [];
    for (let i = 1; i < result.length; i += 2) {
        tasks.push(JSON.parse(result[i + 1][1]));
    }

    res.json(tasks);
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    const {id} = req.params;
    const updates = req.body;
    const userId = req.user!.id;

    const taskData = await redis.call('JSON.GET', id) as string;
    if (!taskData) return res.status(404).json({error: 'Task not found'});
    const task: Task = JSON.parse(taskData);

    const isOwner = task.ownerId === userId;
    const sharedUser = task.sharedWith.find(u => u.userId === userId);
    const isEditor = sharedUser?.role === Role.EDITOR && sharedUser?.status === ShareStatus.ACCEPTED;

    if (!isOwner && !isEditor) return res.status(403).json({error: 'Forbidden'});

    if (updates.isCompleted === true && !task.isCompleted) {
        await redis.call('JSON.NUMINCRBY', userId, '$.xp', 10);
    }

    await redis.call('JSON.MERGE', id, '$', JSON.stringify(updates));

    const recipients = [task.ownerId, ...task.sharedWith.map(u => u.userId)];
    await notifyUsers(recipients, 'TASK_UPDATED', {taskId: id, ...updates});
    await logActivity(userId, 'UPDATE_TASK', {taskId: id});

    res.json({success: true});
};

export const addSubtask = async (req: AuthRequest, res: Response) => {
    const {id} = req.params;
    const {title} = req.body;

    const subtask = {id: uuidv4(), title, isComplete: false};
    await redis.call('JSON.ARRAPPEND', id, '$.subtasks', JSON.stringify(subtask));

    const taskData = await redis.call('JSON.GET', id) as string;
    const task: Task = JSON.parse(taskData);
    const recipients = [task.ownerId, ...task.sharedWith.map(u => u.userId)];
    await notifyUsers(recipients, 'SUBTASK_ADDED', {taskId: id, subtask});

    res.status(201).json(subtask);
};

export const shareTask = async (req: AuthRequest, res: Response) => {
    const {id} = req.params;
    const {email, role} = req.body;
    const userId = req.user!.id;

    const userSearch: any = await redis.call('FT.SEARCH', 'idx:users', `@email:{${email.replace(/@/g, '\\@')}}`);
    if (userSearch[0] === 0) return res.status(404).json({error: 'User not found'});
    const targetUser = JSON.parse(userSearch[2][1]) as User;

    if (targetUser.id === userId) return res.status(400).json({error: 'Cannot share with yourself'});

    const shareObj = {userId: targetUser.id, role, status: ShareStatus.PENDING};
    await redis.call('JSON.ARRAPPEND', id, '$.sharedWith', JSON.stringify(shareObj));

    await notifyUsers([targetUser.id], 'TASK_SHARED', {taskId: id, invitedBy: req.user!.id});
    res.json({message: `Invite sent to ${targetUser.username}`});
};

export const respondToInvite = async (req: AuthRequest, res: Response) => {
    const {id} = req.params;
    const {accept} = req.body;
    const userId = req.user!.id;

    const taskData = await redis.call('JSON.GET', id) as string;
    if (!taskData) return res.status(404).json({error: 'Task not found'});
    const task: Task = JSON.parse(taskData);

    const userIndex = task.sharedWith.findIndex(u => u.userId === userId);
    if (userIndex === -1) return res.status(404).json({error: 'Invite not found'});

    if (accept) {
        await redis.call('JSON.SET', id, `$.sharedWith[${userIndex}].status`, `"${ShareStatus.ACCEPTED}"`);
        await logActivity(userId, 'INVITE_ACCEPTED', {taskId: id});
    } else {
        await redis.call('JSON.ARRPOP', id, `$.sharedWith`, userIndex);
        await logActivity(userId, 'INVITE_REJECTED', {taskId: id});
    }

    res.json({success: true});
};