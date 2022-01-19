//This is the worker-side part of the worker
import Server from './Server'


export default class WorkerServer {

    constructor() {
        this.server = new Server(this);
    }


    //Server comms methods
    broadcastToClients(type, data) {
        //c/onsole.log('[LC] broadcastToClients: ', messageType, data);
        global.postMessage({type, data});
    }

    sendMessageToClient(connectionId, type, data, messageId = null) {
        if(!connectionId === 1) {//This connector only supports a single player
            throw new Error('Invalid connectionId');
        }

        const binaryData = toBinary(data);

        binaryData instanceof ArrayBuffer ? 
            global.postMessage({type, data: binaryData, messageId}, [binaryData])
            :
            global.postMessage({type, data: binaryData, messageId});
    }

    //Recieving messages
    onmessage = ({data: {type, data, clientId, messageId}}) => {
        const response = this.server.onMessage(type, data, clientId) || Promise.resolve();

        response.then((result) => {
            this.sendMessageToClient(1, 'reply', result, messageId);
        })
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