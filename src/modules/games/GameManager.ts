import { Server, Socket } from 'socket.io';
import { players, sessions, users } from '../Store';
import { SessionSettings, Status } from 'assets/types/Session';
import Session from './Session';
import { Players } from 'assets/types/Player';
import SOCKET_COMANDS from "../../components/socket/comands";
export default class GameManager {

    private _io: Server;

    constructor(io: Server) {
        this._io = io;

        this._io.on('connection', socket => {
            socket.on('GAME_CREATE_SESSION', (data: any) => this.createSessions(data, socket))
        });
    }

    public createSessions(data: SessionSettings, socket: Socket): void {
        const id = Object.keys(sessions).length;
        const joiners: Players = {};
        Object.keys(players).forEach((playerId: string) => {
            if (players[playerId] && players[playerId].userId) {
                if (users[players[playerId].userId].online) {
                    players[playerId].sessionId = id;
                    joiners[players[playerId].id] = players[playerId];
                    this._io.sockets.sockets.get(users[players[playerId].userId].socketId)?.join('game');
                }
            }
        });

        sessions[id] = new Session({
            id: id,
            scenarioId: data.scenarioId,
            isTeam: data.isTeam,
            teamNames: data.teamNames || null,
            status: 'prepair',
            players: joiners,
        }, this._io);

        this._io.to('game').emit(SOCKET_COMANDS.GAME.UPDATE_SESSION, { session: sessions[id] });

        socket.emit(SOCKET_COMANDS.GAME.UPDATE_SESSION, { session: sessions[id] });
    }

    socketGetPlayers = (socket: Socket, id: string): void => {
        socket.emit(SOCKET_COMANDS.GAME.GET_PLAYERS, Object.keys({ players: sessions[id].players }) || []);
    }

    public updateSession(id: string, status: Status, socket: Socket): void {
        sessions[id].status = status;
        this._io.to('game').emit(SOCKET_COMANDS.GAME.UPDATE_SESSION, { session: sessions[id] });
        socket.emit(SOCKET_COMANDS.GAME.UPDATE_SESSION, { session: sessions[id] });
    }

    public closeSession(id: string, socket: Socket): void {
        sessions[id].status = 'finished';
        sessions[id].removePlayers();
        socket.emit(SOCKET_COMANDS.GAME.UPDATE_SESSION, { session: sessions[id] });
    }

}