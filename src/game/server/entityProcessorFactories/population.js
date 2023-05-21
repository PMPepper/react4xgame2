//Helpers
import forEach from 'helpers/object/forEach';

//Utils
import getTechnologyModifiers from 'game/utils/getTechnologyModifiers';
import calculatePopulationWorkers from 'game/utils/calculatePopulationWorkers';

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';


//he processor
export default {
  type: 'population',
  frequency: 'day',
  init: true,
  processor(population, entities, factionEntities, gameConfig, init) {
    const colony = entities[population.colonyId];
    const systemBody = entities[colony.systemBodyId]
    const species = entities[population.speciesId];
    const faction = entities[population.factionId];
    const technologyModifiers = getTechnologyModifiers(faction.faction.technology)

    //Growth
    calculatePopulationGrowth(init, population, colony, systemBody, species)

    //now caclulate worker efficiency, etc
    calculatePopulationProductionCapabilites(population, species, systemBody, colony, technologyModifiers, gameConfig.structures)

    //console.log('population: ', init, colony, population);

    return ['population'];
  }
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
  const populationFacet = population.population;
  const populationStructures = colony.colony.structures[population.id];
  
  populationFacet.structuresWithCapability = {};
  populationFacet.capabilityProductionTotals = {};
  populationFacet.unitCapabilityProduction = {};

  //population specific modifiers, between 0 and 1
  populationFacet.environmentalMod = 1;//TODO
  populationFacet.stabilityMod = 1;//TODO
  populationFacet.labourEfficiencyMod = 1;

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
      totalRequiredWorkforce += structureDefinition.workers * quantity * species.species.workerMod;
  });

  //calculate labour efficiency
  populationFacet.labourEfficiencyMod = calculateLabourEfficiency(population, totalRequiredWorkforce);

  //TODO calculate stability, env. mod, etc

  forEach(populationStructures, (quantity, structureId) => {
      const structureDefinition = structureDefinitions[structureId];

      //TODO disabled structures, industries, etc

      //for every type of thing (capability) this structure can do (e.g. mining, reseach, etc)...
      forEach(structureDefinition.capabilities, (value, capability) => {
          const speciesModifier = species?.species[`${capability}Rate`] || 1;
          const technologyModifier = factionTechnologyModifiers[capability] || 1;

          //...calculate how much this set of structures will produce
          const productionPerUnit = value * technologyModifier * (structureDefinition.workers > 0 ? 
              populationFacet.labourEfficiencyMod * populationFacet.stabilityMod * populationFacet.environmentalMod * speciesModifier
              :
              1
            );
          const totalProduction = productionPerUnit * quantity;
          
          if(!(capability in populationFacet.structuresWithCapability)) {
              populationFacet.capabilityProductionTotals[capability] = 0;
              populationFacet.structuresWithCapability[capability] = {};
              populationFacet.unitCapabilityProduction[capability] = {};
          }

          populationFacet.capabilityProductionTotals[capability] += totalProduction;
          populationFacet.structuresWithCapability[capability][structureId] = quantity;
          populationFacet.unitCapabilityProduction[capability][structureId] = productionPerUnit;
      });
  });//end foreach structure type
}