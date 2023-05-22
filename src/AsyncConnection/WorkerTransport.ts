//TODO how to handle transferable types?

import { ErrorObject } from "serialize-error";
import { AsyncConnectionStatus, AsyncTransport, Methods, PromiseResponse } from "./types";

type Message = {
    type: 'init' | 'call' | 'return' | 'error';
    payload: any;
    methodName?: string;
    id?: number
};



export default class WorkerTransport<LocalMethods extends Methods, RemoteMethods extends Methods> implements AsyncTransport<LocalMethods, RemoteMethods> {
    readonly worker: Worker;
    readonly onConnected: Promise<void>;
    readonly onInited: Promise<(keyof RemoteMethods)[]>;

    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: <T extends keyof LocalMethods>(methodName: T, payload: Parameters<LocalMethods[T]>, messageId: number) => void;
    onReturn?: <T extends keyof RemoteMethods>(methodName: T, payload: ReturnType<RemoteMethods[T]>, messageId: number) => void;

    _inited?: PromiseResponse<(keyof RemoteMethods)[]>
    

    constructor(worker:Worker) {//inside a worker, this is 'globalThis'
        this.worker = worker;

        worker.addEventListener('message', this.onmessage);

        this.onConnected = Promise.resolve();//workers are always connected

        this.onInited = new Promise<(keyof RemoteMethods)[]>((resolve, reject) => {
            this._inited = {resolve, reject};
        });
    }
    

    onmessage = ({data: {type, methodName, payload, id}}: MessageEvent<Message>) => {
        switch(type) {
            case 'init':
                this._inited?.resolve(payload)
                this._inited = undefined;
                return
            case 'call':
                return this.onCall?.(methodName, payload, id);
            case 'return':
                return this.onReturn?.(methodName, payload, id);
            case 'error':
                if(this._inited) {//if not yet inited, reject the inited promise
                    this._inited.reject(payload);
                    return;
                }

                return this.onRemoteError?.(payload, id);
        }
    }

    sendInitMessage(payload: (keyof LocalMethods)[]): void {
        this.worker.postMessage({
            type: 'init',
            payload
        });
    }

    sendErrorMessage(payload: ErrorObject, messageId: number): void {
        this.worker.postMessage({
            type: 'error',
            payload,
            id: messageId
        })
    }
    sendCallMessage<T extends keyof RemoteMethods>(methodName: T, payload: Parameters<RemoteMethods[T]>, messageId: number): void {
        this.worker.postMessage({
            type: 'call',
            methodName,
            payload,
            id: messageId
        })
    }
    sendReturnMessage<T extends keyof LocalMethods>(methodName: T, payload: ReturnType<LocalMethods[T]>, messageId: number): void {
        this.worker.postMessage({
            type: 'return',
            methodName,
            payload,
            id: messageId
        });
    }

    getConnectionStatus(): AsyncConnectionStatus {
        return 'connected';//Workers are always connected
    }
}
