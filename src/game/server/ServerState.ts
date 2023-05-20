
//Helpers
import forEach from 'helpers/object/forEach';
import getSystemBodyPosition from 'helpers/app/getSystemBodyPosition';
import * as utils from './utils';

import calculatePopulationWorkers from 'game/utils/calculatePopulationWorkers';
import { AvailableMinerals, ClientState, FactionEntity } from 'types/game/shared/game';
import { AllEntityTypes, Entity, EntityFaction, EntitySystemBody, EntityTypes } from 'types/game/shared/entities';
import { isEntityOfType } from 'types/game/server/entities';
import { ConstructionProjectDefinition, ResearchDefinition, StructureDefinition, SystemBodyDefinition, SystemBodyTypes, TechnologyDefinition } from 'types/game/shared/definitions';
import { FacetColony, FacetMovement, FacetResearchGroup, Facets, isFacetType } from 'types/game/shared/facets';
import { ENTITY_TYPES } from 'game/Consts';
import { MapOmit } from 'types/utils';
import { IMovementOrbit, isFacetMovementOrbit, isOrbitType } from 'types/game/shared/movement';

//Consts
const entityIdProps = new Set(ENTITY_TYPES.map(entityType => `${entityType}Id`));


//The class
export default class ServerState {
  
  gameTime: number;

  clients: Record<number, ClientState>;
  
  factions: Record<number, EntityFaction<true>>;//e.g. The in-game factions Humans, martians (factions are also entities)
  minerals: string[];
  structures: Record<string, StructureDefinition>;
  constructionProjects: Record<string, ConstructionProjectDefinition>;
  researchAreas: string[];
  research: Record<string, ResearchDefinition>;
  technology: Record<string, TechnologyDefinition>;
  systemBodyTypeMineralAbundance: Record<SystemBodyTypes, Record<number, number>>;
    
  gameConfig: {
    minerals: string[], 
    structures: Record<string, StructureDefinition>, 
    constructionProjects: Record<string, ConstructionProjectDefinition>, 
    researchAreas: string[], 
    research: Record<string, ResearchDefinition>, 
    technology: Record<string, TechnologyDefinition>, 
    systemBodyTypeMineralAbundance: Record<SystemBodyTypes, Record<number, number>>
  };

  entities: Record<number, Entity>;
  entityId: number = 1;//used to keep track of assigned entity IDs - increments after each entity is created
  entityIds: number[];
  entitiesByType: Partial<Record<EntityTypes, number[]>>;
  entitiesLastUpdated: Record<number, number>;

  factionEntities: Record<number, Record<number, FactionEntity>>;
  factionEntitiesLastUpdated: Record<number, Record<number, number>>;

  
  constructor(minerals: string[], structures: Record<string, StructureDefinition>, constructionProjects: Record<string, ConstructionProjectDefinition>, researchAreas: string[], research: Record<string, ResearchDefinition>, technology: Record<string, TechnologyDefinition>, systemBodyTypeMineralAbundance: Record<SystemBodyTypes, Record<number, number>>) {
    this.minerals = minerals;
    this.structures = structures;
    this.constructionProjects = constructionProjects;
    this.researchAreas = researchAreas;
    this.research = research;
    this.technology = technology;
    this.systemBodyTypeMineralAbundance = systemBodyTypeMineralAbundance;

    //Convienience bundling of core config values for easy comms mostly
    this.gameConfig = {
        minerals, structures, constructionProjects, researchAreas, research, technology, systemBodyTypeMineralAbundance
    };

    this.factions = {};
    this.entities = {};
    this.entityIds = [];
    this.entitiesByType = {};
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
  nextId() {
    return this.entityId++;
  }

  getEntityById(id: number): Entity | null;
  getEntityById<T extends EntityTypes>(id: number, type: T): AllEntityTypes<true>[T] | null;
  getEntityById<T extends EntityTypes | undefined>(id: number, type?: T) {
    const entity = this.entities[id];

    if(type) {
      return isEntityOfType(entity, type) ? entity : null;
    }

    return entity ?? null;
  }

  getEntitiesByIds(ids: number[]):(Entity|undefined)[] {
    const entities = this.entities;

    return ids.map(id => (entities[id]));
  }

  createFaction(name: string) {
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

  createSystemBody(systemId: number, bodyDefinition: SystemBodyDefinition, movement?: FacetMovement<true>, availableMinerals?: AvailableMinerals) {
    

    const body = this._newEntity('systemBody', {
      systemId,
      mass: {
        value: bodyDefinition.mass || 1
      },
      movement,
      position: null,
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

    let orbitingEntity: EntitySystemBody<true> | undefined;

    if(movement) {
      if(!isFacetMovementOrbit(movement)) {
        throw new Error('System bodies only support orbit movement types');
      }

      orbitingEntity = this.getEntityById(movement.orbitingId, 'systemBody');

      //Add into children array
      if(orbitingEntity) {
        const insertBefore = orbitingEntity.systemBody.children.findIndex((childId) => {
          const child = this.getEntityById(childId, 'systemBody');

          //Where in the order of sibling system bodies does this entity live?
          return utils.isOrbitLargerThan(child.movement as IMovementOrbit<true>, movement);
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

              this.modifiedEntity(systemBodyId, 'systemBody');
          })
        }
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

  createColony(systemBodyId: number, factionId: number, minerals: FacetColony<true>["minerals"] = {}, structures: FacetColony<true>["structures"] = {}, populationIds: number[] = []) {
    const systemBody = this.getEntityById(systemBodyId, 'systemBody');
    const faction = this.getEntityById(factionId, 'faction');

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
        buildInProgress: {},
        capabilityProductionTotals: {research: 0, mining: 0, construction: 0},
        structuresWithCapability: {research: {}, mining: {}, construction: {}},
      }
    });

    faction.faction.colonyIds.push(colony.id);

    //update faction
    this.modifiedEntity(factionId, 'faction');
    
    return colony;
  }

  createResearchGroup(colonyId: number, structures: FacetResearchGroup<true>['structures'], projects: FacetResearchGroup<true>['projects']) {
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

  createPopulation(factionId: number, colonyId: number, speciesId: number, quantity: number) {
    const colony = this.getEntityById(colonyId, 'colony');


    const entity = this._newEntity('population', {
      factionId,
      speciesId,
      colonyId: colony ? colony.id : null,

      population: {
        quantity,
        supportWorkers: 0,
        effectiveWorkers: 0,
        structuresWithCapability: {mining: {}, construction: {}, research: {}},
        capabilityProductionTotals: {mining: 0, construction: 0, research: 0},
        unitCapabilityProduction: {mining: {}, construction: {}, research: {}},

        //population specific modifiers, between 0 and 1
        environmentalMod: 1,
        stabilityMod: 1,
        labourEfficiencyMod: 1
      }
    });

    //Init worker counts
    calculatePopulationWorkers(entity, this.getEntityById(speciesId, 'species'), colony ? this.getEntityById(colony.systemBodyId, 'systemBody') : null, colony);

    return entity;
  }

  addPopulationToColony(colonyId: number, populationId: number) {//is this used? No, but might get used later
    debugger;
    const colony = this.getEntityById(colonyId, 'colony');
    const population = this.getEntityById(populationId, 'population');

    if(!colony || !population) {
      debugger;//shouldn't happen

      return;
    }

    //TODO init colony/populations?
    colony.populationIds.push(population.id);
    population.colonyId = colony.id;

    //mark as updated
    this.modifiedEntity(colonyId);
    this.modifiedEntity(populationId);
  }

  addStructuresToColony(colonyId: number, populationId: number, structures) {//TODO type structures
    const colony = this.getEntityById(colonyId, 'colony');

    if(!colony) {
      return
    }

    populationId = populationId || 0;

    if(!colony.colony.structures[populationId]) {
      colony.colony.structures[populationId] = {}
    }

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

    this.modifiedEntity(colonyId, 'colony');
  }

  modifiedEntity(entityId: number, ...facets: Facets[]) {
    if(facets?.length > 0) {
      const entity = this.getEntityById(entityId);

      for(let i = 0; i < facets.length; i++) {
        entity[facets[i]].lastUpdateTime = this.gameTime;
      }
    }
    
    this.entitiesLastUpdated[entityId] = this.gameTime;//mark as updated
  }


  /////////////////////////////
  // Internal helper methods //
  /////////////////////////////

  _newEntity<T extends EntityTypes>(
    type: T, 
    props: EntityProps<T>
  ): AllEntityTypes<true>[T] {
    const facets = [];

    const newEntity = {
      ...props,
      id: this.nextId(),
      type,
      facets,
    };

    this.entities[newEntity.id] = newEntity;
    this.entityIds.push(newEntity.id);
    this.modifiedEntity(newEntity.id);

    !this.entitiesByType[type] && (this.entitiesByType[type] = [])

    this.entitiesByType[type].push(newEntity.id);

    //automatically add ref to this entity in linked entities
    const keys = Object.keys(props);

    for(let i = 0; i < keys.length; i++) {
      const prop = keys[i];

      if(entityIdProps.has(prop)) {
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
          this.modifiedEntity(linkedEntity.id);
        }
      } else if(prop.endsWith('Ids')) {
        //hmm.. I don't think I need to do anythin
      //} else if(newEntity[prop] && !skipProps.includes(prop) && isObject(newEntity[prop])) {
      } else if(newEntity[prop] && isFacetType(prop)) {
        //is a facet - record last update time in 'hidden' prop of the facet
        Object.defineProperty(newEntity[prop], "lastUpdateTime", {
          enumerable: false,
          writable: true,
          value: this.gameTime
        });
        
        facets.push(prop);
      }
    }

    return newEntity as unknown as AllEntityTypes<true>[T];
  }

  _addFactionEntity(factionId: number, entityId: number, props) {//TODO props
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
    entity = this.entities[entityId];

    if(entity) {
      this.entityIds.splice(this.entityIds.indexOf(entityId), 1);
      this.entitiesByType[entity.type].splice(this.entitiesByType[entity.type].indexOf(entityId), 1);

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

  _getClientsForFaction(factionId: number, roles = null) {//TODO type roles
    return Object.values(this.clients).reduce<number[]>((output, client) => {
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

// type EntityPropsX<T extends EntityTypes> = Omit<AllEntityTypes<true>[T], 'type' | 'id' | 'facets' | `${EntityTypes}Ids`> & Partial<Pick<AllEntityTypes<true>[T], Extract<keyof AllEntityTypes<true>[T], `${EntityTypes}Ids`>>>

type EntityProps<T extends EntityTypes> = 
  Omit<
    AllEntityTypes<true>[T], 
    'type' | 'id' | 'facets' | `${EntityTypes}Ids` | Facets
  >
  &
  //extract the facets & remove the lastUpdateTime prop
  MapOmit<
    Pick<
      AllEntityTypes<true>[T], 
      Extract<
        keyof AllEntityTypes<true>[T], Facets
      >
    >,
    'lastUpdateTime'
  >
  
  &
  //Add entity links (xxxIds) as optional props
  Partial<
    Pick<
      AllEntityTypes<true>[T], 
      Extract<
        keyof AllEntityTypes<true>[T], 
        `${EntityTypes}Ids`
      >
    >
  >;
