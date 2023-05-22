//TODO better types

//This is the worker-side part of the worker
//import Performance from 'classes/Performance';
import { ClientMessageHandlers, ClientMessageType } from 'game/Client';
import { ServerToClientsConnector } from 'types/game/shared/game';
import Server from './Server'
import AsyncConnection, {AsyncConnectionType} from "AsyncConnection"
import WorkerTransport from 'AsyncConnection/WorkerTransport';
import WorkerConnector from 'game/WorkerConnector';
import { ServerMessageHandlers, ServerMessageTypes } from './ServerComms';


type LocalMethods = {
    //TODO generic types here?
    send: <T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data']) => ServerMessageHandlers[T]['returns'];
}

type RemoteMethods = {
    send: WorkerConnector['onmessage']
};

export default class WorkerServer implements ServerToClientsConnector {

    server: Server;
    asyncConnection: AsyncConnectionType<RemoteMethods>;

    constructor(worker: Worker) {
        const transport = new WorkerTransport<RemoteMethods>(worker);

        this.asyncConnection = new AsyncConnection<RemoteMethods, LocalMethods>(transport, {send: this.onmessage})

        this.server = new Server(this);
    }

    onmessage = <T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data']) => {
        return this.server.onMessage(type, data, 1);//Hardcode clientId to 1 here, as will only ever be one client with this connector

    }

    broadcastToClients<T extends ClientMessageType>(messageType: T, data: Parameters<ClientMessageHandlers[T]>[0]) {
        this.asyncConnection.call.send(messageType, data);
    }

    sendMessageToClient<T extends ClientMessageType>(connectionId: number, messageType: T, data: Parameters<ClientMessageHandlers[T]>[0]): Promise<ReturnType<ClientMessageHandlers[T]>> {
        return this.asyncConnection.call.send(messageType, data) as Promise<ReturnType<ClientMessageHandlers[T]>>;
    };

    // //Server comms methods
    // broadcastToClients(type, data) {
    //     //c/onsole.log('[LC] broadcastToClients: ', messageType, data);
    //     //global.postMessage({type, data});
    // }

    // sendMessageToClient(connectionId, type, data) {
    //     // if(!(connectionId === 1)) {//This connector only supports a single player
    //     //     throw new Error('Invalid connectionId');
    //     // }

    //     // // let entries = null;

    //     // // if(type === "updatingGame") {
    //     // //     Performance.mark("server :: updatingGame :: start toBinary");
    //     // // }
    //     // const binaryData = toBinary(data);

    //     // // if(type === "updatingGame") {
    //     // //     Performance.measure("server :: updatingGame :: toBinary", "server :: updatingGame :: start toBinary");

    //     // //     entries = Performance.getEntries().reduce((output, {name, duration}) => {
    //     // //         if(!output[name]) {
    //     // //             output[name] = [];
    //     // //         }

    //     // //         output[name].push(duration);

    //     // //         return output;
    //     // //     }, {});
    //     // // }

    //     // const dataToSend = {type, data: binaryData, performance: undefined};

    //     // // if(type === "updatingGame") {
    //     // //     dataToSend.performance = entries;
    //     // // }

    //     // binaryData instanceof ArrayBuffer ? 
    //     //     global.postMessage(dataToSend, [binaryData])
    //     //     :
    //     //     global.postMessage(dataToSend);
    // }

    // // //Recieving messages
    // // onmessage = async <T extends ServerMessageTypes>({data: {type, data, clientId, messageId}}: {data: {type: T, data: ServerMessageHandlers[T]['data'], clientId: number, messageId: number}}) => {
    // //     const result = await this.server.onMessage(type, data, clientId);

    // //     this.sendMessageToClient(1, 'reply', result, messageId);
    // // }
}

const enc = new TextEncoder();

function toBinary(data) {
    if(data && data !== true && data !== false && !(data instanceof ArrayBuffer)) {
        const encData = enc.encode(JSON.stringify(data));

        return encData.buffer;
    }

    return data;
}