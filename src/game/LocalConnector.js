import Server from 'game/server/Server';


export default class LocalConnector {
  server = null;
  client = null;

  constructor() {
    this.server = new Server(this);
  }

  //client comms methods
  setClient(client) {
    this.client = client;
  }

  sendMessageToServer(messageType, data) {
    const response = this.server.onMessage(messageType, data, 1);
    
    return response ? response.then(clone) : undefined;
  }


  //Server comms methods
  broadcastToClients(messageType, data) {
    //c/onsole.log('[LC] broadcastToClients: ', messageType, data);

    return this.client.onMessageFromServer(messageType, clone(data));
  }

  sendMessageToClient(connectionId, messageType, data) {
    if(!connectionId === 1) {
      throw new Error('Invalid connectionId');
    }

    //c/onsole.log('[LC] sendMessageToClient: ', messageType, data);

    return this.client.onMessageFromServer(messageType, clone(data));

  }
}

function clone(data) {
  switch(typeof(data)) {
    case 'object':
      if(data === null) {
        return null;
      } else if(data instanceof Array) {
        const clonedArr = new Array(data.length);

        for(let i = 0, l = data.length; i < l; ++i) {
          clonedArr[i] = clone(data[i]);
        }

        return clonedArr;
      }

      const clonedObj = {};

      for(let i = 0, keys = Object.keys(data), l = keys.length; i < l; ++i) {
        let key = keys[i];

        clonedObj[key] = clone(data[key]);
      }

      return clonedObj
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
      return data;
    case 'function':
    case 'symbol':
      throw new Error('Cannot clone, unsupported variable type');
  }
}
