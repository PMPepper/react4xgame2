//TODO better use of promises
//TODO worker transferable support
//TODO make this the main method of AsyncConnection

import {serializeError, deserializeError} from 'serialize-error';
import { AnyFunc, AsyncTransport, Methods, PromiseResponse } from "./types";


type Promised<T extends AnyFunc> = (...params: Parameters<T>) => Promise<Awaited<ReturnType<T>>>

type AllPromised<T extends {}> = {
    [K in keyof T]: T[K] extends AnyFunc ? Promised<T[K]> : never;
}



export type AsyncConnectionType<RemoteMethods extends Methods> = {
    call: AllPromised<Readonly<RemoteMethods>>;
    isReady: Promise<void>;
}


//The class
export default class AsyncConnection<RemoteMethods extends Methods, LocalMethods extends Methods | undefined = undefined> implements AsyncConnectionType<RemoteMethods> {
    call: AllPromised<Readonly<RemoteMethods>>;
    isReady: Promise<void>;

    //Internal
    inited: boolean = false;
    idCount: number = 0;
    transport: AsyncTransport<RemoteMethods>;

    //the methods the other end of the connection expose for us - we get this from the initialisation message
    remoteMethodNames: Set<keyof RemoteMethods>;

    //Link message IDs to promise resolve/reject handlers
    replyHandlers: Record<number, PromiseResponse<any>>;
    

    constructor(transport: AsyncTransport<RemoteMethods>, localMethods?: LocalMethods) {
        this.transport = transport;
        this.remoteMethodNames = new Set<keyof RemoteMethods>();
        this.replyHandlers = {};

        const self = this;

        this.call = new Proxy<any>({}, {
            get(oTarget, sKey) {
                //Not sure why I need this (what is trying to access 'then')?
                //Maybe something to do with how 'async/await' is implemented?
                //if(sKey === 'then' && !isRemoteMethod(sKey)) {return undefined}
    
                return (...args) =>
                    new Promise(async (resolve, reject) => {
                        await self.isReady;

                        if(self.isRemoteMethod(sKey)) {
                            try {
                                resolve(await self.makeRemoteCall(sKey, args as Parameters<RemoteMethods[typeof sKey]>));
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
                return self.inited ? Object.keys(oTarget) : [];
            },
            has: function (oTarget, sKey) {
                return self.inited ? self.isRemoteMethod(sKey) : false;
            },
            defineProperty: function () {
                return false;
            },
            getOwnPropertyDescriptor: function () {
                throw new Error('[AsyncConnection] Method not implemented');
            },
        }) as AllPromised<Readonly<RemoteMethods>>

        this.init(localMethods);
    }

    async init(localMethods?: LocalMethods) {

        const {transport, remoteMethodNames, replyHandlers} = this;

        //used to generate IDs - id's need only be unique per side - so the same Id can be used for 
        //different calls by each end of the connection
        
        //Set of the method names we are exposing to the other end of the connection to call
        const allLocalMethodNames = Object.keys(localMethods || {}) as unknown as (keyof LocalMethods)[];
        const localMethodNames = new Set<keyof LocalMethods>(allLocalMethodNames.filter((name) => localMethods[name] instanceof Function))
    
        function returnError(error: Error, id: number): void {
            const payload = serializeError(error);
    
            transport.sendErrorMessage(payload, id);
        }
    
        ///////////////
        // Transport //
        ///////////////

        //set event handlers
        this.isReady = new Promise<void>(async (resolve, reject) => {
            const remoteMethodNamesArray = await transport.onInited;

            //Copy method names array into set
            remoteMethodNamesArray.forEach((methodName) => remoteMethodNames.add(methodName));

            //We are now initialised, so record that and...
            this.inited = true;

            //resolve!
            resolve();
        })

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

        transport.onCall = async (methodName: string, payload: any, id: number) => {
            if(!localMethodNames.has(methodName)) {
                throw new Error('[AsyncConnection] Unknown method: ' + methodName.toString());
            }

            let result: any = undefined;

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
        try {
            //wait until transport is connected
            await transport.onConnected;
        }

        catch(e) {
            console.log('Transport connection failed: ', e);

            //TODO handle error

            return;
        }
        

        //Send initialise method
        transport.sendInitMessage(Array.from(localMethodNames as Set<string>))

        try {
            await this.isReady;
        }
        
        catch(e) {
            console.log('Transport initialisation failed: ', e);
        }
        //Wait until initialised (we have recieved the initilise message from the other end of the connection)
        

    }

    //Internal methods
    isRemoteMethod(name: any): name is (keyof LocalMethods) {
        if(!this.inited) {
            throw new Error('[AsyncConnection] isRemoteMethod cannot be called before connection has been initialised');
        }

        return this.remoteMethodNames.has(name as any);
    }

    async makeRemoteCall<T extends keyof RemoteMethods>(methodName: T, payload: Parameters<RemoteMethods[T]>) {
        const id = this.getNextId();

        return new Promise((resolve, reject) => {
            this.replyHandlers[id] = {resolve, reject};

            this.transport.sendCallMessage(methodName, payload, id);
        });
    }

    getNextId(): number {
        return ++this.idCount;
    }

}



// export default function getConnection<RemoteMethods extends {}, LocalMethods extends {} | undefined = undefined>(transport: AsyncTransport<LocalMethods, RemoteMethods>, localMethods?: LocalMethods): AsyncConnectionType<RemoteMethods> {
//     return new AsyncConnection<RemoteMethods, LocalMethods>(transport, localMethods);
// }



// type Ex1 = {world: (x: number) => number, fish: (str: string) => Promise<string>};

// type X = AllPromised<Ex1>
// const x: X = null as any;
// console.log(x.fish(''), x.world(4));

// const y: AsyncConnectionType<Ex1> = null as any;

// console.log(y.call.fish(''), y.call.world(5));