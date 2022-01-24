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
    return function colony(entity, entities, factionEntities, gameConfig) {
      if(entity.type === 'colony') {
        let i, l, totalPopulation = 0, totalEffectiveWorkers = 0, totalSupportWorkers = 0;

        const colonyFacet = entity.colony;
        const faction = entities[entity.factionId];
        const technologyModifiers = calculateTechnologyModifiers(faction.faction.technology)
        const systemBody = entities[entity.systemBodyId];
        const factionSystemBody = factionEntities[entity.factionId][entity.systemBodyId];
        const additionalModifiedEntityIDs = [];

        const structureDefinitions = gameConfig.structures;
        const capabilityProductionTotals = {};//the total procution this colony is capable of for each capability (mining, research, etc)
        const structuresWithCapability = {};//total structures for each capability [capability][structureId] = number of structures

        colonyFacet.populationCapabilityProductionTotals = {};
        colonyFacet.populationStructuresWithCapability = {};

        //for each population, calculate population growth, total number of workers and production output
        for(i = 0, l = entity.populationIds.length; i < l; ++i) {
          let population = entities[entity.populationIds[i]];

          calculatePopulationGrowth(init, population, entity, entities);

          //keep track of totals
          totalPopulation += population.population.quantity;
          totalEffectiveWorkers += population.population.effectiveWorkers;
          totalSupportWorkers += population.population.supportWorkers;

          let populationProductionTotals = calculatePopulationProductionCapabilites(entity, population.id, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability);

          //record population production values
          colonyFacet.populationCapabilityProductionTotals[population.id] = populationProductionTotals.capabilityProductionTotals;
          colonyFacet.populationStructuresWithCapability[population.id] = populationProductionTotals.structuresWithCapability;
          colonyFacet.populationUnitCapabilityProduction[population.id] = populationProductionTotals.unitCapabilityProduction;
        }

        //calculate production for structures that do not have a population (e.g. automated miners)
        const automatedProductionTotals = calculatePopulationProductionCapabilites(entity, 0, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability);

        //record automated production values
        colonyFacet.populationCapabilityProductionTotals[0] = automatedProductionTotals.capabilityProductionTotals;
        colonyFacet.populationStructuresWithCapability[0] = automatedProductionTotals.structuresWithCapability;
        colonyFacet.populationUnitCapabilityProduction[0] = automatedProductionTotals.unitCapabilityProduction;

        //record total workforce
        colonyFacet.totalPopulation = Math.floor(totalPopulation);
        colonyFacet.totalEffectiveWorkers = Math.floor(totalEffectiveWorkers);
        colonyFacet.totalSupportWorkers = Math.floor(totalSupportWorkers);

        //record total production
        colonyFacet.capabilityProductionTotals = capabilityProductionTotals;
        colonyFacet.structuresWithCapability = structuresWithCapability;

        //mining
        if(capabilityProductionTotals.mining && factionSystemBody.isSurveyed) {
          //can mine
          //-how much you can mine per year
          const miningProduction = capabilityProductionTotals.mining;//calculateProduction('mining', capabilityProductionTotals.mining, technologyModifiers.miningMod, gameConfig);//totalStructureCapabilities.mining * labourEfficiency * technologyModifiers.miningMod * 1;//TODO include species mining rate here + any other adjustments (morale etc)

          forEach(gameConfig.minerals, (mineralName, mineralId) => {
            const systemBodyMinerals = systemBody.availableMinerals[mineralId];
            let dailyProduction = miningProduction * systemBodyMinerals.access * DAY_ANNUAL_FRACTION;

            if(dailyProduction > systemBodyMinerals.quantity) {
              dailyProduction = systemBodyMinerals.quantity
            }

            colonyFacet.minerals[mineralId] = colonyFacet.minerals[mineralId] + dailyProduction;

            //TODO this will have to change to allow splitting update across threads
            systemBody.availableMinerals[mineralId].quantity -= dailyProduction;

            additionalModifiedEntityIDs.push(systemBody.id);
          })
        }

        //Research
        if(capabilityProductionTotals.research) {
          //TODO
        }

        colonyFacet.lastUpdateTime = time;

console.log(colonyFacet, additionalModifiedEntityIDs);
        return additionalModifiedEntityIDs;
      }

      return false;
    }
  }

  return null
}
