import Server from 'game/server/Server';

import clone from 'helpers/app/fastSimpleClone';
import { Connector } from 'types/game/shared/game';
import Client from './Client';
import { ServerMessageHandlers, ServerMessageTypes } from './server/ServerComms';


export default class LocalConnector implements Connector {
  server: Server;
  client: Client;

  constructor() {
    this.server = new Server(this);
  }

  //client comms methods
  setClient(client: Client) {
    this.client = client;
  }

  async sendMessageToServer<T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data']): Promise<ServerMessageHandlers[T]['returns']> {
    const response = await this.server.onMessage(type, data, 1);
    
    return Promise.resolve(response ? clone(response) : undefined);
  }


  //Server comms methods
  broadcastToClients(messageType, data) {
    //c/onsole.log('[LC] broadcastToClients: ', messageType, data);

    return this.client.onMessageFromServer(messageType, clone(data));
  }

  sendMessageToClient(connectionId, messageType, data) {
    if(!(connectionId === 1)) {//This connector only supports a single player
      throw new Error('Invalid connectionId');
    }

    //c/onsole.log('[LC] sendMessageToClient: ', messageType, data);

    return this.client.onMessageFromServer(messageType, clone(data));

  }
}

