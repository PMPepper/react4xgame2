
//Classes
import ServerState from './ServerState';

//Helpers
import orbitPeriod from 'helpers/physics/orbit-period';
import map from 'helpers/object/map';
import forEach from 'helpers/object/forEach';

//Data
import defaultGameDefinition from '../data/defaultGameDefinition';
import { GameDefinition, GameDefinitionOptions, SpeciesDefinition } from 'types/game/shared/definitions';
import { WritableDeep } from 'type-fest';
import fastSimpleClone from 'helpers/app/fastSimpleClone';


//The function
export default function createWorldFromDefinition(userDefinition: GameDefinitionOptions): ServerState {
  //merge in the default game definition
  const {baseSpecies: baseSpeciesDefinition, ...gameDefinitionDefaults} = defaultGameDefinition as WritableDeep<typeof defaultGameDefinition>;
  const {species: userSpeciesDefinitions} = userDefinition;

  const species = map(userSpeciesDefinitions, (userSpeciesDefinition) => ({
    ...baseSpeciesDefinition, ...userSpeciesDefinition
  } as SpeciesDefinition))

  const definition: WritableDeep<GameDefinition> = {...gameDefinitionDefaults, ...userDefinition, species};
  const constructionProjects = fastSimpleClone(definition.constructionProjects);

  //now add constuction project for each type of structure
  forEach(definition.structures, (structure, id) => {
    constructionProjects[`struct-${id}`] = {
      name: structure.name,
      bp: structure.bp,
      minerals: structure.minerals,
      producedStructures: {
        [id]: 1
      },
      requireTechnologyIds: structure.requireTechnologyIds || [],
    }
  })

  //Basic props
  const state = new ServerState(
    {...definition.minerals},
    JSON.parse(JSON.stringify(definition.structures)),
    constructionProjects,
    {...definition.researchAreas},
    JSON.parse(JSON.stringify(definition.research)),
    JSON.parse(JSON.stringify(definition.technology)),
    JSON.parse(JSON.stringify(definition.systemBodyTypeMineralAbundance))
  );

  //internal lookup hashes
  const systemsByDefinitionId = {};//[systemDefinitionId] = system entity
  const speciesByDefinitionId = {};//[systemDefinitionId] = system entity
  const systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName = {};//[systemDefinitionId][systemBodyDefinitionName] = systemBody entity
  const factionsByDefinitionName = {};

  //create the systems
  Object.keys(definition.systems).forEach(systemDefinitionId => {
    const systemDefinition = definition.systems[systemDefinitionId];

    //create system entity
    const system = state.createSystem();

    //update lookup hashes (used later)
    systemsByDefinitionId[systemDefinitionId] = system;
    systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[systemDefinitionId] = {};

    const systemBodiesBySystemBodyDefinitionName = systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[systemDefinitionId];

    const bodyChildren = new Map();

    //now create the bodies
    //TODO sort by orbit order
    const bodies = systemDefinition.bodies.map(bodyDefinition => {
      const bodyMass = bodyDefinition.mass || 1;
      const orbitingId = bodyDefinition.parent && systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent] && (systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent].id || null);

      const body = state.createSystemBody(
        system.id, 
        bodyDefinition, 
        getMovementFromOrbitDefinition(bodyDefinition.orbit, bodyMass, orbitingId, orbitingId ? systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent].mass.value : 0), 
        generateAvailableMinerals(bodyDefinition, definition)
      );

      if(orbitingId) {
        const orbitingEntity = state.entities[orbitingId];

        //record what entities are children of other entities (orbiting them)
        if(!bodyChildren.has(orbitingEntity)) {
          bodyChildren.set(orbitingEntity, [])
        }

        bodyChildren.get(orbitingEntity).push(body);
      }

      //record in lookup hash (used later for factions)
      if(systemBodiesBySystemBodyDefinitionName[bodyDefinition.name]) {
        debugger;
      }
      systemBodiesBySystemBodyDefinitionName[bodyDefinition.name] = body;

      system.systemBodyIds.push(body.id);

      return body;
    });
  });

  //Create the species
  Object.keys(definition.species).forEach(id => {
    const entity = state._newEntity('species', {species: definition.species[id]});

    speciesByDefinitionId[id] = entity;
  })

  //create the factions
  definition.factions.forEach(factionDefinition => {
    const faction = state.createFaction(factionDefinition.name, factionDefinition.startingResearch as unknown as string[]);

    factionsByDefinitionName[factionDefinition.name] = faction;

    //assign initial research and technology
    factionDefinition.startingResearch.forEach(researchId => {
      const research = definition.research[researchId];

      faction.faction.research[researchId] = true;//mark this technology as unlocked

      //now mark technologies as unlocked
      research.unlockTechnologyIds.forEach(technologyId => {
        if(!definition.technology[technologyId]) {
          throw new Error(`Unknown technology '${technologyId}'`);
        }

        faction.faction.technology[technologyId] = true;
      })
    })

    const factionSystemBodyBySystemBodyId = {};

    //TODO link faction to species

    //Now link factions to systems
    Object.keys(factionDefinition.startingSystems).forEach(systemDefinitionId => {
      const systemDefinition = definition.systems[systemDefinitionId];
      const factionStartingSystemDefinition = factionDefinition.startingSystems[systemDefinitionId];
      const system = systemsByDefinitionId[systemDefinitionId];
      const systemBodiesBySystemBodyDefinitionName = systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[systemDefinitionId];

      if(!system) {
        throw new Error(`Unknown system '${systemDefinitionId}' in startingSystems for faction '${factionDefinition.name}'`);
      }

      switch(factionStartingSystemDefinition.type) {
        case 'known':
          state._addFactionEntity(
            faction.id, 
            system.id, 
            {
              name: factionStartingSystemDefinition.name || systemDefinitionId
            }
          );

          systemDefinition.bodies.forEach(bodyDefinition => {
            const factionSystemBody = state._addFactionEntity(
              faction.id, 
              systemBodiesBySystemBodyDefinitionName[bodyDefinition.name].id, 
              {
                name: factionStartingSystemDefinition.bodyNamesMap?.[bodyDefinition.name] || bodyDefinition.name,
                isSurveyed: false
              }
            );

            factionSystemBodyBySystemBodyId[factionSystemBody.id] = factionSystemBody;
          });

          break;
        default:
          throw new Error('Unknown value for factionStartingSystemDefinition.type');
      }
    });

    const factionSpeciesIds = new Map();

    //now add starting colonies
    factionDefinition.startingColonies.forEach(startingColonyDefinition => {
      const systemBody = systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[startingColonyDefinition.system][startingColonyDefinition.body];

      //Create the colony
      const colony = state.createColony(systemBody.id, faction.id, map(definition.minerals, () => (0)));//, structures, populationIds.filter(id => (id !== null))

      //Create the populations
      startingColonyDefinition.populations.forEach(populationDefinition => {
        let populationId = 0;

        if(populationDefinition.species) {
          const species = speciesByDefinitionId[populationDefinition.species];

          const entity = state.createPopulation(faction.id, colony.id, species.id, populationDefinition.population);

          populationId = entity.id;

          factionSpeciesIds.set(species.id, species.species.name);
        }

        if(populationDefinition.structures) {//assign structures to colony
          state.addStructuresToColony(colony.id, populationId, {...populationDefinition.structures});
        }
      });


      //mark system body as surveyed
      if(startingColonyDefinition.isSurveyed) {
        factionSystemBodyBySystemBodyId[systemBody.id].isSurveyed = true;
      }
    });

    //now link species to faction
    factionSpeciesIds.forEach((name, speciesId) => {
      state._addFactionEntity(
        faction.id, 
        speciesId, 
        {
          name
        }
      );
    })
  })

  return state;
}

function generateAvailableMinerals(bodyDefinition, definition) {
  if(bodyDefinition.type === 'star') {
    return null;
  }

  const isStartingWorld = false;//TODO detect starting worlds

  if(isStartingWorld) {
    //TODO implement starting world minerals
    return null;
  } else {
    return map(definition.minerals, (value, id) => {
      //TODO do all this better..
      const abundance = definition.systemBodyTypeMineralAbundance[bodyDefinition.type][id];

      const quantity = Math.floor(Math.random() * abundance * Math.pow(bodyDefinition.mass, 1/5));
      const access = Math.ceil(Math.random() * 10) / 10//TODO smaller bodies tend towards higher access

      return quantity === 0 || access === 0 ?
        {quantity: 0, initialQuantity: 0, access: 0, initialAccess: 0}
        :
        {quantity, initialQuantity: quantity, access, initialAccess: access};
    });
  }
}



function getMovementFromOrbitDefinition(definition, bodyMass, orbitingId, orbitingMass) {
  if(!definition) {
    return null;
  }

  if(definition.type === 'regular') {
    return {
      ...definition,
      type: 'orbitRegular',
      orbitingId,
      period: orbitPeriod(definition.radius, bodyMass, orbitingMass)//orbitRadius, orbitingBodyMass, orbitedBodyMass
    }
  } else if(definition.type === 'elliptical') {
    return {
      ...definition,
      type: 'orbitElliptical',
      orbitingId,
    }
  }
}