import { ErrorObject } from "serialize-error";

export type AsyncConnectionStatus = 'connecting' | 'connected' | 'closed' | 'error';
export type Methods = Record<string, (...any) => any>;

export interface AsyncTransport<LocalMethods extends Methods, RemoteMethods extends Methods> {
    getConnectionStatus(): AsyncConnectionStatus;
    onConnected(): Promise<void>;

    onInit?: (remoteMethodNames: (keyof RemoteMethods)[]) => void;
    onRemoteError?: (payload: ErrorObject, messageId: number) => void;
    onCall?: <T extends keyof LocalMethods>(methodName: T, payload: Parameters<LocalMethods[T]>, messageId: number) => void;
    onReturn?: <T extends keyof RemoteMethods>(methodName: T, payload: ReturnType<RemoteMethods[T]>, messageId: number) => void;

    //init has no methodName or id, all others do
    sendInitMessage(payload: (keyof LocalMethods)[]): void;

    sendErrorMessage(payload: ErrorObject, messageId: number): void;

    sendCallMessage<T extends keyof RemoteMethods>(
        methodName: T, 
        payload: Parameters<RemoteMethods[T]>, 
        messageId: number
    ): void;

    sendReturnMessage<T extends keyof LocalMethods>(
        methodName: T, 
        payload: ReturnType<LocalMethods[T]>, 
        messageId: number
    ): void
}


export interface Codec<InputType, OutputType> {
    encode(data: InputType): Promise<OutputType>;
    decode(data: OutputType): Promise<InputType>;
}