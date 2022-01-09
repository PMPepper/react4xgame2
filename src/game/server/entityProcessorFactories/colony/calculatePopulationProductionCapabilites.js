import forEach from 'helpers/object/forEach';

import calculateLabourEfficiency from './calculateLabourEfficiency';

export default function calculatePopulationProductionCapabilites(colony, populationId, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability) {
  const populationStructures = colony.colony.structures[populationId];
  const populationProductionCapabilites = {
    structuresWithCapability: {},
    capabilityProductionTotals: {},
    unitCapabilityProduction: {}
  };

  if(populationStructures) {
    //let population = null;
    let species = null;
    let labourEfficiency = 0;
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
    if(populationId !== 0) {
      const population = entities[populationId];
      species = entities[population.speciesId];

      if(population.colonyId !== colony.id) {
        throw new Error('population not in colony');
      }

      labourEfficiency = calculateLabourEfficiency(colony, species, population.population.effectiveWorkers, totalRequiredWorkforce, entities);
    }


    forEach(populationStructures, (quantity, structureId) => {
      const structureDefinition = structureDefinitions[structureId];

      //TODO disabled structures, industries, etc

      //for every type of thing (capability) this structure can do (e.g. mining, reseach, etc)...
      forEach(structureDefinition.capabilities, (value, capability) => {
        const speciesModifier = species?.species[capability] || 1;
        const technologyModifier = technologyModifiers[capability] || 1;

        //...boilerplate to create objects to store the values in...
        if(!(capability in capabilityProductionTotals)) {
          capabilityProductionTotals[capability] = 0;
          structuresWithCapability[capability] = {};
        }

        //...calculate how much this set of structures will produce...
        const productionPerUnit = value * technologyModifier * (structureDefinition.workers > 0 ? labourEfficiency * speciesModifier : 1);
        const totalProduction = productionPerUnit * quantity;

        //...record the total for the colony of this action (e.g. total amount of mining we can perform, etc)...
        capabilityProductionTotals[capability] += totalProduction;

        //...AND record the quantities of structures that can perform this action (e.g. mining can be performed by 3 basic mines, 14 PE mines)
        structuresWithCapability[capability][structureId] = quantity;


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

  return populationProductionCapabilites;
}
