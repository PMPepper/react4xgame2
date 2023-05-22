import { ErrorObject } from "serialize-error";

export type AsyncConnectionStatus = 'connecting' | 'connected' | 'closed' | 'error';
export type AnyFunc = (...any) => any
export type Methods = Record<string, AnyFunc>;

export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;

export interface PromiseResponse<T> {
    reject: (reason?: any) => void;
    resolve: PromiseResolve<T>;
}

//Is there any real point in AsyncTransport having the RemoteMethods generic parameter?
export interface AsyncTransport<RemoteMethods extends Methods> {
    getConnectionStatus(): AsyncConnectionStatus;
    readonly onConnected: Promise<void>;
    readonly onInited: Promise<(keyof RemoteMethods)[]>;

    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: (methodName: string, payload: any, messageId: number) => void;
    onReturn?: <T extends keyof RemoteMethods>(methodName: T, payload: ReturnType<RemoteMethods[T]>, messageId: number) => void;

    //init has no methodName or id, all others do
    sendInitMessage(payload: string[]): void;

    sendErrorMessage(payload: ErrorObject, messageId: number): void;

    sendCallMessage<T extends keyof RemoteMethods>(
        methodName: T, 
        payload: Parameters<RemoteMethods[T]>, 
        messageId: number
    ): void;

    sendReturnMessage(
        methodName: string, 
        payload: any, 
        messageId: number
    ): void
}


export interface Codec<InputType, OutputType> {
    encode(data: InputType): Promise<OutputType>;
    decode(data: OutputType): Promise<InputType>;
}