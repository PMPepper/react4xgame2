import WebSocketTransport from "AsyncConnection/WebSocketTransport";
import AsyncConnection from "./AsyncConnection";
import WorkerTransport from "./AsyncConnection/WorkerTransport";


export default async function doTest() {
    //Worker test/example
    // const testWorker = new Worker(new URL('./test-worker.ts', import.meta.url));
    // const transport = new WorkerTransport(testWorker);

    //WebSocket test/example
    const socket = new WebSocket('ws://localhost:8081');
    const transport = new WebSocketTransport<typeof exposeMethods, {hello: (name: string) => string}>(socket);

    const exposeMethods = {
        shout: (message: string) => console.log(message.toUpperCase()+'!')
    }

    
    try {
        const connector = new AsyncConnection<{hello: (name: string) => string}, typeof exposeMethods>(transport, exposeMethods);
        console.log('awaiting connection...');
        await connector.isReady
        console.log('...connection established');

        console.log(await connector.call.hello('Paul'));
    }

    catch(e) {
        console.log('Failed to connect: ', e);
    }
    
    

}