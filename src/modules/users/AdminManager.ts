import { LoginAdminData, ClientAdmin, Admin, HashAdmin } from "assets/types/Users"
import { Server, Socket } from "socket.io";
import SOCKET_COMANDS from "../../components/socket/comands";
import { admins } from "../Store";
import { decryptObject, encryptObject } from "../system/System";
import { USERS_ERRORS } from "../../components/errors/users";
import { BaseErrors } from "assets/types/Systems";
import { adminLogin } from "../../routes/router";

export default class AdminManager {
    private _io: Server | null = null;

    constructor(io: Server) {

        this._io = io;

        if (!io)
            return;

        this._io.on('connection', socket => {
            socket.on(SOCKET_COMANDS.ADMIN.LOGIN, (data) => this.socketAdminLogin(data, socket))

            socket.on(SOCKET_COMANDS.ADMIN.LOGOUT, (data) => this.socketAdminLogout(data, socket))
        });
    }
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

    socketDisconnectLogout = (socket: Socket): void => {
        const admin = this.findAdminBySocket(socket.id);
        if (admin) {
            admins[admin.id].online = false;
            socket.emit(SOCKET_COMANDS.USERS.LOGOUT, {});
        } else {
            const error: BaseErrors = USERS_ERRORS.SYSTEM.SESSION.ACCESS;
            socket.emit(SOCKET_COMANDS.USERS.LOGOUT, { error });
        }
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