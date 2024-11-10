import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import UserManager from './modules/users/UserManager';
import GameManager from './modules/games/GameManager';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Замените на адрес вашего React-приложения
        methods: ['GET', 'POST'],
    },
});

const userManager = new UserManager(io);
const gameManager = new GameManager(io)

app.use(cors());
app.use(express.json());

io.on('connection', socket => {
    console.log('connected ', socket.id);

    socket.on('sendMessage', (data: string) => {
        socket.emit('newMessage', data);
    })

    socket.on('disconnect', () => {
        console.log('disconnect', socket.id)
        userManager.socketDisconnectLogout(socket);
    });
});

// Обработка запросов к API для сохранения сообщений
app.get('/', (req, res) => {
    res.json({ message: 'All Right!!!' });
});

server.listen(5000, () => {
    console.log('Сервер запущен на порту 5000');
});
