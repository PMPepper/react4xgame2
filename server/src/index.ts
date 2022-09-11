
import Turn from 'node-turn';
import Server from './classes/server';

//TURN server
const turnServer = new Turn({
    debugLevel: 'TRACE',
  // set options
//   authMech: 'long-term',
//   credentials: {
//     username: "password"
//   }
});

turnServer.start();


const gameServer:Server = new Server();
