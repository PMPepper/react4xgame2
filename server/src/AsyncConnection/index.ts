//TODO Put this into it's own package
//TODO implement different transport layers, including: worker (done), postMessage, WebSockets, WebRTC
//TODO 'close' option?

import {serializeError, deserializeError} from 'serialize-error';
import { AsyncTransport, Methods } from './types';

//Types
interface ReplyHandler {
    reject: (reason: any) => void;
    resolve: (result: any) => void
}

type AnyFunc = (...any) => any;
type Promised<T extends AnyFunc> = (...params: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

type PromisedObj<T extends Methods> = {
    [K in keyof T]: Promised<T[K]>
}


//TODO do I need to reject isInitialised promises if transport/initilisation fails?
//TODO just better error handling in general I guess? OR manage that at the transport level?
export default async function AsyncConnection<
    RemoteMethods extends Methods, 
    LocalMethods extends Methods | undefined = undefined, 
>(
    transport: AsyncTransport<LocalMethods, RemoteMethods>,
    localMethods?: LocalMethods
): Promise<Readonly<PromisedObj<RemoteMethods>>> {
    let inited = false;

    //used to generate IDs - id's need only be unique per side - so the same Id can be used for 
    //different calls by each end of the connection
    let idCount = 0;

    //Set of the method names we are exposing to the other end of the connection to call
    const localMethodNames = new Set<keyof LocalMethods>(Object.keys(localMethods || {}).filter((name) => localMethods[name] instanceof Function))
    
    //the methods the other end of the connection expose for us - we get this from the initialisation message
    const remoteMethodNames = new Set<keyof RemoteMethods>();

    //Link message IDs to promise resolve/reject handlers
    const replyHandlers: Record<number, ReplyHandler> = {};

    //an array of promise resolve functions to execute once initilisation has heppened
    const onInitedHandlers: (() => void)[] = [];

    //Internal helper methods
    async function makeRemoteCall<T extends keyof RemoteMethods>(methodName: T, payload: Parameters<RemoteMethods[T]>) {
        const id = getNextId();

        return new Promise((resolve, reject) => {
            replyHandlers[id] = {resolve, reject};

            transport.sendCallMessage(methodName, payload, id);
        });
    }

    function returnError(error: Error, id: number): void {
        const payload = serializeError(error);

        transport.sendErrorMessage(payload, id);
    }

    function getNextId(): number {
        return ++idCount;
    }

    function isRemoteMethod(name: any): name is (keyof LocalMethods) {
        if(!inited) {
            throw new Error('[AsyncConnection] isRemoteMethod cannot be called before connection has been initialised');
        }

        return remoteMethodNames.has(name as any);
    }

    //will return true OR a promise that will resolve with true once initialisation is complete
    async function isInitialised(): Promise<true> {
        return inited 
            ? true 
            : new Promise((resolve) => {
                //If not yet initialised, we add the resolve callback to the onInitedHandlers array
                //to be called once initialisation has occurred
                onInitedHandlers.push(resolve as any);
            })
    }

    ///////////////
    // Transport //
    ///////////////

    //set event handlers
    
    transport.onInit = (remoteMethodNamesArray) => {
        //Copy method names array into set
        remoteMethodNamesArray.forEach((methodName) => remoteMethodNames.add(methodName));

        //We are now initialised, so record that and...
        inited = true;

        //...process any calls awaiting initing...
        onInitedHandlers.forEach((resolve) => resolve());

        //.. then clear the list
        onInitedHandlers.length = 0;
    };

    transport.onRemoteError = (errorPayload, id) => {
        if (replyHandlers[id]) {
            //If the original 'error' object was not in fact an Error, the lib turns it into a 'NonError' object, with the
            //original value stored as JSON
            const deserialized = deserializeError(errorPayload);
            //...so, if required we restore the original value here
            replyHandlers[id].reject(
                deserialized.name === 'NonError'
                    ? JSON.parse(deserialized.message)
                    : deserialized,
            );

            //reply has been handled, so delete handler
            delete replyHandlers[id];
        } else {
            throw new Error('[AsyncConnection] Unknown return id: ' + id);
        }
    };

    transport.onCall = async <T extends keyof LocalMethods>(methodName: T, payload, id) => {
        if(!localMethodNames.has(methodName)) {
            throw new Error('[AsyncConnection] Unknown method: ' + methodName.toString());
        }

        let result: ReturnType<LocalMethods[T]> | undefined = undefined;

        try {
            //Attempt to call the local method with the supplied arguments

            //console.log('[AsyncConnection] call: ', methodName, payload, result, id);
            result = await localMethods[methodName](...payload);
        } catch (e) {
            return returnError(e, id);
        }

        transport.sendReturnMessage(methodName, result, id)
    };

    transport.onReturn = (methodName, payload, id) => {
        if(replyHandlers[id]) {
            replyHandlers[id].resolve(payload);
            delete replyHandlers[id];
        } else {
            throw new Error('[AsyncConnection] Unknown return id: ' + id);
        }
    };

    //wait until transport is connected
    await transport.onConnected();

    //Send initialise method
    transport.sendInitMessage(Array.from(localMethodNames))

    //Wait until initialised (we have recieved the initilise message from the other end of the connection)
    await isInitialised();


    //////////////////////
    // Return the proxy //
    //////////////////////

    return new Proxy<any>({}, {
        get(oTarget, sKey) {
            //Not sure why I need this (what is trying to access 'then')?
            if(sKey === 'then' && !isRemoteMethod(sKey)) {return undefined}

            return (...args) =>
                new Promise(async (resolve, reject) => {
                    if(isRemoteMethod(sKey)) {
                        try {
                            resolve(await makeRemoteCall(sKey, args as Parameters<RemoteMethods[typeof sKey]>));
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject('[AsyncConnection] Method does not exist');
                    }
                });
        },
        set: function () {
            return false;
        },
        deleteProperty: function () {
            return false;
        },
        ownKeys: function (oTarget) {
            return inited ? Object.keys(oTarget) : null;
        },
        has: function (oTarget, sKey) {
            return inited ? isRemoteMethod(sKey) : false;
        },
        defineProperty: function () {
            return false;
        },
        getOwnPropertyDescriptor: function () {
            throw new Error('[AsyncConnection] Method not implemented');
        },
    });
}
