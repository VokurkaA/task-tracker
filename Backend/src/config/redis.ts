import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

export const redis = new Redis(REDIS_URL);
export const redisSub = new Redis(REDIS_URL); 

export async function initRedisIndexes() {
  try {
    const indices = await redis.call('FT._LIST');
    
    if (!Array.isArray(indices) || !(indices as string[]).includes('idx:users')) {
      await redis.call(
        'FT.CREATE', 'idx:users', 'ON', 'JSON', 'PREFIX', '1', 'user:',
        'SCHEMA',
        '$.email', 'AS', 'email', 'TAG',
        '$.username', 'AS', 'username', 'TEXT'
      );
      console.log('Created User Index');
    }

    if (!Array.isArray(indices) || !(indices as string[]).includes('idx:tasks')) {
      await redis.call(
        'FT.CREATE', 'idx:tasks', 'ON', 'JSON', 'PREFIX', '1', 'task:',
        'SCHEMA',
        '$.ownerId', 'AS', 'ownerId', 'TAG',
        '$.priority', 'AS', 'priority', 'TAG',
        '$.status', 'AS', 'status', 'TAG',
        '$.sharedWith[*].userId', 'AS', 'sharedUserId', 'TAG'
      );
      console.log('Created Task Index');
    }
  } catch (err) {
    console.error('Redis Index Error:', err);
  }
}