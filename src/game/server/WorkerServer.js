//This is the worker-side part of the worker
import Performance from 'classes/Performance';
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

        const dataToSend = {type, data: binaryData, messageId};

        if(type === "updatingGame") {
            dataToSend.performance = entries;
        }

        binaryData instanceof ArrayBuffer ? 
            global.postMessage(dataToSend, [binaryData])
            :
            global.postMessage(dataToSend);
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