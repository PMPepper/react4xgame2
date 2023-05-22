//Change onInit() to onInited promise, and 

import { ErrorObject } from "serialize-error";
import { JSONCodec } from "./JSONCodec";
import { AsyncConnectionStatus, AsyncTransport, Codec, Methods, PromiseResponse } from "./types";

type Message = {
    type: 'init' | 'call' | 'return' | 'error';
    payload: any;
    methodName?: string;
    id?: number
};

const defaultCodec = new JSONCodec();

function log(...message: any) {
    console.log('[WebSocketTransport] ', ...message)
}

export default class WebSocketTransport<
    RemoteMethods extends Methods
> implements AsyncTransport<RemoteMethods> {
    readonly socket: WebSocket;
    readonly codec: Codec<Message, string>;
    _inited: PromiseResponse<(keyof RemoteMethods)[]>;
    _socketOpen: PromiseResponse<void>;

    readonly onConnected: Promise<void>;
    readonly onInited: Promise<(keyof RemoteMethods)[]>;

    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: (methodName: string, payload: any, messageId: number) => void;
    onReturn?: <T extends keyof RemoteMethods>(methodName: T, payload: ReturnType<RemoteMethods[T]>, messageId: number) => void;

    constructor(socket: WebSocket, codec: Codec<any, string> = defaultCodec) {
        this.socket = socket;
        this.codec = codec;

        this.onInited = new Promise<(keyof RemoteMethods)[]>((resolve, reject) => {
            this._inited = {resolve, reject};
        });

        this.onConnected = new Promise<void>((resolve, reject) => {
            this._socketOpen = {resolve, reject};
        });

        const connectionStatus = this.getConnectionStatus()

        if(connectionStatus === 'error' || connectionStatus === 'closed') {
            throw new Error('[WebSocketTransport] WebSocket is closed or closing. Please supply an open or opening websocket.')
        }

        socket.addEventListener('message', this.onmessage);
        socket.addEventListener('close', this.onSocketClose);
        socket.addEventListener('error', this.onSocketError);

        //Once socket is open, onConnected will be resolved
        if(connectionStatus === 'connecting') {
            log('socket is connecting')
            socket.addEventListener('open', () => this._socketOpen.resolve.call(this))
        } else {
            this._socketOpen.resolve();
        }
    }

    onmessage = async ({data}: MessageEvent<string>) => {
        const {type, methodName, payload, id} = await this.codec.decode(data);

        log('onmessage: ', type, methodName, payload, id)
        switch(type) {
            case 'init':
                if(!this._inited) {
                    throw new Error('Duplicate init call is not allowed');
                }

                this._inited.resolve(payload)
                this._inited = undefined;
                return;
            case 'call':
                return this.onCall?.(methodName, payload, id);
            case 'return':
                return this.onReturn?.(methodName, payload, id);
            case 'error':
                if(!this.onInitFailed(payload)) {//if not yet inited, reject the inited promise
                    return this.onRemoteError?.(payload, id);
                }

                return;
        }
    }

    onInitFailed(reason: any): boolean {
        if(this._inited) {//if not yet inited, reject the inited promise
            
            log('Rejecting onInited: ', reason)
            this._socketOpen.reject(reason);//TODO reject on connected?
            this._inited.reject(reason);
            return true;
        }

        return false
    }

    onSocketClose = () => {
        log('socket closed')
        //TODO What should I do here?
    }

    onSocketError = (error) => {
        log('socket error')
        log(error);

        this.onInitFailed(error)
        //TODO What should I do here?
    }

    async sendMessage(message: Message): Promise<void> {
        log('sendMessage: ', message)

        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        await message.type === 'init' ? this.onConnected : this.onInited;

        this.socket.send(await this.codec.encode(message));
    }

    async sendInitMessage(payload: string[]): Promise<void> {
        return this.sendMessage({
            type: 'init',
            payload
        });
    }

    async sendErrorMessage(payload: ErrorObject, messageId: number): Promise<void> {
        return this.sendMessage({
            type: 'error',
            payload,
            id: messageId
        })
    }

    async sendCallMessage<T extends keyof RemoteMethods>(methodName: T, payload: Parameters<RemoteMethods[T]>, messageId: number): Promise<void> {
       return  this.sendMessage({
            type: 'call',
            methodName: methodName as string,
            payload,
            id: messageId
        })
    }

    async sendReturnMessage(methodName: string, payload: any, messageId: number): Promise<void> {
        return this.sendMessage({
            type: 'return',
            methodName: methodName as string,
            payload,
            id: messageId
        });
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
