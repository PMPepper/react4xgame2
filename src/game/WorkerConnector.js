//The client side part of the WorkerConnector


export default class WorkerConnector {
    worker = null;
    client = null;

    _messageId = 0;
  
    constructor() {
      this.worker = new Worker(new URL('./server/worker.js', import.meta.url));

      this.worker.addEventListener('message', this.onmessage)
    }

    onmessage = ({data: {type, data, clientId, messageId}}) => {
        if(type === 'reply') {
            return;//ignore replies
        }

        this.client.onMessageFromServer(type, data);
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
                    resolve(data);
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


// worker.addEventListener('message', (message) => {
//   console.log('[Worker] New Message: ', message.data)
// })

// worker.postMessage([500, 10000000])