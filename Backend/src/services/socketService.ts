import { Server } from 'socket.io';
import { redisSub } from '../config/redis.js';

export const initSocket = (io: Server) => {
  
  redisSub.subscribe('channel:updates', (err: any) => {
    if (err) console.error('Failed to subscribe to updates', err);
  });

  redisSub.on('message', (channel: string, message: string) => {
    if (channel === 'channel:updates') {
      const event = JSON.parse(message);
      // event structure: { userIds: string[], type: string, payload: any }
      
      event.userIds.forEach((userId: string) => {
        io.to(userId).emit('update', event);
      });
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.join(userId); 
      console.log(`🔌 User ${userId} connected to socket`);
    }
  });
};