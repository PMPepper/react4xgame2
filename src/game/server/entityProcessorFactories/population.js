export default function populationFactory(lastTime, time) {
  const lastDay = Math.floor(lastTime / 86400);
  const today = Math.floor(time / 86400);

  if(lastDay !== today) {
    return function population(entity, entities) {
      if(entity.type === 'population') {
        const species = entities[entity.speciesId];
        const dayGrowthRate = Math.pow(species.species.growthRate, 1/365.25);

        //TODO affected by environment
        //TODO do not grow on colony ships, transports etc

        entity.population.quantity *= dayGrowthRate;

        return true;
      }

      return false;
    }
  }

  return null
}
