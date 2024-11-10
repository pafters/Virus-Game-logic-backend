export type PlayerCreateData = {
    sessionId: number; //ID игры
    comandId: number; //ID команды в которой состоит игрок 
    userId: number; //внешний ключ IUser
}