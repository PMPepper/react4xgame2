
//Helpers
import map from 'helpers/object/map';
import isEmpty from 'helpers/object/isEmpty';

//Other
import createWorldFromDefinition from './createWorldFromDefinition';
//import * as entityCacheTypes from './entityCacheTypes';
import FactionClientTypes from '../FactionClientTypes';
import Enum from 'classes/Enum';

import colonyFactory from './entityProcessorFactories/colony';
import ServerClient, { ENUM_CLIENT_TYPE } from './ServerClient';

//Constants
//-Server phases
const ServerPhase = Enum.create('ServerPhase', ['INITIALISING', 'CONNECTING', 'RUNNING'])


//The class
export default class Server {
  connector = null;

  phase = ServerPhase.INITIALISING;

  totalElapsedTime = null;
  targetTickRate = 60;
  timeMultiplier = 60;//3 * 24 * 3600;//time multiplier
  gameSecondsPerStep = 1;//60;//game seconds to process per step - higher = less processing, but risks resolution based issues
  gameSpeed;
  isPaused = false;

  clients;//a client is a player/ai connected to a faction by a connector method with a permissions e.g. Bob spectating Martians on clientId 1
  clientLastUpdatedTime = null

  entityProcessorFactories = [colonyFactory];

  constructor(connector) {
    this.connector = connector;
  }

  //////////////////////
  // message handlers //
  //////////////////////

  //-initialising server
  message_createWorld(definition, clientId) {
    if(this.phase !== ServerPhase.INITIALISING) {
      throw new Error('Can only create world while Server is in "initialising" phase');
    }

    //c/onsole.log('[Server] createWorld: ', definition, clientId);
    
    this.clients = {};
    this.clientLastUpdatedTime = {};

    //initialise the world based on supplied definition
    this.state = createWorldFromDefinition(definition);

    this.totalElapsedTime = this.state.gameTime = Math.floor(new Date(definition.startDate).valueOf() / 1000);

    this._advanceTime(null);

    //c/onsole.log('[Server] created world: ', this.entities);

    //Now waiting for players to connect
    this.phase = ServerPhase.CONNECTING;

    //broadcast to players that state has updated
    this.connector.broadcastToClients('phaseChanged', this.phase);

    //Report back to clients that game is ready
    return Promise.resolve();
  }

  message_connectClient({name}, clientId) {
    if(this.phase !== ServerPhase.CONNECTING) {
      throw new Error('Can only connect player while Server is in "connecting" phase');
    }

    if(this.clients[clientId]) {
      throw new Error('Each client can only connect once');
    }

    //check client name is valid
    this._checkValidClientName(name, clientId);

    //c/onsole.log('[Server] connectClient: ', name, clientId);

    //create a client
    //factions are the available factions (id: role hash), factionId is the actual faction they are connected as right now
    this.clients[clientId] = new ServerClient(clientId, name, ENUM_CLIENT_TYPE.local, false, {}, null, this.state.gameTime);

    //Broadcast updated clients info
    this.connector.broadcastToClients('clientConnected', this.clients);

    //return game details to newly connected client
    return Promise.resolve({
      clients: this.clients,
      factions: this.state.factions,
      minerals: this.state.minerals,
      structures: this.state.structures,
      research: this.state.research,
      researchAreas: this.state.researchAreas,
      technology: this.state.technology,
    })
  }

  message_setClientSettings({name, factions, factionId, ready}, clientId) {
    if(this.phase !== ServerPhase.CONNECTING) {
      throw new Error('Can only set connected player settings while Server is in "connecting" phase');
    }

    this._checkValidClient(clientId);
    this._checkValidClientName(name, clientId);

    //TODO check that name is unique

    const client = this.clients[clientId];

    //TODO check that client settings are valid e.g. is connecting to valid faction(s) not already controlled by someone else

    if(factions === null || isEmpty(factions)) {
      //joining as spectator for every faction
      factions = map(this.state.factions, () => FactionClientTypes.SPECTATOR);
    } else {
      if(Object.keys(factions).some(factionId => {
        return this._getClientsForFaction(factionId, [FactionClientTypes.OWNER]).some(thisClientId => (thisClientId !== clientId));
      })) {
        throw new Error(`Invalid client settings, faction(s) already owned by '${factionId}'`);
      }

      if(!this.state.factions[factionId]) {
        throw new Error(`Invalid client settings, unknown factionId '${factionId}'`);
      }

      if(!factions[factionId]) {
        throw new Error(`Invalid client settings, invalid factionId '${factionId}' (must be a faction you have permission for)`);
      }
    }

    //c/onsole.log('[Server] setClientSettings: ', name, factions, factionId, ready, clientId);

    //Update the client object
    client.name = name;
    client.factions = factions;
    client.factionId = factionId;
    client.ready = !!ready;

    //broadcast updated state to all players
    this.connector.broadcastToClients('clientUpdated', this.clients);

    //new settings applied successfully
    return Promise.resolve(true);
  }

  message_startGame(data, clientId) {
    if(this.phase !== ServerPhase.CONNECTING) {
      throw new Error('Can only start game while Server is in "connecting" phase');
    }

    this._checkValidClient(clientId);

    //Only only start game if all players are ready
    if(Object.values(this.clients).every(client => (client.ready))) {
      //c/onsole.log('[Server] startGame');
      this.phase = ServerPhase.RUNNING;

      //For each client, tell them the game is starting and send them their client state
      Object.values(this.clients).forEach(client => {
        this.connector.sendMessageToClient(client.id, 'startingGame', this._getClientState(client.id, true));
      });

      //Start the server update tick running
      this._lastTime = Date.now();

      const targetIntervalMs = 1000/this.targetTickRate;//ms
      const targetInterval = targetIntervalMs/1000;

      this._tickId = setInterval(
        () => {
          if(this.phase !== ServerPhase.RUNNING) {
            clearInterval(this._tickId);
            this._tickId = null;
          } else {
            const start = Date.now();
            
            this._onTick(targetInterval);
            const end = Date.now();

            this._lastTime = start;
          }
        },
        targetIntervalMs
      );

      return Promise.resolve(true);
    }

    //Not all players are ready
    return Promise.resolve(false);
  }

  //-in game
  message_getClientState(lastUpdateTime, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only get client state while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    return Promise.resolve(this._getClientState(clientId, true))
  }

  message_setDesiredSpeed(newDesiredSpeed, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only set desired speed while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    this.clients[clientId].gameSpeed = Math.max(1, Math.min(5, newDesiredSpeed|0))
  }

  message_setIsPaused(newIsPaused, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only set is paused while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    this.clients[clientId].isPaused = !!newIsPaused;
  }

//TODO I feel like this sort of thing needs to go somewhere else, or be handled differently somehow

  message_createColony(systemBodyId, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only create colony while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    const colony = this.state.createColony(systemBodyId, this.clients[clientId].factionId);

    return Promise.resolve(colony.id);
  }

  message_createResearchGroup(colonyId, structures, projects, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only add research group while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    const factionId = this.clients[clientId].factionId;
    const colony = this.state.getEntityById(colonyId);

    if(!colony || colony.factionId !== factionId) {
      throw new Error('Cannot add researchGroup, invalid colony');
    }

    const researchGroup = this.state.createResearchGroup(colonyId, structures || {}, projects || []);

    return Promise.resolve(researchGroup.id);
  }

  message_removeResearchGroup(researchGroupId, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only remove research group while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    //this.clients[clientId].factionId;

    //TODO
  }

  message_updateResearchGroup(researchGroupId, structures, projects, clientId) {
    if(this.phase !== ServerPhase.RUNNING) {
      throw new Error('Can only remove research group while server is in "running" phase');
    }

    this._checkValidClient(clientId);

    //this.clients[clientId].factionId;

    //TODO
  }

  /////////////////////
  // Getters/setters //
  /////////////////////



  ////////////////////
  // public methods //
  ////////////////////

  onMessage(type, data, clientId) {
    const name = `message_${type}`;

    if(this[name]) {
      return this[name](data, clientId);
    }

    console.log('Unknown message from client: ', type, data, clientId);
  }


  /////////////////////////////
  // Internal helper methods //
  /////////////////////////////

  //-validation methods
  _checkValidClientName(name, clientId) {
    if(!name) {
      throw new Error('Client required a name');
    }

    Object.values(this.clients).forEach(client => {
      if(client.id !== clientId && client.name === name) {
        throw new Error('Client name already in use by another client');
      }
    });
  }

  _checkValidClient(clientId) {
    if(!this.clients[clientId]) {
      throw new Error('Unknown client');
    }
  }

  _updateGameTime() {
    let newGameSpeed = 5;
    let isPaused = false;

    Object.values(this.clients).forEach(client => {
      newGameSpeed = Math.min(newGameSpeed, client.gameSpeed);
      isPaused = isPaused || client.isPaused;
    });

    switch(newGameSpeed) {
      case 1:
        this.timeMultiplier = 1;
        this.gameSecondsPerStep = 1;
        break;
      case 2:
        this.timeMultiplier = 60;
        this.gameSecondsPerStep = 1;
        break;
      case 3:
        this.timeMultiplier = 3600;
        this.gameSecondsPerStep = 1;
        break;
      case 4:
        this.timeMultiplier = 86400;
        this.gameSecondsPerStep = 60;
        break;
      case 5:
        this.timeMultiplier = 7 * 86400;
        this.gameSecondsPerStep = 360;
        break;
      default:
        throw new Error('Unknown speed value');
    }

    this.gameSpeed = newGameSpeed;
    this.isPaused = isPaused;
  }

  _onTick = (elapsedTime) => {
    this._updateGameTime();

    if(!this.isPaused) {
      const effectiveElapsedTime = elapsedTime * this.timeMultiplier;

      this.totalElapsedTime += effectiveElapsedTime;

      this._advanceTime(this.gameSecondsPerStep);
    }

    Object.values(this.clients).forEach(client => {
      this.connector.sendMessageToClient(client.id, 'updatingGame', this._getClientState(client.id));
    });
  }

  _advanceTime(step = 1) {
    const {entities, gameTime, entityIds, entitiesLastUpdated, factionEntities} = this.state;
    const numEntities = entityIds.length;
    
    let processors = null;

    if(step === null) {
      //initial entity initialisation
      processors = this._getEntityProcessors(gameTime, gameTime, true);

      for(let j = 0; j < numEntities; ++j) {
        processors(entities[entityIds[j]], entities, factionEntities);
      }

      return;
    }

    const advanceToTime = Math.floor(this.totalElapsedTime);

    while(this.state.gameTime < advanceToTime) {
      let lastGameTime = this.state.gameTime;

      //update game time
      this.state.gameTime = Math.min(this.state.gameTime + step, advanceToTime);

      const newGameTime = this.state.gameTime;

      let processors = this._getEntityProcessors(lastGameTime, newGameTime);
      let result;

      //for each entity
      for(let i = 0; i < numEntities; ++i) {
        let entityId = entityIds[i];
        result = processors(entities[entityId], entities, factionEntities);

        if(result) {
          //this entity was mutated
          entitiesLastUpdated[entityId] = newGameTime;

          if(result instanceof Array) {
            result.forEach(id => {
              entitiesLastUpdated[id] = newGameTime;
            });
          }
        }
      }
    }
  }

  _getEntityProcessors(lastGameTime, gameTime, init = false) {

    //create entity processors
    const entityProcessors = this.entityProcessorFactories.map(factory => (factory(lastGameTime, gameTime, init))).filter(processor => (!!processor));

    //create composed function for processing all entities
    //called for each entity - any processor the mutates the entity must return true
    return (entity, entities, factionEntities) => {
      let entityWasMutated = false;

      for(let i = 0, l = entityProcessors.length; i < l;++i) {
        entityWasMutated = entityProcessors[i](entity, entities, factionEntities, this.state.gameConfig) || entityWasMutated;
      }

      return entityWasMutated;
    }
  }

  _getClientState(clientId, full = false) {
    const {gameTime, entities, entitiesLastUpdated, entityIds} = this.state;
    const client = this.clients[clientId];
    const factionId = client.factionId;

    const factionEntities = this.state.factionEntities[factionId];
    const factionEntitiesLastUpdated = this.state.factionEntitiesLastUpdated[factionId];

    const clientLastUpdated = this.clientLastUpdatedTime[clientId];

    //if no clientLastUpdatedTime, then get full state
    full = full || !clientLastUpdated;

    //entities & faction entities to be sent
    const clientEntities = {};
    const clientFactionEntities = {};

    for(let i = 0, l = entityIds.length; i < l; ++i) {
      let entityId = entityIds[i];
      let entity = entities[entityId];

      if(full || (entitiesLastUpdated[entityId] > clientLastUpdated)) {
        //Filter to just entities that do not have a factionId AND entities that have the clients faction id
        if(!entity.factionId || entity.factionId === factionId) {

          if(full) {
            clientEntities[entityId] = entity;
          } else {
            //just changed facets
            const updatedFacets = getUpdatedFacets(entity, clientLastUpdated);

            if(updatedFacets) {
              clientEntities[entityId] = updatedFacets;
            }
          }
        }
      }

      if(factionEntities[entityId]) {
        if(full || (factionEntitiesLastUpdated[entityId] > clientLastUpdated)) {
          clientFactionEntities[entityId] = factionEntities[entityId];
        }
      }
    }

    //record last updated time
    this.clientLastUpdatedTime[clientId] = gameTime;

    //output state to client
    return {
      entities: clientEntities, 
      factionEntities: clientFactionEntities,
      gameTime,
      gameSpeed: this.gameSpeed,
      desiredGameSpeed: client.gameSpeed, 
      isPaused: this.isPaused, 
      factionId: client.factionId
    };
  }
  
  _getClientsForFaction(factionId, roles = null) {
    return Object.values(this.clients).reduce((output, client) => {
      if(client.factions[factionId]) {
        if(!roles || roles.includes(client.factions[factionId])) {
          output.push(client.id);
        }
      }

      return output;
    }, [])
  }
}

//Helpers
function getUpdatedFacets(entity, clientLastUpdated) {
  let output = null;

  entity.facets.forEach(facetName => {
    const facet = entity[facetName];

    if(facet && facet.lastUpdateTime > clientLastUpdated) {
      output = output || {};

      //remove lastUpdateTime from data being sent, as not needed
      const {lastUpdateTime, ...data} = facet;

      output[facetName] = data;
    }
  })

  return output;
}
