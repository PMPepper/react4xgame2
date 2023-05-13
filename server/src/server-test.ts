
import { WebSocketServer, WebSocket } from 'ws';
import AsyncConnection from './AsyncConnection';
import WebSocketTransport from './AsyncConnection/WebSocketTransport';

export default async function serverTest() {
    console.log('Server starting')
    const wss = new WebSocketServer({port: 8081});

    wss.on('connection', async (ws: WebSocket) => {
        console.log('Socket connected');

        const exposeMethods = {
            hello: async (name: string) => {
        
                (await connector).shout('yo')
                //await sleep(2000);
        
                return `Well howdy there ${name}`
            }
        }

        const transport = new WebSocketTransport(ws as any);//WS websockets are slightly different to 'real' websockets in their type definitions, just enough to upset TS
        const connector = await AsyncConnection<{shout: (string) => string}, typeof exposeMethods>(transport, exposeMethods);

        console.log('Connector ready');
    });
}