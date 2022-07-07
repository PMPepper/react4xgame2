//Helpers
import forEach from 'helpers/object/forEach';

//Utils
import getTechnologyModifiers from 'game/utils/getTechnologyModifiers';
import calculatePopulationWorkers from 'game/utils/calculatePopulationWorkers';

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';


//The factory
export default function populationFactory(lastTime, time, init) {
  const lastDay = Math.floor(lastTime / 86400);
  const today = Math.floor(time / 86400);

  if(lastDay !== today || init) {
    return function population(entity, entities, factionEntities, gameConfig) {
      if(entity.type === 'population') {
        const population = entity;
        const colony = entities[population.colonyId];
        const systemBody = entities[colony.systemBodyId]
        const species = entities[population.speciesId];
        const faction = entities[population.factionId];
        const technologyModifiers = getTechnologyModifiers(faction.faction.technology)

        //Growth
        calculatePopulationGrowth(init, population, colony, systemBody, species)

        //now caclulate worker efficiency, etc
        calculatePopulationProductionCapabilites(population, species, systemBody, colony, technologyModifiers, gameConfig.structures)

        console.log(colony, population);

        return ['population'];
      }

      return false;
    }
  }

  return null
}


function calculatePopulationGrowth(init, population, colony, systemBody, species) {
  //const systemBody = entities[colony.systemBodyId];
  const dayGrowthRate = init ? 1 : species.species.growthRate ** DAY_ANNUAL_FRACTION;

  //TODO affected by environment, colony etc
  //TODO do not grow on colony ships, transports etc

  //update population
  population.population.quantity *= dayGrowthRate;

  //update workers
  calculatePopulationWorkers(population, species, systemBody, colony);
}



function calculateLabourEfficiency(population, totalRequiredWorkforce) {
    return Math.min(1, Math.floor(population.population.effectiveWorkers) / totalRequiredWorkforce);
}

function calculatePopulationProductionCapabilites(population, species, systemBody, colony, factionTechnologyModifiers, structureDefinitions) {
  const populationStructures = colony.colony.structures[population.id];
  const populationProductionCapabilites = {
      structuresWithCapability: {},
      capabilityProductionTotals: {},
      unitCapabilityProduction: {},

      //Modifiers, between 0 and 1
      environmentalMod: 1,//TODO
      stabilityMod: 1,//TODO
      labourEfficiencyMod: 1,
  };

  population.population.productionCapabilities = populationProductionCapabilites;

  if(!populationStructures) {
      return 
  }

  let totalRequiredWorkforce = 0;

  //find total required workforce
  forEach(populationStructures, (quantity, structureId) => {
      const structureDefinition = structureDefinitions[structureId];

      if(!structureDefinition) {
          throw new Error(`Unknown structure: '${structureId}'`);
      }

      //TODO disabled structures, industries, etc

      //record required workforce
      totalRequiredWorkforce += structureDefinition.workers * quantity;
  });

  //calculate labour efficiency
  populationProductionCapabilites.labourEfficiencyMod = calculateLabourEfficiency(population, totalRequiredWorkforce);

  //TODO calculate stability, env. mod, etc

  forEach(populationStructures, (quantity, structureId) => {
      const structureDefinition = structureDefinitions[structureId];

      //TODO disabled structures, industries, etc

      //for every type of thing (capability) this structure can do (e.g. mining, reseach, etc)...
      forEach(structureDefinition.capabilities, (value, capability) => {
          const speciesModifier = species?.species[capability] || 1;
          const technologyModifier = factionTechnologyModifiers[capability] || 1;

          //...calculate how much this set of structures will produce...
          const productionPerUnit = value * technologyModifier * (structureDefinition.workers > 0 ? 
              populationProductionCapabilites.labourEfficiencyMod * populationProductionCapabilites.stabilityMod * populationProductionCapabilites.environmentalMod * speciesModifier
              :
              1
            );
          const totalProduction = productionPerUnit * quantity;

          //...now do the same just for this population....
          if(!(capability in populationProductionCapabilites.structuresWithCapability)) {
              populationProductionCapabilites.capabilityProductionTotals[capability] = 0;
              populationProductionCapabilites.structuresWithCapability[capability] = {};
              populationProductionCapabilites.unitCapabilityProduction[capability] = {};
          }

          populationProductionCapabilites.capabilityProductionTotals[capability] += totalProduction;
          populationProductionCapabilites.structuresWithCapability[capability][structureId] = quantity;
          populationProductionCapabilites.unitCapabilityProduction[capability][structureId] = productionPerUnit;
      });
  });//end foreach structure type
}