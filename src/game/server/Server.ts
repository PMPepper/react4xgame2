


import populationFactory from './entityProcessorFactories/population';
import colonyFactory from './entityProcessorFactories/colony';
import mineralDepletionFactory from './entityProcessorFactories/mineralDepletion';

import ServerComms, { ServerMessageHandlers, ServerMessageTypes } from './ServerComms';
import { Connector } from 'types/game/shared/game';
import ServerState from './ServerState';

//Constants
//-Server phases
const ServerPhases = ['INITIALISING', 'CONNECTING', 'RUNNING'] as const;
export type ServerPhase = typeof ServerPhases[number];

type EntityProcessor = any;//TODO going to refactor how this part works


//The class
export default class Server {
  comms: ServerComms;
  state?: ServerState;

  phase: ServerPhase = 'INITIALISING';

  //_lastTime: number = -1;//not currently actually used
  _tickId?: number;

  targetTickRate: number = 60;
  timeMultiplier: number = 60;//3 * 24 * 3600;//time multiplier
  gameSpeed: number = 1;
  isPaused: boolean = false;
  realElapsedTime: number = 0;//used to track sub-second time intervals, as gameTick only fires once per second

  

  //Array of arrays, second level arrays contain processor that can run in parallel
  entityProcessors:EntityProcessor[][] = [[populationFactory], [colonyFactory], [mineralDepletionFactory]];

  constructor(connector: Connector) {
    this.comms = new ServerComms(this, connector);
  }

  

  /////////////////////
  // Getters/setters //
  /////////////////////



  ////////////////////
  // public methods //
  ////////////////////

  onMessage<T extends ServerMessageTypes>(type: T, data: ServerMessageHandlers[T]['data'], clientId: number): ServerMessageHandlers[T]['returns'] {
    //const name = `message_${type}`;

    if(this.comms[type]) {
      return (this.comms[type] as any)(data, clientId);
    }

    console.log('Unknown message from client: ', type, data, clientId);
  }

  startGameUpdate() {
    //this._lastTime = Date.now();

    const targetIntervalMs = 1000/this.targetTickRate;//ms
    const targetInterval = targetIntervalMs/1000;

    this._tickId = setInterval(() => {
        if(this.phase !== 'RUNNING') {
            clearInterval(this._tickId);
            this._tickId = undefined;
        } else {
            const start = Date.now();
            
            this._onTick(targetInterval);
            const end = Date.now();

            //this._lastTime = start;
        }
        },
        targetIntervalMs
    ) as any as number;
  }


  /////////////////////////////
  // Internal helper methods //
  /////////////////////////////


  //Game tick methods
  _updateGameTime() {
    const [newGameSpeed, isPaused] = this.comms._getGameSpeed();

    switch(newGameSpeed) {
      case 1://TODO make this data driven, or configurable?
        this.timeMultiplier = 1;
        break;
      case 2:
        this.timeMultiplier = 60;
        break;
      case 3:
        this.timeMultiplier = 3600;
        break;
      case 4:
        this.timeMultiplier = 86400;
        break;
      case 5:
        this.timeMultiplier = 7 * 86400;
        break;
      default:
        throw new Error('Unknown speed value');
    }

    this.gameSpeed = newGameSpeed;
    this.isPaused = isPaused;
  }

  _onTick = (elapsedTime: number) => {
    this._updateGameTime();

    if(!this.isPaused) {
      const effectiveElapsedTime = elapsedTime * this.timeMultiplier;
      this.realElapsedTime += effectiveElapsedTime;
      const ticksToAdvanceBy = Math.floor(this.realElapsedTime - this.state!.gameTime);

      if(ticksToAdvanceBy > 0) {
        this._advanceTime(false, ticksToAdvanceBy);
      }
    }

    this.comms._sendGameStateUpdateToClients();
  }

  _advanceTime(isInit: boolean, ticksToAdvanceBy: number = 0) {
    const {entities, gameConfig, entityIds, entitiesByType, entitiesLastUpdated, factionEntities} = this.state!;
    const {entityProcessors} = this;

    const advanceToTime = isInit ?
      0
      :
      Math.floor(this.state!.gameTime + ticksToAdvanceBy);

    //DEV performance testing
    //const startTime = performance.now()

    while(isInit || this.state!.gameTime < advanceToTime) {
      const lastTime = this.state!.gameTime;

      //update game time (if applicable)
      this.state!.gameTime = isInit ? lastTime : Math.min(lastTime + 1, advanceToTime);

      const time = this.state!.gameTime;
      const isDayStep = Math.floor(lastTime / 86400) !== Math.floor(time / 86400)

      //Iterate though entity processor sets
      for(let i = 0; i < entityProcessors.length; i++) {
        const entityProcessorSet = entityProcessors[i];//these can be run in parallel

        for(let i = 0; i < entityProcessorSet.length; i++) {
          const {type, frequency, init, processor} = entityProcessorSet[i];

          //Should this processor run at this time?
          if((isInit && init) || (!isInit && (frequency === 'second' || frequency === 'day' && isDayStep))) {
            const processorEntityIds = type === '*' ?
              entityIds
              :
              entitiesByType[type];

            for(let i = 0; i < processorEntityIds.length; i++) {
              const entityId = processorEntityIds[i];
              const entity = entities[entityId];

              const updatedFacets = processor(entity, entities, factionEntities, gameConfig, isInit, time);

              if(updatedFacets) {//this entity was mutated
                entitiesLastUpdated[entityId] = time;

                for(let i = 0; i < updatedFacets.length; i++) {//mark updated facets
                  entity[updatedFacets[i]].lastUpdateTime = time;
                }
              }
            }
          }
        }

        //End of entity processor set
      }

      if(isInit) {
        break;
      }
    }

    //DEV performance testing
    // const end = performance.now()
    // console.log(end - startTime, ticksToAdvanceBy);
  }
}
  
  
  


