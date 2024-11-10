import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const initSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // Замените на адрес вашего React-приложения
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('A user connected');

        // ... обработка событий сокета ...

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};

export function getIo() {
    return io;
}