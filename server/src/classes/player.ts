import { WebSocket } from 'ws';


export enum PlayerStatus {
    Connecting,
    InLobby,
    InGameRoom,
}


export default class Player {
    name: string;
    wsConn: WebSocket;
    state: PlayerStatus = PlayerStatus.Connecting;

    constructor(name: string, wsConn: WebSocket) {
        this.name = name;
        this.wsConn = wsConn;
    }
}