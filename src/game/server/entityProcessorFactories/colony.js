import forEach from 'helpers/object/forEach';

import calculatePopulationGrowth from 'game/server/entityProcessorFactories/colony/calculatePopulationGrowth';
import calculatePopulationProductionCapabilites from 'game/server/entityProcessorFactories/colony/calculatePopulationProductionCapabilites';
import calculateTechnologyModifiers from 'game/server/entityProcessorFactories/colony/calculateTechnologyModifiers';

const DAY_ANNUAL_FRACTION = 1/365.25

export default function colonyFactory(lastTime, time, init) {
  const lastDay = Math.floor(lastTime / 86400);
  const today = Math.floor(time / 86400);

  //only update once a day
  if(lastDay !== today || init) {
    return function colony(colony, entities, gameConfig) {
      if(colony.type === 'colony') {
        let i, l, totalPopulation = 0, totalEffectiveWorkers = 0, totalSupportWorkers = 0;

        const faction = entities[colony.factionId];
        const technologyModifiers = calculateTechnologyModifiers(faction.faction.technology)
        const systemBody = entities[colony.systemBodyId];
        const factionSystemBody = entities[colony.factionSystemBodyId];
        const additionalModifiedEntityIDs = [];

        const structureDefinitions = gameConfig.structures;
        const capabilityProductionTotals = {};//the total procution this colony is capable of for each capability (mining, research, etc)
        const structuresWithCapability = {};//total structures for each capability [capability][structureId] = number of structures

        colony.colony.populationCapabilityProductionTotals = {};
        colony.colony.populationStructuresWithCapability = {};

        //for each population, calculate population growth, total number of workers and production output
        for(i = 0, l = colony.populationIds.length; i < l; ++i) {
          let population = entities[colony.populationIds[i]];

          calculatePopulationGrowth(init, population, colony, entities);

          //keep track of totals
          totalPopulation += population.population.quantity;
          totalEffectiveWorkers += population.population.effectiveWorkers;
          totalSupportWorkers += population.population.supportWorkers;

          let populationProductionTotals = calculatePopulationProductionCapabilites(colony, population.id, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability);

          //record population production values
          colony.colony.populationCapabilityProductionTotals[population.id] = populationProductionTotals.capabilityProductionTotals;
          colony.colony.populationStructuresWithCapability[population.id] = populationProductionTotals.structuresWithCapability;
          colony.colony.populationUnitCapabilityProduction[population.id] = populationProductionTotals.unitCapabilityProduction;
        }

        //calculate production for structures that do not have a population (e.g. automated miners)
        const automatedProductionTotals = calculatePopulationProductionCapabilites(colony, 0, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability);

        //record automated production values
        colony.colony.populationCapabilityProductionTotals[0] = automatedProductionTotals.capabilityProductionTotals;
        colony.colony.populationStructuresWithCapability[0] = automatedProductionTotals.structuresWithCapability;
        colony.colony.populationUnitCapabilityProduction[0] = automatedProductionTotals.unitCapabilityProduction;

        //record total workforce
        colony.colony.totalPopulation = Math.floor(totalPopulation);
        colony.colony.totalEffectiveWorkers = Math.floor(totalEffectiveWorkers);
        colony.colony.totalSupportWorkers = Math.floor(totalSupportWorkers);

        //record total production
        colony.colony.capabilityProductionTotals = capabilityProductionTotals;
        colony.colony.structuresWithCapability = structuresWithCapability;

        //mining
        if(capabilityProductionTotals.mining && factionSystemBody.factionSystemBody.isSurveyed) {
          //can mine
          //-how much you can mine per year
          const miningProduction = capabilityProductionTotals.mining;//calculateProduction('mining', capabilityProductionTotals.mining, technologyModifiers.miningMod, gameConfig);//totalStructureCapabilities.mining * labourEfficiency * technologyModifiers.miningMod * 1;//TODO include species mining rate here + any other adjustments (morale etc)

          forEach(gameConfig.minerals, (mineralName, mineralId) => {
            const systemBodyMinerals = systemBody.availableMinerals[mineralId];
            let dailyProduction = miningProduction * systemBodyMinerals.access * DAY_ANNUAL_FRACTION;

            if(dailyProduction > systemBodyMinerals.quantity) {
              dailyProduction = systemBodyMinerals.quantity
            }

            colony.colony.minerals[mineralId] = colony.colony.minerals[mineralId] + dailyProduction;

            systemBody.availableMinerals[mineralId].quantity -= dailyProduction;

            additionalModifiedEntityIDs.push(systemBody.id);
          })
        }

        //Research
        if(capabilityProductionTotals.research) {

        }
        //const researchProduction = capabilityProductionTotals.research;


        return additionalModifiedEntityIDs;
      }

      return false;
    }
  }

  return null
}
