//TODO better types

//This is the worker-side part of the worker
import Performance from 'classes/Performance';
import Client from 'game/Client';
import { Connector } from 'types/game/shared/game';
import Server from './Server'
import { ServerMessageTypes, ServerMessageHandlers } from './ServerComms';


export default class WorkerServer implements Connector {

    server: Server;

    constructor() {
        this.server = new Server(this);
    }

    
    setClient: (client: Client) => void;
    sendMessageToServer: <T extends ServerMessageTypes>(messageType: T, data: ServerMessageHandlers[T]['data']) => Promise<ServerMessageHandlers[T]['returns']>;


    //Server comms methods
    broadcastToClients(type, data) {
        //c/onsole.log('[LC] broadcastToClients: ', messageType, data);
        global.postMessage({type, data});
    }

    sendMessageToClient(connectionId: number, type, data, messageId?: number) {
        if(!(connectionId === 1)) {//This connector only supports a single player
            throw new Error('Invalid connectionId');
        }

        let entries = null;

        if(type === "updatingGame") {
            Performance.mark("server :: updatingGame :: start toBinary");
        }
        const binaryData = toBinary(data);

        if(type === "updatingGame") {
            Performance.measure("server :: updatingGame :: toBinary", "server :: updatingGame :: start toBinary");

            entries = Performance.getEntries().reduce((output, {name, duration}) => {
                if(!output[name]) {
                    output[name] = [];
                }

                output[name].push(duration);

                return output;
            }, {});
        }

        const dataToSend = {type, data: binaryData, messageId, performance: undefined};

        if(type === "updatingGame") {
            dataToSend.performance = entries;
        }

        binaryData instanceof ArrayBuffer ? 
            global.postMessage(dataToSend, [binaryData])
            :
            global.postMessage(dataToSend);
    }

    //Recieving messages
    onmessage = async <T extends ServerMessageTypes>({data: {type, data, clientId, messageId}}: {data: {type: T, data: ServerMessageHandlers[T]['data'], clientId: number, messageId: number}}) => {
        const result = await this.server.onMessage(type, data, clientId);

        this.sendMessageToClient(1, 'reply', result, messageId);
    }
}

const enc = new TextEncoder();

function toBinary(data) {
    if(data && data !== true && data !== false && !(data instanceof ArrayBuffer)) {
        const encData = enc.encode(JSON.stringify(data));

        return encData.buffer;
    }

    return data;
}