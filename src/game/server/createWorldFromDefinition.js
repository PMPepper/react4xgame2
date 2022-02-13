
//Classes
import ServerState from './ServerState';

//Helpers
import orbitPeriod from 'helpers/physics/orbit-period';
import map from 'helpers/object/map';

//Data
import defaultGameDefinition from '../data/defaultGameDefinition';


//The function
export default function createWorldFromDefinition(definition) {
  //merge in the default game definition
  definition = {...defaultGameDefinition, ...definition};

  //Basic props
  const state = new ServerState(
    {...definition.minerals},
    JSON.parse(JSON.stringify(definition.structures)),
    JSON.parse(JSON.stringify(definition.structures)),
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
    const system = state._newEntity('system', {});

    //update lookup hashes (used later)
    systemsByDefinitionId[systemDefinitionId] = system;
    systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[systemDefinitionId] = {};

    const systemBodiesBySystemBodyDefinitionName = systemBodiesBySystemDefinitionIdBySystemBodyDefinitionName[systemDefinitionId];

    const bodyChildren = new Map();

    //now create the bodies
    const bodies = systemDefinition.bodies.map(bodyDefinition => {
      const bodyMass = bodyDefinition.mass || 1;
      const orbitingId = bodyDefinition.parent && systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent] && (systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent].id || null);

      const body = state._newEntity('systemBody', {
        systemId: system.id,
        mass: {
          value: bodyMass
        },
        movement: getMovementFromOrbitDefinition(bodyDefinition.orbit, bodyMass, orbitingId, orbitingId ? systemBodiesBySystemBodyDefinitionName[bodyDefinition.parent].mass.value : 0),
        position: {x: 0, y: 0},
        systemBody: {
          type: bodyDefinition.type,
          radius: bodyDefinition.radius,
          day: bodyDefinition.day,
          axialTilt: bodyDefinition.axialTilt,
          tidalLock: !!bodyDefinition.tidalLock,
          albedo: bodyDefinition.albedo || 0,
          luminosity: bodyDefinition.luminosity || 0,
          children: [],
          position: null,
        },
        render: {type: 'systemBody'},
        availableMinerals: generateAvailableMinerals(bodyDefinition, definition)
      });

      if(orbitingId) {
        const orbitingEntity = state.entities[orbitingId];

        //record what entities are children of other entities (orbiting them)
        if(!bodyChildren.has(orbitingEntity)) {
          bodyChildren.set(orbitingEntity, [])
        }

        bodyChildren.get(orbitingEntity).push(body);

        //orbitingEntity.systemBody.children.push(body.id);

        body.systemBody.position = [...orbitingEntity.systemBody.position, orbitingEntity.systemBody.children.length];
      } else {
        body.systemBody.position = [];
      }

      //record in lookup hash (used later for factions)
      if(systemBodiesBySystemBodyDefinitionName[bodyDefinition.name]) {
        debugger;
      }
      systemBodiesBySystemBodyDefinitionName[bodyDefinition.name] = body;

      return body;
    });

    //now sort out orbit order
    bodyChildren.forEach((orbiters, orbited) => {
      orbiters.sort((a, b) => (a?.orbit?.radius ?? 0) - (b?.orbit?.radius ?? 0))

      orbiters.forEach(({id}) => {
        orbited.systemBody.children.push(id)
      })
    });

    //update system with body ids
    system.systemBodyIds = bodies.map(body => body.id);
  });

  //Create the species
  Object.keys(definition.species).forEach(id => {
    const speciesDefinition = definition.species[id];

    const entity = state._newEntity('species', {species: {...definition.baseSpecies, ...speciesDefinition}});

    speciesByDefinitionId[id] = entity;
  })

  //create the factions
  definition.factions.forEach(factionDefinition => {
    const faction = state.createFaction(factionDefinition.name, factionDefinition.startingResearch);

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
        {quantity: 0, access: 0}
        :
        {quantity, access};
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