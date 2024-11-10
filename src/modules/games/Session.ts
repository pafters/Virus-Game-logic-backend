import { Players } from "assets/types/Player";
import { SessionSettings, Status } from "assets/types/Session";
import { users } from "../Store";

import { Server, Socket } from 'socket.io';
import SOCKET_COMANDS from "components/socket/comands";

export default class Session {
    id: number;
    scenarioId: number;
    isTeam: boolean;
    teamNames: string[] | null
    status: Status;
    players: Players;
    private _io: Server;

    constructor({ id, scenarioId, isTeam, teamNames, status, players }: SessionSettings, io: Server) {
        this.id = id;
        this.scenarioId = scenarioId;
        this.isTeam = isTeam;
        this.teamNames = teamNames || null;
        this.status = status;
        this.players = players;
        this._io = io;
    }


    public removePlayers = () => {
        Object.keys(this.players).forEach((id: string) => {
            if (this.players[id].userId) {
                this._io.sockets.sockets.get(users[this.players[id].userId].socketId)?.leave('game');
                this._io.sockets.sockets.get(users[this.players[id].userId].socketId)?.join('online');
            }
        })
    }

    public updateStatus = (status: Status) => {
        this.status = status;
    }

}
