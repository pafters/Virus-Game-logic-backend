export type LoginUserData = {
    phone?: string
    birthdate?: string
    username: string
}

export type User = { // Пользователь системы
    id: number;
    phone?: string;
    birthdate?: string;
    username: string;
    online: boolean;
    socketId: string;
    lang: string
}

export type HashUser = {
    id: number,
    playerId: number,
    username: string
}

export type ClientUser = {
    username: string,
    hash: string,
    lang: string
}

export type Users = { [id: string]: User }

export type LoginAdminData = {
    login: string,
    password: string
}

export type Admin = {
    id: number,
    login: string,
    username: string,
    socketId: string,
    lang: string,
    online: boolean
}

export type HashAdmin = {
    id: number,
    login: string
}

export type ClientAdmin = {
    username: string,
    hash: string,
    lang: string
}

export type Admins = { [id: string]: Admin }