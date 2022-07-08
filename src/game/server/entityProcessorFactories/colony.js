//Helpers
import forEach from 'helpers/object/forEach';

//Utils
//import getTechnologyModifiers from 'game/utils/getTechnologyModifiers';
import getEntitiesByIds from 'game/utils/getEntitiesByIds';

//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';


//The factory
export default function colonyFactory(lastTime, time, init) {
  const lastDay = Math.floor(lastTime / 86400);
  const today = Math.floor(time / 86400);

  //only update once a day
  if(lastDay !== today || init) {
    return function colony(entity, entities, factionEntities, gameConfig) {
      if(entity.type === 'colony') {
        let i, l, totalPopulation = 0, totalEffectiveWorkers = 0, totalSupportWorkers = 0;
        const colony = entity;
        const colonyFacet = colony.colony;
        const populations = getEntitiesByIds(colony.populationIds, entities);
        const systemBody = entities[colony.systemBodyId];
        const factionSystemBody = factionEntities[colony.factionId][colony.systemBodyId];

        //Reset values
        colonyFacet.capabilityProductionTotals = {};
        colonyFacet.structuresWithCapability = {};
        
        //Combine population values
        populations.forEach((population) => {
          totalPopulation += Math.floor(population.population.quantity);
          totalEffectiveWorkers += Math.floor(population.population.effectiveWorkers);
          totalSupportWorkers += Math.floor(population.population.supportWorkers);

          addPopulationProductionToColony(population, colony)
        });

        //TODO automated structures
        // const structureDefinitions = gameConfig.structures;
        // const technologyModifiers = getTechnologyModifiers(entities[colony.factionId.faction.technology)
        // //calculate production for structures that do not have a population (e.g. automated miners)
        // const automatedProductionTotals = calculatePopulationProductionCapabilites(entity, 0, technologyModifiers, structureDefinitions, entities, capabilityProductionTotals, structuresWithCapability);


        const {capabilityProductionTotals} = colonyFacet;

        //mining
        if(capabilityProductionTotals.mining && factionSystemBody.isSurveyed) {
          //can mine
          //-how much you can mine per year
          const miningProduction = capabilityProductionTotals.mining;

          forEach(gameConfig.minerals, (mineralName, mineralId) => {
            const systemBodyMinerals = systemBody.availableMinerals[mineralId];
            let dailyProduction = miningProduction * systemBodyMinerals.access * DAY_ANNUAL_FRACTION;

            if(dailyProduction > systemBodyMinerals.quantity) {
              dailyProduction = systemBodyMinerals.quantity
            }

            colonyFacet.minerals[mineralId] += dailyProduction;
          })
        }

        //Research
        if(capabilityProductionTotals.research) {
          //TODO
        }

        console.log('Colony: ', init, colony, populations);

        return ['colony'];
      }

      return false;
    }
  }

  return null
}


function addPopulationProductionToColony(population, colony) {
  if(!population.population.capabilityProductionTotals) {
    return
  }

  forEach(population.population.capabilityProductionTotals, (count, capability) => {
    colony.colony.capabilityProductionTotals[capability] = (colony.colony.capabilityProductionTotals[capability] ?? 0) + count;

    //if not yet created, add capability object
    !colony.colony.structuresWithCapability[capability] && (colony.colony.structuresWithCapability[capability] = {})

    forEach(population.population.structuresWithCapability[capability], (count, structureId) => {
      colony.colony.structuresWithCapability[capability][structureId] = (colony.colony.structuresWithCapability[capability][structureId] ?? 0) + count;
    })
  });
}