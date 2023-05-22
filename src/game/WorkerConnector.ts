//The client side part of the WorkerConnector

import Performance from "classes/Performance";
import { ClientToServerConnector, ServerToClientsConnector } from "types/game/shared/game";
import { ServerMessageHandlers, ServerMessageTypes } from "./server/ServerComms";
//import AsyncConnection from "AsyncConnection";
import AsyncConnection, {AsyncConnectionType} from "AsyncConnection"
import WorkerTransport from "AsyncConnection/WorkerTransport";
import Client from "./Client";

type WorkerServerRemoteMethods = {
    //TODO generic types here?
    send: <T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data']) => ServerMessageHandlers[T]['returns'];
}

type LocalMethods = {
    send: WorkerConnector['onmessage']
};

export default class WorkerConnector implements ClientToServerConnector {
    client: Client | undefined;
    asyncConnection: AsyncConnectionType<WorkerServerRemoteMethods>//Awaited<ReturnType<typeof AsyncConnection<WorkerServer, {send: WorkerConnector['onmessage']}>>> | undefined;

    constructor() {
        const transport = new WorkerTransport<WorkerServerRemoteMethods>(new Worker(new URL('./server/worker.ts', import.meta.url)));

        this.asyncConnection = new AsyncConnection<WorkerServerRemoteMethods, LocalMethods>(transport, {send: this.onmessage});
    }

    onmessage = (type, data) => {
        this.client?.onMessageFromServer(type, data);
    }

    //client comms methods
    setClient(client: Client) {
        this.client = client;
    }

    //TODO I think I need to make this always return a promise, right? even if the actual return type is void
    async sendMessageToServer<T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data']): Promise<ServerMessageHandlers[T]['returns']> {
        return this.asyncConnection?.call.send(type, data) as Promise<ServerMessageHandlers[T]['returns']>;
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