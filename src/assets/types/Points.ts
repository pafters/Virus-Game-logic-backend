

export type Points = { // Начисление баллов
    id: number; // ID игрока
    sessionId: number; //ID игры
    comandId: number; //ID команды в которой состоит игрок 
    userId: number; //внешний ключ IUser
    payday: string; //дата получения баллов
}