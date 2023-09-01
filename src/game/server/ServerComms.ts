//Helpers
import map from 'helpers/object/map';
import isEmpty from 'helpers/object/isEmpty';
import inPlaceReorder from 'helpers/array/in-place-reorder';
import forEach from 'helpers/object/forEach';

//Other
import Server, { ServerPhase } from "./Server";
import createWorldFromDefinition from './createWorldFromDefinition';

import { ClientRole, ClientState, ServerToClientsConnector, GameConfiguration, GameSpeeds } from "types/game/shared/game";
import { KeysWithValsOfType } from 'types/utils';
import { EntityFaction } from 'types/game/shared/entities';
import { GameDefinitionOptions } from 'types/game/shared/definitions';

type ServerMethods = KeysWithValsOfType<ServerComms, (data: any, clientId: number) => any>;
type ServerPrvateMethods = Extract<keyof ServerComms, `_${string}`>;
export type ServerMessageTypes = Exclude<ServerMethods, ServerPrvateMethods>;

export type ServerMessageHandlers = {
    [Prop in ServerMessageTypes]: {
        data: Parameters<ServerComms[Prop]>[0],
        returns: ReturnType<ServerComms[Prop]>
    }
}



export default class ServerComms {
    server: Server;
    connector: ServerToClientsConnector;

    clients: Record<number, ClientState>;//a client is a player/ai connected to a faction by a connector method with a permissions e.g. Bob spectating Martians on clientId 1
    clientLastUpdatedTime: Record<number, number>;

    constructor(server: Server, connector: ServerToClientsConnector) {
        this.server = server;
        this.connector = connector;
    }

    _checkValidClientName(name: string, clientId: number) {
        if(!name) {
            throw new Error('Client required a name');
        }
    
        Object.values(this.clients).forEach(client => {
            if(client.id !== clientId && client.name === name) {
                throw new Error('Client name already in use by another client');
            }
        });
    }
    
    _checkValidClient(clientId: number) {
        if(!this.clients[clientId]) {
            throw new Error('Unknown client');
        }
    }
    
    _checkPhase(phase: ServerPhase, msg?: string) {
        if(this.server.phase !== phase) {
            throw new Error(msg || `Incorrect phase, was: ${this.server.phase}, required: ${phase}`);
        }
    }

    //Just throws an error if not true
    _clientOwnsEntity(clientId: number, ...entityIds: number[]) {
        for(let i = 0; i < entityIds.length; i++) {
            const entityId = entityIds[i];
        
            if(!entityId) {
                continue;
            }
        
            const entity = this.server.state.getEntityById(entityId);
        
            if(!entity) {
                throw new Error('Entity not found');
            }
        
            if(this.clients[clientId].factionId !== (entity as any).factionId) {
                throw new Error('Client does not control this entity');
            }
        }
    }

    _getClientsForFaction(factionId: number, roles?: ClientRole[]) {
        return Object.values(this.clients).reduce<number[]>((output, client) => {
            if(client.factions[factionId]) {
                if(!roles || roles.includes(client.factions[factionId])) {
                output.push(client.id);
                }
            }
        
            return output;
        }, [])
    }

    _getClientState(clientId: number, _full: boolean = false) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);

        const {gameTime, entities, entitiesLastUpdated, entityIds} = this.server.state;
        const client = this.clients[clientId];
        const factionId = client.factionId;
    
        const factionEntities = this.server.state.factionEntities[factionId];
        const factionEntitiesLastUpdated = this.server.state.factionEntitiesLastUpdated[factionId];
    
        const clientLastUpdated = this.clientLastUpdatedTime[clientId];
    
        //if no clientLastUpdatedTime, then get full state
        const full = _full || !clientLastUpdated;
    
        //entities & faction entities to be sent
        const clientEntities = {};
        const clientFactionEntities = {};
    
        for(let i = 0, l = entityIds.length; i < l; ++i) {
            let entityId = entityIds[i];
            let entity = entities[entityId];
        
            if(full || (entitiesLastUpdated[entityId] > clientLastUpdated)) {
                //Filter to just entities that do not have a factionId AND entities that have the clients faction id
                if(!(entity as any).factionId || (entity as any).factionId === factionId) {
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
        return {//TODO type this
            entities: clientEntities, 
            factionEntities: clientFactionEntities,
            gameTime,
            gameSpeed: this.server.gameSpeed,
            desiredGameSpeed: client.gameSpeed, 
            isPaused: this.server.isPaused, 
            factionId: client.factionId
        };
    }

    _getGameSpeed(): [number, boolean] {
        return Object.values(this.clients).reduce<[number, boolean]>((output, client) => {
            output[0] = Math.min(output[0] , client.gameSpeed);
            output[1] = output[1] || client.isPaused;

            return output;
        }, [5, false]);
    }

    _sendGameStateUpdateToClients() {
        Object.values(this.clients).forEach(client => {
            this.connector.sendMessageToClient(client.id, 'updatingGame', this._getClientState(client.id, false));
        });
    }

    //////////////////////
    // message handlers //
    //////////////////////

    //-initialising server
    createWorld(definition: GameDefinitionOptions, clientId: number) {
        if(this.server.phase !== 'INITIALISING') {
            throw new Error('Can only create world while Server is in "initialising" phase');
        }

        //c/onsole.log('[Server] createWorld: ', definition, clientId);
        
        this.clients = {};
        this.clientLastUpdatedTime = {};

        //TODO move this into server
            //initialise the world based on supplied definition
            this.server.state = createWorldFromDefinition(definition);

            //Initialise time - state keeps track of actual game time, down to the second, realElapsedTime handles sub-second time 
            this.server.realElapsedTime = this.server.state.gameTime = Math.floor(new Date(definition.startDate).valueOf() / 1000);

            this.server._advanceTime(true);

            //c/onsole.log('[Server] created world: ', this.entities);

            //Now waiting for players to connect
            this.server.phase = 'CONNECTING';
        //End TODO

        //broadcast to players that state has updated
        this.connector.broadcastToClients('phaseChanged', this.server.phase);
    }

    connectClient({name}: {name: string}, clientId: number): GameConfiguration<false> {
        if(this.server.phase !== 'CONNECTING') {
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
        this.clients[clientId] = {id: clientId, name, type: {name: 'local'}, ready: false, factions: {}, factionId: null, gameSpeed: 1, isPaused: false}

        //Broadcast updated clients info
        this.connector.broadcastToClients('clientConnected', this.clients);

        //return game details to newly connected client
        return {
            clients: this.clients,
            factions: this.server.state.factions as unknown as Record<number, EntityFaction<false>>,//serialisation will strip server only props
            minerals: this.server.state.minerals,
            structures: this.server.state.structures,
            constructionProjects: this.server.state.constructionProjects,
            research: this.server.state.research,
            researchAreas: this.server.state.researchAreas,
            technology: this.server.state.technology,
        }
    }

    setClientSettings(
        {name, factions, factionId, ready}: {name: string, factions?: Record<number, ClientRole>, factionId: number, ready: boolean}, 
        clientId: number
    ) {
        if(this.server.phase !== 'CONNECTING') {
            throw new Error('Can only set connected player settings while Server is in "connecting" phase');
        }

        this._checkValidClient(clientId);
        this._checkValidClientName(name, clientId);

        //TODO check that name is unique

        const client = this.clients[clientId];

        //TODO check that client settings are valid e.g. is connecting to valid faction(s) not already controlled by someone else

        if(!factions || isEmpty(factions)) {
            //joining as spectator for every faction
            factions = map(this.server.state.factions, () => 'SPECTATOR');
        } else {
            if(Object.keys(factions).some(factionId => {
                return this._getClientsForFaction(+factionId, ['OWNER']).some(thisClientId => (thisClientId !== clientId));
            })) {
                throw new Error(`Invalid client settings, faction(s) already owned by '${factionId}'`);
            }

            if(!this.server.state.factions[factionId]) {
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
    }

    startGame(data, clientId: number) {
        if(this.server.phase !== 'CONNECTING') {
            throw new Error('Can only start game while Server is in "connecting" phase');
        }

        this._checkValidClient(clientId);

        //Only start game if all players are ready
        if(Object.values(this.clients).every(client => (client.ready))) {
            //c/onsole.log('[Server] startGame');
            this.server.phase = 'RUNNING';

            //For each client, tell them the game is starting and send them their client state
            Object.values(this.clients).forEach(client => {
                this.connector.sendMessageToClient(client.id, 'startingGame', this._getClientState(client.id, true));
            });

            //Start the server update tick running
            this.server.startGameUpdate();

            return true;
        }

        //Not all players are ready
        return false;
    }

    //-in game
    

    setDesiredSpeed(newDesiredSpeed: GameSpeeds, clientId: number) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);

        this.clients[clientId].gameSpeed = Math.max(1, Math.min(5, newDesiredSpeed|0)) as GameSpeeds;
    }

    setIsPaused(newIsPaused: boolean, clientId: number) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);

        this.clients[clientId].isPaused = !!newIsPaused;
    }

    createColony(systemBodyId: number, clientId: number) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);

        const colony = this.server.state.createColony(systemBodyId, this.clients[clientId].factionId);

        return colony.id;
    }

    //Construction messages
    addBuildQueueItem(
        {colonyId, constructionProjectId, total, assignToPopulationId, takeFromPopulationId}: {colonyId: number, constructionProjectId: number, total: number, assignToPopulationId: number, takeFromPopulationId?: number},
        clientId: number
    ) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);
        this._clientOwnsEntity(clientId, colonyId, assignToPopulationId, takeFromPopulationId);

        const colony = this.server.state.getEntityById(colonyId, 'colony');

        if(!colony?.colony) {
            throw new Error('Not a valid colony');
        }

        const constructionProject = this.server.state.constructionProjects[constructionProjectId];

        if(!constructionProject) {
            throw new Error('Unknown constructionProjectId: '+ constructionProjectId);
        }

        //Add the construction queue
        const newId = this.server.state.nextId();

        colony.colony.buildQueue.push({
            id: newId,//re-using entity ID, even though it's not an entity - is that a problem?
            total,
            completed: 0,
            constructionProjectId,
            assignToPopulationId,
            takeFromPopulationId
        })

        //make sure colony props are valid
        //-ideally shouldn't need this? would be handled in the processor?
        if(!colony.colony.structures[assignToPopulationId]) {
            colony.colony.structures[assignToPopulationId] = {};
        }

        forEach(constructionProject.producedStructures || {}, (quantity, structureId) => {
            if(!colony.colony.structures[assignToPopulationId][structureId]) {
                colony.colony.structures[assignToPopulationId][structureId] = 0;
            }
        })

        this.server.state.modifiedEntity(colony.id, 'colony')

        return newId;
    }

    removeBuildQueueItem({colonyId, id}: {colonyId: number, id: number}, clientId: number) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);
        this._clientOwnsEntity(clientId, colonyId);

        const colony = this.server.state.getEntityById(colonyId, 'colony');

        if(!colony?.colony) {
        throw new Error('Not a valid colony');
        }

        const buildQueueItemIndex = colony.colony.buildQueue.findIndex(item => item.id === id);

        if(buildQueueItemIndex === -1) {
            return false;
        }

        //everything is valid, remove build queue item
        colony.colony.buildQueue.splice(buildQueueItemIndex, 1);

        this.server.state.modifiedEntity(colony.id, 'colony');

        //return new build queue
        return colony.colony.buildQueue;
    }

  reorderBuildQueueItem({colonyId, id, newIndex}, clientId: number) {
    this._checkPhase('RUNNING');
    this._checkValidClient(clientId);
    this._clientOwnsEntity(clientId, colonyId);

    const colony = this.server.state.getEntityById(colonyId, 'colony');

    if(!colony?.colony) {
      throw new Error('Not a valid colony');
    }

    const buildQueueItemIndex = colony.colony.buildQueue.findIndex(item => item.id === id);

    if(buildQueueItemIndex === -1) {
      return;
    }

    //everything is valid, reorder build queue
    inPlaceReorder(colony.colony.buildQueue, buildQueueItemIndex, newIndex);

    this.server.state.modifiedEntity(colony.id, 'colony');

    //return new build queue
    return colony.colony.buildQueue;
  }

    updateBuildQueueItem(
        {colonyId, id, total, assignToPopulationId, takeFromPopulationId}: {colonyId: number, id: number, total: number, assignToPopulationId: number, takeFromPopulationId?: number}, 
        clientId: number
    ) {
        this._checkPhase('RUNNING');
        this._checkValidClient(clientId);
        this._clientOwnsEntity(clientId, colonyId, assignToPopulationId, takeFromPopulationId);

        const colony = this.server.state.getEntityById(colonyId, 'colony');

        if(!colony?.colony) {
            throw new Error('Not a valid colony');
        }

        const buildQueueItemIndex = colony.colony.buildQueue.findIndex(item => item.id === id);

        if(buildQueueItemIndex === -1) {
           return;
        }

        const buildQueueItem = colony.colony.buildQueue[buildQueueItemIndex];

        //make sure colony props are valid
        if(!colony.colony.structures[assignToPopulationId]) {
          colony.colony.structures[assignToPopulationId] = {};
        }

        const constructionProject = this.server.state.constructionProjects[buildQueueItem.constructionProjectId];

        forEach(constructionProject.producedStructures, (quantity, structureId) => {
            if(!colony.colony.structures[assignToPopulationId][buildQueueItem.constructionProjectId]) {
                colony.colony.structures[assignToPopulationId][buildQueueItem.constructionProjectId] = 0;
            }
        })

        //everthing is valid, update build queue item
        buildQueueItem.total = total;
        buildQueueItem.assignToPopulationId = assignToPopulationId;
        buildQueueItem.takeFromPopulationId = takeFromPopulationId;

        this.server.state.modifiedEntity(colony.id, 'colony');

        //return new build queue
        return colony.colony.buildQueue;
    }


  //Research

//   createResearchGroup(colonyId, structures, projects, clientId) {
//     this._checkPhase('RUNNING');

//     this._checkValidClient(clientId);

//     const factionId = this.clients[clientId].factionId;
//     const colony = this.server.state.getEntityById(colonyId, 'colony');

//     if(!colony || colony.factionId !== factionId) {
//       throw new Error('Cannot add researchGroup, invalid colony');
//     }

//     const researchGroup = this.server.state.createResearchGroup(colonyId, structures || {}, projects || []);

//     return Promise.resolve(researchGroup.id);
//   }

    removeResearchGroup(researchGroupId: number, clientId: number) {
        this._checkPhase('RUNNING');

        this._checkValidClient(clientId);

        //this.clients[clientId].factionId;

        //TODO
    }

//   updateResearchGroup(researchGroupId, structures, projects, clientId) {
//     this._checkPhase('RUNNING');

//     this._checkValidClient(clientId);

//     //this.clients[clientId].factionId;

//     //TODO
//   }
}


//Helpers
function getUpdatedFacets(entity, clientLastUpdated) {
    let output = null;
  
    entity.facets.forEach(facetName => {
      const facet = entity[facetName];
  
      if(facet && facet.lastUpdateTime > clientLastUpdated) {
        output = output || {};
  
        //remove lastUpdateTime from data being sent, as not needed
        //const {lastUpdateTime, ...data} = facet;
  
        output[facetName] = facet;
      }
    })
  
    return output;
  }