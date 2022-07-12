//Helpers
import forEach from 'helpers/object/forEach';
import every from 'helpers/object/every';
import map from 'helpers/object/map';
import reduce from 'helpers/object/reduce';

//Utils
//import getTechnologyModifiers from 'game/utils/getTechnologyModifiers';
import getEntitiesByIds from 'game/utils/getEntitiesByIds';


//Consts
import { DAY_ANNUAL_FRACTION } from 'game/Consts';



export default {
  type: 'colony',
  frequency: 'day',
  init: true,
  processor(colony, entities, factionEntities, gameConfig, init) {
    let totalPopulation = 0, totalEffectiveWorkers = 0, totalSupportWorkers = 0;

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

    //Construction
    if(capabilityProductionTotals.construction > 0 && colonyFacet.buildQueue.length > 0) {
      calculateConstruction(colonyFacet, gameConfig, capabilityProductionTotals.construction);
    }

    //Research
    if(capabilityProductionTotals.research) {
      //TODO
    }

    //console.log('Colony: ', init, colony, populations);

    return ['colony'];
  }
}


function calculateConstruction(colonyFacet, gameConfig, colonyConstructionProduction) {
  //Calculate construction
  let remainsToBuild = 0;

  //find and remove completed build queue items at the start of the queue, or items missing their prerequisites
  while(colonyFacet.buildQueue.length > 0) {
    const buildQueueItem = colonyFacet.buildQueue[0];
    remainsToBuild = buildQueueItem.total - colonyFacet.buildQueue[0].completed;

    if(remainsToBuild <= 0) {
      colonyFacet.buildQueue.shift();//this build queue item is finished
      continue
    }

    //check that required source buildings (if any) are available

    const constructionProject = gameConfig.constructionProjects[buildQueueItem.constructionProjectId]

    const hasAllRequiredStructures = every(constructionProject.requiredStructures || {}, (quantity, requiredStructureId) => {
      return ((colonyFacet.structures[buildQueueItem.takeFromPopulationId] || {})[requiredStructureId] || 0) >= quantity
    });

    if(!hasAllRequiredStructures) {
      debugger;
      colonyFacet.buildQueue.shift();//this build queue item is finished
      continue
    }

    //If we get here, this build queue item is fine
    break;
  }

  //All build queue items were invalid
  if(colonyFacet.buildQueue.length === 0) {
    return false;//nothing was changed
  }

  const buildQueueItem = colonyFacet.buildQueue[0];
  const buildInProgress = colonyFacet.buildInProgress;
  const constructionProject = gameConfig.constructionProjects[buildQueueItem.constructionProjectId];


  //increment construction progress
  if(!buildInProgress[buildQueueItem.constructionProjectId]) {
    buildInProgress[buildQueueItem.constructionProjectId] = 0;
  }

  //calc total remaining BP needed to finish queue
  //do not build more than this
  const remainingBPs = (remainsToBuild * constructionProject.bp) - buildInProgress[buildQueueItem.constructionProjectId];
  const targetBPs = Math.min(colonyConstructionProduction, remainingBPs);//do not build more than you need

  //calc required minerals, and check if you have enough
  const mineralFract = targetBPs / constructionProject.bp;
  const requiredMinerals = map(constructionProject.minerals, required => required * mineralFract);
  const availableMineralsModifier = reduce(requiredMinerals, (currentAvailableMineralsModifier, required, mineral) => {
    const available = (colonyFacet.minerals[mineral] || 0)
    const fract = available >= required ? 1 : available / required;

    return Math.min(currentAvailableMineralsModifier, fract);
  }, 1);

  //TODO Check we have enough required structures to build the items we have, and if not reduce produced structures
  //-we know we can build at least one already...

  let usedMinerals;
  let effectiveBPs;

  if(availableMineralsModifier === 1) {
    //minerals available
    usedMinerals = requiredMinerals;
    effectiveBPs = targetBPs;
  } else {
    //mineral shortage
    usedMinerals = map(requiredMinerals, quantity => quantity * availableMineralsModifier);
    effectiveBPs = targetBPs * availableMineralsModifier;
  }

  //reduce colony minerals
  forEach(usedMinerals, (quantity, mineral) => {
    const currentMinerals = colonyFacet.minerals[mineral];
    const newMinerals = currentMinerals - quantity;

    colonyFacet.minerals[mineral] = Math.max(0, newMinerals);
  })

  //now update construction
  if(effectiveBPs === remainingBPs) {//have finished this build queue
    //consume any required structures
    forEach(constructionProject.requiredStructures || {}, (quantity, requiredStructureId) => {
      colonyFacet.structures[buildQueueItem.takeFromPopulationId][requiredStructureId] -= remainsToBuild * quantity;
    });

    //increment built structures
    forEach(constructionProject.producedStructures || {}, (quantity, producedStructureId) => {
      colonyFacet.structures[buildQueueItem.assignToPopulationId][producedStructureId] += remainsToBuild * quantity;
    });

    //shipyards
    if(constructionProject.shipyard) {
      //TODO
      // const {isMilitary, capacity, slipways} = constructionProject.shipyard

      // //create shipyard entity(ies)
      // for(let i = 0; i < remainsToBuild; i++) {
      //   entityManager.createShipyard(buildQueueItem.assignToPopulationId, isMilitary, capacity, slipways);
      // }
    }

    //clear progress
    buildInProgress[buildQueueItem.constructionProjectId] = 0;

    //remove from build queue
    colonyFacet.buildQueue.shift();
  } else {//still in progress
    //-increment progress
    buildInProgress[buildQueueItem.constructionProjectId] += effectiveBPs;
    //-are any finished?
    const numBuilt = Math.floor(buildInProgress[buildQueueItem.constructionProjectId] / constructionProject.bp);

    if(numBuilt > 0) {
      //-some are finished, update colony + build queue to reflect progress
      //-consume required structures
      forEach(constructionProject.requiredStructures || {}, (quantity, requiredStructureId) => {
        colonyFacet.structures[buildQueueItem.takeFromPopulationId][requiredStructureId] -= numBuilt * quantity;
      });

      //-increment built structures
      forEach(constructionProject.producedStructures || {}, (quantity, producedStructureId) => {
        colonyFacet.structures[buildQueueItem.assignToPopulationId][producedStructureId] += numBuilt * quantity;
      });

      //shipyards
      if(constructionProject.shipyard) {
        //TODO
        // const {isMilitary, capacity, slipways} = constructionProject.shipyard

        // //create shipyard entity(ies)
        // for(let i = 0; i < numBuilt; i++) {
        //   entityManager.createShipyard(buildQueueItem.assignToPopulationId, isMilitary, capacity, slipways);
        // }
      }

      buildInProgress[buildQueueItem.constructionProjectId] %= constructionProject.bp;
      buildQueueItem.completed += numBuilt;
    }
  }
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