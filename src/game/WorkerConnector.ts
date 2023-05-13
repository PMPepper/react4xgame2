//The client side part of the WorkerConnector

import Performance from "classes/Performance";
import { Connector } from "types/game";


export default class WorkerConnector implements Connector {
    worker = null;
    client = null;

    _messageId = 0;
  
    constructor() {
      this.worker = new Worker(new URL('./server/worker.js', import.meta.url));

      this.worker.addEventListener('message', this.onmessage)
    }

    onmessage = ({data: {type, data, clientId, messageId, performance}}) => {
        if(type === 'reply') {
            return;//ignore replies
        }
        if(type === 'updatingGame') {
            Performance.mark('updatingGame :: start decoding')
        }

        const decodedData = fromBinary(data);

        if(type === 'updatingGame') {
            Performance.measure('updatingGame :: decode data', 'updatingGame :: start decoding')

            Object.entries(performance).forEach(([name, durations]) => Performance.onData(name, durations));
        }

        this.client.onMessageFromServer(type, decodedData);
    }

    //client comms methods
    setClient(client) {
        this.client = client;
    }

    sendMessageToServer(type, data) {
        const messageId = this.getNextMessageId();

        //Set up the response handler
        const promise = new Promise((resolve, reject) => {
            const handler = ({data: {type, data, clientId, messageId: replyMessageId}}) => {
                if(type === 'reply' && messageId === replyMessageId) {
                    this.worker.removeEventListener('message', handler)
                    resolve(fromBinary(data));
                }
            };

            this.worker.addEventListener('message', handler)
        });

        //actually send the message
        this.worker.postMessage({type, data, clientId: 1, messageId});

        //Return the promise
        return promise;
    }

    getNextMessageId() {
        return `client-${this._messageId++}`;
    }
}



const dec = new TextDecoder();

function fromBinary(data) {
    if(data instanceof ArrayBuffer) {
        const decoded = JSON.parse(dec.decode(new Uint8Array(data)));
        return decoded;
    }

    return data;
}