import { PlayerSettings } from "assets/types/Player";

export default class Player {
    id: number; // ID игрока
    sessionId: number | null = null; //ID игры
    comandId: number | null = null; //ID команды в которой состоит игрок 
    userId: number | null = null; //внешний ключ IUser
    points: number;
    totalPoints: number
    constructor({ id, sessionId, comandId, userId, points, totalPoints }: PlayerSettings) {
        this.id = id;
        this.sessionId = sessionId;
        this.comandId = comandId;
        this.userId = userId || 0;
        this.points = points || 0;
        this.totalPoints = totalPoints || 0;
    }
}