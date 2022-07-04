import { isObject } from 'lodash';

//Helpers
import forEach from 'helpers/object/forEach';
import getSystemBodyPosition from 'helpers/app/getSystemBodyPosition';
import * as utils from './utils';

//Other
import calculatePopulationWorkers from './entityProcessorFactories/colony/calculatePopulationWorkers';



//The class
export default class ServerState {
  
  gameTime = null;
  
  factions;//e.g. The in-game factions Humans, martians (factions are also entities)
  minerals;
  structures;
  research;
  researchAreas;
  technology;
  systemBodyTypeMineralAbundance;

  gameConfig;

  entities = null;
  entityId = null;//used to keep track of assigned entity IDs - increments after each entity is created
  entityIds = null;
  entitiesLastUpdated = null;

  factionEntities = null;
  factionEntitiesLastUpdated = null;

  
  constructor(minerals, structures, researchAreas, research, technology, systemBodyTypeMineralAbundance) {
    this.minerals = minerals;
    this.structures = structures;
    this.researchAreas = researchAreas;
    this.research = research;
    this.technology = technology;
    this.systemBodyTypeMineralAbundance = systemBodyTypeMineralAbundance;

    //Convienience bundling of core config values for easy comms mostly
    this.gameConfig = {
        minerals, structures, researchAreas, research, technology, systemBodyTypeMineralAbundance
    };

    this.factions = {};
    this.entities = {};
    this.entityIds = [];
    this.entitiesLastUpdated = {};
    this.factionEntities = {};
    this.factionEntitiesLastUpdated = {};
  }


  /////////////////////
  // Getters/setters //
  /////////////////////



  ////////////////////
  // public methods //
  ////////////////////


  getEntityById(id, type = null) {
    const entity = this.entities[id] || null;

    if(entity && type && entity.type !== type) {
      return null;
    }

    return entity
  }

  getEntitiesByIds(ids) {
    const entities = this.entities;

    return ids.map(id => (entities[id]));
  }

  createFaction(name) {
    const faction = this._newEntity('faction', {faction: {
      name,
      colonyIds: [],
      research: {},
      technology: {}
    }});

    this.factionEntities[faction.id] = {};
    this.factionEntitiesLastUpdated[faction.id] = {};

    //record factions separately (in addition to being an entity)
    this.factions[faction.id] = faction;

    return faction;
  }

  createSystemBody(systemId, bodyDefinition, movement, availableMinerals) {
    const orbitingId = movement?.orbitingId ?? null;
    const orbitingEntity = orbitingId === null ? null : this.entities[orbitingId];

    const body = this._newEntity('systemBody', {
      systemId,
      mass: {
        value: bodyDefinition.mass || 1
      },
      movement,
      systemBody: {
        type: bodyDefinition.type,
        radius: bodyDefinition.radius,
        day: bodyDefinition.day,
        axialTilt: bodyDefinition.axialTilt,
        tidalLock: !!bodyDefinition.tidalLock,
        albedo: bodyDefinition.albedo || 0,
        luminosity: bodyDefinition.luminosity || 0,
        children: [],
        position: [],
      },
      render: {type: 'systemBody'},
      availableMinerals
    });

    //Add into children array
    if(orbitingEntity) {
      const insertBefore = orbitingEntity.systemBody.children.findIndex((childId) => {
        const child = this.entities[childId];

        //only works with orbits, but system bodies should always use orbits, right?
        return child.movement.radius > movement.radius;
      })

      if(insertBefore === -1) {
        orbitingEntity.systemBody.children.push(body.id);

        utils.setSystemBodyPosition(body.id, this.entities)
      } else {
        orbitingEntity.systemBody.children.splice(insertBefore, null, body.id);

        //update position of siblings after this one, and their children
        orbitingEntity.systemBody.children
          .slice(insertBefore)
          .forEach((systemBodyId) => {
            utils.setSystemBodyPosition(systemBodyId, this.entities);

            this.entitiesLastUpdated[systemBodyId] = this.gameTime;//mark as updated
        })
      }
    }
    
    //register position as 'hidden' getter
    Object.defineProperty(body, "position", {
      enumerable: false,
      get: () => {
        //TODO cache values, clear on gameTime change
        return getSystemBodyPosition(body, this.entities, this.gameTime);
      }
    });

    return body;
  }

  createColony(systemBodyId, factionId, minerals = {}, structures = {}, populationIds = []) {
    const systemBody = this.entities[systemBodyId];
    const faction = this.entities[factionId];

    const colony = this._newEntity('colony', {
      factionId,
      systemId: systemBody.systemId,
      systemBodyId: systemBody.id,
      researchGroupIds: [],//groups performing research
      populationIds,
      colony: {
        structures,
        minerals,
        researchInProgress: {},//progress on research projects on this colony

        buildQueue: [],
        capabilityProductionTotals: {},
        structuresWithCapability: {},
        populationCapabilityProductionTotals: {},
        populationStructuresWithCapability: {},
        populationUnitCapabilityProduction: {},
      }
    });

    //update faction
    faction.faction.colonyIds.push(colony.id);
    this.entitiesLastUpdated[factionId] = this.gameTime;//mark faction as updated

    return colony;
  }

  createResearchGroup(colonyId, structures, projects) {
    const colony = this.getEntityById(colonyId, 'colony');

    if(!colony) {
      throw new Error('cannot create research group, invalid colonyId');
    }

    const researchGroup = this._newEntity('researchGroup', {
      factionId: colony.factionId,
      colonyId: colony.id,


      researchGroup: {
        structures,//describes what this group would like to use - what they get depends on what is available - groups are assigned structures based on order
        projects//array of research projects IDs, to be performed in order
      }
    });

    return researchGroup;
  }

  createPopulation(factionId, colonyId, speciesId, quantity) {
    const colony = this.getEntityById(colonyId, 'colony');


    const entity = this._newEntity('population', {
      factionId,
      speciesId,
      colonyId: colony ? colony.id : null,

      population: {
        quantity,

        supportWorkers: 0,
        effectiveWorkers: 0,
      }
    });

    //Init worker counts
    calculatePopulationWorkers(entity, this.entities);

    // if(colony) {
    //   this.addPopulationToColony(colony.id, entity.id);
    // }

    return entity;
  }

  addPopulationToColony(colonyId, populationId) {
    const colony = this.getEntityById(colonyId, 'colony');
    const population = this.getEntityById(populationId, 'population');

    if(!colony || !population) {
      debugger;//shouldn't happen

      return;
    }

    colony.populationIds.push(population.id);

    population.colonyId = colony.id;

    //mark as updated
    colony.colony.lastUpdateTime = this.gameTime;

    this.entitiesLastUpdated[colonyId] = this.gameTime;//mark faction as updated
    this.entitiesLastUpdated[populationId] = this.gameTime;//mark faction as updated
  }

  addStructuresToColony(colonyId, populationId, structures) {
    const colony = this.getEntityById(colonyId, 'colony');

    if(!colony) {
      return
    }

    populationId = populationId || 0;

    if(!colony.colony.structures[populationId]) {
      colony.colony.structures[populationId] = {}
    }

    colony.colony.lastUpdateTime = this.gameTime;

    const currentStructures = colony.colony.structures[populationId];

    forEach(structures, (quantity, structureId) => {
      if(currentStructures[structureId]) {
        currentStructures[structureId] += quantity;
      } else {
        currentStructures[structureId] = quantity;
      }

      //prevent negative quantities
      currentStructures[structureId] = Math.max(0, currentStructures[structureId]);
    });

    this.entitiesLastUpdated[colonyId] = this.gameTime;//mark as updated
  }


  /////////////////////////////
  // Internal helper methods //
  /////////////////////////////

  _newEntity(type, props) {
    const newEntity = {
      ...props,
      id: this.entityId++,
      type,
    };

    this.entities[newEntity.id] = newEntity;
    this.entityIds.push(newEntity.id);
    this.entitiesLastUpdated[newEntity.id] = this.gameTime;

    //automatically add ref to this entity in linked entities
    //-props to check for links
    const idProps = ['factionId', 'speciesId', 'systemBodyId', 'systemId', 'speciesId', 'colonyId'];
    const skipProps = ['id', 'type'];

    const facets = [];

    const keys = Object.keys(props);

    for(let i = 0; i < keys.length; i++) {
      const prop = keys[i];

      if(prop.endsWith('Id')) {
        if(idProps.includes(prop)) {
          const linkedEntityId = props[prop];
          const linkedEntity = this.entities[linkedEntityId];

          if(linkedEntity) {
            const linkedIdsProp = type+'Ids';

            //if cross reference doesn't exist, add it
            if(!linkedEntity[linkedIdsProp]) {
              linkedEntity[linkedIdsProp] = [];
            }

            //record ref to this entity...
            linkedEntity[linkedIdsProp].push(newEntity.id);
            //...and update last updated time
            this.entitiesLastUpdated[linkedEntity.id] = this.gameTime;
          }
        }
      } else if(prop.endsWith('Ids')) {
        //hmm.. I don't think I need to do anythin
      } else if(newEntity[prop] && !skipProps.includes(prop) && isObject(newEntity[prop])) {
        //is a facet - record last update time in 'hidden' prop
        Object.defineProperty(newEntity[prop], "lastUpdateTime", {
          enumerable: false,
          writable: true,
          value: this.gameTime
        });
        
        facets.push(prop);
      }
    }

    newEntity.facets = facets;

    return newEntity;
  }

  _addFactionEntity(factionId, entityId, props) {
    //record that this factionEntity needs to be supplied to the client for this faction
    this.factionEntitiesLastUpdated[factionId][entityId] = this.gameTime;

    return this.factionEntities[factionId][entityId] = {
      intel: {},//what we believe about what other factions know about this entity
      id: entityId,

      ...props
    };
  }

  _removeEntity(entity) {
    const entityId = typeof(entity) === 'object' ? entity.id : entity;

    if(this.entities[entityId]) {
      this.entityIds.splice(this.entityIds.indexOf(entityId), 1);

      //remove factionEntity(s)
      Object.keys(this.factions).forEach(factionId => {
        if(this.factionEntities[factionId][entityId]) {
          delete this.factionEntities[factionId][entityId];
        }
      });

      //TODO record and report that entity (and factionEntity) no longer exists to clients

      delete this.entities[entityId];
    }
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

// var obj = {
//   name: "Fred"
// };

// Object.defineProperty(obj, "age", {
//   enumerable: false,
//   writable: true
// });

// console.log(JSON.stringify(obj));