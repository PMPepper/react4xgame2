//TODO Create WebRTC AsyncConnection data transport (based on DataChannel?)
//TODO abstract out Signalling Channel into more generic interface
//TODO create wrapper layer to allow easy use of AsynConnection to implement signalling channel
//TODO create helper methods to allow easy use for standard cases

function blobToString(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = function() {
            resolve(reader.result);
        }
        reader.readAsText(blob);
    });
}

class WebSocketSignalingChannel {
    constructor(socket) {
        this.socket = socket;
        
        // Listen for messages
        socket.addEventListener('message', this._onmessage);
    }

    _onmessage = async (event) => {
        const msgText = await blobToString(event.data);
        const msg = JSON.parse(msgText);
        this.onmessage?.({data: msg});
    }

    send(data) {
        console.log('SignalingChannel::send: ', data);

        this.socket.send(JSON.stringify(data));
    }

    static async createFromUrl(url) {
        return WebSocketSignalingChannel.createFromSocket(new WebSocket(url))
    }

    static async createFromSocket(socket) {
        const channel = new WebSocketSignalingChannel(socket);

        if(socket.readyState === 1) {
            return channel;
        }

        if(socket.readyState === 0) {
            return new Promise((resolve, reject) => {
                const onOpen = () => {
                    socket.removeEventListener('open', onOpen)

                    resolve(channel);
                }

                socket.addEventListener('open', onOpen)
            })
        }

        throw new Error('Cannot create WebSocketSignalingChannel using a closed or closing WebSocket');
    }
}


class RTCConnection {
    constructor(config, isPolite, signaler) {
        const pc = this.pc = new RTCPeerConnection(config);
        this.signaler = signaler;

        let polite = !!isPolite;
        let makingOffer = false;
        let ignoreOffer = false;

        //TODO error handling
        pc.onnegotiationneeded = async () => {
            try {
                makingOffer = true;
                await pc.setLocalDescription();
                signaler.send({ description: pc.localDescription });
            } catch (err) {
                console.error(err);
            } finally {
                makingOffer = false;
            }
        };
    
        pc.onicecandidate = ({candidate}) => signaler.send({candidate});
    
        signaler.onmessage = async ({ data: { description, candidate } }) => {
            //console.log('RTCConnection::signaler::onmessage', description, candidate);

            try {
                if (description) {
                    const offerCollision = (description.type === "offer") && (makingOffer || pc.signalingState !== "stable");
            
                    ignoreOffer = !polite && offerCollision;

                    if (ignoreOffer) {
                        return;
                    }
                
                    await pc.setRemoteDescription(description);

                    if (description.type === "offer") {
                        await pc.setLocalDescription();
                        signaler.send({ description: pc.localDescription })
                    }
                } else if (candidate) {
                    try {
                        console.log('Add ICE candidate: ', candidate);
                        await pc.addIceCandidate(candidate);
                    } catch (err) {
                        console.log('Failed to add ICE candidate: ', err);
                        if (!ignoreOffer) {
                            throw err;
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    //This currently only really works
    createDataChannel(name, options) {//TODO error handling
        const negotiated = options?.negotiated;
        const id = +options?.id

        console.log('RTCConnection::createDataChannel: ', name, options);
        return new Promise((resolve, reject) => {
            let receiveChannel = null;

            const ondatachannel = (event) => {
                console.log('RTCConnection::ondatachannel: ', event.channel);
                if((negotiated && (event.channel.id === options.id)) || (event.channel.label === sendChannel.label)) {
                    receiveChannel = event.channel;
                    checkChannels();
                }
            }

            const checkChannels = () => {
                console.log('RTCConnection::checkChannels: ', sendChannel?.readyState, receiveChannel?.readyState);
                if(sendChannel.readyState === 'open' && receiveChannel?.readyState === 'open') {
                    !negotiated && this.pc.removeEventListener('datachannel', ondatachannel);
                    resolve(new DataChannel(sendChannel, receiveChannel));
                }
            }
            
            if(!negotiated) {
                this.pc.addEventListener('datachannel', ondatachannel)
            }

            //begin creating the channel
            const sendChannel = this.pc.createDataChannel(name, options);
            receiveChannel = negotiated ? sendChannel : null;
            sendChannel.onopen = checkChannels;
        });
    }
}

//TODO error handling, close handling, etc
class DataChannel {
    constructor(sendChannel, receiveChannel) {
        this.sendChannel = sendChannel;
        this.receiveChannel = receiveChannel;

        receiveChannel.addEventListener('message', this._onmessage);
    }

    send(message) {
        this.sendChannel.send(message);
    }

    _onmessage = (event) => {
        this.onmessage?.(event);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

///////////////////////////////////////////////////////////////////

export default async function() {
    const signallingWebsocketAddress = 'ws://localhost:8080'

    const connectionConfig = {
        iceServers: [{ urls: "stun:192.168.1.202:3478" }]
    };

    console.log('Init signaler');
    const signaler = await WebSocketSignalingChannel.createFromUrl(signallingWebsocketAddress);

    await sleep(500);//why is this required? Also, it doesn't work if you give it too little time...

    console.log('Init connection');
    const connection = new RTCConnection(connectionConfig, false, signaler);

    console.log('Init dataChannel');
    const dataChannel = await connection.createDataChannel('testChannel', {negotiated: true, id: 1000});

    console.log('Datachannel inited');

    dataChannel.onmessage = ({data}) => {
        console.log('onmessage: ', data);
    }

    setInterval(() => {
        const msg = `====${Math.random()}====`
        console.log('send: ', msg);
        dataChannel.send(msg);
    }, 1000);
}



///////////////////////////////////////////////////////////////////

// let polite = false;//Math.random() > 0.5;//?????????????
// console.log('polite?: ', polite);



// //Need SignnallingChannel to be connected before I can create a connection
// setTimeout(createConnection, 2000);

// function createConnection() {
//     const signaler = new SignalingChannel(new WebSocket('ws://localhost:8080'));
//     const pc = new RTCPeerConnection(config);
//     let dataChannel;

//     var handleDataChannelOpen = function (event) {
//         console.log("dataChannel.OnOpen", event);
//         dataChannel.send("Hello World!");
//     };
    
//     var handleDataChannelMessageReceived = function (event) {
//         console.log("dataChannel.OnMessage:", event.data);
//     };
    
//     var handleDataChannelError = function (error) {
//         console.log("dataChannel.OnError:", error);
//     };
    
//     var handleDataChannelClose = function (event) {
//         console.log("dataChannel.OnClose", event);
//     };
    
//     var handleChannelCallback = function (event) {
//         dataChannel = event.channel;
//         dataChannel.onopen = handleDataChannelOpen;
//         dataChannel.onmessage = handleDataChannelMessageReceived;
//         dataChannel.onerror = handleDataChannelError;
//         dataChannel.onclose = handleDataChannelClose;
//     };

//     pc.ondatachannel = handleChannelCallback;
    
//     //begin negiationation
    
//     let makingOffer = false;
    
//     pc.onnegotiationneeded = async () => {
//         try {
//             makingOffer = true;
//             await pc.setLocalDescription();
//             signaler.send({ description: pc.localDescription });
//         } catch (err) {
//             console.error(err);
//         } finally {
//             makingOffer = false;
//         }
//     };
    
//     pc.onicecandidate = ({candidate}) => signaler.send({candidate});
    
//     let ignoreOffer = false;
    
//     signaler.onmessage = async ({ data: { description, candidate } }) => {
//         //console.log('onmessage: ', description, candidate);

//       try {
//         if (description) {
//           const offerCollision = (description.type === "offer") &&
//                                  (makingOffer || pc.signalingState !== "stable");
    
//           ignoreOffer = !polite && offerCollision;
//           if (ignoreOffer) {
//             return;
//           }
    
//           await pc.setRemoteDescription(description);
//           if (description.type === "offer") {
//             await pc.setLocalDescription();
//             signaler.send({ description: pc.localDescription })
//           }
//         } else if (candidate) {
//           try {
//             await pc.addIceCandidate(candidate);
//           } catch (err) {
//             if (!ignoreOffer) {
//               throw err;
//             }
//           }
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }
    

//     setTimeout(
//         () => {//wait until the other end is ready
//             console.log('create data channel');
//             const sendChannel = pc.createDataChannel('flibble8');//I think this string needs to be unique to the connection? This is how they are identified?
    
//             sendChannel.onopen = () => {
//                 console.log('channel open!', sendChannel, dataChannel);
//                 console.log(sendChannel, sendChannel === dataChannel);

//                 setInterval(
//                     () => {
//                         const msg = Math.random()+ '!!';
//                         console.log('sending: ', msg);
//                         sendChannel.send(msg);
//                     },
//                     1000
//                 );
//             };
            
             
//         },
//         1000
//     )
// }



