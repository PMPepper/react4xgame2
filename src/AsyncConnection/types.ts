import { ErrorObject } from "serialize-error";

export type AsyncConnectionStatus = 'connecting' | 'connected' | 'closed' | 'error';
export type AnyFunc = (...any) => any
export type Methods = Record<string, AnyFunc>;

export type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;

export interface PromiseResponse<T> {
    reject: (reason?: any) => void;
    resolve: PromiseResolve<T>;
}

export interface AsyncTransport {
    getConnectionStatus(): AsyncConnectionStatus;
    readonly onConnected: Promise<void>;
    readonly onInited: Promise<string[]>;

    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: (methodName: string, payload: any, messageId: number) => void;
    onReturn?: (methodName: string, payload: any, messageId: number) => void;

    //init has no methodName or id, all others do
    sendInitMessage(payload: string[]): void;

    sendErrorMessage(payload: ErrorObject, messageId: number): void;

    sendCallMessage(
        methodName: string, 
        payload: any, 
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