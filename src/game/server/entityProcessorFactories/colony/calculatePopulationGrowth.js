
import calculatePopulationWorkers from './calculatePopulationWorkers';
import {DAY_ANNUAL_FRACTION} from 'game/Consts';

export default function calculatePopulationGrowth(init, population, colony, entities) {
  const species = entities[population.speciesId];
  //const systemBody = entities[colony.systemBodyId];
  const dayGrowthRate = init ? 1 : Math.pow(species.species.growthRate, DAY_ANNUAL_FRACTION);

  //TODO affected by environment
  //TODO do not grow on colony ships, transports etc

  //update population
  population.population.quantity *= dayGrowthRate;

  //update workers
  calculatePopulationWorkers(population, entities);
}
