import { redis } from '../config/redis.js';

export const logActivity = async (userId: string, action: string, metadata: any) => {
  try {
    await redis.xadd(
      'stream:task_events',
      '*', 
      'userId', userId,
      'action', action,
      'metadata', JSON.stringify(metadata),
      'timestamp', Date.now().toString()
    );
  } catch (error) {
    console.error('Stream Error:', error);
  }
};