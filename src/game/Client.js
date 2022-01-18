import {set as setSelectedSystemId} from 'redux/selectedSystemId';

import find from 'helpers/object/find';
import { fromState, mergeState } from './ClientState';


export default class Client {
  constructor(name, store, connector) {
    this.name = name;
    this.store = store;

    //connector deals with communications, e.g. ip address of remote server
    this.connector = connector;
    this.connector.setClient(this);
  }

  /////////////////////
  // Getters/setters //
  /////////////////////

  get allFactionIds() {
    return Object.keys(this.initialGameState.factions).map(id => (+id));
  }

  get gameState() {
    return this._gameState;
  }

  set gameState(gameState) {
    if(gameState !== this._gameState) {
      this._gameState = gameState;

      this._updateStateCallback?.(gameState);
    }
  }

  ////////////////////////////////////
  // Client -> server comms methods //
  ////////////////////////////////////

  //contact the server and create a new game with this definition
  //server must be in initialising state
  createWorld(definition) {
    //c/onsole.log('[CLIENT] createWorld: ', definition);

    return this.connector.sendMessageToServer('createWorld', definition);
  }

  connect() {
    //c/onsole.log('[CLIENT] connect');

    return this.connector.sendMessageToServer('connectClient', {name: this.name}).then(initialGameState => {
      this.initialGameState = initialGameState;

      return true;
    })
  }

  setClientSettings(factions, factionId, ready) {
    //c/onsole.log('[CLIENT] set client settings: ', factions, factionId, ready);

    return this.connector.sendMessageToServer('setClientSettings', {name: this.name, factions, factionId, ready})
  }

  startGame() {
    //c/onsole.log('[CLIENT] startGame: ');

    return this.connector.sendMessageToServer('startGame', null)
  }

  //in game messages
  setDesiredSpeed(speed) {
    //c/onsole.log('[CLIENT] setDesiredSpeed: ', speed);

    return this.connector.sendMessageToServer('setDesiredSpeed', speed)
  }

  setIsPaused(isPaused) {
    return this.connector.sendMessageToServer('setIsPaused', isPaused)
  }

  createColony(bodyId) {
    return this.connector.sendMessageToServer('createColony', bodyId)
  }

  ///////////////////////////////////////
  // Server -> Client message handlers //
  ///////////////////////////////////////

  message_startingGame(gameState) {
    this.store.dispatch(setSelectedSystemId(+find(gameState.entities, entity => (entity.type === 'system')).id));//TODO base on starting systems

    this.gameState = fromState(gameState, this.initialGameState);
  }

  message_updatingGame(newGameState) {
    this.gameState = mergeState(this.gameState, newGameState);
  }

  //////////////////
  // Client -> UI //
  //////////////////
  setUpdateStateCallback(callback) {
    this._updateStateCallback = callback;
  }


  ////////////////////////////
  // Internal comms methods //
  ////////////////////////////
  onMessageFromServer(messageType, data) {
    //c/onsole.log('[CLIENT] on message from server: ', messageType, data);

    const name = `message_${messageType}`;

    if(this[name]) {
      return this[name](data);
    }

    console.log('Unknown message from server: ', messageType, data);
  }
}
