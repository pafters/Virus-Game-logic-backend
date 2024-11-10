import Player from "modules/games/Player";

export type PlayerSettings = { // Участник игры
    id: number; // ID игрока
    sessionId: number | null; //ID игры
    comandId: number | null; //ID команды в которой состоит игрок 
    userId: number | null; //внешний ключ IUser
    points: number | null;
    totalPoints: number;
}

export type Players = { [id: string]: Player }