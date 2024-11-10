import Session from "modules/games/Session";
import { Players } from "./Player";

export type SessionData = { // Игра
    scenarioId: number; // ID сценария
    isTeam: boolean; // Одиночная/командная (true - командная)
    teamNames?: string[] | null
}

export type Status = 'prepair' | 'started' | 'continue' | 'pause' | 'finished';

export type SessionSettings = SessionData & {
    id: number;
    status: Status,
    players: Players
}

export type Sessions = { [id: string]: Session };