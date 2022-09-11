import { WebSocketServer, WebSocket } from 'ws';
import type {MessageEvent, CloseEvent, ErrorEvent, Data} from 'ws';
import Player, { PlayerStatus } from './player';
import GameRoom from './gameRoom';

interface ServerMessage {
    type: string;
    data: any
}

interface PlayerData {
    name: string;
}

interface CreateGameRoomData {
    name: string,
    isPrivate: boolean,
    password: boolean,
    numSlots: number,
}

export default class Server {
    wss: WebSocketServer;

    players: Map<WebSocket, Player>;
    lobby:Set<Player>;
    gameRooms: Map<String, GameRoom>;

    constructor(websocketOptions = {port: 8080}) {
        this.wss = new WebSocketServer(websocketOptions);
        this.players = new Map();
        this.lobby = new Set();
        this.gameRooms = new Map();

        this.wss.on('connection', this._onSocketConnection);
    }

    //Socket event handlers
    _onSocketConnection = (ws: WebSocket) => {
        this.players.set(ws, new Player(null, ws));

        ws.addEventListener('message', this._onSocketMessage);
        ws.addEventListener('close', this._onSocketClose)
        ws.addEventListener('error', this._onSocketError)
    
        // handling client connection error
        ws.onerror = function () {
            console.log("Some Error occurred")
        }
    }

    _onSocketMessage = (event: MessageEvent) => {
        const message:ServerMessage = this.decodeData(event.data);

        switch(message.type) {
            case 'connect':
                return this._onPlayerConnect(message.data, event.target);
            case 'createGameRoom':
                return this._onCreateGameRoom(message.data, event.target)
            default:
                console.log('Unknown message: ', message);
        }
    }

    _onSocketClose = (event: CloseEvent) => {
        this.players.delete(event.target);

        console.log('onSocketClose:: Connected clients: ', this.players.size);
    }

    _onSocketError = (event: ErrorEvent) => {
        //TODO error handling?
        console.log('onSocketError: ', event);
    }

    //Message handlers
    _onPlayerConnect = (data:PlayerData, ws:WebSocket) => {
        console.log('Connect player: ', data.name);
        const player = this.players.get(ws);

        if(player.state !== PlayerStatus.Connecting) {
            throw new Error('Unable to connect, player already connected');
        }

        player.name = data.name;
        this.lobby.add(player)
    }

    _onCreateGameRoom = (data:CreateGameRoomData, ws:WebSocket) => {
        //TODO
    }


    //Internal stuff
    decodeData(data: Data): ServerMessage {
        return JSON.parse(data.toString());
    }

    // encodeDate(data: any): string {
    //     return JSON.stringify(data);
    // }
}



// wss.on('connection', function connection(ws: WebSocket) {
//     console.log("new client connected");
//     clients.add(ws);

//     // sending message
//     ws.on("message", data => {
//         console.log(`Client has sent us: ${data}`)

//         sendToOtherClients(ws, data);
//     });

//     // handling what to do when clients disconnects from server
//     ws.on("close", () => {
//         console.log("the client has connected");
//         clients.delete(ws);
//     });

//     // handling client connection error
//     ws.onerror = function () {
//         console.log("Some Error occurred")
//     }
// });

// function sendToOtherClients(client, message) {
//     clients.forEach((ws) => {
//         if(ws !== client) {
//             ws.send(message);
//         }
//     })
// }