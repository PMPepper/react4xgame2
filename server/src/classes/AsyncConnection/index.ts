import {serializeError, deserializeError} from 'serialize-error';

//TODO refactor into two parts - the generic part that handles tracking messages, etc
//and the actual 'transport' layer, which can be implemented to an interface allowing multiple
//different transport layers, including: worker, postMessage, WebSockets, WebRTC





// //TODO enable 'transferable' option - specify methods and args as third arg in initialisation?

// //The util
// export default function workerAsyncConnector(worker, myMethods = null) {
//     let inited = false;
//     let idCount = 0;
//     const remoteMethods = {};
//     const remote = worker || global;
//     const NS = 'WAC';
//     const onInitQueue = [];
//     const replyHandlers = {};

//     //Initialise by sending the init message, along with out available methods (methods the remote end can call from us)
//     postMessage('init', null, getMethodNames(myMethods));

//     //Listen to and process messages from the remote end of the connection
//     remote.addEventListener('message', ({data}) => {
//         const {ns, type, name, payload, id} = data;

//         if (!ns || ns !== NS) {
//             return;
//         }

//         switch (type) {
//             case 'init': {
//                 //copy payload into remoteMethods
//                 Object.keys(payload).forEach((key) => (remoteMethods[key] = true));

//                 //mark as inited
//                 inited = true;

//                 //process any calls awaiting initing
//                 onInitQueue.forEach(({name, resolve}) => {
//                     resolve(!!remoteMethods[name]);
//                 });

//                 //Clear queue
//                 onInitQueue.length = 0;
//                 break;
//             }
//             case 'call': {
//                 if (!myMethods[name]) {
//                     throw new Error('[WAC] Unknown method: ' + name);
//                 } else {
//                     call(name, payload, id);
//                 }
//                 break;
//             }
//             case 'return': {
//                 if (replyHandlers[id]) {
//                     replyHandlers[id].resolve(payload);
//                     delete replyHandlers[id];
//                 } else {
//                     throw new Error('[WAC] Unknown return id: ' + id);
//                 }

//                 break;
//             }
//             case 'error': {
//                 if (replyHandlers[id]) {
//                     //If the original 'error' object was not in fact an Error, the lib turns it into a 'NonError' object, with the
//                     //original value stored as JSON
//                     const deserialized = deserializeError(payload);
//                     //...so, if required we restore the original value here
//                     replyHandlers[id].reject(
//                         deserialized.name === 'NonError'
//                             ? JSON.parse(deserialized.message)
//                             : deserialized,
//                     );

//                     delete replyHandlers[id];
//                 } else {
//                     throw new Error('[WAC] Unknown return id: ' + id);
//                 }

//                 break;
//             }
//             default: {
//                 throw new Error('[WAC] Unknown message type: ' + type);
//             }
//         }
//     });

//     //Internal helper methods
//     function getNextId() {
//         return ++idCount;
//     }

//     async function checkHasMethod(name) {
//         if (!inited) {
//             // Add to onInitQueue, will be processed once inited
//             return new Promise((resolve, reject) => {
//                 onInitQueue.push({name, resolve, reject});
//             });
//         } else {
//             return !!remoteMethods[name];
//         }
//     }

//     async function postMessage(type, name, payload, id) {
//         try {
//             //console.log('[WAC] postMessage', type, name, payload, id);
//             remote.postMessage({ns: NS, type, name, payload, id});
//         } catch (e) {
//             console.log('[WAC] unable to postMessage: ', payload);
//         }
//     }

//     async function makeRemoteCall(name, args) {
//         const id = getNextId();

//         return new Promise((resolve, reject) => {
//             replyHandlers[id] = {resolve, reject};

//             postMessage('call', name, args, id);
//         });
//     }

//     function makeReturnCall(name, result, id) {
//         postMessage('return', name, result, id);
//     }

//     function returnError(name, error, id) {
//         const errorStr = serializeError(error);

//         postMessage('error', name, errorStr, id);
//     }

//     //actually execute the local method, and reply with the results
//     async function call(name, payload, id) {
//         let result = null;
//         try {
//             //console.log('[WAC] call: ', name, payload, result, id);
//             result = await myMethods[name](...payload);
//         } catch (e) {
//             return returnError(name, e, id);
//         }

//         makeReturnCall(name, result, id);
//     }

//     //Return the proxy object that will proxy all function calls to the remote end of the connection
//     return new Proxy(remoteMethods, {
//         get(oTarget, sKey) {
//             return (...args) =>
//                 new Promise(async (resolve, reject) => {
//                     const hasMethod = checkHasMethod(sKey);

//                     if (!hasMethod) {
//                         reject('Method does not exist');
//                     }

//                     try {
//                         resolve(await makeRemoteCall(sKey, args));
//                     } catch (e) {
//                         reject(e);
//                     }
//                 });
//         },
//         set: function (oTarget, sKey, vValue) {
//             return false;
//         },
//         deleteProperty: function (oTarget, sKey) {
//             return false;
//         },
//         ownKeys: function (oTarget, sKey) {
//             return inited ? oTarget.keys() : null;
//         },
//         has: function (oTarget, sKey) {
//             return inited ? oTarget[sKey] : null;
//         },
//         defineProperty: function (oTarget, sKey, oDesc) {
//             return oTarget;
//         },
//         // getOwnPropertyDescriptor: function (oTarget, sKey) {
//         //     var vValue = oTarget.getItem(sKey);
//         //     return vValue ? {
//         //         value: null,//??
//         //         writable: false,
//         //         enumerable: true,
//         //         configurable: false
//         //     } : undefined;
//         // },
//     });
// }

// //General helper methods
// function getMethodNames(methods) {
//     return Object.keys(methods || {}).reduce((output, name) => {
//         output[name] = true;

//         return output;
//     }, {});
// }