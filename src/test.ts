import WebSocketTransport from "AsyncConnection/WebSocketTransport";
import AsyncConnection from "./AsyncConnection";
import WorkerTransport from "./AsyncConnection/WorkerTransport";


export default async function doTest() {
    //Worker test/example
    // const testWorker = new Worker(new URL('./test-worker.ts', import.meta.url));
    // const transport = new WorkerTransport(testWorker);

    //WebSocket test/example
    const socket = new WebSocket('ws://localhost:8081');
    const transport = new WebSocketTransport(socket);
console.log(socket);
console.log(transport.getConnectionStatus());
    const exposeMethods = {
        shout: (message: string) => console.log(message.toUpperCase()+'!')
    }

    const connector = await AsyncConnection<{hello: (name: string) => string}, typeof exposeMethods>(transport, exposeMethods);

    console.log('Connector ready!?');
    console.log(transport.getConnectionStatus());

    console.log(await connector.hello('Paul'));
    

}