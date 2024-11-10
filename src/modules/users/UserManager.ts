import { LoginAdminData, User, LoginUserData, Users, ClientAdmin, Admin, HashAdmin, HashUser, ClientUser } from "assets/types/Users"
import { Server, Socket } from "socket.io";
import SOCKET_COMANDS from "../../components/socket/comands";
import { users, admins, players } from "../Store";
import { decryptObject, encryptObject } from "../system/System";
import { USERS_ERRORS } from "../../components/errors/users";
import { BaseErrors } from "assets/types/Systems";
import { adminLogin } from "../../routes/router";

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

            //ADMIN
            socket.on(SOCKET_COMANDS.ADMIN.LOGIN, (data) => this.socketAdminLogin(data, socket))

            socket.on(SOCKET_COMANDS.ADMIN.LOGOUT, (data) => this.socketAdminLogout(data, socket))
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
            if (!(users[user.id]?.phone && users[user.id]?.birthdate)) {
                delete users[user.id];
            }
            else {
                users[user.id].online = false;
            }
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
        const { username, phone, birthdate } = data;
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
                //socket.emit(SOCKET_COMANDS.USERS.LOGIN, { user: clientUser });
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

    socketDisconnectLogout = (socket: Socket): void => {
        const user = this.findUserBySocket(socket.id);
        if (user) {
            if ((users[user.id]?.username === user.username)) {
                const result = this.userLogout(users[user.id]);
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, result);
            }
            else {
                const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
                socket.emit(SOCKET_COMANDS.USERS.LOGOUT, { error });
            }
        }
        else {
            const admin = this.findAdminBySocket(socket.id);
            if (admin) {
                admins[admin.id].online = false;
            }
            const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
            socket.emit(SOCKET_COMANDS.USERS.LOGOUT, { error });
        }

    }

    socketGetOnline = (socket: Socket): void => {
        socket.emit(SOCKET_COMANDS.USERS.GET_ONLINE, { users: Object.keys(users).map((id) => users[id].online) || [] });
    }


    /* Авторизация ведущего */
    // ***** ADMIN ******* //
    /***********************/

    private findAdminByUsername(username: string): Admin | null {
        let admin: Admin | null = null;
        for (const adminId in admins) {
            // Получаем объект пользователя
            const localAdmin = admins[adminId];

            // Проверяем, соответствуют ли значения phone и birthdate
            if (localAdmin.username === username) {
                admin = localAdmin;
                // Выходим из цикла, так как нашли нужного пользователя
                break;
            }
        }

        return admin;
    }
    private findAdminBySocket(socketId: string) { //можно объединить с findUserBySocket
        let admin: Admin | null = null;
        for (const adminId in admins) {
            // Получаем объект пользователя
            const localAdmin = admins[adminId];

            // Проверяем, соответствуют ли значения phone и birthdate
            if (localAdmin.socketId === socketId) {
                admin = localAdmin;
                // Выходим из цикла, так как нашли нужного пользователя
                break;
            }
        }

        return admin;
    }

    async socketAdminLogin(data: LoginAdminData, socket: Socket): Promise<void> {
        const { password = '', login = '' } = data;
        console.log(data);
        if (password === '') {
            const error: BaseErrors = USERS_ERRORS.LOGIN.PASSWORD.WRONG;
            socket.emit(SOCKET_COMANDS.ADMIN.LOGIN, { error });
        } else if (login === '') {
            const error: BaseErrors = USERS_ERRORS.LOGIN.USERNAME.WRONG;
            socket.emit(SOCKET_COMANDS.ADMIN.LOGIN, { error });
        } else {
            try {
                //const res: any = await adminLogin({ password, login });
                //if (res) {
                //const { login, username } = res.data.data;
                const username = login; // Временная заглушка
                let admin = this.findAdminByUsername(login);
                if (!admin) {
                    admin = {
                        id: Object.keys(admins).length,
                        login: login,
                        username: username,
                        socketId: socket.id,
                        lang: 'ru',
                        online: true
                    }
                } else {
                    admin = {
                        ...admin,
                        login: login,
                        username: username,
                        socketId: socket.id,
                        online: true
                    }
                }

                const hash = encryptObject({ id: admin.id, login: admin.login });
                if (hash) {
                    admins[admin.id] = admin;
                    const clientAdmin: ClientAdmin = { username: admin.username, hash, lang: 'ru' }
                    socket.emit(SOCKET_COMANDS.ADMIN.LOGIN, { user: clientAdmin });
                } else {
                    const error: BaseErrors = USERS_ERRORS.LOGIN.PASSWORD.WRONG;
                    socket.emit(SOCKET_COMANDS.ADMIN.LOGIN, { error });
                }
                //}
            } catch (e: any) {
                socket.emit(SOCKET_COMANDS.ADMIN.LOGIN, { error: e.response.data.data });
            }
        }
        //здесь будет запрос в битрикс на проверку пароля и логина и возвращаем последний сохраненный язык интерфейс, но пока только заглушка
    }

    socketAdminLogout({ hash = '' }: { hash: string }, socket: Socket): void {
        //здесь будет запрос в битрикс на выход, если это нужно будет, но как будто не нужно
        const admin: HashAdmin | null = decryptObject(hash);
        if (admin) {
            if (admins[admin.id]?.login === admin.login) {
                delete admins[admin.id];
                socket.emit(SOCKET_COMANDS.ADMIN.LOGOUT, {});
            } else {
                const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
                socket.emit(SOCKET_COMANDS.ADMIN.LOGOUT, { error });
            }
        } else {
            const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
            socket.emit(SOCKET_COMANDS.ADMIN.LOGOUT, { error });
        }
    }
}