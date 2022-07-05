import { DAY_ANNUAL_FRACTION } from 'game/Consts';

import calculatePopulationGrowth from 'game/server/entityProcessorFactories/colony/calculatePopulationGrowth';


export default function populationFactory(lastTime, time, init) {
  const lastDay = Math.floor(lastTime / 86400);
  const today = Math.floor(time / 86400);

  if(lastDay !== today || init) {
    return function population(entity, entities) {
      if(entity.type === 'population') {

        calculatePopulationGrowth(init, entity, entities[entity.colonyId], entities);

        return ['population'];
      }

      return false;
    }
  }

  return null
}
