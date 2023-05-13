import Client from "game/Client";

type MessageType = string;//TODO list valid values

export interface Connector {
    setClient: (client: Client) => void;
    sendMessageToServer: (messageType: MessageType, data: any) => any;//TODO better typing here
    // broadcastToClients: (messageType: MessageType, data: any) => any;//TODO better typing here
    // sendMessageToClient: (connectionId: number, messageType: MessageType, data: any) => any;//TODO better typing here
}

export type GameState = {
    factions: any;
    entities: any;
    gameTime: number;
};