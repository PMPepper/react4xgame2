import Performance from "classes/Performance";
import { isEmpty } from "lodash";

//Helpers
import getSystemBodyPosition from 'helpers/app/getSystemBodyPosition';

//Helpers
//import toEntity from 'helpers/app/toEntity';
//import deepFreeze from 'helpers/object/deepFreeze';//useful for debugging

////////////////////
// cached getters //
////////////////////

// get gameTimeDate() {
//   if(!this._gameTimeDate) {
//     this._gameTimeDate = new Date(this.gameTime * 1000);
//   }

//   return this._gameTimeDate;
// }

// get factions() {
//   if(!this._factions) {
//     const entityIds = this.entityIds;
//     const entities = this.entities;
//     const factions = this._factions = [];
//     let id = null;
//     let entity = null;

//     for(let i = 0; i < entityIds.length; i++) {
//       id = entityIds[i];
//       entity = entities[id];

//       if(entity.type === 'faction') {
//         factions.push(entity);
//       }
//     }
//   }

//   return this._factions;
// }

// get knownSystems() {
//   if(!this._knownSystems) {
//     const entityIds = this.entityIds;
//     const entities = this.entities;
//     const knownSystems = this._knownSystems = [];
//     let id = null;
//     let entity = null;

//     for(let i = 0; i < entityIds.length; i++) {
//       id = entityIds[i];
//       entity = entities[id];

//       if(entity.type === 'factionSystem') {
//         knownSystems.push(entity);
//       }
//     }
//   }

//   return this._knownSystems;
// }

// get coloniesBySystemBySystemBody() {
//   if(!this._coloniesBySystemBySystemBody) {
//     const entityIds = this.entityIds;
//     const entities = this.entities;
//     const factionId = this.factionId;
//     const coloniesBySystemBySystemBody = this._coloniesBySystemBySystemBody = {};
//     const knownSystems = this.knownSystem;

//     let id = null;
//     let entity = null;


//     for(let i = 0; i < entityIds.length; i++) {
//       id = entityIds[i];
//       entity = entities[id];

//       if(entity.type === 'colony' && entity.factionId === factionId) {
//         if(!coloniesBySystemBySystemBody[entity.systemId]) {
//           coloniesBySystemBySystemBody[entity.systemId] = {};
//         }

//         coloniesBySystemBySystemBody[entity.systemId][entity.systemBodyId] = entity;
//       }
//     }
//   }

//   return this._coloniesBySystemBySystemBody;
// }

////////////////////////
// Non-cached getters //
////////////////////////

//TODO find a way to memoise these methods, and clear when clientstate changes

export function getRenderableEntities(clientState, systemId) {
  const entityIds = clientState.entityIds;
  const entities = clientState.entities;
  const renderableEntities = [];
  let id = null;
  let entity = null;

  for(let i = 0; i < entityIds.length; i++) {
    id = entityIds[i];
    entity = entities[id];

    if(entity.render && entity.systemId === systemId) {
      renderableEntities.push(entity);
    }
  }

  return renderableEntities;
}

export function getColoniesBySystemBody(clientState, systemId) {
  const entityIds = clientState.entityIds;
  const entities = clientState.entities;
  const factionId = clientState.factionId;
  const colonies = {};
  let id, entity;

  for(let i = 0; i < entityIds.length; i++) {
    id = entityIds[i];
    entity = entities[id];

    if(entity.type === 'colony' && entity.systemId === systemId && entity.factionId === factionId) {
      colonies[entity.systemBodyId] = entity;
    }
  }

  return colonies;
}

//cache data

function getKnownSystems(clientState) {
  const {entities, factionEntities} = clientState;
  const factionEntityIds = Object.keys(factionEntities);

  const knownSystems = [];
  let id = null;
  
  for(let i = 0; i < factionEntityIds.length; i++) {
    id = factionEntityIds[i];

    if(entities[id].type === 'system') {
      knownSystems.push(factionEntities[id]);
    }
  }

  return knownSystems;
}

// export function getColoniesForSystemBody(systemBody) {
//   systemBody = +(systemBody.id || systemBody);//convert to id, if needed

//   const entityIds = this.entityIds;
//   const entities = this.entities;
//   const factionId = this.factionId;
//   const colonies = [];
//   let id, entity;

//   //TODO could use another cached getter, e.g. getFactionSystemBodies to thin down list..?
//   for(let i = 0; i < entityIds.length; i++) {
//     id = entityIds[i];
//     entity = entities[id];

//     if(entity.type === 'colony' && entity.systemBodyId === systemBody) {
//       colonies.push(entity);
//     }
//   }

//   return colonies;
// }



export function fromState(state, initialGameState, selectedSystemId) {
  //TODO removed entities

  const clientState = {};

  clientState.initialGameState = initialGameState;
  clientState.factionId = state.factionId;
  clientState.entities = state.entities;
  clientState.factionEntities = state.factionEntities;
  clientState.gameTime = state.gameTime;
  clientState.desiredGameSpeed = state.desiredGameSpeed;
  clientState.gameSpeed = state.gameSpeed;
  clientState.isPaused = state.isPaused;

  clientState.entityIds = Object.keys(clientState.entities);

  clientState.knownSystems = getKnownSystems(clientState);

  calculateSystemBodyPositions(clientState.entities, clientState.gameTime, selectedSystemId);

  return clientState;
}


export function mergeState(oldState, newData, selectedSystemId) {
  Performance.mark('updatingGame :: start merge state');

  //These are the things that have changed
  const {entities, factionEntities} = newData;
  const {entityIds, entities: existingEntities, factionEntities: existingFactionEntities} = oldState;

  const updatedState = {
    ...oldState,
    ...newData
  };

  const newEntities = updatedState.entities = {};

  //for all existing entities
  for(let i = 0; i < entityIds.length; i++) {
    const entityId = entityIds[i];
    const existingEntity = existingEntities[entityId];
    const newEntityData = entities[entityId];

    if(newEntityData) {
      if(newEntityData.id) {
        newEntities[entityId] = newEntityData;
      } else {
        //merge
        newEntities[entityId] = {
          ...existingEntity,
          ...newEntityData
        }
      }

      delete entities[entityId]
    } else {
      //this entity has not changed
      newEntities[entityId] = existingEntity;
    }
  }

  let hasNewEntities = false;

  //Add new entities (anything left in entities)
  for(let i = 0, newEntityIds = Object.keys(entities), l = newEntityIds.length; i < l; i++) {
    const entityId = newEntityIds[i];

    newEntities[entityId] = entities[entityId];

    hasNewEntities = true;
  }

  if(hasNewEntities) {
    updatedState.entityIds = Object.keys(newEntities);
  }

  //Faction entities
  if(!isEmpty(factionEntities)) {
    const newFactionEntities = updatedState.factionEntities = {
      ...existingFactionEntities
    };
  
    for(let i = 0, keys = Object.keys(factionEntities), l = keys.length; i < l; ++i) {
      let key = keys[i];
  
      newFactionEntities[key] = factionEntities[key];
    }

    //Rebuild if faction entities change
    //TODO make this smarter, e.g. check types & only rebuild if relevent types change
    updatedState.knownSystems = getKnownSystems(updatedState);
  } else {
    updatedState.factionEntities = existingFactionEntities;
  }

  if(oldState.gameTime !== updatedState.gameTime) {
    calculateSystemBodyPositions(updatedState.entities, updatedState.gameTime, selectedSystemId);
  }
  
  Performance.measure('updatingGame :: merge state', 'updatingGame :: start merge state');

  return updatedState
}


function calculateSystemBodyPositions(entities, time, systemId) {
  const system = entities[systemId];
  const cache = {};

  for(let i = 0; i < system.systemBodyIds.length; i++) {
    const systemBody = entities[system.systemBodyIds[i]];

    systemBody.position = getSystemBodyPosition(systemBody, entities, time, cache);
  }
}