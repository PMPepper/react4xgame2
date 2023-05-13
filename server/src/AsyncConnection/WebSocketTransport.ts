import { ErrorObject } from "serialize-error";
import DeferredPromiseSet from "./DeferredPromiseSet";
import { JSONCodec } from "./JSONCodec";
import { AsyncConnectionStatus, AsyncTransport, Codec, Methods } from "./types";

type Message = {
    type: 'init' | 'call' | 'return' | 'error';
    payload: any;
    methodName?: any;//should be string, but TS weirdness
    id?: number
};

const defaultCodec = new JSONCodec();

function log(...message: any) {
    console.log('[WebSocketTransport] ', ...message)
}

export default class WebSocketTransport<
    LocalMethods extends Methods, 
    RemoteMethods extends Methods
> implements AsyncTransport<LocalMethods, RemoteMethods> {
    readonly socket: WebSocket;
    readonly codec: Codec<Message, string>;

    readonly onOpenDeferredPromises?: DeferredPromiseSet<void>;

    onInit?: (remoteMethodNames: (keyof RemoteMethods)[]) => void;
    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: <T extends keyof LocalMethods>(methodName: T, payload: Parameters<LocalMethods[T]>, messageId: number) => void;
    onReturn?: <T extends keyof RemoteMethods>(methodName: T, payload: ReturnType<RemoteMethods[T]>, messageId: number) => void;

    constructor(socket: WebSocket, codec: Codec<any, string> = defaultCodec) {
        this.socket = socket;
        this.codec = codec;

        const connectionStatus = this.getConnectionStatus()

        if(['error', 'closed'].includes(connectionStatus)) {
            throw new Error('[WebSocketTransport] WebSocket is closed or closing. Please supply an open or opening websocket.')
        }

        socket.addEventListener('message', this.onmessage);

        if(connectionStatus === 'connecting') {
            log('socket is connecting')
            this.onOpenDeferredPromises = new DeferredPromiseSet<void>();

            socket.addEventListener('open', this.onSocketOpen)
        }

        socket.addEventListener('close', this.onSocketClose);
        socket.addEventListener('error', this.onSocketError);
    }

    onmessage = async ({data}: MessageEvent<string>) => {
        const {type, methodName, payload, id} = await this.codec.decode(data);

        log('onmessage: ', type, methodName, payload, id)
        switch(type) {
            case 'init':
                return this.onInit?.(payload);
            case 'call':
                return this.onCall?.(methodName, payload, id);
            case 'return':
                return this.onReturn?.(methodName, payload, id);
            case 'error':
                return this.onRemoteError?.(payload, id);
        }
    }

    onSocketOpen = () => {
        log('socket open')
        this.socket.removeEventListener('open', this.onSocketOpen);

        this.onOpenDeferredPromises?.resolve();
    }

    onSocketClose = () => {
        log('socket closed')
        //TODO What should I do here?
    }

    onSocketError = (error) => {
        log('socket error')
        log(error);
        //TODO What should I do here?
    }

    async sendMessage(message: Message): Promise<void> {
        log('sendMessage: ', message)
        this.socket.send(await this.codec.encode(message));
    }

    async sendInitMessage(payload: (keyof LocalMethods)[]): Promise<void> {
        this.sendMessage({
            type: 'init',
            payload
        });
    }

    async sendErrorMessage(payload: ErrorObject, messageId: number): Promise<void> {
        this.sendMessage({
            type: 'error',
            payload,
            id: messageId
        })
    }

    async sendCallMessage<T extends keyof RemoteMethods>(methodName: T, payload: Parameters<RemoteMethods[T]>, messageId: number): Promise<void> {
        this.sendMessage({
            type: 'call',
            methodName,
            payload,
            id: messageId
        })
    }

    async sendReturnMessage<T extends keyof LocalMethods>(methodName: T, payload: ReturnType<LocalMethods[T]>, messageId: number): Promise<void> {
        this.sendMessage({
            type: 'return',
            methodName,
            payload,
            id: messageId
        });
    }

    onConnected(): Promise<void> {
        switch(this.getConnectionStatus()) {
            case 'connected':
                return Promise.resolve();
            case 'error':
                throw new Error('[WebSocketTransport] WebSocket is in an error state. It will not open.');
            case 'closed':
                throw new Error('[WebSocketTransport] WebSocket is closed or closing.');
        }

        //If you get here, websocket is connecting
        return this.onOpenDeferredPromises.get();
    }

    getConnectionStatus(): AsyncConnectionStatus {
        switch(this.socket.readyState) {
            case 0://CONNECTING
                return 'connecting';
            case 1://OPEN
                return 'connected';
            case 2://CLOSING
            case 3://CLOSED
                return 'closed';
        }

        //Should never get here
        return 'error';
    }
}
