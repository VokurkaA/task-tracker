import 'dotenv/config'
import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import {initRedisIndexes} from './config/redis.js';
import {initSocket} from './services/socketService.js';
import {requireAuth} from './middleware/auth.js';
import * as Auth from './controllers/authController.js';
import * as Task from './controllers/taskController.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {origin: "*"}
});

app.use(cors());
app.use(express.json());

app.post('/auth/signup', Auth.signup);
app.post('/auth/login', Auth.login);
app.get('/auth/me', requireAuth, Auth.me);

app.get('/tasks', requireAuth, Task.getTasks);
app.post('/tasks', requireAuth, Task.createTask);
app.put('/tasks/:id', requireAuth, Task.updateTask);
app.delete('/tasks/:id', requireAuth, Task.deleteTask);
app.post('/tasks/:id/subtasks', requireAuth, Task.addSubtask);
app.post('/tasks/:id/share', requireAuth, Task.shareTask);
app.post('/tasks/:id/invite', requireAuth, Task.respondToInvite);

const PORT = process.env.PORT || 4000;

async function start() {
    await initRedisIndexes();
    initSocket(io);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Backend running on port ${PORT}`);
    });
}

start();