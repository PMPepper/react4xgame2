import {set as setSelectedSystemId} from 'redux/reducers/selectedSystemId';

import find from 'helpers/object/find';
import { fromState, mergeState, calculateSystemBodyPositions } from './ClientState';
import { Store } from 'redux';
import { Connector, GameConfiguration, ClientGameState, ClientRole } from 'types/game/shared/game';
import { GameDefinition } from 'types/game/shared/definitions';


export default class Client {
  name: string;
  store: Store
  connector: Connector;

  systemId: number;

  initialGameState: GameConfiguration<false>;

  _gameState?: ClientGameState;
  _updateStateCallback?: (gameState: ClientGameState) => void;

  constructor(name: string, store: Store, connector: Connector) {
    this.name = name;
    this.store = store;

    //connector deals with communications, e.g. ip address of remote server
    this.connector = connector;
    this.connector.setClient(this);

    this.store.subscribe(() => {
      const {selectedSystemId} = this.store.getState();

      if(this.gameState && this.systemId !== selectedSystemId) {
        this.updateSystemBodyPositions(selectedSystemId)
      }
    });

    //this.onTick();
  }

  onGameStateUpdate = () => {
    this.updateSystemBodyPositions(this.store.getState().selectedSystemId);

    this._updateStateCallback?.(this._gameState);
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
      // console.log(gameState);
      // debugger;
      this._gameState = gameState;
    }
  }

  ////////////////////////////////////
  // Client -> server comms methods //
  ////////////////////////////////////

  //contact the server and create a new game with this definition
  //server must be in initialising state
  createWorld(definition:GameDefinition) {
    console.log('[CLIENT] createWorld: ', definition);

    return this.connector.sendMessageToServer('createWorld', definition);
  }

  async connect() {
    console.log('[CLIENT] connect');

    this.initialGameState = await this.connector.sendMessageToServer('connectClient', {name: this.name});

    return true;//TODO error handling?
  }

  setClientSettings(factions: Record<number, ClientRole> | undefined, factionId: number, ready: boolean) {
    console.log('[CLIENT] set client settings: ', factions, factionId, ready);

    return this.connector.sendMessageToServer('setClientSettings', {name: this.name, factions, factionId, ready})
  }

  startGame() {
    console.log('[CLIENT] startGame: ');

    return this.connector.sendMessageToServer('startGame', null)
  }

  //in game messages
  setDesiredSpeed = (speed: number) => {
    console.log('[CLIENT] setDesiredSpeed: ', speed);

    return this.connector.sendMessageToServer('setDesiredSpeed', speed)
  }

  setIsPaused = (isPaused: boolean) => {
    return this.connector.sendMessageToServer('setIsPaused', isPaused)
  }

  createColony(bodyId: number) {
    return this.connector.sendMessageToServer('createColony', bodyId)
  }

  // Construction
  addBuildQueueItem = (colonyId: number, constructionProjectId: number, total: number, assignToPopulationId: number, takeFromPopulationId?: number) => {
    return this.connector.sendMessageToServer('addBuildQueueItem', {colonyId, constructionProjectId, total, assignToPopulationId, takeFromPopulationId})
  }

  removeBuildQueueItem = (colonyId: number, id: number) => {
    return this.connector.sendMessageToServer('removeBuildQueueItem', {colonyId, id})
  }

  reorderBuildQueueItem = (colonyId: number, id: number, newIndex: number) => {
    return this.connector.sendMessageToServer('reorderBuildQueueItem', {colonyId, id, newIndex})
  }

  updateBuildQueueItem = (colonyId: number, id: number, total: number, assignToPopulationId: number, takeFromPopulationId?: number) => {
    return this.connector.sendMessageToServer('updateBuildQueueItem', {colonyId, id, total, assignToPopulationId, takeFromPopulationId})
  }

  ///////////////////////////////////////
  // Server -> Client message handlers //
  ///////////////////////////////////////

  message_startingGame(gameState) {
    console.log('[CLIENT] startingGame', gameState);

    const selectedSystemId = +find(gameState.entities, entity => (entity.type === 'system')).id;
    this.store.dispatch(setSelectedSystemId(selectedSystemId));//TODO base on starting systems

    this.gameState = fromState(gameState, this.initialGameState, selectedSystemId);

    //this.updateSystemBodyPositions(selectedSystemId);

    this.onGameStateUpdate();
  }

  message_updatingGame(newGameState) {
    //console.log('[CLIENT] updatingGame', newGameState, this.systemId);
    this.gameState = mergeState(this.gameState, newGameState);

    //this.updateSystemBodyPositions(this.systemId);

    this.onGameStateUpdate();
  }

  //////////////////
  // UI -> Client //
  //////////////////

  updateSystemBodyPositions(systemId: number) {
    calculateSystemBodyPositions(this.gameState.entities, this.gameState.gameTime, systemId)
  }

  //////////////////
  // Client -> UI //
  //////////////////
  setUpdateStateCallback(callback: (gameState: ClientGameState) => void) {
    this._updateStateCallback = callback;
  }


  ////////////////////////////
  // Internal comms methods //
  ////////////////////////////
  onMessageFromServer(messageType, data) {//TODO correctly type this
    //c/onsole.log('[CLIENT] on message from server: ', messageType, data);

    const name = `message_${messageType}`;

    if(this[name]) {
      return this[name](data);
    }

    console.log('Unknown message from server: ', messageType, data);
  }
}
