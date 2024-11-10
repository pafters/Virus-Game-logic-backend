import { User, LoginUserData, HashUser, ClientUser } from "assets/types/Users"
import { Server, Socket } from "socket.io";
import SOCKET_COMANDS from "../../components/socket/comands";
import { users, players } from "../Store";
import { decryptObject, encryptObject } from "../system/System";
import { USERS_ERRORS } from "../../components/errors/users";
import { BaseErrors } from "assets/types/Systems";

export default class UserManager {
    private _io: Server | null = null;

    constructor(io: Server) {

        this._io = io;

        if (!io)
            return;

        this._io.on('connection', socket => {
            socket.on(SOCKET_COMANDS.USERS.LOGIN, (data) => this.socketUserLogin(data, socket))

            socket.on(SOCKET_COMANDS.USERS.LOGOUT, (data) => this.socketUserLogout(data, socket))

            socket.on(SOCKET_COMANDS.USERS.GET_ONLINE, () => this.socketGetOnline(socket))
        });
    }

    private findUser(phone: string, birthdate: string): User | null {
        let user: User | null = null;
        for (const userId in users) {
            // Получаем объект пользователя
            const localUser = users[userId];

            // Проверяем, соответствуют ли значения phone и birthdate
            if (localUser.phone === phone && localUser.birthdate === birthdate) {
                user = localUser;
                // Выходим из цикла, так как нашли нужного пользователя
                break;
            }
        }

        return user;
    }

    private userLogout(user: User): true | BaseErrors {
        if ((users[user.id]?.username === user.username)) {
            users[user.id].online = false;
            return true;
        }
        else {
            const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
            return error
        }
    }

    private findUserBySocket(socketId: string) {
        let user: User | null = null;
        for (const userId in users) {
            // Получаем объект пользователя
            const localUser = users[userId];

            // Проверяем, соответствуют ли значения phone и birthdate
            if (localUser.socketId === socketId) {
                user = localUser;
                // Выходим из цикла, так как нашли нужного пользователя
                break;
            }
        }

        return user;
    }



    socketUserLogin = (data: LoginUserData, socket: Socket): void => {
        const { username, phone, birthdate, hash } = data;
        if (username || username !== '') {
            let user: User | null = null;
            if (phone && birthdate) {
                user = this.findUser(phone, birthdate);
                if (user) {
                    user.socketId = socket.id;
                }
            }

            if (!user) {
                user = {
                    id: Object.keys(users).length,
                    ...data,
                    socketId: socket.id,
                    online: true,
                    lang: 'ru'
                };
            }

            const player = { //НУЖНО СОЗДАТЬ МЕДИАТОР
                id: Object.keys(players).length,
                userId: user.id
            }

            const hash = encryptObject({ id: user.id, username, playerId: player.id });
            if (hash) {
                users[user.id] = user;
                const clientUser: ClientUser = { username: user.username, hash, lang: 'ru' }
                socket.join('online');
                this._io?.emit(SOCKET_COMANDS.USERS.LOGIN, { user: clientUser })
            }
            else {
                const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
                socket.emit(SOCKET_COMANDS.ADMIN.LOGOUT, { error });
            }
        } else {
            const error: BaseErrors = USERS_ERRORS.LOGIN.USERNAME.WRONG;
            socket.emit(SOCKET_COMANDS.USERS.LOGIN, { error });
        }
        socket.emit(SOCKET_COMANDS.USERS.LOGIN, null);
    }

    socketUserLogout({ hash = '' }: { hash: string }, socket: Socket): void {
        const user: HashUser | null = decryptObject(hash);
        if (user) {
            if ((users[user.id]?.username === user.username)) {
                const result = this.userLogout(users[user.id]);
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, result);
                socket.leave('online');
            }
            else {
                const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, { error });
            }
        }
    }

    socketDisconnectLogout = (socket: Socket): boolean => {
        const user = this.findUserBySocket(socket.id);
        if (user) {
            if ((users[user.id]?.username === user.username)) {
                const result = this.userLogout(users[user.id]);
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, result);
                return true;
            }
            else {
                const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, { error });
            }
        }
        return false;
    }

    socketGetOnline = (socket: Socket): void => {
        socket.emit(SOCKET_COMANDS.USERS.GET_ONLINE, { users: Object.keys(users).map((id) => users[id].online) || [] });
    }
}